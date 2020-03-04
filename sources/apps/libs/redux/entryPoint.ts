import { Store }         from 'redux';
import { IStart, Start } from './setup/setup.actions';

export const entryPoint = (store: Store): IStart => store.dispatch(Start());
