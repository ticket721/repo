import 'react-placeholder/lib/reactPlaceholder.css';
import React from 'react';
import ReactPlaceholder from 'react-placeholder';
import { Props } from 'react-placeholder/lib/ReactPlaceholder';

export const Skeleton: React.FunctionComponent<Props> = (props: Props): JSX.Element => {
    return <ReactPlaceholder {...props}>{props.children}</ReactPlaceholder>;
};

export default Skeleton;
