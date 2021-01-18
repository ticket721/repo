import styled from 'styled-components';
import React from 'react';

const DesktopNavbarContainer = styled.div`
    margin-top: 80px;
    padding: 50px 0;
`;

export const DesktopNavbarMargin = (Comp: React.ComponentType<any>): React.FC => {
    return (props: any = {}) => {
        return (
            <DesktopNavbarContainer>
                <Comp {...props} />
            </DesktopNavbarContainer>
        );
    };
};
