import * as yup from 'yup';

const dateItemValidation = yup.object().shape({
    name: yup.string().required('name is required'),
    eventBegin: yup.date().min(new Date(), 'Cannot be a past date').required('you need to provide a start date'),
    eventEnd: yup.date().min(new Date(), 'Cannot be a past date').required('you need to provide an end date'),
    location: yup.object().shape({
        lat: yup.number(),
        lon: yup.number(),
        label: yup.string().required('you need to provide a location'),
    }).required('you need to provide a location'),
});

const dates = yup.array()
    .min(1, 'Dates are required')
    .of(dateItemValidation);

const datesConfigValidationSchema = yup.object().shape({
    dates
});

export { datesConfigValidationSchema, dateItemValidation };
