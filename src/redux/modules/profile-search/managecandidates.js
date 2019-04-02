import candidateResolver from './candidateResolver';

const LOAD_ARCHIVAL_REASONS = 'manage-candidates/LOAD_ARCHIVAL_REASONS';
const LOAD_ARCHIVAL_REASONS_SUCCESS = 'manage-candidates/LOAD_ARCHIVAL_REASONS_SUCCESS';
const LOAD_ARCHIVAL_REASONS_FAIL = 'manage-candidates/LOAD_ARCHIVAL_REASONS_FAIL';

const ISARCHIVABLE = 'manage-candidates/ISARCHIVABLE';
const ISARCHIVABLE_SUCCESS = 'manage-candidates/ISARCHIVABLE_SUCCESS';
const ISARCHIVABLE_FAIL = 'manage-candidates/ISARCHIVABLE_FAIL';

const ARCHIVE_CANDIDATE = 'manage-candidates/ARCHIVE_CANDIDATE';
const ARCHIVE_CANDIDATE_SUCCESS = 'manage-candidates/ARCHIVE_CANDIDATE_SUCCESS';
const ARCHIVE_CANDIDATE_FAIL = 'manage-candidates/ARCHIVE_CANDIDATE_FAIL';

const UNARCHIVE_CANDIDATE = 'manage-candidates/UNARCHIVE_CANDIDATE';
const UNARCHIVE_CANDIDATE_SUCCESS = 'manage-candidates/UNARCHIVE_CANDIDATE_SUCCESS';
const UNARCHIVE_CANDIDATE_FAIL = 'manage-candidates/UNARCHIVE_CANDIDATE_FAIL';

const LOAD_ARCHIVED_CANDIDATES = 'manage-candidates/LOAD_ARCHIVED_CANDIDATES';
const LOAD_ARCHIVED_CANDIDATES_SUCCESS = 'manage-candidates/LOAD_ARCHIVED_CANDIDATES_SUCCESS';
const LOAD_ARCHIVED_CANDIDATES_FAIL = 'manage-candidates/LOAD_ARCHIVED_CANDIDATES_FAIL';

const TO_BE_UNARCHIVED_CANDIDATES = 'manage-candidates/TO_BE_UNARCHIVED_CANDIDATES';
const TO_BE_UNARCHIVED_CANDIDATES_SUCCESS = 'manage-candidates/TO_BE_UNARCHIVED_CANDIDATES_SUCCESS';
const TO_BE_UNARCHIVED_CANDIDATES_FAIL = 'manage-candidates/TO_BE_UNARCHIVED_CANDIDATES_FAIL';

const TO_BE_DELETED_CANDIDATES = 'manage-candidates/TO_BE_DELETED_CANDIDATES';
const TO_BE_DELETED_CANDIDATES_SUCCESS = 'manage-candidates/TO_BE_DELETED_CANDIDATES_SUCCESS';
const TO_BE_DELETED_CANDIDATES_FAIL = 'manage-candidates/TO_BE_DELETED_CANDIDATES_FAIL';

const UNARCHIVE_ARCHIVED_CANDIDATE = 'manage-candidates/UNARCHIVE_ARCHIVED_CANDIDATE';
const UNARCHIVE_ARCHIVED_CANDIDATE_SUCCESS = 'manage-candidates/UNARCHIVE_ARCHIVED_CANDIDATE_SUCCESS';
const UNARCHIVE_ARCHIVED_CANDIDATE_FAIL = 'manage-candidates/UNARCHIVE_ARCHIVED_CANDIDATE_FAIL';

const UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE = 'manage-candidates/UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE';
const UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE_SUCCESS = 'manage-candidates/UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE_SUCCESS';
const UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE_FAIL = 'manage-candidates/UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE_FAIL';

const LOAD_ARCHIVE_CANDIDATE_DATA = 'manage-candidates/LOAD_ARCHIVE_CANDIDATE_DATA';
const LOAD_ARCHIVE_CANDIDATE_DATA_SUCCESS = 'manage-candidates/LOAD_ARCHIVE_CANDIDATE_DATA_SUCCESS';
const LOAD_ARCHIVE_CANDIDATE_DATA_FAIL = 'manage-candidates/LOAD_ARCHIVE_CANDIDATE_DATA_FAIL';

