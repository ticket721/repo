import { CategoryEntity }   from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import React                from 'react';
import { EventCta }         from '@frontend/flib-react/lib/components';
import { Price }            from '@common/sdk/lib/@backend_nest/libs/common/src/currencies/Currencies.service';
import { useTranslation }   from 'react-i18next';
import { useDispatch }      from 'react-redux';
import { AddTicket } from '../../redux/ducks/cart';
import { useHistory }       from 'react-router';

export interface TicketSelectionCtaProps {
    category: CategoryEntity;
    gradients: string[];
}

const getEuroPrice = (category: CategoryEntity): string => {
    const T721TokenPriceIndex = category.prices.findIndex((price: Price): boolean => price.currency === 'T721Token');

    if (T721TokenPriceIndex === -1) {
        return '0';
    }

    return (parseInt(category.prices[T721TokenPriceIndex].value, 10) / 100).toString();
};

export const TicketSelectionCta: React.FC<TicketSelectionCtaProps> = (props: TicketSelectionCtaProps): JSX.Element => {

    const subtitle = props.category ? getEuroPrice(props.category) : null;
    const [t] = useTranslation('event_ticket_list');
    const dispatch = useDispatch();
    const history = useHistory();
    const addToCart = () => {
        dispatch(AddTicket(props.category));
        history.push('/cart/checkout');
    };

    return <EventCta gradients={props.gradients} ctaLabel={t('checkout')} onClick={addToCart} show={props.category !== null}
                     subtitle={`${subtitle} € + ${t('fees')}`} title={t('total')}/>;

};
