import React, { useState } from 'react';
import styled              from 'styled-components';

import GeneralInfoForm from '../../components/GeneralInfoForm';
import DatesForm from '../../components/DatesForm';
import STEPS     from './enums';

const CreateEvent: React.FC = () => {
  const [step, setStep] = useState(STEPS.generalInfo);
  return (
    <Container>
      {step >= STEPS.generalInfo && (
        <>
          <Title>General Informations</Title>
          <GeneralInfoForm setStep={setStep}/>
        </>)
      }
      {step >= STEPS.dates && (
        <>
          <Title>Event Dates</Title>
          <DatesForm  setStep={setStep}/>
        </>)
      }
    </Container>
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
