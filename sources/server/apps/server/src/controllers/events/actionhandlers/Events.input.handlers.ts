import {
    ActionSetsService,
    Progress,
} from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Joi from '@hapi/joi';
import { closestCity } from '@ticket721sources/global';
import { ImagesService } from '@lib/common/images/Images.service';

@Injectable()
export class EventsInputHandlers implements OnModuleInit {
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly imagesService: ImagesService,
    ) {}

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

        const { error, value } = this.textMetadataValidator.validate(data);

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

    checkEventDates(date: any): string {
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

                    if (this.checkEventDates(date) !== null) {
                        actionset.action.setError({
                            details: null,
                            error: this.checkEventDates(date),
                        });
                        actionset.action.setStatus('error');
                        actionset.setStatus('input:error');
                        return [actionset, true];
                    }

                    const city = closestCity(date.location);

                    date.city = city;
                }

                actionset.action.setData(data);

                actionset.next();
            }
        }

        return [actionset, true];
    }

    // 4. categoriesConfiguration

    categoryConfigurationValidator = Joi.object({
        name: Joi.string().required(),
        resaleBegin: Joi.date(),
        resaleEnd: Joi.date(),
        seats: Joi.number().required(),
        currencies: Joi.array().items(
            Joi.object({
                currency: Joi.string().required(),
                price: Joi.number().required(),
            }),
        ),
    });

    categoriesConfigurationValidator = Joi.object({
        global: Joi.array().items(this.categoryConfigurationValidator),
        dates: Joi.array().items(
            Joi.array().items(this.categoryConfigurationValidator),
        ),
    });

    async checkCategoriesConflicts(data: any): Promise<string> {
        const registry: { [key: string]: boolean } = {};

        for (const global of data.global) {
            global.name = `${global.name}_0`;

            if (registry[global.name]) {
                return 'categories_name_conflict';
            }

            registry[global.name] = true;
        }

        for (let idx = 0; idx < data.dates.length; ++idx) {
            for (const cat of data.dates[idx]) {
                cat.name = `${cat.name}_${idx}_0`;

                if (registry[cat.name]) {
                    return 'categories_name_conflict';
                }

                registry[cat.name] = true;
            }
        }
    }

    checkCategoryDates(cat: any): string {
        if (!cat.resaleEnd && !cat.resaleBegin) {
            return null;
        }

        if (
            (cat.resaleEnd && !cat.resaleBegin) ||
            (!cat.resaleEnd && cat.resaleBegin)
        ) {
            return 'resale_dates_should_both_be_defined';
        }

        if (cat.resaleEnd < cat.resaleBegin) {
            return 'resale_end_before_resale_begin';
        }

        return null;
    }

    checkResaleDates(data: any): string {
        for (const global of data.global) {
            global.resaleBegin = new Date(global.resaleBegin);
            global.resaleEnd = new Date(global.resaleEnd);

            const check = this.checkCategoryDates(global);

            if (check) {
                return check;
            }
        }

        for (const date of data.dates) {
            for (const cat of date) {
                cat.resaleBegin = new Date(cat.resaleBegin);
                cat.resaleEnd = new Date(cat.resaleEnd);

                const check = this.checkCategoryDates(cat);

                if (check) {
                    return check;
                }
            }
        }

        return null;
    }

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
            const dates = actionset.actions[actionset.current_action - 1].data;

            if (dates.dates.length !== data.dates.length) {
                actionset.action.setError({
                    details: null,
                    error: 'invalid_categories_per_dates_ratio',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
                return [actionset, true];
            }

            const conflict = await this.checkCategoriesConflicts(data);

            if (conflict) {
                actionset.action.setError({
                    details: null,
                    error: conflict,
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
                return [actionset, true];
            }

            const datesChecks = this.checkResaleDates(data);

            if (datesChecks) {
                actionset.action.setError({
                    details: null,
                    error: datesChecks,
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
                return [actionset, true];
            }

            actionset.next();
        }

        return [actionset, true];
    }

    imagesMetadataValidator = Joi.object({
        avatar: Joi.string(),
        banners: Joi.array().items(Joi.string()),
    });

    async imagesMetadataHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, value } = this.imagesMetadataValidator.validate(data);

        if (error) {
            actionset.action.setError({
                details: error,
                error: 'validation_error',
            });
            actionset.action.setStatus('error');
            actionset.setStatus('input:error');
        } else {
            const avatarQuery = await this.imagesService.search({
                id: data.avatar,
            });

            if (avatarQuery.error || avatarQuery.response.length === 0) {
                actionset.action.setError({
                    details: error,
                    error: 'cannot_find_image',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
                return [actionset, true];
            }

            for (const banner of data.banners) {
                const bannerQuery = await this.imagesService.search({
                    id: banner,
                });

                if (bannerQuery.error || bannerQuery.response.length === 0) {
                    actionset.action.setError({
                        details: error,
                        error: 'cannot_find_image',
                    });
                    actionset.action.setStatus('error');
                    actionset.setStatus('input:error');
                    return [actionset, true];
                }
            }

            actionset.next();
        }

        return [actionset, true];
    }

    adminsConfigurationValidator = Joi.object({
        admins: Joi.array().items(Joi.string()),
    });

    async adminsConfigurationHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, value } = this.adminsConfigurationValidator.validate(
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
        this.actionSetsService.setInputHandler(
            '@events/imagesMetadata',
            this.imagesMetadataHandler.bind(this),
        );
        this.actionSetsService.setInputHandler(
            '@events/adminsConfiguration',
            this.adminsConfigurationHandler.bind(this),
        );
    }
}
