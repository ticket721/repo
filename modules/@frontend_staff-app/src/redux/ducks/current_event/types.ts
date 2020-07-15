export enum CurrentEventTypes {
    SetEventId = '@@currentevent/seteventid',
    SetDateId = '@@currentevent/setdateid',
}

export interface CurrentEventState {
    eventId: string;
    dateId: string;
}

