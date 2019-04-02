import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, propTypes, change, touch } from 'redux-form';
import Moment from 'moment';
import { Col, Tab, Tabs, Button, DropdownButton, MenuItem, Row } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { push as pushState } from 'react-router-redux';
import { Trans } from 'react-i18next';
import lodash from 'lodash';
import { toastr } from 'react-redux-toastr';
import PropTypes from 'prop-types';
import styles from './ProfileSearch.scss';
// import FilterBox from '../../components/FormComponents/FilterBox';
import { saveEditedOpening } from '../../redux/modules/openings';
import { saveEditedSearch, loadSavedSearch, deleteSavedSearch } from '../../redux/modules/profile-search';
import ProfileSearchFilter from '../../components/Filters/ProfileSearchFilter';
import SearchBar from '../../components/FormComponents/SearchBar';
import { getOpeningFormConfig } from '../../formConfig/LoadSearch';
// import Loader from '../../components/Loader';
import i18n from '../../i18n';
// import NewPermissible from '../../components/Permissible/NewPermissible';
import toastrErrorHandling from '../toastrErrorHandling';
import ProfileFilterValidation from '../../formConfig/ProfileFilterValidation';
import Loader from '../../components/Loader';
import { trimTrailingSpace } from '../../utils/validation';
import NewPermissible from '../../components/Permissible/NewPermissible';

let timeoutId = 0;
@reduxForm({
  form: 'ProfileFilter',
  enableReinitialize: true,
  validate: ProfileFilterValidation
})
@connect((state, props) => ({
  online: state.online,
  values: getFormValues(props.form)(state) || {},
  selectedOpening: state.openings.selectedOpening,
  selectedSearch: state.profileSearch.selectedSearch,
  openingUpdated: state.openings.openingUpdated,
  searchList: state.profileSearch.searchList || {},
  searchLoading: state.profileSearch.searchLoading
}), { saveEditedOpening, saveEditedSearch, change, loadSavedSearch, pushState, deleteSavedSearch, touch })
export default class ProfileFilter extends Component {
  static propTypes = {
    ...propTypes,
    saveEditedOpening: PropTypes.func.isRequired,
    saveEditedSearch: PropTypes.func.isRequired,
    touch: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    selectedSearch: PropTypes.object,
    selectedOpening: PropTypes.object,
    filterValues: PropTypes.object,
    openingUpdated: PropTypes.bool,
    isBestMatch: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    allMatches: PropTypes.bool.isRequired,
    loadSavedSearch: PropTypes.func.isRequired,
    searchLoading: PropTypes.bool,
    pushState: PropTypes.func.isRequired,
    deleteSavedSearch: PropTypes.func.isRequired
  }

  static defaultProps = {
    selectedOpening: null,
    openingUpdated: null,
    selectedSearch: null,
    filterValues: null,
    searchLoading: false
  }

  constructor(props) {
    super(props);
    this.state = {
      location: null,
      selectedOption: null,
      isReset: false,
      searchList: [],
      totalCount: 0,
      searchVal: '',
      limit: 10,
      page: -10,
      show: false,
      selectedSearchId: -1,
      showActions: false
    };
  }

  componentWillMount() {
    const isAllMatchesPermitted = NewPermissible.isPermitted({
      operation: 'PROFILE_SEARCH_ALL_MATCHES',
      model: 'profileSearch'
    });
    const isBestMatchesPermitted = NewPermissible.isPermitted({
      operation: 'PROFILE_SEARCH_BEST_MATCHES',
      model: 'profileSearch'
    });
    this.setState({
      activeKey: 2,
      searchList: this.props.searchList,
      isAllMatchesPermitted,
      isBestMatchesPermitted
    });
  }

  componentDidMount() {
    this.props.touch('ProfileFilter', 'noticePeriod');
    this.props.touch('ProfileFilter', 'noticePeriodType');
  }

  componentWillReceiveProps(props) {
    const { values, loadFilterSearch, activeFilterTab } = props;
    if (values.companies) {
      this.setState({ selectedOption: values.companies });
    } else {
      this.setState({ selectedOption: '' });
    }
    if (loadFilterSearch) {
      this.setState({
        searchVal: '',
        searchList: [],
        page: -10 }, () => {
        this.intialize();
      });
      this.props.loadFilterSearchCb();
    }
    if (activeFilterTab) {
      this.setState({ activeKey: 2 }, () => { this.props.activeFilterTabCb(); });
    }
  }

