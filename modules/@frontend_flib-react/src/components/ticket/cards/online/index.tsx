import * as React from 'react';
import CardContainer from '../../../elements/card-container';
import styled from '../../../../config/styled';
import Icon from '../../../icon';
import { keyframes } from 'styled-components';
import { useMemo } from 'react';

const ClickableContainer = styled.div`
    cursor: pointer;
`;

const ChevronIcon = styled(Icon)`
    transform: rotate(-90deg);
`;

const Glow = keyframes`
  from {
    box-shadow: 0 0 1px #ff000075, 0 0 2px #ff000075, 0 0 4px #ff000075, 0 0 6px #ff000075, 0 0 8px #ff000075, 0 0 10px #ff000075, 0 0 12px #ff000075;
  }
  to {
    box-shadow: 0 0 5px #ff000075, 0 0 10px #ff000075, 0 0 15px #ff000075, 0 0 20px #ff000075, 0 0 25px #ff000075, 0 0 30px #ff000075, 0 0 35px #ff000075;
  }
`;

const LiveText = styled.span`
    text-shadow: 0 0 1px #ff000075, 0 0 2px #ff000075, 0 0 4px #ff000075, 0 0 6px #ff000075, 0 0 8px #ff000075,
        0 0 10px #ff000075;
`;

const NotLiveText = styled.span``;

const LiveButton = styled.div`
    width: 15px;
    height: 15px;
    border-radius: 100%;
    background-color: red;
    animation: ${Glow} 3s ease-in-out infinite alternate;
    margin-bottom: 4px;
    margin-right: ${(props) => props.theme.smallSpacing};
`;

const NotLiveButton = styled.div`
    width: 15px;
    height: 15px;
    border-radius: 100%;
    background-color: #0a0812;
    margin-bottom: 4px;
    margin-right: ${(props) => props.theme.smallSpacing};
`;

const IsNotLive = (props: { subtitle: string; live: string; online_link: string }): JSX.Element => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                height: 50,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'start',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <NotLiveButton />
                    <NotLiveText
                        style={{
                            color: '#0a0812',
                            fontSize: 20,
                            fontWeight: 600,
                            margin: 0,
                            textTransform: 'uppercase',
                        }}
                    >
                        {props.live}
                    </NotLiveText>
                </div>
                <span
                    style={{
                        fontWeight: 400,
                        marginTop: 12,
                    }}
                >
                    {props.subtitle}
                </span>
            </div>
            <ChevronIcon icon={'chevron'} size={'10px'} color={props.online_link ? 'white' : '#00000000'} />
        </div>
    );
};

const IsLive = (props: { subtitle: string; live: string; online_link: string }): JSX.Element => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                height: 50,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'start',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <LiveButton />
                    <LiveText
                        style={{
                            color: 'red',
                            fontSize: 20,
                            fontWeight: 600,
                            margin: 0,
                            textTransform: 'uppercase',
                        }}
                    >
                        {props.live}
                    </LiveText>
                </div>
                <span
                    style={{
                        fontWeight: 400,
                        marginTop: 12,
                    }}
                >
                    {props.subtitle}
                </span>
            </div>
            <ChevronIcon icon={'chevron'} size={'10px'} color={props.online_link ? 'white' : '#00000000'} />
        </div>
    );
};

const getStatus = (start: Date, end: Date, onlineLink: string): string => {
    return 'live';

    const now = Date.now();

    if (!onlineLink) {
        return 'waiting_link';
    }

    if (now > end.getTime()) {
        return 'ended';
    }

    if (start.getTime() < now && end.getTime() > now) {
        return 'live';
    }

    return 'soon';
};

const LiveComponent = (props: {
    status: string;
    online_link: string;
    live_title: string;
    offline_title: string;
    waiting_link_subtitle: string;
    ended_subtitle: string;
    live_subtitle: string;
    soon_subtitle: string;
}): JSX.Element => {
    switch (props.status) {
        case 'waiting_link': {
            return (
                <IsNotLive
                    subtitle={props.waiting_link_subtitle}
                    live={props.offline_title}
                    online_link={props.online_link}
                />
            );
        }
        case 'ended': {
            return (
                <IsNotLive subtitle={props.ended_subtitle} live={props.offline_title} online_link={props.online_link} />
            );
        }
        case 'live': {
            return <IsLive subtitle={props.live_subtitle} live={props.live_title} online_link={props.online_link} />;
        }
        case 'soon': {
            return (
                <IsNotLive subtitle={props.soon_subtitle} live={props.offline_title} online_link={props.online_link} />
            );
        }
        default: {
            return (
                <IsNotLive
                    subtitle={props.waiting_link_subtitle}
                    live={props.offline_title}
                    online_link={props.online_link}
                />
            );
        }
    }
};

export interface OnlineCardProps extends React.ComponentProps<any> {
    start: Date;
    end: Date;
    onClick: () => void;
    ended_subtitle: string;
    soon_subtitle: string;
    waiting_link_subtitle: string;
    live_subtitle: string;
    online_link: string;
    live_title: string;
    offline_title: string;
}

export const OnlineCard: React.FunctionComponent<OnlineCardProps & { className?: string }> = (
    props: OnlineCardProps,
): JSX.Element => {
    const status = useMemo(() => getStatus(props.start, props.end, props.online_link), [
        props.start,
        props.end,
        props.online_link,
    ]);

    return (
        <ClickableContainer onClick={props.online_link ? props.onClick : undefined}>
            <CardContainer removeBg={false}>
                <LiveComponent
                    status={status}
                    online_link={props.online_link}
                    offline_title={props.offline_title}
                    live_title={props.live_title}
                    waiting_link_subtitle={props.waiting_link_subtitle}
                    ended_subtitle={props.ended_subtitle}
                    live_subtitle={props.live_subtitle}
                    soon_subtitle={props.soon_subtitle}
                />
            </CardContainer>
        </ClickableContainer>
    );
};
