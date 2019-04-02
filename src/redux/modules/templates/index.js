const LOAD_TEMPLATES = 'templates/LOAD_TEMPLATE';
const LOAD_TEMPLATES_SUCCESS = 'templates/LOAD_TEMPLATE_SUCCESS';
const LOAD_TEMPLATES_FAIL = 'templates/LOAD_TEMPLATE_FAIL';
const SAVE_TEMPLATE = 'templates/SAVE_TEMPLATE';
const SAVE_TEMPLATE_SUCCESS = 'templates/SAVE_TEMPLATE_SUCCESS';
const SAVE_TEMPLATE_FAIL = 'templates/SAVE_TEMPLATE_FAIL';
const UPDATE_TEMPLATE = 'templates/UPDATE_TEMPLATE';
const UPDATE_TEMPLATE_SUCCESS = 'templates/UPDATE_TEMPLATE_SUCCESS';
const UPDATE_TEMPLATE_FAIL = 'templates/UPDATE_TEMPLATE_FAIL';
const DELETE_TEMPLATE = 'templates/DELETE_TEMPLATE';
const DELETE_TEMPLATE_SUCCESS = 'templates/DELETE_TEMPLATE_SUCCESS';
const DELETE_TEMPLATE_FAIL = 'templates/DELETE_TEMPLATE_FAIL';
const GET_TEMPLATE = 'templates/GET_TEMPLATE';
const GET_TEMPLATE_SUCCESS = 'templates/GET_TEMPLATE_SUCCESS';
const GET_TEMPLATE_FAIL = 'templates/GET_TEMPLATE_FAIL';

const initialState = {
  loading: null,
  loaded: null,
  templates: [],
  error: null,
  template: null
};

const filterDeletedTemplates = (templates, template) => (
  templates.filter(temp => temp.id !== template.id)
);

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_TEMPLATES:
      return {
        ...state,
        loading: true,
        error: null
      };
    case LOAD_TEMPLATES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        templates: action.result.templates,
        totalCount: action.result.totalCount,
        error: null
      };
    case LOAD_TEMPLATES_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error.error
      };

    case SAVE_TEMPLATE:
      return {
        ...state,
        saving: true,
        error: null
      };
    case SAVE_TEMPLATE_SUCCESS:
      return {
        ...state,
        saving: false,
        saved: true,
        error: null
      };
    case SAVE_TEMPLATE_FAIL:
      return {
        ...state,
        saving: false,
        saved: false,
        error: action.error.error
      };
    case UPDATE_TEMPLATE:
      return {
        ...state,
        updating: true,
        error: null
      };
    case UPDATE_TEMPLATE_SUCCESS:
      return {
        ...state,
        updating: false,
        updated: true,
        error: null
      };
    case UPDATE_TEMPLATE_FAIL:
      return {
        ...state,
        updating: false,
        updated: false,
        error: action.error.error
      };

    case DELETE_TEMPLATE:
      return {
        ...state,
        deleting: true,
        error: null
      };
    case DELETE_TEMPLATE_SUCCESS:
      return {
        ...state,
        deleting: false,
        deleted: true,
        templates: filterDeletedTemplates(state.templates, action.result),
        error: null
      };
    case DELETE_TEMPLATE_FAIL:
      return {
        ...state,
        deleting: false,
        deleted: false,
        error: action.error.error
      };
    case GET_TEMPLATE:
      return {
        ...state,
        loading: true,
        error: null
      };
    case GET_TEMPLATE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        template: action.result,
        error: null
      };
    case GET_TEMPLATE_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error.error
      };
    default:
      return state;
  }
}

export function loadTemplates(filter) {
  const query = JSON.stringify(filter);
  return {
    types: [
      LOAD_TEMPLATES, LOAD_TEMPLATES_SUCCESS, LOAD_TEMPLATES_FAIL
    ],
    promise: ({ client }) => client.get(`/Templates/lists?filter=${query}`)
  };
}

export function saveTemplate(template) {
  return {
    types: [
      SAVE_TEMPLATE, SAVE_TEMPLATE_SUCCESS, SAVE_TEMPLATE_FAIL
    ],
    promise: ({ client }) => client.post('/Templates', { data: template })
  };
}

export function updateTemplate(template) {
  return {
    types: [
      UPDATE_TEMPLATE, UPDATE_TEMPLATE_SUCCESS, UPDATE_TEMPLATE_FAIL
    ],
    promise: ({ client }) => client.patch('/Templates', { data: template })
  };
}

export function deleteTemplate(id) {
  return {
    types: [
      DELETE_TEMPLATE, DELETE_TEMPLATE_SUCCESS, DELETE_TEMPLATE_FAIL
    ],
    promise: ({ client }) => client.patch(`/Templates/${id}`, { data: { isDeleted: true } })
  };
}

export function getTemplate(id) {
  return {
    types: [
      GET_TEMPLATE, GET_TEMPLATE_SUCCESS, GET_TEMPLATE_FAIL
    ],
    promise: ({ client }) => client.get(`/Templates/${id}`)
  };
}
