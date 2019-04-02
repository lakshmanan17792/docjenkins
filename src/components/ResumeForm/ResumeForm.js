import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  reduxForm, Field, propTypes, fieldPropTypes, FieldArray, touch,
  getFormValues, getFormSyncErrors, change, formValueSelector, isDirty, reset
} from 'redux-form';
import { Col, Button, Modal, Row } from 'react-bootstrap';
import { Tabs, Tab } from 'react-bootstrap/lib';
import { DropdownList, Multiselect } from 'react-widgets';
import { toastr } from 'react-redux-toastr';
import { Scrollbars } from 'react-custom-scrollbars';
import Moment from 'moment';
import { Trans } from 'react-i18next';
import { required as isAvailable } from 'utils/validation';
import momentLocalizer from 'react-widgets-moment';
import PropTypes from 'prop-types';
import Select from 'react-select';
import lodash from 'lodash';
import { hashHistory } from 'react-router';
import multiPartValidation from './ResumeFormValidation';
import { dateDiffInYears, trimTrailingSpace, moveFocusToEnd, trimSpace, email } from '../../utils/validation';
import RenderExperience from './RenderExperience';
import RenderEducation from './RenderEducation';
import RenderOtherDetails from './RenderOtherDetails';
import { getCandidateTags, createCandidateTags } from '../../redux/modules/resume-parser';
import { loadSkills, loadNationality, loadLocations, loadLanguages } from '../../redux/modules/profile-search';
import { getSimilarCandidate } from '../../redux/modules/linkedinProfiles/linkedinProfiles';
import DatePicker from '../../components/FormComponents/DatePicker';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { getResumeFormConfig } from '../../formConfig/ResumeDetails';
import Constants from '../../helpers/Constants';
import i18n from '../../i18n';

Moment.locale('en');
momentLocalizer();

const style = require('./ResumeForm.scss');

const salutation = [
  'Mr.',
  'Mrs.',
  'Ms.',
  'Miss',
  'Herr',
  'Frau',
  'Dr.'
];
const proficiencyValues = [
  'Academic knowledge',
  'Basic knowledge',
  'Fluent',
  'Business fluent',
  'Native speaker',
  'A1', 'A2',
  'B1', 'B2',
  'C1', 'C2'
];

const validateSyncErrors = (errors, cb) => {
  // if any validation personal keys add to vaidate
  const PersonalKeys = ['contacts', 'location_postcode', 'location_city', 'first_name', 'last_name',
    'salutation', 'nationality', 'country', 'total_years_of_experience'];
  const conditionsApply = {
    personal: false,
    educations: false,
    experiences: false,
    skills: false,
    languages_known: false,
    others: false
  };
  Object.keys(errors).forEach(key => {
    if (PersonalKeys.includes(key)) {
      conditionsApply.personal = true;
    } else if ((key === 'visas' && errors.visas && errors.visas.length > 0
       && Object.keys(errors.visas[0]).length > 0) || key === 'avail_end_date') {
      conditionsApply.others = true;
    } else if (typeof errors[key] === 'object' && !Array.isArray(errors[key]) &&
        Object.keys(errors[key]).length > 0 && key === 'skills') {
      conditionsApply[key] = true;
    } else {
      const arrayOfObjects = errors[key];
      if (Array.isArray(arrayOfObjects)) {
        arrayOfObjects.map(obj => {
          if (Object.keys(obj).length !== 0) {
            conditionsApply[key] = true;
          }
          return null;
        });
      }
    }
  });
  toastr.clean();
  if (conditionsApply.personal) {
    toastrErrorHandling({}, '', i18n.t('errorMessage.PERSONAL_DETAILS_ARE_MISSING_OR_WRONGLY_ENTERED'));
    cb(1);
  } else if (conditionsApply.educations) {
    toastrErrorHandling({}, '', i18n.t('errorMessage.EDUCATION_DETAILS_ARE_MISSING_OR_WRONGLY_ENTERED'));
    cb(4);
  } else if (conditionsApply.experiences) {
    toastrErrorHandling({}, '', i18n.t('errorMessage.EXPERIENCE_DETAILS_ARE_MISSING_OR_WRONGLY_ENTERED'));
    cb(2);
  } else if (conditionsApply.skills) {
    toastrErrorHandling({}, '', i18n.t('errorMessage.SKILL_DETAILS_ARE_MISSING_OR_WRONGLY_ENTERED'));
    cb(3);
  } else if (conditionsApply.languages_known) {
    toastrErrorHandling({}, '', i18n.t('errorMessage.LANGUAGE_DETAILS_ARE_MISSING_OR_WRONGLY_ENTERED'));
    cb(5);
  } else if (conditionsApply.others) {
    toastrErrorHandling({}, '', i18n.t('errorMessage.OTHER_DETAILS_ARE_MISSING_OR_WRONGLY_ENTERED'));
    cb(6);
  }
};

const flattenObj = (obj, optOut, optPaths) => {
  const out = optOut || {};
  const paths = optPaths || [];
  // eslint-disable-next-line no-shadow
  return Object.getOwnPropertyNames(obj).reduce((out, key) => {
    paths.push(key);
    if (typeof obj[key] === 'object') {
      flattenObj(obj[key], out, paths);
    } else {
      out[paths.join('.')] = obj[key];
    }
    paths.pop();
    return out;
  }, out);
};

