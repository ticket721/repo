import styled from 'styled-components';
import React from 'react';

const NavbarMarginContainer = styled.div`
    margin-bottom: calc(70px + env(safe-area-inset-bottom));
    margin-bottom: calc(70px + constant(safe-area-inset-bottom));
`;

export const NavbarMargin = (Comp: React.ComponentType): React.FC => {
    return (props: any = {}) => {
        return (
            <NavbarMarginContainer>
                <Comp {...props} />
            </NavbarMarginContainer>
        );
    };
};
