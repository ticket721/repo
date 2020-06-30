import * as yup from 'yup';

const avatar = yup.string().required('cover_required');
const signatureColors = yup.array().of(yup.string()).min(2, 'colors_required');

export const imagesMetadataValidationSchema = yup.object().shape({
    avatar,
    signatureColors,
});
