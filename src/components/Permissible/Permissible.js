import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import permissions from './Permissions';

let userRoles = [];

@connect(state => ({
  user: state.auth.user
}))
export default class Permissible extends Component {
  static noOfPermissions = operations => {
    const userPermissions = [];
    if (operations && operations.length) {
      operations.map(operation => {
        if (operation) {
          const roles = permissions[operation];
          const availableRoles = lodash.intersection(roles, userRoles);
          if (availableRoles.length > 0) {
            userPermissions.push(operation);
          }
        }
        return operation;
      });
    }
    return userPermissions;
  }

  static isPermitted = operation => {
    if (operation) {
      const roles = permissions[operation];
      const availableRoles = lodash.intersection(roles, userRoles);
      return availableRoles.length > 0;
    }
  };

  static propTypes = {
    children: PropTypes.element,
    permittedComponent: PropTypes.element,
    restrictedComponent: PropTypes.element,
    operation: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired
  }

  static defaultProps = {
    permittedComponent: null,
    children: null,
    restrictedComponent: null
  }

  constructor(props) {
    super(props);
    userRoles = [];
    const roles = this.props.user.userRoles;
    roles.map(role => userRoles.push(role.name));
  }

  getPermission = operation => {
    if (operation) {
      if (Array.isArray(operation)) {
        const operationsPermissions = operation.map(oper => {
          const roles = permissions[oper];
          const availableRoles = lodash.intersection(roles, userRoles);
          return availableRoles.length > 0;
        });
        return lodash.includes(operationsPermissions, true);
      } else if (typeof operation === 'string') {
        const roles = permissions[operation];
        const availableRoles = lodash.intersection(roles, userRoles);
        return availableRoles.length > 0;
      }
    }
  }

  render() {
    const { children, operation, permittedComponent, restrictedComponent } = this.props;
    if (this.getPermission(operation)) {
      if (restrictedComponent) {
        return restrictedComponent;
      }
      return children;
    } else if (permittedComponent) {
      return permittedComponent;
    }
    return (
      null
    );
  }
}
