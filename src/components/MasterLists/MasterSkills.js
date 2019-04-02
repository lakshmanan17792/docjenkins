import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import lodash from 'lodash';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { Trans, Interpolate } from 'react-i18next';
import NewPermissible from '../../components/Permissible/NewPermissible';
import { loadMasterSkills, addMasterSkill, initiateReIndex, getReIndexStatus,
  loadReIndexSourceList } from '../../redux/modules/MasterLists/index.js';
import styles from '../../containers/Users/Users.scss';
import i18n from '../../i18n';
import UserMenu from '../../containers/Users/UserMenu.js';
import Constants from '../../helpers/Constants';
import CustomTable from '../CustomTable/CustomTable.js';
import toastrErrorHandling from '../../containers/toastrErrorHandling.js';
import AddMasterSkill from './AddMasterSkill.js';

let timeoutId = 0;
let intervalId = 0;
@connect(state => ({
  skillList: state.masterLists.skillList || [],
  totalCount: state.masterLists.skillTotalCount || 0,
  loading: state.masterLists.loading,
  reIndexStatus: state.masterLists.reIndexResponse.reindex_status || '',
  processedProfiles: state.masterLists.reIndexResponse.processed_profiles || 0,
  totalProfiles: state.masterLists.reIndexResponse.total_profiles || 0,
  // updatedProfiles: state.masterLists.reIndexResponse.updated_profiles || 0,
  reIndexSkillCount: state.masterLists.sourceListResponse.skill_details.total_count || 0,
  reIndexSkillList: state.masterLists.sourceListResponse.skill_details.source_list || [],
  reIndexPositionCount: state.masterLists.sourceListResponse.position_details.total_count || 0,
  // reIndexPositionList: state.masterLists.sourceListResponse.position_details.source_list || [],
}), { loadMasterSkills, addMasterSkill, initiateReIndex, getReIndexStatus, loadReIndexSourceList })
export default class MasterSkills extends Component {
  static propTypes = {
    totalCount: PropTypes.number,
    loading: PropTypes.bool.isRequired,
    skillList: PropTypes.array.isRequired,
    loadMasterSkills: PropTypes.func.isRequired,
    reIndexStatus: PropTypes.string,
    processedProfiles: PropTypes.number,
    totalProfiles: PropTypes.number,
    // updatedProfiles: PropTypes.number,
    reIndexSkillCount: PropTypes.number,
    reIndexPositionCount: PropTypes.number,
    reIndexSkillList: PropTypes.array,
    // reIndexPositionList: PropTypes.array,
    addMasterSkill: PropTypes.func.isRequired,
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
    reIndexSkillList: [],
    // reIndexPositionList: [],
  }

  constructor(props) {
    super(props);
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'SKILL_SAVE_OR_UPDATE', model: 'Skill' });
    this.state = {
      searchParam: '',
      sortKey: 'updated_ts',
      sortOrder: 'desc',
      sort: ['updated_ts', 'desc'],
      page: 1,
      isAddSkillModal: false,
      isEdit: false,
      isEditPermitted,
      skillData: { name: '' },
      previousValues: ''
    };
  }

  componentWillMount() {
    this.fetchSkillList(true);
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
      this.fetchSkillList();
    });
  }

  fetchSkillList = status => {
    const { searchParam, sortKey, sortOrder, page } = this.state;
    this.props.loadMasterSkills({
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
    const isSkillIndexed = !lodash.map(this.props.reIndexSkillList, 'id').includes(data.id);
    return (isSkillIndexed ? data[key] : <span>{data[key]} <span className="required_color">*</span></span>);
  };

  formatDate = (data, key) => (data[key] ? <span>{moment(data[key]).format('DD MMM YYYY')}</span> : '');

  handleSearchChange = evt => {
    this.resetPageInput();
    const searchParam = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    this.setState({ searchParam, page: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.fetchSkillList();
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
      this.fetchSkillList();
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
      this.fetchSkillList();
    });
  }

  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  toggleSkillModal = () => {
    this.setState({ isAddSkillModal: !this.state.isAddSkillModal, skillData: { name: '', type: null }, isEdit: false });
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
    this.props.addMasterSkill(query).then(() => {
      if (this.state.isEdit) {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.UPDATE_SKILL_SUCCESSFULLY'));
      } else {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.ADD_SKILL_SUCCESSFULLY'));
      }
      this.toggleSkillModal();
      this.fetchSkillList();
      this.props.loadReIndexSourceList();
    }, error => {
      if (error.error.statusCode === 409) {
        toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.SKILL_ALREADY_EXISTS'));
      } else if (this.state.isEdit) {
        toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.UPDATE_SKILL_FAILED'));
      } else {
        toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.ADD_SKILL_FAILED'));
      }
      this.toggleSkillModal();
    });
  }

  handleEdit = skillData => {
    this.setState({ isAddSkillModal: true, skillData, isEdit: true, previousValues: skillData });
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

  renderMasterSkills = () => {
    const { skillList, totalCount } = this.props;
    const columnDef = [
      { key: 'name', render: value => this.formatName(value, 'name') },
      { key: 'createdAt', render: value => this.formatDate(value, 'createdAt') },
      { key: 'updatedAt', render: value => this.formatDate(value, 'updatedAt') },
      { key: 'actions',
        operation: {
          edit: { operation: 'SKILL_SAVE_OR_UPDATE', model: 'Skill' },
        }
      }
    ];
    const column = [
      { title: 'NAME', key: 'name', isOrder: true },
      { title: 'CREATED_AT', key: 'createdAt', isOrder: true },
      { title: 'UPDATED_AT', key: 'updatedAt', isOrder: true },
      { title: 'ACTIONS',
        operation: [{ operation: 'SKILL_SAVE_OR_UPDATE', model: 'Skill' }],
        restrictedComponent: 'ACTIONS',
        isRestricted: true
      }
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={skillList}
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
        <Helmet title={i18n.t('MASTER_SKILLS')} />
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
                <Trans>MANAGE_MASTER_SKILLS</Trans>
                <span className={`${styles.count}`}>
                  {` (${totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${totalCount > 1 ?
                    i18n.t('SKILLS') : i18n.t('SKILL')})`
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
                    onClick={this.toggleSkillModal}
                  >
                    <i className="fa fa-plus p-r-5" />
                    <Trans>ADD</Trans>
                  </button>
                </div>
                {reIndexSkillCount > 0 && reIndexStatus !== 'inprogress' ?
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
                {this.renderMasterSkills()}
                <Col xs={12} md={12} className={`p-l-15 m-t-10 ${styles.notes}`}>
                  <label htmlFor="note">{i18n.t('NOTE')}:</label>
                  <Interpolate
                    i18nKey="NOTE_MESSAGE"
                    dataKey={i18n.t('SKILLS')}
                    star={<span className="required_color">*</span>}
                  />
                </Col>
              </Col>
            </Row>
          </Col>
        </Col>
        {
          this.state.isAddSkillModal &&
          <AddMasterSkill
            onSubmit={this.handleSubmit}
            onClose={this.toggleSkillModal}
            initialValues={this.state.skillData}
            isEdit={this.state.isEdit}
            loading={this.props.loading}
          />
        }
      </Col>
    );
  }
}
