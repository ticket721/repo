import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoriesEditResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesEditResponse.dto';
import { DatesAddCategoryResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesAddCategoryResponse.dto';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CategoryPayload, CategoryWithDatesPayload, checkCategory } from '@common/global';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { SaleDeltas } from '../../../components/CategoryFields/useCategoryCreationFields';
import { omit, set } from 'lodash';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { useTranslation } from 'react-i18next';
import './locales';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { formatCategoryEntity } from './formatter';
import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { useFormik } from 'formik';
import { useHistory } from 'react-router';
import { v4 } from 'uuid';

const defaultValues: CategoryWithDatesPayload = {
    name: '',
    saleBegin: null,
    saleEnd: null,
    seats: null,
    price: null,
    currency: 'EUR',
    dates: [],
};

interface DateItem {
    id: string;
    eventBegin: Date;
    eventEnd: Date;
}

export const useCategoryEdition = (token: string, categoryId: string, dates: DateItem[]) => {
    const { t } = useTranslation(['edit_category', 'common']);
    const dispatch = useDispatch();
    const history = useHistory();

    const [fetchUuid] = useState('fetch-category@' + v4());
    const [editUuid] = useState('edit-category@' + v4());
    const [duplicateUuid] = useState('duplicate-category@' + v4());

    const { response: categoryResp, force: forceCategoryReq } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    id: {
                        $eq: categoryId,
                    }
                },
            ],
            refreshRate: 0,
        },
        fetchUuid
    );
    const { response: editCategoryResp, lazyRequest: editCategory } =
        useLazyRequest<CategoriesEditResponseDto>('categories.edit', editUuid);
    const { response: duplicateCategoryResp, lazyRequest: duplicateCategory } =
        useLazyRequest<DatesAddCategoryResponseDto>('dates.addCategory', duplicateUuid);

    const [ duplicateDateIds, setDuplicateDateIds ] = useState<string[]>([]);
    const [ relativeSaleDeltas, setRelativeSaleDeltas ] = useState<SaleDeltas>(null);
    const [ initialValues, setInitialValues ] = useState<CategoryWithDatesPayload>(defaultValues);

    const onDuplicate = (saleDeltas: SaleDeltas, dateIdxs: number[]) => {
        setRelativeSaleDeltas(saleDeltas);

        if (dateIdxs) {
            setDuplicateDateIds(dates.map((date, dateIdx) => {
                if (dateIdxs.includes(dateIdx)) return date.id;
                return null;
            }).filter(dateIds => dateIds !== null));
        }
    };

    const onDuplicateCategory = async (category: CategoryPayload) => {
        for (const dateId of duplicateDateIds) {
            duplicateCategory([
                token,
                dateId,
                {
                    category: {
                        ...category,
                        saleBegin: new Date(
                            dates.find(date => date.id === dateId).eventEnd.getTime()
                            - relativeSaleDeltas.beginSaleDelta
                        ),
                        saleEnd: new Date(
                            dates.find(date => date.id === dateId).eventEnd.getTime()
                            - relativeSaleDeltas.endSaleDelta
                        ),
                    },
                },
                v4(),
            ], { force: true });
        }
    }

    const onSubmit = (category: CategoryWithDatesPayload) => {
        const categoryWithoutDate = omit({
            ...category,
            price: category.price * 100,
            currency: category.currency.toUpperCase()
        }, 'dates');

        const newDateIds = dates.map((date, dateIdx) => {
            if (category.dates.includes(dateIdx)) {
                return date.id;
            }
            return null;
        }).filter(dateId => dateId !== null);

        if (JSON.stringify(category) !== JSON.stringify(formik.initialValues)) {
            editCategory([
                token,
                categoryId,
                {
                    category: categoryWithoutDate,
                    dates: newDateIds.length > 0 ? newDateIds : undefined,
                },
                v4(),
            ], { force: true });
        }

        if (duplicateDateIds.length > 0) {
            onDuplicateCategory(categoryWithoutDate);
        }
    };

    const validate = (category: CategoryWithDatesPayload) => {
        const errors = checkCategory(omit({
            ...category,
            price: category.price * 100,
            currency: category.currency.toUpperCase()
        }, 'dates'));

        if (category.dates.length === 0) {
            return set(errors || {}, 'dates', {
                reasons: [
                    {
                        type: 'categoryEntity.noDateLinked',
                        context: {},
                    },
                ],
            });
        }

        return errors;
    };

    const formik = useFormik({
        initialValues,
        onSubmit,
        validate,
        enableReinitialize: true,
    });

    useDeepEffect(() => {
        if (dates && categoryResp.data?.categories[0]) {
            const category: CategoryEntity = categoryResp.data.categories[0];
            const dateIdxs: number[] = dates.map(({ id }, dateIdx) => {
                if (category.dates.includes(id)) return dateIdx;
                return null;
            }).filter(dateIdx => dateIdx !== null);
            setInitialValues(formatCategoryEntity(category, dateIdxs));
        }
    }, [dates, categoryResp.data?.categories[0]]);

    useDeepEffect(() => {

        if (editCategoryResp.data?.category) {
            dispatch(PushNotification(t('edit_successful'), 'success'));
            forceCategoryReq();
            history.replace(history.location.pathname);
        }
    // eslint-disable-next-line
    }, [editCategoryResp.data?.category]);

    useEffect(() => {
        if (editCategoryResp.error) {
            dispatch(PushNotification(t('edit_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [editCategoryResp.error]);

    useEffect(() => {
        if (duplicateCategoryResp.error) {
            dispatch(PushNotification(t('duplicate_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [duplicateCategoryResp.error]);

    return {
        loading: categoryResp.loading,
        error: categoryResp.error,
        forceCategoryReq,
        onDuplicate,
        formik,
    }
};
