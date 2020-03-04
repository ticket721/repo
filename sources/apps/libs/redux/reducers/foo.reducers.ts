import { Reducer }                             from 'redux';
import { FooState }                                        from '../states/foo.state';
import { FooActions, FooActionTypes, ISetFoo, IToggleFoo } from '../actions/foo.actions';
import { InitialAppState }                                 from '../states/app.state';

const SetFooReducer: Reducer<FooState, ISetFoo> =
    (state: FooState, action: ISetFoo): FooState => ({
        ...state,
        foo: action.foo
    });

const ToggleFooReducer: Reducer<FooState, IToggleFoo> =
    (state: FooState, action: IToggleFoo): FooState => ({
        ...state,
        foo: !state.foo
    });

export const FooReducer: Reducer<FooState, FooActionTypes> =
    (state: FooState = InitialAppState, action: FooActionTypes): FooState => {

        switch (action.type) {
            case FooActions.SetFooAction:
                return SetFooReducer(state, action as ISetFoo);
            case FooActions.ToggleFooAction:
                return ToggleFooReducer(state, action as IToggleFoo);
            default:
                return state;
        }
    };
