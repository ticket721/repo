import styled                       from 'styled-components';
import React, { useState }          from 'react';
import { ActionSetEntity }          from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { EventCta }                 from '@frontend/flib-react/lib/components';
import { TicketMintingFormat }      from '@common/sdk/lib/@backend_nest/libs/common/src/utils/Cart.type';
import { useDispatch, useSelector } from 'react-redux';
import { T721AppState }             from '../../redux';
import { CategoryEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { uuidEq }                   from '@common/global';
import { CartState, SetTickets }    from '../../redux/ducks/cart';
import { useTranslation }           from 'react-i18next';
import { getT721TokenPrice }        from '../../utils/prices';
import { SyncedCartSelectOption }   from './SyncedCartSelectOption';

export interface SyncedCardSelectGroupIdProps {
    cart: ActionSetEntity;
}

const GroupSelectionTitle = styled.h1`
    margin-left: ${props => props.theme.regularSpacing};
`;

const getCategoryEntity = (cart: CartState, category: string): CategoryEntity => {
    const catIdx = cart.tickets.findIndex((cat: CategoryEntity): boolean => uuidEq(cat.id, category));

    if (catIdx === -1) {
        return null;
    }

    return cart.tickets[catIdx];
};

const getOptionTotalPrice = (cart: CartState, categories: TicketMintingFormat[]): number => {
    let total = 0;

    for (const cat of categories) {
        total += getT721TokenPrice(getCategoryEntity(cart, cat.categoryId).prices);
    }

    return total;
};

export const SyncedCartSelectGroupId: React.FC<SyncedCardSelectGroupIdProps> = (props: SyncedCardSelectGroupIdProps): JSX.Element => {

    const error = JSON.parse(props.cart.actions[0].error);
    const [selection, setSelection] = useState(null);
    const { cart } = useSelector((state: T721AppState) => ({ cart: state.cart }));
    const [t] = useTranslation('cart');

    const dispatch = useDispatch();

    const choices = Object.keys(error.details).map((groupId: string, idx: number): JSX.Element => {
        const onClick = () => setSelection(idx);

        return <SyncedCartSelectOption
            key={idx}
            groupId={groupId}
            tickets={error.details[groupId]}
            onClick={onClick}
            selected={selection === idx}
            idx={idx}/>;
    });

    const onFinalChoice = () => {
        const ticketList = error.details[Object.keys(error.details)[selection]];
        const tickets = ticketList.map((ticket: TicketMintingFormat): CategoryEntity => getCategoryEntity(cart, ticket.categoryId));

        dispatch(SetTickets(tickets));
    };

    const totalPrice = selection !== null ? getOptionTotalPrice(cart, error.details[Object.keys(error.details)[selection]]) : 0;

    return <>
        <GroupSelectionTitle>{t('select_group_id_title')}</GroupSelectionTitle>
        <h4 style={{ marginLeft: 24, opacity: 0.7, fontWeight: 200, marginBottom: 12 }}>{t('select_group_id_explainer')}</h4>
        {choices}
        <EventCta ctaLabel={t('select_group_id_option', { number: selection + 1 })} onClick={onFinalChoice} show={selection !== null}
                  subtitle={t('select_group_id_price', { price: totalPrice })} title={t('select_group_id_total')}/>

    </>;
};
