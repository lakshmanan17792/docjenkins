import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import lodash from 'lodash';
import { Image, Tabs, Tab, Modal, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import toastrErrorHandling from '../toastrErrorHandling';
import { getDeleteInitiatedCandidates, getApproversStatusList, approveForDeletion, rejectForDeletion }
  from '../../redux/modules/profile-search/managecandidates';
import i18n from '../../i18n';
import OverviewDetails from './OverviewDetails';
import RequestDetails from './RequestDetails';
import styles from './Candidates.scss';
import Constants from './../../helpers/Constants';
import { CustomTable } from '../../components';
import NewPermissible from '../../components/Permissible/NewPermissible';

let timeoutId = 0;
@connect(state => ({
  user: state.auth.user,
  deleteInitiatedCandidates: state.managecandidates.deleteInitiatedCandidates,
  deleteInitiatedTotalCount: state.managecandidates.deleteInitiatedTotalCount,
  loadingDeleteInitiatedCandidates: state.managecandidates.loadingDeleteInitiatedCandidates,
  approversList: state.managecandidates.approversList || [],
  rejectingDeletion: state.managecandidates.rejectingDeletion
}), {
  pushState,
  getDeleteInitiatedCandidates,
  getApproversStatusList,
  approveForDeletion,
  rejectForDeletion
})

export default class ToBeDeletedCandidates extends Component {
  static propTypes = {
    user: PropTypes.object,
    deleteInitiatedCandidates: PropTypes.array.isRequired,
    approversList: PropTypes.array.isRequired,
    deleteInitiatedTotalCount: PropTypes.number.isRequired,
    loadingDeleteInitiatedCandidates: PropTypes.bool.isRequired,
    pushState: PropTypes.func.isRequired,
    getDeleteInitiatedCandidates: PropTypes.func.isRequired,
    getApproversStatusList: PropTypes.func.isRequired,
    approveForDeletion: PropTypes.func.isRequired,
    rejectForDeletion: PropTypes.func.isRequired,
    formatCandidateName: PropTypes.func.isRequired,
    renderRequestRaisedBy: PropTypes.func.isRequired,
    renderRequestDate: PropTypes.func.isRequired,
    returnLogoText: PropTypes.func.isRequired,
    rejectingDeletion: PropTypes.bool.isRequired
  };
  static defaultProps = {
    user: {}
  }
  constructor(props) {
    super(props);
    this.state = {
      openCandidateModal: false,
      selectedCandidate: {},
      searchTerm: '',
      sortBy: 'deleteInitializedAt',
      sortOrder: 'desc',
      activePage: 1,
      activeKey: 1,
      isAlreadyApproved: false,
      rejectionDescription: ''
    };
  }
  componentWillMount() {
    const manageCandidatesFilter = JSON.parse(sessionStorage.getItem('manageCandidateDelete'));
    if (manageCandidatesFilter) {
      this.setState(manageCandidatesFilter, () => {
        this.loadDeleteInitiatedCandidates();
      });
    } else {
      this.loadDeleteInitiatedCandidates();
    }
    if (sessionStorage.getItem('selectedCandidateAction')) {
      this.setState({
        selectedCandidate: JSON.parse(sessionStorage.getItem('selectedCandidateAction')),
        openCandidateModal: true
      }, () => {
        this.props.getApproversStatusList(this.state.selectedCandidate.id);
      });
    }
  }

  componentWillReceiveProps(props) {
    const { approversList, user } = props;
    const currentApprover = lodash.filter(approversList, approver => approver.user.id === user.id);
    if (currentApprover.length > 0) {
      this.setState({
        isAlreadyApproved: currentApprover[0].isApproved
      });
    } else {
      this.setState({
        isAlreadyApproved: false
      });
    }
  }

  onSortChange = (key, orderBy) => {
    this.setState({ sortBy: key, sortOrder: orderBy, activePage: 1 }, () => {
      this.loadDeleteInitiatedCandidates();
    });
  }

  loadDeleteInitiatedCandidates = () => {
    const { activePage, sortBy, sortOrder, searchTerm } = this.state;
    this.props.getDeleteInitiatedCandidates({
      page: activePage,
      resultsPerPage: Constants.RECORDS_PER_PAGE,
      orderBy: sortBy,
      orderIn: sortOrder,
      searchTerm: searchTerm.toLowerCase()
    }).then(() => {
      sessionStorage.setItem('manageCandidateDelete',
        JSON.stringify({
          searchTerm,
          sortBy,
          sortOrder,
          activePage
        }));
    });
  }

  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  handlePagination = (direction, pageNo) => {
    const maxPage = Math.ceil(this.props.deleteInitiatedTotalCount / Constants.RECORDS_PER_PAGE);
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
      this.loadDeleteInitiatedCandidates();
    });
  }
  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchTerm, activePage: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.loadDeleteInitiatedCandidates();
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

  resetSearchTerm = () => {
    this.resetPageInput();
    this.setState({ searchTerm: '' }, () => {
      this.loadDeleteInitiatedCandidates();
    });
  }
  handleSelect = key => {
    this.setState({ activeKey: key });
  }
  handleApproverRequest = (status, id) => {
    if (status) {
      this.props.approveForDeletion(id).then(() => {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.CANDIDATE_DELETION_APPROVED_SUCCESSFULLY'));
        this.setState({
          openCandidateModal: false,
          activeKey: 1
        });
      }, error => {
        toastrErrorHandling(error.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_APPROVE_CANDIDATE_DELETION'));
      });
    } else {
      this.toggleCandidateModal();
      this.toggleRejectionModal();
    }
  }
  viewProfile = (evt, resumeId) => {
    evt.preventDefault();
    this.props.pushState({ pathname: `ProfileSearch/${resumeId}`, query: { isAtsBoard: true } });
  }
  viewCandidateDetails = (evt, candidate) => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      selectedCandidate: candidate,
      openCandidateModal: true
    }, () => {
      this.props.getApproversStatusList(candidate.id);
    });
    sessionStorage.setItem('selectedCandidateAction', JSON.stringify(candidate));
  }
  toggleCandidateModal = evt => {
    if (evt) {
      evt.preventDefault();
    }
    if (this.state.openCandidateModal && sessionStorage.getItem('selectedCandidateAction')) {
      sessionStorage.removeItem('selectedCandidateAction');
    }
    this.setState({
      openCandidateModal: !this.state.openCandidateModal,
      activeKey: 1
    });
  }
  toggleRejectionModal = () => {
    this.setState({ openRejectionModal: !this.state.openRejectionModal, rejectionDescription: '' });
  }
  handleRejectRequest = evt => {
    if (evt) {
      evt.preventDefault();
    }
    const data = {
      reason: {},
      description: this.state.rejectionDescription
    };
    this.props.rejectForDeletion(this.state.selectedCandidate.id, data).then(() => {
      toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.CANDIDATE_DELETION_REJECTED_SUCCESSFULLY'));
      this.toggleRejectionModal();
      window.setTimeout(() => {
        this.loadDeleteInitiatedCandidates(); // To refresh data after reject
      }, 500);
    }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_REJECT_CANDIDATE_DELETION'));
      this.toggleRejectionModal();
    });
  }
  handleRejectDescriptionChange = evt => {
    let value = evt.target.value;
    value = value && value.replace(/^\s+/ig, '');
    value = value ? value.replace(/\s{2,}/ig, ' ') : '';
    this.setState({ rejectionDescription: value, touched: true });
  }
  renderActionBtn = candidate => (
    <button
      onClick={evt => { this.viewCandidateDetails(evt, candidate); }}
      className={`${styles.action_btn} button-primary`}
    >
      <span>{i18n.t('TAKE_ACTION')}</span>
      <Image
        src="/icons/arrowRightw.svg"
        className={`${styles.action_btn_icon} right`}
        responsive
      /></button>
  );
  renderToBeDeletedCandidates = () => {
    const { deleteInitiatedCandidates, deleteInitiatedTotalCount,
      loadingDeleteInitiatedCandidates } = this.props;
    const { sortBy, sortOrder } = this.state;
    const columnDef = [{ render: this.props.formatCandidateName, width: '32.5%' },
      { key: 'deleteInitializedAt', render: this.props.renderRequestDate, width: '30%' },
      { key: 'raisedBy', render: this.props.renderRequestRaisedBy, width: '22.5%' },
      { key: 'action', render: this.renderActionBtn, width: '15%' }];
    const column = [{ title: 'NAME', key: 'name', isOrder: true, width: '32.5%' },
      { title: 'REQUEST_RAISED_ON', key: 'deleteInitializedAt', isOrder: true, width: '30%' },
      { title: 'RAISED_BY', key: 'raisedBy', width: '22.5%' },
      { title: '', key: 'action', width: '15%' },
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={deleteInitiatedCandidates}
        sTitle={column}
        tableTitle="MANAGE"
        countTitle="CANDIDATES"
        singularCountTitle="CANDIDATE"
        selectPageNumber={this.selectPageNumber}
        handlePagination={this.handlePagination}
        activePage={this.state.activePage}
        totalCount={deleteInitiatedTotalCount}
        onSortChange={this.onSortChange}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchTerm}
        resetSearchTerm={this.resetSearchTerm}
        loading={loadingDeleteInitiatedCandidates}
        initialSortKey={sortBy}
        initialSortOrder={sortOrder}
        placeholder={'SEARCH_BY_NAME'}
        isSearch
      />
    );
  }
  renderRejectionModal = () => (
    <Modal
      show
      onHide={this.toggleRejectionModal}
      style={{ display: 'block' }}
      bsSize="md"
      backdrop="static"
    >
      <Modal.Header className={`${styles.modal_header_color}`}>
        <Modal.Title>
          <Row className="clearfix">
            <Col sm={12} className={styles.modal_title}>
              <span>
                {i18n.t('REJECT_DELETE_REQUEST')}
              </span>
              <span
                role="button"
                tabIndex="-1"
                className="close_btn right no-outline"
                onClick={this.toggleRejectionModal}
              >
                <i className="fa fa-close" />
              </span>
            </Col>
          </Row>
        </Modal.Title>
      </Modal.Header>
      <form name="rejectionModal" onSubmit={this.handleRejectRequest}>
        <Modal.Body>
          <div className="p-b-15">
            <div>
              <label htmlFor="description">
                {i18n.t('DESCRIPTION')}<span className="required_color">*</span>
              </label>
              <div>
                <div>
                  <textarea
                    name="description"
                    placeholder={i18n.t('DESCRIPTION')}
                    value={this.state.rejectionDescription}
                    onChange={this.handleRejectDescriptionChange}
                  />
                  {this.state.touched && !this.state.rejectionDescription &&
                    <div className="error-message">{i18n.t('validationMessage.REQUIRED')}</div>}
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Col lg={12} md={12} sm={12} xs={12}>
            <button
              type="submit"
              className={`${styles.modal_btns} button-error right`}
              disabled={!this.state.rejectionDescription || this.props.rejectingDeletion}
            > <span>{ i18n.t('SUBMIT') }</span>
            </button>
            <button
              type="button"
              onClick={this.toggleRejectionModal}
              className={`button-secondary-hover ${styles.cancel_btn} ${styles.modal_btns}`}
            > <span>{ i18n.t('CANCEL') }</span>
            </button>
          </Col>
        </Modal.Footer>
      </form>
    </Modal>
  );
  render() {
    return (
      <div>
        { this.renderToBeDeletedCandidates() }
        {
          this.state.openCandidateModal &&
          <SelectedCandidateDetails
            selectedData={this.state.selectedCandidate}
            viewProfile={this.viewProfile}
            toggleCandidateModal={this.toggleCandidateModal}
            returnLogoText={this.props.returnLogoText}
            handleSelect={this.handleSelect}
            activeKey={this.state.activeKey}
            approversList={this.props.approversList}
            isAlreadyApproved={this.state.isAlreadyApproved}
            handleApproverRequest={this.handleApproverRequest}
          />
        }
        {
          this.state.openRejectionModal && this.renderRejectionModal()
        }
      </div>
    );
  }
}


