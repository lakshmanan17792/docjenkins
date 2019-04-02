// import memoize from 'lru-memoize';
import { trimTrailingSpace } from 'utils/validation';
import i18n from '../i18n';

const getTaskFormConfig = self => {
  const config = {
    title: 'Save Task',
    taskTitle: {
      label: 'TITLE',
      name: 'title',
      type: 'text',
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      format: trimTrailingSpace,
      autoFocus: true
    },
    company: {
      label: 'COMPANY',
      name: 'clients',
      valueField: 'id',
      textField: 'name',
      data: self.props.customers,
      isFilter: false,
      dropUp: false,
      ignoreFilter: false,
      handleOnChange: self.handleChange,
      onChange: self.handleCompanyChange,
      isOpen: self.state.isCompanyOpen,
      closeDropdown: true,
      placeholder: 'START_TYPING_TO_SELECT_THE_COMPANY',
    },
    contact: {
      label: 'CONTACT(S)',
      name: 'contacts',
      valueField: 'id',
      textField: 'name',
      data: self.state.contactList,
      handleSelectAll: self.handleSelectAll,
      isFilter: false,
      dropUp: false,
      ignoreFilter: true,
      selectAll: true
    },
    opening: {
      label: 'JOB_OPENING',
      name: 'jobOpenings',
      valueField: 'id',
      textField: 'jobTitle',
      data: self.state.jobOpeningList,
      isFilter: false,
      dropUp: false,
      ignoreFilter: true,
      handleOnChange: self.handleOpeningChange,
      handleOnSelect: self.handleOpeningSelect,
      isOpen: self.state.isOpeningOpen,
      closeDropdown: true,
      placeholder: 'START_TYPING_TO_SELECT_THE_JOB_OPENING',
    },
    dueDate: {
      label: 'DUE_DATE',
      name: 'dueDate',
      min: new Date(),
      max: new Date('3099-12-31'),
      isTime: true,
      isRequired: true,
      onChange: self.handleRemainderType
    },
    emailRemainderDate: {
      label: 'REMINDER_TYPE',
      name: 'remainderDate',
      valueField: 'id',
      textField: 'text',
      data: self.state.remainderTypes,
      isFilter: false,
      dropUp: false,
      ignoreFilter: true,
      handleOnChange: self.handleDatePicker,
      isNotDefaultMessage: true
    },
    emailRemainderTime: {
      label: 'TIME',
      name: 'remainder',
      min: new Date('1910-01-01 00:00:00'),
      max: new Date('3099-12-31 24:00:00'),
      isTime: true,
      isRequired: false,
      isDate: false,
      disabled: !self.state.enableTimePicker,
      title: 'Select Due Date and Reminder Type',
      isCustomToolTip: true
    },
    comment: {
      label: 'COMMENT',
      name: 'comments',
      component: 'textarea',
      type: 'text',
    },
    type: {
      label: 'TYPE',
      name: 'type',
      valueField: 'id',
      textField: 'text',
      data: [
        { id: 1, name: 'Call', text: i18n.t('CALL') },
        { id: 2, name: 'E-Mail', text: i18n.t('EMAIL') },
        { id: 3, name: 'To-Do', text: i18n.t('TODO') }
      ],
      isFilter: false,
      dropUp: false,
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
    },
    assignees: {
      label: 'ASSIGN_TO',
      name: 'assignees',
      valueField: 'id',
      textField: 'firstName',
      data: self.state.users,
      isFilter: false,
      dropUp: false,
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      ignoreFilter: true,
      onChange: self.handleAssigneeChange,
      selectAll: true,
      handleSelectAll: self.handleSelectAll
    }
  };
  return config;
};

export default { getTaskFormConfig };
