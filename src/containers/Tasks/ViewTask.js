import React, { Component } from 'react';
import { Row, Col, Tab, Tabs } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { Trans } from 'react-i18next';
import { reduxForm, getFormValues, isPristine } from 'redux-form';
import Helmet from 'react-helmet';
import lodash from 'lodash';
import Moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import TextArea from '../../components/FormComponents/TextArea';
import DropdownField from '../../components/FormComponents/DropdownList';
import { loadTask, updateTask, updateTaskStatus, loadTaskActivities } from '../../redux/modules/tasks';
import EditTask from './EditTask';
import styles from './Tasks.scss';
import StatusValidation from './StatusValidation';
import { trimExtraSpaces, trimTrailingSpace } from '../../utils/validation';
import { getTaskStatusFormConfig } from '../../formConfig/TaskStatus';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import SearchBar from '../../components/FormComponents/SearchBar';

let timeoutId;

@reduxForm({
  form: 'taskStatus',
  validate: StatusValidation,
})

@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  isSaveTaskPristine: isPristine('task')(state),
  taskFormData: state.form.task,
  isChangeTaskPristine: isPristine('taskStatus')(state),
  taskStatusFormData: state.form.taskStatus,
  taskId: state.routing.locationBeforeTransitions.query.taskId,
  currentTask: state.tasks.task || {},
  taskActivities: state.tasks.taskActivities || {},
  user: state.auth.user,
  updatingStatus: state.tasks.updatingStatus
}), { loadTask, updateTask, updateTaskStatus, loadTaskActivities })

