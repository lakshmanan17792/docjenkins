import memoize from 'lru-memoize';
import { createValidator, required, validateTiming } from 'utils/validation';

const TaskValidation = createValidator({
  title: required,
  dueDate: required,
  type: required,
  assignees: required,
  remainder: validateTiming('dueDate', 'remainder')
});
export default memoize(10)(TaskValidation);
