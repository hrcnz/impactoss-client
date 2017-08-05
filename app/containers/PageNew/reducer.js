/*
 *
 * PageNew reducer
 *
 */

import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { combineForms } from 'react-redux-form/immutable';

import { entityFormReducer } from 'containers/App/entityFormReducer';
import { UPDATE_ENTITY_FORM } from 'containers/App/constants';

const formInitial = fromJS({
  attributes: {
    title: '',
    content: '',
    menu_title: '',
    draft: true,
  },
});

function formReducer(state = formInitial, action) {
  switch (action.type) {
    case UPDATE_ENTITY_FORM:
      return action.data;
    default:
      return state;
  }
}

export default combineReducers({
  page: entityFormReducer,
  form: combineForms({
    data: formReducer,
  }, 'pageNew.form'),
});
