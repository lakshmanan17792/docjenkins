import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { reduxForm, getFormValues } from 'redux-form';
import Helmet from 'react-helmet';
import { translate } from 'react-i18next';
import { Link } from 'react-router';
import ReCAPTCHA from 'react-google-recaptcha';
import * as authActions from 'redux/modules/auth/auth';
import InputBox from '../../components/FormComponents/InputBox';
import Constants from '../../helpers/Constants';
// import CheckBox from '../../components/FormComponents/CheckBox';
import { getLoginFormConfig, loginValidation } from '../../formConfig/AppLogin';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';

@reduxForm({
  form: 'login',
  touchOnChange: true,
  validate: loginValidation
})
@connect((state, props) => ({
  user: state.auth.user,
  error: state.auth.error,
  loggingIn: state.auth.loggingIn,
  sessionDelete: state.auth.sessionDelete,
  sessionError: state.auth.sessionError,
  sessionData: state.auth.sessionData,
  isCaptchaEnable: state.auth.inValidLoginCount >= Constants.MAXIMUM_INVALID_LOGIN_COUNT,
  isCaptchaVerified: state.auth.isCaptchaVerified,
  pathname: state.routing.locationBeforeTransitions.pathname,
  values: getFormValues(props.form)(state)
}), { ...authActions })

class Login extends Component {
  static propTypes = {
    user: PropTypes.shape({
      email: PropTypes.string
    }),
    login: PropTypes.func.isRequired,
    deleteSession: PropTypes.func.isRequired,
    setInitialInvalidCount: PropTypes.func.isRequired,
    verifyCaptcha: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    error: PropTypes.object,
    initialize: PropTypes.func.isRequired,
    values: PropTypes.object,
    loggingIn: PropTypes.bool,
    sessionDelete: PropTypes.bool,
    sessionError: PropTypes.object,
    sessionData: PropTypes.object,
    isCaptchaEnable: PropTypes.bool,
    isCaptchaVerified: PropTypes.bool,
    pathname: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object
  };

  static defaultProps = {
    user: null,
    values: {},
    error: null,
    isCaptchaEnable: false,
    isCaptchaVerified: false,
    loggingIn: false,
    sessionDelete: false,
    sessionError: null,
    sessionData: null
  };

  constructor(props) {
    super(props);
    this.state = {
      sessionActiveError: false,
      browserName: null
    };
  }

  componentWillMount() {
    const isEnable = JSON.parse(sessionStorage.getItem('isCaptchaEnable')) || false;
    this.props.setInitialInvalidCount(isEnable);
  }

  componentDidMount() {
    window.onload = () => {
      const { error } = this.props;
      if (error && error.error && error.error.statusCode === 403) {
        toastrErrorHandling({}, 'Error', error.error.message);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUserId');
        // when error 403 occurs logout-event triggered to logout all tabs in window
        localStorage.setItem('logout-event', Date.now());
        document.cookie = 'authorization=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
      }
    };
  }

  onCaptchaChange = response => {
    this.props.verifyCaptcha({ response }).then(() => { }, () => {
      this._reCaptchaRef.reset();
    });
  }

