import React, { useContext } from 'react';
import { useTranslation }  from 'react-i18next';
import { Button } from '@frontend/flib-react/lib/components';
import styled              from 'styled-components';
import './locales';
import { DateCard } from './DateCard';
import { useHistory } from 'react-router';
import { PreviewBanner } from '../../../components/PreviewBanner';
import { EventsContext } from '../../../components/Fetchers/EventsFetcher';
import { DatesContext} from '../../../components/Fetchers/DatesFetcher';
import { CategoriesContext } from '../../../components/Fetchers/CategoriesFetcher';

export const DatesView: React.FC<{ eventId: string }> = ({ eventId }) => {
    const [ t ] = useTranslation('dates_dashboard');

    const history = useHistory();

    const { events } = useContext(EventsContext);
    const { dates, forceFetch: fetchDates } = useContext(DatesContext);
    const { categories, forceFetch: fetchCategories } = useContext(CategoriesContext);

    return (
        <>
        <PreviewBanner status={events[0].status}/>
        <DatesDashboardContainer>
            {
                dates.length > 0 ?
                dates.map(date =>
                    <DateCard
                    key={date.id}
                    eventId={eventId}
                    id={date.id}
                    eventStatus={events[0].status}
                    status={date.status}
                    name={date.metadata.name}
                    begin={date.timestamps.event_begin}
                    end={date.timestamps.event_end}
                    online={date.online}
                    avatar={date.metadata.avatar}
                    colors={date.metadata.signature_colors}
                    categories={categories.filter(category => category.dates.includes(date.id))}
                    forceRefresh={() => {
                        fetchDates();
                        fetchCategories();
                    }}
                    />
                ) :
                <NoDate>
                    <NoDateMsg>{t('no_date_msg')}</NoDateMsg>
                    <Button
                    title={t('create_date')}
                    variant={'primary'}
                    onClick={() => history.push(`/event/${eventId}/date`)}/>
                </NoDate>
            }
        </DatesDashboardContainer>
        </>
    )
};

const DatesDashboardContainer = styled.div`
    width: calc(100% - 100px);
    display: flex;
    flex-wrap: wrap;

    & > div {
        margin-bottom: 48px;
        margin-right: ${props => props.theme.doubleSpacing};
    }

    @media screen and (min-width: 1500px) {
        & > div:nth-child(3n+3) {
            margin-right: 0;
        }
    }

    @media screen and (max-width: 1500px) {
        & > div:nth-child(2n+2) {
            margin-right: 0;
        }
    }

    @media screen and (max-width: 900px) {
        & > div {
            margin-right: 0;
        }
    }
`;

const NoDate = styled.div`
    width: 100%;
    height: calc(100vh - 264px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    button {
        width: 280px;
    }
`;

const NoDateMsg = styled.span`
    color: ${props => props.theme.textColorDarker};
    margin-bottom: ${props => props.theme.biggerSpacing};
    font-weight: 400;
`;
