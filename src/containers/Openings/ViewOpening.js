import React, { Component } from 'react';
import { Col, Row, Tabs, Tab, Modal } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { toastr } from 'react-redux-toastr';
import lodash from 'lodash';
import { isPristine, change, getFormValues } from 'redux-form';
// import {  Field } from 'redux-form';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { Link, hashHistory } from 'react-router';
import ReactHtmlParser from 'react-html-parser';
import { push as pushState } from 'react-router-redux';
import { EmailActivity } from 'components';
import ActivityHistories from './../../components/Activity/ActivityHistories';
import ActivityLogger from '../../components/ActivityLogger/ActivityLogger';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
// import EditOpening from './SaveOpening';
import EditOpening from './StepSaveOpening';
import Loader from '../../components/Loader';
import {
  loadOpeningById,
  closeViewOpeningModal,
  openEditOpeningModal,
  loadLogActivityForOpening,
  logActivity,
  loadActivityHistoryForOpening,
  shareJobOpening,
  createJobOpeningTag
} from '../../redux/modules/openings';
import { formValidation } from '../../formConfig/SaveOpening';
import CloneViewOpening from './CloneViewOpening';
import styles from './Openings.scss';
// import Emails from '../../components/Emails/Emails';
import {
  loadJobEmails
} from '../../redux/modules/emails';
import socialSharer from '../../utils/socialSharer';
import { formatDomainName, formatTitle, trimTrailingSpace } from '../../utils/validation';
import Constants from '../../helpers/Constants';
import { removeJobFromProfile,
  saveProfileJob, loadProfileById as loadProfile } from '../../redux/modules/profile-search';
import ProfileJobPanel from '../../components/PageComponents/ProfileJobPanel';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import OpeningTagsEdit from './OpeningTagsEdit';

@connect((state, route) => ({
  values: getFormValues('EditOpeningTags')(state),
  router: route.router,
  route: route.route,
  loading: state.openings.loading,
  jobOpeningId: route.params.id,
  isSaveOpeningPristine: isPristine('StepSaveOpening')(state),
  openingFormData: state.form.StepSaveOpening,
  jobOpeningEmailsloading: state.emails.jobOpeningEmailsloading,
  selectedViewOpening: state.openings.selectedOpening,
  jobOpeningActivityLoading: state.openings.jobOpeningActivityLoading,
  jobOpeningActivityLoaded: state.openings.jobOpeningActivityLoaded,
  user: state.auth.user,
  resume: state.profileSearch.resume,
  resumeId: state.routing.locationBeforeTransitions.query.profileId,
}), {
  loadOpeningById,
  openEditOpeningModal,
  closeViewOpeningModal,
  pushState,
  loadJobEmails,
  loadLogActivityForOpening,
  logActivity,
  loadActivityHistoryForOpening,
  removeJobFromProfile,
  saveProfileJob,
  loadProfile,
  shareJobOpening,
  change,
  createJobOpeningTag
})

export default class ViewOpening extends Component {
  static propTypes = {
    jobOpeningId: PropTypes.any.isRequired,
    loadOpeningById: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    isSaveOpeningPristine: PropTypes.bool,
    openingFormData: PropTypes.object,
    route: PropTypes.object,
    router: PropTypes.object,
    location: PropTypes.object,
    closeViewOpeningModal: PropTypes.func.isRequired,
    openEditOpeningModal: PropTypes.func.isRequired,
    jobOpeningEmailsloading: PropTypes.bool,
    jobOpeningActivityLoading: PropTypes.bool,
    jobOpeningActivityLoaded: PropTypes.bool,
    pushState: PropTypes.func.isRequired,
    selectedViewOpening: PropTypes.object,
    loadJobEmails: PropTypes.func.isRequired,
    jobEmails: PropTypes.array,
    loadLogActivityForOpening: PropTypes.func,
    logActivity: PropTypes.func,
    loadActivityHistoryForOpening: PropTypes.func,
    removeJobFromProfile: PropTypes.func.isRequired,
    saveProfileJob: PropTypes.func.isRequired,
    resume: PropTypes.arrayOf(PropTypes.object),
    loadProfile: PropTypes.func.isRequired,
    user: PropTypes.object,
    resumeId: PropTypes.string,
    shareJobOpening: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    values: PropTypes.objectOf(PropTypes.any),
    createJobOpeningTag: PropTypes.func.isRequired
  }

