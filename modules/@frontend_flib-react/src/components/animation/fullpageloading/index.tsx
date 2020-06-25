import * as React from 'react';
import Lottie from 'react-lottie';
import animationData from './FullPageLoading.json';

export interface FullPageLoadingProps extends React.ComponentProps<any> {
    width?: number;
    height?: number;
}

export const FullPageLoading: React.FunctionComponent<FullPageLoadingProps> = (props: FullPageLoadingProps): any => {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Lottie
                options={{
                    loop: true,
                    autoplay: true,
                    animationData,
                }}
                width={props.width}
                height={props.height}
            />
        </div>
    );
};

FullPageLoading.defaultProps = {
    width: 250,
    height: 250,
};

export default FullPageLoading;
