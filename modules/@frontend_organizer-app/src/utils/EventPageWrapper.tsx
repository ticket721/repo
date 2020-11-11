import React from 'react';
import styled from 'styled-components';

export const EventPageWrapper = (Component: React.ComponentType) => {
    return () => <Wrapper>
        <Component/>
    </Wrapper>;
}

const Wrapper = styled.div`
    margin-left: 350px;
    display: flex;
    justify-content: center;
`;