const SelectedCandidateDetails = properties => {
  const { toggleCandidateModal, selectedData, returnLogoText, isAlreadyApproved,
    viewProfile, activeKey, handleSelect, approversList, handleApproverRequest } = properties;
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <Image
          src="/close.svg"
          responsive
          onClick={evt => { toggleCandidateModal(evt); }}
          className={styles.close_img}
        />
        <div className={styles.request_header}>
          {i18n.t('REQUEST_FOR_DELETING_CANDIDATE')}
          <div className={styles.request_raised_by}>
            {i18n.t('RAISED_BY')} { selectedData.raisedBy } { moment(selectedData.deleteInitializedAt)
              .format('MMM Do YYYY') }
          </div>
        </div>
        <Tabs
          activeKey={activeKey}
          onSelect={handleSelect}
          className={styles.tab_request_section}
        >
          <Tab eventKey={1} title={i18n.t('OVERVIEW')}>
            {activeKey === 1 &&
              <OverviewDetails
                selectedData={selectedData}
                returnLogoText={returnLogoText}
                viewProfile={viewProfile}
              />
            }
          </Tab>
          <Tab eventKey={2} title={i18n.t('REQUEST_STATUS')}>
            {activeKey === 2 &&
            <RequestDetails
              approvers={approversList}
            />
            }
          </Tab>
        </Tabs>
        {!isAlreadyApproved && <div style={{ position: 'absolute' }} className={`${styles.action_btn_section}`}>
          <div style={{ float: 'right' }}>
            <NewPermissible operation={{ operation: 'APPROVE_DELETE', model: 'resume' }}>
              <div>
                <button
                  onClick={() => { handleApproverRequest(false, selectedData.id); }}
                  className={`${styles.reject_btn} button-error`}
                >
                  <span>{i18n.t('REJECT_REQUEST')}</span>
                </button>
                <button
                  onClick={() => { handleApproverRequest(true, selectedData.id); }}
                  className={`${styles.approve_btn} button-primary`}
                >
                  <span>{i18n.t('APPROVE_REQUEST')}</span>
                </button>
              </div>
            </NewPermissible>
          </div>
        </div>}
      </div>
    </div>
  );
};

