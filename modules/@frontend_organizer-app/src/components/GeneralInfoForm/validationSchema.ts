import * as yup from 'yup';

const name = yup.string().required('name is required');
const description = yup.string().max(1000);

const tags = yup.array()
    .min(1, 'please select at least 1 tag')
    .of(yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required(),
    }));
const inputTag = yup.string().required();
// const tags = yup.object().shape({
//     values: yup.array().min(1, 'please select at least 1 tag').of(yup.string()),
//     inputValue: yup.string().required(),
//     tagsLength: yup.number().required(),
// });

export { name, description, tags, inputTag };
