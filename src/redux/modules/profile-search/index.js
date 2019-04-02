import parser from '../Parser';
import openingResolver from '../openings/openingResolver';

const LOAD_PROFILES = 'profile-search/LOAD_PROFILES';
const LOAD_PROFILES_SUCCESS = 'profile-search/LOAD_PROFILES_SUCCESS';
const LOAD_PROFILES_FAIL = 'profile-search/LOAD_PROFILES_FAIL';
const LOAD_PROFILE = 'profile-search/LOAD_PROFILE';
const LOAD_PROFILE_SUCCESS = 'profile-search/LOAD_PROFILE_SUCCESS';
const LOAD_PROFILE_FAIL = 'profile-search/LOAD_PROFILE_FAIL';
const LOAD_PROFILE_SCORE = 'profile-search/LOAD_PROFILE_SCORE';
const LOAD_PROFILE_SCORE_SUCCESS = 'profile-search/LOAD_PROFILE_SCORE_SUCCESS';
const LOAD_PROFILE_SCORE_FAIL = 'profile-search/LOAD_PROFILE_SCORE_FAIL';
const OPEN_SAVE_OPENING_MODAL = 'profile-search/OPEN_SAVE_OPENING_MODAL';
const CLOSE_SAVE_OPENING_MODAL = 'profile-search/CLOSE_SAVE_OPENING_MODAL';
const OPEN_SAVE_SEARCH_MODAL = 'profile-search/OPEN_SAVE_SEARCH_MODAL';
const CLOSE_SAVE_SEARCH_MODAL = 'profile-search/CLOSE_SAVE_SEARCH_MODAL';
const OPEN_LOAD_SEARCH_MODAL = 'profile-search/OPEN_LOAD_SEARCH_MODAL';
const CLOSE_LOAD_SEARCH_MODAL = 'profile-search/CLOSE_LOAD_SEARCH_MODAL';
const SAVE_NEW_SEARCH = 'profile-search/SAVE_NEW_SEARCH';
const SAVE_NEW_SEARCH_SUCCESS = 'profile-search/SAVE_NEW_SEARCH_SUCCESS';
const SAVE_NEW_SEARCH_FAIL = 'profile-search/SAVE_NEW_SEARCH_FAIL';
const SAVE_EDITED_SEARCH = 'profile-search/SAVE_EDITED_SEARCH';
const SAVE_EDITED_SEARCH_SUCCESS = 'profile-search/SAVE_EDITED_SEARCH_SUCCESS';
const SAVE_EDITED_SEARCH_FAIL = 'profile-search/SAVE_EDITED_SEARCH_FAIL';
const LOAD_SAVED_SEARCH = 'profile-search/LOAD_SAVED_SEARCH';
const LOAD_SAVED_SEARCH_SUCCESS = 'profile-search/LOAD_SAVED_SEARCH_SUCCESS';
const LOAD_SAVED_SEARCH_FAIL = 'profile-search/LOAD_SAVED_SEARCH_FAIL';
const LOAD_SAVED_SEARCH_BYID = 'profile-search/LOAD_SAVED_SEARCH_BYID';
const LOAD_SAVED_SEARCH_BYID_SUCCESS = 'profile-search/LOAD_SAVED_SEARCH_BYID_SUCCESS';
const LOAD_SAVED_SEARCH_BYID_FAIL = 'profile-search/LOAD_SAVED_SEARCH_BYID_FAIL';
const RESET_SAVED_SEARCH_BYID = 'profile-search/RESET_SAVED_SEARCH_BYID';
const DELETE_SAVED_SEARCH = 'profile-search/DELETE_SAVED_SEARCH';
const DELETE_SAVED_SEARCH_SUCCESS = 'profile-search/DELETE_SAVED_SEARCH_SUCCESS';
const DELETE_SAVED_SEARCH_FAIL = 'profile-search/DELETE_SAVED_SEARCH_FAIL';
const LOAD_LOCATIONS = 'profile-search/LOAD_LOCATIONS';
const LOAD_LOCATIONS_SUCCESS = 'profile-search/LOAD_LOCATIONS_SUCCESS';
const LOAD_LOCATIONS_FAIL = 'profile-search/LOAD_LOCATIONS_FAIL';
const LOAD_POSITIONS = 'profile-search/LOAD_POSITIONS';
const LOAD_POSITIONS_SUCCESS = 'profile-search/LOAD_POSITIONS_SUCCESS';
const LOAD_POSITIONS_FAIL = 'profile-search/LOAD_POSITIONS_FAIL';
const LOAD_SKILLS = 'profile-search/LOAD_SKILLS';
const LOAD_SKILLS_SUCCESS = 'profile-search/LOAD_SKILLS_SUCCESS';
const LOAD_SKILLS_FAIL = 'profile-search/LOAD_SKILLS_FAIL';

