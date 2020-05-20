import React, { useEffect } from 'react';
import { useFormik }                  from 'formik';
import * as yup                       from 'yup';
import { Button, TextInput, Icon, PasswordInput }          from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector }   from 'react-redux';
import { useHistory }                 from 'react-router';
import { AppState }                               from '../../redux/ducks';
import { AuthState, LocalLogin, ResetSubmission } from '../../redux/ducks/auth';
import styled                                     from 'styled-components';

const loginValidationSchema = yup.object().shape({
    email: yup.string().email().required('email required'),
    password: yup.string().required('password is required'),
});

export const Login: React.FC = () => {
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
          dispatch(LocalLogin(values.email, values.password));
        }
    });

    const { from }: any = history.location.state || { from: '/' };

    useEffect(() => {
        return () => dispatch(ResetSubmission());
    }, []);

    useEffect(() => {
      if (!auth.loading) {
          if (auth.submit && !auth.errors) {
              history.push(from);
          } else {
              formik.setErrors(auth.errors);
          }
      }
    }, [ auth.loading ]);

    return (
          <LoginWrapper>
              <LoginContainer>
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
                      </Inputs>
                      {
                          auth.errors?.global ?
                            <Error>
                                {auth.errors.global}
                            </Error> :
                            null
                      }
                      <ActionsContainer>
                          <Button variant='primary' type='submit' title='Login'/>
                          <SwitchToRegister
                            onClick={() => {history.push('/register')}}>
                              First time using the app ? Register here !
                          </SwitchToRegister>
                      </ActionsContainer>
                  </Form>
              </LoginContainer>
          </LoginWrapper>
    )
};

const LoginWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;

const LoginContainer = styled.div`
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
    height: 200px;
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

const SwitchToRegister = styled.span`
    font-size: 10px;
    margin-top: 5px;
    text-decoration: underline;
    cursor: pointer;
    color: #CCC;
`;
