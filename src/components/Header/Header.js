import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { logout } from 'redux/modules/auth/auth';
import Menu from './Menu';
import UserProfile from './UserProfile';
import Notification from './Notification';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import Constants from '../../helpers/Constants';
import i18n from '../../i18n';

const styles = require('./Header.scss');
@connect(
  state => ({
    activePath: state.routing.locationBeforeTransitions.pathname
  }),
  { logout }
)
export default class Header extends Component {
  static propTypes = {
    activePath: PropTypes.string,
    user: PropTypes.shape({
      email: PropTypes.string
    }),
    logout: PropTypes.func.isRequired
  }

  static defaultProps = {
    user: null,
    activePath: ''
  }


  constructor(props) {
    super(props);
    this.state = {
      showMobileMenu: false,
      showProfile: false
    };
  }

  getActiveClassName(link) {
    const { activePath } = this.props;
    if (link === activePath) {
      return styles.active;
    }
  }

  handleLogout = event => {
    event.preventDefault();
    this.props.logout().then(() => {}, error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'), i18n.t('errorMessage.COULD_NOT_LOGOUT'));
    });
  };

  render() {
    const { user } = this.props;
    return (
      <div>
        <nav className={`navbar navbar_container navbar-fixed-top f-15 ${styles.navbar_color}  ${styles.border_none}`}>
          <div className="container-fluid">
            <div className="navbar-header">
              <Link
                to="/Dashboard"
                className="navbar-brand"
              >
                <img
                  src={`${Constants.logoURL.url}/appLogo`}
                  alt="TalentSteps"
                  className={`img-responsive ${styles.logo}`}
                />
              </Link>
            </div>
            <Menu user={user} />
            <UserProfile user={user} />
            <Notification />
          </div>
        </nav>
      </div>
    );
  }
}
