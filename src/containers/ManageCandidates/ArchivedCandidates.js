import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import Constants from './../../helpers/Constants';
import { CustomTable } from '../../components';
import toastrErrorHandling from '../toastrErrorHandling';
import { getArchivedCandidates, unArchiveCandidate, checkIfArchivable }
  from '../../redux/modules/profile-search/managecandidates';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import styles from './Candidates.scss';

let timeoutId = 0;

@connect(state => ({
  archivedCandidates: state.managecandidates.archivedCandidates,
  archivedTotalCount: state.managecandidates.archivedTotalCount,
  loadingArchivedCandidates: state.managecandidates.loadingArchivedCandidates,
  unArchiving: state.managecandidates.unArchiving,
  unArchivingResumeId: state.managecandidates.unArchivingResumeId
}), {
  getArchivedCandidates,
  unArchiveCandidate,
  checkIfArchivable
})
export default class ArchivedCandidates extends Component {
  static propTypes = {
    formatCandidateName: PropTypes.func.isRequired,
    renderRequestRaisedBy: PropTypes.func.isRequired,
    renderRequestDate: PropTypes.func.isRequired,
    getArchivedCandidates: PropTypes.func.isRequired,
    unArchiveCandidate: PropTypes.func.isRequired,
    checkIfArchivable: PropTypes.func.isRequired,
    archivedCandidates: PropTypes.array.isRequired,
    archivedTotalCount: PropTypes.number.isRequired,
    loadingArchivedCandidates: PropTypes.bool.isRequired,
    unArchiving: PropTypes.bool.isRequired,
    unArchivingResumeId: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      sortBy: 'archivedOn',
      sortOrder: 'desc',
      activePage: 1
    };
  }
  componentWillMount() {
    const manageCandidatesFilter = JSON.parse(sessionStorage.getItem('manageCandidateArchive'));
    if (manageCandidatesFilter) {
      this.setState(manageCandidatesFilter, () => {
        this.fetchArchivedCandidates();
      });
    } else {
      this.fetchArchivedCandidates();
    }
    const isUnArchivePermitted = NewPermissible.isPermitted({ operation: 'UNARCHIVE_CANDIDATE', model: 'resume' });
    this.setState({
      isUnArchivePermitted
    });
  }

  onSortChange = (key, orderBy) => {
    this.setState({ sortBy: key, sortOrder: orderBy, activePage: 1 }, () => {
      this.fetchArchivedCandidates();
    });
  }
  fetchArchivedCandidates = () => {
    const { activePage, sortBy, sortOrder, searchTerm } = this.state;
    this.props.getArchivedCandidates({
      page: activePage,
      resultsPerPage: Constants.RECORDS_PER_PAGE,
      orderBy: sortBy,
      orderIn: sortOrder,
      searchTerm: searchTerm.toLowerCase()
    }).then(() => {
      sessionStorage.setItem('manageCandidateArchive',
        JSON.stringify({
          searchTerm,
          sortBy,
          sortOrder,
          activePage
        }));
    });
  }
  resetSearchTerm = () => {
    this.resetPageInput();
    this.setState({ searchTerm: '' }, () => {
      this.fetchArchivedCandidates();
    });
  }
  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }
  handlePagination = (direction, pageNo) => {
    const maxPage = Math.ceil(this.props.archivedTotalCount / Constants.RECORDS_PER_PAGE);
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
      this.fetchArchivedCandidates();
    });
  }
  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchTerm, activePage: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.fetchArchivedCandidates();
      }, 500);
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

  unArchiveCandidate = resumeId => {
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_UNARCHIVE'), {
      onOk: () => {
        this.props.checkIfArchivable(resumeId).then(res => {
          if (res.isArchivable) {
            this.props.unArchiveCandidate(resumeId, 'archivedCandidates').then(response => {
              this.fetchArchivedCandidates();
              toastr.success('', response);
            });
          } else {
            toastr.info('', i18n.t('CANDIDATE_IS_CURRENTLY_ASSOCIATED_TO_JOB_OPENINGS'));
          }
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  renderUnarchiveBtn = candidate => {
    const { unArchiving, unArchivingResumeId } = this.props;
    const { isUnArchivePermitted } = this.state;
    return (
      isUnArchivePermitted ?
        <button
          onClick={evt => { evt.preventDefault(); this.unArchiveCandidate(candidate.id); }}
          className={`${styles.action_btn} ${styles.unarchive_btn} button-secondary`}
          disabled={unArchiving && unArchivingResumeId === candidate.id}
        >
          <span>
            {unArchiving && unArchivingResumeId === candidate.id ?
              <i
                className="fa fa-spinner fa-spin p-l-r-7 m-r-5"
                aria-hidden="true"
              /> : ''}
            {i18n.t('UNARCHIVE')}
          </span>
        </button>
        : ''
    );
  }

  renderArchivedCandidates = () => {
    const { archivedCandidates, archivedTotalCount,
      loadingArchivedCandidates } = this.props;
    const { isUnArchivePermitted, sortBy, sortOrder } = this.state;
    const columnDef = [
      { render: this.props.formatCandidateName, width: '32.5%' },
      { key: 'archivedOn', render: this.props.renderRequestDate, width: '30%' },
      { key: 'archivedBy', render: this.props.renderRequestRaisedBy, width: '22.5%' },
    ];
    const column = [
      { title: 'NAME', key: 'name', isOrder: true, width: '32.5%' },
      { title: 'ARCHIVED_ON', key: 'archivedOn', isOrder: true, width: '30%' },
      { title: 'ARCHIVED_BY', key: 'archivedBy', width: '22.5%' },
    ];
    if (isUnArchivePermitted) {
      columnDef.push({ key: 'unArchive', render: this.renderUnarchiveBtn, width: '15%', isPermission: true });
      column.push({ title: '', key: 'unArchive', width: '15%' });
    }
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={archivedCandidates}
        sTitle={column}
        tableTitle="MANAGE"
        countTitle="CANDIDATES"
        singularCountTitle="CANDIDATE"
        totalCount={archivedTotalCount}
        onSortChange={this.onSortChange}
        resetSearchTerm={this.resetSearchTerm}
        handlePagination={this.handlePagination}
        selectPageNumber={this.selectPageNumber}
        activePage={this.state.activePage}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchTerm}
        loading={loadingArchivedCandidates}
        placeholder={'SEARCH_BY_NAME'}
        initialSortKey={sortBy}
        initialSortOrder={sortOrder}
        isSearch
        isArchiveOrDelete
        unArchiving={this.props.unArchiving}
      />
    );
  }
  render() {
    return (
      this.renderArchivedCandidates()
    );
  }
}
