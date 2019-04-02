import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import moment from 'moment';
import { reduxForm } from 'redux-form';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import TableLoader from '../../components/Table/LoadingTable';
import SearchBar from '../../components/FormComponents/SearchBar';
import Constants from '../../helpers/Constants';
import i18n from '../../i18n';
// import Loader from '../../components/Loader';

import {
  loadOpenings,
  updateJobOpeningsTab,
  updateJobOpeningsSearch,
  updateJobOpeningsSearchString,
  toggleSideBar,
  updateCurrentJobOpening,
  updateAssigning,
  clearAssign,
  clearViewState,
  clearAll
} from '../../redux/modules/job-openings';
import { getSearchJobOpenings } from '../../formConfig/SearchJobOpenings';

import styles from './jobOpenings.scss';
import toastrErrorHandling from '../toastrErrorHandling';
import ViewJobOpening from './ViewJobOpening';
import AssignJobOpenings from './AssignJobOpening';
import { getJobType } from '../../utils/jobOpeningUtils';

const tabs = [
  {
    label: 'Unassigned',
    name: 'unAssigned',
  },
  {
    label: 'Assigned',
    name: 'assigned',
  },
  {
    label: 'Archived',
    name: 'archived',
  }
];

// const CellData = ({ header, subHeader }) => (
//   <div>
//     {header}
//     {subHeader}
//   </div>
// );

@reduxForm({
  form: 'searchJobOpenings'
})
@connect(state => ({
  loading: state.jobOpenings.loading,
  total: state.jobOpenings.total,
  active: state.jobOpenings.active,
  assigning: state.jobOpenings.assigning,
  sideBarOpen: state.jobOpenings.sideBarOpen,
  searchString: state.jobOpenings.searchString,
  currentJobOpening: state.jobOpenings.currentJobId,
  user: state.auth.user,
  companyId: state.routing.locationBeforeTransitions.query.companyId,
}), { loadOpenings,
  updateJobOpeningsTab,
  updateJobOpeningsSearch,
  updateJobOpeningsSearchString,
  toggleSideBar,
  updateCurrentJobOpening,
  updateAssigning,
  clearAssign,
  clearViewState,
  clearAll })
class JobOpenings extends Component {
  static propTypes = {
    loadOpenings: PropTypes.func.isRequired,
    updateJobOpeningsTab: PropTypes.func.isRequired,
    updateJobOpeningsSearch: PropTypes.func.isRequired,
    updateJobOpeningsSearchString: PropTypes.func.isRequired,
    toggleSideBar: PropTypes.func.isRequired,
    clearAssign: PropTypes.func.isRequired,
    clearViewState: PropTypes.func.isRequired,
    clearAll: PropTypes.func.isRequired,
    updateCurrentJobOpening: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    total: PropTypes.number,
    active: PropTypes.number,
    assigning: PropTypes.bool,
    sideBarOpen: PropTypes.bool,
    searchString: PropTypes.string,
    currentJobOpening: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    updateAssigning: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    companyId: PropTypes.any,
  };

  static defaultProps = {
    companyId: '',
    total: null,
    active: null,
    assigning: null,
    sideBarOpen: false,
    searchString: '',
    currentJobOpening: null
  };

  constructor(props) {
    super(props);
    const { active } = props;
    this.state = {
      page: 0,
      limit: Constants.RECORDS_PER_PAGE,
      totalCount: 0,
      filterBy: tabs[props.active].name,
      searchTerm: '',
      list: []
    };
    this.componentMounted = false;
    this.intialize(tabs[active].name);
  }

  componentDidMount() {
    this.componentMounted = true;
  }

  componentWillReceiveProps= props => {
    const { sideBarOpen } = props;
    this.toggleScroll(sideBarOpen);
  };

  componentWillUnmount() {
    this.props.clearAll();
  }

  onClickTab = tab => {
    this.props.updateJobOpeningsSearchString('');
    this.props.updateJobOpeningsSearch(false);
    this.props.updateJobOpeningsTab(tab);
    this.loadOpenings(tabs[tab].name);
  };

  onSidebarClose = () => {
    this.props.clearViewState();
    this.props.clearAssign();
    this.props.updateAssigning(false);
  };

