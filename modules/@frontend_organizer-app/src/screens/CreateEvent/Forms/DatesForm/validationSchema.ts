import * as yup from 'yup';

const name = yup.string()
    .min(3, 'name_too_short')
    .max(50, 'name_too_long')
    .required('name_required');
const eventBegin = yup.date().min(new Date(), 'past_date_forbidden').required('date_required');
const eventEnd = yup.date().min(new Date(), 'past_date_forbidden').required('date_required');
const location = yup.object().shape({
        lat: yup.number(),
        lon: yup.number(),
        label: yup.string(),
    }).required('location_required');

const dateItemValidation = yup.object().shape({
    name,
    eventBegin,
    eventEnd,
    location,
});

const dates = yup.array()
    .min(1, 'dates_required')
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
