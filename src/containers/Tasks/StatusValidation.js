import memoize from 'lru-memoize';
import { createValidator, required } from 'utils/validation';

const StatusValidation = createValidator({
  status: required,
});
export default memoize(10)(StatusValidation);
