const LOAD_ROLES_HEIRARCHY = 'acl/LOAD_ROLES_HEIRARCHY';
const LOAD_ROLES_HEIRARCHY_SUCCESS = 'acl/LOAD_ROLES_HEIRARCHY_SUCCESS';
const LOAD_ROLES_HEIRARCHY_FAILURE = 'acl/LOAD_ROLES_HEIRARCHY_FAILURE';

const CREATE_ROLE = 'acl/CREATE_ROLE';
const CREATE_ROLE_SUCCESS = 'acl/CREATE_ROLE_SUCCESS';
const CREATE_ROLE_FAILURE = 'acl/CREATE_ROLE_FAILURE';

const GET_ROLE_PERMISSIONS = 'acl/GET_ROLE_PERMISSIONS';
const GET_ROLE_PERMISSIONS_SUCCESS = 'acl/GET_ROLE_PERMISSIONS_SUCCESS';
const GET_ROLE_PERMISSIONS_FAILURE = 'acl/GET_ROLE_PERMISSIONS_FAILURE';

const GET_ACL_ROLE_PERMISSIONS = 'acl/GET_ACL_ROLE_PERMISSIONS';
const GET_ACL_ROLE_PERMISSIONS_SUCCESS = 'acl/GET_ACL_ROLE_PERMISSIONS_SUCCESS';
const GET_ACL_ROLE_PERMISSIONS_FAILURE = 'acl/GET_ACL_ROLE_PERMISSIONS_FAILURE';

const UPDATE_PERMISSION = 'acl/UPDATE_PERMISSION';
const UPDATE_PERMISSION_SUCCESS = 'acl/UPDATE_PERMISSION_SUCCESS';
const UPDATE_PERMISSION_FAILURE = 'acl/UPDATE_PERMISSION_FAILURE';

const EDIT_ROLE = 'acl/EDIT_ROLE';
const EDIT_ROLE_SUCCESS = 'acl/EDIT_ROLE_SUCCESS';
const EDIT_ROLE_FAILURE = 'acl/EDIT_ROLE_FAILURE';

const CLEAN_ROLE_PERMISSION = 'acl/CLEAN_ROLE_PERMISSION';

const initialState = {
  rolesHeirarchy: []
};

const getUpdatedAclByRole = (existingPermissions, permissions) => {
  permissions.forEach(permission => {
    if (existingPermissions &&
      existingPermissions[permission.model] &&
      existingPermissions[permission.model][permission.displayName]) {
      existingPermissions[permission.model][permission.displayName] = [permission];
    }
  });
  return existingPermissions;
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_ROLES_HEIRARCHY:
      return {
        ...state,
        rolesHeirarchyLoading: true,
        rolesHeirarchyLoaded: false,
        rolesHeirarchy: []
      };
    case LOAD_ROLES_HEIRARCHY_SUCCESS:
      return {
        ...state,
        rolesHeirarchyLoading: false,
        rolesHeirarchyLoaded: true,
        rolesHeirarchy: action.result
      };
    case LOAD_ROLES_HEIRARCHY_FAILURE:
      return {
        ...state,
        rolesHeirarchyLoading: false,
        rolesHeirarchyLoaded: false,
        rolesHeirarchyError: action.error
      };
    case CREATE_ROLE:
      return {
        ...state,
        rolesHeirarchyLoading: true,
        rolesHeirarchyLoaded: false,
        rolesHeirarchy: []
      };
    case CREATE_ROLE_SUCCESS:
      return {
        ...state,
        rolesHeirarchyLoading: false,
        rolesHeirarchyLoaded: true,
        rolesHeirarchy: action.result
      };
    case CREATE_ROLE_FAILURE:
      return {
        ...state,
        rolesHeirarchyLoading: false,
        rolesHeirarchyLoaded: false,
        rolesHeirarchyError: action.error
      };
    case EDIT_ROLE:
      return {
        ...state,
        editing: true,
        edited: false,
      };
    case EDIT_ROLE_SUCCESS:
      return {
        ...state,
        editing: false,
        edited: true,
      };
    case EDIT_ROLE_FAILURE:
      return {
        ...state,
        editing: false,
        edited: false,
        editError: action.error
      };
    case GET_ROLE_PERMISSIONS:
      return {
        ...state,
        rolePermissionsLoading: true,
        rolePermissionsLoaded: false,
        rolePermissions: {}
      };
    case GET_ROLE_PERMISSIONS_SUCCESS:
      return {
        ...state,
        rolePermissionsLoading: false,
        rolePermissionsLoaded: true,
        rolePermissions: action.result,
        rolePermissionsLastUpdate: new Date()
      };
    case GET_ROLE_PERMISSIONS_FAILURE:
      return {
        ...state,
        rolePermissionsLoading: false,
        rolePermissionsLoaded: false,
        rolePermissionsError: action.error
      };
    case GET_ACL_ROLE_PERMISSIONS:
      return {
        ...state,
        aclByRoleLoading: true,
        aclByRoleLoaded: false,
        aclByRole: {}
      };
    case GET_ACL_ROLE_PERMISSIONS_SUCCESS:
      return {
        ...state,
        aclByRoleLoading: false,
        aclByRoleLoaded: true,
        aclByRole: action.result,
      };
    case GET_ACL_ROLE_PERMISSIONS_FAILURE:
      return {
        ...state,
        aclByRoleLoading: false,
        aclByRoleLoaded: false,
        aclByRoleError: action.error
      };
    case UPDATE_PERMISSION:
      return {
        ...state,
        updatingPermission: true,
        updatedPermission: false
      };
    case UPDATE_PERMISSION_SUCCESS:
      return {
        ...state,
        updatedPermission: true,
        updatingPermission: true,
        aclByRole: getUpdatedAclByRole(state.aclByRole, action.permissions)
      };
    case UPDATE_PERMISSION_FAILURE:
      return {
        ...state,
        updatedPermission: false,
        updatingPermission: false,
        permissionUpdateError: action.error
      };
    case CLEAN_ROLE_PERMISSION:
      return {
        ...state,
        rolePermissionsLoading: false,
        rolePermissionsLoaded: false,
        rolePermissions: {},
        rolePermissionsLastUpdate: new Date()
      };
    default:
      return state;
  }
}

