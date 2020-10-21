import React from 'react';

import styled from 'styled-components';
import { useFormikContext } from 'formik';
import { EventCreationPayload } from '@common/global';
import { SideActions } from './SideActions';
import { CardInformations } from './CardInformations';

import { useTranslation }     from 'react-i18next';
import './locales';
import { MultiDatesTag } from '../MultiDatesTag';

export interface CategoryCardProps {
    idx: number;
    onEdition: (onError: boolean) => void;
    triggerDelete: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ idx, onEdition, triggerDelete }) => {
    const [ t ] = useTranslation('category_card');
    const formikCtx = useFormikContext<EventCreationPayload>();

    return (
        <CategoryCardContainer
        error={formikCtx.errors.categoriesConfiguration && !!formikCtx.errors.categoriesConfiguration[idx]}>
            <Header>
                <Title>
                    <span>{formikCtx.values.categoriesConfiguration[idx].name}</span>
                    {formikCtx.values.categoriesConfiguration[idx].dates.length > 1 ? (
                        <MultiDatesTag />
                    ) : null}
                </Title>
                <div className={'side-actions'}>
                    <SideActions
                    edit={() => onEdition(
                        formikCtx.errors.categoriesConfiguration && !!formikCtx.errors.categoriesConfiguration[idx]
                    )}
                    triggerDelete={triggerDelete}/>
                </div>
            </Header>
            <CardInformations idx={idx}/>
            {
                formikCtx.errors.categoriesConfiguration && !!formikCtx.errors.categoriesConfiguration[idx] ?
                <Error>
                    {t('error_msg')}
                </Error> :
                null
            }
        </CategoryCardContainer>
    );
};

const CategoryCardContainer = styled.div<{ error: boolean }>`
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

const Title = styled.span`
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