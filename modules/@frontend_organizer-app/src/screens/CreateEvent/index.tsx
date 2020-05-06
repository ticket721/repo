import React  from 'react';
import styled from 'styled-components';
import NavBar          from '../../components/Navbar';
import GeneralInfoForm from '../../components/GeneralInfoForm';

const CreateEvent: React.FC = () => {
  return (
    <div className='CreateEvent' style={{ color: 'white' }}>
      <NavBar />
      <Container>
        <Title>General Informations</Title>
        <GeneralInfoForm />
      </Container>
    </div>
  )
};

const Container = styled.div`
  margin: 170px 420px;
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
export default CreateEvent;
