import { Action } from 'redux';

export const FooActions = {
    SetFooAction: '@foo/setfoo',
    ToggleFooAction: '@foo/togglefoo'
};

export interface ISetFoo extends Action<string> {
    foo: boolean;
}

export const SetFoo = (foo: boolean): ISetFoo => ({
    type: FooActions.SetFooAction,
    foo
});

export interface IToggleFoo extends Action<string> {}

export const ToggleFoo = (): IToggleFoo => ({
    type: FooActions.ToggleFooAction
});

export type FooActionTypes = ISetFoo | IToggleFoo;
