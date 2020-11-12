import Joi                                                                              from '@hapi/joi';
import { checkMinimum, ErrorNode, generateErrorFromJoiError, noStringDate, quickError } from './common';
import { symbolOf }                                                                     from '../currency';

export interface CategoryPayload {
    name: string;
    saleBegin: Date;
    saleEnd: Date;
    seats: number;
    price: number;
    currency: string;
}

export const CategoryPayloadChecker = Joi.object<CategoryPayload>({
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
        .required()
});

export type CategoryCreationPayload = CategoryPayload;
export const CategoryCreationPayloadChecker = CategoryPayloadChecker;

export const checkCategory = (category: CategoryCreationPayload): ErrorNode => {

    // General Check
    const {
        error,
    } = CategoryCreationPayloadChecker.validate(category);

    if (error) {
        return generateErrorFromJoiError(error);
    }

    category.saleBegin = noStringDate(category.saleBegin);
    category.saleEnd = noStringDate(category.saleEnd);
    category.currency = category.currency.toUpperCase();

    if (category.saleBegin.getTime() > category.saleEnd.getTime()) {

        return quickError('categoryEntity.saleEndBeforeStart', {
            end: category.saleEnd,
            start: category.saleBegin,
        }, `saleEnd`);

    }

    if (symbolOf(category.currency) === undefined && category.currency !== 'FREE') {

        return quickError('categoryEntity.invalidCurrency', {
            currency: category.currency,
        }, `currency`);
    }

    if (!checkMinimum(category.currency, category.price)) {

        return quickError('categoryEntity.priceTooLow', {
            currency: category.currency,
            price: category.price
        }, `currency`);

    }

    return null;

}

