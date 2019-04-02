import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import { push as route } from 'react-router-redux';
import { Row, Col, Pager, ButtonToolbar, DropdownButton, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router';
import { Scrollbars } from 'react-custom-scrollbars';
import { toastr } from 'react-redux-toastr';
import { reduxForm } from 'redux-form';
import { Trans } from 'react-i18next';
import SearchBar from '../../components/FormComponents/SearchBar';
import { getSearchOpeningConfig } from '../../formConfig/SearchOpening';
// import EditOpening from './SaveOpening';
import EditOpening from './StepSaveOpening';
import CloneViewOpening from './CloneViewOpening';
import {
  openEditOpeningModal,
  closeEditOpeningModal
} from '../../redux/modules/openings';
import Loader from '../../components/Loader';
import { formValidation } from '../../formConfig/SaveOpening';
import Constants from './../../helpers/Constants';
// import UserRole from './../../helpers/UserRole';
import { formatTitle, restrictDecimalNumber, trimTrailingSpace } from '../../utils/validation';
import styles from './Openings.scss';
import NewPermissible, { noOfPermissions } from '../../components/Permissible/NewPermissible';
import {
  loadProfileById as loadProfile, removeJobFromProfile,
  saveProfileJob
} from '../../redux/modules/profile-search';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';

// const providers = {
//   userRole: new UserRole()
// };

let timeoutId;
@reduxForm({
  form: 'searchOpening'
})

@connect(state => ({
  openings: state.openings.list || [],
  totalCount: state.openings.totalCount || 0,
  resumeId: state.routing.locationBeforeTransitions.query.profileId,
  resume: state.profileSearch.resume,
}), {
  openEditOpeningModal,
  closeEditOpeningModal,
  route,
  loadProfile,
  removeJobFromProfile,
  saveProfileJob
})
class ViewAllOpenings extends Component {
  static propTypes = {
    openEditOpeningModal: PropTypes.func.isRequired,
    closeEditOpeningModal: PropTypes.func.isRequired,
    toggleOpeningModal: PropTypes.func.isRequired, // this is for back browser alert
    isCreateOpeningModalOpen: PropTypes.bool,
    searchTerm: PropTypes.string,
    filter: PropTypes.object,
    searchOpeningsById: PropTypes.func.isRequired,
    route: PropTypes.func.isRequired,
    openings: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    activePage: PropTypes.number.isRequired,
    totalCount: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    handlePagination: PropTypes.func.isRequired,
    isScrollTop: PropTypes.bool,
    loadAllOpenings: PropTypes.func.isRequired,
    resumeId: PropTypes.string,
    loadProfile: PropTypes.func.isRequired,
    resume: PropTypes.arrayOf(PropTypes.object),
    removeJobFromProfile: PropTypes.func.isRequired,
    saveProfileJob: PropTypes.func.isRequired,
    searchOpenings: PropTypes.func.isRequired,
    resetSearchData: PropTypes.bool,
    resetFilters: PropTypes.func.isRequired,
    sortOpenings: PropTypes.func.isRequired
  }

  static defaultProps = {
    loading: false,
    resumeId: '',
    searchTerm: '',
    filter: {},
    isScrollTop: false,
    resume: [],
    isCreateOpeningModalOpen: false,
    resetSearchData: false
  }

  constructor(props) {
    super(props);
    this.state = {
      searchStrVal: '',
      openModal: false,
      openCloneViewModal: false,
      cloneOpening: {},
      isEdit: false,
      loadDefault: true,
      activePage: 1,
      openings: this.props.openings || [],
      activeSortKey: 'modifiedAt-desc',
      activeSortName: 'Modified date by desc'
    };
  }

  componentWillMount() {
    const permissions = ['Clone_job_opening'];
    const optionPermissions = noOfPermissions(permissions);
    const openingOptions = noOfPermissions([
      { operation: 'MY_OPENINGS', model: 'jobOpening' },
      { operation: 'ALL_OPENINGS', model: 'jobOpening' }
    ]);
    const openingFilters = JSON.parse(sessionStorage.getItem('openingFilters'));
    const searchTerm = openingFilters ? openingFilters.searchTerm : '';
    const sortKey = openingFilters ? openingFilters.sortBy.join('-') : 'modifiedAt-desc';
    const sortName = openingFilters ? openingFilters.activeSortName : 'Modified date by desc';
    this.setState({
      searchStrVal: searchTerm || '',
      optionPermissions,
      openingOptions,
      activeSortKey: sortKey,
      activeSortName: sortName
    });
    if (this.props.resumeId) {
      this.loadProfilesById();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isScrollTop) {
      this.resetScrollToTop();
    }
    this.setState({
      openings: nextProps.openings,
      activePage: nextProps.activePage,
    }, () => {
      if (this.props.resetSearchData) {
        this.setState({ searchStrVal: '' });
      }
    });
  }

  getOpeningById = event => {
    this.resetScrollToTop();
    if (event.keyCode === 13 && event.target.value) {
      window.clearTimeout(timeoutId);
      if (this.state.searchStrVal === '') {
        this.setState({
          loadDefault: false
        });
        this.props.searchOpenings(this.state.searchStrVal);
      } else if (!isNaN(this.state.searchStrVal)) {
        this.props.resetFilters(true);
        this.props.searchOpeningsById(this.state.searchStrVal);
        this.setState({
          loadDefault: false
        });
      } else {
        const name = this.state.searchStrVal;
        this.props.searchOpenings(name);
        this.setState({
          loadDefault: false
        });
      }
    } else if (!this.state.loadDefault && !this.state.searchStrVal) {
      this.props.loadAllOpenings();
      this.setState({
        loadDefault: true
      });
    }
  }

  loadProfilesById = () => {
    const { resumeId } = this.props;
    this.props.loadProfile({
      resumeId,
      originalScore: '',
      targetCompany: '',
      profileId: resumeId,
      needJobIds: true
    });
  }

  concatProfilesAndOpening = () => {
    const { resume } = this.props;
    const { openings } = this.props;
    if (resume && openings.length > 0 && resume.jobIds) {
      const jobIds = resume.jobIds;
      const updatedOpenings = openings.map(data => {
        if (jobIds.indexOf(data.id) !== -1) {
          return { ...data, isChecked: true };
        }
        return { ...data, isChecked: false };
      });
      return updatedOpenings;
    }
    return openings;
  }

  changeSearchValue = event => {
    if (event.target.value !== ' ') {
      const searchVal = trimTrailingSpace(event.target.value);
      if (!isNaN(searchVal) && searchVal !== '') {
        this.setState({
          searchStrVal: searchVal.replace('.', '')
        });
      } else {
        this.setState({
          searchStrVal: searchVal.replace('.', ''),
        }, () => {
          const name = this.state.searchStrVal;
          if (this.state.searchStrVal && this.state.searchStrVal !== '') {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
              this.props.searchOpenings(name);
            }, 500);
          } else {
            window.clearTimeout(timeoutId);
            this.props.searchOpenings(name);
          }
        });
      }
    }
  }

  resetSearch = () => {
    this.setState({
      searchStrVal: '',
    });
    this.props.searchOpenings('');
  }

  resetScrollToTop = () => {
    if (this.scrollbar) {
      this.scrollbar.scrollTop(0);
    }
  }

  addNewOpening = evt => {
    evt.preventDefault();
    this.props.toggleOpeningModal();
    this.setState({
      openModal: true,
      isEdit: false,
      selectedOpening: {}
    }, () => {
      this.props.openEditOpeningModal();
    });
  }

  openOpening = (id, event) => {
    const target = event.target;
    const { resumeId } = this.props;
    if (target.id === 'dropdown-size-small' ||
      target.id === 'ellipsisIcon' || target.id === 'cloneOption') {
      return false;
    }
    if (resumeId) {
      this.props.route({ pathname: `/Openings/${id}`, query: { profileId: resumeId } });
    } else {
      this.props.route({ pathname: `/Openings/${id}` });
    }
  }

  openCloneViewModal = opening => {
    this.setState({
      cloneOpening: opening,
      openCloneViewModal: true
    });
  }

  closeCloneViewModal = () => {
    this.setState({
      cloneOpening: {},
      openCloneViewModal: false
    });
  }

  closeModal = () => {
    this.props.closeEditOpeningModal();
    this.setState({ openModal: false });
  }

  displayRecruiters = array => {
    let totalString = '';
    if (array) {
      if (array.length > 1) {
        totalString = array.slice(0, 1).map(recruiter => recruiter.firstName);
        totalString += ` (+ ${(array.length - 1)} more)`;
      } else {
        totalString = array[0].firstName;
      }
    }
    return totalString;
  }

  showNotification = (evt, isAssigned) => {
    evt.stopPropagation();
    if (!isAssigned) {
      toastrErrorHandling({}, i18n.t('NOTIFICATION'),
        i18n.t('errorMessage.ASSIGN_THE_JOB_OPENING_TO_RECRUITERS_AND_SALES_REPRESENTATIVES_FOR_ADDING_MORE_PROFILES'));
    } else {
      toastrErrorHandling({}, i18n.t('NOTIFICATION'),
        i18n.t('errormessage.CHANGE_THE_STATUS_AS_ACTIVE_FOR_ADDING_MORE_PROFILES'));
    }
  }

  handleSortChange = (key, event) => {
    this.setState({ activeSortName: event.target.innerText, activeSortKey: key });
    this.props.sortOpenings(key, event.target.innerText);
  };

  selectPageNumber = (evt, maxPage) => {
    const pageNo = evt.target.value;
    if (evt.keyCode === 69) {
      evt.preventDefault();
    }
    if (evt.keyCode === 13 && pageNo > 0) {
      this.props.handlePagination('goto', Number(pageNo), maxPage);
      this.scrollbar.scrollTop(0);
    }
  }

  handlePagination = (type, maxPage) => {
    this.props.handlePagination(type, maxPage);
    this.scrollbar.scrollTop(0);
  }

  saveProfileJob = (evt, jobId, jobTitle) => {
    evt.stopPropagation();
    const { resume, resumeId } = this.props;
    if (resume) {
      const data = {
        jobId,
        jobTitle,
        resumeId,
        resumeProfileId: resume.id,
        candidateName: resume.name,
        status: 'Selected'
      };
      this.props.saveProfileJob(data).then(() => {
        toastr.success(i18n.t('successMessage.SUCCESSFULLY_ADDED'),
          i18n.t('successMessage.CANDIDATE_HAS_BEEN_SUCCESSFULLY_ADDED_TO_THE_JOB_OPENING'));
      }, error => {
        toastrErrorHandling(error.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_SELECT_JOB_OPENING_FOR_THE_CANDIDATE'));
      });
    }
  }

  removeProfileFromJobOpening = (evt, jobId) => {
    evt.stopPropagation();
    const { resumeId } = this.props;
    this.props.removeJobFromProfile(resumeId, jobId).then(() => {
      toastr.success(i18n.t('successMessage.REMOVED_FROM_OPENING'),
        i18n.t('successMessage.THE_CANDIDATE_HAS_BEEN_SUCCESSFULLY_REMOVED_FROM_THIS_OPENING'),
        { removeOnHover: true });
    }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_REMOVE_THE_CANDIDATE_FROM_THIS_OPENING'), { removeOnHover: true });
    });
  }

  circleIndividual = (obj, isSalesOwner) => (
    <OverlayTrigger
      rootClose
      overlay={this.renderTooltip(obj, false, null, isSalesOwner)}
      placement="top"
      key={obj.id}
    >
      <span className={styles.circle}>
        {obj.firstName ? obj.firstName.charAt(0).toUpperCase() : ''}
        {obj.lastName ? obj.lastName.charAt(0).toUpperCase() : ''}
      </span>
    </OverlayTrigger>
  )

  circleMultiple = (list, isSalesOwner) => {
    if (list.length <= 2) {
      return '';
    }
    return (
      <OverlayTrigger
        rootClose
        overlay={this.renderTooltip(null, true, list, isSalesOwner)}
        placement="top"
      >
        <span className={styles.circle}>
          +{list.length - 2}
        </span>
      </OverlayTrigger>
    );
  }

  renderTooltip = (obj, showAll, list, isSalesOwner) => {
    if (!showAll) {
      return (
        <Tooltip id={obj.id}>
          <strong>
            {`${obj.firstName ? obj.firstName : ''} ${obj.lastName ? obj.lastName : ''}`}
          </strong>
        </Tooltip>
      );
    }
    return (
      <Tooltip id={list.id} className={`salesTooltip ${styles.customTooltip}`}>
        <div>
          <strong>
            {`${list.length} ${isSalesOwner ? 'Account Owners' : 'Recruiters'}`}
          </strong>
        </div>
        {
          list.map(owner => (
            <div key={owner.id} className={styles.tooltip}>
              {`${owner.firstName ? owner.firstName : ''} ${owner.lastName ? owner.lastName : ''}`}
            </div>
          )
          )
        }
      </Tooltip>
    );
  }

  renderCircle = (list, isSalesOwner) => (
    <span className={styles.circleContainer}>
      {
        list.slice(0, 2).map(obj =>
          this.circleIndividual(obj, isSalesOwner)
        )
      }
      {
        list.length === 3 ? this.circleIndividual(list[2], isSalesOwner) : this.circleMultiple(list, isSalesOwner)
      }
    </span>
  );


  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_OPENINGS_FOUND</Trans></div></Row>
        <Row className={`${styles.empty_message} m-0`}>
          <div><Trans>MODIFY_SEARCH_TO_GET_RESULT</Trans></div>
        </Row>
      </Col>
    );
    const loadingContent = (
      <Col className={`${styles.no_results_found} m-0`}>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>Loading</Trans></div></Row>
      </Col>
    );
    if (this.props.loading) {
      return loadingContent;
    }
    return NoResultsFound;
  }
  renderNotAssigned = () =>
    // if (!isAssigned) {
    //   return (<span className={styles.no_recruiters}>Pending for approval</span>);
    // }
    (<span className={styles.no_recruiters}>No recruiters assigned</span>);
  render() {
    const { openings, activePage, isEdit,
      selectedOpening, cloneOpening } = this.state;
    const searchJobOpening = getSearchOpeningConfig(this);
    const { totalCount, resume, resumeId, filter, searchTerm } = this.props;
    const maxPage = Math.ceil(totalCount / Constants.RECORDS_PER_PAGE);
    let initialValues = {};
    const updatedOpenings = resume && Object.keys(resume).length > 0 ? this.concatProfilesAndOpening() : openings;
    if (selectedOpening) initialValues = { ...selectedOpening, ...selectedOpening.filters };
    return (
      <div className={styles.viewAllOpenings}>
        <Row className={`${styles.count_n_pager} m-0`}>
          <Col xs={12} md={7} sm={7} lg={5} >
            <div className={styles.count_n_search}>
              <div className={styles.total_count}>
                <span>{totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                {
                  totalCount < 2 ?
                    <span className="p-r-10"><Trans>OPENING</Trans></span>
                    :
                    <span className="p-r-10"><Trans>OPENINGS</Trans></span>
                }
                <NewPermissible operation={{ operation: 'JOB_OPENING_SEARCH', model: 'jobOpening' }}>
                  <span className={styles.verticalLine}>|</span>
                </NewPermissible>
              </div>
              <div className={styles.search_bar}>
                <NewPermissible operation={{ operation: 'JOB_OPENING_SEARCH', model: 'jobOpening' }}>
                  <SearchBar {...searchJobOpening.fields[0]} />
                </NewPermissible>
              </div>
            </div>
          </Col>
          <Col
            lg={7}
            md={5}
            sm={5}
            xs={12}
            className={styles.opening_actions}
          >
            <Row style={{ width: '100%' }}>
              <Col
                lg={6}
                md={12}
                sm={12}
                xs={6}
                lgOffset={maxPage && maxPage > 1 ? 0 : 6}
                mdOffset={0}
                smOffset={0}
                xsOffset={maxPage && maxPage > 1 ? 0 : 6}
                className={`${styles.button_block} display-inline p-l-0 p-r-0`}
              >
                <NewPermissible operation={{ operation: 'CREATE_JOBOPENING', model: 'jobOpening' }}>
                  <button
                    className={`${styles.add_btn} button-primary`}
                    type="submit"
                    title={i18n.t('tooltipMessage.CLICK_HERE_TO_CREATE_NEW_OPENING')}
                    onClick={this.addNewOpening}
                  >
                    <span className="p-5" style={{ fontSize: '13px' }}><i className="fa fa-plus p-r-5" />
                      <Trans>ADD</Trans>
                    </span>
                  </button>
                </NewPermissible>


                <ButtonToolbar className="left">
                  <DropdownButton
                    bsSize="small"
                    title={this.state.activeSortName}
                    pullRight
                    id="dropdown-size-medium"
                    className={`orange-btn filter-btn opening_dropdown ${styles.new_opening}`}
                    onSelect={this.handleSortChange}
                  >
                    <MenuItem
                      eventKey="modifiedAt-asc"
                      className={this.state.activeSortKey === 'modifiedAt-asc'
                        ? styles.menuActive : styles.menuInActive}
                    ><Trans>Modified date by asc</Trans></MenuItem>
                    <MenuItem
                      className={this.state.activeSortKey === 'modifiedAt-desc'
                        ? styles.menuActive : styles.menuInActive}
                      eventKey="modifiedAt-desc"
                    ><Trans>Modified date by desc</Trans></MenuItem>
                    <MenuItem
                      eventKey="submittedcount-asc"
                      className={this.state.activeSortKey === 'submittedcount-asc'
                        ? styles.menuActive : styles.menuInActive}
                    ><Trans>Activities by asc</Trans></MenuItem>
                    <MenuItem
                      eventKey="submittedcount-desc"
                      className={this.state.activeSortKey === 'submittedcount-desc'
                        ? styles.menuActive : styles.menuInActive}
                    ><Trans>Activities by desc</Trans></MenuItem>
                    <MenuItem
                      eventKey="createdAt-asc"
                      className={this.state.activeSortKey === 'createdAt-asc'
                        ? styles.menuActive : styles.menuInActive}
                    ><Trans>Created date by asc</Trans></MenuItem>
                    <MenuItem
                      eventKey="createdAt-desc"
                      className={this.state.activeSortKey === 'createdAt-desc'
                        ? styles.menuActive : styles.menuInActive}
                    ><Trans>Created date by desc</Trans></MenuItem>

                  </DropdownButton>
                </ButtonToolbar>

              </Col>
              <Col lg={6} md={12} sm={12} xs={6} className={`${styles.pagination_block} p-l-0 p-r-10`}>
                {
                  maxPage && maxPage > 1 ?
                    <div className={`${styles.page_goto}`}>
                      <input
                        type="number"
                        id="goToOpenings"
                        onKeyDown={e => this.selectPageNumber(e, maxPage)}
                        placeholder={i18n.t('placeholder.GO_TO')}
                        onKeyPress={restrictDecimalNumber}
                        min="1"
                      />
                    </div>
                    : ''
                }
                {
                  maxPage && maxPage > 1 ?
                    <Pager className={`${styles.pager} left`}>
                      <Pager.Item
                        className={this.state.activePage <= 1 ? `${styles.disabled} p-r-5` : 'p-r-5'}
                        onClick={() => this.handlePagination('first')}
                      >
                        <span><Trans>FIRST</Trans></span>
                      </Pager.Item>
                      <Pager.Item
                        className={this.state.activePage <= 1 ? styles.disabled : ''}
                        onClick={() => this.handlePagination('previous')}
                      >
                        <span className="fa fa-caret-left" />
                      </Pager.Item>
                      <Pager.Item
                        title={`${i18n.t('tooltipMessage.TOTAL_PAGES')} : ${maxPage}`}
                        className={styles.page_no}
                      >
                        {activePage}
                      </Pager.Item>
                      <Pager.Item
                        className={maxPage <= this.state.activePage ? styles.disabled : ''}
                        onClick={() => this.handlePagination('next', maxPage)}
                      >
                        <span className="fa fa-caret-right" />
                      </Pager.Item>
                      <Pager.Item
                        className={maxPage <= this.state.activePage ? `${styles.disabled} p-l-5` : 'p-l-5'}
                        onClick={() => this.handlePagination('last', maxPage)}
                      >
                        <span><Trans>LAST</Trans></span>
                      </Pager.Item>
                    </Pager>
                    : ''
                }
              </Col>
            </Row>
          </Col>
        </Row>
        <Scrollbars
          ref={c => { this.scrollbar = c; }}
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(100vh - 130px)'}
          autoHeightMax={'calc(100vh - 130px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <Col sm={12} className="p-0">
            {
              updatedOpenings && updatedOpenings.length ?
                updatedOpenings.map(opening => (
                  <Col
                    key={`opening_${opening.id}`}
                    lg={4}
                    md={6}
                    sm={12}
                    xs={12}
                    style={{ minHeight: '250px' }}
                    className="p-l-0 p-r-25 p-b-25 cursor-pointer"
                    onClick={event => this.openOpening(opening.id, event)}
                  >
                    <Col sm={12} className={`${styles.opening}`}>
                      <Col sm={12} className={styles.content}>
                        <Col sm={12} xs={12} className={`${styles.status_div} p-0`} >
                          <div>
                            <div className={`${styles.status} left
                            ${styles[(opening.status || '').toLowerCase()]}`}
                            >
                              <span>{opening.status}</span>
                            </div>
                            {
                              opening.salesOwners && opening.salesOwners.length > 0 && !this.props.resumeId &&
                              <span className={'right'} style={{ display: 'inline-flex' }}>
                                <span style={{ verticalAlign: 'middle', paddingTop: '3px' }}>
                                  <Trans>ACCOUNT_OWNERS</Trans>: </span>
                                <span className="p-l-5">{this.renderCircle(opening.salesOwners, true)}</span>
                              </span>
                            }
                          </div>
                          {
                            resume && resumeId && opening.status === 'active' ?
                              <div
                                title={opening.isChecked ?
                                  i18n.t('tooltipMessage.CLICK_TO_REMOVE_THE_CANDIDATE_TO_THIS_OPENING')
                                  : i18n.t('tooltipMessage.CLICK_TO_ADD_THE_CANDIDATE_TO_THIS_OPENING')}
                                className={`${styles.add_icon}
                                         ${opening.isChecked ? styles.selected : styles.not_selected}`}
                                onClick={opening.isChecked ?
                                  evt => this.removeProfileFromJobOpening(evt, opening.id)
                                  : evt => this.saveProfileJob(evt, opening.id, opening.jobTitle)}
                                role="button"
                                tabIndex="-1"
                              >
                                <span className={styles.add_circle_icon}>
                                  <i
                                    className={opening.isChecked ? 'fa fa-check' : 'fa fa-plus'}
                                    style={{ marginTop: '4px' }}
                                  />
                                </span>
                              </div> : ''
                          }
                        </Col>
                        <Col
                          sm={12}
                          className={`${styles.title} ${styles.ellipsis} p-0 m-t-7`}
                          title={formatTitle(opening.jobTitle)}
                        >
                          {formatTitle(opening.jobTitle)}
                        </Col>
                        <Col sm={12} className={`p-0 ${styles.noOfOpenings} ${styles.ellipsis} m-t-5`}>
                          <div>{`${opening.vacancies ? opening.vacancies : '-'}`} <Trans>VACANCIES</Trans></div>
                          {
                            opening.type ?
                              <div>
                                <span><i className="fa fa-circle" aria-hidden="true" /></span>
                                <div>
                                  {opening.type === 'fullTime' && <Trans>FULL_TIME</Trans>}
                                  {opening.type === 'contract' && <Trans>CONTRACT</Trans>}
                                  {opening.type === 'partTime' && <Trans>FREELANCE</Trans>}
                                </div>
                              </div>
                              : null
                          }
                          {
                            opening.date ?
                              <div>
                                <span>{'-'}</span>
                                <div>{Moment(opening.date, 'LL').format('DD MMM YYYY')}</div>
                              </div>
                              : null
                          }
                        </Col>
                        {
                          opening.company ?
                            <Col
                              sm={12}
                              className={`${styles.company} ${styles.ellipsis}
                                p-0 m-t-5`}
                            >{opening.company.name}</Col>
                            :
                            <Col sm={12} className={`${styles.company} p-0 m-t-5`}>
                              <Trans>UNKNOWN_COMPANY</Trans>
                            </Col>
                        }
                        <Col sm={12} className={`${styles.report} p-0`}>
                          {
                            (() => {
                              const { hired } = opening.statusCount;
                              return (
                                <Row className={`${styles.blocks}`}>
                                  {/* <div className={styles.contacted}>
                                    <div>{contacted || '-'}</div>
                                    <div>Contacted</div>
                                  </div>
                                  <div className={styles.shortlisted}>
                                    <div>{shortlisted || '-'}</div>
                                    <div>Shortlisted</div>
                                  </div>
                                  <div className={styles.in_pipeline}>
                                    <div>{scheduled || '-'}</div>
                                    <div>Interview</div>
                                  </div> */}
                                  <div className={styles.selected}>
                                    <div>{opening.submittedCount || '-'}</div>
                                    <div><Trans>SUBMISSIONS</Trans></div>
                                  </div>
                                  <div className={styles.hired}>
                                    <div>{hired || '-'}</div>
                                    <div><Trans>HIRED</Trans></div>
                                  </div>
                                  <div className={styles.rejected}>
                                    <div>{opening.rejectedCount || '-'}</div>
                                    <div><Trans>REJECTED</Trans></div>
                                  </div>
                                </Row>
                              );
                            })()
                          }
                        </Col>
                      </Col>
                      <Col sm={12} className={styles.footer} style={{ display: 'flex' }}>
                        {
                          /*
                            <span
                              title={opening.recruiters && opening.recruiters.length ?
                                opening.recruiters.map(recruiter => recruiter.firstName).join(', ')
                                :
                                null
                              }
                              className={`${styles.recruiter_name} ${styles.ellipsis} left`}
                            >
                              {
                                opening.recruiters && opening.recruiters.length ?
                                  this.displayRecruiters(opening.recruiters)
                                  :
                                  this.renderNotAssigned(opening.isAssigned)
                              }
                            </span>
                          */
                          opening.recruiters && opening.recruiters.length > 0 &&
                          <span style={{ display: 'flex' }}>
                            <span style={{ paddingTop: '3px' }} className="f-s-13"><Trans>RECRUITERS</Trans>: </span>
                            <span className="p-l-5">{this.renderCircle(opening.recruiters, false)}</span>
                          </span>
                        }
                        <span style={{ width: '100%' }}>
                          {opening.status === 'active' && !this.props.resumeId && opening.recruiters.length > 0 ?
                            <NewPermissible operation={{ operation: 'SELECT_CANDIDATE', model: 'jobProfile' }}>
                              <Link
                                className="right"
                                onClick={e => e.stopPropagation()}
                                to={{ pathname: '/ProfileSearch', query: { jobId: opening.id } }}
                              >
                                <img
                                  title={i18n.t('tooltipMessage.CLICK_HERE_TO_ADD_MORE_PROFILES')}
                                  src={'/icons/user-plus.svg'}
                                  alt="profile"
                                  id={`search_${opening.id}`}
                                />
                                {/* <i
                                  className={`fa fa-user-plus ${styles.search}`}
                                  role="button"
                                  tabIndex="0"
                                /> */}
                              </Link>
                            </NewPermissible> : null
                            // <Permissible operation="Add_profiles_to_an_opening">
                            //   <i
                            //     className={`fa fa-user-plus ${styles.search}`}
                            //     id={`search_${opening.id}`}
                            //     role="button"
                            //     tabIndex="0"
                            //     onClick={evt => this.showNotification(evt, opening.isAssigned, opening.status)}
                            //   />
                            // </Permissible>
                          }
                          <NewPermissible operation={{ operation: 'VIEW_ATS_BOARD', model: 'jobProfile' }}>
                            {
                              opening.status === 'active' && opening.recruiters.length > 0 &&
                              <Link
                                className={`right ${styles.bordericon}`}
                                onClick={e => e.stopPropagation()}
                                to={{ pathname: '/ATSBoard', query: { jobId: opening.id } }}
                              >
                                <img
                                  title={i18n.t('tooltipMessage.CLICK_HERE_TO_VIEW_ATS_BOARD')}
                                  src={'/icons/ats.svg'}
                                  alt="ats"
                                />
                                {/* <i
                                    className={`fa fa-th ${styles.edit}`}
                                    role="button"
                                    tabIndex="0"
                                  /> */}
                              </Link>
                            }
                          </NewPermissible>
                        </span>
                      </Col>
                    </Col>
                  </Col>
                )) : this.renderNoResultsFound()
            }
          </Col>
        </Scrollbars>
        {
          this.props.isCreateOpeningModalOpen &&
          <EditOpening
            form="EditOpening"
            enableReinitialize
            initialValues={initialValues}
            isEdit={isEdit}
            filter={filter}
            searchTerm={searchTerm}
            validate={formValidation}
            closeModal={() => { this.props.toggleOpeningModal(); }}
          />
        }
        {
          this.state.openCloneViewModal &&
          <CloneViewOpening
            opening={cloneOpening}
            closeCloneViewModal={this.closeCloneViewModal}
          />
        }
        <Loader loading={this.props.loading} />
      </div>
    );
  }
}

export default ViewAllOpenings;
