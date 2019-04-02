import { loginAndGetUser, sessionRemove, getCurrentUser, userLogout } from './authResolver';
import Constants from '../../../helpers/Constants';

const LOAD = 'auth/LOAD';
const LOAD_SUCCESS = 'auth/LOAD_SUCCESS';
const LOAD_FAIL = 'auth/LOAD_FAIL';
const LOGIN = 'auth/LOGIN';
const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
const LOGIN_FAIL = 'auth/LOGIN_FAIL';
const REGISTER = 'auth/REGISTER';
const REGISTER_SUCCESS = 'auth/REGISTER_SUCCESS';
const REGISTER_FAIL = 'auth/REGISTER_FAIL';
const LOGOUT = 'auth/LOGOUT';
const LOGOUT_SUCCESS = 'auth/LOGOUT_SUCCESS';
const LOGOUT_FAIL = 'auth/LOGOUT_FAIL';

const SESSION_DELETE = 'auth/SESSION_DELETE';
const SESSION_DELETE_SUCCESS = 'auth/SESSION_DELETE_SUCCESS';
const SESSION_DELETE_FAIL = 'auth/SESSION_DELETE_FAIL';

const UPDATE_USER = 'auth/UPDATE_USER';
const UPDATE_USER_SUCCESS = 'auth/UPDATE_USER_SUCCESS';
const UPDATE_USER_FAIL = 'auth/UPDATE_USER_SUCCESS';

const CONFIGURE_EMAIL = 'auth/CONFIGURE_EMAIL';
const SET_INITIAL_INVALID_COUNT = 'auth/SET_INITIAL_INVALID_COUNT';

const UPDATE_LOCALIZATION = 'auth/UPDATE_LOCALIZATION';
const UPDATE_LOCALIZATION_SUCCESS = 'auth/UPDATE_LOCALIZATION_SUCCESS';
const UPDATE_LOCALIZATION_FAIL = 'auth/UPDATE_LOCALIZATION_FAIL';

const FETCH_LANGUAGE = 'auth/FETCH_LANGUAGE';
const FETCH_LANGUAGE_SUCCESS = 'auth/FETCH_LANGUAGE_SUCCESS';
const FETCH_LANGUAGE_FAIL = 'auth/UPDATE_LOCALIZATION_FAIL';

const CHECK_CAPTCHA = 'auth/CHECK_CAPTCHA';
const CHECK_CAPTCHA_SUCCESS = 'auth/CHECK_CAPTCHA_SUCCESS';
const CHECK_CAPTCHA_FAIL = 'auth/CHECK_CAPTCHA_FAIL';

const SET_SESSION_TIMEOUT = 'auth/SET_SESSION_TIMEOUT';

const initialState = {
  loaded: false,
  inValidLoginCount: 0,
  isCaptchaVerified: false,
};