export const Input = ({
  input, label, readOnly, type, isRequired, isInfo, infoText, meta: { touched, error }, autoFocus, className,
  placeholder
}) => (
  <div className={`${className} m-t-10 m-b-10`}>
    {label ? <label htmlFor={input.name}>
      <Trans>{label}</Trans>
      {isRequired ? <span className="required_color">*</span> : ''}
      {isInfo ?
        <span className="p-l-10 cursor-pointer">
          <i className="fa fa-info-circle" title={infoText} />
        </span> : ''
      }
    </label> : null}
    <div>
      <input
        readOnly={readOnly}
        {...input}
        type={type}
        className={`${style.form_input}`}
        id={input.name}
        onFocus={autoFocus ? moveFocusToEnd : ''}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

const SkillInput = ({
  input, readOnly, type, placeholder, disabled
}) => (
  <div>
    <input
      readOnly={readOnly}
      {...input}
      type={type}
      className={`${style.form_input}`}
      id={input.name}
      placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      disabled={disabled}
    />
  </div>
);

SkillInput.propTypes = {
  input: PropTypes.any,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool
};

SkillInput.defaultProps = {
  placeholder: '',
  type: '',
  input: null,
  disabled: false,
  readOnly: false
};

export const renderDropdownList = ({
  input,
  label,
  type,
  className,
  isRequired,
  placeholder,
  disabled,
  handleOnChange,
  meta:
  {
    touched,
    error
  },
  ...rest
}) => (
  <div className="m-t-10 m-b-10">
    <label htmlFor={input.name}>
      <Trans>{label}</Trans>
      {isRequired ? <span className="required_color">*</span> : ''}
    </label>
    <div name={input.name}>
      <DropdownList
        {...input}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        disabled={disabled}
        {...rest}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

const renderSelectInput = ({
  valueKey,
  labelKey,
  handleOnChange,
  handleOnInputChange,
  data,
  fields,
  index,
  label,
  required,
  placeholder,
  selectedOption,
  searchTerm,
  meta:
  {
    touched,
    error
  },
}) => (
  <div className={style.m_t_b_10}>
    <label htmlFor={name}>
      <Trans>{label}</Trans>
      {required ? <span className="required_color">*</span> : ''}
    </label>
    <div>
      <Select
        name={name}
        valueKey={valueKey}
        labelKey={labelKey}
        openOnClick={false}
        onChange={val => handleOnChange(val, fields, index)}
        onInputChange={handleOnInputChange}
        options={data}
        placeholder={placeholder || ''}
        noResultsText={searchTerm === '' ? '' : i18n.t('NO_RESULTS_FOUND')}
        value={selectedOption}
        autosize={false}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

renderSelectInput.propTypes = {
  valueKey: PropTypes.any.isRequired,
  labelKey: PropTypes.any.isRequired,
  handleOnChange: PropTypes.func,
  handleOnInputChange: PropTypes.func,
  data: PropTypes.any,
  fields: PropTypes.any,
  label: PropTypes.any,
  required: PropTypes.any,
  placeholder: PropTypes.string,
  index: PropTypes.any,
  selectedOption: PropTypes.any,
  meta: PropTypes.any,
  searchTerm: PropTypes.string
};

renderSelectInput.defaultProps = {
  handleOnInputChange: () => { },
  handleOnChange: () => { },
  data: null,
  index: null,
  label: '',
  required: false,
  placeholder: '',
  selectedOption: '',
  meta: {},
  fields: '',
  searchTerm: null
};

const renderMultiselect = ({
  input,
  label,
  className,
  isRequired,
  meta:
  {
    touched,
    error
  },
  ...rest
}) => (
  <div className={style.m_t_b_10}>
    <label htmlFor={input.name} className="control-label col-sm-4">
      <Trans>{label}</Trans>
      {isRequired ? <span className="required_color">*</span> : ''}
    </label>
    <div className="col-sm-8">
      <Multiselect {...input} {...rest} />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);
Input.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
Input.defaultProps = {
  custom: '',
};
renderDropdownList.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
renderDropdownList.defaultProps = {
  custom: '',
};
renderMultiselect.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
renderMultiselect.defaultProps = {
  custom: '',
};
let RenderLanguage = ({ field, fields, index, hasLanguageName, languageList, languageSearchTerm,
  handleOnLanguageChange, selectedLanguages, handleOnChange, removeLanguage }) =>
  (
    <div className={style.exp_sec}>
      <Button className={style.remv_btn} onClick={() => removeLanguage(fields, index)}>
        <Trans>REMOVE</Trans>
      </Button>
      <Field
        component={renderSelectInput}
        valueKey="name"
        labelKey="name"
        handleOnInputChange={handleOnLanguageChange}
        handleOnChange={handleOnChange}
        data={languageList}
        index={index}
        placeholder={i18n.t('placeholder.START_TYPING_TO_ADD_THE_LANGUAGE')}
        searchTerm={languageSearchTerm}
        type="text"
        format={trimTrailingSpace}
        name={`${field}.name`}
        label="LANGUAGE"
        isSearchable
        selectedOption={selectedLanguages[index] ? selectedLanguages[index] : ''}
      />
      <Field
        label="PROFICIENCY"
        component={renderDropdownList}
        name={`${field}.level`}
        type="text"
        data={proficiencyValues}
        placeholder="SELECT_THE_PROFICIENCY_LEVEL"
        disabled={!hasLanguageName}
      />
    </div>
  );

RenderLanguage.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any,
  input: PropTypes.any,
  meta: PropTypes.any
};
RenderLanguage.defaultProps = {
  custom: '',
  input: null,
  meta: null,
};
const selector = formValueSelector('MultiPartForm');

RenderLanguage = connect(
  (state, props) => ({
    hasLanguageName: !!selector(state, `${props.field}.name`)
  })
)(RenderLanguage);

const renderTags = properties => {
  const { data, label, handleValueChange, searchTerm, selectedValue,
    toggleCreateTagModal, handleSearch } = properties;
  return (
    <div className="m-t-10 m-b-5">
      {
        label ?
          <label htmlFor={name} style={{ width: '100%' }}>
            <Trans>{label}</Trans>
            <span
              style={{ float: 'right', color: '#1f9aff', cursor: 'pointer', textTransform: 'none' }}
              onClick={toggleCreateTagModal}
              role="presentation"
            >
              <Trans>CREATE_NEW_TAG</Trans>
            </span>
          </label>
          : null
      }
      <Multiselect
        data={data}
        onChange={handleValueChange}
        value={selectedValue}
        textField="name"
        valueField="id"
        onSearch={handleSearch}
        searchTerm={searchTerm}
        id="candidateTags"
        allowCreate={false}
      />
    </div>
  );
};

@reduxForm({
  form: 'MultiPartForm',
  validate: multiPartValidation,
  touchOnChange: true,
})

@connect((state, props) => ({
  skillList: state.profileSearch.skillList,
  values: getFormValues(props.form)(state),
  isFormChanged: isDirty('MultiPartForm')(state),
  syncErrors: getFormSyncErrors(props.form)(state),
  nationality: state.profileSearch.nationalityList,
  locationList: state.profileSearch.locationList,
  candidateTags: state.resumeParser.candidateTags,
  languageList: state.profileSearch.languageList,
}), { change,
  loadSkills,
  getSimilarCandidate,
  loadNationality,
  reset,
  touch,
  loadLocations,
  getCandidateTags,
  createCandidateTags,
  loadLanguages })

export default class ResumeForm extends Component {
  static propTypes = {
    ...propTypes,
    loadSkills: PropTypes.func.isRequired,
    isFormChanged: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    loadNationality: PropTypes.func.isRequired,
    candidateId: PropTypes.string,
    loadLocations: PropTypes.func.isRequired,
    isSubmitDisabled: PropTypes.bool.isRequired,
    isSubmitDisabledCb: PropTypes.func.isRequired
  };

  static defaultProps = {
    candidateId: '',
    initialize: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      skillList: [],
      isRemoved: false,
      isSkillDeleted: false,
      selectedSkills: [],
      selectedSkillsBck: [],
      selectedNationality: null,
      isResPerDisabled: false,
      isWorkPermitDisabled: false,
      isRelocDisabled: false,
      dob: {
        label: 'DOB',
        name: 'dob',
        max: new Date(),
        showDatePicker: true,
        dropUp: false
      },
      emails: {
        value: '',
        errorMessage: ''
      },
      mobile_numbers: {
        value: '',
        errorMessage: ''
      },
      activeKey: props.isEdit ? props.activeKey : 1,
      nationalitySearchTerm: '',
      selectedTags: [],
      showCreateTag: false,
      isTagSubmitted: false,
      tagSkip: 0,
      tagLimit: 10,
      tagSearchTerm: '',
      isTagChanged: false,
      tag: {
        name: '',
        description: null
      },
      canGetTags: true,
      selectedLanguages: []
    };
  }

  componentWillMount() {
    const { initialValues } = this.props;
    if (this.props.initialValues && this.props.initialValues.skills &&
      this.props.initialValues.skills.length > 0) {
      if (this.props.initialValues.skills[0].name) {
        this.setState({
          selectedSkills: this.props.initialValues.skills.slice(),
          selectedSkillsBck: this.props.initialValues.skills.slice(),
          isRemoved: true,
          emails: {
            value: this.props.initialValues.contacts.emails
          },
          mobile_numbers: {
            value: this.props.initialValues.contacts.mobile_numbers
          }
        });
      }
    }
    if (this.props.initialValues && this.props.isEdit && this.props.initialValues.nationality) {
      this.setState({
        selectedNationality: { name: this.props.initialValues.nationality },
        emails: {
          value: this.props.initialValues.contacts.emails
        },
        mobile_numbers: {
          value: this.props.initialValues.contacts.mobile_numbers
        }
      });
    }
    if (initialValues && !initialValues.notice_period_type) {
      initialValues.notice_period_type = 'weeks';
    }
    if (initialValues && !initialValues.curr_rate_type) {
      initialValues.curr_rate_type = 'hourly';
    }
    if (initialValues && !initialValues.exp_rate_type) {
      initialValues.exp_rate_type = 'hourly';
    }
    if (initialValues && !initialValues.curr_annual_salary_currency) {
      initialValues.curr_annual_salary_currency = 'EUR';
    }
    if (initialValues && !initialValues.exp_annual_salary_currency) {
      initialValues.exp_annual_salary_currency = 'EUR';
    }
    if (initialValues && !initialValues.curr_rate_currency) {
      initialValues.curr_rate_currency = 'EUR';
    }
    if (initialValues && !initialValues.exp_rate_currency) {
      initialValues.exp_rate_currency = 'EUR';
    }
    if (this.props.initialValues && this.props.isEdit && this.props.initialValues.languages_known.length > 0) {
      this.setState({ selectedLanguages: this.props.initialValues.languages_known.slice() });
    }
    this.loadTags();
  }

  componentDidMount() {
    setTimeout(() => {
      const parentEl = document.getElementById('candidateTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const { initialValues, values, isSubmitDisabled, isSubmitDisabledCb } = nextProps;
    const resPerDisabled = !(values && values.visas
      && values.visas.length > 0 && values.visas[0].res_permit === 'validtill');
    const workPerDisabled = !(values && values.visas &&
      values.visas.length > 0 && values.visas[0].work_permit === 'validtill');
    const relocDisabled = !(values && values.reloc_possibility);
    if (initialValues) {
      this.setState({
        isResPerDisabled: resPerDisabled,
        isWorkPermitDisabled: workPerDisabled,
        isRelocDisabled: relocDisabled
      });
    }
    if (isSubmitDisabled) {
      this.setState({
        isSubmitDisabled: false
      }, () => {
        isSubmitDisabledCb();
      });
    }
  }

  onEmailChange = (key, value, category, message) => {
    const { syncErrors, candidateId } = this.props;
    const error = syncErrors.contacts && syncErrors.contacts[key];
    if ((!error || this.state[key].errorMessage === message)
    //  && value !== ''
    ) {
      if (this.state[key].value !== value) {
        let errorMessage = null;
        this.props.getSimilarCandidate({
          [category]: value
        }).then(result => {
          const duplicateList = this.getDuplicateList(result.data, candidateId);
          if (duplicateList.length > 0 && value.trim() !== '') {
            toastr.clean();
            toastrErrorHandling({}, i18n.t('ERROR'), message);
            errorMessage = message;
            this.setState({
              [key]: {
                value,
                errorMessage
              }
            });
          } else {
            this.setState({
              [key]: {
                value,
                errorMessage: ''
              }
            });
          }
        });
      }
    }
  }
  onTagSearch = searchTerm => {
    const { tagLimit } = this.state;
    const value = searchTerm.replace(/\s\s+/g, ' ');
    if (value === this.state.tagSearchTerm || value === ' ') return;
    if (/^[a-zA-Z0-9\s]+$/i.test(value) || value === '') {
      this.setState({
        tagSearchTerm: searchTerm,
        canGetTags: true,
        tagSkip: 0
      });
      const tagObj = {
        skip: 0,
        limit: tagLimit,
        searchTerm
      };
      this.props.getCandidateTags(tagObj).then(tags => {
        if (tags && tags.length === 0) {
          this.setState({ canGetTags: false });
        } else {
          this.setState({
            candidateTags: tags
          });
        }
      }, err => {
        if (err) {
          toastrErrorHandling(err.error, i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
        }
      });
    }
  }

  getDuplicateList = (list, currentCandidateId) => {
    if (currentCandidateId) {
      lodash.remove(list, candidate => currentCandidateId === candidate._id);
    }
    return list;
  }

  setDuplicateError = () => {
    const { syncErrors } = this.props;
    const { emails, mobile_numbers } = this.state;
    if (!syncErrors.contacts) {
      if ((emails.errorMessage && emails.errorMessage !== '') ||
        (mobile_numbers.errorMessage &&
          mobile_numbers.errorMessage !== '')
      ) {
        this.props.syncErrors.contacts = {};
      }
    }
    if (syncErrors.contacts && (!syncErrors.contacts.emails ||
      syncErrors.contacts.emails ===
      Constants.resumeDuplciateErrors.emails)
    ) {
      this.props.syncErrors.contacts.emails = emails.errorMessage &&
        emails.errorMessage !== '' &&
        emails.errorMessage;
    }
    if (syncErrors.contacts &&
      (!syncErrors.contacts.mobile_numbers ||
        syncErrors.contacts.mobile_numbers ===
        Constants.resumeDuplciateErrors.mobileNumber)
    ) {
      this.props.syncErrors.contacts.mobile_numbers = mobile_numbers.errorMessage &&
        mobile_numbers.errorMessage !== '' &&
        mobile_numbers.errorMessage;
    }
    if (syncErrors.contacts && syncErrors.contacts.mobile_numbers && syncErrors.contacts.mobile_numbers === '') {
      delete this.props.syncErrors.contacts.mobile_numbers;
    }
    if (syncErrors.contacts && syncErrors.contacts.emails && syncErrors.contacts.emails === '') {
      delete this.props.syncErrors.contacts.emails;
    }
    if (syncErrors.contacts && !syncErrors.contacts.emails && !syncErrors.contacts.mobile_numbers) {
      delete this.props.syncErrors.contacts;
    }
  }

  getTagsOnScroll = () => {
    const { canGetTags, tagSkip, tagLimit, tagSearchTerm } = this.state;
    if (!canGetTags) {
      return;
    }
    this.props.getCandidateTags({
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm
    }).then(tags => {
      if (tags && tags.length === 0) {
        this.setState({ canGetTags: false });
      } else {
        this.setState(prevState => ({
          tagSkip: prevState.tagSkip + 10
        }));
      }
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
      }
    });
  }

  focusToFaultyInput = errors => {
    const flattenedErrors = flattenObj(errors);
    const errorEl = document.querySelector(
      Object.keys(flattenedErrors).map(fieldName => `[name="${fieldName}"]`).join(',')
    );
    if (errorEl && errorEl.getAttribute('name') === 'salutation') {
      errorEl.scrollIntoView({ block: 'end' });
    } else if (errorEl && errorEl.focus) {
      errorEl.focus();
    } else if (errorEl && errorEl.scrollIntoView) {
      errorEl.scrollIntoView();
    }
  }

  changeDateFormat = value => value ? Moment(value).format('YYYY-MM-DD') : '';

  calculateYearOfExperience = (name, index, currentField, isCurrentlyWorking) => (e, value) => {
    if (currentField === 'end_date') {
      this.props.touch('MultiPartForm', `experiences[${index}].start_date`);
    }
    const allValues = this.props.values;
    const startDate = currentField === 'start_date' ? new Date(value) : new Date(allValues[name][index].start_date);
    let endDate;
    if (isCurrentlyWorking) {
      endDate = new Date();
    } else {
      endDate = currentField === 'end_date' ? new Date(value) : new Date(allValues[name][index].end_date);
    }
    const isValidDate = !isNaN(startDate) && !isNaN(endDate);
    const yearsOfExperience = isValidDate ? dateDiffInYears(endDate, startDate) : -1;
    if (yearsOfExperience >= 0) {
      this.props.change(this.props.form, `${name}.${index}.years_of_experience`, yearsOfExperience);
    } else {
      const currentData = allValues[name][index];
      if ('years_of_experience' in currentData) {
        delete currentData.years_of_experience;
      }
    }
  }

  toggleWorkStatus = (index, isCurrentlyWorking) => {
    const experienceData = this.props.values.experiences[index];
    this.props.change(this.props.form, `experiences.${index}.isCurrentlyWorking`, isCurrentlyWorking);
    if (isCurrentlyWorking) {
      this.props.change(this.props.form, `experiences.${index}.end_date`, 'present');
      if ('start_date' in experienceData && experienceData.start_date) {
        const startDate = new Date(experienceData.start_date);
        const endDate = new Date();
        const yearsOfExperience = dateDiffInYears(endDate, startDate);
        this.props.change(this.props.form, `experiences.${index}.years_of_experience`, yearsOfExperience);
      }
    } else {
      this.props.change(this.props.form, `experiences.${index}.end_date`, '');
      this.props.change(this.props.form, `experiences.${index}.years_of_experience`, '');
    }
  }

  toggleEducationStatus = (index, isCurrentlyStudying) => {
    this.props.change(this.props.form, `educations.${index}.isCurrentlyStudying`, isCurrentlyStudying);
    if (isCurrentlyStudying) {
      this.props.change(this.props.form, `educations.${index}.end_date`, 'present');
    } else {
      this.props.change(this.props.form, `educations.${index}.end_date`, '');
    }
  }

  handleOnSkillChange = value => {
    if (value && value !== '.' && !value.startsWith('/')
      && value !== ' ' && !value.startsWith('./') && !value.startsWith('.\\') &&
      !value.startsWith('\\') && /\S/.test(value)) {
      const finalValue = trimTrailingSpace(value);
      this.props.loadSkills(finalValue.toLowerCase());
      if (finalValue && finalValue !== '') {
        this.setState({
          skillSearchTerm: value
        });
      }
    }
  }

  handleOnLanguageChange = value => {
    if (value && value !== '.' && !value.startsWith('/')
      && value !== ' ' && !value.startsWith('./') && !value.startsWith('.\\') &&
      !value.startsWith('\\') && /\S/.test(value)) {
      this.props.loadLanguages(value.trim().toLowerCase());
      if (value && value !== '') {
        this.setState({
          languageSearchTerm: value
        });
      }
    }
  }

  handleLanguageChange = (selectedOpt, fields, index) => {
    const { selectedLanguages } = this.state;
    const foundIndex = lodash.findIndex(selectedLanguages, language => {
      if (selectedOpt && selectedOpt.name && language.name) {
        return language.name.toLowerCase() === selectedOpt.name.toLowerCase();
      }
      return false;
    });
    if (foundIndex !== -1 && foundIndex !== index) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.LANGUAGE_ALREADY_EXISTS'));
      return;
    }
    if (selectedOpt && selectedOpt.id) {
      selectedLanguages.splice(index, 1, selectedOpt);
      this.setState({ selectedLanguages });
    } else {
      selectedLanguages.splice(index, 1);
      this.setState({ selectedLanguages });
      this.props.change(this.props.form, `languages_known[${index}].level`, '');
    }
    this.props.change(this.props.form, `languages_known[${index}].name`, selectedOpt ? selectedOpt.name : '');
  }

  removeLanguage = (fields, index) => {
    const { selectedLanguages } = this.state;
    selectedLanguages.splice(index, 1);
    this.setState({ selectedLanguages });
    fields.remove(index);
  }

  handleChange = (selectedOpt, fields) => {
    if (lodash.findIndex(this.state.selectedSkills, ['name', selectedOpt.name]) !== -1 ||
      lodash.findIndex(this.state.selectedSkills, ['name', selectedOpt.name.toLowerCase()]) !== -1) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.SKILL_ALREADY_ADDED'));
      return;
    }
    const selectSkill = this.state.selectedSkills || [];
    selectSkill.unshift(selectedOpt);
    this.setState({
      selectedSkills: selectSkill
    });
    fields.unshift({});
    this.props.change(this.props.form, 'skills[0].name', selectedOpt ? selectedOpt.name : null);

    if (!this.state.isRemoved) {
      this.setState({
        isRemoved: true
      });
      fields.remove(1);
    }
  }

  removeSkills = (fields, index) => {
    fields.remove(index);
    const selectSkill = this.state.selectedSkills;
    selectSkill.splice(index, 1);
    this.setState({
      selectedSkills: selectSkill,
      isSkillDeleted: true
    });
  }

  fetchSimilarCandidates = () => {
    const { formValues } = this.props;
    if (formValues && formValues.values) {
      const { location, name, contacts } = formValues.values;
      const { emails, mobile_numbers } = contacts;
      this.props.getSimilarCandidate({
        email: emails,
        mobileNumber: mobile_numbers,
        location,
        name
      });
    }
  }

  confirmDiscardChanges = onOkCallback => {
    const toastrConfirmOptions = {
      onOk: () => {
        if (this.props.initialValues && this.props.initialValues.nationality) {
          this.setState({
            selectedNationality: { name: this.props.initialValues.nationality },
          });
        } else {
          this.setState({ selectedNationality: null });
        }
        if (this.props.initialValues && this.props.initialValues.languages_known) {
          this.setState({
            selectedLanguages: this.props.initialValues.languages_known.slice()
          });
        }
        onOkCallback();
        if (this.state.selectedSkillsBck.length) {
          this.setState({
            isRemoved: true
          });
        } else {
          this.setState({
            isRemoved: false
          });
        }
        this.setState({
          selectedSkills: this.state.selectedSkillsBck.slice(),
          isSkillDeleted: false
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    };
    toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
  }

  generateKey = key => key;

  handleNationalityChange = value => {
    document.addEventListener('click', this.handleOutsideNationalityClick, false);
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value) &&
      value.trim() !== '' && !value.startsWith('./') && !value.startsWith('.\\') && !value.startsWith('\\')) {
      this.setState({
        isNationalityOpen: true,
        nationalitySearchTerm: value
      }, () => {
        this.props.loadNationality(value.toLowerCase());
      });
    } else {
      this.setState({
        isNationalityOpen: false
      });
    }
  }

  handleOnNationalityChange = selectedOpt => {
    if (selectedOpt && selectedOpt.id) {
      this.setState({ selectedNationality: selectedOpt }, () => {
        this.props.change(this.props.form, 'nationality', selectedOpt.name);
      });
    } else {
      this.setState({ selectedNationality: null });
      this.props.change(this.props.form, 'nationality', '');
    }
  }

  submit = () => {
    const { values, candidateId, syncErrors } = this.props;
    const emails = values && values.contacts && values.contacts && values.contacts.emails;
    const mobileNumbers = values && values.contacts && values.contacts && values.contacts.mobile_numbers;
    return Promise.all([
      this.props.getSimilarCandidate({ email: emails }),
      this.props.getSimilarCandidate({ mobileNumber: mobileNumbers })
    ]).then(response => {
      let emailDuplicateList = [];
      if (emails && emails.trim() !== '' && !email(emails)) {
        emailDuplicateList = this.getDuplicateList(response[0].data, candidateId);
      }
      let mobileNumberDuplicateList = [];
      if (mobileNumbers && mobileNumbers.trim() !== '') {
        mobileNumberDuplicateList = this.getDuplicateList(response[1].data, candidateId);
      }
      this.setState({
        emails: {
          errorMessage: emailDuplicateList.length > 0 ? Constants.resumeDuplciateErrors
          && Constants.resumeDuplciateErrors.emails : ''
        },
        mobile_numbers: {
          errorMessage: mobileNumberDuplicateList.length > 0 ? Constants.resumeDuplciateErrors.mobileNumber : '',
        }
      });
      if (emailDuplicateList.length > 0) {
        this.props.syncErrors.contacts = {
          emails: emailDuplicateList.length > 0 && Constants.resumeDuplciateErrors
          && Constants.resumeDuplciateErrors.emails,
        };
      }
      if (mobileNumberDuplicateList.length > 0) {
        this.props.syncErrors.contacts = {
          mobile_numbers: mobileNumberDuplicateList.length > 0 && Constants.resumeDuplciateErrors.mobileNumber
        };
      }
      if (values && values.pref_location) {
        values.pref_location = values.pref_location.map(location => location.name).join(';');
      }
      if (emailDuplicateList.length === 0 && mobileNumberDuplicateList.length === 0) {
        this.props.handleSubmit();
      } else {
        this.setState({
          isSubmitDisabled: false
        });
        validateSyncErrors(syncErrors, key => {
          this.handleTabSelect(key, () => {
            setTimeout(() => this.focusToFaultyInput(syncErrors), 3000);
          });
        });
      }
    });
  }

  handleTabSelect = (key, cb) => {
    this.setState({
      activeKey: key
    }, () => {
      if (cb && typeof cb === 'function') {
        cb();
      }
    });
  }

  handleDatePickerInputClickCb = (childId, parentId, domRef) => {
    this.setState({
      extendMarginBottom: true
    }, () => {
      const child = document.getElementById(childId);
      const parent = document.getElementById(parentId);
      const parentHeight = parent.getBoundingClientRect().height;
      const childTop = child.getClientRects()[0].top;
      if (parentHeight - childTop < 150) {
        const scrollTop = domRef.getScrollTop();
        domRef.scrollTop(scrollTop + 300);
      }
      this.setState({
        extendMarginBottom: false
      });
    });
  }

  loadTags = () => {
    const { tagSkip, tagLimit, tagSearchTerm } = this.state;
    const tagObj = {
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm
    };
    this.props.getCandidateTags(tagObj).then(tags => {
      this.setState({
        candidateTags: tags,
        selectedTags: [],
        newTags: [],
        tagSkip: 10
      });
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
      }
    });
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

  checkSubmit = e => {
    const { isTagSubmitted, tag } = this.state;
    if (e.charCode === 13 && !isTagSubmitted && tag.name.trim() !== '') {
      e.preventDefault();
      e.stopPropagation();
      this.createCandidateTags();
    }
  }

  tagListCreate = () => {
    const { isTagScrollEnabled } = this.state;
    if (isTagScrollEnabled) {
      return;
    }
    setTimeout(() => {
      const parentEl = document.getElementById('candidateTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-popup')[0].getElementsByTagName('ul')[0];
        el.addEventListener('scroll', lodash.debounce(this.getTagsOnScroll, 1000));
        this.setState({ isTagScrollEnabled: true });
      }
    }, 100);
  }

  toggleCreateTagModal = () => {
    const tag = { name: '', description: null };
    this.setState(prevState => (
      { showCreateTag: !prevState.showCreateTag, tag, isTagSubmitted: false }
    ));
  }

  handleTagChange = tags => {
    this.setState({
      selectedTags: tags,
      isTagChanged: true,
      tagSkip: 0,
      tagSearchTerm: '',
      canGetTags: true,
      isTagScrollEnabled: true
    }, () => {
      this.props.getCandidateTags({ skip: 0, tagLimit: 10, searchTerm: '' }).then(res => {
        if (res && res.length === 0) {
          this.setState({ canGetTags: false });
        } else {
          this.setState(prevState => ({
            candidateTags: res,
            tagSkip: prevState.tagSkip + 10
          }));
        }
      }, err => {
        if (err) {
          toastrErrorHandling(err.error, i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
        }
      });
    });
    this.props.change('MultiPartForm', 'tags', tags);
  }

  createCandidateTags = () => {
    const { tag } = this.state;
    this.setState({ isTagSubmitted: true });
    this.props.createCandidateTags(tag).then(res => {
      const tags = this.props.values.tags || [];
      this.props.change('MultiPartForm', 'tags', [...tags, res]);
      this.setState(prevState => ({
        tag: {
          name: '',
          description: null
        },
        showCreateTag: false,
        selectedTags: [...prevState.selectedTags, res],
        isTagSubmitted: true,
        canGetTags: true
      })
      );
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

  renderCreateTag = () => {
    const { showCreateTag, isTagSubmitted, tag } = this.state;
    return (
      <Modal
        show={showCreateTag}
        onHide={this.toggleCreateTagModal}
        backdrop="static"
        style={{ display: 'block', margin: '150px auto' }}
      >
        <Modal.Header className={`${style.modal_header_color}`}>
          <Modal.Title>
            <Row className="clearfix m-0">
              <Col sm={12} className={style.modal_title}>
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
          <div className={style.m_t_b_15}>
            <label className={style.hdr_label} htmlFor="name">
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
                onKeyPress={e => this.checkSubmit(e)}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Col lg={12} md={12} sm={12} xs={12} className={`p-0 p-t-15 p-b-15 ${style.ats_btn_section}`}>
            <button
              className={`btn button-secondary-hover ${style.w_100}`}
              type="submit"
              onClick={this.toggleCreateTagModal}
            >
              <span className={style.btn_text}><Trans>CANCEL</Trans></span>
            </button>
            <button
              className={`btn button-primary ${style.m_l_15} ${style.w_100}`}
              type="submit"
              disabled={!tag.name.trim() || isTagSubmitted}
              onClick={this.createCandidateTags}
            >
              <span className={style.btn_text}><Trans>ADD</Trans></span>
            </button>
          </Col>
        </Modal.Footer>
      </Modal>
    );
  }

  renderSkills = ({ fields }) => {
    const { skillList, skillSearchTerm } = this.props;
    return (
      <Scrollbars
        universal
        autoHeight
        autoHeightMin={'calc(100vh - 200px)'}
        autoHeightMax={'calc(100vh - 200px)'}
        renderThumbHorizontal={props => <div {...props} className="hide" />}
        renderView={props => <div {...props} className="customScroll customScrollResume" />}
      >
        <Col sm={12}>
          <Field
            component={renderSelectInput}
            name="skill"
            valueKey="id"
            labelKey="name"
            handleOnInputChange={this.handleOnSkillChange}
            handleOnChange={this.handleChange}
            data={skillList}
            placeholder={i18n.t('placeholder.START_TYPING_TO_ADD_THE_SKILL')}
            fields={fields}
            isRequired
            searchTerm={skillSearchTerm}
          />
        </Col>
        <Col sm={12}>
          {fields.map((field, index) => {
            field = field.replace('[', '.');
            field = field.replace(']', '');
            return (
              <Col key={this.generateKey(`skill-${index}`)} sm={6}>
                <div className={style.exp_sec}>
                  <Col sm={12} className="p-5">
                    <Col sm={10} className="p-0">
                      <Field
                        component={SkillInput}
                        name={`${field}.name`}
                        valueField="value"
                        textField="color"
                        format={trimTrailingSpace}
                        disabled
                      />
                    </Col>
                    <Col sm={2} className="p-0">
                      <Button className={style.skill_remv_btn} onClick={() => this.removeSkills(fields, index)}>
                        <i title={i18n.t('tooltipMessage.REMOVE_SKILL')} className="fa fa-trash-o" aria-hidden="true" />
                      </Button>
                    </Col>
                  </Col>
                  <Col sm={12} className="p-5">
                    <Col sm={8} className="p-0">
                      <Field
                        component={SkillInput}
                        name={`${field}.experience`}
                        valueField="value"
                        textField="color"
                        format={trimTrailingSpace}
                        placeholder="EXPERIENCE"
                        disabled={false}
                      />
                    </Col>
                    <Col sm={4} className="p-0" style={{ top: '18px' }}>
                      <Trans>IN</Trans> <Trans>YEARS</Trans>
                    </Col>
                  </Col>
                  <Col sm={12} className="p-5">
                    <Field
                      component={SkillInput}
                      name={`${field}.level`}
                      valueField="value"
                      textField="color"
                      format={trimTrailingSpace}
                      placeholder="LEVEL"
                      disabled={false}
                    />
                  </Col>
                </div>
              </Col>
            );
          }
          )}
        </Col>
      </Scrollbars>
    );
  };

  renderlanguageSkills = prop => {
    const { fields, languageList, languageSearchTerm, selectedLanguages } = prop;
    const onAddLanguage = () => {
      fields.unshift({});
      this.state.selectedLanguages.unshift({});
      this.setState({ selectedLanguages });
    };
    return (
      <Scrollbars
        universal
        autoHeight
        autoHeightMin={'calc(100vh - 200px)'}
        autoHeightMax={'calc(100vh - 200px)'}
        renderThumbHorizontal={props => <div {...props} className="hide" />}
        renderView={props => <div {...props} className="customScroll customScrollResume" />}
      >
        <div className="m-r-30">
          <Col className={style.btn_sec}>
            <button className={`${style.add_btn} button-primary`} type="button" onClick={onAddLanguage}>
          + <Trans>ADD_LANGUAGE</Trans>
            </button>
          </Col>
          {fields && fields.length > 0 ? fields.map((field, index) => (
            <RenderLanguage
              key={this.generateKey(`lang-${index}`)}
              field={field}
              fields={fields}
              index={index}
              selectedLanguages={selectedLanguages}
              languageList={languageList}
              languageSearchTerm={languageSearchTerm}
              handleOnLanguageChange={this.handleOnLanguageChange}
              handleOnChange={this.handleLanguageChange}
              removeLanguage={this.removeLanguage}
            />
          )) : ''}
        </div>
      </Scrollbars>
    );
  }

  renderExperiences = ({ fields }) => (
    <Scrollbars
      ref={node => { this.experienceScrollRef = node; }}
      universal
      autoHeight
      autoHeightMin={'calc(100vh - 200px)'}
      autoHeightMax={'calc(100vh - 200px)'}
      renderThumbHorizontal={props => <div {...props} className="hide" />}
      renderView={props => <div {...props} className="customScroll customScrollResume" id="experiencesTab" />}
    >
      <div className="m-r-30">
        <Col className={style.btn_sec}>
          <button className={`${style.add_btn} button-primary`} type="button" onClick={() => fields.unshift({})}>
          + <Trans>ADD_EXPERIENCE</Trans>
          </button>
        </Col>
        {fields.map((field, index) => (
          <RenderExperience
            key={this.generateKey(`exp-${index}`)}
            fields={fields}
            field={field}
            index={index}
            handleWorkStatus={this.toggleWorkStatus}
            handleDateFormat={this.changeDateFormat}
            handleExperience={this.calculateYearOfExperience}
            handleDatePickerInputClickCb={this.handleDatePickerInputClickCb}
            domRef={this.experienceScrollRef}
            extendMarginBottom={this.props.extendMarginBottom}
          />
        ))}
      </div>
    </Scrollbars>
  );

  renderEducations = ({ fields }) => (
    <Scrollbars
      ref={node => { this.educationScrollRef = node; }}
      universal
      autoHeight
      autoHeightMin={'calc(100vh - 200px)'}
      autoHeightMax={'calc(100vh - 200px)'}
      renderThumbHorizontal={props => <div {...props} />}
      renderView={props => <div {...props} className="customScroll customScrollResume" id="educationsTab" />}
    >
      <div className="m-r-30">
        <Col className={style.btn_sec}>
          <button className={`${style.add_btn} button-primary`} type="button" onClick={() => fields.unshift({})}>
          + <Trans>ADD_EDUCATION</Trans>
          </button>
        </Col>
        {fields.map((field, index) => (
          <RenderEducation
            key={this.generateKey(`edu-${index}`)}
            fields={fields}
            field={field}
            index={index}
            handleEducationStatus={this.toggleEducationStatus}
            handleDateFormat={this.changeDateFormat}
            handleDatePickerInputClickCb={this.handleDatePickerInputClickCb}
            educationScrollRef={this.educationScrollRef}
          />
        ))}
      </div>
    </Scrollbars>
  );

  render() {
    const { handleSubmit, docHtml, syncErrors, isFormChanged, extendMarginBottom, candidateTags,
      languageList } = this.props;
    const { isSubmitDisabled } = this.state;
    const {
      isSkillDeleted,
      isResPerDisabled,
      isWorkPermitDisabled,
      isRelocDisabled,
      activeKey,
      nationalitySearchTerm,
      skillSearchTerm,
      languageSearchTerm,
      selectedLanguages
    } = this.state;
    const width = window.innerWidth;
    if (this.props.values.skills.length === 0) {
      this.props.syncErrors.skills = { _error: 'Required' };
    }
    const filterConfig = getResumeFormConfig(this);
    this.setDuplicateError();
    return (
      <div>
        {width >= 992 && <Col lg={6} md={6} className={style.iframe_sec}>
          {docHtml &&
            <iframe title="resume" className={style.resume_content} srcDoc={docHtml} />
          }
        </Col> }
        <Col lg={6} md={6} sm={12} className={`${style.resume_form_rht_side} company_container`}>
          <form
            name="loginForm"
            className="form-horizontal"
            onSubmit={handleSubmit(() => {
              this.setState({
                isSubmitDisabled: true
              }, () => {
                this.submit();
              });
            })}
          >
            <Tabs
              activeKey={activeKey}
              onSelect={this.handleTabSelect}
              id="resumeForm"
              defaultActiveKey={1}
              className={`${style.tab_section} shadow_one`}
            >
              <Tab eventKey={1} title={<Trans>PERSONAL</Trans>} tabClassName={style.tab_size}>
                <Scrollbars
                  ref={node => { this.personalScrollRef = node; }}
                  universal
                  autoHeight
                  autoHeightMin={'calc(100vh - 200px)'}
                  autoHeightMax={'calc(100vh - 200px)'}
                  renderThumbHorizontal={props => <div {...props} className="hide" />}
                  renderView={props => <div {...props} className="customScroll customScrollResume" id="personalTab" />}
                >
                  <div className={`${style.exp_sec} no-borders`}>
                    <Field
                      label="SALUTATION"
                      component={renderDropdownList}
                      name="salutation"
                      type="text"
                      data={salutation}
                      placeholder="SELECT_THE_SALUTATION"
                      isRequired
                      error="Required"
                    />
                    <Col lg={12} xs={12} sm={12} className="p-0">
                      <Col lg={4} xs={12} className="p-l-0">
                        <Field
                          name="first_name"
                          type="text"
                          component={Input}
                          label="FIRST_NAME"
                          format={trimTrailingSpace}
                          normalize={trimTrailingSpace}
                          isRequired
                        />
                      </Col>
                      <Col lg={4} xs={12} className="p-l-0">
                        <Field
                          name="middle_name"
                          type="text"
                          component={Input}
                          label="MIDDLE_NAME"
                          format={trimTrailingSpace}
                          normalize={trimTrailingSpace}
                        />
                      </Col>
                      <Col lg={4} xs={12} className="p-0">
                        <Field
                          name="last_name"
                          type="text"
                          component={Input}
                          label="LAST_NAME"
                          format={trimTrailingSpace}
                          normalize={trimTrailingSpace}
                          isRequired
                        />
                      </Col>
                    </Col>
                    <Col lg={6} xs={12} className={`${style.m_t_b_10} p-l-0`}>
                      <DatePicker {...filterConfig.dob} />
                    </Col>
                    <Col lg={6} xs={12} className="p-r-0">
                      <Field
                        name="place_of_birth"
                        type="text"
                        component={Input}
                        label="PLACE_OF_BIRTH"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                      />
                    </Col>
                    <Col lg={12} xs={12} className="p-0" ref={c => { this.nationalityConatiner = c; }}>
                      <Field
                        component={renderSelectInput}
                        name="nationality"
                        valueKey="name"
                        labelKey="name"
                        handleOnInputChange={this.handleNationalityChange}
                        handleOnChange={this.handleOnNationalityChange}
                        data={this.props.nationality}
                        placeholder={i18n.t('placeholder.START_TYPING_TO_ADD_THE_NATIONALITY')}
                        label="NATIONALITY"
                        selectedOption={this.state.selectedNationality}
                        searchTerm={nationalitySearchTerm}
                      />
                    </Col>
                    <Col lg={12} xs={12} className="p-0">
                      <Field
                        label="TAGS"
                        name="tags"
                        handleValueChange={this.handleTagChange}
                        data={candidateTags}
                        selectedValue={this.props.values.tags}
                        component={renderTags}
                        toggleCreateTagModal={this.toggleCreateTagModal}
                        searchTerm={this.state.tagSearchTerm}
                        handleSearch={this.onTagSearch}
                        isTagChanged={this.state.isTagChanged}
                        tagListCreate={this.tagListCreate}
                      />
                    </Col>
                    <Col lg={12} className="p-0">
                      <Field
                        name="contacts.street_name"
                        type="text"
                        component={Input}
                        label="ADDRESS"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                      />
                    </Col>
                    <Col lg={6} xs={12} className="p-l-0">
                      <Field
                        name="location_city"
                        type="text"
                        component={Input}
                        label="CITY"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                        isRequired
                      />
                    </Col>
                    <Col lg={6} xs={12} className="p-r-0">
                      <Field
                        name="country"
                        type="text"
                        component={Input}
                        label="COUNTRY"
                        valueField="value"
                        textField="color"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                      />
                    </Col>
                    <Col lg={12} className="p-0">
                      <Field
                        name="location_postcode"
                        type="text"
                        component={Input}
                        label="ZIP_CODE"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                      />
                    </Col>
                    <Col lg={12} className="p-0">
                      <Field
                        name="contacts.mobile_numbers"
                        type="text"
                        component={Input}
                        label="TELEPHONE_NUMBER"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                        isInfo
                        infoText={i18n.t('tooltipMessage.MULTIPLE_MOBILE_NUMBER_SHOULD_SEPARATED_BY_SEMICOLON')}
                        onBlur={
                          event => this.onEmailChange('mobile_numbers',
                            event.target.value,
                            'mobileNumber',
                            Constants.resumeDuplciateErrors.mobileNumber
                          )
                        }
                      />
                    </Col>
                    <Col lg={12} className="p-0">
                      <Field
                        name="contacts.emails"
                        type="text"
                        component={Input}
                        label="EMAIL"
                        format={trimSpace}
                        isInfo
                        infoText={i18n.t('tooltipMessage.MULTIPLE_EMAILID_SHOULD_SEPARATED_BY_SEMICOLON')}
                        onBlur={
                          event => this.onEmailChange(
                            'emails',
                            event.target.value,
                            'email',
                            Constants.resumeDuplciateErrors.emails
                          )
                        }
                      />
                    </Col>
                    <Col lg={12} xs={12} className="p-l-0">
                      <Col lg={6} xs={12} className="p-l-0">
                        <Field
                          name="linkedin"
                          type="text"
                          component={Input}
                          label="LINKEDIN"
                          format={trimTrailingSpace}
                          normalize={trimTrailingSpace}
                        />
                      </Col>
                      <Col lg={6} xs={12} className="p-r-0">
                        <Field
                          name="facebook"
                          type="text"
                          component={Input}
                          label="FACEBOOK"
                          format={trimTrailingSpace}
                          normalize={trimTrailingSpace}
                        />
                      </Col>
                    </Col>
                    <br />
                    <Col lg={6} xs={12} className="p-l-0">
                      <Field
                        name="xing"
                        type="text"
                        component={Input}
                        label="XING"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                      />
                    </Col>
                    <Col lg={6} xs={12} className="p-r-0">
                      <Field
                        name="twitter"
                        type="text"
                        component={Input}
                        label="TWITTER"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                      />
                    </Col>
                    <Col lg={12} xs={12} className="p-0">
                      <Field
                        name="personalWebsite"
                        type="text"
                        component={Input}
                        label="PERSONAL_WEBSITE"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                      />
                    </Col>
                    <Col lg={12} xs={12} className="p-0">
                      <Field
                        name="headline"
                        type="text"
                        component={Input}
                        label="NOTE"
                        format={trimTrailingSpace}
                        normalize={trimTrailingSpace}
                      />
                    </Col>
                    <Col lg={12} xs={12} className="p-0">
                      <Field
                        name="total_years_of_experience"
                        type="text"
                        component={Input}
                        label="YEARS_OF_EXPERIENCE"
                        format={trimTrailingSpace}
                        normalize={(value, prevValue) => isNaN(Number(value)) ? prevValue : value}
                        isRequired
                      />
                    </Col>
                    {
                      this.state.showCreateTag && this.renderCreateTag()
                    }
                  </div>
                </Scrollbars>
              </Tab>
              <Tab eventKey={4} title={<Trans>EDUCATION</Trans>} tabClassName={style.tab_size}>
                <FieldArray
                  name="educations"
                  component={this.renderEducations}
                />
              </Tab>
              <Tab eventKey={2} title={<Trans>EXPERIENCE</Trans>} tabClassName={style.tab_size}>
                {(this.renderExperiences && this.renderExperiences.length > 0) &&
                  <FieldArray
                    name="experiences"
                    component={this.renderExperiences}
                  />
                }
              </Tab>
              <Tab eventKey={3} title={<Trans>SKILLS</Trans>} tabClassName={style.tab_size}>
                <FieldArray
                  name="skills"
                  validate={isAvailable}
                  component={this.renderSkills}
                  skillset={this.props.skillList}
                  skillSearchTerm={skillSearchTerm}
                />
              </Tab>
              <Tab eventKey={5} title={<Trans>LANGUAGE</Trans>} tabClassName={style.tab_size}>
                <FieldArray
                  name="languages_known"
                  component={this.renderlanguageSkills}
                  props={{ languageList, languageSearchTerm, selectedLanguages }}
                />
              </Tab>
              <Tab eventKey={6} title={<Trans>OTHERS</Trans>} tabClassName={style.tab_size}>
                <RenderOtherDetails
                  initialValues={this.props.initialValues}
                  handleDateFormat={this.changeDateFormat}
                  isResPerDisabled={isResPerDisabled}
                  isWorkPermitDisabled={isWorkPermitDisabled}
                  isRelocDisabled={isRelocDisabled}
                  form={this.props.form}
                  change={this.props.change}
                  touch={this.props.touch}
                  errors={syncErrors && syncErrors.visas ? syncErrors.visas[0] : null}
                  loadLocations={this.props.loadLocations}
                  locationList={this.props.locationList}
                  extendMarginBottom={extendMarginBottom}
                  handleDatePickerInputClickCb={this.handleDatePickerInputClickCb}
                />
              </Tab>
            </Tabs>
            <Col xs={12} className={style.sub_btn_sec}>
              <button
                type="submit"
                className={`${style.btn_save} button-primary`}
                disabled={isSubmitDisabled}
                onClick={() => {
                  validateSyncErrors(syncErrors, key => this.handleTabSelect(key, () => {
                    setTimeout(() => this.focusToFaultyInput(syncErrors), 1000);
                  }));
                }}
              >
                <Trans>SUBMIT</Trans>
              </button>
              <button
                type="button"
                style={{ marginRight: '15px' }}
                className={`${style.btn_disard} button-secondary`}
                onClick={() => this.confirmDiscardChanges(() => this.props.reset('MultiPartForm'))}
                disabled={!(isFormChanged || isSkillDeleted)}
              >
                <Trans>RESET</Trans>
              </button>
              <button
                type="button"
                style={{ marginRight: '15px' }}
                className={`${style.btn_disard} button-secondary`}
                onClick={() => {
                  const resetAndGoBack = () => {
                    this.props.reset('MultiPartForm');
                    hashHistory.goBack();
                  };
                  if (!(isFormChanged || isSkillDeleted)) {
                    resetAndGoBack();
                  } else {
                    this.confirmDiscardChanges(resetAndGoBack);
                  }
                }}
              >
                <Trans>CANCEL</Trans>
              </button>
            </Col>
          </form>
        </Col>
      </div>
    );
  }
}