  getBrowserDetails = () => {
    const nAgt = navigator.userAgent;
    let browserName = navigator.appName;
    let fullVersion = `${parseFloat(navigator.appVersion)}`;
    let nameOffset;
    let verOffset;
    let ix;

    if ((verOffset === nAgt.indexOf('OPR/')) !== -1) {
      browserName = 'Opera';
      fullVersion = nAgt.substring(verOffset + 4);
    } else if ((verOffset === nAgt.indexOf('Opera')) !== -1) {
      browserName = 'Opera';
      fullVersion = nAgt.substring(verOffset + 6);
      if ((verOffset === nAgt.indexOf('Version')) !== -1) {
        fullVersion = nAgt.substring(verOffset + 8);
      }
    } else if ((verOffset === nAgt.indexOf('MSIE')) !== -1) {
      browserName = 'Microsoft Internet Explorer';
      fullVersion = nAgt.substring(verOffset + 5);
    } else if ((verOffset === nAgt.indexOf('Chrome')) !== -1) {
      browserName = 'Chrome';
      fullVersion = nAgt.substring(verOffset + 7);
    } else if ((verOffset === nAgt.indexOf('Safari')) !== -1) {
      browserName = 'Safari';
      fullVersion = nAgt.substring(verOffset + 7);
      if ((verOffset === nAgt.indexOf('Version')) !== -1) {
        fullVersion = nAgt.substring(verOffset + 8);
      }
    } else if ((verOffset === nAgt.indexOf('Firefox')) !== -1) {
      browserName = 'Firefox';
      fullVersion = nAgt.substring(verOffset + 8);
    } else if ((nameOffset === nAgt.lastIndexOf(' ') + 1) <
      (verOffset === nAgt.lastIndexOf('/'))) {
      browserName = nAgt.substring(nameOffset, verOffset);
      fullVersion = nAgt.substring(verOffset + 1);
      if (browserName.toLowerCase() === browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }
    if ((ix === fullVersion.indexOf(';')) !== -1) {
      fullVersion = fullVersion.substring(0, ix);
    }

    if ((ix === fullVersion.indexOf(' ')) !== -1) {
      fullVersion = fullVersion.substring(0, ix);
    }
    this.setState({
      browserName: `${browserName} ${fullVersion}`
    });
  }

  login = evt => {
    evt.preventDefault();
    this.getBrowserDetails();
    this.props.values.username = this.props.values.username.toLowerCase();
    this.props.login('local', this.props.values).then(() => {
      sessionStorage.removeItem('isCaptchaEnable');
      const data = {
        os: navigator.platform,
        deviceId: this.state.browserName
      };
      localStorage.setItem('deviceDetails', JSON.stringify(data));
    }, err => {
      const { error } = err;
      if (error.message === 'You have logged in somewhere else, Kindly logout that session') {
        this.setState({
          sessionActiveError: true
        });
      } else {
        this.setState({
          sessionActiveError: false
        });
      }
      if (error.statusCode && error.statusCode === 401) {
        this.props.initialize({
          username: this.props.values.username,
          password: ''
        });
      }
      if (this._reCaptchaRef) {
        this._reCaptchaRef.reset();
      }
    });
  }

  sessionClear = val => {
    if (val === 'yes') {
      const data = {
        username: this.props.values.username
      };
      this.props.deleteSession(data).then(() => {
        this.getBrowserDetails();
        const devicedata = {
          os: navigator.platform,
          deviceId: this.state.browserName
        };
        localStorage.setItem('deviceDetails', JSON.stringify(devicedata));
        this.props.login('local', this.props.values);
      }, err => {
        if (err.error.statusCode === 403) {
          this.getBrowserDetails();
          this.props.login('local', this.props.values);
        }
      });
    } else {
      this.setState({
        sessionActiveError: false
      });
    }
  }

  render() {
    const { sessionActiveError } = this.state;
    const { handleSubmit, user, pathname, logout, values, loggingIn, isCaptchaEnable,
      isCaptchaVerified } = this.props;
    const loginFormConfig = getLoginFormConfig(this);
    const styles = require('./AppLogin.scss');
    return (
      <div className={styles.login_container}>
        <div className={`container ${styles.loginSection}`}>
          {!user && (
            <Row className={styles.login_area}>
              <Col xs={12} className={styles.login_inner_area}>
                <Col xs={6} className={styles.login_img}>
                  <Col xs={12} className="p-0">
                    <img alt="LoginImage" src={`${Constants.logo.loginImage}`} />
                  </Col>
                </Col>
                <Col xs={6} className={styles.login_box}>
                  <Col xs={12} className={`p-0 ${styles.login_content}`} >
                    <Helmet title={i18n.t('LOGIN')} />
                    <Col xs={12} className={styles.banner}>
                      {/* <img
                        src={`${Constants.logoURL.url}/appLogo`}
                        alt="TalentSteps"
                        className={styles.logo}
                      /> */}
                      <img src={`${Constants.logo.path}`} alt="TalentSteps" className={styles.logo} />
                    </Col>
                    {(!sessionActiveError) &&
                    <Col xs={12} className={styles.title}>{i18n.t('NICE_TO_SEE_YOU_AGAIN')}</Col>}
                    {(!sessionActiveError) ? <Col xs={12} className="p-0">
                      <form onSubmit={handleSubmit(this.login)}>
                        <Row className={`${styles.formElements} m-0`}>
                          <Col xs={10} className="m-t-25 p-0">
                            <InputBox {...loginFormConfig.fields[0]} />
                          </Col>
                          <Col xs={10} className={`${styles.password_column} m-t-25 p-0`}>
                            <Link to="/forgotPassword" className={styles.forgot_password} tabIndex="-1">
                              {i18n.t('FORGOT_PASSWORD')}?
                            </Link>
                            <InputBox {...loginFormConfig.fields[1]} />
                          </Col>
                          {isCaptchaEnable ? <Col xs={10} className={`${styles.captcha} m-t-25 p-0`}>
                            <ReCAPTCHA
                              ref={c => { this._reCaptchaRef = c; }}
                              sitekey={Constants.GOOGLE_SITE_KEY}
                              onChange={this.onCaptchaChange}
                            />
                          </Col> : null}
                          <Col xs={10} className="m-t-25 p-0">
                            <button
                              type="submit"
                              className={`${styles.login_button} button-primary`}
                              title={!values.username || !values.password ?
                                i18n.t('tooltipMessage.PLEASE_ENTER_USERNAME_PASSWORD') : ''}
                              disabled={!values.username || !values.password || loggingIn ||
                                (isCaptchaEnable && !isCaptchaVerified)}
                              onClick={this.login}
                            >
                              {loggingIn ?
                                <i className="fa fa-spinner fa-spin p-l-r-7" aria-hidden="true" /> :
                                null
                              }
                              {i18n.t('SIGN_IN')}
                            </button>
                          </Col>
                        </Row>
                      </form>
                    </Col>
                      : <Col xs={12} className={styles.sessionActiveContainer}>
                        <Col xs={12} className={styles.title}>{i18n.t('warningMessage.WARNING')}!</Col>
                        <p>Your last login is active</p>
                        <Col xs={12}>
                          <span>Please
                            <button
                              className={`btn-link ${styles.btnLink}`}
                              onClick={() => this.sessionClear('yes')}
                            >
                            Click here*
                            </button>
                          to sign out and continue accessing the application
                          </span>
                        </Col>
                        <Col xs={12}>
                          <button
                            className={`btn-link ${styles.backtoLogin}`}
                            onClick={() => this.sessionClear('no')}
                          >
                            Back to login page
                          </button>
                        </Col>
                        <Col xs={12} className={styles.sessionWarnMsg}>
                        *Your previous session will be terminated and all your unsaved work will be lost
                        </Col>
                      </Col>
                    }
                  </Col>
                  {(!sessionActiveError) && <Col xs={12} className={styles.new_user_directive}>
                    {i18n.t('DONT_HAVE_ACCOUNT')}?&nbsp;
                    <a
                      href="mailto:admin@talentsteps.com"
                      className={styles.contact_sales_link}
                    >{i18n.t('CONTACT_US')}</a>
                  </Col> }
                </Col>
              </Col>
            </Row>)}
          {user && (pathname === '/login') && (<div className={styles.logged_info}>
            <p>You are currently logged in as <b>{user.email}</b>.</p>
            <div>
              <button className="btn btn-danger" onClick={logout}>
                <i className="fa fa-sign-out" /> Log Out
              </button>
            </div>
          </div>)
          }
        </div>
      </div>
    );
  }
}

export default translate('translations')(Login);
