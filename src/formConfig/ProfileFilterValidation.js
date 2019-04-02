import memoize from 'lru-memoize';
import { createValidator, checkNoticeType, checkNoticePeriod } from '../utils/validation';

const ProfileFilterValidation = createValidator({
  noticePeriod: checkNoticePeriod,
  noticePeriodType: checkNoticeType
});

export default memoize(10)(ProfileFilterValidation);
