import parser from '../Parser';
import openingResolver from './openingResolver';

const LOAD_OPENINGS = 'openings/LOAD_OPENINGS';
const LOAD_OPENINGS_SUCCESS = 'openings/LOAD_OPENINGS_SUCCESS';
const LOAD_OPENINGS_FAIL = 'openings/LOAD_OPENINGS_FAIL';

const LOAD_OPENINGS_FILTER = 'openings/LOAD_OPENINGS_FILTER';
const LOAD_OPENINGS_FILTER_SUCCESS = 'openings/LOAD_OPENINGS_FILTER_SUCCESS';
const LOAD_OPENINGS_FILTER_FAIL = 'openings/LOAD_OPENINGS_FILTER_FAIL';

const LOAD_CLIENT_COMPANIES = 'openings/LOAD_CLIENT_COMPANIES';
const LOAD_CLIENT_COMPANIES_SUCCESS = 'openings/LOAD_CLIENT_COMPANIES_SUCCESS';
const LOAD_CLIENT_COMPANIES_FAIL = 'openings/LOAD_CLIENT_COMPANIES_FAIL';

const LOAD_RECRUITERS = 'openings/LOAD_RECRUITERS';
const LOAD_RECRUITERS_SUCCESS = 'openings/LOAD_RECRUITERS_SUCCESS';
const LOAD_RECRUITERS_FAIL = 'openings/LOAD_RECRUITERS_FAIL';

const LOAD_DELIVERY_HEADS = 'openings/LOAD_DELIVERY_HEADS';
const LOAD_DELIVERY_HEADS_SUCCESS = 'openings/LOAD_DELIVERY_HEADS_SUCCESS';
const LOAD_DELIVERY_HEADS_FAIL = 'openings/LOAD_DELIVERY_HEADS_FAIL';

const LOAD_CONTACTPERSON = 'openings/LOAD_CONTACTPERSON';
const LOAD_CONTACTPERSON_SUCCESS = 'openings/LOAD_CONTACTPERSON_SUCCESS';
const LOAD_CONTACTPERSON_FAIL = 'openings/LOAD_CONTACTPERSON_FAIL';

const SAVE_JOB_PROFILE = 'openings/SAVE_JOB_PROFILE';
const SAVE_JOB_PROFILE_SUCCESS = 'openings/SAVE_JOB_PROFILE_SUCCESS';
const SAVE_JOB_PROFILE_FAIL = 'openings/SAVE_JOB_PROFILE_FAIL';

const OPEN_EDIT_OPENING_MODAL = 'openings/OPEN_EDIT_OPENING_MODAL';
const CLOSE_EDIT_OPENING_MODAL = 'openings/CLOSE_EDIT_OPENING_MODAL';

const OPEN_VIEW_OPENING_MODAL = 'openings/OPEN_VIEW_OPENING_MODAL';
const CLOSE_VIEW_OPENING_MODAL = 'openings/CLOSE_VIEW_OPENING_MODAL';

const SAVE_NEW_OPENING = 'openings/SAVE_NEW_OPENING';
const SAVE_NEW_OPENING_SUCCESS = 'openings/SAVE_NEW_OPENING_SUCCESS';
const SAVE_NEW_OPENING_FAIL = 'openings/SAVE_NEW_OPENING_FAIL';

const UPDATE_OPENING = 'openings/UPDATE_OPENING';
const UPDATE_OPENING_SUCCESS = 'openings/UPDATE_OPENING_SUCCESS';
const UPDATE_OPENING_FAIL = 'openings/UPDATE_OPENING_FAIL';

const LOAD_OPENING = 'openings/LOAD_OPENING';
const LOAD_OPENING_SUCCESS = 'openings/LOAD_OPENING_SUCCESS';
const LOAD_OPENING_FAIL = 'openings/LOAD_OPENING_FAIL';

const CLEAR_SELECTED_OPENING = 'openings/CLEAR_SELECTED_OPENING';

const REMOVE_CANDIDATE = 'openings/REMOVE_CANDIDATE';
const REMOVE_CANDIDATE_SUCCESS = 'openings/REMOVE_CANDIDATE_SUCCESS';
const REMOVE_CANDIDATE_FAIL = 'openings/REMOVE_CANDIDATE_FAIL';

const LOAD_LOG_ACTIVITY = 'customers/LOAD_LOG_ACTIVITY';
const LOAD_LOG_ACTIVITY_SUCCESS = 'customers/LOAD_LOG_ACTIVITY_SUCCESS';
const LOAD_LOG_ACTIVITY_FAIL = 'customers/LOAD_LOG_ACTIVITY_FAIL';

