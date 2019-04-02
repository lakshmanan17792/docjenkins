import memoize from 'lru-memoize';
import { createValidator, required, minLength, maxLength, checkConfirmPassword, checkValidPassword, trimWhiteSpaces } from 'utils/validation';

const getResetPasswordFormConfig = () => {
  const config = {
    title: 'Register',
    fields: [
      {
        label: 'PASSWORD',
        name: 'newPassword',
        component: 'password',
        type: 'password',
        normalize: trimWhiteSpaces,
        format: trimWhiteSpaces,
        className: 'input_box',
      },
      {
        label: 'CONFIRM_PASSWORD',
        name: 'confirmPassword',
        component: 'password',
        type: 'password',
        normalize: trimWhiteSpaces,
        format: trimWhiteSpaces,
        className: 'input_box',
      }
    ]
  };
  return config;
};

const resetPasswordValidation = createValidator({
  newPassword: [required, minLength(8), maxLength(25), checkValidPassword('newPassword')],
  confirmPassword: [required, checkConfirmPassword('newPassword')]
});

export default { getResetPasswordFormConfig, resetPasswordValidation: memoize(10)(resetPasswordValidation) };
