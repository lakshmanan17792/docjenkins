const LOAD_CUSTOMERS = 'customers/LOAD_CUSTOMERS';
const LOAD_CUSTOMERS_SUCCESS = 'customers/LOAD_CUSTOMERS_SUCCESS';
const LOAD_CUSTOMERS_FAIL = 'customers/LOAD_CUSTOMERS_FAIL';
const LOG_ACTIVITY = 'customers/LOG_ACTIVITY';
const LOG_ACTIVITY_SUCCESS = 'customers/LOG_ACTIVITY_SUCCESS';
const LOG_ACTIVITY_FAIL = 'customers/LOG_ACTIVITY_FAIL';
const UPDATE_LOG_ACTIVITY = 'customers/UPDATE_LOG_ACTIVITY';
const UPDATE_LOG_ACTIVITY_SUCCESS = 'customers/UPDATE_LOG_ACTIVITY_SUCCESS';
const UPDATE_LOG_ACTIVITY_FAIL = 'customers/UPDATE_LOG_ACTIVITY_FAIL';
const GET_LOG_ACTIVITY = 'customers/GET_LOG_ACTIVITY';
const GET_LOG_ACTIVITY_SUCCESS = 'customers/GET_LOG_ACTIVITY_SUCCESS';
const GET_LOG_ACTIVITY_FAIL = 'customers/GET_LOG_ACTIVITY_FAIL';
const LOAD_CUSTOMER = 'customers/LOAD_CUSTOMER';
const LOAD_CUSTOMER_SUCCESS = 'customers/LOAD_CUSTOMER_SUCCESS';
const LOAD_CUSTOMER_FAIL = 'customers/LOAD_CUSTOMER_FAIL';
const SAVE_CUSTOMER = 'customers/SAVE_CUSTOMER';
const SAVE_CUSTOMER_SUCCESS = 'customers/SAVE_CUSTOMER_SUCCESS';
const SAVE_CUSTOMER_FAIL = 'customers/SAVE_CUSTOMER_FAIL';
const UPDATE_CUSTOMER = 'customers/UPDATE_CUSTOMER';
const UPDATE_CUSTOMER_SUCCESS = 'customers/UPDATE_CUSTOMER_SUCCESS';
const UPDATE_CUSTOMER_FAIL = 'customers/UPDATE_CUSTOMER_FAIL';
const OPEN_EDIT_CUSTOMER_MODAL = 'customers/OPEN_EDIT_CUSTOMER_MODAL';
const CLOSE_EDIT_CUSTOMER_MODAL = 'customers/CLOSE_EDIT_CUSTOMER_MODAL';
const OPEN_SAVE_CUSTOMER_MODAL = 'customers/OPEN_SAVE_CUSTOMER_MODAL';
const CLOSE_SAVE_CUSTOMER_MODAL = 'customers/CLOSE_SAVE_CUSTOMER_MODAL';
const OPEN_VIEW_CUSTOMER_MODAL = 'customers/OPEN_VIEW_CUSTOMER_MODAL';
const CLOSE_VIEW_CUSTOMER_MODAL = 'customers/CLOSE_VIEW_CUSTOMER_MODAL';
const CHECK_CUSTOMER_NAME = 'customers/CHECK_CUSTOMER_NAME';
const CHECK_CUSTOMER_NAME_SUCCESS = 'customers/CHECK_CUSTOMER_NAME_SUCCESS';
const CHECK_CUSTOMER_NAME_FAIL = 'customers/CHECK_CUSTOMER_NAME_FAIL';
const LOAD_COMPANIES = 'customers/LOAD_COMPANIES';
const LOAD_COMPANIES_SUCCESS = 'customers/LOAD_COMPANIES_SUCCESS';
const LOAD_COMPANIES_FAIL = 'customers/LOAD_COMPANIES_FAIL';
const LOAD_COMPANY = 'customers/LOAD_COMPANY';
const LOAD_COMPANY_SUCCESS = 'customers/LOAD_COMPANY_SUCCESS';
const LOAD_COMPANY_FAIL = 'customers/LOAD_COMPANY_FAIL';
const LOAD_COMPANY_OPENINGS = 'customers/LOAD_COMPANY_OPENINGS';
const LOAD_COMPANY_OPENINGS_SUCCESS = 'customers/LOAD_COMPANY_OPENINGS_SUCCESS';
const LOAD_COMPANY_OPENINGS_FAIL = 'customers/LOAD_COMPANY_OPENINGS_FAIL';
const ADD_TO_EXISTING_OPENING = 'customers/ADD_TO_EXISTING_OPENING';
const LOAD_LOG_ACTIVITY = 'customers/LOAD_LOG_ACTIVITY';
const LOAD_LOG_ACTIVITY_SUCCESS = 'customers/LOAD_LOG_ACTIVITY_SUCCESS';
const LOAD_LOG_ACTIVITY_FAIL = 'customers/LOAD_LOG_ACTIVITY_FAIL';
const LOAD_ACTIVITY_HISTORY = 'customers/LOAD_ACTIVITY_HISTORY';
const LOAD_ACTIVITY_HISTORY_SUCCESS = 'customers/LOAD_ACTIVITY_HISTORY_SUCCESS';
const LOAD_ACTIVITY_HISTORY_FAIL = 'customers/LOAD_ACTIVITY_HISTORY_FAIL';
const LOAD_COMPANY_EMAILS = 'customers/LOAD_COMPANY_EMAILS';
const LOAD_COMPANY_EMAILS_SUCCESS = 'customers/LOAD_COMPANY_EMAILS_SUCCESS';
const LOAD_COMPANY_EMAILS_FAIL = 'customers/LOAD_COMPANY_EMAILS_FAIL';
const EMPTY_COMPANY_OPENINGS = 'customers/EMPTY_COMPANY_OPENINGS';
const FETCH_SALES_REPS_LIST = 'customers/FETCH_SALES_REPS_LIST';
const FETCH_SALES_REPS_LIST_SUCCESS = 'customers/FETCH_SALES_REPS_LIST_SUCCESS';
const FETCH_SALES_REPS_LIST_ERROR = 'customers/FETCH_SALES_REPS_LIST_ERROR';
const LOAD_COMPANY_TAGS = 'customers/LOAD_COMPANY_TAGS';
const LOAD_COMPANY_TAGS_SUCCESS = 'customers/LOAD_COMPANY_TAGS_SUCCESS';
const LOAD_COMPANY_TAGS_ERROR = 'customers/LOAD_COMPANY_TAGS_ERROR';
const CREATE_COMPANY_TAG = 'customers/CREATE_COMPANY_TAG';
const CREATE_COMPANY_TAG_SUCCESS = 'customers/CREATE_COMPANY_TAG_SUCCESS';
const CREATE_COMPANY_TAG_ERROR = 'customers/CREATE_COMPANY_TAG_ERROR';
const LOAD_CONTACT_ASSOCIATIONS = 'customers/LOAD_CONTACT_ASSOCIATIONS';
const LOAD_CONTACT_ASSOCIATIONS_SUCCESS = 'customers/LOAD_CONTACT_ASSOCIATIONS_SUCCESS';
const LOAD_CONTACT_ASSOCIATIONS_ERROR = 'customers/LOAD_CONTACT_ASSOCIATIONS_ERROR';
const DELETE_CONTACT = 'customers/DELETE_CONTACT';
const DELETE_CONTACT_SUCCESS = 'customers/DELETE_CONTACT_SUCCESS';
const DELETE_CONTACT_ERROR = 'customers/DELETE_CONTACT_ERROR';

