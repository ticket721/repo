export enum CurrentEventTypes {
    SetupDate = '@@currentevent/setupdate',
    SetEventId = '@@currentevent/seteventid',
    SetDate = '@@currentevent/setdate',
    SetFilteredCategories = '@@currentevent/setfilteredcategories',
    PushCategory = '@@currentevent/pushcategory',
    RemoveCategory = '@@currentevent/removecategory',
}

export interface CategoryItem {
    id: string;
    name: string;
    global: boolean;
}

export interface CurrentEventState {
    eventId: string;
    dateId: string;
    dateName: string;
    filteredCategories: CategoryItem[];
}

