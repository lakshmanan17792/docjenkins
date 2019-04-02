import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
import moment from 'moment';
import lodash from 'lodash';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { Trans, Interpolate } from 'react-i18next';
import NewPermissible from '../../components/Permissible/NewPermissible';
import { loadMasterPositions, addMasterPosition, initiateReIndex, getReIndexStatus,
  loadReIndexSourceList } from '../../redux/modules/MasterLists/index.js';
import styles from '../../containers/Users/Users.scss';
import i18n from '../../i18n';
import UserMenu from '../../containers/Users/UserMenu.js';
import Constants from '../../helpers/Constants';
import CustomTable from '../CustomTable/CustomTable.js';
import toastrErrorHandling from '../../containers/toastrErrorHandling.js';
import AddMasterPosition from './AddMasterPosition.js';

let timeoutId = 0;
let intervalId = 0;
@connect(state => ({
  positionList: state.masterLists.positionList || [],
  totalCount: state.masterLists.positionTotalCount || 0,
  loading: state.masterLists.loading,
  reIndexStatus: state.masterLists.reIndexResponse.reindex_status || 'inprogress',
  processedProfiles: state.masterLists.reIndexResponse.processed_profiles || '',
  totalProfiles: state.masterLists.reIndexResponse.total_profiles || 0,
  // updatedProfiles: state.masterLists.reIndexResponse.updated_profiles || '',
  reIndexSkillCount: state.masterLists.sourceListResponse.skill_details.total_count || 0,
  // reIndexSkillList: state.masterLists.sourceListResponse.skill_details.source_list || [],
  reIndexPositionCount: state.masterLists.sourceListResponse.position_details.total_count || 0,
  reIndexPositionList: state.masterLists.sourceListResponse.position_details.source_list || [],
}), { loadMasterPositions, addMasterPosition, initiateReIndex, getReIndexStatus, loadReIndexSourceList })
export default class MasterPositions extends Component {
  static propTypes = {
    totalCount: PropTypes.number,
    loading: PropTypes.bool.isRequired,
    positionList: PropTypes.array.isRequired,
    loadMasterPositions: PropTypes.func.isRequired,
    reIndexStatus: PropTypes.string,
    processedProfiles: PropTypes.number,
    totalProfiles: PropTypes.number,
    // updatedProfiles: PropTypes.number,
    reIndexSkillCount: PropTypes.number,
    reIndexPositionCount: PropTypes.number,
    // reIndexSkillList: PropTypes.array,
    reIndexPositionList: PropTypes.array,
    addMasterPosition: PropTypes.func.isRequired,
    initiateReIndex: PropTypes.func.isRequired,
    getReIndexStatus: PropTypes.func.isRequired,
    loadReIndexSourceList: PropTypes.func.isRequired
  }

  static defaultProps = {
    totalCount: 0,
    reIndexStatus: '',
    processedProfiles: 0,
    totalProfiles: 0,
    // updatedProfiles: 0,
    reIndexSkillCount: 0,
    reIndexPositionCount: 0,
    // reIndexSkillList: [],
    reIndexPositionList: [],
  }

