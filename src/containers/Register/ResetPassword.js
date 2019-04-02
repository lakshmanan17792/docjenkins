import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, Row, Col } from 'react-bootstrap';
import { reduxForm, getFormValues } from 'redux-form';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import InputBox from '../../components/FormComponents/InputBox';
import { getResetPasswordFormConfig, resetPasswordValidation } from '../../formConfig/ResetPassword';
import { resetPassword } from '../../redux/modules/users/user';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

@reduxForm({
  form: 'resetPassword',
  validate: resetPasswordValidation
})
@connect((state, props) => ({
  verificationToken: state.routing.locationBeforeTransitions.query.verificationToken,
  values: getFormValues(props.form)(state)
}), {
  resetPassword,
  pushState
})
export default class ResetPassword extends Component {
  static propTypes = {
    verificationToken: PropTypes.string,
    resetPassword: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    values: PropTypes.object
  };

  static defaultProps = {
    verificationToken: null,
    values: {}
  };

  registerUser = () => {
    const { verificationToken, values } = this.props;
    if (values.newPassword === values.confirmPassword) {
      this.props.resetPassword(verificationToken, values).then(() => {
        toastr.success(i18n.t('successMessage.PASSWORD_UPDATED'),
          i18n.t('successMessage.PASSWORD_UPDATED_SUCCESSFULLY'));
        this.props.pushState({ pathname: '/Login' });
      });
    } else {
      toastrErrorHandling({}, i18n.t('errorMessage.PASSWORD_ERROR'),
        i18n.t('errorMessage.PASSWORD_DOES_NOT_MATCH'));
    }
  }

  render() {
    const { values, handleSubmit, verificationToken } = this.props;
    const styles = require('./Register.scss');
    const resetPasswordFormConfig = getResetPasswordFormConfig(this);
    return (
      <div className={styles.register_container}>
        <div className={`container ${styles.registerSection}`}>
          <Row className={styles.register_box}>
            <Col sm={12} className={`p-0 ${styles.register_content}`} >
              <Helmet title={i18n.t('RESET_PASSWORD')} />
              <Col sm={12} className={styles.banner}>
                <Image src="/javaji-banner.png" responsive />
              </Col>
              <Col sm={12} className={styles.title}>Reset Password </Col>
              <Col sm={12} className="p-0">
                { verificationToken ?
                  <form onSubmit={handleSubmit(this.registerUser)}>
                    <Row className="m-0">
                      <Col sm={12} className="m-t-15 p-0">
                        <InputBox {...resetPasswordFormConfig.fields[0]} />
                      </Col>
                      <Col sm={12} className="m-t-15 p-0">
                        <InputBox {...resetPasswordFormConfig.fields[1]} />
                      </Col>
                      <Col sm={12} className="m-t-25 p-0">
                        <button
                          type="submit"
                          className={`btn orange-btn ${styles.register_btn}`}
                          disabled={!values.newPassword || !values.confirmPassword}
                          onClick={this.register}
                        >
                        Submit
                        </button>
                      </Col>
                      <Col sm={12} className="m-t-25 p-0 text-center">
                        <Link to="/login" className="orange" >
                          Go Back to Login
                        </Link>
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
