import { Action } from 'redux';

export const FooActions = {
    Foo: '@@organizer/foo/fooaction',
};

export interface FooAction extends Action<string> {
    foo: string
}

export const Foo = (foo: string): FooAction => ({
    type: FooActions.Foo,
    foo
});

export type FooActionsType =
    FooAction;