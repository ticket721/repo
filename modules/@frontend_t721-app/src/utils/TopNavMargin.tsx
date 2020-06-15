import styled from 'styled-components';
import React  from 'react';

const TopNavMarginContainer = styled.div`
    margin-top: 48px;
`;

export const TopNavMargin = (Comp: React.ComponentType): React.FC => {
    return () => {
        return <TopNavMarginContainer>
                <Comp/>
            </TopNavMarginContainer>
    }
};
