import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Image } from 'react-bootstrap';
import { isPristine, getFormValues, change, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Link, hashHistory } from 'react-router';
import { Trans } from 'react-i18next';
import lodash from 'lodash';
import { push as pushState } from 'react-router-redux';
import ProfileFilter from './ProfileFilter';
import Profiles from './ViewAllProfile';
import {
  load as loadProfiles, openSaveOpeningModal, closeSaveOpeningModal, loadSkills,
  loadPositions, loadCompanies, loadLocations, openSaveSearchModal, loadProfileByResumeId,
  closeSaveSearchModal, openLoadSearchModal, closeLoadSearchModal, loadFilterBySearchId, resetSavedSearch,
  saveEditedSearch, clearAllProfiles, editSavedSearch
} from '../../redux/modules/profile-search';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import {
  loadOpeningById,
  saveEditedOpening,
  loadOpenings,
  clearSelectedOpening
} from '../../redux/modules/openings';
import SaveOpening from '../Openings/StepSaveOpening';
import SaveSearch from './SaveSearch';
import LoadSearch from './LoadSearch';
import { formValidation } from '../../formConfig/SaveOpening';
import { formValidation as searchValidation } from '../../formConfig/SaveSearch';
import JobProfilePanel from '../../components/PageComponents/JobProfilePanel';
// import LoadSearchPanel from '../../components/PageComponents/LoadSearchPanel';
import styles from './ProfileSearch.scss';
import NewPermissible, { noOfPermissions } from '../../components/Permissible/NewPermissible';
import { trimTrailingSpace, formatTitle } from '../../utils/validation';
import i18n from '../../i18n';
// import FilterPanel from '../../components/FilterPanel/FilterPanel.js';

@reduxForm({
  form: 'ProfileFilter',
})
@connect(state => ({
  online: state.online,
  filterFormValues: getFormValues('ProfileFilter')(state),
  isSaveOpeningPristine: isPristine('StepSaveOpening')(state),
  isSaveSearchPristine: isPristine('SaveSearch')(state),
  saveSearchFormData: state.form.SaveSearch,
  openingFormData: state.form.StepSaveOpening,
  loading: state.profileSearch.loading,
  loadingProfiles: state.profileSearch.loadingProfiles,
  jobId: state.routing.locationBeforeTransitions.query.jobId,
  allMatch: state.routing.locationBeforeTransitions.query.allMatches,
  searchId: state.routing.locationBeforeTransitions.query.searchId,
  selectedOpening: state.openings.selectedOpening || {},
  selectedSearch: state.profileSearch.selectedSearch || {},
  openings: state.openings.list,
  user: state.auth.user
}),
{
  loadProfiles,
  loadSkills,
  loadPositions,
  loadCompanies,
  loadLocations,
  openSaveOpeningModal,
  openSaveSearchModal,
  openLoadSearchModal,
  closeSaveOpeningModal,
  closeSaveSearchModal,
  closeLoadSearchModal,
  loadOpeningById,
  loadFilterBySearchId,
  clearSelectedOpening,
  saveEditedOpening,
  loadOpenings,
  resetSavedSearch,
  loadProfileByResumeId,
  pushState,
  change,
  saveEditedSearch,
  clearAllProfiles,
  editSavedSearch
})
export default class ProfileSearch extends Component {
  static propTypes = {
    loadProfiles: PropTypes.func.isRequired,
    searchId: PropTypes.any,
    jobId: PropTypes.any,
    isSaveOpeningPristine: PropTypes.bool,
    isSaveSearchPristine: PropTypes.bool,
    openingFormData: PropTypes.object,
    saveSearchFormData: PropTypes.object,
    route: PropTypes.object,
    router: PropTypes.object,
    selectedOpening: PropTypes.object.isRequired,
    selectedSearch: PropTypes.object.isRequired,
    change: PropTypes.func.isRequired,
    resetSavedSearch: PropTypes.func.isRequired,
    clearAllProfiles: PropTypes.func.isRequired,
    openSaveOpeningModal: PropTypes.func.isRequired,
    openSaveSearchModal: PropTypes.func.isRequired,
    loadCompanies: PropTypes.func.isRequired,
    openLoadSearchModal: PropTypes.func.isRequired,
    closeSaveOpeningModal: PropTypes.func.isRequired,
    closeSaveSearchModal: PropTypes.func.isRequired,
    closeLoadSearchModal: PropTypes.func.isRequired,
    loadProfileByResumeId: PropTypes.func.isRequired,
    loadOpeningById: PropTypes.func.isRequired,
    loadFilterBySearchId: PropTypes.func.isRequired,
    clearSelectedOpening: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    closeViewOpeningModal: PropTypes.func,
    openEditOpeningModal: PropTypes.func,
    closeEditOpeningModal: PropTypes.func,
    selectedViewOpening: PropTypes.object,
    filterFormValues: PropTypes.object,
    openings: PropTypes.array.isRequired,
    pushState: PropTypes.func,
    user: PropTypes.object,
    allMatch: PropTypes.bool,
    loadingProfiles: PropTypes.bool,
    reset: PropTypes.func.isRequired,
    saveEditedSearch: PropTypes.func.isRequired,
    editSavedSearch: PropTypes.func.isRequired
  }

  static defaultProps = {
    jobId: '',
    searchId: '',
    selectedViewOpening: {},
    filterFormValues: {},
    route: null,
    router: null,
    isSaveOpeningPristine: true,
    isSaveSearchPristine: true,
    openingFormData: null,
    saveSearchFormData: null,
    closeViewOpeningModal: null,
    openEditOpeningModal: null,
    closeEditOpeningModal: null,
    pushState: null,
    user: {},
    form: {},
    allMatch: false,
    loadingProfiles: false
  }

