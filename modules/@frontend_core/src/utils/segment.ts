import { AxiosResponse } from 'axios';
import { getEnv }        from './getEnv';

import { segmentPlugin } from '@jairemix/capacitor-segment';

console.log('lo');

let segment: any;

const script = (token: string) => {

    const analytics = (window as any).analytics = (window as any).analytics || [];

    if (!analytics.initialize) {

        if (analytics.invoked) {

            if ((window as any).console && console.error) {
                console.error('Segment snippet included twice.');
            }

        } else {

            analytics.invoked = !0;
            analytics.methods = ['trackSubmit', 'trackClick', 'trackLink', 'trackForm', 'pageview', 'identify', 'reset', 'group', 'track', 'ready', 'alias', 'debug', 'page', 'once', 'off', 'on', 'addSourceMiddleware', 'addIntegrationMiddleware', 'setAnonymousId', 'addDestinationMiddleware'];
            analytics.factory = function(e: any) {
                return function() {
                    const t = Array.prototype.slice.call(arguments);
                    t.unshift(e);
                    analytics.push(t);
                    return analytics
                }
            };
            // tslint:disable-next-line:prefer-for-of
            for (let e = 0; e < analytics.methods.length; e++) {
                const t = analytics.methods[e];
                analytics[t] = analytics.factory(t)
            }
            analytics.load = function(e: any, t: any) {
                const n = document.createElement('script');
                n.type = 'text/javascript';
                n.async = !0;
                n.src = 'https://cdn.segment.com/analytics.js/v1/' + e + '/analytics.min.js';
                const a = document.getElementsByTagName('script')[0];
                a.parentNode.insertBefore(n, a);
                analytics._loadOptions = t
            };
            analytics.SNIPPET_VERSION = '4.1.0';
            analytics.load(token, undefined);
            analytics.page();

        }

    }

};

const setupSegment = async () => {
    const segmentToken = getEnv().REACT_APP_SEGMENT_API_KEY;

    if (segmentToken !== 'UNSET') {

        if (isNative()) {

            console.log('it is native');
            await segmentPlugin.setUp({
                key: segmentToken,
                trackLifecycle: true
            });
            console.log('it is setup');
            segment = segmentPlugin;
        } else {
            console.log('it is web');
            script(segmentToken);
            segment = (window as any).analytics;
        }

    } else {
        segment = null;
    }
};

const isNative = () => {
    return (segmentPlugin && segmentPlugin.setUp);
};

export const getSegment = async (): Promise<any> => {
    if (segment === undefined) {
        console.log('undefined');
        await setupSegment();
    }
    return segment;
};

export function* identifyUser(token: string): IterableIterator<any> {

    console.log('identify');

    const analytics: any = yield getSegment();
    console.log('analytics', analytics);

    if (analytics === null) {
        console.warn('Analytics are disabled');
        return ;
    }
    try {
        const user: AxiosResponse = yield (window as any).t721Sdk.users.me(token);

        if (isNative()) {
            yield analytics.identity({
                userID: user.data.user.id,
                traits: {
                    email: user.data.user.email
                },
            })
        } else {
            console.log('should be here');
            yield analytics.identify(
                user.data.user.id,
                {
                    email: user.data.user.email
                }
            );
        }

    } catch (e) {
        console.warn(`Unable to identify user`);
    }
}

