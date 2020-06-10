import React, { useEffect }         from 'react';
import styled                       from 'styled-components';
import GeneralInfoForm              from '../../components/GeneralInfoForm';
import { useDispatch, useSelector } from 'react-redux';
import { MergedAppState }           from '../../index';
import { InitEventAcset }           from '../../redux/ducks/event_creation';
import { EventCreationSteps }       from '../../core/event_creation/EventCreationCore';
import StylesForm                   from '../../components/StylesForm';

const CreateEvent: React.FC = () => {
    const dispatch = useDispatch();
    const [ eventAcsetId, lastCompletedStep ]:
        [ string, EventCreationSteps ] =
        useSelector((state: MergedAppState) => [
            state.eventCreation.acsetId,
            state.eventCreation.completedStep,
        ]);

    useEffect(() => {
        if (!eventAcsetId) {
            dispatch(InitEventAcset());
        }
    }, [
        eventAcsetId,
        dispatch
    ]);

    return (
        <Container>
        {
            eventAcsetId &&
            <Forms>
                <>
                    <Title>General Informations</Title>
                    <GeneralInfoForm />
                </>
                { lastCompletedStep >= EventCreationSteps.GeneralInfo && (
                    <>
                        <Title>Event Style</Title>
                        <StylesForm />
                    </>
                )}
                {/*{lastCompletedStep >= EventCreationSteps.Styles && (*/}
                {/*    <>*/}
                {/*        <Title>Event Dates</Title>*/}
                {/*        <DatesForm />*/}
                {/*    </>)*/}
                {/*}*/}
                {/*{lastCompletedStep >= EventCreationSteps.Dates && (*/}
                {/*    <>*/}
                {/*        <Title>Ticket categories</Title>*/}
                {/*        <CategorizeTicketsForm />*/}
                {/*    </>*/}
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
    scroll-behavior: smooth;
`;

const Forms = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 600px;
    margin: 40px 0 20px 0;
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.theme.textColor};
    margin-bottom: 8px;
    text-align: left;
    width: 100%;
`;

export default CreateEvent;
