import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Image } from 'react-bootstrap';
import { toastr } from 'react-redux-toastr';
import { push as pushState } from 'react-router-redux';
import { getFormValues } from 'redux-form';
import { CustomTable } from '../../components';
import { loadUnArchivedCompanies, extendDateForAlreadyArchivedCompany,
  unArchiveCompany } from '../../redux/modules/customers/manageCustomers';
import styles from '../ManageCandidates/Candidates.scss';
import OverviewDetails from './OverviewDetails';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';
import Constants from '../../helpers/Constants';
import NewPermissible from '../../components/Permissible/NewPermissible';

let timeoutId = 0;

@connect(state => ({
  unArchivedCompanies: state.manageCustomers.unArchivedCompanies,
  extendNotifyDateValues: getFormValues('extendNotifyDate')(state),
  unArchivedCompaniesTotal: state.manageCustomers.unArchivedCompaniesTotal,
  unArchivedCompaniesLoading: state.manageCustomers.loadingUnArchivedCompanies,
  unArchiving: state.manageCustomers.unArchiving,
}), { pushState, loadUnArchivedCompanies, extendDateForAlreadyArchivedCompany, unArchiveCompany })
export default class ToBeUnarchivedCompanies extends Component {
  static propTypes = {
    pushState: PropTypes.func.isRequired,
    formatCompanyName: PropTypes.func.isRequired,
    renderRequestDate: PropTypes.func.isRequired,
    renderRequestRaisedBy: PropTypes.func.isRequired,
    unArchiving: PropTypes.bool,
    unArchivedCompanies: PropTypes.array,
    extendNotifyDateValues: PropTypes.object,
    unArchivedCompaniesTotal: PropTypes.number,
    unArchivedCompaniesLoading: PropTypes.bool,
    extendDateForAlreadyArchivedCompany: PropTypes.func.isRequired,
    unArchiveCompany: PropTypes.func.isRequired,
    loadUnArchivedCompanies: PropTypes.func.isRequired
  };

