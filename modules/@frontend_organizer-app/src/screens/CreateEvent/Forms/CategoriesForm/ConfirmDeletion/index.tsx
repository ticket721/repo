import { EventCreationPayload } from '@common/global';
import { useFormikContext } from 'formik';
import React from 'react';
import styled from 'styled-components';

import { useTranslation }     from 'react-i18next';
import './locales';

import { Button, Popup } from '@frontend/flib-react/lib/components';

export interface ConfirmDeletionProps {
    idx: number;
    complete: () => void;
}

export const ConfirmDeletion: React.FC<ConfirmDeletionProps> = ({ idx, complete }) => {
    const [ t ] = useTranslation('confirm_category_deletion');
    const formikCtx = useFormikContext<EventCreationPayload>();
    const sigColors = formikCtx.values.imagesMetadata.signatureColors;

    const categoryName = formikCtx.values.categoriesConfiguration[idx].name;

    const deleteCategory = () => {
        formikCtx.setFieldTouched(
            'categoriesConfiguration',
            undefined
        );
        formikCtx.setFieldValue(
            'categoriesConfiguration',
            formikCtx.values.categoriesConfiguration.filter((_, categoryIdx) => categoryIdx !== idx)
        );
        complete();
    };

    return <Popup>
        <Msg>{t('confirmation_msg')} <span>{categoryName}</span></Msg>
        <Actions>
            <Button
            onClick={complete}
            title={t('cancel')}
            variant={'secondary'} />
            <Button
            onClick={deleteCategory}
            title={t('confirm')}
            variant={'custom'}
            gradients={sigColors} />
        </Actions>
    </Popup>
}

const Msg = styled.div`
    line-height: 20px;
    text-align: center;

    & > span {
        text-transform: uppercase;
        font-weight: 600;
    }
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-top: ${props => props.theme.biggerSpacing};

    & > button:last-child {
        margin-left: ${props => props.theme.regularSpacing};
    }
`;