  static defaultProps = {
    selectedViewOpening: null,
    jobOpeningEmailsloading: false,
    jobOpeningActivityLoading: false,
    jobOpeningActivityLoaded: false,
    route: null,
    router: null,
    location: null,
    isSaveOpeningPristine: null,
    openingFormData: null,
    loading: false,
    loadLogActivityForOpening: null,
    logActivity: null,
    jobEmails: null,
    loadActivityHistoryForOpening: null,
    resume: [],
    user: null,
    resumeId: '',
    values: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      openCloneModal: false,
      isEdit: false,
      activities: [],
      logDescription: '',
      histories: [],
      activeKey: 1,
      totalHistoryCount: 0,
      totalActivityCount: 0,
      emails: {},
      noMoreEmails: false,
      onInitialLoad: false,
      isEditPermitted: false,
      isEditMePermitted: false,
      isTagsEditable: false,
      tag: {
        name: '',
        description: null
      },
      showCreateTag: false,
      previousValues: []
    };
  }

  componentWillMount() {
    const isActivities = NewPermissible.isPermitted({ model: 'jobOpening', operation: 'VIEW_JOBOPENING_ACTIVITY' });
    const isHistoryPermitted = NewPermissible.isPermitted({
      model: 'jobOpening',
      operation: 'VIEW_JOBOPENING_HISTORY'
    });
    const isEmailPermitted = NewPermissible.isPermitted({ model: 'ProspectMails', operation: 'VIEW_JOBOPENING_EMAIL' });
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT', model: 'jobOpening' });
    const isEditMePermitted = NewPermissible.isPermitted({ operation: 'EDIT_ME', model: 'jobOpening' });
    this.setState({
      isActivities,
      isHistoryPermitted,
      isEmailPermitted,
      isEditPermitted,
      isEditMePermitted
    });
  }

  componentDidMount() {
    const { location } = this.props;
    if (location && location.state && location.state.activeKey) {
      this.handleSelect(location.state.activeKey);
    } else if (sessionStorage.getItem('jobOpeningActiveKey')) {
      this.handleSelect(Number(sessionStorage.getItem('jobOpeningActiveKey')));
      sessionStorage.removeItem('jobOpeningActiveKey');
    }
    this.props.loadOpeningById(this.props.jobOpeningId);
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.openingFormData && Object.keys(this.props.openingFormData).length > 0
        && !this.props.isSaveOpeningPristine && this.state.openModal) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      }
    });
    let resumeId;
    if (location && location.query && location.query.profileId) {
      resumeId = location.query.profileId;
      this.props.loadProfile({ resumeId,
        originalScore: '',
        targetCompany: '',
        profileId: resumeId,
        needJobIds: true });
    }
  }

  getEditPermission = jobOpening => {
    const { isEditMePermitted, isEditPermitted } = this.state;
    const { user } = this.props;
    let isPermitted = false;
    if (isEditPermitted) {
      isPermitted = true;
    } else if (isEditMePermitted && (jobOpening && jobOpening.createdBy) === (user && user.id)) {
      isPermitted = true;
    }
    return isPermitted;
  }

  handleSelect = key => {
    this.setState({ activeKey: key });
    switch (key) {
      case 2:
        break;
      case 3:
        this.setState({
          onInitialLoad: true,
          activities: [],
          histories: []
        }, () => {
          this.loadLogActivityForOpening({ skip: 0,
            jobOpeningId: this.props.jobOpeningId });
        });
        break;
      case 4:
        this.setState({
          onInitialLoad: true,
          activities: [],
          histories: []
        }, () => {
          this.loadActivityHistoryForOpening({});
        });
        break;
      default:
        break;
    }
  }
  closeModal = () => {
    this.setState({ openModal: false });
    this.props.closeViewOpeningModal();
  }

  openCloneModal = () => {
    this.setState({
      openCloneModal: true
    });
  }

  closeCloneModal = isCloned => {
    this.setState({
      openCloneModal: false,
      isEdit: false
    });
    if (isCloned) {
      this.props.pushState({ pathname: '/Openings' });
    }
  }

  openEditOpeningModal = () => {
    this.setState({
      openModal: true,
      isEdit: true
    }, () => {
      this.props.openEditOpeningModal();
    });
  }

  loadLogActivityForOpening = (filter, onScroll) => {
    const { activities } = this.state;
    filter.jobId = this.props.jobOpeningId;
    filter.skip = filter.skip ? filter.skip : 0;
    filter.limit = Constants.RECORDS_PER_PAGE;
    filter.searchTerm = filter.searchTerm ? filter.searchTerm : '';
    this.searchStr = filter.searchTerm;
    this.props.loadLogActivityForOpening(filter).then(data => {
      if (filter.isEdit || !onScroll) {
        this.setState({
          activities: [...data.response],
          totalActivityCount: data.totalCount,
          onInitialLoad: false
        });
      } else {
        this.setState({
          activities: [...activities, ...data.response],
          totalActivityCount: data.totalCount,
          onInitialLoad: false
        });
      }
    }, err => {
      if (err.error) {
        toastrErrorHandling(err.error, 'Error',
          'Could not load activities for the JobOpening');
      }
    }).catch(err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_ACTIVITIES_FOR_THE_JOBOPENING'));
    });
  }

  loadActivityHistoryForOpening = filter => {
    const { histories } = this.state;
    filter.jobId = this.props.jobOpeningId;
    filter.skip = filter.skip ? filter.skip : 0;
    filter.limit = Constants.RECORDS_PER_PAGE;
    this.props.loadActivityHistoryForOpening(filter).then(data => {
      let historyList = [];
      if (filter.skip === 0) {
        historyList = [...data.response];
      } else {
        historyList = [...histories, ...data.response];
      }
      this.setState({
        histories: historyList,
        totalHistoryCount: data.totalCount,
        onInitialLoad: false
      });
    }, err => {
      if (err.error) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_ACTIVITY_HISTORIES_FOR_THE_JOBOPENING'));
      }
    }).catch(err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_ACTIVITY_HISTORIES_FOR_THE_JOBOPENING'));
    });
  }

  handleActivityLog = (data, callback) => {
    data.jobId = this.props.jobOpeningId;
    data.createdBy = this.props.user.id;
    data.firstName = this.props.user.firstName;
    this.props.logActivity(data).then(activity => {
      toastr.success(i18n.t('successMessage.LOGGED_SUCCESSFULLY'),
        `${i18n.t('ACTIVITY')} - ${activity.type} ${i18n.t('successMessage.SAVED_SUCCESSFULLY')}`);
      this.loadLogActivityForOpening({ searchTerm: this.searchStr });
      callback();
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_SAVE_ACTIVITY_FOR_JOBOPENING'));
      }
    });
  }

  addProfile = (evt, status) => {
    evt.stopPropagation();
    if (status === 'closed') {
      toastrErrorHandling({}, i18n.t('NOTIFICATION'),
        i18n.t('errorMessage.CHANGE_THE_STATUS_AS_ACTIVE_FOR_ADDING_MORE_PROFILES'));
    } else {
      this.props.pushState({ pathname: '/ProfileSearch', query: { jobId: this.props.jobOpeningId } });
    }
  }

  iterateMapAndAttachValues = arrays => {
    let totalString = '';
    if (arrays) {
      arrays.map((array, index) => {
        totalString += array.name || array.countryName || '';
        if (totalString && index !== arrays.length - 1) {
          totalString = `${totalString}, `;
        }
        return true;
      });
    }
    return ` ${totalString}`;
  }

  convertStringFormat = priority => {
    priority = priority.replace(/([a-z])([A-Z])/g, '$1 $2');
    priority = priority.replace('Priority', '');
    return priority;
  };

  shareOpening = (e, medium, opening) => {
    e.stopPropagation();
    const data = {
      url: `${window.location.href}`,
      text: `${opening.jobTitle}`,
      description: `${opening.description ? opening.description : ''}`
    };
    const url = socialSharer(medium, data);
    window.open(url);
  }

  editLog = value => {
    this.setState({
      logDescription: value
    });
  }

  loadJobOpeningEmails = (filter, onScroll) => {
    filter.jobId = this.props.jobOpeningId;
    this.props.loadJobEmails(filter).then(emailList => {
      let emails = {};
      let noMoreEmails = false;
      if (Object.keys(emailList).length === 0) {
        emails = onScroll ? { ...this.state.emails } : {};
        noMoreEmails = true;
      } else {
        const reversedEmailList = {};
        Object.keys(emailList).forEach(key => {
          reversedEmailList[key] = lodash.reverse(emailList[key]);
        });
        if (!onScroll) {
          emails = { ...reversedEmailList };
        } else {
          emails = { ...reversedEmailList, ...this.state.emails };
        }
      }
      this.setState({
        noMoreEmails,
        emails
      });
    }, err => {
      if (err.error) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.Could not email list for the job opening'));
      }
    }).catch(err => {
      toastrErrorHandling(err.error, i18n.t('Error'),
        i18n.t('errorMessage.COULD_NOT_LOAD_EMAIL_LIST_FOR_THE_JOB_OPENING'));
    });
  }

  navigateCompany = id => {
    this.props.pushState({ pathname: `/Company/${id}` });
  }

  handleSelectionButtonClick = (isSelected, profile, selectedOpening) => {
    if (selectedOpening.status !== 'active') {
      toastrErrorHandling({}, i18n.t('NOTIFICATION'),
        i18n.t('errorMessage.CHANGE_THE_STATUS_AS_ACTIVE_FOR_ADDING_MORE_PROFILES'));
    } else if (!isSelected) {
      this.saveProfileJob(selectedOpening.id, selectedOpening.jobTitle);
    } else {
      this.removeProfileFromJobOpening(selectedOpening.id);
    }
  }

  saveProfileJob = (jobId, jobTitle) => {
    const { resume } = this.props;
    if (resume && resume.id) {
      const data = {
        jobId,
        jobTitle,
        resumeId: resume.id,
        resumeProfileId: resume.id,
        candidateName: resume.name,
        status: 'Selected'
      };
      this.props.saveProfileJob(data).then(() => {
        toastr.success(i18n.t('successMessage.SUCCESSFULLY_ADDED'),
          i18n.t('successMessage.CANDIDATE_HAS_BEEN_SUCCESSFULLY_ADDED_TO_THE_JOB_OPENING'));
      }, error => {
        toastrErrorHandling(error.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_ADD_JOB_OPENING_TO_THE_CANDIDATE'));
      });
    }
  }

  removeProfileFromJobOpening = jobId => {
    const { resume } = this.props;
    this.props.removeJobFromProfile(resume.id, jobId).then(() => {
      toastr.success(i18n.t('successMessage.REMOVED_FROM_OPENING'),
        i18n.t('successMessage.THE_CANDIDATE_HAS_BEEN_SUCCESSFULLY_REMOVED_FROM_THIS_OPENING'),
        { removeOnHover: true });
    }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_REMOVE_CANDIDATE_FROM_JOB_OPENING'), { removeOnHover: true });
    });
  }

  attachButtonsToDom = (isSelected, profile, selectedOpening) => (
    <div style={{ marginBottom: '15px', marginTop: '25px' }}>
      <button
        className={`btn btn-border right ${styles.shortlist_button}
      ${isSelected ? styles.selected_btn : styles.not_selected_btn}`}
        title={isSelected ?
          i18n.t('tooltipMessage.CLICK_TO_REMOVE_THE_CANDIDATE_TO_THIS_OPENING')
          : i18n.t('tooltipMessage.CLICK_TO_ADD_THE_CANDIDATE_TO_THIS_OPENING')}
        onClick={() => { this.handleSelectionButtonClick(isSelected, profile, selectedOpening); }}
        tabIndex="-1"
      >
        <i className={isSelected ? 'fa fa-check-circle' : 'fa fa-plus-circle'} />
        {isSelected ? i18n.t('ADDED') : i18n.t('ADD_TO_OPENING')}
      </button>
    </div>
  );

  checkIfJobIsSelected = (selectedOpening, resume) => {
    if (resume && resume.jobIds && resume.jobIds.length > 0
       && selectedOpening) {
      const jobIds = resume.jobIds;
      const jobId = selectedOpening.id;
      if (jobIds.indexOf(jobId) !== -1) {
        return true;
      }
    }
    return false;
  }

  attachBackButton = resumeId => (
    <Link onClick={this.goToPreviousPage}>
      <i
        title={i18n.t('tooltipMessage.CLICK_HERE_TO_GO_TO_BACK')}
        className={`fa fa-arrow-left ${styles.back}`}
        id={resumeId}
        role="button"
        tabIndex="0"
      />
    </Link>
  );

  goToPreviousPage = () => {
    hashHistory.goBack();
  }

  socialShare = jobId => {
    this.props.shareJobOpening(jobId).then(() => {
      toastr.success(i18n.t('successMessage.SHARED_SUCCESS'),
        i18n.t('successMessage.SHARED_SUCCESS_MESSAGE'),
        { removeOnHover: true });
    }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_SHARE'), { removeOnHover: true });
    });
  }

  toggleCreateTagModal = () => {
    const tag = {
      name: '',
      description: null
    };
    this.setState(prevState => ({
      showCreateTag: !prevState.showCreateTag,
      tag,
      isTagSubmitted: false
    }), () => {
      setTimeout(() => {
        if (this.testInput) {
          this.testInput.focus();
        }
      }, 1);
    });
  }

  toggleTagsEdit = () => {
    this.setState(prevState => ({
      isTagsEditable: !prevState.isTagsEditable
    }));
  }
  saveTag = () => {
    const { tag } = this.state;
    const { values } = this.props;
    this.setState({ isTagSubmitted: true });
    values.tags = values.tags ? values.tags : [];
    this.props.createJobOpeningTag(tag).then(res => {
      this.setState({
        tag: {
          name: '',
          description: null
        },
        showCreateTag: false,
        isTagSubmitted: true,
        canGetTags: true
      });
      this.props.change('EditOpeningTags', 'tags', [...values.tags, res]);
      toastr.success(i18n.t('successMessage.SAVED'),
        i18n.t('successMessage.SAVED_TAG_SUCCESSFULLY'));
    }, err => {
      this.setState({
        isTagSubmitted: false
      });
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_SAVE_TAG'));
    });
  }

  checkSubmit = e => {
    const { isTagSubmitted, tag } = this.state;
    if (e.charCode === 13 && !isTagSubmitted && tag.name.trim() !== '') {
      e.preventDefault();
      e.stopPropagation();
      this.saveTag();
    }
  }

  updateTag = (e, key) => {
    const { tag } = this.state;
    const value = e.target.value.replace(/\s\s+/g, ' ');
    if (/^[a-zA-Z0-9\s]+$/i.test(value) || value === '') {
      if (value) {
        tag[key] = trimTrailingSpace(value);
      } else {
        tag[key] = '';
      }
      this.setState({ tag });
    }
  }

  renderCreateTag = () => {
    const { showCreateTag, tag, isTagSubmitted } = this.state;
    return (
      <Modal
        show={showCreateTag}
        onHide={this.toggleCreateTagModal}
        style={{ display: 'block', margin: '150px auto' }}
      >
        <Modal.Header className={`${styles.modal_header_color}`}>
          <Modal.Title>
            <Row className="clearfix">
              <Col sm={12} className={styles.modal_title}>
                <span>
                  <Trans>
                    CREATE_NEW_TAG
                  </Trans>
                </span>
                <span
                  role="button"
                  tabIndex="-1"
                  className="close_btn right no-outline"
                  onClick={this.toggleCreateTagModal}
                >
                  <i className="fa fa-close" />
                </span>
              </Col>
            </Row>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.m_t_b_15}>
            <label className={styles.hdr_label} htmlFor="name">
              <Trans>NAME</Trans>
              <span className="required_color">*</span>
            </label>
            <div>
              <input
                type="text"
                className="inline"
                id="name"
                placeholder={i18n.t('TAG_NAME')}
                onChange={e => this.updateTag(e, 'name')}
                value={tag.name}
                ref={input => { this.testInput = input; }}
                onKeyPress={e => this.checkSubmit(e)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Col lg={12} md={12} sm={12} xs={12} className={`p-0 p-t-15 p-b-15 ${styles.ats_btn_section}`}>
            <button
              className="btn button-secondary-hover"
              type="submit"
              onClick={this.toggleCreateTagModal}
            >
              <span className={styles.btn_text}><Trans>CANCEL</Trans></span>
            </button>
            <button
              className="btn button-primary"
              type="submit"
              disabled={!tag.name.trim() || isTagSubmitted}
              onClick={this.saveTag}
            >
              <span className={styles.btn_text}><Trans>ADD</Trans></span>
            </button>
          </Col>
        </Modal.Footer>
      </Modal>
    );
  }

  renderOpeningTags = tags => {
    if (tags && tags.length > 0) {
      return tags.map(tag => (
        <div
          key={tag.id}
          id={tag.id}
          className={styles.tag_container}
        >
          <span className={styles.tag}>{tag.name}</span>
        </div>)
      );
    }
    return (<div className={styles.no_tags}>
      {i18n.t('NO_TAGS_ARE_ASSOCIATED_TO_THIS_JOB_OPENING')} </div>);
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_OPENING_FOUND</Trans></div></Row>
        <Row className={`${styles.empty_message} m-0`}>
          <div><Trans>TRY_AGAIN_LATER</Trans></div>
        </Row>
      </Col>
    );
    return NoResultsFound;
  }

  render() {
    const logData = {
      type: ['Log a call', 'Log an email', 'Face to face', 'Log a note'],
      handleSubmit: this.handleActivityLog,
      logDate: new Date(),
      logPlaceHolder: 'Select a log',
      defaultLogValue: 'Log a note',
      requiredTypeForOutCome: 'Log a call'
    };
    const { isEdit, openModal, openCloneModal, logDescription,
      activities, totalActivityCount, histories, totalHistoryCount, onInitialLoad,
      isActivities, isHistoryPermitted, isEmailPermitted, showCreateTag, isTagsEditable } = this.state;
    // on editing the selected viewOpening props wil cause the component to render
    const { selectedViewOpening, loading, jobOpeningEmailsloading, jobOpeningActivityLoading,
      route, router, resume, resumeId, jobOpeningId, jobOpeningActivityLoaded } = this.props;
    let endDate;
    let startDate;
    let initialValues = {};
    if (selectedViewOpening) {
      if (isEdit) {
        initialValues = {
          ...selectedViewOpening,
          ...selectedViewOpening.filters,
          description: selectedViewOpening.description,
          filterId: selectedViewOpening.filters ? selectedViewOpening.filters.id : '',
          id: selectedViewOpening.id,
          openingLocation: selectedViewOpening.openinglocations,
        };
      }
      if (selectedViewOpening.jobOpeningDetails) {
        endDate = selectedViewOpening.jobOpeningDetails.endDate ||
          selectedViewOpening.jobOpeningDetails.freelanceEndDate;
        startDate = selectedViewOpening.jobOpeningDetails.startDate ||
          selectedViewOpening.jobOpeningDetails.freelanceStartDate;
      }
    }
    const domainName = (selectedViewOpening && selectedViewOpening.company
      && selectedViewOpening.company.domain) ? selectedViewOpening.company.domain.split(';') : '';
    const isSelected = this.checkIfJobIsSelected(selectedViewOpening, resume);
    return (
      <div className={'company_container'} style={{ backgroundColor: '#ffffff' }}>
        <Scrollbars
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(100vh - 65px)'}
          autoHeightMax={'calc(100vh - 65px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          {
            resumeId && resume && Object.keys(resume).length > 0 && resume.id ?
              <div style={{ paddingLeft: '7px', paddingRight: '9px', marginBottom: '0px' }}>
                <ProfileJobPanel
                  profileName={resume && Object.keys(resume).length > 0 ? this.props.resume.name : ''}
                  attachButtonsToDom={this.attachButtonsToDom(isSelected, resume, selectedViewOpening)}
                  attachBackButton={this.attachBackButton(resume.id)}
                />
              </div> : null
          }
          {selectedViewOpening ? <Col sm={12} className={`${styles.view_opening} opening_container p-0`}>
            <Tabs
              onSelect={this.handleSelect}
              activeKey={this.state.activeKey}
              className={`${styles.tab_section} shadow_one`}
              id="viewOPeningTabs"
            >
              <Tab eventKey={1} title={i18n.t('OVERVIEW')}>
                <Col lg={9} md={8} sm={9} xs={7} className="m-t-10">
                  <Col sm={12} xs={12}>
                    <div className={`${styles.company_name} m-t-10 m-b-5`}>
                      {formatTitle(selectedViewOpening.jobTitle)}
                    </div>
                  </Col>
                  <Col sm={7} xs={12}>
                    <div className="m-b-5">
                      <span className={`${styles.filters} ${styles.jobId}`}>{i18n.t('JOB_ID')}</span>:
                      <span style={{ marginLeft: '3px' }}className={styles.jobId}>{selectedViewOpening.id}</span>
                    </div>
                    {(selectedViewOpening.status === 'active'
                      || selectedViewOpening.status === 'closed') &&
                      <div
                        className={`${styles.status} ${styles[(selectedViewOpening.status || '').toLowerCase()]} m-b-5`}
                      >
                        <span className={`${styles.filters}`}><Trans>STATUS</Trans>: </span>
                        <span>{`${selectedViewOpening.status}`}</span>
                      </div>
                    }
                    {
                      /*
                      selectedViewOpening.status === 'active' && !selectedViewOpening.isAssigned &&
                      <div
                        className={`${styles.status} m-b-5 left}`}
                        style={{ color: '#148AAA' }}
                      >
                        <span className={`${styles.filters}`}>Status: </span>
                        <span style={{ textTransform: 'none' }}>Pending for approval</span>
                      </div>
                      */
                    }
                    {selectedViewOpening.filters && selectedViewOpening.filters.experience &&
                    <div className="m-b-5">
                      <span className={`${styles.filters}`}>Exp: </span>
                      <span>
                        { `${selectedViewOpening.filters.experience[0]} -
                          ${selectedViewOpening.filters.experience[1]}` }
                      </span>
                    </div>
                    }
                    <div className={`${styles.contact_number} m-b-5`}>
                      <img
                        src={'../socialIcons/location.svg'}
                        alt="Location Icon"
                        role="presentation"
                        className="height_15 m-r-5"
                      />
                      {selectedViewOpening.openinglocations && selectedViewOpening.openinglocations.length > 0 ?
                        this.iterateMapAndAttachValues(selectedViewOpening.openinglocations) :
                        <Trans>NOT_AVAILABLE</Trans>
                      }
                    </div>
                    <div className={`${styles.industry} m-b-10`}>
                      {selectedViewOpening.vacancies &&
                      <div className="m-b-5">
                        <span className={`${styles.filters}`}><Trans>VACANCIES</Trans>: </span>
                        <span>
                          {selectedViewOpening.vacancies}
                        </span>
                      </div>
                      }
                      {selectedViewOpening.priority &&
                      <div className="m-b-5">
                        <span className={`${styles.filters}`}><Trans>PRIORITY</Trans>: </span>
                        <span>
                          {this.convertStringFormat(selectedViewOpening.priority)}
                        </span>
                      </div>
                      }
                      {selectedViewOpening.endDate &&
                      <div>
                        <span className={`${styles.filters}`}><Trans>DUE_DATE</Trans>: </span>
                        <span>
                          {moment(selectedViewOpening.endDate, 'YYYY-MM-DD').format('DD MMM YYYY')}
                        </span>
                      </div>
                      }
                    </div>
                  </Col>
                  { selectedViewOpening.company &&
                  <Col sm={5} xs={12}>
                    <div className={`${styles.contact_heading} m-b-5`}>
                      <Trans>COMPANY_DETAILS</Trans>
                    </div>
                    <div
                      role="presentation"
                      className={`${styles.company_title} ${styles.textWrap} m-b-5`}
                      title={selectedViewOpening.company.name}
                      onClick={() => this.navigateCompany(selectedViewOpening.company.id)}
                    >
                      {selectedViewOpening.company && selectedViewOpening.company.name}
                    </div>
                    <div className={`${styles.industry} m-b-5`}>
                      <i className="fa fa-address-card-o p-r-5" aria-hidden="true" />
                      {selectedViewOpening.company.address ?
                        selectedViewOpening.company.address
                        :
                        selectedViewOpening.company.state}
                    </div>
                    <div className={`${styles.industry} m-b-5`}>
                      <img
                        src={'../socialIcons/location.svg'}
                        alt="Location Icon"
                        role="presentation"
                        className="height_15 m-r-5"
                      />
                      { selectedViewOpening.company.city && `${selectedViewOpening.company.city}, ` }
                      { selectedViewOpening.company.country && selectedViewOpening.company.country }
                    </div>
                    <div className={`${styles.contact_position} m-b-5`}>
                      {selectedViewOpening.company.contactName}
                    </div>
                    {selectedViewOpening.company.linkedinurl &&
                    <div className={`${styles.linkedinurl} m-b-5`} title={selectedViewOpening.company.linkedinurl}>
                      <Link to={`http://${selectedViewOpening.company.linkedinurl}`} target="_blank">
                        <Trans>LINKEDIN</Trans>
                        <i className="fa fa-share-square-o p-l-5" aria-hidden="true" />
                      </Link>
                    </div>
                    }
                    {selectedViewOpening.company.domain && domainName &&
                    domainName.map(domain => (
                      <div
                        className={`${styles.company_domain} m-b-5`}
                        title={`http://${formatDomainName(domain)}`}
                        key={Math.random().toString(36).substring(7)}
                      >
                        <Link to={`http://${formatDomainName(domain)}`} target="_blank">
                          {domain}
                        </Link>
                      </div>
                    ))
                    }
                    {selectedViewOpening.contactPerson &&
                    <div>
                      <div className={`${styles.contact_number} m-b-5`}>
                        <img
                          src={'../socialIcons/phone-outgoing.svg'}
                          alt="Phone Icon"
                          role="presentation"
                          className="height_15 m-r-5"
                        />
                        {selectedViewOpening.contactPerson.phoneNumber ?
                          selectedViewOpening.contactPerson.phoneNumber
                          :
                          <Trans>NOT_AVAILABLE</Trans>}
                      </div>
                      <div className={`${styles.contact_number} m-b-5`}>
                        <img
                          src={'../socialIcons/mail.svg'}
                          alt="Mail Icon"
                          role="presentation"
                          className="height_13 m-r-5"
                        />
                        <Link
                          to={`mailto:${selectedViewOpening.contactPerson.email ?
                            selectedViewOpening.contactPerson.email : ''}?Subject=''`}
                          target="_top"
                        >
                          {selectedViewOpening.contactPerson.email ?
                            selectedViewOpening.contactPerson.email
                            :
                            <Trans>NOT_AVAILABLE</Trans>}
                        </Link>
                      </div>
                    </div>
                    }
                  </Col>
                  }
                </Col>
                {
                  !selectedViewOpening.isArchived &&
                  <Col lg={3} md={3} sm={3} xs={5} className="opening_overview_actions m-t-10">
                    {this.getEditPermission(selectedViewOpening) && <Col md={7} sm={8} xs={12}>
                      <button
                        id={selectedViewOpening.id}
                        className={`${styles.quick_access_btns} button-secondary-hover m-t-10 m-b-10`}
                        type="button"
                        onClick={this.openEditOpeningModal}
                      >
                        <span>
                          <i
                            className="fa fa-pencil-square-o"
                            aria-hidden="true"
                          /><Trans>EDIT</Trans></span>
                      </button>
                    </Col>}
                    <Col md={7} sm={8} xs={12}>
                      <button
                        id={selectedViewOpening.id}
                        className={`${styles.quick_access_btns} button-secondary-hover m-t-10 m-b-10`}
                        type="button"
                        onClick={() => this.socialShare(selectedViewOpening.id)}
                      >
                        <span>
                          <i
                            className="fa fa-share-square-o"
                            aria-hidden="true"
                          /><Trans>SHARE</Trans></span>
                      </button>
                    </Col>
                    {/* <Permissible operation="Clone_job_opening">
                      <Col md={7} sm={8} xs={12}>
                        <button
                          id={selectedViewOpening.id}
                          className="btn btn-border filter-btn m-t-10 m-b-10"
                          type="button"
                          onClick={this.openCloneModal}
                        >
                          <span>
                            <i
                              className="fa fa-clone"
                              aria-hidden="true"
                            />Clone</span>
                        </button>
                      </Col>
                    </Permissible> */}
                    {
                      selectedViewOpening.status === 'active' && selectedViewOpening.recruiters.length > 0 &&
                      <div>
                        {/* <Col md={7} sm={8} xs={12}>
                            <button
                              id={selectedViewOpening.id}
                              className="btn btn-border filter-btn m-t-10 m-b-10"
                              type="button"
                              onClick={this.openCloneModal}
                            >
                              <span>
                                <i
                                  className="fa fa-clone"
                                  aria-hidden="true"
                                />Clone</span>
                            </button>
                          </Col> */}
                        <Col md={7} sm={8} xs={12}>
                          <NewPermissible operation={{ operation: 'SELECT_CANDIDATE', model: 'jobProfile' }}>
                            <button
                              id={selectedViewOpening.id}
                              className={`${styles.quick_access_btns} button-secondary-hover m-t-10 m-b-10`}
                              type="button"
                              onClick={evt => this.addProfile(evt, selectedViewOpening.status)}
                            >
                              <span>
                                <i
                                  className="fa fa-plus"
                                  aria-hidden="true"
                                /><Trans>ADD_CANDIDATES</Trans></span>
                            </button>
                          </NewPermissible>
                        </Col>
                        <Col md={7} sm={8} xs={12}>
                          <NewPermissible operation={{ operation: 'VIEW_ATS_BOARD', model: 'jobProfile' }}>
                            <Link
                              onClick={e => e.stopPropagation()}
                              to={{ pathname: '/ATSBoard', query: { jobId: selectedViewOpening.id } }}
                            >
                              <button
                                id={selectedViewOpening.id}
                                className={`${styles.quick_access_btns} button-secondary-hover m-t-10 m-b-10`}
                                type="button"
                              >
                                <span>
                                  <i
                                    className="fa fa-th"
                                    aria-hidden="true"
                                  /><Trans>ATS_BOARD</Trans></span>
                              </button>
                            </Link>
                          </NewPermissible>
                        </Col>
                      </div>
                    }
                  </Col>
                }
                {/* <Col sm={9} xs={12}>
                  <div className="p-l-15">
                    <span className="p-r-10">
                      <b>Share on:</b>
                    </span>
                    <span
                      className={`p-r-10 ${styles.social_icon}`}
                      onClick={e => this.shareOpening(e, 'facebook', selectedViewOpening)}
                    >
                      <img
                        src="../facebook.svg"
                        className="img-responsive"
                        alt="Share on facebook"
                        title="Share on facebook"
                      />
                    </span>
                    <span
                      className={`p-r-10 ${styles.social_icon}`}
                      onClick={e => this.shareOpening(e, 'linkedin', selectedViewOpening)}
                      role="presentation"
                    >
                      <img
                        src="../linkedin.png"
                        className="img-responsive"
                        alt="Share on linkedin"
                        title="Share on linkedin"
                      />
                    </span>
                    <span
                      className={`p-r-10 ${styles.social_icon}`}
                      onClick={e => this.shareOpening(e, 'twitter', selectedViewOpening)}
                      role="presentation"
                    >
                      <img
                        src="../twitter.svg"
                        className="img-responsive"
                        alt="Share on twitter"
                        title="Share on twitter"
                      />
                    </span>
                    <span
                      className={`p-r-10 ${styles.social_icon}`}
                      onClick={e => this.shareOpening(e, 'xing', selectedViewOpening)}
                    >
                      <img
                        src="../xing.png"
                        className="img-responsive"
                        alt="Share on xing"
                        title="Share on xing"
                      />
                    </span>
                  </div>
                </Col> */}
                <Col sm={9} xs={12} className={`${styles.report} p-15`}>
                  {selectedViewOpening.statusCount &&
                    (() => {
                      const { selected, shortlisted, interested, toBeSubmitted, submitted, contacted, scheduled,
                        hired } = selectedViewOpening.statusCount;
                      return (
                        <Row className={`${styles.blocks} m-l-0`}>
                          <table className={styles.statusCountBox}>
                            <tr>
                              <td>
                                <div className={styles.selected}>
                                  <div>{selected || '-'}</div>
                                  <div><Trans>SELECTED</Trans></div>
                                </div>
                              </td>
                              <td>
                                <div className={styles.contacted}>
                                  <div>{contacted || '-'}</div>
                                  <div><Trans>CONTACTED</Trans></div>
                                </div>
                              </td>
                              <td>
                                <div className={styles.contacted}>
                                  <div>{interested || '-'}</div>
                                  <div><Trans>INTERESTED</Trans></div>
                                </div>
                              </td>
                              <td>
                                <div className={styles.contacted}>
                                  <div>{toBeSubmitted || '-'}</div>
                                  <div><Trans>TO_BE_SUBMITTED</Trans></div>
                                </div>
                              </td>
                              <td>
                                <div className={styles.contacted}>
                                  <div>{submitted || '-'}</div>
                                  <div><Trans>SUBMITTED</Trans></div>
                                </div>
                              </td>
                              <td>
                                <div className={styles.shortlisted}>
                                  <div>{shortlisted || '-'}</div>
                                  <div><Trans>SHORTLISTED</Trans></div>
                                </div>
                              </td>
                              <td>
                                <div className={styles.in_pipeline}>
                                  <div>{scheduled || '-'}</div>
                                  <div><Trans>INTERVIEW</Trans></div>
                                </div>
                              </td>
                              <td>
                                <div className={styles.hired}>
                                  <div>{hired || '-'}</div>
                                  <div><Trans>HIRED</Trans></div>
                                </div>
                              </td>
                              <td>
                                <div className={styles.rejected}>
                                  <div>{selectedViewOpening.rejectedCount || '-'}</div>
                                  <div><Trans>REJECTED</Trans></div>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </Row>
                      );
                    })()
                  }
                </Col>
                <Col sm={9} xs={12}>
                  <Col
                    sm={9}
                    className={`${styles.border_shade} ${styles.desc_min_height} ${styles.border_top} m-t-10`}
                  >
                    <div className={`${styles.contact_heading} m-l-15`}>
                      <Trans>DESCRIPTION</Trans>
                      <div className={`m-t-10 ${styles.description}`}>
                        {selectedViewOpening.description ?
                          ReactHtmlParser(selectedViewOpening.description)
                          :
                          <Trans>DESCRIPTION_NOT_AVAILABLE</Trans>}
                      </div>
                    </div>
                  </Col>
                </Col>
                <Col sm={9} xs={12}>
                  <Col sm={9} className={`${styles.border_shade} p-l-15`}>
                    <div className={`${styles.contact_heading} m-t-10 m-b-10`}>
                      <Trans>TAGS</Trans>
                      {
                        isTagsEditable ?
                          <span
                            className={`${styles.create_tag} right cursor-pointer`}
                            onClick={this.toggleCreateTagModal}
                            role="presentation"
                          >
                            <Trans>
                              CREATE_NEW_TAG
                            </Trans>
                          </span> :
                          this.getEditPermission(selectedViewOpening) &&
                            <img
                              src={'/edit.svg'}
                              alt="edit icon"
                              role="presentation"
                              onClick={this.toggleTagsEdit}
                              className="m-r-5 right cursor-pointer"
                              title={i18n.t('EDIT')}
                            />
                      }
                    </div>
                    {
                      isTagsEditable ?
                        <OpeningTagsEdit
                          openingTags={selectedViewOpening.tags}
                          toggleTagsEdit={this.toggleTagsEdit}
                          jobId={selectedViewOpening.id}
                          loadOpeningById={jobId => { this.props.loadOpeningById(jobId); }}
                        /> :
                        this.renderOpeningTags(selectedViewOpening.tags)
                    }
                  </Col>
                </Col>
                {
                  selectedViewOpening.deliveryHeads && selectedViewOpening.deliveryHeads.length > 0 &&
                  <Col sm={9} xs={12}>
                    <Col sm={9} className={`${styles.border_shade} p-l-15`}>
                      <div className={`${styles.contact_heading} m-t-10 m-b-10`}>
                        <Trans>DELIVERY_HEAD_DETAIL</Trans>
                      </div>
                      {selectedViewOpening.deliveryHeads.map(data => (
                        <Col sm={4} className="p-0 m-b-10" key={Math.random().toString(36).substring(7)}>
                          <div className={`${styles.contact_heading}`}>
                            <div className={`${styles.contact_name} m-b-5`}>
                              {data.firstName} {data.lastName}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <img
                                src={'../socialIcons/phone-outgoing.svg'}
                                alt="Phone Icon"
                                role="presentation"
                                className="height_15 m-r-5"
                              />
                              {data.contactNumber ? data.contactNumber : <Trans>NOT_AVAILABLE</Trans>}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <img
                                src={'../socialIcons/mail.svg'}
                                alt="Mail Icon"
                                role="presentation"
                                className="height_13 m-r-5"
                              />
                              <Link to={`mailto:${data.email ? data.email : ''}?Subject=''`} target="_top">
                                {data.email ? data.email : <Trans>NOT_AVAILABLE</Trans>}
                              </Link>
                            </div>
                          </div>
                        </Col>))
                      }
                    </Col>
                  </Col>
                }
                {
                  selectedViewOpening.sales && selectedViewOpening.sales.length > 0 &&
                  <Col sm={9} xs={12}>
                    <Col sm={9} className={`${styles.border_shade} p-l-15`}>
                      <div className={`${styles.contact_heading} m-t-10 m-b-10`}>
                        <Trans>SALES_REP_DETAIL</Trans>
                      </div>
                      {selectedViewOpening.sales.map(data => (
                        <Col sm={4} className="p-0 m-b-10" key={Math.random().toString(36).substring(7)}>
                          <div className={`${styles.contact_heading}`}>
                            <div className={`${styles.contact_name} m-b-5`}>
                              {data.firstName} {data.lastName}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <img
                                src={'../socialIcons/phone-outgoing.svg'}
                                alt="Phone Icon"
                                role="presentation"
                                className="height_15 m-r-5"
                              />
                              {data.contactNumber ? data.contactNumber : <Trans>NOT_AVAILABLE</Trans>}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <img
                                src={'../socialIcons/mail.svg'}
                                alt="Mail Icon"
                                role="presentation"
                                className="height_13 m-r-5"
                              />
                              <Link to={`mailto:${data.email ? data.email : ''}?Subject=''`} target="_top">
                                {data.email ? data.email : <Trans>NOT_AVAILABLE</Trans>}
                              </Link>
                            </div>
                          </div>
                        </Col>))
                      }
                    </Col>
                  </Col>
                }
                {
                  selectedViewOpening.salesOwners && selectedViewOpening.salesOwners.length > 0 &&
                  <Col sm={9} xs={12}>
                    <Col sm={9} className={`${styles.border_shade} p-l-15`}>
                      <div className={`${styles.contact_heading} m-t-10 m-b-10`}>
                        <Trans>ACCOUNT_OWNERS_DETAIL</Trans>
                      </div>
                      {selectedViewOpening.salesOwners.map(data => (
                        <Col sm={4} className="p-0 m-b-10" key={Math.random().toString(36).substring(7)}>
                          <div className={`${styles.contact_heading}`}>
                            <div className={`${styles.contact_name} m-b-5`}>
                              {data.firstName} {data.lastName}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <img
                                src={'../socialIcons/phone-outgoing.svg'}
                                alt="Phone Icon"
                                role="presentation"
                                className="height_15 m-r-5"
                              />
                              {data.contactNumber ? data.contactNumber : <Trans>NOT_AVAILABLE</Trans>}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <img
                                src={'../socialIcons/mail.svg'}
                                alt="Mail Icon"
                                role="presentation"
                                className="height_13 m-r-5"
                              />
                              <Link to={`mailto:${data.email ? data.email : ''}?Subject=''`} target="_top">
                                {data.email ? data.email : <Trans>NOT_AVAILABLE</Trans>}
                              </Link>
                            </div>
                          </div>
                        </Col>))
                      }
                    </Col>
                  </Col>
                }
                {
                  selectedViewOpening.recruiters && selectedViewOpening.recruiters.length > 0 &&
                  <Col sm={9} xs={12}>
                    <Col sm={9} className={`${styles.border_shade} p-l-15`}>
                      <div className={`${styles.contact_heading} m-t-10 m-b-10`}>
                        <Trans>RECRUITERS_DETAIL</Trans>
                      </div>
                      {selectedViewOpening.recruiters.map(data => (
                        <Col sm={4} className="p-0 m-b-10" key={Math.random().toString(36).substring(7)}>
                          <div className={`${styles.contact_heading}`}>
                            <div className={`${styles.contact_name} m-b-5`}>
                              {data.firstName} {data.lastName}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <img
                                src={'../socialIcons/phone-outgoing.svg'}
                                alt="Phone Icon"
                                role="presentation"
                                className="height_15 m-r-5"
                              />
                              {data.contactNumber ? data.contactNumber : <Trans>NOT_AVAILABLE</Trans>}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <img
                                src={'../socialIcons/mail.svg'}
                                alt="Mail Icon"
                                role="presentation"
                                className="height_13 m-r-5"
                              />
                              <Link to={`mailto:${data.email ? data.email : ''}?Subject=''`} target="_top">
                                {data.email ? data.email : <Trans>NOT_AVAILABLE</Trans>}
                              </Link>
                            </div>
                          </div>
                        </Col>))
                      }
                    </Col>
                  </Col>
                }
                {selectedViewOpening.type &&
                  <Col sm={9} xs={12}>
                    <Col sm={9} xs={12} className={`${styles.border_shade} m-t-10`}>
                      <Col sm={9} xs={12} className={`${styles.contact_heading}`}>
                        <Trans>EMPLOYMENT_DETAILS</Trans>
                      </Col>
                      <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                        <span className={`${styles.filters}`}><Trans>TYPE</Trans>: </span>
                        <span className="text-capitalize">
                          {selectedViewOpening.type === 'partTime' ? 'Freelance' : selectedViewOpening.type}
                        </span>
                      </Col>
                      {selectedViewOpening.jobOpeningDetails && selectedViewOpening.type === 'contract' &&
                      selectedViewOpening.jobOpeningDetails.contractRemoteLocation !== null &&
                      selectedViewOpening.jobOpeningDetails.contractRemoteLocation ?
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>REMOTE</Trans>: </span>
                          <span>
                            <Trans>YES</Trans>
                          </span>
                        </Col> : ''
                      }
                      {selectedViewOpening.jobOpeningDetails && selectedViewOpening.type === 'contract' &&
                      selectedViewOpening.jobOpeningDetails.contractOnsiteLocation !== null &&
                      selectedViewOpening.jobOpeningDetails.contractOnsiteLocation ?
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>ONSITE</Trans>: </span>
                          <span>
                            <Trans>YES</Trans>
                          </span>
                        </Col> : ''
                      }
                      {selectedViewOpening.jobOpeningDetails && selectedViewOpening.type === 'partTime' &&
                      selectedViewOpening.jobOpeningDetails.partTimeRemoteLocation !== null &&
                      selectedViewOpening.jobOpeningDetails.partTimeRemoteLocation ?
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>REMOTE</Trans>: </span>
                          <span>
                            <Trans>YES</Trans>
                          </span>
                        </Col> : ''
                      }
                      {selectedViewOpening.jobOpeningDetails && selectedViewOpening.type === 'partTime' &&
                      selectedViewOpening.jobOpeningDetails.partTimeOnsiteLocation !== null &&
                      selectedViewOpening.jobOpeningDetails.partTimeOnsiteLocation ?
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>ONSITE</Trans>: </span>
                          <span>
                            <Trans>YES</Trans>
                          </span>
                        </Col> : ''
                      }
                      {selectedViewOpening.jobOpeningDetails && selectedViewOpening.type === 'contract' &&
                         selectedViewOpening.jobOpeningDetails.contractStartDate !== null
                        ? <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>START_DATE</Trans>: </span>
                          <span>
                            {moment(
                              selectedViewOpening.jobOpeningDetails.contractStartDate,
                              'YYYY-MM-DD'
                            ).format('DD MMM YYYY')
                            }
                          </span>
                        </Col> : ''
                      }
                      {selectedViewOpening.jobOpeningDetails && selectedViewOpening.type === 'contract' &&
                        selectedViewOpening.jobOpeningDetails.contractEndDate !== null
                        ? <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>END_DATE</Trans>: </span>
                          <span>
                            {moment(
                              selectedViewOpening.jobOpeningDetails.contractEndDate,
                              'YYYY-MM-DD'
                            ).format('DD MMM YYYY')
                            }
                          </span>
                        </Col> : ''
                      }
                      {selectedViewOpening.jobOpeningDetails && selectedViewOpening.type === 'fullTime' &&
                         selectedViewOpening.jobOpeningDetails.fullTimeStartDate !== null
                        ? <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>START_DATE</Trans>: </span>
                          <span>
                            {moment(
                              selectedViewOpening.jobOpeningDetails.fullTimeStartDate,
                              'YYYY-MM-DD'
                            ).format('DD MMM YYYY')
                            }
                          </span>
                        </Col>
                        : ''
                      }
                      {selectedViewOpening.jobOpeningDetails && selectedViewOpening.type === 'fullTime' &&
                        selectedViewOpening.jobOpeningDetails.fullTimeEndDate !== null
                        ? <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>END_DATE</Trans>: </span>
                          <span>
                            {moment(
                              selectedViewOpening.jobOpeningDetails.fullTimeEndDate,
                              'YYYY-MM-DD'
                            ).format('DD MMM YYYY')
                            }
                          </span>
                        </Col> : ''
                      }

                      {selectedViewOpening.jobOpeningDetails &&
                        selectedViewOpening.jobOpeningDetails.salary &&
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}>Salary: </span>
                          <span>{selectedViewOpening.jobOpeningDetails.salary} / Hrs</span>
                        </Col>
                      }
                      {selectedViewOpening.jobOpeningDetails &&
                        selectedViewOpening.jobOpeningDetails.permFee &&
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>PERM_FEE</Trans>: </span>
                          <span>{selectedViewOpening.jobOpeningDetails.permFee}%</span>
                        </Col>
                      }
                      {selectedViewOpening.jobOpeningDetails &&
                        startDate &&
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>START_DATE</Trans>: </span>
                          <span>
                            {moment(
                              startDate,
                              'YYYY-MM-DD'
                            ).format('DD MMM YYYY')
                            }
                          </span>
                        </Col>
                      }
                      {selectedViewOpening.jobOpeningDetails &&
                        endDate &&
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>END_DATE</Trans>: </span>
                          <span>
                            {moment(
                              endDate,
                              'YYYY-MM-DD'
                            ).format('DD MMM YYYY')
                            }
                          </span>
                        </Col>
                      }
                      {selectedViewOpening.jobOpeningDetails &&
                        selectedViewOpening.jobOpeningDetails.payRate &&
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>PAY_RATE_FREELANCE</Trans>: </span>
                          <span>{selectedViewOpening.jobOpeningDetails.payRate} / Hrs</span>
                        </Col>
                      }
                      {selectedViewOpening.jobOpeningDetails &&
                        selectedViewOpening.jobOpeningDetails.salaryContract &&
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>SALARY</Trans>: </span>
                          <span>{selectedViewOpening.jobOpeningDetails.salaryContract} / Hrs</span>
                        </Col>
                      }
                      {selectedViewOpening.jobOpeningDetails &&
                        selectedViewOpening.jobOpeningDetails.billRate &&
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>BILL_RATE</Trans>: </span>
                          <span>{selectedViewOpening.jobOpeningDetails.billRate} / Hrs</span>
                        </Col>
                      }
                      {selectedViewOpening.jobOpeningDetails &&
                        selectedViewOpening.jobOpeningDetails.payRateFreelance &&
                        <Col sm={4} xs={6} className={`m-t-10 ${styles.description}`}>
                          <span className={`${styles.filters}`}><Trans>PAY_RATE_FREELANCE</Trans>: </span>
                          <span>{selectedViewOpening.jobOpeningDetails.payRateFreelance} / Hrs</span>
                        </Col>
                      }
                    </Col>
                  </Col>
                }
                {selectedViewOpening.jobCategories && selectedViewOpening.jobCategories.length ?
                  <Col sm={9} xs={12}>
                    <Col sm={9} className={`${styles.border_shade} m-t-10`}>
                      <div className={`${styles.contact_heading} m-l-15`}>
                        <Trans>JOB_CATEGORIES</Trans>
                        <div className={`m-t-10 ${styles.description}`}>
                          {this.iterateMapAndAttachValues(selectedViewOpening.jobCategories)}
                        </div>
                      </div>
                    </Col>
                  </Col>
                  : null
                }
                {selectedViewOpening.filters && selectedViewOpening.filters.skills &&
                  <Col sm={9} xs={12}>
                    <Col sm={9} className={`${styles.border_shade} m-t-10`}>
                      <div className={`${styles.contact_heading} m-l-15`}>
                        <Trans>KEY_SKILLS</Trans>
                        <div className={`m-t-10 ${styles.description}`}>
                          {this.iterateMapAndAttachValues(selectedViewOpening.filters.skills)}
                        </div>
                      </div>
                    </Col>
                  </Col>
                }
                {selectedViewOpening.filters && Object.keys(selectedViewOpening.filters).length !== 0 &&
                  (selectedViewOpening.filters.location || selectedViewOpening.filters.companies ||
                    selectedViewOpening.filters.positions || selectedViewOpening.filters.candidateTags ||
                    selectedViewOpening.filters.source || selectedViewOpening.filters.noticePeriod ||
                    selectedViewOpening.filters.noticePeriodType || selectedViewOpening.filters.isEmail
                    || selectedViewOpening.filters.isMobile || selectedViewOpening.filters.isFreelance) &&
                    <Col sm={9} xs={12}>
                      <Col sm={9} className={`${styles.border_shade} m-t-10`}>
                        <div className={`${styles.contact_heading} m-l-15`}>
                          <Trans>FILTERS</Trans>
                          <div className="m-t-10">
                            {selectedViewOpening.filters && selectedViewOpening.filters.languages &&
                            selectedViewOpening.filters.languages.length > 0 &&
                            <div className="m-b-5">
                              <span className={`${styles.fillers}`}>
                                <Trans>LANGUAGES</Trans>:
                              </span>
                              <span className={`${styles.description}`}>
                                {this.iterateMapAndAttachValues(selectedViewOpening.filters.languages)}
                              </span>
                            </div>
                            }
                            {selectedViewOpening.filters && selectedViewOpening.filters.location &&
                            selectedViewOpening.filters.location.length > 0 &&
                            <div className="m-b-5">
                              <span className={`${styles.fillers}`}>
                                <Trans>SOURCING_LOCATIONS</Trans>:
                              </span>
                              <span className={`${styles.description}`}>
                                {this.iterateMapAndAttachValues(selectedViewOpening.filters.location)}
                              </span>
                            </div>
                            }
                            {selectedViewOpening.filters && selectedViewOpening.filters.preferredRadius > 0 ?
                              <div className="m-b-5">
                                <span className={`${styles.fillers}`}>
                                  <Trans>RADIUS</Trans>:
                                </span>
                                <span className={`${styles.description}`}>
                                  {` ${selectedViewOpening.filters.preferredRadius}`}
                                </span>
                              </div> : null
                            }
                            {selectedViewOpening.filters && selectedViewOpening.filters.companies &&
                            <div className="m-b-5">
                              <span className={`${styles.fillers}`}>
                                <Trans>COMPANY</Trans>:
                              </span>
                              <span className={`${styles.description}`}>
                                {` ${selectedViewOpening.filters.companies.name}`
                                || ` ${selectedViewOpening.filters.companies[0].name}`}
                              </span>
                            </div>
                            }
                            {selectedViewOpening.filters && selectedViewOpening.filters.positions &&
                            selectedViewOpening.filters.positions.length > 0 &&
                            <div className="m-b-5">
                              <span className={`${styles.fillers}`}>
                                <Trans>POSITIONS</Trans>:
                              </span>
                              <span className={`${styles.description}`}>
                                {this.iterateMapAndAttachValues(selectedViewOpening.filters.positions)}
                              </span>
                            </div>
                            }
                            {(selectedViewOpening.filters && selectedViewOpening.filters.keywords) &&
                            <div className="m-b-5">
                              <span className={`${styles.fillers}`}>
                                <Trans>KEYWORDS</Trans>:
                              </span>
                              <span className={`${styles.description}`}>
                                {` ${selectedViewOpening.filters.keywords}`}
                              </span>
                            </div>
                            }
                            {selectedViewOpening.filters && selectedViewOpening.filters.source &&
                            selectedViewOpening.filters.source.length > 0 &&
                            <div className="m-b-5">
                              <span className={`${styles.fillers} p-r-5`}>
                                <Trans>SOURCE</Trans>:
                              </span>
                              {selectedViewOpening.filters.source.map((source, i) => (
                                <span className={`${styles.description}`} key={Math.random().toString(36).substring(7)}>
                                  {((selectedViewOpening.filters.source.length - 1) !== i) ?
                                    `${source.value}, ` : source.value
                                  }
                                </span>
                              ))}
                            </div>
                            }
                            {selectedViewOpening.filters && selectedViewOpening.filters.candidateTags &&
                              selectedViewOpening.filters.candidateTags.length > 0 &&
                              <div className="m-b-5">
                                <span className={`${styles.fillers} p-r-5`}>
                                  <Trans>CANDIDATE_TAGS</Trans>:
                                </span>
                                {selectedViewOpening.filters.candidateTags.map((tag, i) => (
                                  <span className={`${styles.description}`} key={tag.id}>
                                    {((selectedViewOpening.filters.candidateTags.length - 1) !== i) ?
                                      `${tag.name}, ` : tag.name
                                    }
                                  </span>
                                ))}
                              </div>
                            }
                            {selectedViewOpening.filters && (selectedViewOpening.filters.isEmail ||
                              selectedViewOpening.filters.isMobile) &&
                              <div className="m-b-5">
                                <span className={`${styles.fillers} p-r-5`}>
                                  <Trans>CONTACTS</Trans>:
                                </span>
                                <span className={`${styles.description}`}>
                                  {selectedViewOpening.filters.isEmail ?
                                    <span className="p-r-5"><Trans>EMAIL</Trans></span> : ''}
                                  {selectedViewOpening.filters.isMobile ?
                                    <span className="p-r-5"><Trans>MOBILE</Trans></span> : ''}
                                </span>
                              </div>
                            }
                            { selectedViewOpening.filters && selectedViewOpening.filters.isFreelance &&
                            <div className="m-b-5">
                              <span className={`${styles.fillers} p-r-5`}>
                                <Trans>JOB_TYPE</Trans>:
                              </span>
                              <span className={`${styles.description}`}><Trans>FREELANCE</Trans></span>
                            </div>
                            }
                            {selectedViewOpening.filters && selectedViewOpening.filters.noticePeriod &&
                              selectedViewOpening.filters.noiticePeriodType &&
                              <div className="m-b-5">
                                <span className={`${styles.fillers} p-r-5`}>
                                  <Trans>NOTICE_PERIOD</Trans>:
                                </span>
                                <span className={`${styles.description}`}>
                                  {`${selectedViewOpening.filters.noticePeriod}
                                ${selectedViewOpening.filter.noticePeriodType}`}
                                </span>
                              </div>
                            }
                          </div>
                        </div>
                      </Col>
                    </Col>
                }
                {selectedViewOpening.company && selectedViewOpening.company.contacts &&
                  selectedViewOpening.company.contacts.length > 0 &&
                  <Col sm={9} xs={12}>
                    <Col sm={9} className={`${styles.border_shade} p-l-15`}>
                      <div className={`${styles.contact_heading} m-t-10 m-b-10`}>
                        <Trans>COMPANY_CONTACTS</Trans>
                      </div>
                      {selectedViewOpening.company.contacts.map(data => (
                        <Col sm={4} className="p-0 p-t-10" key={Math.random().toString(36).substring(7)}>
                          <div className={`${styles.contact_heading}`}>
                            <div className={`${styles.contact_name} m-b-5`}>
                              {data.firstName} {data.lastName ? data.lastName : ''}
                            </div>
                            <div className={`${styles.contact_position} m-b-10`}>{data.jobTitle}</div>
                            <div className={`${styles.contact_number} m-b-10`}>
                              <img
                                src={'../socialIcons/phone-outgoing.svg'}
                                alt="Phone Icon"
                                role="presentation"
                                className="height_15 m-r-5"
                              />
                              {data.contactNumber ? data.contactNumber : <Trans>NOT_AVAILABLE</Trans>}
                            </div>
                            <div className={`${styles.contact_number} p-b-15`}>
                              <img
                                src={'../socialIcons/mail.svg'}
                                alt="Mail Icon"
                                role="presentation"
                                className="height_13 m-r-5"
                              />
                              {data.email ? data.email : <Trans>NOT_AVAILABLE</Trans>}
                            </div>
                          </div>
                        </Col>))
                      }
                    </Col>
                  </Col>
                }
                {selectedViewOpening.contactPerson &&
                  <Col sm={9} xs={12}>
                    <Col sm={9} className={`${styles.border_shade} p-l-15`}>
                      <div className={`${styles.contact_heading} m-t-10 m-b-10`}>
                        <Trans>CONTACT_PERSON</Trans>
                      </div>
                      <Col sm={4} className="p-0" key={selectedViewOpening.contactPerson.phoneNumber}>
                        <div className={`${styles.contact_heading}`}>
                          <div className={`${styles.contact_name} m-b-5`}>
                            {selectedViewOpening.contactPerson.firstName} {selectedViewOpening.contactPerson.lastName ?
                              selectedViewOpening.contactPerson.lastName :
                              ''}
                          </div>
                          <div className={`${styles.contact_number} m-b-5`}>
                            <img
                              src={'../socialIcons/phone-outgoing.svg'}
                              alt="Phone Icon"
                              role="presentation"
                              className="height_15 m-r-5"
                            />
                            {selectedViewOpening.contactPerson.phoneNumber ?
                              selectedViewOpening.contactPerson.phoneNumber :
                              <Trans>NOT_AVAILABLE</Trans>}
                          </div>
                          <div className={`${styles.contact_number} m-b-5`}>
                            <img
                              src={'../socialIcons/mail.svg'}
                              alt="Mail Icon"
                              role="presentation"
                              className="height_13 m-r-5"
                            />
                            <Link
                              to={`mailto:${selectedViewOpening.contactPerson.email ?
                                selectedViewOpening.contactPerson.email : ''}?Subject=''`}
                              target="_top"
                            >
                              {selectedViewOpening.contactPerson.email ?
                                selectedViewOpening.contactPerson.email : <Trans>NOT_AVAILABLE</Trans>}
                            </Link>
                          </div>
                        </div>
                      </Col>
                    </Col>
                  </Col>
                }
              </Tab>
              {isEmailPermitted && !selectedViewOpening.isArchived && <Tab eventKey={2} title={i18n.t('EMAILS')}>
                {
                  this.state.activeKey === 2 &&
                  <EmailActivity
                    jobOpeningId={this.props.jobOpeningId}
                    from={'jobOpening'}
                    contactPerson={selectedViewOpening.contactPerson}
                    jobOpeningEmailsloading={jobOpeningEmailsloading}
                    emails={this.state.emails}
                    noMoreEmails={this.state.noMoreEmails}
                    loadEmails={this.loadJobOpeningEmails}
                    acl={{ operation: 'JOB_OPENING_SEND_EMAIL', model: 'jobOpening' }}
                    showSearchBar
                    autoHeight="210px"
                  />
                }
              </Tab>}
              {isActivities && !selectedViewOpening.isArchived && <Tab eventKey={3} title={i18n.t('ACTIVITIES')}>
                {this.state.activeKey === 3 && <div style={{ padding: '0 20px' }}>
                  <NewPermissible operation={{ operation: 'JOB_OPENING_LOG_ACTIVITY', model: 'jobOpening' }}>
                    <ActivityLogger
                      route={route}
                      router={router}
                      params={logData}
                      actionType="LOG_ACTIVITY"
                      description={logDescription}
                      editLog={this.editLog}
                    />
                  </NewPermissible>
                  <Loader loading={jobOpeningActivityLoading} styles={{ position: 'absolute', top: '30%' }} />
                  <ActivityHistories
                    currrentPage={onInitialLoad ? 0 : null}
                    activities={activities}
                    jobOpeningActivityLoading={jobOpeningActivityLoading}
                    jobOpeningActivityLoaded={jobOpeningActivityLoaded}
                    jobOpeningId={jobOpeningId}
                    totalCount={totalActivityCount}
                    loadActivity={this.loadLogActivityForOpening}
                    activityType="Log"
                    showSearchBar
                  />
                </div>}
              </Tab>
              }
              {isHistoryPermitted && <Tab eventKey={4} title={i18n.t('HISTORY')}>
                {
                  this.state.activeKey === 4 &&
                    <div>
                      <Loader loading={jobOpeningActivityLoading} styles={{ position: 'absolute', top: '30%' }} />
                      <ActivityHistories
                        currrentPage={onInitialLoad ? 0 : null}
                        activities={histories}
                        jobOpeningId={this.props.jobOpeningId}
                        from={'jobOpening'}
                        jobOpeningActivityLoading={jobOpeningActivityLoading}
                        jobOpeningActivityLoaded={jobOpeningActivityLoaded}
                        totalCount={totalHistoryCount}
                        loadActivity={this.loadActivityHistoryForOpening}
                        activityType="ALL"
                        showSearchBar
                      />
                    </div>
                }
              </Tab>
              }
            </Tabs>
          </Col> :
            !loading && this.renderNoResultsFound()
          }
          {
            openModal &&
            <EditOpening
              form="EditOpening"
              enableReinitialize
              initialValues={initialValues}
              isEdit={isEdit}
              validate={formValidation}
              closeModal={this.closeModal}
            />
          }
        </Scrollbars>
        {
          openCloneModal &&
          <CloneViewOpening
            opening={selectedViewOpening}
            closeCloneViewModal={this.closeCloneModal}
          />
        }
        {
          showCreateTag && this.renderCreateTag()
        }
        <Loader loading={loading} />
      </div>
    );
  }
}
