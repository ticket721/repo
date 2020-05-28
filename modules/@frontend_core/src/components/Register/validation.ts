import * as yup from 'yup';
import { getPasswordStrength, PasswordStrengthReport } from '@common/global';

export const registerValidationSchema = yup.object().shape({
    email: yup.string().email('invalid_email').required('email_required'),
    password: yup
        .string()
        .test('password-validation', 'password_too_weak', function (password: string) {
            const { path, createError } = this;

            if (password !== undefined) {
                const report: PasswordStrengthReport = getPasswordStrength(password);
                if (report.score < 3) {
                    return createError({
                        path,
                        message: report.feedback.warning || report.feedback.suggestions[0],
                    });
                }
            }
            return true;
        })
        .required('password_required'),
    username: yup.string().min(4, 'username_too_short').max(20, 'username_too_long').required('username_required'),
});