const LOG_ACTIVITY = 'customers/LOG_ACTIVITY';
const LOG_ACTIVITY_SUCCESS = 'customers/LOG_ACTIVITY_SUCCESS';
const LOG_ACTIVITY_FAIL = 'customers/LOG_ACTIVITY_FAIL';

const LOAD_SALES_OWNERS = 'openings/LOAD_SALES_OWNERS';
const LOAD_SALES_OWNERS_SUCCESS = 'openings/LOAD_SALES_OWNERS_SUCCESS';
const LOAD_SALES_OWNERS_FAIL = 'openings/LOAD_SALES_OWNERS_FAIL';

const SHARE_JOB_OPENING = 'openings/SHARE_JOB_OPENING';
const SHARE_JOB_OPENING_SUCCESS = 'opening/SHARE_JOB_OPENING_SUCCESS';
const SHARE_JOB_OPENING_FAIL = 'openings/SHARE_JOB_OPENING_FAIL';

const LOAD_TAGS = 'openings/LOAD_TAGS';
const LOAD_TAGS_SUCCESS = 'opening/LOAD_TAGS_SUCCESS';
const LOAD_TAGS_FAIL = 'openings/LOAD_TAGS_FAIL';

const CREATE_TAG = 'openings/CREATE_TAG';
const CREATE_TAG_SUCCESS = 'opening/CREATE_TAG_SUCCESS';
const CREATE_TAG_FAIL = 'openings/CREATE_TAG_FAIL';

const ADD_TAGS = 'openings/ADD_TAGS';
const ADD_TAGS_SUCCESS = 'openings/ADD_TAGS_SUCCESS';
const ADD_TAGS_FAIL = 'openings/ADD_TAGS_FAIL';

const UPDATE_TAGS = 'openings/UPDATE_TAGS';
const UPDATE_TAGS_SUCCESS = 'openings/UPDATE_TAGS_SUCCESS';
const UPDATE_TAGS_FAIL = 'openings/UPDATE_TAGS_FAIL';

const initialState = {
  loading: null,
  loaded: null,
  filterLoading: null,
  filterLoaded: null,
  list: [],
  contactPerson: [],
  saving: null,
  saved: null,
  updating: null,
  updated: null,
  selectingCandidate: null,
  candidateSelected: null,
  removingCandidate: null,
  candidateRemoved: null,
  deliveryHeads: [],
  salesOwners: [],
  recruiterList: [],
  jobOpeningTags: [],
  tags: []
};
let deletedResumeId = '';

