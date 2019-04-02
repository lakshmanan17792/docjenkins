import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { TextArea, DatePicker } from 'components';

import { getFilterConfig, formValidation } from '../../formConfig/ExtendArchivalDate';
import styles from '../../containers/ManageCandidates/Candidates.scss';
import i18n from '../../i18n';

const ExtendNotifyDateForm = props => {
  const { handleSubmit, extendNotifyDateSubmit, toggleExtendDateModal, valid } = props;
  const filterConfig = getFilterConfig(props);
  return (
    <form onSubmit={handleSubmit(extendNotifyDateSubmit)}>
      <div className="m-t-10 p-b-10 p-l-15 p-r-15">
        <DatePicker {...filterConfig.notificationDate} />
      </div>
      <div className="p-b-10 p-l-15 p-r-15">
        <TextArea {...filterConfig.description} />
      </div>
      <div className={`${styles.action_btn_section} ${styles.extend_btn_section} p-r-15`}>
        <div style={{ float: 'right' }}>
          <button className={`button-secondary-hover ${styles.cancel_btn}`} onClick={toggleExtendDateModal}>
            <span>{ i18n.t('CANCEL') }</span>
          </button>
          <button
            disabled={!valid}
            className="button-error"
            onClick={evt => { evt.preventDefault(); extendNotifyDateSubmit(); }}
          >
            <span>{ i18n.t('KEEP_IT_ARCHIVED') }</span>
          </button>
        </div>
      </div>
    </form>
  );
};

ExtendNotifyDateForm.propTypes = {
  valid: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  toggleExtendDateModal: PropTypes.func.isRequired,
  extendNotifyDateSubmit: PropTypes.func.isRequired
};

export default reduxForm({
  form: 'extendNotifyDate',
  validate: formValidation,
})(ExtendNotifyDateForm);
