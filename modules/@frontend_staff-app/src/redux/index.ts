import { AppState }          from '@frontend/core/lib/redux';
import { CurrentEventState } from './ducks/current_event';

export interface StaffAppState extends AppState {
    currentEvent: CurrentEventState;
}
