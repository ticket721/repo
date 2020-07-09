import React, { useEffect, useState }                                         from 'react';
import { useDispatch, useSelector }                                           from 'react-redux';
import { T721AppState }                                                       from '../../../redux';
import { v4 }                                                                 from 'uuid';
import { useTranslation }                                                     from 'react-i18next';
import { useRequest }                                                         from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                                             from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Border, Error, EventInfos, FullPageLoading, SingleImage, TicketQty } from '@frontend/flib-react/lib/components';
import { getImgPath }                                                         from '@frontend/core/lib/utils/images';
import { formatDay, formatHour }                                              from '@frontend/core/lib/utils/date';
import { DateEntity }                                                         from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { SetTickets }                                                         from '../../../redux/ducks/cart';
import { CategoryEntity }                                                     from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import styled                                                                                                  from 'styled-components';
import { BorderGradient, CartReviewOrderEventTitle, completeCartRecomputer, Container, ConvertedCart, Header } from './types';

const completeCartRecomputingOnGlobalTicketChange = (cart: ConvertedCart, groupId: string, categoryId: string, count: number): CategoryEntity[] => {
    cart.global[groupId][categoryId] = [...new Array(count)].map(i => cart.global[groupId][categoryId][0]);

    return completeCartRecomputer(cart);
};

const EventId = styled.h3`
  font-weight: 600;
  opacity: 0.9;
`;

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

export interface SyncedCartGlobalSectionProps {
    idx: number;
    group: string;
    convertedCart: ConvertedCart;
}

export const SyncedCartGlobalSection: React.FC<SyncedCartGlobalSectionProps> = (props: SyncedCartGlobalSectionProps): JSX.Element => {

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
                                dispatch(
                                    SetTickets(completeCartRecomputingOnGlobalTicketChange(props.convertedCart, props.group, categoryId, opt.value))
                                )
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

