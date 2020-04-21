import { ActionSetsService, Progress } from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Joi from '@hapi/joi';
import { ChecksRunnerUtil } from '@lib/common/actionsets/helper/ChecksRunner.util';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CurrenciesService, InputPrice, Price } from '@lib/common/currencies/Currencies.service';
import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { BigNumber } from 'bignumber.js';
import { detectAuthorizationStackDifferences } from '@lib/common/utils/detectTicketAuthorizationStackDifferences.helper';
import { ConfigService } from '@lib/common/config/Config.service';

export interface CartTicketSelections {
    tickets: TicketMintingFormat[];
    total?: Price[];
}

// tslint:disable-next-line:no-empty-interface
export interface CartModulesConfiguration {}

export interface CartAuthorizations {
    authorizations: AuthorizedTicketMintingFormat[];
    commitType: 'stripe';
    total: Price[];
}

@Injectable()
export class CartInputHandlers implements OnModuleInit {
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly categoriesService: CategoriesService,
        private readonly currenciesService: CurrenciesService,
        private readonly configService: ConfigService,
    ) {}

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
            .required(),
    });

    ticketSelectionsFields = ['tickets'];

    private async priceChecks(inputPrice: InputPrice, categoryPrices: Price[]): Promise<[Price[], string, Price[]]> {
        const resolvedPrice = await this.currenciesService.resolveInputPrices([inputPrice]);

        if (resolvedPrice.error) {
            return [[], 'currency_resolution_error', null];
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
                const totalPrices: { [key: string]: Price } = {};

                const maxSize = parseInt(this.configService.get('CART_MAX_TICKET_PER_CART'), 10);

                if (data.tickets.length > maxSize) {
                    actionset.action.setError({
                        details: null,
                        error: 'cart_too_big',
                    });
                    actionset.action.setStatus('error');
                    actionset.setStatus('input:error');

                    valid = false;
                    break;
                }

                for (const ticket of data.tickets) {
                    const categorySearchRes = await this.categoriesService.search({
                        id: ticket.categoryId,
                    });

                    if (categorySearchRes.error) {
                        actionset.action.setError({
                            details: null,
                            error: categorySearchRes.error,
                        });
                        actionset.action.setStatus('error');
                        actionset.setStatus('input:error');

                        valid = false;
                        break;
                    }

                    const resolvedCurrencies = await this.priceChecks(
                        ticket.price,
                        categorySearchRes.response[0].prices,
                    );

                    if (resolvedCurrencies[0].length > 0) {
                        actionset.action.setError({
                            details: resolvedCurrencies[0],
                            error: 'price_not_matching',
                        });
                        actionset.action.setStatus('error');
                        actionset.setStatus('input:error');

                        valid = false;
                        break;
                    }

                    for (const resolvedCurrency of resolvedCurrencies[2]) {
                        if (totalPrices[resolvedCurrency.currency]) {
                            totalPrices[resolvedCurrency.currency].value = new BigNumber(
                                totalPrices[resolvedCurrency.currency].value,
                            )
                                .plus(new BigNumber(resolvedCurrency.value))
                                .toString();
                        } else {
                            totalPrices[resolvedCurrency.currency] = resolvedCurrency;
                        }
                    }

                    const returnPrices: Price[] = [];

                    for (const curr of Object.keys(totalPrices)) {
                        returnPrices.push(totalPrices[curr]);
                    }

                    actionset.action.setData({
                        ...actionset.action.data,
                        total: returnPrices,
                    });
                }

                if (valid) {
                    actionset.next();
                }
                break;
            }
        }

        await progress(100);
        return [actionset, true];
    }

    modulesConfigurationValidator = Joi.object<CartTicketSelections>({});

    modulesConfigurationFields = [];

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

    authorizationsValidator = Joi.object<CartAuthorizations>({
        authorizations: Joi.array()
            .items(
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
            )
            .required(),
        commitType: Joi.string().required(),
        total: Joi.array().items(
            Joi.object({
                currency: Joi.string().required(),
                value: Joi.string().required(),
                log_value: Joi.number().required(),
            }),
        ),
    });

    authorizationsFields = ['authorizations', 'commitType', 'total'];

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
