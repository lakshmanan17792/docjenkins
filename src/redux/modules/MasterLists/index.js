import parser from '../Parser';

const LOAD_MASTER_SKILL = 'masterLists/LOAD_MASTER_SKILL';
const LOAD_MASTER_SKILL_SUCCESS = 'masterLists/LOAD_MASTER_SKILL_SUCCESS';
const LOAD_MASTER_SKILL_FAIL = 'masterLists/LOAD_MASTER_SKILL_FAIL';

const LOAD_MASTER_POSITION = 'masterLists/LOAD_MASTER_POSITION';
const LOAD_MASTER_POSITION_SUCCESS = 'masterLists/LOAD_MASTER_POSITION_SUCCESS';
const LOAD_MASTER_POSITION_FAIL = 'masterLists/LOAD_MASTER_POSITION_FAIL';

const LOAD_MASTER_TAG = 'masterLists/LOAD_MASTER_TAG';
const LOAD_MASTER_TAG_SUCCESS = 'masterLists/LOAD_MASTER_TAG_SUCCESS';
const LOAD_MASTER_TAG_FAIL = 'masterLists/LOAD_MASTER_TAG_FAIL';

const LOAD_MASTER_REASON = 'masterLists/LOAD_MASTER_REASON';
const LOAD_MASTER_REASON_SUCCESS = 'masterLists/LOAD_MASTER_REASON_SUCCESS';
const LOAD_MASTER_REASON_FAIL = 'masterLists/LOAD_MASTER_REASON_FAIL';

const ADD_MASTER_SKILL = 'masterLists/ADD_MASTER_SKILL';
const ADD_MASTER_SKILL_SUCCESS = 'masterLists/ADD_MASTER_SKILL_SUCCESS';
const ADD_MASTER_SKILL_FAIL = 'masterLists/ADD_MASTER_SKILL_FAIL';

const ADD_MASTER_POSITION = 'masterLists/ADD_MASTER_POSITION';
const ADD_MASTER_POSITION_SUCCESS = 'masterLists/ADD_MASTER_POSITION_SUCCESS';
const ADD_MASTER_POSITION_FAIL = 'masterLists/ADD_MASTER_POSITION_FAIL';

const ADD_MASTER_TAG = 'masterLists/ADD_MASTER_TAG';
const ADD_MASTER_TAG_SUCCESS = 'masterLists/ADD_MASTER_TAG_SUCCESS';
const ADD_MASTER_TAG_FAIL = 'masterLists/ADD_MASTER_TAG_FAIL';

const ADD_MASTER_REASON = 'masterLists/ADD_MASTER_REASON';
const ADD_MASTER_REASON_SUCCESS = 'masterLists/ADD_MASTER_REASON_SUCCESS';
const ADD_MASTER_REASON_FAIL = 'masterLists/ADD_MASTER_REASON_FAIL';

const INITIATE_REINDEX = 'masterLists/INITIATE_REINDEX';
const INITIATE_REINDEX_SUCCESS = 'masterLists/INITIATE_REINDEX_SUCCESS';
const INITIATE_REINDEX_FAIL = 'masterLists/INITIATE_REINDEX_FAIL';

const REINDEX_STATUS = 'masterLists/REINDEX_STATUS';
const REINDEX_STATUS_SUCCESS = 'masterLists/REINDEX_STATUS_SUCCESS';
const REINDEX_STATUS_FAIL = 'masterLists/REINDEX_STATUS_FAIL';


const LOAD_REINDEX_SOURCE_LIST = 'masterLists/LOAD_REINDEX_SOURCE_LIST';
const LOAD_REINDEX_SOURCE_LIST_SUCCESS = 'masterLists/LOAD_REINDEX_SOURCE_LIST_SUCCESS';
const LOAD_REINDEX_SOURCE_LIST_FAIL = 'masterLists/LOAD_REINDEX_SOURCE_LIST_FAIL';

