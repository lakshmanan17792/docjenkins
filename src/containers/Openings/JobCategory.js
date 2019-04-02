import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isPristine } from 'redux-form';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
import moment from 'moment';
// import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';
import { Row, Col, Button, Label } from 'react-bootstrap';
import Constants from './../../helpers/Constants';
import toastrErrorHandling from '../toastrErrorHandling';
import {
  addJobCategory,
  loadJobCategoryList,
  updateJobCategory,
  deleteJobCategory
} from '../../redux/modules/job-category';
import UserMenu from '../Users/UserMenu';
import JobCategoryForm from '../../components/JobCategoryForm/JobCategoryForm';
import { trimExtraSpaces } from '../../utils/validation';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import CustomTable from '../../components/CustomTable/CustomTable';

const styles = require('../Users/Users.scss');

let timeoutId = 0;
@connect((state, route) => ({
  users: state.users.data,
  isJobCategoryPristine: isPristine('jobCategory')(state),
  jobCategoryFormData: state.form.jobCategory,
  loading: state.jobCategory.loading,
  route: route.route,
  router: route.router,
  categoryList: state.jobCategory.categoryList || {},
  addResponse: state.jobCategory.addResponse || {},
  totalCount: state.jobCategory.totalCount || 0,
  user: state.auth.user
}), {
  addJobCategory,
  loadJobCategoryList,
  updateJobCategory,
  deleteJobCategory
})
export default class JobCategory extends Component {
  static propTypes = {
    router: PropTypes.any.isRequired,
    addJobCategory: PropTypes.func.isRequired,
    loadJobCategoryList: PropTypes.func.isRequired,
    updateJobCategory: PropTypes.func.isRequired,
    isJobCategoryPristine: PropTypes.bool,
    jobCategoryFormData: PropTypes.object,
    route: PropTypes.object.isRequired,
    deleteJobCategory: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    categoryList: PropTypes.array.isRequired,
    // addResponse: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  static defaultProps = {
    categoryList: [],
    jobCategoryFormData: null,
    isJobCategoryPristine: null,
    addResponse: {},
    totalCount: 0
  };

  constructor(props) {
    super(props);
    this.state = {
      openCategoryModal: false,
      isEdit: false,
      selectedJobCategory: {},
      activePage: 1,
      sortKey: 'modifiedAt',
      sortOrder: 'DESC',
      searchTerm: ''
    };
  }