  constructor(props) {
    super(props);
    this.state = {
      initialParam: 'initial',
      isSaveOpening: false,
      isSaveSearch: false,
      isLoadSearch: false,
      bestMatches: false,
      activePage: 1,
      filters: null,
      selectedViewOpening: {},
      selectedIndex: -1,
      openings: this.props.openings || [],
      allMatches: true,
      selectedProfiles: [],
      isSnackbarEnabled: false,
      isSearch: false,
      searchStrVal: '',
      loadDefault: true,
      isFilterPermitted: false,
      isFilterApplied: false,
      filterTitle: 'New Filter',
      isReset: false,
      isRenameSearch: false,
      loadFilterSearch: false,
      activeFilterTab: false,
      previousValues: []
    };
  }

  componentWillMount() {
    if (localStorage.getItem('emailFromHistoryInfo')) {
      localStorage.removeItem('emailFromHistoryInfo');
    }
    const filterValues = JSON.parse(sessionStorage.getItem('profilefilters'));
    const isFilterPermitted = NewPermissible.isPermitted({
      operation: 'PROFILE_SEARCH_FILTER', model: 'profileSearch' });
    const permissions = [
      { operation: 'PROFILE_SEARCH_ALL_MATCHES', model: 'profileSearch' },
      { operation: 'PROFILE_SEARCH_BEST_MATCHES', model: 'profileSearch' }
    ];
    const matchPermissions = noOfPermissions(permissions);
    const isBestMatchesPermitted = NewPermissible.isPermitted({
      operation: 'PROFILE_SEARCH_BEST_MATCHES',
      model: 'profileSearch'
    });
    if (filterValues) {
      this.setState({
        allMatches: filterValues.allMatches,
        bestMatches: filterValues.bestMatches,
        activePage: filterValues.page,
        previousValues: filterValues,
        selectedProfiles: filterValues.selectedProfiles || [],
        isSnackbarEnabled: !!(filterValues.selectedProfiles && filterValues.selectedProfiles.length > 0),
        isFilterPermitted
      }, () => {
        const { searchResumeId } = filterValues;
        if (searchResumeId && filterValues.isSearch) {
          const idArray = searchResumeId.split(',');
          this.props.loadProfileByResumeId({ data: idArray, from: filterValues.page }).then(() => {}, err => {
            toastr.error('', err.error.message);
          });
          if (this.props.searchId) {
            this.props.loadFilterBySearchId(this.props.searchId);
          }
          this.setState({ searchStrVal: searchResumeId,
            isFilterPermitted,
            activePage: filterValues.page,
            isSearch: filterValues.isSearch,
            loadDefault: false,
            filters: filterValues });
        } else {
          this.loadProfilesBySearchIdOrJobId(filterValues);
        }
      });
    } else {
      let bestMatches = false;
      if (matchPermissions && matchPermissions.length <= 1 && isBestMatchesPermitted) {
        bestMatches = true;
        this.loadBestMatches();
      } else {
        this.loadProfilesBySearchIdOrJobId();
      }
      this.setState({
        isFilterPermitted,
      });
    }
  }

