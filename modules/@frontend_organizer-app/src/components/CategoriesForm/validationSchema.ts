import * as yup        from 'yup';

const name = yup.string().required('the name of the category is required');
const saleBegin = yup.date();
const saleEnd = yup.date();
const seats = yup.number().integer().positive('quantity can not be negative').moreThan(0, 'You can not have a category with 0 tickets');
const currencies = yup.array().of(yup.object().shape({
    currency: yup.string(),
    price: yup.number().positive('price can not be negative'),
}));

const categoryValidationSchema = yup.object().shape({
    name,
    saleBegin,
    saleEnd,
    seats,
    currencies,
});

const global = yup.array().of(categoryValidationSchema);


const dates = yup.array().of(yup.array().of(categoryValidationSchema));

const categoriesValidationSchema = yup.object().shape({
    global,
    dates,
});

export { categoriesValidationSchema, categoryValidationSchema };
