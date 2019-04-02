import memoize from 'lru-memoize';
import { createValidator, required, trimTrailingSpace, restrictMaxLength } from 'utils/validation';
import i18n from '../i18n';

const getRegisterFormConfig = self => {
  const config = {
    title: 'Invite User',
    email: {
      label: 'EMAIL',
      name: 'email',
      component: 'input',
      type: 'text',
      isRequired: true,
      styles: 'styles',
      errorMessage: i18n.t('validationMessage.EMAIL_IS_REQUIRED'),
      format: trimTrailingSpace
    },
    firstname: {
      label: 'FIRST_NAME',
      name: 'firstName',
      component: 'input',
      type: 'text',
      isRequired: true,
      styles: 'styles',
      errorMessage: i18n.t('validationMessage.FIRST_NAME_IS_REQUIRED'),
      format: trimTrailingSpace,
      showLength: true,
      normalize: restrictMaxLength(50),
      autoFocus: true
    },
    lastname: {
      label: 'LAST_NAME',
      name: 'lastName',
      component: 'input',
      type: 'text',
      isRequired: true,
      styles: 'styles',
      format: trimTrailingSpace,
      showLength: true,
      errorMessage: i18n.t('validationMessage.LAST_NAME_IS_REQUIRED'),
      normalize: restrictMaxLength(50)
    },
    role: {
      label: 'ROLE',
      name: 'role',
      valueField: 'id',
      textField: 'name',
      data: self.props.userRoles,
      isFilter: false,
      isRequired: true,
      dropUp: true,
      errorMessage: i18n.t('validationMessage.ROLE_IS_REQUIRED'),
      ignoreFilter: true,
      handleOnChange: self.handleRoleChange,
      // isOpen: self.state.isRoleOpen,
      // closeDropdown: true,
      handleOnSelect: self.handleOnRoleSelect
    }
  };
  return config;
};

const formValidation = createValidator({
  email: required,
  firstname: required,
  role: required
});

export default { getRegisterFormConfig, formValidation: memoize(10)(formValidation) };