  componentDidMount() {
    window.addEventListener('beforeunload', () => {
      sessionStorage.removeItem('profilefilters');
    });
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.openingFormData && !this.props.isSaveOpeningPristine && this.state.isSaveOpening) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      } else if (this.props.saveSearchFormData && !this.props.isSaveSearchPristine && this.state.isSaveSearch) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      }
    });
  }
  componentWillUnmount() {
    this.props.resetSavedSearch();
  }

  setSessionStorage = () => {
    const { filters, allMatches, bestMatches, activePage, selectedProfiles, searchStrVal } = this.state;
    sessionStorage.setItem('profilefilters',
      JSON.stringify({ ...filters,
        allMatches,
        bestMatches,
        page: activePage,
        selectedProfiles,
        searchResumeId: searchStrVal,
        isSearch: this.state.isSearch
      }));
  }

  getResultById = (event, pageNo) => {
    const { searchStrVal } = this.state;
    if (event.keyCode === 13 || pageNo) {
      if (searchStrVal) {
        this.setState({
          isSearch: true,
          activePage: pageNo || 1,
          loadDefault: false
        }, () => {
          this.clearSelectedProfiles();
          let idArray = searchStrVal;
          if (!(searchStrVal instanceof Array)) {
            idArray = searchStrVal.split(',');
          }
          const data = {
            data: idArray,
            from: this.state.activePage,
          };
          this.props.loadProfileByResumeId(data).then(() => {
            const profileFilters = {
              allMatches: this.state.allMatches,
              bestMatches: this.state.bestMatches,
              experience: [3, 20]
            };
            this.setState(
              {
                filters: profileFilters,
                activePage: 1,
                isFilterApplied: true
              }, () => {
                // while search profile by Id , save the id's in session storage and clear selected profiles
                this.setSessionStorage();
              });
          }, err => {
            toastrErrorHandling(err.error, '', err.error.message);
          });
        });
      }
    } else if (!this.state.loadDefault && searchStrVal === '') {
      const profileFilters = JSON.parse(sessionStorage.getItem('profilefilters'));
      sessionStorage.setItem('profilefilters',
        JSON.stringify({ ...profileFilters, searchResumeId: this.state.searchStrVal, selectedProfiles: [] }));
      this.clearSelectedProfiles();
      this.loadProfilesAfterSearch();
      this.setState({
        loadDefault: true,
        activePage: 1
      });
    }
  }

  setSearchTerm = event => {
    const searchVal = trimTrailingSpace(event.target.value);
    if (!isNaN(searchVal)) {
      this.setState({
        searchStrVal: searchVal.replace('.', '')
      });
    }
  }

  resetSearch = () => {
    this.setState({
      activePage: 1
    });
    // while reset,clear stored profiles , clear session storage value
    const profileFilters = JSON.parse(sessionStorage.getItem('profilefilters'));
    sessionStorage.setItem('profilefilters',
      JSON.stringify({ ...profileFilters, searchResumeId: '', selectedProfiles: [] }));
    this.clearSelectedProfiles();
    this.loadProfilesAfterSearch();
  }

  loadProfilesAfterSearch = () => {
    const values = this.props.filterFormValues;
    if (values.companies) {
      values.companies.target_company = values.companies.id;
    }
    if (!values.experience) {
      values.experience = [3, 20];
    }
    this.loadProfiles(values);
  }

  loadProfilesBySearchIdOrJobId = filterValues => {
    const { jobId, searchId } = this.props;
    if (jobId || searchId) {
      if (!filterValues) {
        this.setState({ allMatches: this.props.allMatch, bestMatches: true });
      }
      if (jobId) {
        this.props.loadOpeningById(jobId).then(selectedOpening => {
          this.setState({ filterTitle: selectedOpening.jobTitle });
          if (selectedOpening.filters.companies) {
            selectedOpening.filters.companies.target_company = selectedOpening.filters.companies.id.toString();
            selectedOpening.filters.companies.isUserAdded = selectedOpening.company.isUserAdded;
            const values = selectedOpening.filters;
            values.job_opening_score = {
              skill_weight: values.skillRating ? parseFloat(values.skillRating) : 1,
              company_culture_weight: values.companyCultureRating ? parseFloat(values.companyCultureRating) : 1,
              mobility_weight: values.mobilityRating ? parseFloat(values.mobilityRating) : 1,
              pedigree_weight: values.pedigreeRating ? parseFloat(values.pedigreeRating) : 1,
              contact_weight: values.contactRating ? parseFloat(values.contactRating) : 1
            };
          }
          if (!filterValues) {
            this.loadProfiles(selectedOpening.filters);
          } else {
            this.loadProfiles(filterValues, filterValues.page);
          }
        });
      } else if (searchId) {
        this.props.loadFilterBySearchId(searchId).then(selectedSearch => {
          if (selectedSearch.companies) {
            selectedSearch.companies.target_company = selectedSearch.companies.id.toString();
            // selectedSearch.companies.is_user_added = selectedSearch.companies.isUserAdded;
          } else if (!filterValues && !selectedSearch.allMatches) {
            toastr.info('', i18n.t('infoMessage.PLEASE_SELECT_A_COMPANY_TO_GET_BEST_MATCHES_RESULT'));
          }
          const values = selectedSearch;
          values.job_opening_score = {
            skill_weight: values.skillRating ? parseFloat(values.skillRating) : 1,
            company_culture_weight: values.companyCultureRating ? parseFloat(values.companyCultureRating) : 1,
            mobility_weight: values.mobilityRating ? parseFloat(values.mobilityRating) : 1,
            pedigree_weight: values.pedigreeRating ? parseFloat(values.pedigreeRating) : 1,
            contact_weight: values.contactRating ? parseFloat(values.contactRating) : 1
          };
          this.setState({ allMatches: values.allMatches || false,
            bestMatches: !values.allMatches,
            filterTitle: values.name });
          if (!filterValues) {
            this.loadProfiles(selectedSearch);
          } else {
            this.loadProfiles(filterValues, filterValues.page);
          }
        });
      }
    } else {
      this.props.clearSelectedOpening();
      if (!filterValues) {
        this.loadProfiles();
      } else {
        this.loadProfiles(filterValues, filterValues.page);
      }
    }
  }

  formatKeywords = keywords => {
    let index;
    const words = keywords.split(' ');
    const wordsWithoutSpace = [];
    const formattedKeywords = [];
    for (index = 0; index < words.length; index += 1) {
      if (words[index] !== '') {
        wordsWithoutSpace.push(words[index]);
      }
    }
    for (index = 0; index < wordsWithoutSpace.length; index += 1) {
      if (wordsWithoutSpace[index].toUpperCase() === 'NOT' &&
        wordsWithoutSpace[index - 1].toUpperCase() !== 'OR' &&
        wordsWithoutSpace[index - 1].toUpperCase() !== 'AND'
      ) {
        formattedKeywords.push('AND');
        formattedKeywords.push(wordsWithoutSpace[index]);
      } else {
        formattedKeywords.push(wordsWithoutSpace[index]);
      }
      if (index + 1 <= (wordsWithoutSpace.length - 1) &&
        (
          (wordsWithoutSpace[index + 1].toUpperCase() !== 'AND') &&
          (wordsWithoutSpace[index + 1].toUpperCase() !== 'OR') &&
          (wordsWithoutSpace[index + 1].toUpperCase() !== 'NOT')
        ) &&
        (
          (wordsWithoutSpace[index].toUpperCase() !== 'AND') &&
          (wordsWithoutSpace[index].toUpperCase() !== 'OR') &&
          (wordsWithoutSpace[index].toUpperCase() !== 'NOT')
        )
      ) {
        formattedKeywords.push('AND');
      }
    }
    for (index = 0; index < formattedKeywords.length; index += 1) {
      if (formattedKeywords[index].toUpperCase() === 'AND' &&
        formattedKeywords[index + 1].toUpperCase() === 'AND') {
        formattedKeywords.splice(index, 1);
      }
    }
    return formattedKeywords.join(' ');
  }

  formatFilter = matches => {
    const listOfDefaultMarkups = ['@[AND](AND)', '@[OR](OR)', '@[()](())', '@[)]())'];
    const list = [];
    lodash.map(matches, (match, index) => {
      if (index !== (matches.length - 1) &&
      (!listOfDefaultMarkups.includes(matches[index])) &&
      (!listOfDefaultMarkups.includes(matches[index + 1]))) {
        list.push(match);
        list.push('@[AND](AND)');
      } else {
        list.push(match);
      }
    });
    return list.join(' ');
  }

  loadProfiles = (filterValues, pageNo) => {
    if (filterValues) {
      // if (filterValues.keywords && filterValues.keywords.length > 0) {
      //   filterValues.keywords = this.formatKeywords(filterValues.keywords);
      // }
      if (filterValues.skillStr) {
        const value = filterValues.skillStr;
        const matches = value.match(/(@\[(.+?)\]\((.+?)\))/g) || [];
        filterValues.skillStr = this.formatFilter(matches);
      }
      if (filterValues.languageStr) {
        const value = filterValues.languageStr;
        const matches = value.match(/(@\[(.+?)\]\((.+?)\))/g) || [];
        filterValues.languageStr = this.formatFilter(matches);
      }
      filterValues.bestMatches = this.state.bestMatches;
      filterValues.allMatches = this.state.allMatches;
      delete filterValues.selectedProfiles;
      delete filterValues.searchResumeId;
      delete filterValues.searchStrVal;
      delete filterValues.isSearch;
      this.setState(
        {
          filters: filterValues,
          activePage: pageNo || 1,
          searchStrVal: '',
          isSearch: false,
          isFilterApplied: true
        }, () => {
          this.props.loadProfiles({ ...filterValues, page: this.state.activePage }).then(() => {
            this.setSessionStorage();
          }, err => {
            if (err.error.statusCode === 422) {
              toastrErrorHandling(err.error, i18n.t('errorMessage.SERVER_ERROR'),
                i18n.t('errorMessage.INVALID_SKILL_SEARCH_FORMAT'), { removeOnHover: true });
            } else if (err.error.message) {
              toastrErrorHandling(err.error,
                i18n.t('errorMessage.SERVER_ERROR'), err.error.message, { removeOnHover: true });
            } else {
              toastrErrorHandling(err.error,
                i18n.t('errorMessage.SERVER_ERROR'),
                i18n.t('errorMessage.COULD_NOT_LOAD_PROFILES'), { removeOnHover: true });
            }
          });
        }
      );
    } else {
      const profileFilters = {
        allMatches: this.state.allMatches,
        bestMatches: this.state.bestMatches,
        experience: [3, 20]
      };
      this.setState(
        {
          filters: profileFilters,
          activePage: 1,
          searchStrVal: '',
          isSearch: false,
          isFilterApplied: true
        }, () => {
          this.props.loadProfiles({ ...profileFilters, page: this.state.activePage }).then(() => {
            this.setSessionStorage();
          }, err => {
            if (err.error.message) {
              toastrErrorHandling(err.error, i18n.t('errorMessage.SERVER_ERROR'),
                err.error.message, { removeOnHover: true });
            } else {
              toastrErrorHandling(err.error, i18n.t('errorMessage.SERVER_ERROR'),
                i18n.t('errorMessage.COULD_NOT_LOAD_PROFILES'), { removeOnHover: true });
            }
          });
        }
      );
    }
  }

  openSaveOpeningModal = filters => {
    this.setState({ isSaveOpening: true, filters }, () => {
      this.props.openSaveOpeningModal();
    });
  }

  openSaveSearchModal = filters => {
    this.setState({ isSaveSearch: true, filters }, () => {
      this.props.openSaveSearchModal();
    });
  }

  openLoadSearchModal = filters => {
    this.setState({ isLoadSearch: true, filters }, () => {
      this.props.openLoadSearchModal();
    });
  }

  closeModal = () => {
    this.props.closeSaveOpeningModal();
    this.setState({ isSaveOpening: false });
  }

  closeSearchSaveModal = () => {
    this.props.closeSaveSearchModal();
    this.setState({ isSaveSearch: false, isRenameSearch: false });
  }

  closeLoadSearchModal = () => {
    this.props.closeLoadSearchModal();
    this.setState({ isLoadSearch: false });
  }

  handlePagination = (direction, pageNo, maxPage) => {
    if (direction !== 'goto') {
      document.getElementById('goToProfile').value = '';
    }
    if (maxPage < pageNo) {
      const msgObj = { statusCode: 200 };
      toastrErrorHandling(msgObj, i18n.t('errorMessage.PAGINATION_ERROR'), i18n.t('errorMessage.NO_PAGE_FOUND'));
      return null;
    }
    // const pageCount = Math.ceil(this.props.totalCount / Constants.RECORDS_PER_PAGE);
    let currentPage = this.state.activePage;
    if (direction === 'previous') {
      if (currentPage === 1) {
        return;
      }
      currentPage -= 1;
    } else if (direction === 'next') {
      if (currentPage === pageNo) {
        return;
      }
      currentPage += 1;
    } else if (direction === 'first') {
      if (currentPage === 1) {
        return;
      }
      currentPage = 1;
    } else if (direction === 'last') {
      if (currentPage === pageNo) {
        return;
      }
      currentPage = pageNo;
    } else if ((direction === 'goto' && pageNo > 0)) {
      currentPage = pageNo;
    }
    this.setState({
      activePage: currentPage
    }, () => {
      if (!this.state.isSearch) {
        this.loadProfiles(this.state.filters, currentPage);
      } else {
        this.getResultById(this.state.searchStrVal, currentPage);
      }
    });
  }

  resetFilter = () => {
    const { searchId } = this.props;
    sessionStorage.removeItem('profilefilters');
    // This loads with default profile filters
    this.loadProfiles();
    if (searchId) this.props.pushState('/ProfileSearch');
    this.props.resetSavedSearch();
    this.setState({ initialValues: {}, selectedProfiles: [], isSnackbarEnabled: false });
    this.props.loadCompanies('initial');
  }

  handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    const { filterFormValues } = this.props;
    if (filterFormValues.companies) {
      filterFormValues.companies.target_company = filterFormValues.companies.id;
    }
    if (!filterFormValues.companies && this.state.bestMatches) {
      toastr.info('', i18n.t('infoMessage.PLEASE_SELECT_A_COMPANY_TO_GET_BEST_MATCHES_RESULT'));
    }
    filterFormValues.job_opening_score = {
      skill_weight: filterFormValues.skillRating ? parseFloat(filterFormValues.skillRating) : 1,
      company_culture_weight: filterFormValues.companyCultureRating
        ? parseFloat(filterFormValues.companyCultureRating) : 1,
      mobility_weight: filterFormValues.mobilityRating ? parseFloat(filterFormValues.mobilityRating) : 1,
      pedigree_weight: filterFormValues.pedigreeRating ? parseFloat(filterFormValues.pedigreeRating) : 1,
      contact_weight: filterFormValues.contactRating ? parseFloat(filterFormValues.contactRating) : 1
    };
    filterFormValues.experience = filterFormValues.experience ? filterFormValues.experience : [3, 20];
    if (!filterFormValues.isMobile) filterFormValues.isMobile = false;
    if (!filterFormValues.isEmail) filterFormValues.isEmail = false;
    if (!filterFormValues.isFreelance) filterFormValues.isFreelance = false;
    const filters = {
      ...filterFormValues,
      experience: [filterFormValues.experience[0], filterFormValues.experience[1] === 10
        ? 10 : filterFormValues.experience[1]]
    };
    this.loadProfiles(filters);
  }

  resetFilterValues = () => {
    this.props.change('ProfileFilter', 'preferredRadius', 0);
    this.props.change('ProfileFilter', 'companies', '');
    this.props.change('ProfileFilter', 'noticePeriod', '');
    this.setState({ isReset: true });
    this.resetFilter();
    this.props.reset();
  }

  resetRatingStars = () => {
    this.setState({ isReset: false });
  }

  resetCheckBox = () => {
    const elements = [].slice.call(document.getElementsByClassName('rc-checkbox rc-checkbox-checked'));
    for (let index = 0; index < elements.length; index += 1) {
      elements[index].classList.remove('rc-checkbox-checked');
    }
  }

  attachHyphenToWords = string => {
    if (string) {
      return ` - ${string} `;
    }
  }

  iterateArrayAndAttach = array => {
    let totalString = '';
    array.forEach((currentValue, index) => {
      if (currentValue.name) {
        totalString += currentValue.name;
        if (totalString && index !== array.length - 1) {
          totalString = `${totalString}, `;
        }
      }
    });
    if (totalString) {
      return ` ${totalString}`;
    }
  }

  attachBackButton = jobId => (
    <Image
      responsive
      title={i18n.t('tooltipMessage.CLICK_HERE_TO_GO_BACK_TO_OPENINGS')}
      src="./left-arrow.svg"
      alt="back"
      id={jobId}
      style={{ cursor: 'pointer' }}
      onClick={evt => { evt.preventDefault(); this.goToPreviousPage(); }}
    />
  );

  goToPreviousPage = () => {
    hashHistory.goBack();
  }

  attachButtonsToDom = jobId => (
    <NewPermissible operation={{ operation: 'VIEW_ATS_BOARD', model: 'jobProfile' }}>
      {/* <span className={`${styles.rightAlign} ${styles.profile_secondary_btn}`}>       */}
      <Link className={`${styles.profile_secondary_btn}`} to={`/ATSBoard?jobId=${jobId}`}>
        {i18n.t('VIEW_ATS_BOARD')}
        {/* <i
          title={i18n.t('tooltipMessage.CLICK_HERE_TO_VIEW_ATS_BOARD')}
          // className={`fa fa-th ${styles.search}`}
          id={jobId}
          role="button"
          tabIndex="0"
        /> */}
      </Link>
      {/* </span> */}
    </NewPermissible>
  );

  openViewModal = evt => {
    evt.preventDefault();
    const { id } = evt.target;
    let { selectedViewOpening } = this.props;
    this.state.openings.forEach(data => {
      if (data.id === parseInt(id, 10)) {
        selectedViewOpening = data;
      }
    });
    if (selectedViewOpening) {
      this.setState({ openViewModal: true, selectedViewOpening });
    }
  }

  closeViewModal = () => {
    this.props.closeViewOpeningModal();
    this.setState({ openViewModal: false });
  }

  loadAllMatches = () => {
    this.setState({
      bestMatches: false,
      allMatches: true,
      selectedProfiles: [],
      isSnackbarEnabled: false,
      activeFilterTab: false
    }, () => {
      const filterValues = JSON.parse(sessionStorage.getItem('profilefilters'));
      const { jobId, searchId } = this.props;
      if (jobId) {
        this.props.loadOpeningById(jobId).then(selectedOpening => {
          selectedOpening.filters.companies.target_company = selectedOpening.filters.companies.id;
          selectedOpening.filters.companies.isUserAdded = selectedOpening.company.isUserAdded;
          if (!filterValues) {
            this.loadProfiles(selectedOpening.filters);
          } else {
            this.loadProfiles(filterValues);
          }
        });
      } else if (searchId) {
        this.props.loadFilterBySearchId(searchId).then(selectedSearch => {
          if (!filterValues) {
            this.loadProfiles(selectedSearch);
          } else {
            this.loadProfiles(filterValues);
          }
        });
      } else {
        const values = this.props.filterFormValues;
        if (values.companies) {
          values.companies.target_company = values.companies.id;
        }
        if (!values.experience) {
          values.experience = [3, 20];
        }
        this.loadProfiles(values);
      }
    });
  }

  loadBestMatches = () => {
    this.setState({
      bestMatches: true,
      allMatches: false,
      selectedProfiles: [],
      isSnackbarEnabled: false
    }, () => {
      const { jobId, searchId } = this.props;
      const filterValues = JSON.parse(sessionStorage.getItem('profilefilters'));
      if (jobId) {
        this.props.loadOpeningById(jobId).then(selectedOpening => {
          if (!filterValues) {
            this.loadProfiles(selectedOpening.filters);
          } else {
            this.loadProfiles(filterValues);
          }
        });
      } else if (searchId) {
        this.props.loadFilterBySearchId(searchId).then(selectedSearch => {
          if (!filterValues) {
            this.loadProfiles(selectedSearch);
          } else if (filterValues && !filterValues.companies) {
            toastr.info('', i18n.t('infoMessage.PLEASE_SELECT_A_COMPANY_TO_GET_BEST_MATCHES_RESULT'));
            this.props.clearAllProfiles();
          } else {
            this.loadProfiles(filterValues);
          }
        });
      } else {
        let values = '';
        if (filterValues) {
          values = filterValues;
        } else {
          values = this.props.filterFormValues;
        }
        if (!values.experience) {
          values.experience = [3, 20];
        }
        // const values = this.props.filterFormValues;
        if (values.companies) {
          values.companies.target_company = values.companies.id;
          this.loadProfiles(values);
        } else {
          this.setState({ activeFilterTab: true });
          toastr.info('', i18n.t('infoMessage.PLEASE_SELECT_A_COMPANY_TO_GET_BEST_MATCHES_RESULT'));
          this.props.clearAllProfiles();
        }
      }
    });
  }

  openEditOpeningModal = id => {
    this.closeViewModal();
    let selectedOpening = {};
    let selectedIndex = -1;
    this.props.openings.forEach((data, index) => {
      if (data.id === parseInt(id, 10)) {
        selectedIndex = index;
        selectedOpening = data;
      }
    });
    this.setState({
      selectedOpening,
      selectedIndex,
      openModal: true,
      isEdit: true
    }, () => {
      this.props.openEditOpeningModal();
    });
  }

  closeEditModal = () => {
    this.props.closeEditOpeningModal();
  }

  openRenameModal = (searchId, searchTitle) => {
    this.setState({ isRenameSearch: true, searchId, searchTitle }, () => {
      this.props.openSaveSearchModal();
    });
  }

  closeEditSearch = () => {
    this.props.closeSaveSearchModal();
    this.setState({ isRenameSearch: false, loadFilterSearch: true });
  }

  renameSearch = (id, title) => {
    this.props.editSavedSearch({ id, name: title }).then(() => {
      this.closeEditSearch();
      toastr.success(i18n.t('successMessage.UPDATED'),
        i18n.t('successMessage.THE_FILTER_SEARCH_HAS_BEEN_UPDATED_SUCCESSFULLY'));
    }, err => {
      this.closeEditSearch();
      toastrErrorHandling(err.error.statusCode, i18n.t('ERROR'), err.error.message, { removeOnHover: true });
    });
  }

  attachEditOpeningButton = (jobId, jobTitle) => (
    <Link
      className={`${styles.undoIcon}`}
      to={{ pathname: `/Openings/${jobId}` }}
    >
      <span
        title={i18n.t('tooltipMessage.CLICK_HERE_TO_VIEW_OPENING')}
        className="p-l-5 p-r-5"
        id={jobId}
        role="button"
        tabIndex="0"
      >{formatTitle(jobTitle)}</span>
    </Link>
  );

  selectProfiles = profile => {
    const { selectedProfiles } = this.state;
    const index = selectedProfiles.findIndex(resume => resume.id === profile.id);
    if (index === -1) {
      selectedProfiles.push(profile);
    } else {
      selectedProfiles[index] = profile;
    }
    const filteredSelectedProfiles = selectedProfiles.filter(selectedProfile => selectedProfile.isChecked);
    this.setState({
      selectedProfiles: []
    }, () => {
      this.setState({
        selectedProfiles: filteredSelectedProfiles,
        isSnackbarEnabled: filteredSelectedProfiles.length > 0
      }, () => {
        this.setSessionStorage();
      });
    });
  }

  afterSelectOptions = profiles => {
    this.setState({
      selectedProfiles: profiles,
      isSelectAll: false,
      isClearAll: false
    }, () => { this.setSessionStorage(); });
  }

  selectAllProfile = profiles => {
    this.setState({
      selectedProfiles: profiles,
      isSnackbarEnabled: true
    });
  }

  sendEmail = () => {
    const { selectedProfiles } = this.state;
    this.setSessionStorage();
    const { selectedOpening } = this.props;
    const profiles = [];
    const { user } = this.props;
    selectedProfiles.map(selectedProfile => profiles.push({
      id: selectedProfile.profileId,
      email: selectedProfile.contacts.emails[0]
    }));
    if (user.isMailConfigured) {
      this.props.pushState({ pathname: '/Emailer', state: { candidates: profiles, from: 'profileSearch' } });
    } else {
      toastr.info(i18n.t('infoMessage.PLEASE_CONFIGURE_YOUR_MAIL'));
      localStorage.setItem('emailFromHistoryInfo',
        JSON.stringify({ from: 'ProfileSearch', jobId: selectedOpening ? selectedOpening.id : '' }));
      this.props.pushState({ pathname: '/EmailConfig' });
    }
  }

  saveSearch = evt => {
    evt.preventDefault();
    const { filterFormValues, selectedSearch, jobId } = this.props;
    const deviceDetail = JSON.parse(localStorage.getItem('deviceDetails'));
    if (!filterFormValues.companies && this.state.bestMatches) {
      toastr.info('', i18n.t('infoMessage.PLEASE_SELECT_A_COMPANY_TO_GET_BEST_MATCHES_RESULT'));
    } else if ((selectedSearch && Object.keys(selectedSearch).length > 1) ||
      (jobId && Object.keys(filterFormValues).length > 0)) {
      this.handleSubmit(evt);
      const search = {
        userId: filterFormValues.id,
        name: filterFormValues.searchTitle,
        description: filterFormValues.description,
        filters: filterFormValues,
        previousValues: this.state.previousValues,
        deviceDetails: deviceDetail
      };
      this.props.saveEditedSearch({
        ...search,
      }).then(() => toastr.success(i18n.t('successMessage.UPDATED'),
        i18n.t('successMessage.THE_FILTER_SEARCH_HAS_BEEN_UPDATED_SUCCESSFULLY')));
    } else {
      this.openSaveSearchModal(filterFormValues);
    }
  }

  clearSelections = selection => {
    if (selection.isClearAll) {
      selection.selectedProfiles = [];
      selection.isSnackbarEnabled = false;
    }
    this.setState(selection, () => { this.setSessionStorage(); });
  }

  clearSelectedProfiles = () => {
    this.setState({ selectedProfiles: [], isSnackbarEnabled: false });
  }

  profilePanelScroll = () => {
    // const element = document.getElementById('filter-panel');
    // if (element) {
    // const panelHeight = element.clientHeight;
    // console.log(panelHeight, scrollTop);
    const scrollTop = this.profiles.scrollTop;
    if (scrollTop > 90) {
      this.setState({ hideFilterPanel: true });
    }
    // }
  };

  render() {
    const { selectedOpening, jobId, loadingProfiles, filterFormValues } = this.props;
    const { skills, positions, languages, source, preferredRadius, location, experience, companies,
      isMobile, isEmail, isFreelance, noticePeriod, noticePeriodType, candidateTags, candidateName } = this.props.filterFormValues;
    const { filters, selectedProfiles, isFilterPermitted, isFilterApplied, searchId, searchTitle, activeFilterTab,
      isReset, hideFilterPanel, filterTitle } = this.state;
    const openFilter = (positions && positions.length > 0) || (skills && skills.length > 0) ||
    (languages && languages.length > 0) || (source && source.length > 0) || (location && location.length > 0)
    || preferredRadius || isMobile || isEmail || isFreelance || (noticePeriod && noticePeriodType)
    || (experience && !lodash.isEqual(experience, [3, 20])) || companies || (candidateTags && candidateTags.length > 0) || candidateName;
    let panelHeight = 0;
    if (selectedOpening && selectedOpening.id && jobId) {
      const element = document.getElementById('job-profile-panel');
      panelHeight = element ? element.clientHeight : 85;
    }
    return (
      <div className="p-0">
        {
          selectedOpening && selectedOpening.id && jobId ?
            <JobProfilePanel
              jobId={selectedOpening.id}
              jobTitle={selectedOpening.jobTitle}
              numberOfVacancies={selectedOpening.vacancies}
              status={selectedOpening.status}
              type={selectedOpening.type}
              attachButtonsToDom={this.attachButtonsToDom(jobId)}
              location={this.iterateArrayAndAttach(selectedOpening.openinglocations || [])}
              attachBackButton={this.attachBackButton(jobId)}
              activeStatus={selectedOpening.status}
              attachEditOpeningButton={this.attachEditOpeningButton(jobId, selectedOpening.jobTitle)}
              statusCount={{ ...selectedOpening.statusCount, rejected: selectedOpening.rejectedCount }}
            />
            : null
        }
        <div
          // style={inlineStyles}
          onScroll={this.profilePanelScroll}
          ref={c => { this.profiles = c; }}
        >
          <NewPermissible operation={{ operation: 'PROFILE_SEARCH_FILTER', model: 'profileSearch' }}>
            <Col lg={3} md={3} sm={4} xs={12} className={`${styles['filter-outer-div']} modal-container`}>
              <ProfileFilter
                initialValues={filters}
                enableReinitialize
                filterValues={filters}
                panelHeight={panelHeight}
                isBestMatch={this.state.bestMatches}
                allMatches={this.state.allMatches}
                loadProfiles={this.loadProfiles}
                saveOpening={this.openSaveOpeningModal}
                resetRatingStars={this.resetRatingStars}
                loadSearch={this.openLoadSearchModal}
                loading={this.props.loading}
                jobId={jobId}
                isReset={isReset}
                resetFilterValues={this.resetFilterValues}
                isCompanyDisable={selectedOpening && selectedOpening.id && jobId}
                handleSubmit={this.handleSubmit}
                resetCheckBox={this.resetCheckBox}
                openRenameModal={this.openRenameModal}
                loadFilterSearch={this.state.loadFilterSearch}
                loadFilterSearchCb={() => { this.setState({ loadFilterSearch: false }); }}
                activeFilterTab={activeFilterTab}
                activeFilterTabCb={() => { this.setState({ activeFilterTab: false }); }}
              />
            </Col>
          </NewPermissible>
          <Col
            lg={isFilterPermitted ? 9 : 12}
            md={isFilterPermitted ? 9 : 12}
            sm={isFilterPermitted ? 8 : 12}
            xs={12}
            className={`${styles['profile-filter-section']}`}
          >
            <Profiles
              handlePagination={this.handlePagination}
              activePage={this.state.activePage}
              jobId={jobId}
              isBestMatch={this.state.bestMatches}
              allMatches={this.state.allMatches}
              loadAllMatches={this.loadAllMatches}
              loadBestMatches={this.loadBestMatches}
              loading={loadingProfiles}
              selectedProfiles={selectedProfiles}
              selectProfile={this.selectProfiles}
              selectAll={this.selectAllProfile}
              hideFilterPanel={hideFilterPanel}
              isClearAll={this.state.isClearAll}
              isSelectAll={this.state.isSelectAll}
              clearSelections={this.clearSelections}
              afterSelectOptions={this.afterSelectOptions}
              filters={this.state.filters}
              clearSelectedProfiles={this.clearSelectedProfiles}
              isSearch={this.state.isSearch}
              getResultById={this.getResultById}
              setSearchTerm={this.setSearchTerm}
              resetSearch={this.resetSearch}
              searchVal={this.state.searchStrVal}
              user={this.props.user}
              isFilterApplied={isFilterApplied}
              isFilterAppliedCb={() => {
                this.setState({
                  isFilterApplied: false
                });
              }}
              panelHeight={panelHeight}
              openFilter={openFilter}
              filterTitle={filterTitle}
              values={filterFormValues}
              saveSearch={this.saveSearch}
            />
          </Col>
        </div>
        {
          this.state.isSaveOpening ?
            <SaveOpening
              ref={c => { this.SaveOpening = c; }}
              form="SaveOpening"
              validate={formValidation}
              initialValues={{ type: 'fullTime', ...this.state.filters }}
              closeModal={this.closeModal}
            /> : ''
        }
        {
          this.state.isSaveSearch || this.state.isRenameSearch ?
            <SaveSearch
              ref={c => { this.SaveSearch = c; }}
              form="SaveSearch"
              isRenameSearch={this.state.isRenameSearch}
              validate={searchValidation}
              initialValues={!this.state.isRenameSearch ? { type: 'fullTime', ...this.state.filters } :
                { id: searchId, searchTitle }}
              allMatches={this.state.allMatches}
              closeModal={this.closeSearchSaveModal}
              renameSearch={this.renameSearch}
            /> : ''
        }
        {/* {
          this.state.isRenameSearch ?
            <SaveSearch
              ref={c => { this.SaveSearch = c; }}
              form="SaveSearch"
              initialValues={{ id: searchId, searchTitle }}
              closeModal={this.closeSearchSaveModal}
              renameSearch={this.renameSearch}
            /> : ''
        } */}
        {
          this.state.isLoadSearch ?
            <LoadSearch
              ref={c => { this.LoadSearch = c; }}
              form="LoadSearch"
              validate={formValidation}
              initialValues={{ type: 'fullTime', ...this.state.filters }}
              closeModal={this.closeLoadSearchModal}
              allMatches={this.state.allMatches}
            /> : ''
        }
        {
          this.state.isSnackbarEnabled &&
          <Snackbar
            selectedProfiles={selectedProfiles}
            sendEmail={this.sendEmail}
            clearSelections={this.clearSelections}
          />
        }
      </div>
    );
  }
}