export const getExpiryTime = () => {
  const now = new Date();
  let time = now.getTime();
  time += 60 * 60 * 1000;
  return time;
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
        user: action.result.id ? action.result : null,
        language: action.result.language,
        language_code: action.result.language_code
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOGIN:
      return {
        ...state,
        loggingIn: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        loginError: null,
        inValidLoginCount: 0,
        isCaptchaVerified: false,
        user: action.result.id ? action.result : null,
        language: action.result.language,
        language_code: action.result.language_code
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        isCaptchaVerified: false,
        inValidLoginCount: action.error.error.statusCode === 401 ?
          state.inValidLoginCount + 1 : state.inValidLoginCount,
        loginError: action.error
      };
    case SESSION_DELETE:
      return {
        ...state,
        sessionDelete: true
      };
    case SESSION_DELETE_SUCCESS:
      return {
        ...state,
        sessionDelete: false,
        sessionError: null,
        sessionData: action.result,
      };
    case SESSION_DELETE_FAIL:
      return {
        ...state,
        sessionDelete: false,
        sessionError: action.error
      };
    case REGISTER:
      return {
        ...state,
        registeringIn: true
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        registeringIn: false
      };
    case REGISTER_FAIL:
      return {
        ...state,
        registeringIn: false,
        registerError: action.error
      };
    case LOGOUT:
      return {
        ...state,
        loggingOut: true
      };
    case LOGOUT_SUCCESS:
      document.cookie = 'authorization=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
      return {
        ...state,
        loggingOut: false,
        user: null,
        loginError: null,
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.error,
        loginError: null,
      };
    case CONFIGURE_EMAIL:
      return {
        ...state,
        user: { ...state.user, isMailConfigured: action.isMailConfigured }
      };
    case UPDATE_LOCALIZATION:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null
      };
    case UPDATE_LOCALIZATION_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: null,
        language: action.result.language,
        language_code: action.result.language_code,
      };
    case UPDATE_LOCALIZATION_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error.error
      };
    case FETCH_LANGUAGE:
      return {
        ...state,
        languageLoading: true
      };
    case FETCH_LANGUAGE_SUCCESS:
      return {
        ...state,
        languageLoading: false,
        languageLoaded: true,
        language: action.result.language,
        language_code: action.result.language_code
      };
    case FETCH_LANGUAGE_FAIL:
      return {
        ...state,
        languageLoading: false,
        languageLoaded: false,
        error: action.error
      };
    case CHECK_CAPTCHA:
      return {
        ...state,
      };
    case CHECK_CAPTCHA_SUCCESS:
      return {
        ...state,
        isCaptchaVerified: true
      };
    case CHECK_CAPTCHA_FAIL:
      return {
        ...state,
        isCaptchaVerified: false,
        error: action.error
      };
    case SET_SESSION_TIMEOUT:
      return {
        ...state,
        timeOut: getExpiryTime()
      };
    case SET_INITIAL_INVALID_COUNT:
      return {
        ...state,
        inValidLoginCount: action.status ? Constants.MAXIMUM_INVALID_LOGIN_COUNT - 1 : 0
      };
    default:
      return state;
  }
}

/*
* Actions
* * * * */

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }) => getCurrentUser(client)
  };
}

export function register(data) {
  return {
    types: [REGISTER, REGISTER_SUCCESS, REGISTER_FAIL],
    promise: ({ client }) => client.post('/users', {
      data
    })
  };
}

export function login(strategy, data) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: ({ client }) => loginAndGetUser(client, data)
  };
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: ({ client }) => userLogout(client)
  };
}

export function updateUser(user, id) {
  return {
    types: [UPDATE_USER, UPDATE_USER_SUCCESS, UPDATE_USER_FAIL],
    promise: ({ client }) => client.patch(`/users/${id}`, { data: user })
  };
}

export function updateUserEmailConfig(isMailConfigured) {
  return {
    type: CONFIGURE_EMAIL,
    isMailConfigured
  };
}

export function updateLocalization(data) {
  return {
    types: [
      UPDATE_LOCALIZATION, UPDATE_LOCALIZATION_SUCCESS, UPDATE_LOCALIZATION_FAIL
    ],
    promise: ({ client }) => client.post('Settings/updateLocalization', { data })
  };
}

export function updateUserLocalization(data) {
  return {
    types: [
      UPDATE_LOCALIZATION, UPDATE_LOCALIZATION_SUCCESS, UPDATE_LOCALIZATION_FAIL
    ],
    promise: ({ client }) => client.put(`users/${data.userId}/updateLocale/${data.languageCode}`)
  };
}

export function fetchLanguage() {
  return {
    types: [FETCH_LANGUAGE, FETCH_LANGUAGE_SUCCESS, FETCH_LANGUAGE_FAIL],
    promise: ({ client }) => client.get('Settings/localization')
  };
}

export function verifyCaptcha(data) {
  return {
    types: [CHECK_CAPTCHA, CHECK_CAPTCHA_SUCCESS, CHECK_CAPTCHA_FAIL],
    promise: ({ client }) => client.post('/users/captchaVerification', { data })
  };
}

export function setInitialInvalidCount(status) {
  return { type: SET_INITIAL_INVALID_COUNT, status };
}

export function deleteSession(data) {
  return {
    types: [
      SESSION_DELETE, SESSION_DELETE_SUCCESS, SESSION_DELETE_FAIL
    ],
    promise: ({ client }) => sessionRemove(client, data)
    // promise: ({ client }) => client.post('/users/sessiondelete', { data })
  };
}