  constructor(props) {
    super(props);
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'POSITION_SAVE_OR_UPDATE', model: 'Position' });
    this.state = {
      searchParam: '',
      sortKey: 'updated_ts',
      sortOrder: 'desc',
      sort: ['updated_ts', 'desc'],
      page: 1,
      isAddPositionModal: false,
      isEdit: false,
      isEditPermitted,
      positionData: { name: '' },
      previousValues: ''
    };
  }

  componentWillMount() {
    this.fetchPositionList(true);
  }

  componentWillUnmount() {
    clearInterval(intervalId);
  }

  onSortChange = (sortKey, sortOrder) => {
    if (sortKey === 'createdAt') {
      sortKey = 'created_ts';
    } else if (sortKey === 'updatedAt') {
      sortKey = 'updated_ts';
    }
    this.setState({ sortKey, sortOrder, page: 1 }, () => {
      this.fetchPositionList();
    });
  }

  fetchPositionList = status => {
    const { searchParam, sortKey, sortOrder, page } = this.state;
    this.props.loadMasterPositions({
      searchParam,
      sort: [sortKey, sortOrder],
      page
    }).then(() => {
      if (status) {
        this.props.getReIndexStatus().then(response => {
          if (response.reindex_status === 'inprogress') {
            intervalId = setInterval(this.checkReindexStatus, 1000);
          }
        });
        this.props.loadReIndexSourceList();
      }
    });
  }

  formatName = (data, key) => {
    const isPositionIndexed = !lodash.map(this.props.reIndexPositionList, 'id').includes(data.id);
    return (isPositionIndexed ? data[key] : <span>{data[key]} <span className="required_color">*</span></span>);
  };

  formatDate = (data, key) => (data[key] ? <span>{moment(data[key]).format('DD MMM YYYY')}</span> : '');

  handleSearchChange = evt => {
    this.resetPageInput();
    const searchParam = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchParam, page: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.fetchPositionList();
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
    // this.scrollbar.scrollTop(0);
    this.setState({
      page: currentPage
    }, () => {
      this.fetchPositionList();
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

  resetSearchTerm = () => {
    this.resetPageInput();
    this.setState({ searchParam: '', page: 1 }, () => {
      this.fetchPositionList();
    });
  }

  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  togglePositionModal = () => {
    this.setState({
      isAddPositionModal: !this.state.isAddPositionModal, positionData: { name: '', type: null }, isEdit: false });
  }

  handleSubmit = data => {
    const query = {
      ...data,
      id: data.id || '',
      name: data.name.trim(),
      isActive: true
    };
    const deviceDetail = JSON.parse(localStorage.getItem('deviceDetails'));
    query.deviceDetails = deviceDetail;
    if (this.state.isEdit) {
      query.previousValues = this.state.previousValues;
    }
    this.props.addMasterPosition(query).then(() => {
      if (this.state.isEdit) {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.UPDATE_POSITION_SUCCESSFULLY'));
      } else {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.ADD_POSITION_SUCCESSFULLY'));
      }
      this.togglePositionModal();
      this.fetchPositionList();
      this.props.loadReIndexSourceList();
    }, error => {
      if (error.error.statusCode === 409) {
        toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.POSITION_ALREADY_EXISTS'));
      } else if (this.state.isEdit) {
        toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.UPDATE_POSITION_FAILED'));
      } else {
        toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.ADD_POSITION_FAILED'));
      }
      this.togglePositionModal();
    });
  }

  handleEdit = positionData => {
    this.setState({ isAddPositionModal: true, positionData, isEdit: true, previousValues: positionData });
  }

  initiateReIndex = () => {
    this.props.initiateReIndex().then(() => {
      intervalId = setInterval(this.checkReindexStatus, 1000);
      toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.REINDEX_INITIATED_SUCCESSFULLY'));
    }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.REINDEX_INITIATED_FAILED'));
    });
  }

  checkReindexStatus = () => {
    this.props.getReIndexStatus().then(response => {
      if (response.reindex_status !== 'inprogress') {
        clearInterval(intervalId);
        if (response.reindex_status === 'success') {
          this.props.loadReIndexSourceList();
        }
      }
    });
  }

  renderMasterPositions = () => {
    const { positionList, totalCount } = this.props;
    const columnDef = [
      { key: 'name', render: value => this.formatName(value, 'name') },
      { key: 'createdAt', render: value => this.formatDate(value, 'createdAt') },
      { key: 'updatedAt', render: value => this.formatDate(value, 'updatedAt') },
      { key: 'actions',
        operation: {
          edit: { operation: 'POSITION_SAVE_OR_UPDATE', model: 'Position' },
        }
      }
    ];
    const column = [
      { title: 'NAME', key: 'name', isOrder: true },
      { title: 'CREATED_AT', key: 'createdAt', isOrder: true },
      { title: 'UPDATED_AT', key: 'updatedAt', isOrder: true },
      { title: 'ACTIONS',
        operation: [{ operation: 'POSITION_SAVE_OR_UPDATE', model: 'Position' }],
        restrictedComponent: 'ACTIONS',
        isRestricted: true
      }
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={positionList}
        sTitle={column}
        selectPageNumber={this.selectPageNumber}
        handlePagination={this.handlePagination}
        activePage={this.state.page}
        totalCount={totalCount}
        onSortChange={this.onSortChange}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchParam}
        resetSearchTerm={this.resetSearchTerm}
        loading={this.props.loading}
        initialSortKey="updatedAt"
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
    const { totalCount, reIndexStatus, reIndexSkillCount, reIndexPositionCount,
      processedProfiles, totalProfiles } = this.props;
    let inProgressPercent = 0;
    if (reIndexStatus === 'inprogress') {
      inProgressPercent = Math.round((processedProfiles / totalProfiles) * 100);
    }
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={styles.users_container}>
        <Helmet title={i18n.t('MASTER_POSITIONS')} />
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
              <Col lg={6} md={6} sm={6} className={`${styles.page_title} p-0`}>
                <Trans>MANAGE_MASTER_POSITIONS</Trans>
                <span className={`${styles.count}`}>
                  {` (${totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${totalCount > 1 ?
                    i18n.t('POSITIONS') : i18n.t('POSITION')})`
                  }
                </span>
              </Col>
              <Col lg={6} md={6} sm={6} className="right p-0">
                <div
                  className={`${styles.job_category_actions} m-b-5 m-r-10`}
                  style={{ display: 'inline-block' }}
                >
                  <button
                    className={`button-primary ${styles.invite}`}
                    onClick={this.togglePositionModal}
                  >
                    <i className="fa fa-plus p-r-5" />
                    <Trans>ADD</Trans>
                  </button>
                </div>
                {reIndexPositionCount > 0 && reIndexStatus !== 'inprogress' ?
                  <div
                    className={`${styles.job_category_actions} m-b-5 m-r-10`}
                    style={{ display: 'inline-block' }}
                  >
                    <button
                      className={`button-primary right ${styles.invite}`}
                      onClick={this.initiateReIndex}
                      disabled={(reIndexSkillCount + reIndexPositionCount <= 0)}
                    >
                      <Trans>INDEX</Trans>
                    </button>
                  </div> : null}
                {reIndexStatus === 'inprogress' ?
                  <div className={`${styles.progress_bar} right m-r-20`}>
                    <ProgressBar
                      striped
                      bsStyle="success"
                      now={isNaN(inProgressPercent) ? 0 : inProgressPercent}
                      label={`${isNaN(inProgressPercent) ? 0 : inProgressPercent}%`}
                    />
                  </div> : null}
              </Col>
            </Col>
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <Col xs={12} md={12} className={styles.tableStyles}>
                {this.renderMasterPositions()}
                <Col xs={12} md={12} className={`p-l-15 m-t-10 ${styles.notes}`}>
                  <label htmlFor="note">{i18n.t('NOTE')}:</label>
                  <Interpolate
                    i18nKey="NOTE_MESSAGE"
                    dataKey={i18n.t('POSITIONS')}
                    star={<span className="required_color">*</span>}
                  />
                </Col>
              </Col>
            </Row>
          </Col>
        </Col>
        {
          this.state.isAddPositionModal &&
          <AddMasterPosition
            onSubmit={this.handleSubmit}
            onClose={this.togglePositionModal}
            loading={this.props.loading}
            initialValues={this.state.positionData}
            isEdit={this.state.isEdit}
          />
        }
      </Col>
    );
  }
}
