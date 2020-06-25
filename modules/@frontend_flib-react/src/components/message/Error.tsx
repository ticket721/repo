import React from 'react';
import styled from 'styled-components';

export interface ErrorProps {
    message: string;
}

const ErrorText = styled.h1`
    color: ${(props) => props.theme.errorColor.hex};
`;

const CenteredDiv = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const Error: React.FC<ErrorProps> = (props: ErrorProps): JSX.Element => {
    return (
        <CenteredDiv>
            <ErrorText>{props.message}</ErrorText>
        </CenteredDiv>
    );
};

Error.defaultProps = {
    message: 'Error',
};

export default Error;
