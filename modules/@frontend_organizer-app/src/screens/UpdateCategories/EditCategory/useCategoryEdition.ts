import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoriesEditResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesEditResponse.dto';
import { CategoriesRemoveDateLinksResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesRemoveDateLinksResponse.dto';
import { CategoriesAddDateLinksResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesAddDateLinksResponse.dto';
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

    const [fetchUuid] = useState('fetch-category@' + categoryId);
    const [editUuid] = useState('edit-category@' + categoryId);
    const [addDateLinksUuid] = useState('add-link-date@' + categoryId);
    const [rmDateLinksUuid] = useState('rm-link-date@' + categoryId);
    const [duplicateUuid] = useState('duplicate-category@' + categoryId);

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
    const { response: rmDateLinksResp, lazyRequest: rmDateLinks } =
        useLazyRequest<CategoriesRemoveDateLinksResponseDto>('categories.removeDateLinks', rmDateLinksUuid);
    const { response: addDateLinksResp, lazyRequest: addDateLinks } =
        useLazyRequest<CategoriesAddDateLinksResponseDto>('categories.addDateLinks', addDateLinksUuid);
    const { response: duplicateCategoryResp, lazyRequest: duplicateCategory } =
        useLazyRequest<DatesAddCategoryResponseDto>('dates.addCategory', duplicateUuid);

    const [ removeDates, setRemoveDates ] = useState<string[]>([]);
    const [ addDates, setAddDates ] = useState<string[]>([]);
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
                }
            ], { force: true });
        }
    }

    const onSubmit = (category: CategoryWithDatesPayload) => {
        const categoryWithoutDate = omit({
            ...category,
            price: category.price * 100
        }, 'dates');

        editCategory([
            token,
            categoryId,
            {
                category: categoryWithoutDate,
            }
        ], { force: true });

        const initialDateIds: string[] = categoryResp.data.categories[0].dates;
        const editedDateIds = dates.map((date, dateIdx) => {
            if (category.dates.includes(dateIdx)) {
                return date.id;
            }
            return null;
        }).filter(dateId => dateId !== null);

        setRemoveDates(initialDateIds.filter(dateId => !editedDateIds.includes(dateId)));
        setAddDates(editedDateIds.filter(dateId => !initialDateIds.includes(dateId)));

        if (duplicateDateIds.length > 0) {
            onDuplicateCategory(categoryWithoutDate);
        }
    };

    const validate = (category: CategoryWithDatesPayload) => {
        const errors = checkCategory(omit(category, 'dates'));

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

    useEffect(() => {
        if (editCategoryResp.data?.category) {
            if (addDates.length > 0) {
                addDateLinks([
                    token,
                    editCategoryResp.data.category.id,
                    {dates: addDates}
                ], { force: true });
            } else if (removeDates.length > 0) {
                rmDateLinks([
                    token,
                    editCategoryResp.data.category.id,
                    {dates: removeDates},
                ], { force: true });
            } else {
                dispatch(PushNotification(t('edit_successful'), 'success'));
                forceCategoryReq();
            }
        }
    // eslint-disable-next-line
    }, [editCategoryResp.data?.category]);

    useEffect(() => {
        if (addDateLinksResp.data?.category) {
            if (removeDates.length > 0) {
                rmDateLinks([
                    token,
                    addDateLinksResp.data.category.id,
                    {dates: removeDates},
                ], { force: true });
            } else {
                dispatch(PushNotification(t('edit_successful'), 'success'));
                forceCategoryReq();
            }
        }
    // eslint-disable-next-line
    }, [addDateLinksResp.data?.category]);

    useEffect(() => {
        if (rmDateLinksResp.data?.category) {
            dispatch(PushNotification(t('edit_successful'), 'success'));
            forceCategoryReq();
        }
    // eslint-disable-next-line
    }, [rmDateLinksResp.data?.category]);

    useEffect(() => {
        if (editCategoryResp.error) {
            dispatch(PushNotification(t('edit_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [editCategoryResp.error]);

    useEffect(() => {
        if (addDateLinksResp.error) {
            dispatch(PushNotification(t('edit_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [addDateLinksResp.error]);

    useEffect(() => {
        if (rmDateLinksResp.error) {
            dispatch(PushNotification(t('edit_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [rmDateLinksResp.error]);

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
