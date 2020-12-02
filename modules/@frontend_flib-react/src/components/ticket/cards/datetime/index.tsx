import * as React from 'react';
import styled from '../../../../config/styled';
import CardContainer from '../../../elements/card-container';
import Separator from '../../../elements/separator';
import Icon from '../../../icon';
import { useEffect, useState } from 'react';

interface EventDates {
    id?: string;
    name?: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    location?: string;
}

export interface DateTimeCardProps extends React.ComponentProps<any> {
    dates: EventDates[];
    label?: string;
    labelCollapse?: string;
    iconColor?: string;
    removeBg?: boolean;
    wSeparator?: boolean;
    onClick?: (dateId: string) => void;
    small?: boolean;
    smallContent?: boolean;
    paddingOverride?: string;
}

const TileContainer = styled.div<{ datesHeight: string }>`
    height: auto;
    width: 100%;
    overflow: hidden;
    max-height: ${(props) => props.datesHeight};
    transition: max-height 300ms ease-out;

    &.collapsed {
        width: calc(100% - ${(props) => props.theme.doubleSpacing} - 1px);
        max-height: 38px;
    }
`;

const Info = styled.span`
    &:last-of-type {
        color: ${(props) => props.theme.textColorDark};
        margin-top: 8px;
    }

    &:first-of-type {
        color: ${(props) => props.theme.textColor};
        margin-top: 2px;
    }
`;

const DatesRange = styled.div<DateTimeCardProps>`
    display: flex;
    flex-direction: column;
`;

const IconContainer = styled.div`
    margin-right: ${(props) => props.theme.regularSpacing};
`;

const Collapser = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: ${(props) => props.theme.regularSpacing};
    color: ${(props) => props.theme.textColor};
`;

const Chevron = styled(Icon)<{ collapsed: boolean }>`
    display: inline-block;
    margin-left: ${(props) => props.theme.smallSpacing};
    transform: rotateX(${(props) => (props.collapsed ? '0deg' : '180deg')});
    transition: transform 200ms;
    color: ${(props) =>
        props.color ? (typeof props.color === 'string' ? props.color : props.color.hexCodes[0]) : null};
`;

export const DateTimeCard: React.FunctionComponent<DateTimeCardProps & { className?: string }> = (
    props: DateTimeCardProps,
): JSX.Element => {
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const [collapsing, setCollapsing] = useState<boolean>(false);
    const [datesHeight, setDatesHeight] = useState<string>('');

    useEffect(() => setDatesHeight(props.dates.length * 136 + 'px'), []);

    return (
        <CardContainer
            paddingOverride={props.paddingOverride}
            small={props.small}
            removeBg={!collapsed || props.removeBg}
            className={props.className}
        >
            {collapsed ? (
                <IconContainer>
                    <Icon icon={'calendar'} size={'16px'} color={props.iconColor} />
                </IconContainer>
            ) : null}
            <TileContainer className={collapsing || collapsed ? 'collapsed' : undefined} datesHeight={datesHeight}>
                <DatesRange
                    onClick={() => (props.dates.length > 1 ? setCollapsed(false) : null)}
                    iconColor={props.iconColor}
                >
                    {props.dates[0].startDate === props.dates[props.dates.length - 1].endDate ? (
                        <>
                            <Info>{props.dates[0].startDate}</Info>
                            <Info
                                style={{
                                    fontWeight: 400,
                                }}
                            >
                                {props.dates[0].startTime}
                                <Icon icon={'arrow'} size={'12px'} />
                                {props.dates[props.dates.length - 1].endTime}
                            </Info>
                        </>
                    ) : (
                        <>
                            <Info>
                                {props.dates[0].startDate} - {props.dates[0].startTime}
                            </Info>
                            {!props.smallContent ? (
                                <Info
                                    style={{
                                        fontWeight: 400,
                                    }}
                                >
                                    {props.dates[props.dates.length - 1].endDate} -{' '}
                                    {props.dates[props.dates.length - 1].endTime}
                                </Info>
                            ) : null}
                        </>
                    )}
                </DatesRange>
            </TileContainer>
            {props.dates.length > 1 ? (
                <Collapser
                    onClick={() => {
                        if (collapsed) {
                            setCollapsed(false);
                        } else {
                            setCollapsing(true);
                            setTimeout(() => {
                                setCollapsing(false);
                                setCollapsed(true);
                            }, 300);
                        }
                    }}
                >
                    {collapsed ? props.label : props.labelCollapse}
                    <Chevron color={'rgba(255,255,255,0.9)'} collapsed={collapsed} icon={'chevron'} size={'10px'} />
                </Collapser>
            ) : null}
            {props.wSeparator && <Separator />}
        </CardContainer>
    );
};

export default DateTimeCard;
