import * as yup from 'yup';

const dates = yup.array().min(1, 'Dates are required').of(yup.object().shape(
    {
        start: yup.object().shape({
            date: yup.date().required('start day is missing'),
            time: yup.date().required('start time is missing'),
            final: yup.date(),
        }).required('start date is missing'),

        end: yup.object().shape({
            date: yup.date().required('end day is missing'),
            time: yup.date().required('end time is missing'),
            final: yup.date(),
        }).required('end date is missing')
    }
));
const location = yup.string().required('Location is required');

export { dates, location };
