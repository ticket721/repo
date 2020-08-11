import React from 'react';
import { useFormik } from 'formik';
import { Button, TextInput, Icon, PasswordInput } from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector } from 'react-redux';
import { AuthState, LocalRegister } from '../../redux/ducks/auth';
import { useHistory } from 'react-router';
import { AppState } from '../../redux/ducks';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { registerValidationSchema } from './validation';
import './locales';
import { getPasswordStrength } from '@common/global';
import { useMediaQuery } from 'react-responsive';
import { useDeepEffect } from '../../hooks/useDeepEffect';

export interface RegisterProps {
    onLogin?: () => void;
}

export const Register: React.FC<RegisterProps> = (props: RegisterProps) => {
    const [t] = useTranslation(['registration', 'password_feedback']);
    const auth = useSelector((state: AppState): AuthState => state.auth);
    const dispatch = useDispatch();
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            passwordConfirmation: '',
            username: '',
        },
        validationSchema: registerValidationSchema,
        onSubmit: async (values) => {
            dispatch(LocalRegister(values.email.toLowerCase(), values.password, values.username, 'fr'));
        },
    });
    const history = useHistory();

    useDeepEffect(() => {
        if (!auth.loading) {
            if (auth.submit && !auth.errors && auth.token) {
                history.replace('/');
            } else {
                if (auth.errors) {
                    formik.setErrors(auth.errors);
                }
            }
        }
    }, [auth]);

    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });

    return (
        <RegisterWrapper mobile={isTabletOrMobile}>
            <RegisterContainer mobile={isTabletOrMobile}>
                <IconContainer>
                    <Icon icon={'ticket721'} size={'40px'} color={'#fff'} />
                </IconContainer>
                <Form onSubmit={formik.handleSubmit}>
                    <Inputs>
                        <TextInput
                            name={'email'}
                            label={t('email_label')}
                            placeholder={t('email_placeholder')}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            error={formik.touched['email'] ? t(formik.errors['email']) : undefined}
                        />
                        <PasswordInput
                            name={'password'}
                            label={t('password_label')}
                            placeholder={t('password_placeholder')}
                            score={getPasswordStrength(formik.values.password).score}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            error={
                                formik.touched['password'] && formik.errors['password']
                                    ? t('password_feedback:' + formik.errors['password'])
                                    : undefined
                            }
                        />
                        <PasswordInput
                            name={'passwordConfirmation'}
                            label={t('password_confirmation_label')}
                            placeholder={t('password_placeholder')}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.passwordConfirmation}
                            error={
                                formik.touched['passwordConfirmation'] && formik.errors['passwordConfirmation']
                                    ? t('different_password')
                                    : undefined
                            }
                        />
                        <TextInput
                            name={'username'}
                            label={t('username_label')}
                            placeholder={t('username_placeholder')}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.username}
                            error={formik.touched['username'] ? t(formik.errors['username']) : undefined}
                        />
                    </Inputs>
                    <ActionsContainer>
                        <Button variant={'primary'} type={'submit'} title={t('register')} />
                        <SwitchToLogin
                            onClick={() => {
                                if (props.onLogin) {
                                    props.onLogin();
                                } else {
                                    history.replace('/login');
                                }
                            }}
                        >
                            {t('login_switch')}
                        </SwitchToLogin>
                    </ActionsContainer>
                </Form>
            </RegisterContainer>
        </RegisterWrapper>
    );
};

interface RegisterWrapperProps {
    mobile: boolean;
}

const RegisterWrapper = styled.div<RegisterWrapperProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${(props) => (props.mobile ? 'none' : '100vh')};
`;

interface IRegisterContainerInputProps {
    mobile: boolean;
}

const RegisterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 480px;
    background: ${(props: IRegisterContainerInputProps) =>
        props.mobile ? 'none' : 'linear-gradient(91.44deg, #241f33 0.31%, #1b1726 99.41%)'};
    padding: ${(props) => (props.mobile ? props.theme.regularSpacing : '40px')};
    border-radius: 15px;
`;

const IconContainer = styled.div`
    margin: 10px 0 5px;
`;

const Form = styled.form`
    width: 100%;
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
`;

const Inputs = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 445px;
`;

const ActionsContainer = styled.div`
    width: 60%;
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SwitchToLogin = styled.span`
    font-size: 10px;
    margin-top: 5px;
    text-decoration: underline;
    white-space: nowrap;
    cursor: pointer;
    color: #ccc;
`;
