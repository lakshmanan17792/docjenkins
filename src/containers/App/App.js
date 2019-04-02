import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import moment from 'moment';
import { isLoaded as isAuthLoaded, load as loadAuth, fetchLanguage, logout } from 'redux/modules/auth/auth';
import { isRolePermissionsLoaded } from 'redux/modules/Acl/Acl';
import { Header } from 'components';
import { push } from 'react-router-redux';
import { asyncConnect } from 'redux-connect';
import styles from './App.scss';
import './Default.css';
import Login from '../Login/AppLogin';
import AppRegister from '../Register/AppRegister';
import AppForgotPassword from '../Register/AppForgotPassword';
import AppResetPassword from '../Register/AppResetPassword';
import i18nInstance from '../../i18n';
import { loadRolePermissions } from '../../redux/modules/Acl/Acl';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

let timeOutId = 0;
@asyncConnect([{
  promise: ({ store: { dispatch, getState } }) => {
    const promises = [];
    if (typeof localStorage === 'undefined' ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('authToken') !== null)) {
      if (!isAuthLoaded(getState())) {
        promises.push(dispatch(loadAuth()));
      }
      if (!isRolePermissionsLoaded(getState())) {
        promises.push(dispatch(loadRolePermissions()));
      }
      // if (!getState().auth.languageLoaded) {
      //   console.log('getState().auth.languageLoaded', getState().auth.languageLoaded);
      //   promises.push(dispatch(fetchLanguage()));
      // }
      return Promise.all(promises);
    }
  }
}])
@connect(
  state => ({
    notifs: state.notifs,
    user: state.auth.user,
    language: state.auth.language,
    timeOut: state.auth.timeOut,
    isCaptchaEnable: state.auth.inValidLoginCount >= 3,
    language_code: state.auth.language_code,
    activePath: state.routing.locationBeforeTransitions.pathname
  }), { pushState: push, loadRolePermissions, fetchLanguage, logout })
