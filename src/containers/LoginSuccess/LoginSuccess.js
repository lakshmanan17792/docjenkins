import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as authActions from 'redux/modules/auth/auth';

@connect(state => ({ user: state.auth.user }), authActions)
export default class LoginSuccess extends Component {
  static propTypes = {
    user: PropTypes.shape({
      email: PropTypes.string
    }).isRequired,
    logout: PropTypes.func.isRequired
  };

  render() {
    const { user, logout } = this.props;
    return (
      user &&
      <div className="container">
        <h1>Login Success</h1>

        <div>
          <p>
            Hi, {user.email}. You have just successfully logged in, and were forwarded here by{' '}
          </p>
          <div>
            <button className="btn btn-danger" onClick={logout}>
              <i className="fa fa-sign-out" /> Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }
}
