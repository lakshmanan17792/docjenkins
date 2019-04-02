const LOAD_OUTLOOK_CONNECT_URL = 'emailConfig/LOAD_OUTLOOK_CONNECT_URL';
const LOAD_OUTLOOK_CONNECT_URL_SUCCESS = 'emailConfig/LOAD_OUTLOOK_CONNECT_URL_SUCCESS';
const LOAD_OUTLOOK_CONNECT_URL_FAIL = 'emailConfig/LOAD_OUTLOOK_CONNECT_URL_FAIL';
const SAVE_ACCESS_TOKEN = 'emailConfig/SAVE_ACCESS_TOKEN';
const SAVE_ACCESS_TOKEN_SUCCESS = 'emailConfig/SAVE_ACCESS_TOKEN_SUCCESS';
const SAVE_ACCESS_TOKEN_FAIL = 'emailConfig/SAVE_ACCESS_TOKEN_FAIL';
const DISCONNECT_OUTLOOK = 'emailConfig/DISCONNECT_OUTLOOK';
const DISCONNECT_OUTLOOK_SUCCESS = 'emailConfig/DISCONNECT_OUTLOOK_SUCCESS';
const DISCONNECT_OUTLOOK_FAIL = 'emailConfig/DISCONNECT_OUTLOOK_FAIL';

const initialState = {
  loading: false,
  loaded: true,
  isEmailConfigured: false,
  emailConfigType: 'OUTLOOK',
  emailConfig: null,
  outlookConnectUrl: null
};

const getConfigType = config => {
  if (config.isEmailConfigured) {
    if (config.emailConfig.SMTP_host === null) {
      return 'OUTLOOK';
    }
    return 'SMTP';
  }
  return 'ALL';
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_OUTLOOK_CONNECT_URL:
    case SAVE_ACCESS_TOKEN:
    case DISCONNECT_OUTLOOK:
      return {
        ...state,
        loading: true
      };
    case DISCONNECT_OUTLOOK_SUCCESS:
    case LOAD_OUTLOOK_CONNECT_URL_SUCCESS:
      return {
        ...state,
        loading: true,
        isEmailConfigured: action.result.isEmailConfigured,
        outlookConnectUrl: !action.result.isEmailConfigured ? action.result.loginUrl : null,
        emailConfigType: getConfigType(action.result),
        emailConfig: action.result.emailConfig
      };
    case SAVE_ACCESS_TOKEN_SUCCESS:
    case SAVE_ACCESS_TOKEN_FAIL:
    case DISCONNECT_OUTLOOK_FAIL:
    case LOAD_OUTLOOK_CONNECT_URL_FAIL:
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
}

export function loadOutlookConnectUrl() {
  return {
    types: [
      LOAD_OUTLOOK_CONNECT_URL, LOAD_OUTLOOK_CONNECT_URL_SUCCESS, LOAD_OUTLOOK_CONNECT_URL_FAIL
    ],
    promise: ({ client }) => client.get('/EmailConfigurations/outlook')
  };
}

export function saveAccessToken(code) {
  return {
    types: [
      SAVE_ACCESS_TOKEN, SAVE_ACCESS_TOKEN_SUCCESS, SAVE_ACCESS_TOKEN_FAIL
    ],
    promise: ({ client }) => client.get(`/EmailConfigurations/accessCode/${code}`)
  };
}

export function disconnectOutlook(id) {
  return {
    types: [
      DISCONNECT_OUTLOOK, DISCONNECT_OUTLOOK_SUCCESS, DISCONNECT_OUTLOOK_FAIL
    ],
    promise: ({ client }) => client.get(`/EmailConfigurations/disConnectOutlook/${id}`)
  };
}
