// import { SubmissionError } from 'redux-form';

const ADD_NEW_USER = 'intelligent-talent-acquisition/user/form/ADD_NEW_USER';
const EDIT_USER = 'intelligent-talent-acquisition/user/form/EDIT_USER';
const CLOSE_FORM = 'intelligent-talent-acquisition/user/form/CLOSE_FORM';

const SAVE = 'intelligent-talent-acquisition/user/form/SAVE';
const SAVE_SUCCESS = 'intelligent-talent-acquisition/user/form/SAVE_SUCCESS';
const SAVE_FAIL = 'intelligent-talent-acquisition/user/form/SAVE_FAIL';

const INVITE = 'intelligent-talent-acquisition/user/form/INVITE';
const INVITE_SUCCESS = 'intelligent-talent-acquisition/user/form/INVITE_SUCCESS';
const INVITE_FAIL = 'intelligent-talent-acquisition/user/form/INVITE_FAIL';

const VERIFY_TOKEN = 'intelligent-talent-acquisition/user/form/VERIFY_TOKEN';
const VERIFY_TOKEN_SUCCESS = 'intelligent-talent-acquisition/user/form/VERIFY_TOKEN_SUCCESS';
const VERIFY_TOKEN_FAIL = 'intelligent-talent-acquisition/user/form/VERIFY_TOKEN_FAIL';

const VERIFY_RESET_TOKEN = 'intelligent-talent-acquisition/user/form/VERIFY_RESET_TOKEN';
const VERIFY_RESET_TOKEN_SUCCESS = 'intelligent-talent-acquisition/user/form/VERIFY_RESET_TOKEN_SUCCESS';
const VERIFY_RESET_TOKEN_FAIL = 'intelligent-talent-acquisition/user/form/VERIFY_RESET_TOKEN_FAIL';

const VERIFY_USERNAME = 'intelligent-talent-acquisition/user/form/VERIFY_USERNAME';
const VERIFY_USERNAME_SUCCESS = 'intelligent-talent-acquisition/user/form/VERIFY_USERNAME_SUCCESS';
const VERIFY_USERNAME_FAIL = 'intelligent-talent-acquisition/user/form/VERIFY_USERNAME_FAIL';

const REGISTER_USER = 'intelligent-talent-acquisition/user/form/REGISTER_USER';
const REGISTER_USER_SUCCESS = 'intelligent-talent-acquisition/user/form/REGISTER_USER_SUCCESS';
const REGISTER_USER_FAIL = 'intelligent-talent-acquisition/user/form/REGISTER_USER_FAIL';

const FORGOT_PASSWORD = 'intelligent-talent-acquisition/user/form/FORGOT_PASSWORD';
const FORGOT_PASSWORD_SUCCESS = 'intelligent-talent-acquisition/user/form/FORGOT_PASSWORD_SUCCESS';
const FORGOT_PASSWORD_FAIL = 'intelligent-talent-acquisition/user/form/FORGOT_PASSWORD_FAIL';

const RESET_PASSWORD = 'intelligent-talent-acquisition/user/form/RESET_PASSWORD';
const RESET_PASSWORD_SUCCESS = 'intelligent-talent-acquisition/user/form/RESET_PASSWORD_SUCCESS';
const RESET_PASSWORD_FAIL = 'intelligent-talent-acquisition/user/form/RESET_PASSWORD_FAIL';

const CHANGE_PASSWORD = 'intelligent-talent-acquisition/user/form/CHANGE_PASSWORD';
const CHANGE_PASSWORD_SUCCESS = 'intelligent-talent-acquisition/user/form/CHANGE_PASSWORD_SUCCESS';
const CHANGE_PASSWORD_FAIL = 'intelligent-talent-acquisition/user/form/CHANGE_PASSWORD_FAIL';

const UPDATE_USER = 'intelligent-talent-acquisition/user/form/UPDATE_USER';
const UPDATE_USER_SUCCESS = 'intelligent-talent-acquisition/user/form/UPDATE_USER_SUCCESS';
const UPDATE_USER_FAIL = 'intelligent-talent-acquisition/user/form/UPDATE_USER_FAIL';

const LOAD = 'intelligent-talent-acquisition/user/form/LOAD';
const LOAD_SUCCESS = 'intelligent-talent-acquisition/user/form/LOAD_SUCCESS';
const LOAD_FAIL = 'intelligent-talent-acquisition/user/form/LOAD_FAIL';

const LOAD_ROLES = 'intelligent-talent-acquisition/user/form/LOAD_ROLES';
const LOAD_ROLES_SUCCESS = 'intelligent-talent-acquisition/user/form/LOAD_ROLES_SUCCESS';
const LOAD_ROLES_FAIL = 'intelligent-talent-acquisition/user/form/LOAD_ROLES_FAIL';

