import lodash from 'lodash';

const RESUME_UPLOAD = 'resume-parser/RESUME_UPLOAD';
const RESUME_UPLOAD_SUCCESS = 'resume-parser/RESUME_UPLOAD_SUCCESS';
const RESUME_UPLOAD_FAIL = 'resume-parser/RESUME_UPLOAD_FAIL';
const RESUME_JSON_UPLOAD = 'resume_JSON-parser/RESUME_JSON_UPLOAD';
const RESUME_JSON_UPLOAD_SUCCESS = 'resume_JSON-parser/RESUME_JSON_UPLOAD_SUCCESS';
const RESUME_JSON_UPLOAD_FAIL = 'resume_JSON-parser/RESUME_JSON_UPLOAD_FAIL';
const RESUME_DISCARD = 'resume_JSON-parser/RESUME_DISCARD';
const LOAD_PROFILE = 'resume_JSON-parser/LOAD_PROFILE';
const LOAD_PROFILE_SUCCESS = 'resume_JSON-parser/LOAD_PROFILE_SUCCESS';
const LOAD_PROFILE_TOEDIT_SUCCESS = 'resume_JSON-parser/LOAD_PROFILE_TOEDIT_SUCCESS';
const LOAD_PROFILE_FAIL = 'resume_JSON-parser/LOAD_PROFILE_FAIL';
const UPDATE_CANDIDATE = 'resume_JSON-parser/UPDATE_CANDIDATE';
const UPDATE_CANDIDATE_SUCCESS = 'resume_JSON-parser/UPDATE_CANDIDATE_SUCCESS';
const UPDATE_CANDIDATE_FAIL = 'resume_JSON-parser/UPDATE_CANDIDATE_FAIL';

const LOAD_CANDIDATE_TAGS = 'resume-parser/LOAD_CANDIDATE_TAGS';
const LOAD_CANDIDATE_TAGS_SUCCESS = 'resume-parser/LOAD_CANDIDATE_TAGS_SUCCESS';
const LOAD_CANDIDATE_TAGS_FAIL = 'resume-parser/LOAD_CANDIDATE_TAGS_FAIL';
const LOAD_TAGS = 'resume-parser/LOAD_TAGS';
const LOAD_TAGS_SUCCESS = 'resume-parser/LOAD_TAGS_SUCCESS';
const LOAD_TAGS_FAIL = 'resume-parser/LOAD_TAGS_FAIL';
const CREATE_CANDIDATE_TAG = 'resume-parser/CREATE_CANDIDATE_TAG';
const CREATE_CANDIDATE_TAG_SUCCESS = 'resume-parser/CREATE_CANDIDATE_TAG_SUCCESS';
const CREATE_CANDIDATE_TAG_FAIL = 'resume-parser/CREATE_CANDIDATE_TAG_FAIL';
const UPDATE_TAGS = 'resume-parser/UPDATE_TAGS';
const UPDATE_TAGS_SUCCESS = 'resume-parser/UPDATE_TAGS_SUCCESS';
const UPDATE_TAGS_FAIL = 'resume-parser/UPDATE_TAGS_FAIL';

