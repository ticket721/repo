import { DatePayload, EventCreationPayload } from '@common/global';
import { useFormikContext } from 'formik';
import React, { useState }  from 'react';
import styled                                            from 'styled-components';
import { DateCard } from './DateCard';
import { DateForm } from './DateForm';
import { Scroll } from 'framer';
import { ConfirmDeletion } from './ConfirmDeletion';

import { useTranslation } from 'react-i18next';
import './locales';
import { Button } from '@frontend/flib-react/lib/components';

const initialDate: DatePayload = {
    name: '',
    online: false,
    eventBegin: null,
    eventEnd: null,
    location: {
        label: '',
        lat: null,
        lon: null,
    }
}

export const DatesStep: React.FC = () => {
    const [ t ] = useTranslation('dates_form');

    const [ currentEditingDate, setCurrentEditingDate ] = useState<number>(-1);
    const [ currentDeletingDate, setCurrentDeletingDate ] = useState<number>(-1);
    const [ newDate, setNewDate ] = useState<boolean>(false);

    const formikCtx = useFormikContext<EventCreationPayload>();

    const addDate = () => {
        const dateCount = formikCtx.values.datesConfiguration.length;
        setCurrentEditingDate(dateCount);
        setNewDate(true);
        formikCtx.setFieldValue(`datesConfiguration[${dateCount}]`, {
            ...initialDate,
            name: formikCtx.values.textMetadata.name,
        });
    };

    return (
        <StyledForm dateCount={formikCtx.values.datesConfiguration.length}>
            {
                formikCtx.values.datesConfiguration.length > 0 ?
                <>
                    <Delimiter/>
                    <Scroll
                    position={'static'}
                    width={'100%'}
                    wheelEnabled={true}
                    style={{
                        maxHeight: 'calc(100vh - 460px)'
                    }}
                    height={'auto'}>
                        <CardsContainer>
                            {
                                formikCtx.values.datesConfiguration
                                .filter((_, idx) => currentEditingDate !== idx)
                                .map((_, idx) =>
                                    <DateCard
                                    key={`date-${idx}`}
                                    idx={idx}
                                    onEdition={() => setCurrentEditingDate(idx)}
                                    triggerDelete={() => setCurrentDeletingDate(idx)}/>
                                )
                            }
                        </CardsContainer>
                    </Scroll>
                    <Delimiter/>
                </> :
                null
            }
            {
                currentEditingDate > -1 ?
                <DisabledBg>
                    <DateForm
                    idx={currentEditingDate}
                    newDate={newDate}
                    onComplete={() => {
                        setCurrentEditingDate(-1);
                        setNewDate(false);
                    }}/>
                </DisabledBg> :
                <AddDate>
                    <Button
                    title={t('add_new_date')}
                    variant={'custom'}
                    gradients={formikCtx.values.imagesMetadata.signatureColors}
                    onClick={addDate} />
                </AddDate>
            }
            {
                currentDeletingDate > -1 ?
                <ConfirmDeletion
                idx={currentDeletingDate}
                complete={() => {
                    setCurrentDeletingDate(-1);
                    setTimeout(() => formikCtx.validateForm(), 400);
                }}/> :
                null
            }
      </StyledForm>
  );
};

const StyledForm = styled.div<{ dateCount: number }>`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const CardsContainer = styled.div`
    padding-top: ${props => props.theme.regularSpacing};

    & > div {
        margin-bottom: ${props => props.theme.biggerSpacing};
    }
`;

const Delimiter = styled.div`
    position: relative;
    left: -10px;
    width: calc(100% + 20px);
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
    z-index: 1;
`;

const DisabledBg = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);
`;

const AddDate = styled.div`
    width: 50%;
    margin-top: ${props => props.theme.smallSpacing};
`;
