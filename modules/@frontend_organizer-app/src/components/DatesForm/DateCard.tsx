import React, { Fragment }          from 'react';
import styled                       from 'styled-components';
import { displayDate, displayTime } from '@frontend/core/lib/utils/date';
import { Icon }                     from '@frontend/flib-react/lib/components';
import { FormCard, FormCardProps }                 from '../FormCard';

export interface DateCardProps extends FormCardProps {
    beginDate: Date;
    endDate: Date;
    location: string;
}

export const DateCard: React.FC<DateCardProps> = (props: DateCardProps) => (
    <FormCard
    name={props.name}
    editable={props.editable}
    edit={props.edit}
    setEdit={props.setEdit}>
        {
            props.edit ?
                props.children :
                <Fragment>
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
    </FormCard>
);

const DateContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 65%;
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
