import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import { Button, TextInput, Icon, PasswordInput } from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { AppState } from '../../redux/ducks';
import { AuthState, LocalLogin, ResetSubmission } from '../../redux/ducks/auth';
import styled from 'styled-components';
import { loginValidationSchema } from './validation';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

import './locales';

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
    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });

    const { from }: any = history.location.state || { from: '/' };

    useEffect(() => {
        return () => dispatch(ResetSubmission());
    }, []);

    useEffect(() => {
        if (!auth.loading) {
            if (auth.user?.validated || (auth.submit && !auth.errors && auth.token)) {
                history.replace(from);
            } else {
                if (auth.errors) {
                    formik.setErrors(auth.errors);
                }
            }
        }
    }, [auth.loading, auth.user]);

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
                        <SwitchToRegister
                            onClick={() => {
                                if (props.onRegister) {
                                    props.onRegister();
                                } else {
                                    if (props.externalRegister) {
                                        window.open(props.externalRegister);
                                    } else {
                                        history.replace('/register');
                                    }
                                }
                            }}
                        >
                            {t('register_switch')}
                        </SwitchToRegister>
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
    height: ${props => props.mobile ? 'none' : '100vh'};
`;

interface ILoginContainerInputProps {
    mobile: boolean;
}

const LoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 480px;
    background: ${(props: ILoginContainerInputProps) =>
        props.mobile ? 'none' : 'linear-gradient(91.44deg, #241f33 0.31%, #1b1726 99.41%)'};
    padding: ${props => props.mobile ? props.theme.regularSpacing : '40px'};
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

const SwitchToRegister = styled.span`
    font-size: 11px;
    line-height: 15px;
    margin-top: 5px;
    text-decoration: underline;
    text-align: center;
    cursor: pointer;
    color: #ccc;
`;