const Snackbar = properties => {
  const { selectedProfiles } = properties;
  return (
    <div className={`${styles.snackbar} is-animated`}>
      <div className={styles.total_selected}>
        {selectedProfiles.length} {selectedProfiles.length > 1 ?
          i18n.t('CANDIDATES_LOWERCASE') : i18n.t('CANDIDATE_LOWERCASE')} {i18n.t('SELECTED_LOWERCASE')}
      </div>
      <div
        className={`${styles.block} ${styles.button_text} m-r-10`}
        onClick={() => properties.clearSelections({ isSelectAll: true })}
        role="presentation"
      >
        <Trans>SELECT_ALL</Trans>
      </div>
      <div className={`${styles.block} m-r-10`} style={{ marginLeft: '100px' }}>
        <button
          className={'btn btn-border button-primary'}
          style={{ fontWeight: '400' }}
          onClick={properties.sendEmail}
        >
          <Trans>EMAIL_CANDIDATES_PROFILE</Trans>
        </button>
      </div>
      <div className={`${styles.block} ${styles.right} m-r-10 m-t-10`}>
        <button
          className={`${styles.buttonReset} btn btn-danger`}
          style={{ fontWeight: '400' }}
          onClick={() => properties.clearSelections({ isClearAll: true })}
        >
          <Trans>CLEAR_ALL</Trans>
        </button>
      </div>
    </div>
  );
};
