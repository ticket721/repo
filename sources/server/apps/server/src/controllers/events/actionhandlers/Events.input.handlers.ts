import {
    ActionSetsService,
    InputActionHandler,
    Progress,
} from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Joi from '@hapi/joi';
import { closestCity } from '@ticket721sources/global';

@Injectable()
export class EventsInputHandlers implements OnModuleInit {
    constructor(private readonly actionSetsService: ActionSetsService) {}

    // 1. textMetadata
    textMetadataValidator = Joi.object({
        name: Joi.string()
            .max(50)
            .min(3)
            .required(),
        description: Joi.string()
            .max(1000)
            .required(),
        tags: Joi.array()
            .items(
                Joi.string()
                    .max(16)
                    .min(3),
            )
            .required(),
    });

    async textMetadataHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;
        console.log(data);

        const { error, value } = this.textMetadataValidator.validate(data);

        console.log(error, value);

        if (error) {
            actionset.action.setError({
                details: error,
                error: 'validation_error',
            });
            actionset.action.setStatus('error');
            actionset.setStatus('input:error');
        } else {
            actionset.next();
        }

        return [actionset, true];
    }

    // 2. modulesConfiguration
    modulesConfigurationValidator = Joi.object({});

    async modulesConfigurationHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, value } = this.modulesConfigurationValidator.validate(
            data,
        );

        console.log(error, value);

        if (error) {
            actionset.action.setError({
                details: error,
                error: 'validation_error',
            });
            actionset.action.setStatus('error');
            actionset.setStatus('input:error');
        } else {
            actionset.next();
        }

        return [actionset, true];
    }

    // 3. datesConfiguration

    datesConfigurationValidator = Joi.object({
        dates: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                eventBegin: Joi.date().required(),
                eventEnd: Joi.date().required(),
                location: Joi.object({
                    lat: Joi.number().required(),
                    lon: Joi.number().required(),
                    label: Joi.string().required(),
                }).required(),
            }),
        ),
    });

    checkDate(date: any): string {
        console.log(typeof date.eventBegin);
        console.log(typeof date.eventEnd);

        if (date.eventEnd < date.eventBegin) {
            return 'event_end_before_event_begin';
        }

        return null;
    }

    async datesConfigurationHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, value } = this.datesConfigurationValidator.validate(
            data,
        );

        if (error) {
            actionset.action.setError({
                details: error,
                error: 'validation_error',
            });
            actionset.action.setStatus('error');
            actionset.setStatus('input:error');
        } else {
            if (data.dates.length === 0) {
                actionset.action.setError({
                    details: null,
                    error: 'empty_dates_array',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
            } else {
                for (const date of data.dates) {
                    date.eventBegin = new Date(date.eventBegin);
                    date.eventEnd = new Date(date.eventEnd);

                    if (this.checkDate(date) !== null) {
                        actionset.action.setError({
                            details: null,
                            error: this.checkDate(date),
                        });
                        actionset.action.setStatus('error');
                        actionset.setStatus('input:error');
                        return [actionset, true];
                    }

                    const city = closestCity(date.location);

                    data.city = city;
                }

                actionset.action.setData(data);

                actionset.next();
            }
        }

        return [actionset, true];
    }

    // 4. categoriesConfiguration

    categoriesConfigurationValidator = Joi.object({
        global: Joi.object({
            resaleBegin: Joi.date(),
            resaleEnd: Joi.date(),
            seats: Joi.number().required(),
            currencies: Joi.array().items(
                Joi.object({
                    currency: Joi.string().required(),
                    price: Joi.number().required(),
                }),
            ),
        }),
        dates: Joi.array().items(
            Joi.object({
                resaleBegin: Joi.date(),
                resaleEnd: Joi.date(),
                seats: Joi.number().required(),
                currencies: Joi.array().items(
                    Joi.object({
                        currency: Joi.string().required(),
                        price: Joi.number().required(),
                    }),
                ),
            }),
        ),
    });

    async categoriesConfigurationHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, value } = this.categoriesConfigurationValidator.validate(
            data,
        );

        if (error) {
            actionset.action.setError({
                details: error,
                error: 'validation_error',
            });
            actionset.action.setStatus('error');
            actionset.setStatus('input:error');
        } else {
            actionset.next();
        }

        return [actionset, true];
    }

    onModuleInit(): void {
        this.actionSetsService.setInputHandler(
            '@events/textMetadata',
            this.textMetadataHandler.bind(this),
        );
        this.actionSetsService.setInputHandler(
            '@events/modulesConfiguration',
            this.modulesConfigurationHandler.bind(this),
        );
        this.actionSetsService.setInputHandler(
            '@events/datesConfiguration',
            this.datesConfigurationHandler.bind(this),
        );
        this.actionSetsService.setInputHandler(
            '@events/categoriesConfiguration',
            this.categoriesConfigurationHandler.bind(this),
        );
    }
}
