import { take, put, cancel, takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';

import { newEntity, dueDateAssigned } from 'containers/App/actions';
import { SAVE } from './constants';

export function* save({ data }) {
  yield put(newEntity({
    path: 'progress_reports',
    entity: data,
    redirect: '/reports',
  }));
  if (data.attributes.due_date_id) {
    yield put(dueDateAssigned(data.attributes.due_date_id));
  }
}

export function* defaultSaga() {
  const saveWatcher = yield takeLatest(SAVE, save);

  yield take(LOCATION_CHANGE);

  yield cancel(saveWatcher);
}

// All sagas to be loaded
export default [
  defaultSaga,
];
