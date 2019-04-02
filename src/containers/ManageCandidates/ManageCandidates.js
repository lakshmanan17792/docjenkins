import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Tabs, Tab, Image } from 'react-bootstrap';
import Helmet from 'react-helmet';
import moment from 'moment';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';

import i18n from '../../i18n';
import UserMenu from '../Users/UserMenu';
import ArchivedCandidates from './ArchivedCandidates';
import ToBeUnarchivedCandidates from './ToBeUnarchiveCandidates';
import NewPermissible from '../../components/Permissible/NewPermissible';
import ToBeDeletedCandidates from './ToBeDeletedCandidates';

import styles from '../Users/Users.scss';
import candidateStyles from './Candidates.scss';

@connect(() => {}, {
  pushState
})
export default class ManageCandidates extends Component {
  static propTypes = {
    location: PropTypes.object,
    pushState: PropTypes.func.isRequired
  };

  static defaultProps = {
    location: null
  };

  constructor(props) {
    super(props);
    const isArchivedCandidatesPermitted = NewPermissible.isPermitted({
      operation: 'ARCHIVED_CANDIDATES', model: 'resume' });
    const isPendingForUnarchvivalPermitted = NewPermissible.isPermitted({
      operation: 'UNARCHIVE_PENDING_CANDIDATES', model: 'resume' });
    const isPendingForDeletionPermitted = NewPermissible.isPermitted({
      operation: 'APPROVE_DELETE', model: 'resume' });
    let activeKey = 1;
    if (isArchivedCandidatesPermitted || isPendingForUnarchvivalPermitted || isPendingForDeletionPermitted) {
      if (!isArchivedCandidatesPermitted) {
        activeKey = 2;
        if (!isPendingForUnarchvivalPermitted) {
          activeKey = 3;
        }
      }
    }
    this.state = {
      activeKey,
      isArchivedCandidatesPermitted,
      isPendingForUnarchvivalPermitted,
      isPendingForDeletionPermitted,
    };
  }
  componentWillMount() {
    const { location } = this.props;
    if (location && location.state) {
      this.setState({ activeKey: location.state.activeKey });
    } else if (sessionStorage.getItem('manageCandidateTabKey')) {
      this.setState({ activeKey: JSON.parse(sessionStorage.getItem('manageCandidateTabKey')) });
    }
  }
  handleSelect = key => {
    sessionStorage.clear();
    this.setState({ activeKey: key }, () => {
      sessionStorage.setItem('manageCandidateTabKey', key);
    });
  }
  returnLogoText = (firstName, lastName) => {
    const candidateLastName = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstName.charAt(0).toUpperCase() + candidateLastName;
  }
  viewProfile = (evt, resumeId) => {
    this.props.pushState({ pathname: `/ProfileSearch/${resumeId}`, query: { profileId: resumeId } });
  }
  formatCandidateName = candidate => (
    <div style={{ display: 'inline-flex' }}>
      <div className={candidateStyles.name_logo}>
        <span className={candidateStyles.name_initials}>
          { this.returnLogoText(candidate.firstName, candidate.lastName) }
        </span>
      </div>
      <div className={candidateStyles.basic_info}>
        <div
          className={candidateStyles.name}
        >
          <span
            onClick={evt => this.viewProfile(evt, candidate.id)}
            role="presentation"
            style={{ cursor: 'pointer' }}
          >{ candidate.name.toLowerCase() }</span>
          <span className={`${candidateStyles.exp} p-l-10`}>
            {`( ~ ${Math.round(candidate.totalYearsOfExperience)}y exp)`}
          </span>
        </div>
        <div className={candidateStyles.title}>{candidate.title}</div>
      </div>
    </div>
  );
  renderRequestDate = candidate => (
    <div className={candidateStyles.date}>
      <div className={candidateStyles.archive_timestamp}>
        { candidate.isArchived ? i18n.t('ARCHIVED_ON') :
          i18n.t('DELETE_REQUEST_RAISED_ON') }
      </div>
      <Image className={candidateStyles.clock_icon} src="/clock.svg" responsive />
      { moment(candidate.isArchived ? candidate.archiveScheduleDate :
        candidate.deleteInitializedAt).format('MMM Do YYYY') }
    </div>
  )
  renderRequestRaisedBy = candidate => (
    <div className={candidateStyles.raised_by_name}>
      { candidate.isArchived ? `${i18n.t('ARCHIVED_BY')} ` : `${i18n.t('RAISED_BY')} ` }
      {candidate.isArchived ? candidate.archiveUserFirstname : candidate.raisedBy}
      <div className={candidateStyles.raised_by_date}>
        {moment(candidate.isArchived ? candidate.archiveScheduleDate :
          candidate.deleteInitializedAt).format('MMM Do YYYY')}
      </div>
    </div>
  )
  render() {
    const { isArchivedCandidatesPermitted, isPendingForUnarchvivalPermitted,
      isPendingForDeletionPermitted } = this.state;
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={styles.users_container}>
        <Helmet title={i18n.t('MANAGE_CANDIDATES')} />
        <Col lg={2} md={2} sm={2} xs={12} className="p-0">
          <Col lg={12} md={12} sm={12} xs={12} className={styles.sidenav}>
            <Col lg={12} md={12} sm={12} xs={12} className="p-0">
              <UserMenu />
            </Col>
          </Col>
        </Col>
        <Col
          lg={10}
          md={10}
          sm={10}
          xs={12}
          className={`${styles.users_table} p-0`}
        >
          <Col
            lg={12}
            md={12}
            sm={12}
            xs={12}
            className="p-t-10 p-b-10 m-l-0 m-r-0"
          >
            <div className={`${styles.page_title}`}>
              <Trans>MANAGE_CANDIDATES</Trans>
            </div>
          </Col>
          <Col
            lg={12}
            md={12}
            sm={12}
            xs={12}
            className="p-t-0 m-l-0 m-r-0"
          >
            <Tabs
              activeKey={this.state.activeKey}
              onSelect={this.handleSelect}
              className={`${styles.tab_section} ${styles.tab_candidates_section}`}
              id="manage_candidates"
            >
              { isArchivedCandidatesPermitted &&
              <Tab eventKey={1} title={i18n.t('ARCHIVED_CANDIDATES')}>
                {
                  this.state.activeKey === 1 &&
                  <Col lg={12} xs={12} md={12} className={styles.tableStyles}>
                    <ArchivedCandidates
                      formatCandidateName={this.formatCandidateName}
                      renderRequestDate={this.renderRequestDate}
                      renderRequestRaisedBy={this.renderRequestRaisedBy}
                    />
                  </Col>
                }
              </Tab>}
              { isPendingForUnarchvivalPermitted &&
              <Tab eventKey={2} title={i18n.t('PENDING_FOR_UNARCHIVAL')}>
                {
                  this.state.activeKey === 2 &&
                  <Col lg={12} xs={12} md={12} className={styles.tableStyles}>
                    <ToBeUnarchivedCandidates
                      formatCandidateName={this.formatCandidateName}
                      renderRequestDate={this.renderRequestDate}
                      renderRequestRaisedBy={this.renderRequestRaisedBy}
                      returnLogoText={this.returnLogoText}
                    />
                  </Col>
                }
              </Tab>}
              { isPendingForDeletionPermitted &&
              <Tab eventKey={3} title={i18n.t('PENDING_FOR_DELETION')}>
                {
                  this.state.activeKey === 3 &&
                    <Col lg={12} xs={12} md={12} className={styles.tableStyles}>
                      <ToBeDeletedCandidates
                        formatCandidateName={this.formatCandidateName}
                        renderRequestDate={this.renderRequestDate}
                        renderRequestRaisedBy={this.renderRequestRaisedBy}
                        returnLogoText={this.returnLogoText}
                      />
                    </Col>
                }
              </Tab>
              }
            </Tabs>
          </Col>
        </Col>
      </Col>
    );
  }
}
