import React, { useState } from 'react';
import styled              from 'styled-components';

import GeneralInfoForm       from '../../components/GeneralInfoForm';
import DatesForm             from '../../components/DatesForm';
import STEPS                 from './enums';
import CategorizeTicketsForm from '../../components/CategorizeTicketsForm';

const CreateEvent: React.FC = () => {
  const [step, setStep] = useState(STEPS.generalInfo);

  return (
    <Container>
      <Forms>
        {step >= STEPS.generalInfo && (
          <>
            <Title>General Informations</Title>
            <GeneralInfoForm setStep={setStep}/>
          </>)
        }
        {step >= STEPS.dates && (
          <>
            <Title>Event Dates</Title>
            <DatesForm setStep={setStep}/>
          </>)
        }
        {step >= STEPS.ticketCategories && (
          <>
            <Title>Ticket categories</Title>
            <CategorizeTicketsForm />
          </>
        )}
      </Forms>
    </Container>
  )
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Forms = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 600px;
  margin: 40px 0 20px 0;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 8px;
  text-align: left;
  width: 100%;
`;

export default CreateEvent;
