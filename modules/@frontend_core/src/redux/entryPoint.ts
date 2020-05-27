import { Store } from 'redux';
import { IStart, Start } from './ducks/setup';

export const entryPoint = (store: Store): IStart => store.dispatch(Start());
