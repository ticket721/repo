import { LocationState }     from './ducks/location';
import { SearchState }       from './ducks/search';
import { AppState }          from '@frontend/core/lib/redux';
import { DeviceWalletState } from './ducks/device_wallet';

export *            from './ducks/location';

export interface T721AppState extends AppState {
    location: LocationState;
    search: SearchState;
    deviceWallet: DeviceWalletState;
}
