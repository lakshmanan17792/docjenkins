import memoize from 'lru-memoize';
import {
  createValidator,
  required, minLength, checkConfirmPassword,
  maxLength, trimWhiteSpaces, restrictMaxLength, checkValidPassword } from 'utils/validation';

const getRegisterFormConfig = self => {
  const config = {
    title: 'Register',
    fields: [
      {
        label: 'USERNAME',
        name: 'username',
        component: 'input',
        type: 'text',
        handleOnBlur: self.validateUserName,
        hasOnBlur: true,
        format: trimWhiteSpaces,
        showLength: true,
        normalize: restrictMaxLength(50),
        className: 'input_box',
        autofocus: true
      },
      {
        label: 'PASSWORD',
        name: 'password',
        component: 'input',
        type: 'password',
        className: 'input_box',
      },
      {
        label: 'CONFIRM_PASSWORD',
        name: 'confirmPassword',
        component: 'input',
        type: 'password',
        className: 'input_box',
      }
    ]
  };
  return config;
};

const registerValidation = createValidator({
  password: [required, minLength(8), maxLength(25), checkValidPassword('password')],
  confirmPassword: [required, checkConfirmPassword('password')]
});

export default { getRegisterFormConfig, registerValidation: memoize(10)(registerValidation) };
