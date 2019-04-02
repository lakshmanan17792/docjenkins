import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Table } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
import moment from 'moment';
// import { propTypes } from 'redux-form';
import DropdownList from 'react-widgets/lib/DropdownList';
import styles from './dashboard.scss';
import { loadDues } from '../../redux/modules/dashboard';
import { formatTitle } from '../../utils/validation';
import i18n from '../../i18n';
import Constants from '../../helpers/Constants';

@connect(state => ({
  dueList: state.dashboard.dueList,
  loading: state.dashboard.loadingDues
}), {
  loadDues,
})
export default class UpcomingDues extends Component {
  static propTypes = {
    loadDues: PropTypes.func.isRequired,
    dueList: PropTypes.object,
    showErr: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    showIcon: PropTypes.bool
  }

  static defaultProps = {
    loading: false,
    dueList: {},
    showIcon: false
  }

  constructor(props) {
    super(props);
    this.state = {
      page: 1,
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
        dropUp: true,
      },
      data: {},
      nomoreData: false
    };
  }

  componentWillMount() {
    this.intialize();
  }

  intialize = () => {
    const { filterValue, page } = this.state;
    this.props.loadDues({ date: filterValue, skip: (page - 1) * 10, limit: 10 }).then(
      dueList => {
        if (!lodash.isEmpty(dueList)) {
          this.setState(previousState => ({
            data: previousState.data ? { ...previousState.data, ...dueList } : { ...dueList }
          }));
        } else {
          this.setState({ nomoreData: true });
        }
      }, () => {
        this.props.showErr(i18n.t('errorMessage.COULD_NOT_LOAD_UPCOMING_DUES'));
      });
  }

  filterSelect = value => {
    if (this.scrollbar) {
      this.scrollbar.scrollToTop();
    }
    this.setState({
      filterValue: value.id,
      page: 1,
      data: {},
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
    // scrollHeight is equal to clientHeight when scrollTop is 0 making toScroll as infinity
    if (toScroll > 1 && !nomoreData && scrollHeight !== clientHeight) {
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
    if (loading && Object.keys(data).length === 0) {
      return loader;
    } else if (!data || Object.keys(data).length === 0) {
      return NoResultsFound;
    }
    // return NoResultsFound
  }

  render() {
    const { dropdownConfig, data } = this.state;
    const { showIcon } = this.props;
    return (
      <Col sm={12} className={`${styles.upcoming_dues}`}>
        <Col sm={12} className={`${styles.dashboard_card_header}`} >
          <Col sm={8} className={styles.card_title} >
            <h4>
              { showIcon &&
              <i className="fa fa-hourglass-half" />
              }
              <Trans>UPCOMING_DUES</Trans>
            </h4>
          </Col>
          <Col sm={4} className="right upcoming_dues_dropdown" >
            <DropdownList
              data={dropdownConfig.data}
              textField={dropdownConfig.textField}
              defaultValue={dropdownConfig.defaultValue}
              name={dropdownConfig.name}
              className="due_duration right cursor-pointer"
              dropUp
              onChange={value => this.filterSelect(value)}
            />
          </Col>
        </Col>
        <Scrollbars
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(52vh - 118px)'}
          autoHeightMax={'calc(52vh - 118px)'}
          onScrollFrame={lodash.throttle(this.handleScrollFrame, 1000)}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          ref={c => { this.scrollbar = c; }}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <Col sm={12} className={`${styles.dashboard_card_body}`} >
            {
              data && Object.keys(data).length ?
                Object.keys(data).map(key => (
                  <Col key={`dueList_${key}`} sm={12} className={`${styles.upcoming_dates}`} >
                    {/* <div className={`${styles.upcoming_date}`}>
                      <h6> {moment.utc(key).format('DD MMMM YYYY')} </h6>
                    </div> */}
                    <ul>
                      {
                        data[key] && data[key].length ?
                          data[key].map(dateData => (
                            <li key={`dateData_${dateData.id}`}>
                              <Col sm={12} className={`p-0 ${styles.list_dates}`} >
                                <Col xs={4} md={4} className="p-0">
                                  <div className={`${styles.job_title} ${styles.ellipsis}`}>
                                    <Link
                                      to={{ pathname: '/ProfileSearch', query: { jobId: `${dateData.id}` } }}
                                      title={formatTitle(dateData.jobTitle)}
                                    >
                                      {formatTitle(dateData.jobTitle)}
                                    </Link>
                                  </div>
                                  { dateData.company ? <div
                                    className={`p-t-7 ${styles.companyName} ${styles.ellipsis}`}
                                    title={dateData.company.name}
                                  >
                                    <Link
                                      to={{ pathname: `/Company/${dateData.company.id}` }}
                                      title={dateData.company.name}
                                    >
                                      {dateData.company.name}
                                    </Link>
                                  </div>
                                    : null }
                                </Col>
                                <Col xs={5} md={5} className={`${styles.openings_count} openingsTable`}>
                                  <div className={`table-responsive ${styles.count_inr}`}>
                                    <Table className="table m-0">
                                      <tbody>
                                        <tr>
                                          <td className="p-5">
                                            <div className={styles.selected}>
                                              <div className={styles.selected_count}>{dateData.vacancies}</div>
                                              <div style={{ fontSize: '13px' }}><Trans>VACANCIES</Trans> </div>
                                            </div>
                                          </td>
                                          <td className="p-5">
                                            <div className={styles.hired}>
                                              <div className={styles.selected_count}>{dateData.hired}</div>
                                              <div><Trans>HIRED</Trans></div>
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </Table>
                                  </div>
                                </Col>
                                <Col md={3} xs={3} className="p-0">
                                  {dateData.threeDaysFlag ?
                                    <div className={`${styles.flag_block} display-inline`}>
                                      <span className={styles.flag_text}>
                                        { !dateData.dayIndicator ?
                                          i18n.t('DUE_TODAY')
                                          :
                                          `${i18n.t('DUE_IN')} ${dateData.dayIndicator} ${dateData.dayIndicator === 1 ?
                                            i18n.t('DAY') : i18n.t('DAY_PLURAL')}`
                                        }
                                      </span>
                                    </div>
                                    :
                                    <div className={`${styles.past_date} right`} title={i18n.t('DUE_DATE')}>
                                      {/* <i className="fa fa-clock-o p-r-5" /> */}
                                      <img
                                        src={`${Constants.upcomingInterview.clock}`}
                                        className="p-r-5"
                                        alt="Interviewtime"
                                      />
                                      {moment(dateData.endDate).utc().format('DD MMM YYYY')}
                                    </div>
                                  }
                                </Col>
                              </Col>
                            </li>
                          )) : null
                      }
                    </ul>
                  </Col>
                )) : ''
            }
          </Col>
          {this.renderNoResultsFound()}
        </Scrollbars>
      </Col>
    );
  }
}
