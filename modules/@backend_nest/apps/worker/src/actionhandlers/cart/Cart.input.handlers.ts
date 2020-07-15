import { ActionSetsService, Progress } from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Joi from '@hapi/joi';
import { ChecksRunnerUtil } from '@lib/common/actionsets/helper/ChecksRunner.util';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CurrenciesService, InputPrice, Price } from '@lib/common/currencies/Currencies.service';
import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { detectAuthorizationStackDifferences } from '@lib/common/utils/detectTicketAuthorizationStackDifferences.helper';
import { ConfigService } from '@lib/common/config/Config.service';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { CategoryEntity, CategorySelectionError } from '@lib/common/categories/entities/Category.entity';

/**
 * Data Model of the Ticket Selection step
 */
export interface CartTicketSelections {
    /**
     * Array of tickets with price and category
     */
    tickets: TicketMintingFormat[];

    /**
     * Final total price that will get computed during the first step
     */
    total?: Price[];

    /**
     * Fees for given prices
     */
    fees?: string[];
}

/**
 * Data Model of the Modules Configuration step
 */
// tslint:disable-next-line:no-empty-interface
export interface CartModulesConfiguration {}

/**
 * Data Model of the Authorizations step
 */
export interface CartAuthorizations {
    /**
     * Final authorizations format
     */
    authorizations: AuthorizedTicketMintingFormat[];

    /**
     * Type of cart commitment
     */
    commitType: 'stripe';

    /**
     * Total price to pay
     */
    total: Price[];

    /**
     * Fee for each currency paid
     */
    fees: string[];

    /**
     * Id of the payment intent already setup for the payment
     */
    paymentIntentId: string;

    /**
     * Secret id for the payment process
     */
    clientSecret: string;

    /**
     * Checkout actionset to use
     */
    checkoutActionSetId: string;
}

/**
 * Class containing all input handlers of the Cart action set
 */
