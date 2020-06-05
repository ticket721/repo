import * as yup from 'yup';

const name = yup.string().required('name is required');
const description = yup.string().max(1000);
const cover = yup.object().shape({
    name: yup.string(),
    size: yup.number(),
    previewUrl: yup.string().required('cover is required'),
    width: yup.number(),
    height: yup.number(),
});
const tags = yup.array().min(1, 'please select at least 1 tag').of(yup.string());


const validationSchema = yup.object().shape({
    name,
    description,
    cover,
    tags,
});

export { validationSchema };
