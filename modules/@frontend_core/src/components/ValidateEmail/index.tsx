import React  from 'react';
import styled from 'styled-components';
import { Icon }   from '@frontend/flib-react/lib/components';

export const ValidateEmail: React.FC = () => (
    <ValidateEmailContainer>
        <MailIcon
        icon='mail'
        color='#fff'
        size='80px' />
        <MessageFirstLine>We sent you a validation email !</MessageFirstLine>
        <span>Please check your mailbox.</span>
    </ValidateEmailContainer>
);

const ValidateEmailContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 15px;
    width: 450px;
    max-height: 100vh;
    background: linear-gradient(91.44deg,#241F33 0.31%,#1B1726 99.41%);
    padding: 60px;
    border-radius: 15px;
`;

const MessageFirstLine = styled.span`
    margin-bottom: 15px;
`;

const MailIcon = styled(Icon)`
    margin-bottom: 40px;
`;
