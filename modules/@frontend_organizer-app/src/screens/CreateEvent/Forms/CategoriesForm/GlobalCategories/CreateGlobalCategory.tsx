import React, { useState } from 'react';
import { Button } from '@frontend/flib-react/lib/components';

import { CategoryForm, CategoryItem } from '../../../../../components/CategoryForm';
import { FormCard }                   from '../../../../../components/FormCard';

import { useTranslation } from 'react-i18next';
import '../locales';

interface CreateGlobalCategoryProps {
    editable: boolean;
    maxDate?: Date;
    onCategoryCreate: (category: CategoryItem) => void;
}

export const CreateGlobalCategory: React.FC<CreateGlobalCategoryProps> = (props: CreateGlobalCategoryProps) => {
    const [ t ] = useTranslation('categories');
    const [ edit, setEdit ] = useState(null);

    return (
        <>
            {
                edit ?
                    <FormCard
                    name={''}
                    edit={true}
                    editable={false}
                    setEdit={() => null}>
                        <CategoryForm
                        newItem={true}
                        maxDate={props.maxDate}
                        cancel={() => setEdit(false)}
                        confirm={(category: CategoryItem) => {
                            props.onCategoryCreate(category);
                            setEdit(false);
                        }}/>
                    </FormCard> :
                    null
            }
            {
                props.editable && !edit ?
                    <Button
                        title={t('create_category')}
                        variant={'secondary'}
                        onClick={() => setEdit(true)}/>
                    :
                    null
            }
        </>
    );
};