const OPEN_INVITE_USER_MODAL = 'intelligent-talent-acquisition/user/form/OPEN_INVITE_USER_MODAL';
const CLOSE_INVITE_USER_MODAL = 'intelligent-talent-acquisition/user/form/CLOSE_INVITE_USER_MODAL';

const OPEN_USER_PROFILE_MODAL = 'intelligent-talent-acquisition/user/form/OPEN_USER_PROFILE_MODAL';
const CLOSE_USER_PROFILE_MODAL = 'intelligent-talent-acquisition/user/form/CLOSE_USER_PROFILE_MODAL';

const LOAD_USERS_NAMES = 'customers/LOAD_USERS_NAMES';
const LOAD_USERS_NAMES_SUCCESS = 'customers/LOADUSERS_NAMES_SUCCESS';
const LOAD_USERS_NAMES_FAIL = 'customers/LOADUSERS_NAMES_FAIL';

const initialState = {
  saved: false,
  loaded: false,
  inviting: false
};

export default function info(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NEW_USER:
      return {
        ...state,
        userFormMode: 'NEW'
      };
    case EDIT_USER:
      return {
        ...state,
        userFormMode: 'EDIT',
        user: action.user
      };
    case CLOSE_FORM:
      return {
        ...state,
        userFormMode: null,
        user: {}
      };
    case SAVE:
      return {
        ...state,
        saving: true,
        saved: false
      };
    case SAVE_SUCCESS:
      return {
        ...state,
        saving: false,
        saved: true
      };
    case SAVE_FAIL:
      return {
        ...state,
        saving: false,
        saved: false,
        error: 'Error in saving user'
      };
    case INVITE:
      return {
        ...state,
        inviting: true,
        saved: false,
      };
    case INVITE_SUCCESS:
      return {
        ...state,
        inviting: false,
        saved: true
      };
    case INVITE_FAIL:
      return {
        ...state,
        inviting: false,
        saved: false,
        error: 'Error in saving user'
      };
    case VERIFY_TOKEN:
      return {
        ...state,
        verifiying: true,
        verified: false
      };
    case VERIFY_TOKEN_SUCCESS:
      return {
        ...state,
        verifiying: false,
        verified: true,
        tokenUser: action.result
      };
    case VERIFY_TOKEN_FAIL:
      return {
        ...state,
        verifiying: false,
        verified: false,
        error: 'Error in verifiying user'
      };

    case VERIFY_RESET_TOKEN:
      return {
        ...state,
        verifiying: true,
        verified: false
      };
    case VERIFY_RESET_TOKEN_SUCCESS:
      return {
        ...state,
        verifiying: false,
        verified: true,
        token: action.result
      };
    case VERIFY_RESET_TOKEN_FAIL:
      return {
        ...state,
        verifiying: false,
        verified: false,
        error: 'Error in verifiying user'
      };
    case VERIFY_USERNAME:
      return {
        ...state,
        verifiying: true,
        verified: false
      };
    case VERIFY_USERNAME_SUCCESS:
      return {
        ...state,
        verifiying: false,
        verified: true,
        tokenUser: action.result
      };
    case VERIFY_USERNAME_FAIL:
      return {
        ...state,
        verifiying: false,
        verified: false,
        error: 'Error in verifiying username'
      };
    case REGISTER_USER:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case REGISTER_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case REGISTER_USER_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: 'Error in verifiying user'
      };
    case CHANGE_PASSWORD:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case CHANGE_PASSWORD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: 'Error in reseting password'
      };
    case RESET_PASSWORD:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case RESET_PASSWORD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: 'Error in reseting password'
      };
    case FORGOT_PASSWORD:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case FORGOT_PASSWORD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: 'Error in reseting password'
      };
    case UPDATE_USER:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    case UPDATE_USER_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: 'Error in updating user'
      };
    case LOAD:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        user: action.result,
        loading: false,
        loaded: true
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: 'Error in saving user'
      };
    case LOAD_ROLES:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case LOAD_ROLES_SUCCESS:
      return {
        ...state,
        userRoles: action.result,
        loading: false,
        loaded: true
      };
    case LOAD_ROLES_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: 'Error in loading roles'
      };
    case OPEN_INVITE_USER_MODAL:
      return {
        ...state,
        openInviteUserModal: true,
        saved: false
      };
    case CLOSE_INVITE_USER_MODAL:
      return {
        ...state,
        openInviteUserModal: false,
        saved: false
      };
    case OPEN_USER_PROFILE_MODAL:
      return {
        ...state,
        openUserProfileModal: true,
        saved: false
      };
    case CLOSE_USER_PROFILE_MODAL:
      return {
        ...state,
        openUserProfileModal: false,
        saved: false
      };
    case LOAD_USERS_NAMES: {
      return {
        ...state
      };
    }
    case LOAD_USERS_NAMES_SUCCESS: {
      return {
        ...state,
        users: action.result
      };
    }
    case LOAD_USERS_NAMES_FAIL: {
      return {
        ...state,
        users: action.error
      };
    }
    default:
      return state;
  }
}

