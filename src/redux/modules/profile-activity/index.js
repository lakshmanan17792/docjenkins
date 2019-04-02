const LOAD_ACTIVITIES = 'profile-activity/LOAD_ACTIVITIES';
const LOAD_ACTIVITIES_SUCCESS = 'profile-activity/LOAD_ACTIVITIES_SUCCESS';
const LOAD_ACTIVITIES_FAIL = 'profile-activity/LOAD_ACTIVITIES_FAIL';

const initialState = {
  activityList: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_ACTIVITIES:
      return {
        ...state,
        profileActivityLoading: true
      };
    case LOAD_ACTIVITIES_SUCCESS:
      return {
        ...state,
        profileActivityLoading: false,
        loaded: true,
        activityList: action.result,
      };
    case LOAD_ACTIVITIES_FAIL:
      return {
        ...state,
        profileActivityLoading: false,
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
export function loadActivities(resumeId) {
  return {
    types: [LOAD_ACTIVITIES, LOAD_ACTIVITIES_SUCCESS, LOAD_ACTIVITIES_FAIL],
    promise: ({ client }) =>
      client.get(`/activities/resume/${resumeId}`)
  };
}

export function loadActivitiesBySearch(data) {
  return {
    types: [LOAD_ACTIVITIES, LOAD_ACTIVITIES_SUCCESS, LOAD_ACTIVITIES_FAIL],
    promise: ({ client }) =>
      client.post('/activities/resume/', { data })
  };
}

