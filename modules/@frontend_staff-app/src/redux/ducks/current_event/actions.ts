import { Action }                      from 'redux';
import { CategoryItem, CurrentEventTypes } from './types';

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

export type CurrentEventAction =
    ISetupDate |
    ISetEventId |
    ISetDate |
    ISetFilteredCategories |
    IPushCategory |
    IRemoveCategory;
