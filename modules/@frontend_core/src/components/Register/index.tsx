import React, { useEffect }                          from 'react';
import { useFormik }                                 from 'formik';
import * as yup                                      from 'yup';
import { Button, TextInput, Icon, PasswordInput }    from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector }                  from 'react-redux';
import { AuthState, LocalRegister, ResetSubmission } from '../../redux/ducks/auth';
import { useHistory }                                from 'react-router';
import { AppState }                                  from '../../redux/ducks';
import styled                                        from 'styled-components';
import { ValidateEmail }                             from '../ValidateEmail';

const registerValidationSchema = yup.object().shape({
  email: yup.string()
    .email()
    .required('email required'),
  password: yup.string()
    .min(8, 'password is to short')
    .matches(/[a-z]/, 'you need to use at least one lowercase character')
    .matches(/[A-Z]/, 'you need to use at least one uppercase character')
    .matches(/[0-9]/, 'you need to use at least one numeric character')
    .matches(/[^A-Za-z0-9]/, 'you need to use at least one special character')
    .required('password is required'),
  username: yup.string()
    .min(4, 'username is to short (min. 4 characters)')
    .max(20, 'username is to long (max. 20 characters)')
    .required('username is required'),
});

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
                dispatch(ResetSubmission());
            }
        }

    }, [ auth.loading ]);

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
                          <Inputs>
                              <TextInput
                                name='email'
                                label='Email'
                                placeholder='Email address'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                error={formik.touched['email'] ? formik.errors['email'] : undefined}
                              />
                              <PasswordInput
                                name='password'
                                label='Password'
                                placeholder='Password'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                error={formik.touched['password'] ? formik.errors['password'] : undefined}
                              />
                              <TextInput
                                name='username'
                                label='Username'
                                placeholder='Username'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.username}
                                error={formik.touched['username'] ? formik.errors['username'] : undefined}
                              />
                          </Inputs>
                          {
                              auth.errors?.global ?
                                <Error>
                                    {auth.errors.global}
                                </Error> :
                                null
                          }
                          <ActionsContainer>
                              <Button variant='primary' type='submit' title='Register'/>
                              <SwitchToLogin
                                onClick={() => {history.push('/login')}}>
                                  Already registered ? Login here !
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
    height: 310px;
`;

const Error = styled.div`
    background-color: #F99;
    color: #FFF;
    padding: 15px;
    font-size: 15px;
    text-align: center;
    width: 100%;
    border-radius: 5px;
    margin-top: 35px;
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
    cursor: pointer;
    color: #CCC;
`;

