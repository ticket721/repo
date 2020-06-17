import React, { Fragment } from 'react';
import styled              from 'styled-components';
import { displayDate, displayTime } from '@frontend/core/lib/utils/date';
import { Icon }                     from '@frontend/flib-react/lib/components';

export interface DateCardProps extends React.ComponentProps<any> {
    edit: boolean;
    editable: boolean;
    name: string;
    beginDate: Date;
    endDate: Date;
    location: string;
    setEdit: () => void;
}
export const DateCard: React.FC<DateCardProps> = (props: DateCardProps) => {
    return (
        <StyledDateCard
        editable={props.editable}
        edit={props.edit}
        onClick={() => props.editable && !props.edit ? props.setEdit() : null}>
            {
                props.edit ?
                    props.children :
                    <Fragment>
                        <Title>
                            <span>{props.name}</span>
                            {
                                props.editable && !props.edit ?
                                    <span className='edit'>edit</span> :
                                    null
                            }
                        </Title>
                        <DateContainer>
                            <Icon
                            icon={'calendar'}
                            size={'16px'} />
                            <div className={'displayed-date'}>
                                <span>{displayDate(props.beginDate)}</span>
                                <span>{displayTime(props.beginDate)}</span>
                            </div>
                            <Arrow
                            icon={'arrow'}
                            size={'15px'}
                            color={'rgba(255, 255, 255, 0.9)'}/>
                            <div className={'displayed-date'}>
                                <span>{displayDate(props.endDate)}</span>
                                <span>{displayTime(props.endDate)}</span>
                            </div>
                        </DateContainer>
                        <Location>
                            <Icon
                            icon={'pin'}
                            size={'16px'} />
                            <span className={'label'}>{props.location}</span>
                        </Location>
                    </Fragment>
            }
        </StyledDateCard>
    )
};

const StyledDateCard = styled.div<{ editable: boolean, edit: boolean }>`
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

    &:hover {
        background-color: ${props => props.editable || props.edit ? props.theme.darkBg : props.theme.darkerBg};
    }
`;

const Title = styled.div`
    display: flex;
    justify-content: space-between;
    top: 10px;
    right: 10px;
    margin-bottom: ${props => props.theme.regularSpacing};
    text-transform: uppercase;

    span:first-child {
        color: rgba(255, 255,255, 0.4);
    }

    .edit {
        cursor: pointer;
        color: rgba(255, 255,255, 0.6);
    }
`;

const DateContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${props => props.theme.regularSpacing};

    & > span:first-child {
        margin-right: ${props => props.theme.regularSpacing};
    }

    .displayed-date {
        display: flex;
        flex-direction: column;

        & > span:first-child {
            margin-bottom: ${props => props.theme.smallSpacing};
        }
    }
`;

const Arrow = styled(Icon)`
    margin: 0 ${props => props.theme.biggerSpacing};
`;

const Location = styled.div`
    display: flex;
    align-items: center;

    .label {
        margin-left: ${props => props.theme.regularSpacing};
    }
`;
