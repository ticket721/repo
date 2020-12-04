import styled from 'styled-components';
import React from 'react';

const DesktopNavbarContainer = styled.div`
    margin-top: 80px;
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
