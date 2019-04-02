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
    setInitialInvalidCount: PropTypes.func.isRequired,
    verifyCaptcha: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    error: PropTypes.object,
    initialize: PropTypes.func.isRequired,
    values: PropTypes.object,
    loggingIn: PropTypes.bool,
    isCaptchaEnable: PropTypes.bool,
    isCaptchaVerified: PropTypes.bool,
    pathname: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired
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
    loggingIn: false
  };

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

  login = evt => {
    evt.preventDefault();
    this.props.values.username = this.props.values.username.toLowerCase();
    this.props.login('local', this.props.values).then(() => {
      sessionStorage.removeItem('isCaptchaEnable');
    }, err => {
      const { error } = err;
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

  render() {
    const { handleSubmit, user, pathname, logout, values, loggingIn, isCaptchaEnable, isCaptchaVerified } = this.props;
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
                    <Col xs={12} className={styles.title}>{i18n.t('NICE_TO_SEE_YOU_AGAIN')}</Col>
                    <Col xs={12} className="p-0">
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
                  </Col>
                  <Col xs={12} className={styles.new_user_directive}>
                    {i18n.t('DONT_HAVE_ACCOUNT')}?&nbsp;
                    <a
                      href="mailto:admin@talentsteps.com"
                      className={styles.contact_sales_link}
                    >{i18n.t('CONTACT_US')}</a>
                  </Col>
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
