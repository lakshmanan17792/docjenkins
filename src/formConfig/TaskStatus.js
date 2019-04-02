import i18n from '../i18n';

const getTaskStatusFormConfig = self => {
  const config = {
    title: 'Save Task Status',
    comment: {
      label: 'COMMENT',
      name: 'comments',
      component: 'textarea',
      type: 'text',
    },
    status: {
      label: 'STATUS',
      name: 'status',
      valueField: 'id',
      textField: 'text',
      data: self.getStatusData(),
      isFilter: false,
      dropUp: false,
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
    }
  };
  return config;
};

export default { getTaskStatusFormConfig };
