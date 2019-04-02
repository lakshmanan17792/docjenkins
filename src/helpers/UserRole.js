let state = null;
let currentUser = null;
export default class UserRole {
  getPathPermission = (pathName, operation, model) => {
    let isPermitted = false;
    if (operation) {
      if (typeof operation === 'string') {
        currentUser.permittedModules.forEach(module => {
          if (model && module.model === model && module.displayName === operation) {
            isPermitted = true;
          } else if (!model && module.displayName === operation) {
            isPermitted = true;
          }
        });
      } else if (Array.isArray(operation)) {
        operation.forEach(singleOperation => {
          currentUser.permittedModules.forEach(module => {
            if (model && module.model === model && module.displayName === singleOperation) {
              isPermitted = true;
            } else if (!model && module.displayName === singleOperation) {
              isPermitted = true;
            }
          });
        });
      }
    } else {
      isPermitted = true;
    }
    return isPermitted;
  }

  getIsAdmin = () => currentUser.userRoles.filter(role => role.name === 'Admin').length > 0;

  serUser = userParam => {
    currentUser = userParam;
  }

  setState = stateParam => {
    state = stateParam;
    currentUser = state.auth.user;
  }
}
