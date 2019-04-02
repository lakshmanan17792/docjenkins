import _ from 'underscore';

const LOAD_JOB_OPENINGS = 'jobOpenings/LOAD_JOB_OPENINGS';
const LOAD_JOB_OPENINGS_SUCCESS = 'jobOpenings/LOAD_JOB_OPENINGS_SUCCESS';
const LOAD_JOB_OPENINGS_ERROR = 'jobOpenings/LOAD_JOB_OPENINGS_ERROR';

const UPDATE_ACTIVE_OPENINGS_TAB = 'jobOpenings/UPDATE_ACTIVE_OPENINGS_TAB';

const UPDATE_SEARCH_ACTIVE = 'jobOpenings/UPDATE_SEARCH_ACTIVE';
const UPDATE_SEARCH_STRING = 'jobOpenings/UPDATE_SEARCH_STRING';
const TOGGLE_SIDEBAR = 'jobOpenings/TOGGLE_SIDEBAR';

const UPDATE_CURRENT_JOB_OPENING = 'jobOpenings/UPDATE_CURRENT_JOB_OPENING';

// View Job details
const FETCH_JOB_DETAIL = 'jobOpenings/FETCH_JOB_DETAIL';
const FETCH_JOB_DETAIL_SUCCESS = 'jobOpenings/FETCH_JOB_DETAIL_SUCCESS';
const FETCH_JOB_DETAIL_ERROR = 'jobOpenings/FETCH_JOB_DETAIL_ERROR';

// Archive job opening
const ARCHIVE_JOB_OPENING = 'jobOpenings/ARCHIVE_JOB_OPENING';
const ARCHIVE_JOB_OPENING_SUCCESS = 'jobOpenings/ARCHIVE_JOB_OPENING_SUCCESS';
const ARCHIVE_JOB_OPENING_ERROR = 'jobOpenings/ARCHIVE_JOB_OPENING_ERROR';

// Assign Job opening
const UPDATE_ASSIGNING_JOB_OPENING = 'jobOpenings/UPDATE_ASSIGNING_JOB_OPENING';

// Fetch recruiters list
const FETCH_RECRUITERS_LIST = 'jobOpenings/FETCH_RECRUITERS_LIST';
const FETCH_RECRUITERS_LIST_SUCCESS = 'jobOpenings/FETCH_RECRUITERS_LIST_SUCCESS';
const FETCH_RECRUITERS_LIST_ERROR = 'jobOpenings/FETCH_RECRUITERS_LIST_ERROR';

const UPDATE_SEARCH_VALUE = 'jobOpenings/UPDATE_SEARCH_VALUE';
const POPULATE_EXISTING_USERS = 'jobOpenings/POPULATE_EXISTING_USERS';
const ON_RECRUITER_SEARCH_SELECT = 'jobOpenings/ON_RECRUITER_SEARCH_SELECT';
const ON_RECRUITER_DELETE = 'jobOpenings/ON_RECRUITER_DELETE';

// Fetch sales reps list
const FETCH_SALES_REPS_LIST = 'jobOpenings/FETCH_SALES_REPS_LIST';
const FETCH_SALES_REPS_LIST_SUCCESS = 'jobOpenings/FETCH_SALES_REPS_LIST_SUCCESS';
const FETCH_SALES_REPS_LIST_ERROR = 'jobOpenings/FETCH_SALES_REPS_LIST_ERROR';

const ON_REPS_SEARCH_SELECT = 'jobOpenings/ON_REPS_SEARCH_SELECT';
const ON_REP_DELETE = 'jobOpenings/ON_REP_DELETE';

// Assign Recruiters and sales rep for a job opening
const ASSIGN_JOB_OPENING = 'jobOpenings/ASSIGN_JOB_OPENING';
const ASSIGN_JOB_OPENING_SUCCESS = 'jobOpenings/ASSIGN_JOB_OPENING_SUCCESS';
const ASSIGN_JOB_OPENING_ERROR = 'jobOpenings/ASSIGN_JOB_OPENING_ERROR';

// Clear Assign page state
const CLEAR_JOB_ASSIGN_STATE = 'jobOpenings/CLEAR_JOB_ASSIGN_STATE';
const CLEAR_VIEW_JOB_STATE = 'jobOpenings/CLEAR_VIEW_JOB_STATE';
const CLEAR_ALL = 'jobOpenings/CLEAR_ALL';

