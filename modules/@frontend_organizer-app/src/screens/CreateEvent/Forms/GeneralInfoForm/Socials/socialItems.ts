import websitePic from '../../../../../media/images/social/website.svg';
import twitterPic from '../../../../../media/images/social/twitter.svg';
import facebookPic from '../../../../../media/images/social/facebook.svg';
import emailPic from '../../../../../media/images/social/email.svg';
import linkedInPic from '../../../../../media/images/social/linkedIn.svg';
import tiktokPic from '../../../../../media/images/social/tiktok.svg';
import instagramPic from '../../../../../media/images/social/instagram.svg';
import spotifyPic from '../../../../../media/images/social/spotify.svg';

import { IconColor } from '@frontend/flib-react/lib/components';

export interface SocialItem {
    name: string;
    color: IconColor;
    pic: string;
};

export const socialItems: SocialItem[] = [
    {
        name: 'website',
        color: '#5ac9eb',
        pic: websitePic,
    },
    {
        name: 'email',
        color: '#ff6d04',
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