const LOAD_APP_SETTINGS = 'appSettings/LOAD_APP_SETTINGS';
const LOAD_APP_SETTINGS_SUCCESS = 'appSettings/LOAD_APP_SETTINGS_SUCCESS';
const LOAD_APP_SETTINGS_FAIL = 'appSettings/LOAD_APP_SETTINGS_FAIL';
const ADD_APP_SETTINGS = 'appSettings/ADD_APP_SETTINGS';
const ADD_APP_SETTINGS_SUCCESS = 'appSettings/ADD_APP_SETTINGS_SUCCESS';
const ADD_APP_SETTINGS_FAIL = 'appSettings/ADD_APP_SETTINGS_FAIL';
const UPDATE_APP_SETTINGS = 'appSettings/UPDATE_APP_SETTINGS';
const UPDATE_APP_SETTINGS_SUCCESS = 'appSettings/UPDATE_APP_SETTINGS_SUCCESS';
const UPDATE_APP_SETTINGS_FAIL = 'appSettings/UPDATE_APP_SETTINGS_FAIL';
const UPLOAD_PROFILE_LOGO = 'appSettings/UPLOAD_PROFILE_LOGO';
const UPLOAD_PROFILE_LOGO_SUCCESS = 'appSettings/UPLOAD_PROFILE_LOGO_SUCCESS';
const UPLOAD_PROFILE_LOGO_FAIL = 'appSettings/UPLOAD_PROFILE_LOGO_FAIL';

const initialState = {
  loading: null,
  loaded: null,
  updating: null,
  list: [],
  uploading: true
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_APP_SETTINGS:
      return {
        ...state,
        loading: true
      };
    case LOAD_APP_SETTINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        updating: false,
        list: action.result
      };
    case LOAD_APP_SETTINGS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        updating: false,
        error: action.error
      };
    case ADD_APP_SETTINGS:
      return {
        ...state,
        adding: true
      };
    case ADD_APP_SETTINGS_SUCCESS:
      return {
        ...state,
        adding: false
      };
    case ADD_APP_SETTINGS_FAIL:
      return {
        ...state,
        adding: false,
        error: action.error
      };
    case UPDATE_APP_SETTINGS:
      return {
        ...state,
        updating: true
      };
    case UPDATE_APP_SETTINGS_SUCCESS:
      return {
        ...state
      };
    case UPDATE_APP_SETTINGS_FAIL:
      return {
        ...state,
        updating: false,
        error: action.error
      };
    case UPLOAD_PROFILE_LOGO:
      return {
        ...state,
        uploading: false,
        uploaded: false
      };
    case UPLOAD_PROFILE_LOGO_SUCCESS:
      return {
        ...state,
        uploading: false,
        uploaded: false
      };
    case UPLOAD_PROFILE_LOGO_FAIL:
      return {
        ...state,
        uploading: false,
        uploaded: true,
        error: action.error
      };
    default:
      return state;
  }
}

export function loadAppSettings() {
  return {
    types: [LOAD_APP_SETTINGS, LOAD_APP_SETTINGS_SUCCESS, LOAD_APP_SETTINGS_FAIL],
    promise: ({ client }) => client.get('/settings')
  };
}

export function addAppSettings(data) {
  return {
    types: [ADD_APP_SETTINGS, ADD_APP_SETTINGS_SUCCESS, ADD_APP_SETTINGS_FAIL],
    promise: ({ client }) => client.post('/settings', { data })
  };
}

export function updateAppSettings(data) {
  return {
    types: [UPDATE_APP_SETTINGS, UPDATE_APP_SETTINGS_SUCCESS, UPDATE_APP_SETTINGS_FAIL],
    promise: ({ client }) => client.put('/settings/update', { data })
  };
}

export function uploadProfileLogo({ file }, data) {
  return {
    types: [UPLOAD_PROFILE_LOGO, UPLOAD_PROFILE_LOGO_SUCCESS, UPLOAD_PROFILE_LOGO_FAIL],
    promise: ({ client }) => client.post(`/settings/upload/${JSON.stringify(data)}`,
      { data: file, unsetContentType: 1 })
  };
}
