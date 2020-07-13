import * as React from 'react';
import styled from '../../../config/styled';
import TicketInterface from '../../../shared/ticketInterface';
import LocationCard from '../cards/location';
import DateTimeCard from '../cards/datetime';
import Gradient from '../../elements/gradient';

export interface PreviewInfosProps extends React.ComponentProps<any> {
    ticket: TicketInterface;
    addonsPurchased?: string;
    bgColor?: string;
}

const Wrapper = styled.div`
    position: relative;
`;

const PreviewContainer = styled.main`
    background: linear-gradient(180deg, ${(props) => props.theme.darkBg}, ${(props) => props.theme.darkerBg});
    border-bottom-left-radius: ${(props) => props.theme.defaultRadius};
    border-top-left-radius: ${(props) => props.theme.defaultRadius};
    font-size: 14px;
    font-weight: 500;
    padding: 12px 0;
    width: calc(100% - 8px);
`;

const TicketHeaderInfos = styled.div`
    background-image: linear-gradient(180deg, ${(props) => props.theme.darkBg}, ${(props) => props.theme.darkerBg});
    border-top-right-radius: ${(props) => props.theme.defaultRadius};
    padding: ${(props) => props.theme.doubleSpacing} ${(props) => props.theme.biggerSpacing}
        ${(props) => props.theme.biggerSpacing};

    h2 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${(props) => props.theme.textColor};
        font-size: 1rem;
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
    content: '';
    display: block;
    height: 2px;
    position: relative;
    width: calc(100% + 8px);
    z-index: 100;

    &::before {
        background-color: ${(props) => props.bgColor || '#0b0912'};
        content: '';
        display: inline-block;
        height: ${(props) => props.theme.regularSpacing};
        position: absolute;
        top: -7px;
        transform: rotate(45deg);
        width: ${(props) => props.theme.regularSpacing};
    }

    &::before {
        left: -8px;
    }
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
    return (
        <Wrapper>
            <TicketHeaderInfos>
                <h2>{props.ticket.name}</h2>
                <h3>{props.ticket.ticketType}</h3>
            </TicketHeaderInfos>
            <Separator bgColor={props.bgColor} />
            <PreviewContainer>
                <DateTime
                    dates={[
                        {
                            startDate: props.ticket.startDate,
                            endDate: props.ticket.endDate,
                            startTime: props.ticket.startTime,
                            endTime: props.ticket.endTime,
                        },
                    ]}
                    iconColor={props.ticket.mainColor}
                    removeBg
                    small
                />
                <Location disabled iconColor={props.ticket.mainColor} location={props.ticket.location} removeBg />
                <div>
                    <Subtitle>{props.addonsPurchased}</Subtitle>
                </div>
            </PreviewContainer>
            <Gradient values={props.ticket.gradients} />
        </Wrapper>
    );
};

export default PreviewInfos;
