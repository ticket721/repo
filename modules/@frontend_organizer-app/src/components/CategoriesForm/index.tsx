import React, { Dispatch, useEffect } from 'react';
import MuiAppBar                      from '@material-ui/core/AppBar';
import MuiTabs                                      from '@material-ui/core/Tabs';
import Tab                                          from '@material-ui/core/Tab';
import Button                                       from '@frontend/flib-react/lib/components/button';
import styled                                       from 'styled-components';
import { categoriesValidationSchema }               from './validationSchema';
import { GlobalCategories }                         from './GlobalCategories';
import { useEventCreation }                         from '../../hooks/useEventCreation';
import {
    EventsCreateCategoriesConfiguration,
}                                                   from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { EventCreationActions, EventCreationSteps } from '../../core/event_creation/EventCreationCore';
import { day, hour }                                from '@frontend/core/lib/utils/date';
import { useSelector }                              from 'react-redux';
import { OrganizerState }                           from '../../redux/ducks';
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

const initialValues: EventsCreateCategoriesConfiguration = {
    global: [],
    dates: [],
};

export const CategoriesForm: React.FC = () => {
    const [ tabIdx, setTabIdx ]: [ number, Dispatch<number> ] = React.useState(0);
    const dates: DateItem[] = useSelector((state: OrganizerState) => state.eventCreation.datesConfiguration.dates);
    const defaultDateCategories = dates.map((date) => []);
    const eventCreationFormik = useEventCreation<EventsCreateCategoriesConfiguration>(
        EventCreationSteps.Categories,
        EventCreationActions.CategoriesConfiguration,
        {
            initialValues,
            validationSchema: categoriesValidationSchema,
            onSubmit: () => console.log('test'),
        }
    );

    const globalCategoryCreate = () =>
        eventCreationFormik.setFieldValue('global', [
            ...eventCreationFormik.values.global,
            {
                name: '',
                saleBegin: new Date(Date.now() + hour),
                saleEnd: new Date(Date.now() + day),
                seats: 0,
                currencies: [{
                    price: '',
                    currency: 'eur',
                }]
            }
        ]);

    const globalCategoriesChange = (categories: CategoryItem[]) => {
        eventCreationFormik.handleFocus('global pass confirmed');
        eventCreationFormik.handleBlur('update global passes', 'global', categories);
    };

    useEffect(() => {
        eventCreationFormik.handleFocus('global pass confirmed');
        eventCreationFormik.handleBlur('default dates', 'dates', defaultDateCategories);
        // eslint-disable-next-line
    }, []);

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
                    {/*<Tab label='Tickets' {...a11yProps(1)} />*/}
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
                    onGlobalCategoriesChange={globalCategoriesChange}
                    onGlobalCategoryCreate={globalCategoryCreate} />
                )}
            </div>
            {/*<TabPanel value={tabIdx} index={1}>*/}
            {/*    <CustomCategories*/}
            {/*    formik={formik}*/}
            {/*    validation={validationDates}*/}
            {/*    setValidation={setValidationDates}/>*/}
            {/*</TabPanel>*/}
            <SubmitButton variant='primary' type='submit' title='Validate'/>
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

const SubmitButton = styled(Button)`
    margin-top: ${props => props.theme.doubleSpacing};
`;
