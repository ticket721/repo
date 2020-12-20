import { FiltersAndToggles }                                         from './index';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import styled                                                        from 'styled-components';
import { Button, SelectInput, SelectOption } from '@frontend/flib-react/lib/components';
import { motion }                  from 'framer-motion';
import { useTranslation }          from 'react-i18next';
import { EventsContext }           from '../Fetchers/EventsFetcher';
import { useToken }                from '@frontend/core/lib/hooks/useToken';
import { v4 }                      from 'uuid';
import { CategoryEntity }          from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { DateEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatShort }             from '@frontend/core/lib/utils/date';
import { useLazyRequest }          from '@frontend/core/lib/hooks/useLazyRequest';
import { EventsExportResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsExportResponse.dto';
import { PushNotification }        from '@frontend/core/lib/redux/ducks/notifications';
import { useDispatch }             from 'react-redux';

interface FilterHeaderProps {
    filtersAndToggles: FiltersAndToggles;
    categories: CategoryEntity[];
    dates: DateEntity[];
}

const FiltersContainer = styled.div`
  width: 100%;
  padding: ${props => props.theme.regularSpacing};
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  flex-wrap: wrap;
`;

const FilterTitle = styled.h3`

`;

const FilterOptionTopContainer = styled.div`
  min-height: 200px;
  min-width: 400px;
`;
const FilterOptionInnerContainer = styled.div`
  padding: ${props => props.theme.regularSpacing};
`;

const FilterOptionContainer = ({ title, children }: PropsWithChildren<{ title: string }>) => {
    return <FilterOptionTopContainer>
        <FilterTitle>{title}</FilterTitle>
        <FilterOptionInnerContainer>
            {children}
        </FilterOptionInnerContainer>
    </FilterOptionTopContainer>;
};

const ModeButtonContainers = styled.div`
  display: flex;
  flex-direction: row;
`;

const FilterModeOption: React.FC<FilterHeaderProps> = (props: FilterHeaderProps): JSX.Element => {

    const [t] = useTranslation('attendees');

    if (props.filtersAndToggles.modeModifiable) {
        return <FilterOptionContainer
            title={t('mode')}
        >
            <ModeButtonContainers>
                <motion.div
                    style={{
                        width: '50%',
                    }}
                    whileHover={{ scale: 1.00 }}
                    variants={{
                        selected: {
                            filter: 'grayscale(0%)',
                            scale: 1,
                        },
                        unselected: {
                            filter: 'grayscale(100%)',
                            scale: 0.90,
                        },
                    }}
                    animate={props.filtersAndToggles.mode === 'dates' ? 'selected' : 'unselected'}
                    initial={'unselected'}
                >
                    <Button
                        style={{
                            margin: 12,
                        }}
                        variant={'primary'}
                        onClick={() => props.filtersAndToggles.setMode('dates')}
                        title={t('dates')}
                    />
                </motion.div>
                <motion.div
                    style={{
                        width: '50%',
                    }}
                    whileHover={{ scale: 1.00 }}
                    variants={{
                        selected: {
                            filter: 'grayscale(0%)',
                            scale: 1,
                        },
                        unselected: {
                            filter: 'grayscale(100%)',
                            scale: 0.90,
                        },
                    }}
                    animate={props.filtersAndToggles.mode === 'categories' ? 'selected' : 'unselected'}
                    initial={'unselected'}
                >
                    <Button
                        style={{
                            margin: 12,
                        }}
                        variant={'primary'}
                        onClick={() => props.filtersAndToggles.setMode('categories')}
                        title={t('categories')}
                    />
                </motion.div>
            </ModeButtonContainers>
        </FilterOptionContainer>;
    }
    return null;
};

const getCategoryTitle = (category: CategoryEntity, dates: DateEntity[], t: any): string => {
    if (category.dates.length > 1) {
        return `${category.display_name} - (${t('multi_dates', {count: category.dates.length})})`
    } else {
        return `${category.display_name} - (${dates[dates.findIndex(
            (_date) => category.dates.indexOf(_date.id) !== -1)
            ]?.metadata.name.toUpperCase()})`
    }
}

const FilterCategoriesOption: React.FC<FilterHeaderProps & { group_id: string }> = (props: FilterHeaderProps & { group_id: string }): JSX.Element => {
    const [t] = useTranslation('attendees');

    return <div>
        <SelectInput
            value={props.filtersAndToggles.categories}
            options={
                props.categories.map((category: CategoryEntity): SelectOption => ({
                    label: getCategoryTitle(category, props.dates, t),
                    value: category.id,
                }))
            }
            multiple={true}
            onChange={
                (options: SelectOption[]): void => {
                    props.filtersAndToggles.setCategories(options);
                }
            }
        />
    </div>;
};

const FilterDatesOption: React.FC<FilterHeaderProps & { group_id: string }> = (props: FilterHeaderProps & { group_id: string }): JSX.Element => {

    return <div>
        <SelectInput
            value={props.filtersAndToggles.dates}
            options={
                props.dates.map((date: DateEntity): SelectOption => ({
                    label: `${date.metadata.name.toUpperCase()} - ${formatShort(new Date(date.timestamps.event_begin))}`,
                    value: date.id,
                }))
            }
            multiple={true}
            onChange={
                (options: SelectOption[]): void => {
                    props.filtersAndToggles.setDates(options);
                }
            }
        />
    </div>;
};

const FilterCategoriesDatesOption: React.FC<FilterHeaderProps> = (props: FilterHeaderProps): JSX.Element => {
    const [t] = useTranslation('attendees');

    const events = useContext(EventsContext);

    const event = events.events[0];

    switch (props.filtersAndToggles.mode) {
        case 'dates': {
            if (props.filtersAndToggles.datesModifiable) {
                return <FilterOptionContainer
                    title={t('dates')}
                >
                    <FilterDatesOption filtersAndToggles={props.filtersAndToggles} group_id={event.group_id} dates={props.dates}
                                       categories={props.categories}/>
                </FilterOptionContainer>;
            }
            return null;
        }
        case 'categories': {
            if (props.filtersAndToggles.categoriesModifiable) {
                return <FilterOptionContainer
                    title={t('categories')}
                >
                    <FilterCategoriesOption filtersAndToggles={props.filtersAndToggles} group_id={event.group_id} dates={props.dates}
                                            categories={props.categories}/>
                </FilterOptionContainer>;
            }
            return null;
        }
    }
};

const download = (filename: string, text: string): void => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const mailing = (attendees: any[]): void => {

    const mails = attendees.map(attendee => attendee.email);
    const filteredMails = mails.filter((mail, idx) => mails.indexOf(mail) === idx);
    const sortedMails = filteredMails.sort((mail1, mail2) => mail1.toLowerCase().localeCompare(mail2.toLowerCase()));

    let fileContent = `Email
`;

    for (const mail of sortedMails) {
        fileContent += `${mail}
`;
    }

    const now = new Date();

    download(`mailing-list.${
        now.getFullYear()
    }${
        now.getMonth() + 1
    }${
        now.getDate()
    }-${
        now.getHours()
    }${
        now.getMinutes()
    }${
        now.getSeconds()
    }.csv`, fileContent);
}

const csv = (attendees: any[], categories: CategoryEntity[]): void => {

    let fileContent = `Email, Ticket ID, Category ID, Category Name, Paid Price, Currency, Purchase Date
`;

    for (const attendee of attendees) {
        fileContent += `${attendee.email}, ${attendee.ticket}, ${attendee.category}, ${categories[categories.findIndex(category => category.id === attendee.category)]?.display_name}, ${attendee.price / 100}, ${attendee.currency}, ${(new Date(attendee.date)).toISOString()}
`;
    }

    const now = new Date();

    download(`export.${
        now.getFullYear()
    }${
        now.getMonth() + 1
    }${
        now.getDate()
    }-${
        now.getHours()
    }${
        now.getMinutes()
    }${
        now.getSeconds()
    }.csv`, fileContent);
}

const FilterExportButtons: React.FC<FilterHeaderProps> = (props: FilterHeaderProps): JSX.Element => {
    const [exporting, setExporting] = useState(null);
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@attendees-fetch');
    const events = useContext(EventsContext);
    const event = events.events[0];
    const [t] = useTranslation('attendees');
    const dispatch = useDispatch();

    const payload: any = {};

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

    const lazyReq = useLazyRequest<EventsExportResponseDto>('events.export', uuid);

    useEffect(() => {
        if (lazyReq.response) {

            if (lazyReq.response.error) {
                dispatch(PushNotification(t('export_error'), 'error'));
            } else if (lazyReq.response.data && exporting !== null) {
                switch (exporting) {
                    case 'mailing': {
                        mailing(lazyReq.response.data.attendees);
                        break ;
                    }
                    case 'csv': {
                        csv(lazyReq.response.data.attendees, props.categories);
                        break ;
                    }
                }
                setExporting(null);
            }

        }
    }, [lazyReq.response, exporting, props.categories, t, dispatch]);

    return <FilterOptionContainer
        title={t('exports')}
    >
        <Button title={t('mailing_list')} variant={'primary'} onClick={() => {
            lazyReq.lazyRequest([
                token,
                event.id,
                payload,
                v4()
            ]);
            setExporting('mailing');
        }}/>
        <Button title={t('csv')} variant={'primary'} onClick={() => {
            lazyReq.lazyRequest([
                token,
                event.id,
                payload,
                v4()
            ]);
            setExporting('csv');
        }}/>
    </FilterOptionContainer>;
};

export const FilterHeader: React.FC<FilterHeaderProps> = (props: FilterHeaderProps): JSX.Element => {
    return <FiltersContainer>
        <FilterModeOption filtersAndToggles={props.filtersAndToggles} dates={props.dates} categories={props.categories}/>
        <FilterCategoriesDatesOption filtersAndToggles={props.filtersAndToggles} dates={props.dates} categories={props.categories}/>
        <FilterExportButtons filtersAndToggles={props.filtersAndToggles} categories={props.categories} dates={props.dates}/>
    </FiltersContainer>;
};
