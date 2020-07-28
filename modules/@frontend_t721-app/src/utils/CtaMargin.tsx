import styled from 'styled-components';
import React  from 'react';

const CtaMarginContainer = styled.div`
    margin-bottom: calc(80px + ${props => props.theme.regularSpacing} + env(safe-area-inset-bottom));
    margin-bottom: calc(80px + ${props => props.theme.regularSpacing} + constant(safe-area-inset-bottom));
`;

export const CtaMargin = (Comp: React.ComponentType): React.FC => {
    return () => {
        return <CtaMarginContainer>
                <Comp/>
            </CtaMarginContainer>
    }
};
