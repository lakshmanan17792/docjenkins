import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { reduxForm, getFormValues } from 'redux-form';
import { translate } from 'react-i18next';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
import Constants from '../../helpers/Constants';
import InputBox from '../../components/FormComponents/InputBox';
import { getForgotPasswordFormConfig, forgotPasswordValidation } from '../../formConfig/ForgotPassword';
import { forgotPassword } from '../../redux/modules/users/user';
import { trimExtraSpaces } from '../../utils/validation';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';

@reduxForm({
  form: 'forgotPassword',
  validate: forgotPasswordValidation,
  touchOnChange: true
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state)
}), {
  forgotPassword,
  pushState
})

class ForgotPassword extends Component {
  static propTypes = {
    forgotPassword: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    values: PropTypes.object
  };

  static defaultProps = {
    values: {}
  };

  forgotPassword = data => {
    data = trimExtraSpaces(data);
    this.props.forgotPassword(data).then(() => {
      this.props.pushState({ pathname: '/Login' });
      toastr.success(i18n.t('successMessage.NEW_PASSWORD_REQUEST'),
        i18n.t('successMessage.A_LINK_TO_RESET_YOUR_PASSWORD_HAS_BEEN_EMAILED_SUCCESSFULLY'));
    }, error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.YOUR_EMAIL_ADDRESS_IS_NOT_REGISTERED'));
    });
  }

  render() {
    const { values, handleSubmit } = this.props;
    const styles = require('../Login/AppLogin.scss');
    const forgotPasswordFormConfig = getForgotPasswordFormConfig(this);
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
                  <Helmet title={i18n.t('FORGOT_PASSWORD')} />
                  <Col xs={12} className={styles.banner}>
                    {/* <img
                      src={`${Constants.logoURL.url}/appLogo`}
                      alt="TalentSteps"
                      className={styles.logo}
                    /> */}
                    <img src={`${Constants.logo.path}`} alt="TalentSteps" className={styles.logo} />
                  </Col>
                  <Col xs={12} className={styles.title}>{i18n.t('PLEASE_ENTER_YOUR_EMAIL')}</Col>
                  <Col xs={12} className="p-0">
                    <form onSubmit={handleSubmit(this.forgotPassword)}>
                      <Row className={`${styles.formElements} m-0`}>
                        <Col xs={10} className="m-t-25 p-0">
                          <InputBox {...forgotPasswordFormConfig.fields[0]} />
                        </Col>
                        <Col xs={10} className="m-t-25 p-0">
                          <button
                            type="submit"
                            className={`${styles.login_button} button-primary`}
                            disabled={!values.email}
                          > {i18n.t('SUBMIT')} </button>
                        </Col>
                        <Col xs={12} className={styles.new_user_directive}>
                          <Link to="/login" className="orange" > {i18n.t('GO_BACK_TO_LOGIN')} </Link>
                        </Col>
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

export default translate('translations')(ForgotPassword);
