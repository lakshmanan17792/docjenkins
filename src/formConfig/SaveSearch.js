import memoize from 'lru-memoize';
import { createValidator, required, restrictMaxLength, trimTrailingSpace } from 'utils/validation';
import i18n from '../i18n';

const getOpeningFormConfig = () => {
  const config = {
    title: 'Save Search',
    searchTitle: {
      label: 'TITLE',
      name: 'searchTitle',
      type: 'text',
      isRequired: true,
      normalize: restrictMaxLength(255),
      errorMessage: i18n.t('validationMessage.TITLE_IS_REQUIRED'),
      format: trimTrailingSpace,
      autoFocus: true
    },
    description: {
      label: 'DESCRIPTION',
      name: 'description',
      component: 'textarea',
      type: 'text'
    }
  };
  return config;
};


const formValidation = createValidator({
  searchTitle: required
});

export default { getOpeningFormConfig, formValidation: memoize(10)(formValidation) };
