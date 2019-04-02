import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, fieldPropTypes, getFormValues } from 'redux-form';
import { Col, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';
import Moment from 'moment';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import { push as route } from 'react-router-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import EditOpening from '../Openings/StepSaveOpening';
import CompanyOpeningsFilter from './CompanyOpeningsFilter';
import { formValidation } from '../../formConfig/SaveOpening';
import SearchBar from '../../components/FormComponents/SearchBar';
// import { getSearchCustomerConfig } from '../../formConfig/SearchCustomer';
// import toastrErrorHandling from '../../containers/toastrErrorHandling';
import styles from './Companies.scss';
import { formatTitle } from '../../utils/validation';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

let timeoutId = null;
export const renderField = ({
  input,
  inpValue,
  reset,
  handleOnChange,
  placeholder,
  errorMessage,
  meta: {
    touched,
    error
  },
}) => (
  <div>
    <span className={styles.iconSearch}>
      <i
        className="fa fa-search"
        role="button"
        aria-hidden="true"
      />
    </span>
    <input
      {...input}
      placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      type="text"
      value={inpValue}
      onChange={event => { handleOnChange(event); }}
    />
    { inpValue && <span className={styles.iconClear}>
      <i
        className="fa fa-times"
        onClick={event => { reset(event); }}
        role="button"
        aria-hidden="true"
      />
    </span>
    }
    {touched && (error && <div className="error-message">{errorMessage || error}</div>)}
  </div>
);
renderField.propTypes = fieldPropTypes;
@reduxForm({
  form: 'searchCompany'
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
}), {
  route
})
export default class CompanyOpenings extends Component {
  static propTypes = {
    route: PropTypes.func.isRequired,
    companyOpeningFilterObj: PropTypes.object,
    refreshOpenings: PropTypes.func.isRequired,
    loadOpeningsForCompany: PropTypes.func.isRequired,
    emptyCompanyOpeningFilters: PropTypes.func.isRequired,
    changeFilterView: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    companyOpenings: PropTypes.object,
    company: PropTypes.object,
    values: PropTypes.object,
    showFilters: PropTypes.bool,
    jobLoading: PropTypes.bool,
    jobLoaded: PropTypes.bool,
    isOpeningsTabClick: PropTypes.bool
  }

  static defaultProps = {
    companyOpenings: {},
    companyOpeningFilterObj: {},
    company: {},
    isOpeningsTabClick: false,
    values: null,
    showFilters: false,
    jobLoading: false,
    jobLoaded: false
  }

  constructor(props) {
    super(props);
    this.state = {
      searchStrVal: '',
      openOpeningModal: false,
    };
  }

  componentWillMount() {
    if (sessionStorage.getItem('openingFilterObj') &&
      JSON.parse(sessionStorage.getItem('openingFilterObj')).searchTerm) {
      this.setState({
        searchStrVal: JSON.parse(sessionStorage.getItem('openingFilterObj')).searchTerm,
      });
    }
    if (sessionStorage.getItem('openingFilterObj')) {
      sessionStorage.removeItem('openingFilterObj');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpeningsTabClick && nextProps.isOpeningsTabClick === true) {
      // if the isOpeningsTabClick flag is true, clear the searchterm value
      this.resetSearchValue();
    }
  }
  setSearchTerm = evt => {
    const value = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    if (value && (value === this.state.searchStrVal)) return;
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    if (/^[A-z\d\s-]+$/i.test(value) || value === '') {
      this.setState({
        searchStrVal: value,
      }, () => {
        timeoutId = window.setTimeout(() => {
          this.props.loadOpeningsForCompany({ searchTerm: this.state.searchStrVal });
        }, 1000);
      });
    }
  }

  // stores a copy of the applied filters in session storage
  setCompanyOpeningFilters = () => {
    sessionStorage.setItem('companyActiveKey', 2);
    if (this.state.searchStrVal !== '') {
      this.props.companyOpeningFilterObj.searchTerm = this.state.searchStrVal;
    }
    sessionStorage.setItem('openingFilterObj',
      JSON.stringify(this.props.companyOpeningFilterObj));
  }

