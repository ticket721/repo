import { DatesAddCategoryResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesAddCategoryResponse.dto';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CategoryPayload, CategoryWithDatesPayload, checkCategory } from '@common/global';
import { SaleDeltas } from '../../../components/CategoryFields/useCategoryCreationFields';
import { omit, set } from 'lodash';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { useTranslation } from 'react-i18next';
import './locales';
import { useFormik } from 'formik';
import { v4 } from 'uuid';
import { useHistory, useLocation } from 'react-router';
import { useToken } from '@frontend/core/lib/hooks/useToken';

const initialValues: CategoryPayload = {
    name: '',
    saleBegin: null,
    saleEnd: null,
    seats: null,
    price: null,
    currency: 'EUR',
};

interface DateItem {
    id: string;
    eventBegin: Date;
    eventEnd: Date;
}

export const useCategoryCreation = (dates: DateItem[], refetch: () => void) => {
    const { t } = useTranslation('create_category');
    const dispatch = useDispatch();
    const token = useToken();

    const { state, pathname } = useLocation<Partial<CategoryPayload> & Partial<{ dates: string[] }>>();

    const history = useHistory();

    const [createUuid] = useState('create-category@' + v4());
    const [duplicateUuid] = useState('duplicate-category@' + v4());

    const { response: createCategoryResp, lazyRequest: createCategory } =
        useLazyRequest<DatesAddCategoryResponseDto>('dates.addCategory', createUuid);
    const { response: duplicateCategoryResp, lazyRequest: duplicateCategory } =
        useLazyRequest<DatesAddCategoryResponseDto>('dates.addCategory', duplicateUuid);

    const [ duplicateDateIds, setDuplicateDateIds ] = useState<string[]>([]);
    const [ relativeSaleDeltas, setRelativeSaleDeltas ] = useState<SaleDeltas>(null);

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
            price: category.price * 100,
            currency: category.currency.toUpperCase()
        }, 'dates');

        const concernedDateIds = dates.map((date, dateIdx) => {
            if (category.dates.includes(dateIdx)) {
                return date.id;
            }
            return null;
        }).filter(dateId => dateId !== null);

        createCategory([
            token,
            concernedDateIds[0],
            {
                category: categoryWithoutDate,
                otherDates: concernedDateIds.length > 1 ? concernedDateIds.slice(1) : undefined,
            },
            v4(),
        ], { force: true });

        if (duplicateDateIds.length > 0) {
            onDuplicateCategory(categoryWithoutDate);
        }
    };

    const validate = (category: CategoryWithDatesPayload) => {
        console.log(category.price);
        const errors = checkCategory(
            omit({
                ...category,
                price: category.price * 100,
                currency: category.currency.toUpperCase()
            }, 'dates')
        );

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
        initialValues: {
            ...initialValues,
            ...state,
            dates: state?.dates ? dates.map((date, dateIdx) => {
                    if (state.dates.includes(date.id)) return dateIdx;
                    return null
                }).filter(dateIdx => dateIdx !== null) :
                [],
        },
        onSubmit,
        validate,
    });

    useEffect(() => {
        if (createCategoryResp.data?.category) {
            dispatch(PushNotification(t('creation_successful'), 'success'));
            refetch();
            history.push(pathname + '/' + createCategoryResp.data.category.id);
        }
        // eslint-disable-next-line
    }, [createCategoryResp.data?.category]);

    useEffect(() => {
        if (createCategoryResp.error) {
            dispatch(PushNotification(t('creation_error'), 'error'));
        }
        // eslint-disable-next-line
    }, [createCategoryResp.error]);

    useEffect(() => {
        if (duplicateCategoryResp.error) {
            dispatch(PushNotification(t('duplicate_error'), 'error'));
        }
        // eslint-disable-next-line
    }, [duplicateCategoryResp.error]);

    return {
        onDuplicate,
        formik,
    }
};
