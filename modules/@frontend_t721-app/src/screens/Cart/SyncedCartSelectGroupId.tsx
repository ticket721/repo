import styled                                                      from 'styled-components';
import React, { useState }                                         from 'react';
import { ActionSetEntity }                                         from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { EventCta, Skeleton, Error, SingleEvent, SingleStarEvent } from '@frontend/flib-react/lib/components';
import { TicketMintingFormat }                                     from '@common/sdk/lib/@backend_nest/libs/common/src/utils/Cart.type';
import { RequestBag, useRequest }                                  from '@frontend/core/lib/hooks/useRequest';
import { EventsSearchResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { useDispatch, useSelector }    from 'react-redux';
import { T721AppState }                from '../../redux';
import { v4 }                          from 'uuid';
import { EventEntity }                 from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoryEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { uuidEq }                      from '@common/global';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity, DateMetadata }    from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatShort }                 from '@frontend/core/lib/utils/date';
import { CartState, SetTickets }       from '../../redux/ducks/cart';
import { Price }                       from '@common/sdk/lib/@backend_nest/libs/common/src/currencies/Currencies.service';
import { useTranslation }              from 'react-i18next';

export interface SyncedCardSelectGroupIdProps {
    cart: ActionSetEntity;
}

const GroupSelectionTitle = styled.h1`
    margin-left: ${props => props.theme.regularSpacing};
`;

interface ContainerProps {
    selected: boolean;
    gradient: string[];
}

const Container = styled.article<ContainerProps>`
    background-color: ${(props) => (props.selected ? props.theme.darkerBg : props.theme.darkBg)};
    border-bottom: 2px solid #000;
    font-weight: 500;
    padding: ${(props) => props.theme.biggerSpacing};
    position: relative;
    transition: background-color 300ms ease;

    &:last-of-type {
        border: none;
    }

    &:before {
        background: linear-gradient(260deg, ${(props) => [props.theme.primaryColor.hex, props.theme.primaryColorGradientEnd.hex].join(', ')});
        content: '';
        display: block;
        height: 100%;
        left: 0;
        opacity: ${(props) => (props.selected ? 1 : 0)};
        position: absolute;
        top: 0;
        transition: opacity 300ms ease;
        width: 2px;
    }
`;

const CategoriesContainer = styled.div`
    padding: ${(props) => props.theme.regularSpacing} 0px;
`;

const EventTitle = styled.h3`
    font-weight: 500;
    width: calc(100%);
    overflow: hidden;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const getT721TokenPrice = (category: CategoryEntity): number => {
    const t721tokenIdx = category.prices.findIndex((price: Price): boolean => price.currency === 'T721Token');

    if (t721tokenIdx === -1) {
        return 0;
    }

    return parseInt(category.prices[t721tokenIdx].value, 10) / 100;
};

export interface SyncedCartEventCategoryProps {
    category: CategoryEntity;
    tickets: TicketMintingFormat[]
    dates: RequestBag<DatesSearchResponseDto>;
}

export const SyncedCartEventCategory: React.FC<SyncedCartEventCategoryProps> = (props: SyncedCartEventCategoryProps): JSX.Element => {

    const [t] = useTranslation('cart');

    if (props.dates.response.loading) {
        return <Skeleton ready={false} showLoadingAnimation={true} type={'text'} rows={2}>
            <></>
        </Skeleton>;
    }

    if (props.dates.response.error) {
        return <Error message={'Cannot load date'}/>;
    }

    const metadatas = props.dates.response.data.dates
        .map((date: DateEntity): DateMetadata => date.metadata);

    const serverUrl = `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static`;
    const imageUrl = `${serverUrl}/${metadatas[0].avatar}`;

    return <SingleStarEvent
        customMarginBottom={'0px'}
        id={props.category.id}
        name={`${props.tickets.length} ${props.category.display_name}`}
        color={metadatas[0].signature_colors[0]}
        price={getT721TokenPrice(props.category)}
        date={t('select_group_id_dates', {count: props.dates.response.data.dates.length})}
        image={imageUrl}
    />;

};

export interface SyncedCartDateCategoryProps {
    category: CategoryEntity;
    tickets: TicketMintingFormat[]
    dates: RequestBag<DatesSearchResponseDto>;
}

export const SyncedCartDateCategory: React.FC<SyncedCartDateCategoryProps> = (props: SyncedCartDateCategoryProps): JSX.Element => {

    if (props.dates.response.loading) {
        return <Skeleton ready={false} showLoadingAnimation={true} type={'text'} rows={2}>
            <></>
        </Skeleton>;
    }

    if (props.dates.response.error) {
        return <Error message={'Cannot load date'}/>;
    }

    const dateIdx = props.dates.response.data.dates.findIndex((date: DateEntity): boolean => uuidEq(props.category.parent_id, date.id));

    if (dateIdx === -1) {
        return <Error message={'Cannot find date'}/>;
    }

    const dateEntity: DateEntity = props.dates.response.data.dates[dateIdx];
    const serverUrl = `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static`;
    const imageUrl = `${serverUrl}/${dateEntity.metadata.avatar}`;

    return <SingleEvent
        customMarginBottom={'0px'}
        id={dateEntity.id}
        name={`${props.tickets.length} ${props.category.display_name}`}
        color={dateEntity.metadata.signature_colors[0]}
        price={getT721TokenPrice(props.category)}
        date={formatShort(new Date(dateEntity.timestamps.event_begin))}
        image={imageUrl}
    />;

};

export interface SyncedCartCategoryDisplayerProps {
    category: string;
    categories: RequestBag<CategoriesSearchResponseDto>;
    dates: RequestBag<DatesSearchResponseDto>;
    tickets: TicketMintingFormat[];
}

export const SyncedCartCategoryDisplayer: React.FC<SyncedCartCategoryDisplayerProps> = (props: SyncedCartCategoryDisplayerProps): JSX.Element => {

    if (props.categories.response.loading) {
        return <Skeleton ready={false} showLoadingAnimation={true} type={'text'} rows={2}>
            <></>
        </Skeleton>;
    }

    if (props.categories.response.error) {
        return <Error message={'Cannot load category'}/>;
    }

    const categoryIdx = props.categories.response.data.categories.findIndex((cat: CategoryEntity): boolean => uuidEq(cat.id, props.category));

    if (categoryIdx === -1) {
        return <Error message={'Cannot find category'}/>;
    }

    const category: CategoryEntity = props.categories.response.data.categories[categoryIdx];

    return <>
        {
            category.parent_type === 'date'

                ?
                <SyncedCartDateCategory category={category} dates={props.dates} tickets={props.tickets}/>

                :
                <SyncedCartEventCategory category={category} dates={props.dates} tickets={props.tickets}/>
        }
    </>;
};

const ItemText = styled.h4`
    text-transform: uppercase;
    color: ${props => props.theme.textColorDark};
    font-weight: 600;
    margin-bottom: ${props => props.theme.smallSpacing};
