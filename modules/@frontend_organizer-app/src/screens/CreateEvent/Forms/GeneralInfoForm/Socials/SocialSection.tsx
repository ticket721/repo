import React, { useEffect, useState } from 'react';
import styled                      from 'styled-components';

import { useTranslation } from 'react-i18next';
import './locales';
import { IconColor } from '@frontend/flib-react/lib/components/icon';

import websitePic from '../../../../../media/images/social/website.svg';
import twitterPic from '../../../../../media/images/social/twitter.svg';
import facebookPic from '../../../../../media/images/social/facebook.svg';
import emailPic from '../../../../../media/images/social/email.svg';
import linkedInPic from '../../../../../media/images/social/linkedIn.svg';
import tiktokPic from '../../../../../media/images/social/tiktok.svg';
import instagramPic from '../../../../../media/images/social/instagram.svg';
import spotifyPic from '../../../../../media/images/social/spotify.svg';

import { SocialInput } from './SocialInput';
import { SocialBtn } from './SocialBtn';

interface SocialItem {
    name: string;
    color: IconColor;
    pic: string;
};

export const SocialSection: React.FC = () => {
    const [ t ] = useTranslation('socials');

    const socialItems: SocialItem[] = [
        {
            name: 'website',
            color: '#5ac9eb',
            pic: websitePic,
        },
        {
            name: 'email',
            color: '#ffff55',
            pic: emailPic,
        },
        {
            name: 'twitter',
            color: '#00acee',
            pic: twitterPic,
        },
        {
            name: 'facebook',
            color: '#3b5998',
            pic: facebookPic,
        },
        {
            name: 'linked_in',
            color: '#0e76a8',
            pic: linkedInPic,
        },
        {
            name: 'tiktok',
            color: '#fd3e3e',
            pic: tiktokPic,
        },
        {
            name: 'instagram',
            color: {
                hexCodes: [
                    '#feda75',
                    '#fa7e1e',
                    '#d62976',
                    '#962fbf',
                    '#4f5bd5',
                ],
                angle: 45,
            },
            pic: instagramPic,
        },
        {
            name: 'spotify',
            color: '#1DB954',
            pic: spotifyPic,
        },

    ];

    const [activeSocialItems, setActiveSocialItems] = useState<SocialItem[]>([]);

    useEffect(() => {
        const checkedItems: SocialItem[] = [];

        for (let i = 0; i < socialItems.length; ++i) {
            if (JSON.parse(localStorage.getItem('event-creation')).values.textMetadata[socialItems[i].name]) {
                checkedItems.push(socialItems[i]);
            }
        }

        setActiveSocialItems(checkedItems);
    }, []);

    return (
        <SocialContainer>
            <Description>
                {t('social_description')}
            </Description>
            {
                activeSocialItems.map(({
                    name: socialName,
                    color: socialColor,
                }: SocialItem, idx: number) => 
                    <SocialInput
                    key={socialName}
                    name={socialName}
                    color={socialColor}
                    pattern={'[A-Za-z][0-9]'}
                    options={
                        (socialName === 'twitter' || socialName === 'tiktok' || socialName === 'instagram') ?
                        {
                            prefix: '@',
                            noImmediatePrefix: true,
                        } :
                        null
                    }
                    onRemove={() => setActiveSocialItems(activeSocialItems.filter((_, i) => i !== idx))}
                    />
                )
            }
            <SocialButtons>
                {
                    socialItems.map((socialItem: SocialItem) => {
                        if (activeSocialItems.findIndex(({ name: activeSocialName }: SocialItem) => activeSocialName === socialItem.name) === -1) {
                            return <SocialBtn
                                key={socialItem.name}
                                name={socialItem.name}
                                pic={socialItem.pic}
                                onClick={() => setActiveSocialItems([...activeSocialItems, socialItem])}
                            />
                        }
                    })
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
