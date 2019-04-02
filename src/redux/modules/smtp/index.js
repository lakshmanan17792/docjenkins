const LOAD_EMAIL_CONFIG = 'smtp/LOAD_EMAIL_CONFIG';
const LOAD_EMAIL_CONFIG_SUCCESS = 'smtp/LOAD_EMAIL_CONFIG_SUCCESS';
const LOAD_EMAIL_CONFIG_FAIL = 'smtp/LOAD_EMAIL_CONFIG_FAIL';
const SAVE_EMAIL_CONFIG = 'smtp/SAVE_EMAIL_CONFIG';
const SAVE_EMAIL_CONFIG_SUCCESS = 'smtp/SAVE_EMAIL_CONFIG_SUCCESS';
const SAVE_EMAIL_CONFIG_FAIL = 'smtp/SAVE_EMAIL_CONFIG_FAIL';
const UPDATE_EMAIL_CONFIG = 'smtp/UPDATE_EMAIL_CONFIG';
const UPDATE_EMAIL_CONFIG_SUCCESS = 'smtp/UPDATE_EMAIL_CONFIG_SUCCESS';
const UPDATE_EMAIL_CONFIG_FAIL = 'smtp/UPDATE_EMAIL_CONFIG_FAIL';

const initialState = {
  loading: false,
  loaded: true,
  emailConfig: {}
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_EMAIL_CONFIG:
      return {
        ...state,
        loading: true,
      };
    case LOAD_EMAIL_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        emailConfig: action.result[0]
      };
    case LOAD_EMAIL_CONFIG_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case SAVE_EMAIL_CONFIG:
      return {
        ...state,
        loading: true,
      };
    case SAVE_EMAIL_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        emailConfig: action.result
      };
    case SAVE_EMAIL_CONFIG_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case UPDATE_EMAIL_CONFIG:
      return {
        ...state,
        loading: true,
      };
    case UPDATE_EMAIL_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true
      };
    case UPDATE_EMAIL_CONFIG_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    default:
      return state;
  }
}

export function loadSmtp(id) {
  const query = JSON.stringify({ where: { userId: id } });
  return {
    types: [
      LOAD_EMAIL_CONFIG, LOAD_EMAIL_CONFIG_SUCCESS, LOAD_EMAIL_CONFIG_FAIL
    ],
    promise: ({ client }) => client.get(`/EmailConfigurations?filter=${query}`)
  };
}

export function saveEmailConfig(config) {
  return {
    types: [SAVE_EMAIL_CONFIG, SAVE_EMAIL_CONFIG_SUCCESS, SAVE_EMAIL_CONFIG_FAIL],
    promise: ({ client }) => client.post(`/users/${config.userId}/emailconfigurations`, { data: config })
  };
}

export function updatEmailConfig(config) {
  return {
    types: [SAVE_EMAIL_CONFIG, SAVE_EMAIL_CONFIG_SUCCESS, SAVE_EMAIL_CONFIG_FAIL],
    promise: ({ client }) => client.put(`/users/${config.userId}/emailconfigurations/${config.id}`, { data: config })
  };
}

