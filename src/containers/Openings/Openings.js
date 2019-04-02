import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { isPristine } from 'redux-form';
import { connect } from 'react-redux';
import { Link, hashHistory } from 'react-router';
import { push as pushState } from 'react-router-redux';
import { Col } from 'react-bootstrap';
import { loadOpenings, loadOpeningsByJobId } from '../../redux/modules/openings';
import OpeningFilter from './OpeningFilter';
import ViewAllOpenings from './ViewAllOpenings';
import styles from './Openings.scss';
import Constants from './../../helpers/Constants';
import toastrErrorHandling from '../toastrErrorHandling';
import ProfileJobPanel from '../../components/PageComponents/ProfileJobPanel';
import { loadProfileById as loadProfile } from '../../redux/modules/profile-search';
import i18n from '../../i18n';
// import NewPermissible from '../../components/Permissible/NewPermissible';

@connect(state => ({
  loading: state.openings.loading,
  isSaveOpeningPristine: isPristine('StepSaveOpening')(state),
  openingFormData: state.form.StepSaveOpening,
  user: state.auth.user,
  companyId: state.routing.locationBeforeTransitions.query.companyId,
  resumeId: state.routing.locationBeforeTransitions.query.profileId,
  resume: state.profileSearch.resume,
}), { loadOpenings, loadProfile, pushState, loadOpeningsByJobId })
class Openings extends Component {
  static propTypes = {
    loadOpenings: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    isSaveOpeningPristine: PropTypes.bool,
    openingFormData: PropTypes.object,
    route: PropTypes.object,
    router: PropTypes.object,
    companyId: PropTypes.any,
    resumeId: PropTypes.string,
    resume: PropTypes.arrayOf(PropTypes.object),
    loadProfile: PropTypes.func.isRequired,
    loadOpeningsByJobId: PropTypes.func.isRequired
  }

  static defaultProps = {
    companyId: '',
    route: null,
    router: null,
    isSaveOpeningPristine: true,
    openingFormData: null,
    loading: false,
    resumeId: '',
    resume: []
  }

  constructor(props) {
    super(props);
    this.state = {
      filter: {},
      activePage: 1,
      isScrollTop: false,
      isCreateOpeningModalOpen: false,
      isMyOpenings: false,
      searchTerm: '',
      resetSearch: false,
      sortBy: ['modifiedAt', 'desc'],
      activeSortName: 'Modified date by desc'
    };
  }

