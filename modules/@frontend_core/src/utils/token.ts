import { Token } from '../redux/ducks/auth';

export const isExpired = (token: Token): boolean => token.expiration.getTime() < Date.now();

export const isValidFormat = (token: Token): boolean => {
    if (!token.value || !token.expiration) {
        return false;
    }

    return !isNaN(token.expiration.getTime());
};

export const parseToken = (token: string): Token => ({
        value: JSON.parse(token).value,
        expiration: new Date(JSON.parse(token).expiration),
});
