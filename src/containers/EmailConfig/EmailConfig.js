import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { loadOutlookConnectUrl, disconnectOutlook } from '../../redux/modules/emailConfig';
import { updateUserEmailConfig } from '../../redux/modules/auth/auth';
import { addSelectedCandidates } from '../../redux/modules/ATS';
import styles from './EmailConfig.scss';
import i18n from '../../i18n';

@connect(state => ({
  outlookConnectUrl: state.emailConfig.outlookConnectUrl,
  emailConfigType: state.emailConfig.emailConfigType,
  isEmailConfigured: state.emailConfig.isEmailConfigured,
  emailConfig: state.emailConfig.emailConfig
}), { loadOutlookConnectUrl, disconnectOutlook, pushState, updateUserEmailConfig, addSelectedCandidates })

export default class EmailConfig extends Component {
  static propTypes = {
    outlookConnectUrl: PropTypes.string,
    loadOutlookConnectUrl: PropTypes.func.isRequired,
    updateUserEmailConfig: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    addSelectedCandidates: PropTypes.func,
    disconnectOutlook: PropTypes.func,
    emailConfig: PropTypes.object,
    isEmailConfigured: PropTypes.bool,
  }

  static defaultProps = {
    disconnectOutlook: null,
    outlookConnectUrl: null,
    addSelectedCandidates: null,
    emailConfig: {},
    isEmailConfigured: false,
  }
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      configMap: {
        OUTLOOK: ['OUTLOOK'],
        SMTP: ['SMTP'],
        ALL: ['OUTLOOK', 'SMTP']
      }
    };
  }

  componentWillMount = () => {
    if (localStorage.getItem('emailFromHistoryInfo')) {
      const emailFromHistoryInfo = JSON.parse(localStorage.getItem('emailFromHistoryInfo'));
      if (emailFromHistoryInfo.from === 'ATS') {
        if (emailFromHistoryInfo.candidates && emailFromHistoryInfo.candidates.length > 0) {
          this.props.addSelectedCandidates(emailFromHistoryInfo.candidates);
        }
      }
    }
    this.props.loadOutlookConnectUrl().then(result => {
      this.props.updateUserEmailConfig(result.isEmailConfigured);
    });
  }
  redirectToConfigure=() => {
    const emailFromHistoryInfo = JSON.parse(localStorage.getItem('emailFromHistoryInfo'));
    if (emailFromHistoryInfo && emailFromHistoryInfo.from === 'ProfileSearch') {
      const emailHistory = JSON.parse(localStorage.getItem('emailFromHistoryInfo'));
      const filters = JSON.parse(sessionStorage.getItem('profilefilters'));
      localStorage.setItem('emailFromHistoryInfo', JSON.stringify({ ...emailHistory, filters }));
    }
    window.location.href = this.props.outlookConnectUrl;
  }

  toggleModal = () => {
    if (!this.props.isEmailConfigured) {
      this.setState({ showModal: !this.state.showModal });
      return;
    }
    this.props.disconnectOutlook(this.props.emailConfig.id).then(() => {
      this.props.updateUserEmailConfig(false);
    });
  }

  createModal = () => (
    <Modal show={this.state.showModal} onHide={this.toggleModal} className={styles.configModal}>
      <Modal.Header closeButton>
        <Modal.Title className={styles.modalTitle}>
          {i18n.t('emailMessage.CONNECTING_YOUR_ACCOUNT_IS_KIND_OF_BIG_DEAL')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {i18n.t('emailMessage.CLEAR_ABOUT_WORKING')}
        </p>
        <p>
          {i18n.t('emailMessage.INITIAL_STEPS_ABOUT_SOURCEEXACT')}
        </p>
        {i18n.t('emailMessage.PROCESS_ABOUT_SOURCEEXACT')}
        <p>
          {i18n.t('emailMessage.CHANGE_SETTINGS_FOR_CONFIGURATION')}
        </p>
        {i18n.t('emailMessage.ACCESS_INFORMATION')}
        <p>
          {i18n.t('emailMessage.MORE_ABOUT_SOURCEEXACT')}
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={this.toggleModal} className={styles.cancel}>{i18n.t('CANCEL')}</Button>
        <Button
          className={`${styles.accept} btn`}
          onClick={this.redirectToConfigure}
        >{i18n.t('emailMessage.ACCEPT_AND_CONTINUE_TO_OUTLOOK')}</Button>
      </Modal.Footer>
    </Modal>
  )

  navigateToSMTP = () => {
    this.props.pushState({ pathname: '/SMTPConfig' });
  }

  outlook = isEmailConfigured =>
    (
      <div className={styles.card}>
        <img className={styles.logo} src="/office365.png" alt="office 365" />
        <div>
          <Button
            onClick={this.toggleModal}
            className={`${styles.btnConnect} btn m-t-10`}
          >
            {isEmailConfigured ? i18n.t('DISCONNECT') : i18n.t('CONNECT') }
          </Button>
        </div>
      </div>
    )
  smtp = isEmailConfigured =>
    (
      <div className={styles.card}>
        <img className={styles.logo} src="/imap.png" alt="office 365" />
        <div>
          <Button
            onClick={this.navigateToSMTP}
            className={`${styles.btnConnect} btn m-t-10`}
          >
            {isEmailConfigured ? i18n.t('DISCONNECT') : i18n.t('CONNECT') }
          </Button>
        </div>
      </div>
    )
  cardBuilder = isEmailConfigured => this.outlook(isEmailConfigured);

  render() {
    const { isEmailConfigured } = this.props;
    return (
      <div className={styles.emailConfig}>
        <Helmet title={i18n.t('EMAIL_CONFIG')} />
        <div className={styles.title}>
          {i18n.t('emailMessage.KEEP_TRACT_OF_YOUR_EMAIL_ACTIVITY_IN_YOUR_CRM')}
        </div>
        <div className={styles.subTitle}>
          {i18n.t('emailMessage.CONNECT_YOUR_EMAIL_ACCOUNT')}
          <br />
          {i18n.t('emailMessage.ALL_YOUR_EMAIL_CONVERSATIONS_WILL__APPEAR_IN_TIMELINE')}
        </div>
        <div className={styles.cardContainer}>
          { this.cardBuilder(isEmailConfigured) }
        </div>
        {this.createModal()}
      </div>
    );
  }
}
