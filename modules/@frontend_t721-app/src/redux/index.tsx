import { LocationState }     from './ducks/location';
import { SearchState }       from './ducks/search';
import { AppState }          from '@frontend/core/lib/redux';
import { CartState }         from './ducks/cart';
import { DeviceWalletState } from './ducks/device_wallet';

export *            from './ducks/location';

export interface T721AppState extends AppState {
    location: LocationState;
    search: SearchState;
    cart: CartState;
    deviceWallet: DeviceWalletState;
}
