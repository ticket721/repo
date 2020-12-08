import React, { useCallback, useContext, useMemo, useState } from 'react';
import { FilterHeader }                                                 from './FilterHeader';
import styled                                                           from 'styled-components';
import './locales';
import { EventsContext }                                                from '../Fetchers/EventsFetcher';
import { Error, FullPageLoading, SelectOption }                         from '@frontend/flib-react/lib/components';
import { useToken }                                                     from '@frontend/core/lib/hooks/useToken';
import { v4 }                                                           from 'uuid';
import { useRequest }                                                   from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                                       from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { EventsAttendeesResponseDto }                                   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsAttendeesResponse.dto';
import { formatShort }                                                  from '@frontend/core/lib/utils/date';
import { getPrice }                                                     from '@frontend/core/lib/utils/prices';
import { useTranslation }                                               from 'react-i18next';
import { CategoriesSearchResponseDto }                                  from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoryEntity }                                               from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { DateEntity }                                                   from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { isRequestError }                                               from '@frontend/core/lib/utils/isRequestError';

interface AttendeesProps {
    dates?: SelectOption[];
    categories?: SelectOption[];
    mode?: 'dates' | 'categories';
}

interface Filters {
    dates: SelectOption[];
    categories: SelectOption[];
    mode: 'dates' | 'categories';
}

export interface FiltersAndToggles extends Filters {
    datesModifiable: boolean;
    categoriesModifiable: boolean;
    modeModifiable: boolean;
    setDates: (dates: SelectOption[]) => void;
    setCategories: (categories: SelectOption[]) => void;
    setMode: (mode: 'dates' | 'categories') => void;
}

const AttendeesContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const AttendeesListingTableContainerPadder = styled.div`
  width: 100%;
  padding: ${props => props.theme.regularSpacing};
`;

const AttendeesListingTableContainer = styled.div`
  width: 100%;
`;

const AttendeesListingTable = styled.table`
  width: 100%;
  border-spacing: 0;
  & > thead > tr > th {
    background-color: ${props => props.theme.darkBg};
    padding: ${props => props.theme.regularSpacing};
  }
  & > thead > tr > th:first-child {
    border-top-left-radius: ${props => props.theme.defaultRadius};
  }
  & > thead > tr > th:last-child {
    border-top-right-radius: ${props => props.theme.defaultRadius};
  }
  & > tbody > tr > td {
    background-color: ${props => props.theme.componentColorLight};
    padding: ${props => props.theme.regularSpacing};
    text-align: center;
  }
  & > tbody > tr > td.idx {
    font-weight: bold;
  }
  & > tbody > tr > td {
    background-color: ${props => props.theme.componentColorLight};
    padding: calc(1.5 * ${props => props.theme.regularSpacing});
    text-align: center;
  }
  & > tbody > tr:nth-child(odd) > td {
    background-color: ${props => props.theme.componentColor};
  }
  & > tbody > tr:last-child > td:first-child {
    border-bottom-left-radius: ${props => props.theme.defaultRadius};
  }
  & > tbody > tr:last-child > td:last-child {
    border-bottom-right-radius: ${props => props.theme.defaultRadius};
  }
`;

interface AttendeesPageSelectorProps {
    size: number;
    total: number;
    page: number;
    setPage: (idx: number) => void;
}

const PagesContainer = styled.div`
  display: inline-block;
  margin: ${props => props.theme.smallSpacing};
`;

const Page = styled.a`
  text-decoration: none;
  padding: 12px;
  float: left;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  &.selected {
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${
    props => props.theme.primaryColor.hex
}, ${
    props => props.theme.primaryColorGradientEnd.hex
});
    font-weight: bold;
  }
`;

