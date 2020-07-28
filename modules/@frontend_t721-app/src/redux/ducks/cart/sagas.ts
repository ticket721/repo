import { SagaIterator }               from '@redux-saga/types';
import { SetupActionTypes }           from '@frontend/core/lib/redux/ducks/setup';
import { takeEvery, put, select }     from 'redux-saga/effects';
import { CartActionTypes, CartState } from './types';
import { CompleteCartRestore }        from './actions';

function* saveCart(): SagaIterator {

    const currentCartState = (yield select()).cart;

    localStorage.setItem('cart', JSON.stringify(currentCartState));

}

function* loadCart(): SagaIterator {

    const rawCartState = localStorage.getItem('cart');

    if (rawCartState) {
        const cartState: CartState = JSON.parse(rawCartState);

        yield put(CompleteCartRestore(cartState));
    }

}

export function* cartSaga(): SagaIterator {
    yield takeEvery(SetupActionTypes.Start, loadCart);

    yield takeEvery(CartActionTypes.CompleteCartRestore, saveCart);
    yield takeEvery(CartActionTypes.AddTicket, saveCart);
    yield takeEvery(CartActionTypes.SetTickets, saveCart);
}
