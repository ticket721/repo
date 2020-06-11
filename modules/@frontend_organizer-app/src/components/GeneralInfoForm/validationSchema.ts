import * as yup from 'yup';

const name = yup.string()
    .min(3, 'name_too_short')
    .max(50, 'name_too_long')
    .required('name_required');
const description = yup.string()
    .max(1000)
    .required('description_required');
const tags = yup.array().of(
    yup.string()
        .min(3, 'tag_too_short')
        .max(16, 'tag_too_long')
).min(1, 'tag_required');

export const textMetadataValidationSchema = yup.object().shape({
    name,
    description,
    tags,
});