  static defaultProps = {
    unArchivedCompanies: [],
    unArchivedCompaniesTotal: 0,
    extendNotifyDateValues: null,
    unArchiving: false,
    unArchivedCompaniesLoading: false
  };

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      activePage: 1,
      sortBy: 'name',
      sortOrder: 'desc',
      notificationDate: moment(new Date()).format('YYYY-MM-DD'),
      loadingUnarchivedCompanies: false
    };
  }

  componentWillMount() {
    const manageCompanyFilter = JSON.parse(sessionStorage.getItem('manageCompanyUnarchive'));
    if (manageCompanyFilter) {
      this.setState(manageCompanyFilter, () => {
        this.loadUnArchivedCompanies();
      });
    } else {
      this.loadUnArchivedCompanies();
    }
    if (sessionStorage.getItem('selectedCompanyAction')) {
      this.setState({
        selectedCompany: JSON.parse(sessionStorage.getItem('selectedCompanyAction')),
        openCompanyModal: true
      });
    }
  }

  onSortChange = (key, orderBy) => {
    this.setState({ sortBy: key, sortOrder: orderBy, activePage: 1 }, () => {
      this.loadUnArchivedCompanies();
    });
  }

  loadUnArchivedCompanies = () => {
    const { searchTerm, activePage, sortBy, sortOrder } = this.state;
    this.props.loadUnArchivedCompanies({
      resultsPerPage: 15,
      searchTerm,
      page: activePage,
      orderBy: sortBy,
      orderIn: sortOrder,
      notificationDate: moment(new Date()).format('YYYY-MM-DD')
    }).then(() => {
      sessionStorage.setItem('manageCompanyUnarchive',
        JSON.stringify({
          searchTerm,
          sortBy,
          sortOrder,
          activePage
        }));
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
    const maxPage = Math.ceil(this.props.unArchivedCompaniesTotal / Constants.RECORDS_PER_PAGE);
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
      this.loadUnArchivedCompanies();
    });
  }

  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchTerm, activePage: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.loadUnArchivedCompanies();
      }, 500);
    });
  }

  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  resetSearchTerm = () => {
    this.resetPageInput();
    this.setState({ searchTerm: '' }, () => {
      this.loadUnArchivedCompanies();
    });
  }

  viewRequestDetails = (evt, company) => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      selectedCompany: company,
      openCompanyModal: true
    });
    sessionStorage.setItem('selectedCompanyAction', JSON.stringify(company));
  }

  viewCompany = (evt, companyId) => {
    evt.preventDefault();
    this.props.pushState(`Company/${companyId}`);
  }

  toggleCompanyModal = evt => {
    if (evt) evt.preventDefault();
    if (this.state.openCompanyModal && sessionStorage.getItem('selectedCompanyAction')) {
      sessionStorage.removeItem('selectedCompanyAction');
    }
    this.setState({
      openCompanyModal: !this.state.openCompanyModal,
      isExtendDateModalOpen: false
    });
  }

  unArchiveCompany = companyId => {
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_UNARCHIVE'), {
      onOk: () => {
        this.setState({
          loadingUnarchivedCompanies: true
        });
        this.props.unArchiveCompany(companyId, 'toBeUnarchivedCandidates').then(response => {
          toastr.success('', response);
          this.toggleCompanyModal();
          setTimeout(() => {
            this.loadUnArchivedCompanies();
            this.setState({
              loadingUnarchivedCompanies: false
            });
          }, 1000);
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  toggleExtendModal = () => {
    this.setState({
      isExtendDateModalOpen: !this.state.isExtendDateModalOpen
    });
  }

  extendNotifyDateSubmit = () => {
    const { selectedCompany } = this.state;
    const { extendNotifyDateValues } = this.props;
    this.props.extendDateForAlreadyArchivedCompany(selectedCompany.id, {
      archivalDate: selectedCompany.archiveScheduleDate,
      isarchiveExtended: true,
      reason: selectedCompany.archiveReason,
      description: extendNotifyDateValues.description,
      notificationDate: moment(extendNotifyDateValues.notificationDate).format('YYYY-MM-DD'),
      isInstant: true
    }).then(() => {
      toastr.success('', 'Notification date extended');
      this.toggleCompanyModal();
      setTimeout(() => {
        this.loadUnArchivedCompanies();
        this.setState({
          loadingUnarchivedCompanies: false
        });
      }, 1000);
    });
  }

  renderActionBtn = company => (
    <button
      onClick={evt => { this.viewRequestDetails(evt, company); }}
      className={`${styles.action_btn} button-primary`}
    >
      <span>Take action</span>
      <Image
        src="/icons/arrowRightw.svg"
        className={`${styles.action_btn_icon} right`}
        responsive
      /></button>
  );

  renderArchivedCompanies = () => {
    const { unArchivedCompanies, unArchivedCompaniesTotal } = this.props;
    const { sortBy, sortOrder } = this.state;
    const columnDef = [
      { render: this.props.formatCompanyName, width: '32.5%' },
      { key: 'archivedOn', render: this.props.renderRequestDate, width: '30%' },
      { key: 'raisedBy', render: this.props.renderRequestRaisedBy, width: '22.5%' },
      { key: 'action', render: this.renderActionBtn, width: '15%' }
    ];
    const column = [
      { title: 'NAME', key: 'name', isOrder: true, width: '32.5%' },
      { title: 'ARCHIVED_ON', key: 'archivedOn', isOrder: true, width: '30%' },
      { title: 'RAISED_BY', key: 'raisedBy', width: '22.5%' },
      { title: '', key: 'action', width: '15%' }
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={unArchivedCompanies}
        sTitle={column}
        tableTitle="MANAGE"
        countTitle="COMPANIES"
        singularCountTitle="COMPANY"
        selectPageNumber={this.selectPageNumber}
        handlePagination={this.handlePagination}
        activePage={this.state.activePage}
        totalCount={unArchivedCompaniesTotal}
        onSortChange={this.onSortChange}
        initialSortKey={sortBy}
        initialSortOrder={sortOrder}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchTerm}
        resetSearchTerm={this.resetSearchTerm}
        loading={this.props.unArchivedCompaniesLoading || this.state.loadingUnarchivedCompanies}
        placeholder={'SEARCH_BY_NAME'}
        isSearch
      />
    );
  }

  render() {
    return (
      <div>
        {this.renderArchivedCompanies()}
        {
          this.state.openCompanyModal &&
          <SelectedCompanyDetails
            selectedData={this.state.selectedCompany}
            viewCompany={this.viewCompany}
            unArchiveCompany={this.unArchiveCompany}
            formatCompanyName={this.props.formatCompanyName}
            toggleExtendModal={this.toggleExtendModal}
            toggleCompanyModal={this.toggleCompanyModal}
            isExtendDateModalOpen={this.state.isExtendDateModalOpen}
            extendNotifyDateSubmit={this.extendNotifyDateSubmit}
            unArchiving={this.props.unArchiving}
          />
        }
      </div>
    );
  }
}

const SelectedCompanyDetails = properties => (
  <div className={styles.overlay}>
    <div className={styles.content}>
      <Image
        src="/close.svg"
        responsive
        onClick={evt => { properties.toggleCompanyModal(evt); }}
        className={styles.close_img}
      />
      <div className={styles.request_header}>
        {i18n.t('COMPANY_READY_FOR_UNARCHIVAL')}
        <div className={styles.request_raised_by}>
          {i18n.t('ARCHIVED_BY')} {properties.selectedData.archiveUserFirstname} on {moment(properties.selectedData.date).format('MMM Do YYYY')}
        </div>
      </div>
      <div className={styles.tab_request_section}>
        <OverviewDetails
          selectedData={properties.selectedData}
          viewCompany={properties.viewCompany}
          formatCompanyName={properties.formatCompanyName}
          toggleExtendDateModal={properties.toggleExtendModal}
          isExtendDateModalOpen={properties.isExtendDateModalOpen}
          extendNotifyDateSubmit={properties.extendNotifyDateSubmit}
          isUnarchive
        />
      </div>
      <div className={`${styles.action_btn_section}`}>
        <div style={{ float: 'right' }}>
          <button className={`button-secondary-hover ${styles.cancel_btn}`} onClick={properties.toggleCompanyModal}>
            <span>{i18n.t('CLOSE')}</span>
          </button>
          <NewPermissible operation={{ operation: 'COMPANY_UNARCHIVE', model: 'customer' }}>
            <button
              onClick={evt => {
                evt.preventDefault(); properties.unArchiveCompany(properties.selectedData.id);
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
