import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error, Icon } from '@frontend/flib-react/lib/components';
import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { useTranslation }  from 'react-i18next';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { CategoriesCountTicketResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesCountTicketResponse.dto';
import './locales';
import { MultiDatesTag } from '../MultiDatesTag';

export interface CategoryCardProps {
    id: string;
    name: string;
    link: string;
    seats: number;
    price: number;
    datesInfos: {
        cover: string;
        primaryColor: string;
    }[];
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, link, seats, price, datesInfos }) => {
    const [ t ] = useTranslation('category_card');
    const token = useToken();

    const history = useHistory();

    const [ticketCountUuid] = useState(v4() + '@ticket-count');

    const [ currentCoverIdx, setCurrentCoverIdx ] = useState<number>(0);

    const { response: ticketCountResp, force: forceTicketCount } = useRequest<CategoriesCountTicketResponseDto>({
        method: 'categories.countTickets',
        args: [
            token,
            id,
        ],
        refreshRate: 50,
    }, ticketCountUuid);


    useEffect(() => {
        if (datesInfos?.length > 1) {
            const interval = setInterval(() => {
                setCurrentCoverIdx(coverIdx => {
                    if (coverIdx < datesInfos.length - 1) {
                        return coverIdx + 1
                    }
                    return 0;
                });
            }, 6000);

            return () => clearInterval(interval);
        }
    }, [datesInfos]);

    if (ticketCountResp.loading) {
        return <FullPageLoading/>;
    }

    if (ticketCountResp.error) {
        return <Error message={t('ticket_count_fetch_error')} onRefresh={forceTicketCount}/>;
    }

    return <CategoryCardContainer
    onClick={() => history.push(link)}>
        <EditIcon className={'edit-icon'} icon={'edit'} size={'16px'} color={'white'}/>
        <CoverCarousel cover={datesInfos[currentCoverIdx].cover}>
            {
                datesInfos.length > 1 ? datesInfos.map((_, dateIdx) =>
                    <ProgressBar
                    key={dateIdx}
                    selected={dateIdx === currentCoverIdx}/>
                ) :
                null
            }
        </CoverCarousel>
        <Infos>
            <Title>
                <Name>{name}</Name>
                {
                    datesInfos.length > 1 ?
                    <MultiDatesTag/> :
                    null
                }
            </Title>
            <RemainingTickets color={datesInfos[currentCoverIdx].primaryColor}>
                <strong>{ticketCountResp.data.count}</strong>/{seats}&nbsp;{t('sold_tickets')}
            </RemainingTickets>
        </Infos>
        <Price color={datesInfos[currentCoverIdx].primaryColor}>{price > 0 ? `${price/100}€` : t('free')}</Price>
    </CategoryCardContainer>;
};

const CategoryCardContainer = styled.div`
    position: relative;
    background-color: ${props => props.theme.darkerBg};
    padding: ${props => props.theme.regularSpacing};
    border-radius: ${props => props.theme.defaultRadius};
    display: flex;
    width: 600px;
    cursor: pointer;

    :hover {
        .edit-icon {
            opacity: 1;
        }
    }
`;

const EditIcon = styled(Icon)`
    position: absolute;
    top: ${props => props.theme.smallSpacing};
    right: ${props => props.theme.smallSpacing};
    opacity: 0.2;
`;

const CoverCarousel = styled.div<{ cover: string }>`
    display: flex;
    align-items: flex-start;
    width: 100px;
    height: 100px;
    padding: 2px;
    border-radius: calc(${props => props.theme.defaultRadius} / 2);
    background-image: url(${props => props.cover});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    transition: background-image 300ms ease;
`;

const ProgressBar = styled.div<{ selected: boolean }>`
    flex: 1;
    height: 4px;
    margin: 0 1px;
    border-radius: ${props => props.theme.defaultRadius};
    background-color: ${props => props.selected ? props.theme.textColor : props.theme.textColorDarker};
    transition: background-color 300ms ease;
`;

const Infos = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: ${props => props.theme.regularSpacing};
`;

const Title = styled.div`
    display: flex;
    margin: ${props => props.theme.regularSpacing} 0;
`;

const Name = styled.span`
    margin-right: ${props =>props.theme.smallSpacing};
    font-weight: 600;
`;

const RemainingTickets = styled.span<{ color: string }>`
    font-weight: 500;
    font-size: 12px;

    strong {
        font-size: 20px;
        color: ${props => props.color};
        text-shadow: 0 0 1px ${props => props.color};
        transition: color 300ms ease;
    }
`;

const Price = styled.span<{ color: string }>`
    position: absolute;
    bottom: ${props => props.theme.regularSpacing};
    right: ${props => props.theme.regularSpacing};
    font-size: 20px;
    font-weight: 600;
    color: ${props => props.color};
    text-shadow: 0 0 1px ${props => props.color};
    transition: color 300ms ease;
`;
