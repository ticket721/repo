import * as yup from 'yup';

export const resetPasswordValidationSchema = yup.object().shape({
    email: yup.string().email().required('email_required'),
});