  resetSearch = () => {
    this.setState({
      searchStrVal: '',
    }, () => {
      this.props.loadOpeningsForCompany({ searchTerm: this.state.searchStrVal });
    });
  }

  resetSearchValue = () => {
    this.setState({
      searchStrVal: '',
    }, () => {
      this.props.refreshOpenings();
    });
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

  viewOpening = id => {
    this.setCompanyOpeningFilters();
    this.props.route({ pathname: `/Openings/${id}` });
  }

  changeOpeningModalView = evt => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      openOpeningModal: !this.state.openOpeningModal,
      initialValues: { company: { id: this.props.company.id, name: this.props.company.name } }
    });
  }

  closeModal = () => {
    this.setState({ openOpeningModal: false });
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
          +{list.length - 2 }
        </span>
      </OverlayTrigger>
    );
  }

  loadOpeningsForCompanyByFilter = filters => {
    this.props.loadOpeningsForCompany(filters);
  }

  displayFiltersCount = () => {
    const { companyOpeningFilterObj } = this.props;
    if (companyOpeningFilterObj && Object.keys(companyOpeningFilterObj).length === 0) {
      return (null);
    }
    if (companyOpeningFilterObj && Object.keys(companyOpeningFilterObj).length - 1 > 0) {
      if (companyOpeningFilterObj.startDate) {
        return (Object.keys(companyOpeningFilterObj).length - 2 > 0 &&
        <span className={styles.filter_count}>{Object.keys(companyOpeningFilterObj).length - 2}</span>);
      }
      return (Object.keys(companyOpeningFilterObj).length - 1 > 0 &&
        <span className={styles.filter_count}>{Object.keys(companyOpeningFilterObj).length - 1}</span>);
    }
  }

  renderTooltip = (obj, showAll, list, isSalesOwner) => {
    if (!showAll) {
      return (
        <Tooltip id={obj.id}>
          <strong>
            {`${obj.firstName ? obj.firstName : ''} ${obj.lastName ? obj.lastName : ''}` }
          </strong>
        </Tooltip>
      );
    }
    return (
      <Tooltip id={list.id} className={`salesTooltip ${styles.customTooltip}`}>
        <div>
          <strong>
            {`${list.length} ${isSalesOwner ? 'Account Owners' : 'Recruiters'}` }
          </strong>
        </div>
        {
          list.map(owner => (
            <div key={owner.id} className={styles.tooltip}>
              {`${owner.firstName ? owner.firstName : ''} ${owner.lastName ? owner.lastName : ''}` }
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
    const { companyOpenings, company } = this.props;
    const NoResultsFound = (
      <Col className="no_results_found">
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className="sub_head m-0"><div><Trans>NO_OPENINGS_FOUND</Trans></div></Row>
      </Col>
    );
    const loadingContent = (
      <Col className="no_results_found">
        {/* <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row> */}
        <Row className="sub_head m-0"><div><Trans>Loading...</Trans></div></Row>
      </Col>
    );
    if (this.props.jobLoading) {
      return loadingContent;
    } else if (
      (this.props.jobLoaded &&
      companyOpenings
      && companyOpenings.response &&
      companyOpenings.response.length <= 0) ||
      !company.isUserAdded
    ) {
      return NoResultsFound;
    }
    return loadingContent;
  }

  render() {
    const { companyOpenings, company, showFilters, companyOpeningFilterObj } = this.props;
    const { searchStrVal, initialValues } = this.state;
    return (
      <div className={styles.viewAllOpenings}>
        <Row className="m-0 p-b-15">
          <div>
            {
              company.isUserAdded &&
              <Col lg={2} md={2} sm={4} xs={6} className={styles.filter_bg}>
                <div
                  className={styles.openings_filter}
                  onClick={() => { this.props.changeFilterView(); }}
                  role="presentation"
                >
                  <i className="fa fa-filter" />
                  <p>Filter</p>
                </div>
                {this.displayFiltersCount()}
              </Col>
            }
            {(companyOpenings && Number(companyOpenings.totalCount) > 0) || searchStrVal ?
              <div>
                <Col lg={2} md={2} sm={4} xs={6} className={`${styles.total_count} p-t-10`}>
                  <div>
                    <span className="p-l-5 p-r-10">
                      {`${companyOpenings.totalCount} `}
                      { Number(companyOpenings.totalCount) === 1 ?
                        <Trans>OPENING</Trans> : <Trans>OPENINGS</Trans>
                      }
                    </span>
                    <NewPermissible operation={{ operation: 'JOB_OPENING_SEARCH', model: 'jobOpening' }}>
                      <span className="m-l-10">|</span>
                    </NewPermissible>
                  </div>
                </Col>
                <Col lg={5} md={8} sm={5} xs={6} className="p-l-0">
                  <div className={styles.companySearchBox}>
                    <NewPermissible operation={{ operation: 'JOB_OPENING_SEARCH', model: 'jobOpening' }}>
                      <SearchBar
                        name="searchCompany"
                        reset={this.resetSearch}
                        handleOnChange={evt => { this.setSearchTerm(evt); }}
                        handleOnKeyUp={() => {}}
                        inpValue={searchStrVal}
                        placeholder="SEARCH_BY_TITLE_OR_DESCRIPTION"
                      />
                    </NewPermissible>
                  </div>
                </Col>
              </div> :
              ''
            }
            {
              showFilters &&
              <Col
                lg={8}
                md={8}
                xs={8}
                className={`${styles.openings_filter_section} ${styles.opening} p-l-0 p-r-0`}
              >
                <CompanyOpeningsFilter
                  loadOpeningsForCompanyByFilter={this.loadOpeningsForCompanyByFilter}
                  changeFilterView={() => this.props.changeFilterView()}
                  emptyCompanyOpeningFilters={() => this.props.emptyCompanyOpeningFilters()}
                  companyOpeningFilterObj={companyOpeningFilterObj}
                />
              </Col>
            }
          </div>
          {
            // company && company.id && company.contacts.length > 0 ?
            <Col lg={3} md={2} sm={4} xs={12} className={styles.btn_section}>
              <NewPermissible operation={{ operation: 'CREATE_JOBOPENING', model: 'jobOpening' }}>
                {
                  this.props.company.isActive &&
                  <button
                    className={`${styles.add_edit_btns} button-primary`}
                    onClick={evt => this.changeOpeningModalView(evt)}
                    disabled={!(this.props.company && this.props.company.contacts &&
                      this.props.company.contacts.length > 0)}
                    title={(this.props.company && this.props.company.contacts && this.props.company.contacts.length > 0)
                      ? '' : i18n.t('tooltipMessage.ADD_CONTACT_TO_ADD_OPENING')}
                  >
                    <span className={styles.btn_text}><Trans>CREATE_JOB_OPENING</Trans></span>
                  </button>
                }
              </NewPermissible>
            </Col>
          }
        </Row>
        <Scrollbars
          universal
          autoHeight
          autoHeightMin={'600px'}
          autoHeightMax={'600px'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          {
            companyOpenings && companyOpenings.response && companyOpenings.response.length > 0 ?
              companyOpenings.response.map(opening => (
                <Col
                  key={`opening_${opening.id}`}
                  lg={6}
                  md={6}
                  sm={12}
                  xs={12}
                  className="p-b-30 cursor-pointer"
                  onClick={event => { this.viewOpening(opening.id, event); this.setCompanyOpeningFilters(); }}
                >
                  <Col sm={12} className={`${styles.opening}`}>
                    <Col sm={12} className={styles.content}>
                      <Col sm={12} xs={12} className={`${styles.status_div} p-0 m-t-5`}>
                        <div className={`${styles.status} left
                          ${styles[(opening.status || '').toLowerCase()]}`}
                        >
                          <span>{opening.status}</span>
                        </div>
                        {
                          opening.salesOwners && opening.salesOwners.length > 0 &&
                          <span className={'right'} style={{ display: 'inline-flex' }}>
                            <span style={{ verticalAlign: 'middle', paddingTop: '3px' }}>
                              <Trans>ACCOUNT_OWNERS</Trans>: </span>
                            <span className="p-l-5">{this.renderCircle(opening.salesOwners, true)}</span>
                          </span>
                        }
                      </Col>
                      {/* <Col sm={1} xs={1} className={`p-0 m-t-5 ${styles.dropDownDiv}`}>
                        <DropdownButton
                          id="dropdown-size-small"
                          title={
                            <i id="ellipsisIcon" className="fa fa-ellipsis-v orange" />
                          }
                          className={`p-0 p-l-8 ${styles.cloneDropdown}`}
                          noCaret
                          pullRight
                          bsSize="large"
                        >
                          <MenuItem
                            eventKey="1"
                            id="cloneOption"
                            onSelect={() => this.openCloneViewModal(opening)}
                          >Clone</MenuItem>
                        </DropdownButton>
                      </Col> */}
                      <Col sm={12} className={`${styles.title} ${styles.ellipsis} p-0 m-t-7`}>
                        {formatTitle(opening.jobTitle)}
                      </Col>
                      <Col sm={12} className={`p-0 ${styles.noOfOpenings} ${styles.ellipsis} m-t-5`}>
                        <div>{`${opening.vacancies ? opening.vacancies : '-'} ${i18n.t('VACANCIES')}`}</div>
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
                        company ?
                          <Col
                            sm={12}
                            className={`${styles.company} ${styles.ellipsis}
                              p-0 m-t-5`}
                          >{company.name}</Col>
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
                              <span className={styles.no_recruiters}>No Recruiters Assigned</span>
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
                        {
                          opening.status === 'active' && opening.recruiters.length > 0 ?
                            <NewPermissible operation={{ operation: 'SELECT_CANDIDATE', model: 'jobProfile' }}>
                              <Link
                                className="right"
                                onClick={e => {
                                  e.stopPropagation();
                                  this.setCompanyOpeningFilters();
                                }}
                                to={{ pathname: '/ProfileSearch', query: { jobId: opening.id } }}
                              >
                                {/* <i
                                  title={i18n.t('tooltipMessage.CLICK_HERE_TO_ADD_MORE_PROFILES')}
                                  className={`fa fa-user-plus ${styles.search}`}
                                  id={`search_${opening.id}`}
                                  role="button"
                                  tabIndex="0"
                                /> */}
                                <img
                                  title={i18n.t('tooltipMessage.CLICK_HERE_TO_ADD_MORE_PROFILES')}
                                  src={'/icons/user-plus.svg'}
                                  alt="profile"
                                  id={`search_${opening.id}`}
                                />
                              </Link>
                            </NewPermissible> : null
                        }
                        <NewPermissible operation={{ operation: 'VIEW_ATS_BOARD', model: 'jobProfile' }}>
                          {
                            opening.recruiters.length > 0 && opening.status === 'active' &&
                            <Link
                              className={`right ${styles.bordericon}`}
                              onClick={e => { e.stopPropagation(); this.setCompanyOpeningFilters(); }}
                              to={{ pathname: '/ATSBoard', query: { jobId: opening.id } }}
                            >
                              {/* <i
                                title={i18n.t('tooltipMessage.CLICK_HERE_TO_VIEW_ATS_BOARD')}
                                className={`fa fa-th ${styles.edit}`}
                                role="button"
                                tabIndex="0"
                              /> */}
                              <img
                                title={i18n.t('tooltipMessage.CLICK_HERE_TO_VIEW_ATS_BOARD')}
                                src={'/icons/ats.svg'}
                                alt="ats"
                              />
                            </Link>
                          }
                        </NewPermissible>
                      </span>
                    </Col>
                  </Col>
                </Col>
              )) : this.renderNoResultsFound()
          }
        </Scrollbars>
        {
          this.state.openOpeningModal &&
            <EditOpening
              form="EditOpening"
              enableReinitialize
              companyOpeningFilterObj={companyOpeningFilterObj}
              loadOpeningsForCompanyByFilter={this.loadOpeningsForCompanyByFilter}
              saveFromCompany
              initialValues={initialValues}
              validate={formValidation}
              closeModal={this.closeModal}
            />
        }
      </div>
    );
  }
}
