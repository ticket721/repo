import { ActionSetsService, Progress } from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Joi from '@hapi/joi';
import { City, closestCity, serialize, Coordinates } from '@common/global';
import { ImagesService } from '@lib/common/images/Images.service';
import { ChecksRunnerUtil } from '@lib/common/actionsets/helper/ChecksRunner.util';
import { EventCreationActions } from '@lib/common/events/acset_builders/EventCreate.acsetbuilder.helper';

/**
 * events/textMetadata arguments
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
 * events/imagesMetadata arguments
 */
export interface EventsCreateImagesMetadata {
    /**
     * Image ID to use as avatar
     */
    avatar: string;

    /**
     * Array of colors to use as signature colors for the event / dates
     */
    signatureColors: string[];
}

/**
 * events/modulesConfiguration arguments
 */
// tslint:disable-next-line:no-empty-interface
export interface EventsCreateModulesConfiguration {}

/**
 * events/datesConfiguration arguments
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
 * events/categoriesConfiguration arguments
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
            /**
             * Currency Name
             */
            currency: string;

            /**
             * Price for specific currency
             */
            price: string;
        }[];
    }[];
    /**
     * Configuration for categories that are date specific
     */
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
            /**
             * Currency Name
             */
            currency: string;

            /**
             * Price for specific currency
             */
            price: string;
        }[];
    }[][];
}

