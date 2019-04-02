import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { push as pushState } from 'react-router-redux';
import Helmet from 'react-helmet';
import Moment from 'moment';
import { isDirty, hasSubmitSucceeded } from 'redux-form';
import ResumeForm from '../../components/ResumeForm/ResumeForm';
import { sendResumeJson,
  discardResumeData,
  updateCandidate } from '../../redux/modules/resume-parser';
import Loader from '../../components/Loader';
import baseInitialvalues from './ResumeData';
import toastrErrorHandling from '../toastrErrorHandling';
import { dateDiffInYears, trimExtraSpaces } from '../../utils/validation';
import { deleteLinkedinCandidate } from '../../redux/modules/linkedinProfiles/linkedinProfiles';
import constant from '../../helpers/Constants';
import i18n from '../../i18n';

const listOfEndDateWords = ['present', 'till date', 'bis heute', 'heute'];
@connect(
  (state, route) => ({
    resumeJson: state.resumeParser.uploadResponse,
    loading: state.resumeParser.resumeJsonUploading,
    candidateData: state.linkedinProfiles.candidateData,
    linkedinProfile: state.linkedinProfiles.linkedinProfile || null,
    isLinkedinProfile: state.linkedinProfiles.isLinkedinProfile || false,
    user: state.auth.user,
    isCandidateProfileChanged: isDirty('MultiPartForm')(state),
    isCandidateProfileSubmitted: hasSubmitSucceeded('MultiPartForm')(state),
    candidateId: route.params.id
  }),
  { sendResumeJson, discardResumeData, pushState, updateCandidate, deleteLinkedinCandidate }
)
export default class Resume extends Component {
  static propTypes = {
    resumeJson: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    sendResumeJson: PropTypes.func.isRequired,
    discardResumeData: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    pushState: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]).isRequired,
    deleteLinkedinCandidate: PropTypes.func.isRequired,
    route: PropTypes.object.isRequired,
    candidateData: PropTypes.object,
    linkedinProfile: PropTypes.object,
    isLinkedinProfile: PropTypes.bool,
    router: PropTypes.object.isRequired,
    isCandidateProfileChanged: PropTypes.bool.isRequired,
    isCandidateProfileSubmitted: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    candidateId: null,
    candidateJson: {},
    resumeJson: {},
    candidateData: null,
    linkedinProfile: null,
    isLinkedinProfile: false,
    loading: false
  }

  constructor(props) {
    super(props);
    this.state = {
      isSubmitDisabled: false
    };
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
    const profileSkills = [];
    if (Array.isArray(skills.ComputerSkills.ComputerSkill)) {
      skills.ComputerSkills.ComputerSkill.map(skill => {
        const startDate = typeof skill.ComputerSkillFirstUsed === 'string' ?
          new Date(skill.ComputerSkillFirstUsed) : '';
        const endDate = typeof skill.ComputerSkillLastUsed === 'string' ?
          new Date(skill.ComputerSkillLastUsed) : '';
        let experienceInMonths;
        if (endDate && startDate) {
          experienceInMonths = this.getMonthsDifference(startDate, endDate);
        }
        profileSkills.push({
          name: this.validateData(skill.ComputerSkillName),
          experience: this.validateData(skill.ComputerSkillDuration),
          experienceMonths: this.validateData(experienceInMonths),
          level: ''
        });
        return true;
      });
    }
    if (Array.isArray(skills.ProfessionalSkills.ProfessionalSkill)) {
      skills.ProfessionalSkills.ProfessionalSkill.map(skill => {
        const startDate = typeof skill.ProfessionalSkillFirstUsed === 'string' ?
          new Date(skill.ProfessionalSkillFirstUsed) : null;
        const endDate = typeof skill.ProfessionalSkillLastUsed === 'string' ?
          new Date(skill.ProfessionalSkillLastUsed) : null;
        let experienceInMonths;
        let experienceInYears = '';
        if (endDate && startDate) {
          experienceInMonths = this.getMonthsDifference(startDate, endDate);
          experienceInYears = this.getYearsDifference(startDate, endDate);
        }
        profileSkills.push({
          name: skill.ProfessionalSkillName && this.validateData(skill.ProfessionalSkillName),
          experience: parseFloat(experienceInYears),
          experienceMonths: experienceInMonths && this.validateData(experienceInMonths),
          level: skill.LanguageProficiencyCode && this.validateData(skill.LanguageProficiencyCode),
        });
        return true;
      });
    }
    if (Array.isArray(skills.SoftSkills.SoftSkill)) {
      skills.SoftSkills.SoftSkill.map(skill => {
        const startDate = typeof skill.SoftSkillFirstUsed === 'string' ? new Date(skill.SoftSkillFirstUsed) : null;
        const endDate = typeof skill.SoftSkillLastUsed === 'string' ? new Date(skill.SoftSkillLastUsed) : null;
        let experienceInMonths;
        let experienceInYears = '';
        if (endDate && startDate) {
          experienceInMonths = this.getMonthsDifference(startDate, endDate);
          experienceInYears = this.getYearsDifference(startDate, endDate);
        }
        profileSkills.push({
          name: skill.SoftSkillName && this.validateData(skill.SoftSkillName),
          experience: parseFloat(experienceInYears),
          experienceMonths: experienceInMonths && this.validateData(experienceInMonths),
          level: skill.LanguageProficiencyCode && this.validateData(skill.LanguageProficiencyCode),
        });
        return true;
      });
    }
    if (profileSkills.length === 0) {
      profileSkills.push({});
    }
    return profileSkills;
  };

  getMonthsDifference = (startDate, endDate) => (
    (endDate.getMonth() - startDate.getMonth())
    + (12 * (endDate.getFullYear() - startDate.getFullYear()))
  );

  getYearsDifference = (startDate, endDate) => (endDate.getFullYear() - startDate.getFullYear());

  getExperiences = profileExperiences => {
    const experiences = [];
    if (Array.isArray(profileExperiences)) {
      profileExperiences.map(experience => this.getExperience(experience, experiences));
    } else if (typeof profileExperiences === 'object') {
      this.getExperience(profileExperiences, experiences);
    }
    const sortedExperiences = this.chronologicalDateSorting(experiences, 'start_date', 'end_date');
    if (sortedExperiences.length === 0) {
      sortedExperiences.push({});
    }
    return sortedExperiences;
  }

  getExperience = (experience, experiences) => {
    let experienceInYears = '';
    const endDate = listOfEndDateWords.includes(this.validateData(experience.EndDate).toLowerCase()) ?
      new Date(new Date().toDateString()) : new Date(this.validateData(experience.EndDate));

    const startDate = listOfEndDateWords.includes(this.validateData(experience.StartDate).toLowerCase()) ?
      new Date(new Date().toDateString()) : new Date(this.validateData(experience.StartDate));

    experienceInYears = this.validateData(experience.YearsExperience);
    if ((typeof experienceInYears !== 'string' || experienceInYears === '') && endDate && startDate) {
      experienceInYears = dateDiffInYears(endDate, startDate);
    }
    experiences.push({
      description: this.validateData(experience.JobDescription),
      end_date: isNaN(endDate) ? '' : this.validateData(experience.EndDate),
      title: typeof experience.JobTitle === 'string' ? this.validateData(experience.JobTitle) : '',
      company_name: this.validateData(experience.EmployerName),
      years_of_experience:
        isNaN(experienceInYears) || experienceInYears === '' ? '' : parseFloat(Number(experienceInYears)),
      start_date: isNaN(startDate) ? '' : this.validateData(experience.StartDate),
      company_location: this.validateData(experience.EmployerCity)
    });
    return true;
  }

  getCurrentExperience = currentExperience => {
    if (currentExperience) {
      const endDate = new Date(currentExperience.EndDate);
      const startDate = new Date(currentExperience.StartDate);
      let experienceInYears = this.validateData(currentExperience.YearsExperience);
      if (typeof experienceInYears !== 'string' && endDate && startDate) {
        experienceInYears = endDate.getFullYear() - startDate.getFullYear();
      }
      return {
        description: this.validateData(currentExperience.JobDescription),
        end_date: this.validateData(currentExperience.EndDate),
        title: typeof currentExperience.JobTitle === 'string' ? this.validateData(currentExperience.JobTitle) : '',
        company_name: this.validateData(currentExperience.EmployerName),
        years_of_experience: experienceInYears,
        start_date: this.validateData(currentExperience.StartDate),
        company_location: this.validateData(currentExperience.EmployerRegion)
      };
    }
  };

  getEducations = profileEducations => {
    const educations = [];
    if (Array.isArray(profileEducations)) {
      profileEducations.map(education => (
        educations.push({
          school_location: '',
          start_date: this.validateData(education.StartDate),
          end_date: this.validateData(education.EndDate),
          school_name: this.validateData(education.InstituteName),
          title: this.validateData(education.Major)
        })
      ));
    }
    const sortedEducations = this.chronologicalDateSorting(educations, 'start_date', 'end_date');
    if (sortedEducations.length === 0) {
      sortedEducations.push({});
    }
    return sortedEducations;
  }


  getLanguageSkills = languageSkills => {
    const languagesKnown = [];
    if (Array.isArray(languageSkills)) {
      languageSkills.map(languageSkill => {
        if (languageSkill.LanguageSkillCodeDescription &&
          this.validateData(languageSkill.LanguageSkillCodeDescription) !== '') {
          languagesKnown.push({
            name: languageSkill.LanguageSkillCodeDescription
              && this.validateData(languageSkill.LanguageSkillCodeDescription),
            level: '',
          });
        } else if (languageSkill.LanguageSkillCode &&
          this.validateData(languageSkill.LanguageSkillCode) !== '') {
          languagesKnown.push({
            name: languageSkill.LanguageSkillCode
              && this.validateData(languageSkill.LanguageSkillCode),
            level: '',
          });
        }
        return null;
      });
    }
    if (languagesKnown.length === 0) {
      languagesKnown.push({});
    }
    return languagesKnown;
  }

  getContactDetails = data => Array.isArray(data) ? data.join(';') : data;

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

  constructJSON = (object, id) => {
    const user = `${this.props.user.firstName} ${this.props.user.lastName}`;
    const profile = object.Profile;
    const personal = profile.Personal;
    const profileSummary = profile.ProfileSummary;
    const experiencesArr = this.getExperiences(object.Profile.EmploymentHistory.EmploymentItem);
    return {
      id: '',
      doc_id: id.toString(),
      created_user: user,
      created_ts: '',
      updated_user: user,
      updated_ts: '',
      first_name: this.validateData(personal.FirstName),
      last_name: this.validateData(personal.LastName),
      middle_name: this.validateData(personal.MiddleName),
      salutation: personal.salutation,
      dob: this.validateData(personal.DOB),
      nationality: personal.nationality,
      place_of_birth: personal.place_of_birth,
      name: (this.validateData(personal.FirstName)).concat(
        this.validateData(personal.FirstName) && ' ').concat(
        this.validateData(personal.MiddleName) &&
        `${this.validateData(personal.MiddleName)} `).concat(
        this.validateData(personal.LastName)),
      headline: this.validateData(profileSummary.SummaryAmbitionSection),
      location: this.validateData(personal.Address.City),
      location_city: this.validateData(personal.Address.City),
      location_postcode: this.validateData(personal.Address.PostalCode),
      country: this.validateData(personal.Address.CountryCodeDescription),
      url: constant.RESUME_URL,
      personalWebsite: this.validateData(personal.PersonalWebsite.PersonalLink.PersonalURL),
      resume_source: constant.RESUME_SOURCE,
      total_years_of_experience: this.validateData(object.Profile.ProfileSummary.TotalExperienceYears),
      skills: this.getSkills(object.Profile.Skills),
      current_experience: experiencesArr &&
        Array.isArray(experiencesArr) &&
        experiencesArr.length > 0 &&
        experiencesArr[0],
      experiences: experiencesArr,
      educations: this.getEducations(object.Profile.EducationHistory.EducationItem),
      languages_known: this.getLanguageSkills(object.Profile.Skills.LanguageSkills.LanguageSkill),
      contacts: {
        emails: this.getContactDetails(this.validateData(personal.Emails.Email)),
        mobile_numbers: this.getContactDetails(this.validateData(personal.MobilePhones.MobilePhone)),
        home_numbers: this.getContactDetails(this.validateData(personal.HomePhones.HomePhone)),
        fax_numbers: this.getContactDetails(this.validateData(personal.Faxes.FaxNumber)),
        street_name: this.validateData(personal.Address.StreetName),
        street_number_base: this.validateData(personal.Address.StreetNumberBase),
        postal_code: this.validateData(personal.Address.PostalCode),
        city: this.validateData(personal.Address.City),
        region_code: this.validateData(personal.Address.RegionCode),
        region_code_description: this.validateData(personal.Address.RegionCodeDescription),
        country_code: this.validateData(personal.Address.CountryCode),
        country_code_description: this.validateData(personal.Address.CountryCodeDescription)
      }
    };
  }

  addAdddionalKeys = initialValues => {
    const { educations, experiences } = initialValues;
    educations.map(education => {
      education.isCurrentlyStudying = !!(education.end_date && listOfEndDateWords.includes(education.end_date));
      return null;
    });
    experiences.map(experience => {
      experience.isCurrentlyWorking = !!(experience.end_date && listOfEndDateWords.includes(experience.end_date));
      return null;
    });

    return initialValues;
  }

  // deFormatLinks = data => {
  //   const arrayOfLinks = data.links ? data.links.split(';') : [];
  //   data.links = '';
  //   arrayOfLinks.map(link => {
  //     if (/linkedIn/i.test(link)) {
  //       data.linkedin = link;
  //     } else if (/facebook/i.test(link)) {
  //       data.facebook = link;
  //     } else if (/xing/i.test(link)) {
  //       data.xing = link;
  //     } else if (/twitter/i.test(link)) {
  //       data.twitter = link;
  //     } else {
  //       data.links = link;
  //     }
  //     return null;
  //   });
  //   return data;
  // }

  // formatLinks = data => {
  //   let link = data.links;
  //   link = data.linkedin && /linkedIn/i.test(data.linkedin) ?
  //     `${link};${data.linkedin}` : link;
  //   link = data.facebook && /facebook/i.test(data.facebook) ?
  //     `${link};${data.facebook}` : link;
  //   link = data.twitter && /twitter/i.test(data.twitter) ?
  //     `${link};${data.twitter}` : link;
  //   link = data.xing && /xing/i.test(data.xing) ?
  //     `${link};${data.xing}` : link;
  //   if (data.links === '') {
  //     link = link.substring(1);
  //   }
  //   return link;
  // }

  validateData = data => (!data || (data && Object.keys(data).length === 0) ? '' : data);

  handleSubmit = datas => {
    let data = { ...datas };
    data = trimExtraSpaces(data);
    // data.links = this.formatLinks(data);
    data.educations = this.chronologicalDateSorting(data.educations || [], 'start_date', 'end_date');
    data.experiences = this.chronologicalDateSorting(data.experiences || [], 'start_date', 'end_date');
    data.languages_known = data.languages_known.filter(val => Object.keys(val).length > 0 && val.name);
    if (data && data.dob) data.dob = Moment(data.dob).format('YYYY-MM-DD');
    data.name = data.middle_name ? `${data.first_name} ${data.middle_name} ${data.last_name}` :
      `${data.first_name} ${data.last_name}`;
    if (data.experiences && data.experiences[0] && data.experiences[0].end_date) {
      data.current_experience = listOfEndDateWords.includes(data.experiences[0].end_date) ? data.experiences[0] : {};
    } else {
      data.current_experience = {};
    }
    this.props.sendResumeJson(data).then(response => {
      this.setState({
        isSubmitDisabled: true
      });
      if (this.validateData(response)) {
        const { linkedinProfile, isLinkedinProfile } = this.props;
        if (isLinkedinProfile && linkedinProfile) {
          linkedinProfile.isDeleted = true;
          this.props.deleteLinkedinCandidate(linkedinProfile);
        }
        this.props.pushState(`/ProfileSearch/${response.resume_id}?isAtsBoard=true`);
        toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.SAVED_SUCCESSFULLY'));
      }
    }, err => {
      this.setState({
        isSubmitDisabled: true
      });
      toastrErrorHandling(err.error, i18n.t('ERROR'), err.error.message);
    });
  }

  render() {
    const { resumeJson, loading, user, candidateData } = this.props;
    const { isSubmitDisabled } = this.state;
    baseInitialvalues.created_user = `${user.firstName} ${user.lastName}`;
    baseInitialvalues.updated_user = `${user.firstName} ${user.lastName}`;
    const parsed = resumeJson && resumeJson.data && JSON.parse(resumeJson.data);
    let initialValues;
    if (parsed) { // while parsing both with and without duplicates ...
      initialValues = this.constructJSON(parsed, resumeJson.documentId);
    } else if (candidateData) {
      initialValues = candidateData; // while add candidate both with and without duplicates ...
    } else {
      initialValues = baseInitialvalues; // while direct routing to /Resume ....
    }
    if (initialValues) {
      // initialValues = this.deFormatLinks(initialValues);
      this.addAdddionalKeys(initialValues);
    }
    return (
      <div>
        <Helmet title={i18n.t('ADD_CANDIDATE')} />
        <Loader loading={loading} styles={{ position: 'fixed' }} />
        <ResumeForm
          onSubmit={this.handleSubmit}
          initialValues={initialValues}
          docHtml={parsed && parsed.Profile.DocumentHtml}
          isSubmitDisabled={isSubmitDisabled}
          isSubmitDisabledCb={() => this.setState({
            isSubmitDisabled: false
          })}
        />
      </div>
    );
  }
}
