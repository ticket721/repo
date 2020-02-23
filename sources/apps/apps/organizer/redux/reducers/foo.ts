import { Reducer }                               from 'redux';
import { FooState, initialState }      from '../state';
import { FooAction, FooActions, FooActionsType } from '../actions/foo';

const FooExReducer = (state: FooState, action: FooAction): FooState => ({
    ...state,
    foo: action.foo
});

export const FooReducer: Reducer<FooState, any> = (state: FooState = initialState.fooState, action: FooActionsType): FooState => {
    switch (action.type) {
        case FooActions.Foo:
            return FooExReducer(state, action as FooAction);
        default:
            return state;
    }
};