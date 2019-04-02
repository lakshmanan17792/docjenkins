import React, { Component } from 'react';
import { Image } from 'react-bootstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { getFormValues } from 'redux-form';
import { push as pushState } from 'react-router-redux';
import Constants from './../../helpers/Constants';
import { getToBeUnarchivedCandidates, checkIfArchivable, unArchiveCandidate, extendArchivedCandidate }
  from '../../redux/modules/profile-search/managecandidates';
import i18n from '../../i18n';
import toastrErrorHandling from '../toastrErrorHandling';
import { CustomTable } from '../../components';
import OverviewDetails from './OverviewDetails';
import NewPermissible from '../../components/Permissible/NewPermissible';
import styles from './Candidates.scss';

let timeoutId = 0;

@connect(state => ({
  toBeUnarchivedCandidates: state.managecandidates.toBeUnarchivedCandidates,
  extendNotifyDateValues: getFormValues('extendNotifyDate')(state),
  toBeUnarchivedTotalCount: state.managecandidates.toBeUnarchivedTotalCount,
  loadingToBeUnarchivedCandidates: state.managecandidates.loadingToBeUnarchivedCandidates,
  unArchiving: state.managecandidates.unArchiving
}), {
  pushState,
  getToBeUnarchivedCandidates,
  checkIfArchivable,
  unArchiveCandidate,
  extendArchivedCandidate
})
export default class ToBeUnarchivedCandidates extends Component {
  static propTypes = {
    pushState: PropTypes.func.isRequired,
    formatCandidateName: PropTypes.func.isRequired,
    renderRequestRaisedBy: PropTypes.func.isRequired,
    renderRequestDate: PropTypes.func.isRequired,
    returnLogoText: PropTypes.func.isRequired,
    getToBeUnarchivedCandidates: PropTypes.func.isRequired,
    checkIfArchivable: PropTypes.func.isRequired,
    unArchiveCandidate: PropTypes.func.isRequired,
    extendNotifyDateValues: PropTypes.object,
    toBeUnarchivedCandidates: PropTypes.array.isRequired,
    toBeUnarchivedTotalCount: PropTypes.number.isRequired,
    loadingToBeUnarchivedCandidates: PropTypes.bool.isRequired,
    extendArchivedCandidate: PropTypes.func.isRequired,
    unArchiving: PropTypes.bool.isRequired
  };
  static defaultProps = {
    extendNotifyDateValues: null
  }
  constructor(props) {
    super(props);
    this.state = {
      openCandidateModal: false,
      isExtendDateModalOpen: false,
      selectedCandidate: {},
      searchTerm: '',
      sortBy: 'archivedOn',
      sortOrder: 'desc',
      activePage: 1
    };
  }
  componentWillMount() {
    const manageCandidatesFilter = JSON.parse(sessionStorage.getItem('manageCandidateUnarchive'));
    if (manageCandidatesFilter) {
      this.setState(manageCandidatesFilter, () => {
        this.fetchToBeUnarchivedCandidates();
      });
    } else {
      this.fetchToBeUnarchivedCandidates();
    }
    if (sessionStorage.getItem('selectedCandidateAction')) {
      this.setState({
        selectedCandidate: JSON.parse(sessionStorage.getItem('selectedCandidateAction')),
        openCandidateModal: true
      });
    }
  }

  onSortChange = (key, orderBy) => {
    this.setState({ sortBy: key, sortOrder: orderBy, activePage: 1 }, () => {
      this.fetchToBeUnarchivedCandidates();
    });
  }

  fetchToBeUnarchivedCandidates = () => {
    const { activePage, sortBy, sortOrder, searchTerm } = this.state;
    this.props.getToBeUnarchivedCandidates({
      page: activePage,
      resultsPerPage: Constants.RECORDS_PER_PAGE,
      orderBy: sortBy,
      orderIn: sortOrder,
      searchTerm: searchTerm.toLowerCase(),
      notificationDate: moment().format('YYYY-MM-DD')
    }).then(() => {
      sessionStorage.setItem('manageCandidateUnarchive',
        JSON.stringify({
          searchTerm,
          sortBy,
          sortOrder,
          activePage
        }));
    });
  }