const LOAD_NATIONALITY = 'profile-search/LOAD_NATIONALITY';
const LOAD_NATIONALITY_SUCCESS = 'profile-search/LOAD_NATIONALITY_SUCCESS';
const LOAD_NATIONALITY_FAIL = 'profile-search/LOAD_NATIONALITY_FAIL';

const LOAD_COMPANIES = 'profile-search/LOAD_COMPANIES';
const LOAD_COMPANIES_SUCCESS = 'profile-search/LOAD_COMPANIES_SUCCESS';
const LOAD_COMPANIES_FAIL = 'profile-search/LOAD_COMPANIES_FAIL';
const LOAD_LANGUAGES = 'profile-search/LOAD_LANGUAGES';
const LOAD_LANGUAGES_SUCCESS = 'profile-search/LOAD_LANGUAGES_SUCCESS';
const LOAD_LANGUAGES_FAIL = 'profile-search/LOAD_LANGUAGES_FAIL';

const SAVE_PROFILE_JOB = 'openings/SAVE_PROFILE_JOB';
const SAVE_PROFILE_JOB_SUCCESS = 'openings/SAVE_PROFILE_JOB_SUCCESS';
const SAVE_PROFILE_JOB_FAIL = 'openings/SAVE_PROFILE_JOB_FAIL';

const REMOVE_OPENING = 'openings/REMOVE_OPENING';
const REMOVE_OPENING_SUCCESS = 'openings/REMOVE_OPENING_SUCCESS';
const REMOVE_OPENING_FAIL = 'openings/REMOVE_OPENING_FAIL';

const LOAD_OPENINGS = 'profile-activity/LOAD_OPENINGS';
const LOAD_OPENINGS_SUCCESS = 'profile-activity/LOAD_OPENINGS_SUCCESS';
const LOAD_OPENINGS_FAIL = 'profile-activity/LOAD_OPENINGS_FAIL';

const CLEAR_ALL_PROFILES = 'profile-search/CLEAR_ALL_PROFILES';

const EDIT_SAVED_SEARCH = 'profile-search/EDIT_SAVED_SEARCH';
const EDIT_SAVED_SEARCH_SUCCESS = 'profile-search/EDIT_SAVED_SEARCH_SUCCESS';
const EDIT_SAVED_SEARCH_FAIL = 'profile-search/EDIT_SAVED_SEARCH_FAIL';

// const LOAD_KEYWORD = 'profile-search/LOAD_KEYWORD';
// const LOAD_KEYWORD_SUCCESS = 'profile-search/LOAD_KEYWORD_SUCCESS';
// const LOAD_KEYWORD_FAIL = 'profile-search/LOAD_KEYWORD_FAIL';

