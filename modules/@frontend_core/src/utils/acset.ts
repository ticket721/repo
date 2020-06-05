import { CacheCore } from '../cores/cache/CacheCore';

export const rightsKey = (token: string): string => CacheCore.key('rights.search',[
    token,
    {}
]);
