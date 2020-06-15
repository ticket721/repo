import React, { useEffect, useRef } from 'react';
import styled                       from 'styled-components';
import GeneralInfoForm              from '../../components/GeneralInfoForm';
import { useDispatch, useSelector } from 'react-redux';
import { MergedAppState }           from '../../index';
import { InitEventAcset }           from '../../redux/ducks/event_creation';
import { EventCreationSteps }       from '../../core/event_creation/EventCreationCore';
import StylesForm                   from '../../components/StylesForm';
import DatesForm                    from '../../components/DatesForm';
import '@frontend/core/lib/utils/window';
import { OrganizerState }           from '../../redux/ducks';
import { CategoriesForm }           from '../../components/CategoriesForm';

const CreateEvent: React.FC = () => {
    const StylesFormRef = useRef(null);
    const DatesFormRef = useRef(null);
    const CategoriesFormRef = useRef(null);

    const dispatch = useDispatch();
    const [ token, eventAcsetId, lastCompletedStep ]:
        [ string, string, EventCreationSteps ] =
        useSelector((state: MergedAppState) => [
            state.auth.token.value,
            state.eventCreation.acsetId,
            state.eventCreation.completedStep,
        ]);

    const scrollToRef = (ref: any) =>
        window.scrollTo({ top: ref.current.offsetTop, left: 0, behavior: 'smooth' });

    const datesLength = useSelector((state: OrganizerState) => state.eventCreation.datesConfiguration.dates.length);

    useEffect(() => {
        if (!eventAcsetId) {
            dispatch(InitEventAcset());
        }
    }, [
        eventAcsetId,
        dispatch
    ]);

    useEffect(() => {
        switch (lastCompletedStep) {
            case EventCreationSteps.GeneralInfo:
                scrollToRef(StylesFormRef);
                break;
            case EventCreationSteps.Styles:
                global.window.t721Sdk.actions.update(token, eventAcsetId, {
                    data: {},
                }).then(() => {
                    console.log('complete module');
                });
                break;
            case EventCreationSteps.Modules:
                scrollToRef(DatesFormRef);
                break;
            case EventCreationSteps.Dates:
                scrollToRef(DatesFormRef);
                break;
        }
    }, [
        lastCompletedStep,
        eventAcsetId,
        token,
    ]);

    return (
        <Container>
        {
            eventAcsetId &&
            <Forms>
                <FormWrapper>
                    <Title>General Informations</Title>
                    <GeneralInfoForm/>
                </FormWrapper>
                { lastCompletedStep >= EventCreationSteps.GeneralInfo && (
                    <FormWrapper ref={StylesFormRef}>
                        <Title>Event Style</Title>
                        <StylesForm />
                    </FormWrapper>
                )}
                { lastCompletedStep >= EventCreationSteps.Modules && (
                    <FormWrapper ref={DatesFormRef}>
                        <Title>Event Dates {
                            datesLength > 0 ?
                            <span className={'date-quantity'}>
                                - {datesLength} date{datesLength > 1 ? 's' : null}
                            </span> :
                                null
                        }</Title>
                        <DatesForm />
                    </FormWrapper>
                )}
                {lastCompletedStep >= EventCreationSteps.Dates && (
                    <FormWrapper ref={CategoriesFormRef}>
                        <Title>Ticket categories</Title>
                        <CategoriesForm />
                    </FormWrapper>
                )}
            </Forms>
        }
        </Container>
    )
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

const Forms = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 600px;
`;

const FormWrapper = styled.div`
    width: 100%;
    margin: 50px 0;
    min-height: 65vh;
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.theme.textColor};
    margin-bottom: ${(props) => props.theme.doubleSpacing};
    text-align: left;
    width: 100%;

    .date-quantity {
        font-weight: 400;
        font-size: 15px;
        color: rgba(255,255,255,0.6);
    }
`;

export default CreateEvent;
