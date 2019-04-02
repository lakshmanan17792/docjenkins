import memoize from 'lru-memoize';
import lodash from 'lodash';
import { createValidator, dateDifference, isStartDateEmptyCheck, isEndDateEmptyCheck } from 'utils/validation';
import i18n from '../i18n';

const getFilterConfig = self => {
  const config = {
    title: 'Opening Filter',
    company: {
      label: 'COMPANY',
      name: 'companies',
      valueField: 'id',
      textField: 'name',
      data: self.props.companies,
      isFilter: false,
      placeholder: 'SELECT_A_COMPANY',
      labelClassName: 'company_label',
      ignoreFilter: true,
      // handleOnFocus: self.handleOnCompanyFocus,
      handleOnChange: self.handleOnCompanyChange,
      isOpen: self.state.isCompanyOpen,
      closeDropdown: true,
      handleOnSelect: self.handleOnCompanySelect
    },
    skills: {
      label: 'SKILL',
      name: 'skills',
      valueField: 'id',
      textField: 'name',
      handleOnChange: self.handleOnSkillChange,
      data: self.props.skillList,
      isFilter: false,
      isOpen: self.state.isSkillOpen,
      closeDropdown: true,
      handleOnSelect: self.handleOnSkillSelect,
      placeholder: 'START_TYPING_TO_ADD_THE_SKILL'
    },
    language: {
      label: 'LANGUAGE',
      name: 'languages',
      valueField: 'id',
      textField: 'name',
      data: self.props.languageList,
      isOpen: self.state.isLanguageOpen,
      isFilter: false,
      placeholder: 'START_TYPING_TO_ADD_THE_LANGUAGE',
      ignoreFilter: true,
      handleOnChange: self.handleOnLanguageChange,
      handleOnSelect: self.handleOnLanguageSelect,
      closeDropdown: true
    },
    // profileActivity: {
    //   label: 'ACTIVITY',
    //   name: 'profileActivity',
    //   valueField: 'id',
    //   textField: 'name',
    //   data: [
    //     { id: 'Rejected', name: 'Rejected' },
    //     { id: 'Hired', name: 'Hired' },
    //     { id: 'ToBeSubmitted', name: 'To be submitted' },
    //     { id: 'Shortlisted', name: 'Shortlisted' },
    //     { id: 'Scheduled', name: 'Scheduled' },
    //     { id: 'Contacted', name: 'Contacted' },
    //     { id: 'Interested', name: 'Interested' },
    //     { id: 'Submitted', name: 'Submitted' }

    //   ],
    //   isFilter: false
    // },
    // activityOperator: {
    //   label: 'OPERATOR',
    //   name: 'profileActivity.operator',
    //   valueField: 'name',
    //   textField: 'name',
    //   data: [
    //     { name: '=' },
    //     { name: '>' },
    //     { name: '<' },
    //     { name: '>=' },
    //     { name: '<=' },
    //   ],
    //   isFilter: false,
    //   errorMessage: i18n.t('validationMessage.REQUIRED'),
    // },
    // activityCount: {
    //   label: 'COUNT',
    //   name: 'profileActivity.count',
    //   type: 'number',
    //   errorMessage: i18n.t('validationMessage.REQUIRED'),
    //   normalize: restrictMaxValue(1000),
    //   parse: convertToInteger
    // },
    categories: {
      label: 'JOB_CATEGORY',
      name: 'jobCategories',
      valueField: 'id',
      textField: 'name',
      data: self.props.categories,
      isFilter: false,
      placeholder: 'SELECT_A_CATEGORY',
      ignoreFilter: true,
      handleOnChange: self.handleOnCategoryChange,
      isOpen: self.state.isCategoryOpen,
      closeDropdown: true,
      handleOnSelect: self.handleOnCategorySelect
    },
    jobOpeningTags: {
      label: 'TAGS',
      name: 'tags',
      valueField: 'id',
      textField: 'name',
      data: self.props.tags,
      isFilter: false,
      placeholder: 'SELECT_TAGS_TO_FILTER',
      ignoreFilter: true,
      handleOnChange: lodash.debounce(self.onTagSearch, 1000),
      handleOnSelect: self.handleOnTagSelect,
      id: 'jobTagsFilter'
    },
    statuses: {
      label: 'STATUS',
      name: 'statuses',
      valueField: 'id',
      textField: 'name',
      data: [
        { id: 'active', name: 'Active' },
        { id: 'closed', name: 'Closed' }
      ],
      isFilter: false
    },
    contracts: {
      label: 'EMPLOYMENT_TYPE',
      name: 'contracts',
      valueField: 'id',
      textField: 'name',
      data: [
        { id: 'fullTime', name: 'Full Time' },
        { id: 'partTime', name: 'Freelance' },
        { id: 'contract', name: 'On Contract' }
      ],
      isFilter: false
    },
    priorities: {
      label: 'PRIORITY',
      name: 'priorities',
      valueField: 'id',
      textField: 'name',
      data: [
        { id: 'veryHighPriority', name: 'VERY_HIGH', widths: 3 },
        { id: 'highPriority', name: 'HIGH', widths: 3 },
        { id: 'lowPriority', name: 'LOW', widths: 3 },
        { id: 'veryLowPriority', name: 'VERY_LOW', widths: 3 }
      ],
      isFilter: false
    },
    startDate: {
      name: 'startDate',
      max: new Date(),
      isRequired: false,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      showDatePicker: true,
      dropUp: true,
      placeholder: self.state.isCompanyOpeningFilter ? 'SELECT_THE_START_DATE' : 'START_DATE'
    },
    endDate: {
      name: 'endDate',
      className: 'left-position-popup',
      max: new Date(),
      isRequired: false,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      showDatePicker: true,
      dropUp: true,
      placeholder: self.state.isCompanyOpeningFilter ? 'SELECT_THE_END_DATE' : 'END_DATE'
    },
    recruiter: {
      label: 'RECRUITERS',
      name: 'recruiters',
      valueField: 'id',
      textField: 'name',
      data: self.props.recruiters,
      isFilter: false,
      dropUp: false
    },
  };
  return config;
};

const formValidation = createValidator({
  endDate: [dateDifference('startDate'), isEndDateEmptyCheck('startDate', 'endDate')],
  startDate: [isStartDateEmptyCheck('startDate', 'endDate')]
});

export default { getFilterConfig, openingFilterFormValidation: memoize(10)(formValidation) };
