import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { FormikProvider } from 'formik';

import { Button } from '@frontend/flib-react/lib/components';

import './locales';

import { CategoryFields } from '../../../components/CategoryFields';
import { useCategoryCreation } from './useCategoryCreation';

interface DateItem {
    id: string;
    eventBegin: Date;
    eventEnd: Date;
}

export interface CreateCategoryFormProps {
    dates: DateItem[];
};

export const CreateCategoryForm: React.FC<CreateCategoryFormProps> = ({ dates }) => {
    const { t } = useTranslation(['create_category', 'common']);

    const token = useToken();

    const { onDuplicate, formik } = useCategoryCreation(token, dates);

    return <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit}>
            <Title>{t('category_title')}</Title>
            <CategoryFields
                dateRanges={dates.map(date => ({
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
