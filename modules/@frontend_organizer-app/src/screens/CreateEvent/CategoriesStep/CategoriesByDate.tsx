import React from 'react';
import { CategoryCreationPayload, EventCreationPayload } from '@common/global';
import { useFormikContext } from 'formik';
import styled from 'styled-components';
import { formatShort } from '@frontend/core/lib/utils/date';
import { CategoryCard } from './CategoryCard';

import { useTranslation } from 'react-i18next';
import './locales';

export interface CategoriesByDateProps {
    selectedDate?: number;
    editingCategory: number;
    updateEditingCategory: (idx: number, onError?: boolean) => void;
    updateDeletingCategory: (idx: number) => void;

}

export const CategoriesByDate: React.FC<CategoriesByDateProps> = ({
    selectedDate,
    editingCategory,
    updateEditingCategory,
    updateDeletingCategory,
}) => {
    const [ t ] = useTranslation('categories_form');

    const formikCtx = useFormikContext<EventCreationPayload>();
    const filtered = selectedDate !== undefined;

    const buildCategories = (categories: { idx: number, category: CategoryCreationPayload }[], noCategoriesMsg: string) => {
        const filteredCategories = categories
            .filter(catByIdx => !!catByIdx)
            .filter(({idx}) => idx !== editingCategory);

        if (filteredCategories.length === 0) {
            return <NoCategories>{t(noCategoriesMsg)}</NoCategories>;
        }

        return filteredCategories.map(({idx, category}) => (
            <CategoryCard
            key={`category-${category.name}-${idx}`}
            idx={idx}
            onEdition={(onError) => updateEditingCategory(idx, onError)}
            triggerDelete={() => updateDeletingCategory(idx)}/>
        ));
    }

    const buildCategoriesByDate = (dateIdx: number) => {
        const categories = formikCtx.values.categoriesConfiguration
            .map((category, idx) => {
                if (category.dates.length > 1 || !category.dates.includes(dateIdx)) return null;
                return {idx, category};
            });

        return buildCategories(categories, 'no_category');
    }

    const buildMultiDatesCategories = () => {
        const categories = formikCtx.values.categoriesConfiguration
            .map((category, idx) => {
                if (
                    category.dates.length <= 1
                    || (filtered && !category.dates.includes(selectedDate))
                ) return null;
                return {idx, category};
            });

        return buildCategories(categories, 'no_multi_dates_category');
    }

    return <CategoriesByDateContainer>
        {
            formikCtx.values.datesConfiguration.length > 0 ?
                formikCtx.values.datesConfiguration
                .filter((_, dateIdx) => !filtered || dateIdx === selectedDate)
                .map((date, dateIdx) =>
                    <FilteredCategories
                    key={`byDate-${dateIdx}`}
                    filtered={filtered}>
                        {
                            !filtered ?
                            <DateTitle>date n•{dateIdx + 1} - {formatShort(date.eventBegin)} =&gt; {formatShort(date.eventEnd)}</DateTitle> :
                            null
                        }
                        {
                            buildCategoriesByDate(filtered ? selectedDate : dateIdx)
                        }
                    </FilteredCategories>
                ) :
                null
        }
        {
            formikCtx.values.datesConfiguration.length > 1 ?
            <FilteredCategories
            key={'multiDates'}
            filtered={filtered}>
                <DateTitle>{t('multi_dates_categories_label')}</DateTitle>
                {
                    buildMultiDatesCategories()
                }
            </FilteredCategories> :
            null
        }
    </CategoriesByDateContainer>
};

const CategoriesByDateContainer = styled.div`
    padding-top: ${props => props.theme.regularSpacing};

    & > div {
        margin-bottom: ${props => props.theme.biggerSpacing};
    }
`;

const DateTitle = styled.div`
    font-weight: 500;
    text-transform: uppercase;
`;

const FilteredCategories = styled.div<{ filtered: boolean }>`
    margin-top: ${props => props.filtered ? '0' : `${props.theme.regularSpacing}`};

    &:not(:last-child) {
        border-bottom: ${props => props.filtered ? 'none' : `1px solid ${props.theme.componentColorLighter}`};
    }

    & > div {
        margin-bottom: ${props => props.theme.regularSpacing};
    }
`;

const NoCategories = styled.div`
    margin-top: ${props => props.theme.smallSpacing};
    text-align: center;
    color: ${props => props.theme.textColorDarker};
`;