@Injectable()
export class CartInputHandlers implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param actionSetsService
     * @param categoriesService
     * @param currenciesService
     * @param configService
     * @param timeToolService
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly categoriesService: CategoriesService,
        private readonly currenciesService: CurrenciesService,
        private readonly configService: ConfigService,
        private readonly timeToolService: TimeToolService,
    ) {}

    /**
     * Data Model validator for the Ticket Selection step
     */
    ticketSelectionsValidator = Joi.object<CartTicketSelections>({
        tickets: Joi.array()
            .items(
                Joi.object({
                    categoryId: Joi.string().required(),
                    price: Joi.object({
                        currency: Joi.string().required(),
                        price: Joi.string().required(),
                    }).optional(),
                }),
            )
            .min(0),
    });

    /**
     * Mandatory fields for the Ticket Selection step
     */
    ticketSelectionsFields = ['tickets'];

    /**
     * Internal helper to check input prices validity. Basically we check if the prices the user asks for match
     * the prices set by the organizer.
     *
     * @param inputPrice
     * @param categoryPrices
     */
    private async priceChecks(inputPrice: InputPrice, categoryPrices: Price[]): Promise<[Price[], string, Price[]]> {
        const resolvedPrice = await this.currenciesService.resolveInputPrices([inputPrice]);

        if (resolvedPrice.error) {
            return [[], 'currency_resolution_error', []];
        }

        const validCurrencies = resolvedPrice.response.filter((price: Price): boolean => {
            return (
                categoryPrices.findIndex(
                    (catprice: Price): boolean =>
                        catprice.currency === price.currency && catprice.value === price.value,
                ) === -1
            );
        });

        return [validCurrencies, null, resolvedPrice.response];
    }

    /**
     * Input Handler of the Ticket Selection Step
     *
     * @param textMetadataFields
     * @param actionset
     * @param progress
     */
    async ticketSelectionsHandler(
        textMetadataFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data: CartTicketSelections = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<CartTicketSelections>(
            data,
            this.ticketSelectionsValidator,
            textMetadataFields,
        );

        switch (error) {
            case 'error': {
                actionset.action.setError({
                    details: error_trace,
                    error: 'validation_error',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
                break;
            }

            case 'incomplete': {
                actionset.action.setIncomplete({
                    details: error_trace,
                    error: 'incomplete_error',
                });
                actionset.action.setStatus('incomplete');
                actionset.setStatus('input:incomplete');
                break;
            }

            case undefined: {
                let valid = true;
                const prices = [];
                const fees = [];

                const maxSize = parseInt(this.configService.get('CART_MAX_TICKET_PER_CART'), 10);

                const groupIds: { [key: string]: TicketMintingFormat[] } = {};
                const categoriesCount: { [key: string]: number } = {};

                let saleErrors: CategorySelectionError[] = [];

                if (data.tickets.length === 0) {
                    actionset.action.setError({
                        details: null,
                        error: 'no_tickets_in_cart',
                    });
                    actionset.action.setStatus('error');
                    actionset.setStatus('input:error');
                    valid = false;
                }

                for (const ticket of data.tickets) {
                    const categorySearchRes = await this.categoriesService.search({
                        id: ticket.categoryId,
                    });

                    if (categorySearchRes.error || categorySearchRes.response.length === 0) {
                        actionset.action.setError({
                            details: null,
                            error: categorySearchRes.error || 'category_not_found',
                        });
                        actionset.action.setStatus('error');
                        actionset.setStatus('input:error');

                        valid = false;
                        break;
                    }

                    if (categoriesCount[categorySearchRes.response[0].id] === undefined) {
                        categoriesCount[categorySearchRes.response[0].id] = 0;
                    }

                    categoriesCount[categorySearchRes.response[0].id] += 1;

                    saleErrors = [
                        ...saleErrors,
                        ...CategoryEntity.checkCategoryErrors(
                            this.timeToolService.now(),
                            categorySearchRes.response[0],
                            categoriesCount[categorySearchRes.response[0].id],
                        ),
                    ];

                    groupIds[categorySearchRes.response[0].group_id] = [
                        ...(groupIds[categorySearchRes.response[0].group_id] || []),
                        ticket,
                    ];

                    const resolvedCurrencies = await this.priceChecks(
                        ticket.price,
                        categorySearchRes.response[0].prices,
                    );

                    if (resolvedCurrencies[0].length > 0 || resolvedCurrencies[1] !== null) {
                        actionset.action.setError({
                            details: resolvedCurrencies[0],
                            error: resolvedCurrencies[1] || 'price_not_matching',
                        });
                        actionset.action.setStatus('error');
                        actionset.setStatus('input:error');

                        valid = false;
                        break;
                    }

                    for (const resolvedCurrency of resolvedCurrencies[2]) {
                        prices.push(resolvedCurrency);
                        fees.push(
                            await this.currenciesService.computeFee(resolvedCurrency.currency, resolvedCurrency.value),
                        );
                    }
                }

                if (saleErrors.length) {
                    actionset.action.setError({
                        details: saleErrors,
                        error: 'cannot_purchase_tickets',
                    });
                    actionset.action.setStatus('error');
                    actionset.setStatus('input:error');

                    break;
                }

                if (Object.keys(groupIds).length > 1) {
                    actionset.action.setError({
                        details: groupIds,
                        error: 'cannot_purchase_multiple_group_id',
                    });
                    actionset.action.setStatus('error');
                    actionset.setStatus('input:error');

                    break;
                }

                if (data.tickets.length > maxSize) {
                    actionset.action.setError({
                        details: null,
                        error: 'cart_too_big',
                    });
                    actionset.action.setStatus('error');
                    actionset.setStatus('input:error');

                    break;
                }

                if (valid) {
                    actionset.action.setData({
                        ...actionset.action.data,
                        total: prices,
                        fees,
                    });
                    actionset.next();
                }

                break;
            }
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * Data Model validator for the Modules Configuration step
     */
    modulesConfigurationValidator = Joi.object<CartTicketSelections>({});

    /**
     * Mandatory fields for the modules configuration step
     */
    modulesConfigurationFields = [];

    /**
     * Input Handler of the Modules Configuration Step
     *
     * @param modulesConfigurationFields
     * @param actionset
     * @param progress
     */
    async modulesConfigurationHandler(
        modulesConfigurationFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data: CartModulesConfiguration = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<CartModulesConfiguration>(
            data,
            this.modulesConfigurationValidator,
            modulesConfigurationFields,
        );

        switch (error) {
            case 'error': {
                actionset.action.setError({
                    details: error_trace,
                    error: 'validation_error',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
                break;
            }

            // Ignore until implemented
            /* istanbul ignore next */
            case 'incomplete': {
                actionset.action.setIncomplete({
                    details: error_trace,
                    error: 'incomplete_error',
                });
                actionset.action.setStatus('incomplete');
                actionset.setStatus('input:incomplete');
                break;
            }

            case undefined: {
                actionset.next();
                break;
            }
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * Data Model validator of the authorizations step
     */
    authorizationsValidator = Joi.object<CartAuthorizations>({
        authorizations: Joi.array().items(
            Joi.object({
                categoryId: Joi.string().required(),
                price: Joi.object({
                    currency: Joi.string().required(),
                    price: Joi.string().required(),
                }).optional(),
                authorizationId: Joi.string().required(),
                groupId: Joi.string().required(),
                categoryName: Joi.string().required(),
                granter: Joi.string().required(),
                grantee: Joi.string().required(),
                granterController: Joi.string().required(),
                expiration: Joi.date().required(),
            }),
        ),
        commitType: Joi.string(),
        total: Joi.array().items(
            Joi.object({
                currency: Joi.string().required(),
                value: Joi.string().required(),
                log_value: Joi.number().required(),
            }),
        ),
        fees: Joi.array().items(Joi.string()),
        paymentIntentId: Joi.string(),
        clientSecret: Joi.string(),
        checkoutActionSetId: Joi.string(),
    });

    /**
     * Mandatory fields of the authorization steps
     */
    authorizationsFields = [
        'authorizations',
        'commitType',
        'total',
        'fees',
        'paymentIntentId',
        'clientSecret',
        'checkoutActionSetId',
    ];

    /**
     * Input Handler of the Authorizations Step
     *
     * @param authorizationsFields
     * @param actionset
     * @param progress
     */
    async authorizationsHandler(
        authorizationsFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data: CartAuthorizations = actionset.action.data;
        const selectionData: CartTicketSelections = actionset.actions[0].data;

        const { error, error_trace } = ChecksRunnerUtil<CartAuthorizations>(
            data,
            this.authorizationsValidator,
            authorizationsFields,
        );

        switch (error) {
            case 'error': {
                actionset.action.setError({
                    details: error_trace,
                    error: 'validation_error',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
                break;
            }

            case 'incomplete': {
                actionset.action.setIncomplete({
                    details: error_trace,
                    error: 'incomplete_error',
                });
                actionset.action.setStatus('incomplete');
                actionset.setStatus('input:incomplete');
                break;
            }

            case undefined: {
                if (detectAuthorizationStackDifferences(selectionData.tickets, data.authorizations)) {
                    actionset.action.setError({
                        details: error_trace,
                        error: 'authorizations_not_matching',
                    });
                    actionset.action.setStatus('error');
                    actionset.setStatus('input:error');
                    break;
                }

                actionset.next();
                break;
            }
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * Lifecycle callback to register all input handlers
     */
    /* istanbul ignore next */
    onModuleInit(): void {
        this.actionSetsService.setInputHandler(
            '@cart/ticketSelections',
            this.ticketSelectionsHandler.bind(this, this.ticketSelectionsFields),
        );
        this.actionSetsService.setInputHandler(
            '@cart/modulesConfiguration',
            this.modulesConfigurationHandler.bind(this, this.modulesConfigurationFields),
        );
        this.actionSetsService.setInputHandler(
            '@cart/authorizations',
            this.authorizationsHandler.bind(this, this.authorizationsFields),
        );
    }
}
