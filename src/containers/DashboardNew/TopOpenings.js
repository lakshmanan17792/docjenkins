import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, Row, Table } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import lodash from 'lodash';
import { loadOpenings } from '../../redux/modules/openings';
import styles from './dashboardNew.scss';
import toastrErrorHandling from '../toastrErrorHandling';
import { formatTitle } from '../../utils/validation';
import Switch from 'react-toggle-switch';
import 'react-toggle-switch/dist/css/switch.min.css';
import NVD3Chart from 'react-nvd3';
import d3 from 'd3';
import DropdownList from 'react-widgets/lib/DropdownList';
// import i18n from '../../i18n';

@connect(state => ({
  loading: state.openings.loading,
  user: state.auth.user
}), { loadOpenings })
export default class TopOpenings extends Component {
  static propTypes = {
    loadOpenings: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    user: PropTypes.object.isRequired,
    showErr: PropTypes.func.isRequired,
    showIcon: PropTypes.bool
  }

  static defaultProps = {
    loading: false,
    showIcon: false
  }

  constructor(props) {
    super(props);
    this.state = {
      resultsPerPage: 10,
      page: 1,
      openingList: [],
      openingListDropdown: [],
      reachedCount: false,
      totalCount: 0,
      switched: false,
      dropdownConfig: {
        name: 'upcomingDues',
        valueField: 'id',
        textField: 'jobTitle',
        defaultValue: { id: 0, jobTitle: '-Select JobTitle-' },
        isFilter: false,
        dropDown: true
      },
      data: {},
      nomoreData: false,
      openingGraphData: {},
      openingGraphOption: {}
    };
  }

  filterSelect = value => {
    if (this.scrollbar) {
      this.scrollbar.scrollToTop();
    }
    /* this.setState({
      filterValue: value.id,
      page: 1,
      data: {},
      nomoreData: false
    }, () => {
      this.intialize();
    }); */
    this.state.openingList.map(opening => {
      console.log(value.id);
      if (value.id === opening.id) {
        const data = [
          {
            key: 'Cumulative Return',
            values: [
              {
                label: 'SUBMITTED',
                value: opening.statusCount.submitted
              },
              {
                label: 'SHORTLISTED',
                value: opening.statusCount.shortlisted
              },
              {
                label: 'INTERVIEW',
                value: opening.statusCount.scheduled
              },
              {
                label: 'HIRED',
                value: opening.statusCount.hired
              },
              {
                label: 'REJECTED',
                value: opening.statusCount.rejected
              }
            ]
          }
        ];
        // const data = {
        //   labels: ['SUBMITTED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED'],
        //   series: [opening.statusCount.submitted, opening.statusCount.shortlisted, opening.statusCount.scheduled, opening.statusCount.hired, opening.statusCount.rejected]
        //   /* series: [{
        //     name: 'SUBMITTED',
        //     data: opening.statusCount.submitted
        //   },
        //   {
        //     name: 'SHORTLISTED',
        //     data: opening.statusCount.shortlisted
        //   },
        //   {
        //     name: 'INTERVIEW',
        //     data: opening.statusCount.scheduled
        //   }, {
        //     name: 'HIRED',
        //     data: opening.statusCount.hired
        //   }, {
        //     name: 'REJECTED',
        //     data: opening.statusCount.rejected
        //   }] */
        // };
        const options = {
          tooltip: {
            contentGenerator(d) {
              let html = '';
              d.series.forEach(elem => {
                html += `<div style='border:1px solid #000;border-radius:5px;background:#f1ececb8;padding: 10px'>
                  <div style='width:15px;float:left;margin-left:10px;margin-right:10px;height:15px;background:${
                    elem.color
                  }'>
                  </div>${elem.key} : <b>${elem.value}</b></div>`;
              });
              html += '</ul>';
              return html;
            }
          }
        };
        this.setState({
          openingGraphData: data,
          openingGraphOption: options
        });
        this.setState(prevState => ({
          dropdownConfig: {
            ...prevState.dropdownConfig,
            defaultValue: { id: value.id, jobTitle: opening.jobTitle }
          }
        }));
      }
    });
  }

  toggleSwitch = () => {
    this.setState(prevState => ({
      switched: !prevState.switched
    }));
  };

