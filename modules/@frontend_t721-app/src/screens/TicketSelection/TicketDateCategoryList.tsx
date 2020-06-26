import React, { useState }                    from 'react';
import styled                                 from 'styled-components';
import { useSelector }                        from 'react-redux';
import { T721AppState }                       from '../../redux';
import { v4 }                                 from 'uuid';
import { useRequest }                         from '@frontend/core/lib/hooks/useRequest';
import { Error, FullPageLoading, TicketType } from '@frontend/flib-react/lib/components';
import { CategoriesSearchResponseDto }        from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoryEntity }                     from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { DateEntity }                         from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatShort }                        from '@frontend/core/lib/utils/date';
import { useTranslation }                     from 'react-i18next';
import { Price }                              from '@common/sdk/lib/@backend_nest/libs/common/src/currencies/Currencies.service';

export interface TicketDateCategoryListProps {
    date: DateEntity;
    selection: number;
    section: string;
    setSelection: (value: {section: string; selection: number, category: CategoryEntity}) => void;
}

const DescriptionText = styled.h4`
    font-weight: 200;
`;

const DescriptionHighlightText = styled.span`
    display: block;
    color: ${props => props.color};
`;

const genDateCategoryDescription = (date: DateEntity, t: (...args: any[]) => string): JSX.Element => {
    // tslint:disable-next-line:max-line-length
    return <DescriptionText>{date.metadata.name}<DescriptionHighlightText color={date.metadata.signature_colors[0]}>{formatShort(new Date(date.timestamps.event_begin))}</DescriptionHighlightText></DescriptionText>;
};

const getEuroPrice = (category: CategoryEntity): string => {
    const T721TokenPriceIndex = category.prices.findIndex((price: Price): boolean => price.currency === 'T721Token');

    if (T721TokenPriceIndex === -1) {
        return '0'
    }

    return (parseInt(category.prices[T721TokenPriceIndex].value, 10) / 100).toString();
};

export const TicketDateCategoryList: React.FC<TicketDateCategoryListProps> = (props: TicketDateCategoryListProps): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const [t] = useTranslation('event_ticket_list');

    const categories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [token, {
            id: {
                $in: props.date.categories,
            },
        }],
        refreshRate: 100,
    }, `HomeEvent@${uuid}`);

    if (categories.response.loading) {
        return <FullPageLoading width={250} height={250}/>;
    }

    if (categories.response.error) {
        return <Error message={'Error while fetching categories'}/>;
    }

    let categoriesList = [];

    if (!categories.response.loading) {
        categoriesList = categories.response.data.categories.map((category: CategoryEntity, idx: number): JSX.Element => (
            <TicketType
                key={idx}
                onClick={() => props.setSelection({section: 'normal', selection: idx, category})}
                description={genDateCategoryDescription(props.date, t)}
                gradient={props.date.metadata.signature_colors}
                selected={props.section === 'normal' && props.selection === idx}
                price={`${getEuroPrice(category)} €`}
                title={category.display_name}
                ticketsLeft={category.seats - category.reserved}
                soldOutLabel={t('sold_out')}
                ticketsLeftLabel={t('left')}
            />
        ));
    }

    if (categoriesList.length === 0) {
        return null;
    }

    return <>
        <h4 style={{marginLeft: 24, opacity: 0.7, fontWeight: 200, marginBottom: 12}}>{t('regular_category_description')}</h4>
        {categoriesList}
    </>;
};
