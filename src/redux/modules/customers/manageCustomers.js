const ARCHIVE_COMPANY = 'manageCustomers/ARCHIVE_COMPANY';
const ARCHIVE_COMPANY_SUCCESS = 'manageCustomers/ARCHIVE_COMPANY_SUCCESS';
const ARCHIVE_COMPANY_FAIL = 'manageCustomers/ARCHIVE_COMPANY_FAIL';

const LOAD_ARCHIVED_COMPANIES = 'manageCustomers/LOAD_ARCHIVED_COMPANIES';
const LOAD_ARCHIVED_COMPANIES_SUCCESS = 'manageCustomers/LOAD_ARCHIVED_COMPANIES_SUCCESS';
const LOAD_ARCHIVED_COMPANIES_FAIL = 'manageCustomers/LOAD_ARCHIVED_COMPANIES_FAIL';

const LOAD_TO_BE_UNARCHIVED_COMPANIES = 'manageCustomers/LOAD_TO_BE_UNARCHIVED_COMPANIES';
const LOAD_TO_BE_UNARCHIVED_COMPANIES_SUCCESS = 'manageCustomers/LOAD_TO_BE_UNARCHIVED_COMPANIES_SUCCESS';
const LOAD_TO_BE_UNARCHIVED_COMPANIES_FAIL = 'manageCustomers/LOAD_TO_BE_UNARCHIVED_COMPANIES_FAIL';

const UNARCHIVE_COMPANY = 'manageCustomers/UNARCHIVE_COMPANY';
const UNARCHIVE_COMPANY_SUCCESS = 'manageCustomers/UNARCHIVE_COMPANY_SUCCESS';
const UNARCHIVE_COMPANY_FAIL = 'manageCustomers/UNARCHIVE_COMPANY_FAIL';

const LOAD_ARCHIVE_SCHEDULE = 'manageCustomers/LOAD_ARCHIVE_SCHEDULE';
const LOAD_ARCHIVE_SCHEDULE_SUCCESS = 'manageCustomers/LOAD_ARCHIVE_SCHEDULE_SUCCESS';
const LOAD_ARCHIVE_SCHEDULE_FAIL = 'manageCustomers/LOAD_ARCHIVE_SCHEDULE_FAIL';

const EXTEND_ARCHIVE = 'manageCustomers/EXTEND_ARCHIVE';
const EXTEND_ARCHIVE_SUCCESS = 'manageCustomers/EXTEND_ARCHIVE_SUCCESS';
const EXTEND_ARCHIVE_FAIL = 'manageCustomers/EXTEND_ARCHIVE_FAIL';

const EXTEND_COMPANY_ARCHIVE = 'manageCustomers/EXTEND_COMPANY_ARCHIVE';
const EXTEND_COMPANY_ARCHIVE_SUCCESS = 'manageCustomers/EXTEND_COMPANY_ARCHIVE_SUCCESS';
const EXTEND_COMPANY_ARCHIVE_FAIL = 'manageCustomers/EXTEND_COMPANY_ARCHIVE_FAIL';

