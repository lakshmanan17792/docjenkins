import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';

let userRoles = [];
let permissions = null;

@connect(state => ({
  user: state.auth.user,
  rolePermissions: state.acl.rolePermissions,
  rolePermissionsLastUpdate: state.acl.rolePermissionsLastUpdate,
  rolePermissionsLoading: state.acl.rolePermissionsLoading,
  rolePermissionsLoaded: state.acl.rolePermissionsLoaded
}))
export default class Permissible extends Component {
  static noOfPermissions = operations => {
    const userPermissions = [];
    if (operations && operations.length && permissions) {
      operations.map(operation => {
        if (operation) {
          if (permissions[operation.model] && permissions[operation.model][operation.operation]) {
            const roles = permissions[operation.model][operation.operation][0].allowedRoles;
            const availableRoles = lodash.intersection(roles, userRoles);
            if (availableRoles.length > 0) {
              userPermissions.push(operation);
            }
          }
          return false;
        }
        return operation;
      });
    }
    return userPermissions;
  }

  static isPermitted = operation => {
    if (operation && permissions) {
      if (permissions[operation.model] && permissions[operation.model][operation.operation]) {
        const roles = permissions[operation.model][operation.operation][0].allowedRoles;
        const availableRoles = lodash.intersection(roles, userRoles);
        return availableRoles.length > 0;
      }
    }
    return false;
  };

  static propTypes = {
    children: PropTypes.element,
    permittedComponent: PropTypes.element,
    restrictedComponent: PropTypes.element,
    operation: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    rolePermissions: PropTypes.object.isRequired,
    rolePermissionsLoaded: PropTypes.bool,
  }

  static defaultProps = {
    permittedComponent: null,
    children: null,
    restrictedComponent: null,
    rolePermissionsLoading: false,
    rolePermissionsLastUpdate: null,
    rolePermissionsLoaded: false
  };

  static getPathPermissions = (pathName, model, operation) => {
    if (permissions) {
      const roles = permissions[model][operation][0].allowedRoles;
      const availableRoles = lodash.intersection(roles, userRoles);
      return availableRoles.length > 0;
    }
  }

  constructor(props) {
    super(props);
    userRoles = [];
    const roles = this.props.user.userRoles;
    roles.map(role => userRoles.push(role.name));
  }

  componentWillMount() {
    permissions = this.props.rolePermissions;
  }

  componentWillReceiveProps(nextProps) {
    const { rolePermissionsLoaded, rolePermissions } = nextProps;
    if (this.props.rolePermissionsLoaded !== rolePermissionsLoaded) {
      if (rolePermissionsLoaded) {
        permissions = rolePermissions;
      }
      this.setState({
        rolePermissionsLoaded
      });
    }
  }

  getPermission = operation => {
    const { rolePermissions } = this.props;
    if (operation && rolePermissions) {
      if (Array.isArray(operation)) {
        const operationsPermissions = operation.map(oper => {
          if (rolePermissions[oper.model] && rolePermissions[oper.model][oper.operation]) {
            const roles = rolePermissions[oper.model][oper.operation][0].allowedRoles;
            const availableRoles = lodash.intersection(roles, userRoles);
            return availableRoles.length > 0;
          }
          return false;
        });
        return lodash.includes(operationsPermissions, true);
      } else if (typeof operation === 'object') {
        if (rolePermissions[operation.model] && rolePermissions[operation.model][operation.operation]) {
          const roles = rolePermissions[operation.model][operation.operation][0].allowedRoles;
          const availableRoles = lodash.intersection(roles, userRoles);
          return availableRoles.length > 0;
        }
        return false;
      }
    }
  }

  render() {
    const { children, operation, permittedComponent, restrictedComponent, rolePermissions } = this.props;
    if (rolePermissions) {
      if (this.getPermission(operation)) {
        if (restrictedComponent) {
          return restrictedComponent;
        }
        return children;
      } else if (permittedComponent) {
        return permittedComponent;
      }
    }
    return (
      null
    );
  }
}
