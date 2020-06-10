import * as React from 'react';
import styled from '../../config/styled';
import '../../../static/t721-icons/t721-icons.css';

import { Icon }      from '../icon';
import { keyframes } from 'styled-components';

export interface LoaderProps extends React.ComponentProps<any> {
    size: string;
}



export const Loader: React.FunctionComponent<LoaderProps & { className?: string }> = (props: LoaderProps): JSX.Element => {
  return (
    <AnimatedLoader size={props.size}/>
  );
};

const shape = keyframes`
    0% {
        border-radius: 22% 78% 63% 37% / 57% 48% 52% 43%;
        transform: scale(0.01);
    }
    20% {
        border-radius: 67% 33% 51% 49% / 60% 48% 52% 40%;
        transform: scale(0.3);
    }
    40% {
        border-radius: 67% 33% 51% 49% / 40% 72% 28% 60%;
        transform: scale(0.8);
    }
    50% {
        transform: scale(1);
    }
    60% {
      border-radius: 37% 63% 45% 55% / 40% 61% 39% 60%;
      transform: scale(0.8);
    }
    80% {
        border-radius: 49% 51% 45% 55% / 22% 24% 76% 78%;
        transform: scale(0.3);
    }
    100% {
        border-radius: 22% 78% 63% 37% / 57% 48% 52% 43%;
        transform: scale(0.01);
    }
`;

const AnimatedLoader = styled.div<LoaderProps>`
    border: 1px solid #FFF;
    width: ${(props) => props.size};
    padding-top: ${(props) => props.size};
    background: linear-gradient(260deg, ${props => props.theme.primaryColor.hex}, ${props => props.theme.primaryColorGradientEnd.hex});
    animation: ${shape} 2s linear infinite;
`;

Icon.defaultProps = {
  size: '24px',
};

export default Icon;
