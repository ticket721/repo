import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { StripeInterfacesRepository } from '@lib/common/stripeinterface/StripeInterfaces.repository';
import {
    ConnectAccountCapability,
    ConnectAccountExternalAccount,
    StripeInterfaceEntity,
} from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { StripeService } from '@lib/common/stripe/Stripe.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { fromES } from '@lib/common/utils/fromES.helper';
import Stripe from 'stripe';
import { SECOND } from '@lib/common/utils/time';
import { TimeToolService } from '../toolbox/Time.tool.service';
import { NestError } from '@lib/common/utils/NestError';

/**
 * Service to CRUD StripeInterfaceEntities
 */
export class StripeInterfacesService extends CRUDExtension<StripeInterfacesRepository, StripeInterfaceEntity> {
    /**
     * Dependency injection
     *
     * @param stripeInterfacesRepository
     * @param stripeInterfaceEntity
     * @param stripeService
     * @param timeToolService
     */
    constructor(
        @InjectRepository(StripeInterfacesRepository)
        stripeInterfacesRepository: StripeInterfacesRepository,
        @InjectModel(StripeInterfaceEntity)
        stripeInterfaceEntity: BaseModel<StripeInterfaceEntity>,
        private readonly stripeService: StripeService,
        private readonly timeToolService: TimeToolService,
    ) {
        super(
            stripeInterfaceEntity,
            stripeInterfacesRepository,
            /* istanbul ignore next */
            (e: StripeInterfaceEntity) => {
                return new stripeInterfaceEntity(e);
            },
            /* istanbul ignore next */
            (r: StripeInterfaceEntity) => {
                return new StripeInterfaceEntity(r);
            },
        );
    }

    /**
     * Creates a stripe interface and links it to provided user
     *
     * @param user
     */
    async createStripeInterface(user: UserDto): Promise<ServiceResponse<StripeInterfaceEntity>> {
        const stripeInterfaceCollisionCheck = await this.recoverUserInterface(user);

        if (stripeInterfaceCollisionCheck.error) {
            return stripeInterfaceCollisionCheck;
        }

        if (stripeInterfaceCollisionCheck.response !== null) {
            return {
                error: 'user_already_has_connect_account',
                response: null,
            };
        }

        const newStripeInterface = await this.create({
            owner: user.id,
            payment_methods: [],
            connect_account: null,
            connect_account_capabilities: null,
            connect_account_current_deadline: null,
            connect_account_currently_due: null,
            connect_account_eventually_due: null,
            connect_account_past_due: null,
            connect_account_pending_verification: null,
            connect_account_errors: null,
            connect_account_external_accounts: null,
            connect_account_name: null,
            connect_account_type: null,
            connect_account_disabled_reason: null,
            connect_account_updated_at: null,
        });

        if (newStripeInterface.error) {
            return {
                error: newStripeInterface.error,
                response: null,
            };
        }

        return {
            error: null,
            response: newStripeInterface.response,
        };
    }

