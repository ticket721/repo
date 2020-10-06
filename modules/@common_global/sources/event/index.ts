import Joi          from '@hapi/joi';
import { set, get } from 'lodash';
import { symbolOf } from '../currency';

export interface CategoryCreationPayload {
    name: string;
    saleBegin: Date;
    saleEnd: Date;
    seats: number;
    price: number;
    currency: string;
    dates: number[];
}

const CategoryCreationPayloadChecker = Joi.object<CategoryCreationPayload>({
    name: Joi
        .string()
        .max(50)
        .min(3)
        .required(),
    saleBegin: Joi
        .date()
        .required(),
    saleEnd: Joi
        .date()
        .required(),
    seats: Joi
        .number()
        .min(1)
        .required(),
    price: Joi
        .number()
        .required(),
    currency: Joi
        .string()
        .required(),
    dates: Joi
        .array()
        .items(
            Joi.number(),
        )
        .required(),
});

export interface DateLocationPayload {
    lat: number;
    lon: number;
    label: string;
}

const DateLocationPayloadChecker = Joi.object<DateLocationPayload>({
    lat: Joi
        .number()
        .required(),
    lon: Joi
        .number()
        .required(),
    label: Joi
        .string()
        .required(),
});

export interface DateCreationPayload {
    online: boolean;
    liveLink?: string;
    name: string;
    eventBegin: Date;
    eventEnd: Date;
    location: DateLocationPayload;
}

const DateCreationPayloadChecker = Joi.object<DateCreationPayload>({
    online: Joi
        .bool()
        .required(),
    liveLink: Joi
        .string()
        .uri()
        .optional(),
    name: Joi
        .string()
        .max(50)
        .min(3)
        .required(),
    eventBegin: Joi
        .date()
        .required(),
    eventEnd: Joi
        .date()
        .required(),
    location: DateLocationPayloadChecker
        .required(),
});

export interface EventTextMetadataPayload {
    name: string;
    description: string;
    twitter?: string;
    website?: string;
    facebook?: string;
    email?: string;
    linked_in?: string;
    tiktok?: string;
    instagram?: string;
    spotify?: string;
}

const EventTextMetadataPayloadChecker = Joi.object<EventTextMetadataPayload>({
    name: Joi
        .string()
        .max(50)
        .min(3)
        .required(),
    description: Joi
        .string()
        .max(10000)
        .allow('')
        .required(),
    instagram: Joi
        .string()
        .optional(),
    twitter: Joi
        .string()
        .optional(),
    tiktok: Joi
        .string()
        .optional(),
    website: Joi
        .string()
        .uri()
        .optional(),
    spotify: Joi
        .string()
        .uri()
        .optional(),
    facebook: Joi
        .string()
        .uri()
        .optional(),
    linked_in: Joi
        .string()
        .uri()
        .optional(),
    email: Joi
        .string()
        .email({
            tlds: { allow: false },
        })
        .optional(),
});

export interface EventImagesMetadataPayload {
    avatar: string;
    signatureColors: [string, string];
}

