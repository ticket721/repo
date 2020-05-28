import React from 'react';
import { TopBarContainer } from '../TopBarContainer';
import styled from '@frontend/flib-react/lib/config/styled';

const ScrollWrapper = styled.div`
    position: absolute;
    z-index: 1;
    bottom: 80px;
    right: 0;
    overflow-y: scroll;
`;

const ContentView = styled.div`
    position: absolute;
    z-index: 0;
    width: 100%;
    overflow-y: auto;
    background: linear-gradient(91.44deg, #0a0812 0.31%, #120f1a 99.41%);
`;

export interface PageContainerProps extends React.ComponentProps<any> {
    topBarHeight?: string;
    topBar?: React.ReactElement;
    padding?: string;
}

export const PageContainer: React.FC<PageContainerProps> = (props: PageContainerProps) => {
    const { topBar, padding } = props;

    const topBarHeight = props.topBarHeight ? props.topBarHeight : '80px';

    return (
        <div className={'PageContainer'} style={{ height: '100vh' }}>
            {props.topBar ? <TopBarContainer height={topBarHeight}>{props.topBar}</TopBarContainer> : null}
            <ScrollWrapper>
                <div style={{ width: '1px' }} />
            </ScrollWrapper>
            <ContentView
                style={{
                    top: topBar ? topBarHeight : null,
                    height: `calc(100% ${topBar ? '- ' + topBarHeight : ''})`,
                    padding,
                }}
            >
                {props.children}
            </ContentView>
        </div>
    );
};
