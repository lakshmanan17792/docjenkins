const LOAD_CANDIDATE_EMAILS = 'receiverEmails/LOAD_CANDIDATE_EMAILS';
const LOAD_CANDIDATE_EMAILS_SUCCESS = 'receiverEmails/LOAD_CANDIDATE_EMAILS_SUCCESS';
const LOAD_CANDIDATE_EMAILS_FAIL = 'receiverEmails/LOAD_CANDIDATE_EMAILS_FAIL';
const SEND_EMAIL = 'email/SEND_EMAIL';
const SEND_EMAIL_SUCCESS = 'email/SEND_EMAIL_SUCCESS';
const SEND_EMAIL_FAIL = 'email/SEND_EMAIL_FAIL';
const LOAD_EMAIL = 'email/LOAD_EMAIL';
const LOAD_EMAIL_SUCCESS = 'email/LOAD_EMAIL_SUCCESS';
const LOAD_EMAIL_FAIL = 'email/LOAD_EMAIL_FAIL';
const FETCH_EMAILS = 'email/FETCH_EMAILS';
const FETCH_EMAILS_SUCCESS = 'email/FETCH_EMAILS_SUCCESS';
const FETCH_EMAILS_FAIL = 'email/FETCH_EMAILS_FAIL';

const FILE_UPLOAD = 'email/FILE_UPLOAD';
const FILE_UPLOAD_SUCCESS = 'email/FILE_UPLOAD_SUCCESS';
const FILE_UPLOAD_FAIL = 'email/FILE_UPLOAD_FAIL';
const DISCARD_FILES = 'email/DISCARD_FILES';

const SMTP_CONFIG_SAVE = 'email/SMTP_CONFIG_SAVE';
const SMTP_CONFIG_SUCCESS = 'email/SMTP_CONFIG_SUCCESS';
const SMTP_CONFIG_FAIL = 'email/SMTP_CONFIG_SUCCESS';

const LOAD_JOB_EMAILS = 'receiverEmails/LOAD_JOB_EMAILS';
const LOAD_JOB_EMAILS_SUCCESS = 'receiverEmails/LOAD_JOB_EMAILS_SUCCESS';
const LOAD_JOB_EMAILS_FAIL = 'receiverEmails/LOAD_JOB_EMAILS_FAIL';

const FETCH_USER_EMAILS = 'email/FETCH_USER_EMAILS';
const FETCH_USER_EMAILS_SUCCESS = 'email/FETCH_USER_EMAILS_SUCCESS';
const FETCH_USER_EMAILS_FAIL = 'email/FETCH_USER_EMAILS_FAIL';

const DELETE_CANDIDATE_EMAIL = 'email/DELETE_CANDIDATE_EMAIL';
const DELETE_CANDIDATE_EMAIL_SUCCESS = 'email/DELETE_CANDIDATE_EMAIL_SUCCESS';
const DELETE_CANDIDATE_EMAIL_FAILURE = 'email/DELETE_CANDIDATE_EMAIL_FAILURE';

const DELETE_JOB_EMAIL = 'email/DELETE_JOB_EMAIL';
const DELETE_JOB_EMAIL_SUCCESS = 'email/DELETE_JOB_EMAIL_SUCCESS';
const DELETE_JOB_EMAIL_FAILURE = 'email/DELETE_JOB_EMAIL_FAILURE';

const CLEAR_USER_EMAILS = 'email/CLEAR_USER_EMAILS';

const IMAGE_UPLOAD = 'email/IMAGE_UPLOAD';
const IMAGE_UPLOAD_SUCCESS = 'email/IMAGE_UPLOAD_SUCCESS';
const IMAGE_UPLOAD_FAIL = 'email/IMAGE_UPLOAD_FAIL';

const initialState = {
  loading: null,
  loaded: null,
  emails: [],
  candidateEmails: [],
  files: [],
  jobEmails: [],
  userEmails: []
};

const getEmails = results => {
  const emails = [];
  results.map(result => emails.push({
    resumeId: result._source.resume_id,
    email: result._source.email_id
  }));
  return emails;
};

const getFiles = (files, newFile) => {
  if (files) {
    const file = newFile[Object.keys(newFile)[0]];
    files[Object.keys(newFile)[0]] = file;
  } else {
    files = {};
    const file = newFile[Object.keys(newFile)[0]];
    files[Object.keys(newFile)[0]] = file;
  }
  return files;
};

