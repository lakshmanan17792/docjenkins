import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';
import { reduxForm, getFormValues, propTypes, change } from 'redux-form';
import { Modal, Col, Row } from 'react-bootstrap';
import lodash from 'lodash';
import Moment from 'moment';
import InputBox from '../../components/FormComponents/InputBox';
import TextArea from '../../components/FormComponents/TextArea';
// import DatePicker from '../../components/FormComponents/DatePicker';
import DateTimePicker from '../../components/FormComponents/DateTimePicker';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import DropdownField from '../../components/FormComponents/DropdownList';
import TaskValidation from './TaskValidation';
import { getTaskFormConfig } from '../../formConfig/SaveTask';
import {
  loadContacts,
  loadJobOpeningsForCompany
} from '../../redux/modules/tasks';
import {
  loadUsers
} from '../../redux/modules/users/user.js';
// import { loadContactPerson } from '../../redux/modules/openings';
import { loadClientCompanies, loadContactPerson } from '../../redux/modules/openings';
import styles from './Tasks.scss';
import i18n from '../../i18n';

@reduxForm({
  form: 'task',
  validate: TaskValidation,
  touchOnChange: true
})

@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  customers: state.openings.companyList || [],
  contacts: state.openings.contactPerson || []
}), {
  loadClientCompanies,
  loadContacts,
  loadJobOpeningsForCompany,
  loadUsers,
  loadContactPerson,
  change
})

class EditTask extends Component {
  static propTypes = {
    ...propTypes,
    handleSubmit: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    openTaskModal: PropTypes.bool.isRequired,
    initialize: PropTypes.func.isRequired,
    selectedTask: PropTypes.object.isRequired,
    isEdit: PropTypes.bool.isRequired,
    customers: PropTypes.array.isRequired,
    loadClientCompanies: PropTypes.func.isRequired,
    loadContacts: PropTypes.func.isRequired,
    loadJobOpeningsForCompany: PropTypes.func.isRequired,
    users: PropTypes.object,
    loadUsers: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    values: PropTypes.object,
    pristine: PropTypes.bool
  };

  static defaultProps = {
    values: null,
    users: {},
    pristine: true
  }

  constructor(props) {
    super(props);
    this.state = {
      isCompleted: false,
      contactList: [],
      jobOpeningList: [],
      isCompanyOpen: false,
      isOpeningOpen: false,
      remainderTypes: [],
      showDatePicker: false,
      showTimePicker: true,
      enableTimePicker: false,
      users: []
    };
  }

  componentWillMount() {
    const { selectedTask } = this.props;
    // this.props.loadClientCompanies();
    this.props.loadUsers().then(users => {
      this.setState({ users: [...users] });
    });
    if (selectedTask && selectedTask.id) {
      const editType = { id: 3, name: selectedTask.type };
      if (selectedTask.type === 'Call') {
        editType.id = 1;
      } else if (selectedTask.type === 'E-Mail') {
        editType.id = 2;
      }
      this.handleRemainderType('', selectedTask.dueDate);
      if (selectedTask.reminderType && selectedTask.reminderType === 'noReminder') {
        this.setState({ showTimePicker: false, enableTimePicker: false });
      } else if (selectedTask.reminderType && selectedTask.reminderType !== 'noReminder') {
        this.setState({ showTimePicker: true, enableTimePicker: true });
      }
      if (selectedTask.clients) {
        this.handleCompanyChange('intialValues', selectedTask.clients);
      }
      if (selectedTask.contacts.length) {
        lodash.forEach(selectedTask.contacts, contact => {
          contact.name = `${contact.firstName} ${contact.lastName}`;
        });
      }
      this.props.initialize({
        title: selectedTask.title,
        clients: selectedTask.clients,
        contacts: selectedTask.contacts,
        jobOpenings: selectedTask.jobOpenings,
        type: editType,
        remainderDate: selectedTask.reminderType,
        remainder: selectedTask.remindAt,
        dueDate: selectedTask.dueDate,
        comments: selectedTask.comments,
        assignees: selectedTask.assignees
      });
    }
  }

  handleCheckBox = evt => {
    this.setState({
      isCompleted: evt.target.checked
    });
  }
  handleAssigneeChange = assigneeObj => {
    if (assigneeObj.preventDefault) {
      delete assigneeObj.preventDefault;
    }
  }
  handleChange = value => {
    if (value) {
      this.setState({
        isCompanyOpen: true
      });
      this.props.loadClientCompanies({
        searchTerm: value.toLowerCase(),
        loadAllCompanies: true
      });
    } else {
      this.setState({
        isCompanyOpen: false
      });
    }
  }