const AttendeesPageSelector: React.FC<AttendeesPageSelectorProps> = (props: AttendeesPageSelectorProps): JSX.Element => {

    const totalPages = Math.ceil(props.total / props.size);
    const range = [...new Array(totalPages)].map((_, idx) => idx);

    const [
        pre,
        current,
        post,
    ] = [
        range.slice(0, props.page - 2 < 0 ? 0 : props.page - 2),
        range.slice(props.page - 2 < 0 ? 0 : props.page - 2, props.page + 3),
        range.slice(props.page + 3),
    ];

    return <PagesContainer>
        <Page
            onClick={() => props.setPage(props.page === 0 ? 0 : props.page - 1)}
        >&laquo;</Page>
        {
            pre.length > 0
                ?
                <Page>...</Page>

                :
                null

        }
        {
            current.map((pagenum) => (
                <Page
                    onClick={() => props.setPage(pagenum)}
                    key={pagenum + 1}
                    className={pagenum === props.page ? 'selected' : undefined}
                >{pagenum + 1}</Page>
            ))
        }
        {
            post.length > 0
                ?
                <Page>...</Page>

                :
                null

        }
        <Page
            onClick={() => props.setPage(props.page + 1 === totalPages ? props.page : props.page + 1)}
        >&raquo;</Page>
    </PagesContainer>;
};

interface AttendeesPageSizeProps {
    size: number;
    setSize: (size: number) => void;
    setPage: (page: number) => void;
}

const AttendeesPageSize: React.FC<AttendeesPageSizeProps> = (props: AttendeesPageSizeProps): JSX.Element => {

    const sizes = [10, 20, 50];
    const [t] = useTranslation('attendees');

    return <div
        style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        }}
    >
        <span>{t('results_per_page')}</span>
        <PagesContainer>
            {
                sizes.map((val) => (
                    <Page
                        key={val}
                        onClick={() => {
                            props.setPage(0);
                            props.setSize(val);
                        }}
                        className={val === props.size ? 'selected' : undefined}
                    >
                        {val}
                    </Page>
                ))
            }
        </PagesContainer>
    </div>;
};

const AttendeesTotalContainer = styled.div`
  padding: ${props => props.theme.regularSpacing};
`;

interface AttendeesListingProps {
    eventId: string;
    filtersAndToggles: FiltersAndToggles;
    categories: CategoryEntity[];
    dates: DateEntity[];
}

const AttendeesListing: React.FC<AttendeesListingProps> = (props: AttendeesListingProps): JSX.Element => {

    const token = useToken();
    const [uuid] = useState<string>(v4() + '@dates-fetch');
    const [t] = useTranslation(['attendees', 'common']);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentSize, setCurrentSize] = useState(10);

    const payload: any = {
        page_size: currentSize,
        page_number: currentPage,
    };

    switch (props.filtersAndToggles.mode) {
        case 'dates': {
            if (props.filtersAndToggles.dates.length > 0) {
                let categories: string[] = [];

                for (const date of props.filtersAndToggles.dates) {
                    const dateEntity = props.dates[props.dates.findIndex((_date) => _date.id === date.value)];
                    if (dateEntity) {
                        categories = [
                            ...categories,
                            ...dateEntity.categories,
                        ];
                    }
                }

                payload.categories = categories;
            }
            break;
        }
        case 'categories': {
            if (props.filtersAndToggles.categories.length > 0) {
                payload.categories = props.filtersAndToggles.categories.map(cat => cat.value);
            }
            break;
        }
    }

    const ticketsResp = useRequest<EventsAttendeesResponseDto>({
        method: 'events.attendees',
        args: [
            token,
            props.eventId,
            payload,
        ],
        refreshRate: 10,
    }, uuid);

    if (ticketsResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(ticketsResp)) {
        return <Error message={'attendees_fetch_error'} retryLabel={'common:retrying_in'} onRefresh={ticketsResp.force}/>;
    }

    const attendees = ticketsResp.response.data.attendees;
    const page = ticketsResp.response.data.page_number;
    const size = ticketsResp.response.data.page_size;
    const total = ticketsResp.response.data.total;

    return <AttendeesListingTableContainerPadder>
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}
        >
            <AttendeesPageSelector size={currentSize} total={total} page={currentPage} setPage={setCurrentPage}/>
            <AttendeesPageSize size={currentSize} setSize={setCurrentSize} setPage={setCurrentPage}/>
        </div>
        <AttendeesListingTableContainer>
            <AttendeesListingTable>
                <thead>
                <tr>
                    <th>#</th>
                    <th>{t('email')}</th>
                    <th>{t('category')}</th>
                    <th>{t('price')}</th>
                    <th>{t('purchase_date')}</th>
                    <th>{t('ticket')}</th>
                </tr>
                </thead>
                <tbody>
                {
                    attendees.map((attendee, idx) => (
                        <tr key={idx + page * size}>
                            <td className={'idx'}>{(total - (idx + page * size))}</td>
                            <td className={'email'}>{attendee.email}</td>
                            <td className={'category'}>{
                                props.categories[props.categories
                                    .findIndex((cat: CategoryEntity) => cat.id === attendee.category)]?.display_name || t('unknown')
                            }</td>
                            <td className={'price'}>{getPrice({
                                currency: attendee.currency,
                                price: attendee.price,
                            } as any, t('free'))}</td>
                            <td className={'date'}>{formatShort(new Date(attendee.date))}</td>
                            <td className={'id'}>{attendee.ticket}</td>
                        </tr>
                    ))
                }
                </tbody>
            </AttendeesListingTable>
        </AttendeesListingTableContainer>
        <AttendeesTotalContainer>
            <span>Total: </span>
            <span
                style={{
                    fontWeight: 'bold',
                }}
            >{total}</span>
        </AttendeesTotalContainer>
    </AttendeesListingTableContainerPadder>;
};

