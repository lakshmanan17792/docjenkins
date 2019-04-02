import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { reduxForm, getFormValues } from 'redux-form';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
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
export default class ForgotPassword extends Component {
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
      toastrErrorHandling(error.error, i18n.t('errorMessage.YOUR_EMAIL_ADDRESS_IS_NOT_REGISTERED._PLEASE_REGISTER'));
    });
  }

  render() {
    const { values, handleSubmit } = this.props;
    const styles = require('./Register.scss');
    const forgotPasswordFormConfig = getForgotPasswordFormConfig(this);
    return (
      <div className={styles.register_container}>
        <div className={`container ${styles.registerSection}`}>
          <Row className={styles.register_box}>
            <Col sm={12} className={`p-0 ${styles.register_content}`} >
              <Helmet title={i18n.t('FORGOT_PASSWORD')} />
              <Col sm={12} className={styles.banner}>
                <Image src="/javaji-banner.png" responsive />
              </Col>
              <Col sm={12} className={styles.title}>Please enter your email </Col>
              <Col sm={12} className="p-0">
                <form onSubmit={handleSubmit(this.forgotPassword)}>
                  <Row className="m-0">
                    <Col sm={12} className="m-t-15 p-0">
                      <InputBox {...forgotPasswordFormConfig.fields[0]} />
                    </Col>
                    <Col sm={12} className="m-t-25 p-0">
                      <button
                        type="submit"
                        className={`btn orange-btn ${styles.register_btn}`}
                        disabled={!values.email}
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
              </Col>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
