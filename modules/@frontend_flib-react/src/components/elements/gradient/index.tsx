import * as React from 'react';
import styled from '../../../config/styled';

/**
 * Position as first child in HTML
 * to avoid z-index problems
 */

export interface GradientProps extends React.ComponentProps<any> {
    /**
     * Add 6.25% to the 1st value of the array
     * So the result looks like this
     * ['#EBBC16 6.25%', '#DB535B']
     */
    blurOnly?: boolean;
    values: string[];
}

const GradientBar = styled.div<GradientProps>`
    ${(props) =>
        !props.blurOnly &&
        `
    background: linear-gradient(180deg, transparent, ${props.gradientValues[0]} calc( 2 * ${
            props.theme.doubleSpacing
        }), ${props.gradientValues.slice(1).join(', ')});
  `}
    bottom: 0;
    content: '';
    height: 100%;
    position: absolute;
    right: 0;
    transform: matrix(-1, 0, 0, 1, 0, 0);
    user-select: none;
    width: ${(props) => (props.blurOnly ? '0px' : '8px')};
    z-index: 1;
`;

export const Gradient: React.FunctionComponent<GradientProps> = (props: GradientProps): JSX.Element => {
    return <GradientBar gradientValues={props.values} blurOnly={props.blurOnly} />;
};

export default Gradient;
