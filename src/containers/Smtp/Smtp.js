import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import { push as pushState } from 'react-router-redux';
import SmtpForm from './SmtpForm';
import { loadSmtp, saveEmailConfig, updatEmailConfig } from '../../redux/modules/smtp';
import Loader from '../../components/Loader';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

@connect(state => ({
  user: state.auth.user,
  emailConfig: state.smtp.emailConfig,
  loading: state.smtp.loading
}), { loadSmtp, saveEmailConfig, updatEmailConfig, pushState })
export default class Smtp extends Component {
  static propTypes = {
    user: PropTypes.o,
    location: PropTypes.o,
    pushState: PropTypes.func.isRequired,
    emailConfig: PropTypes.object.isRequired,
    loadSmtp: PropTypes.func.isRequired,
    saveEmailConfig: PropTypes.func.isRequired,
    updatEmailConfig: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
  }

  static defaultProps = {
    user: {},
    location: {},
    emailConfig: {}
  };

  componentWillMount = () => {
    this.props.loadSmtp(this.props.user.id);
  }

  handleSubmit = async data => {
    const config = await data;
    const emailConfig = {};

    emailConfig.id = config.id ? config.id : null;
    emailConfig.smtp_host = config.SMTP_host;
    emailConfig.smtp_port = config.SMTP_port;
    emailConfig.imap_host = config.IMAP_host;
    emailConfig.imap_port = config.IMAP_port;
    emailConfig.userId = this.props.user.id;
    emailConfig.auth = {};
    emailConfig.auth.user = config.auth_user;
    emailConfig.auth.pass = config.auth_password;
    emailConfig.isEncrypted = true;
    if (this.props.emailConfig.auth_password &&
      config.auth_password !== this.props.emailConfig.auth_password) {
      emailConfig.isEncrypted = false;
    }
    if (config.id) {
      this.props.updatEmailConfig(emailConfig).then(() => {
        const { location } = this.props;
        const candidates = location && location.state && location.state.candidates;
        const { jobId, attachJobDescription } = location && location.state && location.state;
        if (candidates) {
          this.props.pushState({ pathname: '/Emailer',
            state: { candidates, jobId, attachJobDescription, previousPath: '/smtpConfig' } });
        }
        toastr.success(i18n.t('successMessage.EMAIL_SMTP_CONFIGURED_SUCCESSFULLY'));
      }).catch(err => {
        toastrErrorHandling(err.error, '', i18n.t('errorMessage.EMAIL_SMTP_CONFIGURATION_FAILED'));
      });
    } else {
      this.props.saveEmailConfig(emailConfig).then(() => {
        if (localStorage.getItem('emailFromHistoryInfo')) {
          const emailFromHistoryInfo = JSON.parse(localStorage.getItem('emailFromHistoryInfo'));
          if (emailFromHistoryInfo.from === 'ATS') {
            this.props.pushState({
              pathname: '/ATSBoard',
              query: { jobId: emailFromHistoryInfo.jobId }
            });
          } else if (emailFromHistoryInfo.from === 'Company') {
            this.props.pushState({
              pathname: `/Company/${emailFromHistoryInfo.companyId}`
            });
          } else if (emailFromHistoryInfo.jobId) {
            this.props.pushState({
              pathname: 'ProfileSearch',
              query: { jobId: emailFromHistoryInfo.jobId }
            });
          } else {
            this.props.pushState({
              pathname: 'ProfileSearch',
            });
          }
        } else {
          this.props.pushState({ pathname: '/EmailConfig' });
        }
        toastr.success(i18n.t('successMessage.EMAIL_SMTP_CONFIGURED_SUCCESSFULLY'));
      }).catch(err => {
        toastrErrorHandling(err.error, '', i18n.t('errorMessage.EMAIL_SMTP_CONFIGURATION_FAILED'));
      });
    }
  }

  render() {
    const { emailConfig } = this.props;
    emailConfig.SMTP_port = emailConfig.SMTP_port && emailConfig.SMTP_port.toString();
    emailConfig.IMAP_port = emailConfig.IMAP_port && emailConfig.IMAP_port.toString();
    return (
      <div>
        <SmtpForm onSubmit={this.handleSubmit} initialValues={emailConfig} />
        <Loader loading={this.props.loading} />
      </div>
    );
  }
}
