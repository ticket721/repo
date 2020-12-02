import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FormikProvider } from 'formik';

import { Button } from '@frontend/flib-react/lib/components';

import './locales';

import { CategoryFields } from '../../../components/CategoryFields';
import { useCategoryCreation } from './useCategoryCreation';
import { checkFormatDate, formatDay } from '@frontend/core/lib/utils/date';
import { DatesContext } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesContext } from '../../../components/Fetchers/CategoriesFetcher';

export const CreateCategoryView: React.FC = () => {
    const { t } = useTranslation(['create_category', 'common']);

    const { dates, forceFetch: fetchDates } = useContext(DatesContext);
    const { forceFetch: fetchCategories } = useContext(CategoriesContext);

    const { onDuplicate, formik } = useCategoryCreation(
        dates
        .map(date => ({
            id: date.id,
            name: date.metadata.name,
            eventBegin: checkFormatDate(date.timestamps.event_begin),
            eventEnd: checkFormatDate(date.timestamps.event_end),
        })),
        () => {
            fetchDates();
            fetchCategories();
        }
    );

    return <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit}>
            <Title>{t('category_title')}</Title>
            <CategoryFields
                dateRanges={dates.map(date => ({
                    name: `${date.metadata.name.toUpperCase()} | ${formatDay(date.timestamps.event_begin)}`,
                    eventBegin: date.timestamps.event_begin,
                    eventEnd: date.timestamps.event_end,
                }))}
                onDuplicate={onDuplicate}
            />
            <SubmitButton
                type={'submit'}
                variant={(
                    formik.isValid
                    && JSON.stringify(formik.values) !== JSON.stringify(formik.initialValues)
                ) ? 'primary' : 'disabled'}
                title={t('create_category_btn')}
            />
        </Form>
    </FormikProvider>
}

const Form = styled.form`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 600px;

    .location-map {
        z-index: 0;
        margin-top: ${props => props.theme.biggerSpacing};
        border-radius: ${props => props.theme.defaultRadius};
        overflow: hidden;
    }
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.theme.textColor};
    margin-bottom: ${(props) => props.theme.doubleSpacing};
    text-align: left;
    width: 100%;
`;

const SubmitButton = styled(Button)`
    margin-top: ${props => props.theme.doubleSpacing};
`;
