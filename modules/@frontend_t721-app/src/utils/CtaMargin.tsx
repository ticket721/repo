import styled from 'styled-components';
import React  from 'react';

const CtaMarginContainer = styled.div`
    margin-bottom: calc(80px + ${props => props.theme.regularSpacing});
`;

export const CtaMargin = (Comp: React.ComponentType): React.FC => {
    return () => {
        return <CtaMarginContainer>
                <Comp/>
            </CtaMarginContainer>
    }
};
