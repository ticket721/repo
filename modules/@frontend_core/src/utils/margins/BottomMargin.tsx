import styled from 'styled-components';
import React from 'react';

const BottomMarginContainer = styled.div`
    margin-bottom: env(safe-area-inset-bottom);
    margin-bottom: constant(safe-area-inset-bottom);
`;

export const BottomMargin = (Comp: React.ComponentType<any>): React.FC => {
    return (props: any = {}) => {
        return (
            <BottomMarginContainer>
                <Comp {...props} />
            </BottomMarginContainer>
        );
    };
};
