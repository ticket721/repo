import React, { Fragment } from 'react';
import styled                       from 'styled-components';
import { useSelector }              from 'react-redux';
import { FormCard, FormCardProps }  from '../FormCard';
import { Icon }                     from '@frontend/flib-react/lib/components';
import { displayCompleteDate } from '@frontend/core/lib/utils/date';

import { useTranslation } from 'react-i18next';
import './locales';
import {OrganizerState} from "../../redux/ducks";

interface CategoryCardProps extends FormCardProps {
    price: number;
    saleBegin: Date;
    saleEnd: Date;
    seats: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = (props: CategoryCardProps) => {
    const [ t ] = useTranslation('category_card');
    const maxDate: Date = useSelector((state: OrganizerState) =>
      state.eventCreation.datesConfiguration.dates[state.eventCreation.datesConfiguration.dates.length - 1]?.eventEnd);
    return (
        <FormCard
        error={props.saleBegin > maxDate || props.saleEnd > maxDate}
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
                            {props.seats} {t('available_tickets')}
                        </Quantity>
                        <SaleDates>
                            <Icon
                                icon={'calendar'}
                                size={'16px'} />
                            <div>
                                <span>{t('sale_dates_label')}</span>
                                <SaleDateDetails>
                                    <span>{displayCompleteDate(props.saleBegin)}</span>
                                    <Arrow
                                        icon={'arrow'}
                                        size={'15px'}
                                        color={'rgba(255, 255, 255, 0.9)'}/>
                                    <span>{displayCompleteDate(props.saleEnd)}</span>
                                </SaleDateDetails>
                            </div>
                        </SaleDates>
                    </Fragment>
            }
        </FormCard>
)
};

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

    & > span:first-child {
        margin-right: ${props => props.theme.regularSpacing};
    }
`;

const SaleDateDetails = styled.div`
    display: flex;
    align-items: center;
    margin-top: 8px;
`;

const Arrow = styled(Icon)`
    margin: 0 20px;
`;
