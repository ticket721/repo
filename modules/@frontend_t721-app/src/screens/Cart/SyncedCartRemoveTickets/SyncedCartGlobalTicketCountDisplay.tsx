import { CategoryEntity }                            from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import React, { useState }                           from 'react';
import { useSelector }                               from 'react-redux';
import { T721AppState }                              from '../../../redux';
import { v4 }                                        from 'uuid';
import { getImgPath }                                from '@frontend/core/lib/utils/images';
import { useRequest }                                from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                    from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Error, FullPageLoading, GlobalCategoryQty } from '@frontend/flib-react/lib/components';
import { getT721TokenPrice }                         from '../../../utils/prices';
import { formatShort }                               from '@frontend/core/lib/utils/date';
import { DateEntity }                                from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useTranslation }                            from 'react-i18next';

export interface SyncedCartGlobalTicketCountDisplayProps {
    ticket: CategoryEntity;
    amount: number;
    onChange: (amount: number) => void;
}

export const SyncedCartGlobalTicketCountDisplay: React.FC<SyncedCartGlobalTicketCountDisplayProps> =
    (props: SyncedCartGlobalTicketCountDisplayProps): JSX.Element => {
        const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
        const [uuid] = useState(v4());
        const [t] = useTranslation(['cart', 'common'])

        const options = [...(new Array(5))].map((v, idx: number) => ({
            label: (idx + 1).toString(),
            value: (idx + 1),
        }));

        const datesRequest = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: props.ticket.group_id,
                    },
                    parent_type: {
                        $eq: 'event',
                    },
                },
            ],
            refreshRate: 100,
        }, `SyncedCartGlobalTicketCountDisplay@${uuid}`);

        if (datesRequest.response.loading) {
            return <FullPageLoading/>;
        }

        if (datesRequest.response.error || datesRequest.response.data.dates.length === 0) {
            return <Error message={t('error_cannot_fetch_dates')} onRefresh={datesRequest.force} retryLabel={t('common:retrying_in')}/>;
        }

        const dateEntities = datesRequest.response.data.dates;

        return <GlobalCategoryQty
            starred={true}
            selectedOption={{
                label: props.amount.toString(),
                value: props.amount,
            }}
            categoryName={props.ticket.display_name}
            price={`${getT721TokenPrice(props.ticket.prices)} €`}
            date={formatShort(new Date(props.ticket.sale_begin))}
            dates={dateEntities.map((d: DateEntity) => ({
                gradient: d.metadata.signature_colors,
                avatar: getImgPath(d.metadata.avatar),
                eventBegin: formatShort(new Date(d.timestamps.event_begin)),
            }))}
            options={options}
            onChange={(option) => props.onChange(option.value)}
            onCancel={() => props.onChange(0)}
        />;
    };
