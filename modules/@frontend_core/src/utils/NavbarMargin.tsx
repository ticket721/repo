import styled from 'styled-components';
import React from 'react';

const NavbarMarginContainer = styled.div`
    margin-bottom: 70px;
`;

export const NavbarMargin = (Comp: React.ComponentType): React.FC => {
    return () => {
        return (
            <NavbarMarginContainer>
                <Comp />
            </NavbarMarginContainer>
        );
    };
};
