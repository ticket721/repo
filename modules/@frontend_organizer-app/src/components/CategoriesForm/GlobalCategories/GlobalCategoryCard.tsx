import React, { Fragment } from 'react';
import styled                       from 'styled-components';
import { FormCard, FormCardProps }  from '../../FormCard';
import { Icon }                     from '@frontend/flib-react/lib/components';
import { displayDate, displayTime } from '@frontend/core/lib/utils/date';


interface GlobalCategoryCardProps extends FormCardProps {
    price: string;
    saleBegin: Date;
    saleEnd: Date;
    seats: number;
}

export const GlobalCategoryCard: React.FC<GlobalCategoryCardProps> = (props: GlobalCategoryCardProps) => (
    <FormCard
    name={props.name}
    editable={props.editable}
    edit={props.edit}
    setEdit={props.setEdit}>
        {
            props.edit ?
                props.children :
                <Fragment>
                    <Price>
                        {props.price}€
                    </Price>
                    <Quantity>
                        {props.seats} passes available
                    </Quantity>
                    <SaleDates>
                        <Icon
                            icon={'calendar'}
                            size={'16px'} />
                        <div className={'displayed-date'}>
                            <span>{displayDate(props.saleBegin)}</span>
                            <span>{displayTime(props.saleBegin)}</span>
                        </div>
                        <Arrow
                        icon={'arrow'}
                        size={'15px'}
                        color={'rgba(255, 255, 255, 0.9)'}/>
                        <div className={'displayed-date'}>
                            <span>{displayDate(props.saleEnd)}</span>
                            <span>{displayTime(props.saleEnd)}</span>
                        </div>
                    </SaleDates>
                </Fragment>
        }
    </FormCard>
);

const Price = styled.span`
    margin-bottom: ${props => props.theme.regularSpacing};
    font-weight: 500;
`;

const Quantity = styled.span`
    margin-bottom: ${props => props.theme.regularSpacing};
    color: ${props => props.theme.textColorDark};
    font-weight: 500;
`;

const SaleDates = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 65%;

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
