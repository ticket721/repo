import React                   from 'react';
import styled                  from 'styled-components';
import { TicketHeader }        from '@frontend/flib-react/lib/components/ticket';
import TicketPreview           from '@frontend/flib-react/lib/components/ticket/infos';
import { useTranslation }      from 'react-i18next';
import './locales';
import { useHistory }     from 'react-router';
import { Frame } from 'framer';
import { formatDay, formatHour } from '@frontend/core/lib/utils/date';
import { DateItem, CategoryItem } from '../interfaces';
import { useNavigation } from 'framer';
import { TicketDetails } from '../../Ticket/TicketDetails';

interface TicketCardProps {
    ticketId: string;
    transactionHash: string;
    category: CategoryItem;
    dates: DateItem[];
    currentDateIdx: number;
}

const TicketCard = ({
    ticketId,
    transactionHash,
    category,
    dates,
    currentDateIdx,
}: TicketCardProps) => {
    const history = useHistory();
    const nav = useNavigation();
    const [t] = useTranslation('ticket');

    return (
        <TicketFrame
        width={'100%'}
        height={'fit-content'}
        backgroundColor={'transparent'}
        onTap={() => nav.overlay(
            <TicketDetails 
            name={dates[currentDateIdx].name}
            image={dates[currentDateIdx].imageId}
            dateId={dates[currentDateIdx].id}
            dates={dates}
            colors={dates[currentDateIdx].colors}
            categoryName={category.name}
            ticketId={ticketId}
            transactionHash={transactionHash}
            price={category.price}
            purchasedDate={category.purchasedDate}/>)
        }>
            <TicketHeader cover={dates[currentDateIdx].imageId}/>
            <PullUp>
                <TicketPreview ticket={{
                    ticketId,
                    name: dates[currentDateIdx].name,
                    mainColor: dates[currentDateIdx].colors[0],
                    gradients: dates[currentDateIdx].colors,
                    location: dates[currentDateIdx].location,
                    categoryName: category.name,
                    startDate: formatDay(dates[currentDateIdx].startDate),
                    endDate: formatDay(dates[currentDateIdx].endDate),
                    startTime: formatHour(dates[currentDateIdx].startDate),
                    endTime: formatHour(dates[currentDateIdx].endDate),
                    image: dates[currentDateIdx].imageId,
                }} addonsPurchased={t('no_addons')}/>
            </PullUp>
        </TicketFrame>
    );
};

const TicketFrame = styled(Frame)`
    border-bottom-left-radius: ${props => props.theme.smallSpacing};
    border-bottom-right-radius: ${props => props.theme.smallSpacing};
    overflow: hidden;
`;

const PullUp = styled.div`
    position: relative;
    top: -${props => props.theme.doubleSpacing};
    margin-bottom: -${props => props.theme.doubleSpacing};
`;

export default TicketCard;
