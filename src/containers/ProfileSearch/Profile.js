import React, { Component } from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
// import pdfMake from 'pdfmake/build/pdfmake.js';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
import CircularProgressbar from 'react-circular-progressbar';
import { Row, Col, Tab, Tabs, ButtonGroup, MenuItem,
  DropdownButton } from 'react-bootstrap';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { toastr } from 'react-redux-toastr';
import { reduxForm } from 'redux-form';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, hashHistory } from 'react-router';
import lodash from 'lodash';
import { push as pushState } from 'react-router-redux';
import chroma from 'chroma-js';
import { Trans } from 'react-i18next';
import { EmailActivity } from 'components';
import Loader from '../../components/Loader';
import socialIcons from '../../utils/utils';
import { loadProfileById as loadProfile, loadProfileScoreById,
  fetchProfileJob } from '../../redux/modules/profile-search';
import FileDropper from '../../components/FileDropper/FileDropper';
import { loadActivities, loadActivitiesBySearch } from '../../redux/modules/profile-activity';
import JobProfilePanel from '../../components/PageComponents/JobProfilePanel';
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
import toastrErrorHandling from '../toastrErrorHandling';
import { loadCandidateEmails } from '../../redux/modules/emails';
import profileStyle from './SuperProfile.scss';
import { formatDomainName, formatTitle, trimTrailingSpace } from '../../utils/validation';
import Constants from '../../helpers/Constants';
import CandidateOpening from '../../components/CandidateOpening/CandidateOpening';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import ArchiveDeleteModal from '../../components/ArchiveDeleteModal/ArchiveDeleteModal';
import { loadArchivalReasons, checkIfArchivable, archiveCandidate, unArchiveCandidate,
  getArchiveCandidateData, extendArchiveCandidate, loadDeleteReasons, initiateDeleteCandidate }
  from '../../redux/modules/profile-search/managecandidates';
import SearchBar from '../../components/FormComponents/SearchBar';

let timeoutId;
@reduxForm({
  form: 'searchActivity'
})
@connect(
  (state, route) => ({
    resumeId: route.params.id,
    profile: state.profileSearch.resume,
    profileScore: state.profileSearch.profileScore,
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
    loadArchivalCandidateData: state.managecandidates.loadArchivalCandidateData
  }),
  {
    loadProfile,
    loadProfileScoreById,
    saveJobProfile,
    loadOpeningById,
    removeCandidateFromJobProfile,
    saveEditedOpening,
    loadOpenings,
    loadActivities,
    loadActivitiesBySearch,
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
    initiateDeleteCandidate
  })
export default class ViewProfile extends Component {
  static propTypes = {
    profile: PropTypes.any,
    profileScore: PropTypes.array,
    resumeId: PropTypes.oneOf(PropTypes.number, PropTypes.string),
    loadProfile: PropTypes.func.isRequired,
    loadProfileScoreById: PropTypes.func.isRequired,
    profileActivityLoading: PropTypes.bool,
    loadOpeningById: PropTypes.func.isRequired,
    selectedOpening: PropTypes.object.isRequired,
    activityList: PropTypes.array.isRequired,
    saveJobProfile: PropTypes.func.isRequired,
    removeCandidateFromJobProfile: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    candidateEmailsLoading: PropTypes.bool,
    loadOpenings: PropTypes.func.isRequired,
    loadActivities: PropTypes.func.isRequired,
    loadActivitiesBySearch: PropTypes.func.isRequired,
    openings: PropTypes.array.isRequired,
    loadCandidateEmails: PropTypes.func.isRequired,
    loadDeleteReasons: PropTypes.func.isRequired,
    initiateDeleteCandidate: PropTypes.func.isRequired,
    getArchiveCandidateData: PropTypes.func.isRequired,
    extendArchiveCandidate: PropTypes.func.isRequired,
    candidateEmails: PropTypes.array.isRequired,
    updating: PropTypes.bool,
    fetchCandidateFiles: PropTypes.func.isRequired,
    deleteFile: PropTypes.func,
    fetching: PropTypes.bool,
    uploadCandidateFile: PropTypes.func.isRequired,
    files: PropTypes.arrayOf(PropTypes.object),
    uploading: PropTypes.bool,
    user: PropTypes.object,
    pushState: PropTypes.func.isRequired,
    fetchProfileJob: PropTypes.func.isRequired,
    openingLoading: PropTypes.bool,
    openingList: PropTypes.array,
    loadArchivalReasons: PropTypes.func.isRequired,
    archivalReasons: PropTypes.array.isRequired,
    checkIfArchivable: PropTypes.func.isRequired,
    archiveCandidate: PropTypes.func.isRequired,
    unArchiveCandidate: PropTypes.func.isRequired,
    loadArchivalCandidateData: PropTypes.bool.isRequired,
    archiveCandidateData: PropTypes.object.isRequired,
    deleteReasons: PropTypes.array.isRequired,
  };

