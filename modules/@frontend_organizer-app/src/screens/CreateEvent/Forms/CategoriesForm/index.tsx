import React, { useState } from 'react';
import styled                       from 'styled-components';
import { useFormikContext } from 'formik';
import { CategoryCreationPayload, EventCreationPayload } from '@common/global';
import { Scroll } from 'framer';
import { CategoryForm } from './CategoryForm';
import { ConfirmDeletion } from './ConfirmDeletion';
import { CategoriesByDate } from './CategoriesByDate';
import { Button, SelectInput, SelectOption } from '@frontend/flib-react/lib/components';
import { formatShort } from '@frontend/core/lib/utils/date';

import { useTranslation } from 'react-i18next';
import './locales';

const initialCategory: CategoryCreationPayload = {
    name: '',
    saleBegin: null,
    saleEnd: null,
    seats: null,
    price: null,
    currency: '',
    dates: [],
}

export const CategoriesForm: React.FC = () => {
    const [ t ] = useTranslation('categories_form');

    const allDatesOpt = {
        label: t('all_dates'),
        value: 'all',
    };

    const [ currentEditingCategory, setCurrentEditingCategory ] = useState<number>(-1);
    const [ currentDeletingCategory, setCurrentDeletingCategory ] = useState<number>(-1);
    const [ newCategory, setNewCategory ] = useState<boolean>(false);

    const [ onError, setOnError ] = useState<boolean>(false);

    const [ selectedDate, setSelectedDate ] = useState<SelectOption>(allDatesOpt);

    const formikCtx = useFormikContext<EventCreationPayload>();

    const addCategory = () => {
        const categoryCount = formikCtx.values.categoriesConfiguration.length;
        setCurrentEditingCategory(categoryCount);
        formikCtx.setFieldValue(`categoriesConfiguration[${categoryCount}]`, {
            ...initialCategory,
            currency: 'EUR',
        });
        setNewCategory(true);
    };

    return <StyledForm>
        {
            formikCtx.values.categoriesConfiguration.length > 0 ?
            <CategoriesContainer>
                <SelectInput
                label={t('categories_by_date_label')}
                options={formikCtx.values.datesConfiguration.map((date, idx) => ({
                    label: `date n•${idx + 1} - ${formatShort(date.eventBegin)} => ${formatShort(date.eventEnd)}`,
                    value: idx.toString(),
                }))}
                allOpt={allDatesOpt}
                value={[selectedDate]}
                onChange={(opt) => setSelectedDate(opt[0])} />
                <Delimiter/>
                <Scroll
                position={'static'}
                width={'100%'}
                wheelEnabled={true}
                style={{
                    maxHeight: 'calc(100vh - 460px)'
                }}
                height={'auto'}>
                    <CategoriesByDate
                    selectedDate={selectedDate.value === allDatesOpt.value ? undefined : parseInt(selectedDate.value, 10)}
                    editingCategory={currentEditingCategory}
                    updateEditingCategory={(idx, errorState) => {
                        setCurrentEditingCategory(idx);
                        setOnError(errorState);
                    }}
                    updateDeletingCategory={setCurrentDeletingCategory} />
                </Scroll>
                <Delimiter/>
            </CategoriesContainer> :
            null
        }
        {
            currentEditingCategory > -1 ?
            <DisabledBg>
                <CategoryForm
                idx={currentEditingCategory}
                newCategory={newCategory}
                onError={onError}
                onComplete={() => {
                    setCurrentEditingCategory(-1);
                    setNewCategory(false);
                }}/>
            </DisabledBg> :
            <AddCategory>
                <Button
                title={t('add_new_category')}
                variant={'custom'}
                gradients={formikCtx.values.imagesMetadata.signatureColors}
                onClick={addCategory} />
            </AddCategory>
        }
        {
            currentDeletingCategory > -1 ?
            <ConfirmDeletion
            idx={currentDeletingCategory}
            complete={() => setCurrentDeletingCategory(-1)}/> :
            null
        }
    </StyledForm>;
};

const StyledForm = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const CategoriesContainer = styled.div`
    & > div:first-child {
        margin-bottom: ${props => props.theme.regularSpacing};
    }
`;

const Delimiter = styled.div`
    position: relative;
    left: -10px;
    width: calc(100% + 20px);
    height: 1px;
    background-color: rgba(255, 255, 255, 0.2);
    z-index: 1;
`;

const DisabledBg = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);
`;

const AddCategory = styled.div`
    width: 50%;
    margin-top: ${props => props.theme.smallSpacing};
`;
