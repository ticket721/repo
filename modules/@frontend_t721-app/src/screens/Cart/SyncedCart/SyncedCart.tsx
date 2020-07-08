import React, { useEffect, useState } from 'react';
import { CartState, SetTickets }      from '../../../redux/ducks/cart';
import { ActionSetEntity }            from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { CategoryEntity }                                                                    from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { useRequest }                                                                        from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                                                            from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useDispatch, useSelector }                                                          from 'react-redux';
import { T721AppState }                                                                      from '../../../redux';
import { v4 }                                                                                                      from 'uuid';
import  {Button, FullPageLoading, Error, SingleImage, EventInfos, Border, TicketQty, PurchaseTotal } from '@frontend/flib-react/lib/components';
import styled                                                                                                      from 'styled-components';
import { getImgPath }                                                                        from '@frontend/core/lib/utils/images';
import { formatDay, formatHour }                                                             from '@frontend/core/lib/utils/date';
import { DateEntity }                                                                        from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useTranslation }                                                                    from 'react-i18next';

interface TicketInfo {
    categoryId: string;
    category: CategoryEntity;
    price: string;
    fees: string;
}

interface CategoriesById {
    [key: string]: TicketInfo[];
}

interface CategoriesByDate {
    [key: string]: CategoriesById;
}

interface ConvertedCart {
    global: CategoriesByDate;
    date: CategoriesByDate;
}

export interface SyncedCartDateSectionProps {
    idx: number;
    date: string;
    convertedCart: ConvertedCart;
}

export interface SyncedCartGlobalSectionProps {
    idx: number;
    group: string;
    convertedCart: ConvertedCart;
}

const Header = styled.header`
    margin: 0 24px;
    position: relative;
    z-index: 1;
`;

const Container = styled.section`
  margin-bottom: calc(${props => props.theme.doubleSpacing} * 2);
`;

const BorderGradient = styled.div<any>`
  height: ${props => props.theme.smallSpacing};
    background: linear-gradient(90deg, ${props => props.gradient.join(', ')});

    &::after {
        z-index: -1;
        background: linear-gradient(90deg, ${(props) => props.gradient.join(', ')});
        content: '';
        display: block;
        filter: blur(10px);
        width: 100%;
        opacity: 0.12;
        height: 20px;
    }
`;

const CartReviewOrderEventTitle = styled.h3`
  margin-top: ${props => props.theme.doubleSpacing};
  text-transform: uppercase;
  opacity: 0.4;
`;

const SyncedCartDateSection: React.FC<SyncedCartDateSectionProps> = (props: SyncedCartDateSectionProps): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const dispatch = useDispatch();
    const [t] = useTranslation('cart');

    const dateReq = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $eq: props.date,
                },
            },
        ],
        refreshRate: 10,
    }, `SyncedCartDateSection@${uuid}`);

    if (dateReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (dateReq.response.error || dateReq.response.data.dates.length === 0) {
        return <Error message={'Cannot fetch date'}/>;
    }

    const date = dateReq.response.data.dates[0];
    const sortedCategories = props.convertedCart.date[props.date];

    return <>
        <Header>
            <CartReviewOrderEventTitle>{t('synced_event_title')} {props.idx}</CartReviewOrderEventTitle>
            <SingleImage src={getImgPath(date.metadata.avatar)} id={1} imgOnly/>
        </Header>
        <Container>
            <EventInfos
                pullUp
                name={date.metadata.name}
                location={date.location.location_label}
                startDate={formatDay(new Date(date.timestamps.event_begin))}
                endDate={formatDay(new Date(date.timestamps.event_end))}
                startTime={formatHour(new Date(date.timestamps.event_begin))}
                endTime={formatHour(new Date(date.timestamps.event_end))}
                gradients={date.metadata.signature_colors}
                mainColor={date.metadata.signature_colors[0]}
                getDirections={t('get_directions')}
            />
            <Border/>
            {
                Object
                    .keys(sortedCategories)
                    .map((categoryId: string): JSX.Element =>
                        <TicketQty
                            options={[...new Array(sortedCategories[categoryId].length + 5)].map((u, i) => ({label: i.toString(), value: i}))}
                            onChange={(opt) => {
                                dispatch(SetTickets(completeCartRecomputingOnDateTicketChange(props.convertedCart, props.date, categoryId, opt.value)))
                            }}
                            initialOption={{
                                value: sortedCategories[categoryId].length,
                                label: sortedCategories[categoryId].length.toString()
                            }}
                            key={categoryId}
                            fees={`+ ${sortedCategories[categoryId][0].fees} € ${t('service_fees')} / ${t('each')}`}
                            price={`${sortedCategories[categoryId][0].price} € / ${t('each')}`}
                            ticketsLeft={sortedCategories[categoryId].length}
                            typeName={sortedCategories[categoryId][0].category.display_name}
                        />
                    )
            }
            <BorderGradient gradient={date.metadata.signature_colors}/>
        </Container>
    </>;

};

