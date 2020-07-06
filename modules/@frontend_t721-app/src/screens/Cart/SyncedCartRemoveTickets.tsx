import styled                                            from 'styled-components';
import React, { useState }                               from 'react';
import { ActionSetEntity }                               from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { CategoryQty, EventCta, FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector }                      from 'react-redux';
import { T721AppState }                                  from '../../redux';
import { CategoryEntity }                                from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { formatShort }                                   from '@frontend/core/lib/utils/date';
import { SetTickets }                                    from '../../redux/ducks/cart';
import { useTranslation }                                from 'react-i18next';
import { getImgPath }                                    from '@frontend/core/lib/utils/images';
import { useRequest }                                    from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                        from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { v4 }                                            from 'uuid';
import { getT721TokenPrice }                             from '../../utils/prices';

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
    color: ${props => props.invalid ? props.theme.errorColor.hex : props.theme.textColor};
    font-weight: 400;
    font-size: 20px;
    margin: ${props => props.theme.regularSpacing};
`;

export interface SyncedCartTicketCountDisplayProps {
    ticket: CategoryEntity;
    amount: number;
    onChange: (amount: number) => void;
}

export const SyncedCartTicketCountDisplay: React.FC<SyncedCartTicketCountDisplayProps> = (props: SyncedCartTicketCountDisplayProps): JSX.Element => {
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());

    const dateRequest = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $eq: props.ticket.parent_id,
                },
            },
        ],
        refreshRate: 100,
    }, `SyncedCartTicketCountDisplay@${uuid}`);

    if (dateRequest.response.loading) {
        return <FullPageLoading/>;
    }

    if (dateRequest.response.error || dateRequest.response.data.dates.length === 0) {
        return <Error message={'Cannot fetch date'}/>;
    }

    const dateEntity = dateRequest.response.data.dates[0];

    const imageUrl = getImgPath(dateEntity.metadata.avatar);

    const options = [...(new Array(props.amount))].map((v, idx: number) => ({
        label: idx.toString(),
        value: idx,
    }));

    return <CategoryQty
        selectedOption={{
            label: props.amount.toString(),
            value: props.amount,
        }}
        categoryName={props.ticket.display_name}
        image={imageUrl}
        price={`${getT721TokenPrice(props.ticket.prices)} €`}
        date={formatShort(new Date(dateEntity.timestamps.event_begin))}
        options={options}
        onChange={(option) => props.onChange(option.value)}
    />;
};

export interface SyncedCartGlobalTicketCountDisplayProps {
    ticket: CategoryEntity;
    amount: number;
    onChange: (amount: number) => void;
}

export const SyncedCartGlobalTicketCountDisplay: React.FC<SyncedCartGlobalTicketCountDisplayProps> =
    (props: SyncedCartGlobalTicketCountDisplayProps): JSX.Element => {

        const imageUrl = getImgPath('id');

        const options = [...(new Array(props.amount))].map((v, idx: number) => ({
            label: idx.toString(),
            value: idx,
        }));

        return <CategoryQty
            starred={true}
            selectedOption={{
                label: props.amount.toString(),
                value: props.amount,
            }}
            categoryName={props.ticket.display_name}
            image={imageUrl}
            price={`${getT721TokenPrice(props.ticket.prices)} €`}
            date={formatShort(new Date(props.ticket.sale_begin))}
            options={options}
            onChange={(option) => props.onChange(option.value)}
        />;
    };

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

export const SyncedCartRemoveTickets: React.FC<SyncedCartRemoveTicketsProps> = (props: SyncedCartRemoveTicketsProps): JSX.Element => {

    const [t] = useTranslation('cart');
    const { cart } = useSelector((state: T721AppState) => ({ cart: state.cart }));
    const dispatch = useDispatch();

    let ticketGroups = {};
    for (const ticket of cart.tickets) {
        ticketGroups = {
            ...ticketGroups,
            [ticket.id]: [
                ...(ticketGroups[ticket.id] || []),
                ticket,
            ],
        };
    }

    const categories = [];

    for (const category of Object.keys(ticketGroups)) {

        const onChange = (newAmount: number): void => {

            if (newAmount === 0) {
                delete ticketGroups[category];
            } else {
                ticketGroups[category] = ticketGroups[category].slice(0, newAmount);
            }

            dispatch(SetTickets(reprocessTicketList(ticketGroups)));

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

    console.log(ticketGroups);

    return <>
        <RemoveTicketsTitle>{t('remove_tickets_title')}</RemoveTicketsTitle>
        <h4 style={{ marginLeft: 24, opacity: 0.7, fontWeight: 200, marginBottom: 12 }}>{t('remove_tickets_explainer')}</h4>
        {categories}
        <CountDisplayer invalid={true}>Remove {cart.tickets.length - 5} ticket ({cart.tickets.length}/5)</CountDisplayer>
        <EventCta ctaLabel={t('remove_tickets_option', { number: 0 })} onClick={console.log} show={false}
                  subtitle={'0'} title={t('remove_tickets_total')}/>

    </>;
};
