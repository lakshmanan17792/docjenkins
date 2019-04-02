import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import { Col, Row } from 'react-bootstrap';
import { propTypes } from 'redux-form';
import { Link } from 'react-router';
import { loadNotifications, updateNotificationStatus } from '../../redux/modules/notifications';
import NotificationCard from './NotificationCard';
import styles from './Notifications.scss';
import i18n from '../../i18n';

@connect(state => ({
  notificationLists: state.notifications.notificationLists || [],
  loading: state.notifications.loading
}), {
  loadNotifications, pushState, updateNotificationStatus
})

export default class Notifications extends Component {
  static propTypes = {
    ...propTypes,
    loadNotifications: PropTypes.func.isRequired,
    updateNotificationStatus: PropTypes.func.isRequired,
    showErr: PropTypes.func,
    loading: PropTypes.bool.isRequired,
    pushState: PropTypes.func.isRequired
  }

  static defaultProps = {
    showErr: null
  }

  constructor(props) {
    super(props);
    this.state = {
      showNotification: false,
      notificationLists: [],
      unreadCount: 0,
      totalNotifications: 0,
      limit: 10
    };
  }

  componentWillMount() {
    this.loadData();
  }

  loadData = () => {
    const { notificationLists, totalNotifications } = this.state;
    if (notificationLists.length < totalNotifications || totalNotifications === 0) {
      this.initilizeData();
    }
  }

  initilizeData = () => {
    this.props.loadNotifications({
      limit: this.state.limit,
    }).then(list => {
      this.setState({
        notificationLists: [...this.state.notificationLists, ...list.notifications],
        unreadCount: list.unRead,
        totalNotifications: list.totalNotifications
      });
    }, () => {
      this.props.showErr('Could not load notifications');
    });
  }

  openViewPage = (id, taskId) => {
    this.props.updateNotificationStatus(id).then(err => {
      if (err) {
        return;
      }
      this.props.loadNotifications({
        limit: this.state.limit,
      }).then(list => {
        this.setState({
          notificationLists: list.notifications,
          unreadCount: list.unRead,
          totalNotifications: list.totalNotifications,
          showNotification: !this.state.showNotification
        });
        this.props.pushState({ pathname: '/Tasks/View', query: { taskId: `${taskId}` } });
      });
    });
  }

  render() {
    const { notificationLists, totalNotifications } = this.state;
    return (
      <div className={styles.viewAllNotifications}>
        <Helmet title={i18n.t('NOTIFICATIONS')} />
        <Row className={`m-b-20 ${styles.total_count}`}>
          <Col lg={12} md={12} sm={12} xs={12}>
            <span>{totalNotifications.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Notifications</span>
          </Col>
        </Row>
        <Row className="p-l-15 p-b-30 p-r-15">
          <div className="p-l-15 p-r-15">
            <Col lg={12} md={10} sm={12} xs={12} className={styles.notifications_container}>
              {notificationLists.length > 0 ?
                notificationLists.map(notification => (
                  <Link
                    onClick={() => this.openViewPage(notification.id, notification.taskId)}
                    className="dark-grey-text"
                  >
                    <Row
                      lg={12}
                      sm={12}
                      xs={12}
                      className={notification.isRead ?
                        styles.readNotification :
                        styles.unReadNotification
                      }
                    >
                      <Col lg={12} md={12} sm={12} xs={12}>
                        <NotificationCard notification={notification} />
                      </Col>
                    </Row>
                  </Link>
                ))
                : <h2 className="text-center">No Notifications Found</h2>
              }
            </Col>
          </div>
        </Row>
      </div>
    );
  }
}
