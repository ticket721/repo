import React from 'react';
import { useFormik } from 'formik';
import { Button, TextInput, Icon, PasswordInput } from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { AppState } from '../../redux/ducks';
import { AuthState, LocalLogin } from '../../redux/ducks/auth';
import styled from 'styled-components';
import { loginValidationSchema } from './validation';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import './locales';
import { useDeepEffect } from '../../hooks/useDeepEffect';

export interface LoginProps {
    onRegister?: () => void;
    externalRegister?: string;
}

export const Login: React.FC<LoginProps> = (props: LoginProps) => {
    const [t] = useTranslation('login');
    const auth = useSelector((state: AppState): AuthState => state.auth);
    const history = useHistory();
    const dispatch = useDispatch();
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: loginValidationSchema,
        onSubmit: async (values) => {
            dispatch(LocalLogin(values.email.toLowerCase(), values.password));
        },
    });
    const isTabletOrMobile = useMediaQuery({ maxWidth: 900 });

    const { from }: any = history.location.state || { from: '/' };

    useDeepEffect(() => {
        if (!auth.loading) {
            if (auth.submit && !auth.errors && auth.token) {
                history.replace(from);
            } else {
                if (auth.errors) {
                    formik.setErrors(auth.errors);
                }
            }
        }
    }, [auth]);

    return (
        <LoginWrapper mobile={isTabletOrMobile}>
            <LoginContainer mobile={isTabletOrMobile}>
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
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            error={formik.touched['password'] ? t(formik.errors['password']) : undefined}
                        />
                    </Inputs>
                    <ActionsContainer>
                        <Button variant={'primary'} type={'submit'} title={t('login')} />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: isTabletOrMobile ? 'column' : 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                            }}
                        >
                            <SwitchToRegister
                                onClick={() => {
                                    if (props.onRegister) {
                                        props.onRegister();
                                    } else {
                                        if (props.externalRegister) {
                                            window.open(props.externalRegister);
                                        } else {
                                            history.replace('/register', {
                                                from,
                                            });
                                        }
                                    }
                                }}
                            >
                                {t('register_switch')}
                            </SwitchToRegister>
                            <SwitchToReset
                                isTabletOrMobile={isTabletOrMobile}
                                onClick={() => {
                                    history.push('/reset', {
                                        from,
                                    });
                                }}
                            >
                                {t('forgot_password')}
                            </SwitchToReset>
                        </div>
                    </ActionsContainer>
                </Form>
            </LoginContainer>
        </LoginWrapper>
    );
};

interface LoginWrapperProps {
    mobile: boolean;
}

const LoginWrapper = styled.div<LoginWrapperProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: min(480px, 100vw);
    height: ${(props) => (props.mobile ? 'none' : 'calc(100vh - 80px)')};
`;

interface ILoginContainerInputProps {
    mobile: boolean;
}

const LoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background: ${(props: ILoginContainerInputProps) =>
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
    height: 200px;
`;

const ActionsContainer = styled.div`
    width: 60%;
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SwitchToReset = styled.span<{ isTabletOrMobile: boolean }>`
    font-size: 11px;
    line-height: 15px;
    margin-top: 5px;
    margin-left: ${(props) => (props.isTabletOrMobile ? '0' : props.theme.regularSpacing)};
    text-decoration: underline;
    text-align: center;
    cursor: pointer;
    color: #ccc;
`;

const SwitchToRegister = styled.span`
    font-size: 11px;
    line-height: 15px;
    margin-top: 5px;
    text-decoration: underline;
    text-align: center;
    cursor: pointer;
    color: #ccc;
`;
