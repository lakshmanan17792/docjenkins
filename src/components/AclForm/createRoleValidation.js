import memoize from 'lru-memoize';
import { createValidator, required } from 'utils/validation';

const createRoleValidation = createValidator({
  name: required,
  reporter: required,
});
export default memoize(10)(createRoleValidation);
