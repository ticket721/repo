import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';
import Countdown from 'react-countdown';
import { useEffect, useState } from 'react';

const DTFormatShort = new Intl.DateTimeFormat('default', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
});

export const formatShort = (date: Date | string): string => DTFormatShort.format(new Date(date));

interface DateInfo {
    name: string;
    start: Date;
    online: boolean;
}

export interface TicketTypeProps extends React.ComponentProps<any> {
    gradient: string[];
    dates: DateInfo[];
    selected?: boolean;
    price: string;
    title: string;
    ticketsLeft: number;
    soldOutLabel: string;
    ticketsLeftLabel: string;
    availableInLabel: string;
    saleEndsInLabel: string;
    saleBegin: Date;
    saleEnd: Date;
    onClick?: () => void;
}

const Container = styled.article<TicketTypeProps>`
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
        background: linear-gradient(260deg, ${(props) => props.gradient.join(', ')});
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

    h3 {
        font-size: 16px;
    }

    h4 {
        font-size: 15px;
        margin: ${(props) => props.theme.regularSpacing} 0 ${(props) => props.theme.smallSpacing};

        & + span {
            color: ${(props) => props.theme.textColorDarker};
        }
    }

    p {
        color: ${(props) => props.theme.textColorDark};
        margin-top: ${(props) => props.theme.regularSpacing};
    }
`;

const TicketCount = styled.span<TicketTypeProps>`
    align-items: center;
    color: ${(props) => (props.ticketsLeft < 1 ? props.theme.textColorDark : props.theme.textColor)};
    display: inline-flex;
    font-size: 14px;
    font-weight: 500;

    svg {
        margin-right: ${(props) => props.theme.smallSpacing};
        position: relative;
        top: -2px;
    }
`;

const TicketIcon = styled(Icon)`
    margin-right: ${(props) => props.theme.regularSpacing};
`;

interface DisabledContainerProps {
    disabled: boolean;
}

const DisabledContainer = styled.div<DisabledContainerProps>`
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    backdrop-filter: blur(3px);
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
`;

const CountdownText = styled.h4`
    font-weight: 300;
    font-size: 24px;
    z-index: 11;
`;

const NumberText = styled.span`
    font-family: 'Roboto Mono', monospace;
    z-index: 11;
`;

const SoldOutText = styled.span`
    text-transform: uppercase;
    font-weight: 900;
    font-size: 24px;
    z-index: 11;
`;

interface SoldOutContainerProps {
    gradient: string[];
}

const SoldOutContainer = styled.div<SoldOutContainerProps>`
    transform: rotate(-20deg);
    background: linear-gradient(260deg, ${(props) => props.gradient[0]}, ${(props) => props.gradient[1]});
    background-color: ${(props) => props.color};
    padding: ${(props) => props.theme.regularSpacing};
    border-radius: 8px;
`;

const renderer = (
    availableInLabel: string,
    { hours, minutes, seconds, completed }: { hours: number; minutes: number; seconds: number; completed: boolean },
) => {
    if (completed) {
        return null;
    } else {
        return (
            <CountdownText>
                {availableInLabel} <NumberText>{hours}</NumberText>h <NumberText>{minutes}</NumberText>m{' '}
                <NumberText>{seconds}</NumberText>s
            </CountdownText>
        );
    }
};

const descRenderer = (
    saleEndsInLabel: string,
    {
        days,
        hours,
        minutes,
        seconds,
        completed,
    }: { days: number; hours: number; minutes: number; seconds: number; completed: boolean },
) => {
    if (completed) {
        return null;
    } else {
        return (
            <CountdownText>
                {saleEndsInLabel} <NumberText>{days}</NumberText>d <NumberText>{hours}</NumberText>h{' '}
                <NumberText>{minutes}</NumberText>m
            </CountdownText>
        );
    }
};

const isBeforeSale = (saleBegin: Date): boolean => {
    return Date.now() < saleBegin.getTime();
};

const isAfterSale = (saleEnd: Date): boolean => {
    return Date.now() > saleEnd.getTime();
};

const isSoldOut = (count: number): boolean => {
    return count === 0;
};

const isDisabled = (props: TicketTypeProps): boolean => {
    return isBeforeSale(props.saleBegin) || isAfterSale(props.saleEnd) || isSoldOut(props.ticketsLeft);
};

interface DescriptionProps {
    color: string;
}

const Description = styled.p<DescriptionProps>`
    color: ${(props) => props.color} !important;
    margin: 0 !important;
`;

const Discrete = styled.span`
    color: ${(props) => props.theme.textColor};
    font-weight: 200;
    opacity: 0.7;
    font-size: 14px;
`;

const LiveIcon = styled(Icon)`
    display: inline;
    margin-right: 5px;
    margin-left: 5px;
`;

const DateDescription = (props: { date: DateInfo; theme: string; idx: number }): JSX.Element => {
    return (
        <Description color={props.theme}>
            {props.idx > 0 ? <Discrete>{'+ '}</Discrete> : null}
            {props.date.online ? <LiveIcon icon={'live'} color={props.theme} size={'16px'} /> : null}
            {props.date.name}
            <Discrete>, {formatShort(props.date.start)}</Discrete>
        </Description>
    );
};

export const TicketType: React.FunctionComponent<TicketTypeProps> = (props: TicketTypeProps): JSX.Element => {
    const [, setNow] = useState(Date.now());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Container
            selected={!isDisabled(props) && props.selected}
            gradient={props.gradient}
            onClick={isDisabled(props) ? undefined : props.onClick}
        >
            {isDisabled(props) ? (
                <DisabledContainer disabled={isDisabled(props)}>
                    {isBeforeSale(props.saleBegin) ? (
                        <Countdown
                            date={props.saleBegin.getTime()}
                            renderer={renderer.bind(null, props.availableInLabel)}
                        />
                    ) : (
                        <SoldOutContainer gradient={props.gradient}>
                            <SoldOutText>{props.soldOutLabel}</SoldOutText>
                        </SoldOutContainer>
                    )}
                </DisabledContainer>
            ) : null}
            <div className={'row aic jcsb'}>
                <h3>{props.title}</h3>
                <TicketCount ticketsLeft={props.ticketsLeft}>
                    <TicketIcon icon={'ticket'} size={'20px'} color={props.gradient[0]} />
                    {`${props.ticketsLeft} ${props.ticketsLeftLabel}`}
                </TicketCount>
            </div>
            <h4>{props.price}</h4>

            <div style={{ marginTop: 12, marginBottom: 12 }}>
                {props.dates.map((date: DateInfo, idx: number) => (
                    <DateDescription date={date} theme={props.gradient[0]} idx={idx} key={idx} />
                ))}
            </div>

            {!isDisabled(props) && !isAfterSale(props.saleEnd) ? (
                <Countdown date={props.saleEnd.getTime()} renderer={descRenderer.bind(null, props.saleEndsInLabel)} />
            ) : null}
        </Container>
    );
};

TicketType.defaultProps = {
    color: '#079CF0',
    gradient: ['#079CF0', '#2143AB'],
};

export default TicketType;
