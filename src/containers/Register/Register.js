import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, Row, Col } from 'react-bootstrap';
import { reduxForm, getFormValues, propTypes } from 'redux-form';
import { Link } from 'react-router';
import { push as pushState } from 'react-router-redux';
import Helmet from 'react-helmet';
import InputBox from '../../components/FormComponents/InputBox';
import { getRegisterFormConfig, registerValidation } from '../../formConfig/UserRegister';
import { verifyToken, registerUser, verifyUserName } from '../../redux/modules/users/user';
import { logout } from '../../redux/modules/auth/auth';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

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
export default class Register extends Component {
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
      openUserModal: false,
      invalid: false,
      userNameErrorMsg: null
    };
  }

  componentWillMount() {
    const { verificationToken } = this.props;
    this.props.verifyToken(verificationToken).then({
    }, () => {
      this.setState({
        invalidToken: true,
      });
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
      toastrErrorHandling({}, i18n.t('errorMessage.PASSWORD_ERROR'),
        i18n.t('errorMessage.PASSWORD_DOES_NOT_MATCH'));
    }
  }
  validateUserName = e => {
    if (e.target.value === '') {
      this.setState({
        userNameErrorMsg: 'Username is required',
      });
    } else {
      this.props.verifyUserName(e.target.value).then(result => {
        if (result.validUsername) {
          this.setState({
            userNameErrorMsg: null,
          });
        } else {
          this.setState({
            userNameErrorMsg: 'Username already exists',
          });
        }
      });
    }
  }

  render() {
    const { handleSubmit, invalid } = this.props;
    const { invalidToken, userNameErrorMsg } = this.state;
    const styles = require('./Register.scss');
    const registerFormConfig = getRegisterFormConfig(this);
    return (
      <div className={styles.register_container}>
        <div className={`container ${styles.registerSection}`}>
          <Row className={styles.register_box}>
            <Col sm={12} className={`p-0 ${styles.register_content}`} >
              <Helmet title={i18n.t('REGISTER')} />
              <Col sm={12} className={styles.banner}>
                <Image src="/javaji-banner.png" responsive />
              </Col>
              <Col sm={12} className={styles.title}>Register </Col>
              <Col sm={12} className="p-0">
                { !invalidToken ?
                  <form onSubmit={handleSubmit(this.registerUser)}>
                    <Row className="m-0">
                      <Col sm={12} className="m-t-15 p-0">
                        <InputBox {...registerFormConfig.fields[0]} />
                        {userNameErrorMsg && <div className="error-message">{this.state.userNameErrorMsg}</div>}
                      </Col>
                      <Col sm={12} className="m-t-15 p-0">
                        <InputBox {...registerFormConfig.fields[1]} />
                      </Col>
                      <Col sm={12} className="m-t-15 p-0">
                        <InputBox {...registerFormConfig.fields[2]} />
                      </Col>
                      <Col sm={12} className="m-t-25 p-0">
                        <button
                          type="submit"
                          className={`btn orange-btn ${styles.register_btn}`}
                          disabled={invalid || userNameErrorMsg !== null}
                          onClick={this.register}
                        >
                        Register
                        </button>
                      </Col>
                    </Row>
                  </form>
                  :
                  <div className="text-center">
                    <h4 className="text-center red"> Invalid token or URL..!  </h4>
                    <Link to="/login">
                      <button
                        className="btn btn-danger"
                      >
                       Go Back
                      </button>
                    </Link>
                  </div>
                }
              </Col>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