export function isRolePermissionsLoaded(globalState) {
  let isLoadedOrLoading = false;
  if (globalState.acl) {
    if (globalState.acl.rolePermissionsLoaded || globalState.acl.rolePermissionsLoaded) {
      isLoadedOrLoading = true;
    }
  }
  return isLoadedOrLoading;
}

export function getRolesHeirarchy() {
  return {
    types: [
      LOAD_ROLES_HEIRARCHY,
      LOAD_ROLES_HEIRARCHY_SUCCESS,
      LOAD_ROLES_HEIRARCHY_FAILURE
    ],
    promise: ({ client }) => client.get('/roles/rolesHeirarchy')
  };
}

export function createRole(data) {
  return {
    types: [
      CREATE_ROLE,
      CREATE_ROLE_SUCCESS,
      CREATE_ROLE_FAILURE
    ],
    promise: ({ client }) => client.post('/roles/createRole', { data })
  };
}

export function loadRolePermissions() {
  return {
    types: [
      GET_ROLE_PERMISSIONS,
      GET_ROLE_PERMISSIONS_SUCCESS,
      GET_ROLE_PERMISSIONS_FAILURE,
    ],
    promise: ({ client }) => client.get('/acls/list')
  };
}

export function loadAclByRoles(roles) {
  return {
    types: [
      GET_ACL_ROLE_PERMISSIONS,
      GET_ACL_ROLE_PERMISSIONS_SUCCESS,
      GET_ACL_ROLE_PERMISSIONS_FAILURE,
    ],
    promise: ({ client }) => client.post('/roles/aclByRole', { data: roles })
  };
}

export function updateAclPermission(permission) {
  return {
    types: [
      UPDATE_PERMISSION,
      UPDATE_PERMISSION_SUCCESS,
      UPDATE_PERMISSION_FAILURE
    ],
    promise: ({ client }) => client.post('/acls/aclUpsert', { data: permission }),
    permissions: permission
  };
}

export function editRole(role, id) {
  return {
    types: [
      EDIT_ROLE,
      EDIT_ROLE_SUCCESS,
      EDIT_ROLE_FAILURE
    ],
    promise: ({ client }) => client.patch(`/roles/${id}`, { data: role })
  };
}

export function clearRolePermissions() {
  return {
    type: CLEAN_ROLE_PERMISSION,
  };
}