const getFullName = users => {
  if (users.salesOwners && users.salesOwners.length > 0) {
    users.salesOwners.forEach(user => {
      user.fullName =
        `${user.firstName && user.firstName !== null ? user.firstName : ''}
        ${user.lastName && user.lastName !== null ? user.lastName : ''}`.trim();
    }
    );
  }
  if (users.recruiters && users.recruiters.length > 0) {
    users.recruiters.forEach(user => {
      user.fullName =
        `${user.firstName && user.firstName !== null ? user.firstName : ''}
        ${user.lastName && user.lastName !== null ? user.lastName : ''}`.trim();
    }
    );
  }
  return users;
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_OPENINGS:
      return {
        ...state,
        loading: true,
      };
    case LOAD_OPENINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        list: parser.parseOpenings(action.result.response),
        totalCount: action.result.totalCount
      };
    case LOAD_OPENINGS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case LOAD_OPENINGS_FILTER:
      return {
        ...state,
        loading: true,
        filterLoading: true,
      };
    case LOAD_OPENINGS_FILTER_SUCCESS:
      return {
        ...state,
        loading: false,
        filterLoading: false,
        filterLoaded: true,
        list: parser.parseOpenings(action.result.response),
        totalCount: action.result.totalCount
      };
    case LOAD_OPENINGS_FILTER_FAIL:
      return {
        ...state,
        loading: false,
        filterLoading: false,
        filterLoaded: false
      };
    case LOAD_CLIENT_COMPANIES:
      return {
        ...state,
        loading: true
      };
    case LOAD_CLIENT_COMPANIES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        companyList: parser.parseCompanies(action.result.data)
      };
    case LOAD_CLIENT_COMPANIES_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_DELIVERY_HEADS:
    case LOAD_RECRUITERS:
      return {
        ...state,
        loading: true
      };
    case LOAD_RECRUITERS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        recruiterList: action.result
      };
    case LOAD_DELIVERY_HEADS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        deliveryHeads: action.result
      };
    case LOAD_DELIVERY_HEADS_FAIL:
    case LOAD_RECRUITERS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_CONTACTPERSON:
      return {
        ...state,
      };
    case LOAD_CONTACTPERSON_SUCCESS:
      return {
        ...state,
        contactPerson: action.result
      };
    case LOAD_CONTACTPERSON_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case SAVE_JOB_PROFILE:
      return {
        ...state,
        selectingCandidate: true
      };
    case SAVE_JOB_PROFILE_SUCCESS:
      return {
        ...state,
        selectingCandidate: false,
        candidateSelected: true,
        selectedOpening: openingResolver.addResumeIdWithSelectedJob(state, action.result)
      };
    case SAVE_JOB_PROFILE_FAIL:
      return {
        ...state,
        candidateSelected: false,
        selectingCandidate: false,
        saving: false,
        jobProfileSaveError: action.error
      };
    case OPEN_EDIT_OPENING_MODAL:
      return {
        ...state,
        openOpeningModal: true
      };
    case CLOSE_EDIT_OPENING_MODAL:
      return {
        ...state,
        openOpeningModal: false,
        openingSaved: false,
        openingUpdated: false,
        saved: false
      };
    case OPEN_VIEW_OPENING_MODAL:
      return {
        ...state,
        openViewOpeningModal: true,
        saved: false
      };
    case CLOSE_VIEW_OPENING_MODAL:
      return {
        ...state,
        openViewOpeningModal: false,
        saved: false
      };
    case SAVE_NEW_OPENING:
      return {
        ...state,
        saving: true,
        saved: false,
      };
    case SAVE_NEW_OPENING_SUCCESS:
      return {
        ...state,
        saved: true,
        saving: false,
        openingSaved: true,
        jobId: action.result.saveJobCompanies[1],
        // list: !isFilter ? openingResolver.addNewOpening(state.list, action.result) : state.list,
        // totalCount: !isFilter ? Number(state.totalCount) + 1 : state.totalCount
      };
    case SAVE_NEW_OPENING_FAIL:
      return {
        ...state,
        saving: false,
        saved: false,
        error: action.error
      };
    case UPDATE_OPENING:
      return {
        ...state,
        updating: true,
        updated: false
      };
    case UPDATE_OPENING_SUCCESS:
      return {
        ...state,
        openingUpdated: true,
        selectedOpening: action.result,
        updating: false,
        updated: true,
      };
    case UPDATE_OPENING_FAIL:
      return {
        ...state,
        updating: false,
        updated: false,
        error: action.error
      };
    case LOAD_OPENING:
      return {
        ...state,
        loading: true,
        openingUpdated: false,
        selectedOpening: null,
        loaded: false
      };
    case LOAD_OPENING_SUCCESS:
      return {
        ...state,
        selectedOpening: getFullName(action.result),
        // selectedOpening: action.result,
        loading: false,
        loaded: true,
      };
    case LOAD_OPENING_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case CLEAR_SELECTED_OPENING:
      return {
        ...state,
        selectedOpening: null,
      };
    case REMOVE_CANDIDATE:
      return {
        ...state,
        removingCandidate: true,
      };
    case REMOVE_CANDIDATE_SUCCESS:
      return {
        ...state,
        candidateRemoved: true,
        removingCandidate: false,
        selectedOpening: openingResolver.removeResumeIdFromSelectedJob(state, deletedResumeId)
      };
    case REMOVE_CANDIDATE_FAIL:
      return {
        ...state,
        candidateRemoved: false,
        removingCandidate: false
      };
    case LOG_ACTIVITY :
      return {
        ...state
      };
    case LOG_ACTIVITY_SUCCESS :
      return {
        ...state,
        activity: action.result
      };
    case LOG_ACTIVITY_FAIL :
      return {
        ...state,
        error: action.error
      };
    case LOAD_LOG_ACTIVITY: {
      return {
        ...state,
        jobOpeningActivityLoading: true,
        jobOpeningActivityLoaded: false
      };
    }
    case LOAD_LOG_ACTIVITY_SUCCESS: {
      return {
        ...state,
        jobOpeningActivityLoading: false,
        jobOpeningActivityLoaded: true,
        activities: action.result.response,
        totalCount: action.result.totalCount
      };
    }
    case LOAD_LOG_ACTIVITY_FAIL: {
      return {
        ...state,
        jobOpeningActivityLoading: false,
        jobOpeningActivityLoaded: false,
        error: action.error
      };
    }
    case LOAD_SALES_OWNERS:
      return {
        ...state,
        loading: true
      };
    case LOAD_SALES_OWNERS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        salesOwners: action.result,
      };
    case LOAD_SALES_OWNERS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_TAGS:
    case CREATE_TAG:
    case SHARE_JOB_OPENING:
    case ADD_TAGS:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case ADD_TAGS_FAIL:
    case LOAD_TAGS_FAIL:
    case CREATE_TAG_FAIL:
    case SHARE_JOB_OPENING_FAIL:
    case SHARE_JOB_OPENING_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true
      };
    case LOAD_TAGS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        jobOpeningTags: action.result,
        tags: action.result
      };
    case ADD_TAGS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        jobOpeningTags: [...state.jobOpeningTags, ...action.result],
        tags: [...state.tags, ...action.result]
      };
    case CREATE_TAG_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        jobOpeningTags: [...state.jobOpeningTags, action.result]
      };
    default:
      return state;
  }
}

