import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { reduxForm, getFormValues, propTypes, change } from 'redux-form';
import { Modal, Col, Row } from 'react-bootstrap';
import lodash from 'lodash';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import ActivityLogger from '../ActivityLogger/ActivityLogger';
import {
  updateActivity
} from '../../redux/modules/customers';
import styles from './ActivityHistories.scss';
import i18n from '../../i18n';

@reduxForm({
  form: 'EditActivity',
})

@connect((state, props) => ({
  user: state.auth.user,
  values: getFormValues(props.form)(state),
  customers: state.openings.companyList || [],
  contacts: state.openings.contactPerson || [],
  openings: state.tasks.taskOpenings || []
}), {
  change,
  updateActivity
})

class EditActivity extends Component {
  static propTypes = {
    ...propTypes,
    handleSubmit: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    openEditActivity: PropTypes.bool.isRequired,
    initialize: PropTypes.func.isRequired,
    selectedTask: PropTypes.object.isRequired,
    isEdit: PropTypes.bool.isRequired,
    customers: PropTypes.array.isRequired,
    updateActivity: PropTypes.func.isRequired,
    loadContacts: PropTypes.func.isRequired,
    openings: PropTypes.array.isRequired,
    loadOpenings: PropTypes.func.isRequired,
    users: PropTypes.object,
    change: PropTypes.func.isRequired,
    values: PropTypes.object,
    company: PropTypes.object,
    jobOpeningId: PropTypes.number,
    user: PropTypes.object,
    pristine: PropTypes.bool
  };

  static defaultProps = {
    values: null,
    company: null,
    jobOpeningId: null,
    user: null,
    users: {},
    pristine: true
  }

  constructor(props) {
    super(props);
    this.state = {
      isCompleted: false,
      contactList: [],
      isCompanyOpen: false,
      isOpeningOpen: false,
      remainderTypes: [],
      showDatePicker: false,
      datepickerState: null,
      users: [],
      logDescription: this.props.activity ? this.props.activity.description : ''
    };
  }

  closeModal = evt => {
    if (evt) {
      this.props.closeEditModal();
    }
    // const { values, pristine } = this.props;
    // if (evt) {
    //   evt.stopPropagation();
    //   if (!pristine && values && (Object.keys(values)).length > 0) {
    //     const toastrConfirmOptions = {
    //       onOk: () => this.props.closeEditModal(),
    //       okText: i18n.t('YES'),
    // i18n.t('NO');
    //     };
    //     toastr.confirm('Your changes will be lost. Are you sure ?', toastrConfirmOptions);
    //   } else {
    //     this.props.closeEditModal();
    //   }
    // }
  }
  handleActivityLog = data => {
    const { activity: { userIds } } = this.props;
    const dataUserIds = data.users.map(user => user.id);
    data.createdBy = this.props.user.id;
    data.firstName = this.props.user.firstName;
    data.oldUsers = lodash.intersection(lodash.uniq(dataUserIds), lodash.uniq(userIds));
    data.newUsers = lodash.difference(lodash.uniq(dataUserIds), lodash.uniq(userIds));
    if (this.props.company) {
      data.companyId = this.props.company.id;
    }
    if (this.props.jobOpeningId) {
      data.jobId = this.props.jobOpeningId;
    }
    this.props.updateActivity(data).then(activity => {
      toastr.success(i18n.t('successMessage.LOGGED_SUCCESSFULLY'),
        `${i18n.t('ACTIVITY')} - ${activity.type} ${i18n.t('successMessage.UPDATED_SUCCESSFULLY')}`);
      this.props.loadActivity({ isEdit: true });
      this.closeModal({});
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'), i18n.t('COULD_NOT_SAVE_ACTIVITY'));
      }
    });
  }

  editLog = value => {
    this.setState({
      logDescription: value
    });
  }

  render() {
    const { activity, openEditActivity } = this.props;
    const logData = {
      type: ['Log a call', 'Log an email', 'Face to face', 'Log a note'],
      handleSubmit: this.handleActivityLog,
      logDate: new Date(activity.logDate),
      logPlaceHolder: 'Select a log',
      defaultLogValue: activity.type,
      requiredTypeForOutCome: 'Log a call'
    };
    const { logDescription } = this.state;
    return (
      <div>
        <Modal
          show={openEditActivity}
          onHide={this.closeModal}
          style={{ display: 'block' }}
          bsSize="large"
        >
          <Modal.Header className={`${styles.modal_header_color}`}>
            <Modal.Title>
              <Row className="clearfix">
                <Col sm={12} className={styles.modal_title}>
                  <span>
                    Edit Activity
                  </span>
                  <span
                    role="button"
                    tabIndex="-1"
                    className="close_btn right no-outline"
                    onClick={this.closeModal}
                  >
                    <i className="fa fa-close" />
                  </span>
                </Col>
              </Row>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ActivityLogger
              activity={activity}
              isEdit
              params={logData}
              setFormStatus={this.setFormStatus}
              actionType="LOG_ACTIVITY"
              description={logDescription}
              editLog={this.editLog}
            />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default EditActivity;
