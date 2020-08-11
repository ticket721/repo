import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { v4 } from 'uuid';
import { Button, PasswordInput, Icon } from '@frontend/flib-react/lib/components';
import { ValidateResetPasswordResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/ValidateResetPasswordResponse.dto';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { validateResetPasswordValidationSchema } from './validation';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { getPasswordStrength } from '@common/global';
import { useLazyRequest } from '../../hooks/useLazyRequest';
import { b64Decode } from '@common/global';
import { useDispatch } from 'react-redux';
import { PushNotification } from '../../redux/ducks/notifications';
import './locales';


export const ValidateResetPassword = () => {
    const [t] = useTranslation('validate_reset_password');
    const history = useHistory();
    const dispatch = useDispatch();
    const [uuid] = useState<string>(v4() + '@validate-reset-password');
    const { lazyRequest: resetPassword, response } = useLazyRequest<ValidateResetPasswordResponseDto>('validateResetPassword', uuid);

    const parsedQuery = new URLSearchParams(history.location.search);

    const formik = useFormik({
        initialValues: {
            password: '',
            passwordConfirmation: '',
        },
        validationSchema: validateResetPasswordValidationSchema,
        onSubmit: async (value) => {
            resetPassword([b64Decode(parsedQuery.get('token')), value.password]);
        },
    });
    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });

    useEffect(() => {
        if (response.data) {
            dispatch(PushNotification(t('email_confirmed'), 'success'));
            history.push('/');
        }
    }, [response.data]);

    useEffect(() => {
        if (response.error) {
            console.log(response.error);
            if (response.error.statusCode === 500) {
                dispatch(PushNotification(t('internal_server_error'), 'error'));
            }
            dispatch(PushNotification(t(response.error), 'error'));
            history.push('/login');
        }
    }, [response.error]);

    return (
        <ValidateResetPasswordWrapper mobile={isTabletOrMobile}>
            <ValidateResetPasswordContainer mobile={isTabletOrMobile}>
                <IconContainer>
                    <Icon icon={'ticket721'} size={'40px'} color={'#fff'} />
                </IconContainer>
                <Form onSubmit={formik.handleSubmit}>
                    <span>{t('description')}</span>
                    <Inputs>
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
                    </Inputs>
                    <ActionsContainer>
                        <Button variant={'primary'} type={'submit'} title={t('reset_password')} />
                    </ActionsContainer>
                </Form>
            </ValidateResetPasswordContainer>
        </ValidateResetPasswordWrapper>
    );
};

interface ValidateResetPasswordWrapperProps {
    mobile: boolean;
}

const ValidateResetPasswordWrapper = styled.div<ValidateResetPasswordWrapperProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${(props) => (props.mobile ? 'none' : '100vh')};
`;

interface IValidateResetPasswordContainerInputProps {
    mobile: boolean;
}

const ValidateResetPasswordContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 480px;
    background: ${(props: IValidateResetPasswordContainerInputProps) =>
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
    margin-top: ${(props) => props.theme.biggerSpacing};
    height: 210px;
`;

const ActionsContainer = styled.div`
    width: 60%;
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;
