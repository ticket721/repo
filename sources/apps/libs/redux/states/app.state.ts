import { FooState }   from './foo.state';
import { State }      from 'ethvtx/lib/state';
import { SetupState } from './setup.state';

export type AppState = FooState & SetupState & State;

// @ts-ignore
export const InitialAppState: AppState = {
    foo: false
}
