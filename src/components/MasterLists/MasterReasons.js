import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import DropdownList from 'react-widgets/lib/DropdownList';
import NewPermissible from '../../components/Permissible/NewPermissible';
import { loadMasterReasons, addMasterReason, updateMasterReason } from '../../redux/modules/MasterLists/index.js';
import styles from '../../containers/Users/Users.scss';
import i18n from '../../i18n';
import UserMenu from '../../containers/Users/UserMenu.js';
import Constants from '../../helpers/Constants';
import CustomTable from '../CustomTable/CustomTable.js';
import toastrErrorHandling from '../../containers/toastrErrorHandling.js';
import AddMasterReason from './AddMasterReason.js';

let timeoutId = 0;
@connect(state => ({
  reasonList: state.masterLists.reasonList || [],
  totalCount: state.masterLists.reasonTotalCount || 0,
  reasonTypes: state.masterLists.reasonTypes || [],
  loading: state.masterLists.loading,
}), { loadMasterReasons, addMasterReason, updateMasterReason })
export default class MasterReasons extends Component {
  static propTypes = {
    totalCount: PropTypes.number,
    loading: PropTypes.bool.isRequired,
    reasonList: PropTypes.array.isRequired,
    reasonTypes: PropTypes.array.isRequired,
    loadMasterReasons: PropTypes.func.isRequired,
    addMasterReason: PropTypes.func.isRequired,
    updateMasterReason: PropTypes.func.isRequired
  }

  static defaultProps = {
    totalCount: 0
  }

  constructor(props) {
    super(props);
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT_REASONS', model: 'reasons' });
    this.state = {
      searchTerm: '',
      sortKey: 'modifiedAt',
      sortOrder: 'desc',
      page: 1,
      reasonType: '',
      isAddReasonModal: false,
      selectedReasonType: { id: '', name: 'All' },
      isEdit: false,
      isEditPermitted,
      reasonData: { name: '', type: null },
      previousValues: ''
    };
  }

  componentWillMount() {
    this.fetchReasonsList();
  }

  onSortChange = (sortKey, sortOrder) => {
    this.setState({ sortKey, sortOrder, page: 1 }, () => {
      this.fetchReasonsList();
    });
  }
  fetchReasonsList = scrollbars => {
    const { searchTerm, reasonType, sortKey, sortOrder, page } = this.state;
    this.props.loadMasterReasons({
      searchTerm,
      reasonType,
      orderBy: `${sortKey} ${sortOrder}`,
      skip: (page - 1) * 15,
      limit: 15
    }).then(() => {
      if (scrollbars) {
        scrollbars.scrollToTop();
      }
    });
  }

