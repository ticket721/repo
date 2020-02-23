import { FooAction, FooActions } from '../actions/foo';
import { ForkEffect, takeEvery } from 'redux-saga/effects';

function* FooSaga(action: FooAction): IterableIterator<any> {
    // Saga
}

export function* FooSagas(): IterableIterator<ForkEffect> {
    yield takeEvery(FooActions.Foo, FooSaga);
}