// import parser from '../Parser';

const LOAD_JOB_RESUMES = 'ats/LOAD_JOBS';
const LOAD_JOB_RESUMES_SUCCESS = 'ats/LOAD_JOB_RESUMES_SUCCESS';
const LOAD_JOB_RESUMES_FAIL = 'ats/LOAD_JOB_RESUMES_FAIL';
const LOAD_OPENING_HISTORY = 'ats/LOAD_OPENING_HISTORY';
const LOAD_OPENING_HISTORY_SUCCESS = 'ats/LOAD_OPENING_HISTORY_SUCCESS';
const LOAD_OPENING_HISTORY_FAIL = 'ats/LOAD_OPENING_HISTORY_FAIL';
const CANCEL_SENDING_EMAIL = 'ats/CANCEL_SENDING_EMAIL';
const LOAD_JOB_OPENING_RESUMES = 'ats/LOAD_JOB_OPENING_RESUMES';
const LOAD_JOB_OPENING_RESUMES_SUCCESS = 'ats/LOAD_JOB_OPENING_RESUMES_SUCCESS';
const LOAD_JOB_OPENING_RESUMES_FAIL = 'ats/LOAD_JOB_OPENING_RESUMES_FAIL';
const UPDATE_JOB_PROFILE = 'ats/UPDATE_JOB_PROFILE';
const UPDATE_JOB_PROFILE_SUCCESS = 'ats/UPDATE_JOB_PROFILE_SUCCESS';
const UPDATE_JOB_PROFILE_FAILURE = 'ats/UPDATE_JOB_PROFILE_FAILURE';
const NOTIFICATION_SEND = 'ats/NOTIFICATION_SEND';
const NOTIFICATION_SEND_SUCCESS = 'ats/NOTIFICATION_SEND_SUCCESS';
const NOTIFICATION_SEND_FAILURE = 'ats/NOTIFICATION_SEND_FAILURE';
const LOAD_INTERVIEW_INFO = 'ats/LOAD_INTERVIEW_INFO';
const LOAD_INTERVIEW_INFO_SUCCESS = 'ats/LOAD_INTERVIEW_INFO_SUCCESS';
const LOAD_INTERVIEW_INFO_FAILURE = 'ats/LOAD_INTERVIEW_INFO_FAILURE';
const REMOVED_SELECTED_CANDIDATES = 'ats/REMOVED_SELECTED_CANDIDATES';
const ADD_SELECTED_CANDIDATES = 'ats/ADD_SELECTED_CANDIDATES';
const GET_CANDIDATE_STATUS = 'ats/GET_CANDIDATE_STATUS';
const GET_CANDIDATE_STATUS_SUCCESS = 'ats/GET_CANDIDATE_STATUS_SUCCESS';
const GET_CANDIDATE_STATUS_FAILURE = 'ats/GET_CANDIDATE_STATUS_FAILURE';
const LOAD_REJECT_REASON = 'masterLists/LOAD_REJECT_REASON';
const LOAD_REJECT_REASON_SUCCESS = 'masterLists/LOAD_REJECT_REASON_SUCCESS';
const LOAD_REJECT_REASON_FAIL = 'masterLists/LOAD_REJECT_REASON_FAIL';
const LOAD_HIRED_INFO = 'ats/LOAD_HIRED_INFO';
const LOAD_HIRED_INFO_SUCCESS = 'ats/LOAD_HIRED_INFO_SUCCESS';
const LOAD_HIRED_INFO_FAILURE = 'ats/LOAD_HIRED_INFO_FAILURE';