const EXTEND_ARCHIVE_CANDIDATE = 'manage-candidates/EXTEND_ARCHIVE_CANDIDATE';
const EXTEND_ARCHIVE_CANDIDATE_SUCCESS = 'manage-candidates/EXTEND_ARCHIVE_CANDIDATE_SUCCESS';
const EXTEND_ARCHIVE_CANDIDATE_FAIL = 'manage-candidates/EXTEND_ARCHIVE_CANDIDATE_FAIL';

const EXTEND_ARCHIVED_CANDIDATE = 'manage-candidates/EXTEND_ARCHIVED_CANDIDATE';
const EXTEND_ARCHIVED_CANDIDATE_SUCCESS = 'manage-candidates/EXTEND_ARCHIVED_CANDIDATE_SUCCESS';
const EXTEND_ARCHIVED_CANDIDATE_FAIL = 'manage-candidates/EXTEND_ARCHIVED_CANDIDATE_FAIL';

const LOAD_DELETE_REASONS = 'manage-candidates/LOAD_DELETE_REASONS';
const LOAD_DELETE_REASONS_SUCCESS = 'manage-candidates/LOAD_DELETE_REASONS_SUCCESS';
const LOAD_DELETE_REASONS_FAIL = 'manage-candidates/LOAD_DELETE_REASONS_FAIL';

const INITIATE_DELETE_CANDIDATE = 'manage-candidates/INITIATE_DELETE_CANDIDATE';
const INITIATE_DELETE_CANDIDATE_SUCCESS = 'manage-candidates/INITIATE_DELETE_CANDIDATE_SUCCESS';
const INITIATE_DELETE_CANDIDATE_FAIL = 'manage-candidates/INITIATE_DELETE_CANDIDATE_FAIL';

const LOAD_DELETE_INITIATED_CANDIDATES = 'manage-candidates/LOAD_DELETE_INITIATED_CANDIDATES';
const LOAD_DELETE_INITIATED_CANDIDATES_SUCCESS = 'manage-candidates/LOAD_DELETE_INITIATED_CANDIDATES_SUCCESS';
const LOAD_DELETE_INITIATED_CANDIDATES_FAIL = 'manage-candidates/LOAD_DELETE_INITIATED_CANDIDATES_FAIL';

const LOAD_APPROVER_STATUS_LIST = 'manage-candidates/LOAD_APPROVER_STATUS_LIST';
const LOAD_APPROVER_STATUS_LIST_SUCCESS = 'manage-candidates/LOAD_APPROVER_STATUS_LIST_SUCCESS';
const LOAD_APPROVER_STATUS_LIST_FAIL = 'manage-candidates/LOAD_APPROVER_STATUS_LIST_FAIL';

const APPROVE_FOR_DELETION = 'manage-candidates/APPROVE_FOR_DELETION';
const APPROVE_FOR_DELETION_SUCCESS = 'manage-candidates/APPROVE_FOR_DELETION_SUCCESS';
const APPROVE_FOR_DELETION_FAIL = 'manage-candidates/APPROVE_FOR_DELETION_FAIL';

const REJECT_FOR_DELETION = 'manage-candidates/REJECT_FOR_DELETION';
const REJECT_FOR_DELETION_SUCCESS = 'manage-candidates/REJECT_FOR_DELETION_SUCCESS';
const REJECT_FOR_DELETION_FAIL = 'manage-candidates/REJECT_FOR_DELETION_FAIL';

const initialState = {
  loadingArchivalReasons: false,
  archivalReasons: [],
  archivedCandidates: [],
  archivedTotalCount: 0,
  loadingArchivedCandidates: false,
  toBeUnarchivedCandidates: [],
  toBeUnarchivedTotalCount: 0,
  loadingToBeUnarchivedCandidates: false,
  toBeDeletedCandidates: [],
  toBeDeletedTotalCount: 0,
  loadingToBeDeletedCandidates: false,
  archiveCandidateData: null,
  loadArchivalCandidateData: false,
  archiving: false,
  unArchiving: false,
  unArchivingResumeId: '',
  rejectingDeletion: false,
  initiatingDelete: false
};

