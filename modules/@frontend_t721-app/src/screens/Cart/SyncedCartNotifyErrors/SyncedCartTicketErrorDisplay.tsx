import React                                     from 'react';
import { useTranslation }                        from 'react-i18next';
import { CategoryError }                         from '@frontend/flib-react/lib/components';
import { SyncedCartCategoryElementErrorDisplay } from './SyncedCartCategoryElementErrorDisplay';
import { CategoriesById }                        from './SyncedCartNotifyErrors';

export interface SyncedCartTicketErrorDisplayProps {
    error: string;
    categoriesById: CategoriesById;
}

export const SyncedCartTicketErrorDisplay: React.FC<SyncedCartTicketErrorDisplayProps> = (props: SyncedCartTicketErrorDisplayProps): JSX.Element => {

    const [t] = useTranslation('cart');

    return <CategoryError
        error={t(`error_${props.error}`)}
        description={t(`error_${props.error}_description`)}
    >
        {
            Object
                .keys(props.categoriesById)
                .map(
                    (catName: string, idx: number) => <SyncedCartCategoryElementErrorDisplay
                        key={idx}
                        category={props.categoriesById[catName][0]}
                        amount={props.categoriesById[catName].length}
                    />
                )
        }
    </CategoryError>
};

