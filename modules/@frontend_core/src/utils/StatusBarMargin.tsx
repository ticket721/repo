import React from 'react';
import styled from 'styled-components';

const StatusBarMarginContainer = styled.div`
    position: fixed;
    top: 0;
    width: 100%;
    height: constant(safe-area-inset-top);
    height: env(safe-area-inset-top);
    background-color: rgba(0, 0, 0, 0);
    backdrop-filter: blur(16px);
    z-index: 9999;
`;

const StatusBarPaddingContainer = styled.div`
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
`;

export const StatusBarMargin = (Comp: React.ComponentType): React.FC => {
    return (props: any = {}) => {
        return (
            <>
                <StatusBarMarginContainer />
                <StatusBarPaddingContainer>
                    <Comp {...props} />
                </StatusBarPaddingContainer>
            </>
        );
    };
};
