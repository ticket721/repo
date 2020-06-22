import * as yup from 'yup';

const name = yup.string().required('name is required');
const eventBegin = yup.date().min(new Date(), 'Cannot be a past date').required('you need to provide a start date');
const eventEnd = yup.date().min(new Date(), 'Cannot be a past date').required('you need to provide an end date');
const location = yup.object().shape({
        lat: yup.number(),
        lon: yup.number(),
        label: yup.string(),
    }).required('you need to provide a location');

const formLocation = yup.string().required('you need to provide a location');

const dateItemValidation = yup.object().shape({
    name,
    eventBegin,
    eventEnd,
    location: formLocation,
});

const dates = yup.array()
    .min(1, 'Dates are required')
    .of(yup.object().shape({
        name,
        eventBegin,
        eventEnd,
        location
    }));

const datesConfigValidationSchema = yup.object().shape({
    dates
});

export { datesConfigValidationSchema, dateItemValidation };
