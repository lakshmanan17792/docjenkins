import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import Moment from 'moment';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
// import momentLocalizer from 'react-widgets-moment';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
// import { propTypes } from 'redux-form';
import DropdownList from 'react-widgets/lib/DropdownList';
import styles from './dashboardNew.scss';
import { loadInterviews } from '../../redux/modules/dashboard';
import { formatTitle } from '../../utils/validation';
import i18n from '../../i18n';
import Constants from '../../helpers/Constants';

@connect(state => ({
  interviewList: state.dashboard.interviewList,
  loading: state.dashboard.loading
}), {
  loadInterviews,
})
export default class UpcomingInterviews extends Component {
  static propTypes = {
    loadInterviews: PropTypes.func.isRequired,
    interviewList: PropTypes.array,
    showErr: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    showIcon: PropTypes.bool.isRequired
  }

  static defaultProps = {
    interviewList: null,
    loading: false
  }

  constructor(props) {
    super(props);
    this.state = {
      // selectedDate: Moment(new Date()).format('YYYY-MM-DD'),
      datePicker: {
        name: 'interviewDate',
      },
      filterValue: 'This Month',
      dropdownConfig: {
        name: 'upcomingDues',
        valueField: 'id',
        textField: 'name',
        data: [{ id: 'Today', name: i18n.t('TODAY') },
          { id: 'This Week', name: `7 ${i18n.t('DAYS_FROM_TODAY')}` },
          { id: 'This Month', name: `30 ${i18n.t('DAYS_FROM_TODAY')}` }],
        defaultValue: { id: 'This Month', name: `30 ${i18n.t('DAYS_FROM_TODAY')}` },
        isFilter: false,
        dropUp: false
      },
      page: 1,
      data: [],
      nomoreData: false
    };
  }

  componentWillMount() {
    this.intialize();
  }

  intialize = () => {
    const { filterValue, page } = this.state;
    this.props.loadInterviews({ date: filterValue, skip: (page - 1) * 10, limit: 10 }).then(
      interviewList => {
        if (!lodash.isEmpty(interviewList)) {
          this.setState(previousState => ({
            data: previousState.data ? [...previousState.data, ...interviewList] : [...interviewList]
          }));
        } else {
          this.setState({ nomoreData: true });
        }
      },
      () => {
        this.props.showErr('Could not load upcoming interviews');
      });
  }

  filterSelect = value => {
    this.setState({
      filterValue: value.id,
      page: 1,
      data: [],
      nomoreData: false
    }, () => {
      this.intialize();
    });
  }

  handleScrollFrame = values => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const { nomoreData } = this.state;
    const pad = 5; // 100px of the bottom
    const toScroll = ((scrollTop + pad) / (scrollHeight - clientHeight));
    if (toScroll > 1 && !nomoreData && scrollTop !== 0) {
      this.setState(previousState => ({
        page: previousState.page + 1
      }), () => {
        this.intialize();
      });
    }
  }

  renderNoResultsFound = () => {
    const { loading } = this.props;
    const { data } = this.state;
    const loader = (
      <div className="loading_overlay">
        <div className="loader-circle">
          <i className="fa fa-circle-o-notch fa-spin" />
        </div>
      </div>
    );
    const NoresultsFound = (<Col className={styles.no_results_found}>
      <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_RESULTS_FOUND</Trans></div></Row>
    </Col>);
    if (loading) {
      return loader;
    } else if (!data || Object.keys(data).length === 0) {
      return NoresultsFound;
    }
    // return NoresultsFound;
  }

  render() {
    const { dropdownConfig, data } = this.state;
    const { showIcon } = this.props;
    return (
      <Col sm={12} className={styles.upcoming_interviews}>
        <Col sm={12} className={styles.dashboard_card_header} >
          <Col sm={8} className={styles.card_title} >
            <h4>
              {showIcon &&
                <i className="fa fa-tasks" />
              }
              <Trans>UPCOMING_INTERVIEWS</Trans> </h4>
          </Col>
          <Col sm={4} className="right upcoming_interviews_dropdown" >
            <DropdownList
              data={dropdownConfig.data}
              textField={dropdownConfig.textField}
              defaultValue={dropdownConfig.defaultValue}
              name={dropdownConfig.name}
              className="due_duration right cursor-pointer"
              dropUp={!!dropdownConfig.dropUp}
              onChange={value => this.filterSelect(value)}
            />
          </Col>
        </Col>
        <Scrollbars
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(52vh - 120px)'}
          autoHeightMax={'calc(52vh - 120px)'}
          onScrollFrame={lodash.throttle(this.handleScrollFrame, 1000)}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <Col sm={12} className={`${styles.dashboard_card_body}`} >
            <Col sm={12} className={`${styles.upcoming_dates}`} >
              {/* <div className={`${styles.upcoming_date}`}>
                <h6> {Moment(selectedDate).format('DD MMMM YYYY')} </h6>
              </div> */}
              <ul>
                {
                  data && data.length ?
                    data.map(interviewData => (
                      <li key={`interviewData_${Math.random().toString(36).substring(7)}`}>
                        <Col sm={12} className={`p-10 ${styles.list_dates}`} >
                          <Col sm={5} md={5} lg={5} className="p-t-5 p-l-r-0">
                            <div className={`text-capitalize ${styles.ellipsis}`}>
                              <Link
                                to={{
                                  pathname: `/ProfileSearch/${interviewData.resumeId}`,
                                  query: { jobId: `${interviewData.jobOpeningId}`, isAtsBoard: true }
                                }}
                                className={styles.candidate_name}
                                title={interviewData.candidateName}
                              >
                                {interviewData.candidateName}
                              </Link>
                            </div>
                            <div
                              className={`p-t-7 ${styles.openingName} ${styles.ellipsis}`}
                              title={formatTitle(interviewData.jobOpeningName)}
                            >
                              <Link
                                to={{ pathname: `/Openings/${interviewData.jobOpeningId}` }}
                              >
                                {formatTitle(interviewData.jobOpeningName)}
                              </Link>
                            </div>
                          </Col>
                          <Col sm={5} md={5} lg={5} className="p-t-5 p-l-r-0">
                            <div className={`${styles.time}`}>
                              <span className="" title={i18n.t('tooltipMessage.INTERVIEW_TIME')} >
                                <img
                                  src={`${Constants.upcomingInterview.clock}`}
                                  className="p-r-10"
                                  alt="Interviewtime"
                                />
                                {Moment(interviewData.interviewDate).format('hh:mm A DD MMM YYYY')}
                              </span>
                            </div>
                            <div className={`${styles.interview_interviewer} p-t-10 `}>
                              <img
                                src={`${Constants.upcomingInterview.interviewer}`}
                                className="p-r-10"
                                alt="interviewer"
                              />
                              {
                                interviewData.interviewer &&
                                <span title={i18n.t('tooltipMessage.INTERVIEWER')} >
                                  {interviewData.interviewer}
                                </span>
                              }
                              {
                                !interviewData.interviewer &&
                                <span><Trans>NO_INTERVIEWER</Trans></span>
                              }
                            </div>
                          </Col>
                          <Col sm={2} className="p-0">
                            <div className={`${styles.alignCenter} ${styles.level}`}>
                              <h5 className={styles.level_no}>{interviewData.level.split(' ')[1]}</h5>
                              <span className={styles.level_title}>{interviewData.level.split(' ')[0]}</span>
                            </div>
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
