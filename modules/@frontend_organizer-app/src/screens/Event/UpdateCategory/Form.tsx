import React, { useEffect, useState }        from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';
import { MergedAppState }           from '../../../index';
import { useDeepEffect }            from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }         from '@frontend/core/lib/redux/ducks/notifications';
import { CategoryEntity }             from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { CategoryForm, CategoryItem } from '../../../components/CategoryForm';

interface UpdateCategoryFormProps {
    uuid: string;
    categoryId: string;
    initialValues: CategoryEntity,
    maxDate: Date;
}

export const UpdateCategoryForm: React.FC<UpdateCategoryFormProps> = (props: UpdateCategoryFormProps) => {
    const [ lastInitialValues, setLastInitialValues ] = useState<CategoryItem>(null);
    const [ loadingState, setLoadingState ] = useState<boolean>(false);
    const dispatch = useDispatch();

    const token = useSelector((state: MergedAppState): string => state.auth.token.value);
    const { lazyRequest: updateCategory, response: updateResponse } = useLazyRequest('categories.update', props.uuid);

    const update = (values: CategoryItem) => {
        setLoadingState(true);
        updateCategory([
            token,
            props.categoryId,
            {
                display_name: values.name,
                prices: values.currencies,
                seats: values.seats,
                sale_begin: values.saleBegin,
                sale_end: values.saleEnd,
                resale_begin: null,
                resale_end: null,
            }
        ], {
            force: true
        })
    };

    useDeepEffect(() => {
        if (updateResponse.data) {
            setLoadingState(false);
            dispatch(PushNotification('Successfuly updated', 'success'));
        }
    }, [updateResponse.data]);

    useEffect(() => {
        if(updateResponse.error) {
            setLoadingState(false);
            dispatch(PushNotification('Update failed. Please retry.', 'error'));
        }
    }, [updateResponse.error, dispatch]);

    useEffect(() => {
        setLastInitialValues({
            name: props.initialValues.display_name,
            currencies: props.initialValues.prices.map((priceItem) => ({
                currency: priceItem.currency,
                price: priceItem.value,
            })),
            seats: props.initialValues.seats,
            saleBegin: props.initialValues.sale_begin,
            saleEnd: props.initialValues.sale_end,
        })
    }, [props.initialValues]);

    return (
        <CategoryForm
            initialValues={lastInitialValues}
            maxDate={props.maxDate}
            loadingState={loadingState}
            confirm={update}/>
    );
};
