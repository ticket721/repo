import * as yup from 'yup';

const eventBegin = yup.date().min(new Date(), 'past_date_forbidden').required('date_required');
const eventEnd = yup.date().min(yup.ref('eventBegin'), 'end_must_be_gt_start').required('date_required');
const location = yup.object().shape({
        lat: yup.number(),
        lon: yup.number(),
        label: yup.string().required('location_required'),
    }).required('location_required');

const dateItemValidation = yup.object().shape({
    eventBegin,
    eventEnd,
    location,
});

const dates = yup.array()
    .min(1, 'dates_required')
    .of(yup.object().shape({
        eventBegin,
        eventEnd,
        location
    }));

const datesConfigValidationSchema = yup.object().shape({
    dates
});

export { datesConfigValidationSchema, dateItemValidation };
