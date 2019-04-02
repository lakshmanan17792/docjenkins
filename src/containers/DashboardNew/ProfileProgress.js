import React, { Component } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
// import BigCalendar from 'react-big-calendar';
import Calendar from 'react-calendar';
import lodash from 'lodash';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import Calendar from 'react-calendar';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { Radio } from 'antd';
import { Link } from 'react-router';
import Switch from 'react-toggle-switch';
import 'react-toggle-switch/dist/css/switch.min.css';
import { Col, Row, Modal, Table } from 'react-bootstrap';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import NVD3Chart from 'react-nvd3';
import d3 from 'd3';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
// import Highcharts from 'highcharts';
import { loadOpenings } from '../../redux/modules/openings';
import styles from './dashboardNew.scss';
import i18n from '../../i18n';
import {
  loadProfileCount, loadCandidateCount,
  loadJobOpeningCount, loadSelectedToHireRatio, loadInterviews, loadDues
} from '../../redux/modules/dashboard';
import { formatTitle } from '../../utils/validation';
import Constants from '../../helpers/Constants';

moment.locale('en-GB');

@connect(state => ({
  profileData: state.dashboard.profilecount,
  profileGraphLoading: state.dashboard.profileGraphLoading,
  candidateData: state.dashboard.candidatecount,
  jobOpeningData: state.dashboard.jobopeningcount,
  ratioData: state.dashboard.selectedtohireratio,
  interviewList: state.dashboard.interviewList,
  dueList: state.dashboard.dueList,
}), {
  loadProfileCount,
  loadInterviews,
  loadDues,
  loadCandidateCount,
  loadJobOpeningCount,
  loadOpenings,
  loadSelectedToHireRatio
})
export default class ProfileProgress extends Component {
  static propTypes = {
    loadInterviews: PropTypes.func.isRequired,
    loadOpenings: PropTypes.func.isRequired,
    loadDues: PropTypes.func.isRequired,
    loadProfileCount: PropTypes.func.isRequired,
    // profileGraphLoading: PropTypes.bool.isRequired,
    loadCandidateCount: PropTypes.func.isRequired,
    loadJobOpeningCount: PropTypes.func.isRequired,
    showErr: PropTypes.func.isRequired,
    interviewList: PropTypes.array,
    loadSelectedToHireRatio: PropTypes.func.isRequired,
    profileData: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    /*
      TODO::
      Props for both graph
    */
    candidateData: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    jobOpeningData: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    ratioData: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
  }

