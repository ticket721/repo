import React, { useEffect }         from 'react';
import styled                       from 'styled-components';
import GeneralInfoForm              from '../../components/GeneralInfoForm';
import { useDispatch, useSelector } from 'react-redux';
import { MergedAppState }           from '../../index';
import { InitEventAcset }           from '../../redux/ducks/event_creation';

const CreateEvent: React.FC = () => {
    const dispatch = useDispatch();
    const eventAcset = useSelector((state: MergedAppState) => state.eventCreation);

    useEffect(() => {
        if (!eventAcset.acsetId) {
            dispatch(InitEventAcset());
        }
    }, [
        eventAcset.acsetId,
        dispatch
    ]);

    return (
        <Container>
            {
                eventAcset.acsetId ?
                    <GeneralInfoForm /> :
                    null
            }
        </Container>
    )
};

const Container = styled.div`
    margin: 170px 420px;
`;

export default CreateEvent;