  static defaultProps = {
    profile: null,
    profileScore: [],
    profileActivityLoading: false,
    resumeId: null,
    selectedOpening: {},
    activityList: [],
    deleteFile: null,
    updating: false,
    candidateEmailsLoading: false,
    files: [],
    uploading: false,
    fetching: [],
    user: {},
    openingLoading: false,
    openingList: []
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
      fileId: '',
      fileName: '',
      emails: {},
      searchTerm: '',
      activityList: {},
      showAllSkills: false,
      showAllExperiences: false,
      opendownloadOption: false,
      noMoreOpening: false,
      openingList: [],
      totalCount: 0,
      isActivityPermitted: false,
      isFilesPermitted: false,
      isEmailsPermitted: false,
      isArchiveModal: true,
      isOpenArchiveDeleteModal: false,
      archiveModalSubmitted: false,
      isDeleteCandidatePermitted: false,
      isArchiveCandidatePermitted: false,
      isUnarchiveCandidatePermitted: false,
      isExtendArchiveCandidate: false,
    };
  }

  componentWillMount() {
    let jobId;
    if (this.props.location.query.isAtsBoard) {
      jobId = this.props.location.query.jobId;
    } else {
      const decodedObject = this.getDecodedValues();
      jobId = decodedObject.jobId;
    }
    if (jobId) {
      this.props.loadOpeningById(jobId);
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

  componentWillReceiveProps(nextProps) {
    this.setState({
      profile: nextProps.profile
    });
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
            }
            currentRow.createdAt = activity.createdAt;
            currentRow.jobOpeningId = activity.jobOpeningId;
            currentRow = this.setRecentActivityDetail(activity, currentRow);
            recentActivityList.push(currentRow);
            if (i === activityList[jobOpeningId].length - 1 && this.state.searchTerm === '') {
              const staticRow = {};
              staticRow.userName = activity.userName;
              staticRow.jobOpeningId = activity.jobOpeningId;
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

  getYear = date => {
    const startDate = date.split('to')[0];
    let startYear = startDate == null ? '' :
      moment(startDate, 'YYYY-MM-DD').format('YYYY');
    if (startYear === 'Invalid date') {
      startYear = '';
    }
    return startYear;
  }

  getRenderEducationDetails = profile => {
    const educations = [];
    profile.educations.map(education => (
      (education.schoolName || education.degree) &&
      educations.push(
        <TimelineEvent
          icon={education.startDate ?
            this.renderTag(education.startDate) : ''}
          bubbleStyle={{
            backgroundColor: '#172B4D',
            width: '25px',
            left: '60px',
            height: '25px',
            border: '5px solid #fff',
            marginLeft: '-5px'
          }}

          titleStyle={{
            marginLeft: '45px'
          }}
          title={
            <span className={`${profileStyle.timeline_title}`}>
              {education.schoolName}
            </span>
          }
          contentStyle={{
            width: '90%',
            boxShadow: 'none',
            padding: '0',
            marginLeft: '35px',
            marginTop: '8px',
            marginBottom: '0px'
          }}
        >
          <Col lg={12} className={profileStyle.timeline_details}>
            <div>
              {education.degree}
            </div>
            <div>
              {
                (education.startDate || education.endDate) ?
                  `${education.startDate} — ${education.endDate}` : ''
              }
            </div>
          </Col>
        </TimelineEvent>)
    ));
    return educations;
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

  /* parseProfileObj = profile => {
    let data = profile && profile.length ? profile[0]._source : null;
    data = data && deFormatLinks(data);
    if (data) {
      const { experiences, educations } = data;
      data = {
        ...data,
        splitName: data.name.split(' '),
        mobileNumbers: data.mobile_number.length ? data.mobile_number.split(';').filter(e => e).join(', ') : [],
        emails: data.email.length ? data.email.split(';').filter(e => e) : [],
        overallScore: data.scores ? Math.round(data.scores.overall_score * 100) : null,
        skillScore: data.scores ? Math.round(data.scores.skill_score * 100) : null,
        mobilityScore: data.scores ? Math.round(data.scores.mobility_score * 100) : null,
        companyCultureScore: data.scores ? Math.round(data.scores.company_culture_score * 100) : null,
        pedigreeScore: data.scores ? Math.round(data.scores.pedigree_score * 100) : null,
        contactabilityScore: data.scores ? Math.round(data.scores.contactability_score * 100) : null,
        totalExperience: `( ~ ${Math.round(data.total_years_of_experience)}y exp)`,
        dob: data.dob === (null || '') ? '' : moment(data.dob, 'YYYY-MM-DD').format('DD-MMM-YYYY'),
        experiences: experiences && experiences.length ? experiences.map(exp => {
          let startDate = exp.start_date == null ? '' :
            moment(exp.start_date, 'YYYY-MM-DD').format('DD-MMM-YYYY');
          if (startDate === 'Invalid date') {
            startDate = exp.start_date;
          }
          let startYear = exp.start_date == null ? '' :
            moment(exp.start_date, 'YYYY-MM-DD').format('YYYY');
          if (startYear === 'Invalid date') {
            startYear = '';
          }
          let endDate = exp.end_date == null ? '' :
            moment(exp.end_date, 'YYYY-MM-DD').format('DD-MMM-YYYY');
          if (endDate === 'Invalid date') {
            endDate = exp.end_date;
          }
          return {
            ...exp,
            start_date: startDate,
            end_date: endDate,
            startYear,
            isUnknownDates: exp.start_date !== exp.end_date
          };
        }) : [],
        educations: educations && educations.length ? educations.map(edu => {
          const startYear = this.getYear(edu.dates_str);
          return {
            ...edu,
            startYear
          };
        }) : [],
        aboutMe: data.headline ||
          (data.github ? data.github.about_me : ''),
        githubStats: data.github ? {
          skills: data.github.skills.length ? data.github.skills.split(',') : [],
          followers: data.github.followers,
          following: data.github.following,
          repositories: data.github.repositories,
          stars: data.github.stars,
          link: data.github.link,
          aboutMe: data.github.about_me
        } : null,
        stackoverflowStats: data.stackoverflow ? {
          skills: data.stackoverflow.skills &&
            data.stackoverflow.skills.length ? data.stackoverflow.skills.split(',') : [],
          answers: data.stackoverflow.answers &&
            data.stackoverflow.answers.length ? data.stackoverflow.answers : 0,
          questions: data.stackoverflow.questions &&
            data.stackoverflow.questions.length ? data.stackoverflow.questions : 0,
          goldBadges: data.stackoverflow.gold_badge ? data.stackoverflow.gold_badge : 0,
          peopleReachedCount: data.stackoverflow.people_reached_count ? data.stackoverflow.people_reached_count : 0,
          reputation: data.stackoverflow.reputation ? data.stackoverflow.reputation : 0,
          silverBadges: data.stackoverflow.silver_badge ? data.stackoverflow.silver_badge : 0,
          bronzeBadges: data.stackoverflow.bronze_badge ? data.stackoverflow.bronze_badge : 0,
          link: data.stackoverflow.link
        } : null,
        hasSideTab: (data.github && data.github.link) || (data.stackoverflow && data.stackoverflow.link)
        || (data.headline),
        links: [
          // {
          //   domain: data.url.indexOf('xing') !== -1 ? 'xing' : '',
          //   url: data.url,
          //   srcImage: data.url.indexOf('xing') !== -1 ? '../icons/xing.svg' : '',
          //   alt: 'xing icon',
          //   className: ''
          // },
          // {
          //   domain: 'indeed',
          //   url: ''
          // },
          {
            domain: 'github',
            url: data.github ? data.github.link : null,
            srcImage: '../icons/github-sign.svg',
            alt: 'github icon',
            className: 'github_icon'
          },
          {
            domain: 'twitter',
            url: data.twitter,
            srcImage: '../icons/twitter.svg',
            alt: 'twitter icon',
            className: 'twitter_icon'
          },
          {
            domain: 'stackOverflow',
            url: data.stackoverflow ? data.stackoverflow.link : null,
            srcImage: '../icons/overflowing.svg',
            alt: 'stack overflow icon',
            className: 'stackoverflow_icon'
          },
          {
            domain: 'linkedin',
            url: data.linkedin,
            srcImage: '../linkedin.png',
            alt: 'linkedin icon',
          },
          {
            domain: 'xing',
            url: data.url.includes('xing') ? data.url : '',
            srcImage: '../socialIcons/Xing.svg',
            alt: 'xing icon',
          },
          {
            domain: 'facebook',
            url: data.facebook,
            srcImage: '../facebook.svg',
            alt: 'facebook icon',
            className: ''
          }
        ],
        // shortSkills: lodash.orderBy(data.skills, ['score'], ['desc', 'asc']).slice(0, 10),
        skills: lodash.orderBy(data.skills, ['score'], ['desc', 'asc'])
      };
      data.experiences = lodash.filter(data.experiences, experience => {
        if (experience.company_location ||
          experience.company_name || experience.title) {
          experience.titleUnavailable = false;
          return experience;
        }
      });
      data.educations = lodash.filter(data.educations, education => {
        if (education.school_name || education.school_location || education.title || education.dates_str) {
          return education;
        }
      });
      data.experiences = lodash.orderBy(data.experiences, ['startYear'], ['desc', 'asc']);
      data.shortExperiences = lodash.orderBy(data.experiences, ['startYear'], ['desc', 'asc']).slice(0, 10);
      data.educations = lodash.orderBy(data.educations, ['startYear'], ['desc', 'asc']);
      data.shortEducations = lodash.orderBy(data.educations, ['startYear'], ['desc', 'asc']).slice(0, 10);
      data.experiences.map((experience, index) => {
        if (experience.title === data.current_experience.title &&
          experience.company_name === data.current_experience.company_name &&
          experience.description === data.current_experience.description) {
          const currentExp = data.experiences.splice(index, 1);
          data.experiences.splice(0, 0, currentExp[0]);
          if (data.experiences.length > 10) {
            if (index > 9) {
              data.shortExperiences.splice(9, 1);
              data.shortExperiences.splice(0, 0, currentExp[0]);
            } else {
              const currentExpSrt = data.shortExperiences.splice(index, 1);
              data.shortExperiences.splice(0, 0, currentExpSrt[0]);
            }
          } else {
            const currentExpSrt = data.shortExperiences.splice(index, 1);
            data.shortExperiences.splice(0, 0, currentExpSrt[0]);
          }
        }
        return false;
      }
      );
    }
    return data;
  } */

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
      // if (this.props.profile.length > 0) {
      //   highlightOnLoad(`${this.props.profile[0]._source.id}-pane-1`, location.state);
      //   highlightOnLoad(`${this.props.profile[0]._source.id}-pane-1`, location.state);
      // }
    }, error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_PROFILE_SEARCHES'), { removeOnHover: true });
    });
    this.props.loadProfileScoreById([this.props.resumeId]);
  }

  loadActivities = () => {
    this.props.loadActivities(this.props.resumeId).then(response => {
      this.setState({ activityList: response });
    });
  }

  checkIfProfileIsSelected = (profile, selectedOpening) => {
    const { resumeIds } = selectedOpening;
    if (resumeIds && resumeIds.length) {
      if (profile) {
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
      toastr.success(i18n.t('successMessage.CANDIDATE_SELECTED'),
        i18n.t('successMessage.CANDIDATE_SELECTED_FOR_JOB_OPENING_SUCCESSFULLY'));
    }, err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_SELECT_CANDIDATE_FOR_JOB_OPENING'));
    });
  }

  removeCandidateFromJobProfile = resumeId => {
    const { selectedOpening } = this.props;
    this.props.removeCandidateFromJobProfile(selectedOpening.id, resumeId).then(() => {
      toastr.success(i18n.t('successMessage.CANDIDATE_REMOVED'),
        i18n.t('successMessage.CANDIDATE_REMOVED_SUCCESSFULLY')); toastr.removeByType('error');
    }, err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_REMOVE_CANDIDATE_FROM_JOB_OPENING'));
      toastr.removeByType('success');
    });
  }

  attachButtonsToDom = (isSelected, profile, selectedOpening) => (
    <div>
      <button
        className={`btn btn-border right ${styles.shortlist_button}
      ${isSelected ? styles.selected : styles.not_selected}`}
        title={isSelected ? i18n.t('tooltipMessage.CANDIDATE_HAS_BEEN_SELECTED_FOR_THIS_JOB') :
          i18n.t('tooltipMessage.CANDIDATE_IS_AVAILABLE_FOR_SELECTION')}
        onClick={!this.checkIfProfileIsSelected(profile, selectedOpening) ?
          () => this.saveJobProfile(profile.id,
            profile[0].elasticId)
          :
          () => this.removeCandidateFromJobProfile(profile.id)}
        tabIndex="-1"
      >
        <i className={isSelected ? 'fa fa-check-circle' : 'fa fa-plus-circle'} />
        {isSelected ? i18n.t('SELECTED') : i18n.t('SELECT')}
      </button>
    </div>
  );

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

  isKnownLanguagesEmpty = languages => {
    if (!languages) {
      return true;
    }
    const knownLanguages = languages.filter(languageObject => languageObject.language !== '');
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
    const data = {
      score: value.score === 'yes',
      withContact: value.contact === 'yes',
      language: value.language,
      header: true,
      footer: true,
      page: 'A4',
      layout: 'Portrait'
    };
    const url =
    `${Constants.superProfileDownLoad.url}/${resumeId}?options=${JSON.stringify(data)}&access_token=${this.authToken}`;
    window.open(url);
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
      `${startDateStr} — ${endDateStr}` :
      `${startDateStr} ${endDateStr}`;
  }
  iterateMapAndAttachValues = arrays => {
    let totalString = '';
    if (arrays) {
      arrays.map((array, index) => {
        totalString += array.name;
        if (totalString && index !== arrays.length - 1) {
          totalString = `${totalString}, `;
        }
        return true;
      });
    }
    return `${totalString}`;
  }
  fetchFiles = () => {
    this.props.fetchCandidateFiles(this.props.resumeId).then(() => { },
      error => {
        toastrErrorHandling(error.error, i18n.t('FILE_UPLOAD_ERROR'),
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
  showSkillsOnClick = () => {
    this.setState({
      showAllSkills: !this.state.showAllSkills
    });
  };
  showExperiencesOnClick = () => {
    this.setState({
      showAllExperiences: !this.state.showAllExperiences
    });
  };
  opendownloadOption = () => {
    this.setState({
      opendownloadOption: !this.state.opendownloadOption
    });
    const ele = document.getElementById(this.props.profile.id);
    ele.addEventListener('click', this.handleOutsideClick, false);
  }
  handleOutsideClick = () => {
    this.setState({
      opendownloadOption: false
    });
    const ele = document.getElementById(this.props.profile.id);
    ele.removeEventListener('click', this.handleOutsideClick, false);
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
  // emailString = (email, index, emailsArr) => {
  //   let emailString = '';
  //   if (index !== emailsArr.length - 1) {
  //     emailString = `${email}, `;
  //   } else {
  //     emailString = email;
  //   }
  //   return emailString;
  // }

  goToPreviousPage = () => {
    hashHistory.goBack();
  }

  gotoOpeningPage = jobOpeningId => {
    sessionStorage.setItem('profileTabKey', 2);
    this.props.pushState({
      pathname: `/Openings/${jobOpeningId}`,
      query: { tab: 'activity' }
    });
  }
  selectAction = (key, evt, resumeId) => {
    let isArchive = true;
    if (key === '1') {
      if (evt.target.innerText === i18n.t('ARCHIVE')) {
        this.initiateArchive(resumeId, isArchive);
      } else if (evt.target.innerText === i18n.t('ARCHIVE_SCHEDULED')) {
        this.getArchiveDetails(resumeId, isArchive);
      } else {
        this.props.unArchiveCandidate(resumeId).then(res => {
          toastr.success('', res);
          this.props.profile.isArchived = false;
        });
      }
    } else {
      this.props.loadDeleteReasons({
        reasonType: 'CANDIDATE_DELETION',
      });
      isArchive = false;
      this.toggleArchiveValue(isArchive);
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

  renderTag = date => {
    const year = moment(date).format('YYYY');
    return (
      <div>
        <div className={profileStyle.timeline_tag}>
          {year}
        </div>
      </div>
    );
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

  renderSkills = skills => {
    const skillScore = Math.round(skills[0].score * 100) + 1;
    const colorScale = chroma
      .scale(['#959cab', '#172B4D'])
      .colors(skillScore);
    return skills.map(skill => (
      <div
        key={Math.random().toString(36).substring(8)}
        id={skill.id}
        className={profileStyle.skill}
      >
        <span
          className={profileStyle.name}
          style={{ backgroundColor: colorScale[Math.round(skill.score * 100)] }}
        >{skill.name}</span>
        {
          skill.experience &&
          <span className={profileStyle.experience}>{skill.experience}</span>
        }
      </div>
    ));
  }

  render() {
    const { profile, selectedOpening, profileScore, candidateEmailsLoading,
      fetching, profileActivityLoading, openingLoading, resumeId, user, loadArchivalCandidateData,
      archiveCandidateData } = this.props;
    const { fileName, fileId, openSlider, showAllSkills, showAllExperiences, opendownloadOption,
      openingList, isFilesPermitted, isEmailsPermitted, isArchiveCandidatePermitted,
      isUnarchiveCandidatePermitted, isDeleteCandidatePermitted, searchTerm, activeKey, activityList,
      searchActivtyLoading } = this.state;
    let jobId;
    let socialMetadata;
    let educations;
    if (this.props.location.query.isAtsBoard) {
      jobId = this.props.location.query.jobId;
    } else {
      // scores = JSON.parse(Object.values(this.props.location.query).join('')).scores;
      jobId = JSON.parse(Object.values(this.props.location.query).join('')).jobId;
      // isBestMatch = JSON.parse(Object.values(this.props.location.query).join('')).isBestMatch;
    }
    if (profile) {
      socialMetadata = profile.socialMetadata;
      educations = this.getRenderEducationDetails(profile);
    }
    const isSelected = this.checkIfProfileIsSelected(profile, selectedOpening);
    const recentActivityList = this.getRecentActivityList(activityList);
    return (
      <Col xs={12} className={styles.view_profile}>
        <Helmet title={profile ? profile.name : 'Profile'} />
        {
          selectedOpening && selectedOpening.company && selectedOpening.openinglocations && jobId ?
            <div style={{ marginBottom: '0px' }}>
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
            <div className="company_container">
              <Col
                xs={12}
                lg={12}
                className={`${styles.profile_section} opening_container ${styles.white_bg} shadow_one`}
                id={profile.id}
              >
                <Col lg={12} className="p-0">
                  <Col lg={12} className="p-0 p-b-10">
                    <div className={`${profileStyle.profile_name_top}`}>
                      <Col lg={7}>
                        {
                          <Link onClick={this.goToPreviousPage} style={{ position: 'relative', top: '-5px' }}>
                            <i className="fa fa-long-arrow-left" style={{ cursor: 'pointer' }} aria-hidden="true" />
                          </Link>
                        }
                        <span
                          className={`${profileStyle.text_wrap} ${profileStyle.profileName}`}
                          title={profile.name}
                        >
                          {profile.salutation ?
                            `${profile.salutation} ${profile.name}` : profile.name}
                        </span>
                      </Col>
                      <Col lg={5}>
                        { (isArchiveCandidatePermitted && !profile.isArchived && !profile.isDeleteInitiated) ||
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
                              { (isArchiveCandidatePermitted && !profile.isArchived && !profile.isDeleteInitiated) ||
                              (isUnarchiveCandidatePermitted && profile.isArchived) ?
                                <MenuItem eventKey="1">
                                  { this.renderArchiveMenu() }
                                </MenuItem>
                                : null
                              }
                              { isDeleteCandidatePermitted && !profile.isArchived &&
                              !profile.isArchiveScheduled && !profile.isDeleteInitiated ?
                                <MenuItem eventKey="3">
                                  <Trans>PERMANENTLY_DELETE</Trans>
                                </MenuItem> : null}
                            </DropdownButton>
                          </ButtonGroup> : null }
                        <NewPermissible operation={{ operation: 'DOWNLOAD_SUPER_PROFILE', model: 'document' }}>
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
                      </Col>
                    </div>
                  </Col>
                  <Tabs
                    activeKey={this.state.activeKey}
                    onSelect={this.handleSelect}
                    className={`${profileStyle.tab_section} shadow_one`}
                    id={profile.id}
                  >
                    <Tab eventKey={1} title={i18n.t('OVERVIEW')}>
                      <Col sm={12} className={`${profileStyle.profile_section_top} p-0`}>
                        <Col md={(profile.github || profile.stackoverflow) ? 9 : 12} sm={12} className="p-0">
                          <div className={`${profileStyle.profile_container}`}>
                            <Row className={`${profileStyle.profile_block} m-0`}>
                              <Col sm={1} className={`${profileStyle.profile_image_container} p-0`}>
                                <span
                                  className={`${profileStyle.profile_image} ${profile.middleName || profile.lastName ?
                                    '' : 'p-lr-20'}`}
                                >
                                  {profile.firstName && profile.firstName.charAt(0).toUpperCase()}
                                  {profile.lastName && profile.lastName.charAt(0).toUpperCase()}
                                </span>
                              </Col>
                              <Col sm={6} className={'p-0'}>
                                <div>
                                  <div
                                    className={`${profileStyle.profile_name} ${profileStyle.text_wrap}`}
                                    title={profile.name}
                                  >
                                    {profile.salutation ?
                                      `${profile.salutation} ${profile.name}` :
                                      profile.name }
                                    <span className={profileStyle.total_experiance}>
                                      {`( ~ ${Math.round(profile.totalYearsOfExperience)}y exp)`}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  {/* <div className={profileStyle.person_resumeid}>
                                  Resume ID:{profile.id}
                                </div> */}
                                </div>
                                {
                                  profile.currentExperience ?
                                    <div>
                                      <div className={profileStyle.current_position}>
                                        {profile.currentExperience.position &&
                                          `${profile.currentExperience.position}, `}
                                        {profile.currentExperience.companyName || ''}
                                      </div>
                                    </div>
                                    : null
                                }
                              </Col>
                              <Col sm={5} className={`${profileStyle.progress_score} p-0`}>
                                {profileScore &&
                                  profileScore.profile_list &&
                                  profileScore.profile_list[0] &&
                                  profileScore.profile_list[0].mobility_score &&
                                  <Col sm={4} className={`${profileStyle.score}`}>
                                    <CircularProgressbar
                                      initialAnimation
                                      percentage={Math.round(profileScore.profile_list[0].mobility_score * 100) || 0}
                                      className={profileStyle.progressbar_profile}
                                    />
                                    <div className={profileStyle.score_text}>
                                      <Trans>CHANGE_PROBABILITY</Trans>
                                    </div>
                                  </Col>
                                }
                                {profileScore &&
                                  profileScore.profile_list &&
                                  profileScore.profile_list[0] &&
                                  profileScore.profile_list[0].pedigree_score &&
                                  <Col sm={4} className={`${profileStyle.score}`}>
                                    <CircularProgressbar
                                      initialAnimation
                                      percentage={Math.round(profileScore.profile_list[0].pedigree_score * 100) || 0}
                                      className={profileStyle.progressbar_profile}
                                    />
                                    <div className={profileStyle.score_text}>
                                      <Trans>PEDIGREE</Trans>
                                    </div>
                                  </Col>
                                }
                                { profile.profileLogo ?
                                  <Col sm={5} className="right">
                                    <img
                                      src={`${Constants.logoURL.url}/profileLogo`}
                                      alt="TalentSteps"
                                      style={{ maxWidth: '150px' }}
                                      className="img-responsive"
                                    />
                                  </Col>
                                  : ''}
                                {
                                  profileScore.profile_list &&
                                  profileScore.profile_list[0].mobility_skills &&
                                  <Col sm={4} className={`${profileStyle.score}`}>
                                    <CircularProgressbar
                                      initialAnimation
                                      percentage={Math.round(profileScore.profile_list[0].mobility_skills * 100) || 0}
                                      className={profileStyle.progressbar_profile}
                                    />
                                    <div className={profileStyle.score_text}>
                                      <Trans>SKILLS</Trans>
                                    </div>
                                  </Col>
                                }
                              </Col>

                            </Row>
                            <Row className={`${profileStyle.block_2} m-0`}>
                              <Col sm={5} className={`${profileStyle.left_panel}`}>
                                <div
                                  className={`${profileStyle.skills}`}
                                >
                                  <div className={`${profileStyle.head}`}>
                                    <Trans>SKILLS</Trans>
                                  </div>
                                  <div className={` ${(!showAllSkills && (profile.skills.length > 20)) ?
                                    profileStyle.showheight : ''}`}
                                  >
                                    {/* {
                                      profile.skills.map(skill => (
                                        <Row id={skill.id} className={`${profileStyle.skill}`}>
                                          <Col sm={6} className="p-0">
                                            <div className={profileStyle.name} title={skill.name}>{skill.name}</div>
                                          </Col>
                                          <Col sm={6} className="p-0">
                                            <div className={`${profileStyle.progress_bar} progress`}>
                                              <div
                                                className="progress-bar"
                                                role="progressbar"
                                                aria-valuenow={Math.round(skill.score * 100) || 0}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${Math.round(skill.score * 100)}%` || 0 }}
                                              />
                                            </div>
                                            <span className={`${profileStyle.progress_bar_score}`}>
                                              {Math.round(skill.score * 100) || 0}%
                                            </span>
                                          </Col>
                                        </Row>)
                                      )
                                    } */}
                                    {
                                      this.renderSkills(profile.skills)
                                    }
                                  </div>
                                  {
                                    profile.skills.length > 20 &&
                                    <div
                                      className={profileStyle.showAll}
                                      role="presentation"
                                      onClick={this.showSkillsOnClick}
                                    >
                                      {
                                        !showAllSkills ?
                                          <h4><Trans>SHOW_ALL</Trans></h4>
                                          :
                                          <h4><Trans>SHOW_LESS</Trans></h4>
                                      }
                                    </div>
                                  }
                                </div>
                                <div className={`${profileStyle.skills} m-t-40`}>
                                  <div className={`${profileStyle.head}`}>
                                    <Trans>CONTACT</Trans>
                                  </div>
                                  {
                                    profile.contacts.mobileNumbers.length ?
                                      <div className={`${profileStyle.contact} ${profileStyle.phone_number} `}>
                                        <i className="fa fa-phone" aria-hidden="true" />
                                        {profile.contacts.mobileNumbers.join(',')}
                                        {profile.contacts.alternateNumbers.length > 0 ?
                                          `,${profile.contacts.alternateNumbers.join(',')}` : ''}
                                      </div>
                                      : null
                                  }
                                  {
                                    profile.contacts.emails.length ?
                                      <div className={profileStyle.emails}>
                                        <i className="fa fa-envelope-o" aria-hidden="true" />
                                        {
                                          profile.contacts.emails.map(email =>
                                            (
                                              email &&
                                              <span className="m-r-5">
                                                <Link to={`mailto:${email}?Subject=''`} target="_top">
                                                  {email}
                                                </Link>
                                              </span>
                                            )
                                          )
                                        }
                                      </div>
                                      : null
                                  }
                                  {socialMetadata.github &&
                                    socialMetadata.github.url &&
                                    <div className={profileStyle.link}>
                                      <i className="fa fa-external-link" aria-hidden="true" />
                                      {/* <div className={profileStyle.link1}>
                                      www.reynoldgeo.com
                                    </div> */}
                                      <div className={profileStyle.link1}>
                                        <a
                                          target="_blank"
                                          href={`${socialMetadata.github.url}`}
                                        >
                                          {socialMetadata.github.url}
                                        </a>
                                      </div>
                                    </div>
                                  }
                                  <div className={`${profileStyle.social} `}>
                                    {
                                      Object.keys(socialIcons).map(socialIcon => (
                                        profile[socialIcon] && (
                                          <span className={`${profileStyle.link} ${profileStyle.active_link}`}>
                                            <a
                                              className={`${profileStyle.social_icon}`}
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
                                </div>
                                <div className={`${profileStyle.skills} m-t-40`}>
                                  <div className={`${profileStyle.head}`}>
                                    <Trans>PERSON</Trans>
                                  </div>
                                  <Row className={`${profileStyle.personal} m-0`}>
                                    <Col sm={5} className={`${profileStyle.personal_head} p-0`}>
                                      <span><Trans>DOB</Trans></span>
                                    </Col>
                                    <Col sm={7} className={`${profileStyle.personal_body} p-0`}>
                                      <span>
                                        {profile.dob ? profile.dob : <Trans>NOT_AVAILABLE</Trans>}
                                      </span>
                                    </Col>
                                  </Row>
                                  <Row className={`${profileStyle.personal} m-0`}>
                                    <Col sm={5} className={`${profileStyle.personal_head} p-0`}>
                                      <span><Trans>PLACE_OF_BIRTH</Trans></span>
                                    </Col>
                                    <Col sm={7} className={`${profileStyle.personal_body} p-0`}>
                                      <span>
                                        {profile.placeOfBirth ?
                                          profile.placeOfBirth : <Trans>NOT_AVAILABLE</Trans>}</span>
                                    </Col>
                                  </Row>
                                  <Row className={`${profileStyle.personal} m-0`}>
                                    <Col sm={5} className={`${profileStyle.personal_head} p-0`}>
                                      <span><Trans>NATIONALITY</Trans></span>
                                    </Col>
                                    <Col sm={7} className={`${profileStyle.personal_body} p-0`}>
                                      <span>{profile.nationality || <Trans>NOT_AVAILABLE</Trans>}</span>
                                    </Col>
                                  </Row>
                                  <Row className={`${profileStyle.personal} m-0`}>
                                    <Col sm={5} className={`${profileStyle.personal_head} p-0`}>
                                      <span><Trans>CITY</Trans></span>
                                    </Col>
                                    <Col sm={7} className={`${profileStyle.personal_body} p-0`}>
                                      <span>{profile.address.city || <Trans>NOT_AVAILABLE</Trans>}</span>
                                    </Col>
                                  </Row>
                                  <Row className={`${profileStyle.personal} m-0`}>
                                    <Col sm={5} className={`${profileStyle.personal_head} p-0`}>
                                      <span><Trans>LANGUAGES</Trans></span>
                                    </Col>
                                    <Col sm={7} className={`${profileStyle.personal_body} p-0`}>
                                      <span>
                                        {this.iterateMapAndAttachValues(profile.languages) ||
                                          <Trans>NOT_AVAILABLE</Trans>}
                                      </span>
                                    </Col>
                                  </Row>
                                </div>
                              </Col>
                              <Col sm={7} className={`${profileStyle.right_panel}`}>
                                {
                                  profile.experiences && profile.experiences.length > 0 &&
                                  <div className={`${profileStyle.projects}`}>
                                    <div className={`${profileStyle.head}`}>
                                      <Trans>WORK_EXPERIENCE</Trans>
                                    </div>
                                    <div>
                                      <Timeline className={profileStyle.timeline}>
                                        {
                                          !showAllExperiences ?
                                            profile.experiences.slice(0, 10).map(experience => {
                                              if (experience.companyName || experience.position) {
                                                return (
                                                  <TimelineEvent
                                                    icon={experience.startDateAsStr ?
                                                      this.renderTag(experience.startDateAsStr) : ''}
                                                    bubbleStyle={{
                                                      backgroundColor: '#172B4D',
                                                      width: '25px',
                                                      left: '60px',
                                                      height: '25px',
                                                      border: '5px solid #fff',
                                                      marginLeft: '-5px'
                                                    }}

                                                    titleStyle={{
                                                      marginLeft: '45px'
                                                    }}
                                                    title={
                                                      <span className={profileStyle.timeline_title}>
                                                        {experience.position}
                                                      </span>
                                                    }
                                                    contentStyle={{
                                                      width: '90%',
                                                      boxShadow: 'none',
                                                      padding: '0',
                                                      marginLeft: '35px',
                                                      marginTop: '8px'
                                                    }}
                                                  >
                                                    <Col lg={12} className={profileStyle.timeline_details}>
                                                      <div>
                                                        {experience.companyName}
                                                      </div>
                                                      <div>
                                                        {
                                                          (experience.startDateAsStr || experience.endDateAsStr) ?
                                                            `${experience.startDateAsStr} — ${experience.endDateAsStr}`
                                                            : ''
                                                        }
                                                      </div>
                                                    </Col>
                                                  </TimelineEvent>
                                                );
                                              }
                                              return null;
                                            }) :
                                            profile.experiences.map(experience => {
                                              if (experience.companyName || experience.position) {
                                                return (
                                                  <TimelineEvent
                                                    icon={experience.startDate ?
                                                      this.renderTag(experience.startDate) : ''}
                                                    bubbleStyle={{
                                                      backgroundColor: '#172B4D',
                                                      width: '25px',
                                                      left: '60px',
                                                      height: '25px',
                                                      border: '5px solid #fff',
                                                      marginLeft: '-5px'
                                                    }}

                                                    titleStyle={{
                                                      marginLeft: '45px'
                                                    }}
                                                    title={
                                                      <span className={profileStyle.timeline_title}>
                                                        {experience.position}
                                                      </span>
                                                    }
                                                    contentStyle={{
                                                      width: '90%',
                                                      boxShadow: 'none',
                                                      padding: '0',
                                                      marginLeft: '35px',
                                                      marginTop: '8px'
                                                    }}
                                                  >
                                                    <Col lg={12} className={profileStyle.timeline_details}>
                                                      <div>
                                                        {experience.companyName}
                                                      </div>
                                                      <div>
                                                        {
                                                          (experience.startDateAsStr || experience.endDateAsStr) ?
                                                            `${experience.startDateAsStr} — ${experience.endDateAsStr}`
                                                            : ''
                                                        }
                                                      </div>
                                                    </Col>
                                                  </TimelineEvent>
                                                );
                                              }
                                              return null;
                                            })
                                        }
                                      </Timeline>
                                    </div>
                                    {
                                      profile.experiences.length > 10 &&
                                      <div
                                        className={profileStyle.showAll}
                                        role="presentation"
                                        onClick={this.showExperiencesOnClick}
                                      >
                                        {
                                          !showAllExperiences ?
                                            <h4><Trans>SHOW_ALL</Trans></h4>
                                            :
                                            <h4><Trans>SHOW_LESS</Trans></h4>
                                        }
                                      </div>
                                    }
                                  </div>
                                }
                                {
                                  profile.educations !== null && profile.educations.length > 0 &&
                                    <div className={`${profileStyle.projects}`}>
                                      {educations.length > 0 &&
                                      <div>
                                        <div className={`${profileStyle.head}`}>
                                          <Trans>EDUCATION</Trans>
                                        </div>
                                        <div>
                                          <Timeline className={profileStyle.timeline}>
                                            {educations}
                                          </Timeline>
                                        </div>
                                      </div>}
                                    </div>
                                }
                                {/* <div className={profileStyle.certification}>
                                  <div className={profileStyle.title}>
                                    CERTIFICATION
                                  </div>
                                  <div className={profileStyle.head}>
                                    PMP
                                  </div>
                                  <div className={profileStyle.body}>
                                    Project Management Institute
                                  </div>
                                  <div className={profileStyle.head}>
                                    CAPM
                                  </div>
                                  <div className={profileStyle.body}>
                                    Project Management Institute
                                  </div>
                                  <div className={profileStyle.head}>
                                    Prince2 Foundation
                                  </div>
                                  <div className={profileStyle.body}>
                                    GMT Consulting and training
                                  </div>
                                </div> */}
                              </Col>
                            </Row>
                          </div>
                        </Col>
                        <Col
                          md={3}
                          sm={12}
                          className={`${profileStyle.profile_section} 
                          ${(profile.github || profile.stackoverflow) ? '' : 'hide'}`}
                        >
                          {socialMetadata.github &&
                            socialMetadata.github.url &&

                            <Col md={12} sm={5} className={`${profileStyle.social_accounts_github}`}>
                              <div className={`${profileStyle.account_github} p-5 p-b-10`}>
                                <Row className={`${profileStyle.account_github} m-0`}>
                                  <Col sm={2} className={'p-0'}>
                                    <img
                                      src={'/icons/github-sign.svg'}
                                      className={'img-responsive'}
                                      alt={'github'}
                                    />
                                  </Col>
                                  <Col sm={8} className={`${profileStyle.account_github_name}`}>
                                    <Trans>GITHUB</Trans>
                                  </Col>
                                </Row>
                              </div>
                              <Row className={`${profileStyle.stats} m-0`}>
                                <Col sm={4} className={'p-0'}>
                                  <div className={profileStyle.stats_value}>
                                    {socialMetadata.github.repositories || 0}
                                  </div>
                                  <div className={profileStyle.stats_head}>
                                    <Trans>REPOSITORIES</Trans>
                                  </div>
                                </Col>
                                <Col sm={2} className={'p-0'}>
                                  <div className={profileStyle.stats_value}>
                                    {socialMetadata.github.stars || 0}
                                  </div>
                                  <div className={profileStyle.stats_head}>
                                    <Trans>STARS</Trans>
                                  </div>
                                </Col>
                                <Col sm={3} className={'p-0'}>
                                  <div className={profileStyle.stats_value}>
                                    {socialMetadata.github.followers || 0}
                                  </div>
                                  <div className={profileStyle.stats_head}>
                                    <Trans>FOLLOWERS</Trans>
                                  </div>
                                </Col>
                                <Col sm={3} className={'p-0'}>
                                  <div className={profileStyle.stats_value}>
                                    {socialMetadata.github.following || 0}
                                  </div>
                                  <div className={profileStyle.stats_head}>
                                    <Trans>FOLLOWING</Trans>
                                  </div>
                                </Col>
                              </Row>
                              {
                                socialMetadata.github.aboutMe &&
                                <div className={profileStyle.about}>
                                  {socialMetadata.github.aboutMe}
                                </div>
                              }
                              {
                                socialMetadata.github.url &&
                                <div className={profileStyle.seemore}>
                                  <a
                                    target="_blank"
                                    href={`${socialMetadata.github.url}`}
                                  >
                                    <Trans>SEEMORE</Trans>
                                  </a>
                                </div>
                              }
                            </Col>
                          }
                          {
                            socialMetadata.stackoverflow &&
                            socialMetadata.stackoverflow.url &&
                            <Col
                              md={12}
                              sm={5}
                              className={`${profileStyle.social_accounts_stackoverflow}
                                ${socialMetadata.github ? 'right' : ''}`}
                            >
                              <div>
                                <Row className={`${profileStyle.account_stackoverflow} m-0`}>
                                  <Col sm={2} className={'p-0'}>
                                    <img
                                      src={'/icons/overflowing.svg'}
                                      className={'img-responsive'}
                                      alt={'sd'}
                                    />
                                  </Col>
                                  <Col sm={8} className={`${profileStyle.account_stackoverflow_name}`}>
                                    <Trans>STACKOVERFLOW</Trans>
                                  </Col>
                                  {/* <Col sm={5} className={`${profileStyle.button}`}>
                                    top 0.01%
                                  </Col> */}
                                </Row>
                                <div className={profileStyle.reputation}>
                                  <div className={profileStyle.value}>
                                    {socialMetadata.stackoverflow.reputation}
                                  </div>
                                  <div className={profileStyle.head}>
                                    <Trans>REPUTATION</Trans>
                                  </div>
                                </div>
                                <Row className={`${profileStyle.stackoverflow_card} m-0`}>
                                  <Col sm={4} className={'p-0'}>
                                    <div className={`${profileStyle.gold}`}>
                                      <span />{socialMetadata.stackoverflow.goldBadgeCount}
                                    </div>
                                  </Col>
                                  <Col sm={4} className={'p-0'}>
                                    <div className={`${profileStyle.silver}`}>
                                      <span />{socialMetadata.stackoverflow.silverBadgeCount}
                                    </div>
                                  </Col>
                                  <Col sm={4} className={'p-0'}>
                                    <div className={`${profileStyle.bronze}`}>
                                      <span />{socialMetadata.stackoverflow.bronzeBadgeCount}
                                    </div>
                                  </Col>
                                </Row>
                                <Row className={`${profileStyle.stackoverflow_follower} m-0`}>
                                  <Col sm={4} className={'p-0'}>
                                    <div className={profileStyle.value}>
                                      {socialMetadata.stackoverflow.answersCount}
                                    </div>
                                    <div className={profileStyle.head}>
                                      <Trans>ANSWERS</Trans>
                                    </div>
                                  </Col>
                                  <Col sm={4} className={'p-0'}>
                                    <div className={profileStyle.value}>
                                      {socialMetadata.stackoverflow.questionsCount}
                                    </div>
                                    <div className={profileStyle.head}>
                                      <Trans>QUESTIONS</Trans>
                                    </div>
                                  </Col>
                                  <Col sm={4} className={'p-0'}>
                                    <div className={profileStyle.value}>
                                      {socialMetadata.stackoverflow.peopleReachedCount}
                                    </div>
                                    <div className={profileStyle.head}>
                                      <Trans>PEOPLEREACHED</Trans>
                                    </div>
                                  </Col>
                                </Row>
                                {
                                  socialMetadata.stackoverflow.url &&
                                  <div className={profileStyle.seemore}>
                                    <a
                                      href={socialMetadata.stackoverflow.url}
                                      target="_blank"
                                    >
                                      <Trans>SEEMORE</Trans>
                                    </a>
                                  </div>
                                }
                              </div>
                            </Col>
                          }
                          {
                            profile.github && profile.github.aboutMe &&
                            <Col md={12} sm={12} className={`${profileStyle.aboutme}`}>
                              <div className={profileStyle.head}>
                                ABOUT ME
                              </div>
                              <div className={profileStyle.body}>
                                {profile.github.aboutMe}
                              </div>
                            </Col>
                          }
                        </Col>
                      </Col>

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
                          autoHeightMin={'calc(100vh - 165px)'}
                          autoHeightMax={'calc(100vh - 165px)'}
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
                                          title={i18n.t(archivalActivity.action.toUpperCase())}
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
                              <div>
                                {profileActivityLoading || (activityList['0'] && activityList['0'].length)
                                || (recentActivityList['1']) ?
                                  '' : this.renderNoResultsFound()}
                              </div>
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
                        <FileDropper
                          fetching={fetching}
                          files={this.props.files}
                          uploadFile={this.uploadFile}
                          deleteFile={this.deleteFiles}
                          uploading={this.props.uploading}
                          openSlider={this.OpenFileSlider}
                          user={user}
                        />
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
                    <Tab eventKey={5} title={i18n.t('JOB_OPENINGS')}>
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
                    </Tab>
                  </Tabs>
                </Col>
                {/* <div className={styles.dropdown_section}>
                  <ButtonToolbar>
                    {/* <DropdownButton
                      title={<span className={`${styles.options_btn} glyphicon glyphicon-option-vertical`} />}
                      pullRight
                      id="dropdown-size-small"
                      noCaret
                      className={styles.superprofilebtn}
                    > */}
                {/* <MenuItem eventKey="1">
                    <span className="glyphicon glyphicon-pencil" aria-hidden="true" />
                    <span className={`${styles.dropdown_options} p-l-5`}>Edit Profile</span>
                  </MenuItem> */}
                {/* <MenuItem eventKey="2" onClick={() => this.printResume(event, 'contact')}>
                  <span className="glyphicon glyphicon-download-alt" />
                  <span className={`${styles.dropdown_options} p-l-5`}>Download with contact</span>
                </MenuItem>
                <MenuItem eventKey="3" onClick={() => this.printResume(event, 'code')}>
                  <span className="glyphicon glyphicon-download-alt" />
                  <span className={`${styles.dropdown_options} p-l-5`}>Download without contact</span>
                </MenuItem> */}
                {/* </DropdownButton> */}
                {/* </ButtonToolbar>
              </div>  */}
              </Col>

              {openSlider ?
                <Col xs={12} lg={4} className={profileStyle.profile_section} >
                  <FileView
                    closeSlider={this.closeSlider}
                    fileId={fileId}
                    fileName={fileName}
                  />
                </Col>
                : null}
            </div> : null
        }
        {
          opendownloadOption &&
          <DownloadForm
            closedownloadOption={this.closedownloadOption}
            isViewprofile={false}
          />
        }
        {
          <Loader loading={loadArchivalCandidateData} styles={{ position: 'absolute', top: '50%' }} />
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
              archiveCandidateData={archiveCandidateData}
              initialValues={this.initialData()}
              archiveModalSubmitted={this.state.archiveModalSubmitted}
              btnText={this.renderArchiveMenu()}
              btnTextSuffix="CANDIDATE"
            />
        }
      </Col>
    );
  }
}
