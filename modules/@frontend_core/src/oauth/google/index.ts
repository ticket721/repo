import { Token } from '../../redux/ducks/auth/types';
import { T721SDK } from '@common/sdk';

interface LoginOptions {
    clientId: string;
    query_params: { [key: string]: string };
}

export const googleLogin = (options: LoginOptions): void => {
    let base: string = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURI(options.clientId)}`;

    if (options.query_params['redirect_uri']) {
        const url = new URL(options.query_params['redirect_uri']);

        if (!url.hostname.match(/[a-z]/i)) {
            options.query_params[
                'redirect_uri'
            ] = `${url.protocol}//${url.hostname}.xip.io:${url.port}${url.pathname}${url.search}`;
        }
    }

    for (const key of Object.keys(options.query_params)) {
        base += `&${key}=${encodeURI(options.query_params[key])}`;
    }

    window.location.href = base;
};

export const googleLoginSdkCall = async (idToken: string): Promise<Token> => {
    const sdk: T721SDK = (window as any).t721Sdk as T721SDK;

    const res = await sdk.googleLogin(idToken);

    return {
        value: res.data.token,
        expiration: new Date(res.data.expiration),
    };
};

interface LogoutOptions {
    clientId: string;
    query_params: { [key: string]: string };
}

export const googleLogout = (options: LogoutOptions): void => {
    let base: string = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURI(options.clientId)}`;

    for (const key of Object.keys(options.query_params)) {
        base += `&${key}=${encodeURI(options.query_params[key])}`;
    }

    window.location.href = base;
};
