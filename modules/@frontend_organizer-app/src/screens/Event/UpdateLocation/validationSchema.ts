import * as yup from 'yup';

const locationLabel = yup.string().required('name_required');
const coords = yup.object().shape({
    lon: yup.number().required(),
    lat: yup.number().required(),
});

export const locationValidationSchema = yup.object().shape({
    locationLabel,
    coords,
});
