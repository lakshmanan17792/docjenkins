import memoize from 'lru-memoize';
import moment from 'moment';
import { createValidator, required } from 'utils/validation';
import i18n from '../i18n';

const getFilterConfig = props => {
  const config = {
    title: 'Opening Filter',
    notificationDate: {
      label: 'REMIND_ME_TO_UNARCHIVE_ON',
      name: 'notificationDate',
      min: moment().format('YYYY-MM-DD') > moment(props.notifyDate).format('YYYY-MM-DD') ?
        new Date(moment().format('YYYY-MM-DD'))
        : new Date(moment(props.notifyDate).add(1, 'days').format('YYYY-MM-DD')),
      // new Date(moment().add(1, 'days').format('YYYY-MM-DD')),
      // currentDate: new Date(moment(props.notifyDate).add(1, 'days').format('YYYY-MM-DD')),
      max: new Date('3099-12-31'),
      isRequired: true,
      errorMessage: i18n.t('validationMessage.REQUIRED'),
      showDatePicker: true,
      dropUp: false,
      placeholder: 'SELECT_NOTIFICATION_DATE'
    },
    description: {
      label: 'DESCRIPTION',
      name: 'description',
      placeholder: props.descPlaceholder,
      component: 'textarea',
      type: 'text',
      isRequired: true
    }
  };
  return config;
};

const formValidation = createValidator({
  notificationDate: [required],
  description: [required]
});

export default { getFilterConfig, formValidation: memoize(10)(formValidation) };
