import * as yup from 'yup';

const name = yup.string().required('nam' +
    'e is required');
const description = yup.string().required('descritpion is required');

export { name, description };
