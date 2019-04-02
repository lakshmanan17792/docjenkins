import React from 'react';
import Checkbox from 'rc-checkbox';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

const renderCheckBox = ({ input: { name, onChange, id, value }, label, disabled, className, isChecked, title }) => (
  <label
    className={className}
    htmlFor={id}
    style={title ? { cursor: 'not-allowed' } : { cursor: 'pointer' }}
    title={title}
  >
    <Checkbox checked={isChecked} name={name} id={id} onChange={onChange} disabled={disabled} value={value} />
    <Trans>{label}</Trans>
  </label>
);


renderCheckBox.defaultProps = {
  className: '',
  label: '',
  title: '',
  isChecked: false
};

renderCheckBox.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.string,
  title: PropTypes.string,
  isChecked: PropTypes.bool,
  disabled: PropTypes.bool.isRequired,
  className: PropTypes.string
};

const CheckBox = ({ id, name, className, disabled, label, value, onChange, isChecked, title }) => (
  <Field
    name={name}
    onChange={onChange}
    label={label}
    id={id}
    isChecked={isChecked}
    className={className}
    value={value}
    component={renderCheckBox}
    disabled={disabled}
    title={title}
  />
);

CheckBox.defaultProps = {
  disabled: false,
  value: '',
  className: '',
  title: '',
  id: '',
  label: '',
  isChecked: false,
};

CheckBox.propTypes = {
  id: PropTypes.any,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  isChecked: PropTypes.bool,
  onChange: PropTypes.any.isRequired,
  label: PropTypes.string,
  value: PropTypes.string,
  className: PropTypes.string
};

export default CheckBox;
