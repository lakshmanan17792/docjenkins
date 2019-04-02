import React from 'react';
import { Field } from 'redux-form';
import { Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import DropdownList from 'react-widgets/lib/DropdownList';
import i18n from '../../i18n';

const renderSelectBox = ({ input, data, dataValue, valueField, textField, placeholder,
  isFilter, dropUp, isDisabled, defaultCompanyValue, handleOnChange, handleOnScroll, isNotDefaultMessage,
  errorMessage, meta: { touched, error } }) => {
  const messages = {
    emptyList: !isNotDefaultMessage ? i18n.t('NO_RESULTS_FOUND') :
      i18n.t('infoMessage.SET_DUE_DATE_TO_SELECT_REMINDER_TYPE'),
    emptyFilter: !isNotDefaultMessage ? i18n.t('NO_RESULTS_FOUND') :
      i18n.t('infoMessage.SET_DUE_DATE_TO_SELECT_REMINDER_TYPE')
  };
  return (<div>
    <DropdownList
      {...input}
      onBlur={() => input.onBlur()}
      value={dataValue.length > 0 ? dataValue : input.value} // requires value to be an array
      data={data}
      defaultValue={defaultCompanyValue}
      filter={isFilter}
      placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      valueField={valueField}
      textField={textField}
      dropUp={dropUp}
      onSearch={handleOnChange}
      onSelect={handleOnChange}
      onToggle={handleOnScroll}
      disabled={isDisabled}
      messages={messages}
    />
    {touched && (error && <div className="error-message">{errorMessage || error}</div>)}
  </div>);
};
renderSelectBox.defaultProps = {
  isRequired: false,
  handleOnChange: null,
  handleOnScroll: null,
  defaultCompanyValue: {},
  placeholder: '',
  dataValue: '',
  errorMessage: '',
  dropUp: false,
  isDisabled: false,
  isNotDefaultMessage: false,
  isFilter: false,
  data: {},
  normalize: null
};
renderSelectBox.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  dataValue: PropTypes.string,
  handleOnChange: PropTypes.func,
  handleOnScroll: PropTypes.func,
  data: PropTypes.any,
  valueField: PropTypes.string.isRequired,
  textField: PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  errorMessage: PropTypes.string,
  dropUp: PropTypes.bool,
  isRequired: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isNotDefaultMessage: PropTypes.bool,
  isFilter: PropTypes.bool,
  placeholder: PropTypes.string,
  defaultCompanyValue: PropTypes.object,
  normalize: PropTypes.func
};

const DropdownField = ({ label, placeholder, name, dataValue, handleOnChange, defaultCompanyValue, handleOnScroll, data,
  valueField, textField, dropUp, errorMessage, isRequired, isDisabled, normalize, isNotDefaultMessage }) =>
  (<div>
    {
      label ?
        <label htmlFor={name}>
          <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
        </label>
        : null
    }
    <Field
      name={name}
      component={renderSelectBox}
      data={data}
      dataValue={dataValue}
      placeholder={placeholder}
      valueField={valueField}
      textField={textField}
      defaultCompanyValue={defaultCompanyValue}
      isFilter={false}
      dropUp={dropUp}
      errorMessage={errorMessage}
      handleOnChange={handleOnChange}
      handleOnScroll={handleOnScroll}
      normalize={normalize}
      isDisabled={isDisabled}
      isNotDefaultMessage={isNotDefaultMessage}
    />
  </div>);

DropdownField.defaultProps = {
  isRequired: false,
  handleOnChange: null,
  handleOnScroll: null,
  defaultCompanyValue: {},
  placeholder: '',
  dataValue: '',
  errorMessage: '',
  dropUp: false,
  isDisabled: false,
  isNotDefaultMessage: false,
  data: {},
  normalize: null
};

DropdownField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dataValue: PropTypes.string,
  handleOnChange: PropTypes.func,
  handleOnScroll: PropTypes.func,
  data: PropTypes.any,
  valueField: PropTypes.string.isRequired,
  textField: PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  errorMessage: PropTypes.string,
  dropUp: PropTypes.bool,
  isRequired: PropTypes.bool,
  isNotDefaultMessage: PropTypes.bool,
  isDisabled: PropTypes.bool,
  placeholder: PropTypes.string,
  defaultCompanyValue: PropTypes.object,
  normalize: PropTypes.func
};

export default DropdownField;