const initialState = {
  loading: null,
  loaded: null,
  customerList: [],
  company: null,
  companyOpenings: null,
  salesOwners: [],
  companyTags: [],
  loadingContactAssociations: false,
  contactAssociations: []
};

const getFullName = users => (
  users.map(user => (
    {
      ...user,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`
    }
  )
  )
);

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_CUSTOMERS:
      return {
        ...state,
        loading: true
      };
    case LOAD_CUSTOMERS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        customerList: action.result.customers,
        totalCount: action.result.totalCount
      };
    case LOAD_CUSTOMERS_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false
      };
    case LOAD_CUSTOMER:
      return {
        ...state,
        loading: true,
        selectedClientCompany: null,
        loaded: false
      };
    case LOAD_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        selectedClientCompany: action.result
      };
    case LOAD_CUSTOMER_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case SAVE_CUSTOMER:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case SAVE_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true
      };
    case SAVE_CUSTOMER_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case UPDATE_CUSTOMER:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case UPDATE_CUSTOMER_SUCCESS:
      return {
        ...state,
        selectedClientCompany: action.result,
        loading: false,
        loaded: true
      };
    case UPDATE_CUSTOMER_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case OPEN_SAVE_CUSTOMER_MODAL:
      return {
        ...state,
        openCustomerModal: true,
        saved: false
      };
    case CLOSE_SAVE_CUSTOMER_MODAL:
      return {
        ...state,
        openCustomerModal: false,
        saved: false
      };
    case OPEN_EDIT_CUSTOMER_MODAL:
      return {
        ...state,
        openCustomerModal: true
      };
    case CLOSE_EDIT_CUSTOMER_MODAL:
      return {
        ...state,
        openCustomerModal: false,
        customerSaved: false,
        customerUpdated: false,
        saved: false
      };
    case OPEN_VIEW_CUSTOMER_MODAL:
      return {
        ...state,
        openViewCustomerModal: true,
        saved: false
      };
    case CLOSE_VIEW_CUSTOMER_MODAL:
      return {
        ...state,
        openViewCustomerModal: false,
        saved: false
      };
    case CHECK_CUSTOMER_NAME:
      return {
        ...state,
      };
    case CHECK_CUSTOMER_NAME_SUCCESS:
      return {
        ...state,
      };
    case CHECK_CUSTOMER_NAME_FAIL:
      return {
        ...state,
      };
    case LOAD_COMPANIES:
      return {
        ...state,
        loading: true,
        companyList: null,
        loaded: false
      };
    case LOAD_COMPANIES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        totalCount: action.result.hits ? action.result.hits.total : 0,
        companyList: action.result.hits ? action.result.hits.hits : []
      };
    case LOAD_COMPANIES_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case LOAD_COMPANY:
      return {
        ...state,
        companyLoading: true,
        companyLoaded: false
      };
    case LOAD_COMPANY_SUCCESS:
      return {
        ...state,
        companyLoading: false,
        companyLoaded: true,
        company: action.result
      };
    case LOAD_COMPANY_FAIL:
      return {
        ...state,
        companyLoaded: false,
        companyLoading: false,
        error: action.error
      };
    case LOAD_COMPANY_OPENINGS:
      return {
        ...state,
        jobLoading: true,
        companyList: null,
        jobLoaded: false
      };
    case LOAD_COMPANY_OPENINGS_SUCCESS:
      return {
        ...state,
        jobLoading: false,
        jobLoaded: true,
        companyOpenings: action.result
      };
    case LOAD_COMPANY_OPENINGS_FAIL:
      return {
        ...state,
        jobLoaded: false,
        jobLoading: false,
        error: action.error
      };
    case LOAD_COMPANY_EMAILS:
      return {
        ...state,
        companyEmailsLoading: true,
      };
    case LOAD_COMPANY_EMAILS_SUCCESS:
      return {
        ...state,
        companyEmailsLoading: false,
        companyEmails: action.result
      };
    case LOAD_COMPANY_EMAILS_FAIL:
      return {
        ...state,
        companyEmailsLoading: false,
        error: action.error
      };
    case ADD_TO_EXISTING_OPENING:
      return {
        ...state,
        companyOpenings: {
          totalCount: state.companyOpenings.totalCount + 1,
          response: [action.jobOpening, ...state.companyOpenings.response]
        }
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
    case UPDATE_LOG_ACTIVITY :
      return {
        ...state
      };
    case UPDATE_LOG_ACTIVITY_SUCCESS :
      return {
        ...state,
        activity: action.result
      };
    case UPDATE_LOG_ACTIVITY_FAIL :
      return {
        ...state,
        error: action.error
      };
    case GET_LOG_ACTIVITY :
      return {
        ...state
      };
    case GET_LOG_ACTIVITY_SUCCESS :
      return {
        ...state,
      };
    case GET_LOG_ACTIVITY_FAIL :
      return {
        ...state,
        error: action.error
      };
    case LOAD_LOG_ACTIVITY: {
      return {
        ...state,
        companyActivitiesLoading: true,
        companyActivitiesLoaded: false
      };
    }
    case LOAD_LOG_ACTIVITY_SUCCESS: {
      return {
        ...state,
        companyActivitiesLoading: false,
        companyActivitiesLoaded: true,
        activities: action.result.response,
        totalCount: action.result.totalCount
      };
    }
    case LOAD_LOG_ACTIVITY_FAIL: {
      return {
        ...state,
        companyActivitiesLoading: false,
        companyActivitiesLoaded: false,
        error: action.error
      };
    }
    case LOAD_ACTIVITY_HISTORY: {
      return {
        ...state,
        companyHistoryLoading: true,
        companyHistoryLoaded: false
      };
    }
    case LOAD_ACTIVITY_HISTORY_SUCCESS: {
      return {
        ...state,
        companyHistoryLoading: false,
        companyHistoryLoaded: true,
        activities: action.result.response,
        totalCount: action.result.totalCount
      };
    }
    case LOAD_ACTIVITY_HISTORY_FAIL: {
      return {
        ...state,
        companyHistoryLoading: false,
        companyHistoryLoaded: false,
        error: action.error
      };
    }
    case EMPTY_COMPANY_OPENINGS: {
      return {
        ...state,
        companyOpenings: {}
      };
    }
    case FETCH_SALES_REPS_LIST:
      return {
        ...state,
        loaded: false,
        loading: false
      };
    case FETCH_SALES_REPS_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        salesOwners: getFullName(action.result),
        loaded: true
      };
    case FETCH_SALES_REPS_LIST_ERROR:
      return {
        ...state,
        loading: false,
        loaded: true
      };
    case CREATE_COMPANY_TAG:
    case LOAD_COMPANY_TAGS:
      return {
        ...state
      };
    case LOAD_COMPANY_TAGS_SUCCESS:
      return {
        ...state,
        companyTags: action.result
      };
    case CREATE_COMPANY_TAG_SUCCESS: {
      return {
        ...state,
        companyTags: [...state.companyTags, action.result]
      };
    }
    case CREATE_COMPANY_TAG_ERROR:
    case LOAD_COMPANY_TAGS_ERROR:
      return {
        ...state,
        loaded: true,
        loading: false
      };
    case LOAD_CONTACT_ASSOCIATIONS:
      return {
        ...state,
        loadingContactAssociations: true
      };
    case LOAD_CONTACT_ASSOCIATIONS_SUCCESS:
      return {
        ...state,
        loadingContactAssociations: false,
        contactAssociations: action.result
      };
    case LOAD_CONTACT_ASSOCIATIONS_ERROR:
      return {
        ...state,
        loadingContactAssociations: false
      };
    case DELETE_CONTACT:
    case DELETE_CONTACT_SUCCESS:
    case DELETE_CONTACT_ERROR:
      return {
        ...state
      };
    default:
      return state;
  }
}

/*
* Actions
* * * * */
export function loadCustomers(data) {
  return {
    types: [
      LOAD_CUSTOMERS, LOAD_CUSTOMERS_SUCCESS, LOAD_CUSTOMERS_FAIL
    ],
    promise: ({ client }) => client.post('/customers/lists', { data })
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

export function updateActivity(data) {
  return {
    types: [
      UPDATE_LOG_ACTIVITY, UPDATE_LOG_ACTIVITY_SUCCESS, UPDATE_LOG_ACTIVITY_FAIL
    ],
    promise: ({ client }) => client.post('/Notes/edit', { data })
  };
}

export function getLogActivity(id) {
  return {
    types: [
      GET_LOG_ACTIVITY, GET_LOG_ACTIVITY_SUCCESS, GET_LOG_ACTIVITY_FAIL
    ],
    promise: ({ client }) => client.get(`/Notes/list/${id}`)
  };
}

export function loadLogActivityForCompany(filter) {
  return {
    types: [
      LOAD_LOG_ACTIVITY, LOAD_LOG_ACTIVITY_SUCCESS, LOAD_LOG_ACTIVITY_FAIL
    ],
    promise: ({ client }) => client.get(`/customers/${filter.companyId}/activity?filter=${JSON.stringify(filter)}`)
  };
}

export function loadActivityHistoryForCompany(filter) {
  return {
    types: [
      LOAD_ACTIVITY_HISTORY, LOAD_ACTIVITY_HISTORY_SUCCESS, LOAD_ACTIVITY_HISTORY_FAIL
    ],
    promise: ({ client }) => client.get(`/customers/${filter.companyId}/history?filter=${JSON.stringify(filter)}`)
  };
}

export function saveCustomer(companyData) {
  // companyData.customer.is_user_added = true;
  return {
    types: [
      SAVE_CUSTOMER, SAVE_CUSTOMER_SUCCESS, SAVE_CUSTOMER_FAIL
    ],
    promise: ({ client }) => client.post('/customers/save', { data: companyData })
  };
}

export function updateCustomer(data) {
  return {
    types: [
      UPDATE_CUSTOMER, UPDATE_CUSTOMER_SUCCESS, UPDATE_CUSTOMER_FAIL
    ],
    promise: ({ client }) => client.put(`/customers/update/${data.id}`, { data })
  };
}

export function loadCustomerById(id, query) {
  return {
    types: [LOAD_CUSTOMER, LOAD_CUSTOMER_SUCCESS, LOAD_CUSTOMER_FAIL],
    promise: ({ client }) => client.get(`/customers/${id}?filter=${JSON.stringify(query)}`)
  };
}

export function checkCustomerName(values) {
  if (values.id) {
    return {
      types: [CHECK_CUSTOMER_NAME, CHECK_CUSTOMER_NAME_SUCCESS, CHECK_CUSTOMER_NAME_FAIL],
      promise: ({ client }) => client.get(`/customers/check?id=${values.id}&name=${values.name}`)
    };
  }
  return {
    types: [CHECK_CUSTOMER_NAME, CHECK_CUSTOMER_NAME_SUCCESS, CHECK_CUSTOMER_NAME_FAIL],
    promise: ({ client }) => client.get(`/customers/check?name=${values.name}`)
  };
}

export function openEditCustomerModal() {
  return {
    type: OPEN_EDIT_CUSTOMER_MODAL
  };
}

export function closeEditCustomerModal() {
  return {
    type: CLOSE_EDIT_CUSTOMER_MODAL
  };
}

export function openSaveCustomerModal() {
  return {
    type: OPEN_SAVE_CUSTOMER_MODAL
  };
}

export function closeSaveCustomerModal() {
  return {
    type: CLOSE_SAVE_CUSTOMER_MODAL
  };
}

export function openViewCustomerModal() {
  return {
    type: OPEN_VIEW_CUSTOMER_MODAL
  };
}

export function closeViewCustomerModal() {
  return {
    type: CLOSE_VIEW_CUSTOMER_MODAL
  };
}

export function loadCompanies(query) {
  return {
    types: [LOAD_COMPANIES, LOAD_COMPANIES_SUCCESS, LOAD_COMPANIES_FAIL],
    promise: ({ client }) => client.post('/customers/search', {
      data: query
    })
  };
}

export function loadCompanyById(companyId) {
  return {
    types: [
      LOAD_COMPANY, LOAD_COMPANY_SUCCESS, LOAD_COMPANY_FAIL
    ],
    promise: ({ client }) => client.get(`/customers/view/${companyId}`)
  };
}

export function loadOpeningsForCompany(query) {
  const data = {
    companies: [{ id: query.companyId }],
    page: 1,
    userId: '',
    sortBy: ['modifiedAt', 'desc'],
    ...query
  };
  if (query && query.searchTerm) {
    data.searchTerm = query.searchTerm;
  }
  return {
    types: [
      LOAD_COMPANY_OPENINGS, LOAD_COMPANY_OPENINGS_SUCCESS, LOAD_COMPANY_OPENINGS_FAIL
    ],
    promise: ({ client }) => client.post('/customers/openings', { data })
  };
}

export function addToCompanyOpenings(jobOpening) {
  return {
    jobOpening,
    type: ADD_TO_EXISTING_OPENING
  };
}

export function emptyCompanyOpenings() {
  return {
    type: EMPTY_COMPANY_OPENINGS
  };
}

export function loadEmailsForCompanyById(filter) {
  filter.accessToken = localStorage.getItem('authToken');
  filter.origin = window.location.origin;
  return {
    types: [
      LOAD_COMPANY_EMAILS, LOAD_COMPANY_EMAILS_SUCCESS, LOAD_COMPANY_EMAILS_FAIL
    ],
    promise: ({ client }) => client.get(`/ProspectMails/companyEmails?filter=${JSON.stringify(filter)}`)
  };
}

export const getSalesRepList = searchTerm => {
  const data = {
    roles: [{ name: 'Sales Rep' }],
    searchTerm: searchTerm || ''
  };
  return {
    types: [FETCH_SALES_REPS_LIST, FETCH_SALES_REPS_LIST_SUCCESS, FETCH_SALES_REPS_LIST_ERROR],
    promise: ({ client }) => client.post('/users/lists', { data })
  };
};

export const getCompanyTags = obj => {
  const data = {
    searchTerm: obj.searchTerm.trim(),
    tagType: 'customer',
    skip: obj.skip,
    limit: obj.limit ? obj.limit : 10
  };
  return {
    types: [LOAD_COMPANY_TAGS, LOAD_COMPANY_TAGS_SUCCESS, LOAD_COMPANY_TAGS_ERROR],
    promise: ({ client }) => client.post('/customers/listTags', { data })
  };
};

export const createCompanyTag = data => (
  {
    types: [CREATE_COMPANY_TAG, CREATE_COMPANY_TAG_SUCCESS, CREATE_COMPANY_TAG_ERROR],
    promise: ({ client }) => client.post('/customers/createTag', { data })
  }
);

export const checkIfContactAssociated = contactId => (
  {
    types: [LOAD_CONTACT_ASSOCIATIONS, LOAD_CONTACT_ASSOCIATIONS_SUCCESS, LOAD_CONTACT_ASSOCIATIONS_ERROR],
    promise: ({ client }) => client.get(`/customers/checkContactDelete/${contactId}`)
  }
);

export const deleteCompanyContact = ({ companyId, contactId }) => (
  {
    types: [DELETE_CONTACT, DELETE_CONTACT_SUCCESS, DELETE_CONTACT_ERROR],
    promise: ({ client }) => client.get(`/customers/deleteContact/${companyId}/${contactId}`)
  }
);
