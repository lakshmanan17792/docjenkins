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
  handleOnKeyUp,
  meta: {
    touched,
    error
  },
}) => (
  <div>
    {/* <span className={styles.iconSearch}>
      <i
        className="fa fa-search"
        role="button"
        aria-hidden="true"
      />
    </span> */}
    <span className={styles.iconSearch}>
      <img src={'/search.svg'} alt="search icon" />
    </span>
    <input
      {...input}
      placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      type="text"
      value={inpValue}
      onChange={event => { handleOnChange(event); }}
      onKeyUp={event => { handleOnKeyUp(event); }}
    />
    {/* { inpValue && <span className={styles.iconClear}>
      <i
        className="fa fa-times"
        onClick={event => { reset(event); }}
        role="button"
        aria-hidden="true"
      />
    </span> */}
    { inpValue && <span className={styles.iconClear}>
      <img
        src={'/search-close.svg'}
        alt="close icon"
        onClick={event => { reset(event); }}
        role="presentation"
      />
    </span>
    }
    {touched && (error && <div className="error-message">{errorMessage || error}</div>)}
  </div>
);
// renderField.propTypes = fieldPropTypes;
renderField.defaultProps = {
  inpValue: '',
  classNames: '',
  errorMessage: '',
  handleOnKeyUp: ''
};

renderField.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  classNames: PropTypes.string,
  reset: PropTypes.func.isRequired,
  handleOnChange: PropTypes.func.isRequired,
  inpValue: PropTypes.string,
  errorMessage: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  handleOnKeyUp: PropTypes.func
};

const SearchBar = ({
  name,
  reset,
  handleOnChange,
  inpValue,
  placeholder,
  handleOnKeyUp,
  classNames
}) => (
  <div className={`${styles.companySearchBox} ${classNames}`}>
    <Field
      type="text"
      component={renderField}
      name={name}
      reset={reset}
      handleOnChange={handleOnChange}
      handleOnKeyUp={handleOnKeyUp}
      inpValue={inpValue}
      placeholder={placeholder}
    />
  </div>
);

SearchBar.defaultProps = {
  inpValue: '',
  classNames: '',
  name: ''
};

SearchBar.propTypes = {
  name: PropTypes.string,
  classNames: PropTypes.string,
  reset: PropTypes.func.isRequired,
  handleOnChange: PropTypes.func.isRequired,
  inpValue: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  handleOnKeyUp: PropTypes.func.isRequired
};

export default SearchBar;
