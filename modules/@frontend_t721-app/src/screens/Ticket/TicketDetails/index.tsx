import React, { useEffect, useState } from 'react';
import {
    Icon,
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

import qrcodePreview                       from '../../../media/images/qrcodePreview.png';
import qrcodePreview2                      from '../../../media/images/qrcodePreview2.png';
import { getImgPath }                      from '@frontend/core/lib/utils/images';
import { useDispatch, useSelector }        from 'react-redux';
import { T721AppState }                    from '../../../redux';
import { ResetTicket, StartRegenInterval } from '../../../redux/ducks/device_wallet';
import { DynamicQrCode }                   from '../DynamicQrCode';
import { keccak256 }          from 'ethers/utils';
import { getEnv }                          from '@frontend/core/lib/utils/getEnv';
import { decimalToHex }                    from '@common/global/lib/utils';

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
    transactionHash: string;
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
        // eslint-disable-next-line
    }, [props.ticketId]);

    useEffect(() => {
        if (seconds === 0) {
            setQrPrev(qrPrev === qrcodePreview ? qrcodePreview2 : qrcodePreview);
        }
        // eslint-disable-next-line
    }, [seconds]);

    return <>
        <TicketHeader fullWidth cover={getImgPath(props.image)} datesCount={1} datesIdx={0} mainColors={['#ffffff', '#000000']}/>
        <TicketContent>
            <Gradient values={props.colors} />
            <Details>
                <TicketInfosCard
                    eventName={props.name}
                    ticketType={props.categoryName}
                    ticketID={keccak256(decimalToHex(props.ticketId)).slice(0, 20)}
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
        {
            props.transactionHash ?
              <TransactionBtn
                target={'_blank'}
                href={getEnv().REACT_APP_ETHERSCAN_URL + '/' + props.transactionHash}>
                  <span>{t('transaction_btn_label')}</span>
                  <Icon icon={'right-chevron'} size={'14px'} color={'rgba(255,255,255,0.9)'}/>
              </TransactionBtn> :
              null
        }
        <DynamicQrCode
        qrOpened={qrOpened}
        name={props.name}
        category={props.categoryName}
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

    & button:last-child {
      text-transform: uppercase;
    }
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

    & > button {
        height: calc(${props => props.theme.doubleSpacing} * 2);
        padding-top: 12px;
        padding-bottom: 12px;

        & > span {
            font-weight: 600;
            padding-top: 0 !important;
        }
    }
`;

const TransactionBtn = styled.a`
    background-color: rgba(255,255,255,0.1);
    transition: background-color 300ms ease;
    align-items: center;
    border-radius: 8px;
    color: rgba(255,255,255,0.9);
    display: inline-flex;
    font-size: 15px;
    font-weight: 500;
    justify-content: space-between;
    line-height: 1em;
    margin: 32px;
    overflow: hidden;
    padding: 16px;
    position: relative;
    width: calc(100% - 64px);
`;