const initialState = {
  archiving: false,
  unArchiving: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ARCHIVE_COMPANY:
      return {
        ...state,
        archiving: true,

      };
    case ARCHIVE_COMPANY_SUCCESS:
      return {
        ...state,
        archiving: false,

      };
    case ARCHIVE_COMPANY_FAIL:
      return {
        ...state,
        archiving: false,
      };
    case LOAD_ARCHIVED_COMPANIES:
      return {
        ...state,
        loadingArchivedCompanies: true,
        loadedArchivedCompanies: false,
      };
    case LOAD_ARCHIVED_COMPANIES_SUCCESS:
      return {
        ...state,
        loadingArchivedCompanies: false,
        loadedArchivedCompanies: true,
        archivedCompanies: action.result.data,
        archivedCompaniesTotalCompany: action.result.total
      };
    case LOAD_ARCHIVED_COMPANIES_FAIL:
      return {
        ...state,
        loadingArchivedCompanies: false,
        loadedArchivedCompanies: false,
      };
    case LOAD_TO_BE_UNARCHIVED_COMPANIES:
      return {
        ...state,
        loadingUnArchivedCompanies: true,
        loadedUnArchivedCompanies: false
      };
    case LOAD_TO_BE_UNARCHIVED_COMPANIES_SUCCESS:
      return {
        ...state,
        loadingUnArchivedCompanies: false,
        loadedUnArchivedCompanies: true,
        unArchivedCompanies: action.result.data,
        unArchivedCompaniesTotal: action.result.total
      };
    case LOAD_TO_BE_UNARCHIVED_COMPANIES_FAIL:
      return {
        ...state,
        loadingUnArchivedCompanies: false,
        loadedUnArchivedCompanies: false
      };
    case UNARCHIVE_COMPANY:
      return {
        ...state,
        unArchiving: true,
        unArchived: false
      };
    case UNARCHIVE_COMPANY_SUCCESS:
      return {
        ...state,
        unArchiving: false,
        unArchived: true
      };
    case UNARCHIVE_COMPANY_FAIL:
      return {
        ...state,
        unArchiving: false,
        unArchived: false,
        unArchiveError: action.error
      };
    case LOAD_ARCHIVE_SCHEDULE:
      return {
        ...state,
        loadingArchiveSchedule: true,
        loadedArchiveSchedule: false,
      };
    case LOAD_ARCHIVE_SCHEDULE_SUCCESS:
      return {
        ...state,
        loadingArchiveSchedule: false,
        loadedArchiveSchedule: true,
        archiveCompanyData: action.result
      };
    case LOAD_ARCHIVE_SCHEDULE_FAIL:
      return {
        ...state,
        loadingArchiveSchedule: false,
        loadedArchiveSchedule: false,
        archiveCompanyDataError: action.error
      };
    case EXTEND_ARCHIVE:
      return {
        ...state,
        extendingCompanyArchive: true,
        extendedCompanyArchive: false,
      };
    case EXTEND_ARCHIVE_SUCCESS:
      return {
        ...state,
        extendingCompanyArchive: false,
        extendedCompanyArchive: true,
      };
    case EXTEND_ARCHIVE_FAIL:
      return {
        ...state,
        extendingCompanyArchive: false,
        extendedCompanyArchive: false,
        extendCompanyArchiveError: action.error
      };
    case EXTEND_COMPANY_ARCHIVE:
    case EXTEND_COMPANY_ARCHIVE_SUCCESS:
    case EXTEND_COMPANY_ARCHIVE_FAIL:
      return {
        ...state
      };
    default:
      return state;
  }
}

export function archiveCompany(data, companyId) {
  return {
    types: [ARCHIVE_COMPANY, ARCHIVE_COMPANY_SUCCESS, ARCHIVE_COMPANY_FAIL],
    promise: ({ client }) => client.post(`customers/archive/${companyId}`, { data })
  };
}

export function loadArchivedCompany(data) {
  return {
    types: [LOAD_ARCHIVED_COMPANIES, LOAD_ARCHIVED_COMPANIES_SUCCESS, LOAD_ARCHIVED_COMPANIES_FAIL],
    promise: ({ client }) => client.post('customers/archived', { data })
  };
}

export function loadUnArchivedCompanies(data) {
  return {
    types: [
      LOAD_TO_BE_UNARCHIVED_COMPANIES,
      LOAD_TO_BE_UNARCHIVED_COMPANIES_SUCCESS,
      LOAD_TO_BE_UNARCHIVED_COMPANIES_FAIL
    ],
    promise: ({ client }) => client.post('customers/toBeUnarchived', { data })
  };
}

export function unArchiveCompany(companyId) {
  return {
    types: [
      UNARCHIVE_COMPANY,
      UNARCHIVE_COMPANY_SUCCESS,
      UNARCHIVE_COMPANY_FAIL
    ],
    promise: ({ client }) => client.get(`customers/unarchive/${companyId}`)
  };
}

export function loadArchiveDetails(companyId) {
  return {
    types: [
      LOAD_ARCHIVE_SCHEDULE,
      LOAD_ARCHIVE_SCHEDULE_SUCCESS,
      LOAD_ARCHIVE_SCHEDULE_FAIL
    ],
    promise: ({ client }) => client.get(`customers/scheduleDetails/${companyId}`)
  };
}

export function extendCompanyArchive(companyId, data) {
  return {
    types: [
      EXTEND_ARCHIVE,
      EXTEND_ARCHIVE_SUCCESS,
      EXTEND_ARCHIVE_FAIL
    ],
    promise: ({ client }) => client.post(`customers/editScheduleDetails/${companyId}`, { data })
  };
}

export function extendDateForAlreadyArchivedCompany(companyId, data) {
  return {
    types: [
      EXTEND_COMPANY_ARCHIVE,
      EXTEND_COMPANY_ARCHIVE_SUCCESS,
      EXTEND_COMPANY_ARCHIVE_FAIL
    ],
    promise: ({ client }) => client.post(`customers/extendArchival/${companyId}`, { data })
  };
}
