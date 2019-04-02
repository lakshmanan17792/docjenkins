import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import lodash from 'lodash';
import { Scrollbars } from 'react-custom-scrollbars';
import { reduxForm } from 'redux-form';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { push as pushState } from 'react-router-redux';
import Loader from '../../components/Loader';
import EmailList from './EmailList';
import styles from './EmailActivity.scss';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import SearchBar from '../../components/FormComponents/SearchBar';
import { trimTrailingSpace } from '../../utils/validation';

let timeoutId;
@reduxForm({
  form: 'searchEmailActivity'
})
@connect(state => ({
  user: state.auth.user,
}), { pushState })
export default class EmailActivity extends Component {
  static propTypes = {
    company: PropTypes.object,
    emails: PropTypes.object.isRequired,
    jobOpeningId: PropTypes.any,
    candidateProfileId: PropTypes.any,
    companyEmailsLoading: PropTypes.bool,
    showSearchBar: PropTypes.bool,
    candidateEmailsLoading: PropTypes.bool,
    jobOpeningEmailsloading: PropTypes.bool,
    candidateEmail: PropTypes.any,
    autoHeight: PropTypes.string,
    from: PropTypes.string,
    noMoreEmails: PropTypes.bool,
    user: PropTypes.object,
    pushState: PropTypes.func.isRequired,
    loadEmails: PropTypes.func.isRequired,
    acl: PropTypes.object.isRequired,
    contactPerson: PropTypes.object
  }

  static defaultProps = {
    company: {},
    user: null,
    from: '',
    showSearchBar: false,
    companyEmailsLoading: false,
    jobOpeningEmailsloading: false,
    candidateEmailsLoading: false,
    noMoreEmails: false,
    jobOpeningId: '',
    candidateProfileId: '',
    autoHeight: '200px',
    candidateEmail: null,
    contactPerson: null
  }
  constructor(props) {
    super(props);
    this.state = {
      limit: 10,
      searchTerm: '',
      page: 1,
      isRefresh: false,
      isDisabled: false
    };
  }

  componentWillMount() {
    if (localStorage.getItem('emailFromHistoryInfo')) {
      localStorage.removeItem('emailFromHistoryInfo');
    }
    this.loadEmails(false);
  }
  setComposeBtn = () => {
    const { company } = this.props;
    if (company && !company.id) {
      return true;
    }
    return false;
  }

  getId = fromPath => {
    const { company, jobOpeningId, candidateProfileId } = this.props;
    const info = {
      company: company.id,
      jobOpening: jobOpeningId,
      candidateProfile: candidateProfileId
    };
    return info[fromPath];
  }

  setActiveKey = () => {
    const { from } = this.props;
    if (from === 'company') {
      sessionStorage.setItem('companyActiveKey', 3);
    } else if (from === 'jobOpening') {
      sessionStorage.setItem('jobOpeningActiveKey', 2);
    } else if (from === 'candidateProfile') {
      sessionStorage.setItem('profileTabKey', 4);
    }
  }

  setScrollToTop = () => {
    if (this.scrollbar) {
      this.scrollbar.scrollToTop();
    }
  }

