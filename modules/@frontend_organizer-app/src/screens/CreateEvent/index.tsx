import React, { Dispatch, useEffect, useRef, useState } from 'react';
import styled                                           from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import '@frontend/core/lib/utils/window';
import { MergedAppState }           from '../../index';
import { InitEventAcset }           from '../../redux/ducks/event_creation';
import { EventCreationSteps }       from '../../core/event_creation/EventCreationCore';
import { OrganizerState }           from '../../redux/ducks';

import { Icon } from '@frontend/flib-react/lib/components';

import GeneralInfoForm     from './Forms/GeneralInfoForm';
import StylesForm          from './Forms/StylesForm';
import DatesForm           from './Forms/DatesForm';
import CategoriesForm      from './Forms/CategoriesForm';

import { useTranslation }     from 'react-i18next';
import './locales';
import { EventCreateActions } from './EventCreateActions';

const ScrollToLastStep: React.FC<{reference: any}> = ({reference}) => {
    const scrollToRef = () =>
        window.scrollTo({ top: reference.current.offsetTop, left: 0, behavior: 'smooth' });

    return (
        <ArrowNextStep onClick={() => scrollToRef()}>
            <Icon
            icon={'arrow'}
            size={'30px'}
            color={'#FFF'}/>
        </ArrowNextStep>
    );
};

const CreateEvent: React.FC = () => {
    const [ t ] = useTranslation('create_event');
    const FormRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    const dispatch = useDispatch();
    const [ token, eventAcsetId, lastCompletedStep, currentActionIdx ]:
        [ string, string, EventCreationSteps, number ] =
        useSelector((state: MergedAppState) => [
            state.auth.token.value,
            state.eventCreation.acsetId,
            state.eventCreation.completedStep,
            state.eventCreation.currentActionIdx,
        ]);

    const datesLength = useSelector((state: OrganizerState) => state.eventCreation.datesConfiguration.dates.length);

    const [ showScroll, setShowScroll]: [ boolean, Dispatch<boolean> ] = useState(null);

    useEffect(() => {
        if (!eventAcsetId) {
            dispatch(InitEventAcset());
        }
    }, [
        eventAcsetId,
        dispatch
    ]);

    useEffect(() => {
        if (currentActionIdx && FormRefs[currentActionIdx]?.current?.innerText) {
            setShowScroll(window.scrollY < FormRefs[currentActionIdx].current?.offsetTop - 300);
        }
    }, [currentActionIdx, FormRefs]);

    useEffect(() => {
        switch (lastCompletedStep) {
            case EventCreationSteps.Styles:
                global.window.t721Sdk.actions.update(token, eventAcsetId, {
                    data: {},
                }).then(() => {
                    console.log('complete module');
                });
                break;
            case EventCreationSteps.Categories:
                global.window.t721Sdk.actions.update(token, eventAcsetId, {
                    data: {
                        admins: [],
                    },
                }).then(() => {
                    console.log('complete admins');
                });
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
                <FormWrapper ref={FormRefs[0]}>
                    <Title>{t('general_infos_title')}</Title>
                    <GeneralInfoForm/>
                </FormWrapper>
                { lastCompletedStep >= EventCreationSteps.GeneralInfo && (
                    <FormWrapper ref={FormRefs[1]} disabled={currentActionIdx < 1}>
                        <Title>{t('styles_title')}</Title>
                        <StylesForm/>
                    </FormWrapper>
                )}
                {lastCompletedStep >= EventCreationSteps.Styles && (
                    <div ref={FormRefs[2]} />
                )}
                { lastCompletedStep >= EventCreationSteps.Modules && (
                    <FormWrapper ref={FormRefs[3]} disabled={currentActionIdx < 3}>
                        <Title>{t('dates_title')} {
                            datesLength > 0 ?
                            <span className={'date-quantity'}>
                                - {datesLength} date{datesLength > 1 ? 's' : null}
                            </span> :
                                null
                        }</Title>
                        <DatesForm/>
                    </FormWrapper>
                )}
                {lastCompletedStep >= EventCreationSteps.Dates && (
                    <FormWrapper ref={FormRefs[4]} disabled={currentActionIdx < 4}>
                        <Title>{t('categories_title')}</Title>
                        <CategoriesForm/>
                    </FormWrapper>
                )}
                {lastCompletedStep >= EventCreationSteps.Categories && (
                    <div ref={FormRefs[5]} />
                )}
                <EventCreateActions
                token={token}
                eventAcsetId={eventAcsetId}/>
                {
                    showScroll ?
                    <ScrollToLastStep reference={FormRefs[currentActionIdx]} /> :
                        null
                }
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

const FormWrapper = styled.div<{ disabled?: boolean }>`
    width: 100%;
    margin: 50px 0;
    min-height: 65vh;
    opacity: ${props => props.disabled ? 0.3 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
    filter: ${props => props.disabled ? 'grayscale(0.8)' : 'none'};
`;

const ArrowNextStep = styled.div`
    position: fixed;
    bottom: 50px;
    right: 50px;
    cursor: pointer;
    transform: rotate(90deg);
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
