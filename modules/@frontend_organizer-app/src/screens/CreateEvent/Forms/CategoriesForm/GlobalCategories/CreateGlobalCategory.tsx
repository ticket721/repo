import React, { useState } from 'react';
import { Button } from '@frontend/flib-react/lib/components';

import { CategoryItem }                 from '../index';
import { CategoryForm }                 from '../CategoryForm';
import { FormCard }                              from '../../FormCard';

interface CreateGlobalCategoryProps {
    editable: boolean;
    onCategoryCreate: (category: CategoryItem) => void;
}

export const CreateGlobalCategory: React.FC<CreateGlobalCategoryProps> = (props: CreateGlobalCategoryProps) => {
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
                        title={'Create New Category'}
                        variant={'secondary'}
                        onClick={() => setEdit(true)}/>
                    :
                    null
            }
        </>
    );
};
