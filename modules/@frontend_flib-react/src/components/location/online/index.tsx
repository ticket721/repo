import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface OnlineLocationProps extends React.ComponentProps<any> {
    label: string;
    getOnlineLocation: () => void;
}

const Item = styled.li`
    align-items: center;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    font-size: 13px;
    font-weight: 500;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
    transition: background-color 300ms ease;
    width: 100%;
`;

const LocationIcon = styled(Icon)`
    margin-right: ${(props) => props.theme.smallSpacing};
    position: relative;
    top: -2px;
`;

export const OnlineLocation: React.FunctionComponent<OnlineLocationProps> = (
    props: OnlineLocationProps,
): JSX.Element => {
    return (
        <Item onClick={props.getOnlineLocation}>
            <LocationIcon icon={'live'} size={'14px'} color={'red'} />
            {props.label}
        </Item>
    );
};

OnlineLocation.defaultProps = {
    mainColor: '#079CF0',
};

export default OnlineLocation;