export const Attendees: React.FC<AttendeesProps> = (props: AttendeesProps): JSX.Element => {

    const token = useToken();
    const [uuid] = useState<string>(v4() + '@categories-fetch');
    const [filters, setFilters] = useState<Filters>({
        dates: [],
        categories: [],
        mode: 'categories',
    });

    const events = useContext(EventsContext);

    const filtersAndToggles: FiltersAndToggles = {
        dates: useMemo(() => props.dates || filters.dates, [props, filters]),
        datesModifiable: useMemo(() => !props.dates, [props]),
        setDates: useCallback((dates: SelectOption[]): void => setFilters({
            ...filters,
            dates,
        }), [setFilters, filters]),

        categories: useMemo(() => props.categories || filters.categories, [props, filters]),
        categoriesModifiable: useMemo(() => !props.categories, [props]),
        setCategories: useCallback((categories: SelectOption[]): void => setFilters({
            ...filters,
            categories,
        }), [setFilters, filters]),

        mode: useMemo(() => props.mode || filters.mode, [props, filters]),
        modeModifiable: useMemo(() => !props.mode, [props]),
        setMode: useCallback((mode: 'dates' | 'categories'): void => setFilters({
            ...filters,
            mode,
        }), [setFilters, filters]),
    };

    const datesResp = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                group_id: {
                    $eq: events.events[0].group_id,
                },
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'desc',
                }],
            },
        ],
        refreshRate: 10,
    }, uuid);

    const categoriesResp = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                group_id: {
                    $eq: events.events[0].group_id,
                },
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'desc',
                }],
            },
        ],
        refreshRate: 10,
    }, uuid);

    if (datesResp.response.loading || categoriesResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(datesResp) || isRequestError(categoriesResp)) {
        return <Error message={'infos_fetch_error'} retryLabel={'common:retrying_in'} onRefresh={() => {
            datesResp.force();
            categoriesResp.force();
        }}/>;
    }

    if (events.events.length === 0) {
        return <p>Unknown Event</p>;
    }

    const _categories = categoriesResp.response.data.categories;
    const _dates = datesResp.response.data.dates;

    return <AttendeesContainer>
        <FilterHeader
            filtersAndToggles={filtersAndToggles}
            categories={_categories}
            dates={_dates}
        />
        <AttendeesListing
            filtersAndToggles={filtersAndToggles}
            eventId={events.events[0].id}
            categories={_categories}
            dates={_dates}
        />
    </AttendeesContainer>;
};