  onScroll = values => {
    if (this.componentMounted) {
      const { scrollTop, scrollHeight, clientHeight } = values;
      const pad = 100; // 100px of the bottom
      // t will be greater than 1 if we are about to reach the bottom
      const t = ((scrollTop + pad) / (scrollHeight - clientHeight));
      if (t > 1) {
        const { list, totalCount, filterBy, searchTerm } = this.state;
        let { reachedCount } = this.state;
        let { page } = this.state;
        reachedCount = (list.length >= totalCount && totalCount !== 0);
        if (list && list.length < totalCount) {
          page += 1;
          this.setState({
            page,
            reachedCount
          }, () => {
            if (!reachedCount) {
              this.intialize(filterBy, searchTerm);
            }
          });
        }
      }
    }
  }

  toggleSideBar = jobId => {
    this.props.updateCurrentJobOpening(jobId);
    this.props.toggleSideBar();
    this.toggleScroll();
  };

  toggleScroll = sideBarOpen => {
    const body = document.body;
    body.classList.toggle('noscroll', sideBarOpen);
  };

  cols = [{
    label: 'Opening',
    dataKey: 'jobTitle',
    cellRenderer: ({ cellData, rowData }) => (
      <div className={styles.cellContent}>
        <p className={styles.displayTitleVacancy} title={cellData}> {cellData} </p>
        <span> {rowData.vacancies} vacancies | </span>
        <span className="text-capitalize"> {getJobType(rowData.type)}</span>
      </div>
    ),
    width: 300,
  }, {
    label: 'Company',
    dataKey: 'company',
    cellRenderer: ({ cellData }) => (
      <div className={styles.cellContent}>
        <p className={styles.displayTitle} title={cellData ? cellData.name : ''}> {cellData ? cellData.name : ''} </p>
        <div
          className={styles.displayTitle}
          title={cellData ? cellData.domain : ''}
        >
          {cellData ? cellData.domain : ''}
        </div>
      </div>
    ),
    width: 200,
  }, {
    label: 'Created By',
    dataKey: 'creator',
    cellRenderer: ({ cellData, rowData }) => (
      <div className={styles.cellContent}>
        <p className={styles.displayTitle} title={cellData}>
         Created By {`${cellData ? cellData.firstName : ''} ${cellData ? cellData.lastName : ''}`} </p>
        <span> {`${moment.duration(moment().diff(rowData.createdAt)).humanize()} ago`} </span>
      </div>
    ),
    width: 300,
  }, {
    label: 'Action',
    dataKey: 'createdBy',
    cellRenderer: ({ rowData }) => this.renderRowAction(rowData.id),
    width: 200,
    style: {
      display: 'flex',
      flexDirection: 'column',
    }
  }];

  intialize = (filterBy, searchStringVal = '') => {
    const { page, limit, list } = this.state;
    const filter = {
      skip: page * Constants.RECORDS_PER_PAGE,
      limit,
      filterBy,
      searchTerm: searchStringVal
    };
    this.props.loadOpenings(filter).then(data => {
      const listArr = list || [];
      listArr.push(...data.response);
      this.setState({
        list: listArr,
        totalCount: data.totalCount,
        searchTerm: searchStringVal
      });
    }, err => {
      if (err.error.statusCode === 400) {
        toastrErrorHandling(err.error, i18n.t('errorMessage.JOB_OPENINGS_SEARCH'),
          err.error.message, { removeOnHover: true });
      } else {
        toastrErrorHandling(err.error, i18n.t('errorMessage.SERVER_ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_OPENINGS_FOR_THE_COMPANY'), { removeOnHover: true });
      }
    });
  }

  loadOpenings = (type, searchString = '') => {
    this.setState({
      page: 0,
      list: [],
      filterBy: type
    }, () => {
      this.intialize(type, searchString);
    });
  };

  removeCurrentOpeningFromList = () => {
    const { currentJobOpening } = this.props;
    const { filterBy } = this.state;
    this.setState({
      list: Object.assign({}, this.state.list, {
        [filterBy]: this.state.list.filter(opening => opening.id !== currentJobOpening),
      })
    });
  };

  navigateTabs = id => {
    setTimeout(() => {
      this.onClickTab(id);
    }, 200);
  }