const initialState = {
  loadingProfiles: false,
  loadedProfiles: false,
  loading: true,
  loaded: false,
  saving: null,
  saved: null,
  jobId: null,
  profileScore: []
};
let deletedjobId = '';

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_PROFILES:
      return {
        ...state,
        loadingProfiles: true
      };
    case LOAD_PROFILES_SUCCESS:
      return {
        ...state,
        loadingProfiles: false,
        loadedProfiles: true,
        totalCount: action.result.total,
        list: action.result.data
      };
    case LOAD_PROFILES_FAIL:
      return {
        ...state,
        loadingProfiles: false,
        loadedProfiles: false,
        list: [],
        error: action.error
      };
    case LOAD_PROFILE:
      return {
        ...state,
        loading: true
      };
    case LOAD_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        resume: action.result.data.length ? action.result.data[0] : null
      };
    case LOAD_PROFILE_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_PROFILE_SCORE:
      return {
        ...state,
        loadingScore: true
      };
    case LOAD_PROFILE_SCORE_SUCCESS:
      return {
        ...state,
        loadingScore: false,
        loadedScore: true,
        profileScore: action.result
      };
    case LOAD_PROFILE_SCORE_FAIL:
      return {
        ...state,
        loadingScore: false,
        loadedScore: false,
        error: action.error
      };
    case OPEN_SAVE_OPENING_MODAL:
      return {
        ...state,
        openOpeningModal: true,
        saved: false
      };
    case CLOSE_SAVE_OPENING_MODAL:
      return {
        ...state,
        openOpeningModal: false,
        saved: false
      };
    case OPEN_SAVE_SEARCH_MODAL:
      return {
        ...state,
        openSearchModal: true,
        saved: false
      };
    case CLOSE_SAVE_SEARCH_MODAL:
      return {
        ...state,
        openSearchModal: false,
        saved: false
      };
    case SAVE_NEW_SEARCH:
      return {
        ...state,
        loading: true,
        loaded: false,
        saved: false
      };
    case SAVE_NEW_SEARCH_SUCCESS:
      return {
        ...state,
        loaded: true,
        loading: false,
        searchSaved: true,
      };
    case SAVE_NEW_SEARCH_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case SAVE_EDITED_SEARCH:
      return {
        ...state,
        loading: true,
        loaded: false,
        saved: false
      };
    case SAVE_EDITED_SEARCH_SUCCESS:
      return {
        ...state,
        loaded: true,
        loading: false,
        searchSaved: true,
      };
    case SAVE_EDITED_SEARCH_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case OPEN_LOAD_SEARCH_MODAL:
      return {
        ...state,
        openLoadSearchModal: true,
        saved: false
      };
    case CLOSE_LOAD_SEARCH_MODAL:
      return {
        ...state,
        openLoadSearchModal: false,
        saved: false
      };
    case LOAD_SAVED_SEARCH:
      return {
        ...state,
        searchLoading: true
      };
    case LOAD_SAVED_SEARCH_SUCCESS:
      return {
        ...state,
        searchLoading: false,
        loaded: true,
        searchList: action.result
      };
    case LOAD_SAVED_SEARCH_FAIL:
      return {
        ...state,
        searchLoading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_SAVED_SEARCH_BYID:
      return {
        ...state,
        loading: true
      };
    case LOAD_SAVED_SEARCH_BYID_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        selectedSearch: action.result
      };
    case LOAD_SAVED_SEARCH_BYID_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case RESET_SAVED_SEARCH_BYID:
      return {
        ...state,
        loading: false,
        loaded: true,
        selectedSearch: null
      };
    case DELETE_SAVED_SEARCH:
      return {
        ...state,
        loading: true
      };
    case DELETE_SAVED_SEARCH_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case DELETE_SAVED_SEARCH_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_LOCATIONS:
      return {
        ...state,
        loading: true
      };
    case LOAD_LOCATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        locationList: action.result.data
      };
    case LOAD_LOCATIONS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_POSITIONS:
      return {
        ...state,
        loading: true
      };
    case LOAD_POSITIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        positionList: action.result.data
      };
    case LOAD_POSITIONS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_SKILLS:
      return {
        ...state,
        loading: true
      };
    case LOAD_SKILLS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        skillList: action.result.data
      };
    case LOAD_SKILLS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_COMPANIES:
      return {
        ...state,
        loading: true
      };
    case LOAD_COMPANIES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        companyList: action.result.data
      };
    case LOAD_COMPANIES_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_LANGUAGES:
      return {
        ...state,
        loading: true
      };
    case LOAD_LANGUAGES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        languageList: action.result.data
      };
    case LOAD_LANGUAGES_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_OPENINGS:
      return {
        ...state,
        openingLoading: true
      };
    case LOAD_OPENINGS_SUCCESS:
      return {
        ...state,
        openingLoading: false,
        openingLoaded: true,
        openingList: action.result.response,
        totalCount: action.result.totalCount
      };
    case LOAD_OPENINGS_FAIL:
      return {
        ...state,
        openingLoading: false,
        openingLoaded: false,
        error: action.error
      };
    case REMOVE_OPENING:
      return {
        ...state,
        removingOpening: true,
      };
    case REMOVE_OPENING_SUCCESS:
      return {
        ...state,
        openingRemoved: true,
        removingOpening: false,
        resume: openingResolver.removeJobIdFromSelectedProfile(state, deletedjobId)
      };
    case REMOVE_OPENING_FAIL:
      return {
        ...state,
        openingRemoved: false,
        removingOpening: false
      };
    case SAVE_PROFILE_JOB:
      return {
        ...state,
        selectingOpening: true
      };
    case SAVE_PROFILE_JOB_SUCCESS:
      return {
        ...state,
        selectingOpening: false,
        openingSelected: true,
        resume: openingResolver.addJobIdWithSelectedProfile(state, action.result)
      };
    case SAVE_PROFILE_JOB_FAIL:
      return {
        ...state,
        openingSelected: false,
        selectingOpening: false,
        saving: false,
        jobProfileSaveError: action.error
      };
    case LOAD_NATIONALITY:
      return {
        ...state,
        loading: true
      };
    case LOAD_NATIONALITY_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        nationalityList: parser.parseNationality(action.result.data)
      };
    case LOAD_NATIONALITY_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };

    case CLEAR_ALL_PROFILES:
      return {
        ...state,
        totalCount: 0,
        list: []
      };
    case EDIT_SAVED_SEARCH:
      return {
        ...state,
        loading: true
      };
    case EDIT_SAVED_SEARCH_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case EDIT_SAVED_SEARCH_FAIL:
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
export function load(query) {
  return {
    types: [LOAD_PROFILES, LOAD_PROFILES_SUCCESS, LOAD_PROFILES_FAIL],
    promise: ({ client }) => client.post('/profiles/match',
      { data: query })
  };
}
/*
* Actions
* * * * */
export function loadProfileByResumeId(id) {
  return {
    types: [LOAD_PROFILES, LOAD_PROFILES_SUCCESS, LOAD_PROFILES_FAIL],
    promise: ({ client }) => client.post('/profiles/search',
      { data: id })
  };
}

