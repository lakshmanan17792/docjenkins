
const LOAD_ACTIVITIES = 'dashboard/LOAD_ACTIVITIES';
const LOAD_ACTIVITIES_SUCCESS = 'dashboard/LOAD_ACTIVITIES_SUCCESS';
const LOAD_ACTIVITIES_FAIL = 'dashboard/LOAD_ACTIVITIES_FAIL';

const LOAD_DUES = 'dashboard/LOAD_DUES';
const LOAD_DUES_SUCCESS = 'dashboard/LOAD_DUES_SUCCESS';
const LOAD_DUES_FAIL = 'dashboard/LOAD_DUES_FAIL';

const LOAD_INTERVIEWS = 'dashboard/LOAD_INTERVIEWS';
const LOAD_INTERVIEWS_SUCCESS = 'dashboard/LOAD_INTERVIEWS_SUCCESS';
const LOAD_INTERVIEWS_FAIL = 'dashboard/LOAD_INTERVIEWS_FAIL';

const LOAD_PROFILE_PROCESS = 'dashboard/LOAD_PROFILE_PROCESS';
const LOAD_PROFILE_PROCESS_SUCCESS = 'dashboard/LOAD_PROFILE_PROCESS_SUCCESS';
const LOAD_PROFILE_PROCESS_FAIL = 'dashboard/LOAD_PROFILE_PROCESS_FAIL';

const LOAD_CANDIDATE_COUNT = 'dashboard/LOAD_CANDIDATE_COUNT';
const LOAD_CANDIDATE_COUNT_SUCCESS = 'dashboard/LOAD_CANDIDATE_COUNT_SUCCESS';
const LOAD_CANDIDATE_COUNT_FAIL = 'dashboard/LOAD_CANDIDATE_COUNT_FAIL';

const LOAD_JOB_OPENING_COUNT = 'dashboard/LOAD_JOB_OPENING_COUNT';
const LOAD_JOB_OPENING_COUNT_SUCCESS = 'dashboard/LOAD_JOB_OPENING_COUNT_SUCCESS';
const LOAD_JOB_OPENING_COUNT_FAIL = 'dashboard/LOAD_JOB_OPENING_COUNT_FAIL';

const LOAD_SELECTED_TO_HIRE_RATIO = 'dashboard/LOAD_SELECTED_TO_HIRE_RATIO';
const LOAD_SELECTED_TO_HIRE_RATIO_SUCCESS = 'dashboard/LOAD_SELECTED_TO_HIRE_RATIO_SUCCESS';
const LOAD_SELECTED_TO_HIRE_RATIO_FAIL = 'dashboard/LOAD_SELECTED_TO_HIRE_RATIO_FAIL';

const initialState = {
  activityList: [],
  profileGraphLoading: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_ACTIVITIES:
      return {
        ...state,
        loadingActivities: true
      };
    case LOAD_ACTIVITIES_SUCCESS:
      return {
        ...state,
        loadingActivities: false,
        loadedActivities: true,
        activityList: action.result,
      };
    case LOAD_ACTIVITIES_FAIL:
      return {
        ...state,
        loadingActivities: false,
        loadedActivities: false,
        error: action.error
      };
    case LOAD_DUES:
      return {
        ...state,
        loadingDues: true
      };
    case LOAD_DUES_SUCCESS:
      return {
        ...state,
        loadingDues: false,
        loadedDues: true,
        dueList: action.result,
      };
    case LOAD_DUES_FAIL:
      return {
        ...state,
        loadingDues: false,
        loadedDues: false,
        error: action.error
      };
    case LOAD_INTERVIEWS:
      return {
        ...state,
        loading: true
      };
    case LOAD_INTERVIEWS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        interviewList: action.result,
      };
    case LOAD_INTERVIEWS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_PROFILE_PROCESS:
      return {
        ...state,
        profileGraphLoading: true
      };
    case LOAD_PROFILE_PROCESS_SUCCESS:
      return {
        ...state,
        profileGraphLoading: false,
        loaded: true,
        profilecount: action.result,
      };
    case LOAD_PROFILE_PROCESS_FAIL:
      return {
        ...state,
        profileGraphLoading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_CANDIDATE_COUNT:
      return {
        ...state,
        loading: true
      };
    case LOAD_CANDIDATE_COUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        candidatecount: action.result,
      };
    case LOAD_CANDIDATE_COUNT_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_JOB_OPENING_COUNT:
      return {
        ...state,
        loading: true
      };
    case LOAD_JOB_OPENING_COUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        jobopeningcount: action.result,
      };
    case LOAD_JOB_OPENING_COUNT_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_SELECTED_TO_HIRE_RATIO:
      return {
        ...state,
        loading: true
      };
    case LOAD_SELECTED_TO_HIRE_RATIO_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        selectedtohireratio: action.result,
      };
    case LOAD_SELECTED_TO_HIRE_RATIO_FAIL:
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

export function loadActivities(query) {
  return {
    types: [LOAD_ACTIVITIES, LOAD_ACTIVITIES_SUCCESS, LOAD_ACTIVITIES_FAIL],
    promise: ({ client }) =>
      client.get(`/activities?filter=${JSON.stringify(query)}`)
  };
}

export function loadDues(query) {
  return {
    types: [LOAD_DUES, LOAD_DUES_SUCCESS, LOAD_DUES_FAIL],
    promise: ({ client }) =>
      client.get(`/jobOpenings/upcomingDues?filter=${JSON.stringify(query)}`)
  };
}

export function loadInterviews(query) {
  return {
    types: [LOAD_INTERVIEWS, LOAD_INTERVIEWS_SUCCESS, LOAD_INTERVIEWS_FAIL],
    promise: ({ client }) =>
      client.get(`/atsScheduled/upcomingInterviews?filter=${JSON.stringify(query)}`)
  };
}

export function loadProfileCount() {
  return {
    types: [LOAD_PROFILE_PROCESS, LOAD_PROFILE_PROCESS_SUCCESS, LOAD_PROFILE_PROCESS_FAIL],
    promise: ({ client }) => client.get('/profiles/candidate/splitGraph')
  };
}
export function loadSelectedToHireRatio() {
  return {
    types: [LOAD_SELECTED_TO_HIRE_RATIO, LOAD_SELECTED_TO_HIRE_RATIO_SUCCESS, LOAD_SELECTED_TO_HIRE_RATIO_FAIL],
    promise: ({ client }) => client.post('/jobOpenings/hireratio')
  };
}

export function loadCandidateCount() {
  return {
    types: [LOAD_CANDIDATE_COUNT, LOAD_CANDIDATE_COUNT_SUCCESS, LOAD_CANDIDATE_COUNT_FAIL],
    promise: ({ client }) => client.get('/profiles/candidate/graph')
  };
}

// export function loadJobOpeningCount() {
//   return {
//     types: [LOAD_JOB_OPENING_COUNT, LOAD_JOB_OPENING_COUNT_SUCCESS, LOAD_JOB_OPENING_COUNT_FAIL],
//     promise: ({ client }) => client.get('/jobOpenings/graph')
//   };
// }

export function loadJobOpeningCount(query) {
  const accessToken = localStorage.getItem('authToken');
  return {
    types: [LOAD_INTERVIEWS, LOAD_INTERVIEWS_SUCCESS, LOAD_INTERVIEWS_FAIL],
    promise: ({ client }) =>
      client.get(`/jobOpenings/graph?filter=${JSON.stringify(query)}&accessToken=${accessToken}`)
  };
}