const getIdx = (amount: number, idx: number): number => idx % amount;

const ImgContainer = styled.div`
    background-color: ${(props) => props.theme.darkerBg};
    overflow: hidden;
    display: flex;
    flex-direction: row;
    padding: ${props => props.theme.regularSpacing} 0;
    align-items: center;

    img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: ${(props) => props.theme.defaultRadius};
    }
`;

interface DateImageProps extends React.HtmlHTMLAttributes<'img'> {
    selected: boolean;
}

const DateImage = styled.img<DateImageProps>`
  transition: transform 200ms ease-in;
  ${props => props.selected ? `
    transform: scale(1.1);
  ` : ''}
`;

interface ImageIdContaienrProps extends React.HtmlHTMLAttributes<'div'> {
    selected: boolean;
}

const ImageIdContainer = styled.div<ImageIdContaienrProps>`
  transition: transform 200ms ease-in;
  ${props => props.selected ? `
    transform: scale(1.1);
  ` : ''}
`;

const ImageWrapper = styled.div`
  cursor: pointer;
  position: relative;
  margin-left: ${props => props.theme.regularSpacing};
  
  & div {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    padding: ${props => props.theme.smallSpacing};
  }
`;

const EventId = styled.h3`
  font-weight: 600;
  opacity: 0.9;
`;

const completeCartRecomputer = (cart: ConvertedCart): CategoryEntity[] => {
    let ret: CategoryEntity[] = [];

    for (const date of Object.keys(cart.date)) {
        for (const category of Object.keys(cart.date[date])) {
            ret = [
                ...ret,
                ...cart.date[date][category].map(ti => ti.category)
            ]
        }
    }

    for (const global of Object.keys(cart.global)) {
        for (const category of Object.keys(cart.global[global])) {
            ret = [
                ...ret,
                ...cart.global[global][category].map(ti => ti.category)
            ]
        }
    }

    return ret;
}

const completeCartRecomputingOnDateTicketChange = (cart: ConvertedCart, dateId: string, categoryId: string, count: number): CategoryEntity[] => {
    cart.date[dateId][categoryId] = [...new Array(count)].map(i => cart.date[dateId][categoryId][0]);

    return completeCartRecomputer(cart);
};

const completeCartRecomputingOnGlobalTicketChange = (cart: ConvertedCart, groupId: string, categoryId: string, count: number): CategoryEntity[] => {
    cart.global[groupId][categoryId] = [...new Array(count)].map(i => cart.global[groupId][categoryId][0]);

    return completeCartRecomputer(cart);
};

