import memoize from 'lru-memoize';
import { createValidator, required, email, pinCode,
  checkListOfEndDate, dateDifference, urlValidate, isStartDateEmptyCheck, checkContactNos, isDateEmpty
} from 'utils/validation';

const multiPartValidation = createValidator({
  // name: required,
  first_name: required,
  last_name: required,
  salutation: required,
  // nationality: required,
  contacts: {
    emails: [email],
    mobile_numbers: checkContactNos
  },
  location_postcode: [pinCode],
  location_city: [required],
  linkedin: [urlValidate],
  facebook: [urlValidate],
  xing: [urlValidate],
  twitter: [urlValidate],
  links: [urlValidate],
  total_years_of_experience: required,
  educations: [{
    // start_date: isStartDateEmptyCheck('start_date', 'end_date'),
    end_date: [checkListOfEndDate, dateDifference('start_date')]
  }],
  experiences: [{
    // start_date: isStartDateEmptyCheck('start_date', 'end_date'),
    end_date: [checkListOfEndDate, dateDifference('start_date')]
  }],
  skills: [{
    name: required,
  }],
  visas: [{
    res_permit: [isDateEmpty('res_permit', 'res_permit_valid_date')],
    work_permit: [isDateEmpty('work_permit', 'work_permit_valid_date')],
  }],
  avail_start_date: isStartDateEmptyCheck('avail_start_date', 'avail_end_date'),
  avail_end_date: dateDifference('avail_start_date')
});
export default memoize(10)(multiPartValidation);
