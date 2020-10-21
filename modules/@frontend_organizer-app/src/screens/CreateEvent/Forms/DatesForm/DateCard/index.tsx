import React from 'react';

import { useTranslation }     from 'react-i18next';
import './locales';

import styled from 'styled-components';
import { useFormikContext } from 'formik';
import { EventCreationPayload } from '@common/global';
import { OnlineTag } from '../OnlineTag';
import { SideActions } from './SideActions';
import { CardInformations } from './CardInformations';

export interface DateCardProps {
    idx: number;
    onEdition: () => void;
    triggerDelete: () => void;
}

export const DateCard: React.FC<DateCardProps> = ({ idx, onEdition, triggerDelete }) => {
    const [ t ] = useTranslation('date_card');
    const formikCtx = useFormikContext<EventCreationPayload>();

    return (
        <DateCardContainer
        error={formikCtx.errors.datesConfiguration && !!formikCtx.errors.datesConfiguration[idx]}>
            <Header>
                <Title>
                    <span>{t('date_title') + (idx + 1)}</span>
                    {
                        formikCtx.values.datesConfiguration[idx].online ?
                        <OnlineTag/> :
                        null
                    }
                </Title>
                <div className={'side-actions'}>
                    <SideActions
                    edit={onEdition}
                    triggerDelete={triggerDelete}/>
                </div>
            </Header>
            <CardInformations idx={idx} />
            {
                formikCtx.errors.datesConfiguration && !!formikCtx.errors.datesConfiguration[idx] ?
                <Error>
                    {t('error_msg')}
                </Error> :
                null
            }
        </DateCardContainer>
    );
};

const DateCardContainer = styled.div<{ error: boolean }>`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => props.theme.biggerSpacing};
    background-color: ${props => props.theme.darkerBg};
    font-size: 13px;
    font-weight: bold;
    transition: background-color 300ms;
    border: ${props => props.error ? `1px solid ${props.theme.errorColor.hex}` : 'none'};
    box-shadow: 0 0 8px rgba(0,0,0,0.4);


    &:hover .side-actions {
        display: block;
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    top: 10px;
    right: 10px;
    margin-bottom: ${props => props.theme.biggerSpacing};
    text-transform: uppercase;

    .side-actions {
        display: none;
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

const Error = styled.span`
    position: absolute;
    top: 6px;
    left: 6px;
    color: ${props => props.theme.errorColor.hex};
    font-weight: 500;
`;