const EventImagesMetadataPayloadChecker = Joi.object<EventImagesMetadataPayload>({
    avatar: Joi
        .string()
        .uri()
        .required(),
    signatureColors: Joi.array()
        .items(Joi.string().regex(/^#[A-Fa-f0-9]{6}/))
        .min(2)
        .max(2)
        .required(),
});

export interface EventCreationPayload {
    textMetadata: EventTextMetadataPayload;
    imagesMetadata: EventImagesMetadataPayload;
    datesConfiguration: DateCreationPayload[];
    categoriesConfiguration: CategoryCreationPayload[];
}

const EventCreationPayloadChecker = Joi.object({
    textMetadata: EventTextMetadataPayloadChecker.required(),
    imagesMetadata: EventImagesMetadataPayloadChecker.required(),
    datesConfiguration: Joi.array().items(DateCreationPayloadChecker).required(),
    categoriesConfiguration: Joi.array().items(CategoryCreationPayloadChecker).required(),
});

export interface PayloadError {
    type: string;
    context: any;
}

export interface ErrorLeaf {
    reasons: PayloadError[];
}

export interface ErrorNode {
    [key: string]: (ErrorNode | ErrorLeaf);

    [key: number]: (ErrorNode | ErrorLeaf);
}

const generateErrorFromJoiError = (error: Joi.ValidationError): ErrorNode => {

    const response: ErrorNode = {};

    for (const err of error.details) {

        const path = err.path.join('.');

        const value: ErrorLeaf = get(response, path) as ErrorLeaf;

        if (value === undefined) {

            set(response, path, {
                reasons: [
                    {
                        type: err.type,
                        context: err.context,
                    },
                ],
            });

        } else {

            set(response, path, {
                reasons: [
                    ...value.reasons,
                    {
                        type: err.type,
                        context: err.context,
                    },
                ],
            });
        }
    }

    return response;
};

const quickError = (code: string, context: any, path: string): ErrorNode => {
    return set({}, path, {
        reasons: [
            {
                type: code,
                context,
            },
        ],
    });
};

const getFurthestDate = (dates: DateCreationPayload[], category: CategoryCreationPayload): Date => {
    let date = dates[category.dates[0]].eventEnd;

    for (const dateIdx of category.dates) {
        if (dates[dateIdx].eventEnd.getTime() > date.getTime()) {
            date = dates[dateIdx].eventEnd;
        }
    }

    return date;
};

const noStringDate = (date: Date | string): Date => {
    if (typeof date === 'string') {
        return new Date(date);
    }
    return date;
}

export const checkEvent = (event: EventCreationPayload): ErrorNode => {

    // General Check
    const {
        error,
    } = EventCreationPayloadChecker.validate(event);

    if (error) {
        return generateErrorFromJoiError(error);
    }

    if (event.datesConfiguration.length === 0) {
        return quickError('dateEntity.min', {
            limit: 1,
            value: [],
            label: 'datesConfiguration',
            key: 'datesConfiguration',
        }, 'datesConfiguration');
    }

    const dates = event.datesConfiguration;

    // Logical Date Checks
    for (let dateIdx = 0; dateIdx < event.datesConfiguration.length; ++dateIdx) {

        dates[dateIdx].eventBegin = noStringDate(dates[dateIdx].eventBegin);
        dates[dateIdx].eventEnd = noStringDate(dates[dateIdx].eventEnd);

        if (dates[dateIdx].eventBegin.getTime() > dates[dateIdx].eventEnd.getTime()) {
            return quickError('dateEntity.endBeforeStart', {
                end: dates[dateIdx].eventEnd,
                start: dates[dateIdx].eventBegin,
            }, `datesConfiguration.${dateIdx}.eventEnd`);
        }

    }

    const categories = event.categoriesConfiguration;

    for (let categoryIdx = 0; categoryIdx < event.categoriesConfiguration.length; ++categoryIdx) {

        categories[categoryIdx].saleBegin = noStringDate(categories[categoryIdx].saleBegin);
        categories[categoryIdx].saleEnd = noStringDate(categories[categoryIdx].saleEnd);

        if (categories[categoryIdx].saleBegin.getTime() > categories[categoryIdx].saleEnd.getTime()) {

            return quickError('categoryEntity.saleEndBeforeStart', {
                end: categories[categoryIdx].saleEnd,
                start: categories[categoryIdx].saleBegin,
            }, `categoriesConfiguration.${categoryIdx}.saleEnd`);

        }

        for (let dateIdx = 0; dateIdx < categories[categoryIdx].dates.length; ++dateIdx) {
            const dateValue = categories[categoryIdx].dates[dateIdx];
            if (dateValue >= dates.length) {

                return quickError('categoryEntity.invalidDateIndex', {}, `categoriesConfiguration.${categoryIdx}.dates.${dateIdx}`);

            }
        }

        if (categories[categoryIdx].dates.length === 0) {

            return quickError('categoryEntity.noDateLinked', {}, `categoriesConfiguration.${categoryIdx}.dates`);

        }

        const furthestDate = getFurthestDate(dates, categories[categoryIdx]);

        if (categories[categoryIdx].saleEnd.getTime() > furthestDate.getTime()) {

            return quickError('categoryEntity.saleEndAfterLastEventEnd', {
                eventEnd: furthestDate,
                saleEnd: categories[categoryIdx].saleEnd,
            }, `categoriesConfiguration.${categoryIdx}.saleEnd`);

        }

        if (symbolOf(categories[categoryIdx].currency) === undefined && categories[categoryIdx].currency !== 'FREE') {

            return quickError('categoryEntity.invalidCurrency', {
                currency: categories[categoryIdx].currency,
            }, `categoriesConfiguration.${categoryIdx}.currency`);
        }

    }

    return null;
};
