import { trimTrailingSpace } from 'utils/validation';

const getJobCategoryConfig = () => {
  const config = {
    title: 'Job Category',
    fields: [
      {
        label: 'TITLE',
        name: 'name',
        component: 'input',
        type: 'text',
        isRequired: true,
        placeholder: 'ENTER_CATEGORY_TITLE',
        format: trimTrailingSpace,
        normalize: trimTrailingSpace,
        autoFocus: true
      },
      {
        label: 'DESCRIPTION',
        name: 'description',
        component: 'textarea',
        type: 'text',
        placeholder: 'ENTER_CATEGORY_DESCRIPTION'
      }
    ]
  };
  return config;
};

export default { getJobCategoryConfig };