`;

export interface SyncedCartSelectOptionProps {
    groupId: string;
    tickets: TicketMintingFormat[];
    onClick: () => void;
    selected: boolean;
    idx: number;
}

export const SyncedCartSelectOption: React.FC<SyncedCartSelectOptionProps> = (props: SyncedCartSelectOptionProps): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const [t] = useTranslation('cart');

    const eventReq = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                group_id: {
                    $eq: props.groupId,
                },
            },
        ],
        refreshRate: 50,
    }, `SyncedCartSelectOption@${uuid}`);

    let regroupedCategories = {};
    for (const ticket of props.tickets) {
        regroupedCategories = {
            ...regroupedCategories,
            [ticket.categoryId]: [
                ...(regroupedCategories[ticket.categoryId] || []),
                ticket,
            ],
        };
    }

    const categoriesReq = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                id: {
                    $in: Object.keys(regroupedCategories),
                },
            },
        ],
        refreshRate: 50,
    }, `SyncedCartSekectOptions@${uuid}`);

    const datesReq = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                group_id: {
                    $eq: props.groupId,
                },
            },
        ],
        refreshRate: 50,
    }, `SyncedCartSekectOptions@${uuid}`);

    if (eventReq.response.loading) {
        return <Container selected={props.selected} gradient={['#ffffff', '#aaaaaa']} onClick={props.onClick}>
            <Skeleton ready={!eventReq.response.loading} showLoadingAnimation={true}>
                <></>
            </Skeleton>
        </Container>;
    }

    if (eventReq.response.error || eventReq.response.data.events.length === 0) {
        return <Container selected={props.selected} gradient={['#ffffff', '#aaaaaa']} onClick={props.onClick}>
            <Error message={'Unable to recover event'}/>
        </Container>;
    }

    const event: EventEntity = eventReq.response.data.events[0];

    const categoriesListing = Object.keys(regroupedCategories).map((cat: string, idx: number): JSX.Element => {
        return <SyncedCartCategoryDisplayer dates={datesReq} categories={categoriesReq} category={cat} tickets={regroupedCategories[cat]} key={idx}/>;
    });

    return <Container selected={props.selected} gradient={['#ffffff', '#aaaaaa']} onClick={props.onClick}>
        <ItemText>{t('select_group_id_option', {number: props.idx + 1})}</ItemText>
        <EventTitle>{event.name}</EventTitle>
        <CategoriesContainer>
            {categoriesListing}
        </CategoriesContainer>
    </Container>;

};

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
        total += getT721TokenPrice(getCategoryEntity(cart, cat.categoryId));
    }

    return total;
};

export const SyncedCartSelectGroupId: React.FC<SyncedCardSelectGroupIdProps> = (props: SyncedCardSelectGroupIdProps): JSX.Element => {

    const error = JSON.parse(props.cart.actions[0].error);
    const [selection, setSelection] = useState(null);
    const {cart} = useSelector((state: T721AppState) => ({cart: state.cart}));
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
        <EventCta ctaLabel={t('select_group_id_option', {number: selection + 1})} onClick={onFinalChoice} show={selection !== null}
                  subtitle={t('select_group_id_price', {price: totalPrice})} title={t('select_group_id_total')}/>

    </>;
};