/**
 * events/adminsConfiguration arguments
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
    constructor(private readonly actionSetsService: ActionSetsService, private readonly imagesService: ImagesService) {}

    /**
     * events/textMetadata dynamic argument checker
     */
    textMetadataValidator = Joi.object<EventsCreateTextMetadata>({
        name: Joi.string()
            .max(50)
            .min(3)
            .optional(),
        description: Joi.string()
            .max(1000)
            .allow('')
            .optional(),
        tags: Joi.array()
            .items(
                Joi.string()
                    .max(16)
                    .min(3),
            )
            .optional(),
    });

    /**
     * events/textMetadata dynamic fields checker
     */
    textMetadataFields = ['name', 'description', 'tags'];

    /**
     * events/textMetadata handler
     */
    async textMetadataHandler(
        textMetadataFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<EventsCreateTextMetadata>(
            data,
            this.textMetadataValidator,
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
                actionset.next();
                break;
            }
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * events/imagesMetadata dynamic argument checker
     */
    imagesMetadataValidator = Joi.object<EventsCreateImagesMetadata>({
        avatar: Joi.string()
            .uuid()
            .optional(),
        signatureColors: Joi.array()
            .items(Joi.string().regex(/^#[A-Fa-f0-9]{6}/))
            .min(2)
            .optional(),
    });

    /**
     * events/imagesMetadata dynamic fields checker
     */
    imagesMetadataFields: string[] = ['avatar', 'signatureColors'];

    /**
     * events/imagesMetadata handler
     */
    async imagesMetadataHandler(
        imagesMetadataFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<EventsCreateImagesMetadata>(
            data,
            this.imagesMetadataValidator,
            imagesMetadataFields,
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

                actionset.next();

                break;
            }
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * events/modulesConfiguration dynamic argument checker
     */
    modulesConfigurationValidator = Joi.object<EventsCreateModulesConfiguration>({});

    /**
     * events/modulesConfiguration dynamic fields checker
     */
    modulesConfigurationFields: string[] = [];

    /**
     * events/modulesConfiguration handler
     */
    async modulesConfigurationHandler(
        modulesConfigurationFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<EventsCreateModulesConfiguration>(
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

            // No fields, so cannot be incomplete
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
     * City type dynamic checker
     */
    cityValidator = Joi.object<City>({
        name: Joi.string().required(),
        nameAscii: Joi.string().required(),
        nameAdmin: Joi.string().required(),
        country: Joi.string().required(),
        coord: Joi.object<Coordinates>({
            lon: Joi.number().required(),
            lat: Joi.number().required(),
        }),
        population: Joi.number().required(),
        id: Joi.number().required(),
    });

    /**
     * events/datesConfiguration dynamic argument checker
     */
    datesConfigurationValidator = Joi.object<EventsCreateDatesConfiguration>({
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
                    }).required(),
                    city: this.cityValidator.optional(),
                }),
            )
            .min(1)
            .optional(),
    });

    /**
     * events/datesConfiguration dynamic field checker
     */
    datesConfigurationFields: string[] = ['dates'];

    /**
     * events/datesConfiguration dates checker
     */
    checkEventDates(date: any): string {
        if (date.eventEnd < date.eventBegin) {
            return 'event_end_before_event_begin';
        }

        return null;
    }

    /**
     * events/datesConfiguration handler
     */
    async datesConfigurationHandler(
        datesConfigurationFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<EventsCreateDatesConfiguration>(
            data,
            this.datesConfigurationValidator,
            datesConfigurationFields,
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

                    date.city = closestCity(date.location);
                }

                actionset.action.setData(data);

                actionset.next();
                break;
            }
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * events/categoriesConfiguration dynamic argument checker
     */
    categoryConfigurationValidator = Joi.object({
        name: Joi.string().required(),
        serializedName: Joi.string().optional(),
        saleBegin: Joi.date().required(),
        saleEnd: Joi.date().required(),
        resaleBegin: Joi.date().allow(null),
        resaleEnd: Joi.date().allow(null),
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
     * events/categoriesConfiguration dynamic argument checker
     */
    categoriesConfigurationValidator = Joi.object<EventsCreateCategoriesConfiguration>({
        global: Joi.array()
            .items(this.categoryConfigurationValidator)
            .optional(),
        dates: Joi.array()
            .items(Joi.array().items(this.categoryConfigurationValidator))
            .optional(),
    });

    /**
     * events/categoriesConfiguration dynamic fields checker
     */
    categoriesConfigurationFields: string[] = ['global', 'dates'];

    /**
     * events/categoriesConfiguration check name conflicts
     */
    async checkCategoriesConflicts(data: any): Promise<string> {
        const registry: { [key: string]: boolean } = {};

        for (const global of data.global) {
            const serializedName = serialize(global.name).slice(0, 32);

            if (registry[serializedName]) {
                return 'categories_name_conflict';
            }

            registry[serializedName] = true;

            global.serializedName = serializedName;
        }

        for (let idx = 0; idx < data.dates.length; ++idx) {
            for (const cat of data.dates[idx]) {
                const serializedName = `${serialize(cat.name).slice(0, 32 - 1 - idx.toString().length)}_${idx}`;

                if (registry[serializedName]) {
                    return 'categories_name_conflict';
                }

                registry[serializedName] = true;

                cat.serializedName = serializedName;
            }
        }
    }

    /**
     * events/categoriesConfiguration check categories dates
     */
    checkCategoryDates(cat: any): string {
        if (cat.saleEnd < cat.saleBegin) {
            return 'sale_end_before_sale_begin';
        }

        if (!cat.resaleEnd && !cat.resaleBegin) {
            return null;
        }

        if ((cat.resaleEnd && !cat.resaleBegin) || (!cat.resaleEnd && cat.resaleBegin)) {
            return 'resale_dates_should_both_be_defined';
        }

        if (cat.resaleEnd < cat.resaleBegin) {
            return 'resale_end_before_resale_begin';
        }

        return null;
    }

    /**
     * events/categoriesConfiguration check dates of resale configs
     */
    checkResaleDates(data: any): string {
        for (const global of data.global) {
            global.resaleBegin = global.resaleBegin ? new Date(global.resaleBegin) : null;
            global.resaleEnd = global.resaleEnd ? new Date(global.resaleEnd) : null;
            global.saleBegin = new Date(global.saleBegin);
            global.saleEnd = new Date(global.saleEnd);

            const check = this.checkCategoryDates(global);

            if (check) {
                return check;
            }
        }

        for (const date of data.dates) {
            for (const cat of date) {
                cat.resaleBegin = cat.resaleBegin ? new Date(cat.resaleBegin) : null;
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
     * events/categoriesConfiguration handler
     */
    async categoriesConfigurationHandler(
        categoriesConfigurationFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<EventsCreateCategoriesConfiguration>(
            data,
            this.categoriesConfigurationValidator,
            categoriesConfigurationFields,
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
                const dates = actionset.actions[EventCreationActions.DatesConfiguration].data;

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
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * events/adminsConfiguration dynamic argument checker
     */
    adminsConfigurationValidator = Joi.object({
        admins: Joi.array()
            .items(Joi.string())
            .optional(),
    });

    /**
     * events/adminsConfiguration dynamic fields checker
     */
    adminsConfigurationFields: string[] = ['admins'];

    /**
     * events/adminsConfiguration handler
     */
    async adminsConfigurationHandler(
        adminsConfigurationFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<EventsCreateAdminsConfiguration>(
            data,
            this.adminsConfigurationValidator,
            adminsConfigurationFields,
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

    /**
     * Handlers injection
     */

    /* istanbul ignore next */
    onModuleInit(): void {
        this.actionSetsService.setInputHandler(
            '@events/textMetadata',
            this.textMetadataHandler.bind(this, this.textMetadataFields),
        );
        this.actionSetsService.setInputHandler(
            '@events/modulesConfiguration',
            this.modulesConfigurationHandler.bind(this, this.modulesConfigurationFields),
        );
        this.actionSetsService.setInputHandler(
            '@events/datesConfiguration',
            this.datesConfigurationHandler.bind(this, this.datesConfigurationFields),
        );
        this.actionSetsService.setInputHandler(
            '@events/categoriesConfiguration',
            this.categoriesConfigurationHandler.bind(this, this.categoriesConfigurationFields),
        );
        this.actionSetsService.setInputHandler(
            '@events/imagesMetadata',
            this.imagesMetadataHandler.bind(this, this.imagesMetadataFields),
        );
        this.actionSetsService.setInputHandler(
            '@events/adminsConfiguration',
            this.adminsConfigurationHandler.bind(this, this.adminsConfigurationFields),
        );
    }
}
