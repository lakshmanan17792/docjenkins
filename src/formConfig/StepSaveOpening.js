import memoize from 'lru-memoize';
import {
  createValidator, required, maxValue, openingStatus,
  dateDifference, isStartDateEmpty, isEndDateEmpty, startdateDifference,
  restrictMaxValue, convertToInteger, trimTrailingSpace, restrictDecimalNumber
} from 'utils/validation';
import i18n from '../i18n';

const getBasicDetailsFormConfig = self => ({
  jobTitle: {
    label: 'TITLE',
    name: 'jobTitle',
    type: 'text',
    isRequired: true,
    errorMessage: i18n.t('validationMessage.REQUIRED'),
    format: trimTrailingSpace,
    normalize: trimTrailingSpace,
    handleOnBlur: self.handleOnBlurTitle,
    handleOnFocus: self.handleOnFocusTitle,
    // autoFocus: true
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
  tags: {
    label: 'TAG(S)',
    name: 'tags',
    valueField: 'id',
    textField: 'name',
    data: self.props.jobOpeningTags,
    isFilter: false,
    dropUp: false,
    isRequired: false,
    format: trimTrailingSpace,
    normalize: trimTrailingSpace,
    errorMessage: i18n.t('validationMessage.REQUIRED'),
    ignoreFilter: true
  },
});

const getJobDetailsFormConfig = self => ({
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
  priority: {
    label: 'PRIORITY',
    name: 'priority',
    valueField: 'id',
    textField: 'name',
    isRequired: true,
    data: [
      { id: 'veryHighPriority', name: i18n.t('VERY_HIGH') },
      { id: 'highPriority', name: i18n.t('HIGH') },
      { id: 'lowPriority', name: i18n.t('LOW') },
      { id: 'veryLowPriority', name: i18n.t('VERY_LOW') }
    ],
    isFilter: false
  },
  categories: {
    label: 'JOB_CATEGORIES',
    name: 'jobCategories',
    valueField: 'id',
    textField: 'name',
    data: self.props.categories,
    isFilter: false,
    dropUp: false,
    ignoreFilter: true,
    isOpen: self.state.isJobCategoriesOpen,
    closeDropdown: true,
    placeholder: 'START_TYPING_TO_ADD_JOB_CATEOGORY',
    handleOnChange: self.handleOnJobCatgChange,
    handleOnSelect: self.handleOnJobCatgSelect,
  },
  deliveryHeads: {
    label: 'ASSIGN_TO_DELIVERY_HEAD',
    name: 'deliveryHeads',
    valueField: 'id',
    textField: 'firstName',
    data: self.props.deliveryHeads,
    handleOnChange: self.handleOnDeliveryHeadChange,
    isFilter: false,
    dropUp: false,
    // isOpen: self.state.isRecruiterOpen,
    // closeDropdown: true,
    isRequired: true,
    errorMessage: i18n.t('validationMessage.REQUIRED'),
    handleOnSelect: self.handleOnDeliveryHeadSelect,
    ignoreFilter: true
  },
  salesOwners: {
    label: 'ASSIGN_TO_ACCOUNT_OWNER(S)',
    name: 'salesOwners',
    valueField: 'id',
    textField: 'fullName',
    data: self.props.salesOwners,
    isFilter: false,
    dropUp: false,
    isRequired: true,
    errorMessage: i18n.t('validationMessage.REQUIRED'),
    ignoreFilter: true
  },
  recruiters: {
    label: 'ASSIGN_TO_RECRUITER(S)',
    name: 'recruiters',
    valueField: 'id',
    textField: 'fullName',
    data: self.props.recruiterList,
    isFilter: false,
    dropUp: false,
    isRequired: true,
    errorMessage: i18n.t('validationMessage.REQUIRED'),
    ignoreFilter: true
  },
  fields: {
    positions: {
      label: 'POSITION',
      name: 'positions',
      valueField: 'id',
      textField: 'name',
      handleOnChange: self.handleOnPositionChange,
      data: self.props.positionList,
      isFilter: false,
      dropUp: false,
      isOpen: self.state.isPositionOpen,
      closeDropdown: true,
      handleOnSelect: self.handleOnPositionSelect,
      placeholder: 'START_TYPING_TO_ADD_THE_POSITION',
    }
  },
});
const getOtherDetailsFormConfig = self => ({
  openingLocation: {
    label: 'WORK_LOCATION',
    name: 'openingLocation',
    valueField: 'id',
    textField: 'displayName',
    handleOnChange: self.handleOnLocationChange,
    data: self.props.openingLocation,
    isFilter: false,
    closeDropdown: true,
    isOpen: self.state.isLocationOpen,
    handleOnSelect: self.handleOnLocationSelect,
    handleOnAfterChanges: self.handleOnAfterChanges,
    messages: {
      emptyList: i18n.t('NO_RESULTS_FOUND'),
      emptyFilter: i18n.t('NO_RESULTS_FOUND')
    },
    dropUp: false
  },
  startDate: {
    label: 'JOB_OPENING_DATE',
    name: 'startDate',
    min: new Date(),
    max: new Date('3099-12-31'),
    showDatePicker: true,
    dropUp: false
  },
  endDate: {
    label: 'SUBMISSION_DUE_DATE',
    name: 'endDate',
    min: new Date(),
    max: new Date('3099-12-31'),
    dropUp: false,
    showDatePicker: true,
    onDateChange: self.onDateChange
  },
  status: {
    label: 'STATUS',
    name: 'status',
    valueField: 'id',
    textField: 'name',
    isRequired: true,
    data: [
      { id: 'active', name: i18n.t('ACTIVE') },
      { id: 'closed', name: i18n.t('CLOSED') }
    ],
    isFilter: false,
    handleOnChange: self.handleOnStatusChange,
    showDatePicker: true,
    dropUp: false
  },
  type: {
    label: 'EMPLOYMENT_TYPE',
    name: 'type',
    activeBtn: 'fullTime',
    buttons: [
      { id: 'fullTime', name: i18n.t('FULL_TIME') },
      { id: 'contract', name: i18n.t('CONTRACT') },
      { id: 'partTime', name: i18n.t('FREELANCE') }
    ],
    resetFields: self.resetFields
  },
  ispublic: {
    label: 'IS_PUBLIC',
    name: 'ispublic',
    valueField: 'id',
    textField: 'name',
    isRequired: true,
    data: [
      { id: true, name: i18n.t('PUBLIC') },
      { id: false, name: i18n.t('INTERNAL') }
    ],
    isFilter: false,
    dropUp: false,
    errorMessage: i18n.t('validationMessage.REQUIRED')
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
    contractLocation: {
      label: 'REMOTE',
      name: 'jobOpeningDetails.contractLocation'
    },
    partTimeLocation: {
      label: 'REMOTE',
      name: 'jobOpeningDetails.partTimeLocation'
    },
    // fullTimeEndDate: {
    //   label: 'END_DATE',
    //   name: 'jobOpeningDetails.fullTimeEndDate',
    //   min: new Date(),
    //   max: new Date('3099-12-31'),
    //   showDatePicker : true,
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
      dropUp: true,
      // onDateChange: self.onEmpTypeContractDateChange
    },
    contractStartDate: {
      label: 'START_DATE',
      name: 'jobOpeningDetails.contractStartDate',
      min: new Date(),
      max: new Date('3099-12-31'),
      showDatePicker: true,
      dropUp: true
    },
    freelanceEndDate: {
      label: 'END_DATE',
      name: 'jobOpeningDetails.freelanceEndDate',
      min: new Date(),
      max: new Date('3099-12-31'),
      showDatePicker: true,
      dropUp: true,
      // onDateChange: self.onEmpTypeFreeLancDateChange
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
      type: 'number',
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
});


const basicDetailsValidation = createValidator({
  jobTitle: [required],
  company: required,
  contactPerson: required
});

const jobDetailsValidation = createValidator({
  vacancies: required,
  priority: required,
  recruiters: required,
  salesOwners: required,
  deliveryHeads: required,
  endDate: [dateDifference('startDate'), isEndDateEmpty('startDate', 'endDate')],
  startDate: [isStartDateEmpty('startDate', 'endDate')],
});

const otherDetailsValidation = createValidator({
  endDate: [dateDifference('startDate'),
    isEndDateEmpty('startDate', 'endDate'), openingStatus('status')],
  startDate: [isStartDateEmpty('startDate', 'endDate'), startdateDifference()],
  status: required,
  ispublic: required,
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

export default {
  getBasicDetailsFormConfig,
  getJobDetailsFormConfig,
  getOtherDetailsFormConfig,
  basicDetailsValidation: memoize(10)(basicDetailsValidation),
  jobDetailsValidation: memoize(10)(jobDetailsValidation),
  otherDetailsValidation: memoize(10)(otherDetailsValidation)
};
