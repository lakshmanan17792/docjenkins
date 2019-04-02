import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { propTypes } from 'redux-form';
import { Col, Row } from 'react-bootstrap';
import moment from 'moment';
import { updateNotificationStatus } from '../../redux/modules/notifications';
import styles from './Notifications.scss';
import i18n from '../../i18n';

@connect(state => ({
  user: state.auth.user,
  loading: state.notifications.loading
}), {
  updateNotificationStatus
})
export default class NotificationCard extends Component {
  static propTypes = {
    ...propTypes,
    notification: PropTypes.object,
    updateNotificationStatus: PropTypes.func.isRequired,
  }

  static defaultProps = {
    notification: null
  }

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getNotificationIcon = status => {
    let icon = '';
    let color = '';
    switch (status) {
      case 'open':
        icon = 'fa fa-envelope-open-o';
        color = 'blue';
        break;
      case 'onhold':
        icon = 'fa fa-exclamation-circle';
        color = 'red';
        break;
      case 'inprogress':
        icon = 'fa fa-hourglass-end';
        color = 'orange';
        break;
      case 'completed':
        icon = 'fa fa-check';
        color = 'green';
        break;
      default:
        icon = 'fa fa-envelope-open-o';
        color = 'blue';
    }
    const result = { icon, color };
    return result;
  }

  render() {
    const { notification } = this.props;
    const assigneer = notification.activity.user || notification.activity.assigner;
    const task = notification.activity.task || notification.activity.assignedTask;
    return (
      <div>
        <Row className="v-height">
          <Col lg={1} sm={1} xs={1} className="v-middle text-center">
            {<i
              className={`
                ${styles.notificationIcon}
                ${this.getNotificationIcon(notification.newStatus).icon}
                ${this.getNotificationIcon(notification.newStatus).color}
              `}
              aria-hidden="true"
            />}
          </Col>
          <Col lg={11} sm={11} xs={11} className="v-middle">
            <Row>
              <Col xs={12}>
                { notification.activity && notification.activity.action === 'NEW_TASK_ASSIGNED' ?
                  <span>
                    <div className={styles.notificationContent}>
                      <b className="text-capitalize"> {assigneer.firstName} {assigneer.lastName} </b>
                      assigned you a new Task
                    </div>
                    <div className="p-0">
                      <b>
                        <p className={'left p-0 p-t-7 p-b-1 m-0 orange'}>
                          {task.title}
                        </p>
                      </b>
                    </div>
                  </span>
                  : null
                }
                { notification.activity && notification.activity.action === 'TASK_STATUS_UPDATE' ?
                  <span>
                    <div className={styles.notificationContent}>
                      <b className="text-capitalize"> {assigneer.firstName} {assigneer.lastName} </b>
                      updated the Task Status for
                    </div>
                    <div className="p-0">
                      <b>
                        <p className={'left p-0 p-t-7 p-b-1 m-0 orange'}>
                          {task.title}
                        </p>
                      </b>
                    </div>
                  </span>
                  : null
                }
              </Col>
              <Col lg={12} md={12} sm={12} xs={12} className={`${styles.time}`}>
                <p className="left p-0 m-0" title={i18n.t('tooltipMessage.MOMENT_OCCURED')}>
                  <i className="fa fa-clock-o" />&nbsp;
                  {
                    moment(notification.createdAt).fromNow() === 'a day ago'
                      ?
                      moment(notification.createdAt).format('DD MMM YYYY')
                      :
                      moment(notification.createdAt).fromNow()
                  }
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}
