import React  from 'react';
import styled from 'styled-components';
import { Formik, Form } from 'formik';
import * as yup from 'yup';

import * as validators from  './validators';
import NavBar          from '../../components/Navbar';
import { Button }      from '@frontend/flib-react/lib/components';

const newEventSchema = yup.object().shape({
  name: validators.name,
  description: validators.description
});
type FormValues = yup.InferType<typeof newEventSchema>;

const initialValues: FormValues = { name: '', description: '' };

const CreateEvent: React.FC = () => {
  return (
    <div className='CreateEvent' style={{ color: 'white' }}>
      <NavBar />
      <Container>
        <Formik
        initialValues={initialValues}
        onSubmit={(values: FormValues): void => { console.log('request to create event'); }}>
          <StyledForm>
            <Title>General Informations</Title>
            <Text>Phasellus malesuada laoreet sem, at tincidunt turpis molestie id.</Text>
            <TextInput name='name'/>
            <Textarea name='descritpion'/>
            <Button variant='primary' type='primary' onClick={() => { console.log('clicked') }} title='Create Event'/>
          </StyledForm>
        </Formik>
      </Container>
    </div>
  )
};

const Container = styled.div`
  margin: 170px 420px;
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TextInput = styled.input`
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  margin: 12px 0;
`;

const Textarea = styled.textarea`
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  margin: 12px 0;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 8px;
`;

const Subtitle = styled.h2`
  font-size: 14px;
  font-weight: bold;
  color: ${(props) => props.theme.textColor};
`;

const Text = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.textColorDark};
  padding-bottom: 20px;
`;

export default CreateEvent;
