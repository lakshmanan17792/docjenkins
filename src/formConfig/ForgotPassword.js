import memoize from 'lru-memoize';
import { createValidator, required, trimTrailingSpace, email } from 'utils/validation';

const getForgotPasswordFormConfig = () => {
  const config = {
    title: 'Register',
    fields: [
      {
        label: 'EMAIL',
        name: 'email',
        component: 'input',
        type: 'text',
        format: trimTrailingSpace,
        className: 'input_box'
      }
    ]
  };
  return config;
};

const forgotPasswordValidation = createValidator({
  email: [required, email],
});

export default { getForgotPasswordFormConfig, forgotPasswordValidation: memoize(10)(forgotPasswordValidation) };