const filterDeleted = (emails, deletedEmail) => (emails.filter(email => email.id !== deletedEmail.id));

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_CANDIDATE_EMAILS:
      return {
        ...state,
        candidateEmailsLoading: true,
      };
    case LOAD_CANDIDATE_EMAILS_SUCCESS:
      return {
        ...state,
        candidateEmailsLoading: false,
        loaded: true,
        candidateEmails: action.result
      };
    case LOAD_CANDIDATE_EMAILS_FAIL:
      return {
        ...state,
        candidateEmailsLoading: false,
        loaded: false
      };
    case SEND_EMAIL:
      return {
        ...state,
        sending: true,
      };
    case SEND_EMAIL_SUCCESS:
      return {
        ...state,
        sending: false,
        sent: true,
      };
    case SEND_EMAIL_FAIL:
      return {
        ...state,
        sending: false,
        sent: false,
        sendingError: action.error
      };
    case LOAD_EMAIL:
      return {
        ...state,
        loading: true,
      };
    case LOAD_EMAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        emails: action.result
      };
    case LOAD_EMAIL_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadingError: action.error
      };

    case FETCH_EMAILS:
      return {
        ...state,
        loading: true,
      };
    case FETCH_EMAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        profileEmails: getEmails(action.result.hits.hits)
      };
    case FETCH_EMAILS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadingError: action.error
      };
    case FILE_UPLOAD:
      return {
        ...state,
        files: getFiles(state.files, {
          [action.loaderName]: {
            uploading: true,
            file: action.file
          }
        })
      };
    case FILE_UPLOAD_SUCCESS:
      return {
        ...state,
        files: getFiles(state.files, {
          [action.loaderName]: {
            uploading: false,
            uploaded: true,
            uploadResponse: action.result,
            file: action.file
          }
        }),
      };
    case FILE_UPLOAD_FAIL:
      return {
        ...state,
        files: getFiles(state.files, {
          [action.loaderName]: {
            uploading: false,
            uploaded: false,
            error: action.error,
            file: action.file
          }
        })
      };
    case IMAGE_UPLOAD:
      return {
        ...state,
        imageUploading: true
      };
    case IMAGE_UPLOAD_SUCCESS:
      return {
        ...state,
        imageUploading: false,
        imageUploaded: true,
        result: action.result
      };
    case IMAGE_UPLOAD_FAIL:
      return {
        ...state,
        imageUploading: false,
        imageUploaded: false,
        imageuploadError: action.error
      };
    case DISCARD_FILES:
      return {
        ...state,
        files: {}
      };
    case SMTP_CONFIG_SAVE:
      return {
        ...state,
        smtpConfigSaving: true,
      };
    case SMTP_CONFIG_SUCCESS:
      return {
        ...state,
        smtpConfigSaving: false,
        smtpConfigSaved: true,
        smtpConfigResult: action.result
      };
    case SMTP_CONFIG_FAIL:
      return {
        ...state,
        ...state,
        smtpConfigSaving: false,
        smtpConfigSaved: false,
        smtpConfigResult: action.error
      };
    case LOAD_JOB_EMAILS:
      return {
        ...state,
        jobOpeningEmailsloading: true,
      };
    case LOAD_JOB_EMAILS_SUCCESS:
      return {
        ...state,
        jobOpeningEmailsloading: false,
        loaded: true,
        jobEmails: action.result
      };
    case LOAD_JOB_EMAILS_FAIL:
      return {
        ...state,
        jobOpeningEmailsloading: false,
        loaded: false
      };
    case DELETE_CANDIDATE_EMAIL:
      return {
        ...state,
        loading: true
      };
    case DELETE_CANDIDATE_EMAIL_SUCCESS:
      return {
        ...state,
        candidateEmails: filterDeleted(state.candidateEmails, action.result),
        loaded: true,
        loading: false
      };
    case DELETE_CANDIDATE_EMAIL_FAILURE:
      return {
        ...state,
        loaded: true,
        loading: false
      };
    case DELETE_JOB_EMAIL:
      return {
        ...state,
        loading: true
      };
    case DELETE_JOB_EMAIL_SUCCESS:
      return {
        ...state,
        jobEmails: filterDeleted(state.jobEmails, action.result),
        loaded: true,
        loading: false
      };
    case DELETE_JOB_EMAIL_FAILURE:
      return {
        ...state,
        loaded: true,
        loading: false
      };
    case FETCH_USER_EMAILS:
      return {
        ...state,
        loading: true,
      };
    case FETCH_USER_EMAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        userEmails: action.result
      };
    case FETCH_USER_EMAILS_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case CLEAR_USER_EMAILS:
      return {
        ...state,
        userEmails: []
      };
    default:
      return state;
  }
}

