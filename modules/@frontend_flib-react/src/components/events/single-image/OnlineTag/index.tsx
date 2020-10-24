import React from 'react';

import styled from 'styled-components';
import Icon from '../../../icon';

interface OnlineTagProps {
    online: string;
}

export const OnlineTag: React.FC<OnlineTagProps> = (props: OnlineTagProps) => {
    return (
        <Tag>
            <Icon icon={'live'} size={'12px'} color={'white'} />
            <Label>{props.online}</Label>
        </Tag>
    );
};

const Tag = styled.div`
    display: flex;
    align-items: center;
    background-color: ${(props) => props.theme.badgeColor.hex};
    padding: 4px 8px;
    border-radius: 12px;
`;

const Label = styled.span`
    margin-top: 2px;
    margin-left: 4px;
    color: white;
    font-size: 10px;
`;
