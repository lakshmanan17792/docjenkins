import React, { Component } from 'react';
import { Modal, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Scrollbars } from 'react-custom-scrollbars';
import { reduxForm, getFormValues, propTypes, change } from 'redux-form';
import PropTypes from 'prop-types';
import lodash from 'lodash';
// import Moment from 'moment';
import { push as pushState } from 'react-router-redux';
import DropdownField from '../../components/FormComponents/DropdownList';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import InputBox from '../../components/FormComponents/InputBox';
import TextArea from '../../components/FormComponents/TextArea';
import ButtonGroup from '../../components/FormComponents/ButtonGroup';
import DatePicker from '../../components/FormComponents/DatePicker';
import { loadLocations, loadPositions } from '../../redux/modules/profile-search';
import getFilterConfig from '../../formConfig/ProfileFilter';
import {
  loadClientCompanies,
  loadRecruiters,
  loadContactPerson,
  saveNewOpening,
  saveEditedOpening,
  loadOpeningById
} from '../../redux/modules/openings';
import { loadJobCategory } from '../../redux/modules/job-category';
import { getOpeningFormConfig, formValidation } from '../../formConfig/SaveOpening';
import { trimExtraSpaces } from '../../utils/validation';
import ProfileSearchFilter from '../../components/Filters/ProfileSearchFilter';
import styles from './Openings.scss';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';

const jobStatus = 'active';

const setJobOpeningsDetails = (type, value, isEdit) => {
  let jobOpeningDtl = {
    salary: null,
    permFee: null,
    fullTimeStartDate: null,
    fullTimeEndDate: null,
    contractStartDate: null,
    contractEndDate: null,
    freelanceStartDate: null,
    freelanceEndDate: null,
    billRate: null,
    payRate: null,
    payRateFreelance: null,
    salaryContract: null,
    fullTimeASAP: null,
    contractASAP: null,
    partTimeASAP: null,
    contractLocation: null,
    partTimeLocation: null
  };
  if (type === 'fullTime') {
    jobOpeningDtl.salary = value.salary;
    jobOpeningDtl.permFee = value.permFee;
    jobOpeningDtl.fullTimeStartDate = value.fullTimeStartDate;
    jobOpeningDtl.fullTimeEndDate = value.fullTimeEndDate;
    jobOpeningDtl.fullTimeASAP = value.fullTimeASAP;
  } else if (type === 'contract') {
    jobOpeningDtl.salaryContract = value.salaryContract;
    jobOpeningDtl.payRate = value.payRate;
    jobOpeningDtl.contractStartDate = value.contractStartDate;
    jobOpeningDtl.contractEndDate = value.contractEndDate;
    jobOpeningDtl.contractASAP = value.contractASAP;
    jobOpeningDtl.contractLocation = !!value.contractLocation;
  } else if (type === 'partTime') {
    jobOpeningDtl.billRate = value.billRate;
    jobOpeningDtl.payRateFreelance = value.payRateFreelance;
    jobOpeningDtl.freelanceStartDate = value.freelanceStartDate;
    jobOpeningDtl.freelanceEndDate = value.freelanceEndDate;
    jobOpeningDtl.partTimeASAP = value.partTimeASAP;
    jobOpeningDtl.partTimeLocation = !!value.partTimeLocation;
  } else {
    jobOpeningDtl = value;
  }
  if (isEdit) {
    jobOpeningDtl.createdBy = value.createdBy;
    jobOpeningDtl.id = value.id;
    jobOpeningDtl.jobOpeningId = value.jobOpeningId;
    jobOpeningDtl.createdAt = value.createdAt;
    jobOpeningDtl.modifiedAt = value.modifiedAt;
    jobOpeningDtl.modifiedBy = value.modifiedBy;
  }
  return jobOpeningDtl;
};
@reduxForm(props => ({
  form: props.id,
  validate: formValidation,
}))
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  openingSaved: state.openings.openingSaved,
  companies: state.openings.companyList,
  categories: state.jobCategory.categoryList || {},
  positionList: state.profileSearch.positionList,
  openingLocation: state.profileSearch.locationList,
  recruiters: state.openings.recruiterList,
  contactPerson: state.openings.contactPerson,
  openingUpdated: state.openings.openingUpdated,
  openSaveOpeningModal: state.profileSearch.openOpeningModal || state.openings.openOpeningModal,
}), {
  saveNewOpening,
  saveEditedOpening,
  loadClientCompanies,
  loadRecruiters,
  loadContactPerson,
  loadJobCategory,
  loadLocations,
  loadPositions,
  loadOpeningById,
  pushState,
  change
})
class SaveOpening extends Component {
  static propTypes = {
    ...propTypes,
    loadClientCompanies: PropTypes.func.isRequired,
    loadRecruiters: PropTypes.func.isRequired,
    loadContactPerson: PropTypes.func.isRequired,
    loadJobCategory: PropTypes.func.isRequired,
    loadLocations: PropTypes.func.isRequired,
    loadPositions: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    saveNewOpening: PropTypes.func.isRequired,
    openingSaved: PropTypes.bool.isRequired,
    openSaveOpeningModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    isEdit: PropTypes.bool.isRequired,
    filters: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    loadOpeningById: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    categories: PropTypes.object.isRequired
  }

