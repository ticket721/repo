import React  from 'react';
import styled from 'styled-components';

const StatusBarPaddingContainer = styled.div`
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
`;

export const InvisibleStatusBarMargin = (Comp: React.ComponentType): React.FC => {
    return () => {
        return <>
            <StatusBarPaddingContainer>
                <Comp/>
            </StatusBarPaddingContainer>
        </>
    }
};