// Analysis Metrics
const ANALYSIS_COMPANY_SEARCH = 'jobOpenings/ANALYSIS_COMPANY_SEARCH';
const ANALYSIS_COMPANY_SEARCH_SUCCESS = 'jobOpenings/ANALYSIS_COMPANY_SEARCH_SUCCESS';
const ANALYSIS_COMPANY_SEARCH_ERROR = 'jobOpenings/ANALYSIS_COMPANY_SEARCH_ERROR';
const ANALYSIS_CONTACT_SEARCH = 'jobOpenings/ANALYSIS_CONTACT_SEARCH';
const ANALYSIS_CONTACT_SEARCH_SUCCESS = 'jobOpenings/ANALYSIS_CONTACT_SEARCH_SUCCESS';
const ANALYSIS_CONTACT_SEARCH_ERROR = 'jobOpenings/ANALYSIS_CONTACT_SEARCH_ERROR';
const ANALYSIS_ACCOUNT_SEARCH = 'jobOpenings/ANALYSIS_ACCOUNT_SEARCH';
const ANALYSIS_ACCOUNT_SEARCH_SUCCESS = 'jobOpenings/ANALYSIS_ACCOUNT_SEARCH_SUCCESS';
const ANALYSIS_ACCOUNT_SEARCH_ERROR = 'jobOpenings/ANALYSIS_ACCOUNT_SEARCH_ERROR';
const ANALYSIS_JOB_OPENINGS = 'jobOpenings/ANALYSIS_JOB_OPENINGS';
const ANALYSIS_JOB_OPENINGS_SUCCESS = 'jobOpenings/ANALYSIS_JOB_OPENINGS_SUCCESS';
const ANALYSIS_JOB_OPENINGS_ERROR = 'jobOpenings/ANALYSIS_JOB_OPENINGS_ERROR';

const initialState = {
  loading: true,
  list: [],
  total: 0,
  active: 0,
  searching: false,
  searchString: '',
  sideBarOpen: false,
  currentJobId: '',
  assigning: false,

  // View
  name: '',
  vacancies: 0,
  type: '',
  priority: '',
  startDate: '',
  endDate: '',
  isAssigned: false,
  salesReps: [],
  recruiters: [],
  categories: [],
  openingLocations: [],
  positions: [],
  keywords: '',
  skills: [],
  language: [],
  location: [],
  radius: 0,
  experience: '',
  sources: [],

  // Assign
  recruitersList: [],
  salesRepList: [],
  activeRecruiters: [],
  activeSalesReps: [],
  recruiterSearchValue: '',
  repSearchValue: '',
};