  renderRowAction = jobOpeningId => {
    const { active } = this.props;
    if (active === 0) {
      return (
        <div style={{
          alignItems: 'right',
        }}
        >
          <button
            className={'btn btn-border orange-btn'}
            onClick={() => this.toggleSideBar(jobOpeningId)}
            disabled={false}
          >
          Preview And Assign
          </button>
        </div>
      );
    } else if (active === 1) {
      return (
        <div style={{
          alignItems: 'right',
        }}
        >
          <button
            className={'btn btn-border orange-btn'}
            onClick={() => this.toggleSideBar(jobOpeningId)}
            disabled={false}
          >
            Preview
          </button>
        </div>
      );
    }
    return null;
  };

  renderTabs = () => {
    const { active } = this.props;
    return tabs.map((tab, index) => (
      <li key={tab.name}>
        <span
          role="presentation"
          className={`${index === active ? styles.active : ''}`}
          onClick={() => this.onClickTab(index)}
        > {tab.label} </span>
      </li>
    ));
  };

  renderSideBarContent = () => {
    const { sideBarOpen, assigning, active } = this.props;
    if (sideBarOpen) {
      if (assigning) {
        return (
          <AssignJobOpenings
            callback={() => {
              this.removeCurrentOpeningFromList();
              this.props.toggleSideBar();
              this.onSidebarClose();
              this.navigateTabs(active);
            }}
            activeTab={active}
            onBack={() => this.props.updateAssigning(false)}
          />
        );
      }
      return (
        <ViewJobOpening
          onClose={() => this.props.toggleSideBar()}
          callback={() => {
            this.removeCurrentOpeningFromList();
            this.props.toggleSideBar();
            this.onSidebarClose();
            this.navigateTabs(active);
          }}
          onAssign={() => { this.props.updateAssigning(true); }}
        />
      );
    }
    return null;
  };

  render() {
    const { active, searchString, sideBarOpen, loading } = this.props;
    const { totalCount, list } = this.state;
    const searchJobOpening = getSearchJobOpenings(this);
    return (
      <div className={`${styles.job_openings} p-l-r-10 ${styles.jobOpeningsWrapper}`}>
        <Helmet title={i18n.t('MANAGE_JOB_OPENINGS')} />
        <div className={styles.content}>
          <div className={styles.headerDiv}>
            <span className={styles.header}>Manage Job Openings</span>
            <ul className={`${styles.job_openings_nav} list-unstyled`}>
              {this.renderTabs()}
            </ul>
          </div>
          <div className={styles.totalDiv}>
            <Col xs={6} lg={6} className={'text-left'}>
              <span className={`${styles.noOFOpenings} m-l-5`}>
                {`${totalCount} ${tabs[active].label.toLowerCase()} ${totalCount > 1 ? 'openings' : 'opening'}`}
              </span>
              <span className={styles.seperator}>|</span>
              <span className={`${styles.search_bar}`}>
                <SearchBar
                  {...searchJobOpening.fields[0]}
                  reset={() => {
                    this.props.updateJobOpeningsSearchString('');
                    this.loadOpenings(tabs[active].name);
                  }}
                  handleOnChange={e => {
                    const searchValue = e.target.value.trimLeft();
                    this.props.updateJobOpeningsSearchString(searchValue);
                    this.loadOpenings(tabs[active].name, searchValue);
                  }}
                  handleOnKeyUp={() => {}}
                  inpValue={searchString}
                  placeholder={'SEARCH_BY_JOB_TITLE'}
                  className={'job_openings_searchbar'}
                />
              </span>
            </Col>
          </div>
          <div className={styles.gridDiv}>
            <Scrollbars
              universal
              autoHide
              autoHeight
              onScrollFrame={this.onScroll}
              autoHeightMin={'400px'}
              autoHeightMax={'400px'}
              renderView={props => <div {...props} className="customScroll" />}
            >
              <Col xs={12} lg={12} className={'text-left'}>
                <TableLoader
                  list={list}
                  tableColumns={this.cols}
                  loading={loading}
                  rowClassName={styles.row}
                />
              </Col>
            </Scrollbars>
          </div>
        </div>
        <div className={`${styles.sidebar} ${sideBarOpen ? '' : styles.inactive}`}>
          <div className={styles.closeButton}>
            {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */}
            <img
              src="./cancel-music@3x.png"
              className={styles.cancelSideBar}
              onClick={() => {
                this.props.toggleSideBar();
                this.onSidebarClose();
              }}
              alt="cancel"
            />
          </div>
          <div className={styles.sideBarContent}>
            {this.renderSideBarContent()}
          </div>
        </div>
      </div>
    );
  }
}

export default JobOpenings;