// const catchValidation = error => {
//   if (error.message) {
//     if (error.message === 'Validation failed' && error.data) {
//       throw new SubmissionError(error.data);
//     }
//     throw new SubmissionError({ _error: error.message });
//   }
//   return Promise.reject(error);
// };

export function addNewUser() {
  return {
    type: ADD_NEW_USER
  };
}

export function editUser(user) {
  return {
    type: EDIT_USER,
    user
  };
}

export function closeForm(user) {
  return {
    type: CLOSE_FORM,
    user
  };
}

export function save(user) {
  return {
    types: [SAVE, SAVE_SUCCESS, SAVE_FAIL],
    promise: ({
      client
    }) => client.post('users', {
      data: user
    })
  };
}

export function inviteUser(user) {
  return {
    types: [INVITE, INVITE_SUCCESS, INVITE_FAIL],
    promise: ({
      client
    }) => client.post('users/invite', {
      data: user
    })
  };
}

export function verifyToken(token) {
  return {
    types: [VERIFY_TOKEN, VERIFY_TOKEN_SUCCESS, VERIFY_TOKEN_FAIL],
    promise: ({
      client
    }) => client.get(`users/validToken?verificationToken=${token}`)
  };
}

export function validResetToken(token) {
  return {
    types: [VERIFY_RESET_TOKEN, VERIFY_RESET_TOKEN_SUCCESS, VERIFY_RESET_TOKEN_FAIL],
    promise: ({
      client
    }) => client.get(`users/validResetToken?verificationToken=${token}`)
  };
}


export function registerUser(token, formValues) {
  return {
    types: [REGISTER_USER, REGISTER_USER_SUCCESS, REGISTER_USER_FAIL],
    promise: ({
      client
    }) => client.post(`users/confirmRegistration?verificationToken=${token}`, { data:
      formValues
    })
  };
}

export function updateUser(userId, formValues) {
  return {
    types: [UPDATE_USER, UPDATE_USER_SUCCESS, UPDATE_USER_FAIL],
    promise: ({
      client
    }) => client.patch(`users/update-user/${userId}`, { data:
      formValues
    })
  };
}

export function verifyUserName(userName) {
  return {
    types: [VERIFY_USERNAME, VERIFY_USERNAME_SUCCESS, VERIFY_USERNAME_FAIL],
    promise: ({
      client
    }) => client.get(`users/checkUsername?username=${userName}`)
  };
}

export function load(id) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({
      client
    }) => client.get(`users/${id}`)
  };
}

export function loadUsers() {
  return {
    types: [
      LOAD_USERS_NAMES, LOAD_USERS_NAMES_SUCCESS, LOAD_USERS_NAMES_FAIL
    ],
    promise: ({ client }) => client.get('/users/all-names')
  };
}

export function loadUserRoles() {
  return {
    types: [LOAD_ROLES, LOAD_ROLES_SUCCESS, LOAD_ROLES_FAIL],
    promise: ({
      client
    }) => client.get('roles')
  };
}


export function update(id, user) {
  return {
    types: [SAVE, SAVE_SUCCESS, SAVE_FAIL],
    promise: ({
      client
    }) => client.put(`users/${id}`, {
      data: user
    })
  };
}

export function openInviteUserModal() {
  return {
    type: OPEN_INVITE_USER_MODAL
  };
}

export function closeInviteUserModal() {
  return {
    type: CLOSE_INVITE_USER_MODAL
  };
}

export function openUserProfileModal() {
  return {
    type: OPEN_USER_PROFILE_MODAL
  };
}

export function closeUserProfileModal() {
  return {
    type: CLOSE_USER_PROFILE_MODAL
  };
}

export function changePassword(formValues) {
  return {
    types: [CHANGE_PASSWORD, CHANGE_PASSWORD_SUCCESS, CHANGE_PASSWORD_FAIL],
    promise: ({
      client
    }) => client.post('users/change-password', { data:
      formValues
    })
  };
}

export function forgotPassword(formValues) {
  return {
    types: [FORGOT_PASSWORD, FORGOT_PASSWORD_SUCCESS, FORGOT_PASSWORD_FAIL],
    promise: ({
      client
    }) => client.post('users/reset', { data:
      formValues
    })
  };
}


export function resetPassword(verificationToken, formValues) {
  return {
    types: [RESET_PASSWORD, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_FAIL],
    promise: ({
      client
    }) => client.post(`users/reset-password?access_token=${verificationToken}`, { data:
      formValues
    })
  };
}