let activeRecruitersArr = [];
let activeSalesRepsArr = [];

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_JOB_OPENINGS:
      return Object.assign({}, state, {
        loading: true,
      });
    case LOAD_JOB_OPENINGS_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        list: action.result.response,
        total: action.result.totalCount,
      });
    case LOAD_JOB_OPENINGS_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
      });
    case UPDATE_ACTIVE_OPENINGS_TAB:
      return Object.assign({}, state, {
        active: action.active,
      });
    case UPDATE_SEARCH_ACTIVE:
      return Object.assign({}, state, {
        searching: action.searching,
      });
    case UPDATE_SEARCH_STRING:
      return Object.assign({}, state, {
        searchString: action.value,
      });
    case TOGGLE_SIDEBAR:
      return Object.assign({}, state, {
        sideBarOpen: !state.sideBarOpen,
      });
    case UPDATE_CURRENT_JOB_OPENING:
      return Object.assign({}, state, {
        currentJobId: action.jobOpeningId,
      });
    case FETCH_JOB_DETAIL:
      return Object.assign({}, state, {
        jobDetailsLoading: true,
        name: '',
        vacancies: 0,
        type: '',
        priority: '',
        startDate: '',
        endDate: '',
        isAssigned: false,
        salesReps: [],
        recruiters: [],
        categories: [],
        openingLocations: [],
        positions: [],
        keywords: '',
        skills: [],
        language: [],
        location: [],
        radius: 0,
        experience: '',
        sources: [],
      });
    case FETCH_JOB_DETAIL_SUCCESS:
      // const { jobTitle, vacancies, type, priority, openinglocations, recruiters, sales,
      //   jobCategories, isAssigned, filters, startDate, endDate } = action.result;
      return Object.assign({}, state, {
        jobDetailsLoading: false,
        name: action.result.jobTitle,
        vacancies: action.result.vacancies || 0,
        type: action.result.type || '',
        priority: action.result.priority || '',
        startDate: action.result.startDate || '',
        endDate: action.result.endDate || '',
        openingLocations: action.result.openinglocations ?
          action.result.openinglocations.map(location => location.name) : [],
        categories: action.result.jobCategories ? action.result.jobCategories.map(category => category.name) : [],
        isAssigned: action.result.isAssigned,
        positions: action.result.filters.positions ?
          action.result.filters.positions.map(position => position.name) : [],
        keywords: action.result.filters.keywords,
        skills: action.result.filters.skills ? action.result.filters.skills.map(skill => skill.name) : [],
        language: action.result.filters.languages ? action.result.filters.languages.map(language => language.name) : [],
        location: action.result.filters.location ? action.result.filters.location.map(location => location.name) : [],
        sources: action.result.filters.source ? action.result.filters.source.map(source => source.id) : [],
        radius: action.result.filters.preferredRadius ? action.result.filters.preferredRadius : 0,
        experience: action.result.filters.experience ?
          `${action.result.filters.experience[0]} - ${action.result.filters.experience[1]}` : '',
        recruiters: action.result.recruiters,
        salesReps: action.result.sales,
      });
    case FETCH_JOB_DETAIL_ERROR:
      return Object.assign({}, state, {
        jobDetailsLoading: false,
      });
    case ARCHIVE_JOB_OPENING_SUCCESS:
      return Object.assign({}, state, {
        sideBarOpen: false,
      });
    case ARCHIVE_JOB_OPENING_ERROR:
      return Object.assign({}, state, {
        sideBarOpen: false,
      });
    case UPDATE_ASSIGNING_JOB_OPENING:
      return Object.assign({}, state, {
        assigning: action.assigning,
      });
    case FETCH_RECRUITERS_LIST_SUCCESS:
      return Object.assign({}, state, {
        recruitersList: action.result,
      });
    case FETCH_SALES_REPS_LIST_SUCCESS:
      return Object.assign({}, state, {
        salesRepList: action.result,
      });
    case UPDATE_SEARCH_VALUE:
      return Object.assign({}, state, action.isRecruiter ? {
        recruiterSearchValue: action.searchValue,
      } : {
        repSearchValue: action.searchValue,
      });
    case POPULATE_EXISTING_USERS:
      return Object.assign({}, state, {
        activeRecruiters: action.recruiters,
        activeSalesReps: action.salesReps,
      });
    case ON_RECRUITER_SEARCH_SELECT:
      if (_.isArray(action.recruiters)) {
        activeRecruitersArr = [...action.recruiters];
      } else if (state.activeRecruiters.find(recruiter => recruiter.id === action.recruiters.id) === undefined) {
        activeRecruitersArr = [...state.activeRecruiters, action.recruiters];
      } else {
        activeRecruitersArr = state.activeRecruiters;
      }
      return Object.assign({}, state, {
        activeRecruiters: activeRecruitersArr
      });
    case ON_REPS_SEARCH_SELECT:
      if (_.isArray(action.salesReps)) {
        activeSalesRepsArr = [...action.salesReps];
      } else if (state.activeSalesReps.filter(rep => rep.id === action.salesReps.id)[0] === undefined) {
        activeSalesRepsArr = [...state.activeSalesReps, action.salesReps];
      } else {
        activeSalesRepsArr = state.activeSalesReps;
      }
      return Object.assign({}, state, {
        activeSalesReps: activeSalesRepsArr
      });
    case ON_RECRUITER_DELETE:
      return Object.assign({}, state, {
        activeRecruiters: state.activeRecruiters.filter((recruiter, index) => index !== action.index)
      });
    case ON_REP_DELETE:
      return Object.assign({}, state, {
        activeSalesReps: state.activeSalesReps.filter((rep, index) => index !== action.index)
      });
    case CLEAR_JOB_ASSIGN_STATE:
      return Object.assign({}, state, {
        recruitersList: [],
        salesRepList: [],
        activeRecruiters: [],
        activeSalesReps: [],
        recruiterSearchValue: '',
        repSearchValue: '',
      });
    case CLEAR_VIEW_JOB_STATE:
      return Object.assign({}, state, {
        name: '',
        vacancies: 0,
        type: '',
        priority: '',
        startDate: '',
        endDate: '',
        isAssigned: false,
        salesReps: [],
        recruiters: [],
        categories: [],
        openingLocations: [],
        positions: [],
        keywords: '',
        skills: [],
        language: [],
        location: [],
        radius: 0,
        experience: '',
        sources: [],
      });
    case ANALYSIS_COMPANY_SEARCH:
      return Object.assign({}, state, {
        loading: true,
        companyList: null
      });
    case ANALYSIS_COMPANY_SEARCH_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        companyList: action.result.customers,
        total: action.result.totalCount,
      });
    case ANALYSIS_COMPANY_SEARCH_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
      });
    case ANALYSIS_CONTACT_SEARCH:
      return Object.assign({}, state, {
        loading: true
      });
    case ANALYSIS_CONTACT_SEARCH_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        contactList: action.result.contacts,
        total: action.result.totalCount,
      });
    case ANALYSIS_CONTACT_SEARCH_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
      });
    case ANALYSIS_ACCOUNT_SEARCH:
      return Object.assign({}, state, {
        loading: true
      });
    case ANALYSIS_ACCOUNT_SEARCH_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        AccountList: action.result,
        total: action.result.totalCount,
      });
    case ANALYSIS_ACCOUNT_SEARCH_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
      });
    case ANALYSIS_JOB_OPENINGS:
      return Object.assign({}, state, {
        analysisJobOpeningsLoading: true,        
        loading: true,
        openingList: [],
        loaded: false
      });
    case ANALYSIS_JOB_OPENINGS_SUCCESS:
      return Object.assign({}, state, {
        analysisJobOpeningsLoading: false,
        loaded: true,
        loading: false,
        openingList: action.result.data,
        analysisJobOpeningsTotal: action.result.count,
      });
    case ANALYSIS_JOB_OPENINGS_ERROR:
      return Object.assign({}, state, {
        analysisJobOpeningsLoading: false,
        error: action.error,
        openingList: []
      });
    case CLEAR_ALL:
      return initialState;
    default:
      return state;
  }
}

