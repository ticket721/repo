import { RequestBag }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { TicketMintingFormat }         from '@common/sdk/lib/@backend_nest/libs/common/src/utils/Cart.type';
import React                           from 'react';
import { Error, Skeleton }             from '@frontend/flib-react/lib/components';
import { CategoryEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { uuidEq }                      from '@common/global';
import { SyncedCartDateCategory }      from './SyncedCartDateCategory';
import { SyncedCartEventCategory }     from './SyncedCartEventCategory';

export interface SyncedCartCategoryDisplayerProps {
    category: string;
    categories: RequestBag<CategoriesSearchResponseDto>;
    dates: RequestBag<DatesSearchResponseDto>;
    tickets: TicketMintingFormat[];
}

export const SyncedCartCategoryDisplayer: React.FC<SyncedCartCategoryDisplayerProps> = (props: SyncedCartCategoryDisplayerProps): JSX.Element => {

    if (props.categories.response.loading) {
        return <Skeleton ready={false} showLoadingAnimation={true} type={'text'} rows={2}>
            <></>
        </Skeleton>;
    }

    if (props.categories.response.error) {
        return <Error message={'Cannot load category'}/>;
    }

    const categoryIdx = props.categories.response.data.categories.findIndex((cat: CategoryEntity): boolean => uuidEq(cat.id, props.category));

    if (categoryIdx === -1) {
        return <Error message={'Cannot find category'}/>;
    }

    const category: CategoryEntity = props.categories.response.data.categories[categoryIdx];

    return <>
        {
            category.parent_type === 'date'

                ?
                <SyncedCartDateCategory category={category} dates={props.dates} tickets={props.tickets}/>

                :
                <SyncedCartEventCategory category={category} dates={props.dates} tickets={props.tickets}/>
        }
    </>;
};

