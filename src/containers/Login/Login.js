import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, Row, Col } from 'react-bootstrap';
import { reduxForm, getFormValues } from 'redux-form';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import * as authActions from 'redux/modules/auth/auth';
import InputBox from '../../components/FormComponents/InputBox';
// import CheckBox from '../../components/FormComponents/CheckBox';
import { getLoginFormConfig, loginValidation } from '../../formConfig/Login';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
@reduxForm({
  form: 'login',
  touchOnChange: true,
  validate: loginValidation
})
@connect((state, props) => ({
  user: state.auth.user,
  error: state.auth.error,
  loggingIn: state.auth.loggingIn,
  pathname: state.routing.locationBeforeTransitions.pathname,
  values: getFormValues(props.form)(state)
}), { ...authActions })
export default class Login extends Component {
  static propTypes = {
    user: PropTypes.shape({
      email: PropTypes.string
    }),
    login: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    error: PropTypes.object,
    values: PropTypes.object,
    initialize: PropTypes.func.isRequired,
    loggingIn: PropTypes.bool,
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
    loggingIn: false
  };

  componentDidMount() {
    window.onload = () => {
      const { error } = this.props;
      if (error && error.error && error.error.statusCode === 403) {
        toastrErrorHandling({}, i18n.t('ERROR'), error.error.message);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUserId');
        // when error 403 occurs logout-event triggered to logout all tabs in window 
        localStorage.setItem('logout-event', Date.now());
        document.cookie = 'authorization=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
      }
    };
  }

  onFacebookLogin = (err, data) => {
    if (err) return;
    this.props.login('facebook', data, false).then(this.successLogin).catch(error => {
      if (error.message === 'Incomplete oauth registration') {
        this.context.router.push({
          pathname: '/register',
          state: { oauth: error.data }
        });
      }
    });
  };

  login = evt => {
    evt.preventDefault();
    this.props.values.username = this.props.values.username.toLowerCase();
    this.props.login('local', this.props.values).then(this.successLogin, err => {
      const { error } = err;
      if (error.statusCode && error.statusCode === 401) {
        this.props.initialize({
          username: this.props.values.username,
          password: ''
        });
      }
    }).catch(() => {});
  }

  render() {
    const { handleSubmit, user, pathname, logout, values, loggingIn } = this.props;
    const loginFormConfig = getLoginFormConfig(this);
    const styles = require('./Login.scss');
    return (
      <div className={styles.login_container}>
        <div className={`container ${styles.loginSection}`}>
          {!user && (<Row className={styles.login_box}>
            <Col sm={12} className={`p-0 ${styles.login_content}`} >
              <Helmet title={i18n.t('LOGIN')} />
              <Col sm={12} className={styles.banner}>
                <Image src="/javaji-banner.png" responsive />
              </Col>
              <Col sm={12} className={styles.title}>Login to Recruitment Portal</Col>
              <Col sm={12} className="p-0">
                <form onSubmit={handleSubmit(this.login)}>
                  <Row className="m-0">
                    <Col sm={12} className="m-t-25 p-0">
                      <InputBox {...loginFormConfig.fields[0]} />
                    </Col>
                    <Col sm={12} className="m-t-25 p-0">
                      <InputBox {...loginFormConfig.fields[1]} />
                    </Col>
                    <Col sm={12} className="m-t-25 p-0">
                      <button
                        type="submit"
                        className={`btn orange-btn ${styles.login_btn}`}
                        disabled={!values.username || !values.password || loggingIn}
                        onClick={this.login}
                      >
                        { loggingIn ?
                          <i className="fa fa-spinner fa-spin p-l-r-7" aria-hidden="true" /> :
                          null
                        }
                        Login
                      </button>
                    </Col>
                    {/* <Col sm={6} md={6} className="m-t-35 p-l-0">
                      <CheckBox label={'Remember Me'} name={'rememberMe'} id={'rememberMe'} isDisabled />
                    </Col> */}
                    <Col sm={6} md={6} className={`m-t-35 p-r-0 text-right right ${styles.forgot_password}`}>
                      <Link to="/forgotPassword" >
                        Forgot Password?
                      </Link>
                    </Col>
                  </Row>
                </form>
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
