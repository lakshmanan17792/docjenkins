const CANDIDATE_FILE_UPLOAD = 'files/CANDIDATE_FILE_UPLOAD';
const CANDIDATE_FILE_UPLOAD_SUCCESS = 'files/CANDIDATE_FILE_UPLOAD_SUCCESS';
const CANDIDATE_FILE_UPLOAD_FAIL = 'files/CANDIDATE_FILE_UPLOAD_FAIL';
const CANDIDATE_FILES_FETCH = 'files/CANDIDATE_FILES_FETCH';
const CANDIDATE_FILES_FETCH_SUCCESS = 'files/CANDIDATE_FILES_FETCH_SUCCESS';
const CANDIDATE_FILES_FETCH_FAIL = 'files/CANDIDATE_FILES_FETCH_FAIL';
const CANDIDATE_FILES_DOWNLOAD = 'files/CANDIDATE_FILES_DOWNLOAD';
const CANDIDATE_FILES_DOWNLOAD_SUCCESS = 'files/CANDIDATE_FILES_DOWNLOAD_SUCCESS';
const CANDIDATE_FILES_DOWNLOAD_FAIL = 'files/CANDIDATE_FILES_DOWNLOAD_FAIL';
const DELETE_FILES = 'files/DELETE_FILES';
const DELETE_FILES_SUCCESS = 'files/DELETE_FILES_SUCCESS';
const DELETE_FILES_FAIL = 'files/DELETE_FILES_FAIL';

const initialState = {
  uploading: false,
  uploaded: false,
  fetching: false,
  fetched: null,
  downloading: false,
  downloaded: false,
  files: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CANDIDATE_FILE_UPLOAD:
      return {
        ...state,
        uploading: true,
        uploaded: false
      };
    case CANDIDATE_FILE_UPLOAD_SUCCESS:
      return {
        ...state,
        uploading: false,
        uploaded: true
      };
    case CANDIDATE_FILE_UPLOAD_FAIL:
      return {
        ...state,
        uploading: false,
        uploaded: false
      };
    case CANDIDATE_FILES_FETCH:
      return {
        ...state,
        fetching: true,
        fetched: false
      };
    case CANDIDATE_FILES_FETCH_SUCCESS:
      return {
        ...state,
        files: action.result,
        fetching: false,
        fetched: true
      };
    case CANDIDATE_FILES_FETCH_FAIL:
      return {
        ...state,
        fetching: false,
        fetched: false
      };
    case CANDIDATE_FILES_DOWNLOAD:
      return {
        ...state,
        downloading: true,
        downloaded: false
      };
    case CANDIDATE_FILES_DOWNLOAD_SUCCESS:
      return {
        ...state,
        downloading: false,
        downloaded: true
      };
    case CANDIDATE_FILES_DOWNLOAD_FAIL:
      return {
        ...state,
        downloading: false,
        downloaded: false
      };
    case DELETE_FILES:
      return {
        ...state,
        deleting: true,
        deleted: false
      };
    case DELETE_FILES_SUCCESS:
      return {
        ...state,
        deleting: false,
        deleted: true
      };
    case DELETE_FILES_FAIL:
      return {
        ...state,
        deleting: false,
        deleted: false
      };
    default:
      return state;
  }
}

export function uploadCandidateFile({ id, file }) {
  return {
    types: [
      CANDIDATE_FILE_UPLOAD, CANDIDATE_FILE_UPLOAD_SUCCESS, CANDIDATE_FILE_UPLOAD_FAIL
    ],
    promise: ({ client }) => client.post(`/documents/upload/candidate-file?id=${id}`,
      { data: file, unsetContentType: 1 })
  };
}

export function fetchCandidateFiles(id) {
  return {
    types: [
      CANDIDATE_FILES_FETCH, CANDIDATE_FILES_FETCH_SUCCESS, CANDIDATE_FILES_FETCH_FAIL
    ],
    promise: ({ client }) => client.get(`/documents/candidate-file/${id}`)
  };
}

export function downloadCandidateFile(id) {
  return {
    types: [
      CANDIDATE_FILES_DOWNLOAD, CANDIDATE_FILES_DOWNLOAD_SUCCESS, CANDIDATE_FILES_DOWNLOAD_FAIL
    ],
    promise: ({ client }) => client.get(`/documents/download/${id}`)
  };
}

export function deleteFile(id) {
  const data = {
    ids: id
  };
  return {
    types: [
      DELETE_FILES, DELETE_FILES_SUCCESS, DELETE_FILES_FAIL
    ],
    promise: ({ client }) => client.post('/documents/delete', { data })
  };
}
