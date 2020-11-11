import React, { useEffect }        from 'react';
import { useRequest }              from '@frontend/core/lib/hooks/useRequest';
import { StaffAppState }           from '../../../redux';
import { useSelector }             from 'react-redux';
import { TicketsCountResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';
import { Icon }                    from '@frontend/flib-react/lib/components';
import styled, { keyframes }       from 'styled-components';
import { getEnv }                  from '@frontend/core/lib/utils/getEnv';

interface TicketCountFetcherProps {
    uuid: string;
    categoryName: string;
    categoryId: string;
}

export const TicketCategoryCount: React.FC<TicketCountFetcherProps> = ({ uuid, categoryName, categoryId }: TicketCountFetcherProps) => {
    const [
        token,
        checkedGuests,
    ] = useSelector((state: StaffAppState) => [
        state.auth.token.value,
        state.currentEvent.checkedGuests.filter(guest => guest.category === categoryId),
    ]);

    const ticketCategoryCountReq = useRequest<TicketsCountResponseDto>({
        method: 'tickets.count',
        args: [
            token,
            {
                category: {
                    $eq: categoryId
                }
            }
        ],
        refreshRate: 30
    }, uuid);

    useEffect(() => {
        if (ticketCategoryCountReq.response.error) {
            setTimeout(() => ticketCategoryCountReq.force(
                parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10)
            ), 1000);
        }
        // eslint-disable-next-line
    }, [ticketCategoryCountReq.response.error]);
    return <CategoryCountWrapper>
        <span>{categoryName}</span>
        <ScannedCount none={ticketCategoryCountReq.response.data?.tickets?.count === 0}>
            {
                ticketCategoryCountReq.response.data?.tickets?.count > 0 ? <>
                        <span>{checkedGuests.length}</span><span>/{ticketCategoryCountReq.response.data.tickets.count}</span>
                    </> :
                    ticketCategoryCountReq.response.data?.tickets?.count === 0 ?
                        '∅' :
                        <Loader icon={'loader'} size={'16px'} color={'rgba(255,255,255,0.5)'}/>
            }
        </ScannedCount>
    </CategoryCountWrapper>;
};

const CategoryCountWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 18px;
    font-size: 14px;
    background-color: ${props => props.theme.darkerBg};
    padding: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};
    margin-bottom: 2px;
`;

const ScannedCount = styled.div<{ none: boolean }>`
    font-weight: 500;
    padding-top: ${props => props.none ? '0' : props.theme.smallSpacing};

    span:first-child {
        font-size: 24px;
    }

    span:last-child {
        color: ${props => props.theme.textColorDark};
        font-size: 12px;
    }
`;

const loaderRotation = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

const Loader = styled(Icon)`
    animation: ${loaderRotation} 1s linear infinite;
`;
