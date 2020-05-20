import * as yup from 'yup';

const name = yup.string().required('name is required');
const description = yup.string().max(1000).required('description is required');

const tags = yup.array().of(yup.object().shape({
    label: yup.string().required(),
    value: yup.string().required(),
})).min(1, 'please select at least 1 tag');

export const textMetadataValidationSchema = yup.object().shape({
    name,
    description,
    tags,
});
