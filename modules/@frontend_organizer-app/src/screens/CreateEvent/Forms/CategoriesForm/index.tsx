import React, { Dispatch, useEffect } from 'react';
import MuiAppBar                      from '@material-ui/core/AppBar';
import MuiTabs                                      from '@material-ui/core/Tabs';
import Tab                                          from '@material-ui/core/Tab';
import styled                                       from 'styled-components';
import { useSelector }                              from 'react-redux';

import { categoriesValidationSchema }               from './validationSchema';
import { GlobalCategories }                         from './GlobalCategories';

import { DateSpecificCategories }                             from './DateSpecificCategories';
import { useEventCreation }                         from '../../../../hooks/useEventCreation';
import {
    EventsCreateCategoriesConfiguration,
}                                                   from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { EventCreationActions, EventCreationSteps } from '../../../../core/event_creation/EventCreationCore';
import { OrganizerState }                           from '../../../../redux/ducks';
import { DateItem }                                 from '../DatesForm';

export interface CategoryItem {
    name: string;
    saleBegin: Date;
    saleEnd: Date;
    seats: number;
    currencies: {
        currency: string,
        price: string;
    }[]
}

const CategoriesForm: React.FC = () => {
    const [ tabIdx, setTabIdx ]: [ number, Dispatch<number> ] = React.useState(0);
    const dates: DateItem[] = useSelector((state: OrganizerState) => state.eventCreation.datesConfiguration.dates);
    const eventCreationFormik = useEventCreation<EventsCreateCategoriesConfiguration>(
        EventCreationSteps.Categories,
        EventCreationActions.CategoriesConfiguration,
        categoriesValidationSchema,
    );

    const globalCategoriesChange = (categories: CategoryItem[]) => {
        eventCreationFormik.handleFocus('global pass confirmed');
        eventCreationFormik.update({
            ...eventCreationFormik.values,
            global: categories,
        });
    };

    const dateSpecificCategoriesChange = (categories: CategoryItem[][]) => {
        eventCreationFormik.handleFocus('date specific confirmed');
        eventCreationFormik.update({
            ...eventCreationFormik.values,
            dates: categories,
        });
    };

    useEffect(() => {
        const datesCategoriesDelta = dates.length - eventCreationFormik.values.dates.length;
        if (datesCategoriesDelta > 0) {
            const emptyCategories = [];
            for (let i = 0; i < datesCategoriesDelta; i++) {
                emptyCategories[i] = [];
            }

            eventCreationFormik.update({
                ...eventCreationFormik.values,
                dates: [
                    ...eventCreationFormik.values.dates,
                    ...emptyCategories,
                ]
            });
        }
        // eslint-disable-next-line
    }, [dates.length, eventCreationFormik.values.dates.length]);

    return (
        <>
            <AppBar position='static'>
                <Tabs
                value={tabIdx}
                onChange={(e: any, idx: number) => setTabIdx(idx)}
                aria-label='from tabs'>
                    <Tab
                    label='Global Passes'
                    id={`simple-tab-${0}`}
                    aria-controls={`simple-tabpanel-${0}`}/>
                    <Tab
                    label='Tickets'
                    id={`simple-tab-${1}`}
                    aria-controls={`simple-tabpanel-${1}`}/>
                </Tabs>
            </AppBar>
            <div
            role='tabpanel'
            hidden={tabIdx !== 0}
            id={`simple-tabpanel-${0}`}
            aria-labelledby={`simple-tab-${0}`}>
                {tabIdx === 0 && (
                    <GlobalCategories
                    categories={eventCreationFormik.values.global}
                    onCategoriesChange={globalCategoriesChange} />
                )}
            </div>
            <div
            role='tabpanel'
            hidden={tabIdx !== 1}
            id={`simple-tabpanel-${1}`}
            aria-labelledby={`simple-tab-${1}`}>
                {tabIdx === 1 && (
                    <DateSpecificCategories
                    categories={eventCreationFormik.values.dates}
                    onCategoriesChange={dateSpecificCategoriesChange}/>
                )}
            </div>
        </>
    );
};

const Tabs = styled(MuiTabs)`
    && {
        color: ${(props) => props.theme.textColor};
        span {
            font-size: 11px;
            font-weight: bold;
        }
    }
`;

const AppBar = styled(MuiAppBar)`
    && {
        background-color: transparent;
        div > div > span {
            background-color: ${(props) => props.theme.primaryColor.hex};
        }
    }
`;

export default CategoriesForm;
