import styled                                                      from 'styled-components';
import React                                         from 'react';
import { ActionSetEntity }                                                      from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { CategoryQty, EventCta, Skeleton, Error, SingleEvent, SingleStarEvent, Tags } from '@frontend/flib-react/lib/components';
import { useSelector }    from 'react-redux';
import { T721AppState }                from '../../redux';
import { CategoryEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { uuidEq }                      from '@common/global';
import { formatShort }                 from '@frontend/core/lib/utils/date';
import { CartState }       from '../../redux/ducks/cart';
import { useTranslation }              from 'react-i18next';

export interface SyncedCartRemoveTicketsProps {
    cart: ActionSetEntity;
}

const RemoveTicketsTitle = styled.h1`
    margin-left: ${props => props.theme.regularSpacing};
`;

interface CountDisplayerProps {
    invalid: boolean;
}

const CountDisplayer = styled.h3<CountDisplayerProps>`
    color: ${ props => props.invalid ? props.theme.errorColor.hex : props.theme.textColor };
    font-weight: 400;
    font-size: 20px;
    margin: ${props => props.theme.regularSpacing};
`;

const getCategoryEntity = (cart: CartState, category: string): CategoryEntity => {
    const catIdx = cart.tickets.findIndex((cat: CategoryEntity): boolean => uuidEq(cat.id, category));

    if (catIdx === -1) {
        return null;
    }

    return cart.tickets[catIdx];
};

export interface SyncedCartTicketCountDisplayProps {
    ticket: CategoryEntity;
}

export const SyncedCartTicketCountDisplay: React.FC<SyncedCartTicketCountDisplayProps> = (props: SyncedCartTicketCountDisplayProps): JSX.Element => {

    const serverUrl = `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static`;
    const imageUrl = `${serverUrl}/id`;

    return <CategoryQty
        categoryName={props.ticket.display_name}
        image={imageUrl}
        price={'12'}
        date={formatShort(new Date(props.ticket.sale_begin))}
        options={[
            {
                label: '0',
                value: 0
            }
        ]}
    />
};

export const SyncedCartRemoveTickets: React.FC<SyncedCartRemoveTicketsProps> = (props: SyncedCartRemoveTicketsProps): JSX.Element => {

    const [t] = useTranslation('cart');
    const {cart} = useSelector((state: T721AppState) => ({cart: state.cart}));

    return <>
        <RemoveTicketsTitle>{t('remove_tickets_title')}</RemoveTicketsTitle>
        <h4 style={{ marginLeft: 24, opacity: 0.7, fontWeight: 200, marginBottom: 12 }}>{t('remove_tickets_explainer')}</h4>
        <SyncedCartTicketCountDisplay ticket={cart.tickets[0]}/>
        <CountDisplayer invalid={true}>Remove 1 ticket (4/3)</CountDisplayer>
        <EventCta ctaLabel={t('remove_tickets_option', {number: 0})} onClick={console.log} show={false}
                  subtitle={'0'} title={t('remove_tickets_total')}/>

    </>;
};
