import memoize from 'lru-memoize';
import {
  createValidator, required, maxValue,
  dateDifference, isStartDateEmpty, isEndDateEmpty,
  restrictMaxValue, convertToInteger, trimTrailingSpace, restrictDecimalNumber
} from 'utils/validation';
import i18n from '../i18n';

const getOpeningFormConfig = self => {
  const config = {
    title: 'Save Opening',
    jobTitle: {
      label: 'TITLE',
      name: 'jobTitle',
      type: 'text',
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      format: trimTrailingSpace,
      handleOnBlur: self.handleOnBlurTitle,
      handleOnFocus: self.handleOnFocusTitle
      // placeholder: 'Eg. Lead Java Developer'
    },
    description: {
      label: 'DESCRIPTION',
      name: 'description',
      component: 'textarea',
      type: 'text',
      toolbarOptions: {
        options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link'],
        inline: {
          options: ['bold', 'italic', 'underline', 'strikethrough']
        },
        blockType: {
          options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
        }
      }
      // placeholder: 'Describe the opening, notes to team members to etc.'
    },
    vacancies: {
      label: 'NO_OF_VACANCIES',
      name: 'vacancies',
      type: 'number',
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      normalize: restrictMaxValue(1000),
      parse: convertToInteger
      // placeholder: 'No of vacancies'
    },
    company: {
      label: 'COMPANY',
      name: 'company',
      valueField: 'id',
      textField: 'name',
      data: self.props.companies,
      isFilter: false,
      dropUp: false,
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      // handleOnScroll: self.handleOnScroll,
      handleOnChange: self.handleOnCompanyChange,
    },
    type: {
      label: 'EMPLOYMENT_TYPE',
      name: 'type',
      activeBtn: 'fullTime',
      buttons: [
        { id: 'fullTime', name: 'Full Time' },
        { id: 'contract', name: 'Contract' },
        { id: 'partTime', name: 'Freelance' }
      ],
      resetFields: self.resetFields
    },
    contactPerson: {
      label: 'CONTACTS_PERSON',
      name: 'contactPerson',
      valueField: 'id',
      textField: item => self.displayName(item),
      data: self.props.contactPerson,
      isFilter: false,
      dropUp: true,
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      ignoreFilter: true
    },
    recruiters: {
      label: 'RECRUITERS',
      name: 'recruiters',
      valueField: 'id',
      textField: 'firstName',
      data: self.props.recruiters,
      isFilter: false,
      dropUp: false,
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      ignoreFilter: true,
      handleOnChange: self.handleOnRecruiterChange,
      isOpen: self.state.isRecruiterOpen,
      closeDropdown: true,
      handleOnSelect: self.handleOnRecruiterSelect
    },
    priority: {
      label: 'PRIORITY',
      name: 'priority',
      valueField: 'id',
      textField: 'name',
      isRequired: true,
      data: [
        { id: 'veryHighPriority', name: 'Very High' },
        { id: 'highPriority', name: 'High' },
        { id: 'lowPriority', name: 'Low' },
        { id: 'veryLowPriority', name: 'Very Low' }
      ],
      isFilter: false
    },
    categories: {
      label: 'CATEGORIES',
      name: 'jobCategories',
      valueField: 'id',
      textField: 'name',
      data: self.props.categories,
      isFilter: false,
      dropUp: true,
      ignoreFilter: true,
      handleOnChange: self.handleOnCategoryChange,
      isOpen: self.state.isCategoryOpen,
      closeDropdown: true,
      handleOnSelect: self.handleOnCategorySelect
    },
    startDate: {
      label: 'START_DATE',
      name: 'startDate',
      min: new Date(),
      max: new Date('3099-12-31'),
      showDatePicker: true,
      dropUp: true
    },
    endDate: {
      label: 'DUE_DATE',
      name: 'endDate',
      min: new Date(),
      max: new Date('3099-12-31'),
      showDatePicker: true,
      dropUp: true
    },
    openingLocation: {
      label: 'PLACEMENT_LOCATION',
      name: 'openingLocation',
      valueField: 'id',
      textField: 'name',
      handleOnChange: self.handleOnLocationChange,
      data: self.props.openingLocation,
      isFilter: true,
      closeDropdown: true,
      isOpen: self.state.isLocationOpen,
      handleOnSelect: self.handleOnLocationSelect,
      dropUp: false
    },
    jobOpeningDetails: {
      salary: {
        label: 'SALARY_IN_€_(PER_ANNUM)',
        name: 'jobOpeningDetails.salary',
        type: 'wholeNumber',
        parse: convertToInteger,
        handleOnKeyPress: restrictDecimalNumber
        // placeholder: 'Eg. Lead Java Developer'
      },
      permFee: {
        label: 'PERM_FEE',
        name: 'jobOpeningDetails.permFee',
        errorMessage: i18n.t('validationMessage.VALUE_MUST_BE_LESS_THAN_100'),
        validate: maxValue,
        type: 'wholeNumber',
        parse: convertToInteger,
        handleOnKeyPress: restrictDecimalNumber
      },
      fullTimeASAP: {
        label: 'START_ASAP',
        name: 'jobOpeningDetails.fullTimeASAP'
      },
      contractASAP: {
        label: 'START_ASAP',
        name: 'jobOpeningDetails.contractASAP'
      },
      partTimeASAP: {
        label: 'START_ASAP',
        name: 'jobOpeningDetails.partTimeASAP'
      },
      contractRemoteLocation: {
        label: 'REMOTE',
        name: 'jobOpeningDetails.contractRemoteLocation'
      },
      partTimeRemoteLocation: {
        label: 'REMOTE',
        name: 'jobOpeningDetails.partTimeRemoteLocation'
      },
      contractOnsiteLocation: {
        label: 'ONSITE',
        name: 'jobOpeningDetails.contractOnsiteLocation'
      },
      partTimeOnsiteLocation: {
        label: 'ONSITE',
        name: 'jobOpeningDetails.partTimeOnsiteLocation'
      },
      // fullTimeEndDate: {
      //   label: 'End Date',
      //   name: 'jobOpeningDetails.fullTimeEndDate',
      //   min: new Date(),
      //   max: new Date('3099-12-31'),
      //   dropUp: true
      // },
      fullTimeStartDate: {
        label: 'START_DATE',
        name: 'jobOpeningDetails.fullTimeStartDate',
        min: new Date(),
        max: new Date('3099-12-31'),
        showDatePicker: true,
        dropUp: true
      },
      contractEndDate: {
        label: 'END_DATE',
        name: 'jobOpeningDetails.contractEndDate',
        min: new Date(),
        max: new Date('3099-12-31'),
        showDatePicker: true,
        dropUp: true
      },
      contractStartDate: {
        label: 'START_DATE',
        name: 'jobOpeningDetails.contractStartDate',
        min: new Date(),
        showDatePicker: true,
        max: new Date('3099-12-31'),
        dropUp: true
      },
      freelanceEndDate: {
        label: 'END_DATE',
        name: 'jobOpeningDetails.freelanceEndDate',
        min: new Date(),
        max: new Date('3099-12-31'),
        showDatePicker: true,
        dropUp: true
      },
      freelanceStartDate: {
        label: 'START_DATE',
        name: 'jobOpeningDetails.freelanceStartDate',
        min: new Date(),
        max: new Date('3099-12-31'),
        showDatePicker: true,
        dropUp: true
      },
      billRate: {
        label: 'BILL_RATE_IN_€_(IN_HRS)',
        name: 'jobOpeningDetails.billRate',
        type: 'wholeNumber',
        parse: convertToInteger,
        handleOnKeyPress: restrictDecimalNumber
      },
      payRate: {
        label: 'PAY_RATE_IN_€_(IN_HRS)',
        name: 'jobOpeningDetails.payRate',
        type: 'wholeNumber',
        parse: convertToInteger,
        handleOnKeyPress: restrictDecimalNumber
      },
      payRateFreelance: {
        label: 'PAY_RATE_IN_€_(IN_HRS)',
        name: 'jobOpeningDetails.payRateFreelance',
        type: 'wholeNumber',
        parse: convertToInteger,
        handleOnKeyPress: restrictDecimalNumber
      },
      salaryContract: {
        label: 'SALARY_IN_€_(IN_HRS)',
        name: 'jobOpeningDetails.salaryContract',
        type: 'wholeNumber',
        parse: convertToInteger,
        handleOnKeyPress: restrictDecimalNumber
        // placeholder: 'Eg. Lead Java Developer'
      }
    }
  };
  return config;
};


const formValidation = createValidator({
  jobTitle: required,
  company: required,
  vacancies: required,
  recruiters: required,
  contactPerson: required,
  priority: required,
  endDate: [dateDifference('startDate'), isEndDateEmpty('startDate', 'endDate')],
  startDate: [isStartDateEmpty('startDate', 'endDate')],
  jobOpeningDetails: {
    freelanceEndDate: [
      dateDifference('freelanceStartDate'),
      isEndDateEmpty('freelanceStartDate', 'freelanceEndDate')
    ],
    freelanceStartDate: [isStartDateEmpty('freelanceStartDate', 'freelanceEndDate')],
    contractEndDate: [
      dateDifference('contractStartDate'),
      isEndDateEmpty('contractStartDate', 'contractEndDate')
    ],
    contractStartDate: [isStartDateEmpty('contractStartDate', 'contractEndDate')],
    // fullTimeEndDate: [
    //   dateDifference('fullTimeStartDate'),
    //   isEndDateEmpty('fullTimeStartDate', 'fullTimeEndDate')
    // ],
    // fullTimeStartDate: [isStartDateEmpty('fullTimeStartDate', 'fullTimeEndDate')],
  }
});

export default { getOpeningFormConfig, formValidation: memoize(10)(formValidation) };
