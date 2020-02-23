import { Saga }                             from '@redux-saga/types';
import { all, AllEffect, fork, ForkEffect } from 'redux-saga/effects';

import { FooSagas }             from './foo';

export default (): Saga => {

    const combination: Saga[] = [
        FooSagas,
    ];

    const merged_forked_sagas: ForkEffect[] = combination.map((saga: Saga): ForkEffect => fork(saga));

    return function* root(): IterableIterator<AllEffect<any>> {
        yield all(merged_forked_sagas);
    };

};