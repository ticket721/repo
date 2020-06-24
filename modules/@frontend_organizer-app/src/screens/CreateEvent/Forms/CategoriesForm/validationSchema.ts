import * as yup        from 'yup';

const name = yup.string()
    .max(20, 'category_name_too_long')
    .required('category_name_required');
const saleBegin = yup.date();
const saleEnd = yup.date();
const seats = yup.number()
    .integer()
    .positive('seats_positive_number')
    .moreThan(0, 'seats_more_than_zero');
const currencies = yup.array().of(yup.object().shape({
    currency: yup.string().required(),
    price: yup.number().integer().positive(),
}));

const price = yup.number()
    .min(0, 'price_positive_number');

const categoryValidationSchema = yup.object().shape({
    name,
    saleBegin,
    saleEnd,
    seats,
    price,
});

const global = yup.array().of(yup.object().shape({
    name,
    saleBegin,
    saleEnd,
    seats,
    currencies,
}));


const dates = yup.array().of(yup.array().of(yup.object().shape({
    name,
    saleBegin,
    saleEnd,
    seats,
    currencies,
})));

const categoriesValidationSchema = yup.object().shape({
    global,
    dates,
});

export { categoriesValidationSchema, categoryValidationSchema };
