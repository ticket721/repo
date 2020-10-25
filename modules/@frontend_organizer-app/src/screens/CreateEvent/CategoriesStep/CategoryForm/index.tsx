import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { useFormikContext } from 'formik';
import { EventCreationPayload } from '@common/global';
import { Button } from '@frontend/flib-react/lib/components';

import { useTranslation } from 'react-i18next';
import './locales';
import { CategoryFields } from './Fields';
import { SaleDeltas } from './Fields/useCategoryCreationFields';
import { MultiDatesTag } from '../MultiDatesTag';

export interface CategoryFormProps {
    idx: number;
    newCategory: boolean;
    onError: boolean;
    onComplete: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ idx, newCategory, onError, onComplete }) => {
    const [t] = useTranslation('category_form');

    const [ duplicateDateIdxs, setDuplicateDateIdxs ] = useState<number[]>([]);
    const [ relativeSaleDeltas, setRelativeSaleDeltas ] = useState<SaleDeltas>(null);

    const formikCtx = useFormikContext<EventCreationPayload>();
    const sigColors = formikCtx.values.imagesMetadata.signatureColors;

    useEffect(() => {
        if (onError) {
            formikCtx.setFieldTouched(`categoriesConfiguration[${idx}].dates`, true);
            formikCtx.setFieldTouched(`categoriesConfiguration[${idx}].saleBegin`, true);
            formikCtx.setFieldTouched(`categoriesConfiguration[${idx}].saleEnd`, true, true);
        }
    // eslint-disable-next-line
    }, [onError, idx]);

    return (
        <CategoryFormContainer>
            <Header>
                <Title isPlaceholder={!formikCtx.values.categoriesConfiguration[idx].name}>
                    <span>{
                       formikCtx.values.categoriesConfiguration[idx].name ?
                       formikCtx.values.categoriesConfiguration[idx].name :
                       t('category_name_placeholder')
                    }</span>
                    {formikCtx.values.categoriesConfiguration[idx].dates.length > 1 ? (
                        <MultiDatesTag />
                    ) : null}
                </Title>
            </Header>
            <CategoryFields idx={idx} sigColors={sigColors} onDuplicate={(dateIdxs, newDeltas) => {
                setDuplicateDateIdxs(dateIdxs);
                setRelativeSaleDeltas(newDeltas);
            }} />
            <ActionButton>
                {
                    newCategory ?
                    <Button
                        title={t('cancel')}
                        variant={'secondary'}
                        onClick={() => {
                            onComplete();
                            formikCtx.setFieldValue(`categoriesConfiguration`,
                                formikCtx.values.categoriesConfiguration.filter((_, catIdx) => catIdx !== idx)
                            );
                        }}
                    /> :
                    null
                }
                <Button
                title={t('confirm')}
                variant={
                    formikCtx.errors.categoriesConfiguration &&
                    formikCtx.errors.categoriesConfiguration[idx]
                        ? 'disabled'
                        : !!sigColors[0] ? 'custom' : 'primary'
                }
                gradients={sigColors}
                onClick={() => {
                    onComplete();

                    if (duplicateDateIdxs.length > 0) {
                        formikCtx.setFieldValue('categoriesConfiguration', [
                            ...formikCtx.values.categoriesConfiguration,
                            ...duplicateDateIdxs.map(dateIdx => ({
                                ...formikCtx.values.categoriesConfiguration[idx],
                                saleBegin: new Date(
                                    formikCtx.values.datesConfiguration[dateIdx].eventEnd.getTime()
                                    - relativeSaleDeltas.beginSaleDelta
                                ),
                                saleEnd: new Date(
                                    formikCtx.values.datesConfiguration[dateIdx].eventEnd.getTime()
                                    - relativeSaleDeltas.endSaleDelta
                                ),
                                dates: [dateIdx],
                            }))
                        ]);
                    }
                }}
                />
            </ActionButton>
        </CategoryFormContainer>
    );
};

const CategoryFormContainer = styled.div`
    position: fixed;
    width: 650px;
    display: flex;
    flex-direction: column;
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => props.theme.biggerSpacing};
    background-color: ${props => props.theme.darkBg};
    font-size: 13px;
    font-weight: bold;
    transition: background-color 300ms;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    top: 10px;
    right: 10px;
    margin-bottom: ${props => props.theme.biggerSpacing};
    text-transform: uppercase;
`;

const Title = styled.span<{ isPlaceholder: boolean }>`
    display: flex;
    align-items: center;

    & > span:first-child {
        color: ${props => props.isPlaceholder ? props.theme.textColorDarker : props.theme.textColor};
        margin-right: ${props => props.theme.smallSpacing};
        padding: 4px 0;
    }
`;

const ActionButton = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: ${(props) => props.theme.doubleSpacing};

    & > button {
        width: calc(40% - ${(props) => props.theme.regularSpacing});
        margin-left: ${(props) => props.theme.biggerSpacing};
    }
`;
