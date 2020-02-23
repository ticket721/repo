export interface FooState {
    foo: string;
}

export interface AppState {
    fooState: FooState
}

export const initialState: AppState = {
    fooState: {
        foo: 'foo'
    }
};
