import Joi                                                                                           from '@hapi/joi';
import { symbolOf }                                                                                                        from '../currency';
import {
    ErrorNode,
    generateErrorFromJoiError,
    ImagesMetadata,
    ImagesMetadataChecker,
    noStringDate, quickError,
    TextMetadata,
    TextMetadataChecker,
}                                          from './common';
import { DatePayload, DatePayloadChecker }                                  from './checkDate';
import { CategoryPayload, CategoryPayloadChecker } from './checkCategory';

interface CategoryWithDatesPayload extends CategoryPayload {
    dates: number[];
}

export interface EventCreationPayload {
    textMetadata: TextMetadata;
    imagesMetadata: ImagesMetadata;
    datesConfiguration: DatePayload[];
    categoriesConfiguration: CategoryWithDatesPayload[];
}

const EventCreationPayloadChecker = Joi.object<EventCreationPayload>({
    textMetadata: TextMetadataChecker.required(),
    imagesMetadata: ImagesMetadataChecker.required(),
    datesConfiguration: Joi.array().items(DatePayloadChecker).required(),
    categoriesConfiguration: Joi.array().items(
        (CategoryPayloadChecker as Joi.ObjectSchema)
            .keys({
                dates: Joi.array().items(Joi.number())
            }))
        .required(),
});

const getFurthestDate = (dates: DatePayload[], category: CategoryWithDatesPayload): Date => {
    let date = dates[category.dates[0]].eventEnd;

    for (const dateIdx of category.dates) {
        if (dates[dateIdx].eventEnd.getTime() > date.getTime()) {
            date = dates[dateIdx].eventEnd;
        }
    }

    return date;
};

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
