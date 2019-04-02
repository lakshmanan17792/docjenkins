import memoize from 'lru-memoize';
import { createValidator, required,
  checkIfGreaterThanArchivalDate, checkIfLesserThanNotificationDate } from 'utils/validation';
import i18n from '../i18n';
import { trimTrailingSpace } from '../utils/validation';

const getArchivalDeleteFormConfig = self => {
  const config = {
    archiveForm: [
      {
        label: 'REASON',
        name: 'reason',
        data: self.props.archivalReasons,
        textField: 'name',
        valueField: 'id',
        dropUp: false,
        isFilter: false,
        isRequired: true,
        placeholder: 'SELECT_REASON',
        errorMessage: i18n.t('validationMessage.REQUIRED'),
        // errorMessage: 'User name is required'
      },
      {
        label: 'ARCHIVAL_DATE',
        name: 'archivalDate',
        min: new Date(),
        max: new Date('3099-12-31'),
        dateFormat: 'YYYY-MM-DD',
        isRequired: true,
        errorMessage: i18n.t('validationMessage.REQUIRED'),
        showDatePicker: true,
        dropUp: false,
        placeholder: 'SELECT_ARCHIVAL_DATE'
      },
      {
        label: 'NOTIFICATION_DATE',
        name: 'notificationDate',
        min: new Date(),
        max: new Date('3099-12-31'),
        dateFormat: 'YYYY-MM-DD',
        isRequired: true,
        errorMessage: i18n.t('validationMessage.REQUIRED'),
        showDatePicker: true,
        dropUp: false,
        placeholder: 'SELECT_NOTIFICATION_DATE'
      },
      {
        label: 'DESCRIPTION',
        name: 'description',
        component: 'textarea',
        isRequired: true,
        type: 'text',
        normalize: trimTrailingSpace
      }
    ],
    deleteForm: [
      {
        label: 'REASON',
        name: 'reason',
        data: self.props.deleteReasons,
        textField: 'name',
        valueField: 'id',
        dropUp: false,
        isFilter: false,
        isRequired: true,
        placeholder: 'SELECT_REASON',
        errorMessage: i18n.t('validationMessage.REQUIRED'),
      },
      {
        label: 'DESCRIPTION',
        name: 'description',
        component: 'textarea',
        isRequired: true,
        type: 'text',
        normalize: trimTrailingSpace
      }
    ]
  };
  return config;
};

const formValidation = createValidator({
  notificationDate: [required, checkIfGreaterThanArchivalDate('archivalDate', 'notificationDate')],
  archivalDate: [required, checkIfLesserThanNotificationDate('archivalDate', 'notificationDate')],
  description: required,
  reason: required
});

export default { getArchivalDeleteFormConfig, formValidation: memoize(10)(formValidation) };