  static defaultProps = {
    filterPositionConfig: null,
  };

  displayName = item => {
    let firstName = '';
    let lastName = '';
    if (!(item.firstName === undefined || item.firstName === null)) {
      firstName = item.firstName;
    }
    if (!(item.lastName === undefined || item.lastName === null)) {
      lastName = item.lastName;
    }
    return `${firstName} ${lastName}`;
  };

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      currentView: 'OpeningInfo',
      initialParam: 'initial',
      isSave: false,
      startDate: null,
      endDate: null,
      selectedOption: null,
      selectedJobType: null,
      isLocationOpen: false,
      isPositionOpen: false,
      isCategoryOpen: false,
      isRecruiterOpen: false,
    };
  }

  componentWillMount() {
    this.props.loadClientCompanies();
    this.props.loadRecruiters();
    this.props.loadLocations(this.state.initialParam);
    this.props.loadJobCategory({
      where: {
        isActive: true
      },
      fields: ['id', 'name']
    });
    this.handleOnPositionChange(this.state.initialParam);
  }

  componentDidMount() {
    if (this.props.initialValues.companyId) {
      const company = {};
      company.id = this.props.initialValues.companyId;
      this.handleOnCompanyChange(company, 1);
    }
  }


  resetFields = targetId => {
    this.setState({
      selectedJobType: targetId,
    });
  }

  closeModal = evt => {
    const { values, initialValues } = this.props;
    if (evt) {
      evt.stopPropagation();
      if (values && (Object.keys(values)).length > 1 && !(lodash.isEqual(initialValues, values))) {
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

  handleOnLocationChange = value => {
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\') &&
      !value.startsWith('./') && value.trim() !== '') {
      if (value === 'initial') {
        this.props.loadLocations(value.toLowerCase());
      } else {
        this.setState({
          isLocationOpen: true
        }, () => {
          this.props.loadLocations(value.toLowerCase());
        });
      }
    } else {
      this.setState({
        isLocationOpen: false
      });
    }
  }

  handleOnCompanyChange = (value, hideToaster) => {
    if (hideToaster !== 1) {
      toastr.info(i18n.t('COMPANY_UPDATE_LABEL'), i18n.t('infoMessage.SELECT_A_CONTACT_PERSON'));
    }
    if (value) {
      if (hideToaster !== 1) {
        this.props.change(this.props.form, 'contactPerson', null);
      }
      this.props.loadContactPerson(value.id);
    }
  }
  handleOnRecruiterChange = value => {
    if (value) {
      this.setState({
        isRecruiterOpen: true
      });
    } else {
      this.setState({
        isRecruiterOpen: false
      });
    }
  }

  handleOnCategoryChange = value => {
    if (value) {
      this.setState({
        isCategoryOpen: true
      });
    } else {
      this.setState({
        isCategoryOpen: false
      });
    }
  }

  handleOnLocationSelect = value => {
    if (value) {
      this.setState({
        isLocationOpen: !this.state.isLocationOpen
      });
    }
  }
  handleOnRecruiterSelect = value => {
    if (value) {
      this.setState({
        isRecruiterOpen: !this.state.isRecruiterOpen
      });
    }
  }

  handleOnCategorySelect = value => {
    if (value) {
      this.setState({
        isCategoryOpen: !this.state.isCategoryOpen
      });
    }
  }


  handleCompanyValueChange = selectedOption => {
    if (selectedOption && selectedOption.id) {
      this.setState({ selectedOption: selectedOption.id }, () => {
        this.props.change(this.props.form, 'companies', selectedOption);
      });
    } else {
      this.setState({ selectedOption: '' });
      this.props.change(this.props.form, 'companies', '');
    }
  }

  handleCompanyKeyDown = () => {
    this.setState({ selectedOption: '' });
    this.props.change(this.props.form, 'companies', '');
  }

  save = () => {
    this.setState({
      isSave: true
    });
    // this.saveOpening();
  }

  handleOnPositionChange = value => {
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\') &&
      !value.startsWith('./') && value.trim() !== '') {
      if (value === 'initial') {
        this.props.loadPositions(value.toLowerCase());
      } else {
        this.setState({
          isPositionOpen: true
        }, () => {
          this.props.loadPositions(value.toLowerCase());
        });
      }
    } else {
      this.setState({
        isPositionOpen: false
      });
    }
  }

  handleOnPositionSelect = value => {
    if (value) {
      this.setState({
        isPositionOpen: !this.state.isPositionOpen
      });
    }
  }

  goBack = () => {
    this.setState({
      currentView: 'OpeningInfo'
    });
  }

  redirectToProfileSearch = jobId => {
    this.props.pushState({ pathname: '/ProfileSearch', query: { jobId } });
  }

  scrollToTopPosition = () => {
    this.scrollbars.scrollToTop();
  }

  saveOpening = () => {
    const { initialValues } = this.props;
    let values = this.props.values;
    values = trimExtraSpaces(values);
    if (this.state.currentView === 'OpeningInfo') {
      this.setState({ currentView: 'FilterInfo' }, () => {
        this.scrollToTopPosition();
      });
    } else if (initialValues.id) {
      values.openinglocations = values.openingLocation;
      delete values.openingLocation;

      const filters = {
        skills: values.skills,
        location: values.location,
        preferredRadius: values.preferredRadius || 0,
        keywords: values.keywords,
        experience: values.experience,
        positions: values.positions,
        companies: values.companies,
        source: values.source,
        languages: values.languages
      };
      let jobOpeningDtl = {};
      if (values.jobOpeningDetails) {
        jobOpeningDtl = setJobOpeningsDetails(this.state.selectedJobType, values.jobOpeningDetails, this.props.isEdit);
      }
      let priorityVal = '';
      if (values.priority) {
        priorityVal = values.priority.id;
        if (!values.priority.id) {
          priorityVal = values.priority;
        }
      }
      this.props.saveEditedOpening({
        ...values,
        id: initialValues.id,
        startDate: values.startDate,
        priority: priorityVal,
        contactId: values.contactPerson ? values.contactPerson.id : '',
        positions: values.positions,
        filters,
        jobOpeningDetails: jobOpeningDtl
      }).then(() => {
        this.props.reset();
        this.props.closeModal(this.props.values);
        toastr.success(i18n.t('successMessage..UPDATED'),
          i18n.t('successMessage.THE_JOB_OPENING_HAS_BEEN_UPDATED_SUCCESSFULLY'));
        if (!this.state.isSave) {
          this.redirectToProfileSearch(initialValues.id);
        }
      }, err => {
        this.props.reset();
        this.props.closeModal(this.props.values);
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.THE_JOB_OPENING_COULD_NOT_BE_UPDATED'));
      });
    } else {
      this.saveNewOpening();
    }
  }

  saveNewOpening = () => {
    let values = this.props.values;
    values = trimExtraSpaces(values);
    if (!values.type) {
      values.type = 'fullTime';
    }
    let jobOpeningDtl = {};
    if (values.jobOpeningDetails) {
      jobOpeningDtl = setJobOpeningsDetails(this.state.selectedJobType, values.jobOpeningDetails, this.props.isEdit);
    }

    const opening = {
      jobTitle: values.jobTitle,
      description: values.description ? values.description : '',
      priority: values.priority ? values.priority.id : '',
      positions: values.positions,
      vacancies: values.vacancies,
      company: values.company,
      type: values.type,
      recruiters: values.recruiters,
      contactId: values.contactPerson.id,
      openinglocations: values.openingLocation,
      jobCategories: values.jobCategories,
      startDate: values.startDate,
      endDate: values.endDate,
      jobOpeningDetails: jobOpeningDtl
    };
    const filters = {
      skills: values.skills,
      location: values.location,
      preferredRadius: values.preferredRadius || 0,
      keywords: values.keywords,
      experience: values.experience,
      positions: values.positions,
      companies: values.companies,
      source: values.source
    };
    this.props.saveNewOpening({
      ...opening,
      // startDate: new Date(),
      status: jobStatus,
      filters
    }).then(data => {
      toastr.success(i18n.t('successMessage.SAVED'),
        i18n.t('successMessage.THE_JOB_OPENING_HAS_BEEN_SAVED_SUCCESSFULLY'));
      this.props.reset();
      this.props.closeModal();
      if (!this.state.isSave) {
        this.redirectToProfileSearch(data.jobId);
      }
    }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t('errorMessage.THE_JOB_OPENING_COULD_NOT_BE_SAVED'));
    });
  }

  isFormFieldsEmpty = values => {
    let isAllEmpty = false;
    if (values) {
      if (!values.jobTitle || (values.jobTitle && values.jobTitle.trim().length === 0)) {
        isAllEmpty = true;
      }
      if (!values.vacancies || (values.vacancies && values.vacancies.length === 0)) {
        isAllEmpty = true;
      }
      if (!values.recruiters || (values.recruiters && values.recruiters.length === 0)) {
        isAllEmpty = true;
      }
      if (!values.priority || (values.priority && values.priority.length === 0)) {
        isAllEmpty = true;
      }
      if (!values.company || (values.company && values.company.length === 0)) {
        isAllEmpty = true;
      }
      if (!values.contactPerson || (values.contactPerson && values.contactPerson.length === 0)) {
        isAllEmpty = true;
      }
      if (!values.type || (values.type && values.type.trim().length === 0)) {
        values.type = 'fullTime';
      }
      if (this.state.currentView === 'FilterInfo') {
        let skillValEmpty = false;
        let locationValEmpty = false;
        let keyValEmpty = false;
        let experienceValEmpty = false;
        let positionValEmpty = false;
        let companyValEmpty = false;
        let sourceValEmpty = false;
        if (!values.skills || (values.skills && values.skills.length === 0)) {
          skillValEmpty = true;
        }
        if (!values.location || (values.location && values.location.length === 0)) {
          locationValEmpty = true;
        }
        if (!values.keywords) {
          keyValEmpty = true;
        }
        if (!values.experience || (values.experience && values.experience.length === 0)) {
          experienceValEmpty = true;
        }
        if (!values.positions || (values.positions && values.positions.length === 0)) {
          positionValEmpty = true;
        }
        if (!values.companies || (values.companies && values.companies.length === 0)) {
          companyValEmpty = true;
        }
        if (!values.source || (values.source && values.source.length === 0)) {
          sourceValEmpty = true;
        }
        if ((skillValEmpty &&
          locationValEmpty &&
          keyValEmpty &&
          experienceValEmpty &&
          positionValEmpty &&
          sourceValEmpty) &&
          companyValEmpty) {
          isAllEmpty = true;
        }
      }
    }
    return isAllEmpty;
  }

  // isJobDateValid = values => values.startDate > values.endDate;

  changeFieldValues = (fieldName, value) => {
    this.props.change(this.props.form, fieldName, value);
  }

  iscompanySelected = values => {
    if (this.state.currentView === 'FilterInfo' &&
        (!values.companies || (values.companies && values.companies.length === 0))) {
      return true;
    }
    return false;
  }

  handleOnBlurTitle = evt => {
    if (evt.target.value) {
      this.changeFieldValues('jobTitle', `${evt.target.value} (m/w/x)`);
    }
  }

  handleOnFocusTitle = evt => {
    if (evt.target.value) {
      const valueStr = evt.target.value.split(' (m/w/x)');
      this.changeFieldValues('jobTitle', valueStr[0]);
    }
  }

  render() {
    const filterConfig = getOpeningFormConfig(this);
    const filterPositionConfig = getFilterConfig(this);
    const { currentView, selectedOption, isSave } = this.state;
    const { isEdit, handleSubmit, pristine, submitting, values, loading, invalid, form } = this.props;
    const formFieldsEmpty = this.isFormFieldsEmpty(values);
    const iscompanySelected = this.iscompanySelected(values);
    // const isJobDateValid = this.isJobDateValid(this.props.values);
    return (
      <div >
        <Modal
          show={this.props.openSaveOpeningModal}
          onHide={this.closeModal}
          className={styles.save_new_opening}
        >
          <form onSubmit={handleSubmit(this.saveOpening)}>
            <Modal.Header className={`${styles.modal_header}`}>
              <Modal.Title>
                <Row className="clearfix">
                  <Col sm={12}>
                    <span className={`${styles.modal_heading}`}>
                      {`${isEdit ? 'Edit' : 'New'}`} Opening
                    </span>
                    <span
                      className={`${styles.close_btn} right`}
                      onClick={this.closeModal}
                      role="button"
                      tabIndex="0"
                    >
                      <i className="fa fa-close" />
                    </span>
                  </Col>
                </Row>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {
                currentView !== 'FilterInfo' ?
                  <Row className={`${styles.modal_body} ${styles.opening_filter}`}>
                    <Scrollbars
                      universal
                      renderThumbHorizontal={props => <div {...props} className="hide" />}
                      renderView={props =>
                        <div {...props} className={`${styles.scroll_bar_body} ${styles.scroll_overflow} `} />}
                      className={`${styles.view_opening_scroll}`}
                      // ref={'scrollbars'}
                    >
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
                        <DropdownField {...filterConfig.contactPerson} />
                      </Col>
                      <Col sm={12} className="m-t-10 m-b-5">
                        <MultiselectField {...filterConfig.recruiters} />
                      </Col>
                      <Col sm={12} className="m-t-10 m-b-5">
                        <DropdownField {...filterConfig.priority} />
                      </Col>
                      <Col sm={12} className="m-t-10 m-b-5">
                        <MultiselectField {...filterConfig.categories} />
                      </Col>
                      <Col sm={12} className="m-t-10 m-b-5">
                        <MultiselectField {...filterPositionConfig.fields.positions} />
                      </Col>
                      <Col sm={12} className="m-t-10">
                        <MultiselectField {...filterConfig.openingLocation} />
                      </Col>
                      <Col sm={12} className={`${styles.opening_filter} p-l-15 p-r-15`}>
                        <DatePicker {...filterConfig.startDate} />
                      </Col>
                      <Col sm={12} className={`${styles.opening_filter} p-l-15 p-r-15`}>
                        <DatePicker {...filterConfig.endDate} />
                      </Col>
                      <Col sm={12} className={`${styles.opening_filter} p-l-15 p-r-15 m-r-20`}>
                        <ButtonGroup
                          {...filterConfig.type}
                          changeFieldValues={this.changeFieldValues}
                          jobOpeningDetails={values.jobOpeningDetails}
                        />
                      </Col>
                    </Scrollbars>
                  </Row>
                  :
                  <Row className={`${styles.opening_filter}`}>
                    <Scrollbars
                      universal
                      ref={c => { this.scrollbars = c; }}
                      renderThumbHorizontal={props => <div {...props} className="hide" />}
                      renderView={props =>
                        <div {...props} className={`${styles.scroll_bar_body} ${styles.scroll_overflow} `} />}
                      className={`${styles.view_opening_scroll}`}
                    >
                      <ProfileSearchFilter
                        initialValues={values}
                        form={form}
                        handleCompanyValueChange={this.handleCompanyValueChange}
                        handleCompanyKeyDown={this.handleCompanyKeyDown}
                        selectedOption={selectedOption || values.companies}
                        selectedLocation={values.openingLocation || ''}
                      />
                    </Scrollbars>
                  </Row>
              }
            </Modal.Body>
            <Modal.Footer>
              <Col sm={12}>
                <Col sm={9} smOffset={3} className="m-t-10">
                  <Col lg={3} sm={12} className="p-5">
                    {currentView === 'FilterInfo' &&
                      <button
                        className="btn btn-border orange-btn"
                        type="button"
                        onClick={this.goBack}
                      >
                        <span><i className="fa fa-arrow-left" aria-hidden="true" />Back</span>
                      </button>
                    }
                  </Col>
                  <Col lg={4} sm={12} className="p-5">
                    {currentView === 'FilterInfo' &&
                      <button
                        className="btn btn-border orange-btn"
                        onClick={this.save}
                        disabled={formFieldsEmpty || invalid || (pristine && !isEdit)
                          || (submitting && !isEdit) || iscompanySelected}
                      >
                        <span>
                          {loading && isSave ?
                            <i className="fa fa-spinner fa-spin p-l-r-7" aria-hidden="true" /> : ''
                          }
                          <i className="fa fa-floppy-o" aria-hidden="true" />Save</span>
                      </button>
                    }
                  </Col>
                  <Col lg={5} sm={12} className="p-5">
                    <button
                      className="btn btn-border orange-btn"
                      type="submit"
                      disabled={formFieldsEmpty || (pristine && !isEdit) || (submitting && !isEdit)
                        || iscompanySelected}
                    >
                      {
                        currentView !== 'FilterInfo' ?
                          <span><i className="fa fa-arrow-right" aria-hidden="true" />Next</span>
                          :
                          <span>
                            {loading && !isSave ?
                              <i className="fa fa-spinner fa-spin p-l-r-7" aria-hidden="true" /> : ''
                            }
                            <i className="fa fa-search" aria-hidden="true" />
                            {'Save & Search'}
                          </span>
                      }
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
