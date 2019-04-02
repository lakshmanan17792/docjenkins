import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Row, Col } from 'react-bootstrap';
import { translate } from 'react-i18next';
import { reduxForm, getFormValues, propTypes } from 'redux-form';
import { push as pushState } from 'react-router-redux';
import Helmet from 'react-helmet';
import InputBox from '../../components/FormComponents/InputBox';
import { getRegisterFormConfig, registerValidation } from '../../formConfig/UserRegister';
import { verifyToken, registerUser, verifyUserName } from '../../redux/modules/users/user';
import { logout } from '../../redux/modules/auth/auth';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import Constants from '../../helpers/Constants';
import i18n from '../../i18n';

@reduxForm({
  form: 'register',
  validate: registerValidation,
  touchOnChange: true,
  touchOnBlur: true
})
@connect((state, props) => ({
  tokenUser: state.user.tokenUser,
  pathname: state.routing.locationBeforeTransitions.pathname,
  verificationToken: state.routing.locationBeforeTransitions.query.verificationToken,
  values: getFormValues(props.form)(state)
}), {
  verifyToken,
  registerUser,
  logout,
  pushState,
  verifyUserName
})
class Register extends Component {
  static propTypes = {
    ...propTypes,
    tokenUser: PropTypes.object,
    logout: PropTypes.func.isRequired,
    verificationToken: PropTypes.string,
    values: PropTypes.object,
    verifyToken: PropTypes.func.isRequired,
    registerUser: PropTypes.func.isRequired,
    verifyUserName: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  static defaultProps = {
    tokenUser: null,
    verificationToken: '',
    values: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      userNameErrorMsg: null
    };
  }

  componentWillMount() {
    const { verificationToken } = this.props;
    this.props.verifyToken(verificationToken).then({}, () => {
      toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.INVALID_REGISTER_VERIFICATION_TOKEN'));
      this.props.pushState('/login');
    });
  }

  registerUser = () => {
    const { verificationToken, values } = this.props;
    values.username = values.username.toLowerCase();
    if (values.password === values.confirmPassword) {
      this.props.verifyUserName(values.username).then(result => {
        if (result.validUsername) {
          this.props.registerUser(verificationToken, values).then(() => {
            this.props.pushState({ pathname: '/login' });
          });
        } else {
          toastrErrorHandling({}, i18n.t('errorMessage.USERNAME_ERROR'),
            i18n.t('errorMessage.USERNAME_ALREADY_EXISTS'));
        }
      });
    } else {
      toastr.error(i18n.t('errorMessage.PASSWORD_ERROR'), i18n.t('errorMessage.PASSWORD_DOES_NOT_MATCH'));
    }
  }

  validateUserName = e => {
    if (e.target.value === '') {
      this.setState({
        userNameErrorMsg: i18n.t('validationMessage.USERNAME_IS_REQUIRED'),
      });
    } else {
      this.props.verifyUserName(e.target.value).then(result => {
        if (result.validUsername) {
          this.setState({
            userNameErrorMsg: null,
          });
        } else {
          this.setState({
            userNameErrorMsg: i18n.t('errorMessage.USERNAME_ALREADY_EXISTS'),
          });
        }
      });
    }
  }

  render() {
    const { handleSubmit, invalid } = this.props;
    const { userNameErrorMsg } = this.state;
    const styles = require('../Login/AppLogin.scss');
    const registerFormConfig = getRegisterFormConfig(this);
    return (
      <div className={styles.login_container}>
        <div className={`container ${styles.loginSection}`}>
          <Row className={styles.login_area}>
            <Col xs={12} className={styles.login_inner_area}>
              <Col xs={6} className={styles.login_img}>
                <Col xs={12} className="p-0">
                  <img alt="loginImage" src={`${Constants.logo.loginImage}`} />
                </Col>
              </Col>
              <Col xs={6} className={styles.login_box}>
                <Col xs={12} className={`p-0 ${styles.login_content}`} >
                  <Helmet title={i18n.t('REGISTER')} />
                  <Col xs={12} className={styles.banner}>
                    <img src={`${Constants.logo.path}`} alt="TalentSteps" className={styles.logo} />
                  </Col>
                  <Col xs={12} className={styles.title}>{i18n.t('REGISTER')}</Col>
                  <Col xs={12} className="p-0">
                    <form onSubmit={handleSubmit(this.registerUser)}>
                      <Row className={`${styles.formElements} m-0`}>
                        <Col xs={10} className="m-t-25 p-0">
                          <InputBox {...registerFormConfig.fields[0]} />
                          {userNameErrorMsg && <div className="error-message">{this.state.userNameErrorMsg}</div>}
                        </Col>
                        <Col xs={10} className="m-t-25 p-0">
                          <InputBox {...registerFormConfig.fields[1]} />
                        </Col>
                        <Col xs={10} className="m-t-25 p-0">
                          <InputBox {...registerFormConfig.fields[2]} />
                        </Col>
                        <Col xs={10} className="m-t-25 p-0">
                          <button
                            type="submit"
                            className={`${styles.login_button} button-primary`}
                            disabled={invalid || userNameErrorMsg !== null}
                          > {i18n.t('REGISTER')} </button>
                        </Col>
                        {/* for bottom space need to add content in future */ }
                        <Col xs={12} className={styles.new_user_directive} />
                      </Row>
                    </form>
                  </Col>
                </Col>
              </Col>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default translate('translations')(Register);

