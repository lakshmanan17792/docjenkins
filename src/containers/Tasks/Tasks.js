import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { reduxForm, isPristine } from 'redux-form';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { push as pushState } from 'react-router-redux';
import Moment from 'moment';
import { Trans } from 'react-i18next';
import momentLocalizer from 'react-widgets-moment';
import { Row, Col, Pager, ButtonToolbar, DropdownButton, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { saveTask, loadTasks, updateTask } from '../../redux/modules/tasks';
import SearchBar from '../../components/FormComponents/SearchBar';
import { getSearchTaskConfig } from '../../formConfig/SearchTask';
import EditTask from './EditTask';
import { trimExtraSpaces, restrictDecimalNumber } from '../../utils/validation';
import styles from './Tasks.scss';
import Constants from './../../helpers/Constants';
import toastrErrorHandling from '../toastrErrorHandling';
import Loader from '../../components/Loader';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

Moment.locale('en');
momentLocalizer();

@reduxForm({
  form: 'searchTask'
})
@connect(state => ({
  saveResponse: state.tasks.saveResponse || null,
  updateResponse: state.tasks.updateResponse || null,
  isSaveTaskPristine: isPristine('task')(state),
  taskFormData: state.form.task,
  tasks: state.tasks.taskList || [],
  totalCount: state.tasks.taskTotalCount || 0,
  loading: state.tasks.loading
}), { saveTask, loadTasks, updateTask, pushState })
class Tasks extends Component {
  static propTypes = {
    saveTask: PropTypes.func.isRequired,
    updateTask: PropTypes.func.isRequired,
    loadTasks: PropTypes.func.isRequired,
    isSaveTaskPristine: PropTypes.bool,
    taskFormData: PropTypes.object,
    route: PropTypes.object,
    router: PropTypes.object,
    pushState: PropTypes.func.isRequired,
    tasks: PropTypes.array.isRequired,
    totalCount: PropTypes.number.isRequired,
    loading: PropTypes.bool
  }

  static defaultProps = {
    companyId: '',
    loading: false,
    route: null,
    router: null,
    isSaveTaskPristine: true,
    taskFormData: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTaskCategory: i18n.t('OPEN_TASK'),
      activeKey: '1',
      activePage: 1,
      openTaskModal: false,
      selectedTask: {},
      isEdit: false,
      searchStrVal: '',
      searchParamVal: 'openTasks'
    };
  }

  componentWillMount() {
    this.props.loadTasks({
      skip: 0,
      limit: Constants.RECORDS_PER_PAGE,
      searchParameter: 'openTasks',
      date: Moment(new Date()).format('YYYY-MM-DD')
    });
    const taskData = JSON.parse(sessionStorage.getItem('taskData'));
    if (taskData && taskData.activeTaskCategory) {
      this.setState({
        activeTaskCategory: taskData.activeTaskCategory,
        activeKey: taskData.activeKey,
        activePage: taskData.activePage ? taskData.activePage : 1,
        searchParamVal: taskData.searchParamVal,
        searchStrVal: taskData.searchStrVal
      }, () => {
        const { activePage, searchParamVal, searchStrVal } = this.state;
        this.props.loadTasks({
          skip: (activePage - 1) * Constants.RECORDS_PER_PAGE,
          limit: Constants.RECORDS_PER_PAGE,
          searchParameter: searchParamVal,
          searchTerm: searchStrVal.length !== 1 ? searchStrVal : '',
          date: Moment(new Date()).format('YYYY-MM-DD')
        });
      });
    } else {
      sessionStorage.setItem('taskData', JSON.stringify({
        activeTaskCategory: i18n.t('OPEN_TASK'),
        activeKey: 1,
        searchParamVal: 'openTasks',
        activePage: 1,
        searchStrVal: ''
      }));
    }
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.taskFormData && !this.props.isSaveTaskPristine) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      }
    });
  }

  setSearchTerm = evt => {
    const { searchParamVal, searchStrVal } = this.state;
    const searchStr = evt.target.value;
    const searchVal = searchStr && searchStr.replace(/\s\s+/g, ' ');
    if (searchVal && (searchVal === searchStrVal || searchVal === ' ')) return;
    if (/^[A-z\d\s]+$/i.test(searchVal) || searchVal === '') {
      const taskData = JSON.parse(sessionStorage.getItem('taskData')) || {};
      taskData.searchStrVal = searchVal;
      sessionStorage.setItem('taskData', JSON.stringify(taskData));
      this.setState({
        searchStrVal: searchVal
      });
      if (searchVal.length === 0 || searchVal.length > 1) {
        this.setState({
          activePage: 1
        });
        this.props.loadTasks({
          skip: 0,
          limit: Constants.RECORDS_PER_PAGE,
          searchParameter: searchParamVal,
          searchTerm: searchVal,
          date: Moment(new Date()).format('YYYY-MM-DD')
        }).then(() => {}, searchResponse => {
          if (searchResponse.error.statusCode === 400) {
            toastrErrorHandling(searchResponse.error, i18n.t('errorMessage.TASKS_SEARCH'),
              searchResponse.error.message, { removeOnHover: true });
          } else {
            toastrErrorHandling(searchResponse.error,
              i18n.t('errorMessage.TASKS_SEARCH'),
              i18n.t('errorMessage.COULD_NOT_LOAD_TASKS'), { removeOnHover: true });
          }
        });
      }
    }
  }

  getfinalDate = data => {
    const remianderTime = data.remainder ?
      Moment(data.remainder).format('hh:mm a') : Moment(data.dueDate).format('hh:mm a');
    const reminderDate = Moment(data.dueDate).format('YYYY-MM-DD');
    const finalizedDate = `${reminderDate} ${remianderTime}`;
    const convertedDate = new Date(finalizedDate);
    return convertedDate;
  }

  resetSearch = () => {
    const { searchParamVal } = this.state;
    const taskData = JSON.parse(sessionStorage.getItem('taskData')) || {};
    taskData.activePage = 1;
    taskData.searchStrVal = '';
    sessionStorage.setItem('taskData', JSON.stringify(taskData));
    this.setState({
      searchStrVal: '',
      activePage: 1
    }, () => {
      this.props.loadTasks({
        skip: 0,
        limit: Constants.RECORDS_PER_PAGE,
        searchParameter: searchParamVal,
        date: Moment(new Date()).format('YYYY-MM-DD')
      });
    });
  }

  openAddModal = () => {
    this.setState({ openTaskModal: true, selectedTask: {}, isEdit: false });
  }

  openViewPage = taskId => {
    this.props.pushState({ pathname: '/Tasks/View', query: { taskId: `${taskId}` } });
  }

  closeModal = evt => {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.setState({ openTaskModal: false });
  }


  handleSubmit = taskData => {
    const { searchStrVal } = this.state;
    if (taskData.remainderDate) {
      taskData.reminderType = taskData.remainderDate.id || taskData.remainderDate;
      const finalReminderDetail = this.getfinalDate(taskData);
      if (taskData.remainderDate === 'theDayBefore' ||
       taskData.remainderDate.id === 'theDayBefore') {
        taskData.remindAt = Moment(finalReminderDetail).subtract(1, 'days');
      } else if (taskData.remainderDate === 'theWeekBefore' ||
      taskData.remainderDate.id === 'theWeekBefore') {
        taskData.remindAt = Moment(finalReminderDetail).subtract(7, 'days');
      } else if (taskData.remainderDate === 'noReminder' ||
       taskData.remainderDate.id === 'noReminder') {
        taskData.remindAt = null;
      } else {
        taskData.remindAt = finalReminderDetail;
      }
    }
    const { activePage, selectedTask, searchParamVal } = this.state;
    taskData = trimExtraSpaces(taskData);
    if (taskData.assignee && taskData.assignee.id) {
      taskData.userId = taskData.assignee.id;
    }
    if (!selectedTask.id) {
      this.props.saveTask(taskData).then(() => {
        toastr.success(i18n.t('TASK'), i18n.t('successMessage.TASK_HAS_BEEN_ADDED_SUCCESSFULLY'));
        this.props.loadTasks({
          skip: (activePage - 1) * Constants.RECORDS_PER_PAGE,
          limit: Constants.RECORDS_PER_PAGE,
          searchParameter: searchParamVal,
          date: Moment(new Date()).format('YYYY-MM-DD'),
          searchTerm: searchStrVal.length !== 1 ? searchStrVal : '',
        });
      }, error => {
        toastrErrorHandling(error.error, i18n.t('TASK'), error.error.message);
      });
    } else {
      this.props.updateTask(selectedTask.id, taskData).then(() => {
        toastr.success(i18n.t('TASK'), i18n.t('successMessage.TASK_HAS_BEEN_UPDATED_SUCCESSFULLY'));
        this.props.loadTasks({
          skip: (activePage - 1) * Constants.RECORDS_PER_PAGE,
          limit: Constants.RECORDS_PER_PAGE,
          searchParameter: searchParamVal,
          date: Moment(new Date()).format('YYYY-MM-DD'),
          searchTerm: searchStrVal.length !== 1 ? searchStrVal : '',
        });
      }, error => {
        toastrErrorHandling(error.error, i18n.t('TASK'), error.error.message);
      });
    }
    this.closeModal();
  }

  handlePagination = (direction, pageNo, maxPage) => {
    if (direction !== 'goto') {
      document.getElementById('goToTask').value = '';
    }
    const pageCount = Math.ceil(this.props.totalCount / Constants.RECORDS_PER_PAGE);
    const { activePage, searchStrVal, searchParamVal } = this.state;
    if (maxPage < pageNo) {
      const msgObj = { statusCode: 200 };
      toastrErrorHandling(msgObj, i18n.t('errorMessage.PAGINATION_ERROR'), i18n.t('errorMessage.NO_PAGE_FOUND'));
      return null;
    }
    let currentPage = activePage;
    if (direction === 'previous') {
      if (currentPage === 1) {
        return;
      }
      currentPage -= 1;
    } else if (direction === 'next') {
      if (currentPage === pageCount) {
        return;
      }
      currentPage += 1;
    } else if (direction === 'first') {
      if (currentPage === 1) {
        return;
      }
      currentPage = 1;
    } else if (direction === 'last') {
      if (currentPage === pageCount) {
        return;
      }
      currentPage = pageNo;
    } else if ((direction === 'goto' && pageNo > 0)) {
      currentPage = pageNo;
    }

    this.scrollbar.scrollTop(0);
    const taskData = JSON.parse(sessionStorage.getItem('taskData')) || {};
    taskData.activePage = currentPage;
    sessionStorage.setItem('taskData', JSON.stringify(taskData));
    this.setState({
      activePage: currentPage
    });
    this.props.loadTasks({
      skip: (currentPage - 1) * Constants.RECORDS_PER_PAGE,
      limit: Constants.RECORDS_PER_PAGE,
      searchParameter: searchParamVal,
      searchTerm: searchStrVal.length !== 1 ? searchStrVal : '',
      date: Moment(new Date()).format('YYYY-MM-DD')
    });
  }

  selectPageNumber = (evt, maxPage) => {
    const pageNo = evt.target.value;
    if (evt.keyCode === 69) {
      evt.preventDefault();
    }
    if (evt.keyCode === 13 && pageNo > 0) {
      this.handlePagination('goto', Number(pageNo), maxPage);
    }
  }

  handleTasksCategoryChange = (key, event) => {
    if (document.getElementById('goToTask')) {
      document.getElementById('goToTask').value = '';
    }
    const { searchStrVal } = this.state;
    let searchParam = '';
    switch (key) {
      case '2':
        searchParam = 'dueToday';
        break;
      case '3':
        searchParam = 'dueThisWeek';
        break;
      case '4':
        searchParam = 'overdue';
        break;
      case '5':
        searchParam = 'completed';
        break;
      case '6':
        searchParam = 'assignedByMe';
        break;
      default:
        searchParam = 'openTasks';
    }
    this.props.loadTasks({
      skip: 0,
      limit: Constants.RECORDS_PER_PAGE,
      searchParameter: searchParam,
      searchTerm: searchStrVal.length !== 1 ? searchStrVal : '',
      date: Moment(new Date()).format('YYYY-MM-DD')
    });
    sessionStorage.setItem('taskData', JSON.stringify({
      activeKey: key,
      activePage: 1,
      activeTaskCategory: event.target.innerText,
      searchParamVal: searchParam,
      searchStrVal: ''
    }));
    this.setState({
      activeKey: key,
      activePage: 1,
      activeTaskCategory: event.target.innerText,
      searchParamVal: searchParam
    });
  }

  circleIndividual = (obj, isAssignee) => (
    <OverlayTrigger
      rootClose
      overlay={this.renderTooltip(obj, false, null, isAssignee)}
      placement="top"
      key={obj.id}
    >
      <span className={styles.circle}>
        {obj.firstName ? obj.firstName.charAt(0).toUpperCase() : ''}
        {obj.lastName ? obj.lastName.charAt(0).toUpperCase() : ''}
      </span>
    </OverlayTrigger>
  )

  circleMultiple = (list, isAssignee) => {
    if (list.length <= 2) {
      return '';
    }
    return (
      <OverlayTrigger
        rootClose
        overlay={this.renderTooltip(null, true, list, isAssignee)}
        placement="top"
      >
        <span className={styles.circle}>
          +{list.length - 2 }
        </span>
      </OverlayTrigger>
    );
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_TASK_FOUND</Trans></div></Row>
        <Row className={`${styles.empty_message} m-0`}>
          <div><Trans>CHANGE_SEARCH_PARAMS</Trans></div>
        </Row>
      </Col>
    );
    const loadingContent = (
      <Col className={styles.no_results_found}>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>Loading</Trans></div></Row>
      </Col>
    );
    if (this.props.loading) {
      return loadingContent;
    }
    return NoResultsFound;
  }

  renderCircle = (list, isAssignee) => (
    <span className={styles.circleContainer}>
      {list.slice(0, 2).map(obj => this.circleIndividual(obj, isAssignee))}
      {list.length === 3 ? this.circleIndividual(list[2], isAssignee) : this.circleMultiple(list, isAssignee)}
    </span>
  );

  renderTooltip = (obj, showAll, list, isAssignee) => {
    if (!showAll) {
      return (
        <Tooltip id={obj.id}>
          <strong>
            {`${obj.firstName ? obj.firstName : ''} ${obj.lastName ? obj.lastName : ''}` }
          </strong>
        </Tooltip>
      );
    }
    return (
      <Tooltip id={list.id} className={`salesTooltip ${styles.customTooltip}`}>
        <div>
          <strong>
            {`${list.length} ${isAssignee && 'Assignee(s)'}` }
          </strong>
        </div>
        {
          list.map(owner => (
            <div key={owner.id} className={styles.tooltip}>
              {`${owner.firstName ? owner.firstName : ''} ${owner.lastName ? owner.lastName : ''}` }
            </div>
          )
          )
        }
      </Tooltip>
    );
  }

  render() {
    const {
      activeTaskCategory,
      activeKey,
      activePage,
      openTaskModal,
      isEdit,
      selectedTask,
      searchStrVal
    } = this.state;
    const { totalCount, tasks } = this.props;
    const searchCustomerConfig = getSearchTaskConfig(this);
    const maxPage = Math.ceil(totalCount / Constants.RECORDS_PER_PAGE);
    return (
      <div className={styles.viewAllTasks}>
        <Row className={`${styles.count_n_pager} m-0`}>
          <Helmet title={i18n.t('TASKS')} />
          { (totalCount && totalCount > 0) || searchStrVal ?
            <Col lg={6} md={6} sm={12} className={styles.count_n_search}>
              <div className={`${styles.total_count}`}>
                <span>
                  {totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </span>
                <span className="p-l-5 p-r-10">
                  { totalCount > 1 ? <Trans>TASKS</Trans> : <Trans>TASK</Trans> }
                </span>
                <NewPermissible operation={{ operation: 'TASK_SEARCH', model: 'task' }}>
                  <span>|</span>
                </NewPermissible>
              </div>
              <NewPermissible operation={{ operation: 'TASK_SEARCH', model: 'task' }}>
                <div className={styles.search_bar}>
                  <SearchBar
                    {...searchCustomerConfig.fields[0]}
                    reset={e => this.resetSearch(e)}
                    handleOnChange={e => this.setSearchTerm(e)}
                    inpValue={searchStrVal}
                    handleOnKeyUp={() => { }}
                  />
                </div>
              </NewPermissible>
            </Col> : ''
          }
          <Col
            lg={6}
            md={10}
            sm={12}
            xs={12}
            lgOffset={(totalCount && totalCount > 0) || searchStrVal ? 0 : 6}
            smOffset={(totalCount && totalCount > 0) || searchStrVal ? 0 : 4}
            xsOffset={(totalCount && totalCount > 0) || searchStrVal ? 0 : 5}
            className={styles.task_actions}
          >
            <div className={`${styles.new_task_icon} display-inline`}>
              <NewPermissible operation={{ operation: 'CREATE_TASK', model: 'task' }}>
                {/* <i
                    className="fa fa-plus-circle"
                    aria-hidden="true"
                    title={i18n.t('tooltipMessage.CLICK_HERE_TO_CREATE_NEW_TASK')}
                    onClick={this.openAddModal}
                  /> */}
                <button
                  className={`${styles.add_btn} button-primary`}
                  type="submit"
                  title={i18n.t('tooltipMessage.CLICK_HERE_TO_CREATE_NEW_TASK')}
                  onClick={this.openAddModal}
                >
                  <span className="p-5" style={{ fontSize: '13px' }}><i className="fa fa-plus p-r-5" />
                    <Trans>ADD</Trans>
                  </span>
                </button>
              </NewPermissible>
            </div>
            <ButtonToolbar className="display-inline taskDropdown">
              <DropdownButton
                bsSize="small"
                title={activeTaskCategory}
                pullRight
                id="dropdown-size-medium"
                className={`orange-btn filter-btn opening_dropdown ${styles.new_task}`}
                onSelect={this.handleTasksCategoryChange}
              >
                <MenuItem
                  eventKey="1"
                  className={activeKey === '1' ? styles.menuActive : styles.menuInActive}
                >
                  {i18n.t('OPEN_TASK')}
                </MenuItem>
                <MenuItem
                  eventKey="2"
                  className={activeKey === '2' ? styles.menuActive : styles.menuInActive}
                >
                  {i18n.t('DUE_TODAY')}
                </MenuItem>
                <MenuItem
                  eventKey="3"
                  className={activeKey === '3' ? styles.menuActive : styles.menuInActive}
                >
                  {i18n.t('DUE_THIS_WEEK')}
                </MenuItem>
                <MenuItem
                  eventKey="4"
                  className={activeKey === '4' ? styles.menuActive : styles.menuInActive}
                >
                  {i18n.t('OVERDUE')}
                </MenuItem>
                <MenuItem
                  eventKey="5"
                  className={activeKey === '5' ? styles.menuActive : styles.menuInActive}
                >
                  {i18n.t('COMPLETED')}
                </MenuItem>
                <MenuItem
                  eventKey="6"
                  className={activeKey === '6' ? styles.menuActive : styles.menuInActive}
                >
                  {i18n.t('ASSIGNED_BY_ME')}
                </MenuItem>
              </DropdownButton>
            </ButtonToolbar>
            {
              maxPage && maxPage > 1 ?
                <div className={`${styles.page_goto} display-inline`}>
                  <input
                    type="number"
                    id="goToTask"
                    onKeyDown={e => this.selectPageNumber(e, maxPage)}
                    placeholder={i18n.t('placeholder.GO_TO')}
                    onKeyPress={restrictDecimalNumber}
                    min="1"
                  />
                </div>
                : ''
            }
            {
              maxPage && maxPage > 1 ?
                <Pager className={`${styles.pager} display-inline`}>
                  <Pager.Item
                    className={this.state.activePage <= 1 ? `${styles.disabled} ${styles.page_no_height} p-r-5` :
                      `${styles.page_no_height} p-r-5`}
                    onClick={() => this.handlePagination('first')}
                  >
                    <span><Trans>FIRST</Trans></span>
                  </Pager.Item>
                  <Pager.Item
                    className={this.state.activePage <= 1 ? `${styles.disabled} ${styles.page_no_height}` :
                      styles.page_no_height}
                    onClick={() => this.handlePagination('previous')}
                  >
                    <span className="fa fa-caret-left" />
                  </Pager.Item>
                  <Pager.Item
                    title={`${i18n.t('tooltipMessage.TOTAL_PAGES')} : ${maxPage}`}
                    className={`${styles.page_no} ${styles.page_no_height}`}
                  >
                    {activePage}
                  </Pager.Item>
                  <Pager.Item
                    className={maxPage <= this.state.activePage ? `${styles.disabled} ${styles.page_no_height}` :
                      styles.page_no_height}
                    onClick={() => this.handlePagination('next', maxPage)}
                  >
                    <span className="fa fa-caret-right" />
                  </Pager.Item>
                  <Pager.Item
                    className={maxPage <= this.state.activePage ? `${styles.disabled} p-l-5 ${styles.page_no_height}`
                      : `${styles.page_no_height} p-l-5`}
                    onClick={() => this.handlePagination('last', maxPage)}
                  >
                    <span><Trans>LAST</Trans></span>
                  </Pager.Item>
                </Pager>
                : ''
            }
          </Col>
          <Col lg={12} sm={12} xs={12} className={`${styles.no_task_msg} m-b-20`}>
            {totalCount && totalCount > 0 ? null : this.renderNoResultsFound()}
          </Col>
        </Row>
        {totalCount && totalCount > 0 ?
          <Scrollbars
            ref={c => { this.scrollbar = c; }}
            universal
            autoHide
            autoHeight
            autoHeightMin={'calc(100vh - 130px)'}
            renderThumbHorizontal={props => <div {...props} className="hide" />}
            renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
            className={'p-l-15'}
          >
            <Col sm={12} className="p-0">
              {tasks.map(task => (
                <Col
                  key={`task_${task.id}`}
                  lg={4}
                  md={6}
                  sm={12}
                  xs={12}
                  className="p-l-0 p-b-15 cursor-pointer"
                  onClick={() => this.openViewPage(task.id)}
                >
                  <Col sm={12} className={`${styles.task} p-0 shadow_one`}>
                    <Col sm={12} className={styles.content}>
                      <Col sm={12} className="p-l-0">
                        <div
                          className={`${styles.title} ${styles.ellipsis} p-l-0  p-b-5 p-t-5`}
                          title={task.title}
                        >{task.title}</div>
                      </Col>
                      <Col sm={12} className={'p-l-0 p-b-5 p-t-5'}>
                        <span className={styles.info_label}><Trans>TYPE</Trans>: </span>
                        <span className={styles.info}>
                          {task.type}
                        </span>
                      </Col>
                      <Col sm={12} className={'p-l-0 p-b-5 p-t-5'}>
                        <span className={styles.info_label}><Trans>DUE_DATE</Trans>: </span>
                        <span className={styles.info}>
                          {Moment(new Date(task.dueDate), 'LL').format('DD MMM YYYY hh:mm A')}
                        </span>
                      </Col>
                      {task.assignee &&
                        <Col sm={12} className={'p-l-0 p-b-5 p-t-5'}>
                          <span className={styles.info_label}><Trans>ASSIGNEE</Trans>: </span>
                          <span className={styles.info}>
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </Col>
                      }
                      {task.user &&
                        <Col sm={12} className={'p-l-0 p-b-5 p-t-5'}>
                          <span className={styles.info_label}><Trans>ASSIGNED_BY</Trans>: </span>
                          <span className={styles.info}>
                            {task.user.firstName} {task.user.lastName}
                          </span>
                        </Col>
                      }
                      {task.assignees && task.assignees.length > 0 &&
                        <Col sm={12} className={'p-l-0 p-b-5 p-t-5'}>
                          <span className={'left'} style={{ display: 'inline-flex' }}>
                            <span style={{ verticalAlign: 'middle', paddingTop: '3px' }} className={styles.info_label}>
                              <Trans>ASSIGNED_TO</Trans>: </span>
                            <span className="p-l-5">{this.renderCircle(task.assignees, true)}</span>
                          </span>
                        </Col>
                      }
                      <Col sm={12} className={`${styles.footer} p-l-0 p-b-5 p-t-5 m-t-25 left`}>
                        <div style={{ lineHeight: '35px', verticalAlign: 'midddle' }}>
                          <span className={styles.info_label}><Trans>CREATED_AT</Trans>: </span>
                          <span className={styles.info}>
                            {Moment(new Date(task.createdAt), 'LL').format('DD MMM YYYY hh:mm A')}
                          </span>
                        </div>
                      </Col>
                    </Col>
                  </Col>
                </Col>
              ))}
            </Col>
          </Scrollbars> :
          ''
        }
        {openTaskModal &&
          <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
            <Col xs={12} md={12}>
              <EditTask
                isEdit={isEdit}
                selectedTask={selectedTask}
                openTaskModal={openTaskModal}
                onSubmit={data => this.handleSubmit(data)}
                closeModal={this.closeModal}
              />
            </Col>
          </Row>
        }
        <Loader loading={this.props.loading} />
      </div>
    );
  }
}

export default Tasks;
