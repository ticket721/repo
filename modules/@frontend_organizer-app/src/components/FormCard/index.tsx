import React from 'react';
import styled              from 'styled-components';

export interface FormCardProps extends React.ComponentProps<any> {
    edit: boolean;
    error?: boolean;
    editable: boolean;
    name: string;
    setEdit: () => void;
}

export const FormCard: React.FC<FormCardProps> = (props: FormCardProps) => (
    <StyledFormCard
    error={props.error}
    editable={props.editable}
    edit={props.edit}
    onClick={() => props.editable && !props.edit ? props.setEdit() : null}>
        {
            !props.edit ?
                <Title>
                    <span>{props.name}</span>
                    {
                        props.editable && !props.edit ?
                            <span className='edit'>edit</span> :
                            null
                    }
                </Title> :
                null
        }
        {
            props.children
        }
    </StyledFormCard>
);

const StyledFormCard = styled.div<{ editable: boolean, edit: boolean, error: boolean }>`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => props.theme.biggerSpacing};
    background-color: ${props => props.edit ? props.theme.darkBg : props.theme.darkerBg};
    font-size: 13px;
    font-weight: bold;
    transition: background-color 300ms;
    border: ${props => props.error ? `1px ${props.theme.errorColor.hex} solid` : 'none'};

    &:hover {
        background-color: ${props => props.editable || props.edit ? props.theme.darkBg : props.theme.darkerBg};
    }
`;

const Title = styled.div`
    display: flex;
    justify-content: space-between;
    top: 10px;
    right: 10px;
    margin-bottom: ${props => props.theme.biggerSpacing};
    text-transform: uppercase;

    span:first-child {
        color: rgba(255, 255,255, 0.9);
    }

    .edit {
        cursor: pointer;
        font-size: 12px;
        color: rgba(255, 255,255, 0.6);
    }
`;
