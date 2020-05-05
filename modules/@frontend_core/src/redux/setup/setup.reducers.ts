import { Reducer }                                         from 'redux';
import { InitialPropertiesState, PropertiesState }         from '../states/properties.state';
import { ISetDeviceInfos, SetupActions, SetupActionTypes } from './setup.actions';

const SetDeviceInfosReducer: Reducer<PropertiesState, ISetDeviceInfos> =
    (state: PropertiesState, action: ISetDeviceInfos): PropertiesState => ({
        ...state,
        device: action.device,
        browser: action.browser
    });

export const SetupReducer: Reducer<PropertiesState, SetupActionTypes> =
    (state: PropertiesState = InitialPropertiesState, action: SetupActionTypes): PropertiesState => {

        switch (action.type) {
            case SetupActions.SetDeviceInfos:
                return SetDeviceInfosReducer(state, action as ISetDeviceInfos);
            default:
                return state;
        }

    };
