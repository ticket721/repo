import { Action }                                 from 'redux';
import { CategoryItem, CurrentEventTypes, Guest } from './types';

export interface ISetupDate extends Action<string> {
    type: CurrentEventTypes.SetupDate;
}

export const SetupDate = (): ISetupDate => ({
    type: CurrentEventTypes.SetupDate,
});

export interface ISetEventId extends Action<string> {
    type: CurrentEventTypes.SetEventId;
    eventId: string;
}

export const SetEventId = (eventId: string): ISetEventId => ({
    type: CurrentEventTypes.SetEventId,
    eventId,
});

export interface ISetDate extends Action<string> {
    type: CurrentEventTypes.SetDate;
    dateId: string;
    dateName: string;
}

export const SetDate = (dateId: string, dateName: string): ISetDate => ({
    type: CurrentEventTypes.SetDate,
    dateId,
    dateName,
});

export interface ISetFilteredCategories extends Action<string> {
    type: CurrentEventTypes.SetFilteredCategories;
    categories: CategoryItem[];
}

export const SetFilteredCategories = (categories: CategoryItem[]): ISetFilteredCategories => ({
    type: CurrentEventTypes.SetFilteredCategories,
    categories,
});

export interface IPushCategory extends Action<string> {
    type: CurrentEventTypes.PushCategory;
    category: CategoryItem;
}

export const PushCategory = (category: CategoryItem): IPushCategory => ({
    type: CurrentEventTypes.PushCategory,
    category,
});

export interface IRemoveCategory extends Action<string> {
    type: CurrentEventTypes.RemoveCategory;
    categoryId: string;
}

export const RemoveCategory = (categoryId: string): IRemoveCategory => ({
    type: CurrentEventTypes.RemoveCategory,
    categoryId,
});

export interface ISetCheckedGuests extends Action<string> {
    type: CurrentEventTypes.SetCheckedGuests;
    guests: Guest[];
}

export const SetCheckedGuests = (guests: Guest[]): ISetCheckedGuests => ({
    type: CurrentEventTypes.SetCheckedGuests,
    guests,
});

export interface IPushGuest extends Action<string> {
    type: CurrentEventTypes.PushGuest;
    guest: Guest;
}

export const PushGuest = (guest: Guest): IPushGuest => ({
    type: CurrentEventTypes.PushGuest,
    guest,
});

export interface IRemoveGuest extends Action<string> {
    type: CurrentEventTypes.RemoveGuest;
    ticketId: string;
}

export const RemoveGuest = (ticketId: string): IRemoveGuest => ({
    type: CurrentEventTypes.RemoveGuest,
    ticketId,
});

export type CurrentEventAction =
    ISetupDate |
    ISetEventId |
    ISetDate |
    ISetFilteredCategories |
    IPushCategory |
    IRemoveCategory |
    ISetCheckedGuests |
    IPushGuest |
    IRemoveGuest;
