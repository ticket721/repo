import { Reducer } from 'redux';
import { SetupActionTypes } from './setup.actions';
import { SetupState } from '../states/setup.state';

// @ts-ignore
export const SetupReducer: Reducer<SetupState, SetupActionTypes> =
    (state: SetupState, action: SetupActionTypes): SetupState => {

        switch (action.type) {
            default:
                return state;
        }
    };
