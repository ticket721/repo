export function* identifyUser(token: string) {
    if ((window as any).analytics) {
        try {
            const userReq = yield (window as any).t721Sdk.users.me(token);

            const user = userReq.response.data.user;

            yield (window as any).analytics.identify(user.id, {
                email: user.email,
            });
        } catch (e) {
            console.warn('Unable to fetch user for analytics');
        }
    }
}
