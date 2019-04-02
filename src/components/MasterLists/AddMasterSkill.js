import React, { Component } from 'react';
import { reduxForm, fieldPropTypes, Field } from 'redux-form';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { trimTrailingSpace } from '../../utils/validation';
import { SkillValidator } from './MasterListsValidation.js';
import styles from '../../containers/Users/Users.scss';
import i18n from '../../i18n';

export const Input = ({
  input, label, readOnly, type, isRequired, isInfo, infoText, meta: { touched, error },
  placeholder, autoFocus
}) => (
  <div className={styles.m_t_b_10}>
    <label htmlFor={input.name}>
      {i18n.t(label)}
      {isRequired ? <span className="required_color">*</span> : ''}
      {isInfo ?
        <span className="p-l-10 cursor-pointer">
          <i className="fa fa-info-circle" title={infoText} />
        </span> : ''
      }
    </label>
    <div>
      <input
        readOnly={readOnly}
        {...input}
        onBlur={() => { }}
        type={type}
        id={input.name}
        placeholder={placeholder}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);
Input.propTypes = {
  ...fieldPropTypes
};

@reduxForm({
  form: 'AddMasterSkill',
  validate: SkillValidator,
  touchOnChange: true
})
export default class AddMasterSkill extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    invalid: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool
  };

  static defaultProps = {
    isEdit: false
  };

  render() {
    const { handleSubmit, onClose, isEdit, pristine, loading, invalid } = this.props;
    return (
      <Modal
        show
        onHide={onClose}
        backdrop="static"
        style={{ display: 'block' }}
        bsSize="md"
      >
        <Modal.Header className={`${styles.modal_header_color}`}>
          <Modal.Title>
            {isEdit ? i18n.t('UPDATE_SKILL') : i18n.t('ADD_SKILL')}
            <span
              role="button"
              tabIndex="-1"
              className="close_btn right no-outline"
              onClick={onClose}
            >
              <i className="fa fa-close" />
            </span>
          </Modal.Title>
        </Modal.Header>
        <form name="AddSkillForm" onSubmit={handleSubmit}>
          <Modal.Body>
            <Field
              name="name"
              type="text"
              component={Input}
              label="NAME"
              normalize={trimTrailingSpace}
              isRequired
              autoFocus
            />
          </Modal.Body>
          <Modal.Footer>
            <button
              className={`button-primary ${styles.expand_collapse_btn} ${styles.form_btn}`}
              type="submit"
              disabled={pristine || loading || invalid}
            >{isEdit ? i18n.t('UPDATE_SKILL') : i18n.t('ADD_SKILL')}</button>
            <button
              type="button"
              className={`button-secondary-hover ${styles.expand_collapse_btn} ${styles.form_btn}`}
              onClick={onClose}
            >Cancel</button>
          </Modal.Footer>
        </form>
      </Modal>

    );
  }
}
