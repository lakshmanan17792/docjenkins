import parser from '../Parser';

const LOAD = 'intelligent-talent-acquisition/users/LOAD';
const LOAD_SUCCESS = 'intelligent-talent-acquisition/users/LOAD_SUCCESS';
const LOAD_FAIL = 'intelligent-talent-acquisition/users/LOAD_FAIL';

const DEACTIVATE = 'intelligent-talent-acquisition/users/DEACTIVATE';
const DEACTIVATE_SUCCESS = 'intelligent-talent-acquisition/users/DEACTIVATE_SUCCESS';
const DEACTIVATE_FAIL = 'intelligent-talent-acquisition/users/DEACTIVATE_FAIL';

const UPDATE_DEACTIVATION = 'intelligent-talent-acquisition/users/UPDATE_DEACTIVATION';

const ACTIVATE = 'intelligent-talent-acquisition/users/ACTIVATE';
const ACTIVATE_SUCCESS = 'intelligent-talent-acquisition/users/ACTIVATE_SUCCESS';
const ACTIVATE_FAIL = 'intelligent-talent-acquisition/users/ACTIVATE_FAIL';
const RESEND = 'intelligent-talent-acquisition/users/RESEND';
const RESEND_SUCCESS = 'intelligent-talent-acquisition/users/RESEND_SUCCESS';
const RESEND_FAIL = 'intelligent-talent-acquisition/users/RESEND_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result.users,
        totalCount: action.result.count
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case DEACTIVATE:
      return {
        ...state,
        loading: true
      };
    case DEACTIVATE_SUCCESS:
      return {
        ...state,
        deactivationResponse: action.result,
        loading: false,
        loaded: true,
      };
    case DEACTIVATE_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case UPDATE_DEACTIVATION:
      return {
        ...state,
        deactivationResponse: parser.parseUsers(action.id, action.data)
      };
    case ACTIVATE:
      return {
        ...state,
        loading: true
      };
    case ACTIVATE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case ACTIVATE_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case RESEND:
      return {
        ...state,
        loading: true
      };
    case RESEND_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case RESEND_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };

    default:
      return state;
  }
}

/*
* Actions
* * * * */

export function isLoaded(globalState) {
  return globalState.users && globalState.users.loaded;
}

export function load(query) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }) => client.post('/users/list', { data: query })
  };
}

export function deactivateUser(id, deactivationStatus) {
  return {
    types: [DEACTIVATE, DEACTIVATE_SUCCESS, DEACTIVATE_FAIL],
    promise: ({ client }) => client.get(`/users/deactivate/${id}/${deactivationStatus}`)
  };
}

export function updateDeactivation(id, data) {
  return {
    type: UPDATE_DEACTIVATION,
    id,
    data
  };
}

export function activateUser(id) {
  return {
    types: [ACTIVATE, ACTIVATE_SUCCESS, ACTIVATE_FAIL],
    promise: ({ client }) => client.get(`/users/activate/${id}`)
  };
}

export function resendInvite(data) {
  return {
    types: [RESEND, RESEND_SUCCESS, RESEND_FAIL],
    promise: ({ client }) => client.post('/users/reInvite', { data })
  };
}
