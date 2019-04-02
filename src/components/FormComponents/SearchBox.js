import React from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import styles from './FormComponents.scss';
import i18n from '../../i18n';

const renderField = ({
  input,
  inpValue,
  reset,
  handleOnChange,
  placeholder,
  errorMessage,
  meta: {
    touched,
    error
  },
  searchClassName
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
      type="text"
      value={inpValue}
      onChange={event => { handleOnChange(event); }}
      className={styles[searchClassName]}
    />
    {touched && (error && <div className="error-message">{errorMessage || error}</div>)}
  </div>
);

renderField.defaultProps = {
  inpValue: '',
  searchClassName: '',
  handleOnChange: null,
};

renderField.propTypes = {
  inpValue: PropTypes.string,
  input: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired,
  handleOnChange: PropTypes.func,
  searchClassName: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired
};

const SearchBox = ({
  name,
  className,
  searchClassName,
  placeholder,
  inpValue,
  errorMessage,
  reset,
  handleOnChange,
  isCustomerSearch
}) => (
  <div className={isCustomerSearch ? `${styles[searchClassName]}` : styles.searchBox}>
    <Field
      reset={reset}
      inpValue={inpValue}
      name={name}
      component={renderField}
      type="text"
      className={isCustomerSearch ? styles[searchClassName] : className}
      placeholder={placeholder}
      errorMessage={errorMessage}
      handleOnChange={handleOnChange}
      searchClassName={searchClassName}
    />
  </div>
);

SearchBox.defaultProps = {
  className: '',
  errorMessage: '',
  placeholder: '',
  inpValue: '',
  searchClassName: '',
  isCustomerSearch: '',
  handleOnChange: null
};

SearchBox.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  searchClassName: PropTypes.string,
  inpValue: PropTypes.string,
  isCustomerSearch: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  reset: PropTypes.func.isRequired,
  handleOnChange: PropTypes.func,
};

export default SearchBox;