const initialState = {
  resumeUploading: false,
  resumeUploaded: null,
  resumeJsonUploading: false,
  uploadResponse: null,
  updateResponse: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESUME_UPLOAD:
      return {
        ...state,
        resumeUploading: true
      };
    case RESUME_UPLOAD_SUCCESS:
      return {
        ...state,
        resumeUploading: false,
        resumeUploaded: true,
        uploadResponse: action.result
      };
    case RESUME_UPLOAD_FAIL:
      return {
        ...state,
        resumeUploading: false,
        resumeUploaded: false,
        error: action.error
      };
    case RESUME_DISCARD:
      return {
        ...state,
        uploadResponse: null
      };
    case RESUME_JSON_UPLOAD:
      return {
        ...state,
        resumeJsonUploading: true
      };
    case RESUME_JSON_UPLOAD_SUCCESS:
      return {
        ...state,
        resumeJsonUploading: false,
        resumeJsonUploaded: true,
        uploadResponse: action.result
      };
    case RESUME_JSON_UPLOAD_FAIL:
      return {
        ...state,
        resumeJsonUploading: false,
        resumeJsonUploaded: false,
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
        resume: action.result.hits.hits
      };
    case LOAD_PROFILE_TOEDIT_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        resume: action
      };
    case LOAD_PROFILE_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case UPDATE_CANDIDATE:
      return {
        ...state,
        loading: true,
        updateCandidateloading: true
      };
    case UPDATE_CANDIDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        updateCandidateloading: false,
        updateCandidateloaded: true,
        updateResponse: action.result
      };
    case UPDATE_CANDIDATE_FAIL:
      return {
        ...state,
        loading: false,
        updateCandidateloading: false,
        updateCandidateloaded: false,
        error: action.error
      };
    case CREATE_CANDIDATE_TAG:
    case LOAD_CANDIDATE_TAGS:
    case LOAD_TAGS:
      return {
        ...state,
        candidateTagloading: true,
        candidateTagloaded: false
      };
    case LOAD_CANDIDATE_TAGS_SUCCESS:
      return {
        ...state,
        candidateTagloaded: false,
        candidateTagloading: false,
        candidateTags: action.result
      };
    case LOAD_TAGS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        candidateTags: [...state.candidateTags, ...action.result]
      };
    case CREATE_CANDIDATE_TAG_SUCCESS: {
      return {
        ...state,
        candidateTags: [...state.candidateTags, action.result]
      };
    }
    case CREATE_CANDIDATE_TAG_FAIL:
    case LOAD_CANDIDATE_TAGS_FAIL:
    case LOAD_TAGS_FAIL:
      return {
        ...state,
        candidateTagloaded: false,
        candidateTagloading: false
      };
    default:
      return state;
  }
}

/*
* Actions
* * * * */
export function uploadResume(fileObj) {
  return {
    types: [RESUME_UPLOAD, RESUME_UPLOAD_SUCCESS, RESUME_UPLOAD_FAIL],
    promise: ({ client }) => client.post('/documents/resumeParser',
      { data: fileObj, unsetContentType: 1 })
  };
}

export function discardResumeData() {
  return {
    type: RESUME_DISCARD
  };
}

export function sendResumeJson(jsonData) {
  return {
    types: [RESUME_JSON_UPLOAD, RESUME_JSON_UPLOAD_SUCCESS, RESUME_JSON_UPLOAD_FAIL],
    promise: ({ client }) => client.post('/resumes/saveCandidate', { data: jsonData })
  };
}

export function updateCandidate(id, jsonData) {
  return {
    types: [UPDATE_CANDIDATE, UPDATE_CANDIDATE_SUCCESS, UPDATE_CANDIDATE_FAIL],
    promise: ({ client }) => client.post(`/resumes/updateCandidate/${id}`, { data: jsonData })
  };
}

export function loadCandidateById(id) {
  return {
    types: [LOAD_PROFILE, LOAD_PROFILE_SUCCESS, LOAD_PROFILE_FAIL],
    promise: ({ client }) => client.post(`/resumes/${id}`)
  };
}

export function loadCandidateByIdToEdit(id) {
  return {
    types: [LOAD_PROFILE, LOAD_PROFILE_TOEDIT_SUCCESS, LOAD_PROFILE_FAIL],
    promise: ({ client }) => client.post(`/resumes/getResumeByIdToEdit/${id}`, { data: { resumeId: id } })
  };
}

export const getCandidateTags = obj => {
  const data = {
    searchTerm: obj.searchTerm.trim(),
    tagType: 'candidate',
    skip: obj.skip,
    limit: obj.limit ? obj.limit : 10
  };
  if (obj.skip === 0) {
    return {
      types: [LOAD_CANDIDATE_TAGS, LOAD_CANDIDATE_TAGS_SUCCESS, LOAD_CANDIDATE_TAGS_FAIL],
      promise: ({ client }) => client.post('/resumes/listTags', { data })
    };
  }
  return {
    types: [LOAD_TAGS, LOAD_TAGS_SUCCESS, LOAD_TAGS_FAIL],
    promise: ({ client }) => client.post('/resumes/listTags', { data })
  };
};

export const createCandidateTags = data => (
  {
    types: [CREATE_CANDIDATE_TAG, CREATE_CANDIDATE_TAG_SUCCESS, CREATE_CANDIDATE_TAG_FAIL],
    promise: ({ client }) => client.post('/resumes/createCandidateTag', { data })
  }
);

export const updateCandidateTags = data => {
  const { tags } = data;
  data.tags = lodash.map(tags, 'id');
  return {
    types: [UPDATE_TAGS, UPDATE_TAGS_SUCCESS, UPDATE_TAGS_FAIL],
    promise: ({ client }) => client.post('/resumes/update/tag', { data })
  };
};
