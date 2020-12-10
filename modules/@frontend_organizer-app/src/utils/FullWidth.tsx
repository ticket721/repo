import styled from 'styled-components';
import React from 'react';

const FullWidthContainer = styled.div`
    width: 100vw;
`;

export const FullWidth = (Comp: React.ComponentType<any>): React.FC => {
    return (props: any = {}) => {
        return (
            <FullWidthContainer>
                <Comp {...props} />
            </FullWidthContainer>
        );
    };
};
