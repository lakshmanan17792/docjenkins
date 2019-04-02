
import memoize from 'lru-memoize';
import lodash from 'lodash';
import { createValidator, required, trimTrailingSpace,
  isMobileNumber, urlValidate, checkIfJoiningDateRequired } from 'utils/validation';

const email = value => value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(lodash.trim(value))
  ? 'Invalid email address'
  : undefined;
const getContactedFormConfig = self => {
  const fields = {
    contacted: [
      {
        label: 'CONTACTED_BY',
        name: 'user',
        placeholder: 'SELECT_A_USER',
        data: self.props.selectedOpening ?
          lodash.uniqBy([...self.props.selectedOpening.deliveryHeads,
            ...self.props.selectedOpening.recruiters, self.props.user], 'id')
          : [self.props.user],
        valueField: 'id',
        textField: 'firstName',
        dropUp: false,
        isFilter: false,
        isRequired: true,
        sectionWidths: [12, 12, 12],
        // errorMessage: 'Contacted user name cannot be empty'
      }, {
        label: 'CONTACTED_DATE_AND_TIME',
        name: 'contactDate',
        min: new Date('1910-01-01 00:00:00'),
        max: new Date(),
        isRequired: true,
        isTime: true,
        // errorMessage: 'Contacted time cannot be empty',
        sectionWidths: [12, 12, 12]
      }, {
        label: 'COMMUNICATION_TYPE',
        name: 'contactMode',
        placeholder: 'SELECT_A_COMMUNICATION_TYPE',
        valueField: 'id',
        textField: 'name',
        data: [
          { id: 'email', name: 'Email' },
          { id: 'phone', name: 'Phone' },
          { id: 'linkedin', name: 'Linkedin' },
          { id: 'facebook', name: 'Facebook' },
          { id: 'xing', name: 'Xing' },
          { id: 'twitter', name: 'Twitter' },
          { id: 'others', name: 'Others' },
        ],
        // data: this.props.communicationTypes,
        dropUp: false,
        isFilter: false,
        isRequired: true,
        sectionWidths: [12, 12, 12],
        handleOnChange: self.handleOnCommunicationTypeChange
        // errorMessage: 'Communication type cannot be empty'
      }, {
        label: self.state.communicationType.toUpperCase(),
        name: self.state.communicationType,
        type: 'text',
        isRequired: true,
        sectionWidths: [12, 12, 12],
        // errorMessage: 'Email cannot be empty'
      }, {
        label: 'COMMENTS',
        name: 'comments',
        component: 'textarea',
        type: 'text',
        placeholder: 'TYPE_COMMENTS',
        isRequired: false,
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }
    ],
    submitted: [
      {
        label: 'COMMENTS',
        name: 'comments',
        component: 'textarea',
        type: 'text',
        isRequired: false,
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }
    ],
    interested: [
      {
        label: 'COMMENTS',
        name: 'comments',
        component: 'textarea',
        type: 'text',
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }
    ],
    toBeSubmitted: [
      {
        label: 'COMMENTS',
        name: 'comments',
        component: 'textarea',
        type: 'text',
        isRequired: false,
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }
    ],
    shortlisted: [
      {
        label: 'COMMENTS_BY_CLIENT',
        name: 'commentsByClient',
        component: 'textarea',
        type: 'text',
        isRequired: false,
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      },
      {
        label: 'COMMENTS',
        name: 'comments',
        component: 'textarea',
        type: 'text',
        isRequired: false,
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }
    ],
    scheduled: [
      {
        label: 'LEVELS',
        name: 'level',
        data: /* this.props.recruiters */
        ['Level 1', 'Level 2', 'Level 3'],
        dropUp: false,
        isFilter: false,
        isRequired: true,
        handleOnChange: self.handleOnLevelChange,
        sectionWidths: [12, 12, 12]
        // errorMessage: 'User name is required'
      }, {
        label: 'LEVEL_NAME',
        name: 'levelName',
        placeholder: 'LEVEL_NAME',
        format: trimTrailingSpace,
        type: 'text',
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }, {
        label: 'INTERVIEWER',
        name: 'interviewer',
        placeholder: 'INTERVIEWER_NAME',
        format: trimTrailingSpace,
        type: 'text',
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }, {
        label: 'STATUS',
        name: 'status',
        data: ['In progress', 'On hold', 'Selected', 'Rejected'],
        dropUp: false,
        isFilter: false,
        isRequired: true,
        sectionWidths: [12, 12, 12]
        // errorMessage: 'User name is required'
      }, {
        label: 'INTERVIEW_DATE_AND_TIME',
        name: 'interviewDate',
        min: new Date(),
        max: new Date('3099-12-31'),
        isTime: true,
        isRequired: true,
        sectionWidths: [12, 12, 12]
      }, {
        label: 'COMMENTS',
        name: 'comments',
        component: 'textarea',
        type: 'text',
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }
    ],
    hired: [
      {
        sectionWidths: [12, 12, 12],
        data: ['Yes', 'No'],
        isRequired: true,
        name: 'hasJoined',
        label: 'Has Joined'
      },
      {
        label: 'JOINING_DATE',
        name: 'joiningDate',
        min: new Date('1970-01-01'),
        max: new Date('3099-12-31'),
        sectionWidths: [12, 12, 12],
        showDatePicker: true,
      }, {
        label: 'PAYMENT_TERMS',
        name: 'paymentTerms',
        component: 'textarea',
        type: 'text',
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }, {
        label: 'COMMENTS',
        name: 'comments',
        component: 'textarea',
        type: 'text',
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }
    ],
    rejected: [
      {
        name: 'reasonForRejecting',
        label: 'REASON_FOR_REJECTING',
        valueField: 'id',
        textField: 'name',
        onSearch: self.searchRejectReasons,
        onSelect: self.handleOnSelectReasons,
        data: self.props.rejectReasonList,
        selectedOption: self.state.selectedRejectReason,
        placeholder: 'SELECT_REASON_FOR_REJECTING',
        isRequired: true,
        sectionWidths: [12, 12, 12],
      }, {
        label: 'REASON_BY_CLIENT',
        name: 'reasonByClient',
        component: 'textarea',
        type: 'text',
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }, {
        label: 'MY_COMMENTS',
        name: 'comments',
        component: 'textarea',
        type: 'text',
        sectionWidths: [12, 12, 12]
        // errorMessage: 'Communication type is required'
      }
    ]
  };
  return fields;
};

const formValidation = createValidator({
  user: [required],
  contactDate: [required],
  contactMode: [required],
  email: [email, required],
  phone: [isMobileNumber, required],
  linkedin: [required, urlValidate],
  facebook: [required, urlValidate],
  xing: [required, urlValidate],
  twitter: [required, urlValidate],
  others: [required],
  level: [required],
  status: [required],
  interviewDate: [required],
  reasonForRejecting: [required],
  hasJoined: [required],
  joiningDate: [checkIfJoiningDateRequired('hasJoined', 'joiningDate')]
});

export default {
  getContactedFormConfig,
  formValidation: memoize(10)(formValidation)
};
