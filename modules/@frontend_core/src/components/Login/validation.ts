import * as yup from 'yup';

export const loginValidationSchema = yup.object().shape({
    email: yup.string().email().required('email_required'),
    password: yup.string().required('password_required'),
});
