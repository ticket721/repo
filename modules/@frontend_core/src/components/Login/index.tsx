import React from 'react';
import { useFormik } from 'formik';
import { Button, Icon, PasswordInput, TextInput } from '@frontend/flib-react/lib/components';
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
import { HapticsImpactStyle, useHaptics, HapticsNotificationType } from '../../utils/useHaptics';
import { useKeyboardState } from '../../utils/useKeyboardState';
import { getEnv } from '../../utils/getEnv';
import { event } from '../../tracking/registerEvent';

export interface LoginProps {
    onRegister?: () => void;
    externalRegister?: string;
    createEvent?: boolean;
}

export const Login: React.FC<LoginProps> = (props: LoginProps) => {
    const [t] = useTranslation('login');
    const auth = useSelector((state: AppState): AuthState => state.auth);
    const history = useHistory();
    const dispatch = useDispatch();
    const haptics = useHaptics();
    const keyboard = useKeyboardState();
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
                haptics.notification({
                    type: HapticsNotificationType.SUCCESS,
                });
                event('Auth', 'Login', 'User logged in');
            } else {
                if (auth.errors) {
                    haptics.notification({
                        type: HapticsNotificationType.ERROR,
                    });
                    formik.setErrors(auth.errors);
                }
            }
        }
    }, [auth]);

    return (
        <LoginWrapper mobile={isTabletOrMobile} keyboardHeight={keyboard.keyboardHeight}>
            <LoginContainer mobile={isTabletOrMobile}>
                <IconContainer>
                    <Icon icon={'ticket721'} size={'40px'} color={'#fff'} />
                </IconContainer>
                <Form
                    onSubmit={(ev: any) => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        formik.handleSubmit(ev);
                    }}
                >
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
                        <Button
                            variant={
                                formik.isValid && formik.values.email !== '' && formik.values.password !== ''
                                    ? 'primary'
                                    : 'disabled'
                            }
                            type={'submit'}
                            title={t('login')}
                        />
                        <div
                            style={{
                                width: '200%',
                                display: 'flex',
                                flexDirection: isTabletOrMobile ? 'column' : 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                            }}
                        >
                            <SwitchToRegister
                                isTabletOrMobile={isTabletOrMobile}
                                onClick={() => {
                                    haptics.impact({
                                        style: HapticsImpactStyle.Light,
                                    });
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
                            {props.createEvent ? (
                                <SwitchToReset
                                    isTabletOrMobile={isTabletOrMobile}
                                    onClick={() => {
                                        haptics.impact({
                                            style: HapticsImpactStyle.Light,
                                        });
                                        window.location = getEnv().REACT_APP_EVENT_CREATION_LINK;
                                    }}
                                >
                                    {t('create_event')}
                                </SwitchToReset>
                            ) : null}
                            <SwitchToReset
                                isTabletOrMobile={isTabletOrMobile}
                                onClick={() => {
                                    haptics.impact({
                                        style: HapticsImpactStyle.Light,
                                    });
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
    keyboardHeight: number;
}

const LoginWrapper = styled.div<LoginWrapperProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    padding-bottom: ${(props) => props.keyboardHeight}px;
    @media screen and (min-width: 900px) {
        width: 480px;
    }
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
    width: 50%;
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SwitchToReset = styled.span<{ isTabletOrMobile: boolean }>`
    font-size: 11px;
    line-height: 15px;
    margin-left: ${(props) => (props.isTabletOrMobile ? '0' : props.theme.regularSpacing)};
    margin-top: ${(props) => (props.isTabletOrMobile ? props.theme.regularSpacing : '5px')};
    text-decoration: underline;
    text-align: center;
    cursor: pointer;
    color: #ccc;
`;

const SwitchToRegister = styled.span<{ isTabletOrMobile: boolean }>`
    font-size: 11px;
    line-height: 15px;
    margin-top: ${(props) => (props.isTabletOrMobile ? props.theme.regularSpacing : '5px')};
    text-decoration: underline;
    text-align: center;
    cursor: pointer;
    color: #ccc;
`;
