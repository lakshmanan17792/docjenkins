import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { translate } from 'react-i18next';
import { reduxForm, getFormValues } from 'redux-form';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
import InputBox from '../../components/FormComponents/InputBox';
import { getResetPasswordFormConfig, resetPasswordValidation } from '../../formConfig/ResetPassword';
import { resetPassword, validResetToken } from '../../redux/modules/users/user';
import Constants from '../../helpers/Constants';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';

@reduxForm({
  form: 'resetPassword',
  validate: resetPasswordValidation,
  touchOnChange: true
})
@connect((state, props) => ({
  verificationToken: state.routing.locationBeforeTransitions.query.verificationToken,
  values: getFormValues(props.form)(state)
}), {
  resetPassword, validResetToken, pushState
})
class ResetPassword extends Component {
  static propTypes = {
    verificationToken: PropTypes.string,
    resetPassword: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    validResetToken: PropTypes.func.isRequired,
    values: PropTypes.object
  };

  static defaultProps = {
    verificationToken: null,
    values: {}
  };

  componentWillMount() {
    const { verificationToken } = this.props;
    this.props.validResetToken(verificationToken).then({}, () => {
      toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.INVALID_RESET_VERIFICATION_TOKEN'));
      this.props.pushState('/login');
    });
  }

  registerUser = () => {
    const { verificationToken, values } = this.props;
    if (values.newPassword === values.confirmPassword) {
      this.props.resetPassword(verificationToken, values).then(() => {
        toastr.success(i18n.t('successMessage.PASSWORD_UPDATED'),
          i18n.t('successMessage.PASSWORD_UPDATED_SUCCESSFULLY'));
        this.props.pushState({ pathname: '/Login' });
      });
    } else {
      toastr.error(i18n.t('errorMessage.PASSWORD_ERROR'), i18n.t('errorMessage.PASSWORD_DOES_NOT_MATCH'));
    }
  }

  render() {
    const { values, handleSubmit } = this.props;
    const styles = require('../Login/AppLogin.scss');
    const resetPasswordFormConfig = getResetPasswordFormConfig(this);
    return (
      <div className={styles.login_container}>
        <div className={`container ${styles.loginSection}`}>
          <Row className={styles.login_area}>
            <Col xs={12} className={styles.login_inner_area}>
              <Col xs={6} className={styles.login_img}>
                <Col xs={12} className="p-0">
                  <img alt="LoginImage" src={`${Constants.logo.loginImage}`} />
                </Col>
              </Col>
              <Col xs={6} className={styles.login_box}>
                <Col xs={12} className={`p-0 ${styles.login_content}`} >
                  <Helmet title={i18n.t('RESET_PASSWORD')} />
                  <Col xs={12} className={styles.banner}>
                    {/* <img
                      src={`${Constants.logoURL.url}/appLogo`}
                      alt="TalentSteps"
                      className={styles.logo}
                    /> */}
                    <img src={`${Constants.logo.path}`} alt="TalentSteps" className={styles.logo} />
                  </Col>
                  <Col xs={12} className={styles.title}>{i18n.t('RESET_PASSWORD')}</Col>
                  <Col xs={12} className="p-0">
                    <form onSubmit={handleSubmit(this.registerUser)}>
                      <Row className={`${styles.formElements} m-0`}>
                        <Col xs={10} className="m-t-25 p-0">
                          <InputBox {...resetPasswordFormConfig.fields[0]} />
                        </Col>
                        <Col xs={10} className="m-t-25 p-0">
                          <InputBox {...resetPasswordFormConfig.fields[1]} />
                        </Col>
                        <Col xs={10} className="m-t-25 p-0">
                          <button
                            type="submit"
                            className={`${styles.login_button} button-primary`}
                            disabled={!values.newPassword || !values.confirmPassword}
                          > {i18n.t('UPDATE')} </button>
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

export default translate('translations')(ResetPassword);