const initialState = {
  loading: null,
  loaded: null,
  totalCount: 0,
  skillTotalCount: 0,
  positionTotalCount: 0,
  reIndexResponse: {},
  sourceListResponse: {
    skill_details: {},
    position_details: {}
  }
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_MASTER_SKILL:
      return {
        ...state,
        loading: true
      };
    case LOAD_MASTER_SKILL_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        skillTotalCount: action.result.total,
        skillList: action.result.data
      };
    case LOAD_MASTER_SKILL_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_MASTER_POSITION:
      return {
        ...state,
        loading: true
      };
    case LOAD_MASTER_POSITION_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        positionTotalCount: action.result.total,
        positionList: action.result.data
      };
    case LOAD_MASTER_POSITION_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_MASTER_TAG:
      return {
        ...state,
        loading: true
      };
    case LOAD_MASTER_TAG_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        tagTotalCount: action.result.total,
        tagList: action.result.data,
        tagTypes: parser.changeLocalization(action.result.metaData, 'name')
      };
    case LOAD_MASTER_TAG_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOAD_MASTER_REASON:
      return {
        ...state,
        loading: true
      };
    case LOAD_MASTER_REASON_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        reasonTotalCount: action.result.total,
        reasonList: parser.changeLocalization(action.result.data, 'type'),
        reasonTypes: parser.changeLocalization(action.result.metaData, 'name')
      };
    case LOAD_MASTER_REASON_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case ADD_MASTER_SKILL:
      return {
        ...state,
        loading: true
      };
    case ADD_MASTER_SKILL_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        response: action.result
      };
    case ADD_MASTER_SKILL_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case ADD_MASTER_POSITION:
      return {
        ...state,
        loading: true
      };
    case ADD_MASTER_POSITION_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        response: action.result
      };
    case ADD_MASTER_POSITION_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case ADD_MASTER_TAG:
      return {
        ...state,
        loading: true
      };
    case ADD_MASTER_TAG_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        response: action.result
      };
    case ADD_MASTER_TAG_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case ADD_MASTER_REASON:
      return {
        ...state,
        loading: true
      };
    case ADD_MASTER_REASON_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        response: action.result
      };
    case ADD_MASTER_REASON_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case INITIATE_REINDEX:
      return {
        ...state,
        loading: true
      };
    case INITIATE_REINDEX_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        reIndexResponse: action.result
      };
    case INITIATE_REINDEX_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case REINDEX_STATUS:
      return {
        ...state,
      };
    case REINDEX_STATUS_SUCCESS:
      return {
        ...state,
        reIndexResponse: action.result
      };
    case REINDEX_STATUS_FAIL:
      return {
        ...state,
        error: action.error
      };
    case LOAD_REINDEX_SOURCE_LIST:
      return {
        ...state,
      };
    case LOAD_REINDEX_SOURCE_LIST_SUCCESS:
      return {
        ...state,
        sourceListResponse: action.result
      };
    case LOAD_REINDEX_SOURCE_LIST_FAIL:
      return {
        ...state,
        error: action.error
      };

    default: return state;
  }
}

export const loadMasterSkills = queryObject => ({
  types: [LOAD_MASTER_SKILL, LOAD_MASTER_SKILL_SUCCESS, LOAD_MASTER_SKILL_FAIL],
  promise: ({ client }) => client.get(`/skills/search?filter=${JSON.stringify(queryObject)}`)
});

export const loadMasterPositions = queryObject => ({
  types: [LOAD_MASTER_POSITION, LOAD_MASTER_POSITION_SUCCESS, LOAD_MASTER_POSITION_FAIL],
  promise: ({ client }) => client.get(`/positions/search?filter=${JSON.stringify(queryObject)}`)
});

export const loadMasterTags = data => ({
  types: [LOAD_MASTER_TAG, LOAD_MASTER_TAG_SUCCESS, LOAD_MASTER_TAG_FAIL],
  promise: ({ client }) => client.post('/tags/lists', { data })
});

export const loadMasterReasons = data => ({
  types: [LOAD_MASTER_REASON, LOAD_MASTER_REASON_SUCCESS, LOAD_MASTER_REASON_FAIL],
  promise: ({ client }) => client.post('/reasons/lists', { data })
});

export const addMasterSkill = data => ({
  types: [ADD_MASTER_SKILL, ADD_MASTER_SKILL_SUCCESS, ADD_MASTER_SKILL_FAIL],
  promise: ({ client }) => client.post('/skills/saveOrUpdate', { data })
});

export const addMasterPosition = data => ({
  types: [ADD_MASTER_POSITION, ADD_MASTER_POSITION_SUCCESS, ADD_MASTER_POSITION_FAIL],
  promise: ({ client }) => client.post('/positions/saveOrUpdate', { data })
});

export const addMasterTag = data => ({
  types: [ADD_MASTER_TAG, ADD_MASTER_TAG_SUCCESS, ADD_MASTER_TAG_FAIL],
  promise: ({ client }) => client.post('/tags/create', { data })
});

export const addMasterReason = data => ({
  types: [ADD_MASTER_REASON, ADD_MASTER_REASON_SUCCESS, ADD_MASTER_REASON_FAIL],
  promise: ({ client }) => client.post('/reasons/create-reason', { data })
});

export const updateMasterReason = (data, id) => ({
  types: [ADD_MASTER_REASON, ADD_MASTER_REASON_SUCCESS, ADD_MASTER_REASON_FAIL],
  promise: ({ client }) => client.patch(`/reasons/update/${id}`, { data })
});

export const updateMasterTag = (data, id) => ({
  types: [ADD_MASTER_TAG, ADD_MASTER_TAG_SUCCESS, ADD_MASTER_TAG_FAIL],
  promise: ({ client }) => client.patch(`/tags/update/${id}`, { data })
});

export const initiateReIndex = () => ({
  types: [INITIATE_REINDEX, INITIATE_REINDEX_SUCCESS, INITIATE_REINDEX_FAIL],
  promise: ({ client }) => client.get('/settings/reindex/start')
});


export const getReIndexStatus = () => ({
  types: [REINDEX_STATUS, REINDEX_STATUS_SUCCESS, REINDEX_STATUS_FAIL],
  promise: ({ client }) => client.get('/settings/reindex/status')
});


export const loadReIndexSourceList = () => ({
  types: [LOAD_REINDEX_SOURCE_LIST, LOAD_REINDEX_SOURCE_LIST_SUCCESS, LOAD_REINDEX_SOURCE_LIST_FAIL],
  promise: ({ client }) => client.get('/settings/reindex/toBeReindexed')
});
