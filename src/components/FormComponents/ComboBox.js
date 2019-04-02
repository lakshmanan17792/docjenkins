import React from 'react';
import { Field, propTypes } from 'redux-form';
import PropTypes from 'prop-types';
import Combobox from 'react-widgets/lib/Combobox';

const renderCombobox = ({ input, data, comboValue, valueField, textField,
  isFilter, dropUp, handleOnChange, handleOnSelect, handleOnScroll, errorMessage, meta: { touched, error } }) =>
  (<div>
    <Combobox
      {...input}
      onBlur={() => input.onBlur()}
      value={comboValue}
      data={data}
      filter={isFilter}
      valueField={valueField}
      textField={textField}
      dropUp={dropUp}
      onChange={value => handleOnChange(value)}
      onSelect={selectedValue => handleOnSelect(selectedValue)}
      onToggle={handleOnScroll}
    />
    {touched && (error && <div className="error-message">{errorMessage || error}</div>)}
  </div>);

renderCombobox.propTypes = { ...propTypes };

const ComboboxField = ({ label, name, handleOnChange, handleOnSelect, handleOnScroll, data,
  valueField, textField, dropUp, errorMessage, isRequired, comboValue }) =>
  (<div>
    {
      label ?
        <label htmlFor={name}>
          {label}{isRequired ? <span className="required_color">*</span> : ''}
        </label>
        : null
    }
    <Field
      name={name}
      component={renderCombobox}
      data={data}
      comboValue={comboValue}
      valueField={valueField}
      textField={textField}
      isFilter={false}
      dropUp={dropUp}
      errorMessage={errorMessage}
      handleOnChange={handleOnChange}
      handleOnSelect={handleOnSelect}
      handleOnScroll={handleOnScroll}
    />
  </div>);

ComboboxField.defaultProps = {
  isRequired: false,
  handleOnChange: null,
  handleOnSelect: null,
  handleOnScroll: null
};

ComboboxField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  comboValue: PropTypes.string.isRequired,
  handleOnChange: PropTypes.func,
  handleOnSelect: PropTypes.func,
  handleOnScroll: PropTypes.func,
  data: PropTypes.object.isRequired,
  valueField: PropTypes.string.isRequired,
  textField: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  dropUp: PropTypes.bool.isRequired,
  isRequired: PropTypes.bool
};

export default ComboboxField;
