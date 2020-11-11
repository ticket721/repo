import React from 'react';

import styled from 'styled-components';
import Icon from '../../../icon';

interface OnlineTagProps {
    online: string | null;
}

export const OnlineTag: React.FC<OnlineTagProps> = (props: OnlineTagProps) => {
    return (
        <Tag>
            <Icon icon={'live'} size={'16px'} color={'white'} />
            {props.online ? <Label>{props.online}</Label> : null}
        </Tag>
    );
};

const Tag = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${(props) => props.theme.badgeColor.hex};
    padding: 6px;
    border-radius: 12px;
`;

const Label = styled.span`
    margin-top: 2px;
    margin-left: 4px;
    color: white;
    font-size: 10px;
`;
