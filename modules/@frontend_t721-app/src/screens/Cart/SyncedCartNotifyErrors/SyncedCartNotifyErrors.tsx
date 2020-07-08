import styled                           from 'styled-components';
import React                            from 'react';
import { useDispatch, useSelector }     from 'react-redux';
import { T721AppState }                 from '../../../redux';
import { CategoryEntity }               from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { useTranslation }               from 'react-i18next';
import { SetTickets }                   from '../../../redux/ducks/cart';
import { SyncedCartTicketErrorDisplay } from './SyncedCartTicketErrorDisplay';
import { FullButtonCta }                from '@frontend/flib-react/lib/components';

export interface SyncedCartNotifyErrorsProps {
    errors: { category: CategoryEntity; reason: string; }[];
}

const RemoveTicketsTitle = styled.h3`
    font-size: 20px;
    margin-left: ${props => props.theme.regularSpacing};
`;

export interface CategoriesById {
    [key: string]: CategoryEntity[];
}

interface SortedCategoriesErrors {
    [key: string]: CategoriesById;
}

interface PreSortedCategoriesErrors {
    [key: string]: CategoryEntity[];
}

const groupByGroupId = (categories: CategoryEntity[]): CategoriesById => {
    let ret: CategoriesById = {};
    for (const category of categories) {
        ret = {
            ...ret,
            [category.id]: [
                ...(ret[category.id] || []),
                category,
            ],
        };
    }

    return ret;

};

const groupByError = (errors: { category: CategoryEntity; reason: string; }[]): SortedCategoriesErrors => {
    let ret: PreSortedCategoriesErrors = {};
    for (const error of errors) {
        ret = {
            ...ret,
            [error.reason]: [
                ...(ret[error.reason] || []),
                error.category,
            ],
        };
    }

    const finalRet: SortedCategoriesErrors = {};

    for (const errorType of Object.keys(ret)) {
        finalRet[errorType] = groupByGroupId(ret[errorType]);
    }

    return finalRet;

};

export const SyncedCartNotifyErrors: React.FC<SyncedCartNotifyErrorsProps> = (props: SyncedCartNotifyErrorsProps): JSX.Element => {

    const [t] = useTranslation('cart');
    const dispatch = useDispatch();
    const { cart } = useSelector((state: T721AppState) => ({ cart: state.cart }));

    const sortedCategories: SortedCategoriesErrors = groupByError(props.errors);

    const categories: JSX.Element[] = [];

    for (const error of Object.keys(sortedCategories)) {

        categories.push(
            <SyncedCartTicketErrorDisplay
                key={error}
                error={error}
                categoriesById={sortedCategories[error]}
            />
        );

    }

    const onValidate = () => {
        let res = [...cart.tickets];

        const errorClone = [...props.errors];

        for (const errorTicket of errorClone) {
            const firstIdx = res.findIndex((_v: CategoryEntity) => _v.id === errorTicket.category.id);
            res = res
                .filter((v: CategoryEntity, idx: number): boolean => {
                    return !(v.id === errorTicket.category.id && idx === firstIdx);
                });
        }

        dispatch(SetTickets(res));

    };

    return <>
        <RemoveTicketsTitle>{t('errors_tickets_title')}</RemoveTicketsTitle>
        <h4 style={{ marginLeft: 24, opacity: 0.7, fontWeight: 200, marginBottom: 12, marginTop: 12 }}>{t('errors_tickets_explainer')}</h4>
        {categories}
        <FullButtonCta ctaLabel={t('errors_validate')} onClick={onValidate} show={true} variant={'danger'}/>

    </>;
};
