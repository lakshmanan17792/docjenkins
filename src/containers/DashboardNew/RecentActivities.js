import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Trans } from 'react-i18next';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './dashboardNew.scss';
import RecentActivitieTemplate from './RecentActivitieTemplate';
import { loadActivities } from '../../redux/modules/dashboard';
import i18n from '../../i18n';
import Constants from '../../helpers/Constants';
@connect(state => ({
  user: state.auth.user,
  activityList: state.dashboard.activityList,
  activePage: state.dashboard.activePage,
  loading: state.dashboard.loadingActivities
}), {
  loadActivities,
})
export default class RecentActivities extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    activePage: PropTypes.number,
    loadActivities: PropTypes.func.isRequired,
    activityList: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    showErr: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    showIcon: PropTypes.bool
  }

  static defaultProps = {
    loading: false,
    activePage: null,
    activityList: null,
    showIcon: false
  }

  constructor(props) {
    super(props);
    this.state = {
      limit: 20,
      page: -20,
      activityList: [],
      reachedEnd: false,
      totalCount: 0
    };
  }

  componentWillMount() {
    const { activityList, totalCount } = this.state;
    if (activityList.length < totalCount || totalCount === 0) {
      this.intialize();
    }
  }

  intialize = () => {
    this.setState({
      page: this.state.page + 20
    }, () => {
      this.props.loadActivities({
        skip: this.state.page,
        limit: this.state.limit,
        order: 'createdAt DESC',
        where: {
          action: {
            inq: ['JOB_OPENING_CREATE', 'JOB_OPENING_STATUS_UPDATE', 'CANDIDATE_STATUS_UPDATE']
          }
        }
      }).then(list => {
        this.setState({
          activityList: [...this.state.activityList, ...list.activities],
          totalCount: list.count
        });
      }, () => {
        this.props.showErr('Could not load actvities');
      });
    });
  }

  activityScroll = () => {
    const { activityList, totalCount } = this.state;
    if (activityList.length < totalCount || totalCount === 0) {
      this.intialize();
    }
  }

  reloadActivities = () => {
    this.setState({
      reachedEnd: false,
      page: -20,
      activityList: [],
      totalCount: 0
    }, () => {
      this.intialize();
    });
  }

  renderNoResultsFound = () => {
    const { loading } = this.props;
    const { activityList } = this.state;
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_RESULTS_FOUND</Trans></div></Row>
      </Col>
    );
    const loader = (
      <div className="loading_overlay">
        <div className="loader-circle">
          <i className="fa fa-circle-o-notch fa-spin" />
        </div>
      </div>
    );
    if (loading) {
      return loader;
    } else if (!activityList || Object.keys(activityList).length === 0) {
      return NoResultsFound;
    }
    // return NoResultsFound;
  }

  render() {
    const { activityList } = this.state;
    const { showIcon } = this.props;

    return (
      <Col sm={12} className={`${styles.recent_activities}`}>
        <Col sm={12} className={`${styles.dashboard_card_header}`} >
          <Col sm={10} className={styles.card_title} >
            <h4>
              {showIcon &&
                <i className="fa fa-history" />}
              <Trans>RECENT_ACTIVITIES</Trans>
            </h4>
          </Col>
          <Col sm={2}>
            <img
              src={`${Constants.upcomingInterview.refresh}`}
              className={` right ${styles.reload_activities}`}
              alt="activityrefresh"
              role="presentation"
              onClick={() => this.reloadActivities()}
            />
          </Col>
        </Col>
        <Scrollbars
          universal
          autoHide
          onUpdate={({ top }) => {
            if (top === 1) {
              this.activityScroll();
            }
          }}
          autoHeight
          autoHeightMin={'calc(52vh - 120px)'}
          autoHeightMax={'calc(52vh - 120px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <Col sm={12} className={`${styles.dashboard_card_body}`} >
            <Col sm={12} className={`${styles.recent_activity_list}`} >
              <ul>
                {
                  activityList && activityList.length ?
                    activityList.map(activity => (
                      <li key={activity.id}>
                        <Col sm={12} className={`${styles.activity_list}`} >
                          <Col sm={12} className="p-0">
                            <span>
                              <RecentActivitieTemplate activity={activity} />
                            </span>
                            <Col sm={12} className={`p-0 ${styles.time}`}>
                              <span title={i18n.t('tooltipMessage.CREATED_TIME')} >
                                {/* <i className="fa fa-clock-o" /> */}
                                {moment(activity.createdAt).fromNow()}
                              </span>
                            </Col>
                          </Col>
                        </Col>
                      </li>
                    )) : ''
                }
              </ul>
            </Col>
          </Col>
          {this.renderNoResultsFound()}
        </Scrollbars>
      </Col>
    );
  }
}