@translate('translations')
export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    activePath: PropTypes.string,
    params: PropTypes.object,
    user: PropTypes.shape({
      email: PropTypes.string
    }),
    i18n: PropTypes.object.isRequired,
    timeOut: PropTypes.any,
    language: PropTypes.object,
    language_code: PropTypes.string,
    isCaptchaEnable: PropTypes.bool,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    fetchLanguage: PropTypes.func.isRequired,
    location: PropTypes.any.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  static defaultProps = {
    user: null,
    activePath: '',
    params: '',
    language: null,
    timeOut: 0,
    language_code: '',
    isCaptchaEnable: false,
  };

  constructor(props) {
    super(props);
    this.state = { showCookieAlert: true };
  }

  componentWillMount() {
    if (!this.props.language && !this.props.language_code && !this.props.user) {
      this.props.fetchLanguage();
    }
    if (this.props.language && this.props.language_code) {
      const { i18n, language, language_code } = this.props;
      i18n.addResourceBundle(language_code, 'translations', language);
      i18n.changeLanguage(language_code);
    }
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      if (cookies[i].indexOf('EU_COOKIE_LAW_CONSENT=') > -1) {
        if (cookies[i].split('EU_COOKIE_LAW_CONSENT=')[1]) {
          this.setState({ showCookieAlert: false });
        }
      }
    }
  }

  componentDidMount() {
    window.addEventListener('storage', event => {
      if (event.key === 'logout-event') {
        toastrErrorHandling({}, i18nInstance.t('ERROR'), i18nInstance.t('errorMessage.PLEASE_LOGIN_TO_CONTINUE'));
        this.reload();
      }
      if (event.key === 'session-event') {
        this.setSessionTimeout(localStorage.getItem('session-event'));
      }
      if (event.key === 'login-event') {
        window.location.reload();
      }
    });
    window.addEventListener('beforeunload', () => {
      sessionStorage.clear();
      if (this.props.isCaptchaEnable) {
        sessionStorage.setItem('isCaptchaEnable', true);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const notAllowedRedirectURL = ['/logout', '/applogin', '/login', '/register', '/forgotPassword'];
    const { query } = nextProps.location;
    if (this.props.language_code !== nextProps.language_code) {
      const { i18n } = this.props;
      const { language, language_code } = nextProps;
      i18n.addResourceBundle(language_code, 'translations', language);
      i18n.changeLanguage(language_code);
    }
    if (this.props.timeOut !== nextProps.timeOut) {
      this.setSessionTimeout(nextProps.timeOut);
    }
    if (!this.props.user && nextProps.user) {
    // login
      if (query && query.redirect && !notAllowedRedirectURL.includes(query.redirect)) {
        this.props.pushState(query.redirect);
      } else {
        this.props.pushState('/');
      }
    } else if (this.props.user && !nextProps.user) {
    // logout
      window.clearTimeout(timeOutId);
      this.props.pushState('/');
    } else if (nextProps.user && window.location.pathname === '/login') {
      this.props.pushState('/Dashboard');
    }
  }

  componentWillUnmount() {
    window.removeEventListener('storage', () => {});
  }

  setCookieLicense = () => {
    document.cookie = `EU_COOKIE_LAW_CONSENT=true;path=/;max-age=${86500 * 30}`;
    this.setState({ showCookieAlert: false });
  }

  setSessionTimeout = expiryTime => {
    const sessionTimeOut = Number(expiryTime) - new Date().getTime();
    if (sessionTimeOut && sessionTimeOut > 0) {
      localStorage.setItem('session-event', expiryTime);
      window.clearTimeout(timeOutId);
      timeOutId = window.setTimeout(() => {
        this.props.logout();
        toastrErrorHandling({}, i18nInstance.t('ERROR'),
          i18nInstance.t('errorMessage.YOUR_SESSION_EXPIRED')
        );
        localStorage.clear();
      }, sessionTimeOut);
    }
  }

  reload = () => {
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  isRegisterPage() {
    const { activePath } = this.props;
    if (activePath && activePath === '/register') {
      return <AppRegister />;
    }
    if (activePath && activePath === '/forgotPassword') {
      return <AppForgotPassword />;
    }
    if (activePath && activePath === '/resetPassword') {
      return <AppResetPassword />;
    }
    return <Login />;
  }

  clearOpeningFilter = () => {
    const { params } = this.props;
    const openingFilters = JSON.parse(sessionStorage.getItem('openingFilters'));
    if (openingFilters !== null) {
      if (!window.location.href.includes('/ATSBoard?jobId')
          && !window.location.href.includes('/ProfileSearch')
          && !window.location.href.includes('/ProfileSearch?jobId')
          && !window.location.href.includes(params.id)
          && !window.location.href.includes('/Openings')) {
        sessionStorage.removeItem('openingFilters');
      }
    }
  }

  clearProfileFilter = () => {
    const profilefilters = JSON.parse(sessionStorage.getItem('profilefilters'));
    if (profilefilters !== null) {
      if (!window.location.href.includes('/ProfileSearch')
          && !window.location.href.includes('/ProfileSearch?jobId')
          && !window.location.href.includes('/ProfileSearch?searchId')
          && !window.location.href.includes('/Openings?profileId')
          && !window.location.href.includes('/SuperProfileSearch')
          && !window.location.href.includes('/Emailer')
          && !window.location.href.includes('/EmailConfig')
          && !window.location.href.includes('/EditCandidate')) {
        sessionStorage.removeItem('profilefilters');
      }
    }
  }

  clearTaskData = () => {
    const taskData = JSON.parse(sessionStorage.getItem('taskData'));
    if (taskData !== null) {
      if (!window.location.href.includes('/Tasks')
          && !window.location.href.includes('/Tasks/View?taskId')) {
        sessionStorage.removeItem('taskData');
      }
    }
  }

  clearCustomersData = () => {
    const customerData = JSON.parse(sessionStorage.getItem('addCustomer'));
    if (customerData !== null) {
      if (!window.location.href.includes('/CreateCompany?isAddCompany=true') &&
        !window.location.href.includes('/Company/new') &&
        !window.location.href.includes('/Company')) {
        sessionStorage.removeItem('addCustomer');
      }
    }
  }

  clearProfileTabData = () => {
    const tabKey = sessionStorage.getItem('profileTabKey');
    if (tabKey) {
      if (!window.location.href.includes('/ProfileSearch') &&
      !window.location.href.includes('/SuperProfileSearch') &&
      !window.location.href.includes('/Openings') &&
      !window.location.href.includes('/Emailer')) {
        sessionStorage.removeItem('profileTabKey');
      }
    }
  }

  clearManageCandidateData = () => {
    const tabKey = sessionStorage.getItem('manageCandidateTabKey');
    if (tabKey) {
      if (!window.location.href.includes('/ProfileSearch') &&
      !window.location.href.includes('/SuperProfileSearch') &&
      !window.location.href.includes('/ManageCandidates')) {
        sessionStorage.removeItem('manageCandidateTabKey');
        sessionStorage.removeItem('tobeUnarchivedCandidate');
      }
    }
  }

  clearManageCompanyData = () => {
    const tabKey = sessionStorage.getItem('manageCompanyTabKey');
    if (tabKey) {
      if (!window.location.href.includes('/Company') &&
        !window.location.href.includes('/ManageCompanies')) {
        sessionStorage.removeItem('manageCompanyTabKey');
      }
    }
  }

  clearEmailData = () => {
    const emailData = localStorage.getItem('emailData');
    if (emailData) {
      if (!window.location.href.includes('/Emailer')) {
        localStorage.removeItem('emailData');
      }
    }
  }

  render() {
    const { user, children } = this.props;
    moment.locale(this.props.language_code);
    this.clearOpeningFilter();
    this.clearProfileFilter();
    this.clearCustomersData();
    this.clearTaskData();
    this.clearProfileTabData();
    this.clearEmailData();
    this.clearManageCandidateData();
    this.clearManageCompanyData();
    return (
      <div id="wrapper" className={styles.wrapper}>
        {this.state.showCookieAlert &&
          <div className="eupopup-container eupopup-container-fixedtop">
            <div>
              <div className="eupopup-head">{i18nInstance.t('COOKIE_ALERT_HEADER')}</div>
              <div className="eupopup-body"> {i18nInstance.t('COOKIE_ALERT_CONTENT')}
                <a
                  href="https://www.talentsteps.com/privacy_policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eupopup-button eupopup-button_2"
                >{i18nInstance.t('PRIVACY_POLICY')}.</a>
              </div>
              <div className="eupopup-buttons">
                <a
                  role="presentation"
                  onClick={this.setCookieLicense}
                  className="eupopup-button eupopup-button_1"
                >{i18nInstance.t('ACCEPT')}</a>
              </div>
            </div>
          </div>
        }
        {
          user ?
            <div id="page-wrapper" className={`gray-bg ${styles.appContent}`}>
              <div className="row border-bottom">
                <Header
                  user={user}
                />
              </div>
              <div className={`row ${styles.page_body}`}>
                {children}
              </div>
            </div>
            : this.isRegisterPage()
        }
      </div>
    );
  }
}

App.defaultProps = {
  loginError: ''
};
