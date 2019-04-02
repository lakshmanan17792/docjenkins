import memoize from 'lru-memoize';
import { createValidator, required, trimTrailingSpace, trimWhiteSpaces,
  restrictMaxLength, isMobileNumber } from 'utils/validation';
import i18n from '../i18n';

const getUserProfileFormConfig = self => {
  const config = {
    title: 'User Profile',
    fields: [
      {
        name: 'firstName',
        component: 'input',
        type: 'text',
        errorMessage: i18n.t('validationMessage.FIRST_NAME_IS_REQUIRED'),
        format: trimTrailingSpace,
        showLength: true,
        normalize: restrictMaxLength(50),
        autoFocus: true
      },
      {
        name: 'lastName',
        component: 'input',
        type: 'text',
        showLength: true,
        format: trimTrailingSpace,
        normalize: restrictMaxLength(50)
      },
      {
        name: 'gender',
        buttons: [
          { id: 'Male', name: 'Male' },
          { id: 'Female', name: 'Female' }
        ]
      },
      {
        name: 'username',
        component: 'input',
        type: 'text',
        readOnly: true,
        format: trimWhiteSpaces,
        showLength: true,
        normalize: restrictMaxLength(50)
      },
      {
        name: 'email',
        component: 'input',
        type: 'text',
        readOnly: true,
        format: trimTrailingSpace
      },
      {
        name: 'contactNumber',
        component: 'input',
        type: 'text'
      },
      {
        label: 'ACTIVE',
        name: 'isActive',
      },
      {
        label: 'ROLE',
        name: 'roles',
        valueField: 'id',
        textField: 'name',
        data: self.props.userRoles,
        isRequired: true,
        dropUp: true,
        // errorMessage: 'Role is required',
        ignoreFilter: true,
        handleOnChange: self.handleRoleChange,
        // isOpen: self.state.isRoleOpen,
        // closeDropdown: true,
        handleOnSelect: self.handleOnRoleSelect
      }
    ]
  };
  return config;
};

const userProfileValidation = createValidator({
  username: required,
  firstName: required,
  lastName: required,
  email: required,
  contactNumber: [isMobileNumber],
  roles: required
});

export default { getUserProfileFormConfig, userProfileValidation: memoize(10)(userProfileValidation) };
