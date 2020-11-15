import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Icon, TextInput } from '@frontend/flib-react/lib/components';
import { useMediaQuery } from 'react-responsive';
import { useFormik } from 'formik';
import './locales';
import { useTranslation } from 'react-i18next';
import { resetValidationSchema } from './validation';
import { useLazyRequest } from '../../hooks/useLazyRequest';
import { ResetPasswordResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/ResetPasswordResponse.dto';
import { v4 } from 'uuid';
import { getEnv } from '../../utils/getEnv';
import { useDispatch } from 'react-redux';
import { PushNotification } from '../../redux/ducks/notifications';
import { useHistory } from 'react-router';

export const Reset: React.FC = () => {
    const [t] = useTranslation('reset');
    const [uuid] = useState(v4());
    const resetPasswordLazyRequest = useLazyRequest<ResetPasswordResponseDto>('resetPassword', uuid);
    const dispatch = useDispatch();
    const history = useHistory();
    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: resetValidationSchema,
        onSubmit: async (values) => {
            console.log(values);
            resetPasswordLazyRequest.lazyRequest([values.email, `${getEnv().REACT_APP_SELF}/reset-form`, v4()]);
        },
    });
    useEffect(() => {
        if (resetPasswordLazyRequest.response.error) {
            dispatch(PushNotification(t('reset_email_error'), 'error'));
        } else if (resetPasswordLazyRequest.response.data) {
            dispatch(PushNotification(t('reset_email_sent'), 'success'));
            history.goBack();
        }
    }, [resetPasswordLazyRequest.response]);
    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });

    return (
        <ResetWrapper mobile={isTabletOrMobile}>
            <ResetContainer mobile={isTabletOrMobile}>
                <IconContainer>
                    <Icon icon={'ticket721'} size={'40px'} color={'#fff'} />
                </IconContainer>
                <Form onSubmit={formik.handleSubmit}>
                    <Inputs>
                        <ResetInstructions>{t('instructions')}</ResetInstructions>
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
                        <StyledButton variant={'danger'} title={t('cancel')} onClick={() => history.goBack()} />
                        <StyledButton
                            variant={formik.isValid && formik.values.email !== '' ? 'primary' : 'disabled'}
                            type={'submit'}
                            title={t('reset')}
                        />
                    </ActionsContainer>
                </Form>
            </ResetContainer>
        </ResetWrapper>
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
    height: 175px;
`;

const IconContainer = styled.div`
    margin: 10px 0 5px;
`;

const ActionsContainer = styled.div`
    width: 100%;
    margin-top: 25px;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const StyledButton = styled(Button)`
    margin: ${(props) => props.theme.regularSpacing};
`;

const ResetInstructions = styled.span`
    width: 90%;
    margin-left: 5%;
    text-align: center;
    line-height: 150%;
    margin-bottom: ${(props) => props.theme.regularSpacing};
`;

interface ResetWrapperProps {
    mobile: boolean;
}

const ResetWrapper = styled.div<ResetWrapperProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${(props) => (props.mobile ? 'none' : '100vh')};
`;

interface IResetContainerInputProps {
    mobile: boolean;
}

const ResetContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 480px;
    background: ${(props: IResetContainerInputProps) =>
        props.mobile ? 'none' : 'linear-gradient(91.44deg, #241f33 0.31%, #1b1726 99.41%)'};
    padding: ${(props) => (props.mobile ? props.theme.regularSpacing : '40px')};
    border-radius: 15px;
`;
