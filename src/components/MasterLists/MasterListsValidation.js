import memoize from 'lru-memoize';
import { createValidator, required } from '../../utils/validation.js';

const SkillValidator = createValidator({
  name: required,
});

const PositionValidator = createValidator({
  name: required,
});

const TagValidator = createValidator({
  name: required,
});

const ReasonValidator = createValidator({
  name: required,
});

export default {
  SkillValidator: memoize(10)(SkillValidator),
  PositionValidator: memoize(10)(PositionValidator),
  TagValidator: memoize(10)(TagValidator),
  ReasonValidator: memoize(10)(ReasonValidator),
};
