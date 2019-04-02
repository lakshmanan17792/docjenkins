import { createValidator, required, isMobileNumber, email, trimTrailingSpace } from 'utils/validation';
import memoize from 'lru-memoize/lib/memoize';
import i18n from '../i18n';

const getCheckDuplicationFormConfig = () => {
  const config = {
    name: {
      label: 'NAME',
      name: 'name',
      type: 'text',
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      format: trimTrailingSpace,
      normalize: trimTrailingSpace,
      autoFocus: true,
      handleOnBlur: () => {}
    },
    emails: {
      label: 'EMAIL',
      name: 'email',
      type: 'text',
      normalize: trimTrailingSpace,
      format: trimTrailingSpace,
      handleOnBlur: () => {}
    },
    mobile_numbers: {
      label: 'TELEPHONE_NUMBER',
      name: 'mobileNumber',
      type: 'text',
      normalize: trimTrailingSpace,
      format: trimTrailingSpace,
      handleOnBlur: () => {}
    }
  };
  return config;
};

const checkduplicationValidation = createValidator({
  name: required,
  email: [email],
  mobileNumber: isMobileNumber
});

export default {
  getCheckDuplicationFormConfig,
  checkduplicationValidation: memoize(10)(checkduplicationValidation)
};