const SyncedCartGlobalSection: React.FC<SyncedCartGlobalSectionProps> = (props: SyncedCartGlobalSectionProps): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const [selection, setSelection] = useState(0);
    const [manual, setManual] = useState(false);
    const dispatch = useDispatch();
    const [t] = useTranslation('cart');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSelection(selection + 1)
        }, 4000);

        return () => clearTimeout(timeoutId)
    }, [selection, manual]);

    const dateReq = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                group_id: {
                    $eq: props.group,
                },
                parent_type: {
                    $eq: 'event'
                }
            },
        ],
        refreshRate: 10,
    }, `SyncedCartGlobalSection@${uuid}`);

    if (dateReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (dateReq.response.error || dateReq.response.data.dates.length === 0) {
        return <Error message={'Cannot fetch date'}/>;
    }

    const date = dateReq.response.data.dates[getIdx(dateReq.response.data.dates.length, selection)];
    const sortedCategories = props.convertedCart.global[props.group];

    return <>
        <Header>
            <CartReviewOrderEventTitle>{t('synced_event_global_title')}</CartReviewOrderEventTitle>
            <SingleImage src={getImgPath(date.metadata.avatar)} id={1} imgOnly/>
        </Header>
        <Container>
            <EventInfos
                pullUp
                name={date.metadata.name}
                location={date.location.location_label}
                startDate={formatDay(new Date(date.timestamps.event_begin))}
                endDate={formatDay(new Date(date.timestamps.event_end))}
                startTime={formatHour(new Date(date.timestamps.event_begin))}
                endTime={formatHour(new Date(date.timestamps.event_end))}
                gradients={date.metadata.signature_colors}
                mainColor={date.metadata.signature_colors[0]}
                getDirections={t('get_directions')}
            />
            <Border/>
            <ImgContainer>
                {
                    dateReq.response.data.dates.map((d: DateEntity, idx: number) =>
                        <ImageWrapper
                            onClick={() => {
                                setSelection(idx);
                                setManual(true);
                            }}
                            key={idx}
                        >
                            <DateImage
                                selected={idx === getIdx(dateReq.response.data.dates.length, selection)}
                                src={getImgPath(d.metadata.avatar)}
                            />
                            <ImageIdContainer
                                selected={idx === getIdx(dateReq.response.data.dates.length, selection)}
                            >
                                <EventId>#{idx + 1}</EventId>
                            </ImageIdContainer>
                        </ImageWrapper>
                    )
                }
            </ImgContainer>
            <Border/>
            {
                Object
                    .keys(sortedCategories)
                    .map((categoryId: string): JSX.Element => <TicketQty
                            key={categoryId}
                            options={[...new Array(sortedCategories[categoryId].length + 5)].map((u, i) => ({label: i.toString(), value: i}))}
                            onChange={(opt) => {
                                dispatch(SetTickets(completeCartRecomputingOnGlobalTicketChange(props.convertedCart, props.group, categoryId, opt.value)))
                            }}
                            initialOption={{
                                value: sortedCategories[categoryId].length,
                                label: sortedCategories[categoryId].length.toString()
                            }}
                            fees={`+ ${sortedCategories[categoryId][0].fees} € ${t('service_fees')} / ${t('each')}`}
                            price={`${sortedCategories[categoryId][0].price} € / ${t('each')}`}
                            ticketsLeft={sortedCategories[categoryId].length}
                            typeName={sortedCategories[categoryId][0].category.display_name}
                        />
                    )
            }
            <BorderGradient gradient={date.metadata.signature_colors}/>
        </Container>
    </>;

};

export interface SyncedCartProps {
    cart: CartState;
    remoteCart: ActionSetEntity;
}

const CartReviewOrderTitle = styled.h1`
  margin-top: ${props => props.theme.regularSpacing};
  margin-left: ${props => props.theme.regularSpacing};
`;

interface RemoteTicketInfo {
    categoryId: string;
}

