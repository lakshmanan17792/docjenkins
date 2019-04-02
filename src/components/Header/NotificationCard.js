import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import moment from 'moment/moment';
import { Col, Row, Image } from 'react-bootstrap';
import { updateNotificationStatus } from '../../redux/modules/notifications';
import styles from '../../containers/Notifications/Notifications.scss';
import i18n from '../../i18n';

@connect(state => ({
  user: state.auth.user,
  loading: state.notifications.loading
}), {
  updateNotificationStatus
})
export default class NotificationCard extends Component {
  static propTypes = {
    notification: PropTypes.object,
    markNotificationRead: PropTypes.func.isRequired,
    updateNotificationStatus: PropTypes.func.isRequired,
    isRead: PropTypes.bool,
  };

  static defaultProps = {
    notification: null,
    isRead: false,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  markRead = (event, notification) => {
    event.stopPropagation();
    this.props.updateNotificationStatus(notification.id).then(() => {
      this.props.markNotificationRead(notification);
    });
  };

  renderCardContent = notification => {
    if (notification.activity) {
      return (
        <span>
          <div className={styles.notificationContent}>
            {notification.activity.content ? Parser(`${notification.activity.content}`) : notification.activity.action}
            <span title={i18n.t('tooltipMessage.CREATED_AT')}>
              <Image
                src="/clock_1.svg"
              />
              &nbsp;
              {`${moment.duration(moment().diff(notification.createdAt)).humanize()} ago`}
            </span>
          </div>
        </span>
      );
    }
  };

  render() {
    const { notification, isRead } = this.props;
    const contentSize = isRead ? 12 : 11;
    return (
      <div>
        <Row className="v-height m-0">
          <Col
            lg={contentSize}
            sm={contentSize}
            xs={contentSize}
            className={!isRead ? 'v-middle p-r-20 p-l-0' :
              'v-middle p-r-30 p-l-0'}
          >
            <Row className="m-0 p-0">
              <Col xs={12} className="p-0">
                {this.renderCardContent(notification)}
              </Col>
            </Row>
          </Col>
          { !isRead && <Col lg={1} sm={1} xs={1} className="v-middle p-r-0">
            {/** <Link title="Remove hide">
              <i className={`right ${styles.customClose}`}></i>
            </Link> */}
            <span>
              <Image
                src="/correct.svg"
                alt={i18n.t('tooltipMessage.MARK_AS_READ')}
                responsive
                onClick={event => this.markRead(event, notification)}
                className={styles.close_img}
              />
            </span>
          </Col> }
        </Row>
      </div>
    );
  }
}
