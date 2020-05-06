import * as yup from 'yup';

const name = yup.string().required('name is required');
const description = yup.string().max(1000);
const cover = yup.string().required('please import a cover');


const tag = yup.array().min(1, 'please select at least 1 tag').of(
  yup.object().shape({
    label: yup.string().required(),
    value: yup.string().required(),
  })
);

export { name, description, tag, cover };
