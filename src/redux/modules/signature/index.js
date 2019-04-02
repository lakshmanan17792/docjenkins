const LOAD_SIGNATURES = 'signatures/LOAD_SIGNATURE';
const LOAD_SIGNATURES_SUCCESS = 'signatures/LOAD_SIGNATURE_SUCCESS';
const LOAD_SIGNATURES_SUCCESS_DEFAULT = 'signatures/LOAD_SIGNATURES_SUCCESS_DEFAULT';
const LOAD_SIGNATURES_FAIL = 'signatures/LOAD_SIGNATURE_FAIL';
const SAVE_SIGNATURE = 'signatures/SAVE_SIGNATURE';
const SAVE_SIGNATURE_SUCCESS = 'signatures/SAVE_SIGNATURE_SUCCESS';
const SAVE_SIGNATURE_FAIL = 'signatures/SAVE_SIGNATURE_FAIL';
const UPDATE_SIGNATURE = 'signatures/UPDATE_SIGNATURE';
const UPDATE_SIGNATURE_SUCCESS = 'signatures/UPDATE_SIGNATURE_SUCCESS';
const UPDATE_SIGNATURE_FAIL = 'signatures/UPDATE_SIGNATURE_FAIL';
const DELETE_SIGNATURE = 'signatures/DELETE_SIGNATURE';
const DELETE_SIGNATURE_SUCCESS = 'signatures/DELETE_SIGNATURE_SUCCESS';
const DELETE_SIGNATURE_FAIL = 'signatures/DELETE_SIGNATURE_FAIL';
const GET_SIGNATURE = 'signatures/GET_SIGNATURE';
const GET_SIGNATURE_SUCCESS = 'signatures/GET_SIGNATURE_SUCCESS';
const GET_SIGNATURE_FAIL = 'signatures/GET_SIGNATURE_FAIL';

const initialState = {
  loading: null,
  loaded: null,
  signatures: [],
  signaturesDefault: [],
  signature: {},
  error: null
};

const filterDeletedSignatures = (signatures, signature) => (
  signatures.filter(sign => sign.id !== signature.id)
);

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_SIGNATURES:
      return {
        ...state,
        loading: true,
        error: null
      };
    case LOAD_SIGNATURES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        signatures: action.result.signatures,
        totalCount: action.result.totalCount,
        error: null
      };
    case LOAD_SIGNATURES_SUCCESS_DEFAULT:
      return {
        ...state,
        loading: false,
        loaded: true,
        signaturesDefault: action.result,
        error: null
      };
    case LOAD_SIGNATURES_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error.error
      };
    case SAVE_SIGNATURE:
      return {
        ...state,
        saving: true,
        error: null
      };
    case SAVE_SIGNATURE_SUCCESS:
      return {
        ...state,
        saving: false,
        saved: true,
        error: null
      };
    case SAVE_SIGNATURE_FAIL:
      return {
        ...state,
        saving: false,
        saved: false,
        error: action.error.error
      };
    case UPDATE_SIGNATURE:
      return {
        ...state,
        updating: true,
        error: null
      };
    case UPDATE_SIGNATURE_SUCCESS:
      return {
        ...state,
        updating: false,
        updated: true,
        error: null
      };
    case UPDATE_SIGNATURE_FAIL:
      return {
        ...state,
        updating: false,
        updated: false,
        error: action.error.error
      };
    case DELETE_SIGNATURE:
      return {
        ...state,
        deleting: true,
        error: null
      };
    case DELETE_SIGNATURE_SUCCESS:
      return {
        ...state,
        deleting: false,
        deleted: true,
        signatures: filterDeletedSignatures(state.signatures, action.result),
        error: null
      };
    case DELETE_SIGNATURE_FAIL:
      return {
        ...state,
        deleting: false,
        deleted: false,
        error: action.error.error
      };
    case GET_SIGNATURE:
      return {
        ...state,
        loading: true,
        error: null
      };
    case GET_SIGNATURE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        signature: action.result,
        error: null
      };
    case GET_SIGNATURE_FAIL:
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

export function loadSignatures(filter) {
  const query = JSON.stringify(filter);
  return {
    types: [
      LOAD_SIGNATURES, LOAD_SIGNATURES_SUCCESS, LOAD_SIGNATURES_FAIL
    ],
    promise: ({ client }) => client.get(`/Signatures/lists?filter=${query}`)
  };
}

export function loadSignaturesDefault(filter) {
  const query = JSON.stringify(filter);
  return {
    types: [
      LOAD_SIGNATURES, LOAD_SIGNATURES_SUCCESS_DEFAULT, LOAD_SIGNATURES_FAIL
    ],
    promise: ({ client }) => client.get(`/Signatures/?filter=${query}`)
  };
}

export function saveSignature(signature) {
  return {
    types: [
      SAVE_SIGNATURE, SAVE_SIGNATURE_SUCCESS, SAVE_SIGNATURE_FAIL
    ],
    promise: ({ client }) => client.post('/Signatures/save', { data: signature })
  };
}

export function updateSignature(signature) {
  return {
    types: [
      UPDATE_SIGNATURE, UPDATE_SIGNATURE_SUCCESS, UPDATE_SIGNATURE_FAIL
    ],
    promise: ({ client }) => client.post('/Signatures/update', { data: signature })
  };
}

export function deleteSignature(id) {
  return {
    types: [
      DELETE_SIGNATURE, DELETE_SIGNATURE_SUCCESS, DELETE_SIGNATURE_FAIL
    ],
    promise: ({ client }) => client.patch(`/Signatures/${id}`, { data: { isDeleted: true } })
  };
}

export function getSignature(id) {
  return {
    types: [
      GET_SIGNATURE, GET_SIGNATURE_SUCCESS, GET_SIGNATURE_FAIL
    ],
    promise: ({ client }) => client.get(`/Signatures/${id}`)
  };
}