let unarchiveresumeId;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_ARCHIVAL_REASONS:
      return {
        ...state,
        loadingArchivalReasons: true
      };
    case LOAD_ARCHIVAL_REASONS_SUCCESS:
      return {
        ...state,
        loadingArchivalReasons: false,
        archivalReasons: action.result.data
      };
    case LOAD_ARCHIVAL_REASONS_FAIL:
      return {
        ...state,
        loadingArchivalReasons: false,
      };
    case LOAD_ARCHIVED_CANDIDATES:
      return {
        ...state,
        loadingArchivedCandidates: true
      };
    case LOAD_ARCHIVED_CANDIDATES_SUCCESS:
      return {
        ...state,
        loadingArchivedCandidates: false,
        archivedCandidates: action.result.data,
        archivedTotalCount: action.result.total
      };
    case LOAD_ARCHIVED_CANDIDATES_FAIL:
      return {
        ...state,
        loadingArchivedCandidates: false
      };
    case TO_BE_UNARCHIVED_CANDIDATES:
      return {
        ...state,
        loadingToBeUnarchivedCandidates: true
      };
    case TO_BE_UNARCHIVED_CANDIDATES_SUCCESS:
      return {
        ...state,
        loadingToBeUnarchivedCandidates: false,
        toBeUnarchivedCandidates: action.result.data,
        toBeUnarchivedTotalCount: action.result.total
      };
    case TO_BE_UNARCHIVED_CANDIDATES_FAIL:
      return {
        ...state,
        loadingToBeUnarchivedCandidates: false
      };
    case TO_BE_DELETED_CANDIDATES:
      return {
        ...state,
        loadingToBeDeletedCandidates: true
      };
    case TO_BE_DELETED_CANDIDATES_SUCCESS:
      return {
        ...state,
        loadingToBeDeletedCandidates: false,
        toBeDeletedCandidates: action.result.candidates,
        toBeDeletedTotalCount: action.result.totalCount
      };
    case TO_BE_DELETED_CANDIDATES_FAIL:
      return {
        ...state,
        loadingToBeDeletedCandidates: false
      };
    case ARCHIVE_CANDIDATE:
      return {
        ...state,
        archiving: true
      };
    case ARCHIVE_CANDIDATE_SUCCESS:
      return {
        ...state,
        archiving: false
      };
    case ARCHIVE_CANDIDATE_FAIL:
      return {
        ...state,
        archiving: false
      };
    case UNARCHIVE_ARCHIVED_CANDIDATE:
      return {
        ...state,
        unArchiving: true,
        unArchivingResumeId: action.unArchivingResumeId
      };
    case UNARCHIVE_ARCHIVED_CANDIDATE_SUCCESS:
      return {
        ...state,
        archivedCandidates: candidateResolver.removeUnarchivedCandidate(state.archivedCandidates,
          unarchiveresumeId),
        archivedTotalCount: state.archivedTotalCount - 1,
        unArchiving: false,
        unArchivingResumeId: ''
      };
    case UNARCHIVE_ARCHIVED_CANDIDATE_FAIL:
      return {
        ...state,
        unArchiving: false,
        unArchivingResumeId: ''
      };
    case UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE:
      return {
        ...state,
        unArchiving: true
      };
    case UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE_SUCCESS:
      return {
        ...state,
        toBeUnarchivedCandidates: candidateResolver.removeUnarchivedCandidate(state.archivedCandidates,
          unarchiveresumeId),
        toBeUnarchivedTotalCount: state.toBeUnarchivedTotalCount - 1,
        unArchiving: false
      };
    case UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE_FAIL:
      return {
        ...state,
        unArchiving: false
      };
    case LOAD_ARCHIVE_CANDIDATE_DATA:
      return {
        ...state,
        loadArchivalCandidateData: true
      };
    case LOAD_ARCHIVE_CANDIDATE_DATA_SUCCESS:
      return {
        ...state,
        archiveCandidateData: action.result,
        loadArchivalCandidateData: false
      };
    case LOAD_ARCHIVE_CANDIDATE_DATA_FAIL:
      return {
        ...state,
        loadArchivalCandidateData: false
      };
    case LOAD_DELETE_REASONS:
      return {
        ...state,
        loadingDeleteReasons: true
      };
    case LOAD_DELETE_REASONS_SUCCESS:
      return {
        ...state,
        loadingDeleteReasons: false,
        deleteReasons: action.result.data
      };
    case LOAD_DELETE_REASONS_FAIL:
      return {
        ...state,
        loadingDeleteReasons: false,
      };
    case INITIATE_DELETE_CANDIDATE:
      return {
        ...state,
        initiatingDelete: true
      };
    case INITIATE_DELETE_CANDIDATE_SUCCESS:
      return {
        ...state,
        initiatingDelete: false,
      };
    case INITIATE_DELETE_CANDIDATE_FAIL:
      return {
        ...state,
        initiatingDelete: false,
      };
    case LOAD_DELETE_INITIATED_CANDIDATES:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: true
      };
    case LOAD_DELETE_INITIATED_CANDIDATES_SUCCESS:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: false,
        deleteInitiatedCandidates: action.result.data,
        deleteInitiatedTotalCount: action.result.total
      };
    case LOAD_DELETE_INITIATED_CANDIDATES_FAIL:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: false
      };
    case LOAD_APPROVER_STATUS_LIST:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: true
      };
    case LOAD_APPROVER_STATUS_LIST_SUCCESS:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: false,
        approversList: action.result
      };
    case LOAD_APPROVER_STATUS_LIST_FAIL:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: false
      };
    case APPROVE_FOR_DELETION:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: true
      };
    case APPROVE_FOR_DELETION_SUCCESS:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: false,
      };
    case APPROVE_FOR_DELETION_FAIL:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: false
      };
    case REJECT_FOR_DELETION:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: true,
        rejectingDeletion: true
      };
    case REJECT_FOR_DELETION_SUCCESS:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: false,
        rejectingDeletion: false
      };
    case REJECT_FOR_DELETION_FAIL:
      return {
        ...state,
        loadingDeleteInitiatedCandidates: false,
        rejectingDeletion: false
      };
    default:
      return state;
  }
}


