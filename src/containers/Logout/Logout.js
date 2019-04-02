import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { hashHistory } from 'react-router';
import { logout } from '../../redux/modules/auth/auth';
import { clearRolePermissions } from '../../redux/modules/Acl/Acl';

@connect(() => ({}), { logout, clearRolePermissions })
export default class Logout extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    clearRolePermissions: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.clearRolePermissions();
    this.props.logout().then(() => {}, () => {
      hashHistory.goBack();
    });
  }

  render() {
    return null;
  }
}
