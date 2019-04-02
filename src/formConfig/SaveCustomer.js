import memoize from 'lru-memoize';
import {
  createValidator,
  required,
  pinCode,
  trimTrailingSpace,
  urlValidate
} from 'utils/validation';
import i18n from '../i18n';

const getCustomerFormConfig = self => {
  const config = {
    title: 'Save Customer',
    name: {
      label: 'NAME',
      name: 'name',
      type: 'text',
      handleOnBlur: self.initialize,
      hasOnBlur: true,
      errorMessage: i18n.t('validationMessage.COMPANY_NAME_IS_REQUIRED'),
      format: trimTrailingSpace
    },
    domain: {
      label: 'DOMAIN_NAME',
      name: 'domain',
      type: 'text',
      handleOnBlur: self.initialize,
      hasOnBlur: true,
      format: trimTrailingSpace
    },
    linkedinurl: {
      label: 'Linkedin URL',
      name: 'linkedinurl',
      type: 'text',
      format: trimTrailingSpace
    },
    description: {
      label: 'Company Description',
      name: 'description',
      component: 'textarea',
      type: 'text',
      placeholder: 'ENTER_THE_DESCRIPTION_HERE',
      format: trimTrailingSpace
    },
    company: {
      label: 'Company',
      name: 'company',
      type: 'text',
      dropUp: true,
      isRequired: true,
      errorMessage: i18n.t('validationMessage.COMPANY_IS_REQUIRED'),
      format: trimTrailingSpace
    },
    address: {
      label: 'Street Address',
      name: 'address',
      type: 'text',
      format: trimTrailingSpace
    },
    city: {
      label: 'City',
      name: 'city',
      type: 'text',
      isRequired: true,
      errorMessage: i18n.t('validationMessage.CITY_IS_REQUIRED'),
      format: trimTrailingSpace
    },
    state: {
      label: 'State',
      name: 'state',
      type: 'text',
      format: trimTrailingSpace
    },
    country: {
      label: 'Country',
      name: 'country',
      type: 'text',
      isRequired: true,
      errorMessage: i18n.t('validationMessage.COUNTRY_IS_REQUIRED'),
      format: trimTrailingSpace
    },
    pincode: {
      label: 'ZIP Code',
      name: 'pincode',
      type: 'text',
      format: trimTrailingSpace
    }
  };
  return config;
};

const formValidation = createValidator({
  name: required,
  city: required,
  country: required,
  pincode: [pinCode],
  domain: urlValidate,
  linkedinurl: urlValidate
});

export default {
  getCustomerFormConfig, formValidation: memoize(10)(formValidation)
};