  componentWillMount() {
    this.props.loadJobCategoryList({
      page: 1, limit: Constants.RECORDS_PER_PAGE, searchTerm: '', orderBy: 'modifiedAt DESC' });
    const isDeleteMePermitted = NewPermissible.isPermitted({ operation: 'DELETE_ME', model: 'jobCategory' });
    const isDeletePermitted = NewPermissible.isPermitted({ operation: 'DELETE', model: 'jobCategory' });
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT', model: 'jobCategory' });
    this.setState({
      isDeleteMePermitted,
      isDeletePermitted,
      isEditPermitted
    });
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.jobCategoryFormData && Object.keys(this.props.jobCategoryFormData).length > 0
        && !this.props.isJobCategoryPristine && this.state.openCategoryModal) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      }
    });
  }


  onSortChange = (key, orderBy) => {
    const { searchTerm } = this.state;
    this.setState({ sortKey: key, sortOrder: orderBy, activePage: 1 }, () => {
      this.props.loadJobCategoryList({
        page: 1, limit: Constants.RECORDS_PER_PAGE, orderBy: `${key} ${orderBy}`, searchTerm });
    });
  }

  getDeletePermission = jobCategory => {
    const { isDeleteMePermitted, isDeletePermitted } = this.state;
    const { user } = this.props;
    let isPermitted = false;
    if (isDeletePermitted) {
      isPermitted = true;
    } else if (isDeleteMePermitted && (jobCategory && jobCategory.createdBy) === (user && user.id)) {
      isPermitted = true;
    }
    return isPermitted;
  }

  getCategoryStatusBtn = jobCategory => {
    if (jobCategory.isActive) {
      return (
        <NewPermissible
          restrictedComponent={<Button
            title={i18n.t('tooltipMessage.CLICK_TO_DEACTIVATE_CATEGORY')}
            bsStyle="primary"
            className={styles.active_button}
            onClick={() => this.handleCategoryStatus(jobCategory, 0)}
          >
            <Trans>ACTIVE</Trans>
          </Button>}
          permittedComponent={<Label bsStyle="primary p-l-10 p-r-10 p-t-5 p-b-5"><Trans>ACTIVE</Trans></Label>}
          operation={{ operation: 'EDIT', model: 'jobCategory' }}
        />
      );
    }
    return (
      <NewPermissible
        restrictedComponent={<Button
          title={i18n.t('tooltipMessage.CLICK_TO_ACTIVATE_CATEGORY')}
          bsStyle="warning"
          className={'p-l-r-10'}
          onClick={() => this.handleCategoryStatus(jobCategory, 1)}
        >
          <Trans>INACTIVE</Trans>
        </Button>}
        permittedComponent={<Label bsStyle="primary"><Trans>INACTIVE</Trans></Label>}
        operation={{ operation: 'EDIT', model: 'jobCategory' }}
      />
    );
  }

  formatUpdatedDate = jobCategory => (jobCategory.modifiedAt ?
    <span>{moment(jobCategory.modifiedAt).format('DD MMM YYYY')}</span> : '');

  handleCategoryStatus = (jobCategory, status) => {
    const { activePage, sortKey, sortOrder, searchTerm } = this.state;
    let toastrMsg = '';
    if (status) {
      toastrMsg = i18n.t('confirmMessage.DO_YOU_WANT_TO_ACTIVATE_THIS_CATEGORY');
    } else {
      toastrMsg = i18n.t('confirmMessage.DO_YOU_WANT_TO_DEACTIVATE_THIS_CATEGORY');
    }
    toastr.confirm(toastrMsg, {
      onOk: () => {
        if (status) {
          jobCategory.isActive = true;
        } else {
          jobCategory.isActive = false;
        }
        this.props.updateJobCategory(jobCategory.id, jobCategory).then(() => {
          toastr.success(i18n.t('successMessage.UPDATED'),
            i18n.t('successMessage.JOB_CATEGORY_STATUS_HAS_BEEN_UPDATED_SUCCESSFULLY'));
          this.props.loadJobCategoryList({
            page: activePage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
        }, error => {
          toastrErrorHandling(error.error,
            i18n.t('errorMessage.JOB_CATEGORY_STATUS_UPDATE_FAILED'), error.error.message);
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  handlePagination = (direction, pageNo) => {
    const maxPage = Math.ceil(this.props.totalCount / Constants.RECORDS_PER_PAGE);
    const { sortKey, sortOrder, searchTerm } = this.state;
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
    // this.scrollbar.scrollTop(0);
    this.setState({
      activePage: currentPage
    }, () => {
      this.props.loadJobCategoryList({
        page: currentPage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
    });
  }

  selectPageNumber = (evt, scrollbar) => {
    const pageNo = evt.target.value;
    if (evt.keyCode === 69) {
      evt.preventDefault();
    }
    if (evt.keyCode === 13 && pageNo > 0) {
      if (scrollbar) {
        scrollbar.scrollToTop();
      }
      this.handlePagination('goto', Number(pageNo));
    }
  }

  handleSubmit = jobCategory => {
    const { selectedJobCategory, isEdit, activePage, sortOrder, sortKey, searchTerm } = this.state;
    jobCategory = trimExtraSpaces(jobCategory);
    if (!jobCategory.isActive) {
      jobCategory.isActive = false;
    }
    if (isEdit && selectedJobCategory && selectedJobCategory.id) {
      this.props.updateJobCategory(selectedJobCategory.id, jobCategory).then(() => {
        toastr.success(i18n.t('successMessage.UPDATED'),
          i18n.t('successMessage.JOB_CATEGORY_HAS_BEEN_UPDATED_SUCCESSFULLY'));
        this.props.loadJobCategoryList({
          page: activePage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
      }, error => {
        toastrErrorHandling(error.error,
          i18n.t('errorMessage.JOB_CATEGORY_UPDATE_FAILED'), error.error.message);
      });
    } else {
      this.props.addJobCategory(jobCategory).then(() => {
        const page = Math.ceil((this.props.totalCount + 1) / Constants.RECORDS_PER_PAGE);
        toastr.success(i18n.t('SUCCESS'),
          i18n.t('successMessage.JOB_CATEGORY_HAS_BEEN_ADDED_SUCCESSFULLY'));
        this.props.loadJobCategoryList({
          page: activePage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm
        }).then(() => {
          this.setState({ activePage: page });
        });
      }, error => {
        toastrErrorHandling(error.error, i18n.t('errorMessage.JOB_CATEGORY_CREATION_FAILED'), error.error.message);
      });
    }
    this.closeModal();
  }

  handleDelete = jobCategoryId => {
    let { activePage } = this.state;
    const { sortKey, sortOrder, searchTerm } = this.state;
    const { categoryList } = this.props;
    if (categoryList.length === 1 && !searchTerm) {
      activePage -= 1;
    }
    const toastrConfirmOptions = {
      onOk: () => this.props.deleteJobCategory(jobCategoryId).then(() => {
        toastr.success(i18n.t('successMessage.DELETION_SUCCESS'),
          i18n.t('successMessage.JOB_CATEGORY_HAS_BEEN_DELETED_SUCCESSFULLY'));
        this.props.loadJobCategoryList({
          page: activePage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
        if (categoryList.length === 1) {
          this.setState({ activePage });
        }
      }, error => {
        toastrErrorHandling(error.error,
          i18n.t('errorMessage.DELETING_JOB_CATEGORY_FAILED'), error.error.message);
      }),
      okText: i18n.t('DELETE'),
      cancelText: i18n.t('CANCEL')
    };
    toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
  }

  openViewModal = jobCategory => {
    this.setState({ openCategoryModal: true, selectedJobCategory: {}, isEdit: false });
    if (jobCategory && jobCategory.id) {
      this.setState({ selectedJobCategory: jobCategory, isEdit: true });
    }
  }

  closeModal = evt => {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.setState({ openCategoryModal: false });
  }


  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    const { sortKey, sortOrder } = this.state;
    this.setState({ searchTerm, activePage: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.props.loadJobCategoryList({
          page: 1, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
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
    const { activePage, sortKey, sortOrder } = this.state;
    this.setState({ searchTerm: '' });
    this.props.loadJobCategoryList({
      page: activePage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm: '' });
  }

  renderJobCategory = () => {
    const { categoryList, totalCount } = this.props;
    const columnDef = [{ key: 'name' },
      { key: 'description' },
      { key: 'status', render: this.getCategoryStatusBtn },
      { key: 'modifiedAt', render: this.formatUpdatedDate },
      { key: 'actions',
        operation: {
          edit: { operation: 'EDIT', model: 'jobCategory' },
          delete: [{ operation: 'DELETE', model: 'jobCategory' }, { operation: 'DELETE_ME', model: 'jobCategory' }],
        }
      }];
    const column = [{ title: 'TITLE', key: 'name', isOrder: true },
      { title: 'DESCRIPTION', key: 'description' },
      { title: 'STATUS', key: 'isActive' },
      { title: 'UPDATED_AT', key: 'modifiedAt', isOrder: true },
      { title: 'ACTIONS',
        operation: [{ operation: 'DELETE', model: 'jobCategory' }, { operation: 'DELETE_ME', model: 'jobCategory' },
          { operation: 'EDIT', model: 'jobCategory' }],
        restrictedComponent: 'ACTIONS',
        isRestricted: true
      }
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={categoryList}
        sTitle={column}
        selectPageNumber={this.selectPageNumber}
        handlePagination={this.handlePagination}
        activePage={this.state.activePage}
        totalCount={totalCount}
        onSortChange={this.onSortChange}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchTerm}
        resetSearchTerm={this.resetSearchTerm}
        loading={this.props.loading}
        initialSortKey="modifiedAt"
        initialSortOrder="desc"
        isEdit
        isDelete
        isDeleteMePermitted={this.state.isDeleteMePermitted}
        isDeletePermitted={this.state.isDeletePermitted}
        isEditPermitted={this.state.isEditPermitted}
        placeholder="SEARCH_NAME_OR_CONTENT"
        handleEdit={this.openViewModal}
        handleDelete={this.handleDelete}
        isSearch
        isJobCategory
      />
    );
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_JOB_CATEGORY_FOUND</Trans></div></Row>
        <Row className={`${styles.empty_message} m-0`}>
          {/* <div>Add new Job Category</div> */}
        </Row>
      </Col>
    );
    return NoResultsFound;
  }

  render() {
    const { openCategoryModal, selectedJobCategory, isEdit } = this.state;
    const { totalCount } = this.props;
    const maxPage = Math.ceil(totalCount / Constants.RECORDS_PER_PAGE);
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={styles.users_container}>
        <Helmet title={i18n.t('JOB_CATEGORY')} />
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
                <Trans>MANAGE_JOB_CATEGORY</Trans>
                <span className={`${styles.count}`}>
                  {` (${totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${totalCount > 1 ?
                    i18n.t('JOB_CATEGORIES') : i18n.t('JOB_CATEGORY')})`
                  }
                </span>
              </div>
              <div
                className={
                  maxPage && maxPage > 1 ?
                    `${styles.job_category_actions} m-b-5` :
                    'right m-b-5'
                }
                style={{ display: 'inline-block' }}
              >
                <NewPermissible operation={{ operation: 'CREATE_JOBCATEGORY', model: 'jobCategory' }}>
                  <button
                    className={`button-primary ${styles.invite}`}
                    onClick={this.openViewModal}
                  >
                    <i className="fa fa-plus p-r-5" />
                    <Trans>ADD_JOB_CATEGORY</Trans>
                  </button>
                </NewPermissible>
              </div>
            </Col>
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <Col xs={12} md={12} className={styles.tableStyles}>
                {this.renderJobCategory()}
              </Col>
            </Row>
          </Col>
        </Col>
        {openCategoryModal &&
          <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
            <Col xs={12} md={12}>
              <JobCategoryForm
                isEdit={isEdit}
                selectedJobCategory={selectedJobCategory}
                openCategoryModal={openCategoryModal}
                onSubmit={data => this.handleSubmit(data)}
                closeModal={this.closeModal}
              />
            </Col>
          </Row>
        }
      </Col>
    );
  }
}