  handleDatePicker = evt => {
    if (evt.id === 'customDate') {
      this.setState({ showDatePicker: true });
    } else {
      this.setState({ showDatePicker: false });
    }

    if (evt.id === 'noReminder') {
      this.setState({ showTimePicker: false, enableTimePicker: false });
      this.props.change(this.props.form, 'remainder', null);
    } else {
      this.setState({ showTimePicker: true, enableTimePicker: true });
    }
  }

  validateTiming = (e, value) => {
    const validDate = new Date();
    if (!Moment(value).isBefore(this.props.values.dueDate, 'hour') || !Moment(value).isBefore(validDate, 'hour')) {
      this.props.change(this.props.form, 'remainder', '');
    }
  }

  handleRemainderType = (e, value) => {
    const currentDate = new Date();
    let initialData = [{
      id: 'theDayOf',
      name: 'The day of',
      text: i18n.t('THE_DAY_OF')
    }, {
      id: 'theDayBefore',
      name: 'The day before',
      text: i18n.t('THE_DAY_BEFORE')
    }, {
      id: 'theWeekBefore',
      name: 'The week before',
      text: i18n.t('THE_WEEK_BEFORE')
    }, {
      id: 'noReminder',
      name: 'No Reminder',
      text: i18n.t('NO_REMINDER')
    }];
    if (!Moment(currentDate).isAfter(value, 'day')) {
      const dateDiffrence = Moment(value).diff(currentDate, 'day');
      const hourDiffrence = Moment(value).diff(currentDate, 'hour');
      if (dateDiffrence < 7) {
        initialData = _.filter(initialData, object => object.id !== 'theWeekBefore');
        if (this.props.values && this.props.values.remainderDate &&
          (this.props.values.remainderDate === 'theWeekBefore' ||
          this.props.values.remainderDate.id === 'theWeekBefore')) {
          this.props.values.remainderDate = '';
          this.props.values.remainder = '';
          this.setState({ showTimePicker: true, enableTimePicker: false });
        }
        if (dateDiffrence < 1) {
          initialData = _.filter(initialData, object => object.id !== 'theDayBefore');
          if (this.props.values && this.props.values.remainderDate &&
            (this.props.values.remainderDate === 'theDayBefore ' ||
            this.props.values.remainderDate.id === 'theDayBefore ')) {
            this.props.values.remainderDate = '';
            this.props.values.remainder = '';
            this.setState({ showTimePicker: true, enableTimePicker: false });
          }
          if (hourDiffrence <= 0) {
            initialData = _.filter(initialData, object => object.id !== 'theDayOf');
            if (this.props.values && this.props.values.remainderDate &&
              (this.props.values.remainderDate === 'theDayOf' ||
              this.props.values.remainderDate.id === 'theDayOf')) {
              this.props.values.remainderDate = '';
              this.props.values.remainder = '';
              this.setState({ showTimePicker: true, enableTimePicker: false });
            }
          }
        }
      }
    }
    this.setState({ remainderTypes: [...initialData] });
  }

  handleCompanyChange = (isEdit, companyObj) => {
    const { selectedTask } = this.props;
    this.setState({
      isCompanyOpen: false
    });

    if (companyObj.preventDefault) {
      delete companyObj.preventDefault;
    }
    const companyCount = Object.keys(companyObj).length;
    if (companyCount) {
      const companyIds = [];
      for (let i = 0; i < companyCount; i += 1) {
        companyObj[i] && companyObj[i].id && companyIds.push(companyObj[i].id);
      }
      this.props.loadContactPerson(companyIds).then(result => {
        const contactListarr = lodash.map(result, object => lodash.pick(object, ['firstName', 'id', 'lastName']));
        lodash.forEach(contactListarr, contact => {
          contact.name = `${contact.firstName} ${contact.lastName}`;
        });
        this.setState({
          contactList: contactListarr
        });
        if (!selectedTask || (selectedTask && Object.keys(selectedTask).length === 0)
          || (typeof isEdit !== 'string')) {
          this.props.change(this.props.form, 'contacts', contactListarr);
        }
      }).catch(
        err => console.log(err)
      );
      this.props.loadJobOpeningsForCompany(companyIds).then(result => {
        this.setState({
          jobOpeningList: result
        });
        if (this.props.values.jobOpenings) {
          let jobOpenings = this.props.values.jobOpenings;
          jobOpenings = lodash.filter(jobOpenings, opening => {
            if (lodash.some(result, opening)) {
              return opening;
            }
          });
          this.props.change(this.props.form, 'jobOpenings', jobOpenings);
        }
      });
    } else {
      this.props.change(this.props.form, 'contacts', []);
      this.setState({
        contactList: []
      });
      this.props.change(this.props.form, 'jobOpenings', []);
      this.setState({
        jobOpeningList: []
      });
    }
  }
  handleOpeningChange = value => {
    if (value) {
      this.setState({
        isOpeningOpen: true
      });
    } else {
      this.setState({
        isOpeningOpen: false
      });
    }
  }

