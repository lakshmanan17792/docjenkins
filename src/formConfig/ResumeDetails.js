// import memoize from 'lru-memoize';
// import { trimTrailingSpace } from 'utils/validation';

const getResumeFormConfig = self => {
  const config = {
    dob: {
      label: 'DOB',
      name: 'dob',
      max: new Date(),
      showDatePicker: true,
      dropUp: false,
      isTime: false,
      handleInputClickCb: () => self.handleDatePickerInputClickCb('personalDOB', 'personalTab', self.personalScrollRef),
      id: 'personalDOB'
    },
    residencyPermit: {
      name: 'visas[0].res_permit_valid_date',
      min: new Date(),
      max: new Date('3099-12-31'),
      showDatePicker: true,
      dropUp: false,
      isTime: false,
      normalize: self.changeDateFormat,
      format: self.changeDateFormat,
      placeholder: 'SELECT_THE_DATE',
      disabled: self.props.isResPerDisabled,
      id: 'visas[0].res_permit_valid_date',
      className: 'residencyPermit'
    },
    workPermit: {
      name: 'visas[0].work_permit_valid_date',
      min: new Date(),
      max: new Date('3099-12-31'),
      showDatePicker: true,
      dropUp: false,
      isTime: false,
      normalize: self.changeDateFormat,
      format: self.changeDateFormat,
      placeholder: 'SELECT_THE_DATE',
      disabled: self.props.isWorkPermitDisabled,
      id: 'visas[0].work_permit_valid_date',
      className: 'workPermit'
    },
    availableStartDate: {
      name: 'avail_start_date',
      min: new Date(),
      max: new Date('3099-12-31'),
      showDatePicker: true,
      dropUp: false,
      isTime: false,
      placeholder: 'SELECT_THE_START_DATE',
      normalize: self.changeDateFormat,
      format: self.changeDateFormat,
      id: 'avail_start_date'
    },
    availableEndDate: {
      name: 'avail_end_date',
      min: new Date(),
      max: new Date('3099-12-31'),
      showDatePicker: true,
      dropUp: false,
      isTime: false,
      placeholder: 'SELECT_THE_END_DATE',
      normalize: self.changeDateFormat,
      format: self.changeDateFormat,
      onChange: self.handleStartDate,
      id: 'avail_end_date'
    },
    visa: {
      label: 'VISA',
      name: 'visas[0].visa',
      valueField: 'id',
      textField: 'name',
      data: ['US citizen', 'H1B', 'OPT', 'EAD', 'Green Card', 'No Visa'],
      isFilter: false,
      dropUp: false,
      isTime: false,
      isRequired: false,
      placeholder: 'SELECT_THE_VISA'
    },
    dueDate: {
      label: 'Due Date',
      name: 'dueDate',
      min: new Date(),
      max: new Date('3099-12-31'),
      isTime: true,
      isRequired: true,
      normalize: self.changeDateFormat,
      format: self.changeDateFormat,
      handleInputClickCb: () =>
        self.handleDatePickerInputClickCb('dueDateOtherDetails', 'otherDetails', self.otherDetailsScrollRef),
      id: 'dueDateOtherDetails'
    }
  };
  return config;
};

export default { getResumeFormConfig };