export const loadOpenings = filter => ({
  types: [LOAD_JOB_OPENINGS, LOAD_JOB_OPENINGS_SUCCESS, LOAD_JOB_OPENINGS_ERROR],
  promise: ({ client }) => client.get(`/jobOpenings/manageJobOpenings?filter=${JSON.stringify(filter)}`)
});

export const updateJobOpeningsTab = active => ({
  type: UPDATE_ACTIVE_OPENINGS_TAB,
  active,
});

export const updateJobOpeningsSearch = searching => ({
  type: UPDATE_SEARCH_ACTIVE,
  searching,
});

export const updateJobOpeningsSearchString = value => ({
  type: UPDATE_SEARCH_STRING,
  value,
});

export const toggleSideBar = () => ({
  type: TOGGLE_SIDEBAR,
});

export const updateCurrentJobOpening = jobOpeningId => ({
  type: UPDATE_CURRENT_JOB_OPENING,
  jobOpeningId,
});

export const loadJobDetails = jobId => ({
  types: [FETCH_JOB_DETAIL, FETCH_JOB_DETAIL_SUCCESS, FETCH_JOB_DETAIL_ERROR],
  promise: ({ client }) => client.get(`/jobOpenings/lists/${jobId}`)
});

export const archiveJobOpening = jobId => ({
  types: [ARCHIVE_JOB_OPENING, ARCHIVE_JOB_OPENING_SUCCESS, ARCHIVE_JOB_OPENING_ERROR],
  promise: ({ client }) => client.patch(`/jobOpenings/archive/${jobId}`)
});

export const getRecruitersList = () => ({
  types: [FETCH_RECRUITERS_LIST, FETCH_RECRUITERS_LIST_SUCCESS, FETCH_RECRUITERS_LIST_ERROR],
  promise: ({ client }) => client.get('/users/recruiters')
});