export function loadProfileById(query) {
  return {
    types: [LOAD_PROFILE, LOAD_PROFILE_SUCCESS, LOAD_PROFILE_FAIL],
    promise: ({ client }) => client.post(`/resumes/${query.resumeId}`,
      { data: query })
  };
}


export function loadProfileScoreById(query) {
  return {
    types: [LOAD_PROFILE_SCORE, LOAD_PROFILE_SCORE_SUCCESS, LOAD_PROFILE_SCORE_FAIL],
    promise: ({ client }) => client.post('/profiles/score',
      { data: query })
  };
}

export function openSaveOpeningModal() {
  return {
    type: OPEN_SAVE_OPENING_MODAL
  };
}

export function closeSaveOpeningModal() {
  return {
    type: CLOSE_SAVE_OPENING_MODAL
  };
}

export function openSaveSearchModal() {
  return {
    type: OPEN_SAVE_SEARCH_MODAL
  };
}

export function closeSaveSearchModal() {
  return {
    type: CLOSE_SAVE_SEARCH_MODAL
  };
}

export function saveNewSearch(jobSearchData) {
  return {
    types: [SAVE_NEW_SEARCH, SAVE_NEW_SEARCH_SUCCESS, SAVE_NEW_SEARCH_FAIL],
    promise: ({ client }) => client.post('/profileSearches/save',
      { data: jobSearchData })
  };
}

export function saveEditedSearch(jobSearchData) {
  return {
    types: [SAVE_EDITED_SEARCH, SAVE_EDITED_SEARCH_SUCCESS, SAVE_EDITED_SEARCH_FAIL],
    promise: ({ client }) => client.put('/profileSearches/update',
      { data: jobSearchData })
  };
}

export function openLoadSearchModal() {
  return {
    type: OPEN_LOAD_SEARCH_MODAL
  };
}

export function closeLoadSearchModal() {
  return {
    type: CLOSE_LOAD_SEARCH_MODAL
  };
}

export function resetSavedSearch() {
  return {
    type: RESET_SAVED_SEARCH_BYID
  };
}

export function loadSavedSearch(param) {
  return {
    types: [LOAD_SAVED_SEARCH, LOAD_SAVED_SEARCH_SUCCESS, LOAD_SAVED_SEARCH_FAIL],
    promise: ({ client }) => client.get(`/profileSearches/list?filter=${JSON.stringify(param)}`)
  };
}

export function loadFilterBySearchId(searchId) {
  return {
    types: [LOAD_SAVED_SEARCH_BYID, LOAD_SAVED_SEARCH_BYID_SUCCESS, LOAD_SAVED_SEARCH_BYID_FAIL],
    promise: ({ client }) => client.get(`/profileSearches/list/${searchId}`)
  };
}

