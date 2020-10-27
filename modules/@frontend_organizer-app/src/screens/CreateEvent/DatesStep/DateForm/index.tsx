import React from 'react';

import { useTranslation } from 'react-i18next';
import './locales';

import styled from 'styled-components';
import { useFormikContext } from 'formik';
import { EventCreationPayload } from '@common/global';
import { OnlineTag } from '../OnlineTag';
import { Button } from '@frontend/flib-react/lib/components';
import { DatesAndTypologyForm } from '../../../../components/DatesAndTypologyForm';

export interface DateFormProps {
    idx: number;
    newDate?: boolean;
    onComplete: () => void;
}

export const DateForm: React.FC<DateFormProps> = ({ idx, newDate, onComplete }) => {
    const [t] = useTranslation('date_form');
    const formikCtx = useFormikContext<EventCreationPayload>();
    const sigColors = formikCtx.values.imagesMetadata.signatureColors;

    return (
        <DateFormContainer>
            <Header>
                <Title>
                    <span>{t('date_title') + (idx + 1)}</span>
                    {formikCtx.values.datesConfiguration[idx].online ? (
                        <OnlineTag />
                    ) : null}
                </Title>
            </Header>
            <DatesAndTypologyForm parentField={`datesConfiguration[${idx}]`} />
            <ActionButton>
                {
                    newDate ?
                    <Button
                        title={t('cancel')}
                        variant={'secondary'}
                        onClick={() => {
                            onComplete();
                            formikCtx.setFieldValue(`datesConfiguration`,
                                formikCtx.values.datesConfiguration.filter((_, dateIdx) => dateIdx !== idx)
                            );
                        }}
                    /> :
                    null
                }
                <Button
                    title={t('confirm')}
                    variant={
                        formikCtx.errors.datesConfiguration &&
                        formikCtx.errors.datesConfiguration[idx]
                            ? 'disabled'
                            : !!sigColors[0] ? 'custom' : 'primary'
                    }
                    gradients={sigColors}
                    onClick={onComplete}
                />
            </ActionButton>
        </DateFormContainer>
    );
};

const DateFormContainer = styled.div`
    position: fixed;
    width: 650px;
    display: flex;
    flex-direction: column;
    border-radius: ${(props) => props.theme.defaultRadius};
    padding: ${(props) => props.theme.biggerSpacing};
    background-color: ${(props) => props.theme.darkBg};
    font-size: 13px;
    font-weight: bold;
    box-shadow: 0 0 16px black;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    top: 10px;
    right: 10px;
    margin-bottom: ${(props) => props.theme.biggerSpacing};
    text-transform: uppercase;

    .side-actions {
        position: absolute;
        top: 12px;
        right: 12px;
    }
`;

const Title = styled.div`
    display: flex;
    align-items: center;

    & > span:first-child {
        color: ${props => props.theme.textColor};
        margin-right: ${props => props.theme.smallSpacing};
        padding: 4px 0;
    }
`;

const ActionButton = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: ${(props) => props.theme.doubleSpacing};

    & > button {
        width: calc(40% - ${(props) => props.theme.regularSpacing});
        margin-left: ${(props) => props.theme.biggerSpacing};
    }
`;
