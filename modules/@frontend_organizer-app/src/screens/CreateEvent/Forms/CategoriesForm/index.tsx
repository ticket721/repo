import React, { Dispatch, useEffect, useRef } from 'react';
import MuiAppBar                              from '@material-ui/core/AppBar';
import MuiTabs                                      from '@material-ui/core/Tabs';
import Tab                                          from '@material-ui/core/Tab';
import styled                       from 'styled-components';
import { useSelector } from 'react-redux';

import { categoriesValidationSchema }               from './validationSchema';
import { GlobalCategories }                         from './GlobalCategories';

import { DateSpecificCategories }                             from './DateSpecificCategories';
import { useEventCreation }                         from '../../../../hooks/useEventCreation';
import {
    EventsCreateCategoriesConfiguration,
}                                                   from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { EventCreationActions, EventCreationSteps } from '../../../../core/event_creation/EventCreationCore';
import { OrganizerState }                           from '../../../../redux/ducks';

import { useTranslation } from 'react-i18next';
import './locales';
import { FormProps }      from '../../index';
import { useDeepEffect }  from '@frontend/core/lib/hooks/useDeepEffect';

const defaultValues: EventsCreateCategoriesConfiguration = {
    global: [],
    dates: [],
};

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

const CategoriesForm: React.FC<FormProps> = ({ onComplete }) => {
    const reference = useRef(null);
    const [ t ] = useTranslation('categories');
    const [ tabIdx, setTabIdx ]: [ number, Dispatch<number> ] = React.useState(0);
    const datesLength: number = useSelector((state: OrganizerState) => state.eventCreation.datesConfiguration.dates.length);
    const eventCreationFormik = useEventCreation<EventsCreateCategoriesConfiguration>(
        EventCreationSteps.Categories,
        EventCreationActions.CategoriesConfiguration,
        categoriesValidationSchema,
        defaultValues,
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
        const datesCategoriesDelta = datesLength - eventCreationFormik.values.dates.length;
        if (datesCategoriesDelta > 0) {
            const emptyCategories = [];
            for (let i = 0; i < datesCategoriesDelta; i++) {
                emptyCategories[i] = [];
            }

            eventCreationFormik.handleFocus('auto focus');
            eventCreationFormik.update({
                ...eventCreationFormik.values,
                dates: [
                    ...eventCreationFormik.values.dates,
                    ...emptyCategories,
                ]
            });
        }
        // eslint-disable-next-line
    }, [datesLength, eventCreationFormik.values.dates.length]);

    useDeepEffect(() => {
        onComplete(true);
    }, [
        eventCreationFormik.isValid
    ]);

    useEffect(() => {
        window.scrollTo({ top: reference.current.offsetTop, left: 0, behavior: 'smooth' });
    }, []);

    return (
        <>
            <AppBar position='static' ref={reference}>
                <Tabs
                value={tabIdx}
                onChange={(e: any, idx: number) => setTabIdx(idx)}
                aria-label='from tabs'>
                    <Tab
                    label={t('date_specific_tab')}
                    id={`simple-tab-${0}`}
                    aria-controls={`simple-tabpanel-${0}`}/>
                    {
                        datesLength > 1 ?
                        <Tab
                        label={t('global_tab')}
                        id={`simple-tab-${1}`}
                        aria-controls={`simple-tabpanel-${1}`}/> :
                            null
                    }
                </Tabs>
            </AppBar>
            <div
            role='tabpanel'
            hidden={tabIdx !== 0}
            id={`simple-tabpanel-${0}`}
            aria-labelledby={`simple-tab-${0}`}>
                {tabIdx === 0 && (
                    <>
                        <Description>A Normal ticket corresponds to a category which can be applied to several dates</Description>
                        <DateSpecificCategories
                            categories={eventCreationFormik.values.dates}
                            onCategoriesChange={dateSpecificCategoriesChange}/>
                    </>
                )}
            </div>
            <div
            role='tabpanel'
            hidden={tabIdx !== 1}
            id={`simple-tabpanel-${1}`}
            aria-labelledby={`simple-tab-${1}`}>
                {tabIdx === 1 && (
                    <>
                        <Description>A Global Category corresponds to a ticket valid for all dates</Description>
                        <GlobalCategories
                            categories={eventCreationFormik.values.global}
                            onCategoriesChange={globalCategoriesChange} />
                    </>
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

const Description = styled.span`
    display: block;
    margin: ${props => props.theme.doubleSpacing} 0 ${props => props.theme.regularSpacing};
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
`;

export default CategoriesForm;
