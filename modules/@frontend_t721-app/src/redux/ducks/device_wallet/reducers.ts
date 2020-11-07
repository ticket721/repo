import { Reducer }                                      from 'redux';
import { DeviceWalletTypes, DeviceWalletState }                                                                                from './types';

import {
    DeviceWalletAction,
    INextGen,
    IPushLastItem,
    IResetTicket,
    ISetPk,
    ISetRegenIntervalId,
    ISetSeconds,
    IStartRegenInterval,
} from './actions';

export const deviceWalletInitialState: DeviceWalletState = {
    pk: null,
    currentTicketId: null,
    regenIntervalId: null,
    signatures: [],
    timestamps: [],
    sigCount: 2,
    seconds: 5,
};


const SetPkReducer: Reducer<DeviceWalletState, ISetPk> = (
    state: DeviceWalletState,
    action: ISetPk,
): DeviceWalletState => ({
    ...state,
    pk: action.pk,
});

const StartRegenIntervalReducer: Reducer<DeviceWalletState, IStartRegenInterval> = (
    state: DeviceWalletState,
    action: IStartRegenInterval,
): DeviceWalletState => ({
    ...state,
    currentTicketId: action.ticketId,
});

const SetRegenIntervalReducer: Reducer<DeviceWalletState, ISetRegenIntervalId> = (
    state: DeviceWalletState,
    action: ISetRegenIntervalId,
): DeviceWalletState => ({
    ...state,
    regenIntervalId: action.id,
});

const NextGenReducer: Reducer<DeviceWalletState, INextGen> = (
    state: DeviceWalletState,
    action: INextGen,
): DeviceWalletState => ({
    ...state,
    signatures: state.signatures.slice(1),
    timestamps: state.timestamps.slice(1),
});

const PushLastItemReducer: Reducer<DeviceWalletState, IPushLastItem> = (
    state: DeviceWalletState,
    action: IPushLastItem,
): DeviceWalletState => ({
    ...state,
    signatures: [
        ...state.signatures,
        action.signature,
    ],
    timestamps: [
        ...state.timestamps,
        action.timestamp
    ],
});

const ResetTicketReducer: Reducer<DeviceWalletState, IResetTicket> = (
    state: DeviceWalletState,
    action: IResetTicket,
): DeviceWalletState => ({
    ...state,
    regenIntervalId: null,
    signatures: [],
    timestamps: [],
    currentTicketId: null,
    seconds: 5,
});

const SetSecondsReducer: Reducer<DeviceWalletState, ISetSeconds> = (
    state: DeviceWalletState,
    action: ISetSeconds,
): DeviceWalletState => ({
    ...state,
    seconds: action.seconds,
});

export const DeviceWalletReducer: Reducer<DeviceWalletState, DeviceWalletAction> = (
    state: DeviceWalletState = deviceWalletInitialState,
    action: DeviceWalletAction,
): DeviceWalletState => {
    switch (action.type) {
        case DeviceWalletTypes.SetPk:
            return SetPkReducer(state, action as ISetPk);
        case DeviceWalletTypes.StartRegenInterval:
            return StartRegenIntervalReducer(state, action as IStartRegenInterval);
        case DeviceWalletTypes.SetRegenIntervalId:
            return SetRegenIntervalReducer(state, action as ISetRegenIntervalId);
        case DeviceWalletTypes.NextGen:
            return NextGenReducer(state, action as INextGen);
        case DeviceWalletTypes.PushLastItem:
            return PushLastItemReducer(state, action as IPushLastItem);
        case DeviceWalletTypes.ResetTicket:
            return ResetTicketReducer(state, action as IResetTicket);
        case DeviceWalletTypes.SetSeconds:
            return SetSecondsReducer(state, action as ISetSeconds);
        default:
            return state;
    }
};
