import React, { Component } from 'react';
import { Modal, Col, Row, ButtonGroup, MenuItem,
  DropdownButton, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Board from 'react-trello';
import lodash from 'lodash';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import { Link } from 'react-router';
import { push as pushState } from 'react-router-redux';
import { Trans } from 'react-i18next';
import { reduxForm, getFormValues, change, isPristine, touch } from 'redux-form';
import { Scrollbars } from 'react-custom-scrollbars';
import Select from 'react-select';
import DropdownField from '../../components/FormComponents/DropdownList';
import InputBox from '../../components/FormComponents/InputBox';
import TextArea from '../../components/FormComponents/TextArea';
import DateTimePicker from '../../components/FormComponents/DateTimePicker';
import DatePicker from '../../components/FormComponents/DatePicker';
import Radio from '../../components/FormComponents/Radio';
import atsTransitionRules from '../../utils/transitionRules';
import { getContactedFormConfig, formValidation } from '../../formConfig/ApplicationTracking';
import toastrErrorHandling from '../toastrErrorHandling';
import styles from './ApplicationTracking.scss';
import { loadOpeningById, saveEditedOpening } from '../../redux/modules/openings';
import JobProfilePanel from '../../components/PageComponents/JobProfilePanel';
import OpeningHistory from '../ATSBoard/openingHistory';
import {
  getResumesForOpeningById, updateJobProfile, cancelSendingEmail, toBeSubmittedDH,
  toBeSubmittedSales, notifySubmitted, notifyShortlisted, getCandidateInfo,
  removedSelectedCandidates, getCandidateStatus, searchRejectReasons, getCandidateHiredInfo,
} from '../../redux/modules/ATS';
import { formatTitle, dateDiffInYears } from '../../utils/validation';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

const renderField = inputProps => {
  const {
    name,
    label,
    valueField,
    textField,
    selectedOption,
    onSearch,
    onSelect,
    data,
    placeholder,
  } = inputProps;
  return (
    <div>
      <label htmlFor="companies"><Trans>{label}</Trans>
        <span className="required_color"> *</span>
      </label>
      <Select
        name={name}
        valueKey={valueField}
        labelKey={textField}
        value={selectedOption}
        onChange={onSelect}
        onInputChange={onSearch}
        options={data}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        noResultsText={i18n.t('NO_RESULTS_FOUND')}
      />
    </div>
  );
};

const components = {
  submitted: [TextArea],
  contacted: [DropdownField, DateTimePicker, DropdownField, InputBox, TextArea],
  interested: [TextArea],
  toBeSubmitted: [TextArea],
  shortlisted: [TextArea, TextArea],
  scheduled: [DropdownField, InputBox, InputBox, DropdownField, DateTimePicker, TextArea],
  hired: [Radio, DatePicker, TextArea, TextArea],
  rejected: [renderField, TextArea, TextArea]
};

const onlyCmdLaneNames = [
  'toBeSubmitted',
  'interested',
  'submitted',
  'shortlisted'
];

@reduxForm({
  form: 'StatusDetails',
  validate: formValidation,
  touchOnChange: true
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  user: state.auth.user,
  candidates: state.ats.candidates,
  isStatusFormPristine: isPristine('StatusDetails')(state),
  formData: state.form.StatusDetails,
  selectedOpening: state.openings.selectedOpening,
  resumes: state.ats.resumeList,
  selectedCandidates: state.ats.selectedCandidates,
  loadingResumes: state.ats.loadingResumes,
  candiateInterviewInfo: state.ats.candiateInterviewInfo,
  rejectReasonList: state.ats.rejectReasonList || []
}), { change,
  touch,
  getResumesForOpeningById,
  updateJobProfile,
  loadOpeningById,
  pushState,
  saveEditedOpening,
  cancelSendingEmail,
  toBeSubmittedDH,
  toBeSubmittedSales,
  notifySubmitted,
  notifyShortlisted,
  getCandidateInfo,
  removedSelectedCandidates,
  getCandidateStatus,
  searchRejectReasons,
  getCandidateHiredInfo
})
export default class AppicationTracking extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    values: PropTypes.object,
    resumes: PropTypes.object,
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    isStatusFormPristine: PropTypes.bool,
    change: PropTypes.func.isRequired,
    selectedOpening: PropTypes.object,
    getResumesForOpeningById: PropTypes.func,
    saveEditedOpening: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    cancelSendingEmail: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    updateJobProfile: PropTypes.func,
    loadOpeningById: PropTypes.func,
    pristine: PropTypes.bool,
    candidates: PropTypes.array,
    submitting: PropTypes.bool,
    reset: PropTypes.func,
    invalid: PropTypes.bool,
    user: PropTypes.object,
    handleSubmit: PropTypes.func,
    getCandidateInfo: PropTypes.func,
    toBeSubmittedDH: PropTypes.func.isRequired,
    touch: PropTypes.func.isRequired,
    toBeSubmittedSales: PropTypes.func.isRequired,
    searchRejectReasons: PropTypes.func.isRequired,
    notifyShortlisted: PropTypes.func.isRequired,
    notifySubmitted: PropTypes.func.isRequired,
    formData: PropTypes.object,
    removedSelectedCandidates: PropTypes.func.isRequired,
    selectedCandidates: PropTypes.array,
    getCandidateStatus: PropTypes.func.isRequired,
    loadingResumes: PropTypes.bool,
    candiateInterviewInfo: PropTypes.oneOf(
      PropTypes.array,
      PropTypes.object
    ),
    getCandidateHiredInfo: PropTypes.func
  };

  static defaultProps = {
    values: {},
    formData: {},
    resumes: {},
    pristine: false,
    submitting: false,
    invalid: false,
    isStatusFormPristine: true,
    candidates: [],
    handleSubmit: null,
    user: null,
    selectedOpening: null,
    getResumesForOpeningById: null,
    getCandidateInfo: null,
    updateJobProfile: null,
    loadOpeningById: null,
    reset: null,
    selectedCandidates: [],
    loadingResumes: true,
    candiateInterviewInfo: [],
    getCandidateHiredInfo: null
  };
  constructor(props) {
    super(props);
    this.state = {
      cardId: '',
      sourceLaneId: '',
      targetLaneId: '',
      stagedData: {},
      draggedData: null,
      eventBus: undefined,
      openModal: false,
      formSubmitting: false,
      isOpeningEditPermitted: false,
      transitionRules: atsTransitionRules,
      statuses: [{ eventKey: 1.1, label: 'ACTIVE' }, { eventKey: 1.2, label: 'CLOSED' }],
      openingHistoryModal: false,
      selectedIndex: -1,
      candidates: [],
      isContactedForm: false,
      toBeSubmittedCandidates: [],
      // isEmail: true,
      communicationType: 'email',
      persistInterviewDetails: false,
      showConfigEmailNotification: true,
      isRefreshing: false,
      laneCountDetails: {},
      redirectToEditCandidate: false,
      previousValues: []
    };
  }

  componentWillMount() {
    if (localStorage.getItem('emailFromHistoryInfo')) {
      localStorage.removeItem('emailFromHistoryInfo');
    }
    const candidates = this.props.selectedCandidates.map(candidate => {
      candidate.selected = true;
      return candidate;
    });
    const isDragPermitted = NewPermissible.isPermitted({ operation: 'UPDATE_CANDIDATE_STATUS', model: 'jobProfile' });
    const isOpeningEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT', model: 'jobOpening' });
    this.setState({
      candidates,
      isDragPermitted,
      isOpeningEditPermitted
    });
  }

  componentDidMount() {
    const { route, router } = this.props;
    if (route && router) {
      router.setRouteLeaveHook(route, () => {
        if (!this.props.isStatusFormPristine && !this.state.redirectToEditCandidate) {
          return i18n.t('confirmMessage.UNSAVED_CHANGES');
        }
      });
    }
    const jobId = this.props.location.query.jobId;
    this.props.loadOpeningById(jobId).then(opening => {
      const laneCountDetails = opening.statusCount;
      laneCountDetails.rejected = opening.rejectedCount;
      this.setState({ laneCountDetails });
    });
    this.loadProfiles(jobId);
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.user) {
  //     this.updateEmailConfigurationState(nextProps.user);
  //   }
  // }

  componentWillUnmount() {
    this.props.removedSelectedCandidates();
  }

  onDragEnd = (cardId, sourceLaneId, targetLaneId) => {
    const jobId = this.props.location.query.jobId;
    const candidatesArr = this.state.candidates;
    const { transitionRules, draggedData } = this.state;
    const updatedLane = lodash.find(draggedData.lanes, { id: targetLaneId });
    const candidate = lodash.find(updatedLane.cards, { id: cardId });
    let isContacted = false;
    if (candidate && candidate.isArchived) {
      this.revertCard(cardId, sourceLaneId, targetLaneId);
      return;
    }
    if (sourceLaneId !== targetLaneId) {
      lodash.remove(candidatesArr, profile => profile.id === cardId);
      this.setState({
        candidates: candidatesArr
      });
    }
    this.props.getCandidateStatus({ resumeId: cardId.toString(), jobId: parseInt(jobId, 10) })
      .then(result => {
        const resultStatus = `${result.status.charAt(0).toLowerCase()}${result.status.slice(1)}`;
        if (transitionRules[resultStatus].indexOf(targetLaneId) > -1 ||
          resultStatus === sourceLaneId) {
          if (transitionRules[sourceLaneId].indexOf(targetLaneId) > -1) {
            if (this.props.selectedOpening.status === 'closed') {
              toastrErrorHandling({}, i18n.t('NOTIFICATION'),
                i18n.t('errorMessage.CHANGE_THE_STATUS_AS_ACTIVE_FOR_MOVING_CANDIDATES'));
              this.revertCard(cardId, sourceLaneId, targetLaneId);
              return;
            }
            if (targetLaneId === 'contacted') {
              isContacted = true;
              this.props.initialize({
                user: this.props.user,
                contactMode: { id: 'email', name: 'Email' },
                contactDate: new Date(),
                email: candidate.contacts && candidate.contacts.emails.length > 0 ?
                  candidate.contacts.emails[0] : '',
                phone: candidate.contacts && candidate.contacts.mobileNumbers.length > 0 ?
                  candidate.contacts.mobileNumbers[0] : '',
                linkedin: candidate.linkedin ? candidate.linkedin : '',
                facebook: candidate.facebook ? candidate.facebook : '',
                xing: candidate.xing ? candidate.xing : '',
                twitter: candidate.twitter ? candidate.twitter : '',
                others: '',
              });
            }
            if (targetLaneId === 'rejected') {
              this.props.searchRejectReasons({ reasonType: 'ATS_REJECTION' });
            }
            if (targetLaneId === 'hired') {
              this.props.touch('StatusDetails', 'joiningDate');
            }
            this.setState({
              boardData: draggedData,
              openModal: true,
              selectedRejectReason: null,
              cardId,
              sourceLaneId,
              isContactedForm: isContacted,
              targetLaneId
            });
          } else {
            if (targetLaneId !== sourceLaneId) {
              toastrErrorHandling({}, '', `${i18n.t('errorMessage.YOU_CANNOT_DIRECTLY_MOVE_TO')}
        ${updatedLane.title} ${i18n.t('STAGE')}`);
            }
            this.revertCard(cardId, sourceLaneId, targetLaneId);
          }
        } else {
          const toastrConfirmOptions = {
            onOk: () => this.loadProfiles(jobId),
            onCancel: () => this.loadProfiles(jobId),
            okText: 'Ok, Thanks!',
            cancelText: 'Close',
            buttons: [{
              cancel: true
            }, {
              ok: true
            }]
          };
          toastr.confirm(i18n.t('confirmMessage.SAME_CANDIDATE_MOVED'),
            toastrConfirmOptions);
        }
      });
  }

  setEventBus = handle => {
    this.setState({
      eventBus: handle
    });
  }

  setCandidates = candidates => {
    if (candidates && candidates.length > 0) {
      candidates.forEach(selectedCandidate => {
        const elm = document.getElementById(selectedCandidate.id);
        if (elm && elm.type === 'checkbox') {
          elm.checked = true;
        }
      });
    }
  }

  setCandidate = (event, props) => {
    const { candidates } = this.state;
    const candidatesArr = candidates;
    const selectedCandidate = { id: props.id, email: props.contacts.emails[0], laneId: props.laneId };
    if (candidates.length > 0) {
      if (candidates[0].laneId !== selectedCandidate.laneId) {
        const elm = document.getElementById(props.id);
        if (elm.type === 'checkbox') {
          elm.checked = false;
        }
        toastr.info(i18n.t('infoMessage.INFO'), i18n.t('infoMessage.YOU_CANNOT_SELECT_CANDIDATES_FROM_MULTIPLE_LANES'));
        return;
      }
    }
    /* Email to company feature - maybe used in future */
    // if (props.laneId === 'toBeSubmitted') {
    //   this.addToSubmittedCandidates(selectedCandidate, event.target.checked);
    // } else {
    const index = candidatesArr.findIndex(candidate => candidate.id === selectedCandidate.id);
    if (selectedCandidate.email.length > 0) {
      if (index === -1) {
        candidatesArr.push(selectedCandidate);
      } else {
        candidatesArr.splice(index, 1);
      }
      this.setState({
        candidates: candidatesArr
      });
    } else if (document.getElementById(props.id).checked) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.EMAIL_IS_NOT_AVAILABLE_FOR_THIS_CANDIDATE'));
    }
    // }
  }

  getCandidateDetails = (targetLaneId, draggedData) => {
    const updatedLane = lodash.find(draggedData.lanes, { id: targetLaneId });
    return lodash.find(updatedLane.cards, { id: this.state.cardId });
  }

  searchRejectReasons = value => {
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value)
     && !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      const data = {
        searchTerm: value,
        reasonType: 'ATS_REJECTION'
      };
      this.props.searchRejectReasons(data);
    }
  }
  handleOnSelectReasons = option => {
    this.setState({ selectedRejectReason: option });
    this.props.change('StatusDetails', 'reasonForRejecting', option);
  }

  loadProfiles = jobId => {
    this.props.getResumesForOpeningById(jobId).then(() => {
      this.setState({
        stagedData: {
          lanes: [
            {
              id: 'selected',
              title: i18n.t('SELECTED'),
              cards: this.props.resumes.Selected || []
            },
            {
              id: 'contacted',
              title: i18n.t('CONTACTED'),
              cards: this.props.resumes.Contacted || []
            },
            {
              id: 'interested',
              title: i18n.t('INTERESTED'),
              cards: this.props.resumes.Interested || []
            },
            {
              id: 'toBeSubmitted',
              title: i18n.t('TO_BE_SUBMITTED'),
              cards: this.props.resumes.ToBeSubmitted || []
            },
            {
              id: 'submitted',
              title: i18n.t('SUBMITTED'),
              cards: this.props.resumes.Submitted || []
            },
            {
              id: 'shortlisted',
              title: i18n.t('SHORTLISTED'),
              cards: this.props.resumes.Shortlisted || []
            },
            {
              id: 'scheduled',
              title: i18n.t('INTERVIEW'),
              cards: this.props.resumes.Scheduled || []
            },
            {
              id: 'hired',
              title: i18n.t('HIRED'),
              cards: this.props.resumes.Hired || []
            },
            {
              id: 'rejected',
              title: i18n.t('REJECTED_CLOSED'),
              cards: this.props.resumes.Rejected || []
            },
          ]
        }
      }, () => {
        this.setCandidates(this.props.selectedCandidates);
        this.setState({ draggedData: this.state.stagedData });
      });
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_CANDIDATES_INFO_FOR_ATS_STAGES'), { removeOnHover: true });
      }
    });
  }

  // updateEmailConfigurationState = user => {
  //   if (user.isMailConfigured !== this.state.isMailConfigured) {
  //     this.setState({
  //       isMailConfigured: user.isMailConfigured
  //     });
  //   }
  // }
  /* Email to company feature - maybe used in future */
  // addToSubmittedCandidates(selectedCandidate, isChecked) {
  //   const candidatesArr = this.state.toBeSubmittedCandidates;
  //   const index = candidatesArr.findIndex(candidate => candidate.id === selectedCandidate.id);
  //   if (index === -1 && isChecked === true) {
  //     if (this.state.candidates.length > 0) {
  //       toastr.info('Select candidates from "To Be Submitted" lane only to send email to company');
  //     }
  //     candidatesArr.push(selectedCandidate);
  //   } else {
  //     candidatesArr.splice(index, 1);
  //   }
  //   this.setState({
  //     toBeSubmittedCandidates: candidatesArr
  //   });
  // }

  attachHyphenToWords = string => {
    if (string) {
      return `- ${string}`;
    }
  }

  goToPreviousRoute = () => {
    window.history.go(-1);
  }

  iterateArrayAndAttach = array => {
    let totalString = '';
    if (array && array.length) {
      array.forEach((currentValue, index) => {
        if (currentValue.name) {
          totalString += currentValue.name;
          if (totalString && index !== array.length - 1) {
            totalString = `${totalString}, `;
          }
        }
      });
    }
    if (totalString) {
      return ` ${totalString}`;
    }
  }

  selectAction = (key, evt, jobId) => {
    if (key === '1') {
      this.refreshBoard(jobId);
    } else if (key === '2') {
      this.showOpeningHistoryModal();
    } else {
      this.changeOpeningStatus();
    }
  }

  refreshBoard = jobId => {
    this.setState({
      isRefreshing: true
    }, () => {
      this.props.loadOpeningById(jobId).then(() => {
        this.handleClickForClear();
        this.props.removedSelectedCandidates();
        this.loadProfiles(jobId);
        this.setState({ isRefreshing: false });
      });
    });
  }

  changeOpeningStatus = () => {
    const { selectedOpening } = this.props;
    selectedOpening.status = selectedOpening.status === 'active' ? 'closed' : 'active';
    this.props.saveEditedOpening(selectedOpening).then(() => {
      if (selectedOpening.status === 'active') {
        toastr.success(i18n.t('STATUS_CHANGED'), i18n.t('successMessage.JOB_OPENING_ACTIVE_SUCCESSFULLY'));
      } else {
        if (selectedOpening.salesOwners.length > 0) {
          selectedOpening.salesOwners.forEach(eachUser => {
            localStorage.setItem('removedData',
              JSON.stringify({
                tab: 'jobOpening',
                id: selectedOpening.id,
                userId: eachUser.id
              }));
            localStorage.removeItem('removedData');
          });
        }
        if (selectedOpening.recruiters.length > 0) {
          selectedOpening.recruiters.forEach(eachUser => {
            localStorage.setItem('removedData',
              JSON.stringify({
                tab: 'jobOpening',
                id: selectedOpening.id,
                userId: eachUser.id
              }));
            localStorage.removeItem('removedData');
          });
        }
        toastr.success(i18n.t('STATUS_CHANGED'), i18n.t('successMessage.JOB_OPENING_CLOSED_SUCCESSFULLY'));
      }
    }, error => {
      if (error.error.statusCode === 400) {
        toastrErrorHandling(error.error, i18n.t('ERROR'), error.error.message, { removeOnHover: true });
      }
    });
  }

  attachButtonsToDom = jobId => (
    <div style={{ float: 'right', marginTop: '2px' }}>
      <NewPermissible operation={{ operation: 'SELECT_CANDIDATE', model: 'jobProfile' }}>
        <button
          className={`${styles.add_candidate} btn button-primary disable-event`}
          disabled={!(this.props.selectedOpening.status === 'active')}
          title={!(this.props.selectedOpening.status === 'active') ? 'Job opening is marked as closed' : ''}
          onClick={() => {
            if (this.props.selectedOpening.status === 'active') {
              this.props.pushState({
                pathname: '/ProfileSearch',
                query: { jobId }
              });
            }
          }}
        >
          <Trans>ADD_CANDIDATES</Trans>
        </button>
      </NewPermissible>
      <ButtonGroup className="actions_dropdown_section m-l-10">
        <DropdownButton
          style={{ width: '40px', height: '40px', borderRadius: '2px', border: '1px solid #d7dee8' }}
          noCaret
          onSelect={(key, evt) => { this.selectAction(key, evt, jobId); }}
          title={<div className="action_menu">
            <i className="fa fa-circle" aria-hidden="true" />
            <i className="fa fa-circle" aria-hidden="true" />
            <i className="fa fa-circle" aria-hidden="true" />
          </div>}
          id="basic-nav-dropdown"
        >
          <MenuItem eventKey="1"><Trans>REFRESH_ATS_BOARD</Trans></MenuItem>
          <MenuItem eventKey="2"><Trans>VIEW_LOG_HISTORY</Trans></MenuItem>
          {
            this.state.isOpeningEditPermitted &&
            <MenuItem eventKey="3">{
              this.props.selectedOpening.status === 'active' ?
                <Trans>MARK_OPENING_AS_CLOSED</Trans> : <Trans>MARK_OPENING_AS_ACTIVE</Trans> }
            </MenuItem>
          }
        </DropdownButton>
      </ButtonGroup>
    </div>
  );

  attachBackButton = jobId => (
    <Image
      responsive
      title={i18n.t('tooltipMessage.CLICK_HERE_TO_GO_BACK_TO_OPENINGS')}
      src="./left-arrow.svg"
      alt="back"
      id={jobId}
      style={{ cursor: 'pointer' }}
      onClick={evt => { evt.preventDefault(); this.goToPreviousRoute(); }}
    />
  );

  showOpeningHistoryModal = () => {
    this.setState({
      openingHistoryModal: true
    });
  }

  closeHistoryModal = () => {
    this.setState({
      openingHistoryModal: false
    });
  }

  attachEditOpeningButton = (jobId, jobTitle) => (
    <Link
      to={{ pathname: `/Openings/${jobId}` }}
    >
      <OverlayTrigger
        rootClose
        overlay={this.renderTooltip(jobTitle)}
        placement="top"
      >
        <span
          title={i18n.t('tooltipMessage.CLICK_HERE_TO_VIEW_OPENING')}
          className={`${styles.title_span} p-l-5 p-r-5`}
          id={jobId}
          role="button"
          tabIndex="0"
        >{formatTitle(jobTitle)}</span>
      </OverlayTrigger>
    </Link>
  );

  updateBoard = newData => {
    if (newData && newData.lanes[3] && newData.lanes[3].cards && newData.lanes[3].cards.length > 0) {
      this.setState({ toBeSubmitted: true });
    } else {
      this.setState({ toBeSubmitted: false });
    }
    if (newData && newData.lanes[4] && newData.lanes[4].cards && newData.lanes[4].cards.length > 0) {
      this.setState({ submitted: true });
    } else {
      this.setState({ submitted: false });
    }
    this.setState({
      draggedData: newData
    });
  }

  closeModal = evt => {
    const { cardId, sourceLaneId, targetLaneId } = this.state;
    if (evt) {
      evt.stopPropagation();
      if (!this.props.isStatusFormPristine) {
        const toastrConfirmOptions = {
          onOk: () => this.confirmCloseModal(cardId, sourceLaneId, targetLaneId),
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
      } else {
        this.confirmCloseModal(cardId, sourceLaneId, targetLaneId);
      }
    }
  }

  confirmCloseModal = (cardId, sourceLaneId, targetLaneId) => {
    if (targetLaneId === 'scheduled' || targetLaneId === 'contacted'
      || targetLaneId === 'hired') {
      this.props.initialize({});
      this.setState({
        persistInterviewDetails: false,
        isContactedForm: false
      });
    } else {
      this.props.reset();
    }
    this.setState({
      openModal: false,
      // isEmail: true
      communicationType: 'email'
    });
    this.revertCard(cardId, sourceLaneId, targetLaneId);
  }

  revertCard = (cardId, sourceLaneId, targetLaneId) => {
    this.state.eventBus.publish({
      type: 'MOVE_CARD',
      fromLaneId: targetLaneId,
      toLaneId: sourceLaneId,
      cardId
    });
    this.setState({
      cardId: '',
      sourceLaneId: '',
      targetLaneId: ''
    });
  }

  updateProfile = (payload, sourceLane, targetLaneId, updatedLane) => {
    this.props.updateJobProfile(payload).then(() => {
      if (targetLaneId === 'hired' && payload.details
        && payload.details.hasJoined) {
        const { selectedOpening } = this.props;
        this.setState({
          redirectToEditCandidate: true
        }, () => {
          const yearsOfExperience = dateDiffInYears(new Date(new Date()),
            new Date(payload.details.joiningDate));
          this.props.pushState({
            pathname: `/EditCandidate/${payload.resumeId}`,
            state: {
              from: 'ATS',
              jobId: selectedOpening.id,
              experience: {
                title: '',
                description: '',
                company_name: selectedOpening.company.name,
                company_location: '',
                start_date: moment(payload.details.joiningDate).format('YYYY-MM-DD'),
                end_date: 'present',
                years_of_experience: yearsOfExperience,
                isCurrentlyWorking: true
              }
            }
          });
        });
      }
      this.setState({
        formSubmitting: false
      });
      const { formData } = this.props;
      const { laneCountDetails } = this.state;
      laneCountDetails[sourceLane.id] -= 1;
      if ((targetLaneId === 'rejected' && sourceLane.id === 'submitted') ||
        (targetLaneId === 'rejected' && sourceLane.id === 'shortlisted') ||
        (targetLaneId === 'rejected' && sourceLane.id === 'scheduled') ||
        (targetLaneId === 'rejected' && sourceLane.id === 'hired')
        || targetLaneId !== 'rejected') {
        laneCountDetails[targetLaneId] += 1;
      }
      this.setState(laneCountDetails);
      if (formData && formData.initial && formData.initial.level && formData.initial.status &&
        formData.values.status !== 'Rejected' && (sourceLane.id === targetLaneId)) {
        toastr.success(i18n.t('successMessage.INTERVIEW_UPDATED'),
          i18n.t('successMessage.INTERVIEW_LEVEL_UPDATED_SUCCESSFULLY'));
      } else if (formData && formData.initial && formData.initial.hasJoined
          && (sourceLane.id === targetLaneId)) {
        toastr.success('', i18n.t('successMessage.HIRED_INFO_UPDATED_SUCCESSFULLY'));
      } else {
        toastr.success(i18n.t('successMessage.STATUS_CHANGED'),
          `${i18n.t('successMessage.CANDIDATE_HAS_BEEN_SUCCESSFULLY_MOVED_FROM')}
          ${sourceLane.title} ${i18n.t('TO')} ${updatedLane.title}`);
      }
      this.setState({
        openModal: false,
        communicationType: 'email'
        // isEmail: true
      });
      if (targetLaneId === 'scheduled' || targetLaneId === 'contacted'
        || targetLaneId === 'hired') {
        this.props.initialize({});
        this.setState({
          persistInterviewDetails: false
        });
      } else {
        this.props.reset();
      }
    }, err => {
      this.setState({
        formSubmitting: false
      });
      toastrErrorHandling(err.error, i18n.t('errorMessage.STATUS_UPDATION_FAILED'),
        i18n.t('errorMessage.CANDIDATE_STATUS_COULD_NOT_BE_UPDATED'));
    });
  }

  updateProfileStatus = () => {
    const { cardId, sourceLaneId, targetLaneId, draggedData } = this.state;
    const deviceDetail = JSON.parse(localStorage.getItem('deviceDetails'));
    if (cardId && sourceLaneId && targetLaneId) {
      this.setState({
        formSubmitting: true
      });
      const sourceLane = lodash.find(draggedData.lanes, { id: sourceLaneId });
      const updatedLane = lodash.find(draggedData.lanes, { id: targetLaneId });
      const candidate = this.getCandidateDetails(targetLaneId, draggedData);
      const { values, user } = this.props;
      let payload;
      // let prevData;
      // this.state.stagedData.lanes.map(resumeData => {
      //   resumeData.cards.map(card => {
      //     if (resumeData.id === sourceLaneId) {
      //       prevData = {
      //         jobId: this.props.location.query.jobId,
      //         status: card.status,
      //         resumeId: card.id,
      //         candidateName: card.name
      //       };
      //       this.setState({
      //         previousValues: prevData
      //       });
      //     }
      //   });
      // });
      if (targetLaneId === 'scheduled' && values.status === 'Rejected') {
        // prevData.details = {
        //   userId: values.user ? values.user.id : user.id,
        //   reasonForRejecting: values.levelName ? `${values.levelName} rejected` : 'level - 1 rejected',
        //   ...values
        // };
        const toastrConfirmOptions = {
          onOk: () => {
            payload = {
              jobId: this.props.location.query.jobId,
              status: 'Rejected',
              resumeId: cardId,
              candidateName: candidate.name,
              resumeProfileId: candidate.resumeProfileId,
              deviceDetails: deviceDetail,
              details: {
                userId: values.user ? values.user.id : user.id,
                reasonForRejecting: values.levelName ? `${values.levelName} rejected` : 'level - 1 rejected',
                ...values
              }
            };
            this.state.eventBus.publish({
              type: 'MOVE_CARD',
              fromLaneId: targetLaneId,
              toLaneId: 'rejected',
              cardId
            });
            this.updateProfile(payload, { title: 'Interview', id: 'scheduled' }, 'rejected', { title: 'Rejected' });
          },
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.REJECTED_STATE_MOVED_WARING'), toastrConfirmOptions);
      } else {
        // prevData.details = {
        //   userId: values.user ? values.user.id : user.id,
        //   ...values,
        //   joiningDate: values.joiningDate ? moment(values.joiningDate).format('YYYY-MM-DD') : null,
        //   hasJoined: (values.hasJoined && values.hasJoined === 'Yes') || false
        // };
        payload = {
          jobId: this.props.location.query.jobId,
          status: `${targetLaneId.charAt(0).toUpperCase()}${targetLaneId.slice(1)}`,
          resumeId: cardId,
          candidateName: candidate.name,
          resumeProfileId: candidate.resumeProfileId,
          deviceDetails: deviceDetail,
          details: {
            userId: values.user ? values.user.id : user.id,
            ...values,
            joiningDate: values.joiningDate ? moment(values.joiningDate).format('YYYY-MM-DD') : null,
            hasJoined: (values.hasJoined && values.hasJoined === 'Yes') || false
          }
        };
        this.updateProfile(payload, sourceLane, targetLaneId, updatedLane);
      }
    }
  }

  emailCandidates = attachJobDescription => {
    const candidates = this.state.candidates;
    const { selectedOpening, user } = this.props;
    // const userEmails = candidates.filter(candidate => candidate.isSelected);
    if (user.isMailConfigured) {
      this.props.pushState({
        pathname: '/Emailer',
        state: {
          from: 'ATS',
          candidates,
          jobId: selectedOpening.id,
          attachJobDescription
        }
      });
    } else {
      localStorage.setItem('emailFromHistoryInfo',
        JSON.stringify({ from: 'ATS', jobId: selectedOpening.id, candidates }));
      this.props.pushState({
        pathname: '/EmailConfig',
        state: {
          candidates,
          jobId: selectedOpening.id,
          attachJobDescription
        }
      });
    }
  }

  attachEmailCandidateButton = laneId => (
    <div className="d-i-f p-l-10 p-r-10" style={{ marginTop: '2px' }}>
      { laneId === 'selected' ? <button
        className="m-r-10 btn button-primary b-r-2 disable-event m-h-40"
        onClick={() => { this.emailCandidates(true); }}
      >
        <Trans>EMAIL_CANDIDATES_WITH_JD</Trans>
      </button> : ''}
      <button
        className="m-r-10 btn button-primary b-r-2 disable-event m-h-40"
        onClick={() => { this.emailCandidates(false); }}
      >
        <Trans>EMAIL_CANDIDATES</Trans>
      </button>
    </div>
  );

  attachCancelButton = () => (
    <div className="d-i-f p-r-10" style={{ marginTop: '2px' }}>
      <button
        className="btn button-secondary-hover b-r-2 m-h-40"
        onClick={evt => { this.handleClickForClear(evt); }}
      >
        <Trans>CANCEL</Trans>
      </button>
    </div>
  );

  attachRefreshButton = jobId => (
    <Link
      className={`${styles.undoIcon}`}
      onClick={() => {
        this.setState({
          isRefreshing: true
        }, () => {
          this.props.loadOpeningById(jobId).then(() => {
            this.handleClickForClear();
            this.props.removedSelectedCandidates();
            this.loadProfiles(jobId);
            this.setState({ isRefreshing: false });
          });
        });
      }}
    >
      <i
        title={i18n.t('tooltipMessage.CLICK_HERE_TO_REFRESH')}
        className={`fa fa-refresh ${styles.historyIcon}`}
        id={jobId}
        role="button"
        tabIndex="0"
      />
    </Link>
  );

  handleClickForClear = () => {
    this.setState({
      candidates: []
    });
    this.clearCheckboxes();
  }

  clearCheckboxes = () => {
    const checkedCards = document.getElementsByName('profile_checkbox');
    for (let i = 0; i < checkedCards.length; i += 1) {
      if (checkedCards[i].type === 'checkbox') {
        checkedCards[i].checked = false;
      }
    }
  }

  showCheckbox = () => {
    this.setState({ showCheckbox: true });
  }

  hideCheckbox = () => {
    this.setState({ showCheckbox: false });
  }

  ProfileCard = props => (
    <div
      className={`${styles.profile_card} ${props.isArchived ? styles.archived_profile : null}`}
      onMouseEnter={this.showCheckbox}
      onMouseLeave={this.hideCheckbox}
    >
      <div className={styles.profile_info}>
        <div
          className={`${styles.name} ${styles.ellipsis} p-b-5`}
          title={props.name}
        >
          {/* { TO_DO } */}
          {/* {
            !showCheckbox &&
            <div>
              <span className={`${styles.profileNameLogo}`}>
                {profileNameArr[0] ? profileNameArr[0].charAt(0).toUpperCase() : ''}
                {profileNameArr[1] ? profileNameArr[1].charAt(0).toUpperCase() : ''}
              </span>
            </div>
          } */}
          {
            (props.contacts.emails.length > 0) &&
            <div className={`round ${styles.checkbox_circle}`} style={{ width: '40px' }}>
              <input
                type="checkbox"
                // style={{ width: '15px', height: '15px' }}
                onChange={e => {
                  this.setCandidate(e, props);
                }
                }
                id={props.id}
                name="profile_checkbox"
              />
              <label title={i18n.t('SEND_EMAIL')} htmlFor={props.id} />
            </div>
          }
          {/* {
            props.email.length > 0 &&
              <div className={`${styles.candidate_checkbox} round`}>
                <input
                  type="checkbox"
                  // style={{ width: '15px', height: '15px' }}
                  onChange={e => {
                    this.setCandidate(e, props);
                  }
                  }
                  id={props.id}
                  name="profile_checkbox"
                />
                <label title={i18n.t('SEND_EMAIL')} htmlFor={props.id} />
              </div>
          } */}
          <div className={styles.name_exp}>
            <Link
              to={{ pathname: `/ProfileSearch/${props.id}`,
                query: { jobId: this.props.location.query.jobId, isAtsBoard: true } }}
              // target="_blank"
              style={props.laneId === 'scheduled' ? { maxWidth: '130px' } : { maxWidth: '150px' }}
            > {props.name}
            </Link>
            <span
              className={`${styles.years_exp} p-l-5 p-r-5`}
              style={props.laneId === 'scheduled' ? { } : { }}
            >
                ({`${Math.round(props.totalYearsOfExperience)} yrs`})</span>
            {
              props.laneId === 'scheduled' ?
                <Image
                  src="/level-up.svg"
                  title={i18n.t('tooltipMessage.UPDATE_LEVEL')}
                  responsive
                  className={styles.update_icon}
                  onClick={evt => { evt.preventDefault(); this.openInterviewDetailsModal(props); }}
                />
                : null
            }
            <div
              className={`${styles.title} ${styles.ellipsis} ${styles.company_name}`}
              title={props.currentExperience && props.currentExperience.position ?
                props.currentExperience.position : ''}
              style={props.currentExperience && !props.currentExperience.position ? { visibility: 'hidden' } : { }}
            >
              {props.currentExperience &&
                props.currentExperience.position ? props.currentExperience.position : 'Not Available'}
            </div>
          </div>
        </div>
        <div
          className={`${styles.company_name} ${styles.ellipsis}`}
          title={props.currentExperience && props.currentExperience.companyName ?
            props.currentExperience.companyName : ''}
          style={props.currentExperience && !props.currentExperience.companyName ? { visibility: 'hidden' } : { }}
        >
          {props.currentExperience &&
            props.currentExperience.companyName ? props.currentExperience.companyName : 'Not Available'}
        </div>
        <div
          className={`${styles.location} ${styles.ellipsis} p-b-5`}
          title={props.address.city}
          style={!props.address.city ? { visibility: 'hidden' } : { }}
        >{props.address.city ? props.address.city : 'Not Available'}</div>
      </div>
      <div className={styles.addedby_info}>
        <span className={styles.addedBy_name}>
          Added by {props.user.firstName}
        </span>
        <span className={styles.communication_icons}>
          <OverlayTrigger
            rootClose
            overlay={this.renderTooltip(props.contacts.mobileNumbers.join(';'))}
            placement="bottom"
          >
            <span>
              {/* <i
                className={`${profile.phone && profile.phone !== '' ? '' : styles.notfound} fa fa-phone`}
                // title={profile.phone && profile.phone !== '' ? 'Available' : 'Not Available'}
                aria-hidden="true"
              /> */}
              <img
                src={'./socialIcons/phone-outgoing.svg'}
                alt="Phone Icon"
                role="presentation"
                className={`${props.contacts.mobileNumbers.length === 0 &&
                  props.contacts.alternateNumbers.length === 0 ? styles.notfound : ''}`}
              />
            </span>
          </OverlayTrigger>
          <OverlayTrigger
            rootClose
            overlay={this.renderTooltip(props.contacts.emails.join(';'))}
            placement="bottom"
          >
            <span>
              <img
                src={'./socialIcons/mail.svg'}
                alt="Mail Icon"
                // onClick={
                //   props.email && props.email !== '' ?
                //     () => this.sendEmail(profile.profileId, props.email) :
                //     () => {}
                // }
                role="presentation"
                className={`${props.contacts.emails.length === 0 ? styles.notfound : ''}`}
              />
            </span>
          </OverlayTrigger>
          {
            props.laneId === 'hired' && props.hasJoined &&
              <span className={`${styles.joining_status} ${styles.joined}`}>
                Joined
              </span>
          }
          {
            props.laneId === 'hired' && !props.hasJoined &&
              <span
                className={`${styles.joining_status} ${styles.not_joined}`}
                onClick={evt => { evt.preventDefault(); this.openHiredDetailsModal(props); }}
                role="presentation"
              >
                Not Joined
              </span>
          }
        </span>
      </div>
    </div>
  );

    notifyToBeSubmitted = () => {
      // const { user } = this.props;
      const { draggedData } = this.state;
      // const roles = user.roles;
      const jobId = this.props.selectedOpening.id;
      const toBeSubmitted = draggedData.lanes[3].cards;

      if (toBeSubmitted.length === 0) {
        toastrErrorHandling({}, '', i18n.t('errorMessage.NO_CANDIDATES_TO_NOTIFY'));
        return;
      }

      this.props.toBeSubmittedDH({ jobId }).then(() => {
        toastr.success(i18n.t('successMessage.NOTIFICATION_SENT'));
      }, err => {
        toastrErrorHandling(err.error, i18n.t('errorMessage.SORRY'),
          i18n.t('errorMessage.NOTIFICATION_CANNOT_BE_SENT_NOW')
        );
      });
    };

    checkIsDH = roles => roles.name === 'Delivery Head';

    checkIsRecruiter = roles => roles.name === 'Recruiter';

    notifyShortlisted = () => {
      const { draggedData } = this.state;
      const jobId = this.props.selectedOpening.id;
      const shortlisted = draggedData.lanes[5].cards;

      if (shortlisted.length === 0) {
        toastrErrorHandling({}, '', i18n.t('errorMessage.NO_CANDIDATES_TO_NOTIFY'));
        return;
      }

      this.props.notifyShortlisted({ jobId }).then(() => {
        toastr.success(i18n.t('successMessage.NOTIFICATION_SENT'));
      }, err => {
        toastrErrorHandling(err.error,
          i18n.t('errorMessage.SORRY'), i18n.t('errorMessage.NOTIFICATION_CANNOT_BE_SENT_NOW'));
      });
    };

    notifySubmitted = () => {
      const { draggedData } = this.state;
      const jobId = this.props.selectedOpening.id;
      const submitted = draggedData.lanes[4].cards;

      if (submitted.length === 0) {
        toastrErrorHandling({}, '', i18n.t('errorMessage.NO_CANDIDATES_TO_NOTIFY'));
        return;
      }

      this.props.notifySubmitted({ jobId }).then(() => {
        toastr.success(i18n.t('successMessage.NOTIFICATION_SENT'));
      }, err => {
        toastrErrorHandling(err.error,
          i18n.t('errorMessage.SORRY'), i18n.t('errorMessage.NOTIFICATION_CANNOT_BE_SENT_NOW')
        );
      });
    };

    returnCandidateCountText = cardsLength => {
      if (cardsLength === 1) {
        return '1 candidate';
      }
      return `${cardsLength} candidates`;
    }

    CustomLaneHeader = props =>
      (
        <div>
          <header className={styles.ats_title_header}>
            <div className={styles.ats_title}>
              <div>{props.title}</div>
              <div className={styles.candidate_count}>
                {props.cards && props.cards.length > 0 && this.returnCandidateCountText(props.cards.length)}
              </div>
            </div>
            {props.id === 'toBeSubmitted' &&
              <a
                role="presentation"
                title={i18n.t('tooltipMessage.SEND_NOTIFICATION_TO_DELIVERY_HEAD_AND_SALES')}
                onClick={this.notifyToBeSubmitted}
              >
                <Trans>NOTIFY</Trans>
              </a>
            }
            {props.id === 'submitted' &&
              <a
                role="presentation"
                title={i18n.t('tooltipMessage.SEND_NOTIFICATION_TO_DELIVERY_HEAD_AND_RECRUITERS')}
                onClick={this.notifySubmitted}
              >
                <Trans>NOTIFY</Trans>
              </a>
            }
            {props.id === 'shortlisted' &&
              <a
                role="presentation"
                title={i18n.t('tooltipMessage.SEND_NOTIFICATION_TO_DELIVERY_HEAD_AND_RECRUITERS')}
                onClick={this.notifyShortlisted}
              >
                <Trans>NOTIFY</Trans>
              </a>
            }
          </header>
        </div>
      );
  openInterviewDetailsModal = props => {
    this.props.getCandidateInfo(this.props.selectedOpening.id, props.id).then(interviewInfo => {
      const lastIndex = interviewInfo.length - 1;
      this.props.initialize({
        comments: interviewInfo[lastIndex].comments,
        level: interviewInfo[lastIndex].level,
        levelName: interviewInfo[lastIndex].levelName,
        status: interviewInfo[lastIndex].status,
        interviewDate: interviewInfo[lastIndex].interviewDate,
        interviewer: interviewInfo[lastIndex].interviewer
      });
      this.setState({
        openModal: true,
        persistInterviewDetails: true,
        targetLaneId: props.laneId,
        sourceLaneId: props.laneId,
        cardId: props.id
      });
    });
  }

  openHiredDetailsModal = props => {
    const { selectedOpening } = this.props;
    this.props.getCandidateHiredInfo(selectedOpening.id, props.id).then(hiredInfo => {
      if (hiredInfo.length > 0 && hiredInfo[0].id) {
        this.props.initialize({
          comments: hiredInfo[0].comments,
          hasJoined: hiredInfo[0].hasJoined ? 'Yes' : 'No',
          paymentTerms: hiredInfo[0].paymentTerms,
          joiningDate: hiredInfo[0].joiningDate
        });
      } else {
        this.props.initialize({});
      }
      this.setState({
        openModal: true,
        targetLaneId: props.laneId,
        sourceLaneId: props.laneId,
        cardId: props.id
      }, () => {
        this.props.touch('StatusDetails', 'joiningDate');
      });
    });
  }

  handleOnCommunicationTypeChange = selectedType => {
    const type = selectedType.id;
    this.setState({
      // isEmail: true
      communicationType: type
    });
    if (this.props.values[type] === undefined) {
      this.props.values[type] = null;
      if (this.props.formData.initial && this.props.formData.initial[type]) {
        this.props.change('StatusDetails', type, this.props.formData.initial[type]);
      } else {
        this.props.change('StatusDetails', type, '');
      }
    }
  }

  handleOnLevelChange = level => {
    const { candiateInterviewInfo } = this.props;
    const levels = ['Level 1', 'Level 2', 'Level 3'];
    const candidateLevels = lodash.map(candiateInterviewInfo, 'level');
    const index = candidateLevels.indexOf(level);
    if (this.state.persistInterviewDetails && candiateInterviewInfo &&
      lodash.intersection(candidateLevels, levels).length > 0 && index > -1) {
      this.props.initialize({
        comments: candiateInterviewInfo[index].comments,
        level: candiateInterviewInfo[index].level,
        levelName: candiateInterviewInfo[index].levelName,
        status: candiateInterviewInfo[index].status,
        interviewDate: candiateInterviewInfo[index].interviewDate,
        interviewer: candiateInterviewInfo[index].interviewer
      });
    } else {
      this.props.initialize({
        level,
        status: 'In progress'
      });
    }
  }

  closeCofigEmailNotification = () => {
    this.setState({ showConfigEmailNotification: false });
  }

  loader = () => {
    if (this.props.loadingResumes) {
      return (<div
        className="loading_overlay"
        ref={node => {
          if (node) {
            node.style.setProperty('background-color', '#d7dee8', 'important');
          }
        }}
      >
        <div className="loader-circle">
          <i className="fa fa-circle-o-notch fa-spin" />
        </div>
      </div>);
    }
  };

  renderTooltip = msg => {
    const showTitle = msg.split(';');
    return (
      <Tooltip id={'tooltip'} >
        {showTitle[0] ?
          showTitle.map(title => (
            <strong>
              <div key={title} className={styles.tooltip}>
                {formatTitle(title)}
              </div>
            </strong>
          )
          )
          :
          <strong>
            <Trans>NOT_AVAILABLE</Trans>
          </strong>
        }
      </Tooltip>
    );
  }

  renderMobileAndEmail = emailsOrPhoneNumbers => {
    const emailsOrPhoneNumbersArr = emailsOrPhoneNumbers.split(';');
    const fixedText = emailsOrPhoneNumbersArr.length > 1 ? `and ${emailsOrPhoneNumbersArr.length - 1} more` : '';
    return `${emailsOrPhoneNumbersArr[0]} ${fixedText}`;
  }

  renderSubmitButton = targetLaneId => {
    if (targetLaneId === 'toBeSubmitted') {
      return <span><Trans>MOVE_TO</Trans> <Trans>TO_BE_SUBMITTED</Trans></span>;
    } else if (targetLaneId === 'scheduled') {
      const { formData } = this.props;
      if (formData && formData.initial && formData.initial.level && targetLaneId === this.state.sourceLaneId) {
        return <span><Trans>UPDATE</Trans> <Trans>INTERVIEW_DETAILS</Trans></span>;
      }
      return <span><Trans>MOVE_TO</Trans> <Trans>INTERVIEW</Trans></span>;
    } else if (targetLaneId === 'hired') {
      const { formData } = this.props;
      if (formData && formData.initial && targetLaneId === this.state.sourceLaneId) {
        return <span><Trans>UPDATE</Trans> <Trans>HIRED_DETAILS</Trans></span>;
      }
      return <span><Trans>MOVE_TO</Trans> <Trans>HIRED</Trans></span>;
    }
    return <span><Trans>MOVE_TO</Trans> <Trans>{targetLaneId.toUpperCase()}</Trans></span>;
  }

  render() {
    const filterConfig = getContactedFormConfig(this);
    const jobId = this.props.location.query.jobId;
    const { candidates, openingHistoryModal, stagedData, openModal, laneCountDetails,
      targetLaneId, isContactedForm, draggedData, showConfigEmailNotification, isRefreshing,
      isDragPermitted, formSubmitting } = this.state;
    const { handleSubmit, invalid, pristine, selectedOpening, user } = this.props;
    const candidate = draggedData && targetLaneId ? this.getCandidateDetails(targetLaneId, draggedData) : '';
    return (
      <Row className="m-0">
        <Col md={12} className="p-0">
          {
            !user.isMailConfigured && showConfigEmailNotification &&
            <div className={styles.configur_email}>
              <Trans>YOU_HAVE_NOT_CONFIGURED_YOUR_MAIL</Trans>
              <Link to="/EmailConfig" className="p-l-5">
                <Trans>CLICK_HERE_TO_CONFIGURE</Trans>
              </Link>
              <i
                role="button"
                tabIndex={0}
                className={`fa fa-times-circle ${styles.configur_email_cls_btn}`}
                onClick={this.closeCofigEmailNotification}
              />
            </div>
          }
          {
            selectedOpening && candidates.length > 0 &&
            <JobProfilePanel
              jobId={selectedOpening.id}
              jobTitle={selectedOpening.jobTitle}
              numberOfVacancies={selectedOpening.vacancies}
              type={selectedOpening.type}
              location={this.iterateArrayAndAttach(selectedOpening.openinglocations)}
              activeStatus={selectedOpening.status}
              attachBackButton={this.attachBackButton(jobId)}
              attachEmailCandidateButton={this.attachEmailCandidateButton(candidates[0].laneId)}
              attachCancelButton={this.attachCancelButton()}
              attachEditOpeningButton={this.attachEditOpeningButton(jobId, selectedOpening.jobTitle)}
              statusCount={laneCountDetails}
            />
          }
          {
            ((selectedOpening && candidates.length === 0) || (isRefreshing && selectedOpening)) &&
            <JobProfilePanel
              jobId={selectedOpening.id}
              jobTitle={selectedOpening.jobTitle}
              numberOfVacancies={selectedOpening.vacancies}
              type={selectedOpening.type}
              location={this.iterateArrayAndAttach(selectedOpening.openinglocations)}
              activeStatus={selectedOpening.status}
              attachBackButton={this.attachBackButton(jobId)}
              attachButtonsToDom={this.attachButtonsToDom(jobId)}
              attachEditOpeningButton={this.attachEditOpeningButton(jobId, selectedOpening.jobTitle)}
              statusCount={laneCountDetails}
            />
          }
          {
            openingHistoryModal ?
              <OpeningHistory
                showOpeningHistoryModal={openingHistoryModal}
                hideOpeningHistoryModal={this.closeHistoryModal}
                jobId={jobId}
              /> : ''
          }
        </Col>
        <Col md={12} className={`${styles.atsSection} p-0`}>
          <Helmet title={i18n.t('ATS_BOARD')} />
          {
            stagedData && Object.keys(stagedData).length > 0 ?
              [<Board
                data={stagedData}
                draggable={isDragPermitted}
                customCardLayout
                handleDragEnd={this.onDragEnd}
                onDataChange={this.updateBoard}
                eventBusHandle={this.setEventBus}
                customLaneHeader={<this.CustomLaneHeader />}
              >
                <this.ProfileCard />
              </Board>, this.loader()]
              : null
          }
          <Modal
            show={openModal}
            onHide={this.closeModal}
            className={styles.ats_modal}
          >
            <form onSubmit={handleSubmit(this.updateProfileStatus)}>
              <Modal.Header className={`${styles.modal_header_color}`}>
                <Modal.Title className={styles.modal_header}>
                  <Row className={styles.modal_title}>
                    <span> { candidate && candidate.name && candidate.totalExperience ?
                      `${candidate.name} (${Math.round(candidate.totalExperience)} ${i18n.t('YEARS_LOWERCASE')})`
                      : 'Status Update'}
                    </span>
                    <span
                      className={`${styles.close_btn} right`}
                      onClick={this.closeModal}
                      role="button"
                      tabIndex="0"
                    >
                      <i className="fa fa-close" />
                    </span>
                  </Row>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className={
                (targetLaneId === 'interested' || targetLaneId === 'toBeSubmitted' || targetLaneId === 'submitted') ?
                  styles.modal_height : ''}
              >
                <Scrollbars
                  universal
                  renderThumbHorizontal={props => <div {...props} className="hide" />}
                  renderView={props => <div {...props} className="customScroll atsBoard" />}
                  className={styles.ats_modal_scroll}
                  ref={c => { this.scrollbar = c; }}
                >
                  { targetLaneId &&
                      components[targetLaneId].map((FieldComponent, index) => (
                        <Col
                          lg={filterConfig[targetLaneId][index].sectionWidths[0]}
                          sm={filterConfig[targetLaneId][index].sectionWidths[1]}
                          xs={filterConfig[targetLaneId][index].sectionWidths[2]}
                          className={(targetLaneId === 'scheduled' || targetLaneId === 'contacted')
                            ? 'm-t-10 m-b-20' : 'm-t-10'}
                        >
                          <FieldComponent {...filterConfig[targetLaneId][index]} />
                        </Col>
                      ))
                  }
                </Scrollbars>
              </Modal.Body>
              <Modal.Footer>
                <Col lg={12} md={12} sm={12} xs={12} className={`p-0 p-t-15 p-b-15 ${styles.ats_btn_section}`}>
                  <button
                    className="btn button-primary"
                    type="submit"
                    disabled={
                      onlyCmdLaneNames.indexOf(this.state.targetLaneId) > -1 || isContactedForm ?
                        (invalid || formSubmitting) :
                        (pristine || invalid || formSubmitting)
                    }
                  > {this.renderSubmitButton(targetLaneId)}
                  </button>
                </Col>
              </Modal.Footer>
            </form>
          </Modal>
        </Col>
      </Row>
    );
  }
}
