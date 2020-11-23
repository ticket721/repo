import * as React from 'react';
import styled from '../../../config/styled';
import TicketInterface from '../../../shared/ticketInterface';
import LocationCard from '../cards/location';
import DateTimeCard from '../cards/datetime';
import Gradient from '../../elements/gradient';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface PreviewInfosProps extends React.ComponentProps<any> {
    ticket: TicketInterface;
    event_name: string;
    gradient: string[];
    addonsPurchased?: string;
    bgColor?: string;
    online: boolean;
    online_label: string;
    online_sublabel: string;
    location_label: string;
}

const Wrapper = styled.div`
    position: relative;
`;

const PreviewContainer = styled.main`
    background: linear-gradient(180deg, ${(props) => props.theme.darkBg}, ${(props) => props.theme.darkerBg});
    border-bottom-left-radius: ${(props) => props.theme.defaultRadius};
    border-top-left-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    padding: 12px 0;
    width: calc(100% - 8px);
`;

const TicketHeaderTitle = styled(motion.h2)`
    font-weight: 500;
`;

const TicketEventTitle = styled.h2`
    margin-top: ${(props) => props.theme.smallSpacing} !important;
    opacity: 0.4;
    font-size: 12px !important;
    color: #ffffff;
    text-transform: uppercase;
    font-weight: 400;
`;

interface TicketCategoryTitleProps {
    gradientStart: string;
    gradientEnd: string;
}

const TicketCategoryTitle = styled.h3<TicketCategoryTitleProps>`
    margin-top: ${(props) => props.theme.smallSpacing} !important;
    font-weight: 500;
    color: ${(props) => props.color};
    background: -webkit-linear-gradient(260deg, ${(props) => props.gradientStart}, ${(props) => props.gradientEnd});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const TicketHeaderInfos = styled.div`
    width: calc(100% - 8px);
    background-image: linear-gradient(180deg, ${(props) => props.theme.darkBg}, ${(props) => props.theme.darkerBg});
    border-top-right-radius: ${(props) => props.theme.defaultRadius};
    border-bottom-left-radius: 12px;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing}
        ${(props) => props.theme.regularSpacing};

    h2 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${(props) => props.theme.textColor};
        font-size: 1rem;
        line-height: 1.2rem;
        text-transform: uppercase;
    }

    h3 {
        color: ${(props) => props.theme.textColorDark};
        font-size: 0.875rem;
        margin-top: 0.5rem;
    }
`;
const Separator = styled.div<{ bgColor: string | undefined }>`
    background-color: ${(props) => props.bgColor || '#0b0912'};
    display: block;
    height: 2px;
    position: relative;
    left: 12px;
    width: calc(100% - 12px);
    z-index: 100;
`;

const DateTime = styled(DateTimeCard)`
    padding-bottom: 12px;
`;

const Location = styled(LocationCard)`
    padding-bottom: 12px;
    padding-top: 12px;
`;

const Subtitle = styled.span`
    color: ${(props) => props.theme.textColorDark};
    display: block;
    font-size: 13px;
    padding: 12px ${(props) => props.theme.biggerSpacing};
`;

export const PreviewInfos: React.FunctionComponent<PreviewInfosProps> = (props: PreviewInfosProps): JSX.Element => {
    const x = useAnimation();
    const [initial, setInitial] = useState(true);
    const [name, setName] = useState(props.ticket.name);
    const [time, setTime] = useState({
        startDate: props.ticket.startDate,
        endDate: props.ticket.endDate,
        startTime: props.ticket.startTime,
        endTime: props.ticket.endTime,
    });
    const [location, setLocation] = useState({
        location: props.ticket.location,
        subtitle: props.location_label,
    });
    const [online, setOnline] = useState({
        online: props.online,
        online_label: props.online_label,
        online_sublabel: props.online_sublabel,
    });

    useEffect(() => {
        if (!initial) {
            x.start({
                opacity: 0,
                transition: {
                    duration: 0.5,
                    delay: 0,
                },
            }).then(() => {
                setName(props.ticket.name);
                setTime({
                    startDate: props.ticket.startDate,
                    endDate: props.ticket.endDate,
                    startTime: props.ticket.startTime,
                    endTime: props.ticket.endTime,
                });
                setLocation({
                    location: props.ticket.location,
                    subtitle: props.location_label,
                });
                setOnline({
                    online: props.online,
                    online_label: props.online_label,
                    online_sublabel: props.online_sublabel,
                });
                x.start({
                    opacity: 1,
                    transition: {
                        duration: 1.25,
                        delay: 0,
                    },
                });
            });
        } else {
            setInitial(false);
        }
    }, [
        props.ticket.name,
        props.ticket.startDate,
        props.ticket.endDate,
        props.ticket.startTime,
        props.ticket.endTime,
        props.ticket.location,
        props.location_label,
        props.online,
        props.online_label,
        props.online_sublabel,
    ]);

    return (
        <Wrapper>
            <TicketHeaderInfos>
                <TicketHeaderTitle animate={x}>{name}</TicketHeaderTitle>
                <TicketCategoryTitle gradientStart={props.gradient[0]} gradientEnd={props.gradient[1]}>
                    {props.ticket.categoryName}
                </TicketCategoryTitle>
                <TicketEventTitle>{props.event_name}</TicketEventTitle>
            </TicketHeaderInfos>
            <Separator bgColor={props.bgColor} />
            <PreviewContainer>
                <motion.div animate={x}>
                    <DateTime dates={[time]} iconColor={props.ticket.mainColor} removeBg small />
                </motion.div>
                <motion.div animate={x}>
                    <Location
                        disabled
                        iconColor={props.ticket.mainColor}
                        location={location.location}
                        subtitle={location.subtitle}
                        removeBg
                        online={online.online}
                        online_label={online.online_label}
                        online_sublabel={online.online_sublabel}
                    />
                </motion.div>
                <div>
                    <Subtitle>{props.addonsPurchased}</Subtitle>
                </div>
            </PreviewContainer>
            <Gradient values={props.ticket.gradients} />
        </Wrapper>
    );
};

export default PreviewInfos;
