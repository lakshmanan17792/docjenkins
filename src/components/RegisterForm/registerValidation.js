import memoize from 'lru-memoize';
import { createValidator, required, email } from 'utils/validation';

const registerValidation = createValidator({
  firstName: required,
  lastName: required,
  email: [required, email],
  username: required,
  password: required
});
export default memoize(10)(registerValidation);
