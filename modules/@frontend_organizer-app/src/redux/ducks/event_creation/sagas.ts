
import { SagaIterator }                                    from '@redux-saga/types';
import { put, select, takeEvery, debounce }    from 'redux-saga/effects';
import { OrganizerState }                                                 from '../index';
import { EventCreationActionTypes, EventCreationState }                   from './types';
import {
    IInitEventAcset,
    IUpdateAction,
    SetAcsetStatus,
    SetActionData,
    SetActionsStatuses,
    SetCurrentActionIdx,
    SetEventAcset,
    SetSync,
} from './actions';
import { CacheActionTypes, IUpdateItemData, RegisterEntity } from '@frontend/core/lib/redux/ducks/cache';
import { EventCreationCore, EventCreationActions }           from '../../../core/event_creation/EventCreationCore';
import { AppState }                                          from '@frontend/core/lib/redux';
import { AuthState }                                         from '@frontend/core/lib/redux/ducks/auth';
import { PushNotification }                                  from '@frontend/core/lib/redux/ducks/notifications';
import { CacheCore }                                         from '@frontend/core/lib/cores/cache/CacheCore';
import { v4 as uuid }                                        from 'uuid';
import { eventCreationInitialState }  from './reducers';
import {
    ActionEntity,
    ActionStatus
} from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';

const getAuthState = (state: AppState): AuthState => state.auth;
const getEventCreationState = (state: OrganizerState): EventCreationState => state.eventCreation;

function* initEventAcset(action: IInitEventAcset): IterableIterator<any> {
    const authState: AuthState = yield select(getAuthState);

    let acsetId = yield EventCreationCore.getAcsetId(authState.token.value);

    if (!acsetId) {
        acsetId = yield EventCreationCore.createEventAcset(authState.token.value);
    }

    yield put(RegisterEntity(
        'actions.search',
        [
            authState.token.value,
            {
                id: {
                    $eq: acsetId
                }
            }
        ],
        uuid() + '@event/creation',
        4
    ));

    yield put(SetEventAcset({
        ...eventCreationInitialState,
        acsetId: acsetId as string,
    }));

}

function* updateAction(action: IUpdateAction): IterableIterator<any> {
    const authState: AuthState = yield select(getAuthState);
    const eventCreationState: EventCreationState = yield select(getEventCreationState);
    try {
        yield EventCreationCore.updateEventAcset(
            authState.token.value,
            eventCreationState.acsetId,
            eventCreationState.currentAction,
            eventCreationState[eventCreationState.currentAction],
        );

        yield put(SetSync(true));
    } catch (e) {
        yield put(PushNotification(e.message, 'error'));
    }
}

function* synchronizedActions(action: IUpdateItemData): IterableIterator<any> {
    const eventCreationState: EventCreationState = yield select(getEventCreationState);

    if (eventCreationState.sync) {
        const authState: AuthState = yield select(getAuthState);

        const acsetCacheKey = CacheCore.key(
            'actions.search',
            [
                authState.token.value,
                {
                    id: {
                        $eq: eventCreationState.acsetId
                    }
                }
            ]
        );

        if (action.key === acsetCacheKey) {
            const actionsValues = Object.values(EventCreationActions);
            for (const [idx, actionType] of actionsValues.entries()) {
                if (actionType !== eventCreationState.currentAction) {
                    const actionData = action.data.actionsets[0].actions[idx].data;
                    if (actionData) {
                        yield put(SetActionData(actionType, JSON.parse(actionData)));
                    } else {
                        yield put(SetActionData(actionType, eventCreationInitialState[actionType]));
                    }
                }
            }

            const actionsStatus: Array<ActionStatus> = action.data.actionsets[0].actions
                .map((actionEntity: ActionEntity) => actionEntity.status);

            yield put(SetActionsStatuses(actionsStatus));
            yield put(SetAcsetStatus(action.data.actionsets[0].current_status));
            yield put(SetCurrentActionIdx(action.data.actionsets[0].current_action));
        }
    }
}

export function* eventCreationSaga(): SagaIterator {
    yield takeEvery(EventCreationActionTypes.InitEventAcset, initEventAcset);
    yield debounce(1500, EventCreationActionTypes.UpdateAction, updateAction);
    yield takeEvery(CacheActionTypes.UpdateItemData, synchronizedActions);
}
