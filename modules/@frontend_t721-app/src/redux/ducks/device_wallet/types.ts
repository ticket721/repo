export enum DeviceWalletTypes {
    Setup = '@@devicewallet/setup',
    SetPk = '@@devicewallet/setpk',
    StartRegenInterval = '@@devicewallet/startregeninterval',
    SetRegenIntervalId = '@@devicewallet/setregenintervaid',
    NextGen = '@@devicewallet/nextgen',
    PushSig = '@@devicewallet/pushsig',
    ResetTicket = '@@devicewallet/resetticket',
    SetSeconds = '@@devicewallet/setseconds',
}

export interface DeviceWalletState {
    regenIntervalId: number;
    pk: string;
    signatures: string[];
    currentTicketId: string;
    sigCount: number;
    seconds: number;
}