const convertCart = (tickets: RemoteTicketInfo[], categoriesEntities: CategoryEntity[], prices: string[], fees: string[]): ConvertedCart => {

    const convertedCarts: ConvertedCart = {
        date: {},
        global: {}
    };

    for (let idx = 0; idx < tickets.length; ++idx) {
        const entityIdx = categoriesEntities.findIndex((c: CategoryEntity): boolean => c.id === tickets[idx].categoryId);

        if (entityIdx === -1) {
            continue ;
        }

        const entity = categoriesEntities[entityIdx];

        if (entity.parent_type === 'date') {
            convertedCarts.date = {
                ...convertedCarts.date,
                [entity.parent_id]: {
                    ...(convertedCarts.date[entity.parent_id] || {}),
                    [entity.id]: [
                        ...(convertedCarts.date[entity.parent_id]?.[entity.id] || []),
                        {
                            categoryId: entity.id,
                            category: entity,
                            fees: (parseInt(fees[idx], 10) / 100).toString(),
                            price: (parseInt(prices[idx], 10) / 100).toString()
                        }
                    ]
                }
            }
        } else {
            convertedCarts.global = {
                ...convertedCarts.global,
                [entity.group_id]: {
                    ...(convertedCarts.global[entity.group_id] || {}),
                    [entity.id]: [
                        ...(convertedCarts.global[entity.group_id]?.[entity.id] || []),
                        {
                            categoryId: entity.id,
                            category: entity,
                            fees: (parseInt(fees[idx], 10) / 100).toString(),
                            price: (parseInt(prices[idx], 10) / 100).toString()
                        }
                    ]
                }
            };
        }
    }

    return convertedCarts;

};

interface Item {
    name: string;
    price: number;
}

const getCartTotal = (cart: CategoryEntity[], prices: string[]): Item[] => {

    const ret: Item[] = [];

    for (let idx = 0; idx < cart.length; ++idx) {
        ret.push({
            name: `Ticket "${cart[idx].display_name}"`,
            price: parseInt(prices[idx], 10) / 100
        });
    }

    return ret;
};

const getServiceFees = (title: string, fees: string[]): Item[] => {

    const totalFees = fees.map(f => parseInt(f, 10) / 100).reduce((a, b) => a + b);

    return [{
        name: title,
        price: totalFees
    }]
};

const getStripeFDPFees = (title: string, items: Item[]): Item[] => {

    const totalSum = items.map(i => i.price).reduce((a, b) => a + b);

    return [{
        name: title,
        price: totalSum * 0.014 + 0.25
    }];

};

const PurchaseButtonWrapper = styled.div`
  padding: ${props => props.theme.regularSpacing};
`;

export const SyncedCart: React.FC<SyncedCartProps> = (props: SyncedCartProps): JSX.Element => {
    const [t] = useTranslation('cart');

    if (props.remoteCart.actions[0].status !== 'complete') {
        return <FullPageLoading/>;
    }

    const parsedActionData = JSON.parse(props.remoteCart.actions[0].data);

    const tickets: RemoteTicketInfo[] = parsedActionData.tickets;
    const fees: string[] = parsedActionData.fees;
    const total: string[] = parsedActionData.total.map(i => i.value);

    const convertedCart = convertCart(tickets, props.cart.tickets, total, fees);


    let idx = 1;

    const totalItems = getCartTotal(props.cart.tickets, total);
    const serviceFeeItems = getServiceFees(t('synced_cart_processing_fees'), fees);
    const paymentFeeItems = getStripeFDPFees(t('synced_cart_payment_fees'), [
        ...totalItems,
        ...serviceFeeItems
    ]);

    return <>
        <CartReviewOrderTitle>{t('synced_cart_review_title')}</CartReviewOrderTitle>
        {
            Object
                .keys(convertedCart.date)
                .map((dateId: string) => {
                    ++idx;
                    return <SyncedCartDateSection idx={idx - 1} convertedCart={convertedCart} date={dateId} key={dateId}/>;
                })
        }
        {
            Object
                .keys(convertedCart.global)
                .map((groupId: string) => {
                    ++idx;
                    return <SyncedCartGlobalSection idx={idx - 1} convertedCart={convertedCart} group={groupId} key={groupId}/>;
                })
        }
        <PurchaseTotal
            totalLabel={t('synced_cart_total')}
            subtotalLabel={t('synced_cart_subtotal')}
            label={t('synced_cart_total_title')}
            total={totalItems}
            fees={[
                ...serviceFeeItems,
                ...paymentFeeItems
            ]}
        />
        <PurchaseButtonWrapper>
            <Button
                title={t('synced_cart_payment_button')}
                variant={'primary'}
            />
        </PurchaseButtonWrapper>
    </>;
};
