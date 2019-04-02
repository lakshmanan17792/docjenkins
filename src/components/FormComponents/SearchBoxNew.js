import React from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import styles from './FormComponents.scss';
import i18n from '../../i18n';

const renderField = ({
  input,
  inpValue,
  reset,
  type,
  maxLength,
  handleOnChange,
  handleOnKeyUp,
  placeholder,
  errorMessage,
  meta: {
    touched,
    error
  }
}) => (
  <div>
    <span className={inpValue ? styles.iconClear : styles.iconSearch}>
      <i
        className={`fa ${inpValue ? 'fa-times' : 'fa-search'}`}
        onClick={event => { reset(event); }}
        role="button"
        aria-hidden="true"
      />
    </span>
    <input
      {...input}
      placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      type={type}
      maxLength={maxLength && maxLength}
      value={inpValue}
      onChange={event => { handleOnChange(event); }}
      onKeyDown={event => { handleOnKeyUp(event); }}
    />
    {touched && (error && <div className="error-message">{errorMessage || error}</div>)}
  </div>
);

renderField.defaultProps = {
  inpValue: '',
  handleOnChange: null,
  handleOnKeyUp: null,
  maxLength: null
};

renderField.propTypes = {
  inpValue: PropTypes.string,
  type: PropTypes.string.isRequired,
  maxLength: PropTypes.string,
  input: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired,
  handleOnChange: PropTypes.func,
  handleOnKeyUp: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired
};

const SearchBox = ({
  name,
  type,
  maxLength,
  className,
  placeholder,
  inpValue,
  errorMessage,
  reset,
  handleOnChange,
  handleOnKeyUp,
  isCustomerSearch
}) => (
  <div className={isCustomerSearch ? styles.customerSearchBox : styles.profileSearchBox}>
    <Field
      reset={reset}
      inpValue={inpValue}
      name={name}
      component={renderField}
      type={type}
      maxLength={maxLength}
      className={className}
      placeholder={placeholder}
      errorMessage={errorMessage}
      handleOnChange={handleOnChange}
      handleOnKeyUp={handleOnKeyUp}
    />
  </div>
);

SearchBox.defaultProps = {
  className: '',
  errorMessage: '',
  placeholder: '',
  inpValue: '',
  isCustomerSearch: '',
  handleOnChange: null,
  handleOnKeyUp: null,
  maxLength: null,
};

SearchBox.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  maxLength: PropTypes.string,
  className: PropTypes.string,
  inpValue: PropTypes.string,
  isCustomerSearch: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  reset: PropTypes.func.isRequired,
  handleOnChange: PropTypes.func,
  handleOnKeyUp: PropTypes.func,
};

export default SearchBox;
