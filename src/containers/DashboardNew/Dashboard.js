import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import Helmet from 'react-helmet';

import styles from './dashboardNew.scss';
import UpcomingInterviews from './UpcomingInterviews';
import RecentActivities from './RecentActivities';
import UpcomingDues from './UpcomingDues';
import TopOpenings from './TopOpenings';
import ProfileProgress from './ProfileProgress';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

@connect()
export default class Dashboard extends Component {
  static propTypes = {
  }

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {
      dashboardErrs: []
    };
  }

    showErr = errMsg => {
      const errors = this.state.dashboardErrs;
      errors.push(errMsg);
      this.setState({
        dashboardErrs: errors
      }, () => {
        if (this.state.dashboardErrs.length === 1) {
          toastrErrorHandling({}, 'Error', this.state.dashboardErrs[0], { removeOnHover: true });
        } else {
          errors.splice(1, errors.length - 1);
          this.setState({
            dashboardErrs: []
          }, () => {
            toastrErrorHandling({}, 'Error', errors[0], { removeOnHover: true });
          });
        }
      });
    };

    render() {
      const SHOW_ICONS = false;
      return (
        <Row className="m-0">
          <Col sm={12} className={styles.dashboard_container}>
            <Helmet title={i18n.t('DASHBOARD')} />
            <Row className="m-0">
              <div>
                <ProfileProgress />
              </div>
              <div className={`${styles.card_section}`}>
                <UpcomingInterviews showErr={this.showErr} showIcon={SHOW_ICONS} />
              </div>
              <NewPermissible operation={{ operation: 'VIEW_ALL_JOBOPENING', model: 'jobOpening' }}>
                <div className={`${styles.card_section}`}>
                  <TopOpenings showErr={this.showErr} showIcon={SHOW_ICONS} />
                </div>
              </NewPermissible>
              <div className={`${styles.card_section}`}>
                <RecentActivities showErr={this.showErr} showIcon={SHOW_ICONS} />
              </div>
              <NewPermissible operation={{ operation: 'VIEW_JOBOPENING', model: 'jobOpening' }}>
                <div className={`${styles.card_section}`}>
                  <UpcomingDues showErr={this.showErr} showIcon={SHOW_ICONS} />
                </div>
              </NewPermissible>
            </Row>
          </Col>
        </Row>
      );
    }
}
