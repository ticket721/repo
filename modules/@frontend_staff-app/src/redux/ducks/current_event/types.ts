export enum CurrentEventTypes {
    SetupDate = '@@currentevent/setupdate',
    SetEventId = '@@currentevent/seteventid',
    SetDate = '@@currentevent/setdate',
    SetFilteredCategories = '@@currentevent/setfilteredcategories',
    PushCategory = '@@currentevent/pushcategory',
    RemoveCategory = '@@currentevent/removecategory',
    SetCheckedGuests = '@@currentevent/setcheckedguests',
    PushGuest = '@@currentevent/pushguest',
    RemoveGuest = '@@currentevent/removeguest',
}

export interface CategoryItem {
    id: string;
    name: string;
    global: boolean;
}

export interface Guest {
    ticketId: string;
    email: string;
    name: string;
    category: string;
    checkedTimestamp: number;
}

export interface CurrentEventState {
    eventId: string;
    dateId: string;
    dateName: string;
    filteredCategories: CategoryItem[];
    checkedGuests: Guest[];
}

