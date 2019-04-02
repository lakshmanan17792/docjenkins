import React, { Component } from 'react';
import { Modal, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { reduxForm, getFormValues, propTypes } from 'redux-form';
import PropTypes from 'prop-types';
import moment from 'moment';
import styles from './profileSearch.scss';
import DropdownField from '../../components/FormComponents/DropdownList';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import InputBox from '../../components/FormComponents/InputBox';
import TextArea from '../../components/FormComponents/TextArea';
import ButtonGroup from '../../components/FormComponents/ButtonGroup';
import { loadLocations } from '../../redux/modules/profile-search';
import { loadClientCompanies, loadRecruiters, saveNewOpening, saveEditedOpening } from '../../redux/modules/openings';
import { getOpeningFormConfig, formValidation } from '../../formConfig/SaveOpening';
import i18n from '../../i18n';

const jobStatus = 'DRAFT';
@reduxForm(props => ({
  form: props.id,
  validate: formValidation
}))
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  openingSaved: state.profileSearch.saved,
  companies: state.openings.companyList,
  locationList: state.profileSearch.locationList,
  recruiters: state.openings.recruiterList,
  openingUpdated: state.openings.saved,
  openSaveOpeningModal: state.profileSearch.openOpeningModal || state.openings.openOpeningModal
}), { saveNewOpening, saveEditedOpening, loadClientCompanies, loadRecruiters, loadLocations })

class SaveOpening extends Component {
  static propTypes = {
    ...propTypes,
    loadClientCompanies: PropTypes.func.isRequired,
    loadRecruiters: PropTypes.func.isRequired,
    loadLocations: PropTypes.func.isRequired,
    saveNewOpening: PropTypes.func.isRequired,
    openingSaved: PropTypes.bool.isRequired,
    openSaveOpeningModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    isEdit: PropTypes.bool.isRequired,
    filters: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentWillMount() {
    this.props.loadClientCompanies();
    this.props.loadRecruiters();
    this.props.loadLocations();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.openingSaved) {
      toastr.success(i18n.t('SUCCESS'),
        i18n.t('successMessage.THE_JOB_OPENING_HAS_BEEN_SAVED_SUCCESSFULLY'));
      this.props.reset();
      this.props.closeModal();
    } else if (nextProps.openingUpdated) {
      toastr.success(i18n.t('SUCCESS'),
        i18n.t('successMessage.THE_JOB_OPENING_HAS_BEEN_UPDATED_SUCCESSFULLY'));
      this.props.reset();
      this.props.closeModal(this.props.values);
    }
  }

  closeModal = evt => {
    if (evt) {
      evt.stopPropagation();
    }
    this.props.closeModal();
  }

  saveOpening = () => {
    const { values, filters, initialValues } = this.props;
    if (initialValues.id) {
      this.props.saveEditedOpening({
        ...values,
        id: initialValues.id,
        date: moment().format('LL'),
      });
    } else {
      this.props.saveNewOpening({
        ...values,
        date: moment().format('LL'),
        status: jobStatus,
        filters
      });
    }
  }

  handleOnLocationChange = value => {
    if (value) {
      this.props.loadLocations(value);
    }
  }

  render() {
    const filterConfig = getOpeningFormConfig(this);
    const { isEdit, handleSubmit, pristine, submitting } = this.props;
    return (
      <div >
        <Modal
          show={this.props.openSaveOpeningModal}
          onHide={this.closeModal}
          className={styles.save_new_opening}
        >
          <form onSubmit={handleSubmit(this.saveOpening)}>
            <Modal.Header className={`${styles.modal_header}`}>
              <Modal.Title className={`${styles.modal_title} text-center`}>
                {`${isEdit ? 'Edit' : 'NEW'}`} OPENING
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className={`${styles.modal_body} ${styles.filter}`}>
                <Col sm={12} className="m-t-10">
                  <InputBox {...filterConfig.jobTitle} />
                </Col>
                <Col sm={12} className="m-t-10">
                  <TextArea {...filterConfig.description} />
                </Col>
                <Col sm={6} className={`m-t-10 ${styles.select_vacancy_size}`}>
                  <InputBox {...filterConfig.vacancies} />
                </Col>
                <Col sm={6} className="m-t-10">
                  <DropdownField {...filterConfig.company} />
                </Col>
                <Col sm={12} className="m-t-10 m-b-5">
                  <MultiselectField {...filterConfig.recruiter} />
                </Col>
                <Col sm={12} className={`${styles.filter} p-l-15 p-r-15`}>
                  <ButtonGroup {...filterConfig.type} />
                </Col>
                <Col sm={12} className="m-t-10">
                  <MultiselectField {...filterConfig.location} />
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Col sm={12}>
                <Col sm={6} smOffset={6} className="m-t-10">
                  <Col lg={6} sm={12} className="p-5">
                    <button
                      className="btn btn-border grey-btn"
                      type="button"
                      onClick={this.closeModal}
                    >
                      <i className="fa fa-times" aria-hidden="true" />
                      CANCEL
                    </button>
                  </Col>
                  <Col lg={6} sm={12} className="p-5">
                    <button
                      className="btn btn-border orange-btn"
                      type="submit"
                      disabled={pristine || submitting}
                    >
                      <i className="fa fa-floppy-o" aria-hidden="true" />
                      SAVE
                    </button>
                  </Col>
                </Col>
              </Col>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}

export default SaveOpening;