  setSearchTerm = evt => {
    let value = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    if (value === this.state.searchTerm || value === ' ') {
      value = value.trim();
    }
    if (/^[a-zA-Z0-9\s@.]+$/i.test(value) || value === '') {
      this.setState({ searchTerm: trimTrailingSpace(value), page: 1, isRefresh: false }, () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          this.loadEmails(false);
          this.setScrollToTop();
        }, 1000);
      });
    }
  }

  resetSearch = () => {
    this.setState({ searchTerm: '', page: 1, isRefresh: false }, () => {
      this.loadEmails(false);
      this.setScrollToTop();
    });
  }

  loadEmails = onScroll => {
    const { limit, searchTerm, page } = this.state;
    const { noMoreEmails } = this.props;
    const toLoadEmails = onScroll ? !noMoreEmails : true;
    if (toLoadEmails) {
      this.props.loadEmails({
        skip: (page - 1) * limit,
        limit,
        searchTerm
      }, onScroll);
    }
  }

  sendEmail = emailInfo => {
    this.setActiveKey();
    const { user, from, candidateEmail } = this.props;
    if (user.isMailConfigured) {
      this.props.pushState({
        pathname: '/Emailer',
        state: {
          from,
          [`${from}Id`]: this.getId(from),
          candidateEmail,
          emailInfo: emailInfo && emailInfo.action ? emailInfo : ''
        }
      });
    } else {
      localStorage.setItem('emailFromHistoryInfo',
        JSON.stringify({ from, [`${from}Id`]: this.getId(from) }));
      this.props.pushState({
        pathname: '/EmailConfig',
        state: {
          [`${from}Id`]: this.getId(from)
        }
      });
    }
  }
  handleEndScroll = values => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const pad = 200; // 100px of the bottom
    const toScroll = ((scrollTop + pad) / (scrollHeight - clientHeight));
    if (toScroll > 1) {
      this.setState({ page: this.state.page + 1, isRefresh: false }, () => {
        this.loadEmails(true);
      });
    }
  }

  refresh = () => {
    this.setState({ page: 1, searchTerm: '', isRefresh: true }, () => {
      this.loadEmails(false);
      this.setScrollToTop();
    });
  }

  renderNoHistoryFound = () => {
    const { companyEmailsLoading, jobOpeningEmailsloading, candidateEmailsLoading } = this.props;
    if (companyEmailsLoading || jobOpeningEmailsloading || candidateEmailsLoading) {
      return '';
    }
    const NoResultsFound = (
      <Col sm={12} md={12} lg={12} className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_EMAIL_FOUND</Trans></div></Row>
      </Col>
    );
    return NoResultsFound;
  }

  renderTooltip = (isDisabled, noCandidateEmail, noContacts, nojobOpeningContact) => {
    if (isDisabled || noContacts || noCandidateEmail) {
      return (
        <Tooltip id={'tooltip'}>
          <strong>{ (this.props.from === 'company' && noContacts) ?
            'There are no contacts for this company. Add a contact to compose an email.' :
            'This candidate doesn\'t have an email address.'
          }</strong>
        </Tooltip>
      );
    } else if (nojobOpeningContact) {
      return (
        <Tooltip id={'tooltip'}>
          <strong>
            There is no contact person for this job opening.</strong>
        </Tooltip>
      );
    }
    return <div />;
  }
  render() {
    const { emails, candidateEmail, companyEmailsLoading, jobOpeningEmailsloading,
      candidateEmailsLoading, acl, contactPerson, from, showSearchBar } = this.props;
    const nojobOpeningContact = (from === 'jobOpening' && !contactPerson) || false;
    const isDisabled = this.props.company && Object.keys(this.props.company).length > 0 && !this.props.company.id;
    const noContacts = this.props.company && Object.keys(this.props.company).length > 0
      && this.props.company.contacts && this.props.company.contacts.length === 0;
    const noCandidateEmail = (candidateEmail && candidateEmail === 'noEmailsForCandidate') || false;
    const xs = (isDisabled || noContacts || noCandidateEmail || nojobOpeningContact)
      ? { pointerEvents: 'none' } : {};
    const disabledCss = (isDisabled || noContacts || noCandidateEmail || nojobOpeningContact) ?
      { cursor: 'not-allowed', display: 'inline-block', float: 'right' } :
      { display: 'inline-block', float: 'right' };
    return (
      <Col sm={12} md={12} lg={12} className={styles.email_activity_section} style={{ backgroundColor: '#ffffff' }}>
        <Loader loading={companyEmailsLoading} styles={{ position: 'absolute', top: '25%' }} />
        <Loader
          loading={jobOpeningEmailsloading || candidateEmailsLoading}
          styles={{ position: 'absolute', top: '50%' }}
        />
        <Col sm={12} md={12} lg={12} className="p-0">
          <Col className={styles.search} sm={6} md={6} lg={5} >
            {
              showSearchBar &&
              <SearchBar
                reset={e => this.resetSearch(e)}
                handleOnChange={e => this.setSearchTerm(e)}
                handleOnKeyUp={() => {}}
                inpValue={this.state.searchTerm}
                placeholder={'SEARCH'}
              />
            }
          </Col>
          <Col sm={6} md={6} lg={7} className="p-0">
            <NewPermissible operation={acl}>
              <div className={styles.compose_email}>
                <OverlayTrigger
                  rootClose
                  overlay={this.renderTooltip(isDisabled, noCandidateEmail, noContacts, nojobOpeningContact)}
                  placement="bottom"
                >
                  <div style={disabledCss}>
                    <button
                      className="button-primary"
                      type="button"
                      style={xs}
                      disabled={isDisabled || noContacts || noCandidateEmail || nojobOpeningContact}
                      onClick={this.sendEmail}
                    >
                      <Trans>COMPOSE_EMAIL</Trans>
                    </button>
                  </div>
                </OverlayTrigger>
                <button
                  type="button"
                  title={i18n.t('tooltipMessage.REFRESH_TO_FETCH_NEW_EMAILS')}
                  className={`${styles.refresh_btn} button-primary f-w-600`}
                  onClick={this.refresh}
                  disabled={isDisabled || noContacts}
                  style={{ width: '50px' }}
                >
                  <i
                    id="refreshIcon"
                    className={`fa fa-refresh ${(this.state.isRefresh && (jobOpeningEmailsloading
                      || companyEmailsLoading || candidateEmailsLoading)) ? 'fa-spin' : ''}`}
                    style={{ paddingRight: 0, color: 'white' }}
                  />
                </button>
              </div>
            </NewPermissible>
          </Col>
        </Col>
        {
          emails &&
            Object.keys(emails).length > 0 ? <Col sm={12} md={12} lg={12} className="p-0 p-t-20">
              <Scrollbars
                universal
                autoHeight
                autoHeightMin={`calc(100vh - ${this.props.autoHeight})`}
                autoHeightMax={`calc(100vh - ${this.props.autoHeight})`}
                onScrollFrame={lodash.throttle(this.handleEndScroll, 1000)}
                renderThumbHorizontal={props => <div {...props} className="hide" />}
                renderView={props => <div {...props} />}
                ref={c => { this.scrollbar = c; }}
              >
                <EmailList
                  emails={emails}
                  sendEmail={this.sendEmail}
                />
              </Scrollbars>
            </Col> :
            this.renderNoHistoryFound()
        }
      </Col>
    );
  }
}
