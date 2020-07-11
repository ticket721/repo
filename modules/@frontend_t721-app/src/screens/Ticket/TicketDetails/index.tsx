import React, { useEffect, useState } from 'react';
import {
    Button,
    Gradient,
    TicketHeader,
    TicketInfosCard,
    DateTimeCard,
    LocationCard,
    PurchaseInfosCard
}                                     from '@frontend/flib-react/lib/components';
import { formatDay, formatHour } from '@frontend/core/lib/utils/date';
import { useTranslation }        from 'react-i18next';
import './locales';
import styled                    from 'styled-components';
import { formatEuro }            from '@frontend/core/lib/utils/price';
import { useHistory }            from 'react-router';

import qrcodePreview                                       from '../../../media/images/qrcodePreview.png';
import qrcodePreview2                                       from '../../../media/images/qrcodePreview2.png';
import { getImgPath }                                      from '@frontend/core/lib/utils/images';
import { useDispatch, useSelector }                        from 'react-redux';
import { T721AppState }                                    from '../../../redux';
import { ResetTicket, StartRegenInterval }                 from '../../../redux/ducks/device_wallet';
import { DynamicQrCode }                                   from '../DynamicQrCode';

interface EventDate {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    location: string;
}

export interface TicketDetailsProps {
    dateId: string;
    name: string;
    image: string;
    colors: string[];
    categoryName: string;
    ticketId: string;
    dates: EventDate[];
    price: string;
    purchasedDate: Date;
}

export const TicketDetails: React.FC<TicketDetailsProps> = (props: TicketDetailsProps) => {
    const history = useHistory();
    const [ t ] = useTranslation('ticket_details');
    const seconds = useSelector((state: T721AppState) => state.deviceWallet.seconds);
    const dispatch = useDispatch();

    const [ qrPrev, setQrPrev ] = useState<string>(qrcodePreview);
    const [ qrOpened, setQrOpened ] = useState<boolean>(false);

    useEffect(() => {
        dispatch(StartRegenInterval(props.ticketId));

        return () => dispatch(ResetTicket());
    }, [props.ticketId, dispatch]);

    useEffect(() => {
        if (seconds === 0) {
            setQrPrev(qrPrev === qrcodePreview ? qrcodePreview2 : qrcodePreview);
        }
    }, [seconds, qrPrev]);

    return <>
        <TicketHeader fullWidth cover={getImgPath(props.image)}/>
        <TicketContent>
            <Gradient values={props.colors} />
            <Details>
                <TicketInfosCard
                    eventName={props.name}
                    ticketType={props.categoryName}
                    ticketID={props.ticketId.slice(0, 13)}
                />
                <Banner>
                    <QrLink>
                        <Btn onClick={() => setQrOpened(true)}>
                            <img src={qrPrev} alt={'qrPreview'}/>
                            <Timer>
                                <span>{t('next_gen_label')}</span>
                                <span>{seconds}</span>
                            </Timer>
                        </Btn>
                    </QrLink>
                    <EventLink color={props.colors[0]}>
                        <Button
                        variant={'custom'}
                        gradients={props.colors}
                        title={t('event_link')}
                        onClick={() => history.push('/event/' + props.dateId)}/>
                    </EventLink>
                </Banner>
                <DateTimeCard
                    dates={props.dates.map((date) => ({
                        id: date.id,
                        name: date.name,
                        startDate: formatDay(date.startDate),
                        endDate: formatDay(date.endDate),
                        startTime: formatHour(date.startDate),
                        endTime: formatHour(date.endDate),
                        location: date.location,
                    }))}
                    iconColor={props.colors[0]}
                    label={t('show_all_dates_label')}
                    labelCollapse={t('collapse_dates_label')}
                    onClick={(dateId: string) => history.push('/event/' + dateId)}
                    wSeparator
                />
                {
                    props.dates.length === 1 ?
                        <LocationCard
                            location={props.dates[0].location}
                            iconColor={props.colors[0]}
                            wSeparator
                            subtitle={t('get_directions')}/> :
                        null
                }
                <PurchaseInfosCard
                    purchasedLabel={t('purchased_date')}
                    priceLabel={t('price')}
                    date={formatDay(props.purchasedDate)}
                    iconColor={props.colors[0]}
                    price={formatEuro(props.price)}
                />
            </Details>
        </TicketContent>
        <DynamicQrCode
        qrOpened={qrOpened}
        name={props.name}
        category={props.categoryName}
        ticketId={props.ticketId.slice(0, 13)}
        color={props.colors[0]}
        onClose={() => setQrOpened(false)}/>
    </>;
};

const TicketContent = styled.div`
    position: relative;
    top: -${props => props.theme.doubleSpacing};
    margin-bottom: -${props => props.theme.doubleSpacing};
    display: flex;
    border-bottom-right-radius: ${props => props.theme.defaultRadius};
    overflow: hidden;
`;

const Details = styled.div`
    width: calc(100% - ${props => props.theme.smallSpacing});
`;

const Banner = styled.div`
    display: flex;
    background: linear-gradient(180deg, ${(props) => props.theme.darkBg}, ${(props) => props.theme.darkerBg});
`;

const QrLink = styled.div`
    padding: 12px;
    width: 50%;
    background-color: rgba(0,0,0,0.6);
`;

const Btn = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 12px;
    background-color: ${props => props.theme.textColor};
    border-radius: ${props => props.theme.defaultRadius};
    color: rgba(0,0,0,0.8);

    img {
        height: 40px;
    }
`;

const Timer = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;

    & > span:first-child {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }

    & > span:last-child {
        color: ${props => props.theme.textColorLight};
        margin-top: ${props => props.theme.smallSpacing};
        font-weight: 600;
        text-transform: uppercase;
    }
`;

const EventLink = styled.div`
    display: flex;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
    align-items: center;
    padding: 0 ${props => props.theme.regularSpacing};
    width: 50%;
    background-color: rgba(0,0,0,0.6);

    & > span:last-child {
        margin-left: 4px;
        margin-bottom: 2px;
        transform: rotate(-90deg);
    }

    & > button {
        padding-top: 12px;
        padding-bottom: 12px;

        & > span {
            line-height: 20px;
            padding-top: 0 !important;
        }
    }
`;