const initialState = {
  loading: null,
  loaded: null,
  candidates: [],
  resumeList: null,
  notifying: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_JOB_RESUMES:
      return {
        ...state,
        loading: true
      };
    case LOAD_JOB_RESUMES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        list: action.result.hits.hits
      };
    case LOAD_JOB_RESUMES_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_OPENING_HISTORY:
      return {
        ...state,
        loading: true,
        openingHistoryList: null,
        loaded: false
      };
    case LOAD_OPENING_HISTORY_SUCCESS:
      return {
        ...state,
        openingHistoryList: action.result,
        loading: false,
        loaded: true
      };
    case LOAD_OPENING_HISTORY_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case CANCEL_SENDING_EMAIL:
      state.candidates.length = 0;
      return {
        ...state,
        candidates: null
      };
    case LOAD_JOB_OPENING_RESUMES:
      return {
        ...state,
        loadingResumes: true
      };
    case LOAD_JOB_OPENING_RESUMES_SUCCESS:
      return {
        ...state,
        loadingResumes: false,
        resumeList: action.result
      };
    case LOAD_JOB_OPENING_RESUMES_FAIL:
      return {
        ...state,
        loadingResumes: false,
        error: action.error
      };
    case UPDATE_JOB_PROFILE:
      return {
        ...state,
        updatingProfile: true
      };
    case UPDATE_JOB_PROFILE_SUCCESS:
      return {
        ...state,
        updatingProfile: false,
        profileUpdationStatus: action.result
      };
    case UPDATE_JOB_PROFILE_FAILURE:
      return {
        ...state,
        updatingProfile: false,
        error: action.error
      };
    case NOTIFICATION_SEND:
      return {
        ...state,
        notifying: true
      };
    case NOTIFICATION_SEND_FAILURE:
    case NOTIFICATION_SEND_SUCCESS:
      return {
        ...state,
        notifying: false
      };
    case LOAD_INTERVIEW_INFO:
      return {
        ...state
      };
    case LOAD_INTERVIEW_INFO_SUCCESS:
      return {
        ...state,
        candiateInterviewInfo: action.result
      };
    case LOAD_INTERVIEW_INFO_FAILURE:
      return {
        ...state,
        error: action.error
      };
    case ADD_SELECTED_CANDIDATES: {
      return {
        ...state,
        selectedCandidates: action.candidates
      };
    }
    case REMOVED_SELECTED_CANDIDATES: {
      return {
        ...state,
        selectedCandidates: []
      };
    }
    case GET_CANDIDATE_STATUS: {
      return {
        ...state,
        candidateStatus: {},
        statusLoading: true,
        statusLoaded: false
      };
    }
    case GET_CANDIDATE_STATUS_SUCCESS: {
      return {
        ...state,
        candidateStatus: action.result,
        statusLoading: false,
        statusLoaded: true
      };
    }
    case GET_CANDIDATE_STATUS_FAILURE: {
      return {
        ...state,
        statusLoading: false,
        statusLoaded: false,
        statusError: action.error
      };
    }
    case LOAD_REJECT_REASON:
      return {
        ...state,
        loading: true
      };
    case LOAD_REJECT_REASON_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        rejectReasonList: action.result.data,
      };
    case LOAD_REJECT_REASON_FAIL:
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
function getProfilesByIds(jobResumes, client) {
  // const resumeIds = jobResumes.map(jobResume =>
  //   jobResume.resumeId
  // );
  return new Promise((resolve, reject) => {
    client.post('http://54.89.41.17:9200/resume_idx/resume/_search?pretty',
      { data: {
        query: {
          terms: {
            id: [2134, 2135]
          }
        }
      }
      }).then(
      result => resolve(result),
      () => reject([])
    );
  });
}
function getProfileIdsByRecruiterId(client, url) {
  return new Promise(resolve => {
    client.get(url).then(
      result => {
        getProfilesByIds(result, client)
          .then(
            response => resolve(response)
          );
      }
    );
  });
}

export function load() {
  const url = '/JobResume?filter={"where": {"assignedRecruiterId": 12}}';
  return {
    types: [LOAD_JOB_RESUMES, LOAD_JOB_RESUMES_SUCCESS, LOAD_JOB_RESUMES_FAIL],
    promise: ({ client }) => getProfileIdsByRecruiterId(client, url)
  };
}