export function deleteSavedSearch(searchId) {
  return {
    types: [DELETE_SAVED_SEARCH, DELETE_SAVED_SEARCH_SUCCESS, DELETE_SAVED_SEARCH_FAIL],
    promise: ({ client }) => client.del(`/profileSearches/${searchId}`)
  };
}


export function loadLocations(param) {
  const query = {
    searchParam: encodeURIComponent(param),
    scope: 'location'
  };
  return {
    types: [LOAD_LOCATIONS, LOAD_LOCATIONS_SUCCESS, LOAD_LOCATIONS_FAIL],
    promise: ({ client }) => client.get(`/locations/search?filter=${JSON.stringify(query)}`)
  };
}

export function loadPositions(param) {
  const query = {
    searchParam: encodeURIComponent(param)
  };
  return {
    types: [LOAD_POSITIONS, LOAD_POSITIONS_SUCCESS, LOAD_POSITIONS_FAIL],
    promise: ({ client }) => client.get(`/positions/search?filter=${JSON.stringify(query)}`)
  };
}


export function loadSkills(param) {
  const query = {
    searchParam: encodeURIComponent(param)
  };
  // if (param && param.indexOf('#') > -1) {
  //   param = param.replace('#', '%23');
  // }
  return {
    types: [LOAD_SKILLS, LOAD_SKILLS_SUCCESS, LOAD_SKILLS_FAIL],
    promise: ({ client }) => client.get(`/skills/search?filter=${JSON.stringify(query)}`)
  };
}

export function loadCompanies(param) {
  const query = {
    searchParam: encodeURIComponent(param)
  };
  return {
    types: [LOAD_COMPANIES, LOAD_COMPANIES_SUCCESS, LOAD_COMPANIES_FAIL],
    promise: ({ client }) => client.get(`/companies/search?filter=${JSON.stringify(query)}`)
  };
}

export function loadLanguages(param) {
  const query = {
    searchParam: encodeURIComponent(param)
  };
  return {
    types: [LOAD_LANGUAGES, LOAD_LANGUAGES_SUCCESS, LOAD_LANGUAGES_FAIL],
    promise: ({ client }) => client.get(`/languages/search?filter=${JSON.stringify(query)}`)
  };
}

export function fetchProfileJob(query) {
  return {
    types: [LOAD_OPENINGS, LOAD_OPENINGS_SUCCESS, LOAD_OPENINGS_FAIL],
    promise: ({ client }) => client.get(`jobProfiles/getJobOpening?filter=${JSON.stringify(query)}`)
  };
}

export function removeJobFromProfile(resumeId, jobId) {
  deletedjobId = jobId;
  return {
    types: [
      REMOVE_OPENING, REMOVE_OPENING_SUCCESS, REMOVE_OPENING_FAIL
    ],
    promise: ({ client }) => client.del(`/jobProfiles/deselect?jobId=${jobId}&resumeId=${resumeId}`)
  };
}

export function saveProfileJob(jobProfileData) {
  return {
    types: [SAVE_PROFILE_JOB, SAVE_PROFILE_JOB_SUCCESS, SAVE_PROFILE_JOB_FAIL],
    promise: ({ client }) => client.post('/jobProfiles/select',
      { data: jobProfileData })
  };
}

export function loadNationality(param) {
  const query = {
    searchParam: encodeURIComponent(param)
  };
  return {
    types: [LOAD_NATIONALITY, LOAD_NATIONALITY_SUCCESS, LOAD_NATIONALITY_FAIL],
    promise: ({ client }) => client.get(`/profiles/searchNationality?filter=${JSON.stringify(query)}`)
  };
}

export function clearAllProfiles() {
  return {
    type: CLEAR_ALL_PROFILES
  };
}

export function editSavedSearch(data) {
  return {
    types: [EDIT_SAVED_SEARCH, EDIT_SAVED_SEARCH_SUCCESS, EDIT_SAVED_SEARCH_FAIL],
    promise: ({ client }) => client.put('profileSearches/rename', { data })
  };
}

// export function loadKeywords(searchParam, type) {
//   const query = {
//     searchParam: encodeURIComponent(searchParam),
//     scope: type
//   };
//   return {
//     types: [LOAD_KEYWORD, LOAD_KEYWORD_SUCCESS, LOAD_KEYWORD_FAIL],
//     promise: ({ client }) => client.get(`/skills/search?filter=${JSON.stringify(query)}`)
//   };
// }