  setSearchTerm = evt => {
    const searchVal = trimTrailingSpace(evt.target.value);
    if (this.state.searchVal !== searchVal) {
      this.setState({
        searchVal,
        searchList: [],
        page: -10
      }, () => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          this.setState({
            isFilterApplied: true
          });
          this.intialize();
        }, 500);
      });
    }
  }


  getMatchPermission = search => {
    const { isAllMatchesPermitted, isBestMatchesPermitted } = this.state;
    if ((isAllMatchesPermitted && search.allMatches) || (isBestMatchesPermitted && !search.allMatches)) {
      return true;
    }
  }

  saveOpening = evt => {
    evt.preventDefault();
    const { values, selectedOpening } = this.props;
    if (this.props.values.allMatches) {
      this.handleEditOpening(evt, values, selectedOpening);
    } else if (values && values.companies) {
      if (values.companies.isUserAdded) {
        this.handleEditOpening(evt, values, selectedOpening);
      } else {
        toastr.info('', i18n.t('infoMessage.SELECTED_COMPANY_HAS_NOT_BEEN_ADDED_IN_YOUR_SYSTEM'));
      }
    } else {
      toastr.info('', i18n.t('infoMessage.PLEASE_SELECT_A_COMPANY_TO_GET_BEST_MATCHES_RESULT'));
    }
  }

  handleEditOpening = (evt, values, selectedOpening) => {
    evt.preventDefault();
    if (selectedOpening) {
      this.props.handleSubmit(evt);
      this.props.saveEditedOpening({
        ...selectedOpening,
        filters: values
      }).then(() => toastr.success(i18n.t('successMessage.UPDATED'),
        i18n.t('successMessage.OPENING_HAS_BEEN_UPDATED_SUCCESSFULLY')));
    } else {
      this.props.saveOpening(values);
    }
  }

  handleSelect = key => {
    this.setState({
      activeKey: key
    });
    // const { values } = this.props;
    switch (key) {
      case 1:
        this.setState({
          searchVal: '',
          searchList: [],
          page: -10
        }, () => {
          this.intialize('');
        });
        break;
      default:
        break;
    }
  }

  loadSearch = evt => {
    evt.preventDefault();
    const { values } = this.props;
    this.props.loadSearch(values);
  }

  saveSearch = evt => {
    evt.preventDefault();
    const { values, selectedSearch } = this.props;
    if (!values.companies && this.props.isBestMatch) {
      toastr.info('', i18n.t('infoMessage.PLEASE_SELECT_A_COMPANY_TO_GET_BEST_MATCHES_RESULT'));
    } else if (selectedSearch) {
      this.props.handleSubmit(evt);
      const search = {
        userId: values.id,
        name: values.searchTitle,
        description: values.description,
      };
      this.props.saveEditedSearch({
        ...search,
        filters: values
      }).then(() => toastr.success(i18n.t('successMessage.UPDATED'),
        i18n.t('successMessage.THE_FILTER_SEARCH_HAS_BEEN_UPDATED_SUCCESSFULLY')));
    } else {
      this.props.saveSearch(values);
    }
  }

  isFormFieldsEmpty = values => {
    const { isBestMatch } = this.props;
    let skillValEmpty = false;
    let locationValEmpty = false;
    let keyValEmpty = false;
    let experienceValEmpty = false;
    let positionValEmpty = false;
    let companyValEmpty = false;
    let sourceValEmpty = false;
    let languageValEmpty = false;
    let isAllEmpty = false;

    if (!values.skills || (values.skills && values.skills.length === 0)) {
      skillValEmpty = true;
    }
    if (!values.location || (values.location && values.location.length === 0)) {
      locationValEmpty = true;
    }
    if (!values.keywords) {
      keyValEmpty = true;
    }
    if (!values.experience || (values.experience && values.experience.length === 0)) {
      experienceValEmpty = true;
    }
    if (!values.positions || (values.positions && values.positions.length === 0)) {
      positionValEmpty = true;
    }
    if (isBestMatch) {
      if ((values.companies === undefined || values.companies === '') && isBestMatch) {
        companyValEmpty = true;
      }
    } else if ((values.companies === undefined) || (values.companies === '') || isBestMatch) {
      companyValEmpty = true;
    }
    if (!values.source || (values.source && values.source.length === 0)) {
      sourceValEmpty = true;
    }
    if (!values.languages || (values.languages && values.languages.length === 0)) {
      languageValEmpty = true;
    }

    if ((skillValEmpty &&
      locationValEmpty &&
      keyValEmpty &&
      experienceValEmpty &&
      companyValEmpty &&
      positionValEmpty &&
      sourceValEmpty &&
      languageValEmpty)) {
      isAllEmpty = true;
    }
    return isAllEmpty;
  }

  handleCompanyValueChange = selectedOption => {
    if (selectedOption && selectedOption.id) {
      this.setState({ selectedOption }, () => {
        this.props.change(this.props.form, 'companies', selectedOption);
      });
    } else {
      this.setState({ selectedOption: '' });
      this.props.change(this.props.form, 'companies', '');
    }
  }

  handleCompanyKeyDown = () => {
    this.setState({ selectedOption: '' });
    this.props.change(this.props.form, 'companies', '');
  }

  intialize = () => {
    const { alreadyOnCall } = this.state;
    if (!alreadyOnCall) {
      this.setState({
        page: this.state.page + 10,
        alreadyOnCall: true
      }, () => {
        this.props.loadSavedSearch({
          skip: this.state.page,
          limit: this.state.limit,
          searchTerm: encodeURIComponent(this.state.searchVal),
          order: 'modifiedAt DESC'
        }).then(savedSearchList => {
          this.setState({
            alreadyOnCall: false,
            totalCount: savedSearchList.count,
            searchList: [...this.state.searchList, ...savedSearchList.data],
          });
        }, searchResponse => {
          this.setState({
            alreadyOnCall: false
          });
          if (searchResponse.error.statusCode === 400) {
            toastrErrorHandling(searchResponse.error, i18n.t('errorMessage.LOAD_SEARCH'),
              searchResponse.error.message, { removeOnHover: true });
          } else {
            toastrErrorHandling(searchResponse.error, i18n.t('errorMessage.LOAD_SEARCH'),
              i18n.t('errorMessage.COULD_NOT_LOAD_PROFILE_SEARCHES'),
              { removeOnHover: true });
          }
        });
      });
    }
  }

  handleScrollFrame = values => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const { nomoreData } = this.state;
    const pad = 5; // 100px of the bottom
    const toScroll = ((scrollTop + pad) / (scrollHeight - clientHeight));
    if (toScroll > 1 && !nomoreData && scrollTop !== 0) {
      this.searchScroll();
    }
  }

  searchScroll = () => {
    const { searchList, totalCount } = this.state;
    if (searchList.length < totalCount || totalCount === 0) {
      this.intialize();
    }
  }

  resetSearch = () => {
    this.setState({
      searchVal: '',
      searchList: [],
      page: -10
    }, () => {
      this.intialize();
    });
  }

  selectSearch = searchId => {
    this.setState({
      selectedSearchId: searchId
    }, () => {
      this.loadProfileSearch();
    });
  }

  loadSelectedSearch = () => {
    const { selectedSearchId, searchList } = this.state;
    searchList.forEach(value => {
      if (value.id && value.id === selectedSearchId) {
        this.setState({
          selectedSavedSearch: value
        });
      }
    });
  }

  redirectToProfileSearch = searchId => {
    sessionStorage.removeItem('profilefilters');
    this.props.pushState({ pathname: '/ProfileSearch', query: { searchId } });
  }

  toggleActions = () => {
    this.setState({ showActions: !this.state.showActions });
  }

  deleteSearch = searchId => {
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_SAVED_SEARCH'), {
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO'),
      onOk: () => {
        this.props.deleteSavedSearch(searchId).then(() => {
          toastr.success(i18n.t('successMessage.DELETED'),
            i18n.t('successMessage.THE_FILTER_SEARCH_HAS_BEEN_DELETED_SUCCESSFULLY'));
          this.setState({
            searchList: [],
            selectedSearchId: -1,
            selectedSavedSearch: null,
            page: -10
          }, () => {
            this.intialize();
          });
        });
      }
    });
  }

  loadProfileSearch = () => {
    const { selectedSearchId } = this.state;
    this.redirectToProfileSearch(selectedSearchId);
  }


  resetFilter = () => {
    this.props.resetFilterValues();
    this.props.touch('ProfileFilter', 'noticePeriod');
    this.props.touch('ProfileFilter', 'noticePeriodType');
  }

  renderNoResultsFound = () => {
    const { searchList } = this.state;
    const NoResultsFound = (
      <Col className={styles.no_results_found} style={{ marginTop: '50%' }}>
        <Row className="text-center m-0"><img src="/empty-profile.svg" alt="Empty Profile" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_RESULTS_FOUND</Trans></div></Row>
      </Col>
    );
    const LoadingContent = (
      <Col className={styles.no_results_found} style={{ marginTop: '50%' }}>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>Loading...</Trans></div></Row>
      </Col>
    );
    if (this.props.searchLoading) {
      return LoadingContent;
    } else if ((!searchList || searchList.length === 0) && !this.props.searchLoading) {
      return NoResultsFound;
    }
  }


  render() {
    const { values, filterValues, form, submitting, loading, invalid, panelHeight, jobId } = this.props;
    const formFieldsEmpty = this.isFormFieldsEmpty(values);
    const filterConfig = getOpeningFormConfig(this);
    const { selectedOption, searchList, searchVal, activeKey } = this.state;
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={`p-0 company_container ${styles.containerBorder}`}>
        <Tabs
          id="profile_filters"
          activeKey={this.state.activeKey}
          onSelect={this.handleSelect}
          className={`${styles.filter_tab} ${styles.profile_filters} shadow_one`}
        >
          <Tab
            eventKey={1}
            title={i18n.t('SAVED_FILTERS')}
          >
            {activeKey === 1 &&
            <Col sm={12} lg={12} className={`p-0 ${styles.whiteBackground}`}>
              <Scrollbars
                universal
                autoHide
                autoHeight
                onScrollFrame={lodash.throttle(this.handleScrollFrame, 500)}
                autoHeightMin={`calc(100vh - 100px - ${panelHeight}px)`}
                autoHeightMax={`calc(100vh - 100px - ${panelHeight}px)`}
                renderThumbHorizontal={props => <div {...props} className="hide" />}
                renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
              >
                {
                  <div className={styles.searchBar}>
                    <SearchBar
                      {...filterConfig.searchInput}
                      reset={e => this.resetSearch(e)}
                      handleOnChange={e => this.setSearchTerm(e)}
                      handleOnKeyUp={() => {}}
                      inpValue={searchVal}
                    />
                  </div>
                }
                {this.renderNoResultsFound()}
                <Loader loading={this.props.searchLoading} />
                <ul className={styles.search_list}>
                  {
                    searchList && searchList.length ?
                      searchList.map(search => {
                        if (this.getMatchPermission(search)) {
                          return (<li
                            key={search.id}
                            className="p-0"
                          >
                            <Col sm={12} lg={12} className={`${styles.filterContainer} p-0`}>
                              <div className={styles.filterOverlay} />
                              <Col sm={12} lg={12} className={`${styles.overlay} p-0`}>
                                <div className={`profile-filter ${styles.showMenu}`}>
                                  <DropdownButton
                                    key={1}
                                    title={<i className="fa fa-ellipsis-h" />}
                                    className={`${styles.filterButton} ${styles.action_icon}`}
                                  >
                                    {!search.jobId && <MenuItem
                                      eventKey="1"
                                      onClick={() => this.deleteSearch(search.id)}
                                    >
                                      <Trans>DELETE</Trans>
                                    </MenuItem>}
                                    <MenuItem
                                      eventKey="2"
                                      onClick={() =>
                                        this.props.openRenameModal(search.id, search.name)}
                                    >
                                      <Trans>RENAME</Trans></MenuItem>
                                  </DropdownButton>
                                </div>
                                <div className={styles.applyFilter}>
                                  <Button
                                    className={`${styles.apply_filter_btn} btn btn-border`}
                                    aria-hidden="true"
                                    onClick={() => this.selectSearch(search.id)}
                                  >
                                    <Trans>APPLY_FILTER</Trans>
                                  </Button>
                                </div>
                                <div className={styles.filterCreated}>
                                  <span className={styles.text_block}><Trans>CREATED_BY</Trans></span>
                                  <span className={styles.text_block}>{search.user.firstName}</span>
                                  <span className={styles.text_block}>{Moment(search.createdAt).fromNow()}</span>
                                </div>
                              </Col>
                              <div className={styles.searchName}>{search.name}</div>
                            </Col>
                          </li>);
                        }
                        return null;
                      }
                      ) : ''
                  }
                </ul>
              </Scrollbars>
            </Col>
            }
          </Tab>
          <Tab eventKey={2} title={i18n.t('Filters')}>
            {this.state.activeKey === 2 &&
            <Col lg={12} md={12} sm={12} xs={12} className={`${styles.filter_container} p-0`}>
              <form
                className={styles.profile_filter}
                onSubmit={this.props.handleSubmit}
                autoComplete="off"
                spellCheck="false"
              >
                <div className={styles.fields_body}>
                  <Scrollbars
                    universal
                    autoHeight
                    autoHeightMin={`calc(100vh - 175px - ${panelHeight}px)`}
                    autoHeightMax={`calc(100vh - 175px - ${panelHeight}px)`}
                    renderThumbHorizontal={props => <div {...props} className="hide" />}
                    renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
                  >
                    {
                      filterValues ?
                        <ProfileSearchFilter
                          handleCompanyValueChange={this.handleCompanyValueChange}
                          handleCompanyKeyDown={this.handleCompanyKeyDown}
                          initialValues={filterValues}
                          isBestMatch={this.props.isBestMatch}
                          selectedOption={selectedOption}
                          form={form}
                          allMatches={this.props.allMatches}
                          values={values}
                          isReset={this.props.isReset}
                          resetRatingStars={this.props.resetRatingStars}
                          isCompanyDisable={this.props.isCompanyDisable}
                          resetCheckBox={this.props.resetCheckBox}
                        />
                        :
                        <ProfileSearchFilter
                          handleCompanyValueChange={this.handleCompanyValueChange}
                          handleCompanyKeyDown={this.handleCompanyKeyDown}
                          initialValues={values}
                          isBestMatch={this.props.isBestMatch}
                          allMatches={this.props.allMatches}
                          selectedOption={selectedOption}
                          form={form}
                          isReset={this.props.isReset}
                          resetRatingStars={this.props.resetRatingStars}
                          isCompanyDisable={this.props.isCompanyDisable}
                          resetCheckBox={this.props.resetCheckBox}
                        />
                    }
                  </Scrollbars>
                  <div>
                    <Col sm={12} lg={12} xs={6} className={`${styles.actions} p-0`}>
                      <Col sm={12} lg={12} xs={6} className="p-0">
                        {!jobId ? <Col lg={6} sm={12} className="p-5">
                          <button
                            type="button"
                            style={{ width: '100%' }}
                            className={`${styles.filter_btns} button-secondary-hover`}
                            aria-hidden="true"
                            onClick={this.resetFilter}
                          ><Trans>CLEAR_ALL</Trans></button>
                        </Col> : ''}
                        <Col lg={!jobId ? 6 : 12} sm={12} className="p-5">
                          <button
                            id="searchBtn"
                            type="submit"
                            style={{ width: '100%' }}
                            className={`${styles.filter_btns} button-primary`}
                            disabled={submitting || loading || formFieldsEmpty || invalid}
                          >
                            {loading &&
                              <i className="fa fa-spinner fa-spin p-l-r-7" aria-hidden="true" />
                            }
                            <Trans>SEARCH</Trans>
                          </button>
                        </Col>
                      </Col>
                    </Col>
                  </div>
                </div>
              </form>
            </Col>
            }
          </Tab>
        </Tabs>
      </Col>
    );
  }
}
