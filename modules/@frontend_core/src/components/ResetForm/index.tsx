import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Icon, PasswordInput } from '@frontend/flib-react/lib/components';
import { useMediaQuery } from 'react-responsive';
import { useFormik } from 'formik';
import './locales';
import { useTranslation } from 'react-i18next';
import { resetFormValidationSchema } from './validation';
import { useLazyRequest } from '../../hooks/useLazyRequest';
import { ValidateResetPasswordResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/ValidateResetPasswordResponse.dto';
import { v4 } from 'uuid';
import { useDispatch } from 'react-redux';
import { PushNotification } from '../../redux/ducks/notifications';
import { useHistory } from 'react-router';
import { isNil } from 'lodash';

export const ResetForm: React.FC = () => {
    const [t] = useTranslation(['reset_form', 'password_feedback']);
    const [uuid] = useState(v4());
    const resetPasswordLazyRequest = useLazyRequest<ValidateResetPasswordResponseDto>('validateResetPassword', uuid);
    const dispatch = useDispatch();
    const history = useHistory();
    const token = new URLSearchParams(history.location.search).get('token');
    const formik = useFormik({
        initialValues: {
            password: '',
            password_confirmation: '',
        },
        validationSchema: resetFormValidationSchema,
        onSubmit: async (values) => {
            resetPasswordLazyRequest.lazyRequest([atob(token), values.password, v4()]);
        },
    });

    useEffect(() => {
        if (resetPasswordLazyRequest.response.error) {
            dispatch(PushNotification(t('reset_form_error'), 'error'));
        } else if (resetPasswordLazyRequest.response.data) {
            dispatch(PushNotification(t('reset_form_success'), 'success'));
            history.replace('/login');
        }
    }, [resetPasswordLazyRequest.response]);
    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });

    useEffect(() => {
        if (isNil(token)) {
            dispatch(PushNotification(t('invalid_token'), 'error'));
            history.replace('/');
        }
    }, [token]);

    return (
        <ResetFormWrapper mobile={isTabletOrMobile}>
            <ResetFormContainer mobile={isTabletOrMobile}>
                <IconContainer>
                    <Icon icon={'ticket721'} size={'40px'} color={'#fff'} />
                </IconContainer>
                <Form onSubmit={formik.handleSubmit}>
                    <Inputs>
                        <PasswordInput
                            name={'password'}
                            label={t('password_label')}
                            placeholder={t('password_placeholder')}
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
                            name={'password_confirmation'}
                            label={t('password_confirmation_label')}
                            placeholder={t('password_confirmation_placeholder')}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password_confirmation}
                            error={
                                formik.touched['passwordConfirmation'] && formik.errors['passwordConfirmation']
                                    ? t('different_password')
                                    : undefined
                            }
                        />
                    </Inputs>
                    <ActionsContainer>
                        <Button
                            variant={
                                formik.isValid &&
                                formik.values.password !== '' &&
                                formik.values.password_confirmation !== ''
                                    ? 'primary'
                                    : 'disabled'
                            }
                            type={'submit'}
                            title={t('reset')}
                        />
                    </ActionsContainer>
                </Form>
            </ResetFormContainer>
        </ResetFormWrapper>
    );
};

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

const IconContainer = styled.div`
    margin: 10px 0 5px;
`;

const ActionsContainer = styled.div`
    width: 80%;
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

interface ResetFormWrapperProps {
    mobile: boolean;
}

const ResetFormWrapper = styled.div<ResetFormWrapperProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${(props) => (props.mobile ? 'none' : '100vh')};
`;

interface IResetFormContainerInputProps {
    mobile: boolean;
}

const ResetFormContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 480px;
    background: ${(props: IResetFormContainerInputProps) =>
        props.mobile ? 'none' : 'linear-gradient(91.44deg, #241f33 0.31%, #1b1726 99.41%)'};
    padding: ${(props) => (props.mobile ? props.theme.regularSpacing : '40px')};
    border-radius: 15px;
`;
