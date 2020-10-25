import React from 'react';
import styled                      from 'styled-components';

import { useTranslation } from 'react-i18next';
import './locales';

import { SocialInput } from './SocialInput';
import { SocialBtn } from './SocialBtn';
import { SocialItem, socialItems } from './socialItems';
import { useFormikContext } from 'formik';
import { DateCreationPayload, EventCreationPayload } from '@common/global';

export const SocialSection: React.FC = () => {
    const [ t ] = useTranslation('socials');

    const formikCtx = useFormikContext<EventCreationPayload | DateCreationPayload>();

    return (
        <SocialContainer>
            <Description>
                {t('social_description')}
            </Description>
            {
                socialItems
                .filter(item => formikCtx.values.textMetadata[item.name] !== undefined)
                .map(({
                    name: socialName,
                    color: socialColor,
                }: SocialItem) =>
                    <SocialInput
                        key={socialName}
                        name={socialName}
                        color={socialColor}
                        pattern={'[A-Za-z][0-9]'}
                        prefix={
                            (socialName === 'twitter' || socialName === 'tiktok' || socialName === 'instagram') ?
                            '@' :
                            null
                        }
                    />
                )
            }
            <SocialButtons>
                {
                    socialItems
                    .filter(item => formikCtx.values.textMetadata[item.name] === undefined)
                    .map(item =>
                        <SocialBtn
                            key={item.name}
                            name={item.name}
                            pic={item.pic}
                            onClick={() => formikCtx.setFieldValue(`textMetadata.${item.name}`, '')}
                        />
                    )
                }
            </SocialButtons>
            <Description>
                {t('social_warning')}
            </Description>
        </SocialContainer>
    );
};

const SocialContainer = styled.div`
    margin-top: ${props => props.theme.doubleSpacing};
`;

const Description = styled.h2`
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: ${props => props.theme.textColorDark};
    margin-top: ${props => props.theme.smallSpacing};
    margin-bottom: ${props => props.theme.biggerSpacing};
    white-space: pre-wrap;
`;

const SocialButtons = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    height: 50px;
`;
