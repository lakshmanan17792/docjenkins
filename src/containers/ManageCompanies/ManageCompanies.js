import React, { Component } from 'react';
import { Col, Tabs, Tab, Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import moment from 'moment';
import { Link } from 'react-router';
import { push as pushState } from 'react-router-redux';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import ToBeUnarchivedCompanies from './ToBeUnarchivedCompanies';
import ArchivedCompanies from './ArchivedCompanies';
import i18n from '../../i18n';
import UserMenu from '../Users/UserMenu';
import NewPermissible from '../../components/Permissible/NewPermissible';


import styles from '../Users/Users.scss';
import candidateStyles from '../ManageCandidates/Candidates.scss';

@connect(() => { }, {
  pushState
})
export default class ManageCompanies extends Component {
  static propTypes = {
    pushState: PropTypes.func.isRequired,
    location: PropTypes.object
  };

  static defaultProps = {
    location: null
  };

  constructor(props) {
    super(props);
    this.state = {
      activeKey: 1
    };
  }

  componentWillMount() {
    const isArchivedCompaniesPermitted = NewPermissible.isPermitted({
      operation: 'ARCHIVED_COMPANIES',
      model: 'customer'
    });
    const isPendingForUnArchivedCompaniesPermitted = NewPermissible.isPermitted({
      operation: 'UNARCHIVE_PENDING_COMPANIES',
      model: 'customer'
    });
    const { location } = this.props;
    if (location && location.state) {
      this.setState({ activeKey: location.state.activeKey });
    } else if (sessionStorage.getItem('manageCompanyTabKey')) {
      this.setState({ activeKey: JSON.parse(sessionStorage.getItem('manageCompanyTabKey')) });
    } else if (!isArchivedCompaniesPermitted) {
      this.setState({ activeKey: 2 });
    }
    this.setState({
      isArchivedCompaniesPermitted,
      isPendingForUnArchivedCompaniesPermitted
    });
  }

  handleSelect = key => {
    sessionStorage.clear();
    this.setState({ activeKey: key });
    sessionStorage.setItem('manageCompanyTabKey', key);
  }

  viewCompany = (evt, companyId) => {
    evt.preventDefault();
    this.props.pushState(`/Company/${companyId}`);
  }

  formatCompanyName = company => (
    <div style={{ display: 'inline-flex' }}>
      {
        company.domain ?
          <Image
            alt={company.domain}
            className={`${candidateStyles.logoImg}`}
            src={`https://logo.clearbit.com/${company.domain}`}
            onError={e => { e.target.src = '/company_icon.svg'; }}
          /> :
          <Image
            alt={company.domain}
            className={`${candidateStyles.logoImg}`}
            src={'/company_icon.svg'}
          />
      }
      <div className={candidateStyles.basic_info}>
        <div
          className={`${candidateStyles.name} ${candidateStyles.company_title}`}
        >
          <span
            onClick={evt => this.viewCompany(evt, company.id)}
            role="presentation"
            style={{ cursor: 'pointer' }}
          >{company.name}</span>
          {/* <span className={`${candidateStyles.exp} p-l-10`}>({ company.exp }y exp)</span> */}
        </div>
        <Link
          to={`http://${company.domain}`}
          className={company.domain ?
            `${candidateStyles.title} ${candidateStyles.company_link}` :
            `${candidateStyles.title} ${candidateStyles.company_link} ${candidateStyles.company_link_hidden}`}
          target="_blank"
        >{company.domain ? company.domain : 'domain unavailable'}</Link>
      </div>
    </div>
  );
  renderRequestDate = company => (
    <div className={candidateStyles.date}>
      <div className={candidateStyles.archive_timestamp}>
        {!company.isActive && i18n.t('ARCHIVED_ON')}
      </div>
      <Image className={candidateStyles.clock_icon} src="/clock.svg" responsive />
      {moment(!company.isActive && company.archiveScheduleDate).format('MMM Do YYYY')}
    </div>
  )
  renderRequestRaisedBy = company => (
    <div className={candidateStyles.raised_by_name}>
      {!company.isActive ? `${i18n.t('ARCHIVED_BY')} ` : `${i18n.t('RAISED_BY')} `}
      {!company.isActive ? company.archiveUserFirstname : company.raisedBy}
      <div className={candidateStyles.raised_by_date}>
        {moment(!company.isActive && company.archiveScheduleDate).format('MMM Do YYYY')}
      </div>
    </div>
  )
  render() {
    const { isArchivedCompaniesPermitted, isPendingForUnArchivedCompaniesPermitted } = this.state;
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={styles.users_container}>
        <Helmet title={i18n.t('MANAGE_COMPANIES')} />
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
            className="p-t-15 p-b-15 m-l-0 m-r-0"
          >
            <div className={`${styles.page_title}`}>
              {i18n.t('MANAGE_COMPANIES')}
            </div>
          </Col>
          <Col
            lg={12}
            md={12}
            sm={12}
            xs={12}
            className="p-t-15 m-l-0 m-r-0"
          >
            {(isArchivedCompaniesPermitted || isPendingForUnArchivedCompaniesPermitted) && <Tabs
              activeKey={this.state.activeKey}
              onSelect={this.handleSelect}
              className={`${styles.tab_section} ${styles.tab_candidates_section}`}
              id="manage_candidates"
            >
              {isArchivedCompaniesPermitted && <Tab eventKey={1} title={i18n.t('ARCHIVED_COMPANIES')}>
                {
                  this.state.activeKey === 1 &&
                  <Col lg={12} xs={12} md={12} className={styles.tableStyles}>
                    <ArchivedCompanies
                      formatCompanyName={this.formatCompanyName}
                      renderRequestDate={this.renderRequestDate}
                      renderRequestRaisedBy={this.renderRequestRaisedBy}
                    />
                  </Col>
                }
              </Tab>}
              {isPendingForUnArchivedCompaniesPermitted &&
                <Tab eventKey={2} title={i18n.t('PENDING_FOR_UNARCHIVAL')}>
                  {
                    this.state.activeKey === 2 &&
                    <Col lg={12} xs={12} md={12} className={styles.tableStyles}>
                      <ToBeUnarchivedCompanies
                        formatCompanyName={this.formatCompanyName}
                        renderRequestDate={this.renderRequestDate}
                        renderRequestRaisedBy={this.renderRequestRaisedBy}
                      />
                    </Col>
                  }
                </Tab>}
            </Tabs>}
          </Col>
        </Col>
      </Col>
    );
  }
}
