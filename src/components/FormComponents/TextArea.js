import React from 'react';
import { Field } from 'redux-form';
import { Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import i18n from '../../i18n';

const renderField = ({ input, placeholder, type, meta: { touched, error } }) => (
  <div>
    <textarea {...input} placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''} type={type} />
    {touched && (error && <div className="error-message">{error}</div>)}
  </div>
);

renderField.propTypes = {
  input: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired
};

renderField.defaultProps = {
  placeholder: ''
};

const TextArea = ({ label, name, type, className, placeholder, isRequired, normalize }) => (
  <div>
    <label htmlFor={name}><Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}</label>
    <div>
      <Field
        name={name}
        component={renderField}
        type={type}
        className={className}
        placeholder={placeholder}
        normalize={normalize}
      />
    </div>
  </div>
);

TextArea.defaultProps = {
  className: '',
  isRequired: false,
  normalize: null,
  placeholder: ''
};

TextArea.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  isRequired: PropTypes.bool,
  normalize: PropTypes.func
};

export default TextArea;
