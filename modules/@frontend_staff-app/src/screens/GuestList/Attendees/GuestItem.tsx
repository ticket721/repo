import React          from 'react';
import styled         from 'styled-components';
import { formatHour, formatDay } from '@frontend/core/lib/utils/date';

interface GuestItemProps {
    email: string;
    name: string;
    category: string;
    checkedDate?: Date;
}

export const GuestItem: React.FC<GuestItemProps> = ({
    email,
    name,
    category,
    checkedDate,
}: GuestItemProps) => (
    <GuestWrapper>
        <GuestInfos>
            <Username>{name}</Username>
            <Email>{email}</Email>
            <Category>{category}</Category>
        </GuestInfos>
        {
            checkedDate ?
                <Timestamp>
                    <span>{formatHour(checkedDate)}</span>
                    <span>{formatDay(checkedDate)}</span>
                </Timestamp> :
                null
        }
    </GuestWrapper>
);

const GuestWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: ${props => props.theme.biggerSpacing};
    margin-bottom: 2px;
    background-color: ${props => props.theme.darkerBg};
`;

const GuestInfos = styled.div`
    display: flex;
    flex-direction: column;
    font-weight: 500;
`;

const Username = styled.span``;

const Email = styled.span`
    margin: ${props => props.theme.smallSpacing} 0 ${props => props.theme.regularSpacing};
    font-size: 12px;
    color: ${props => props.theme.textColorDarker};
`;

const Category = styled.span`
    color: ${props => props.theme.textColorDark};
`;

const Timestamp = styled.div`
    display: flex;
    flex-direction: column;
    text-align: right;
    color: ${props => props.theme.textColorDark};
    font-weight: 500;

    span:last-child {
        margin-top: ${props => props.theme.smallSpacing};
        color: ${props => props.theme.textColorDarker};
    }
`;
