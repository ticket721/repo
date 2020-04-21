import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { AuthorizationsRepository } from '@lib/common/authorizations/Authorizations.repository';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { CurrenciesService, ERC20Currency, Price } from '@lib/common/currencies/Currencies.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { HOUR } from '@lib/common/utils/time';
import { encode, MintAuthorization, toB32 } from '@common/global';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { EventsService } from '@lib/common/events/Events.service';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import * as Crypto from 'crypto';
import { VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';

/**
 * Service to CRUD AuthorizationEntities
 */
export class AuthorizationsService extends CRUDExtension<AuthorizationsRepository, AuthorizationEntity> {
    /**
     * Dependency injection
     *
     * @param authorizationsRepository
     * @param authorizationEntity
     * @param categoriesService
     * @param datesService
     * @param eventsService
     * @param t721ControllerV0Service
     * @param currenciesService
     * @param web3Service
     * @param vaultereumService
     */
    constructor(
        @InjectRepository(AuthorizationsRepository)
        authorizationsRepository: AuthorizationsRepository,
        @InjectModel(AuthorizationEntity)
        authorizationEntity: BaseModel<AuthorizationEntity>,
        private readonly categoriesService: CategoriesService,
        private readonly datesService: DatesService,
        private readonly eventsService: EventsService,
        private readonly t721ControllerV0Service: T721ControllerV0Service,
        private readonly currenciesService: CurrenciesService,
        private readonly web3Service: Web3Service,
        private readonly vaultereumService: VaultereumService,
    ) {
        super(
            authorizationEntity,
            authorizationsRepository,
            /* istanbul ignore next */
            (e: AuthorizationEntity) => {
                return new authorizationEntity(e);
            },
            /* istanbul ignore next */
            (c: AuthorizationEntity) => {
                return new AuthorizationEntity(c);
            },
        );
    }

    private async resolveEventControllerAddress(eventId: string): Promise<ServiceResponse<[string, string]>> {
        const eventEntityRes = await this.eventsService.search({
            id: eventId,
        });

        if (eventEntityRes.error || eventEntityRes.response.length === 0) {
            return {
                error: 'cannot_resolve_event',
                response: null,
            };
        }

        const eventEntity: EventEntity = eventEntityRes.response[0];

        return {
            error: null,
            response: [eventEntity.address, eventEntity.controller],
        };
    }

    private async resolveDateControllerAddress(dateId: string): Promise<ServiceResponse<[string, string]>> {
        const dateEntityRes = await this.datesService.search({
            id: dateId,
        });

        if (dateEntityRes.error || dateEntityRes.response.length === 0) {
            return {
                error: 'cannot_resolve_date',
                response: null,
            };
        }

        const dateEntity: DateEntity = dateEntityRes.response[0];

        return this.resolveEventControllerAddress(dateEntity.parent_id);
    }

    async getControllerAddress(category: CategoryEntity): Promise<ServiceResponse<[string, string]>> {
        switch (category.parent_type) {
            case 'date': {
                return this.resolveDateControllerAddress(category.parent_id);
            }
            case 'event': {
                return this.resolveEventControllerAddress(category.parent_id);
            }
        }
    }

    private async getUniqueAuthorizationCode(owner: string): Promise<string> {
        const instance = await this.t721ControllerV0Service.get();

        let isCodeConsummable: boolean = false;
        let randomBytes: string;

        do {
            randomBytes = `0x${Crypto.randomBytes(31).toString('hex')}`;

            isCodeConsummable = await instance.methods.isCodeConsummable(owner, randomBytes).call();
        } while (!isCodeConsummable);

        return randomBytes;
    }

    async validateTicketAuthorizations(
        authorizations: TicketMintingFormat[],
        prices: Price[],
        expirationTime: number,
        grantee: string,
        signatureReadable: boolean,
    ): Promise<ServiceResponse<AuthorizedTicketMintingFormat[]>> {
        const ret: AuthorizedTicketMintingFormat[] = [];

        const resolvedPrices: {
            currency: string;
            value: string;
        }[] = [];

        for (const price of prices) {
            const currency = (await this.currenciesService.get(price.currency)) as ERC20Currency;

            resolvedPrices.push({
                currency: currency.address,
                value: encode(['uint256'], [price.value]),
            });
        }

        const encodedPrices = MintAuthorization.encodePrices(resolvedPrices);

        const signer = new MintAuthorization(
            (await this.t721ControllerV0Service.get())._address,
            await this.web3Service.net(),
        );

        for (const authorization of authorizations) {
            const evmExpiration = Math.floor((Date.now() + expirationTime) / 1000);
            const beExpiration = Math.floor((Date.now() + expirationTime + HOUR) / 1000);

            const categoryEntityRes = await this.categoriesService.search({
                id: authorization.categoryId,
            });

            if (categoryEntityRes.error) {
                return {
                    error: categoryEntityRes.error,
                    response: null,
                };
            }

            if (categoryEntityRes.response.length === 0) {
                return {
                    error: 'cannot_find_category',
                    response: null,
                };
            }

            const category: CategoryEntity = categoryEntityRes.response[0];

            const controllerInfos = await this.getControllerAddress(category);

            if (controllerInfos.error) {
                return {
                    error: controllerInfos.error,
                    response: null,
                };
            }

            const controllerAddress = controllerInfos.response[0];
            const controllerName = controllerInfos.response[1];

            const uniqueCode = await this.getUniqueAuthorizationCode(controllerAddress);

            const encodedAuthorization = signer.encodeAndHash(
                encodedPrices,
                category.group_id,
                toB32(category.category_name),
                uniqueCode,
                evmExpiration,
            );

            const payload = signer.generatePayload(
                {
                    emitter: controllerAddress,
                    grantee,
                    hash: encodedAuthorization,
                },
                'Authorization',
            );

            const vaultereumSigner = await this.vaultereumService.getSigner(controllerName);

            const signature = await signer.sign(vaultereumSigner, payload);

            const authorizationCreationRes = await this.create({
                grantee,
                granter: controllerAddress,
                mode: 'mint',
                signature: signature.hex,
                readable_signature: signatureReadable,
                cancelled: false,
                consumed: false,
                dispatched: false,
                codes: MintAuthorization.toCodesFormat(uniqueCode),
                args: MintAuthorization.toArgsFormat(
                    encodedPrices,
                    category.group_id,
                    toB32(category.category_name),
                    uniqueCode,
                    evmExpiration,
                ),
                selectors: MintAuthorization.toSelectorFormat(category.group_id, toB32(category.category_name)),
                user_expiration: new Date(evmExpiration * 1000),
                be_expiration: new Date(beExpiration * 1000),
            });

            if (authorizationCreationRes.error) {
                return {
                    error: authorizationCreationRes.error,
                    response: null,
                };
            }

            ret.push({
                categoryId: category.id,
                authorizationId: authorizationCreationRes.response.id,
                price: authorization.price,
                groupId: category.group_id,
                categoryName: category.category_name,
                granter: controllerAddress,
                grantee,
                granterController: controllerName,
                expiration: new Date(evmExpiration + 1000),
            });
        }

        return {
            error: null,
            response: ret,
        };
    }
}
