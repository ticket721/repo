import { combineReducers } from 'redux';
import { FooReducer }   from './foo';
import { AppState }        from '../state';

export default combineReducers<AppState>({
    fooState: FooReducer,
});