export function loadCandidateEmails(filter) {
  filter.accessToken = localStorage.getItem('authToken');
  filter.origin = window.location.origin;
  return {
    types: [
      LOAD_CANDIDATE_EMAILS, LOAD_CANDIDATE_EMAILS_SUCCESS, LOAD_CANDIDATE_EMAILS_FAIL
    ],
    promise: ({ client }) => client.get(`/ProspectMails/candidateEmails/?filter=${JSON.stringify(filter)}`)
  };
}

export function sendEmail(email) {
  return {
    types: [
      SEND_EMAIL, SEND_EMAIL_SUCCESS, SEND_EMAIL_FAIL
    ],
    promise: ({ client }) => client.post('/MailRequests/save', { data: email })
  };
}

export function loadEmails() {
  return {
    types: [
      LOAD_EMAIL, LOAD_EMAIL_SUCCESS, LOAD_EMAIL_FAIL
    ],
    promise: ({ client }) => client.get('/EmailQueues')
  };
}

export function fetchEmails(searchQuery) {
  return {
    types: [
      FETCH_EMAILS, FETCH_EMAILS_SUCCESS, FETCH_EMAILS_FAIL
    ],
    promise: ({ client }) => client.get(`/MailRequests/search/${searchQuery}`)
  };
}

export function fileUpload(fileObj, file) {
  return {
    types: [FILE_UPLOAD, FILE_UPLOAD_SUCCESS, FILE_UPLOAD_FAIL],
    promise: ({ client }) => client.post('/documents/upload/email',
      { data: fileObj, unsetContentType: 1 }),
    loaderName: file.id,
    file
  };
}

export function saveSmtpConfig(config) {
  return {
    types: [SMTP_CONFIG_SAVE, SMTP_CONFIG_SUCCESS, SMTP_CONFIG_FAIL],
    promise: ({ client }) => client.post('', config)
  };
}

export function loadJobEmails(filter) {
  filter.accessToken = localStorage.getItem('authToken');
  filter.origin = window.location.origin;
  return {
    types: [
      LOAD_JOB_EMAILS, LOAD_JOB_EMAILS_SUCCESS, LOAD_JOB_EMAILS_FAIL
    ],
    promise: ({ client }) => client.get(`/ProspectMails/jobOpeningEmails/?filter=${JSON.stringify(filter)}`)
  };
}

export function discardFiles() {
  return {
    type: DISCARD_FILES
  };
}

export function fetchUserEmails(searchQuery) {
  return {
    types: [
      FETCH_USER_EMAILS, FETCH_USER_EMAILS_SUCCESS, FETCH_USER_EMAILS_FAIL
    ],
    promise: ({ client }) => client.get(`/users/search-user/${searchQuery}`)
    // promise: ({ client }) => client.get(`/MailRequests/search/${searchQuery}`)
  };
}

export function deleteCandidateEmail(id) {
  return {
    types: [
      DELETE_CANDIDATE_EMAIL, DELETE_CANDIDATE_EMAIL_SUCCESS, DELETE_CANDIDATE_EMAIL_FAILURE
    ],
    promise: ({ client }) => client.patch(`/ProspectMails/${id}`, { data: { isDeleted: true } })
  };
}

export function deleteJobEmail(id) {
  return {
    types: [
      DELETE_JOB_EMAIL, DELETE_JOB_EMAIL_SUCCESS, DELETE_JOB_EMAIL_FAILURE
    ],
    promise: ({ client }) => client.patch(`/ProspectMails/${id}`, { data: { isDeleted: true } })
  };
}

export function clearUserEmails() {
  return {
    type: CLEAR_USER_EMAILS
  };
}

export function imageUpload(fileObj) {
  const formData = new FormData();
  formData.append('uploaded_file', fileObj);
  return {
    types: [
      IMAGE_UPLOAD,
      IMAGE_UPLOAD_SUCCESS,
      IMAGE_UPLOAD_FAIL
    ],
    promise: ({ client }) => client.post('/documents/upload/signature',
      { data: formData, unsetContentType: 1 }),
  };
}
