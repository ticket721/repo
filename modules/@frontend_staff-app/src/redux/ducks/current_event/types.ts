export enum CurrentEventTypes {
    SetupDate = '@@currentevent/setupdate',
    SetEventId = '@@currentevent/seteventid',
    SetDate = '@@currentevent/setdate',
}

export interface CurrentEventState {
    eventId: string;
    dateId: string;
    dateName: string;
}

