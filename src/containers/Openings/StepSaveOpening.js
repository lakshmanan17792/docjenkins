import React, { Component } from 'react';
import { Col, Row, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import lodash from 'lodash';
import { getFormValues, change, destroy, isPristine } from 'redux-form';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import { push as pushState } from 'react-router-redux';
import { trimExtraSpaces } from '../../utils/validation';
import BasicDetails from './BasicDetails';
import OpeningRequirement from './OpeningReq';
import OpeningEmpTypes from './OpeningEmpTypes';
import SaveOpeningFilters from './SaveOpeningFilters';
import StageProgressBar from './StageProgressBar';
import {
  saveNewOpening,
  saveEditedOpening,
  loadOpeningById,
  loadOpenings
} from '../../redux/modules/openings';
import i18n from '../../i18n';
import { addToCompanyOpenings, loadOpeningsForCompany } from '../../redux/modules/customers';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import constructFilters from './ConstructFilterObject';

const styles = require('./StepSaveOpening.scss');

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
    contractRemoteLocation: null,
    partTimeRemoteLocation: null,
    contractOnsiteLocation: null,
    partTimeOnsiteLocation: null
  };
  if (type === 'fullTime') {
    jobOpeningDtl.salary = value.salary;
    jobOpeningDtl.permFee = value.permFee;
    jobOpeningDtl.fullTimeStartDate = value.fullTimeASAP ? null : value.fullTimeStartDate;
    jobOpeningDtl.fullTimeEndDate = value.fullTimeEndDate;
    jobOpeningDtl.fullTimeASAP = value.fullTimeASAP;
  } else if (type === 'contract') {
    jobOpeningDtl.salaryContract = value.salaryContract;
    jobOpeningDtl.payRate = value.payRate;
    jobOpeningDtl.contractStartDate = value.contractASAP ? null : value.contractStartDate;
    jobOpeningDtl.contractEndDate = value.contractEndDate;
    jobOpeningDtl.contractASAP = value.contractASAP;
    jobOpeningDtl.contractRemoteLocation = !!value.contractRemoteLocation;
    jobOpeningDtl.contractOnsiteLocation = !!value.contractOnsiteLocation;
  } else if (type === 'partTime') {
    jobOpeningDtl.billRate = value.billRate;
    jobOpeningDtl.payRateFreelance = value.payRateFreelance;
    jobOpeningDtl.freelanceStartDate = value.partTimeASAP ? null : value.freelanceStartDate;
    jobOpeningDtl.freelanceEndDate = value.freelanceEndDate;
    jobOpeningDtl.partTimeASAP = value.partTimeASAP;
    jobOpeningDtl.partTimeRemoteLocation = !!value.partTimeRemoteLocation;
    jobOpeningDtl.partTimeOnsiteLocation = !!value.partTimeOnsiteLocation;
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

@connect((state, props) => ({
  selectedViewOpening: state.openings.selectedOpening,
  jobOpeningId: props.initialValues ? props.initialValues.id : null,
  values: getFormValues('StepSaveOpening')(state),
  isOpeningModalPristine: isPristine('StepSaveOpening')(state),
  openingSaved: state.openings.openingSaved,
  openingUpdated: state.openings.openingUpdated,
  openSaveOpeningModal: state.profileSearch.openOpeningModal || state.openings.openOpeningModal,
  saving: state.openings.saving,
  updating: state.openings.updating
}), {
  saveNewOpening,
  saveEditedOpening,
  loadOpeningById,
  loadOpenings,
  pushState,
  addToCompanyOpenings,
  change,
  destroy,
  loadOpeningsForCompany
})
export default class StepSaveOpening extends Component {
  static propTypes = {
    saveNewOpening: PropTypes.func.isRequired,
    loadOpeningsForCompanyByFilter: PropTypes.func,
    isOpeningModalPristine: PropTypes.bool,
    values: PropTypes.object,
    loadOpeningsForCompany: PropTypes.func,
    isEdit: PropTypes.bool,
    companyOpeningFilterObj: PropTypes.object,
    searchTerm: PropTypes.string,
    filter: PropTypes.object,
    loadOpeningById: PropTypes.func.isRequired,
    loadOpenings: PropTypes.func.isRequired,
    addToCompanyOpenings: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    jobOpeningId: PropTypes.number,
    selectedViewOpening: PropTypes.objectOf(PropTypes.any),
    saveEditedOpening: PropTypes.func.isRequired,
    initialValues: PropTypes.objectOf(PropTypes.any),
    closeModal: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    destroy: PropTypes.func.isRequired,
    saveFromCompany: PropTypes.any,
    saving: PropTypes.any,
    updating: PropTypes.any,
  }

  static defaultProps = {
    values: {},
    companyOpeningFilterObj: {},
    loadOpeningsForCompanyByFilter: null,
    searchTerm: '',
    filter: {},
    initialValues: { type: 'fullTime' },
    jobOpeningId: null,
    isOpeningModalPristine: null,
    selectedViewOpening: null,
    saveFromCompany: null,
    saving: null,
    updating: null,
    loadOpeningsForCompany: null,
    isEdit: false,
    loading: false
  };

  constructor(props) {
    super(props);
    if (!props.isEdit) {
      props.initialValues.type = 'fullTime';
    }
    this.state = {
      page: 1,
      show: false,
      initialParam: 'initial',
      isSave: false,
      startDate: null,
      endDate: null,
      selectedJobType: props.isEdit && props.initialValues.type ? props.initialValues.type : 'fullTime',
      isInitialLoad: true,
      toPage: 1,
      clickedAnotherPage: false,
      pageValidationData: {
        1: !!props.isEdit,
        2: !!props.isEdit,
        3: !!props.isEdit,
        4: !!props.isEdit
      },
      selectedTags: [],
      previousValues: []
    };
  }

  componentWillReceiveProps(props) {
    if (!props.isEdit) {
      props.initialValues.type = this.state.selectedJobType;
    }
    if (props.initialValues && props.initialValues.tags) {
      this.setState({ selectedTags: props.initialValues.tags });
    }
    this.setState({
      previousValues: props.initialValues
    });
  }

  componentWillUnmount() {
    this.props.destroy('StepSaveOpening');
  }

  closeModal = evt => {
    const { isOpeningModalPristine } = this.props;
    if (evt) {
      evt.stopPropagation();
      if (!isOpeningModalPristine) {
        const toastrConfirmOptions = {
          onOk: () => { this.props.destroy('StepSaveOpening'); this.props.closeModal(); },
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
      } else {
        this.props.closeModal();
      }
    }
  }

  save = evt => {
    evt.preventDefault();
    this.setState({
      isSave: true
    });
    this.saveOpening();
  }

  redirectToProfileSearch = jobId => {
    this.props.pushState({ pathname: '/ProfileSearch', query: { jobId, allMatch: false } });
  }

  convertHTMLToStr = html => {
    if (!html) {
      return '';
    }
    const tag = document.createElement('div');
    tag.innerHTML = html;
    return tag.innerText;
  }

  saveOpening = () => {
    const { initialValues } = this.props;
    let values = this.props.values;
    values = trimExtraSpaces(values);
    const deviceDetail = JSON.parse(localStorage.getItem('deviceDetails'));
    if (initialValues.id) {
      values.openinglocations = values.openingLocation;
      delete values.openingLocation;

      const filters = constructFilters(values);
      // {
      //   skills: values.skills,
      //   location: values.location,
      //   preferredRadius: values.preferredRadius || 0,
      //   keywords: values.keywords,
      //   experience: values.experience,
      //   positions: values.positions,
      //   companies: values.company,
      //   source: values.source,
      //   languages: values.languages,
      //   skillRating: values.skillRating || 0,
      //   mobilityRating: values.mobilityRating || 0,
      //   companyCultureRating: values.companyCultureRating || 0,
      //   pedigreeRating: values.pedigreeRating || 0,
      //   contactRating: values.contactRating || 0,
      //   id: values.filterId,
      //   isEmail: values.isEmail,
      //   isMobile: values.isMobile,
      //   isFreelance: values.isFreelance,
      //   noticePeriod: values.noticePeriod,
      //   noticePeriodType: values.noticePeriodType
      // };
      let jobOpeningDtl = {};
      if (values.jobOpeningDetails) {
        jobOpeningDtl = setJobOpeningsDetails(this.state.selectedJobType, values.jobOpeningDetails, true);
      }
      if (!values.jobTitle.includes('(m/w/x)')) {
        values.jobTitle = `${values.jobTitle} (m/w/x)`;
      }
      values.descriptionText = this.convertHTMLToStr(values.description);
      this.props.saveEditedOpening({
        ...values,
        id: initialValues.id,
        priority: values.priority ? values.priority.id : '',
        contactId: values.contactPerson ? values.contactPerson.id : '',
        status: values.status ? values.status.id : '',
        positions: values.positions,
        filters,
        jobOpeningDetails: jobOpeningDtl,
        previousValues: this.state.previousValues,
        deviceDetails: deviceDetail,
        ispublic: (values.ispublic.id !== undefined) ? values.ispublic.id : values.ispublic
      }).then(() => {
        const deletedRecruiters = lodash.differenceWith(initialValues.recruiters, values.recruiters, lodash.isEqual);
        const removedRecruitersOverall = lodash.differenceWith(deletedRecruiters, values.salesOwners, lodash.isEqual);
        if (removedRecruitersOverall.length > 0) {
          console.log('deleting recruiter', removedRecruitersOverall);
          removedRecruitersOverall.forEach(eachUser => {
            localStorage.setItem('removedData',
              JSON.stringify({
                tab: 'jobOpening',
                id: initialValues.id,
                userId: eachUser.id
              }));
            localStorage.removeItem('removedData');
          });
        }
        console.log(initialValues.salesOwners, values.salesOwners);
        const deletedSalesOwner = lodash.differenceWith(initialValues.salesOwners, values.salesOwners, lodash.isEqual);
        const removedSalesOwnerOverall = lodash.differenceWith(deletedSalesOwner, values.recruiters, lodash.isEqual);
        if (removedSalesOwnerOverall.length > 0) {
          removedSalesOwnerOverall.forEach(eachSales => {
            localStorage.setItem('removedData',
              JSON.stringify({
                tab: 'jobOpening',
                id: initialValues.id,
                userId: eachSales.id
              }));
            localStorage.removeItem('removedData');
          });
        }

        if (values.status && values.status.id === 'closed') {
          if (initialValues.recruiters.length > 0) {
            initialValues.recruiters.forEach(eachUser => {
              localStorage.setItem('removedData',
                JSON.stringify({
                  tab: 'jobOpening',
                  id: initialValues.id,
                  userId: eachUser.id
                }));
              localStorage.removeItem('removedData');
            });
          }
          if (initialValues.salesOwners.length > 0) {
            initialValues.salesOwners.forEach(eachSales => {
              localStorage.setItem('removedData',
                JSON.stringify({
                  tab: 'jobOpening',
                  id: initialValues.id,
                  userId: eachSales.id
                }));
              localStorage.removeItem('removedData');
            });
          }
        }

        this.props.destroy('StepSaveOpening');
        toastr.success(i18n.t('successMessage.UPDATED'),
          i18n.t('successMessage.THE_JOB_OPENING_HAS_BEEN_UPDATED_SUCCESSFULLY'));
        if (!this.state.isSave) {
          this.redirectToProfileSearch(this.props.jobOpeningId);
        } else {
          this.props.loadOpeningById(this.props.jobOpeningId);
          this.props.closeModal();
        }
      }, err => {
        this.props.destroy('StepSaveOpening');
        this.props.closeModal();
        toastrErrorHandling(err.error, i18n.t('ERROR'), i18n.t('errorMessage.THE_JOB_OPENING_COULD_NOT_BE_UPDATED'));
      });
    } else {
      this.saveNewOpening();
    }
  }

  saveNewOpening = () => {
    let values = this.props.values;
    values = trimExtraSpaces(values);
    const deviceDetail = JSON.parse(localStorage.getItem('deviceDetails'));
    if (!values.type) {
      values.type = 'fullTime';
    }
    let jobOpeningDtl = {};
    if (values.jobOpeningDetails) {
      jobOpeningDtl = setJobOpeningsDetails(this.state.selectedJobType, values.jobOpeningDetails, this.props.isEdit);
    }
    const opening = {
      jobTitle: values.jobTitle,
      description: values.description,
      descriptionText: this.convertHTMLToStr(values.description),
      priority: values.priority ? values.priority.id : '',
      positions: values.positions,
      vacancies: values.vacancies,
      company: values.company,
      type: values.type,
      contactId: values.contactPerson.id,
      status: values.status.id,
      openinglocations: values.openingLocation,
      jobCategories: values.jobCategories,
      startDate: values.startDate,
      endDate: values.endDate,
      jobOpeningDetails: jobOpeningDtl,
      recruiters: values.recruiters,
      salesOwners: values.salesOwners,
      tags: values.tags,
      ispublic: values.ispublic.id
    };
    const filters = constructFilters(values);
    if (!opening.jobTitle.includes('(m/w/x)')) {
      opening.jobTitle = `${values.jobTitle} (m/w/x)`;
    }
    this.props.saveNewOpening({
      ...opening,
      status: jobStatus,
      filters	
    }).then(data => {
      this.props.destroy('StepSaveOpening');
      toastr.success(i18n.t('successMessage.SAVED'),
        i18n.t('successMessage.THE_JOB_OPENING_HAS_BEEN_SAVED_SUCCESSFULLY'));
      if (!this.state.isSave) {
        this.redirectToProfileSearch(data.jobId);
      } else if (this.props.saveFromCompany) {
        this.props.closeModal();
        this.props.loadOpeningsForCompanyByFilter(this.props.companyOpeningFilterObj);
      } else {
        // calling the api to apply filters and show the list of openings
        this.props.loadOpenings({ ...this.props.filter, searchTerm: this.props.searchTerm });
        this.props.closeModal();
      }
    }, err => {
      // this.props.reset();
      this.props.closeModal();
      this.props.destroy('StepSaveOpening');
      toastrErrorHandling(err.error, i18n.t('Error'), i18n.t('errorMessage.THE_JOB_OPENING_COULD_NOT_BE_SAVED'));
    });
  }

  isJobDateValid = values => values.startDate > values.endDate;

  nextPage = () => {
    this.setState(previousState => {
      previousState.pageValidationData[(previousState.page).toString()] = true;
      return {
        page: previousState.page + 1,
        isInitialLoad: false,
        pageValidationData: previousState.pageValidationData
      }
      ;
    });
  }

  previousPage = () => {
    this.setState({
      page: this.state.page - 1,
      isInitialLoad: false
    });
  }

  handleProgressBarClick = page => {
    this.setState({
      toPage: page,
      clickedAnotherPage: true,
      isInitialLoad: false
    });
  }

  handleSubmit = values => {
    trimExtraSpaces(values);
  }

  resetFields = targetId => {
    this.setState({
      selectedJobType: targetId,
    });
  }

  handleCompanyKeyDown = () => {
    this.setState({ selectedOption: '' });
    this.props.change('StepSaveOpening', 'companies', '');
  }

  gotoPage = (nextPage, isValidPage) => {
    const { page } = this.state;
    let pagesAreValid = true;
    let invalidPage;
    if (nextPage > page) {
      for (let i = page + 1; i < nextPage; i += 1) {
        if (this.state.pageValidationData[i.toString()]) {
          pagesAreValid = true;
        } else {
          pagesAreValid = false;
          invalidPage = i;
          break;
        }
      }
      if (pagesAreValid) {
        this.setState(previousState => {
          previousState.pageValidationData[(previousState.page).toString()] = isValidPage;
          return {
            page: nextPage,
            clickedAnotherPage: false,
            pageValidationData: previousState.pageValidationData
          };
        });
      } else {
        this.setState(previousState => {
          previousState.pageValidationData[(previousState.page).toString()] = isValidPage;
          return {
            page: invalidPage,
            clickedAnotherPage: false,
            pageValidationData: previousState.pageValidationData
          };
        });
      }
    } else {
      this.setState(previousState => {
        previousState.pageValidationData[(previousState.page).toString()] = isValidPage;
        return {
          page: nextPage,
          clickedAnotherPage: false,
          pageValidationData: previousState.pageValidationData
        }
        ;
      });
    }
  }

  resetPageFields = () => {
    this.setState(previousState => ({
      clickedAnotherPage: false,
      toPage: previousState.page
    }));
  }

  addTag = tag => {
    this.setState(prevState => (
      {
        selectedTags: [...prevState.selectedTags, tag]
      }
    ));
  }

  handleTagChange = tags => {
    this.setState({
      selectedTags: tags
    });
  }

  renderBackButton = () => {
    if (this.state.page === 1) {
      return null;
    }
    const backButton = (
      <button
        className={styles.backButton}
        onClick={() => { this.previousPage(); }}
      > {i18n.t('BACK')}
      </button>
    );
    return backButton;
  }

  renderTitleText = isNew => {
    const { initialValues } = this.props;
    let companyName = '';
    if (initialValues.company) {
      const name = initialValues.company.name;
      companyName = name && name.charAt(0).toUpperCase() + name.slice(1);
    }
    if (isNew) {
      return !initialValues.company ? i18n.t('CREATE_A_NEW_OPENING') :
        `${i18n.t('CREATE_A_NEW_OPENING')} ${i18n.t('FOR')} ${companyName}`;
    }
    return `${i18n.t('EDIT_OPENING')} ${i18n.t('FOR')} ${companyName}`;
  }

  render() {
    const { page, clickedAnotherPage, toPage, isSave, selectedTags } = this.state;
    const { jobOpeningId, initialValues, isEdit, saving, updating } = this.props;
    return (
      <Modal show dialogClassName="modal_dialog">
        <Row className={styles.header}>
          <Col>
            <Row>
              <Col sm={4} xs={4} smOffset={4} xsOffset={4} className={styles.title}>
                {jobOpeningId ? this.renderTitleText(false) : this.renderTitleText(true)}
              </Col>
              <Col
                sm={1}
                xs={1}
                smOffset={3}
                xsOffset={3}
                style={{ paddingRight: '30px', marginTop: '30px', fontSize: '25px', color: '#acacac' }}
              >
                <i
                  role="button"
                  tabIndex={0}
                  className={`fa fa-close ${styles.close_btn}`}
                  onClick={this.closeModal}
                />
              </Col>
            </Row>
            <Row className={styles.progressBar}>
              <Col lg={1} md={1} sm={1} xs={1} lgOffset={2} mdOffset={2} smOffset={1} xsOffset={0}>
                {this.renderBackButton()}
              </Col>
              <Col lg={6} md={6} sm={8} xs={10}>
                <StageProgressBar
                  activePage={page}
                  totalPages={4}
                  handleProgressBarClick={this.handleProgressBarClick}
                  titles={{ 1: 'BASIC_DETAILS',
                    2: 'JOB_DETAILS',
                    3: 'OTHER_DETAILS',
                    4: 'SEARCH_FILTERS'
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles.formContainer}>
          <Scrollbars
            renderTrackHorizontal={props => <div {...props} className="track-horizontal" style={{ display: 'none' }} />}
            renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" style={{ display: 'none' }} />}
          >
            <Col
              lg={6}
              md={6}
              sm={8}
              xs={10}
              lgOffset={3}
              mdOffset={3}
              smOffset={2}
              xsOffset={1}
              className={styles.formInputs}
            >
              {page === 1 &&
              <BasicDetails
                isInitialLoad={this.state.isInitialLoad}
                initialValues={initialValues}
                onSubmit={this.nextPage}
                clickedAnotherPage={clickedAnotherPage}
                toPage={toPage}
                gotoPage={this.gotoPage}
                resetPageFields={this.resetPageFields}
                isEdit={isEdit}
                handleTagChange={this.handleTagChange}
                selectedTags={selectedTags}
                addTag={this.addTag}
              />}
              {page === 2 &&
              <OpeningRequirement
                initialValues={initialValues}
                onSubmit={this.nextPage}
                clickedAnotherPage={clickedAnotherPage}
                toPage={toPage}
                gotoPage={this.gotoPage}
                resetPageFields={this.resetPageFields}
              />}
              {page === 3 &&
              <OpeningEmpTypes
                resetFields={this.resetFields}
                initialValues={initialValues}
                onSubmit={this.nextPage}
                clickedAnotherPage={clickedAnotherPage}
                toPage={toPage}
                gotoPage={this.gotoPage}
                resetPageFields={this.resetPageFields}
              />}
              {page === 4 &&
              <SaveOpeningFilters
                initialValues={initialValues}
                saveAndSearch={this.saveOpening}
                handleCompanyKeyDown={this.handleCompanyKeyDown}
                handleCompanyValueChange={this.handleCompanyValueChange}
                save={evt => this.save(evt)}
                clickedAnotherPage={clickedAnotherPage}
                toPage={toPage}
                gotoPage={this.gotoPage}
                resetPageFields={this.resetPageFields}
                loading={isEdit ? updating : saving}
                isSave={isSave}
              />}
            </Col>
          </Scrollbars>
        </Row>
      </Modal>
    );
  }
}
