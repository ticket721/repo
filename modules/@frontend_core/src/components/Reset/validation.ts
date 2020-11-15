import * as yup from 'yup';

export const resetValidationSchema = yup.object().shape({
    email: yup.string().email().required('email_required'),
});
