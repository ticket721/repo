export enum DeviceWalletTypes {
    Setup = '@@devicewallet/setup',
    SetPk = '@@devicewallet/setpk',
    StartRegenInterval = '@@devicewallet/startregeninterval',
    SetRegenIntervalId = '@@devicewallet/setregenintervaid',
    NextGen = '@@devicewallet/nextgen',
    PushLastItem = '@@devicewallet/pushlastitem',
    ResetTicket = '@@devicewallet/resetticket',
    SetSeconds = '@@devicewallet/setseconds',
}

export interface DeviceWalletState {
    regenIntervalId: number;
    pk: string;
    signatures: string[];
    timestamps: number[];
    currentTicketId: string;
    sigCount: number;
    seconds: number;
}

