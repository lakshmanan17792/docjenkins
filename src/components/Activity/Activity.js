import PropTypes from 'prop-types';
import Moment from 'moment';
import { Col } from 'react-bootstrap';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import Parser from 'html-react-parser';
import styles from './ActivityHistories.scss';
import NewPermissible from '../../components/Permissible/NewPermissible';

@connect(state => ({
  user: state.auth.user,
}), { })
export default class Activity extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    isView: PropTypes.bool,
    openViewModal: PropTypes.func,
    openEditModal: PropTypes.func,
    user: PropTypes.object,
    showHistory: PropTypes.bool.isRequired
  }
  static defaultProps = {
    activity: null,
    openViewModal: null,
    openEditModal: null,
    isView: false,
    user: null,
    showHistory: false
  };

  constructor(props) {
    super(props);
    const { activity } = props;
    this.state = {
      activity,
      viewMore: activity.autoHide,
      autoHide: activity.autoHide,
      isView: true,
      showHistory: this.props.showHistory || false
    };
    this.toggleView = this.toggleView.bind(this);
  }
  componentWillMount() {
    if ((this.props.user.id === this.props.activity.createdBy) && !this.props.isView) {
      this.setState({
        isView: false
      });
    }
  }
  toggleView() {
    const { autoHide } = this.state;
    this.setState({
      autoHide: !autoHide
    });
  }

  render() {
    const { activity, viewMore, autoHide, isView, showHistory } = this.state;
    return (
      <li className="timeline-inverted">
        <div className="timeline-badge warning"><i className={`${activity.icon}`} /></div>
        <div className="timeline-panel">
          <Col
            key={activity.id}
            lg={12}
            className="p-0"
          >
            <div className={`${styles.activityLog_content} ${viewMore ? 'p-b-35' : 'p-b-20'}`}>
              <div className={styles.activityLog_header}>
                <span className={styles.name_icon}>{activity.nameIcon}</span>
                <div className={styles.header_text}>
                  <span>{activity.activityFor.creator ? `${activity.activityFor.creator.firstName}
                    ${activity.activityFor.creator.lastName}` : ''} </span>
                  {/* <span>({activity.activityFor.creator ?
                    activity.activityFor.creator.email : ''})</span> */}
                  <span>{activity.logText}</span>
                  { (!isView && !showHistory) && window.location.pathname.includes('/Company') &&
                  <NewPermissible operation={{ operation: 'COMPANY_LOG_ACTIVITY', model: 'customer' }}>
                    <span
                      className={styles.editActivity}
                      onClick={() => this.props.openEditModal(activity)}
                      role="presentation"
                    >
                      <Trans>EDIT</Trans>
                    </span>
                  </NewPermissible>
                  }
                  { (!isView && !showHistory) && window.location.pathname.includes('/Openings') &&
                  <NewPermissible operation={{ operation: 'JOB_OPENING_LOG_ACTIVITY', model: 'jobOpening' }}>
                    <span
                      className={styles.editActivity}
                      onClick={() => this.props.openEditModal(activity)}
                      role="presentation"
                    >
                      <Trans>EDIT</Trans>
                    </span>
                  </NewPermissible>
                  }
                  {
                    activity.originId && (!isView && !showHistory) &&
                    <span
                      className={styles.viewActivity}
                      onClick={() => this.props.openViewModal(activity)}
                      role="presentation"
                    >
                      <Trans>HISTORY</Trans>
                    </span>
                  }
                </div>
                <div>
                  <span className={styles.log_time}>{Moment(activity.activityFor.logDate).format('llll')}</span>
                </div>
              </div>
              <div className={` ${styles.activityLog_body} ${autoHide ? 'hide-activity' : 'show-activity'}`} >
                <div className={styles.activity_content}>
                  {activity.activityFor.outcome ? <span className={`outcome ${activity.activityFor.outcome}`} >
                    {activity.activityFor.outcome}</span> : ''}
                  {/* <span dangerouslySetInnerHTML={{ __html: activity.activityFor.description }} /> */}
                  {Parser(activity.activityFor.description)}
                </div>
              </div>
              {
                viewMore ?
                  <buttion
                    className={autoHide ? styles.view_less : styles.view_more}
                    onClick={this.toggleView}
                  >
                    View {autoHide ? 'more' : 'less'}</buttion>
                  : ''
              }
            </div>
          </Col>
        </div>
      </li>
    );
  }
}
