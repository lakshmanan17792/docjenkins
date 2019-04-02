import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import { reduxForm, getFormValues, reset } from 'redux-form';
import { toastr } from 'react-redux-toastr';
import InputBox from '../../components/FormComponents/InputBox';
import { changePasswordValidation, getChangePasswordFormConfig } from '../../formConfig/ChangePassowed';
import { changePassword } from '../../redux/modules/users/user';
import styles from './userprofile.scss';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';

@reduxForm({
  form: 'changepassword',
  validate: changePasswordValidation,
  touchOnChange: true,
})
@connect(
  (state, props) => ({
    values: getFormValues(props.form)(state)
  }), {
    changePassword, reset
  })
export default class ChangePassword extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    changePassword: PropTypes.func.isRequired,
    values: PropTypes.object,
    reset: PropTypes.func.isRequired
  }

  static defaultProps = {
    user: null,
    values: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      passwordChanged: false
    };
  }

  componentWillMount() {
    if (localStorage.getItem('passwordCheck')) {
      this.setState({
        passwordChanged: true
      });
    } else {
      this.setState({
        passwordChanged: false
      });
    }
  }

  savePassword = () => {
    const { values } = this.props;
    const { passwordChanged } = this.state;
    if (localStorage.getItem('passwordCheck')) {
      localStorage.removeItem('passwordCheck');
    }
    if (values.newPassword === values.confirmPassword) {
      this.props.changePassword(values).then(() => {
        toastr.success(i18n.t('successMessage.PASSWORD_UPDATED'),
          i18n.t('successMessage.PASSWORD_UPDATED_SUCCESSFULLY'));
        this.props.reset('changepassword');
        if (passwordChanged) {
          browserHistory.push('/logout');
        }
      }, error => {
        toastrErrorHandling(error.error,
          i18n.t('errorMessage.PASSWORD_ERROR'), i18n.t('validationMessage.INVALID_OLD_PASSWORD'));
      });
    } else {
      toastrErrorHandling({}, i18n.t('errorMessage.PASSWORD_ERROR'), i18n.t('errorMessage.PASSWORD_DOES_NOT_MATCH'));
    }
  }

  render() {
    const { handleSubmit, values } = this.props;
    const changePasswordFormConfig = getChangePasswordFormConfig(this);
    return (
      <Col sm={12} className={`${styles.profile_password_form}`}>
        <form onSubmit={handleSubmit(this.savePassword)}>
          <Col sm={12}>
            <Row>
              <Col lg={6} md={6} sm={12} className="p-0 p-t-25 p-r-5">
                <div className={`${styles.profile_password}`}>
                  <InputBox {...changePasswordFormConfig.fields[0]} />
                </div>
                <div className={`${styles.profile_password}`}>
                  <InputBox {...changePasswordFormConfig.fields[1]} />
                </div>
                <div className={`${styles.profile_password}`}>
                  <InputBox {...changePasswordFormConfig.fields[2]} />
                </div>
                <Col lg={3} md={3} sm={5} className="p-0 p-t-25 p-r-5">
                  <button
                    disabled={!values.oldPassword || !values.newPassword || !values.confirmPassword}
                    className={`${styles.update_btn} button-primary`}
                    type="submit"
                  >
                    Update
                  </button>
                </Col>
              </Col>
              <Col lg={6} md={6} sm={12} className="p-0 p-t-25 p-r-5">
                <h4>{i18n.t('RULES_CHANGING_PASSWORD')}</h4>
                <ul>
                  <li>
                    {i18n.t('RULES_INDEX_ONE')}
                  </li>
                  <li>
                    {i18n.t('RULES_INDEX_TWO')}
                  </li>
                  <li>
                    {i18n.t('RULES_INDEX_THREE')}
                  </li>
                  <li>
                    {i18n.t('RULES_INDEX_FOUR')}
                  </li>
                  <li>
                    {i18n.t('RULES_INDEX_FIVE')}
                  </li>
                  <li>
                    {i18n.t('RULES_INDEX_SIX')}
                  </li>
                </ul>
              </Col>
            </Row>
          </Col>
        </form>
      </Col>
    );
  }
}
