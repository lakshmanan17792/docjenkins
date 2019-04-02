import React, { Component } from 'react';
import PropTypes from 'prop-types';
import openSocket from 'socket.io-client';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import { Col, Row, Fade, Image } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import { loadNotifications, updateNotificationStatus, markAllRead } from '../../redux/modules/notifications';
import Constants from './../../helpers/Constants';
import NotificationCard from './NotificationCard';
import notificationStyles from '../../containers/Notifications/Notifications.scss';
import UserRole from './../../helpers/UserRole';

const providers = {
  userRole: new UserRole()
};

const styles = require('./Header.scss');


@connect(state => ({
  user: state.auth.user,
  notificationLists: state.notifications.notificationLists || [],
  loading: state.notifications.loading
}), {
  loadNotifications, pushState, updateNotificationStatus, markAllRead
})
export default class Notification extends Component {
  static propTypes = {
    loadNotifications: PropTypes.func.isRequired,
    updateNotificationStatus: PropTypes.func.isRequired,
    markAllRead: PropTypes.func.isRequired,
    showErr: PropTypes.func,
    loading: PropTypes.bool,
    pushState: PropTypes.func.isRequired,
    user: PropTypes.object
  };

  static defaultProps = {
    showErr: null,
    loading: false,
    user: {}
  };

  constructor(props) {
    super(props);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.state = {
      showNotification: false,
      notificationLists: [],
      unreadCount: 0,
      totalNotifications: 0,
      limit: 10,
      readNotificationsList: [],
      page: 0,
      isArchivedCompaniesPermitted: false,
      isPendingForUnArchivedCompaniesPermitted: false,
      isArchivedCandidatesPermitted: false,
      isPendingForUnarchvivalPermitted: false,
      isPendingForDeletionPermitted: false,
    };
  }

  componentWillMount() {
    this.initilizeData(this.state.page, this.state.limit);
    this.setPermissions();
  }

  componentDidMount() {
    const self = this;
    const socket = openSocket(
      `${window.location.protocol}//${window.location.hostname}:${Constants.PORT}`,
      { reconnectionAttempts: 5 }
    );
    const { user } = self.props;
    /**
    * perform actions that has to be done
    * while connecting to the socket
    */
    socket.on('connect', () => {
      const id = localStorage ? localStorage.getItem('authToken') : null;
      const userId = localStorage ? localStorage.getItem('currentUserId') : null;
      // initially disconnect for
      socket.emit('authentication', { id, userId });
      socket.on('authenticated', () => {
        console.log('user authenticated');
      });
    });

    const id = localStorage ? localStorage.getItem('authToken') : null;
    const userId = localStorage ? localStorage.getItem('currentUserId') : null;
    // authorize socket
    socket.emit('authentication', { id, userId });
    // notification listener
    if (user && user.email) {
      socket.on(`${Constants.NEW_NOTIFICATION}@${self.props.user.email}`, data => {
        const list = self.state.notificationLists.slice();
        list.unshift(data);
        self.setState({
          notificationLists: list,
          unreadCount: self.state.unreadCount + 1,
          totalNotifications: self.state.totalNotifications + 1
        });
      });
    }
  }

  setPermissions = () => {
    const isArchivedCompaniesPermitted = providers.userRole.getPathPermission('', 'ARCHIVED_COMPANIES', 'customer');
    const isPendingForUnArchivedCompaniesPermitted =
      providers.userRole.getPathPermission('', 'UNARCHIVE_PENDING_COMPANIES', 'customer');
    const isArchivedCandidatesPermitted = providers.userRole.getPathPermission('', 'ARCHIVED_CANDIDATES', 'resume');
    const isPendingForUnarchvivalPermitted =
      providers.userRole.getPathPermission('', 'UNARCHIVE_PENDING_CANDIDATES', 'resume');
    const isPendingForDeletionPermitted = providers.userRole.getPathPermission('', 'APPROVE_DELETE', 'resume');
    this.setState({
      isArchivedCompaniesPermitted,
      isPendingForUnArchivedCompaniesPermitted,
      isArchivedCandidatesPermitted,
      isPendingForUnarchvivalPermitted,
      isPendingForDeletionPermitted,
    });
  }

  initilizeData = (skip, limit) => {
    this.props.loadNotifications({
      skip,
      limit,
    }).then(list => {
      this.setState({
        notificationLists: [...this.state.notificationLists, ...list.notifications],
        unreadCount: list.unRead,
        totalNotifications: list.totalNotifications
      });
    }, () => {
      this.props.showErr('Could not load notifications');
    });
  };

