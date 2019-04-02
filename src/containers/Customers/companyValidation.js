import memoize from 'lru-memoize';
import {
  createValidator, required, isMobileNumber, integerAndDot, companyUrlValidate, pinCode } from 'utils/validation';

const companyValidation = createValidator({
  name: required,
  city: required,
  domain: companyUrlValidate,
  country: required,
  phone: isMobileNumber,
  turnover: integerAndDot,
  postalCode: [pinCode],
});
export default memoize(10)(companyValidation);
