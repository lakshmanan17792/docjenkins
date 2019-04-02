import memoize from 'lru-memoize';
import { createValidator, required, trimWhiteSpaces, restrictUserName } from 'utils/validation';
import i18n from '../i18n';

const getLoginFormConfig = () => {
  const config = {
    title: 'Login',
    fields: [
      {
        label: 'USERNAME',
        name: 'username',
        component: 'input',
        type: 'text',
        format: trimWhiteSpaces,
        errorMessage: i18n.t('validationMessage.USERNAME_IS_REQUIRED'),
        normalize: restrictUserName(50),
        autoFocus: true,
        className: 'input_box'
      },
      {
        label: 'PASSWORD',
        name: 'password',
        component: 'input',
        type: 'password',
        errorMessage: i18n.t('validationMessage.PASSWORD_IS_REQUIRED'),
        normalize: trimWhiteSpaces,
        format: trimWhiteSpaces,
        className: 'input_box'
      }
    ]
  };
  return config;
};

const loginValidation = createValidator({
  username: required,
  password: required,
  terms_and_condition: required
});

export default { getLoginFormConfig, loginValidation: memoize(10)(loginValidation) };
