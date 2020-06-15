import React, { Dispatch, useEffect, useState } from 'react';
import styled                                   from 'styled-components';
import Button                                       from '@frontend/flib-react/lib/components/button';
import { datesConfigValidationSchema }              from './validationSchema';
import {
    EventsCreateDatesConfiguration,
}                                                   from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { useSelector }                              from 'react-redux';
import { OrganizerState }                           from '../../redux/ducks';
import { useEventCreation }                         from '../../hooks/useEventCreation';
import { EventCreationActions, EventCreationSteps } from '../../core/event_creation/EventCreationCore';
import { DateCard }                                 from './DateCard';
import { DateForm }                                 from './DateForm';
import { checkFormatDate }                          from '@frontend/core/lib/utils/date';
import { day, hour }                                from '@frontend/core/lib/utils/date';

export interface DateItem {
    name: string;
    eventBegin: Date;
    eventEnd: Date;
    location: {
        lon: number;
        lat: number;
        label: string;
    }
}

const initialValues: EventsCreateDatesConfiguration = { dates: []};

const DatesForm: React.FC = () => {
    const [ editIdx, setEditIdx ]: [ number, Dispatch<number> ] = useState(null);
    const [ onNewDate, setOnNewDate ]: [ boolean, Dispatch<boolean> ] = useState(null);
    const eventName: string = useSelector((state: OrganizerState) => state.eventCreation.textMetadata.name);

    const eventCreationFormik = useEventCreation<EventsCreateDatesConfiguration>(
        EventCreationSteps.Dates,
        EventCreationActions.DatesConfiguration,
        {
            initialValues,
            validationSchema: datesConfigValidationSchema,
            onSubmit: () => console.log('test'),
        }
    );

    const addDateDraft = () => {
        const datesLength = eventCreationFormik.values.dates.length;

        eventCreationFormik.setFieldValue('dates', [
            ...eventCreationFormik.values.dates,
            {
                name: eventName,
                eventBegin: new Date(Date.now() + hour),
                eventEnd: new Date(Date.now() + day),
                location: datesLength ?
                    eventCreationFormik.values.dates[datesLength - 1].location :
                    {
                        lon: null,
                        lat: null,
                        label: '',
                    }
            }
        ]);
        setEditIdx(datesLength);
        setOnNewDate(true);
    };

    const resetEdition = () => {
        setEditIdx(null);
        setOnNewDate(false);
    };

    const deleteDate = (deleteIdx: number) => {
        eventCreationFormik.handleFocus('date delete');
        const dates: DateItem[] = eventCreationFormik.values.dates
            .filter((date: DateItem, idx: number) => deleteIdx !== idx);

        resetEdition();
        eventCreationFormik.handleBlur('delete date', 'dates', dates);
    };

    const confirmDate = (comfirmedIdx: number ,updateDateItem: DateItem) => {
        eventCreationFormik.handleFocus('dates confirm');
        const dates: DateItem[] = eventCreationFormik.values.dates.map((dateItem: DateItem, idx) =>
            comfirmedIdx === idx ? updateDateItem : dateItem
        );

        eventCreationFormik.handleBlur('confirm date', 'dates', dates);
        resetEdition();
    };

    useEffect(() => {
        if (eventCreationFormik.values.dates.length === 0) {
            addDateDraft();
        }
    }, // eslint-disable-next-line
        [
        eventCreationFormik.values.dates.length
    ]);

    return (
        <StyledForm>
            <DatesContainer>
                {
                    eventCreationFormik.values.dates.map((date, idx) => (
                        <DateCard
                        key={'dates-' + idx}
                        name={date.name}
                        beginDate={checkFormatDate(date.eventBegin)}
                        endDate={checkFormatDate(date.eventEnd)}
                        location={date.location.label}
                        editable={editIdx === null}
                        edit={editIdx === idx}
                        setEdit={() => setEditIdx(idx)}>
                            <DateForm
                            newItem={onNewDate}
                            initialValues={date}
                            delete={() => deleteDate(idx)}
                            cancel={() => resetEdition()}
                            confirm={(dateItem: DateItem) => confirmDate(idx, dateItem)}/>
                        </DateCard>
                    ))
                }
            </DatesContainer>
            {
                editIdx === null ?
                    <AddDateButton
                    title={'Add Date'}
                    variant={'secondary'}
                    onClick={addDateDraft}/>
                :
                null
            }
            <SubmitButton
            onClick={() => {
                eventCreationFormik.handleFocus('');
                eventCreationFormik.setLoadingState(true);
                eventCreationFormik.handleBlur('submit', 'dates');
            }}
            {...eventCreationFormik.getSubmitButtonProps('Continue')}/>
      </StyledForm>
  );
};

const StyledForm = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const DatesContainer = styled.div`
    width: 100%;

    & > div {
        margin-bottom: ${props => props.theme.regularSpacing};
    }

    & > div:last-child {
        margin-bottom: 0;
    }
`;

const AddDateButton = styled(Button)`
    margin-top: ${props => props.theme.regularSpacing};
    width: calc(50% - ${props => props.theme.regularSpacing});
`;

const SubmitButton = styled(Button)`
    margin-top: ${props => props.theme.doubleSpacing};
    width: 100%;
`;

export default DatesForm;
