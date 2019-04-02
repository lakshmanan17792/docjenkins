import memoize from 'lru-memoize';
import { createValidator, required, minLength, maxLength, checkValidPassword, trimWhiteSpaces } from 'utils/validation';
import i18n from '../i18n';

const getChangePasswordFormConfig = () => {
  const config = {
    title: 'Change Password',
    fields: [
      {
        label: 'OLD_PASSWORD',
        name: 'oldPassword',
        component: 'input',
        type: 'password',        
        errorMessage: i18n.t('validationMessage.PLEASE_ENTER_OLD_PASSWORD'),
        isRequired: true
      },
      {
        label: 'NEW_PASSWORD',
        name: 'newPassword',
        component: 'input',
        type: 'password',
        normalize: trimWhiteSpaces,
        format: trimWhiteSpaces,
        isRequired: true
      },
      {
        label: 'CONFIRM_NEW_PASSWORD',
        name: 'confirmPassword',
        component: 'input',
        type: 'password',
        normalize: trimWhiteSpaces,
        format: trimWhiteSpaces,
        errorMessage: i18n.t('validationMessage.PLEASE_ENTER_CONFIRM_PASSWORD'),
        isRequired: true
      }
    ]
  };
  return config;
};

const changePasswordValidation = createValidator({
  oldPassword: required,
  newPassword: [required, minLength(8), maxLength(25), checkValidPassword('newPassword', 'oldPassword')],
  confirmPassword: required
});

export default { getChangePasswordFormConfig, changePasswordValidation: memoize(10)(changePasswordValidation) };
