import Joi                                                                                                      from '@hapi/joi';
import {
    ErrorNode,
    generateErrorFromJoiError,
    ImagesMetadata,
    ImagesMetadataChecker,
    LocationChecker, noStringDate, quickError,
    TextMetadata,
    TextMetadataChecker,
    Location
} from './common';

export interface DatePayload {
    online: boolean;
    online_link?: string;
    name: string;
    eventBegin: Date;
    eventEnd: Date;
    location?: Location;
}

export const DatePayloadChecker = Joi.object<DatePayload>({
    online: Joi
        .bool()
        .required(),
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
    online_link: Joi
        .string()
        .uri()
        .when('online', {
            is: true,
            then: Joi.optional(),
            otherwise: Joi.forbidden()
        }),
    location: LocationChecker
        .when('online', {
            is: true,
            then: Joi.forbidden(),
            otherwise: Joi.required()
        })
});

export interface DateCreationPayload {
    info: DatePayload;
    textMetadata: TextMetadata;
    imagesMetadata: ImagesMetadata;
}

export const DateCreationPayloadChecker = Joi.object<DateCreationPayload>({
    info: DatePayloadChecker.required(),
    textMetadata: TextMetadataChecker.required(),
    imagesMetadata: ImagesMetadataChecker.required()
})

export const checkDate = (date: DateCreationPayload): ErrorNode => {

    // General Check
    const {
        error,
    } = DateCreationPayloadChecker.validate(date, {
        abortEarly: false,
    });

    if (error) {
        return generateErrorFromJoiError(error);
    }

    date.info.eventBegin = noStringDate(date.info.eventBegin);
    date.info.eventEnd = noStringDate(date.info.eventEnd);

    if (date.info.eventBegin.getTime() > date.info.eventEnd.getTime()) {
        return quickError('dateEntity.endBeforeStart', {
            end: date.info.eventEnd,
            start: date.info.eventBegin,
        }, `info.eventEnd`);
    }

    return null;
}