export const getSalesRepList = () => {
  const data = {
    roles: [{ name: 'Sales Rep' }]
  };
  return {
    types: [FETCH_SALES_REPS_LIST, FETCH_SALES_REPS_LIST_SUCCESS, FETCH_SALES_REPS_LIST_ERROR],
    promise: ({ client }) => client.post('/users/lists', { data })
  };
};

export const updateAssigning = assigning => (
  {
    type: UPDATE_ASSIGNING_JOB_OPENING,
    assigning,
  }
);

export const updateSearchValue = (searchValue, isRecruiter) => (
  {
    type: UPDATE_SEARCH_VALUE,
    searchValue,
    isRecruiter,
  }
);

export const populateExistingUsers = (recruiters, salesReps) => (
  {
    type: POPULATE_EXISTING_USERS,
    recruiters,
    salesReps,
  }
);

export const onRecruiterSelect = recruiters => (
  {
    type: ON_RECRUITER_SEARCH_SELECT,
    recruiters,
  }
);

export const onSalesRepSelect = salesReps => (
  {
    type: ON_REPS_SEARCH_SELECT,
    salesReps,
  }
);

export const deleteRecruiter = index => (
  {
    type: ON_RECRUITER_DELETE,
    index,
  }
);

export const deleteSalesRep = index => (
  {
    type: ON_REP_DELETE,
    index,
  }
);

export const assignJobOpening = (jobId, activeRecruiters, recruiters, activeSalesReps, salesReps, user) => {
  const data = {
    jobId,
    recruiters: activeRecruiters
      .filter(activeRecruiter => recruiters.find(recruiter => recruiter.id === activeRecruiter.id) === undefined)
      .map(recruiter => recruiter.id),
    salesReps: activeSalesReps
      .filter(activeSalesRep => salesReps.find(rep => rep.id === activeSalesRep.id) === undefined)
      .map(rep => rep.id),
    delRecruitersIds: recruiters
      .filter(recruiter => activeRecruiters.find(activeRecruiter => activeRecruiter.id === recruiter.id) === undefined)
      .map(recruiter => recruiter.id),
    delSalesRepIds: salesReps
      .filter(salesRep => activeSalesReps.find(rep => rep.id === salesRep.id) === undefined)
      .map(rep => rep.id),
    assignedBy: user,
  };
  return {
    types: [ASSIGN_JOB_OPENING, ASSIGN_JOB_OPENING_SUCCESS, ASSIGN_JOB_OPENING_ERROR],
    promise: ({ client }) => client.post('/jobOpenings/assign', { data })
  };
};

export const clearViewState = () => (
  {
    type: CLEAR_VIEW_JOB_STATE,
  }
);

export const clearAssign = () => (
  {
    type: CLEAR_JOB_ASSIGN_STATE,
  }
);
export const analysisCompany = data => ({
  types: [ANALYSIS_COMPANY_SEARCH, ANALYSIS_COMPANY_SEARCH_SUCCESS, ANALYSIS_COMPANY_SEARCH_ERROR],
  promise: ({ client }) => client.post('/customers/lists', { data })
});
export const analysisContactSearch = companyid => ({
  types: [ANALYSIS_CONTACT_SEARCH, ANALYSIS_CONTACT_SEARCH_SUCCESS, ANALYSIS_CONTACT_SEARCH_ERROR],
  promise: ({ client }) => client.get(`/customers/view/${companyid}`)
});
export const analysisAccountSearch = id => {
  const data = { companyid: id };
  return {
    types: [ANALYSIS_ACCOUNT_SEARCH, ANALYSIS_ACCOUNT_SEARCH_SUCCESS, ANALYSIS_ACCOUNT_SEARCH_ERROR],
    promise: ({ client }) => client.post('users/listowners', { data })
  };
};
export const analysisJobOpenings = data => ({
  types: [ANALYSIS_JOB_OPENINGS, ANALYSIS_JOB_OPENINGS_SUCCESS, ANALYSIS_JOB_OPENINGS_ERROR],
  promise: ({ client }) => client.post('jobOpenings/listJobOpenings', { data })
});
export const clearAll = () => (
  {
    type: CLEAR_ALL,
  }
);
