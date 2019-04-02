import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push as pushState } from 'react-router-redux';
import { saveAccessToken } from '../../redux/modules/emailConfig';
import { updateUserEmailConfig } from '../../redux/modules/auth/auth';
import { addSelectedCandidates } from '../../redux/modules/ATS';
import styles from './EmailConfig.scss';

@connect(() => ({}), { saveAccessToken, pushState, updateUserEmailConfig, addSelectedCandidates })

export default class EmailAuthorization extends Component {
  static propTypes = {
    pushState: PropTypes.func.isRequired,
    saveAccessToken: PropTypes.func,
    updateUserEmailConfig: PropTypes.func,
    addSelectedCandidates: PropTypes.func,
    location: PropTypes.object,
  }

  static defaultProps = {
    saveAccessToken: null,
    location: null,
    addSelectedCandidates: null,
    updateUserEmailConfig: null,
  }
  componentWillMount = () => {
    if (this.props.location.query && this.props.location.query.code) {
      this.props.saveAccessToken(this.props.location.query.code).then(() => {
        this.props.updateUserEmailConfig(true);
        if (localStorage.getItem('emailFromHistoryInfo')) {
          const emailFromHistoryInfo = JSON.parse(localStorage.getItem('emailFromHistoryInfo'));
          const { from, filters, candidates } = emailFromHistoryInfo;
          if (from === 'ProfileSearch' && filters) {
            sessionStorage.setItem('profilefilters', JSON.stringify(filters));
          }
          if (from === 'ATS') {
            if (candidates && candidates.length > 0) {
              this.props.addSelectedCandidates(candidates);
            }
          }
          this.props.pushState(this.getFromPath(from, emailFromHistoryInfo));
        } else {
          this.props.pushState({ pathname: '/EmailConfig' });
        }
      }, () => {
      });
    }
  }

  getFromPath = (fromPath, emailFromHistoryInfo) => {
    const pathConfig = {
      ATS: {
        pathname: '/ATSBoard',
        query: { jobId: emailFromHistoryInfo.jobId }
      },
      company: {
        pathname: `/Company/${emailFromHistoryInfo.companyId}`
      },
      candidateProfile: {
        pathname: `ProfileSearch/${emailFromHistoryInfo.candidateProfileId}`,
        query: { isATSBoard: true }
      },
      jobOpening: {
        pathname: `/Openings/${emailFromHistoryInfo.jobOpeningId}`
      },
      ProfileSearch: {
        pathname: 'ProfileSearch'
      }
    };
    return pathConfig[fromPath];
  }

  render() {
    return (
      <div className={styles.emailAuthorize}>
        <img className={styles.logo} src="/email_authorize.png" alt="email authorize" />
        <div className={styles.title}>
          Connecting with your email account now
        </div>
        <div className={styles.sub_title}>
          This will only take a moment…
        </div>
      </div>
    );
  }
}
