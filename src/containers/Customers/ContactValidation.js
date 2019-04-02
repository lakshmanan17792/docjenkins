import memoize from 'lru-memoize';
import { createValidator, required } from 'utils/validation';

const ContactValidation = createValidator({
  salutation: required,
  firstName: required
});
export default memoize(10)(ContactValidation);
