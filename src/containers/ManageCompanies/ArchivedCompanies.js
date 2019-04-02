import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import Constants from './../../helpers/Constants';
import { CustomTable } from '../../components';
import { loadArchivedCompany, unArchiveCompany } from '../../redux/modules/customers/manageCustomers';
import styles from '../ManageCandidates/Candidates.scss';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import NewPermissible from '../../components/Permissible/NewPermissible';

let timeoutId = 0;

@connect(state => ({
  archivedCompanies: state.manageCustomers.archivedCompanies,
  loadingArchivedCompanies: state.manageCustomers.loadingArchivedCompanies,
  totalCount: state.manageCustomers.archivedCompaniesTotalCompany
}), {
  pushState, loadArchivedCompany, unArchiveCompany
})
export default class ArchivedCompanies extends Component {
  static propTypes = {
    pushState: PropTypes.func.isRequired,
    formatCompanyName: PropTypes.func.isRequired,
    unArchivingResumeId: PropTypes.string,
    renderRequestRaisedBy: PropTypes.func.isRequired,
    renderRequestDate: PropTypes.func.isRequired,
    loadArchivedCompany: PropTypes.func.isRequired,
    archivedCompanies: PropTypes.array,
    loadingArchivedCompanies: PropTypes.bool,
    totalCount: PropTypes.number,
    unArchiving: PropTypes.bool,
    unArchiveCompany: PropTypes.func.isRequired
  };

  static defaultProps = {
    archivedCompanies: [],
    loadingArchivedCompanies: false,
    totalCount: 0,
    unArchivingResumeId: '',
    unArchiving: false
  }

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      activePage: 1,
      sortBy: 'archivedOn',
      sortOrder: 'desc',
      loadingArchivedCompanies: false
    };
  }
  componentWillMount() {
    const manageCompanyFilter = JSON.parse(sessionStorage.getItem('manageCompanyArchive'));
    if (manageCompanyFilter) {
      this.setState(manageCompanyFilter, () => {
        this.loadArchivedCompanies();
      });
    } else {
      this.loadArchivedCompanies();
    }
    const isUnArchiveCompanyPermitted = NewPermissible.isPermitted({
      operation: 'COMPANY_UNARCHIVE',
      model: 'customer'
    });
    this.setState({
      isUnArchiveCompanyPermitted
    });
  }

  onSortChange = (key, orderBy) => {
    this.setState({ sortBy: key, sortOrder: orderBy, activePage: 1 }, () => {
      this.loadArchivedCompanies();
    });
  }

  setScrollToTop = () => {
    if (this.scrollbar) {
      this.scrollbar.scrollToTop();
    }
  }

  loadArchivedCompanies = () => {
    const { searchTerm, activePage, sortBy, sortOrder } = this.state;
    this.props.loadArchivedCompany({
      resultsPerPage: 15,
      searchTerm,
      page: activePage,
      orderBy: sortBy,
      orderIn: sortOrder
    }).then(() => {
      sessionStorage.setItem('manageCompanyArchive',
        JSON.stringify({ searchTerm,
          activePage,
          sortBy,
          sortOrder }));
    });
  }
  viewCompany = (evt, companyId) => {
    evt.preventDefault();
    this.props.pushState(`/Company/${companyId}`);
  }
  resetPageInput = () => {
    if (document.getElementById('goToCandidates')) {
      document.getElementById('goToCandidates').value = '';
    }
  }

  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchTerm, activePage: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.loadArchivedCompanies();
      }, 500);
    });
  }

  selectPageNumber = evt => {
    const pageNo = evt.target.value;
    if (evt.keyCode === 69) {
      evt.preventDefault();
    }
    if (evt.keyCode === 13 && pageNo > 0) {
      this.setScrollToTop();
      this.handlePagination('goto', Number(pageNo));
    }
  }

  resetSearchTerm = () => {
    this.resetPageInput();
    this.setState({ searchTerm: '' }, () => {
      this.loadArchivedCompanies();
    });
  }

  unArchiveCompany = companyId => {
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_UNARCHIVE'), {
      onOk: () => {
        this.setState({
          loadingArchivedCompanies: true
        });
        this.props.unArchiveCompany(companyId).then(response => {
          toastr.success('', response);
          setTimeout(() => {
            this.loadArchivedCompanies();
            this.setState({
              loadingArchivedCompanies: false
            });
          }, 1000);
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
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

  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchTerm, activePage: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.loadArchivedCompanies();
      }, 500);
    });
  }

  resetSearchTerm = () => {
    this.resetPageInput();
    this.setState({ searchTerm: '' }, () => {
      this.loadArchivedCompanies();
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

  handlePagination = (direction, pageNo) => {
    const maxPage = Math.ceil(this.props.totalCount / Constants.RECORDS_PER_PAGE);
    if (direction !== 'goto') {
      this.resetPageInput();
    }
    if (maxPage < pageNo) {
      const msgObj = { statusCode: 200 };
      toastrErrorHandling(msgObj, i18n.t('errorMessage.PAGINATION_ERROR'),
        i18n.t('errorMessage.NO_PAGE_FOUND'));
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
      this.loadArchivedCompanies();
    });
  }

  renderUnarchiveBtn = company => {
    const { unArchiving, unArchivingResumeId } = this.props;
    return (<button
      onClick={evt => { evt.preventDefault(); this.unArchiveCompany(company.id); }}
      className={`${styles.action_btn} ${styles.unarchive_btn} button-secondary`}
      disabled={unArchiving && unArchivingResumeId === company.id}
    >
      <span>
        {unArchiving && unArchivingResumeId === company.id ?
          <i
            className="fa fa-spinner fa-spin p-l-r-7 m-r-5"
            aria-hidden="true"
          /> : ''}
        {i18n.t('UNARCHIVE')}
      </span>
    </button>);
  }

  renderArchivedCompanies = () => {
    const { archivedCompanies, totalCount } = this.props;
    const { sortBy, sortOrder, isUnArchiveCompanyPermitted } = this.state;
    const columnDef = [
      { render: this.props.formatCompanyName, width: '32.5%' },
      { key: 'archivedOn', render: this.props.renderRequestDate, width: '30%' },
      { key: 'raisedBy', render: this.props.renderRequestRaisedBy, width: '22.5%' }];
    const column = [
      { title: 'NAME', key: 'name', isOrder: true, width: '32.5%' },
      { title: 'ARCHIVED_ON', key: 'archivedOn', isOrder: true, width: '30%' },
      { title: 'RAISED_BY', key: 'raisedBy', width: '22.5%' }
    ];
    if (isUnArchiveCompanyPermitted) {
      columnDef.push({ key: 'unArchive', render: this.renderUnarchiveBtn, width: '15%' });
      column.push({ title: '', key: 'unArchive', width: '15%' });
    }
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={archivedCompanies}
        sTitle={column}
        tableTitle="MANAGE"
        countTitle="COMPANIES"
        singularCountTitle="COMPANY"
        selectPageNumber={this.selectPageNumber}
        handlePagination={this.handlePagination}
        activePage={this.state.activePage}
        totalCount={totalCount}
        onSortChange={this.onSortChange}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchTerm}
        initialSortKey={sortBy}
        initialSortOrder={sortOrder}
        resetSearchTerm={this.resetSearchTerm}
        loading={this.props.loadingArchivedCompanies || this.state.loadingArchivedCompanies}
        placeholder={'SEARCH_BY_NAME'}
        isSearch
      />
    );
  }
  render() {
    return (
      this.renderArchivedCompanies()
    );
  }
}
