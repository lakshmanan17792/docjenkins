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
import { loadMasterTags, addMasterTag, updateMasterTag } from '../../redux/modules/MasterLists/index.js';
import styles from '../../containers/Users/Users.scss';
import i18n from '../../i18n';
import UserMenu from '../../containers/Users/UserMenu.js';
import Constants from '../../helpers/Constants';
import CustomTable from '../CustomTable/CustomTable.js';
import toastrErrorHandling from '../../containers/toastrErrorHandling.js';
import AddMasterTag from './AddMasterTag.js';

let timeoutId = 0;
@connect(state => ({
  tagList: state.masterLists.tagList || [],
  totalCount: state.masterLists.tagTotalCount || 0,
  tagTypes: state.masterLists.tagTypes || [],
  loading: state.masterLists.loading,
}), { loadMasterTags, addMasterTag, updateMasterTag })
export default class MasterTags extends Component {
  static propTypes = {
    totalCount: PropTypes.number,
    loading: PropTypes.bool.isRequired,
    tagList: PropTypes.array.isRequired,
    loadMasterTags: PropTypes.func.isRequired,
    addMasterTag: PropTypes.func.isRequired,
    tagTypes: PropTypes.array.isRequired,
    updateMasterTag: PropTypes.func.isRequired
  }

  static defaultProps = {
    totalCount: 0
  }

  constructor(props) {
    super(props);
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT_TAG', model: 'tag' });
    this.state = {
      searchTerm: '',
      sortKey: 'modifiedAt',
      sortOrder: 'desc',
      page: 1,
      tagType: '',
      isAddTagModal: false,
      selectedTagType: { id: '', name: 'All' },
      isEdit: false,
      isEditPermitted,
      tagData: { name: '', type: null },
      previousValues: ''
    };
  }

  componentWillMount() {
    this.fetchTagList();
  }

  onSortChange = (sortKey, sortOrder) => {
    this.setState({ sortKey, sortOrder, page: 1 }, () => {
      this.fetchTagList();
    });
  }

  fetchTagList = () => {
    const { searchTerm, tagType, sortKey, sortOrder, page } = this.state;
    this.props.loadMasterTags({
      searchTerm,
      tagType,
      orderBy: `${sortKey} ${sortOrder}`,
      skip: (page - 1) * 15,
      limit: 15
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
        this.fetchTagList();
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
      this.fetchTagList();
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
    this.setState({ searchTerm: '', page: 1 }, () => {
      this.fetchTagList();
    });
  }

  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  toggleTagModal = () => {
    this.setState({ isAddTagModal: !this.state.isAddTagModal, tagData: { name: '', type: null }, isEdit: false });
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
      this.props.addMasterTag(query).then(() => {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.ADD_TAG_SUCCESSFULLY'));
        this.toggleTagModal();
        this.fetchTagList();
      }, error => {
        if (error.error.statusCode === 409) {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.TAG_ALREADY_EXISTS'));
        } else {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.ADD_TAG_FAILED'));
        }
        this.toggleTagModal();
      });
    } else {
      query.previousValues = this.state.previousValues;
      this.props.updateMasterTag(query, data.id).then(() => {
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.ADD_TAG_SUCCESSFULLY'));
        this.toggleTagModal();
        this.fetchTagList();
      }, error => {
        if (error.error.statusCode === 409) {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.TAG_ALREADY_EXISTS'));
        } else {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.TAG_UPDATION_FAILED'));
        }
        this.toggleTagModal();
      });
    }
  }

  handleEdit = tagData => {
    this.setState({ isAddTagModal: true, tagData, isEdit: true, previousValues: tagData });
  }

  handleOnTagFilterChange = (option, scrollbar) => {
    this.setState({ selectedTagType: option, tagType: option.id, page: 1 }, () => {
      this.fetchTagList();
      if (scrollbar) scrollbar.scrollToTop();
    });
  }

  renderFilter = scrollbar => {
    const tags = [{ id: '', name: i18n.t('ALL') }, ...this.props.tagTypes];
    return (
      <DropdownList
        name="tagTypeFilter"
        data={tags}
        valueField="id"
        textField="name"
        onChange={option => this.handleOnTagFilterChange(option, scrollbar)}
        value={this.state.selectedTagType}
      />
    );
  }

  renderMasterTags = () => {
    const { tagList, totalCount } = this.props;
    const columnDef = [
      { key: 'name' },
      { key: 'type' },
      { key: 'createdAt', render: value => this.formatDate(value, 'createdAt') },
      { key: 'modifiedAt', render: value => this.formatDate(value, 'modifiedAt') },
      { key: 'actions',
        operation: [{ operation: 'EDIT_TAG', model: 'tag' }]
      }
    ];
    const column = [
      { title: 'NAME', key: 'name', isOrder: true },
      { title: 'TYPE', key: 'type' },
      { title: 'CREATED_AT', key: 'createdAt', isOrder: true },
      { title: 'UPDATED_AT', key: 'modifiedAt', isOrder: true },
      { title: 'ACTIONS',
        operation: [{ operation: 'EDIT_TAG', model: 'tag' }],
        restrictedComponent: 'ACTIONS',
        isRestricted: true
      }
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={tagList}
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
    const { totalCount, tagTypes } = this.props;
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={styles.users_container}>
        <Helmet title={i18n.t('MASTER_TAGS')} />
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
                <Trans>MANAGE_MASTER_TAGS</Trans>
                <span className={`${styles.count}`}>
                  {` (${totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${totalCount > 1 ?
                    i18n.t('TAGS') : i18n.t('TAG')})`
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
                  onClick={this.toggleTagModal}
                >
                  <i className="fa fa-plus p-r-5" />
                  <Trans>ADD</Trans>
                </button>
                {/* </NewPermissible> */}
              </div>
            </Col>
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <Col xs={12} md={12} className={styles.tableStyles}>
                {this.renderMasterTags()}
              </Col>
            </Row>
          </Col>
        </Col>
        {
          this.state.isAddTagModal &&
          <AddMasterTag
            onSubmit={this.handleSubmit}
            onClose={this.toggleTagModal}
            loading={this.props.loading}
            tagTypes={tagTypes}
            initialValues={this.state.tagData}
            isEdit={this.state.isEdit}
          />
        }
      </Col>
    );
  }
}
