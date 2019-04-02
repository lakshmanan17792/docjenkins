import PropTypes from 'prop-types';
import Moment from 'moment';
import { Row, Col, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import React, { Component } from 'react';
import { Trans } from 'react-i18next';
import lodash from 'lodash';
import { Scrollbars } from 'react-custom-scrollbars';
import Parser from 'html-react-parser';
import { reduxForm } from 'redux-form';
import EmailCard from '../EmailActivity/EmailCard';
import EmailThread from '../EmailActivity/EmailThread';
import ReplyButton from '../EmailActivity/ReplyButton';
import Activity from './Activity';
import styles from './ActivityHistories.scss';
import Constants from '../../helpers/Constants';
import EditActivity from './EditActivity';
import ViewActivity from './ViewActivity';
import i18n from '../../i18n';
import SearchBar from '../../components/FormComponents/SearchBar';
import { trimTrailingSpace } from '../../utils/validation';

let timeoutId;
@reduxForm({
  form: 'searchCompanyHistory'
})
@connect(state => ({
  user: state.auth.user,
  companyActivitiesLoaded: state.customers.companyActivitiesLoaded
}), { pushState })
export default class ActivityHistories extends Component {
  static propTypes = {
    activities: PropTypes.array.isRequired,
    activityType: PropTypes.string,
    user: PropTypes.object,
    from: PropTypes.string,
    loadActivity: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    company: PropTypes.object,
    jobOpeningId: PropTypes.number,
    pushState: PropTypes.func.isRequired,
    jobOpeningActivityLoading: PropTypes.bool,
    companyActivitiesLoading: PropTypes.bool,
    companyActivitiesLoaded: PropTypes.bool,
    companyHistoryLoading: PropTypes.bool,
    companyHistoryLoaded: PropTypes.bool,
    jobOpeningActivityLoaded: PropTypes.bool,
    currrentPage: PropTypes.number,
    showSearchBar: PropTypes.bool
  }
  static defaultProps = {
    activities: [],
    activityType: 'ALL',
    from: '',
    user: null,
    jobOpeningId: null,
    loadActivity: null,
    totalCount: 0,
    companyActivitiesLoading: false,
    companyActivitiesLoaded: false,
    jobOpeningActivityLoading: false,
    jobOpeningActivityLoaded: false,
    companyHistoryLoaded: false,
    companyHistoryLoading: false,
    company: null,
    currrentPage: null,
    showSearchBar: false
  };
  constructor(props) {
    super(props);
    const { activities, activityType, totalCount } = props;
    this.state = { activities,
      activityType,
      page: 0,
      limit: Constants.RECORDS_PER_PAGE,
      totalCount,
      reachedCount: false,
      openEditActivity: false,
      openViewActivity: false,
      editActivity: {},
      searchTerm: '',
      activityActions: ['COMPANY_UNARCHIVED', 'COMPANY_ARCHIVED',
        'JOB_OPENING_UNARCHIVED', 'JOB_OPENING_ARCHIVED',
        'COMPANY_ARCHIVAL_EXTENDED', 'COMPANY_ARCHIVE_INITIATED']
    };
    this.componentMounted = false;
  }

  componentDidMount() {
    this.componentMounted = true;
  }

  componentWillReceiveProps(nextProps) {
    const { activities, activityType, totalCount, currrentPage } = nextProps;
    const { page } = this.state;
    this.setState({ activities,
      activityType,
      totalCount,
      page: (currrentPage === 0) ? currrentPage : page });
  }

  getFullNames = list => {
    const names = list.map(obj => `${obj.firstName ? obj.firstName : ''} ${obj.lastName ? obj.lastName : ''}`);
    return names.join(' , ');
  }

  getActivityHistorySection = history => {
    if (history.action) {
      switch (history.action) {
        case 'LOG_ACTIVITY': {
          history.icon = this.getActivityIconByLogType(history.activityFor.type);
          if (history.activityFor.type === 'Face to face') {
            history.logText = i18n.t('LOGGED_A_FACE_TO_FACE_MEETING');
          } else {
            history.logText = `${i18n.t('LOGGED')} ${history.activityFor.type ?
              history.activityFor.type.split(' ')[1] : i18n.t('AN_ACTIVITY')}
          ${history.activityFor.type ? history.activityFor.type.split(' ')[2] : ''}`;
          }
          history.originId = history.activityFor.originId;
          history.id = history.activityFor.originId;
          return (
            <Activity
              openViewModal={this.openViewModal}
              openEditModal={this.openEditModal}
              activity={history}
              isView={false}
              showHistory
              key={history.itemId}
            />
          );
        }
        case 'EDIT_LOG_ACTIVITY': {
          history.icon = this.getActivityIconByLogType(history.activityFor.type);
          if (history.activityFor.type === 'Face to face') {
            history.logText = i18n.t('UPDATED_A_FACE_TO_FACE_MEETING');
          } else {
            history.logText = `${i18n.t('UPDATED')} ${history.activityFor.type ?
              history.activityFor.type.split(' ')[1] : i18n.t('AN_ACTIVITY')} 
          ${history.activityFor.type ? history.activityFor.type.split(' ')[2] : ''}`;
          }
          history.originId = history.activityFor.originId;
          history.id = history.activityFor.originId;
          return (
            <Activity
              openViewModal={this.openViewModal}
              openEditModal={this.openEditModal}
              isView={false}
              activity={history}
              showHistory
              key={history.itemId}
            />
          );
        }
        case 'NEW_TASK_ASSIGNED': {
          history.logText = i18n.t('CREATED_A_TASK');
          history.activityFor.description = history.title;
          history.icon = 'glyphicon glyphicon-plus';
          return this.HistorySection(history);
        }
        case 'COMPANY_CREATE': {
          const { company } = this.props;
          let newSalesOwners = '';
          if (history.metadata && history.metadata.newSalesOwners) {
            newSalesOwners += ` ${i18n.t('AND')} ${i18n.t('ADDED')}
            ${this.getFullNames(history.metadata.newSalesOwners)} ${i18n.t('AS_A_SALES_OWNER')}`;
          }
          history.logText = `${i18n.t('CREATED_THE_COMPANY')} ${company.name ?
            company.name : ''} ${newSalesOwners} on ${Moment(history.createdAt).format('MMM-DD-YYYY')}`;
          history.icon = 'glyphicon glyphicon-pencil';
          return this.HistorySection(history);
        }
        case 'COMPANY_UPDATE': {
          let newSalesOwners = '';
          let deleted = '';
          if (history.metadata && history.metadata.newSalesOwners &&
            history.metadata.newSalesOwners.length > 0) {
            newSalesOwners += ` ${i18n.t('ADDED')} ${this.getFullNames(history.metadata.newSalesOwners)}
            ${i18n.t('AS_A_SALES_OWNER')}`;
          }
          if (newSalesOwners !== '' && history.metadata &&
            history.metadata.deletedSalesOwners && history.metadata.deletedSalesOwners.length > 0) {
            newSalesOwners += ` ${i18n.t('AND')} `;
          }
          if (history.metadata && history.metadata.deletedSalesOwners
            && history.metadata.deletedSalesOwners.length > 0) {
            deleted += ` ${i18n.t('REMOVED_THE_SALES_OWNER')}
            ${this.getFullNames(history.metadata.deletedSalesOwners)}`;
          }
          history.logText = `${newSalesOwners} ${deleted}`;
          history.icon = 'glyphicon glyphicon-pencil';
          return this.HistorySection(history);
        }
        case 'JOB_OPENING_CREATE': {
          history.logText = `${i18n.t('CREATED_A_JOB_OPENING')} ${history.activityFor.jobTitle}
          ${history.activityFor.description}`;
          history.icon = 'glyphicon glyphicon-briefcase';
          return this.HistorySection(history);
        }
        case 'EMAIL_TO_COMPANY': {
          history.logText = `${i18n.t('SENT_AN_EMAIL_TO')} ${
            this.iterateArrayAndAttachTitle(history.activityFor.toAddress, 'text', history.id)}`;
          history.title = (history.activityFor.toAddress && history.activityFor.toAddress.length > 1) ?
            this.iterateArrayAndAttachTitle(history.activityFor.toAddress, 'title', history.id) :
            '';
          history.icon = 'glyphicon glyphicon-envelope';
          return this.HistorySection(history);
        }
        case 'CANDIDATE_STATUS_UPDATE': {
          history.logText = `${i18n.t('MOVED')}
            ${history.candidateName} ${i18n.t('FROM')} ${history.oldStatus} ${i18n.t('TO')} ${history.newStatus}`;
          history.icon = 'glyphicon glyphicon-pencil';
          return this.HistorySection(history);
        }
        case 'JOB_OPENING_STATUS_UPDATE': {
          history.logText = `${i18n.t('UPDATED_THE_JOB_OPENING')} ${history.activityFor.jobTitle}
          ${i18n.t('FROM')} ${history.oldStatus} ${i18n.t('TO')} ${history.newStatus}`;
          history.icon = 'glyphicon glyphicon-pencil';
          return this.HistorySection(history);
        }
        case 'EMAIL_TO_JOB': {
          history.logText = `${i18n.t('SENT_AN_EMAIL_TO')} ${
            this.iterateArrayAndAttachTitle(history.activityFor.toAddress, 'text', history.id)}`;
          history.title = (history.activityFor.toAddress && history.activityFor.toAddress.length > 1) ?
            this.iterateArrayAndAttachTitle(history.activityFor.toAddress, 'title', history.id) :
            '';
          history.icon = 'glyphicon glyphicon-envelope';
          history.isEmail = true;
          return this.HistorySection(history);
        }
        case 'COMPANY_UNARCHIVED': {
          const firstName = history.user && history.user && history.user.firstName ? history.user.firstName : '';
          const lastName = history.user && history.user && history.user.lastName ? history.user.lastName : '';
          history.logText = `${i18n.t('COMPANY_WAS_UNARCHIVED_BY')} ${firstName} ${lastName}`;
          history.icon = 'glyphicon glyphicon-envelope';
          return this.HistorySection(history);
        }
        case 'COMPANY_ARCHIVED': {
          const firstName = history.user && history.user && history.user.firstName ? history.user.firstName : '';
          const lastName = history.user && history.user && history.user.lastName ? history.user.lastName : '';
          history.logText = `${i18n.t('COMPANY_WAS_ARCHIVED_BY')} ${firstName} ${lastName}`;
          history.icon = 'glyphicon glyphicon-envelope';
          return this.HistorySection(history);
        }
        case 'JOB_OPENING_UNARCHIVED': {
          const firstName = history.user && history.user && history.user.firstName ? history.user.firstName : '';
          const lastName = history.user && history.user && history.user.lastName ? history.user.lastName : '';
          history.logText = `${i18n.t('JOB_OPENING_WAS_UNARCHIVED_BY')} ${firstName} ${lastName}`;
          history.icon = 'glyphicon glyphicon-envelope';
          return this.HistorySection(history);
        }
        case 'JOB_OPENING_ARCHIVED': {
          const firstName = history.user && history.user && history.user.firstName ? history.user.firstName : '';
          const lastName = history.user && history.user && history.user.lastName ? history.user.lastName : '';
          history.logText = `${i18n.t('JOB_OPENING_WAS_ARCHIVED_BY')} ${firstName} ${lastName}`;
          history.icon = 'glyphicon glyphicon-envelope';
          return this.HistorySection(history);
        }
        case 'COMPANY_ARCHIVAL_EXTENDED': {
          const firstName = history.user && history.user && history.user.firstName ? history.user.firstName : '';
          const lastName = history.user && history.user && history.user.lastName ? history.user.lastName : '';
          history.logText = `${i18n.t('COMPANY_ARCHIVAL_EXTENDED_BY')} ${firstName} ${lastName}`;
          history.icon = 'glyphicon glyphicon-envelope';
          return this.HistorySection(history);
        }
        case 'COMPANY_ARCHIVE_INITIATED': {
          const firstName = history.user && history.user && history.user.firstName ? history.user.firstName : '';
          const lastName = history.user && history.user && history.user.lastName ? history.user.lastName : '';
          history.logText = `${i18n.t('COMPANY_ARCHIVAL_INITIATED_BY')} ${firstName} ${lastName}`;
          history.icon = 'glyphicon glyphicon-envelope';
          return this.HistorySection(history);
        }
        default: {
          history.logText = '';
          history.icon = 'glyphicon glyphicon-user';
          return this.HistorySection(history);
        }
      }
    }
  }

  getActivitySection = activity => {
    activity.icon = this.getActivityIconByLogType(activity.activityFor.type);
    if (activity.activityFor.type === 'Face to face') {
      activity.logText = i18n.t('LOGGED_A_FACE_TO_FACE_MEETING');
    } else {
      activity.logText = `${i18n.t('LOGGED')} ${activity.activityFor.type ? activity.activityFor.type.split(' ')[1] :
        'an activity'}
      ${activity.activityFor.type ? activity.activityFor.type.split(' ')[2] : ''}`;
    }
    return (<Activity
      openViewModal={this.openViewModal}
      openEditModal={this.openEditModal}
      key={activity.id}
      activity={activity}
    />
    );
  }

  getActivityIconByLogType = logType => {
    let icon;
    switch (logType) {
      case 'Log a call': {
        icon = 'glyphicon glyphicon-earphone';
        break;
      }
      case 'Log an email': {
        icon = 'glyphicon glyphicon-envelope';
        break;
      }
      case 'Face to face': {
        icon = 'glyphicon glyphicon-user';
        break;
      }
      case 'Log a note': {
        icon = 'glyphicon glyphicon-list-alt';
        break;
      }
      default: {
        icon = 'glyphicon glyphicon-envelope';
      }
    }
    return icon;
  }

  getId = fromPath => {
    const { company, jobOpeningId } = this.props;
    const info = {
      company: company && company.id,
      jobOpening: jobOpeningId
    };
    return info[fromPath];
  }

  setSearchTerm = evt => {
    let value = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    if (value === this.state.searchTerm || value === ' ') {
      value = value.trim();
    }
    if (/^[a-zA-Z0-9\s@.]+$/i.test(value) || value === '') {
      this.setState({ searchTerm: trimTrailingSpace(value), page: 0 }, () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          this.intialize(false);
        }, 1000);
      });
    }
  }

  resetSearch = () => {
    this.setState({ searchTerm: '', page: 0 }, () => {
      this.intialize(false);
    });
  }

  closeEditModal = () => {
    this.setState({
      openEditActivity: false,
    });
  }

  openViewModal = activity => {
    this.setState({
      openViewActivity: true,
      editActivity: activity
    });
  }

  closeViewModal = () => {
    this.setState({
      openViewActivity: false,
    });
  }

  iterateArrayAndAttachTitle = (array, outputType, key) => {
    let totalString = '';
    let firstElement = '';
    if (array && array.length) {
      array.forEach((currentValue, index) => {
        if (index === 0) {
          firstElement = currentValue;
        }
        totalString += `${currentValue} ${index !== array.length - 1 ? ',' : ''}`;
        if (totalString && index === array.length - 1) {
          if (outputType === 'text') {
            totalString = `${firstElement}`;
          } else if (outputType === 'title') {
            const tooltip = totalString.substring(totalString.indexOf(',') + 1);
            totalString = `<span class="title" id="${key}" data-toggle="tooltip" title='${tooltip}'>
              and ${array.length - 1} more </span>`;
          }
        }
      });
    }
    if (totalString) {
      return ` ${totalString}`;
    }
  }

  HistorySection = history => (
    <li key={history.id} className="timeline-inverted history">
      <div className="timeline-badge warning"><i className={`${history.icon}`} /></div>
      <div className="timeline-panel">
        <Col
          lg={12}
          className="p-0"
        >
          {
            history.itemType !== 'ProspectMails' ?
              <div className={`${styles.activityLog_content} 'p-b-20'}`}>
                <div className={styles.activityLog_history_header}>
                  <span className={styles.name_icon}>{history.nameIcon}</span>
                  <div className={styles.header_text}>
                    <span>{history.activityFor.creator ? `${history.activityFor.creator.firstName}
                    ${history.activityFor.creator.lastName}` : ''} </span>
                    <span>{history.logText}
                      {/* {history.title ?
                        <span dangerouslySetInnerHTML={{ __html: history.title }} /> :
                        ''} */}
                      {history.title ? Parser(history.title) : ''}
                    </span>
                    {history.activityFor.outcome ? <span className={`outcome m-l-15 ${history.activityFor.outcome}`} >
                      {history.activityFor.outcome}</span> : ''}
                  </div>
                  <div className={styles.m_l_50}>
                    <span>{Moment(history.createdAt).format('llll')}</span>
                  </div>
                </div>
              </div>
              :
              this.renderEmails(history.activityFor, history.action, history.jobOpening)
          }
        </Col>
      </div>
    </li>)

  activityScroll = values => {
    const { companyActivitiesLoading, companyHistoryLoading, jobOpeningActivityLoading } = this.props;
    if (!companyActivitiesLoading && !companyHistoryLoading && !jobOpeningActivityLoading) {
      const { scrollTop, scrollHeight, clientHeight } = values;
      const pad = 100; // 100px of the bottom
      // t will be greater than 1 if we are about to reach the bottom
      const t = ((scrollTop + pad) / (scrollHeight - clientHeight));
      if (t > 1) {
        const { activities, totalCount } = this.state;
        let { reachedCount } = this.state;
        reachedCount = (activities.length === totalCount && totalCount !== 0);
        if (activities.length < totalCount) {
          this.setState({
            page: this.state.page + 1,
            reachedCount
          }, () => {
            if (!reachedCount) {
              this.intialize(true);
            }
          });
        }
      }
    }
  }

  intialize = onScroll => {
    const { page, limit, searchTerm } = this.state;
    const filter = {
      skip: page * Constants.RECORDS_PER_PAGE,
      limit,
      searchTerm
    };
    this.props.loadActivity(filter, onScroll);
  }

  loadActivity = filter => {
    this.setState({ searchTerm: '' });
    this.props.loadActivity(filter);
  }

  checkIfAutoHide = activity => {
    if (activity && activity.activityFor && activity.activityFor.description) {
      const { description } = activity.activityFor;
      if (description.split('<p').length > 6 || description.length > 400) {
        return true;
      }
    }
    return false;
  }

  openEditModal = activity => {
    if (activity.activityFor) {
      this.setState({
        openEditActivity: true,
        editActivity: activity.activityFor
      });
    } else {
      this.setState({
        openEditActivity: true,
        editActivity: activity
      });
    }
  }

  // expandOrCollapseConversation = (evt, messageId) => {
  //   evt.preventDefault();
  //   const mailContentElm = document.getElementById(messageId);
  //   const expandBtn = document.getElementById(`${messageId}-btn`);
  //   if (mailContentElm.classList.value.indexOf('mail-content') > -1) {
  //     mailContentElm.classList.remove(mailContentElm.classList.value);
  //     expandBtn.innerText = 'Collapse';
  //   } else {
  //     mailContentElm.classList.add('mail-content');
  //     expandBtn.innerText = 'Expand';
  //   }
  // }
  expandOrCollapseThread = (evt, conversationId) => {
    evt.preventDefault();
    this.setState({ [conversationId]: !this.state[conversationId] });
  }
  sendEmail = emailInfo => {
    const { user, from } = this.props;
    if (user.isMailConfigured) {
      this.props.pushState({
        pathname: '/Emailer',
        state: {
          from,
          [`${from}Id`]: this.getId(from),
          emailInfo: emailInfo.action ? emailInfo : ''
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
  redirectToEmailer = (evt, fromAddress, bccList, ccList, messageId, subject) => {
    const { from } = this.props;
    if (from === 'company') {
      sessionStorage.setItem('companyActiveKey', 5);
    } else if (from === 'jobOpening') {
      sessionStorage.setItem('jobOpeningActiveKey', 4);
    }
    evt.preventDefault();
    this.sendEmail({ fromAddress, bccList, ccList, messageId, action: 'REPLY', subject: `RE: ${subject}` });
  }

  attachmentFiles = file => {
    const token = localStorage.getItem('authToken');
    return (
      <a
        href={`${window.location.origin}/api/v1/documents/download/${file.id}?access_token=${token}`}
        className="attachment"
        onClick={this.downloadFile}
      >
        {file.originalFilename}
        <i className="fa fa-download downloadIcon" />
      </a>
    );
  }

  renderEmailAddressInfo = (fromAddress, toAddress, action, jobTitle) => {
    const { from } = this.props;
    const toAddressNames = lodash.map(toAddress, 'name');
    const constantText = toAddressNames.length > 1 ? `and ${toAddressNames.length - 1} more` : '';
    const jobOpeningText = action && from === 'company'
    && action === 'EMAIL_TO_JOB' ? `for job opening ${jobTitle}` : '';
    return (<div
      className="sent_email_info_txt"
      title={`${toAddressNames.length > 0 ? toAddressNames.join(',') : ''}`}
    >{`${fromAddress.name} (${fromAddress.email}) sent an email
       to ${toAddressNames[0]} ${constantText} ${jobOpeningText}`}</div>);
  }

  renderAddresses = toAddresses => {
    const constructedToAddresses = [];
    toAddresses.map(toAddress => (
      constructedToAddresses.push(`${toAddress.name} (${toAddress.email})`)
    ));
    return constructedToAddresses.join(', ');
  }

  renderContentByActivityType = activityType => {
    const { activities } = this.state;
    return activities && activities.length ?
      <ul className="timeline">
        {
          activities.map(activityLog => {
            if (activityType === 'Log') {
              if (!activityLog.isEdited) {
                return (
                  this.getActivitySection(activityLog)
                );
              }
            } else {
              return (
                this.getActivityHistorySection(activityLog)
              );
            }
            return false;
          })
        }
      </ul> : this.renderNoHistoryFound();
  }

  renderNoHistoryFound = () => {
    const { activityType, activities } = this.state;
    const { companyHistoryLoaded, jobOpeningActivityLoaded, companyActivitiesLoaded } = this.props;
    const NoResultsFound = (
      <Col className={activityType === 'ALL' ? styles.no_results_found : styles.no_results_found_activity}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}>
          <div>
            {i18n.t('NO')} {activityType === 'ALL' ? i18n.t('HISTORY') : i18n.t('ACTIVITY')} {i18n.t('FOUND')}
          </div>
        </Row>
      </Col>
    );
    const loadingContent = (
      <Col className={styles.no_results_found}>
        <Row className={styles.sub_head}><div><Trans>Loading</Trans> !</div></Row>
      </Col>
    );
    if (this.props.companyHistoryLoading ||
      this.props.companyActivitiesLoading ||
      this.props.jobOpeningActivityLoading
    ) {
      return loadingContent;
    } else if (
      (companyHistoryLoaded ||
        jobOpeningActivityLoaded ||
        companyActivitiesLoaded) &&
      activities.length <= 0) {
      return NoResultsFound;
    }
    return loadingContent;
  }
  renderEmails = (emails, action, jobOpening) => {
    if (emails.length === 1) {
      return (
        emails.map(email => (
          <div className="email_section">
            <EmailCard
              email={email}
              action={action}
              jobTitle={jobOpening ? jobOpening.jobTitle : ''}
              renderEmailAddressInfo={this.renderEmailAddressInfo}
              attachmentFiles={this.attachmentFiles}
              renderAddresses={this.renderAddresses}
            />
            {
              email.isReceived &&
                <ReplyButton
                  redirectToEmailer={this.redirectToEmailer}
                  email={emails[emails.length - 1]}
                />
            }
          </div>
        ))
      );
    }
    return (
      <div className="email_section">
        <div
          className={this.state[emails[0].conversationId] ? '' : 'email_thread'}
          id={`${emails[0].conversationId}_thread_section`}
        >
          {
            emails.map((email, index) => (
              <div key={email.id}>
                {
                  index === 0 ?
                    <EmailCard
                      email={email}
                      action={action}
                      jobTitle={jobOpening ? jobOpening.jobTitle : ''}
                      renderEmailAddressInfo={this.renderEmailAddressInfo}
                      isThreadView
                      threadLength={emails.length}
                      attachmentFiles={this.attachmentFiles}
                      renderAddresses={this.renderAddresses}
                    />
                    :
                    <EmailThread
                      email={email}
                      renderAddresses={this.renderAddresses}
                      index={index}
                      lastIndex={emails.length - 1}
                      attachmentFiles={this.attachmentFiles}
                    />
                }
              </div>
            ))
          }
        </div>
        <button
          className="thread_btn expand_collapse_btn m-b-5"
          id={`${emails[0].conversationId}-btn`}
          onClick={evt => {
            this.expandOrCollapseThread(evt, emails[0].conversationId);
          }}
        >
          {
            this.state[emails[0].conversationId] ? <Trans>COLLAPSE_THREAD</Trans> : <span>
              <Trans>VIEW_THREAD</Trans>({emails.length})
            </span>
          }
        </button>
        {
          emails[emails.length - 1].isReceived &&
            <ReplyButton
              redirectToEmailer={this.redirectToEmailer}
              email={emails[emails.length - 1]}
            />
        }
      </div>
    );
  }

  renderTooltip = () => (
    <Tooltip id={'tooltip'}>
      <strong>
        <Trans>HISTORY_SEARCH</Trans>
      </strong>
    </Tooltip>
  )

  render() {
    const { activities, activityType, openEditActivity, openViewActivity,
      editActivity, searchTerm, activityActions } = this.state;
    activities.map(activity => {
      activity.activityFor = activity.activityFor ?
        activity.activityFor : activity;
      const creator = activity.activityFor && activityActions.indexOf(activity.action) < 0
        ? activity.activityFor.creator : activity.user;
      activity.autoHide = this.checkIfAutoHide(activity);
      if (activity.itemType !== 'ProspectMails') {
        activity.activityFor.description = activity.activityFor.description
          ? activity.activityFor.description : '';
      }
      activity.nameIcon = creator ?
        `${creator.firstName.split('')[0]}${((creator.lastName && creator.lastName !== '') ?
          creator.lastName.split('')[0] : creator.firstName.split('')[1])}` : 'UR';
      // activity.nameIcon = activity.activityFor.from &&
      //   `${activity.activityFor.from.name.split('')[0]}`;
      return activity;
    });
    return (
      <div className={`activity_logger ${styles.logger_container}`}>
        <div className={styles.logger_section}>
          <Row className={styles.logger_box}>
            {
              this.props.showSearchBar &&
              <Col className={`p-l-50 p-b-20 ${styles.search}`} lg={5} md={6} sm={8}>
                <SearchBar
                  searchClassName="search-input"
                  isCustomerSearch="yes"
                  reset={e => this.resetSearch(e)}
                  handleOnChange={e => this.setSearchTerm(e)}
                  handleOnKeyUp={() => {}}
                  inpValue={searchTerm}
                  placeholder={'SEARCH'}
                />
                {/* <OverlayTrigger
                  rootClose
                  overlay={this.renderTooltip()}
                  placement="top"
                >
                  <i className={`fa fa-info-circle ${styles.info}`} aria-hidden="true" />
                </OverlayTrigger> */}
              </Col>
            }
            <Col sm={12} className={styles.logger_content}>
              <Scrollbars
                universal
                autoHide
                autoHeight
                onScrollFrame={lodash.throttle(this.activityScroll, 2000)}
                autoHeightMin={`${this.state.activityType === 'Log' ? '650px' : '1030px'}`}
                autoHeightMax={`${this.state.activityType === 'Log' ? '650px' : '1030px'}`}
                renderView={props => <div {...props} className="customScroll" />}
              >
                <Col lg={12} className={`p-l-50 p-t-15 ${styles.activities_section}`}>
                  {this.renderContentByActivityType(activityType)}
                </Col>
              </Scrollbars>
            </Col>
          </Row>
          {
            openEditActivity &&
            <EditActivity
              openEditActivity
              activity={editActivity}
              closeEditModal={this.closeEditModal}
              company={this.props.company}
              jobOpeningId={this.props.jobOpeningId}
              loadActivity={this.loadActivity}
            />

          }
          {
            openViewActivity &&
            <ViewActivity
              openViewActivity
              activity={editActivity}
              closeViewModal={this.closeViewModal}
              getActivityIconByLogType={this.getActivityIconByLogType}
              checkIfAutoHide={this.checkIfAutoHide}
            />

          }
        </div>
      </div>
    );
  }
}
