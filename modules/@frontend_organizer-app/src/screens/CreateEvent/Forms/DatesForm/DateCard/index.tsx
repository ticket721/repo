import React, { Fragment }          from 'react';
import styled                       from 'styled-components';
import { displayCompleteDate } from '@frontend/core/lib/utils/date';
import { Icon }                     from '@frontend/flib-react/lib/components';
import { FormCard, FormCardProps }                 from '../../FormCard';

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
                        <span>{displayCompleteDate(props.beginDate)}</span>
                        <Arrow
                            icon={'arrow'}
                            size={'15px'}
                            color={'rgba(255, 255, 255, 0.9)'}/>
                        <span>{displayCompleteDate(props.endDate)}</span>
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
    margin-bottom: ${props => props.theme.regularSpacing};

    & > span:first-child {
        margin-right: ${props => props.theme.regularSpacing};
    }
`;

const Arrow = styled(Icon)`
    margin: 0 20px;
`;

const Location = styled.div`
    display: flex;
    align-items: center;

    .label {
        margin-left: ${props => props.theme.regularSpacing};
    }
`;