/*
* Actions
* * * * */
export function loadOpenings(data, isSearch) {
  if (isSearch) {
    return {
      types: [LOAD_OPENINGS_FILTER, LOAD_OPENINGS_FILTER_SUCCESS, LOAD_OPENINGS_FILTER_FAIL],
      promise: ({ client }) => client.post('/jobOpenings/lists', { data })
    };
  }
  return {
    types: [LOAD_OPENINGS, LOAD_OPENINGS_SUCCESS, LOAD_OPENINGS_FAIL],
    promise: ({ client }) => client.post('/jobOpenings/lists', { data })
  };
}

export function loadOpeningsByJobId(data) {
  return {
    types: [LOAD_OPENINGS_FILTER, LOAD_OPENINGS_FILTER_SUCCESS, LOAD_OPENINGS_FILTER_FAIL],
    promise: ({ client }) => client.post('/jobOpenings/find', { data })
  };
}

export function loadClientCompanies(query) {
  if (query) {
    let param;
    if (query.searchTerm) {
      param = {
        searchTerm: encodeURIComponent(query.searchTerm),
        loadAllCompanies: query.loadAllCompanies || false
      };
    }

    return {
      types: [LOAD_CLIENT_COMPANIES, LOAD_CLIENT_COMPANIES_SUCCESS, LOAD_CLIENT_COMPANIES_FAIL],
      promise: ({ client }) => client.get(`/customers/names?filter=${JSON.stringify(param)}`)
    };
  }
  const param = {
    loadAllCompanies: false
  };
  return {
    types: [LOAD_CLIENT_COMPANIES, LOAD_CLIENT_COMPANIES_SUCCESS, LOAD_CLIENT_COMPANIES_FAIL],
    promise: ({ client }) => client.get(`/customers/names?filter=${JSON.stringify(param)}`)
  };
}

export function loadRecruiters() {
  return {
    types: [LOAD_RECRUITERS, LOAD_RECRUITERS_SUCCESS, LOAD_RECRUITERS_FAIL],
    promise: ({ client }) => client.get('/users/recruiters')
  };
}

export function loadDeliveryHeads(data) {
  return {
    types: [LOAD_DELIVERY_HEADS, LOAD_DELIVERY_HEADS_SUCCESS, LOAD_DELIVERY_HEADS_FAIL],
    promise: ({ client }) => client.post('/users/lists', { data })
  };
}

export function loadContactPerson(id) {
  return {
    types: [LOAD_CONTACTPERSON, LOAD_CONTACTPERSON_SUCCESS, LOAD_CONTACTPERSON_FAIL],
    promise: ({ client }) => client.post('/customers/contacts', { data: id })
  };
}

export function saveJobProfile(jobProfileData) {
  return {
    types: [SAVE_JOB_PROFILE, SAVE_JOB_PROFILE_SUCCESS, SAVE_JOB_PROFILE_FAIL],
    promise: ({ client }) => client.post('/jobProfiles/select',
      { data: jobProfileData })
  };
}

export function loadLogActivityForOpening(filter) {
  return {
    types: [
      LOAD_LOG_ACTIVITY, LOAD_LOG_ACTIVITY_SUCCESS, LOAD_LOG_ACTIVITY_FAIL
    ],
    promise: ({ client }) => client.get(`jobOpenings/${filter.jobId}/activity?filter=${JSON.stringify(filter)}`)
  };
}

