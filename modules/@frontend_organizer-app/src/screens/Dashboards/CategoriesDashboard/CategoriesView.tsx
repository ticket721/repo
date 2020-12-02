import React, { useContext } from 'react';
import { useTranslation }  from 'react-i18next';
import './locales';
import { Button } from '@frontend/flib-react/lib/components';
import styled              from 'styled-components';
import { CategoryCard } from '../../../components/CategoryCard';
import { useHistory } from 'react-router';
import { PreviewBanner } from '../../../components/PreviewBanner';
import { DatesContext } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesContext } from '../../../components/Fetchers/CategoriesFetcher';
import { EventsContext } from '../../../components/Fetchers/EventsFetcher';

export const CategoriesView: React.FC = () => {
    const [ t ] = useTranslation('categories_dashboard');
    const history = useHistory();

    const { events } = useContext(EventsContext);
    const { dates } = useContext(DatesContext);
    const { categories, forceFetch: fetchCategories } = useContext(CategoriesContext);

    return (
        <CategoriesDashboardContainer>
            <PreviewBanner status={events[0].status}/>
            <Title>{t('categories_of')}&nbsp;<strong>{events[0].name}</strong></Title>
            {
                categories.filter(category => dates.length > 1 ? category.dates.length > 1 : true).length > 0 ?
                categories.filter(category => dates.length > 1 ? category.dates.length > 1 : true).map(category =>
                    <CategoryCard
                    key={category.id}
                    eventId={events[0].id}
                    id={category.id}
                    status={category.status}
                    name={category.display_name}
                    link={`/event/${events[0].id}/category/${category.id}`}
                    seats={category.seats}
                    price={category.price}
                    datesInfos={
                        dates
                        .filter(date => category.dates.includes(date.id))
                        .map(date => ({
                            cover: date.metadata.avatar,
                            colors: date.metadata.signature_colors
                        }))
                    }
                    forceRefresh={fetchCategories}
                    />
                ) :
                <NoMultiDatesCategory>
                    <NoCategoryMsg>{t('no_category_msg')}</NoCategoryMsg>
                    <Button
                    title={t('create_category')}
                    variant={'primary'}
                    onClick={() => history.push(`/event/${events[0].id}/category`)}/>
                </NoMultiDatesCategory>
            }
        </CategoriesDashboardContainer>
    )
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

const NoMultiDatesCategory = styled.div`
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
