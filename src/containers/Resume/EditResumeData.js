import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { push as pushState } from 'react-router-redux';
import { isDirty, hasSubmitSucceeded, change, getFormValues } from 'redux-form';
import Moment from 'moment';
import ResumeForm from '../../components/ResumeForm/ResumeForm';
import { discardResumeData, loadCandidateByIdToEdit, updateCandidate } from '../../redux/modules/resume-parser';
import Loader from '../../components/Loader';
import toastrErrorHandling from '../toastrErrorHandling';
import { trimExtraSpaces, validateData, dateDiffInYears } from '../../utils/validation';
import i18n from '../../i18n';
import styles from './Resume.scss';

const listOfEndDateWords = ['present', 'till date', 'bis heute', 'heute'];
@connect(
  (state, route) => ({
    loading: state.resumeParser.loading,
    user: state.auth.user,
    isCandidateProfileChanged: isDirty('MultiPartForm')(state),
    isCandidateProfileSubmitted: hasSubmitSucceeded('MultiPartForm')(state),
    candidateId: route.params.id,
    locationState: route.location.state || null,
    values: getFormValues('MultiPartForm')(state),
  }),
  { discardResumeData,
    pushState,
    loadCandidateByIdToEdit,
    updateCandidate,
    change }
)
export default class EditResumeData extends Component {
  static propTypes = {
    discardResumeData: PropTypes.func.isRequired,
    updateCandidate: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    pushState: PropTypes.func.isRequired,
    candidateId: PropTypes.string,
    loadCandidateByIdToEdit: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]).isRequired,
    route: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    locationState: PropTypes.object,
    isCandidateProfileChanged: PropTypes.bool.isRequired,
    isCandidateProfileSubmitted: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    candidateId: null,
    candidateJson: {},
    resumeJson: {},
    locationState: null,
    loading: false
  }

  constructor(props) {
    super(props);
    this.state = { formData: {},
      isSubmitDisabled: false,
      activeKey: 1,
      showInfoMessage: false,
      previousValues: []
    };
  }

  componentWillMount() {
    this.props.loadCandidateByIdToEdit(this.props.candidateId).then(list => {
      const setEditData = list;
      const keys = ['current_experience', 'experiences',
        'educations', 'github', 'languages_known', 'skills', 'stackoverflow'];
      keys.forEach(key => {
        if (setEditData[key] === null) {
          setEditData[key] = [];
        }
        return setEditData[key];
      });
      let activeKey = 1;
      if (this.props.locationState && this.props.locationState.from === 'ATS') {
        activeKey = 2; // move to experience tab
      }
      this.setState({
        datas: setEditData,
        previousValues: setEditData,
        activeKey,
        showInfoMessage: this.props.locationState && this.props.locationState.from === 'ATS'
      });
    });
  }

  componentDidMount() {
    const { route, router } = this.props;
    if (route && router) {
      router.setRouteLeaveHook(route, () => {
        const { isCandidateProfileChanged, isCandidateProfileSubmitted } = this.props;
        if (isCandidateProfileChanged && !isCandidateProfileSubmitted) {
          return i18n.t('confirmMessage.UNSAVED_CHANGES');
        }
      });
    }
  }

  componentWillUnmount() {
    this.props.discardResumeData();
  }

  getSkills = skills => {
    const profileSkills = skills.map(skill => ({
      name: skill.name,
      experience: skill.experience,
      experienceMonths: skill.experienceMonths,
      level: skill.level
    }));
    if (profileSkills.length === 0) {
      profileSkills.push({});
    }
    return profileSkills;
  }

  getVisas = visas => {
    const profileVisas = visas.map(visa => ({
      visa: visa.visa,
      visa_country: visa.visa_country,
      visa_valid_date: visa.visa_valid_date,
      res_permit: visa.res_permit,
      res_permit_country: visa.res_permit_country,
      res_permit_valid_date: visa.res_permit_valid_date,
      work_permit: visa.work_permit,
      work_permit_country: visa.work_permit_country,
      work_permit_valid_date: visa.work_permit_valid_date
    }));
    if (profileVisas.length === 0) {
      profileVisas.push({});
    }
    return profileVisas;
  }

  getExperiences = experiences => {
    const experienceDetails = [];
    const { locationState } = this.props;
    if (locationState && locationState.from === 'ATS') {
      experienceDetails.push(locationState.experience);
    }
    experiences.map(experience => {
      const endDate = listOfEndDateWords.includes(experience.end_date) ?
        new Date(new Date().toDateString()) : new Date(experience.end_date);

      const startDate = listOfEndDateWords.includes(experience.start_date) ?
        new Date(new Date().toDateString()) : new Date(experience.start_date);

      const experienceInYears = dateDiffInYears(endDate, startDate);

      experienceDetails.push({
        title: experience.title,
        description: experience.description,
        company_name: experience.company_name,
        company_location: experience.company_location,
        start_date: experience.start_date,
        end_date: experience.end_date,
        years_of_experience: experienceInYears,
        isCurrentlyWorking: listOfEndDateWords.includes(experience.end_date)
      });
      return null;
    });
    if (experienceDetails.length === 0) {
      experienceDetails.push({});
    }
    return experienceDetails;
  }

  getEducations = educations => {
    const educationDetails = educations.map(education => ({
      school_name: education.school_name,
      school_location: education.school_location,
      title: education.title,
      start_date: education.start_date,
      end_date: education.end_date,
      isCurrentlyStudying: listOfEndDateWords.includes(education.end_date)
    }));
    if (educationDetails.length === 0) {
      educationDetails.push({});
    }
    return educationDetails;
  }

  getLanguageSkills = languagSkills => {
    const languagesKnown = languagSkills.map(language => ({
      name: language.language,
      level: language.proficiency,
    }));
    if (languagesKnown.length === 0) {
      languagesKnown.push({});
    }
    return languagesKnown;
  }

  chronologicalDateSorting = (array, comparatorOne, comparatorTwo) => {
    const halfSorted = array.sort((a, b) => {
      if (comparatorTwo in a && comparatorTwo in b) {
        const aDate = listOfEndDateWords.includes(a[comparatorTwo].toLowerCase()) ?
          new Date(new Date().toDateString()) : new Date(a[comparatorTwo]);
        const bDate = listOfEndDateWords.includes(b[comparatorTwo].toLowerCase()) ?
          new Date(new Date().toDateString()) : new Date(b[comparatorTwo]);
        if (aDate > bDate) {
          return -1;
        }
        if (aDate < bDate) {
          return 1;
        }
        return 0;
      }
      return 0;
    });
    const fullySorted = halfSorted.sort((a, b) => {
      if (comparatorOne in a && comparatorOne in b) {
        const aDate = listOfEndDateWords.includes(a[comparatorOne].toLowerCase()) ?
          new Date(new Date().toDateString()) : new Date(a[comparatorOne]);
        const bDate = listOfEndDateWords.includes(b[comparatorOne].toLowerCase()) ?
          new Date(new Date().toDateString()) : new Date(b[comparatorOne]);
        if (aDate > bDate) {
          return -1;
        }
        if (aDate < bDate) {
          return 1;
        }
        return 0;
      }
      return 0;
    });
    return fullySorted;
  }

  constructJSON = data => {
    const user = `${this.props.user.firstName} ${this.props.user.lastName}`;
    return {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name,
      salutation: data.salutation,
      dob: data.dob,
      nationality: data.nationality,
      place_of_birth: data.place_of_birth,
      doc_id: '',
      created_user: data.created_user,
      created_ts: data.created_ts,
      updated_user: user,
      updated_ts: '',
      name: data.name,
      headline: data.headline,
      location: data.location,
      location_city: data.location,
      location_postcode: data.location_postcode,
      country: data.country,
      url: data.url,
      links: data.links,
      linkedin: data.linkedin,
      facebook: data.facebook,
      xing: (/xing/i.test(data.url) && data.url) || data.xing, // if profile is from xing load url field in xing field
      twitter: data.twitter,
      resume_source: data.resume_source,
      total_years_of_experience: data.total_years_of_experience,
      skills: this.getSkills(data.skills || []),
      experiences: this.getExperiences(data.experiences || []),
      educations: this.getEducations(data.educations || []),
      languages_known: this.getLanguageSkills(data.languages_known || []),
      current_experience: data.current_experience,
      contacts: {
        emails: data.email,
        mobile_numbers: data.mobile_number,
        home_numbers: data.home_numbers,
        fax_numbers: data.fax_numbers,
        street_name: data.street_name,
        street_number_base: data.street_number_base,
        postal_code: data.postal_code,
        city: data.city,
        region_code: data.region_code,
        region_code_description: data.region_code_description,
        country_code: data.country_code,
        country_code_description: data.country_code_description,
      },
      is_archived: data.is_archived,
      is_delete_initiated: data.is_delete_initiated,
      notice_period: data.notice_period,
      notice_period_type: data.notice_period_type,
      curr_annual_salary: data.curr_annual_salary,
      curr_annual_salary_currency: data.curr_annual_salary_currency,
      exp_annual_salary: data.exp_annual_salary,
      exp_annual_salary_currency: data.exp_annual_salary_currency,
      curr_rate: data.curr_rate,
      curr_rate_currency: data.curr_rate_currency,
      curr_rate_type: data.curr_rate_type,
      exp_rate: data.exp_rate,
      exp_rate_currency: data.exp_rate_currency,
      exp_rate_type: data.exp_rate_type,
      reloc_possibility: data.reloc_possibility,
      pref_location: data.pref_location,
      avail_start_date: data.avail_start_date,
      avail_end_date: data.avail_end_date,
      visas: this.getVisas(data.visas || []),
      tags: data.tags || []
    };
  }

  validateData = data => (!data || (data && Object.keys(data).length === 0) ? '' : data);

  handleSubmit = async datas => {
    let data = { ...datas };
    const deviceDetails = JSON.parse(localStorage.getItem('deviceDetails'));
    data = trimExtraSpaces(data);
    data.name = data.middle_name ? `${data.first_name} ${data.middle_name} ${data.last_name}` :
      `${data.first_name} ${data.last_name}`;
    if (data && data.dob) data.dob = Moment(data.dob).format('YYYY-MM-DD');
    data.educations = this.chronologicalDateSorting(data.educations || [], 'start_date', 'end_date');
    data.experiences = this.chronologicalDateSorting(data.experiences || [], 'start_date', 'end_date');
    data.languages_known = data.languages_known.filter(val => Object.keys(val).length > 0 && val.name);
    if (data.experiences && data.experiences[0] && data.experiences[0].end_date) {
      data.current_experience = listOfEndDateWords.includes(data.experiences[0].end_date) ? data.experiences[0] : {};
    } else {
      data.current_experience = {};
    }
    data.previousValues = this.state.previousValues;
    data.deviceDetails = deviceDetails;
    // data.tags = lodash.map(data.tags, 'id');
    if (this.props.candidateId !== null) {
      this.props.updateCandidate(data.id, data).then(response => {
        this.setState({
          isSubmitDisabled: true
        });
        if (this.validateData(response) && !this.props.locationState) {
          this.props.pushState(`/ProfileSearch/${response.resume_id}?isAtsBoard=true`);
        } else if (this.props.locationState && this.props.locationState.from === 'ATS') {
          this.props.pushState(`/ATSBoard?jobId=${this.props.locationState.jobId}`);
        }
        toastr.success(i18n.t('successMessage.UPDATED'), i18n.t('successMessage.PROFILE_UPDATED_SUCCESSFULLY'));
      }, err => {
        this.setState({
          isSubmitDisabled: true
        });
        toastrErrorHandling(err.error, i18n.t('ERROR'), err.error.message);
      });
    }
  }

  formatprefferedLocation = location => {
    const prefLocation = location ? location.split(';') : [];
    return prefLocation.map(data => ({ name: data }));
  }

  closeInfoMessage = () => {
    this.setState({ showInfoMessage: false });
  }

  render() {
    const { loading, candidateId } = this.props;
    const { isSubmitDisabled, showInfoMessage } = this.state;
    let initialValues = this.state.datas ? this.constructJSON(this.state.datas) : null;
    if (initialValues) {
      initialValues = validateData(initialValues);
      // initialValues = deFormatLinks(initialValues);
      initialValues.educations = this.chronologicalDateSorting(initialValues.educations, 'start_date', 'end_date');
      initialValues.experiences = this.chronologicalDateSorting(initialValues.experiences, 'start_date', 'end_date');
      initialValues.pref_location = this.formatprefferedLocation(initialValues.pref_location);
    }
    return (
      <div>
        <Loader loading={loading} styles={{ position: 'fixed' }} />
        {showInfoMessage && initialValues && <div className={styles.configur_email}>
          {i18n.t('DONT_REFRESH_OR_DISCARD_PLEASE_SUBMIT_TO_ADD_NEW_EXPERIENCE')}
          <i
            role="button"
            tabIndex={0}
            className={`fa fa-times-circle ${styles.configur_email_cls_btn}`}
            onClick={this.closeInfoMessage}
          />
        </div>}
        {initialValues && <ResumeForm
          onSubmit={this.handleSubmit}
          initialValues={initialValues}
          isEdit
          candidateId={candidateId}
          activeKey={this.state.activeKey}
          isSubmitDisabled={isSubmitDisabled}
          isSubmitDisabledCb={() => this.setState({
            isSubmitDisabled: false
          })}
        />}
      </div>
    );
  }
}
