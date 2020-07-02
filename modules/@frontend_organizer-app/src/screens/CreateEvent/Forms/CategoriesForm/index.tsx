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
import { CategoryItem }   from '../../../../components/CategoryForm';

const defaultValues: EventsCreateCategoriesConfiguration = {
    global: [],
    dates: [],
};

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
                <Border />
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
                        <Description>{t('date_specific_desc')}</Description>
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
                        <Description>{t('global_desc')}</Description>
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
        box-shadow: none;
        background-color: transparent;
        div > div > span {
            background-color: ${(props) => props.theme.primaryColor.hex};
        }
    }
`;

const Border = styled.div`
    position: absolute;
    bottom: 0;
    width: 100%;
    border-bottom: 2px solid ${props => props.theme.componentColorLight};
`;

const Description = styled.h2`
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: ${props => props.theme.textColorDark};
    margin: ${props => props.theme.biggerSpacing} 0;
    white-space: pre-wrap;
`;

export default CategoriesForm;
