import { CategoryEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import React                       from 'react';
import { FullButtonCta } from '@frontend/flib-react/lib/components';
import { useTranslation }          from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AddTicket, CartState }     from '../../redux/ducks/cart';
import { useHistory }               from 'react-router';
import { T721AppState }             from '../../redux';

export interface TicketSelectionCtaProps {
    category: CategoryEntity;
    gradients: string[];
}

const containsCategory = (category: CategoryEntity, cart: CartState): boolean => {
    for (const ticket of cart.tickets) {
        if (ticket.id === category.id) {
            return true;
        }
    }
    return false;
};

export const TicketSelectionCta: React.FC<TicketSelectionCtaProps> = (props: TicketSelectionCtaProps): JSX.Element => {

    const [t] = useTranslation('event_ticket_list');
    const dispatch = useDispatch();
    const history = useHistory();
    const cart = useSelector((state: T721AppState) => state.cart);
    const addToCart = () => {
        if (!containsCategory(props.category, cart))
        dispatch(AddTicket(props.category));
        history.push('/cart/checkout');
    };

    return <FullButtonCta gradients={props.gradients} ctaLabel={t('checkout')} onClick={addToCart} show={props.category !== null}/>;

};
