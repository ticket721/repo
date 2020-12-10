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
import { HapticsImpactStyle, useHaptics, HapticsNotificationType } from '../../hooks/useHaptics';
import { useKeyboardState } from '../../hooks/useKeyboardState';
import { getEnv } from '../../utils/getEnv';
import { event } from '../../tracking/registerEvent';

export interface RegisterProps {
    onLogin?: () => void;
    createEvent?: boolean;
}

export const Register: React.FC<RegisterProps> = (props: RegisterProps) => {
    const [t] = useTranslation(['registration', 'password_feedback']);
    const auth = useSelector((state: AppState): AuthState => state.auth);
    const dispatch = useDispatch();
    const haptics = useHaptics();
    const keyboard = useKeyboardState();
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

    const { from }: any = history.location.state || { from: '/' };

    useDeepEffect(() => {
        if (!auth.loading) {
            if (auth.submit && !auth.errors && auth.token) {
                haptics.notification({
                    type: HapticsNotificationType.SUCCESS,
                });
                history.replace(from);
                event('Auth', 'Register', 'User registered');
            } else {
                if (auth.errors) {
                    haptics.notification({
                        type: HapticsNotificationType.SUCCESS,
                    });
                    formik.setErrors(auth.errors);
                }
            }
        }
    }, [auth]);

    const isTabletOrMobile = useMediaQuery({ maxWidth: 900 });

    return (
        <RegisterWrapper mobile={isTabletOrMobile} keyboardHeight={keyboard.keyboardHeight}>
            <RegisterContainer mobile={isTabletOrMobile}>
                <IconContainer>
                    <Icon icon={'ticket721'} size={'40px'} color={'#fff'} />
                </IconContainer>
                <Form
                    onSubmit={(ev) => {
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
                        <Button
                            variant={
                                formik.isValid &&
                                formik.values.password !== '' &&
                                formik.values.passwordConfirmation !== '' &&
                                formik.values.email !== '' &&
                                formik.values.username !== ''
                                    ? 'primary'
                                    : 'disabled'
                            }
                            type={'submit'}
                            title={t('register')}
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
                            <SwitchToLogin
                                isTabletOrMobile={isTabletOrMobile}
                                onClick={() => {
                                    if (props.onLogin) {
                                        props.onLogin();
                                    } else {
                                        history.replace('/login', { from });
                                    }
                                }}
                            >
                                {t('login_switch')}
                            </SwitchToLogin>
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
                        </div>
                    </ActionsContainer>
                </Form>
            </RegisterContainer>
        </RegisterWrapper>
    );
};

interface RegisterWrapperProps {
    mobile: boolean;
    keyboardHeight: number;
}

const RegisterWrapper = styled.div<RegisterWrapperProps>`
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

interface IRegisterContainerInputProps {
    mobile: boolean;
}

const RegisterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
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
    height: 430px;
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

const ActionsContainer = styled.div`
    width: 50%;
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SwitchToLogin = styled.span<{ isTabletOrMobile: boolean }>`
    font-size: 10px;
    text-decoration: underline;
    margin-top: ${(props) => (props.isTabletOrMobile ? props.theme.regularSpacing : '5px')};
    white-space: nowrap;
    cursor: pointer;
    color: #ccc;
`;
