import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { FormikProvider } from 'formik';

import { FullPageLoading, Error as ErrorComponent, Button } from '@frontend/flib-react/lib/components';

import './locales';

import { categoryParam } from '../../types';
import { CategoryFields } from '../../../components/CategoryFields';
import { useCategoryEdition } from './useCategoryEdition';
import { formatDay } from '@frontend/core/lib/utils/date';

interface DateItem {
    id: string;
    name: string;
    eventBegin: Date;
    eventEnd: Date;
}

export interface EditCategoryFormProps {
    dates: DateItem[];
};

export const EditCategoryForm: React.FC<EditCategoryFormProps> = ({ dates }) => {
    const { t } = useTranslation(['edit_category', 'common']);

    const token = useToken();
    const { categoryId } = useParams<categoryParam>();

    const { loading, error, forceCategoryReq, onDuplicate, formik } = useCategoryEdition(token, categoryId, dates);

    if (loading) {
        return <FullPageLoading/>;
    }

    if (error) {
        return <ErrorComponent
            message={t('common:error_cannot_fetch', { entity: 'date'})}
            retryLabel={t('common:retrying_in')}
            onRefresh={forceCategoryReq}
        />;
    }

    return <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit}>
            <Title>{t('category_title')}</Title>
            <CategoryFields
                dateRanges={dates.map(date => ({
                    name: `${date.name.toUpperCase()} | ${formatDay(date.eventBegin)}`,
                    eventBegin: date.eventBegin,
                    eventEnd: date.eventEnd,
                }))}
                onDuplicate={onDuplicate}
            />
            <SubmitButton
                type={'submit'}
                variant={(
                    formik.isValid
                    && JSON.stringify(formik.values) !== JSON.stringify(formik.initialValues)
                ) ? 'primary' : 'disabled'}
                title={t('edit_category_btn')}
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
