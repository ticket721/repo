import { EventCreationPayload } from '@common/global';
import { useFormikContext } from 'formik';
import React from 'react';
import styled from 'styled-components';

import { useTranslation }     from 'react-i18next';
import './locales';
import { Button, Popup } from '@frontend/flib-react/lib/components';

export interface ConfirmDeletionProps {
    idx: number;
    complete: () => void;
}

export const ConfirmDeletion: React.FC<ConfirmDeletionProps> = ({ idx, complete }) => {
    const [ t ] = useTranslation('confirm_date_deletion');
    const formikCtx = useFormikContext<EventCreationPayload>();
    const sigColors = formikCtx.values.imagesMetadata.signatureColors;

    const affectingCategories = formikCtx.values.categoriesConfiguration
    .filter(category => category.dates.includes(idx));

    const deleteDate = () => {
        updateCategories();
        formikCtx.setFieldTouched(
            'datesConfiguration',
            undefined
        );
        formikCtx.setFieldValue(
            'datesConfiguration',
            formikCtx.values.datesConfiguration.filter((_, dateIdx) => dateIdx !== idx)
        );
        complete();
    };

    const updateCategories = () => {
        const updatedCategories = formikCtx.values.categoriesConfiguration
        .map(category => ({
            ...category,
            // remove deleted date idx and decrement each following date idxs
            dates: category.dates
                .filter(dateIdx => dateIdx !== idx)
                .map(dateIdx => dateIdx > idx ? dateIdx - 1 : dateIdx),
        }))
        .filter(category => category.dates.length > 0);

        formikCtx.setFieldValue(
            'categoriesConfiguration',
            updatedCategories
        );
    };

    return <Popup>
        <Msg>{t('confirmation_msg')} <span>{formikCtx.values.datesConfiguration[idx].name}</span></Msg>
        {
            affectingCategories.length > 0 ?
            <>
                <CatMsg>{t(affectingCategories.length > 1 ? 'affecting_categories' : 'affecting_category')}:</CatMsg>
                <Categories>
                    {
                        affectingCategories
                        .map((category, catIdx) =>
                            <Category key={'affecting-category-' + catIdx}>
                                {category.dates.length > 1 ? '🚧' : '🗑️'} {category.name}
                            </Category>
                        )
                    }
                </Categories>
            </> :
            null
        }
        <Actions>
            <Button
            onClick={complete}
            title={t('cancel')}
            variant={'secondary'} />
            <Button
            onClick={deleteDate}
            title={t('confirm')}
            variant={'custom'}
            gradients={sigColors} />
        </Actions>
    </Popup>
}

const Msg = styled.div`
    text-align: center;

    & > span {
        font-weight: 600;
        text-transform: uppercase;
    }
`;

const CatMsg = styled.div`
    margin-top: ${props => props.theme.regularSpacing};
    font-size: 14px;
    line-height: 20px;
`;

const Categories = styled.ul`
    margin-top: ${props => props.theme.smallSpacing};
`;

const Category = styled.li`
    text-transform: uppercase;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
    margin-left: ${props => props.theme.smallSpacing};
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-top: ${props => props.theme.biggerSpacing};

    & > button:last-child {
        margin-left: ${props => props.theme.regularSpacing};
    }
`;
