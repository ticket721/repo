import { T721SDK } from '../../../../sdk/sources';

export interface Config {
    t721sdk: {
        protocol: 'http' | 'https';
        host: string;
        port: number;
    };
}

export enum AppStatus {
    Loading = 0,
    Ready
}

export enum AppScope {
    Unauthenticated,
    User,
    Organizer,
    Admin
}

export interface SetupState {
    status: AppStatus;
    scope: AppScope;
    t721sdk: T721SDK;
    config: Config;
}