  toggleNotification = () => {
    // e.stopPropagation();
    if (!this.state.showNotification) {
      document.addEventListener('click', this.handleOutsideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }
    this.setState(previousState => ({ showNotification: !previousState.showNotification }));
  };

  unreadNotificationById = id => {
    const { notificationLists } = this.state;
    const notifications = notificationLists.map(notification => {
      if (notification.id === id) {
        notification.isRead = true;
      }
      return notification;
    });
    return notifications;
  }

  redirectToNotFound = () => {
    this.props.pushState({
      pathname: 'NotFound'
    });
  }

  openViewPage = notification => {
    this.props.updateNotificationStatus(notification.id).then(() => {
      this.setState({
        unreadCount: !notification.isRead ? this.state.unreadCount - 1 : this.state.unreadCount,
        showNotification: false,
        readNotificationsList: this.state.readNotificationsList.includes(notification.id)
          ? this.state.readNotificationsList
          : [...this.state.readNotificationsList, notification.id],
        notificationLists: this.unreadNotificationById(notification.id)
      });
      document.removeEventListener('click', this.handleOutsideClick, false);
      if (notification.activity.action === 'NEW_TASK_ASSIGNED') {
        this.props.pushState({ pathname: '/Tasks/View', query: { taskId: `${notification.activity.itemId}` } });
      } else if (notification.activity.action === 'TASK_STATUS_UPDATE') {
        this.props.pushState({ pathname: '/Tasks/View', query: { taskId: `${notification.activity.itemId}` } });
      } else if (notification.activity.action === 'JOB_OPENING_CREATE') {
        this.props.pushState({ pathname: `/Openings/${notification.activity.jobOpeningId}` });
      } else if (notification.activity.action === 'JOB_OPENING_ASSIGNED_RECRUITERS'
        || notification.activity.action === 'JOB_OPENING_ASSIGNED_SALES') {
        this.props.pushState({ pathname: `/Openings/${notification.activity.jobOpeningId}` });
      } else if (notification.activity.action === 'JOB_OPENING_ARCHIVED') {
        this.props.pushState({ pathname: `/Openings/${notification.activity.jobOpeningId}` });
      } else if (notification.activity.action === 'DELIVERY_HEAD_ON_CANDIDATES_SUBMIT' ||
          notification.activity.action === 'SALES_REPS_ON_CANDIDATES_SUBMIT' ||
          notification.activity.action === 'SALES_HAS_CONFIRMED_SUBMIT' ||
          notification.activity.action === 'COMPANY_HAS_SHORTLISTED_CANDIDATES'
          || notification.activity.action === 'CANDIDATE_STATUS_UPDATE' ||
          notification.activity.action === 'NOTIFY_NOT_JOINED') {
        this.props.pushState({ pathname: '/ATSBoard', query: { jobId: `${notification.activity.jobOpeningId}` } });
      } else if ((notification.activity.action === 'LOG_ACTIVITY')
        || (notification.activity.action === 'EDIT_LOG_ACTIVITY')) {
        if (notification.activity.company) {
          this.props.pushState({
            pathname: `/Company/${notification.activity.company.masterId}`,
            state: {
              activeKey: 4
            }
          });
        } else if (notification.activity.jobOpeningId) {
          this.props.pushState({
            pathname: `/Openings/${notification.activity.jobOpeningId}`,
            state: {
              activeKey: 3
            }
          });
        } else if (notification.activity.companyId) {
          this.props.pushState({
            pathname: `/Company/${notification.activity.activityFor.companyId}`,
            state: {
              activeKey: 4
            }
          });
        }
      } else if (notification.activity.action === 'RECEIVED_MAIL') {
        if (notification.activity.resumeId) {
          this.props.pushState({ pathname: `/ProfileSearch/${notification.activity.resumeId}`,
            query: { isAtsBoard: true },
            state: { activeKey: 4 } });
        } else if (notification.activity.jobOpeningId) {
          this.props.pushState({
            pathname: `/Openings/${notification.activity.jobOpeningId}`,
            state: {
              activeKey: 2
            } });
        } else if (notification.activity.companyId) {
          this.props.pushState({
            pathname: `/Company/${notification.activity.company.masterId}`,
            state: {
              activeKey: 3
            }
          });
        }
      } else if (notification.activity.action === 'COMPANY_CREATE') {
        this.props.pushState({
          pathname: `/Company/${notification.activity.company.masterId}`
        });
      } else if (notification.activity.action === 'CANDIDATE_ARCHIVED') {
        if (!this.state.isArchivedCandidatesPermitted) {
          this.redirectToNotFound();
          return;
        }
        this.props.pushState({
          pathname: '/ManageCandidates',
          state: {
            activeKey: 1
          }
        });
      } else if (notification.activity.action === 'CANDIDATE_ARCHIVAL_EXTENDED') {
        this.props.pushState({
          pathname: '/ManageCandidates',
          state: {
            activeKey: 1
          }
        });
      } else if (notification.activity.action === 'CANDIDATE_UNARCHIVED') {
        this.props.pushState({ pathname: `/ProfileSearch/${notification.activity.resumeId}`,
          query: { isAtsBoard: true },
          state: { activeKey: 1 } });
      } else if (notification.activity.action === 'CANDIDATE_ARCHIVAL_REJECTED') {
        this.props.pushState({ pathname: `/ProfileSearch/${notification.activity.resumeId}`,
          query: { isAtsBoard: true },
          state: { activeKey: 5 } });
      } else if (notification.activity.action === 'CANDIDATE_DELETE_INITIALIZED'
        || notification.activity.action === 'NEED_CANDIDATE_DELETE_APPROVAL') {
        if (!this.state.isPendingForDeletionPermitted) {
          this.redirectToNotFound();
          return;
        }
        this.props.pushState({
          pathname: '/ManageCandidates',
          state: {
            activeKey: 3
          }
        });
      } else if (notification.activity.action === 'CANDIDATE_DELETE_REJECTED') {
        this.props.pushState({ pathname: `/ProfileSearch/${notification.activity.resumeId}`,
          query: { isAtsBoard: true },
          state: { activeKey: 1 } });
      } else if (notification.activity.action === 'COMPANY_UNARCHIVED') {
        if (!this.state.isPendingForUnArchivedCompaniesPermitted) {
          this.redirectToNotFound();
          return;
        }
        this.props.pushState({ pathname: `/Company/${notification.activity.company.masterId}`,
          state: { activeKey: 1 } });
      } else if (notification.activity.action === 'COMPANY_CONTACT_DELETE') {
        this.props.pushState({ pathname: `/Company/${notification.activity.company.masterId}`,
          state: { activeKey: 1 } });
      } else if (notification.activity.action === 'COMPANY_ARCHIVED') {
        if (!this.state.isArchivedCompaniesPermitted) {
          this.redirectToNotFound();
          return;
        }
        this.props.pushState({
          pathname: '/ManageCompanies',
          state: { activeKey: 1 }
        });
      } else if (notification.activity.action === 'COMPANY_ARCHIVAL_EXTENDED') {
        this.props.pushState({
          pathname: '/ManageCompanies',
          state: { activeKey: 1 }
        });
      } else if (notification.activity.action === 'COMPANY_UNARCHIVAL_PENDING') {
        this.props.pushState({
          pathname: '/ManageCompanies',
          state: { activeKey: 2 }
        });
      }
    });
  };

  markAllRead = id => {
    this.props.markAllRead(id).then(() => {
      this.setState({
        showNotification: false,
        unreadCount: 0,
        readNotificationsList: this.state.notificationLists.map(notification => notification.id),
      }, () => {
        document.removeEventListener('click', this.handleOutsideClick, false);
      });
    });
  };

  notificationScroll = () => {
    const { notificationLists, totalNotifications } = this.state;
    if (notificationLists.length < totalNotifications || totalNotifications === 0) {
      this.setState({
        page: this.state.page + 1,
      }, () => this.initilizeData(this.state.page * this.state.limit, this.state.limit));
    }
  };

  markNotificationRead = notification => {
    this.setState({
      readNotificationsList: this.state.readNotificationsList.includes(notification.id)
        ? this.state.readNotificationsList
        : [...this.state.readNotificationsList, notification.id],
      unreadCount: !notification.isRead ? this.state.unreadCount - 1 : this.state.unreadCount,
      notificationLists: this.unreadNotificationById(notification.id)
    });
  };

  handleOutsideClick(e) {
    // ignore clicks on the component itself
    if (this.container.contains(e.target)) {
      return;
    }
    this.toggleNotification(e);
  }

  render() {
    const { notificationLists, showNotification, readNotificationsList, unreadCount } = this.state;
    const { user, loading } = this.props;
    return (
      <div>
        <div className={styles.user_notification}>
          <div className={` right ${styles.notification_dropdown}`}>
            <Col lg={12} md={12} >
              <div
                className={`avatar-circle-xs ${styles.circule_padding}`}
                role="button"
                tabIndex="-1"
                onClick={event => this.toggleNotification(event)}
              >
                <span className={`initials ${styles.text_align}`}>
                  {/* <i
                    className={'fa fa-bell-o'}
                    aria-hidden="true"
                  /> */}
                  <Image src="/bell.svg" />
                </span>
                {
                  parseInt(unreadCount, 10) > 0 ?
                    <span className={`badge ${styles.count_badge}`}>{unreadCount}</span> : ''
                }
              </div>

              {/* <div
                role="button"
                tabIndex="-1"
                onClick={event => this.toggleNotification(event)}
                className={styles.show_button}
              >
                <i
                  className={`fa fa-bell-o right ${styles.headerBar}`}
                  aria-hidden="true"
                />
                {parseInt(unreadCount, 10) > 0 ? <span className={styles.countStyle}>{unreadCount}</span> : ''}
              </div> */}
            </Col>
          </div>
          {showNotification &&
          <Fade in={showNotification}>
            <div className={styles.overlay}>
              <div className={styles.content} ref={c => { this.container = c; }}>
                <div className={`${styles.notification_header}`}>
                  <Image
                    src="/close.svg"
                    responsive
                    onClick={evt => { this.toggleNotification(evt); }}
                    className={styles.close_img}
                  />
                  <Row className="m-0">
                    <Col lg={8} sm={8} xs={8} className="p-t-5 p-b-5 p-l-5">
                      <span className={`f-s-17 ${notificationStyles.cursor_auto}`}>
                        <Trans>NOTIFICATIONS</Trans>
                      </span>
                      {unreadCount >= 1 && <p className={notificationStyles.unread}>
                        {unreadCount} unread { unreadCount > 1 ? 'notifications' : 'notification' }
                      </p>
                      }
                    </Col>
                    {unreadCount > 1 && user && user.id &&
                    <Col
                      lg={4}
                      sm={4}
                      xs={4}
                      className={`${styles.mark_all_header_content} text-left`}
                      style={unreadCount >= 1 ? { paddingTop: '12px' } : { paddingTop: '10px' }}
                    >
                      <Link
                        onClick={() => this.markAllRead(user.id)}
                      >
                        <Trans>MARK_ALL_AS_READ</Trans>
                      </Link>
                    </Col>
                    }
                  </Row>
                </div>
                <div className={`${styles.notification_details} ${notificationStyles.viewAllNotifications}`}>
                  <Scrollbars
                    universal
                    autoHide
                    onUpdate={({ top }) => {
                      if (top > 0.9 && !loading) {
                        this.notificationScroll();
                      }
                    }}
                    autoHeight
                    autoHeightMin={'calc(100vh - 60px)'}
                    autoHeightMax={'calc(100vh - 60px)'}
                    renderThumbHorizontal={props => <div {...props} className="hide" />}
                    renderView={props => <div {...props} className="customScroll" />}
                  >
                    <Col lg={12} md={12} sm={12} xs={12} className="p-l-0 p-r-0 p-b-30">
                      {notificationLists.length > 0 ?
                        notificationLists.map(notification => (
                          notification.activity &&
                          <li key={Math.random().toString(36).substring(7)} className="p-l-5">
                            <Link
                              onClick={() => this.openViewPage(
                                notification
                              )}
                            >
                              <Row className={`${
                                notification.isRead || readNotificationsList.includes(notification.id) ?
                                  notificationStyles.readNotification
                                  : notificationStyles.unReadNotification
                              } m-0`}
                              >
                                <Col lg={12} md={12} sm={12} xs={12} className="p-0">
                                  <NotificationCard
                                    key={`notification_${notification.id}`}
                                    notification={notification}
                                    markNotificationRead={this.markNotificationRead}
                                    isRead={
                                      notification.isRead || readNotificationsList.includes(notification.id)
                                    }
                                  />
                                </Col>
                              </Row>
                            </Link>
                          </li>
                        ))
                        :
                        <p className="m-0 center">NO_NOTIFICATION_TO_SHOW</p>
                      }
                    </Col>
                  </Scrollbars >
                </div>
              </div>
            </div>
          </Fade>
          }
        </div>
      </div>
    );
  }
}
