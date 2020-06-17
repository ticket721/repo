import * as yup        from 'yup';

const name = yup.string().required('the name of the category is required');
const price = yup.number().positive('price can not be negative').moreThan(0, 'Price can not be 0');
const quantity = yup.number().integer().positive('quantity can not be negative').moreThan(0, 'You can not have a category with 0 tickets');
const eventDate = yup.string();
const salesStart = yup.date();
const salesEnd = yup.date();
const resalesStart = yup.date().notRequired();
const resalesEnd = yup.date().notRequired();
const resales = yup.boolean().default(false);

const global = yup.array().of(yup.object().shape({
  name,
  price,
  quantity,
  salesStart,
  salesEnd,
  resalesStart,
  resalesEnd,
  resales,
}));

const dates = yup.array().of(yup.object().shape({
  name,
  dates: yup.array().of(yup.object().shape({
    eventDate,
    price,
    quantity,
    salesStart,
    salesEnd,
    resalesStart,
    resalesEnd,
    resales,
  }))
}));

const validationSchema = yup.object().shape({
  global,
  dates,
});

export { validationSchema };