export function loadArchivalReasons(data) {
  return {
    types: [LOAD_ARCHIVAL_REASONS, LOAD_ARCHIVAL_REASONS_SUCCESS, LOAD_ARCHIVAL_REASONS_FAIL],
    promise: ({ client }) => client.post('/reasons/lists', { data })
  };
}

export function checkIfArchivable(resumeId) {
  return {
    types: [ISARCHIVABLE, ISARCHIVABLE_SUCCESS, ISARCHIVABLE_FAIL],
    promise: ({ client }) => client.get(`/jobProfiles/archivable/${resumeId}`)
  };
}

export function archiveCandidate(resumeId, data) {
  return {
    types: [ARCHIVE_CANDIDATE, ARCHIVE_CANDIDATE_SUCCESS, ARCHIVE_CANDIDATE_FAIL],
    promise: ({ client }) => client.post(`/resumes/archive/${resumeId}`, { data })
  };
}

export function extendArchiveCandidate(resumeId, data) {
  return {
    types: [EXTEND_ARCHIVE_CANDIDATE, EXTEND_ARCHIVE_CANDIDATE_SUCCESS, EXTEND_ARCHIVE_CANDIDATE_FAIL],
    promise: ({ client }) => client.post(`/resumes/editScheduleDetails/${resumeId}`, { data })
  };
}

export function extendArchivedCandidate(resumeId, data) {
  return {
    types: [EXTEND_ARCHIVED_CANDIDATE, EXTEND_ARCHIVED_CANDIDATE_SUCCESS, EXTEND_ARCHIVED_CANDIDATE_FAIL],
    promise: ({ client }) => client.post(`/resumes/extendArchival/${resumeId}`, { data })
  };
}

