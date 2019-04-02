import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { propTypes } from 'redux-form';
import { Modal, Col, Row } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';

import styles from './ActivityHistories.scss';
import Activity from './Activity';
import {
  getLogActivity
} from '../../redux/modules/customers';

@connect(() => ({
}), {
  getLogActivity
})

class ViewActivity extends Component {
  static propTypes = {
    ...propTypes,
    closeViewModal: PropTypes.func.isRequired,
    getLogActivity: PropTypes.func.isRequired,
  };

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {
      activities: [],
    };
  }
  componentWillMount() {
    this.props.getLogActivity(this.props.activity.id).then(data => {
      this.setState({
        activities: data
      });
    });
  }
  getActivitySection = activity => {
    activity.activityFor = activity;
    const creator = activity.activityFor.creator;
    activity.autoHide = this.props.checkIfAutoHide(activity);
    activity.activityFor.description = activity.activityFor.description
      ? activity.activityFor.description : '';
    activity.nameIcon = creator ?
      `${creator.firstName.split('')[0]}${((creator.lastName && creator.lastName !== '') ?
        creator.lastName.split('')[0] : creator.firstName.split('')[1])}` : 'UR';
    activity.icon = this.props.getActivityIconByLogType(activity.activityFor.type);
    if (activity.activityFor.type === 'Face to face') {
      activity.logText = 'logged a face to face meeting';
    } else {
      activity.logText = `logged ${activity.activityFor.type ? activity.activityFor.type.split(' ')[1] : 'an activity'}
      ${activity.activityFor.type ? activity.activityFor.type.split(' ')[2] : ''}`;
    }
    return <Activity key={activity.id} activity={activity} isView />;
  }

  closeModal = () => {
    this.props.closeViewModal();
  }

  renderContentByActivityType = () => {
    const { activities } = this.state;
    return activities && activities.length ?
      <ul className="timeline">
        {
          activities.map(activityLog => (
            this.getActivitySection(activityLog)
          ))
        }
      </ul> : '';
  }

  render() {
    const { openViewActivity } = this.props;
    return (
      <div>
        <Modal
          show={openViewActivity}
          onHide={this.closeModal}
          style={{ display: 'block' }}
          bsSize="large"
        >
          <Modal.Header className={`${styles.modal_header_color}`}>
            <Row className="clearfix">
              <Col sm={12} className={styles.modal_title}>
                <span>
                  Activity History
                </span>
                <span
                  role="button"
                  tabIndex="-1"
                  className="close_btn right no-outline"
                  onClick={this.closeModal}
                >
                  <i className="fa fa-close" />
                </span>
              </Col>
            </Row>
          </Modal.Header>
          <Modal.Body>
            <Scrollbars
              ref={c => { this.scrollbar = c; }}
              universal
              autoHide
              autoHeight
              autoHeightMin={'calc(100vh - 200px)'}
              autoHeightMax={'calc(100vh - 200px)'}
              renderThumbHorizontal={props => <div {...props} className="hide" />}
              renderView={props => <div {...props} className="customScroll customerScroll" />}
            >
              <div className={`activity_logger ${styles.logger_container}`}>
                <div className={styles.logger_section}>
                  <Row className={styles.logger_box}>
                    <Col sm={12} className={styles.logger_content}>
                      <Col lg={12} className={`p-t-15 ${styles.activities_section}`}>
                        {this.renderContentByActivityType()}
                      </Col>
                    </Col>
                  </Row>
                </div>
              </div>
              {/* {this.renderContentByActivityType()} */}
            </Scrollbars>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default ViewActivity;
