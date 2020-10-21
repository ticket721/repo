import React from 'react';
import { EventCreationPayload } from '@common/global';
import { useFormikContext } from 'formik';
import styled from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';
import { format } from '@frontend/core/lib/utils/date';

import { useTranslation }     from 'react-i18next';
import './locales';

export interface CardInformationsProps {
    idx: number;
}

export const CardInformations: React.FC<CardInformationsProps> = ({ idx }) => {
    const [ t ] = useTranslation('date_card');
    const formikCtx = useFormikContext<EventCreationPayload>();
    const primaryColor = formikCtx.values.imagesMetadata.signatureColors[0];

    return <CardInformationsContainer>
        <DateDetails>
            <Icon
                icon={'calendar'}
                size={'16px'}
                color={primaryColor} />
            <span>{format(formikCtx.values.datesConfiguration[idx].eventBegin)}</span>
            <Arrow
                icon={'arrow'}
                size={'15px'}
                color={'rgba(255, 255, 255, 0.9)'}/>
            <span>{format(formikCtx.values.datesConfiguration[idx].eventEnd)}</span>
        </DateDetails>
        {
            !formikCtx.values.datesConfiguration[idx].online ?
                <LinkContainer primaryColor={primaryColor}>
                    <Icon
                        icon={'pin'}
                        size={'16px'}
                        color={primaryColor} />
                        <a
                        href={`https://maps.google.com/?q=${encodeURI(formikCtx.values.datesConfiguration[idx].location.label)}`}
                        target='_blank'
                        rel={'noopener noreferrer'}>
                            {formikCtx.values.datesConfiguration[idx].location.label}
                        </a>
                </LinkContainer> :
                <LinkContainer primaryColor={primaryColor}>
                    <Icon
                        icon={'link'}
                        size={'16px'}
                        color={primaryColor} />
                        {
                            formikCtx.values.datesConfiguration[idx].liveLink ?
                            <a
                            href={formikCtx.values.datesConfiguration[idx].liveLink}
                            target='_blank'
                            rel={'noopener noreferrer'}>
                                {t('online_link')}
                            </a> :
                            <Unset>{t('link_placeholder')}</Unset>
                        }
                </LinkContainer>
        }
    </CardInformationsContainer>;
}

const CardInformationsContainer = styled.div`
    position: relative;
`;

const DateDetails = styled.div`
    display: flex;
    align-items: center;

    & > span:first-child {
        margin-right: ${props => props.theme.regularSpacing};
    }
`;

const Arrow = styled(Icon)`
    margin: 0 20px;
`;

const LinkContainer = styled.div<{ primaryColor: string }>`
    display: flex;
    align-items: center;
    margin-top: ${props => props.theme.regularSpacing};

    a {
        margin-left: ${props => props.theme.regularSpacing};
        color: ${props => props.primaryColor};
        text-decoration: underline;
        font-weight: 400;
    }
`;

const Unset = styled.span`
    margin-left: ${props => props.theme.regularSpacing};
    color: ${props => props.theme.textColorDarker};
`;
