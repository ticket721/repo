import React, { PropsWithChildren } from 'react';

export interface TopBarContainerProps {
    height: string;
}

export const TopBarContainer: React.FC<PropsWithChildren<TopBarContainerProps>> = (
    props: PropsWithChildren<TopBarContainerProps>,
) => (
    <div
        style={{
            overflow: 'hidden',
            height: props.height,
            width: '100%',
        }}
    >
        {props.children}
    </div>
);
