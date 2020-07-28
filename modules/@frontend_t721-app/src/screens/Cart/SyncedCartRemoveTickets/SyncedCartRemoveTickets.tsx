import styled                         from 'styled-components';
import React, { useEffect, useState } from 'react';
import { ActionSetEntity }            from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { EventCta }                           from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector }           from 'react-redux';
import { T721AppState }                       from '../../../redux';
import { CategoryEntity }                     from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { SetTickets }                         from '../../../redux/ducks/cart';
import { useTranslation }                     from 'react-i18next';
import { getTotalPrice }                      from '../../../utils/prices';
import { SyncedCartTicketCountDisplay }       from './SyncedCartTicketCountDisplay';
import { SyncedCartGlobalTicketCountDisplay } from './SyncedCartGlobalTicketCountDisplay';

export interface SyncedCartRemoveTicketsProps {
    cart: ActionSetEntity;
}

const RemoveTicketsTitle = styled.h3`
    font-size: 20px;
    margin-left: ${props => props.theme.regularSpacing};
`;

const reprocessTicketList = (regroupedCategories: { [key: string]: CategoryEntity[] }): CategoryEntity[] => {
    let ret = [];
    for (const cat of Object.keys(regroupedCategories)) {
        ret = [
            ...ret,
            ...regroupedCategories[cat],
        ];
    }

    return ret;
};

const MAX_COUNT = 5;

interface CountDisplayerProps {
    invalid: boolean;
}

const CountDisplayer = styled.h3<CountDisplayerProps>`
    color: ${props => props.invalid ? props.theme.warningColor.hex : props.theme.textColor};
    font-weight: 400;
    font-size: 20px;
    margin: ${props => props.theme.regularSpacing};
`;

const Container = styled.div`
    padding-bottom: calc(80px + ${props => props.theme.regularSpacing});
`;

export const SyncedCartRemoveTickets: React.FC<SyncedCartRemoveTicketsProps> = (props: SyncedCartRemoveTicketsProps): JSX.Element => {

    const [t] = useTranslation('cart');
    const { cart } = useSelector((state: T721AppState) => ({ cart: state.cart }));
    const [newCart, setNewCart] = useState(cart.tickets);
    const dispatch = useDispatch();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    let ticketGroups = {};
    for (const ticket of newCart) {
        ticketGroups = {
            ...ticketGroups,
            [ticket.id]: [
                ...(ticketGroups[ticket.id] || []),
                ticket,
            ],
        };
    }

    const categories = [];

    const onValidate = () => {
        dispatch(SetTickets(newCart));
    };

    for (const category of Object.keys(ticketGroups)) {

        const onChange = (newAmount: number): void => {

            if (newAmount === 0) {
                delete ticketGroups[category];
            } else {
                ticketGroups[category] = [...new Array(newAmount)].map(() => ticketGroups[category][0]);
            }

            setNewCart(reprocessTicketList(ticketGroups));

        };

        const categoryEntity = ticketGroups[category][0];
        if (categoryEntity.parent_type === 'event') {
            categories.push(<SyncedCartGlobalTicketCountDisplay
                onChange={onChange}
                key={category}
                ticket={categoryEntity}
                amount={ticketGroups[category].length}
            />);
        } else {
            categories.push(<SyncedCartTicketCountDisplay
                onChange={onChange}
                key={category}
                ticket={categoryEntity}
                amount={ticketGroups[category].length}
            />);
        }

    }

    return <Container>
        <RemoveTicketsTitle>{t('remove_tickets_title')}</RemoveTicketsTitle>
        <h4 style={{ marginLeft: 24, opacity: 0.7, fontWeight: 200, marginBottom: 12, marginTop: 12 }}>{t('remove_tickets_explainer')}</h4>
        {
            newCart.length - MAX_COUNT > 0

                ?
                <CountDisplayer invalid={true}>{t('remove_amount', { count: newCart.length - MAX_COUNT, total: newCart.length })}</CountDisplayer>

                :
                null
        }
        {categories}
        <EventCta ctaLabel={t('remove_validate')} onClick={onValidate} show={newCart.length - MAX_COUNT <= 0}
                  subtitle={`${getTotalPrice(newCart)} € + ${t('fees')}`} title={t('remove_tickets_cart_total')}/>

    </Container>;
};
