import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { v4 } from 'uuid';
import { useDispatch } from 'react-redux';
import { Button, TextInput, Icon } from '@frontend/flib-react/lib/components';
import { ResetPasswordResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/ResetPasswordResponse.dto';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { resetPasswordValidationSchema } from './validation';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import './locales';
import { useLazyRequest } from '../../hooks/useLazyRequest';
import { getEnv } from '../../utils/getEnv';
import { PushNotification } from '../../redux/ducks/notifications';

export const ResetPassword = () => {
    const [t] = useTranslation('reset_password');
    const history = useHistory();
    const dispatch = useDispatch();
    const [uuid] = useState<string>(v4() + '@reset-password');
    const { lazyRequest: resetPassword, response } = useLazyRequest<ResetPasswordResponseDto>('resetPassword', uuid);
    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: resetPasswordValidationSchema,
        onSubmit: async (value) => {
            resetPassword([value.email.toLowerCase(), `${getEnv().REACT_APP_SELF}/validate-password`]);
        },
    });
    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });

    useEffect(() => {
        if (response.data && response.called) {
            dispatch(PushNotification(t('email_sent'), 'success'));
        }
    }, [response.data, response.called]);

    return (
        <ResetPasswordWrapper mobile={isTabletOrMobile}>
            <ResetPasswordContainer mobile={isTabletOrMobile}>
                <IconContainer>
                    <Icon icon={'ticket721'} size={'40px'} color={'#fff'} />
                </IconContainer>
                <Form onSubmit={formik.handleSubmit}>
                    <span>{t('description')}</span>
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
                    </Inputs>
                    <ActionsContainer>
                        <Button variant={'primary'} type={'submit'} title={t('send_reset_email')} />
                        <GoBack
                            onClick={() => {
                                history.replace('/login');
                            }}
                        >
                            {t('go_back')}
                        </GoBack>
                    </ActionsContainer>
                </Form>
            </ResetPasswordContainer>
        </ResetPasswordWrapper>
    );
};

interface ResetPasswordWrapperProps {
    mobile: boolean;
}

const ResetPasswordWrapper = styled.div<ResetPasswordWrapperProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${(props) => (props.mobile ? 'none' : '100vh')};
`;

interface IResetPasswordContainerInputProps {
    mobile: boolean;
}

const ResetPasswordContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 480px;
    background: ${(props: IResetPasswordContainerInputProps) =>
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
`;

const ActionsContainer = styled.div`
    width: 60%;
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const GoBack = styled.span`
    font-size: 11px;
    line-height: 15px;
    margin-top: 5px;
    text-decoration: underline;
    text-align: center;
    cursor: pointer;
    color: #ccc;
`;