  componentWillMount() {
    if (this.props.resumeId) {
      this.loadProfilesById();
    }
    const openingFilters = JSON.parse(sessionStorage.getItem('openingFilters'));
    const searchTerm = openingFilters ? openingFilters.searchTerm : '';
    const sortByValue = openingFilters ? openingFilters.sortBy : ['modifiedAt', 'desc'];
    const sortName = openingFilters ? openingFilters.activeSortName : 'Modified date by desc';
    this.setState({
      searchTerm: searchTerm || '',
      sortBy: sortByValue,
      activeSortName: sortName,
      isMyOpenings: !!(openingFilters && openingFilters.userId)
    });
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.openingFormData && Object.keys(this.props.openingFormData).length > 0
        && !this.props.isSaveOpeningPristine && this.state.isCreateOpeningModalOpen) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      }
    });
  }


  loadProfilesById = () => {
    const { resumeId } = this.props;
    this.props.loadProfile({ resumeId,
      originalScore: '',
      targetCompany: '',
      profileId: resumeId,
      needJobIds: true });
  }

  loadOpenings = (filter, isSearch) => {
    if (document.getElementById('goToOpenings')) {
      document.getElementById('goToOpenings').value = '';
    }
    const { searchTerm, searchIds } = this.state;
    // filter.userId = '';
    if (searchTerm) {
      filter.searchTerm = searchTerm;
    }
    if (searchIds) {
      this.setState({ resetSearch: true, searchIds: '' });
    }
    // if (this.state.isMyOpenings || !NewPermissible.isPermitted({ operation: 'ALL_OPENINGS', model: 'jobOpening' })) {
    //   filter.userId = this.props.user.id;
    // }
    this.setState({ filter, isScrollTop: true, activePage: filter.page || 1 });
    this.props.loadOpenings({
      ...filter,
      page: filter.page || 1,
      resultsPerPage: Constants.RECORDS_PER_PAGE,
      isFromCompany: false
    }, isSearch).then(() => {
      this.setState({
        isScrollTop: false
      });
      sessionStorage.setItem('openingFilters', JSON.stringify(
        { ...filter,
          activeSortName: this.state.activeSortName,
          sortBy: this.state.sortBy,
          page: filter.page || 1
        }
      ));
    }, error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_OPENINGS_FOR_THE_COMPANY'), { removeOnHover: true });
    });
  }

  loadAllOpenings = () => {
    this.setState({
      isMyOpenings: false
    }, () => {
      const { filter } = this.state;
      filter.page = 1;
      this.loadOpenings(filter);
    });
  }

  showMyOpenings = () => {
    this.setState({
      isMyOpenings: true
    }, () => {
      const { filter } = this.state;
      filter.page = 1;
      this.loadOpenings(filter);
    });
  }

  sortOpenings = (key, innerText) => {
    const { filter } = this.state;
    filter.sortBy = key.split('-');
    filter.page = 1;
    this.setState({ resetSearch: false, sortBy: key.split('-'), activeSortName: innerText }, () => {
      this.loadOpenings(filter);
    });
  }

  handlePagination = (direction, pageNo, maxPage) => {
    if (direction !== 'goto') {
      document.getElementById('goToOpenings').value = '';
    }
    if (maxPage < pageNo) {
      const msgObj = { statusCode: 200 };
      toastrErrorHandling(msgObj, i18n.t('errorMessage.PAGINATION_ERROR'), i18n.t('errorMessage.NO_PAGE_FOUND'));
      return null;
    }
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
      this.props.loadOpenings({
        ...this.state.filter,
        page: currentPage,
        resultsPerPage: Constants.RECORDS_PER_PAGE,
        isFromCompany: false
      }).then(() => {
        sessionStorage.setItem('openingFilters', JSON.stringify(
          {
            ...this.state.filter,
            activeSortName: this.state.activeSortName,
            sortBy: this.state.sortBy,
            page: currentPage
          }
        ));
      }, error => {
        toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_OPENINGS_FOR_THE_COMPANY'));
      });
    });
  }

  attachBackButton = resumeId => (
    <Link onClick={this.goToPreviousPage}>
      <i
        title={i18n.t('tooltipMessage.CLICK_HERE_TO_GO_TO_BACK')}
        className={`fa fa-arrow-left ${styles.back}`}
        id={resumeId}
        role="button"
        tabIndex="0"
      />
    </Link>
  );

  goToPreviousPage = () => {
    hashHistory.goBack();
    // const { resumeId } = this.props;
    // this.props.pushState({ pathname: `/ProfileSearch/${resumeId}`,
    //   query: { isAtsBoard: true },
    //   state: { activeKey: 5 } });
  }

  searchOpenings = searchTerm => {
    const { filter } = this.state;
    filter.searchTerm = searchTerm;
    filter.page = 1;
    this.setState({ searchTerm, resetSearch: false }, () => {
      this.loadOpenings(filter);
    });
  }

  searchOpeningsById = jobIds => {
    const jobId = jobIds.split(',');
    this.setState({ searchIds: jobIds, resetSearch: false, filter: {} }, () => {
      this.props.loadOpeningsByJobId(jobId);
    });
  }

  resetSearchTerm = cb => {
    this.setState({ resetSearch: true, searchTerm: '' }, () => cb());
  }

  toggleOpeningModal = () => {
    this.setState({
      isCreateOpeningModalOpen: !this.state.isCreateOpeningModalOpen
    });
  }

  resetFilters = canReset => {
    this.setState({
      resetFilter: canReset
    });
  }

  render() {
    const { resume, resumeId } = this.props;
    const { resetFilter, resetSearch, filter, searchTerm, isScrollTop } = this.state;
    return (
      <div className="p-0">
        <Helmet title={i18n.t('OPENINGS')} />
        <Col lg={12} md={12} sm={12} className="p-l-0" style={{ paddingRight: '1px' }}>
          { resumeId && resume && Object.keys(resume).length > 0 ?
            <ProfileJobPanel
              resumeId={resumeId}
              profileName={resume && Object.keys(resume).length > 0 ? this.props.resume.name : ''}
              attachBackButton={this.attachBackButton(resume.id)}
            />
            : ''
          }
          <Col lg={3} md={3} sm={4} className={styles.filter_outer}>
            <OpeningFilter
              loadOpenings={this.loadOpenings}
              loading={this.props.loading}
              companyId={this.props.companyId}
              resetSearchTerm={this.resetSearchTerm}
              resetFilter={resetFilter}
              resetFilters={this.resetFilters}
              sortBy={this.state.sortBy}
            />
          </Col>
          <Col lg={9} md={9} sm={8} className={styles.openings_section}>
            <ViewAllOpenings
              filter={filter}
              searchTerm={searchTerm}
              isScrollTop={isScrollTop}
              activePage={this.state.activePage}
              handlePagination={this.handlePagination}
              loading={this.props.loading}
              isCreateOpeningModalOpen={this.state.isCreateOpeningModalOpen} // added for back browser alert
              toggleOpeningModal={this.toggleOpeningModal} // added for back browser alert
              loadAllOpenings={this.loadAllOpenings}
              searchOpenings={this.searchOpenings}
              resetSearchData={resetSearch}
              searchOpeningsById={this.searchOpeningsById}
              resetFilters={this.resetFilters}
              sortOpenings={this.sortOpenings}
              sortBy={this.state.sortBy}
            />
          </Col>
        </Col>
      </div>
    );
  }
}

export default Openings;
