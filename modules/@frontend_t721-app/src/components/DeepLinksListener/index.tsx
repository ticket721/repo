import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Plugins } from '@capacitor/core';
const { App: CapApp } = Plugins;

const DeepLinksListener: React.FC<any> = () => {
    const history = useHistory();
    useEffect(() => {
        CapApp.addListener('appUrlOpen', (data: any) => {

            const slug = data.url.split('app.ticket721.com').pop();
            if (slug) {
                console.log('Slug !', slug);
                history.push(slug);
            }

        });
    }, []);

    return null;
};

export default DeepLinksListener;