export function unArchiveCandidate(resumeId, type) {
  unarchiveresumeId = resumeId;
  let typesArray = [UNARCHIVE_CANDIDATE, UNARCHIVE_CANDIDATE_SUCCESS, UNARCHIVE_CANDIDATE_FAIL];
  if (type === 'archivedCandidates') {
    typesArray = [UNARCHIVE_ARCHIVED_CANDIDATE, UNARCHIVE_ARCHIVED_CANDIDATE_SUCCESS,
      UNARCHIVE_ARCHIVED_CANDIDATE_FAIL];
  } else if (type === 'toBeUnarchivedCandidates') {
    typesArray = [UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE,
      UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE_SUCCESS, UNARCHIVE_TO_BE_UNARCHIVED_CANDIDATE_FAIL
    ];
  }
  return {
    types: typesArray,
    unArchivingResumeId: resumeId,
    promise: ({ client }) => client.get(`/resumes/unarchive/${resumeId}`)
  };
}

export function getArchivedCandidates(data) {
  return {
    types: [LOAD_ARCHIVED_CANDIDATES, LOAD_ARCHIVED_CANDIDATES_SUCCESS, LOAD_ARCHIVED_CANDIDATES_FAIL],
    promise: ({ client }) => client.post('/resumes/archived', { data })
  };
}

export function getToBeUnarchivedCandidates(data) {
  return {
    types: [
      TO_BE_UNARCHIVED_CANDIDATES, TO_BE_UNARCHIVED_CANDIDATES_SUCCESS,
      TO_BE_UNARCHIVED_CANDIDATES_FAIL
    ],
    promise: ({ client }) => client.post('/resumes/toBeUnarchived', { data })
  };
}

export function getToBeDeletedCandidates(data) {
  return {
    types: [
      TO_BE_DELETED_CANDIDATES, TO_BE_DELETED_CANDIDATES_SUCCESS,
      TO_BE_DELETED_CANDIDATES_FAIL
    ],
    promise: ({ client }) => client.post('/resumes/toBeDeleted', { data })
  };
}

export function getArchiveCandidateData(resumeId) {
  return {
    types: [
      LOAD_ARCHIVE_CANDIDATE_DATA, LOAD_ARCHIVE_CANDIDATE_DATA_SUCCESS,
      LOAD_ARCHIVE_CANDIDATE_DATA_FAIL
    ],
    promise: ({ client }) => client.get(`/resumes/scheduleDetails/${resumeId}`)
  };
}


export function loadDeleteReasons(data) {
  return {
    types: [LOAD_DELETE_REASONS, LOAD_DELETE_REASONS_SUCCESS, LOAD_DELETE_REASONS_FAIL],
    promise: ({ client }) => client.post('/reasons/lists', { data })
  };
}


export function initiateDeleteCandidate(id, data) {
  return {
    types: [INITIATE_DELETE_CANDIDATE, INITIATE_DELETE_CANDIDATE_SUCCESS, INITIATE_DELETE_CANDIDATE_FAIL],
    promise: ({ client }) => client.post(`/resumes/initiateDelete/${id}`, { data })
  };
}


export function getDeleteInitiatedCandidates(data) {
  return {
    types: [LOAD_DELETE_INITIATED_CANDIDATES, LOAD_DELETE_INITIATED_CANDIDATES_SUCCESS,
      LOAD_DELETE_INITIATED_CANDIDATES_FAIL],
    promise: ({ client }) => client.post('/resumes/deletePending', { data })
  };
}

export function getApproversStatusList(id) {
  return {
    types: [LOAD_APPROVER_STATUS_LIST, LOAD_APPROVER_STATUS_LIST_SUCCESS,
      LOAD_APPROVER_STATUS_LIST_FAIL],
    promise: ({ client }) => client.get(`/resumes/approversList/${id}`)
  };
}

export function approveForDeletion(id) {
  return {
    types: [APPROVE_FOR_DELETION, APPROVE_FOR_DELETION_SUCCESS,
      APPROVE_FOR_DELETION_FAIL],
    promise: ({ client }) => client.get(`/resumes/approve/${id}`)
  };
}

export function rejectForDeletion(id, data) {
  return {
    types: [REJECT_FOR_DELETION, REJECT_FOR_DELETION_SUCCESS,
      REJECT_FOR_DELETION_FAIL],
    promise: ({ client }) => client.post(`/resumes/reject/${id}`, { data })
  };
}

