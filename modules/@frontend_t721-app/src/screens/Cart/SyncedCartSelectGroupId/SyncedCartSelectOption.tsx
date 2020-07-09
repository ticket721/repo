import { TicketMintingFormat }         from '@common/sdk/lib/@backend_nest/libs/common/src/utils/Cart.type';
import React, { useState }             from 'react';
import { useSelector }                 from 'react-redux';
import { T721AppState }                from '../../../redux';
import { v4 }                          from 'uuid';
import { useTranslation }              from 'react-i18next';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { EventsSearchResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Error, Skeleton }             from '@frontend/flib-react/lib/components';
import { EventEntity }                 from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import styled                          from 'styled-components';
import { SyncedCartCategoryDisplayer } from './SyncedCartCategoryDisplayer';

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

const ItemText = styled.h4`
    text-transform: uppercase;
    color: ${props => props.theme.textColorDark};
    font-weight: 600;
    margin-bottom: ${props => props.theme.smallSpacing};
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

