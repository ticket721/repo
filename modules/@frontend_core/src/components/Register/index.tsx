import React, { useEffect } from 'react';
import { useFormik }                                 from 'formik';
import { Button, TextInput, Icon, PasswordInput }    from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector }                  from 'react-redux';
import { AuthState, LocalRegister, ResetSubmission } from '../../redux/ducks/auth';
import { useHistory }                                from 'react-router';
import { AppState }                                  from '../../redux/ducks';
import styled                                        from 'styled-components';
import { ValidateEmail }                             from '../ValidateEmail';
import { useTranslation }                            from 'react-i18next';
import { registerValidationSchema }                  from './validation';
import './locales';
import { getPasswordStrength }                       from '@common/global';

export const Register: React.FC = () => {
    const auth = useSelector((state: AppState): AuthState => state.auth);
    const dispatch = useDispatch();
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            username: '',
        },
        validationSchema: registerValidationSchema,
        onSubmit: async (values) => {
            dispatch(LocalRegister(values.email, values.password, values.username, 'fr'));
        }
    });
    const history = useHistory();

    useEffect(() => {
        return () => dispatch(ResetSubmission());
    }, []);

    useEffect(() => {
        if (!auth.loading) {
            if (auth.submit && auth.errors) {
                formik.setErrors(auth.errors);
            }
        }

    }, [ auth.loading ]);

    const [ t ] = useTranslation(['registration', 'password-feedback']);

    return (
        <RegisterWrapper>
            {
                !auth.loading && auth.submit && !auth.errors ?
                  <ValidateEmail /> :
                  <RegisterContainer>
                      <IconContainer>
                          <Icon
                            icon='ticket721'
                            size='40px'
                            color='#fff' />
                      </IconContainer>
                      <Form onSubmit={formik.handleSubmit}>
                          {
                              auth.errors?.global ?
                                <Error>
                                    <CrossIcon
                                      icon='cross'
                                      color='#fff'
                                      size='20px' />
                                    {auth.errors.global}
                                </Error> :
                                null
                          }
                          <Inputs>
                              <TextInput
                                name='email'
                                label={t('email_label')}
                                placeholder={t('email_placeholder')}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                error={formik.touched['email'] ? t(formik.errors['email']) : undefined}
                              />
                              {
                                  console.log(formik.errors['password'])
                              }
                              <PasswordInput
                                name='password'
                                label={t('password_label')}
                                placeholder={t('password_placeholder')}
                                score={getPasswordStrength(formik.values.password).score}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                error={formik.touched['password'] && formik.errors['password'] ?
                                  t('password-feedback:' + formik.errors['password']) : undefined}
                              />
                              <TextInput
                                name='username'
                                label={t('username_label')}
                                placeholder={t('username_placeholder')}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.username}
                                error={formik.touched['username'] ? t(formik.errors['username']) : undefined}
                              />
                          </Inputs>
                          <ActionsContainer>
                              <Button variant='primary' type='submit' title={t('register')}/>
                              <SwitchToLogin
                                onClick={() => {history.push('/login')}}>
                                  {t('login_switch')}
                              </SwitchToLogin>
                          </ActionsContainer>
                      </Form>
                  </RegisterContainer>
            }
        </RegisterWrapper>
    )
};

const RegisterWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;

const RegisterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 480px;
    max-height: 100vh;
    background: linear-gradient(91.44deg,#241F33 0.31%,#1B1726 99.41%);
    padding: 40px;
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
    height: 345px;
`;

const Error = styled.div`
    display: flex;
    align-items: center;
    background-color: #C91D31;
    color: #FFF;
    padding: 10px 15px 8px;
    font-size: 15px;
    line-height: 20px;
    font-weight: 500;
    border-radius: 5px;
    margin-bottom: 30px;
`;

const CrossIcon = styled(Icon)`
    margin: 0 15px 5px 0;
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
    color: #CCC;
`;