  formatDate = (data, key) => (data[key] ?
    <span>{moment(data[key]).format('DD MMM YYYY')}</span> : '');

  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchTerm, page: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.fetchReasonsList();
      }, 500);
    });
  }

  handlePagination = (direction, pageNo) => {
    const maxPage = Math.ceil(this.props.totalCount / Constants.RECORDS_PER_PAGE);
    if (direction !== 'goto') {
      this.resetPageInput();
    }
    if (maxPage < pageNo) {
      const msgObj = { statusCode: 200 };
      toastrErrorHandling(msgObj, i18n.t('errorMessage.PAGINATION_ERROR'), i18n.t('errorMessage.NO_PAGE_FOUND'));
      return null;
    }
    let currentPage = this.state.page;
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
      page: currentPage
    }, () => {
      this.fetchReasonsList();
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

  resetSearchTerm = () => {
    this.resetPageInput();
    this.setState({ searchTerm: '', page: 1 }, () => {
      this.fetchReasonsList();
    });
  }

  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  toggleReasonModal = () => {
    this.setState({
      isAddReasonModal: !this.state.isAddReasonModal, reasonData: { name: '', type: null }, isEdit: false });
  }

  handleSubmit = data => {
    const query = {
      ...data,
      name: data.name.trim(),
      type: data.type.id || data.type,
    };
    const deviceDetail = JSON.parse(localStorage.getItem('deviceDetails'));
    query.deviceDetails = deviceDetail;
    if (!this.state.isEdit) {
      this.props.addMasterReason(query).then(() => {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.ADD_REASON_SUCCESSFULLY'));
        this.toggleReasonModal();
        this.fetchReasonsList();
      }, error => {
        if (error.error.statusCode === 409) {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.REASON_ALREADY_EXISTS'));
        } else {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.ADD_REASON_FAILED'));
        }
        this.toggleReasonModal();
      });
    } else {
      query.previousValues = this.state.previousValues;
      this.props.updateMasterReason(query, data.id).then(() => {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.ADD_REASON_SUCCESSFULLY'));
        this.toggleReasonModal();
        this.fetchReasonsList();
      }, error => {
        if (error.error.statusCode === 409) {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.REASON_ALREADY_EXISTS'));
        } else {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.REASON_UPDATION_FAILED'));
        }
        this.toggleReasonModal();
      });
    }
  }

  handleEdit = reasonData => {
    this.setState({ isAddReasonModal: true, reasonData, isEdit: true, previousValues: reasonData });
  }

  handleOnReasonFilterChange = (option, scrollbar) => {
    this.setState({ selectedReasonType: option, reasonType: option.id, page: 1 }, () => {
      this.fetchReasonsList(scrollbar);
    });
  }

  renderFilter = scrollbar => {
    const reasons = [{ id: '', name: i18n.t('ALL') }, ...this.props.reasonTypes];
    return (
      <DropdownList
        name="reasonTypeFilter"
        data={reasons}
        valueField="id"
        textField="name"
        onChange={option => this.handleOnReasonFilterChange(option, scrollbar)}
        value={this.state.selectedReasonType}
      />
    );
  }

  renderMasterReasons = () => {
    const { reasonList, totalCount } = this.props;
    const columnDef = [
      { key: 'name' },
      { key: 'type' },
      { key: 'createdAt', render: value => this.formatDate(value, 'createdAt') },
      { key: 'modifiedAt', render: value => this.formatDate(value, 'modifiedAt') },
      { key: 'actions',
        operation: [{ operation: 'EDIT_REASONS', model: 'reasons' }]
      }
    ];
    const column = [
      { title: 'NAME', key: 'name', isOrder: true },
      { title: 'TYPE', key: 'type' },
      { title: 'CREATED_AT', key: 'createdAt', isOrder: true },
      { title: 'UPDATED_AT', key: 'modifiedAt', isOrder: true },
      { title: 'ACTIONS',
        operation: [{ operation: 'EDIT_REASONS', model: 'reasons' }],
        restrictedComponent: 'ACTIONS',
        isRestricted: true
      }
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={reasonList}
        sTitle={column}
        isFilter
        renderFilter={this.renderFilter}
        selectPageNumber={this.selectPageNumber}
        handlePagination={this.handlePagination}
        activePage={this.state.page}
        totalCount={totalCount}
        onSortChange={this.onSortChange}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchTerm}
        resetSearchTerm={this.resetSearchTerm}
        loading={this.props.loading}
        initialSortKey="modifiedAt"
        initialSortOrder="desc"
        isEdit
        isEditPermitted={this.state.isEditPermitted}
        placeholder="SEARCH_BY_NAME"
        handleEdit={this.handleEdit}
        isSearch
      />
    );
  }

  render() {
    const { totalCount, reasonTypes } = this.props;
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={styles.users_container}>
        <Helmet title={i18n.t('MASTER_REASONS')} />
        <Col lg={2} md={2} sm={2} xs={12} className="p-0">
          <Col lg={12} md={12} sm={12} xs={12} className={styles.sidenav}>
            <Col lg={12} md={12} sm={12} xs={12} className="p-0">
              <UserMenu />
            </Col>
          </Col>
        </Col>
        <Col lg={10} md={10} sm={10} xs={12} className={`${styles.users_table}`}>
          <Col lg={12} md={12} sm={12} xs={12} className={'p-0 '}>
            <Col lg={12} md={12} sm={12} xs={12} className="m-t-15 m-b-15 m-l-0 m-r-0 p-l-30 p-r-30">
              <div className={`${styles.page_title}`}>
                <Trans>MANAGE_MASTER_REASONS</Trans>
                <span className={`${styles.count}`}>
                  {` (${totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${totalCount > 1 ?
                    i18n.t('REASONS') : i18n.t('REASON')})`
                  }
                </span>
              </div>
              <div
                className={`${styles.job_category_actions} m-b-5`}
                style={{ display: 'inline-block' }}
              >
                {/* <NewPermissible operation={{ operation: 'CREATE_JOBCATEGORY', model: 'jobCategory' }}> */}
                <button
                  className={`button-primary ${styles.invite}`}
                  onClick={this.toggleReasonModal}
                >
                  <i className="fa fa-plus p-r-5" />
                  <Trans>ADD</Trans>
                </button>
                {/* </NewPermissible> */}
              </div>
            </Col>
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <Col xs={12} md={12} className={styles.tableStyles}>
                {this.renderMasterReasons()}
              </Col>
            </Row>
          </Col>
        </Col>
        {
          this.state.isAddReasonModal &&
          <AddMasterReason
            onSubmit={this.handleSubmit}
            onClose={this.toggleReasonModal}
            loading={this.props.loading}
            reasonTypes={reasonTypes}
            initialValues={this.state.reasonData}
            isEdit={this.state.isEdit}
          />
        }
      </Col>
    );
  }
}
