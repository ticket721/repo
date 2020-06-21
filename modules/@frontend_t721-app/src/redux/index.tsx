import { AppState }      from '@frontend/core/lib/redux';
import { LocationState } from './ducks/location';
import { SearchState }   from './ducks/search';

export *            from './ducks/location';

export interface T721AppState extends AppState {
    location: LocationState;
    search: SearchState;
}
