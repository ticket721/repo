import { CategoryEntity }                      from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import React, { useState }                     from 'react';
import { useSelector }                         from 'react-redux';
import { T721AppState }                        from '../../../redux';
import { v4 }                                  from 'uuid';
import { useRequest }                          from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }              from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoryQty, Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { getImgPath }                          from '@frontend/core/lib/utils/images';
import { getT721TokenPrice }                   from '../../../utils/prices';
import { formatShort }                         from '@frontend/core/lib/utils/date';
import { useTranslation }                      from 'react-i18next';

export interface SyncedCartTicketCountDisplayProps {
    ticket: CategoryEntity;
    amount: number;
    onChange: (amount: number) => void;
}

export const SyncedCartTicketCountDisplay: React.FC<SyncedCartTicketCountDisplayProps> = (props: SyncedCartTicketCountDisplayProps): JSX.Element => {
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const [t] = useTranslation(['cart', 'common']);

    const dateRequest = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $eq: props.ticket.parent_id,
                },
            },
        ],
        refreshRate: 100,
    }, `SyncedCartTicketCountDisplay@${uuid}`);

    if (dateRequest.response.loading) {
        return <FullPageLoading/>;
    }

    if (dateRequest.response.error || dateRequest.response.data.dates.length === 0) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={dateRequest.force}/>;
    }

    const dateEntity = dateRequest.response.data.dates[0];

    const imageUrl = getImgPath(dateEntity.metadata.avatar);

    const options = [...(new Array(5))].map((v, idx: number) => ({
        label: (idx + 1).toString(),
        value: (idx + 1),
    }));

    return <CategoryQty
        selectedOption={{
            label: props.amount.toString(),
            value: props.amount,
        }}
        categoryName={props.ticket.display_name}
        image={imageUrl}
        price={`${getT721TokenPrice(props.ticket.prices)} €`}
        date={formatShort(new Date(dateEntity.timestamps.event_begin))}
        options={options}
        onChange={(option) => props.onChange(option.value)}
        onCancel={() => props.onChange(0)}
    />;
};

