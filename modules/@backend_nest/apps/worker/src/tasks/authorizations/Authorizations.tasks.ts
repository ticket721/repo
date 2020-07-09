import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { Price } from '@lib/common/currencies/Currencies.service';
import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { detectAuthorizationStackDifferences } from '@lib/common/utils/detectTicketAuthorizationStackDifferences.helper';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { MintAuthorization, toB32 } from '@common/global';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { NestError } from '@lib/common/utils/NestError';

/**
 * Input for the authorization generation task
 */
export interface GenerateMintingAuthorizationsTaskInput {
    /**
     * ID of the cart action set
     */
    actionSetId: string;

    /**
     * List of authorizations to deliver
     */
    authorizations: TicketMintingFormat[];

    /**
     * List of previously existing cart authorizations
     */
    oldAuthorizations?: AuthorizedTicketMintingFormat[];

    /**
     * Total prices
     */
    prices: Price[];

    /**
     * Fees for given prices
     */
    fees: string[];

    /**
     * Commitment type
     */
    commitType: 'stripe';

    /**
     * Expiration time for the authorizations
     */
    expirationTime: number;

    /**
     * Flag to set the readability of the signature
     */
    signatureReadable: boolean;

    /**
     * User that gets the signature granting
     */
    grantee: UserDto;
}

/**
 * Helper class containing the Authorization Tasks
 */
