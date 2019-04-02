import React, { Component } from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
// import pdfMake from 'pdfmake/build/pdfmake.js';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
import CircularProgressbar from 'react-circular-progressbar';
import { Row, Col, Tab, Tabs, ButtonGroup, MenuItem,
  DropdownButton, Modal } from 'react-bootstrap';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import { Trans } from 'react-i18next';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, hashHistory } from 'react-router';
import lodash from 'lodash';
import { change, getFormValues, reduxForm } from 'redux-form';
import { EmailActivity } from 'components';

import Loader from '../../components/Loader';
import { loadProfileById as loadProfile, fetchProfileJob } from '../../redux/modules/profile-search';
import FileDropper from '../../components/FileDropper/FileDropper';
import { loadActivities } from '../../redux/modules/profile-activity';
import JobProfilePanel from '../../components/PageComponents/JobProfilePanel';
import ArchiveDeleteModal from '../../components/ArchiveDeleteModal/ArchiveDeleteModal';
import { loadArchivalReasons, checkIfArchivable, archiveCandidate, unArchiveCandidate,
  getArchiveCandidateData, extendArchiveCandidate, loadDeleteReasons, initiateDeleteCandidate }
  from '../../redux/modules/profile-search/managecandidates';
import { createCandidateTags } from '../../redux/modules/resume-parser';
import styles from './ProfileSearch.scss';
// import parsePDFContent from './ExportPDFNew';
import DownloadForm from './DownloadForm';
import {
  loadOpeningById,
  saveEditedOpening,
  loadOpenings,
  saveJobProfile,
  removeCandidateFromJobProfile
} from '../../redux/modules/openings';
import { uploadCandidateFile, fetchCandidateFiles, deleteFile } from '../../redux/modules/files';
import FileView from '../../components/FileDropper/FileView';
import socialIcons from '../../utils/utils';
import toastrErrorHandling from '../toastrErrorHandling';
import { loadCandidateEmails } from '../../redux/modules/emails';
import Constants from '../../helpers/Constants';
import { formatDomainName, formatTitle, trimTrailingSpace } from '../../utils/validation';
import SearchBar from '../../components/FormComponents/SearchBar';
import profileStyle from './SuperProfile.scss';
import CandidateOpening from '../../components/CandidateOpening/CandidateOpening';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import CandidateTagsEdit from './CandidateTagsEdit';

let timeoutId;

function getSearchString(keywords) {
  return keywords.replace(/,/g, '|').toLowerCase();
}

function highlightTextNodes(element, regex) {
  const tempinnerHTML = element.innerHTML;
  element.innerHTML =
    tempinnerHTML.replace(regex, '>$1<span class="highlighted" style="margin-left:0 !important">$2</span>$3<');
}

/* function isOper(oper) {
  const op = oper.toLowerCase();
  return (op === 'and') || (op === 'or') || (op === 'not') || (op === 'in') || (op === '(') || (op === ')');
}

 function getKeywords(keywords, sortKeys) {
  if (keywords) {
    const splitExp = /(\(|\)|[^\S()]+)/i;
    let keys = [].concat(...keywords.split('"').map((v, i) => i % 2 ? v : v.split(splitExp)));

    keys = keys.filter(entry => entry.trim() !== '');

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (!isOper(key)) {
        sortKeys.push(key);
      }
    }
  }
  return sortKeys;
} */

function highlightOnLoad(elementId, filterObj) {
  let keyList = [];
  if (filterObj) {
    keyList = filterObj.skills;
    // keyList = filterObj.keywords ? getKeywords(filterObj.keywords, keyList) : keyList;
    if (keyList.length > 0) {
      const searchString = getSearchString(keyList.join());
      const textContainerNode = document.getElementById(elementId);
      const searchTerms = searchString.split('|');
      Object.keys(searchTerms).forEach((key, index) => {
        const regex = new RegExp(`>([^<]*)?(${searchTerms[index]})([^>]*)?<`, 'ig');
        highlightTextNodes(textContainerNode, regex);
      });
    }
  }
}
@reduxForm({
  form: 'searchActivity'
})
@connect(
  (state, route) => ({
    values: getFormValues('EditCandidateTags')(state),
    resumeId: route.params.id,
    profile: state.profileSearch.resume,
    profileActivityLoading: state.profileActivity.profileActivityLoading,
    activityList: state.profileActivity.activityList || {},
    selectedOpening: state.openings.selectedOpening || {},
    openings: state.openings.list || [],
    candidateEmailsLoading: state.emails.candidateEmailsLoading,
    candidateEmails: state.emails.candidateEmails || [],
    files: state.files.files,
    fetching: state.files.fetching,
    user: state.auth.user,
    openingList: state.profileSearch.openingList,
    openingLoading: state.profileSearch.openingLoading,
    archivalReasons: state.managecandidates.archivalReasons,
    deleteReasons: state.managecandidates.deleteReasons,
    archiveCandidateData: state.managecandidates.archiveCandidateData,
    loadArchivalCandidateData: state.managecandidates.loadArchivalCandidateData,
    initiatingDelete: state.managecandidates.initiatingDelete
  }),
  {
    loadProfile,
    saveJobProfile,
    loadOpeningById,
    removeCandidateFromJobProfile,
    saveEditedOpening,
    loadOpenings,
    loadActivities,
    loadCandidateEmails,
    uploadCandidateFile,
    fetchCandidateFiles,
    deleteFile,
    pushState,
    fetchProfileJob,
    loadArchivalReasons,
    checkIfArchivable,
    archiveCandidate,
    unArchiveCandidate,
    getArchiveCandidateData,
    extendArchiveCandidate,
    loadDeleteReasons,
    initiateDeleteCandidate,
    createCandidateTags,
    change
  })
