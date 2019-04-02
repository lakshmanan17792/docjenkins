import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Pager, Col, Row, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';
import { Trans } from 'react-i18next';
import { Profiles as ProfileList } from 'components';
import PropTypes from 'prop-types';
import styles from './ProfileSearch.scss';
import Constants from '../../helpers/Constants';
import Loader from '../../components/Loader';
import { getSearchProfileConfig } from '../../formConfig/SearchProfile';
import SearchBar from '../../components/FormComponents/SearchBar';
import { load as loadProfiles, loadProfileByResumeId } from '../../redux/modules/profile-search';
import NewPermissible, { noOfPermissions } from '../../components/Permissible/NewPermissible';
import { restrictDecimalNumber } from '../../utils/validation';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import FilterPanel from '../../components/FilterPanel/FilterPanel';

@reduxForm({
  form: 'searchProfile'
})
@connect(state => ({
  profiles: state.profileSearch.list,
  values: getFormValues('ProfileFilter')(state) || {},
  totalCount: state.profileSearch.totalCount
}),
{
  loadProfileByResumeId,
  loadProfiles,
})
export default class Profiles extends Component {
  static propTypes = {
    profiles: PropTypes.arrayOf(PropTypes.object).isRequired,
    activePage: PropTypes.number.isRequired,
    loadProfileByResumeId: PropTypes.func.isRequired,
    loadProfiles: PropTypes.func.isRequired,
    totalCount: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]).isRequired,
    handlePagination: PropTypes.func.isRequired,
    clearSelectedProfiles: PropTypes.func.isRequired,
    loadAllMatches: PropTypes.func.isRequired,
    isBestMatch: PropTypes.bool.isRequired,
    loadBestMatches: PropTypes.func.isRequired,
    afterSelectOptions: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    jobId: PropTypes.string.isRequired,
    selectedProfiles: PropTypes.array,
    selectProfile: PropTypes.func.isRequired,
    isSelectAll: PropTypes.bool,
    isClearAll: PropTypes.bool,
    hideFilterPanel: PropTypes.bool,
    clearSelections: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    allMatches: PropTypes.bool.isRequired,
    filters: PropTypes.object,
    getResultById: PropTypes.func.isRequired,
    resetSearch: PropTypes.func.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    searchVal: PropTypes.string,
    user: PropTypes.object,
    isFilterApplied: PropTypes.bool,
    filterTitle: PropTypes.string.isRequired,
    isFilterAppliedCb: PropTypes.func.isRequired,
    openFilter: PropTypes.bool.isRequired,
    panelHeight: PropTypes.number.isRequired,
    saveSearch: PropTypes.func.isRequired,
  }

  static defaultProps = {
    profiles: [],
    totalCount: '',
    selectedProfiles: {},
    isClearAll: false,
    isSelectAll: false,
    filters: {},
    searchVal: '',
    user: {},
    hideFilterPanel: false,
    isFilterApplied: false
  }

  constructor(props) {
    super(props);
    this.state = {
      profiles: this.props.profiles || [],
      activePage: this.props.activePage,
      activeMatchFilter: 'ALL_MATCHES',
      activeKey: '1',
      searchStrVal: '',
      isSearchDisplay: false,
      loadDefault: true,
      gotoPageStr: ''
    };
  }

  componentWillMount() {
    const profileFilters = JSON.parse(sessionStorage.getItem('profilefilters'));
    if (profileFilters && profileFilters.searchResumeId) {
      this.setState({ searchStrVal: profileFilters.searchResumeId, loadDefault: false });
      sessionStorage.setItem('profilefilters', JSON.stringify({ ...profileFilters }));
    }
    const permissions = [
      { operation: 'PROFILE_SEARCH_ALL_MATCHES', model: 'profileSearch' },
      { operation: 'PROFILE_SEARCH_BEST_MATCHES', model: 'profileSearch' }
    ];
    const matchPermissions = noOfPermissions(permissions);
    const isAllMatchesPermitted = NewPermissible.isPermitted({
      operation: 'PROFILE_SEARCH_ALL_MATCHES',
      model: 'profileSearch'
    });
    const isBestMatchesPermitted = NewPermissible.isPermitted({
      operation: 'PROFILE_SEARCH_BEST_MATCHES',
      model: 'profileSearch'
    });
    let activeKey = '1';
    if (matchPermissions && matchPermissions.length <= 1 && isBestMatchesPermitted) {
      activeKey = '2';
    }
    this.setState({
      matchPermissions,
      isAllMatchesPermitted,
      isBestMatchesPermitted,
      activeKey
    });
  }

  componentWillReceiveProps(nextProps) {
    const { profiles, isSelectAll, isClearAll, isFilterApplied, isFilterAppliedCb } = nextProps;
    const afterSelection = isSelectAll || isClearAll;
    let errorCount = 0;
    let validProfiles = [];
    if (isSelectAll === true && isSelectAll !== this.props.isSelectAll) {
      validProfiles = profiles.filter(profile => profile.contacts.emails.length > 0);
      profiles.map(profile => {
        if (profile.contacts.emails.length > 0) {
          profile.isChecked = true;
        } else {
          errorCount += 1;
        }
        return '';
      });
      this.setState({
        profiles,
        activePage: nextProps.activePage
      }, () => {
        if (errorCount > 0) {
          toastrErrorHandling({}, '',
            `${errorCount} ${i18n.t('errorMessage.PROFILE_WERE_NOT_ADDED_SINCE_THEY_HAVE_NO_EMAILS')}`
          );
        }
        if (afterSelection) {
          nextProps.afterSelectOptions(isSelectAll ? validProfiles : []);
        }
      });
      return;
    } else if (isClearAll) {
      profiles.map(profile => {
        profile.isChecked = false;
        return '';
      });
      this.setState({
        profiles,
        activePage: nextProps.activePage
      }, () => {
        if (afterSelection) {
          nextProps.afterSelectOptions(isSelectAll ? validProfiles : []);
        }
      });
      return;
    }
    if (!this.props.allMatches) {
      this.setState({ activeKey: '2', activeMatchFilter: 'BEST_MATCHES', searchStrVal: '' });
    } else {
      this.setState({ activeKey: '1', activeMatchFilter: 'ALL_MATCHES' });
    }
    if (isFilterApplied) {
      this.scrollToTop();
      isFilterAppliedCb();
    }
    if (!this.props.loading && nextProps.loading) {
      this.setState({
        gotoPageStr: ''
      });
    }
    this.setState({
      profiles,
      activePage: nextProps.activePage
    }, () => {
      if (afterSelection) {
        nextProps.afterSelectOptions(isSelectAll ? validProfiles : []);
      }
    });
  }

  showSearchBar = () => {
    this.setState({
      isSearchDisplay: !this.state.isSearchDisplay,
    });
  }

  handleMatchesChange = (key, event) => {
    this.setState({
      activeMatchFilter: event.target.innerText,
      activeKey: key
    });
    this.state.activeKey = key;
  }

  showResults = () => {
    if (this.props.totalCount === 0) {
      this.renderNoResultsFound();
    } else {
      return '';
    }
  }

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

  changeGotoPageStr = event => {
    this.setState({ gotoPageStr: event.target.value });
  }

  handlePagination = (type, maxPage) => {
    this.props.handlePagination(type, maxPage);
    this.scrollbar.scrollTop(0);
  }

  handleScrollFrame = values => {
    if (values.scrollTop > 4 && this.props.openFilter) {
      this.setState({ hideFilterPanel: true });
    }
    // else {
    //   this.setState({ hideFilterPanel: false });
    // }
  }

  scrollToTop = () => {
    this.scrollbar.scrollTop(0);
  }

  showAllFilters = () => {
    this.scrollbar.scrollTop(0);
    this.setState({ hideFilterPanel: false });
  }

  renderHideFilterPanel = () => (
    <Col
      lg={12}
      className={`f-14 p-0 ${styles.hideFilterPanel}`}
    >
      <div className={styles.showFilters}>
        <span role="presentation" style={{ cursor: 'pointer' }} onClick={this.showAllFilters}>
          {i18n.t('SHOW_FILTERS')}
        </span>
      </div>
    </Col>
  )

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/empty-profile.svg" alt="Empty Profile" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_PROFILES_FOUND</Trans></div></Row>
        <Row className={`${styles.empty_message} m-0`}>
          <div><Trans>MODIFY_SEARCH_TO_GET_RESULT</Trans></div>
        </Row>
      </Col>
    );
    const LoadingContent = (
      <Col className={styles.no_results_found}>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>Loading</Trans></div></Row>
      </Col>
    );
    if (this.props.loading) {
      return LoadingContent;
    }
    return NoResultsFound;
  }

  render() {
    const {
      totalCount,
      activePage,
      jobId,
      loadAllMatches,
      loadBestMatches,
      isBestMatch,
      selectProfile,
      selectedProfiles,
      isClearAll,
      isSelectAll,
      allMatches,
      filters,
      searchVal,
      values,
      openFilter,
      filterTitle,
      panelHeight
    } = this.props;
    const { profiles, matchPermissions, gotoPageStr, isAllMatchesPermitted, isBestMatchesPermitted,
      hideFilterPanel } = this.state;
    // updateProfiles
    const maxPage = Math.ceil(totalCount / Constants.RECORDS_PER_PAGE);
    const searchProfileConfig = getSearchProfileConfig(this);
    return (
      <Scrollbars
        ref={c => { this.scrollbar = c; }}
        universal
        autoHide
        autoHeight
        autoHeightMin={`calc(100vh - 65px - ${panelHeight}px)`}
        autoHeightMax={`calc(100vh - 65px - ${panelHeight}px)`}
        renderThumbHorizontal={props => <div {...props} className="hide" />}
        onScrollFrame={this.handleScrollFrame}
        renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
      >
        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className={styles.view_all_profiles}
          style={openFilter && hideFilterPanel ? { position: 'relative' } : {}}
        >
          { openFilter && <FilterPanel
            filters={values}
            saveSearch={this.props.saveSearch}
            hideFilterPanel={hideFilterPanel}
            filterTitle={filterTitle}
          /> }
          {openFilter && hideFilterPanel && this.renderHideFilterPanel()}
          <Helmet title={i18n.t('PROFILE_SEARCH')} />
          <Col
            xs={12}
            sm={12}
            md={12}
            lg={12}
            className={openFilter && hideFilterPanel ? `${styles.showPanel} ${styles.total_count_row} m-0 p-l-0`
              : `m-0 ${styles.total_count_row} ${styles.total_row_show} p-l-0`}
          >
            <Col xs={12} lg={5} md={7} sm={12} className={styles.count_and_search}>
              <div className={`text-left ${styles.total_count}`}>
                <span className="m-r-5">{totalCount ? totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : 0}</span>
                <span className="p-r-15"> {totalCount < 2 ? <Trans>PROFILE</Trans>
                  : <Trans>PROFILES</Trans>}
                </span>
                {this.props.allMatches &&
                <span className={`${styles.verticalLine}`}>|</span>}
              </div>
              {this.props.allMatches &&
              <div className={styles.searchBar}>
                <SearchBar
                  {...searchProfileConfig.fields[0]}
                  reset={e => this.props.resetSearch(e)}
                  handleOnChange={e => this.props.setSearchTerm(e)}
                  handleOnKeyUp={e => this.props.getResultById(e)}
                  inpValue={searchVal}
                />
              </div>
              }
            </Col>
            <Col
              xs={12}
              sm={12}
              md={5}
              lg={7}
              className={
                maxPage && maxPage > 1 ?
                  `${styles.search_actions} p-0` :
                  `${styles.pager_container} p-0`
              }
            >
              <Row style={{ width: '100%' }} className="m-0">
                <Col
                  lg={4}
                  md={12}
                  sm={6}
                  lgOffset={maxPage && maxPage > 1 ? 0 : 6}
                  mdOffset={0}
                  smOffset={maxPage && maxPage > 1 ? 0 : 6}
                  className="m-t-10"
                >
                  <ButtonToolbar className={`${styles.btn_dropdown} m-r-10`}>
                    {matchPermissions && matchPermissions.length > 1 &&
                    <DropdownButton
                      bsSize="small"
                      pullRight
                      title={<Trans>{this.state.activeMatchFilter}</Trans>}
                      id="dropdown-size-medium"
                      className="customBtnDropDown"
                      onSelect={this.handleMatchesChange}
                    >
                      {isAllMatchesPermitted && <MenuItem
                        eventKey="1"
                        className={this.state.activeKey === '1' ? styles.menuActive : styles.menuInActive}
                        onClick={loadAllMatches}
                      ><Trans>ALL_MATCHES</Trans>
                      </MenuItem>}
                      {isBestMatchesPermitted && <MenuItem
                        eventKey="2"
                        className={this.state.activeKey === '2' ? styles.menuActive : styles.menuInActive}
                        onClick={loadBestMatches}
                      ><Trans>BEST_MATCHES</Trans>
                      </MenuItem>}
                    </DropdownButton>
                    }
                  </ButtonToolbar>
                </Col>
                {
                  maxPage && maxPage > 1 ?
                    <Col md={7} sm={6} className={styles.pagination_block}>
                      <div className={`${styles.page_goto}`}>
                        <input
                          type="number"
                          id="goToProfile"
                          onKeyDown={e => this.selectPageNumber(e, maxPage)}
                          placeholder={i18n.t('placeholder.GO_TO')}
                          value={gotoPageStr}
                          onChange={this.changeGotoPageStr}
                          onKeyPress={restrictDecimalNumber}
                          min="1"
                        />
                      </div>
                      <Pager className={`${styles.pager} left`}>
                        <Pager.Item
                          className={this.state.activePage <= 1 ? `${styles.disabled} p-r-5 ${styles.page_no_height}`
                            : `${styles.page_no_height} p-r-5`}
                          onClick={() => this.handlePagination('first')}
                        >
                          <span><Trans>FIRST</Trans></span>
                        </Pager.Item>
                        <Pager.Item
                          className={this.state.activePage <= 1 ? `${styles.disabled} ${styles.page_no_height}`
                            : styles.page_no_height}
                          onClick={() => this.handlePagination('previous')}
                        >
                          <span className="fa fa-caret-left" />
                        </Pager.Item>
                        <Pager.Item
                          title={`${i18n.t('tooltipMessage.TOTAL_PAGES')} : ${maxPage}`}
                          className={`${styles.page_no} ${styles.page_no_height} ${styles.page_no_width}`}
                        >
                          {activePage}
                        </Pager.Item>
                        <Pager.Item
                          className={maxPage <= this.state.activePage ? `${styles.disabled} ${styles.page_no_height}`
                            : styles.page_no_height}
                          onClick={() => this.handlePagination('next', maxPage)}
                        >
                          <span className="fa fa-caret-right" />
                        </Pager.Item>
                        <Pager.Item
                          className={maxPage <= this.state.activePage ?
                            `${styles.disabled} p-l-5 ${styles.page_no_height}` :
                            `${styles.page_no_height} p-l-5`}
                          onClick={() => this.handlePagination('last', maxPage)}
                        >
                          <span><Trans>LAST</Trans></span>
                        </Pager.Item>
                      </Pager>
                    </Col>
                    : ''
                }
              </Row>
            </Col>
          </Col>
          <div className={openFilter && hideFilterPanel ? styles.profile_content : ''}>
            {
              profiles && profiles.length ?
                <ProfileList
                  jobId={jobId}
                  isBestMatch={isBestMatch}
                  profiles={profiles}
                  selectProfile={selectProfile}
                  selectedProfiles={selectedProfiles}
                  isClearAll={isClearAll}
                  allMatches={allMatches}
                  isSelectAll={isSelectAll}
                  filters={filters}
                  user={this.props.user}
                />
                : this.renderNoResultsFound()
            }
          </div>
        </Col>
        <Loader loading={this.props.loading} />
      </Scrollbars>
    );
  }
}