@Injectable()
export class AuthorizationsTasks implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param actionSetsService
     * @param authorizationQueue
     * @param outrospectionService
     * @param shutdownService
     * @param categoriesService
     * @param authorizationsService
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        @InjectQueue('authorization') private readonly authorizationQueue: Queue,
        private readonly outrospectionService: OutrospectionService,
        private readonly shutdownService: ShutdownService,
        private readonly categoriesService: CategoriesService,
        private readonly authorizationsService: AuthorizationsService,
    ) {}

    /**
     * Internal utility to fetch categories
     *
     * @param authorizations
     * @param oldAuthorizations
     */
    private async gatherCategories(
        authorizations: TicketMintingFormat[],
        oldAuthorizations: AuthorizedTicketMintingFormat[],
    ): Promise<{ [key: string]: CategoryEntity }> {
        const ret: { [key: string]: CategoryEntity } = {};

        for (const authorization of authorizations) {
            if (ret[authorization.categoryId]) {
                continue;
            }

            const categoryReq = await this.categoriesService.search({
                id: authorization.categoryId,
            });

            if (categoryReq.error || categoryReq.response.length === 0) {
                throw new NestError(`Cannot find category ${authorization.categoryId}`);
            }

            ret[categoryReq.response[0].id] = categoryReq.response[0];
        }

        if (oldAuthorizations) {
            for (const authorization of oldAuthorizations) {
                if (ret[authorization.categoryId]) {
                    continue;
                }

                const categoryReq = await this.categoriesService.search({
                    id: authorization.categoryId,
                });

                if (categoryReq.error || categoryReq.response.length === 0) {
                    throw new NestError(`Cannot find category ${authorization.categoryId}`);
                }

                ret[categoryReq.response[0].id] = categoryReq.response[0];
            }
        }

        return ret;
    }

    /**
     * Internal utility to count free seats after old authorizations are removed
     *
     * @param oldAuthorizations
     */
    private async generateFreeSeatsCounts(
        oldAuthorizations: AuthorizedTicketMintingFormat[],
    ): Promise<{ [key: string]: number }> {
        const ret: { [key: string]: number } = {};

        for (const authorization of oldAuthorizations) {
            const authorizationEntityRes = await this.authorizationsService.search({
                id: authorization.authorizationId,
                mode: 'mint',
                granter: authorization.granter,
                grantee: authorization.grantee,
            });

            if (authorizationEntityRes.error || authorizationEntityRes.response.length === 0) {
                throw new NestError(`Cannot find authorization ${authorization.authorizationId}`);
            }

            const authorizationEntity = authorizationEntityRes.response[0];

            if (
                !authorizationEntity.cancelled &&
                !authorizationEntity.consumed &&
                !authorizationEntity.dispatched &&
                !authorizationEntity.readable_signature &&
                Date.now() < authorizationEntity.be_expiration.getTime()
            ) {
                const cancellationRes = await this.authorizationsService.update(
                    {
                        id: authorizationEntity.id,
                        granter: authorizationEntity.granter,
                        grantee: authorizationEntity.grantee,
                        mode: 'mint',
                    },
                    {
                        signature: null,
                        cancelled: true,
                    },
                );

                if (cancellationRes.error) {
                    throw new NestError(`Cannot cancel authorization ${authorization.authorizationId}`);
                }

                if (ret[authorization.categoryId] !== undefined) {
                    ret[authorization.categoryId] += 1;
                } else {
                    ret[authorization.categoryId] = 1;
                }
            }

            if (
                !authorizationEntity.cancelled &&
                !authorizationEntity.consumed &&
                !authorizationEntity.dispatched &&
                authorizationEntity.readable_signature &&
                Date.now() < authorizationEntity.be_expiration.getTime()
            ) {
                throw new NestError(
                    `Cannot cancel authorization ${authorizationEntity.id} with public signature: wait for natural expiration`,
                );
            }
        }

        return ret;
    }

    /**
     * Internal utility to check if enough seats are left for the cart
     *
     * @param authorizations
     * @param freeSeatsCounts
     * @param categories
     */
    private async seatsCountChecker(
        authorizations: TicketMintingFormat[],
        freeSeatsCounts: { [key: string]: number },
        categories: { [key: string]: CategoryEntity },
    ): Promise<boolean> {
        const reservedSeatsCounts: { [key: string]: number } = {};

        for (const authorization of authorizations) {
            const countRes = await this.authorizationsService.countElastic({
                body: {
                    query: {
                        bool: {
                            filter: {
                                range: {
                                    be_expiration: {
                                        gt: 'now',
                                    },
                                },
                            },
                            must: [
                                {
                                    term: {
                                        selectors: MintAuthorization.toSelectorFormat(
                                            categories[authorization.categoryId].group_id,
                                            toB32(categories[authorization.categoryId].category_name),
                                        ),
                                    },
                                },
                                {
                                    term: {
                                        cancelled: false,
                                    },
                                },
                                {
                                    term: {
                                        consumed: false,
                                    },
                                },
                                {
                                    term: {
                                        dispatched: false,
                                    },
                                },
                            ],
                        },
                    },
                },
            });

            if (countRes.error) {
                throw new NestError(`Error while fetching authorizations count`);
            }

            let remainingSeats =
                categories[authorization.categoryId].seats -
                (countRes.response.count + categories[authorization.categoryId].reserved);

            if (freeSeatsCounts[authorization.categoryId] !== undefined) {
                remainingSeats += freeSeatsCounts[authorization.categoryId];
            }

            if (reservedSeatsCounts[authorization.categoryId] !== undefined) {
                remainingSeats -= reservedSeatsCounts[authorization.categoryId];
            }

            if (remainingSeats < 1) {
                return false;
            }

            if (reservedSeatsCounts[authorization.categoryId] !== undefined) {
                reservedSeatsCounts[authorization.categoryId] += 1;
            } else {
                reservedSeatsCounts[authorization.categoryId] = 1;
            }
        }

        return true;
    }

    /**
     * Bull task in charge of the authorization generation
     *
     * @param job
     */
    async generateMintingAuthorizationsTask(job: Job<GenerateMintingAuthorizationsTaskInput>): Promise<void> {
        const authorizationData: GenerateMintingAuthorizationsTaskInput = job.data;

        const categories: { [key: string]: CategoryEntity } = await this.gatherCategories(
            authorizationData.authorizations,
            authorizationData.oldAuthorizations,
        );

        let freeSeatsCounts: { [key: string]: number } = {};

        if (authorizationData.oldAuthorizations) {
            if (
                !detectAuthorizationStackDifferences(
                    authorizationData.authorizations,
                    authorizationData.oldAuthorizations,
                )
            ) {
                return;
            }

            freeSeatsCounts = await this.generateFreeSeatsCounts(authorizationData.oldAuthorizations);
        }

        if (!(await this.seatsCountChecker(authorizationData.authorizations, freeSeatsCounts, categories))) {
            const errorUpdateStepRes = await this.actionSetsService.errorStep(
                authorizationData.actionSetId,
                'no_seats_left',
                {},
                2,
            );

            if (errorUpdateStepRes.error) {
                throw new NestError(`Error while detecting error on actionset ${authorizationData.actionSetId}`);
            }

            return;
        }

        const authorizationsCreationRes = await this.authorizationsService.validateTicketAuthorizations(
            authorizationData.authorizations,
            authorizationData.prices,
            authorizationData.fees,
            authorizationData.expirationTime,
            authorizationData.grantee.address,
            authorizationData.signatureReadable,
        );

        if (authorizationsCreationRes.error) {
            throw new NestError(`Error while creating authorizations`);
        }

        const actionSetUpdate = await this.actionSetsService.updateAction(authorizationData.actionSetId, 2, {
            commitType: 'stripe',
            total: authorizationData.prices,
            fees: authorizationData.fees,
            authorizations: authorizationsCreationRes.response,
        });

        if (actionSetUpdate.error) {
            throw new NestError(`Error while updating actionSet`);
        }

        await job.progress(100);
    }

    /**
     * Subscribes worker instances only
     */
    /* istanbul ignore next */
    async onModuleInit(): Promise<void> {
        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();

        if (signature.name === 'worker' && signature.master) {
            this.authorizationQueue
                .process('generateMintingAuthorizations', 1, this.generateMintingAuthorizationsTask.bind(this))
                .then(() => console.log(`Closing Bull Queue @@authorizations`))
                .catch(this.shutdownService.shutdownWithError);
        }
    }
}
