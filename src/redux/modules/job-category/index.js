const LOAD_JOB_CATEGORY = 'openings/LOAD_JOB_CATEGORY';
const LOAD_JOB_CATEGORY_SUCCESS = 'openings/LOAD_JOB_CATEGORY_SUCCESS';
const LOAD_JOB_CATEGORY_FAIL = 'openings/LOAD_JOB_CATEGORY_FAIL';

const ADD_JOB_CATEGORY = 'openings/ADD_JOB_CATEGORY';
const ADD_JOB_CATEGORY_SUCCESS = 'openings/ADD_JOB_CATEGORY_SUCCESS';
const ADD_JOB_CATEGORY_FAIL = 'openings/ADD_JOB_CATEGORY_FAIL';

const UPDATE_JOB_CATEGORY = 'openings/UPDATE_JOB_CATEGORY';
const UPDATE_JOB_CATEGORY_SUCCESS = 'openings/UPDATE_JOB_CATEGORY_SUCCESS';
const UPDATE_JOB_CATEGORY_FAIL = 'openings/UPDATE_JOB_CATEGORY_FAIL';

const DELETE_JOB_CATEGORY = 'openings/DELETE_JOB_CATEGORY';
const DELETE_JOB_CATEGORY_SUCCESS = 'openings/DELETE_JOB_CATEGORY_SUCCESS';
const DELETE_JOB_CATEGORY_FAIL = 'openings/DELETE_JOB_CATEGORY_FAIL';

const initialState = {
  loading: null,
  loaded: null,
  addResponse: null,
  updateResponse: null,
  deleteResponse: null,
  categoryList: [],
  totalCount: 0
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_JOB_CATEGORY:
      return {
        ...state,
        loading: true,
      };
    case LOAD_JOB_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        categoryList: action.result.categories,
        totalCount: action.result.count
      };
    case LOAD_JOB_CATEGORY_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case ADD_JOB_CATEGORY:
      return {
        ...state,
        loading: true,
      };
    case ADD_JOB_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        addResponse: action.result,
      };
    case ADD_JOB_CATEGORY_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case UPDATE_JOB_CATEGORY:
      return {
        ...state,
        loading: true,
      };
    case UPDATE_JOB_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        updateResponse: action.result,
      };
    case UPDATE_JOB_CATEGORY_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    case DELETE_JOB_CATEGORY:
      return {
        ...state,
        loading: true,
      };
    case DELETE_JOB_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        deleteResponse: action.result,
      };
    case DELETE_JOB_CATEGORY_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false
      };
    default:
      return state;
  }
}

/*
* Actions
* * * * */
export function loadJobCategory(param) {
  return {
    types: [LOAD_JOB_CATEGORY, LOAD_JOB_CATEGORY_SUCCESS, LOAD_JOB_CATEGORY_FAIL],
    promise: ({ client }) => client.get(`/jobCategories?filter=${encodeURIComponent(JSON.stringify(param))}`)
  };
}

export function loadJobCategoryList(data) {
  return {
    types: [LOAD_JOB_CATEGORY, LOAD_JOB_CATEGORY_SUCCESS, LOAD_JOB_CATEGORY_FAIL],
    promise: ({ client }) => client.post('/jobCategories/list', { data })
  };
}

export function addJobCategory(jobCategoryData) {
  return {
    types: [ADD_JOB_CATEGORY, ADD_JOB_CATEGORY_SUCCESS, ADD_JOB_CATEGORY_FAIL],
    promise: ({ client }) => client.post('/jobCategories', { data: jobCategoryData })
  };
}

export function updateJobCategory(id, jobCategoryData) {
  return {
    types: [UPDATE_JOB_CATEGORY, UPDATE_JOB_CATEGORY_SUCCESS, UPDATE_JOB_CATEGORY_FAIL],
    promise: ({ client }) => client.patch(`/jobCategories/${id}`, { data: jobCategoryData })
  };
}

export function deleteJobCategory(id) {
  return {
    types: [DELETE_JOB_CATEGORY, DELETE_JOB_CATEGORY_SUCCESS, DELETE_JOB_CATEGORY_FAIL],
    promise: ({ client }) => client.del(`/jobCategories/${id}`)
  };
}