  viewProfile = (evt, resumeId) => {
    evt.preventDefault();
    this.props.pushState({ pathname: `ProfileSearch/${resumeId}`, query: { isAtsBoard: true } });
  }

  toggleExtendModal = () => {
    this.setState({
      isExtendDateModalOpen: !this.state.isExtendDateModalOpen
    });
  }
  viewRequestDetails = (evt, candidate) => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      selectedCandidate: candidate,
      openCandidateModal: true
    });
    sessionStorage.setItem('selectedCandidateAction', JSON.stringify(candidate));
  }

  toggleCandidateModal = evt => {
    if (evt) evt.preventDefault();
    if (this.state.openCandidateModal && sessionStorage.getItem('selectedCandidateAction')) {
      sessionStorage.removeItem('selectedCandidateAction');
    }
    this.setState(previousState => ({
      openCandidateModal: !previousState.openCandidateModal,
      isExtendDateModalOpen: false
    }));
  }
  resetSearchTerm = () => {
    this.resetPageInput();
    this.setState({ searchTerm: '' }, () => {
      this.fetchToBeUnarchivedCandidates();
    });
  }
  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }
  handlePagination = (direction, pageNo) => {
    const maxPage = Math.ceil(this.props.toBeUnarchivedTotalCount / Constants.RECORDS_PER_PAGE);
    if (direction !== 'goto') {
      this.resetPageInput();
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
      if (currentPage === maxPage) {
        return;
      }
      currentPage += 1;
    } else if (direction === 'first') {
      if (currentPage === 1) {
        return;
      }
      currentPage = 1;
    } else if ((direction === 'last')) {
      if (currentPage === maxPage) {
        return;
      }
      currentPage = maxPage;
    } else {
      currentPage = pageNo;
    }
    this.setState({
      activePage: currentPage
    }, () => {
      this.fetchToBeUnarchivedCandidates();
    });
  }
  selectPageNumber = evt => {
    const pageNo = evt.target.value;
    if (evt.keyCode === 69) {
      evt.preventDefault();
    }
    if (evt.keyCode === 13 && pageNo > 0) {
      this.handlePagination('goto', Number(pageNo));
    }
  }

  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchTerm, activePage: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.fetchToBeUnarchivedCandidates();
      }, 500);
    });
  }

  unArchiveCandidate = resumeId => {
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_UNARCHIVE'), {
      onOk: () => {
        this.props.checkIfArchivable(resumeId).then(res => {
          if (res.isArchivable) {
            this.props.unArchiveCandidate(resumeId, 'toBeUnarchivedCandidates').then(response => {
              this.toggleCandidateModal();
              toastr.success('', response);
            });
          }
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  extendNotifyDateSubmit = () => {
    const { selectedCandidate } = this.state;
    const { extendNotifyDateValues } = this.props;
    this.props.extendArchivedCandidate(selectedCandidate.id, {
      archivalDate: selectedCandidate.archiveScheduleDate,
      isarchiveExtended: true,
      reason: selectedCandidate.archiveReason,
      description: extendNotifyDateValues.description,
      notificationDate: moment(extendNotifyDateValues.notificationDate).format('YYYY-MM-DD'),
      isInstant: true
    }).then(() => {
      toastr.success('', 'Notification date extended');
      this.toggleCandidateModal();
      this.fetchToBeUnarchivedCandidates();
    });
  }
  renderActionBtn = candidate => (
    <button
      onClick={evt => { this.viewRequestDetails(evt, candidate); }}
      className={`${styles.action_btn} button-primary`}
    >
      <span>Take action</span>
      <Image
        src="/icons/arrowRightw.svg"
        className={`${styles.action_btn_icon} right`}
        responsive
      /></button>
  );
  renderToBeUnarchivedCandidates = () => {
    const { toBeUnarchivedCandidates, toBeUnarchivedTotalCount,
      loadingToBeUnarchivedCandidates } = this.props;
    const { sortBy, sortOrder } = this.state;
    const columnDef = [{ render: this.props.formatCandidateName, width: '32.5%' },
      { key: 'archivedOn', render: this.props.renderRequestDate, width: '30%' },
      { key: 'archivedBy', render: this.props.renderRequestRaisedBy, width: '22.5%' },
      { key: 'action', render: this.renderActionBtn, width: '15%' }];
    const column = [{ title: 'NAME', key: 'name', isOrder: true, width: '32.5%' },
      { title: 'ARCHIVED_ON', key: 'archivedOn', isOrder: true, width: '30%' },
      { title: 'ARCHIVED_BY', key: 'archivedBy', width: '22.5%' },
      { title: '', key: 'action', width: '15%' },
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={toBeUnarchivedCandidates}
        sTitle={column}
        tableTitle="MANAGE"
        countTitle="CANDIDATES"
        singularCountTitle="CANDIDATE"
        totalCount={toBeUnarchivedTotalCount}
        onSortChange={this.onSortChange}
        resetSearchTerm={this.resetSearchTerm}
        handlePagination={this.handlePagination}
        selectPageNumber={this.selectPageNumber}
        activePage={this.state.activePage}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchTerm}
        loading={loadingToBeUnarchivedCandidates}
        placeholder={'SEARCH_BY_NAME'}
        initialSortKey={sortBy}
        initialSortOrder={sortOrder}
        isSearch
        isArchiveOrDelete
      />
    );
  }
  render() {
    return (
      <div>
        { this.renderToBeUnarchivedCandidates() }
        {
          this.state.openCandidateModal &&
          <SelectedCandidateDetails
            selectedData={this.state.selectedCandidate}
            viewProfile={this.viewProfile}
            unArchiveCandidate={this.unArchiveCandidate}
            returnLogoText={this.props.returnLogoText}
            toggleExtendModal={this.toggleExtendModal}
            toggleCandidateModal={this.toggleCandidateModal}
            isExtendDateModalOpen={this.state.isExtendDateModalOpen}
            extendNotifyDateSubmit={this.extendNotifyDateSubmit}
            unArchiving={this.props.unArchiving}
          />
        }
      </div>
    );
  }
}

const SelectedCandidateDetails = properties => (
  <div className={styles.overlay}>
    <div className={styles.content}>
      <Image
        src="/close.svg"
        responsive
        onClick={evt => { properties.toggleCandidateModal(evt); }}
        className={styles.close_img}
      />
      <div className={styles.request_header}>
        {i18n.t('CANDIDATE_READY_FOR_UNARCHIVAL')}
        <div className={styles.request_raised_by}>
          {i18n.t('ARCHIVED_BY')} { properties.selectedData.archiveUserFirstname } on&nbsp;
          { moment(properties.selectedData.date).format('MMM Do YYYY') }
        </div>
      </div>
      <div className={styles.tab_request_section}>
        <OverviewDetails
          selectedData={properties.selectedData}
          viewProfile={properties.viewProfile}
          returnLogoText={properties.returnLogoText}
          toggleExtendDateModal={properties.toggleExtendModal}
          isExtendDateModalOpen={properties.isExtendDateModalOpen}
          extendNotifyDateSubmit={properties.extendNotifyDateSubmit}
          isUnarchive
        />
      </div>
      <div className={`${styles.action_btn_section}`}>
        <div style={{ float: 'right' }}>
          <button className={`button-secondary-hover ${styles.cancel_btn}`} onClick={properties.toggleCandidateModal}>
            <span>{i18n.t('CLOSE')}</span>
          </button>
          <NewPermissible operation={{ operation: 'UNARCHIVE_CANDIDATE', model: 'resume' }}>
            <button
              onClick={evt => {
                evt.preventDefault(); properties.unArchiveCandidate(properties.selectedData.id);
              }}
              className={`${styles.unarchive_action_btn} button-primary`}
              disabled={properties.unArchiving}
            >
              <span>
                {properties.unArchiving ?
                  <i
                    className="fa fa-spinner fa-spin p-l-r-7 m-r-5"
                    aria-hidden="true"
                  /> : ''}
                {i18n.t('UNARCHIVE')}
              </span>
            </button>
          </NewPermissible>
        </div>
      </div>
    </div>
  </div>
);