export function loadActivityHistoryForOpening(filter) {
  return {
    types: [
      LOAD_LOG_ACTIVITY, LOAD_LOG_ACTIVITY_SUCCESS, LOAD_LOG_ACTIVITY_FAIL
    ],
    promise: ({ client }) => client.get(`jobOpenings/${filter.jobId}/history?filter=${JSON.stringify(filter)}`)
  };
}

export function logActivity(data) {
  return {
    types: [
      LOG_ACTIVITY, LOG_ACTIVITY_SUCCESS, LOG_ACTIVITY_FAIL
    ],
    promise: ({ client }) => client.post('/Notes/logActivity', { data })
  };
}

export function openEditOpeningModal() {
  return {
    type: OPEN_EDIT_OPENING_MODAL
  };
}

export function closeEditOpeningModal() {
  return {
    type: CLOSE_EDIT_OPENING_MODAL
  };
}

export function openViewOpeningModal() {
  return {
    type: OPEN_VIEW_OPENING_MODAL
  };
}

export function closeViewOpeningModal() {
  return {
    type: CLOSE_VIEW_OPENING_MODAL
  };
}


export function saveNewOpening(jobOpeningData) {
  return {
    types: [SAVE_NEW_OPENING, SAVE_NEW_OPENING_SUCCESS, SAVE_NEW_OPENING_FAIL],
    promise: ({ client }) => client.post('/jobOpenings/saveJobOpening',
      { data: jobOpeningData })
  };
}

export function saveEditedOpening(data) {
  return {
    types: [UPDATE_OPENING, UPDATE_OPENING_SUCCESS, UPDATE_OPENING_FAIL],
    promise: ({ client }) => client.put(`/jobOpenings/update/${data.id}`,
      { data })
  };
}

export function loadOpeningById(id) {
  return {
    types: [LOAD_OPENING, LOAD_OPENING_SUCCESS, LOAD_OPENING_FAIL],
    promise: ({ client }) => client.get(`/jobOpenings/lists/${id}`)
  };
}
export function clearSelectedOpening() {
  return {
    type: CLEAR_SELECTED_OPENING
  };
}

export function removeCandidateFromJobProfile(jobId, resumeId) {
  deletedResumeId = resumeId;
  return {
    types: [
      REMOVE_CANDIDATE, REMOVE_CANDIDATE_SUCCESS, REMOVE_CANDIDATE_FAIL
    ],
    promise: ({ client }) => client.del(`/jobProfiles/deselect?jobId=${jobId}&resumeId=${resumeId}`)
  };
}

export function loadSalesOwners(customerId) {
  return {
    types: [LOAD_SALES_OWNERS, LOAD_SALES_OWNERS_SUCCESS, LOAD_SALES_OWNERS_FAIL],
    promise: ({ client }) => client.get(`/customers/salesOwners/${customerId}`)
  };
}

export function shareJobOpening(id) {
  return {
    types: [SHARE_JOB_OPENING, SHARE_JOB_OPENING_SUCCESS, SHARE_JOB_OPENING_FAIL],
    promise: ({ client }) => client.get(`/jobOpenings/shareJobOpening/${id}`)
  };
}

export const getJobOpeningTags = obj => {
  const data = {
    searchTerm: obj.searchTerm.trim(),
    tagType: 'jobOpening',
    skip: obj.skip ? obj.skip : 0,
    limit: obj.limit ? obj.limit : 10
  };
  if (obj.skip === 0) {
    return {
      types: [LOAD_TAGS, LOAD_TAGS_SUCCESS, LOAD_TAGS_FAIL],
      promise: ({ client }) => client.post('/jobOpenings/listTags', { data })
    };
  }
  return {
    types: [ADD_TAGS, ADD_TAGS_SUCCESS, ADD_TAGS_FAIL],
    promise: ({ client }) => client.post('/jobOpenings/listTags', { data })
  };
};

export const createJobOpeningTag = data => (
  {
    types: [CREATE_TAG, CREATE_TAG_SUCCESS, CREATE_TAG_FAIL],
    promise: ({ client }) => client.post('/jobOpenings/createTag', { data })
  }
);

export const updateJobOpeningTags = data => (
  {
    types: [UPDATE_TAGS, UPDATE_TAGS_SUCCESS, UPDATE_TAGS_FAIL],
    promise: ({ client }) => client.post('/jobOpenings/update/tags', { data })
  }
);