    /**
     * Recovers a Stripe Interface from a user
     *
     * @param user
     */
    async recoverUserInterface(user: UserDto): Promise<ServiceResponse<StripeInterfaceEntity>> {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                owner: user.id,
                            },
                        },
                    },
                },
            },
        };

        const esQueryResult = await this.searchElastic(esQuery);

        if (esQueryResult.error) {
            return {
                error: esQueryResult.error,
                response: null,
            };
        }

        if (esQueryResult.response.hits.total === 0) {
            return {
                error: null,
                response: null,
            };
        }

        return this.updateAccountInfos(fromES<StripeInterfaceEntity>(esQueryResult.response.hits.hits[0]));
    }

    /**
     * Recover the current balance from Stripe API
     *
     * @param stripeInterface
     */
    async recoverBalance(stripeInterface: StripeInterfaceEntity): Promise<ServiceResponse<Stripe.Balance>> {
        const stripe = this.stripeService.get();

        try {
            const balance = await stripe.balance.retrieve(
                {},
                {
                    stripeAccount: stripeInterface.connect_account,
                },
            );
            return {
                error: null,
                response: balance,
            };
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Create a Stripe Connect Account for a user
     *
     * @param user
     * @param accountToken
     * @param currency
     */
    async createAccount(
        user: UserDto,
        accountToken: string,
        currency: string,
    ): Promise<ServiceResponse<Stripe.Account>> {
        const stripe = this.stripeService.get();

        let tokenInfo: Stripe.Token;

        try {
            tokenInfo = await stripe.tokens.retrieve(accountToken);
        } catch (e) {
            return {
                error: 'cannot_find_token',
                response: null,
            };
        }

        if (tokenInfo.used === true) {
            return {
                error: 'token_already_used',
                response: null,
            };
        }

        try {
            const connectAccount = await stripe.accounts.create({
                type: 'custom',
                email: user.email,
                requested_capabilities: ['card_payments', 'transfers'],
                account_token: accountToken,
                default_currency: currency,
                settings: {
                    payouts: {
                        schedule: {
                            interval: 'manual',
                        },
                    },
                },
            });

            return {
                error: null,
                response: connectAccount,
            };
        } catch (e) {
            console.log(e);
            return {
                error: 'cannot_create_account',
                response: null,
            };
        }
    }

    /**
     * Returns true if Stripe Connect Account infos can be updated
     *
     * @param stripeInterface
     */
    shouldUpdateAccountInfos(stripeInterface: StripeInterfaceEntity): boolean {
        if (!stripeInterface.connect_account_updated_at) {
            return true;
        }

        const lastUpdate = new Date(stripeInterface.connect_account_updated_at);

        return this.timeToolService.now().getTime() - lastUpdate.getTime() >= 5 * SECOND;
    }

    /**
     * Convert Capabilities from Stripe format to database format
     *
     * @param capabilities
     */
    static convertCapabilities(capabilities: Stripe.Account.Capabilities): ConnectAccountCapability[] {
        return Object.keys(capabilities).map((capabilityName: string) => ({
            name: capabilityName,
            status: capabilities[capabilityName],
        }));
    }

    /**
     * Extracts the appropriate name from the Connect Account depending on account type
     *
     * @param acc
     */
    static recoverConnectAccountName(acc: Stripe.Account): string {
        let entityDependentName: string = 'Stripe Connect';

        if (!acc.business_type) {
            return entityDependentName;
        }

        switch (acc.business_type) {
            case 'individual': {
                if (acc.individual && acc.individual.first_name && acc.individual.last_name) {
                    entityDependentName = `${acc.individual.first_name} ${acc.individual.last_name}`;
                }
                break;
            }
            case 'government_entity':
            case 'non_profit':
            case 'company': {
                if (acc.company && acc.company.name) {
                    entityDependentName = acc.company.name;
                }
            }
        }

        return entityDependentName;
    }

    /**
     * Update account infos from Stripe APIs
     *
     * @param stripeInterface
     * @param force
     */
    async updateAccountInfos(
        stripeInterface: StripeInterfaceEntity,
        force: boolean = false,
    ): Promise<ServiceResponse<StripeInterfaceEntity>> {
        if (stripeInterface.connect_account) {
            if (force || this.shouldUpdateAccountInfos(stripeInterface)) {
                const stripe = this.stripeService.get();

                let account: Stripe.Account;

                try {
                    account = await stripe.accounts.retrieve(stripeInterface.connect_account);
                } catch (e) {
                    console.error(e);
                    return {
                        error: 'cannot_recover_account',
                        response: null,
                    };
                }

                const newValues: Partial<StripeInterfaceEntity> = {
                    connect_account: account.id,
                    connect_account_capabilities: StripeInterfacesService.convertCapabilities(account.capabilities),
                    connect_account_current_deadline: account.requirements.current_deadline
                        ? new Date(account.requirements.current_deadline)
                        : null,
                    connect_account_currently_due: account.requirements.currently_due,
                    connect_account_eventually_due: account.requirements.eventually_due,
                    connect_account_past_due: account.requirements.past_due,
                    connect_account_pending_verification: account.requirements.pending_verification,
                    connect_account_errors: (account.requirements as any).errors,
                    connect_account_external_accounts: account.external_accounts.data.map(
                        (value): ConnectAccountExternalAccount => ({
                            id: value.id,
                            country: value.country,
                            last4: value.last4,
                            name: value.object === 'card' ? value.brand : value.bank_name,
                            currency: value.currency,
                            status: value.object === 'card' ? 'validated' : (value.status as any),
                            fingerprint: value.fingerprint,
                            default_for_currency: !!value.default_for_currency,
                        }),
                    ),
                    connect_account_name: StripeInterfacesService.recoverConnectAccountName(account),
                    connect_account_type: account.business_type,
                    connect_account_disabled_reason: account.requirements.disabled_reason,
                    connect_account_updated_at: this.timeToolService.now(),
                };

                const accountUpdate = await this.update(
                    {
                        id: stripeInterface.id,
                    },
                    newValues,
                );

                if (accountUpdate.error) {
                    return {
                        error: accountUpdate.error,
                        response: null,
                    };
                }

                return {
                    error: null,
                    response: {
                        ...stripeInterface,
                        ...newValues,
                    },
                };
            }

            return {
                error: null,
                response: stripeInterface,
            };
        }

        return {
            error: null,
            response: stripeInterface,
        };
    }

    /**
     * Link Stripe Connect Account to user
     *
     * @param user
     * @param account
     */
    async bindAccountToUserInterface(
        user: UserDto,
        account: Stripe.Account,
    ): Promise<ServiceResponse<StripeInterfaceEntity>> {
        const stripeInterfaceRes = await this.recoverUserInterface(user);

        if (stripeInterfaceRes.error) {
            return stripeInterfaceRes;
        }

        const updateRes = await this.update(
            {
                id: stripeInterfaceRes.response.id,
            },
            {
                connect_account: account.id,
            },
        );

        if (updateRes.error) {
            return {
                error: updateRes.error,
                response: null,
            };
        }

        return this.updateAccountInfos(
            {
                ...stripeInterfaceRes.response,
                connect_account: account.id,
            },
            true,
        );
    }

    /**
     * Checks if another External Account with given fingerprint is already present
     *
     * @param stripeInterface
     * @param fingerprint
     */
    static containsExternalAccountFingerprint(stripeInterface: StripeInterfaceEntity, fingerprint: string): boolean {
        if (
            stripeInterface.connect_account_external_accounts &&
            stripeInterface.connect_account_external_accounts.length
        ) {
            return (
                stripeInterface.connect_account_external_accounts.find(
                    (extacc: ConnectAccountExternalAccount): boolean => extacc.fingerprint === fingerprint,
                ) !== undefined
            );
        }
        return false;
    }

    /**
     * Changes the default External Account for a given currency
     *
     * @param user
     * @param externalAccountId
     */
    async setDefaultExternalAccountOnUserInterface(
        user: UserDto,
        externalAccountId: string,
    ): Promise<ServiceResponse<StripeInterfaceEntity>> {
        const stripe = this.stripeService.get();

        const stripeInterfaceRes = await this.recoverUserInterface(user);

        if (stripeInterfaceRes.error) {
            return stripeInterfaceRes;
        }

        const stripeInterface: StripeInterfaceEntity = stripeInterfaceRes.response;

        try {
            await stripe.accounts.updateExternalAccount(stripeInterface.connect_account, externalAccountId, {
                default_for_currency: true,
            });
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }

        return this.updateAccountInfos(stripeInterface, true);
    }

    /**
     * Removes an External Account from a Stripe Connect Account
     *
     * @param user
     * @param externalAccountId
     */
    async removeExternalAccountFromUserInterface(
        user: UserDto,
        externalAccountId: string,
    ): Promise<ServiceResponse<StripeInterfaceEntity>> {
        const stripe = this.stripeService.get();

        const stripeInterfaceRes = await this.recoverUserInterface(user);

        if (stripeInterfaceRes.error) {
            return stripeInterfaceRes;
        }

        const stripeInterface: StripeInterfaceEntity = stripeInterfaceRes.response;

        try {
            await stripe.accounts.deleteExternalAccount(stripeInterface.connect_account, externalAccountId);
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }

        return this.updateAccountInfos(stripeInterfaceRes.response, true);
    }

    /**
     * Add an External Account to a user interface
     *
     * @param user
     * @param bankAccountToken
     */
    async addExternalAccountToUserInterface(
        user: UserDto,
        bankAccountToken: string,
    ): Promise<ServiceResponse<StripeInterfaceEntity>> {
        const stripe = this.stripeService.get();

        let bankAccount: Stripe.Token;

        try {
            bankAccount = await stripe.tokens.retrieve(bankAccountToken);
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }

        if (bankAccount.used === true) {
            return {
                error: 'bank_account_token_already_used',
                response: null,
            };
        }

        const stripeInterfaceRes = await this.recoverUserInterface(user);

        if (stripeInterfaceRes.error) {
            return stripeInterfaceRes;
        }

        const stripeInterface: StripeInterfaceEntity = stripeInterfaceRes.response;

        if (!stripeInterface.connect_account) {
            return {
                error: 'account_not_created',
                response: null,
            };
        }

        if (
            StripeInterfacesService.containsExternalAccountFingerprint(
                stripeInterface,
                bankAccount.bank_account.fingerprint,
            )
        ) {
            return {
                error: 'bank_account_already_added',
                response: null,
            };
        }

        try {
            await stripe.accounts.createExternalAccount(stripeInterface.connect_account, {
                external_account: bankAccountToken,
            });
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }

        return this.updateAccountInfos(stripeInterface, true);
    }

    /**
     * Generates an url to follow to complete KYC
     *
     * @param stripeInterface
     * @param refreshUrl
     * @param returnUrl
     */
    async generateOnboardingUrl(
        stripeInterface: StripeInterfaceEntity,
        refreshUrl: string,
        returnUrl: string,
    ): Promise<ServiceResponse<Stripe.AccountLink>> {
        if (!stripeInterface.connect_account) {
            return {
                error: 'connect_account_not_created',
                response: null,
            };
        }

        const stripe = this.stripeService.get();

        try {
            const accountLink = await stripe.accountLinks.create({
                account: stripeInterface.connect_account,
                failure_url: refreshUrl,
                success_url: returnUrl,
                type: 'custom_account_verification',
            });
            return {
                error: null,
                response: accountLink,
            };
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Generates an url to follow to update KYC info
     *
     * @param stripeInterface
     * @param refreshUrl
     * @param returnUrl
     */
    async generateUpdateUrl(
        stripeInterface: StripeInterfaceEntity,
        refreshUrl: string,
        returnUrl: string,
    ): Promise<ServiceResponse<Stripe.AccountLink>> {
        if (!stripeInterface.connect_account) {
            return {
                error: 'connect_account_not_created',
                response: null,
            };
        }

        const stripe = this.stripeService.get();

        try {
            const accountLink = await stripe.accountLinks.create({
                account: stripeInterface.connect_account,
                failure_url: refreshUrl,
                success_url: returnUrl,
                type: 'custom_account_update',
            });
            return {
                error: null,
                response: accountLink,
            };
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Generates a payout to an external account
     *
     * @param stripeInterface
     * @param amount
     * @param destination
     * @param currency
     */
    async payout(
        stripeInterface: StripeInterfaceEntity,
        amount: number,
        destination: string,
        currency: string,
    ): Promise<ServiceResponse<Stripe.Payout>> {
        if (!stripeInterface.connect_account) {
            return {
                error: 'connect_account_not_created',
                response: null,
            };
        }

        const stripe = this.stripeService.get();

        try {
            const payout = await stripe.payouts.create(
                {
                    amount,
                    destination,
                    currency,
                },
                {
                    stripeAccount: stripeInterface.connect_account,
                },
            );
            return {
                error: null,
                response: payout,
            };
        } catch (e) {
            return {
                error: new NestError(e).message,
                response: null,
            };
        }
    }

    /**
     * Method to retrieve transaction list
     *
     * @param stripeInterface
     * @param limit
     * @param startingAfter
     */
    async transactions(
        stripeInterface: StripeInterfaceEntity,
        limit: number,
        startingAfter: string,
    ): Promise<ServiceResponse<Stripe.ApiList<Stripe.BalanceTransaction>>> {
        if (!stripeInterface.connect_account) {
            return {
                error: 'connect_account_not_created',
                response: null,
            };
        }

        const stripe = this.stripeService.get();

        try {
            const params: Stripe.BalanceTransactionListParams = {
                limit,
            };

            if (startingAfter !== null) {
                params.starting_after = startingAfter;
            }

            const balanceTransactions = await stripe.balanceTransactions.list(params, {
                stripeAccount: stripeInterface.connect_account,
            });
            return {
                error: null,
                response: balanceTransactions,
            };
        } catch (e) {
            return {
                error: new NestError(e).message,
                response: null,
            };
        }
    }
}
