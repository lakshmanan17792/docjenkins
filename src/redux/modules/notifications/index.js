const LOAD_NOTIFICATIONS = 'notifications/LOAD_NOTIFICATIONS';
const LOAD_NOTIFICATIONS_SUCCESS = 'notifications/LOAD_NOTIFICATIONS_SUCCESS';
const LOAD_NOTIFICATIONS_FAIL = 'notifications/LOAD_NOTIFICATIONS_FAIL';
const UPDATE_NOTIFICATIONREAD_STATUS = 'notifications/UPDATE_NOTIFICATIONREAD_STATUS';
const UPDATE_NOTIFICATIONREAD_STATUS_SUCCESS = 'notifications/UPDATE_NOTIFICATIONREAD_STATUS_SUCCESS';
const UPDATE_NOTIFICATIONREAD_STATUS_FAIL = 'notifications/UPDATE_NOTIFICATIONREAD_STATUS_FAIL';
const MARKALL_READ = 'notifications/MARKALL_READ';
const MARKALL_READ_SUCCESS = 'notifications/MARKALL_READ_SUCCESS';
const MARKALL_READ_FAIL = 'notifications/MARKALL_READ_FAIL';

const initialState = {
  loading: null,
  loaded: null,
  notificationLists: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_NOTIFICATIONS:
      return {
        ...state,
        loading: true
      };
    case LOAD_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        notificationLists: action.result,
      };
    case LOAD_NOTIFICATIONS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case UPDATE_NOTIFICATIONREAD_STATUS:
      return {
        ...state,
        loading: true
      };
    case UPDATE_NOTIFICATIONREAD_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
      };
    case UPDATE_NOTIFICATIONREAD_STATUS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case MARKALL_READ:
      return {
        ...state,
        loading: true
      };
    case MARKALL_READ_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
      };
    case MARKALL_READ_FAIL:
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

export function loadNotifications(query) {
  return {
    types: [LOAD_NOTIFICATIONS, LOAD_NOTIFICATIONS_SUCCESS, LOAD_NOTIFICATIONS_FAIL],
    promise: ({ client }) =>
      client.get(`/users/notifications?filter=${JSON.stringify(query)}`)
  };
}

export function updateNotificationStatus(id) {
  return {
    types: [
      UPDATE_NOTIFICATIONREAD_STATUS, UPDATE_NOTIFICATIONREAD_STATUS_SUCCESS, UPDATE_NOTIFICATIONREAD_STATUS_FAIL
    ],
    promise: ({ client }) => client.patch(`/users/update-notifications-status/${id}`)
  };
}

export function markAllRead(id) {
  return {
    types: [
      MARKALL_READ, MARKALL_READ_SUCCESS, MARKALL_READ_FAIL
    ],
    promise: ({ client }) => client.patch(`/users/mark-all-read/${id}`)
  };
}
