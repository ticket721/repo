import {
    ActionSetsService,
    Progress,
} from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Joi from '@hapi/joi';
import { closestCity } from '@ticket721sources/global';
import { ImagesService } from '@lib/common/images/Images.service';

/**
 * @events/textMetadata arguments
 */
export interface EventsCreateTextMetadata {
    /**
     * Name of the Event
     */
    name: string;

    /**
     * Description of the event
     */
    description: string;

    /**
     * Tags of the event
     */
    tags: string[];
}

/**
 * @events/modulesConfiguration arguments
 */
// tslint:disable-next-line:no-empty-interface
export interface EventsCreateModulesConfiguration {}

/**
 * @events/datesConfiguration arguments
 */
export interface EventsCreateDatesConfiguration {
    /**
     * Dates of the Event
     */
    dates: {
        /**
         * Name of the Date
         */
        name: string;

        /**
         * Event start
         */
        eventBegin: Date;

        /**
         * Event end
         */
        eventEnd: Date;

        /**
         * Event location
         */
        location: {
            /**
             * Event location latitude
             */
            lat: number;

            /**
             * Event location longitude
             */
            lon: number;

            /**
             * Event location label
             */
            label: string;
        };
    }[];
}

/**
 * @events/categoriesConfiguration arguments
 */
export interface EventsCreateCategoriesConfiguration {
    /**
     * Global categories have no dates (available for multiple dates)
     */
    global: {
        /**
         * Name of the category
         */
        name: string;

        /**
         * Ticket sale begin
         */
        saleBegin: Date;

        /**
         * Ticket sale end
         */
        saleEnd: Date;

        /**
         * Optional resale begin
         */
        resaleBegin?: Date;

        /**
         * Options resale end
         */
        resaleEnd?: Date;

        /**
         * Number of tickets to sell
         */
        seats: number;

        /**
         * Allowed currencies for category
         */
        currencies: {
            currency: string;
            price: string;
        }[];
    }[];
    dates: {
        /**
         * Name of the category
         */
        name: string;

        /**
         * Ticket sale begin
         */
        saleBegin: Date;

        /**
         * Ticket sale end
         */
        saleEnd: Date;

        /**
         * Optional resale begin
         */
        resaleBegin?: Date;

        /**
         * Options resale end
         */
        resaleEnd?: Date;

        /**
         * Number of tickets to sell
         */
        seats: number;

        /**
         * Allowed currencies for category
         */
        currencies: {
            currency: string;
            price: string;
        }[];
    }[][];
}

/**
 * @events/imagesMetadata arguments
 */
export interface EventsCreateImagesMetadata {
    /**
     * Image ID to use as avatar
     */
    avatar: string;

    /**
     * Images IDs to use as banners
     */
    banners: string[];
}

/**
 * @events/adminsConfiguration arguments
 */
export interface EventsCreateAdminsConfiguration {
    /**
     * Admin user ids
     */
    admins: string[];
}

/**
 * Input Handlers container and injecter
 */
