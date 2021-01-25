import * as yup from 'yup';

export const invitationGenerationValidationSchema = yup.object().shape({
    email: yup.string().email().required('email_required'),
    dates: yup.array().min(1).required('dates_required'),
    count: yup.number().min(1).required('count_required')
});
