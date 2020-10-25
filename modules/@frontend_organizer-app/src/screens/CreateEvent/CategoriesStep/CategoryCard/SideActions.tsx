import { Icon } from '@frontend/flib-react/lib/components';
import React from 'react';
import styled from 'styled-components';

export interface SideActionsProps {
    edit: () => void;
    triggerDelete: () => void;
}

export const SideActions: React.FC<SideActionsProps> = ({ edit, triggerDelete }) => (
    <SideActionsContainer>
        <ActionIcon
        onClick={edit}>
            <Icon icon={'edit'} size={'16px'} color={'white'} />
        </ActionIcon>
        <ActionIcon
        onClick={triggerDelete}>
            <Icon icon={'delete'} size={'16px'} color={'white'} />
        </ActionIcon>
    </SideActionsContainer>
);

const SideActionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
`;

const ActionIcon = styled.div`
    margin-bottom: 12px;
    cursor: pointer;
    opacity: 0.2;

    transition: opacity 200ms;

    &:hover {
        opacity: 1;
    }
`;