export function loadOpeningHistoryById(queryParam) {
  const query = {
    limit: queryParam.limit,
    skip: queryParam.page,
    order: 'createdAt DESC',
    where: {
      jobOpeningId: queryParam.jobId,
      action: 'CANDIDATE_STATUS_UPDATE'
    }
  };
  return {
    types: [LOAD_OPENING_HISTORY, LOAD_OPENING_HISTORY_SUCCESS, LOAD_OPENING_HISTORY_FAIL],
    promise: ({ client }) => client.get(`/activities?filter=${JSON.stringify(query)}`)
  };
}

export function cancelSendingEmail() {
  return {
    type: CANCEL_SENDING_EMAIL,
  };
}

export function getResumesForOpeningById(jobId) {
  return {
    types: [LOAD_JOB_OPENING_RESUMES, LOAD_JOB_OPENING_RESUMES_SUCCESS, LOAD_JOB_OPENING_RESUMES_FAIL],
    promise: ({ client }) => client.get(`/jobProfiles/job/${jobId}`)
  };
}

export function updateJobProfile(data) {
  return {
    types: [UPDATE_JOB_PROFILE, UPDATE_JOB_PROFILE_SUCCESS, UPDATE_JOB_PROFILE_FAILURE],
    promise: ({ client }) => client.post('/jobProfiles/updateJobProfile', {
      data
    })
  };
}

export function toBeSubmittedDH(data) {
  return {
    types: [NOTIFICATION_SEND, NOTIFICATION_SEND_SUCCESS, NOTIFICATION_SEND_FAILURE],
    promise: ({ client }) => client.post('/atsToBeSubmitteds/notify-deliveryHead', {
      data
    })
  };
}

export function toBeSubmittedSales(data) {
  return {
    types: [NOTIFICATION_SEND, NOTIFICATION_SEND_SUCCESS, NOTIFICATION_SEND_FAILURE],
    promise: ({ client }) => client.post('/atsToBeSubmitteds/notify-sales', {
      data
    })
  };
}

export function notifySubmitted(data) {
  return {
    types: [NOTIFICATION_SEND, NOTIFICATION_SEND_SUCCESS, NOTIFICATION_SEND_FAILURE],
    promise: ({ client }) => client.post('/atsSubmitteds/notify-deliveryHead-recruiters', {
      data
    })
  };
}

export function notifyShortlisted(data) {
  return {
    types: [NOTIFICATION_SEND, NOTIFICATION_SEND_SUCCESS, NOTIFICATION_SEND_FAILURE],
    promise: ({ client }) => client.post('/atsShortlisteds/notify-deliveryHead-recruiters', {
      data
    })
  };
}

export function getCandidateInfo(jobId, resumeId) {
  return {
    types: [LOAD_INTERVIEW_INFO, LOAD_INTERVIEW_INFO_SUCCESS, LOAD_INTERVIEW_INFO_FAILURE],
    promise: ({ client }) => client.get(`/atsScheduled/interview?jobId=${jobId}&resumeId=${resumeId}`)
  };
}

export function addSelectedCandidates(candidates) {
  return {
    type: ADD_SELECTED_CANDIDATES,
    candidates
  };
}

export function removedSelectedCandidates() {
  return {
    type: REMOVED_SELECTED_CANDIDATES
  };
}

export function getCandidateStatus(filter) {
  return {
    types: [GET_CANDIDATE_STATUS, GET_CANDIDATE_STATUS_SUCCESS, GET_CANDIDATE_STATUS_FAILURE],
    promise: ({ client }) => client.post('/jobProfiles/status', { data: filter })
  };
}

export function searchRejectReasons(data) {
  return {
    types: [LOAD_REJECT_REASON, LOAD_REJECT_REASON_SUCCESS, LOAD_REJECT_REASON_FAIL],
    promise: ({ client }) => client.post('/reasons/lists', { data })
  };
}

export function getCandidateHiredInfo(jobId, resumeId) {
  return {
    types: [LOAD_HIRED_INFO, LOAD_HIRED_INFO_SUCCESS, LOAD_HIRED_INFO_FAILURE],
    promise: ({
      client
    }) => client.get(`/atsHireds/hired?jobId=${jobId}&resumeId=${resumeId}`)
  };
}