export default class ViewProfile extends Component {
  static propTypes = {
    profile: PropTypes.any,
    resumeId: PropTypes.oneOf(PropTypes.number, PropTypes.string),
    loadProfile: PropTypes.func.isRequired,
    loadOpeningById: PropTypes.func.isRequired,
    profileActivityLoading: PropTypes.bool,
    selectedOpening: PropTypes.object.isRequired,
    activityList: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]).isRequired,
    saveJobProfile: PropTypes.func.isRequired,
    candidateEmailsLoading: PropTypes.bool,
    removeCandidateFromJobProfile: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    loadOpenings: PropTypes.func.isRequired,
    loadActivities: PropTypes.func.isRequired,
    openings: PropTypes.array.isRequired,
    loadCandidateEmails: PropTypes.func.isRequired,
    candidateEmails: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]).isRequired,
    updating: PropTypes.bool,
    fetchCandidateFiles: PropTypes.func.isRequired,
    deleteFile: PropTypes.func,
    fetching: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.array
    ]),
    uploadCandidateFile: PropTypes.func.isRequired,
    loadDeleteReasons: PropTypes.func.isRequired,
    initiateDeleteCandidate: PropTypes.func.isRequired,
    files: PropTypes.arrayOf(PropTypes.object),
    uploading: PropTypes.bool,
    user: PropTypes.object,
    pushState: PropTypes.func.isRequired,
    fetchProfileJob: PropTypes.func.isRequired,
    openingLoading: PropTypes.bool,
    openingList: PropTypes.array,
    loadArchivalReasons: PropTypes.func.isRequired,
    checkIfArchivable: PropTypes.func.isRequired,
    archiveCandidate: PropTypes.func.isRequired,
    unArchiveCandidate: PropTypes.func.isRequired,
    archivalReasons: PropTypes.array.isRequired,
    deleteReasons: PropTypes.array.isRequired,
    getArchiveCandidateData: PropTypes.func.isRequired,
    loadArchivalCandidateData: PropTypes.bool.isRequired,
    archiveCandidateData: PropTypes.object.isRequired,
    extendArchiveCandidate: PropTypes.func.isRequired,
    initiatingDelete: PropTypes.bool.isRequired,
    createCandidateTags: PropTypes.func.isRequired,
    values: PropTypes.objectOf(PropTypes.any),
    change: PropTypes.func.isRequired
  };

  static defaultProps = {
    profile: null,
    resumeId: null,
    profileActivityLoading: false,
    candidateEmailsLoading: false,
    selectedOpening: {},
    activityList: {},
    deleteFile: null,
    updating: false,
    files: [],
    uploading: false,
    fetching: false,
    user: {},
    openingLoading: false,
    openingList: [],
    values: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      cvFileId: null,
      cvFileType: null,
      cvFileName: null,
      openings: this.props.openings || [],
      showProfileDropDown: false,
      headerLogoBase64: '',
      footerLogoBase64: '',
      profilePicBase64: '',
      openSlider: false,
      opendownloadOption: false,
      fileId: '',
      fileName: '',
      isContact: true,
      isLanguage: true,
      isFormat: true,
      emails: {},
      searchTerm: '',
      activityList: {},
      noMoreEmails: false,
      isNewTab: false,
      isActivityPermitted: false,
      noMoreOpening: false,
      openingList: [],
      totalCount: 0,
      isFilesPermitted: false,
      isEmailsPermitted: false,
      isArchiveModal: true,
      isOpenArchiveDeleteModal: false,
      archiveModalSubmitted: false,
      isEditCandidatePermitted: false,
      isDeleteCandidatePermitted: false,
      isArchiveCandidatePermitted: false,
      isUnarchiveCandidatePermitted: false,
      isExtendArchiveCandidate: false,
      loading: false,
      isTagsEditable: false,
      showCreateTag: false
    };
  }


  componentWillMount() {
    let jobId;
    const { location } = this.props;
    if (location.query && location.query.isAtsBoard) {
      jobId = location.query.jobId;
    } else {
      const decodedObject = this.getDecodedValues();
      jobId = decodedObject.jobId;
    }
    if (jobId) {
      this.props.loadOpeningById(jobId);
    }
    if (location.query.isAtsBoard && location.query.jobId === undefined) {
      this.setState({
        isNewTab: true
      });
    }
    if (location && location.state && location.state.activeKey) {
      this.handleSelect(location.state.activeKey);
    }
    this.loadCandidateProfile();
    this.authToken = localStorage ? localStorage.getItem('authToken') : null;
    const isActivityPermitted = NewPermissible.isPermitted({
      operation: 'VIEW_CANDIDATE_ACTIVITIES',
      model: 'activity'
    });
    const isFilesPermitted = NewPermissible.isPermitted({ operation: 'VIEW_DOCUMENT', model: 'document' });
    const isEmailsPermitted = NewPermissible.isPermitted({ operation: 'CANDIDATE_EMAIL', model: 'ProspectMails' });
    const isJobOpeningsPermitted = NewPermissible.isPermitted({
      operation: 'VIEW_CANDIDATE_JOB_OPENINGS',
      model: 'jobProfile'
    });
    const isEditCandidatePermitted = NewPermissible.isPermitted({
      operation: 'UPDATE_CANDIDATE', model: 'resume' });
    const isArchiveCandidatePermitted = NewPermissible.isPermitted({
      operation: 'ARCHIVE_CANDIDATE', model: 'resume' });
    const isUnarchiveCandidatePermitted = NewPermissible.isPermitted({
      operation: 'UNARCHIVE_CANDIDATE', model: 'resume' });
    const isDeleteCandidatePermitted = NewPermissible.isPermitted({
      operation: 'DELETE', model: 'resume' });
    this.setState({
      isActivityPermitted,
      isFilesPermitted,
      isEmailsPermitted,
      isJobOpeningsPermitted,
      isEditCandidatePermitted,
      isArchiveCandidatePermitted,
      isUnarchiveCandidatePermitted,
      isDeleteCandidatePermitted
    });
    const currentTab = sessionStorage.getItem('profileTabKey');
    if (currentTab) {
      this.handleSelect(Number(currentTab));
      sessionStorage.removeItem('profileTabKey');
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  getDecodedValues = () => {
    // eslint-disable-next-line no-eval
    const decodedUrl = eval(this.props.location.query);
    const decodedObject = JSON.parse(Object.values(decodedUrl).join(''));
    return {
      jobId: decodedObject.jobId,
      originalScore: decodedObject.originalScore ? decodedObject.originalScore.toString() : '',
      targetCompany: decodedObject.target_company,
      profileId: decodedObject.profileId,
    };
  }

  getRecentActivityList = activityList => {
    const recentActivityList = [];
    if (activityList) {
      Object.keys(activityList).map(jobOpeningId => {
        if (jobOpeningId !== '0') {
          activityList[jobOpeningId].map((activity, i) => {
            let currentRow = {};
            currentRow.details = [];
            currentRow.userName = activity.userName;
            currentRow.status = (activity.newStatus === 'Scheduled') ?
              'Interviewed' : activity.newStatus;
            currentRow.icon = this.getActivityListIcon(currentRow.status);
            if (i === 0) {
              currentRow.jobOpeningName = activity.jobOpeningName;
              currentRow.jobOpeningId = activity.jobOpeningId;
            }
            currentRow.createdAt = activity.createdAt;
            currentRow = this.setRecentActivityDetail(activity, currentRow);
            recentActivityList.push(currentRow);
            if (i === activityList[jobOpeningId].length - 1 && this.state.searchTerm === '') {
              const staticRow = {};
              staticRow.userName = activity.userName;
              // staticRow.jobOpeningId = activity.jobOpeningId;
              staticRow.status = 'Selected';
              staticRow.icon = this.getActivityListIcon(staticRow.status);
              recentActivityList.push(staticRow);
            }
            return null;
          });
        }
        return null;
      });
    }
    return recentActivityList;
  }

  setRecentActivityDetail = (activity, targetRow) => {
    if (activity.details) {
      activity.details.map(activityDetail => {
        const newDetail = {};
        newDetail.comment = activityDetail.comments;
        if (targetRow.status === 'Contacted') {
          if (activityDetail.recruiter && activityDetail.recruiter.firstName && activityDetail.recruiter.lastName) {
            newDetail.contactedBy = `${activityDetail.recruiter.firstName} ${activityDetail.recruiter.lastName}`;
          } else if (activityDetail.recruiter && activityDetail.recruiter.firstName
            && !activityDetail.recruiter.lastName) {
            newDetail.contactedBy = `${activityDetail.recruiter.firstName}`;
          } else if (activityDetail.recruiter && !activityDetail.recruiter.firstName
            && activityDetail.recruiter.lastName) {
            newDetail.contactedBy = `${activityDetail.recruiter.lastName}`;
          }
          newDetail.contactMode = activityDetail.contactMode;
          newDetail.contactDetails = activityDetail.contactDetails;
          // newDetail.phone = activityDetail.phone;
          // newDetail.email = activityDetail.email;
          newDetail.contactedDate = activityDetail.contactedDate;
        }
        if (targetRow.status === 'Shortlisted') {
          newDetail.commentsByClient = activityDetail.commentsByClient;
        }
        if (targetRow.status === 'Interviewed' || lodash.includes(targetRow.status, 'Interview')) {
          const levelName = activityDetail.levelName ? ` - ${activityDetail.levelName}` : '';
          newDetail.level = activityDetail.level + levelName;
          newDetail.interviewer = activityDetail.interviewer;
          newDetail.interviewDate = activityDetail.interviewDate;
          newDetail.status = activityDetail.status;
        }
        if (targetRow.status === 'Hired') {
          newDetail.joiningDate = activityDetail.joiningDate;
          newDetail.paymentTerms = activityDetail.paymentTerms;
        }
        if (targetRow.status === 'Rejected') {
          newDetail.reasonByClient = activityDetail.reasonByClient;
          if (activity.reason) {
            newDetail.reasonForRejecting = activity.reason;
          }
        }
        targetRow.details.push(newDetail);
        return null;
      });
    }
    return targetRow;
  }

  getActivityListIcon = status => {
    let icon = '';
    switch (status) {
      case 'Selected':
        icon = 'fa fa-check';
        break;
      case 'Contacted':
        icon = 'fa fa-volume-control-phone';
        break;
      case 'Shortlisted':
        icon = 'fa fa-list';
        break;
      case 'Interviewed':
        icon = 'fa fa-calendar-check-o';
        break;
      case 'Hired':
        icon = 'fa fa-check-square-o';
        break;
      case 'Rejected':
        icon = 'fa fa-user-times';
        break;
      default:
        icon = 'fa fa-check';
    }
    return icon;
  }

  setSocialMetricsSkills = skills => {
    if (skills.indexOf(',') > -1) {
      return lodash.uniq(skills.split(','));
    } else if (skills.indexOf(';') > -1) {
      return lodash.uniq(skills.split(';'));
    }
  }

  getArchiveDetails = (resumeId, isArchive) => {
    this.props.loadArchivalReasons({
      reasonType: 'CANDIDATE_ARCHIVAL',
    });
    this.props.getArchiveCandidateData(resumeId).then(() => {
      this.setState({ isExtendArchiveCandidate: true });
      this.toggleArchiveValue(isArchive);
    }, () => {
      toastr.info('', i18n.t('GET_ARCHIVE_SCHEDULE_ERROR'));
    });
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
          this.setState({ searchActivtyLoading: true }, () => {
            setTimeout(() => {
              this.loadActivitiesBySearch();
            }, 1000);
          });
        }, 1000);
      });
    }
  }

  resetSearch = () => {
    this.setState({ searchTerm: '', searchActivtyLoading: true }, () => {
      setTimeout(() => {
        this.loadActivitiesBySearch();
      }, 1000);
    });
  }

  loadActivitiesBySearch = () => {
    const { searchTerm } = this.state;
    const activites = {};
    const cloned = { ...this.props.activityList };
    Object.keys(cloned).map((key, index) => {
      const filtered = cloned[key].filter(object =>
        JSON.stringify(object).toLowerCase().includes(searchTerm.toLowerCase()));
      activites[index] = filtered;
      return null;
    });
    this.setState({ activityList: activites, searchActivtyLoading: false });
  }

  toggleDropdown = key => {
    let showState = true;
    if (key === 2) {
      showState = false;
    }
    this.setState({
      showProfileDropDown: showState
    });
  }

  attachHyphenToWords = string => {
    if (string) {
      return ` - ${string} `;
    }
  }

  iterateArrayAndAttach = array => {
    let totalString = '';
    array.forEach((currentValue, index) => {
      if (currentValue.name) {
        totalString += currentValue.name;
        if (totalString && index !== array.length - 1) {
          totalString = `${totalString}, `;
        }
      }
    });
    if (totalString) {
      return ` ${totalString}`;
    }
  }

  calculateExp = totalExp => {
    const totalDays = totalExp * 365;
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays - (years * 365)) / 30);
    const result = `${years ? `${years === 1 ? `${years}yr` : `${years}yrs`}` : ''}
    ${months ? `${months === 1 ? `${months}mo` : `${months}mos`}` : ''}`;
    if (years === 0 && months === 0) {
      return '';
    }
    return result;
  }

  handleBrowseClick = () => {
    document.getElementById('browse').click();
  }

  loadCandidateProfile = () => {
    let originalScore;
    let targetCompany;
    let profileId;
    if (this.props.location.query && !this.props.location.query.isAtsBoard) {
      const decodedObject = this.getDecodedValues();
      originalScore = decodedObject.originalScore;
      targetCompany = decodedObject.targetCompany;
      profileId = decodedObject.profileId;
    }
    this.props.loadProfile({ resumeId: this.props.resumeId,
      originalScore,
      targetCompany,
      profileId,
      needJobIds: false }).then(() => {
      // this.getResumeCV();
      if (this.props.profile) {
        highlightOnLoad(`${this.props.resumeId}-pane-1`, this.props.location.state);
      }
    }, error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_PROFILE'), { removeOnHover: true });
    });
  }

  loadActivities = () => {
    this.props.loadActivities(this.props.resumeId).then(response => {
      this.setState({ activityList: response });
    });
  }

  checkIfProfileIsSelected = (profile, selectedOpening) => {
    const { resumeIds } = selectedOpening;
    if (resumeIds && resumeIds.length) {
      if (profile && profile.id) {
        const profileId = profile.id;
        if (resumeIds.indexOf(profileId.toString()) !== -1) {
          return true;
        }
      }
      return false;
    }
  }

  saveJobProfile = (resumeId, resumeProfileId) => {
    const { selectedOpening } = this.props;
    const data = {
      jobId: selectedOpening.id,
      jobTitle: selectedOpening.jobTitle,
      resumeId,
      resumeProfileId,
      status: 'Selected'
    };
    this.props.saveJobProfile(data).then(() => {
      toastr.success(i18n.t('successMessage.SUCCESSFULLY_ADDED'),
        i18n.t('successMessage.CANDIDATE_HAS_BEEN_SUCCESSFULLY_ADDED_TO_THE_JOB_OPENING'));
    }, err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_SELECT_CANDIDATE_FOR_JOB_OPENING'));
    });
  }

  removeCandidateFromJobProfile = resumeId => {
    const { selectedOpening } = this.props;
    this.props.removeCandidateFromJobProfile(selectedOpening.id, resumeId).then(() => {
      toastr.success(i18n.t('successMessage.REMOVED_FROM_OPENING'),
        i18n.t('successMessage.THE_CANDIDATE_HAS_BEEN_SUCCESSFULLY_REMOVED_FROM_THIS_OPENING'),
        toastr.removeByType('error'));
    }, err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_REMOVE_CANDIDATE_FROM_JOB_OPENING'));
      toastr.removeByType('success');
    });
  }

  loadCandidateEmails = (filter, onScroll) => {
    filter.candidateId = this.props.resumeId;
    this.props.loadCandidateEmails(filter).then(emailList => {
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
          i18n.t('errorMessage.COULD_NOT_EMAIL_LIST_FOR_THE_CANDIDATE'));
      }
    }).catch(err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_EMAIL_LIST_FOR_THE_CANDIDATE'));
    });
  }

  attachButtonsToDom = (isSelected, profile, selectedOpening) => (
    <div>
      <button
        className={`btn btn-border right ${styles.shortlist_button}
      ${isSelected ? styles.selected : styles.not_selected}`}
        title={isSelected ? i18n.t('tooltipMessage.CANDIDATE_HAS_BEEN_SELECTED_FOR_THIS_JOB') :
          i18n.t('tooltipMessage.CANDIDATE_IS_AVAILABLE_FOR_SELECTION')}
        onClick={() => { this.handleSelectionButtonClick(isSelected, profile, selectedOpening); }}
        tabIndex="-1"
      >
        <i className={isSelected ? 'fa fa-check-circle' : 'fa fa-plus-circle'} />
        {isSelected ? i18n.t('SELECTED') : i18n.t('SELECT')}
      </button>
    </div>
  );

  handleSelectionButtonClick = (isSelected, profile, selectedOpening) => {
    if (selectedOpening.status !== 'active') {
      toastrErrorHandling({}, i18n.t('NOTIFICATION'),
        i18n.t('errorMessage.CHANGE_THE_STATUS_AS_ACTIVE_FOR_ADDING_MORE_PROFILES'));
    } else if (!isSelected) {
      this.saveJobProfile(profile.id, profile.elasticId);
    } else {
      this.removeCandidateFromJobProfile(profile.id);
    }
  }

  attachEditOpeningButton = (jobId, jobTitle) => (
    <Link
      className={`${styles.undoIcon}`}
      to={{ pathname: `/Openings/${jobId}` }}
    >
      <span
        title={i18n.t('tooltipMessage.CLICK_HERE_TO_VIEW_OPENING')}
        className="p-l-5 p-r-5"
        id={jobId}
        role="button"
        tabIndex="0"
      >{formatTitle(jobTitle)}</span>
    </Link>
  );

  isLanguagesEmpty = languages => {
    if (!languages) {
      return true;
    }
    const knownLanguages = languages.filter(languageObject => languageObject.name !== '');
    return knownLanguages.length === 0;
  };

  toDataURL = url => fetch(url, {
    mode: 'no-cors'
  }).then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));

  fetchBase64FromUrl = url => {
    const host = window.location.hostname;
    const port = window.location.port;
    return new Promise(resolve => {
      this.toDataURL(`http://${host}:${port}/${url}`)
        .then(dataUrl => {
          resolve(dataUrl);
        });
    });
  }

  convertHeaderLogoToBase64 = () => {
    this.fetchBase64FromUrl('javaji.png')
      .then(dataUrl => {
        this.setState({
          headerLogoBase64: dataUrl
        });
      });
  };
  convertFooterLogoToBase64 = () => {
    this.fetchBase64FromUrl('gradient.png')
      .then(dataUrl => {
        this.setState({
          footerLogoBase64: dataUrl
        });
      });
  };
  convertProfileLogoToBase64 = () => {
    this.fetchBase64FromUrl('default_male.png')
      .then(dataUrl => {
        this.setState({
          profilePicBase64: dataUrl
        });
      });
  };

  initializeConvertToBase64 = () => {
    this.convertHeaderLogoToBase64();
    this.convertFooterLogoToBase64();
    this.convertProfileLogoToBase64();
  }

  printResume = value => {
    const { resumeId } = this.props;
    value.contact = value.contact === 'yes';
    const url =
    `${Constants.profileDownLoad.url}/${resumeId}?options=${JSON.stringify(value)}&access_token=${this.authToken}`;
    window.open(url);
    // fetch(url, {
    //   mode: 'no-cors'
    // }).then(response => console.log(response));
    // this.props.pushState(`http://localhost:3000/api/v
    // 1/documents/pdf/${value.id}?data=${value.contact}&access_token=1KT82dbwhxKQL4huq1z6GBM94BO36as9NhiJeFuDb4WB5h
    // u0Ur293WIgHjVVAnoR`);
    // this.setState({
    //   isPdfWithContact: value === 'contact'
    // }, () => {
    //   pdfMake.vfs = pdfFonts.pdfMake.vfs;
    //   const docDefinition = parsePDFContent(this.props.profile[0]._source, this.state);
    //   const downloadFileName = this.state.isPdfWithContact ? this.props.profile[0]._source.name :
    //     this.props.profile[0]._source.id;
    //   pdfMake.createPdf(docDefinition).download(downloadFileName);
    // });
    // this.props.printPdf(value);
  }

  OpenFileSlider = file => {
    this.setState({
      openSlider: true,
      fileId: file.id,
      fileName: file.originalFilename
    });
  }

  closeSlider = () => {
    this.setState({
      openSlider: false
    });
  }

  uploadFile = file => {
    const data = {
      id: this.props.profile.id,
      file
    };
    this.props.uploadCandidateFile(data).then(() => {
      this.fetchFiles();
      toastr.success(i18n.t('successMessage.SAVED'), i18n.t('successMessage.FILE_HAS_BEEN_UPLOADED_SUCCESSFULLY'));
    },
    error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.FILE_UPLOAD_ERROR'), error.error.message);
    });
  }

  deleteFiles = id => {
    this.props.deleteFile(id)
      .then(() => {
        this.fetchFiles();
        toastr.success(i18n.t('successMessage.DELETED'), i18n.t('successMessage.FILE_HAS_BEEN_DELETED_SUCCESSFULLY'));
      },
      error => {
        toastrErrorHandling(error.error, i18n.t('errorMessage.FILE_DELETE_ERROR'), error.error.message);
      });
  }

  formatDate = date => {
    const startDate = date.split('to')[0];
    const endDate = date.split('to')[1];
    let startDateStr = startDate == null ? '' :
      moment(startDate, 'YYYY-MM-DD').format('DD-MMM-YYYY');
    if (startDateStr === 'Invalid date') {
      startDateStr = startDate;
    }
    let endDateStr = endDate == null ? '' :
      moment(endDate, 'YYYY-MM-DD').format('DD-MMM-YYYY');
    if (endDateStr === 'Invalid date') {
      endDateStr = endDate;
    }
    return (startDateStr && endDateStr) ?
      `${startDateStr} ${i18n.t('TO')} ${endDateStr}` :
      `${startDateStr} ${endDateStr}`;
  }

  fetchFiles = () => {
    this.props.fetchCandidateFiles(this.props.profile.id).then(() => {},
      error => {
        toastrErrorHandling(error.error, i18n.t('errorMessage.FILE_UPLOAD_ERROR'),
          i18n.t('errorMessage.ERROR_OCCURRED_WHILE_UPLOADING_FILE'));
      });
  }

  fetchJobOpenings = (filter, onScroll) => {
    filter.resumeId = this.props.resumeId;
    this.props.fetchProfileJob(filter).then(jobOpeningList => {
      const { response, totalCount } = jobOpeningList;
      let openingList = [];
      if (onScroll) {
        openingList = [...this.state.openingList, ...response];
      } else {
        openingList = [...response];
      }
      this.setState({
        openingList,
        totalCount,
        noMoreOpening: response.length === 0
      });
    },
    error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.JOB_OPENING_ERROR'),
        i18n.t('errorMessage.ERROR_OCCURRED_WHILE_FETCHING_JOB_OPENINGS'));
    });
  }

  handleSelect = key => {
    this.setState({ activeKey: key, activityList: {}, searchTerm: '' });
    switch (key) {
      case 1:
        this.loadCandidateProfile();
        break;
      case 2:
        this.loadActivities();
        break;
      case 3:
        this.fetchFiles();
        break;
      case 4:
        break;
      case 5:
        break;
      default:
        break;
    }
  }

  opendownloadOption = () => {
    this.setState({
      opendownloadOption: !this.state.opendownloadOption
    });
    const ele = document.getElementById(this.props.profile.id);
    const ele1 = document.getElementById('social_metrics');
    ele.addEventListener('click', this.handleOutsideClick, false);
    ele1.addEventListener('click', this.handleOutsideClick, false);
  }

  handleOutsideClick = () => {
    this.setState({
      opendownloadOption: false
    });
    const ele = document.getElementById(this.props.profile.id);
    const ele1 = document.getElementById('social_metrics');
    ele.removeEventListener('click', this.handleOutsideClick, false);
    ele1.removeEventListener('click', this.handleOutsideClick, false);
  }

  closedownloadOption = value => {
    this.setState({
      opendownloadOption: false
    });
    this.printResume(value);
  }

  openEditModal = (e, id) => (
    this.props.pushState(`/EditCandidate/${id}`)
  );

  goToPreviousPage = () => {
    hashHistory.goBack();
  }

  routeToSuperProfile = () => {
    const { location } = this.props;
    let decodedObject = {};
    if (location.query && !location.query.isAtsBoard) {
      decodedObject = this.getDecodedValues();
    }
    let { profileId } = decodedObject;
    profileId = profileId || this.props.resumeId;
    let { query } = this.props.location;
    query = query || { isAtsBoard: true };
    if (query && profileId) {
      this.props.pushState({ pathname: `/SuperProfileSearch/${profileId}`, query });
    }
  }

  gotoOpeningPage = jobOpeningId => {
    sessionStorage.setItem('profileTabKey', 2);
    this.props.pushState({
      pathname: `/Openings/${jobOpeningId}`,
      query: { tab: 'activity' }
    });
  }

  selectAction = (key, evt, resumeId) => {
    if (key === '1') {
      this.openEditModal(event, resumeId);
    } else if (key === '2' || key === '3') {
      let isArchive = true;
      if (key === '2') {
        if (evt.target.innerText === i18n.t('ARCHIVE')) {
          this.initiateArchive(resumeId, isArchive);
        } else if (evt.target.innerText === i18n.t('ARCHIVE_SCHEDULED')) {
          this.getArchiveDetails(resumeId, isArchive);
        } else {
          const toastrConfirmOptions = {
            onOk: () => {
              this.setState({ loading: true }, () => {
                this.props.unArchiveCandidate(resumeId).then(res => {
                  toastr.success('', res);
                  this.props.profile.isArchived = false;
                  this.setState({ loading: false });
                });
              });
            },
            okText: i18n.t('YES'),
            cancelText: i18n.t('NO')
          };
          toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_UNARCHIVE'), toastrConfirmOptions);
        }
      } else {
        this.props.loadDeleteReasons({ loadDeleteReasons: PropTypes.func.isRequired,
          initiateDeleteCandidate: PropTypes.func.isRequired,
          reasonType: 'CANDIDATE_DELETION',
        });
        isArchive = false;
        this.toggleArchiveValue(isArchive);
      }
    }
  }

  initiateArchive = (resumeId, isArchive) => {
    this.props.checkIfArchivable(resumeId).then(res => {
      if (res.isArchivable) {
        this.props.loadArchivalReasons({
          reasonType: 'CANDIDATE_ARCHIVAL',
        });
        this.toggleArchiveValue(isArchive);
      } else {
        this.setState({
          activeKey: 5
        });
        toastr.info('', i18n.t('CANDIDATE_IS_CURRENTLY_ASSOCIATED_TO_JOB_OPENINGS'));
      }
    });
  }

  toggleArchiveValue = isArchive => {
    this.setState({
      isArchiveModal: isArchive
    }, () => {
      this.toggleArchiveDeleteModal();
    });
  }

  toggleArchiveDeleteModal = () => {
    this.setState({
      isOpenArchiveDeleteModal: !this.state.isOpenArchiveDeleteModal
    });
  }

  toggleArchiveModalSubmmited = () => {
    this.setState({
      archiveModalSubmitted: !this.state.archiveModalSubmitted
    });
  }

  handleArchiveOrDeleteSubmit = values => {
    if (this.state.isArchiveModal) {
      this.toggleArchiveModalSubmmited();
      values.archivalDate = moment(values.archivalDate).format('YYYY-MM-DD');
      values.notificationDate = moment(values.notificationDate).format('YYYY-MM-DD');
      const deviceDetails = JSON.parse(localStorage.getItem('deviceDetails'));
      values.deviceDetails = deviceDetails;
      // call the archive api
      // after success callback close the modal
      if (this.state.isExtendArchiveCandidate) {
        const currentDate = moment(new Date()).format('YYYY-MM-DD');
        values.isInstant = currentDate === values.archivalDate;
        this.props.extendArchiveCandidate(this.props.resumeId, values).then(() => {
          toastr.success(i18n.t('SUCCESS'),
            i18n.t('successMessage.CANDIDATE_ARCHIVE_UPDATED'));
          this.toggleArchiveDeleteModal();
          this.props.pushState({
            pathname: '/ProfileSearch'
          });
        }, () => {
          this.toggleArchiveModalSubmmited();
          toastr.error(i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_UPDATE_CANDIDATE_ARCHIVE'));
        });
      } else {
        const currentDate = moment(new Date()).format('YYYY-MM-DD');
        values.isInstant = currentDate === values.archivalDate;
        this.props.archiveCandidate(this.props.resumeId, values).then(() => {
          this.props.profile.isArchived = values.archivalDate === moment(new Date()).format('YYYY-MM-DD');
          if (values.isInstant) {
            toastr.success(i18n.t('SUCCESS'),
              i18n.t('successMessage.CANDIDATE_ARCHIVED_SUCCESS'));
          } else {
            toastr.success(i18n.t('SUCCESS'),
              i18n.t('successMessage.CANDIDATE_ARCHIVED_SHEDULED_SUCCESS'));
          }
          this.toggleArchiveDeleteModal();
          this.props.pushState({
            pathname: '/ProfileSearch'
          });
        }, () => {
          this.toggleArchiveModalSubmmited();
          toastr.error(i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_ARCHIVE_CANDIDATE'));
        });
      }
    } else {
      this.props.initiateDeleteCandidate(this.props.resumeId, values).then(() => {
        toastr.success(i18n.t('SUCCESS'),
          i18n.t('successMessage.CANDIDATE_DELETE_INITIATED_SUCCESS'));
        this.toggleArchiveDeleteModal();
        this.props.pushState({
          pathname: '/ProfileSearch'
        });
      }, () => {
        toastr.error(i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_INITIATED_DELETE_CANDIDATE'));
      });
    }
  }

  initialData = () => {
    const { archiveCandidateData, profile } = this.props;
    if (this.state.isArchiveModal) {
      if (profile.isArchiveScheduled) {
        return {
          reason: archiveCandidateData.reason,
          notificationDate: archiveCandidateData.notifyDate,
          archivalDate: archiveCandidateData.scheduledFor,
          description: archiveCandidateData.metadata.description
        };
      }
      return {
        archivalDate: moment().format('YYYY-MM-DD')
      };
    }
    return {
      scheduledDate: moment().format('YYYY-MM-DD')
    };
  }

  toggleTagsEdit = () => {
    this.setState(prevState => ({
      isTagsEditable: !prevState.isTagsEditable
    }));
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

  saveTag = () => {
    const { tag } = this.state;
    const { values } = this.props;
    this.setState({ isTagSubmitted: true });
    values.tags = values.tags ? values.tags : [];
    this.props.createCandidateTags(tag).then(res => {
      this.setState({
        tag: {
          name: '',
          description: null
        },
        showCreateTag: false,
        isTagSubmitted: true,
        canGetTags: true
      });
      this.props.change('EditCandidateTags', 'tags', [...values.tags, res]);
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

  renderExperiences = experiences => {
    const listOfExperiences = [];
    experiences.map(experience => {
      if (experience.companyCity ||
       experience.companyName || experience.position) {
        listOfExperiences.push(
          (
            <TimelineEvent
              key={Math.random().toString(36).substring(8)}
              icon={<i className="fa fa-briefcase" />}
              iconStyle={{
                background: '#fff',
                border: '1px solid #ebf0f6',
                borderRadius: '10%',
                width: '30px',
                height: '25px',
                fontSize: '14px',
                marginLeft: '4px',
                top: '-5px'
              }
              }
              iconColor="#5E6C84"
              title={<div>
                {
                  <span className={`right ${styles.mdCompanyExp}`}>
                    {
                      (experience.startDateAsStr || experience.endDateAsStr) ?
                        `${experience.startDateAsStr} — ${experience.endDateAsStr}` : ''
                    }
                  </span>
                }
                <span className={styles.mdCompanyExp}>
                  {this.calculateExp(experience.yearsOfExperience)}
                </span>
              </div>}
              titleStyle={{
                fontSize: '12px',
                fontStyle: 'italic',
                color: '#676a6c',
                fontWeight: '400'
              }}
              contentStyle={{ backgroundColor: '#ebf0f6', padding: '.3em' }}
            >
              <Col lg={12} className={styles.experiance_details}>
                <Col lg={12} className={`${styles.experiance_desc}`}>
                  <div className={styles.company_title}>
                    {experience.position}
                  </div>
                  <span className={styles.company_name} style={{ paddingRight: '5px' }}>
                    {experience.companyName}
                  </span>
                  <span className={styles.company_location}>
                    {experience.companyCity}
                  </span>

                </Col>
              </Col>
            </TimelineEvent>
          )
        );
      }
      return null;
    });
    if (listOfExperiences.length === 0) {
      return <div className={styles.no_details}>No experience details found</div>;
    }
    return listOfExperiences;
  }

  renderEducations = educations => {
    const listOfEducations = [];
    educations.map(education => {
      if (education.schoolName || education.schoolLocation || education.degree) {
        listOfEducations.push(
          <Col key={Math.random().toString(36).substring(8)} lg={12} className={styles.education_details}>
            <Col lg={12} className={`${styles.education_desc} p-0`}>
              <div className={styles.company_title}>
                {education.degree}
              </div>
              <span className={styles.company_name} style={{ paddingRight: '5px' }}>
                {education.schoolName}
              </span>
              <span className={styles.company_location}>
                {education.schoolLocation}<br />
              </span>
              <div className={styles.experiance_timeline}>
                {education.startDate || education.endDate ?
                  `${education.startDate} - ${education.endDate}` : ''
                }
              </div>
            </Col>
          </Col>);
      }
      return null;
    });
    if (listOfEducations.length === 0) {
      return <div className={styles.no_details}>No education details found</div>;
    }
    return listOfEducations;
  }

  renderNoSocialMetrics = (github, stackoverflow) => {
    const noSocialMetricsComp = (<Col xs={12} lg={12} sm={12} md={12} className="p-0 p-t-10 text-center" >
      <Trans>NO_SOCIAL_METRICS_FOUND</Trans>
    </Col>);
    if (!github && !stackoverflow) {
      return noSocialMetricsComp;
    }
    if ((github && !github.link) || (stackoverflow && !stackoverflow.link)) {
      return noSocialMetricsComp;
    }
    return null;
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className="no_results_found">
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className="sub_head m-0"><div><Trans>NO_ACTIVITY_FOUND</Trans></div></Row>
      </Col>
    );
    return NoResultsFound;
  }

  renderOtherDetails = profile => {
    const currentSalary = profile.currAnnualSalary && profile.currAnnualSalaryCurrency;
    const expectedSalary = profile.expAnnualSalary && profile.expAnnualSalaryCurrency;
    const currentRate = profile.currRate && profile.currRateCurrency
      && profile.currRateType;
    const expectedRate = profile.expRate && profile.expRateCurrency
      && profile.expRateType;
    const isVisa = profile.visas && profile.visas.length > 0;
    const availability = profile.availStartDate && profile.availEndDate;
    const preferredLocation = profile.relocPossibility;
    // &&
    //   ((profile.reloc_possibility === 'yes' && profile.pref_location) ||
    //   (profile.reloc_possibility === 'no'));
    const workPermit = isVisa && profile.visas[0].workPermit;
    const resPermit = isVisa && profile.visas[0].resPermit;
    if (profile.noticePeriod || currentSalary || expectedSalary || currentRate || availability ||
      (isVisa && profile.visas[0].visa) || expectedRate || preferredLocation || resPermit || workPermit) {
      return (
        <Col xs={12} lg={12} md={12} sm={12} className={`${styles.skills} m-b-10`}>
          <div className={styles.skills} >
            <div className={`${styles.head}`}><Trans>ADDITIONAL_INFORMATION</Trans></div>
            <Col xs={12} lg={6} md={6} sm={6} className="p-0">
              {profile.noticePeriod && profile.noticePeriodType ?
                <div className={styles.personal}>
                  <span><Trans>Notice Period</Trans>:</span>
                  <span className={`${styles.contact_content} p-l-5`}>
                    {profile.noticePeriod} {profile.noticePeriodType}
                  </span>
                </div>
                : '' }
              {profile.currAnnualSalary && profile.currAnnualSalaryCurrency
                ? <div className={styles.personal}>
                  <span><Trans>CURRENT_ANNUAL_SALARY</Trans>:</span>
                  <span className={`${styles.contact_content} p-l-5`}>
                    {profile.currAnnualSalary} {profile.currAnnualSalaryCurrency}
                  </span>
                </div>
                : ''
              }
              {profile.expAnnualSalary && profile.expAnnualSalaryCurrency
                ? <div className={styles.personal}>
                  <span><Trans>EXPECTED_ANNUAL_SALARY</Trans>:</span>
                  <span className={`${styles.contact_content} p-l-5`}>
                    {profile.expAnnualSalary} {profile.expAnnualSalaryCurrency}
                  </span>
                </div>
                : ''
              }
              { currentRate
                ? <div className={styles.personal}>
                  <span><Trans>CURRENT_RATE</Trans>:</span>
                  <span className={`${styles.contact_content} p-l-5`}>
                    {profile.currRate} {profile.currRateCurrency}
                    {profile.currRateType}
                  </span>
                </div> : ''
              }
              {expectedRate
                ? <div className={styles.personal}>
                  <span><Trans>EXPECTED_RATE</Trans>:</span>
                  <span className={`${styles.contact_content} p-l-5`}>
                    {profile.expRate} {profile.expRateCurrency} {profile.expRateType}
                  </span>
                </div>
                : ''
              }
              { isVisa && profile.visas[0].visa ? <div className={styles.personal}>
                <span><Trans>VISA</Trans>:</span>
                <span className={`${styles.contact_content} p-l-5`}>
                  {profile.visas[0].visa}
                </span>
              </div>
                : ''
              }
              {resPermit
                ? <div className={styles.personal}>
                  <span><Trans>RESIDENCY_PERMIT</Trans>:</span>
                  <span className={`${styles.contact_content} p-l-5`}>
                    { profile.visas[0].resPermitValidDate ? `${profile.visas[0].resPermit}
                   ${moment(profile.visas[0].resPermitValidDate).format('DD-MMM-YYYY')}` :
                      profile.visas[0].resPermit}
                  </span>
                </div>
                : ''
              }
              {workPermit
                ? <div className={styles.personal}>
                  <span><Trans>WORK_PERMIT</Trans>:</span>
                  <span className={`${styles.contact_content} p-l-5`}>
                    { profile.visas[0].workPermitValidDate ? `${profile.visas[0].workPermit}
                   ${moment(profile.visas[0].workPermitValidDate).format('DD-MMM-YYYY')}` :
                      profile.visas[0].workPermit}
                  </span>
                </div>
                : ''
              }
              {availability ? <div className={styles.personal}>
                <span><Trans>AVAILABLITY</Trans>:</span>
                <span className={`${styles.contact_content} p-l-5`}>
                  {`${moment(profile.availStartDate).format('DD-MMM-YYYY')} ${i18n.t('TO')}
                 ${moment(profile.availEndDate).format('DD-MMM-YYYY')}`}
                </span>
              </div>
                : '' }
              {preferredLocation ? <div className={styles.personal}>
                <span><Trans>RELOCATION_POSSIBILITY</Trans>:</span>
                <span className={`${styles.contact_content} p-l-5`}>
                  {profile.relocPossibility} {profile.prefLocation}
                </span>
              </div>
                : ''
              }
            </Col>
          </div>
        </Col>
      );
    }
    return '';
  }

  renderArchiveMenu = () => {
    const { profile } = this.props;
    if (profile.isArchived) {
      return i18n.t('UNARCHIVE');
    } else if (profile.isArchiveScheduled) {
      return i18n.t('ARCHIVE_SCHEDULED');
    }
    return i18n.t('ARCHIVE');
  }

  renderActivityAction = action => {
    if (action === 'CANDIDATE_UNARCHIVED') {
      return (<span><Trans>UNARCHIVED_BY</Trans>: </span>);
    } else if (action === 'CANDIDATE_DELETE_INITIALIZED') {
      return (<span><Trans>RAISED_BY</Trans>: </span>);
    } else if (action === 'CANDIDATE_DELETE_REJECTED') {
      return (<span><Trans>REJECTED_BY</Trans>: </span>);
    }
    return (<span><Trans>ARCHIVED_BY</Trans>: </span>);
  }

  renderCandidateTags = profile => {
    if (profile && profile.tags && profile.tags.length > 0) {
      return (profile.tags.map(tag => (
        <div
          key={tag.id}
          id={tag.id}
          className={styles.skill}
        >
          <span className={styles.name}>{tag.name}</span>
        </div>
      )));
    }
    return (<div className={styles.no_tags}>
      {i18n.t('NO_TAGS_ARE_ASSOCIATED_TO_THIS_CANDIDATE')} </div>);
  }

  render() {
    const { profile, selectedOpening, resumeId, candidateEmailsLoading,
      fetching, profileActivityLoading, openingLoading, user, loadArchivalCandidateData,
      initiatingDelete } = this.props;
    const { loading, isTagsEditable, showCreateTag } = this.state;
    const {
      fileName,
      fileId,
      openSlider,
      searchTerm,
      activeKey,
      searchActivtyLoading,
      activityList,
      opendownloadOption,
      isNewTab,
      openingList,
      isFilesPermitted,
      isEmailsPermitted,
      isJobOpeningsPermitted,
      isEditCandidatePermitted,
      isArchiveCandidatePermitted,
      isUnarchiveCandidatePermitted,
      isDeleteCandidatePermitted
    } = this.state;
    let jobId;
    let isBestMatch;
    let scores;
    let socialMetadata;
    if (profile) {
      socialMetadata = profile.socialMetadata;
    }
    if (this.props.location.query.isAtsBoard) {
      jobId = this.props.location.query.jobId;
    } else {
      scores = JSON.parse(Object.values(this.props.location.query).join('')).scores;
      jobId = JSON.parse(Object.values(this.props.location.query).join('')).jobId;
      isBestMatch = JSON.parse(Object.values(this.props.location.query).join('')).isBestMatch;
    }
    let isTopBox = false;
    if (selectedOpening && selectedOpening.company && selectedOpening.openinglocations) {
      isTopBox = true;
    }
    const isSelected = this.checkIfProfileIsSelected(profile, selectedOpening);
    const recentActivityList = this.getRecentActivityList(activityList);
    return (
      <Col xs={12} className={`${styles.view_profile} opening_container`}>
        <Helmet title={profile ? profile.name : 'Profile'} />
        {
          selectedOpening && selectedOpening.company && selectedOpening.openinglocations && jobId ?
            <div style={{ paddingLeft: '7px', paddingRight: '9px', marginBottom: '0px' }}>
              <JobProfilePanel
                jobId={jobId}
                jobTitle={selectedOpening.jobTitle}
                company={selectedOpening.company.name}
                numberOfVacancies={selectedOpening.vacancies}
                type={selectedOpening.type}
                location={this.iterateArrayAndAttach(selectedOpening.openinglocations)}
                attachButtonsToDom={this.attachButtonsToDom(isSelected, profile, selectedOpening)}
                attachEditOpeningButton={this.attachEditOpeningButton(jobId, selectedOpening.jobTitle)}
                activeStatus={selectedOpening.status}
                statusCount={{ ...selectedOpening.statusCount, rejected: selectedOpening.rejectedCount }}
              />
            </div> : null
        }
        {
          profile ?
            <Col lg={12} className={`${styles.profile_section_head} p-0`}>
              <Col
                xs={12}
                md={8}
                className={`${styles.profile_section} ${styles.white_bg} shadow_one`}
                id={profile.id}
              >
                <Col xs={12} lg={12} sm={12} md={12} className={'company_container p-0'}>
                  <Col lg={12} className="p-0 p-b-25">
                    <div className={`${profileStyle.profile_name_top}`}>
                      <Col lg={5}>
                        {
                          !isNewTab &&
                          <Link
                            onClick={this.goToPreviousPage}
                            style={{ position: 'relative', top: '-5px' }}
                          >
                            <i className="fa fa-long-arrow-left" style={{ cursor: 'pointer' }} aria-hidden="true" />
                          </Link>
                        }
                        <div
                          className={`${isNewTab ? 'p-l-50' : ''}
                          ${profileStyle.text_wrap} ${profileStyle.profileName}`}
                          title={profile.name}
                        >
                          {profile.salutation ?
                            `${profile.salutation} ${profile.name}` : profile.name}
                        </div>
                      </Col>
                      <Col lg={7}>
                        { isEditCandidatePermitted ||
                            (isArchiveCandidatePermitted && !profile.isArchived && !profile.isDeleteInitiated) ||
                            (isUnarchiveCandidatePermitted && profile.isArchived) ||
                            (isDeleteCandidatePermitted && !profile.isArchived &&
                              !profile.isArchiveScheduled && !profile.isDeleteInitiated)
                          ? <ButtonGroup className="actions_dropdown_section right">
                            <DropdownButton
                              style={{ width: '40px',
                                height: '40px',
                                borderRadius: '2px',
                                border: '1px solid #d7dee8' }}
                              noCaret
                              onSelect={(key, evt) => { this.selectAction(key, evt, resumeId); }}
                              title={<div className="action_menu">
                                <i className="fa fa-circle" aria-hidden="true" />
                                <i className="fa fa-circle" aria-hidden="true" />
                                <i className="fa fa-circle" aria-hidden="true" />
                              </div>}
                              id="basic-nav-dropdown"
                            >
                              {isEditCandidatePermitted ?
                                <MenuItem eventKey="1">
                                  <Trans>EDIT_CANDIDATE</Trans>
                                </MenuItem> : null}
                              { (isArchiveCandidatePermitted && !profile.isArchived && !profile.isDeleteInitiated) ||
                              (isUnarchiveCandidatePermitted && profile.isArchived) ?
                                <MenuItem eventKey="2">
                                  { this.renderArchiveMenu() }
                                </MenuItem> : null }
                              { isDeleteCandidatePermitted && !profile.isArchived &&
                              !profile.isArchiveScheduled && !profile.isDeleteInitiated ?
                                <MenuItem eventKey="3">
                                  <Trans>PERMANENTLY_DELETE</Trans>
                                </MenuItem> : null}
                            </DropdownButton>
                          </ButtonGroup>
                          : null}
                        <button
                          className={`
                          ${profileStyle.viewSuperProfilebtn} button-primary right`}
                          type="submit"
                          onClick={() => this.routeToSuperProfile()}
                        >
                          <span className={`${profileStyle.viewprofilespan} ${profileStyle.viewSuperProfileSpan}`}>
                            <Trans>VIEW_SUPER_PROFILE</Trans>
                          </span>
                        </button>
                        <NewPermissible operation={{ operation: 'DOWNLOAD_CANDIDATE_PROFILE', model: 'document' }}>
                          <button
                            className={`${profileStyle.viewprofilebtn} button-primary right`}
                            type="submit"
                            onClick={this.opendownloadOption}
                          >
                            <span className={profileStyle.viewprofilespan}><i className="fa fa-download" />
                              <Trans>DOWNLOAD_PROFILE</Trans>
                            </span>
                          </button>
                        </NewPermissible>
                        {/* <NewPermissible operation={{ operation: 'UPDATE_CANDIDATE', model: 'resume' }}>
                          <button
                            className={`${profileStyle.viewprofilebtn} button-secondary right`}
                            type="submit"
                            onClick={event => this.openEditModal(event, resumeId)}
                          >
                            <span className={profileStyle.viewprofilespan}>
                              <i className="fa fa-pencil-square-o" /><Trans>EDIT_CANDIDATE</Trans>
                            </span>
                          </button>
                        </NewPermissible> */}
                      </Col>
                    </div>
                  </Col>
                  <Tabs
                    activeKey={this.state.activeKey}
                    onSelect={this.handleSelect}
                    className={`${styles.tab_section} shadow_one`}
                    id={profile.id}
                  >
                    <Tab eventKey={1} title={i18n.t('OVERVIEW')}>
                      <div className={`${styles.profile_container} profile_container`}>
                        <Row className={`${styles.block_1} m-0`}>
                          <Col xs={12} lg={6} className="p-0">
                            <div className="m-b-10">
                              <div
                                className={`${styles.person_name} ${styles.text_wrap}`}
                                title={profile.name}
                              >
                                {profile.salutation ?
                                  `${profile.salutation} ${profile.name}` : profile.name }
                              </div>
                            </div>
                            <div className="m-b-10">
                              <div className={styles.person_resumeid}>
                                <Trans>RESUME_ID</Trans>:{profile.id}
                              </div>
                            </div>
                            {
                              profile.currentExperience ?
                                <div className="m-b-10">
                                  <div className={styles.current_position}>
                                    {profile.currentExperience.position}
                                  </div>
                                  <div className={`${styles.current_company}`}>
                                    {profile.currentExperience.companyName || ' '}
                                  </div>
                                </div>
                                : null
                            }
                            <div className={`${styles.total_experiance}`}>
                              {`( ~ ${Math.round(profile.totalYearsOfExperience)}y exp)`}
                            </div>
                          </Col>
                          <Col xs={12} lg={4} className={styles.contact_details}>
                            {/* <div className={styles.head}>Contact Details</div> */}
                            <div className={`${styles.contact} ${styles.phone_number} `}>
                              <i className="fa fa-volume-control-phone" aria-hidden="true" />
                              {
                                (profile.contacts.mobileNumbers.length > 0 ||
                                  profile.contacts.alternateNumbers.length > 0) ? <span>
                                    {profile.contacts.mobileNumbers[0] || profile.contacts.alternateNumbers[0]}
                                  </span> :
                                  <span><Trans>NOT_AVAILABLE</Trans></span>
                              }
                            </div><div className={styles.contact}>
                              <i className="fa fa-envelope-o" aria-hidden="true" />
                              {
                                profile.contacts.emails.length ?
                                  <span>{profile.contacts.emails[0]}</span>
                                  :
                                  <span><Trans>NOT_AVAILABLE</Trans></span>
                              }
                            </div>
                            {profile.address.city &&
                            <div className={`${styles.contact} ${styles.location} `}>
                              <i className="fa fa-map-marker" aria-hidden="true" />
                              <span>{profile.address.city}{profile.address.country ?
                                `, ${profile.address.country}` : ''}</span>
                            </div>}
                            <div className={styles.social_links}>
                              {
                                (profile.linkedin || profile.xing || profile.twitter ||
                                  profile.github || profile.stackoverflow) &&
                                  <div className={styles.head}><Trans>SOCIAL_MEDIA</Trans></div>
                              }
                              {
                                Object.keys(socialIcons).map(socialIcon => (
                                  profile[socialIcon] && (
                                    <span className={`${styles.link} ${styles.active_link}`}>
                                      <a
                                        className={`${styles.social_icon}`}
                                        target="_blank"
                                        href={`https://${formatDomainName(profile[socialIcon])}`}
                                      >
                                        <img
                                          src={socialIcons[socialIcon].srcImage}
                                          alt={socialIcons[socialIcon].alt}
                                          title={socialIcons[socialIcon].domain}
                                        />
                                      </a>
                                    </span>)))
                              }
                            </div>
                          </Col>
                        </Row>
                        { isBestMatch ?
                          <Row className={styles.score_block}>
                            <Col lg={2} md={2} sm={3} xs={3} className={styles.progress_score}>
                              <CircularProgressbar
                                percentage={Math.round(scores.overall_score * 100) || 0}
                                className="progressbar-blue"
                              />
                              <Col lg={2} md={2} sm={3} xs={3} className={styles.score_text}>
                                <Trans>OVERALL</Trans>
                              </Col>
                            </Col>
                            <Col lg={2} md={2} sm={3} xs={3} className={styles.progress_score}>
                              <CircularProgressbar
                                percentage={Math.round(scores.skill_score * 100) || 0}
                                className="progressbar-blue"
                              />
                              <Col lg={2} md={2} sm={3} xs={3} className={styles.score_text}>
                                <Trans>SKILL</Trans>
                              </Col>
                            </Col>
                            <Col lg={2} md={2} sm={3} xs={3} className={styles.progress_score}>
                              <CircularProgressbar
                                percentage={Math.round(scores.mobility_score * 100) || 0}
                                className="progressbar-blue"
                              />
                              <Col lg={2} md={2} sm={3} xs={3} className={styles.score_text}>
                                <Trans>CHANGE_PROBABILITY</Trans>
                              </Col>
                            </Col>
                            <Col lg={2} md={2} sm={3} xs={3} className={styles.progress_score}>
                              <CircularProgressbar
                                percentage={Math.round(scores.company_culture_score * 100) || 0}
                                className="progressbar-blue"
                              />
                              <Col lg={2} md={2} sm={3} xs={3} className={styles.score_text}>
                                <Trans>COMPANY_CULTURE</Trans>
                              </Col>
                            </Col>
                            <Col lg={2} md={2} sm={3} xs={3} className={styles.progress_score}>
                              <CircularProgressbar
                                percentage={Math.round(scores.pedigree_score * 100) || 0}
                                className="progressbar-blue"
                              />
                              <Col lg={2} md={2} sm={3} xs={3} className={styles.score_text}>
                                <Trans>PEDIGREE</Trans>
                              </Col>
                            </Col>
                            <Col lg={2} md={2} sm={3} xs={3} className={styles.progress_score}>
                              <CircularProgressbar
                                percentage={Math.round(scores.contactability_score * 100) || 0}
                                className="progressbar-blue"
                              />
                              <Col lg={2} md={2} sm={3} xs={3} className={styles.score_text}>
                                <Trans>CONTACTABILITY</Trans>
                              </Col>
                            </Col>
                          </Row>
                          :
                          null
                        }
                        <Row className={styles.block_2}>
                          <Col xs={12} lg={12} className={`${styles.skills} m-b-10`}>
                            <div className={`${styles.head}`}><Trans>PERSONAL_INFORMATION</Trans></div>
                            <div className={styles.personal}>
                              <span><Trans>DOB</Trans>:</span>
                              <span className="p-l-5">
                                {profile.dob ? profile.dob : <Trans>NOT_AVAILABLE</Trans> }
                              </span>
                            </div>
                            <div className={styles.personal}>
                              <span><Trans>PLACE_OF_BIRTH</Trans>:</span>
                              <span className="p-l-5">
                                {profile.placeOfBirth ? profile.placeOfBirth
                                  : <Trans>NOT_AVAILABLE</Trans> }
                              </span>
                            </div>
                            <div className={styles.personal}>
                              <span><Trans>NATIONALITY</Trans>:</span>
                              <span className="p-l-5">{profile.nationality || <Trans>NOT_AVAILABLE</Trans>}
                              </span>
                            </div>
                            <div className={styles.personal}>
                              <span><Trans>CITY</Trans>:</span>
                              <span className="p-l-5">{profile.address.city || <Trans>NOT_AVAILABLE</Trans>}
                              </span>
                            </div>
                          </Col>
                          {this.renderOtherDetails(profile.otherInfo)}
                          {
                            (profile.contacts.mobileNumbers.length > 1
                              || profile.contacts.alternateNumbers.length > 0) &&
                              <Col xs={12} lg={12} className={`${styles.skills} m-b-10`}>
                                <div className={`${styles.head}`}><Trans>CONTACT_INFORMATION</Trans></div>
                                <span className={styles.contact_icon}>
                                  <i className="fa fa-phone" aria-hidden="true" />
                                </span>
                                {
                                  profile.contacts.mobileNumbers.map(contactNo => (
                                    contactNo &&
                                    <div key={Math.random().toString(36).substring(8)} className={styles.skill}>
                                      <span className={`${styles.experience} f-w-600`}>
                                        {contactNo}
                                      </span>
                                    </div>)
                                  )
                                }
                                {
                                  profile.contacts.alternateNumbers.map(contactNo => (
                                    contactNo &&
                                    <div key={Math.random().toString(36).substring(8)} className={styles.skill}>
                                      <span className={`${styles.experience} f-w-600`}>
                                        {contactNo}
                                      </span>
                                    </div>)
                                  )
                                }
                              </Col>
                          }
                          {
                            profile.contacts.emails.length > 1 &&
                              <Col xs={12} lg={12} className={styles.skills}>
                                <span className={styles.contact_icon}>
                                  <i className="fa fa-envelope-o" aria-hidden="true" />
                                </span>
                                {
                                  profile.contacts.emails.map(email => (
                                    email &&
                                    <div key={Math.random().toString(36).substring(8)} className={styles.skill}>
                                      <span className={`${styles.experience} f-w-600`}>{email}</span>
                                    </div>)
                                  )
                                }
                              </Col>
                          }
                          <Col xs={12} lg={12} className={`${styles.skills} m-b-10`}>
                            <div className={styles.head}>
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
                                  isEditCandidatePermitted &&
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
                                <CandidateTagsEdit
                                  resumeId={profile.id}
                                  profileTags={profile.tags}
                                  toggleTagsEdit={this.toggleTagsEdit}
                                  loadCandidateProfile={this.loadCandidateProfile}
                                /> :
                                this.renderCandidateTags(profile)
                            }
                          </Col>
                          {
                            profile.skills &&
                              <Col xs={12} lg={12} className={`${styles.skills} m-b-10`}>
                                <div className={styles.head}><Trans>SKILLS</Trans></div>
                                {
                                  profile.skills.map(skill => (
                                    <div
                                      key={Math.random().toString(36).substring(8)}
                                      id={skill.id}
                                      className={styles.skill}
                                    >
                                      <span className={styles.name}>{skill.name}</span>
                                      {
                                        skill.experience &&
                                        <span className={styles.experience}>{skill.experience}</span>
                                      }
                                    </div>)
                                  )
                                }
                              </Col>
                          }
                          {
                            !this.isLanguagesEmpty(profile.languages) ?
                              <Col xs={12} lg={12}>
                                <div className={styles.languages}>
                                  <div className={`${styles.head} m-b-10`}><Trans>LANGUAGE</Trans></div>
                                  {
                                    profile.languages.map((language, index) => (
                                      <span
                                        key={Math.random().toString(36).substring(8)}
                                        className={`${styles.language_head} p-r-5`}
                                      >
                                        <span className={styles.language}> {language.name} </span>
                                        {language.proficiency &&
                                        <span className={styles.language_proficiency}>
                                          ({language.proficiency})
                                        </span>
                                        }
                                        {index !== profile.languages.length - 1 ? ';' : ''}
                                      </span>
                                    )
                                    )
                                  }
                                </div>
                              </Col>
                              : null
                          }
                        </Row>
                        <Row className={styles.block_3}>
                          {
                            profile.experiences !== null ?
                              <Col xs={12} lg={6}>
                                <div className={`${styles.head}`}><Trans>EXPERIENCE</Trans></div>
                                <Col lg={12} className={styles.experiences}>
                                  <Timeline className={styles.timeline}>
                                    {this.renderExperiences(profile.experiences)}
                                  </Timeline>
                                </Col>
                              </Col> : null
                          }
                          {
                            profile.educations !== null ?
                              <Col xs={12} lg={6}>
                                <div className={styles.head}><Trans>EDUCATION</Trans></div>
                                <Col lg={12} className={styles.educations}>
                                  {this.renderEducations(profile.educations)}
                                </Col>
                              </Col> : null
                          }
                        </Row>
                        <Row className={`${styles.block_3} ${styles.source}`}>
                          <Col sm={6}>
                            <span className={`${styles.head_camelcase}`}>
                              <Trans>SOURCE</Trans>:
                            </span>
                            <span className={`p-l-10 ${styles.contact_content}`}>
                              <span>
                                {profile.resumeSource && profile.resumeSource !== '' ?
                                  profile.resumeSource.toUpperCase() : 'Unavailable'}
                              </span>
                            </span>
                          </Col>
                        </Row>
                        <Row className="p-b-5">

                          <Col sm={6}>
                            <span className={`${styles.head_camelcase}`}>
                              <Trans>CREATED_BY</Trans>:
                            </span>
                            <span className={`p-l-10 ${styles.contact_content}`}>
                              <span>
                                {profile.createdBy && profile.createdBy !== '' ?
                                  profile.createdBy : 'Unavailable'}
                              </span>
                            </span>
                          </Col>
                          <Col sm={6}>
                            <span className={`${styles.head_camelcase}`}>
                              <Trans>CREATED_ON</Trans>:
                            </span>
                            <span className="p-l-10">
                              {profile.createdAt && profile.createdAt !== '' ?
                                moment(profile.createdAt, 'YYYY-MM-DD').format('DD MMM YYYY') : 'Unavailable'}
                            </span>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={6}>
                            <span className={`${styles.head_camelcase}`}>
                              <Trans>UPDATED_BY</Trans>:
                            </span>
                            <span className={`p-l-10 ${styles.contact_content}`}>
                              <span>
                                {profile.updatedBy && profile.updatedBy !== '' ?
                                  profile.updatedBy : 'Unavailable'}
                              </span>
                            </span>
                          </Col>
                          <Col sm={6}>
                            <span className={`${styles.head_camelcase}`}>
                              <Trans>UPDATED_ON</Trans>:
                            </span>
                            <span className="p-l-10">
                              {profile.updatedAt && profile.updatedAt !== '' ?
                                moment(profile.updatedAt, 'YYYY-MM-DD').format('DD MMM YYYY') : 'Unavailable'}
                            </span>
                          </Col>
                        </Row>
                      </div>
                    </Tab>
                    {this.state.isActivityPermitted &&
                    <Tab eventKey={2} title={i18n.t('RECENT_ACTIVITY')}>
                      <Col lg={5} md={6} sm={8} className="m-b-10">
                        <SearchBar
                          reset={e => this.resetSearch(e)}
                          handleOnChange={e => this.setSearchTerm(e)}
                          handleOnKeyUp={() => {}}
                          inpValue={searchTerm}
                          placeholder={'SEARCH'}
                        />
                      </Col>
                      <Scrollbars
                        universal
                        autoHide
                        autoHeight
                        autoHeightMin={'calc(100vh - 245px)'}
                        autoHeightMax={'calc(100vh - 245px)'}
                        renderThumbHorizontal={props => <div {...props} className="hide" />}
                        renderView={props => <div {...props} className="customScroll" />}
                      >
                        <Loader
                          loading={profileActivityLoading || searchActivtyLoading}
                          styles={{ position: 'absolute', top: '50%' }}
                        />
                        <Col sm={12}>
                          <Col sm={12} className="p-0">
                            {<div key={Math.random().toString(36).substring(8)}>
                              {activityList['0'] && activityList['0'].length ?
                                <Col sm={12} className={`${styles.activity_heading}`}>
                                  <span className="orange">
                                    <Trans>ARCHIVE_DELETE_ACTIVITY</Trans>
                                  </span>
                                </Col> : null
                              }
                              {activityList['0'] && activityList['0'].map(archivalActivity => (
                                <Col sm={12} className="p-0 m-l-10">
                                  <Timeline className={styles.activity_timeline}>
                                    {archivalActivity &&
                                      <TimelineEvent
                                        title={i18n.t(archivalActivity.action)}
                                        icon={<i className={`${archivalActivity.icon} `} aria-hidden="true" />}
                                        createdAt={
                                          archivalActivity.createdAt &&
                                          moment(archivalActivity.createdAt).format('DD MMM YYYY hh:mm a')
                                        }
                                        contentStyle={{ backgroundColor: '#ebf0f6', padding: '.3em' }}
                                        titleStyle={{ color: '#000000', fontWeight: '500' }}
                                        iconColor="#5E6C84"
                                      >
                                        <div>
                                          {archivalActivity.user &&
                                            <div className={`${styles.activity_timeline_detail}`}>
                                              { this.renderActivityAction(archivalActivity.action) }
                                              <span className={`${styles.activity_timeline_detail_head}`}>
                                                {`${archivalActivity.user.firstName}
                                                ${archivalActivity.user.lastName || ''}`}
                                              </span>
                                            </div>
                                          }
                                          {archivalActivity.reason && archivalActivity.reason.name &&
                                            <div className={`${styles.activity_timeline_detail}`}>
                                              <span><Trans>REASON</Trans>: </span>
                                              <span className={`${styles.activity_timeline_detail_head}`}>
                                                {`${archivalActivity.reason.name}`}
                                              </span>
                                            </div>
                                          }
                                          {archivalActivity.metadata && archivalActivity.metadata.description &&
                                            <div className={`${styles.activity_timeline_detail}`}>
                                              <span><Trans>DESCRIPTION</Trans>: </span>
                                              <span className={`${styles.activity_timeline_detail_head}`}>
                                                {`${archivalActivity.metadata.description}`}
                                              </span>
                                            </div>
                                          }
                                        </div>
                                      </TimelineEvent>
                                    }
                                  </Timeline>
                                </Col>))
                              }
                            </div>
                            }
                            {
                              recentActivityList['1'] && recentActivityList['1'].length !== 0 &&
                                recentActivityList.map(activity => (
                                  <div key={Math.random().toString(36).substring(8)}>
                                    { activity && activity.jobOpeningId &&
                                      <Col sm={12} className={`${styles.activity_heading}`}>
                                        {/* <Link
                                          // target="_blank"
                                          to={
                                            {
                                              pathname: '/ProfileSearch',
                                              query: { jobId: `${activity.jobOpeningId}`, tab: 'activity' }
                                            }
                                          }
                                        > */}
                                        <span
                                          className="orange"
                                          role="button"
                                          tabIndex={0}
                                          onClick={() => this.gotoOpeningPage(activity.jobOpeningId)}
                                        >
                                          {activity.jobOpeningName}
                                        </span>
                                        {/* </Link> */}
                                      </Col>
                                    }
                                    <Col sm={12} className="p-0 m-l-10">
                                      <Timeline className={styles.activity_timeline}>
                                        {activity &&
                                          <TimelineEvent
                                            title={i18n.t(activity.status.toUpperCase())}
                                            icon={<i className={`${activity.icon} `} aria-hidden="true" />}
                                            createdAt={
                                              activity.createdAt &&
                                              moment(activity.createdAt).format('DD MMM YYYY hh:mm a')
                                            }
                                            contentStyle={{ backgroundColor: '#ebf0f6', padding: '.3em' }}
                                            titleStyle={{ color: '#000000', fontWeight: '500' }}
                                            iconColor="#5E6C84"
                                          >
                                            <div>
                                              {activity.userName &&
                                                <div className={`${styles.activity_timeline_detail}`}>
                                                  <span><Trans>MOVED_BY</Trans>: </span>
                                                  <span className={`${styles.activity_timeline_detail_head}`}>
                                                    {activity.userName}
                                                  </span>
                                                </div>
                                              }
                                              {activity.details &&
                                              activity.details.length > 0 &&
                                              activity.details.map(activityDetail => (
                                                <div
                                                  key={Math.random().toString(36).substring(8)}
                                                  className={`${styles.activity_timeline_detail}`}
                                                >
                                                  {activityDetail.level &&
                                                    <div>
                                                      <span>{activityDetail.level}</span>
                                                    </div>
                                                  }
                                                  {activityDetail.contactedBy &&
                                                    <div>
                                                      <span><Trans>CONTACTED_BY</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.contactedBy}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.contactMode &&
                                                    <div>
                                                      <span><Trans>CONTACTED_MODE</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.contactMode}
                                                      </span>
                                                    </div>
                                                  }
                                                  {/* {activityDetail.contactMode === 'Phone' &&
                                                    activityDetail.phone &&
                                                    <div>
                                                      <span><Trans>PHONE_NUMBER</Trans>: </span>
                                                      <span
                                                        className={`${styles.activity_timeline_detail_head}`}
                                                      >
                                                        {activityDetail.phone}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.contactMode === 'Email' &&
                                                    activityDetail.email &&
                                                    <div>
                                                      <span><Trans>EMAIL_ADDRESS</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}
                                                        ${styles.activity_timeline_email}`}
                                                      >
                                                        {activityDetail.email}
                                                      </span>
                                                    </div>
                                                  } */}
                                                  {activityDetail.contactDetails &&
                                                    <div>
                                                      <span><Trans>CONTACT_DETAILS</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}
                                                        ${styles.activity_timeline_email}`}
                                                      >
                                                        {activityDetail.contactDetails}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.contactedDate &&
                                                    <div>
                                                      <span><Trans>CONTACTED_DATE_AND_TIME</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {moment(
                                                          activityDetail.contactedDate
                                                        ).format('DD MMM YYYY hh:mm a')
                                                        }
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.interviewer &&
                                                    <div>
                                                      <span><Trans>INTERVIEWER</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.interviewer}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.interviewDate &&
                                                    <div>
                                                      <span><Trans>INTERVIEW_DATE_AND_TIME</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {moment(
                                                          activityDetail.interviewDate
                                                        ).format('DD MMM YYYY hh:mm a')
                                                        }
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.status &&
                                                    <div>
                                                      <span><Trans>STATUS</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.status}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.joiningDate &&
                                                    <div>
                                                      <span><Trans>JOINING_DATE_AND_TIME</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {moment(
                                                          activityDetail.joiningDate
                                                        ).format('DD MMM YYYY hh:mm a')
                                                        }
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.commentsByClient &&
                                                    <div>
                                                      <span><Trans>COMMENTS_BY_CLIENT</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.commentsByClient}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.reasonForRejecting &&
                                                    <div>
                                                      <span><Trans>REASON_FOR_REJECTION</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.reasonForRejecting.name}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.reasonByClient &&
                                                    <div>
                                                      <span><Trans>REASON_BY_CLIENT</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.reasonByClient}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.comment &&
                                                    <div>
                                                      <span><Trans>COMMENTS</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.comment}
                                                      </span>
                                                    </div>
                                                  }
                                                  {activityDetail.paymentTerms &&
                                                    <div>
                                                      <span><Trans>PAYMENT_TERMS</Trans>: </span>
                                                      <span className={`${styles.activity_timeline_detail_head}`}>
                                                        {activityDetail.paymentTerms}
                                                      </span>
                                                    </div>
                                                  }
                                                </div>
                                              ))}
                                            </div>
                                          </TimelineEvent>
                                        }
                                      </Timeline>
                                    </Col>
                                  </div>
                                ))
                            }
                            {((recentActivityList['1']) ||
                              (activityList['0'] && activityList['0'].length)) || profileActivityLoading ?
                              '' :
                              <div>
                                {this.renderNoResultsFound()}
                              </div>
                            }
                          </Col>
                        </Col>
                      </Scrollbars>
                    </Tab>
                    }
                    {isFilesPermitted && <Tab eventKey={3} title={i18n.t('FILES')}>
                      {activeKey === 3 && <Scrollbars
                        universal
                        autoHide
                        autoHeight
                        autoHeightMin={'calc(100vh - 170px)'}
                        autoHeightMax={'calc(100vh - 170px)'}
                        renderThumbHorizontal={props => <div {...props} className="hide" />}
                        renderView={props => <div {...props} className="customScroll" />}
                      >
                        {
                          <FileDropper
                            fetching={fetching}
                            files={this.props.files}
                            uploadFile={this.uploadFile}
                            deleteFile={this.deleteFiles}
                            uploading={this.props.uploading}
                            openSlider={this.OpenFileSlider}
                            user={user}
                          />
                        }
                      </Scrollbars>}
                    </Tab>}
                    {isEmailsPermitted && <Tab eventKey={4} title={i18n.t('EMAILS')}>
                      {activeKey === 4 && <Scrollbars
                        universal
                        autoHide
                        autoHeight
                        autoHeightMin={'calc(100vh - 165px)'}
                        autoHeightMax={'calc(100vh - 165px)'}
                        renderThumbHorizontal={props => <div {...props} className="hide" />}
                        renderView={props => <div {...props} className="customScroll" />}
                      >
                        {/* <Emails emails={this.props.candidateEmails} type={'candidate'} /> */}
                        <EmailActivity
                          candidateProfileId={profile.id}
                          candidateEmailsLoading={candidateEmailsLoading}
                          from={'candidateProfile'}
                          candidateEmail={profile.contacts.emails.length > 0 ?
                            profile.contacts.emails[0] : 'noEmailsForCandidate'}
                          emails={this.state.emails}
                          noMoreEmails={this.state.noMoreEmails}
                          loadEmails={this.loadCandidateEmails}
                          acl={{ operation: 'SEND_CANDIDATE_EMAIL', model: 'resume' }}
                          showSearchBar
                          autoHeight="300px"
                        />
                      </Scrollbars>}
                    </Tab>}
                    {isJobOpeningsPermitted && <Tab eventKey={5} title={i18n.t('JOB_OPENINGS')}>
                      { activeKey === 5 &&
                        <CandidateOpening
                          loading={openingLoading}
                          openingList={openingList}
                          pushState={this.props.pushState}
                          resumeId={resumeId}
                          profileName={profile.name}
                          noMoreOpening={this.state.noMoreOpening}
                          fetchJobOpenings={this.fetchJobOpenings}
                          totalCount={this.state.totalCount}
                        />
                      }
                      {/* </Scrollbars> */}
                    </Tab>}
                  </Tabs>
                </Col>
                {/* <Col xs={2} lg={2} sm={2} md={2} className={styles.dropdown_section}>
                  <ButtonToolbar>
                    <button
                      className={`${styles.viewprofilebtn} btn btn-border orange-btn right`}
                      type="submit"
                      onClick={event => this.openEditModal(event, resumeId)}
                    >
                      <span className={styles.viewprofilespan}>
                      <i className="fa fa-pencil-square-o" />Edit Candidate</span>
                    </button>
                    <button
                      className={`${styles.viewprofilebtn} btn btn-border orange-btn right`}
                      type="submit"
                      onClick={this.opendownloadOption}
                    >
                      <span className={styles.viewprofilespan}><i className="fa fa-download" />Downloads</span>
                    </button>
                  </ButtonToolbar>
                </Col> */}
              </Col>
              <Col xs={12} md={4} className={styles.profile_section} id="social_metrics">
                <div className={`${styles.profile_container} shadow_one p-15`}>
                  <div className={styles.social_metrics}>
                    <div className={`${styles.head} ${styles.metrics_head} p-b-10 p-t-10`}>
                      <Trans>SOCIAL_METRICS</Trans>
                    </div>
                  </div>
                  {
                    socialMetadata.github && socialMetadata.github.url &&
                      <div className={`${styles.social_accounts} p-5 p-b-10`}>
                        <div className={`${styles.social_account} p-b-10`}>
                          <a
                            className={`${styles.btn_github} ${styles.social_btns}`}
                            target="_blank"
                            href={`${socialMetadata.github.url}`}
                          >
                            <i className="fa fa-github" />
                          </a> <Trans>GITHUB</Trans>
                        </div>
                        <div className={`${styles.social_account_list} p-l-5`}>
                          <div className={`${styles.heading} p-b-10`}>
                            <i className="fa fa-code p-r-5" aria-hidden="true" />
                            <Trans>SKILLS</Trans>
                          </div>
                          {
                            socialMetadata.github.skills && socialMetadata.github.skills.length ?
                              <ul className={styles.skill_list}>
                                {
                                  socialMetadata.github.skills.map(skill => (
                                    <li key={Math.random().toString(36).substring(8)}>{skill}</li>
                                  ))
                                }
                              </ul>
                              :
                              <ul className={styles.skill_list}>
                                <li><Trans>NO_SKILLS_TO_DISPLAY</Trans></li>
                              </ul>
                          }
                        </div>
                        <div className={`${styles.social_stats} p-l-5`}>
                          <div className="p-b-10"><i className="fa fa-code-fork  p-r-10" aria-hidden="true" />
                            <Trans>REPOSITORIES</Trans>
                            <span className={`${styles.numbers} right`}>
                              {socialMetadata.github.repositories}
                            </span>
                          </div>
                          <div className="p-b-10"><i className="fa fa-star p-r-5" aria-hidden="true" />
                            <Trans>STARS</Trans>
                            <span className={`${styles.numbers} right`}>
                              {socialMetadata.github.stars}
                            </span>
                          </div>
                          <div className="p-b-10"><i className="fa fa-users p-r-5" aria-hidden="true" />
                            <Trans>FOLLOWERS</Trans>
                            <span className={`${styles.numbers} right`}>
                              {socialMetadata.github.followers}
                            </span>
                          </div>
                          <div className="p-b-10"><i className="fa fa-user-plus p-r-5" aria-hidden="true" />
                            <Trans>FOLLOWING</Trans>
                            <span className={`${styles.numbers} right`}>
                              {socialMetadata.github.following}
                            </span>
                          </div>
                        </div>
                      </div>
                  }
                  {
                    socialMetadata.stackoverflow && socialMetadata.stackoverflow.url &&
                      <div className={`${styles.social_accounts} p-5 p-b-10`}>
                        <div className={`${styles.social_account} p-b-10`}>
                          <a
                            className={`${styles.btn_stackoverflow} ${styles.social_btns}`}
                            href={socialMetadata.stackoverflow.url}
                            target="_blank"
                          >
                            <i className="fa fa-stack-overflow" /></a> <Trans>STACK_OVERFLOW</Trans>
                        </div>
                        <div className={`${styles.social_account_list} p-l-5`}>
                          <div className={`${styles.heading} p-b-10`}>
                            <i className="fa fa-tags p-r-5" aria-hidden="true" />
                            <Trans>TOP_TAGS</Trans>
                          </div>
                          {
                            socialMetadata.stackoverflow.skills &&
                            socialMetadata.stackoverflow.skills.length ?
                              <ul className={styles.skill_list}>
                                {
                                  socialMetadata.stackoverflow.skills.map(skill => (
                                    <li key={Math.random().toString(36).substring(8)}>{skill}</li>
                                  ))
                                }
                              </ul>
                              :
                              <ul className={styles.skill_list}>
                                <li><Trans>NO_TAGS_TO_DISPLAY</Trans></li>
                              </ul>
                          }
                        </div>
                        <div className={`${styles.social_account_list} p-l-5`}>
                          <div className={`${styles.heading} p-b-10`}>
                            <i className="fa fa-certificate p-r-5" aria-hidden="true" />
                            <Trans>BADGES</Trans>
                          </div>
                          <ul className={styles.skill_list}>
                            <li><i className="fa fa-star p-r-5" aria-hidden="true" />
                              <Trans>GOLD</Trans> - {socialMetadata.stackoverflow.goldBadgeCount}
                            </li>
                            <li><i className="fa fa-star p-r-5" aria-hidden="true" />
                              Silver - {socialMetadata.stackoverflow.silverBadgeCount}
                            </li>
                            <li><i className="fa fa-star p-r-5" aria-hidden="true" />
                              <Trans>BRONZE</Trans> - {socialMetadata.stackoverflow.bronzeBadgeCount}
                            </li>
                          </ul>
                        </div>
                        <div className={`${styles.social_stats} p-l-5`}>
                          <div className="p-b-10">
                            <i className="fa fa-question p-r-5" aria-hidden="true" />
                            <Trans>QUESTIONS</Trans> <span className={`${styles.numbers} right`}>
                              {socialMetadata.stackoverflow.questionsCount}</span>
                          </div>
                          <div className="p-b-10"><span className="p-r-5">A</span>
                            <Trans>ANSWERS</Trans> <span className={`${styles.numbers} right`}>
                              {socialMetadata.stackoverflow.answersCount}</span>
                          </div>
                        </div>
                      </div>
                  }
                  {
                    this.renderNoSocialMetrics(socialMetadata.github, socialMetadata.stackoverflow)
                  }
                </div>
                { openSlider ? <FileView
                  closeSlider={this.closeSlider}
                  fileId={fileId}
                  fileName={fileName}
                /> : null}
              </Col>
            </Col> : null
        }
        {
          opendownloadOption &&
          <DownloadForm
            closedownloadOption={this.closedownloadOption}
            isViewprofile
            isTopBox={isTopBox}
          />
        }
        {
          <Loader loading={loadArchivalCandidateData || loading} styles={{ position: 'absolute', top: '50%' }} />
        }
        {
          this.state.isOpenArchiveDeleteModal &&
            <ArchiveDeleteModal
              archivalReasons={this.props.archivalReasons}
              deleteReasons={this.props.deleteReasons}
              isOpenModal={this.state.isOpenArchiveDeleteModal}
              isArchiveModal={this.state.isArchiveModal}
              handleArchiveOrDeleteSubmit={this.handleArchiveOrDeleteSubmit}
              toggleArchiveDeleteModal={this.toggleArchiveDeleteModal}
              initialValues={this.initialData()}
              archiveModalSubmitted={this.state.archiveModalSubmitted}
              btnText={this.renderArchiveMenu()}
              archivingOrDeleting={initiatingDelete}
              btnTextSuffix="CANDIDATE"
            />
        }
        {
          showCreateTag && this.renderCreateTag()
        }
      </Col>
    );
  }
}
