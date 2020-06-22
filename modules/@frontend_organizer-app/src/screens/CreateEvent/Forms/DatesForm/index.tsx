import React, { Dispatch, useState }     from 'react';
import styled                                       from 'styled-components';
import { datesConfigValidationSchema }              from './validationSchema';
import { EventsCreateDatesConfiguration }           from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { useDispatch, useSelector }                 from 'react-redux';
import { OrganizerState }                           from '../../../../redux/ducks';
import { useEventCreation }                         from '../../../../hooks/useEventCreation';
import { EventCreationActions, EventCreationSteps } from '../../../../core/event_creation/EventCreationCore';
import { DateCard }                                 from './DateCard';
import { DateForm }                                 from './DateForm';
import { checkFormatDate }               from '@frontend/core/lib/utils/date';
import { SetActionData, UpdateAction }              from '../../../../redux/ducks/event_creation';
import { CategoryItem }                             from '../CategoriesForm';
import { CreateDate }                               from './CreateDate';

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

const DatesForm: React.FC = () => {
    const [ editIdx, setEditIdx ]: [ number, Dispatch<number> ] = useState(null);
    const eventName: string = useSelector((state: OrganizerState) => state.eventCreation.textMetadata.name);

    const eventCreationFormik = useEventCreation<EventsCreateDatesConfiguration>(
        EventCreationSteps.Dates,
        EventCreationActions.DatesConfiguration,
        datesConfigValidationSchema,
    );

    const categories = useSelector((state: OrganizerState) => state.eventCreation.categoriesConfiguration);
    const dispatch = useDispatch();

    const resetEdition = () => {
        setEditIdx(null);
    };

    const deleteDate = (deleteIdx: number) => {
        eventCreationFormik.handleFocus('date delete');
        const dates: DateItem[] = eventCreationFormik.values.dates
            .filter((date: DateItem, idx: number) => deleteIdx !== idx);

        resetEdition();
        eventCreationFormik.update({dates});
        deleteRelatedCategories(deleteIdx);
    };

    const deleteRelatedCategories = (deleteIdx: number) => {
        const filteredCategories = categories.dates
            .filter((dateCategories: CategoryItem[], idx: number) => deleteIdx !== idx);

        dispatch(SetActionData(EventCreationActions.CategoriesConfiguration, {
            ...categories,
            dates: filteredCategories,
        }));
        dispatch(UpdateAction());
    };

    const updateDate = (comfirmedIdx: number ,updateDateItem: DateItem) => {
        eventCreationFormik.handleFocus('dates confirm');
        const dates: DateItem[] = eventCreationFormik.values.dates.map((dateItem: DateItem, idx) =>
            comfirmedIdx === idx ? updateDateItem : dateItem
        );

        eventCreationFormik.update({dates});
        resetEdition();
    };

    const createDate = (dateItem: DateItem) => {
        eventCreationFormik.handleFocus('dates confirm');
        const dates: DateItem[] = [
            ...eventCreationFormik.values.dates,
            dateItem,
        ];

        eventCreationFormik.update({dates});
    };

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
                            initialValues={date}
                            delete={() => deleteDate(idx)}
                            cancel={() => resetEdition()}
                            confirm={(dateItem: DateItem) => updateDate(idx, dateItem)}/>
                        </DateCard>
                    ))
                }
            </DatesContainer>
            <CreateDate
            forcedEdit={eventCreationFormik.values.dates.length === 0}
            initialName={eventName}
            initialLocation={
                eventCreationFormik.values.dates.length > 0 ?
                    eventCreationFormik.values.dates[eventCreationFormik.values.dates.length - 1].location :
                    undefined
            }
            editable={editIdx === null}
            onDateCreate={createDate}/>
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

export default DatesForm;
