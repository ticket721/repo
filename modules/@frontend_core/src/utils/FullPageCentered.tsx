import React from 'react';
import styled from 'styled-components';

const FullPageContainer = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const FullPageCentered = (Comp: React.ComponentType<any>): React.FC => {
    return (props: any = {}) => {
        return (
            <>
                <FullPageContainer>
                    <Comp {...props} />
                </FullPageContainer>
            </>
        );
    };
};
