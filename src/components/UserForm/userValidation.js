import memoize from 'lru-memoize';
import { createValidator, required, email } from 'utils/validation';

const surveyValidation = createValidator({
  firstName: [required],
  lastName: required,
  email: [required, email],
  role: [required]
});
export default memoize(10)(surveyValidation);