  componentWillMount() {
    const { openingList, totalCount } = this.state;
    if (openingList.length < totalCount || totalCount === 0) {
      this.intialize();
    }
    const filter = {
      onemonth: true
    };
    this.props.loadOpenings(filter).then(list => {
      this.setState({
        openingListDropdown: [...this.state.openingListDropdown, ...list.response],
      });
    }, error => {
      if (error.error.statusCode === 401) {
        toastrErrorHandling(error.error);
      } else {
        this.props.showErr('Could not load openings');
      }
    });
  }

  intialize = () => {
    const roleNames = [];
    this.props.user.userRoles.forEach(role => {
      roleNames.push(role.name);
    });
    const filter = {
      page: this.state.page,
      resultsPerPage: this.state.resultsPerPage,
      sortBy: ['createdAt', 'desc']
    };
    if (!(roleNames.indexOf('Admin') > -1)) {
      filter.userId = this.props.user.id;
    }
    this.props.loadOpenings(filter).then(list => {
      this.setState({
        openingList: [...this.state.openingList, ...list.response],
        totalCount: list.totalCount
      });
    }, error => {
      if (error.error.statusCode === 401) {
        toastrErrorHandling(error.error);
      } else {
        this.props.showErr('Could not load openings');
      }
    });
  }

  handleScrollFrame = values => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const { nomoreData } = this.state;
    const pad = 5; // 100px of the bottom
    const toScroll = ((scrollTop + pad) / (scrollHeight - clientHeight));
    if (toScroll > 1 && !nomoreData && scrollTop !== 0) {
      this.activityScroll();
    }
  }

  activityScroll = () => {
    const { openingList, totalCount } = this.state;
    if (openingList.length < totalCount ||
      (openingList.length === totalCount && totalCount !== 0)) {
      this.setState({
        page: this.state.page + 1,
        reachedCount: openingList.length === totalCount && totalCount !== 0
      }, () => {
        if (!this.state.reachedCount) {
          this.intialize();
        }
      });
    }
  }

  renderNoResultsFound = () => {
    const { openingList } = this.state;
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
    if (this.props.loading) {
      return loader;
    } else if (!openingList || Object.keys(openingList).length === 0) {
      return NoResultsFound;
    }
  }

  render() {
    const { openingList, openingListDropdown, dropdownConfig, openingGraphData, openingGraphOption } = this.state;
    const { showIcon } = this.props;

    return (
      <Col sm={12} className={`${styles.top_openings}`}>
        <Col sm={12} className={`${styles.dashboard_card_header}`} >
          <Col sm={8} className={styles.card_title} >
            <h4>
              {showIcon &&
                <i className="fa fa-briefcase" />
              }
              <Trans>RECENTLY_CREATED_OPENINGS</Trans> </h4>
          </Col>
          {/* <div>
            <Switch onClick={this.toggleSwitch} on={this.state.switched} />
          </div> */}
        </Col>
        {(!this.state.switched) ?
          <Scrollbars
            universal
            autoHide
            onScrollFrame={lodash.throttle(this.handleScrollFrame, 500)}
            autoHeight
            autoHeightMin={'calc(52vh - 120px)'}
            autoHeightMax={'calc(52vh - 120px)'}
            renderThumbHorizontal={props => <div {...props} className="hide" />}
            renderView={props => <div {...props} className="customScroll" />}
          >
            <Col sm={12} className={`${styles.dashboard_card_body}`} >
              <Col sm={12} className={`${styles.top_opening_list}`} >
                <ul>
                  {
                    openingList && openingList.length > 0 ?
                      openingList.map(opening => (
                        <li key={opening.id}>
                          <Col sm={12} className={`p-0 ${styles.opening_list}`} >
                            <Col sm={12} className="p-0">
                              <Col sm={4} md={4} xs={12} lg={4} className="text-left p-r-0 p-l-0">
                                <Link to={`/Openings/${opening.id}`}>
                                  <div
                                    className={`${styles.job_title} ${styles.ellipsis}`}
                                    title={formatTitle(opening.jobTitle)}
                                    style={{ color: '#1f9aff' }}
                                  >
                                    {formatTitle(opening.jobTitle)}
                                  </div>
                                </Link>
                                {
                                  opening.company ? <div
                                    className={`${styles.companyName} ${styles.ellipsis}`}
                                  >
                                    <Link
                                      to={{ pathname: `/Company/${opening.company.id}` }}
                                      title={opening.company.name}
                                    >
                                      {opening.company.name}
                                    </Link>
                                  </div>
                                    : null
                                }
                                <div className={`${styles.job_vacancy}`}>
                                  <span className="p-r-5">{`${opening.vacancies ? opening.vacancies
                                    : '-'}`}</span>
                                  <span className="p-r-5">{`${opening.vacancies ? 'Vacancies' : ''}`}</span>
                                  {
                                    opening.type ?
                                      <span>
                                        <span className={`${styles.typeIcon} p-r-5`}>
                                          <i className="fa fa-circle" /></span>
                                        <span
                                          className="p-r-5"
                                        >
                                          {opening.type === 'partTime' ? 'Freelance' : opening.type}
                                        </span>
                                      </span>
                                      : null
                                  }
                                </div>
                                {/* {
                                  opening.recruiters.length > 0 && opening.status === 'active' &&
                                    <Link to={{ pathname: '/ProfileSearch', query: { jobId: opening.id } }}>
                                      <span className={`${styles.add_Profile}`}>
                                        <i
                                          className="fa fa-user-plus"
                                          title={i18n.t('tooltipMessage.CLICK_HERE_TO_ADD_MORE_PROFILES')}
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </Link>
                                } */}
                              </Col>
                              <Col sm={8} md={8} lg={8} xs={12} className="p-t-5 p-b-5 p-r-0 openingsTable">
                                {
                                  (() => {
                                    const { hired } = opening.statusCount;

                                    return (
                                      <div className="table-responsive">
                                        <Table className="table m-0">
                                          <tbody>
                                            <tr>
                                              <td className="p-5">
                                                <div className={styles.selected}>
                                                  <div className={styles.selected_count}>
                                                    {opening.statusCount.submitted}
                                                  </div>
                                                  <div><Trans>SUBMITTED</Trans></div>
                                                </div>
                                              </td>
                                              <td className="p-5">
                                                <div className={styles.selected}>
                                                  <div className={styles.selected_count}>
                                                    {opening.statusCount.shortlisted}
                                                  </div>
                                                  <div><Trans>SHORTLISTED</Trans></div>
                                                </div>
                                              </td>
                                              <td className="p-5">
                                                <div className={styles.selected}>
                                                  <div className={styles.selected_count}>
                                                    {opening.statusCount.scheduled}
                                                  </div>
                                                  <div><Trans>INTERVIEW</Trans></div>
                                                </div>
                                              </td>
                                              <td className="p-5">
                                                <div className={styles.hired}>
                                                  <div className={styles.selected_count}>{hired}</div>
                                                  <div><Trans>HIRED</Trans></div>
                                                </div>
                                              </td>
                                              <td className="p-5">
                                                <div sm={2}>
                                                  <div className={styles.rejected}>
                                                    <div className={styles.selected_count}>
                                                      {opening.statusCount.rejected}
                                                    </div>
                                                    <div><Trans>REJECTED</Trans></div>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </Table>
                                      </div>
                                    );
                                  })()
                                }
                              </Col>
                            </Col>
                          </Col>
                        </li>
                      )
                      ) : ''
                  }
                </ul>
              </Col>
            </Col>
            {this.renderNoResultsFound()}
          </Scrollbars>
          :
          <div>
            <Scrollbars
              universal
              autoHide
              autoHeight
              autoHeightMin={'calc(52vh - 120px)'}
              autoHeightMax={'calc(52vh - 120px)'}
              renderThumbHorizontal={props => <div {...props} className="hide" />}
              renderView={props => <div {...props} className="customScroll" />}
            >
              <div className="recent_pie">
                <div className="dropDown">
                  <DropdownList
                    filter
                    data={openingListDropdown}
                    textField={dropdownConfig.textField}
                    defaultValue={dropdownConfig.defaultValue}
                    name={dropdownConfig.name}
                    className="due_duration right cursor-pointer"
                    onChange={value => this.filterSelect(value)}
                  />
                </div>
                <NVD3Chart
                  id="barChart"
                  type="discreteBarChart"
                  width={550}
                  height={250}
                  datum={openingGraphData}
                  x={'label'}
                  y={'value'}
                  reduceXTicks={false}
                  yAxis={{
                    tickFormat: d3.format('d') // <== !!!
                  }}
                  options={openingGraphOption}
                />
              </div>
            </Scrollbars>
          </div>}
      </Col>
    );
  }
}
