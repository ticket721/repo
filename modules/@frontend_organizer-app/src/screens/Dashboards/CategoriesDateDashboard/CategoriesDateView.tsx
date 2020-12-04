import React, { useContext } from 'react';
import { useTranslation }  from 'react-i18next';
import { Button } from '@frontend/flib-react/lib/components';
import styled              from 'styled-components';
import './locales';
import { CategoryCard } from '../../../components/CategoryCard';
import { useHistory } from 'react-router';
import { PreviewBanner } from '../../../components/PreviewBanner';
import { DatesContext } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesContext } from '../../../components/Fetchers/CategoriesFetcher';
import { EventsContext } from '../../../components/Fetchers/EventsFetcher';

export const CategoriesDateView: React.FC<{ eventId: string, dateId: string }> = ({ eventId, dateId }) => {
    const [ t ] = useTranslation('categories_date_dashboard');

    const history = useHistory();

    const { events } = useContext(EventsContext);
    const { dates } = useContext(DatesContext);
    const { categories, forceFetch: fetchCategories } = useContext(CategoriesContext);

    return <CategoriesDashboardContainer>
        <PreviewBanner status={events[0].status}/>
        <Title>{t('categories_of')}&nbsp;<strong>{dates.find(date => date.id === dateId).metadata.name}</strong></Title>
        {
            categories.length > 0 ?
                categories.map(category =>
                    <CategoryCard
                        key={category.id}
                        eventId={eventId}
                        id={category.id}
                        status={category.status}
                        name={category.display_name}
                        link={`/event/${eventId}/date/${dateId}/category/${category.id}`}
                        seats={category.seats}
                        price={category.price}
                        datesInfos={
                            dates
                                .filter(date => category.dates.includes(date.id))
                                .map(date => ({
                                    cover: date.metadata.avatar,
                                    colors: date.metadata.signature_colors,
                                }))
                        }
                        forceRefresh={fetchCategories}
                    />
                ) :
                <NoCategory>
                    <NoCategoryMsg>{t('no_category_msg')}</NoCategoryMsg>
                    <Button
                        title={t('create_category')}
                        variant={'primary'}
                        onClick={() => history.push(`/event/${eventId}/date/${dateId}/category`)}/>
                </NoCategory>
        }
    </CategoriesDashboardContainer>;
};

const CategoriesDashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: 500;

    & > div {
        margin-bottom: 48px;
    }
`;

const Title = styled.span`
    width: 100%;
    font-size: 20px;
    margin-bottom: 48px;

    strong {
        text-transform: uppercase;
    }
`;

const NoCategory = styled.div`
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

const NoCategoryMsg = styled.span`
    color: ${props => props.theme.textColorDarker};
    margin-bottom: ${props => props.theme.biggerSpacing};
    font-weight: 400;
`;
