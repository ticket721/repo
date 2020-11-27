import { useStateWithLocalStorage } from '@frontend/core/lib/utils/useStateWithLocalStorage';
import { useCallback }              from 'react';

type SavedEvents = string[];
type AddSavedEvent = (id: string) => void;
type RemoveSavedEvent = (id: string) => void;
type IsSavedEvent = (id: string) => boolean;

export const useSavedEvents = (): [SavedEvents[], AddSavedEvent, RemoveSavedEvent, IsSavedEvent] => {
    const [savedEvents, setSavedEvents] = useStateWithLocalStorage('saved_events', []);

    const addSavedEvent: AddSavedEvent = useCallback((id: string): void => {
        if (savedEvents.indexOf(id) === -1) {
            setSavedEvents([
                ...savedEvents,
                id
            ]);
        }
    }, [savedEvents, setSavedEvents]);

    const removeSavedEvent: RemoveSavedEvent = useCallback((id: string): void => {
        if (savedEvents.indexOf(id) !== -1) {
            setSavedEvents([
                ...savedEvents.filter((_id) => _id !== id)
            ]);
        }
    }, [savedEvents, setSavedEvents]);

    const isSavedEvent: IsSavedEvent = useCallback((id: string): boolean => savedEvents.indexOf(id) !== -1, [savedEvents]);

    return [savedEvents, addSavedEvent, removeSavedEvent, isSavedEvent];
}