@Injectable()
export class EventsInputHandlers implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param actionSetsService
     * @param imagesService
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly imagesService: ImagesService,
    ) {}

    /**
     * @events/textMetadata dynamic argument checker
     */
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

    /**
     * @events/textMetadata handler
     */
    async textMetadataHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error } = this.textMetadataValidator.validate(data);

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

        await progress(100);
        return [actionset, true];
    }

    /**
     * @events/modulesConfiguration dynamic argument checker
     */
    modulesConfigurationValidator = Joi.object({});

    /**
     * @events/modulesConfiguration handler
     */
    async modulesConfigurationHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error } = this.modulesConfigurationValidator.validate(data);

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

        await progress(100);
        return [actionset, true];
    }

    /**
     * @events/datesConfiguration dynamic argument checker
     */
    datesConfigurationValidator = Joi.object({
        dates: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().required(),
                    eventBegin: Joi.date().required(),
                    eventEnd: Joi.date().required(),
                    location: Joi.object({
                        lat: Joi.number().required(),
                        lon: Joi.number().required(),
                        label: Joi.string().required(),
                    })
                        .min(1)
                        .required(),
                }),
            )
            .required(),
    });

    /**
     * @events/datesConfiguration dates checker
     */
    checkEventDates(date: any): string {
        if (date.eventEnd < date.eventBegin) {
            return 'event_end_before_event_begin';
        }

        return null;
    }

    /**
     * @events/datesConfiguration handler
     */
    async datesConfigurationHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error } = this.datesConfigurationValidator.validate(data);

        if (error) {
            actionset.action.setError({
                details: error,
                error: 'validation_error',
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
                    await progress(100);
                    return [actionset, true];
                }

                const city = closestCity(date.location);

                date.city = city;
            }

            actionset.action.setData(data);

            actionset.next();
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * @events/categoriesConfiguration dynamic argument checker
     */
    categoryConfigurationValidator = Joi.object({
        name: Joi.string().required(),
        saleBegin: Joi.date().required(),
        saleEnd: Joi.date().required(),
        resaleBegin: Joi.date(),
        resaleEnd: Joi.date(),
        seats: Joi.number().required(),
        currencies: Joi.array()
            .items(
                Joi.object({
                    currency: Joi.string().required(),
                    price: Joi.number().required(),
                }),
            )
            .required(),
    });

    /**
     * @events/categoriesConfiguration dynamic argument checker
     */
    categoriesConfigurationValidator = Joi.object({
        global: Joi.array().items(this.categoryConfigurationValidator),
        dates: Joi.array().items(
            Joi.array().items(this.categoryConfigurationValidator),
        ),
    });

    /**
     * @events/categoriesConfiguration check name conflicts
     */
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

    /**
     * @events/categoriesConfiguration check categories dates
     */
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

        if (cat.saleEnd < cat.saleBegin) {
            return 'sale_end_before_sale_begin';
        }

        return null;
    }

    /**
     * @events/categoriesConfiguration check dates of resale configs
     */
    checkResaleDates(data: any): string {
        for (const global of data.global) {
            global.resaleBegin = global.resaleBegin
                ? new Date(global.resaleBegin)
                : null;
            global.resaleEnd = global.resaleEnd
                ? new Date(global.resaleEnd)
                : null;
            global.saleBegin = new Date(global.saleBegin);
            global.saleEnd = new Date(global.saleEnd);

            const check = this.checkCategoryDates(global);

            if (check) {
                return check;
            }
        }

        for (const date of data.dates) {
            for (const cat of date) {
                cat.resaleBegin = cat.resaleBegin
                    ? new Date(cat.resaleBegin)
                    : null;
                cat.resaleEnd = cat.resaleEnd ? new Date(cat.resaleEnd) : null;
                cat.saleBegin = new Date(cat.saleBegin);
                cat.saleEnd = new Date(cat.saleEnd);

                const check = this.checkCategoryDates(cat);

                if (check) {
                    return check;
                }
            }
        }

        return null;
    }

    /**
     * @events/categoriesConfiguration handler
     */
    async categoriesConfigurationHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error } = this.categoriesConfigurationValidator.validate(data);

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
                await progress(100);
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
                await progress(100);
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
                await progress(100);
                return [actionset, true];
            }

            actionset.action.setData(data);
            actionset.next();
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * @events/imagesMetadata dynamic argument checker
     */
    imagesMetadataValidator = Joi.object({
        avatar: Joi.string().required(),
        banners: Joi.array()
            .items(Joi.string())
            .required(),
    });

    /**
     * @events/imagesMetadata handler
     */
    async imagesMetadataHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error } = this.imagesMetadataValidator.validate(data);

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
                await progress(100);
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
                    await progress(100);
                    return [actionset, true];
                }
            }

            actionset.next();
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * @events/adminsConfiguration dynamic argument checker
     */
    adminsConfigurationValidator = Joi.object({
        admins: Joi.array().items(Joi.string()),
    });

    /**
     * @events/adminsConfiguration handler
     */
    async adminsConfigurationHandler(
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error } = this.adminsConfigurationValidator.validate(data);

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

        await progress(100);
        return [actionset, true];
    }

    /* istanbul ignore next */
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