export default class ViewTask extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    loadTask: PropTypes.func.isRequired,
    values: PropTypes.object,
    isSaveTaskPristine: PropTypes.bool,
    taskFormData: PropTypes.object,
    isChangeTaskPristine: PropTypes.bool,
    taskStatusFormData: PropTypes.object,
    route: PropTypes.object,
    router: PropTypes.object,
    taskActivities: PropTypes.array.isRequired,
    updateTask: PropTypes.func.isRequired,
    updateTaskStatus: PropTypes.func.isRequired,
    loadTaskActivities: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    taskId: PropTypes.string,
    currentTask: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    updatingStatus: PropTypes.bool
  }

  static defaultProps = {
    values: {},
    taskId: '',
    route: null,
    router: null,
    isSaveTaskPristine: true,
    taskFormData: null,
    isChangeTaskPristine: true,
    taskStatusFormData: null,
    updatingStatus: false
  }

  constructor(props) {
    super(props);
    this.state = {
      openTaskModal: false,
      isEdit: false,
      searchTerm: '',
      activeKey: 1,
      statusData: [{ id: 'open', name: 'Open', text: i18n.t('OPEN') },
        { id: 'onhold', name: 'On Hold', text: i18n.t('ON_HOLD') },
        { id: 'inprogress', name: 'In Progress', text: i18n.t('IN_PROGRESS') },
        { id: 'completed', name: 'Completed', text: i18n.t('COMPLETED') }],
      previousValues: ''

    };
  }

  componentWillMount() {
    const { taskId } = this.props;
    const isTabsActivityPermitted = NewPermissible.isPermitted({ operation: 'TASK_ACTIVITIES', model: 'task' });
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT', model: 'task' });
    const isEditMePermitted = NewPermissible.isPermitted({ operation: 'EDIT_ME', model: 'task' });
    const isEditAssignerPermitted = NewPermissible.isPermitted({ operation: 'ASSIGNEER_CAN_EDIT', model: 'task' });
    this.setState({
      isTabsActivityPermitted,
      isEditPermitted,
      isEditMePermitted,
      isEditAssignerPermitted
    }, () => {
      this.props.loadTask(taskId);
    });
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.taskFormData && !this.props.isSaveTaskPristine && this.state.openTaskModal) {
        return (i18n.t('confirmMessage.UNSAVED_CHANGES'));
      } else if (this.props.taskStatusFormData && !this.props.isChangeTaskPristine) {
        return (i18n.t('confirmMessage.UNSAVED_CHANGES'));
      }
    });
  }

  componentWillReceiveProps(props) {
    this.setState({ previousValues: props.currentTask });
  }

  getRecentActivityList = activityList => {
    const recentActivityList = [];
    let count = 0;
    if (activityList) {
      activityList.map(activity => {
        if (activity.oldStatus && activity.newStatus) {
          const currentRow = {};
          if (activity.user) {
            if (activity.user.lastName) {
              currentRow.userName = `${activity.user.firstName} ${activity.user.lastName}`;
            } else {
              currentRow.userName = activity.user.firstName;
            }
          }
          currentRow.status = this.getStatusByStatusId(activity.newStatus);
          currentRow.icon = this.getActivityListIcon(activity.newStatus);
          currentRow.createdAt = activity.createdAt;
          currentRow.comment = activity.metadata.comments;
          recentActivityList.push(currentRow);
        } else if (count < 1) {
          count += 1;
          recentActivityList.push(this.generateFirstActivity());
        }
        return null;
      });
    } else {
      recentActivityList.push(this.generateFirstActivity());
    }
    return recentActivityList;
  }

  getActivityListIcon = status => {
    let icon = '';
    switch (status) {
      case 'open':
        icon = 'fa fa-envelope-open-o';
        break;
      case 'onhold':
        icon = 'fa fa-exclamation-circle';
        break;
      case 'inprogress':
        icon = 'fa fa-hourglass-end';
        break;
      case 'completed':
        icon = 'fa fa-check';
        break;
      default:
        icon = 'fa fa-envelope-open-o';
    }
    return icon;
  }

  getStatusData = () => {
    const { currentTask } = this.props;
    const { statusData } = this.state;
    const currentStatus = currentTask && currentTask.status ? currentTask.status : '';
    return statusData.filter(status => status.id !== currentStatus);
  }

  getStatusByStatusId = statusId => {
    const { statusData } = this.state;
    let statusName = '';
    statusData.forEach(status => {
      if (status.id === statusId) {
        statusName = status.text;
      }
    });
    return statusName;
  }

  getfinalDate = data => {
    const remianderTime = data.remainder ? Moment(data.remainder).format('hh:mm a')
      : Moment(data.dueDate).format('hh:mm a');
    const reminderDate = Moment(data.dueDate).format('YYYY-MM-DD');
    const finalizedDate = `${reminderDate} ${remianderTime}`;
    const convertedDate = new Date(finalizedDate);
    return convertedDate;
  }

  getEditPermission = task => {
    const { isEditMePermitted, isEditPermitted, isEditAssignerPermitted } = this.state;
    const { user } = this.props;
    let isPermitted = false;
    if (isEditPermitted) {
      isPermitted = true;
    } else if (isEditMePermitted && (task && task.createdBy) === (user && user.id)) {
      isPermitted = true;
    } else if (isEditAssignerPermitted &&
      task.assignees &&
      lodash.find(task.assignees, assignee => assignee.id === user.id)) {
      isPermitted = true;
    }
    return isPermitted;
  }

  setSearchTerm = evt => {
    let value = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    if (value === this.state.searchTerm || value === ' ') {
      value = value.trim();
    }
    if (/^[a-zA-Z0-9\s@.]+$/i.test(value) || value === '') {
      this.setState({ searchTerm: trimTrailingSpace(value) }, () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          this.loadTaskActivities();
        }, 1000);
      });
    }
  }

  resetSearch = () => {
    this.setState({ searchTerm: '' }, () => {
      this.props.reset();
      this.loadTaskActivities();
    });
  }

  loadTaskActivities = () => {
    const { searchTerm } = this.state;
    const { taskId } = this.props;
    const data = {
      searchTerm,
      taskId
    };
    this.props.loadTaskActivities(data);
  }

  generateFirstActivity = () => {
    const { currentTask } = this.props;
    const activity = {};
    if (currentTask.user) {
      if (currentTask.user.lastName) {
        activity.userName = `${currentTask.user.firstName} ${currentTask.user.lastName}`;
      } else {
        activity.userName = currentTask.user.firstName;
      }
    }
    activity.status = this.getStatusByStatusId('open');
    activity.icon = this.getActivityListIcon('open');
    activity.createdAt = currentTask.createdAt;
    return activity;
  };

  openEditTaskModal = () => {
    this.setState({ openTaskModal: true, isEdit: true });
  }

  closeModal = evt => {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.setState({ openTaskModal: false, isEdit: false });
  }

  iterateMapAndAttachValues = (arrays, flag) => {
    let totalString = '';
    if (arrays) {
      arrays.map((array, index) => {
        if (array) {
          if (!flag) {
            totalString += array.name;
          } else if (flag === 1) {
            totalString += array.jobTitle;
          } else if (flag === 2) {
            totalString += `${array.firstName} ${array.lastName}`;
          } else if (flag === 3) {
            totalString += `${array.user.firstName} - ${array.status}`;
          }
          if (totalString && index !== arrays.length - 1) {
            totalString = `${totalString}, `;
          }
        }
        return true;
      });
    }
    return ` ${totalString}`;
  }
  handleSubmit = taskData => {
    console.log(taskData, 'handle click');
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
    } else {
      taskData.reminderType = '';
      taskData.remindAt = null;
    }
    const { values, taskId, currentTask, user } = this.props;
    if (currentTask.assignees && taskData.assignees) {
      const myIndexOf = (array, value) => {
        for (let i = 0; i < array.length; i += 1) {
          if (array[i].id === value.id) {
            return i;
          }
        }
        return -1;
      };
      const assignees = currentTask.assignees.filter(val => myIndexOf(taskData.assignees, val) !== -1);
      const newAssignees = taskData.assignees.filter(val => myIndexOf(assignees, val) === -1);
      const removedAssignees = currentTask.assignees.filter(val => myIndexOf(taskData.assignees, val) === -1);
      taskData = trimExtraSpaces(taskData);
      taskData.assignees = assignees;
      taskData.newAssignees = newAssignees;
      taskData.removedAssignees = removedAssignees;
    }
    if (!taskData.id && (values && values.status && values.status.id)) {
      const updateData = {};
      updateData.status = values.status.id;
      if (values.comments) {
        updateData.statusComment = values.comments;
      }
      updateData.isAssignee = currentTask.assigneeStatus.some(assignee => (assignee.userId === user.id &&
        !(currentTask.createdBy === user.id)));
      updateData.currentTask = currentTask;
      console.log(currentTask, 'currentTask');
      this.props.updateTaskStatus(taskId, updateData).then(() => {
        if (updateData.status === 'completed') {
          currentTask.assignees.forEach(eachAssignee => {
            localStorage.setItem('removedData',
              JSON.stringify({
                tab: 'task',
                id: taskId,
                userId: eachAssignee.id
              }));
            localStorage.removeItem('removedData');
          });
        }
        toastr.success(i18n.t('TASK'), i18n.t('successMessage.TASK_HAS_BEEN_UPDATED_SUCCESSFULLY'));
        this.props.loadTask(taskId);
        this.props.reset();
      }, error => {
        toastrErrorHandling(error.error, i18n.t('TASK'), error.error.message);
      });
    } else {
      const { previousValues } = this.state;
      const deviceDetails = JSON.parse(localStorage.getItem('deviceDetails'));
      taskData.previousValues = previousValues;
      taskData.deviceDetails = deviceDetails;
      this.props.updateTask(taskId, taskData).then(() => {
        taskData.removedAssignees.forEach(eachAssignee => {
          localStorage.setItem('removedData',
            JSON.stringify({
              tab: 'task',
              id: taskId,
              userId: eachAssignee.id
            }));
          localStorage.removeItem('removedData');
        });
        toastr.success(i18n.t('TASK'), i18n.t('successMessage.TASK_HAS_BEEN_UPDATED_SUCCESSFULLY'));
        this.props.loadTask(taskId);
        this.closeModal();
      }, error => {
        toastrErrorHandling(error.error, i18n.t('TASK'), error.error.message);
      });
    }
  }

  handleTabSelect = key => {
    this.props.reset();
    if (key === 2) {
      this.loadTaskActivities();
    }
    this.setState({ activeKey: key, searchTerm: '' });
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col sm={12} md={12} lg={12} className={styles.no_results_found} style={{ margin: '80px auto' }}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_TASK_FOUND</Trans></div></Row>
      </Col>
    );
    return NoResultsFound;
  }

  render() {
    const { openTaskModal, isEdit, isTabsActivityPermitted, activeKey } = this.state;
    const { currentTask, taskActivities, handleSubmit, values, updatingStatus } = this.props;
    const activityList = this.getRecentActivityList(taskActivities);
    const filterConfig = getTaskStatusFormConfig(this);
    // const ids = currentTask && currentTask.assignees ? lodash.map(currentTask.assignees, 'id') : [];
    return (
      <Col xs={12} className={`${styles.view_task} company_container`}>
        <Helmet title={i18n.t('TASK')} />
        <div>
          <Col
            lg={12}
            md={12}
            sm={12}
            xs={12}
            className={`${styles.task_section} ${styles.white_bg} shadow_one`}
            id={currentTask.id}
          >
            <Col lg={12} className="p-0">
              <Tabs
                defaultActiveKey={1}
                id="viewTask"
                className={`${styles.tab_section}`}
                onSelect={this.handleTabSelect}
              >
                <Tab eventKey={1} title={i18n.t('OVERVIEW')}>
                  {activeKey === 1 && <div className={`${styles.task_container}`}>
                    <Row className={styles.task_details}>
                      <Col lg={9} md={8} sm={9} xs={7}>
                        <div className="m-b-10">
                          <div
                            title={currentTask.title}
                            className={` ${styles.task_title} ${styles.ellipsis} ${styles.task_title_width}`}
                          >
                            {currentTask.title}
                          </div>
                        </div>
                        {currentTask.assignees &&
                          <div className="m-b-10">
                            <span className={styles.task_heading}><Trans>ASSIGNED_TO</Trans>: </span>
                            <span className={`${styles.task_data} p-l-5`}>
                              {this.iterateMapAndAttachValues(currentTask.assignees, 2)}
                            </span>
                          </div>
                        }
                        {currentTask.user &&
                          <div className="m-b-10">
                            <span className={styles.task_heading}><Trans>ASSIGNED_BY</Trans>: </span>
                            <span className={`${styles.task_data} p-l-5`}>
                              {currentTask.user.firstName} {currentTask.user.lastName}
                            </span>
                          </div>
                        }
                        <div className="m-b-10">
                          <span className={styles.task_heading}>
                            <Trans>TYPE</Trans>:
                          </span>
                          <span className={`${styles.task_data} p-l-5`}>
                            {currentTask.type}
                          </span>
                        </div>
                        <div className="m-b-10">
                          <span className={styles.task_heading}><Trans>DUE_DATE</Trans>: </span>
                          <span className={`${styles.task_data} p-l-5`}>
                            {Moment(currentTask.dueDate).format('DD MMM YYYY hh:mm A')}
                          </span>
                        </div>
                        {
                          currentTask.clients && currentTask.clients.length > 0 &&
                          <div className="m-b-10">
                            <span className={styles.task_heading}><Trans>COMPANIES</Trans>: </span>
                            <span className={`${styles.task_data} p-l-5`}>
                              {this.iterateMapAndAttachValues(currentTask.clients, 0)}
                            </span>
                          </div>
                        }
                        {
                          currentTask.contacts && currentTask.contacts.length > 0 &&
                          <div className="m-b-10">
                            <span className={styles.task_heading}><Trans>CONTACTS</Trans>: </span>
                            <span className={`${styles.task_data} p-l-5`}>
                              {this.iterateMapAndAttachValues(currentTask.contacts, 2)}
                            </span>
                          </div>
                        }
                        {
                          currentTask.jobOpenings && currentTask.jobOpenings.length > 0 &&
                          <div className="m-b-10">
                            <span className={styles.task_heading}><Trans>OPENINGS</Trans>: </span>
                            <span className={`${styles.task_data} p-l-5`}>
                              {this.iterateMapAndAttachValues(currentTask.jobOpenings, 1)}
                            </span>
                          </div>
                        }
                        <div className="m-b-10">
                          <span className={styles.task_heading}><Trans>CURRENT_STATUS</Trans>: </span>
                          <span className={`${styles.task_data} p-l-5`}>
                            {currentTask.status}
                          </span>
                        </div>
                        {
                          currentTask.comments &&
                          <div className="m-b-10">
                            <span className={styles.task_heading}><Trans>COMMENTS</Trans>: </span>
                            <span
                              className={`${styles.task_data} ${styles.word_wrap} p-l-5`}
                              style={{ textTransform: 'none' }}
                            >
                              {currentTask.comments}
                            </span>
                          </div>
                        }
                        {currentTask.assigneeStatus &&
                          <div className="m-b-10">
                            <span className={styles.task_heading}><Trans>ASSIGNEE_STATUS</Trans>: </span>
                            <span className={`${styles.task_data} p-l-5`}>
                              {this.iterateMapAndAttachValues(currentTask.assigneeStatus, 3)}
                            </span>
                          </div>
                        }
                      </Col>
                      <Col lg={3} md={4} sm={3} xs={5} className="m-t-10">
                        <Col md={7} sm={8} xs={12}>
                          {this.getEditPermission(currentTask) && <button
                            id={currentTask.id}
                            className={`${styles.edit_btn} button-secondary-hover m-t-10 m-b-10`}
                            type="button"
                            onClick={this.openEditTaskModal}
                          >
                            <span>
                              <i
                                className="fa fa-pencil-square-o"
                                aria-hidden="true"
                              /><Trans>EDIT</Trans></span>
                          </button>
                          }
                        </Col>
                      </Col>
                    </Row>
                    <Row className={styles.task_status_section}>
                      <Col xs={12} lg={12} className="m-t-25">
                        <div className="m-b-10">
                          <div className={styles.task_title}>
                            <Trans>STATUS_UPDATE</Trans>
                          </div>
                        </div>
                        <form className="form-horizontal" onSubmit={handleSubmit(this.handleSubmit)}>
                          {/* <NewPermissible operation={{ operation: 'UPDATE_TASK_STATUS', model: 'task' }}> */}
                          <Row>
                            <Col lg={4} md={6} sm={12} xs={12} className="m-b-10 m-t-10">
                              <DropdownField {...filterConfig.status} />
                            </Col>
                          </Row>
                          {/* </NewPermissible> */}
                          <Row>
                            <Col lg={4} md={6} sm={12} xs={12} className="m-b-10">
                              <TextArea {...filterConfig.comment} />
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={4} md={6} sm={12} xs={12} className="m-t-10 left">
                              <Col lg={3} md={3} sm={3} xs={3} className="p-5 left">
                                <button
                                  className={`${styles.save_btn} button-primary`}
                                  type="submit"
                                  disabled={!(values && values.status) || updatingStatus}
                                >
                                  <span>
                                    { updatingStatus ?
                                      <i className="fa fa-spinner fa-spin p-l-r-7" aria-hidden="true" /> :
                                      <i className="fa fa-paper-plane" />
                                    }
                                    <Trans>SAVE</Trans>
                                  </span>
                                </button>
                              </Col>
                            </Col>
                          </Row>
                        </form>
                      </Col>
                    </Row>
                  </div>}
                </Tab>
                {isTabsActivityPermitted &&
                  <Tab eventKey={2} title={i18n.t('TASK_ACTIVITY')}>
                    {activeKey === 2 && <div>
                      <Col lg={3} md={4} sm={5} className="m-b-10">
                        <SearchBar
                          name="searchTaskActivty"
                          reset={e => this.resetSearch(e)}
                          handleOnChange={e => this.setSearchTerm(e)}
                          handleOnKeyUp={() => {}}
                          inpValue={this.state.searchTerm}
                          placeholder={'SEARCH'}
                        />
                      </Col>
                      <Scrollbars
                        universal
                        autoHide
                        autoHeight
                        autoHeightMin={'calc(100vh - 165px)'}
                        autoHeightMax={'calc(100vh - 165px)'}
                        renderThumbHorizontal={props => <div {...props} className="hide" />}
                        renderView={props => <div {...props} className="customScroll" />}
                      >
                        <Col sm={12} className="m-t-15">
                          <Col sm={12} className="p-0">
                            {
                              activityList && activityList.length !== 0 ?
                                activityList.map((activity, i) => (
                                  <div key={`key_${Math.random().toString(36).substring(7)}`}>
                                    <Col sm={12} className="p-0 m-l-10">
                                      <Timeline className={styles.activity_timeline}>
                                        {activity &&
                                        <TimelineEvent
                                          title={activity.status}
                                          icon={<i className={`${activity.icon}`} aria-hidden="true" />}
                                          createdAt={(activity.createdAt &&
                                          Moment(activity.createdAt).format('DD MMM YYYY hh:mm a'))
                                          }
                                          contentStyle={{ backgroundColor: '#ebf0f6', padding: '.3em' }}
                                          titleStyle={{ color: '#000000', fontWeight: '500' }}
                                        >
                                          <div>
                                            {activity.userName && currentTask.user &&
                                            <div className={`${styles.activity_timeline_detail}`}>
                                              {i === 0 ? <span><Trans>ASSIGNED_BY</Trans>: </span>
                                                : <span><Trans>UPDATED_BY</Trans>: </span>}
                                              <span className={`${styles.activity_timeline_detail_head}`}>
                                                {activity.userName}
                                              </span>
                                            </div>
                                            }
                                            {activity.comment &&
                                            <div className={`${styles.activity_timeline_detail}`}>
                                              <span><Trans>COMMENT</Trans>: </span>
                                              <span
                                                className={`${styles.activity_timeline_detail_head} 
                                                 ${styles.word_wrap}`}
                                              >
                                                {activity.comment}
                                              </span>
                                            </div>
                                            }
                                          </div>
                                        </TimelineEvent>
                                        }
                                      </Timeline>
                                    </Col>
                                  </div>
                                )) : this.renderNoResultsFound()
                            }
                          </Col>
                        </Col>
                      </Scrollbars></div>}
                  </Tab>
                }
              </Tabs>
            </Col>
          </Col>
          {openTaskModal &&
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <Col xs={12} md={12}>
                <EditTask
                  isEdit={isEdit}
                  selectedTask={currentTask}
                  openTaskModal={openTaskModal}
                  onSubmit={data => this.handleSubmit(data)}
                  closeModal={this.closeModal}
                />
              </Col>
            </Row>
          }
        </div>
      </Col>
    );
  }
}
