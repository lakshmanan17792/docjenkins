import lodash from 'lodash';

const LOAD_LINKEDIN = 'LINKEDIN/LOAD_LINKEDIN';
const LOAD_LINKEDIN_SUCCESS = 'LINKEDIN/LOAD_LINKEDIN_SUCCESS';
const LOAD_LINKEDIN_FAIL = 'LINKEDIN/LOAD_LINKEDIN_FAIL';
const SEARCH_LINKEDIN = 'LINKEDIN/SEARCH_LINKEDIN';
const SEARCH_LINKEDIN_SUCCESS = 'LINKEDIN/SEARCH_LINKEDIN_SUCCESS';
const SEARCH_LINKEDIN_FAIL = 'LINKEDIN/SEARCH_LINKEDIN_FAIL';
const LOAD_SIMILAR_LINKEDIN = 'LINKEDIN/LOAD_SIMILAR_LINKEDIN';
const LOAD_SIMILAR_LINKEDIN_SUCCESS = 'LINKEDIN/LOAD_SIMILAR_LINKEDIN_SUCCESS';
const LOAD_SIMILAR_LINKEDIN_FAIL = 'LINKEDIN/LOAD_SIMILAR_LINKEDIN_FAIL';
const DELETE_LINKEDIN = 'LINKEDIN/DELETE_LINKEDIN';
const DELETE_LINKEDIN_SUCCESS = 'LINKEDIN/DELETE_LINKEDIN_SUCCESS';
const DELETE_LINKEDIN_FAIL = 'LINKEDIN/DELETE_LINKEDIN_FAIL';
const CLEAN_LINKEDIN = 'LINKEDIN/CLEAN_LINKEDIN';
const SET_CANDIDATE_DATA = 'LINKEDIN/SET_CANDIDATE_DATA';
const CLEAN_SIMILAR_CANDIDATES = 'LINKEDIN/CLEAN_SIMILAR_CANDIDATES';

const initialState = {
  loading: false,
  loaded: false,
  linkedinProfiles: []
};

const getLinkedinProfiles = (newProfiles, oldProfiles, newList) => {
  if (newList) {
    return newProfiles;
  }
  if (oldProfiles) {
    newProfiles.push(...oldProfiles);
  }
  let profiles = lodash.uniqBy(newProfiles, 'id');
  profiles = lodash.orderBy(profiles, ['createdAt'], ['desc']);
  return profiles;
};

const canAddProfile = (profiles, filter) => {
  if (profiles && (profiles.length > 0) && filter) {
    const filteredProfiles = lodash.filter(
      profiles, profile => {
        if (profile && profile._source && profile._source.contacts) {
          return (filter.email && typeof filter.email === 'string'
          && profile._source.contacts.emails && profile._source.contacts.emails.includes(filter.email.toLowerCase())) ||
            (filter.mobileNumber && typeof filter.mobileNumber === 'string'
            && profile._source.contacts.mobile_numbers
            && profile._source.contacts.mobile_numbers.includes(filter.mobileNumber.toLowerCase()));
        }
      });
    return filteredProfiles && filteredProfiles.length <= 0;
  }
};

const getUnDeletedProfiles = (linkedinProfiles, profile) => {
  lodash.remove(linkedinProfiles, { id: profile.id });
  return linkedinProfiles;
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_LINKEDIN:
      return {
        ...state,
        loading: true
      };
    case LOAD_LINKEDIN_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        linkedinProfiles: getLinkedinProfiles(action.result.sourcedProfiles, state.linkedinProfiles),
        totalCount: action.result.totalCount,
      };
    case LOAD_LINKEDIN_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_SIMILAR_LINKEDIN:
      return {
        ...state,
        loading: true
      };
    case LOAD_SIMILAR_LINKEDIN_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        similarLinkedinProfiles: action.result.data && action.result.data,
        canAddProfile: canAddProfile(action.result.data && action.result.data, action.filter)
      };
    case LOAD_SIMILAR_LINKEDIN_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case SEARCH_LINKEDIN:
      return {
        ...state,
        loading: true
      };
    case SEARCH_LINKEDIN_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        linkedinProfiles: getLinkedinProfiles(action.result.profiles, state.linkedinProfiles, action.newOrUpdate),
        totalCount: action.result.totalCount,
      };
    case SEARCH_LINKEDIN_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case CLEAN_LINKEDIN:
      return {
        ...state,
        linkedinProfiles: []
      };
    case DELETE_LINKEDIN:
      return {
        ...state,
        deleting: true,
        deleted: false,
      };
    case DELETE_LINKEDIN_SUCCESS:
      return {
        ...state,
        deleting: false,
        deleted: true,
        linkedinProfiles: getUnDeletedProfiles(state.linkedinProfiles, action.profile),
        totalCount: state.totalCount - 1
      };
    case DELETE_LINKEDIN_FAIL:
      return {
        ...state,
        deleting: false,
        deleted: false,
        deleteError: action.result
      };
    case SET_CANDIDATE_DATA:
      return {
        ...state,
        candidateData: action.data.candidateData,
        linkedinProfile: action.data.linkedinProfile,
        isLinkedinProfile: action.data.isLinkedinProfile
      };
    case CLEAN_SIMILAR_CANDIDATES:
      return {
        ...state,
        similarLinkedinProfiles: []
      };
    default:
      return state;
  }
}

export function loadLinkedinProfiles(filter) {
  filter.order = 'createdAt DESC';
  filter.where = {
    isDeleted: false
  };
  return {
    types: [LOAD_LINKEDIN, LOAD_LINKEDIN_SUCCESS, LOAD_LINKEDIN_FAIL],
    promise: ({ client }) =>
      client.get(`/SourcedProfiles?filter=${JSON.stringify(filter)}`)
  };
}

export function loadProfilesBySearch(filter, newOrUpdate) {
  filter.order = 'createdAt DESC';
  filter.where = {
    isDeleted: false
  };
  return {
    types: [SEARCH_LINKEDIN, SEARCH_LINKEDIN_SUCCESS, SEARCH_LINKEDIN_FAIL],
    newOrUpdate,
    promise: ({ client }) =>
      client.get(`/SourcedProfiles/search?filter=${JSON.stringify(filter)}`),
  };
}

export function getSimilarCandidate(filter) {
  return {
    types: [
      LOAD_SIMILAR_LINKEDIN,
      LOAD_SIMILAR_LINKEDIN_SUCCESS,
      LOAD_SIMILAR_LINKEDIN_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/resumes/checkDuplicate?filter=${JSON.stringify(filter)}`),
    filter
  };
}

export function cleanLinkedinProfiles() {
  return {
    types: [CLEAN_LINKEDIN],
    promise: new Promise()
  };
}

export function setCandidateData(data) {
  return {
    type: SET_CANDIDATE_DATA,
    data
  };
}

export function deleteLinkedinCandidate(profile) {
  return {
    types: [
      DELETE_LINKEDIN,
      DELETE_LINKEDIN_SUCCESS,
      DELETE_LINKEDIN_FAIL,
    ],
    promise: ({ client }) => client.del(`/SourcedProfiles/${profile.id}`),
    profile
  };
}

export function cleanSimilarProfiles() {
  return {
    type: CLEAN_SIMILAR_CANDIDATES,
  };
}
