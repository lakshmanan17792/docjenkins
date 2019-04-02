import React, { Component } from 'react';
// import DropdownList from 'react-widgets/lib/DropdownList';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import moment from 'moment';
import NVD3Chart from 'react-nvd3';
import d3 from 'd3';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
// import Highcharts from 'highcharts';
import { loadOpenings } from '../../redux/modules/openings';
import styles from './dashboard.scss';
import i18n from '../../i18n';
import { loadProfileCount, loadCandidateCount,
  loadJobOpeningCount, loadSelectedToHireRatio } from '../../redux/modules/dashboard';

@connect(state => ({
  profileData: state.dashboard.profilecount,
  profileGraphLoading: state.dashboard.profileGraphLoading,
  candidateData: state.dashboard.candidatecount,
  jobOpeningData: state.dashboard.jobopeningcount,
  ratioData: state.dashboard.selectedtohireratio,
}), {
  loadProfileCount, loadCandidateCount, loadJobOpeningCount, loadOpenings, loadSelectedToHireRatio
})
export default class ProfileProgress extends Component {
  static propTypes = {
    loadOpenings: PropTypes.func.isRequired,
    loadProfileCount: PropTypes.func.isRequired,
    // profileGraphLoading: PropTypes.bool.isRequired,
    loadCandidateCount: PropTypes.func.isRequired,
    loadJobOpeningCount: PropTypes.func.isRequired,
    showErr: PropTypes.func.isRequired,
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
      openingList: [],
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
      dropdownConfig: {
        name: 'upcomingDues',
        valueField: 'id',
        textField: 'jobTitle',
        defaultValue: { id: '0', jobTitle: 'Select JobTitle' },
        isFilter: false,
        dropUp: false
      },
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
    let items = [];
    const sorted = [];
    this.props.loadJobOpeningCount().then(() => {
      // this.renderJobOpeningsGraph();
      this.props.jobOpeningData.atsstatus.map(d => {
        if (d.status === 'Scheduled') {
          d.status = 'Interview';
        }
        if (d.status === 'ToBeSubmitted') {
          d.status = 'To Be Submitted';
        }
        if (d.status === 'Selected') {
          d.fa_icon = '/icons/selected.png';
        }
        if (d.status === 'Contacted') {
          d.fa_icon = '/icons/contacted.png';
        }
        if (d.status === 'Interested') {
          d.fa_icon = '/icons/interested.png';
        }
        if (d.status === 'To Be Submitted') {
          d.fa_icon = '/icons/tobe.png';
        }
        if (d.status === 'Submitted') {
          d.fa_icon = '/icons/submitted.png';
        }
        if (d.status === 'Shortlisted') {
          d.fa_icon = '/icons/shortlisted.png';
        }
        if (d.status === 'Interview') {
          d.fa_icon = '/icons/interview.png';
        }
        if (d.status === 'Hired') {
          d.color = '#2b9a62';
          d.border = '5px solid #32b875';
          d.fa_icon = '/icons/hired.png';
        }
        if (d.status === 'Rejected') {
          d.color = '#f75766';
          d.border = '5px solid #f75766';
          d.fa_icon = '/icons/rejected.png';
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
    d3.selectAll('.nvd3 .nv-legend')[0].forEach(d => {
      d3.select(d).attr('transform', `translate( ${-100}, ${0})`);
    });
    d3.selectAll('.nvd3 .nv-legend').on('click', () => {
      d3.selectAll('.nvd3 .nv-legend')[0].forEach(d => {
        d3.select(d).attr('transform', `translate( ${-100}, ${0})`);
      });
    });
    d3.selectAll('.nvd3 .nv-legend').on('dblclick', () => {
      d3.selectAll('.nvd3 .nv-legend')[0].forEach(d => {
        d3.select(d).attr('transform', `translate( ${-100}, ${0})`);
      });
    });
    d3.selectAll('.nv-label text')[0].forEach(d => {
      d3.select(d).style('fill', '#fff');
    });
  }
  /*
    TODO::
    Job openings graph
  */

 renderGraph = () => {
   const { profileData } = this.props;
   if (profileData.xing === undefined) {
     profileData.xing = [0];
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
   const { jobOpeningData, candidateData, ratioData } = this.props;
   const { sourceRatioGraphData, overallSourceGraphData, sortedAtsData } = this.state;
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
       dispatch: {
         legendClick() {
           console.log('legend click...');
           this.yieldratio();
         }
       }
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
     showXAxis: true,
     showYAxis: true,
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
         { /* <DropdownList
              data={openingList}
              textField={dropdownConfig.textField}
              defaultValue={dropdownConfig.defaultValue}
              name={dropdownConfig.name}
              className="card_job_list cursor-pointer"
              dropUp={!!dropdownConfig.dropUp}
              onChange={value => this.filterSelect(value)}
          /> */ }
       </Col>
       {/*
          TODO::
          No of candidates and
          Job openings graph
         */}
       <Col xs={12} className="p-10">
         { /* <Col xs={6} className={`p-0 p-r-15 ${styles.graph_title}`}>
            <div className={styles.inside_cand_sec}>
              <h4>No of candidates</h4>
              <p>{candidateData && candidateData.totalCount}</p>
              <div id="candidate_graph" className={styles.graph_sec} />
            </div>
        </Col> */ }
         <Col xs={4} className={`p-0 p-l-15 ${styles.graph_title}`}>
           <div className={styles.inside_job_sec}>
             <div className={`${styles.count_card} ${styles.candidate_count_icon}`}>
               <i className="fa fa-users fa-2x" />
             </div>
             <h4>New Candidates</h4>
             <p>{candidateData ? candidateData.totalCount : '0'}</p>
           </div>
         </Col>
         <Col xs={4} className={`p-0 p-l-15 ${styles.graph_title}`}>
           <div className={styles.inside_job_sec}>
             <div className={`${styles.count_card} ${styles.job_openings_icon}`}>
               <i className="fa fa-briefcase fa-2x" />
             </div>
             <h4>Job openings</h4>
             <ul className="listStyle-none">
               <li><p>{jobOpeningData ? jobOpeningData.status.activecount : '0'}</p><b>Active</b></li>
               <li><p> | {jobOpeningData ? jobOpeningData.status.closedcount : '0'}</p><b>Closed</b></li>
             </ul>
           </div>
         </Col>
         <Col xs={4} className={`p-0 p-l-15 ${styles.graph_title}`}>
           <div className={styles.inside_job_sec}>
             <div className={`${styles.count_card} ${styles.job_vacancies_icon}`}>
               <i className="fa fa-file-text-o fa-2x" />
             </div>
             <h4>Vacancies</h4>
             <ul className="listStyle-none">
               <li><p>{jobOpeningData ? jobOpeningData.vacancies.opencount : '0'}</p><b>Open</b></li>
               <li><p> | {jobOpeningData ? jobOpeningData.vacancies.filledcount : '0'}</p><b>Filled</b></li>
             </ul>
           </div>
         </Col>
       </Col>
       <Col xs={12} className="p-10">
         { /* <Col xs={6} className={`p-0 p-r-15 ${styles.graph_title}`}>
            <div className={styles.inside_cand_sec}>
              <h4>No of candidates</h4>
              <p>{candidateData && candidateData.totalCount}</p>
              <div id="candidate_graph" className={styles.graph_sec} />
            </div>
        </Col> */ }
         <Col xs={4} className={`p-0 p-l-15 ${styles.graph_title}`}>
           <div className={styles.inside_job_sec}>
             <div className={`${styles.count_card} ${styles.avg_time_to_hired}`}>
               <i className="fa fa-calendar fa-2x" />
             </div>
             <h4>Average time to hire a candidate</h4>
             <p>{ratioData ? `${Math.round(parseFloat(ratioData.avgdaysforhiring))} Days` : '0 Days'}</p>
           </div>
         </Col>
         <Col xs={4} className={`p-0 p-l-15 ${styles.graph_title}`}>
           <div className={styles.inside_job_sec}>
             <div className={`${styles.count_card} ${styles.selected_ratio}`}>
               <i className="fa fa-id-card-o fa-2x" />
             </div>
             <h4>Selected to Hire Ratio</h4>
             <p>{ratioData ? `${ratioData.hireratio.toFixed(2)}%` : '0'}</p>
           </div>
         </Col>
         <Col xs={4} className={`p-0 p-l-15 ${styles.graph_title}`}>
           <div className={styles.inside_job_sec}>
             <div className={`${styles.count_card} ${styles.submitted_ratio}`}>
               <i className="fa fa-address-book-o fa-2x" />
             </div>
             <h4>Submitted to Shortlist Ratio</h4>
             <p>{ratioData ? `${ratioData.shortlistratio.toFixed(2)}%` : '0'}</p>
           </div>
         </Col>
       </Col>

       <Col xs={12} className="p-10 ats-pipeline-chart">
         <h4 className="p-0 p-l-15">
           {i18n.t('ATS_BOARD_SUMMARY')}
         </h4>
         <div className={`p-0 p-l-15 ${styles.ats_graph_title}`}>
           <div className={styles.inside_job_sec}>
             <p>{jobOpeningData ? jobOpeningData.status.activecount : '0'}</p>
             <h4>Active Job Openings</h4>
             <div><img src="/icons/job-openings.png" alt="" /></div>
           </div>
         </div>
         <ul className="custom-breadcrumb">
           {sortedAtsData && sortedAtsData.map((atspipeline, index) =>
             (
               <li className={`ats-breadcrumb-${index + 1}`}>
                 <p style={{ color: atspipeline.color }}>{atspipeline ? atspipeline.count : '0'}</p>
                 {(atspipeline.status === 'To Be Submitted') ?
                   <h6> {atspipeline ? 'To Be Submitted' : ''}</h6> :
                   <h6>{atspipeline ? atspipeline.status : ''}</h6> }
                 <div style={{ color: atspipeline.color }} >
                   <img src={atspipeline.fa_icon} alt="" />
                 </div>
               </li>
             ))}
         </ul>
       </Col>

       <Col xs={12} className="p-10">
         <Col xs={6} className="p-l-15">
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
               datum={overallSourceGraphData}
               x={'label'}
               y={'value'}
               renderEnd={() => { this.barCharRender(); }}
               options={barOptions}
             />
           </div>
         </Col>
         <Col xs={6} className="p-l-15">
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