  handleOpeningSelect = () => {
    this.setState({
      isOpeningOpen: true
    });
  }
  closeModal = evt => {
    const { values, pristine } = this.props;
    if (evt) {
      evt.stopPropagation();
      if (!pristine && values && (Object.keys(values)).length > 0) {
        const toastrConfirmOptions = {
          onOk: () => this.props.closeModal(),
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
      } else {
        this.props.closeModal();
      }
    }
  }

  handleSelectAll = (valueField, data) => {
    this.props.change(this.props.form, valueField, data);
  }

  render() {
    const { handleSubmit, openTaskModal, isEdit, pristine } = this.props;
    const filterConfig = getTaskFormConfig(this);
    return (
      <div>
        <Modal
          show={openTaskModal}
          onHide={this.closeModal}
          style={{ display: 'block' }}
          className={styles.save_new_task}
        >
          <form className="form-horizontal" onSubmit={handleSubmit}>
            <Modal.Header className={`${styles.modal_header}`}>
              <Modal.Title className={styles.modal_header}>
                <Row className={styles.modal_title}>
                  <span className={`${styles.modal_heading}`}>
                    {`${isEdit ? i18n.t('EDIT') : i18n.t('NEW')}`} <Trans>TASK</Trans>
                  </span>
                  <span
                    className={`${styles.close_btn} right`}
                    onClick={this.closeModal}
                    tabIndex="-1"
                    role="button"
                  >
                    <i className="fa fa-close" />
                  </span>
                </Row>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Scrollbars
                universal
                renderThumbHorizontal={props => <div {...props} className="hide" />}
                renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
                className={`${styles.view_task_scroll}`}
              >
                <div className="p-b-15 m-r-20">
                  <InputBox {...filterConfig.taskTitle} />
                </div>
                <div className="p-b-15 m-r-20">
                  <MultiselectField {...filterConfig.assignees} />
                </div>
                <div className="p-b-15 m-r-20">
                  <MultiselectField {...filterConfig.company} />
                </div>
                <div className="p-b-15 m-r-20">
                  <MultiselectField {...filterConfig.contact} />
                </div>
                <div className="p-b-15 m-r-20">
                  <MultiselectField {...filterConfig.opening} />
                </div>
                <div className="p-b-15 m-r-20">
                  <DateTimePicker {...filterConfig.dueDate} />
                </div>
                <div className={`${styles.emailremainder} m-r-20`}>
                  <div className={`p-b-15 ${styles.width45} display-inline`}>
                    <DropdownField {...filterConfig.emailRemainderDate} />
                  </div>
                  {this.state.showTimePicker && <div className={`p-b-15 ${styles.width45} display-inline right`}>
                    <DateTimePicker {...filterConfig.emailRemainderTime} />
                  </div>}
                </div>
                <div className="p-b-15 m-r-20">
                  <DropdownField {...filterConfig.type} />
                </div>
                <div className="p-b-15 m-r-20">
                  <TextArea {...filterConfig.comment} />
                </div>
              </Scrollbars>
            </Modal.Body>
            <Modal.Footer>
              <Col sm={7} smOffset={5} className="m-t-10 right">
                <Col lg={6} sm={12} className="p-5 right">
                  <button
                    className={`${styles.save_btn} button-primary`}
                    type="submit"
                    onSubmit={handleSubmit}
                    disabled={pristine}
                  >
                    <span><i className="fa fa-floppy-o" /><Trans>SAVE</Trans></span>
                  </button>
                </Col>
              </Col>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}

export default EditTask;