  static defaultProps = {
    profileData: null,
    candidateData: null,
    jobOpeningData: null,
    ratioData: null,
    interviewList: null,
    dueList: {},
    list: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      profileGraphData: {},
      profileGraphOptions: {},
      profileGraphType: '',
      resultsPerPage: 10,
      page: 1,
      totalCount: 0,
      switched: false,
      data: {},
      jobcount: 0,
      jobcountclosed: 0,
      totaljobopeningscount: 0,
      nomoreData: false,
      openingList: [],
      filter: false,
      sourceRatioGraphData: [],
      sourceNames: [
        'Selected',
        'Contacted',
        'Interested',
        'To Be Submitted',
        'Submitted',
        'Shortlisted',
        'Interview',
        'Hired',
        'Rejected'
      ],
      sortedAtsData: [],
      overallSourceGraphData: [],
      filterValue: 'This Month',
      dropdownConfig: {
        name: 'dataPeriod',
        valueField: 'id',
        textField: 'name',
        data: [
          { id: 'This Month', name: `30 ${i18n.t('DAYS_FROM_TODAY')}` },
          { id: '60', name: `60 ${i18n.t('DAYS_FROM_TODAY')}` },
          { id: '90', name: `90 ${i18n.t('DAYS_FROM_TODAY')}` },
          { id: '180', name: `180 ${i18n.t('DAYS_FROM_TODAY')}` },
          { id: '365', name: `365 ${i18n.t('DAYS_FROM_TODAY')}` },
          { id: 'inception', name: 'Inception' }],
        defaultValue: { id: '90', name: `90 ${i18n.t('DAYS_FROM_TODAY')}` },
        isFilter: false,
        dropUp: false,
        date: new Date()
      },
      dropdownConfigCal: {
        name: 'upcomingDues',
        valueField: 'id',
        textField: 'jobTitle',
        defaultValue: { id: '0', jobTitle: 'Select JobTitle' },
        isFilter: false,
        dropUp: false
      },
      events: [
        {
          title: 'Interview',
          allDay: false,
          start: new Date(2018, 10, 1, 10, 0),
          end: new Date(2018, 10, 1, 14, 0),
        }
      ],
      date: new Date(),
      eventModal: false,
      selectedEvent: null,
      openingDueEvent: null
    };
  }
  componentWillMount() {
    const { openingList, totalCount } = this.state;
    if (openingList.length < totalCount || totalCount === 0) {
      this.intialize();
    }
  }
  componentDidMount() {
    const { sourceNames } = this.state;
    this.props.loadCandidateCount().then(() => {
      // this.renderCandidateGraph();
    });
    this.atsdatabinding();
    this.props.loadProfileCount().then(() => {
      this.renderGraph();
    });
    this.props.loadSelectedToHireRatio();
  }

  get intialize() {
    return this._intialize;
  }
  set intialize(value) {
    this._intialize = value;
  }

  getDateArray = (start, end) => {
    const arr = [];
    const dt = new Date(start);
    while (dt <= end) {
      arr.push(moment(dt).format('DD MMM'));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }
  atsdatabinding = () => {
    const { sourceNames } = this.state;
    let items = [];
    const sorted = [];
    const data = {
      isActive: this.state.switched,
      interval: 90
    };
    this.props.loadJobOpeningCount(data).then(res => {
      // // this.renderJobOpeningsGraph();
      console.log(res);
      this.setState({
        jobcount: res.status.activecount,
        jobcountclosed: res.status.closedcount,
        vacanciesopencount: res.vacancies.opencount,
        vacanciesfilledcount: res.vacancies.filledcount,
        totaljobopeningscount: res.status.jobopeningscount
      });
      res.atsstatus.map(d => {
        if (d.status === 'Scheduled') {
          d.status = 'Interview';
        }
        if (d.status === 'ToBeSubmitted') {
          d.status = 'To Be Submitted';
        }
        if (d.status === 'Selected') {
          d.fa_icon = '/icons/newselected.png';
        }
        if (d.status === 'Contacted') {
          d.fa_icon = '/icons/newcontact.png';
        }
        if (d.status === 'Interested') {
          d.fa_icon = '/icons/newintersted.png';
        }
        if (d.status === 'To Be Submitted') {
          d.fa_icon = '/icons/newtobesubmited.png';
        }
        if (d.status === 'Submitted') {
          d.fa_icon = '/icons/newsubmit.png';
        }
        if (d.status === 'Shortlisted') {
          d.fa_icon = '/icons/newshortlist.png';
        }
        if (d.status === 'Interview') {
          d.fa_icon = '/icons/newinterview.png';
        }
        if (d.status === 'Hired') {
          d.color = '#2b9a62';
          d.border = '5px solid #32b875';
          d.fa_icon = '/icons/newhired.png';
        }
        if (d.status === 'Rejected') {
          d.color = '#f75766';
          d.border = '5px solid #f75766';
          d.fa_icon = '/icons/newrejected.png';
        }
        items.push(d);
      });
      sourceNames.forEach(key => {
        let found = false;
        items = items.filter(item => {
          if (!found && item.status === key) {
            sorted.push(item);
            this.setState({
              sortedAtsData: sorted
            });
            found = true;
            return false;
          } return true;
        });
      });
    });
    this.props.loadProfileCount().then(() => {
      this.renderGraph();
    });
    this.props.loadSelectedToHireRatio();
  }

  closeModal = () => {
    this.setState({
      eventModal: false
    });
  }
  calendarEventHandler = value => {
    if (value === 'interview') {
      // document.getElementById('')
      // document.getElementById('task_event_btn').classList.add('MyClass');
      document.getElementById('task_event_btn').className += ' MyClass';
      const { filterValue } = this.state;

      this.props.loadInterviews({ date: filterValue }).then(
        interviewList => {
          let isDublicate = '';
          if (!lodash.isEmpty(interviewList)) {
            interviewList.map(v => v.interviewDate).sort().sort((a, b) => {
              if (a === b) {
                isDublicate = a;
              }
            });
            const dublicateData = [];
            interviewList.map((d, index) => {
              d.title = 'Interview';
              d.start = new Date(d.interviewDate);
              d.end = new Date(d.interviewDate);
              if (isDublicate === d.interviewDate) {
                dublicateData.push(interviewList[index]);
                d.data = dublicateData;
              }
            });
            this.setState({
              events: [...interviewList]
            });
          } else {
            this.setState({ nomoreData: true });
          }
        },
        () => {
          this.props.showErr('Could not load upcoming interviews');
        });
    } else if (value === 'due list') {
      const { filterValue } = this.state;
      this.props.loadDues({ date: filterValue }).then(
        dueList => {
          let isdueDublicate = '';
          if (!lodash.isEmpty(dueList)) {
            Object.keys(dueList).map(key => {
              dueList[key].map(v => v.endDate).sort().sort((a, b) => {
                if (a === b) {
                  isdueDublicate = a;
                }
              });
              const dueDublicateData = [];
              dueList[key].map((due, index) => {
                due.title = 'Due List';
                due.start = new Date(due.endDate);
                due.end = new Date(due.endDate);
                if (isdueDublicate === due.endDate) {
                  dueDublicateData.push(dueList[key][index]);
                  due.data = dueDublicateData;
                }
              });
              this.setState({
                events: [...dueList[key]]
              });
            });
          } else {
            this.setState({ nomoreData: true });
          }
        }, () => {
          this.props.showErr(i18n.t('errorMessage.COULD_NOT_LOAD_UPCOMING_DUES'));
        });
    } else {
      console.log(value);
    }
  }
  profileEventHandle = event => {
    if (event.title === 'Due List') {
      this.setState({
        openingDueEvent: event,
        selectedEvent: null,
        eventModal: true
      });
    } else if (event.title === 'Interview') {
      this.setState({
        selectedEvent: event,
        openingDueEvent: null,
        eventModal: true
      });
    }
  }
  handleSelect = ({ start, end }) => {
    const title = window.prompt('New Event name');
    if (title) {
      this.setState({
        events: [
          ...this.state.events,
          {
            start,
            end,
            title,
          },
        ],
      });
    }
  }

  eventStyleGetter = (event, start, end, isSelected) => {
    if (event.title === 'Interview') {
      // const backgroundColor = `#${event.hexColor}`;
      const backgroundColor = '#32b875';
      const style = {
        backgroundColor,
        color: '#32b875',
      };
      return {
        style
      };
    } else if (event.title === 'Due List') {
      const backgroundColor = '#182a58';
      const style = {
        backgroundColor,
        color: '#182a58',
      };
      return {
        style
      };
    }
  };

  _intialize = () => {
    const filter = {
      page: this.state.page,
      resultsPerPage: this.state.resultsPerPage,
      sortBy: ['createdAt', 'desc']
    };
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
  };
  /*
    TODO::
    No of Candidates graph
  */
  barCharRender = () => {
    d3.selectAll('.nv-x .nv-axis')[0].forEach(d => {
      d3.select(d).attr('transform', `translate( ${-35}, ${0})`);
    });
  }
  /*
    TODO::
    Yield per source graph
  */
  yieldratioRender = () => {
    // d3.selectAll('.nvd3 .nv-legend')[0].forEach(d => {
    //   d3.select(d).attr('transform', `translate( ${-100}, ${0})`);
    // });
    // d3.selectAll('.nvd3 .nv-legend').on('click', () => {
    //   d3.selectAll('.nvd3 .nv-legend')[0].forEach(d => {
    //     d3.select(d).attr('transform', `translate( ${-100}, ${0})`);
    //   });
    // });
    // d3.selectAll('.nvd3 .nv-legend').on('dblclick', () => {
    //   d3.selectAll('.nvd3 .nv-legend')[0].forEach(d => {
    //     d3.select(d).attr('transform', `translate( ${-100}, ${0})`);
    //   });
    // });
    d3.selectAll('.nv-label text')[0].forEach(d => {
      d3.select(d).style('fill', '#fff');
    });
  }
  /*
    TODO::
    Job openings graph
  */
  onChange = date => {
    this.setState({ date });
  };

  toggleSwitch = () => {
    this.setState(prevState => ({
      switched: !prevState.switched,
    }), () => {
      const data = {
        isActive: this.state.switched,
        interval: 90
      };
      this.atsdatabinding();
      this.props.loadJobOpeningCount(data).then(list => {
        this.setState({
          openingList: [...this.state.openingList, ...list.response],
          totalCount: list.totalCount
        }, () => {
        });
      });
    });
  };

  renderGraph = () => {
    const { profileData } = this.props;
    if (profileData.xing === undefined) {
      profileData.xing = [0];
    }
    if (profileData.linkedin === undefined) {
      profileData.linkedin = [0];
    }
    if (profileData.xingParsed === undefined) {
      profileData.xingParsed = [0];
    }
    if (profileData.inbound === undefined) {
      profileData.inbound = [0];
    }
    const today = new Date();
    const startDate = new Date(new Date().setDate(today.getDate() - 30));
    const data = {
      labels: this.getDateArray(new Date(startDate), new Date(profileData.endDate)),
      series: [{
        name: i18n.t('LINKEDIN'),
        data: profileData.linkedin.slice(-30)
        // data: [5, 4, 3, 7, 5, 10, 3, 4, 8, 10, 6, 8, 5, 4, 3, 7, 5, 10, 3, 4, 8, 10, 6, 8, 6, 8, 5, 4, 3, 7]
      }, {
        name: i18n.t('XING'),
        data: profileData.xing.slice(-30)
        // data: [3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4, 3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4, 7, 4, 3, 2, 9, 5]
      }, {
        name: i18n.t('XINGPARSED'),
        data: profileData.xingParsed.slice(-30)
        // data: [12, 9, 7, 8, 5, 4, 6, 2, 3, 3, 4, 6, 12, 9, 7, 8, 5, 4, 6, 2, 3, 3, 4, 6, 12, 9, 7, 8, 5, 4]
      }, {
        name: i18n.t('INBOUND'),
        data: profileData.inbound.slice(-30)
        // data: [4,  5, 3, 7, 3, 5, 5, 3, 4, 4, 5, 5, 5,  3, 4, 5, 6, 3, 3, 4, 5, 6, 3, 4, 4, 5, 6, 7, 6, 3]
      }]
    };
    const SourceRatiodata = [{
      label: 'Linkedin',
      value: profileData.yieldratio.linkedinpercentage,
      color: '#2777b5'
    },
    {
      label: 'Xing',
      value: profileData.yieldratio.xingpercentage,
      color: '#17595f'
    },
    {
      label: 'Inbound',
      value: profileData.yieldratio.inboundpercentage,
      color: '#2e1a4e'
    }
    ];
    const sourceCount = [{
      key: 'Linkedin',
      values: [
        {
          label: 'Linkedin',
          value: profileData.yieldratio.linkedincount,
          color: '#2777b5'
        }]
    }, {
      key: 'Xing',
      values: [
        {
          label: 'Xing',
          value: profileData.yieldratio.xingcount,
          color: '#17595f'
        }]
    }, {
      key: 'Inbound',
      values: [
        {
          label: 'Inbound',
          value: profileData.yieldratio.inboundcount,
          color: '#2e1a4e'
        }]
    }];
    const options = {
      seriesBarDistance: 15,
      axisX: {
        showGrid: false,
        labelInterpolationFnc(value, index) {
          return index % 3 === 0 ? value : null;
        }
      },
      axisY: {
        onlyInteger: true,
        offset: 20
      }
    };
    this.setState({
      profileGraphData: data,
      profileGraphOptions: options,
      sourceRatioGraphData: SourceRatiodata,
      overallSourceGraphData: sourceCount
    });
  }

  render() {
    const date = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Octr', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const { jobOpeningData, candidateData, ratioData } = this.props;
    const { sourceRatioGraphData, overallSourceGraphData, sortedAtsData,
      dropdownConfig, events, eventModal, selectedEvent, openingDueEvent } = this.state;
    const donutOptions = {
      labelType: 'percent',
      tooltips: true,
      duration: 1000,
      donut: true,
      showLabels: true,
      valueFormat(d) {
        return `<span style="color:#fff"> ${d.value} </span>`;
      },
      transitionDuration: 1000,
      legend: {
        rightAlign: false, align: true
      },
      tooltip: {
        contentGenerator(d) {
          let html = '';
          d.series.forEach(elem => {
            html += `<div style='border:1px solid #000;border-radius:5px;background:#f1ececb8;padding: 10px'>
              <div style='width:15px;float:left;margin-left:10px;margin-right:10px;height:15px;background:${elem.color}'>
              </div>${elem.key} : <b>${elem.value}</b></div>`;
          });
          html += '</ul>';
          return html;
        }
      }
    };
    const barOptions = {
      tooltips: true,
      showXAxis: false,
      showYAxis: true,
      // margin: ({ left: 5, right: 5, top: 10, bottom: 10 }),
      duration: 1000,
      yAxis: {
        scale: {
          range: 1
        }
      },
      transitionDuration: 1000,
      tooltip: {
        contentGenerator(d) {
          let html = '';
          d.series.forEach(elem => {
            html += `<div style='border:1px solid #000;border-radius:5px;background:#f1ececb8;padding: 10px'>
              <div style='width:15px;float:left;margin-left:10px;margin-right:10px;height:15px;background:${elem.color}'>
              </div>${elem.key} : <b>${elem.value}</b></div>`;
          });
          html += '</ul>';
          return html;
        }
      }
    };

    return (
      <Row className="m-0">
        <Col xs={12} className={`${styles.overview_title}`}>
          <h2>{i18n.t('OVERVIEW_DASHBOARD')}</h2>
          {/* <DropdownList
            popup
            data={dropdownConfig.data}
            textField={dropdownConfig.textField}
            defaultValue={dropdownConfig.defaultValue}
            name={dropdownConfig.name}
            className="card_job_list cursor-pointer"
            dropUp={!!dropdownConfig.dropUp}
            onChange={value => this.filterSelect(value)}
          /> */}
        </Col>
        {/*
          TODO::
          No of candidates and
          Job openings graph
         */}
        <Col xs={12} className="p-10 dashboard-new-bg">
          <Col xs={8} className="p-10">
            <div>
              <Col xs={4} className={`p-0 ${styles.graph_title}`}>
                <div className={styles.inside_job_sec}>
                  <div className="ts-icons">
                    <img src="/icons/ts-icon/1.png" alt="" />
                  </div>
                  <div className={styles.inside_job_sec_count}>
                    <h4> {i18n.t('NEW_CANDIDATES_DASHBOARD')}</h4>
                    <p>{candidateData ? candidateData.totalCount : '0'}</p>
                  </div>
                </div>
              </Col>
              <Col xs={4} className={`p-0 p-l-18 ${styles.graph_title}`}>
                <div className={styles.inside_job_sec}>
                  <div className="ts-icons">
                    <img src="/icons/ts-icon/2.png" alt="" />
                  </div>
                  <div className={styles.inside_job_sec_count}>
                    <h4> {i18n.t('JOB_OPENINGS_DASHBOARD')}</h4>
                    <ul className="listStyle-none-new">
                      <li><p>{this.state.jobcount ? this.state.jobcount : '0'}</p><b>{i18n.t('ACTIVE_DASHBOARD')}</b></li>
                      <li><p> | <span>{this.state.jobcountclosed ? this.state.jobcountclosed : '0'}</span></p><span><b>{i18n.t('CLOSED_DASHBOARD')}</b></span></li>
                    </ul>
                  </div>
                </div>
              </Col>
              <Col xs={4} className={`p-0 p-l-18 ${styles.graph_title}`}>
                <div className={styles.inside_job_sec}>
                  <div className="ts-icons">
                    <img src="/icons/ts-icon/3.png" alt="" />
                  </div>
                  <div className={styles.inside_job_sec_count}>
                    <h4> {i18n.t('VACANCIES_DASHBOARD')}</h4>
                    <ul className="listStyle-none-new">
                      <li><p>{this.state.vacanciesopencount ? this.state.vacanciesopencount : '0'}</p><b>{i18n.t('OPEN_DASHBOARD')}</b></li>
                      <li><p> | <span>{this.state.vacanciesfilledcount ? this.state.vacanciesfilledcount : '0'}</span></p><span><b>{i18n.t('FILLED_DASHBOARD')}</b></span></li>
                    </ul>
                  </div>
                </div>
              </Col>
            </div>
            <div>
              <Col xs={4} className={`p-0 ${styles.graph_title}`}>
                <div className={styles.inside_job_sec}>
                  <div className="ts-icons">
                    <img src="/icons/ts-icon/4.png" alt="" />
                  </div>
                  <div className={styles.inside_job_sec_count}>
                    <h4> {i18n.t('AVERAGE_TIME_TO_HIRE_DASHBOARD')}</h4>
                    <p>{ratioData ?
                      <span>{(ratioData.avgdaysforhiring > 1) ?
                        `${Math.round(parseFloat(ratioData.avgdaysforhiring))} ${i18n.t('DAYS')}`
                        : `${Math.round(parseFloat(ratioData.avgdaysforhiring))} ${i18n.t('DAY_ONE')}`}</span> : `0 ${i18n.t('DAY_ONE')}`}</p>
                  </div>
                </div>
              </Col>
              <Col xs={4} className={`p-0 p-l-18 ${styles.graph_title}`}>
                <div className={styles.inside_job_sec}>
                  <div className="ts-icons">
                    <img src="/icons/ts-icon/5.png" alt="" />
                  </div>
                  <div className={styles.inside_job_sec_count}>
                    <h4> {i18n.t('SELECTED_TO_HIRE_RATIO_DASHBOARD')}</h4>
                    <p>{ratioData ? `${ratioData.hireratio.toFixed(2)}%` : '0'}</p>
                  </div>
                </div>
              </Col>
              <Col xs={4} className={`p-0 p-l-18 ${styles.graph_title}`}>
                <div className={styles.inside_job_sec}>
                  <div className="ts-icons">
                    <img src="/icons/ts-icon/6.png" alt="" />
                  </div>
                  <div className={styles.inside_job_sec_count}>
                    <h4> {i18n.t('SUBMITTED_TO_SHORTLIST_RATIO_DASHBOARD')}</h4>
                    <p>{ratioData ? `${ratioData.shortlistratio.toFixed(2)}%` : '0'}</p>
                  </div>
                </div>
              </Col>
            </div>
          </Col>
          <Col xs={4} className="p-10">
            <div className="calendar-container">
              <div className="todaydate">
                <div className="yeardesign">{date.getFullYear()}</div>
                <div className="datedesign">{days[date.getDay()]}</div>
                <div className="datedesign">{months[date.getMonth()]} {date.getDate()}</div>
                {/* <div>
                  { <DropdownList
                data={openingList}
                textField={dropdownConfig.textField}
                defaultValue={dropdownConfig.defaultValue}
                name={dropdownConfig.name}
                className="card_job_list cursor-pointer"
                dropUp={!!dropdownConfig.dropUp}
                onChange={value => this.filterSelect(value)}
              />}
                </div> */}
              </div>
              <div className="calendar">
                <Calendar
                  onChange={this.onChange}
                  value={this.state.date}
                />
              </div>
            </div>
          </Col>
        </Col>

        <Col xs={12} className="p-10 ats-pipeline-chart">
          <Col sm={12} className={`${styles.ats_active_dashboard_card_header}`} >
            <div className={styles.atsboard_switch}>
              <Switch onClick={this.toggleSwitch} on={this.state.switched} />
            </div>
          </Col>
          {(!this.state.switched) ?
            <div className={styles.ats_newboader}>
              <div className="ats-icon-line" />
              <div className={styles.ats_title}>
                <h4>
                  {i18n.t('ACTIVE_PIPELINE_ATS_BOARD')}
                </h4>
              </div>
              <ul className="ats-new">
                <li>
                  <div className="ats-new-icon" style={{ marginLeft: 10 }} >
                    <img src="/icons/newjobopenings.png" alt="" />
                  </div>
                  <p>{this.state.jobcount ? this.state.jobcount : '0'}</p>
                  <h6>{i18n.t('JOB_OPENINGS_ATS')}</h6>
                </li>
                {sortedAtsData && sortedAtsData.map((atspipeline, index) =>
                  (
                    <li className={`ats-new-${index + 1}`}>
                      <div className="ats-new-icon" style={{ color: atspipeline.color }} >
                        <img src={atspipeline.fa_icon} alt="" />
                      </div>
                      <p style={{ color: atspipeline.color }}>{atspipeline ? atspipeline.count : '0'}</p>
                      {(atspipeline.status === 'To Be Submitted') ?
                        <h6>{i18n.t('TO_BE_SUBMITTED')}</h6> :
                        <span>
                          {(i18n.t(atspipeline.status.toUpperCase()) === 'Vorstellungsgespräch') ? <h6>Vorstellungs<br />gespräch</h6> : <h6>{i18n.t(atspipeline.status.toUpperCase())}</h6>
                          }
                        </span>}
                    </li>
                  ))}
              </ul>
            </div>
            :
            <div>
              {/* Active closed job Atsboard */}
              <div className={styles.ats_newboader}>
                <div className="ats-icon-line" />
                <div className={styles.ats_title}>
                  <h4>
                    {i18n.t('CLOSED_PIPELINE_ATS_BOARD')}
                  </h4>
                </div>
                <ul className="ats-new">
                  <li>
                    <div className="ats-new-icon" style={{ marginLeft: 10 }} >
                      <img src="/icons/newjobopenings.png" alt="" />
                    </div>
                    <p>{this.state.totaljobopeningscount ? this.state.totaljobopeningscount : '0'}</p>
                    <h6>{i18n.t('JOB_OPENINGS_ATS')}</h6>
                  </li>
                  {sortedAtsData && sortedAtsData.map((atspipeline, index) =>
                    (
                      <li className={`ats-new-${index + 1}`}>
                        <div className="ats-new-icon" style={{ color: atspipeline.color }} >
                          <img src={atspipeline.fa_icon} alt="" />
                        </div>
                        <p style={{ color: atspipeline.color }}>{atspipeline ? atspipeline.count : '0'}</p>
                        {(atspipeline.status === 'To Be Submitted') ?
                          <h6>{i18n.t('TO_BE_SUBMITTED')}</h6> :
                          <span>
                            {(i18n.t(atspipeline.status.toUpperCase()) === 'Vorstellungsgespräch') ? <h6>Vorstellungs<br />gespräch</h6> : <h6>{i18n.t(atspipeline.status.toUpperCase())}</h6>
                            }
                          </span>}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          }
        </Col>

        <Col xs={12} className="p-20">
          <Col xs={6} className="p-l-0">
            <div className={styles.candidate_title}>
              <h5>{i18n.t('CANDIDATES')}</h5>
            </div>
            <div className={`chart-div ${styles.graphplaceholder}`}>
              <NVD3Chart
                id="barChart"
                duration={1000}
                width={450}
                height={310}
                type="discreteBarChart"
                renderEnd={() => { this.barCharRender(); }}
                stateChange={() => { this.barCharRender(); }}
                changeState={() => { this.barCharRender(); }}
                datum={overallSourceGraphData}
                x={'label'}
                y={'value'}
                options={barOptions}
              />
              <ul className={styles.bar_xAxis}>
                <li style={{ position: 'relative', right: '-10px' }}>Linkedn</li>
                <li style={{ position: 'relative', right: '6px' }}>Xing</li>
                <li style={{ position: 'relative', right: '20px' }}>Inbound</li>
              </ul>
            </div>
          </Col>
          <Col xs={6} className="p-l-20">
            <div className={styles.candidate_title}>
              <h5>{i18n.t('YIELD_RATIO_PER_SOURCE')}</h5>
            </div>
            <div className={`chart-div ${styles.graphplaceholder}`}>
              <NVD3Chart
                id="chart"
                duration={1000}
                width={500}
                height={310}
                type="pieChart"
                renderEnd={() => { this.yieldratioRender(); }}
                stateChange={() => { this.yieldratioRender(); }}
                changeState={() => { this.yieldratioRender(); }}
                datum={sourceRatioGraphData}
                x={'label'}
                y={'value'}
                options={donutOptions}
              />
            </div>
          </Col>
        </Col>
      </Row>
    );
  }
}
