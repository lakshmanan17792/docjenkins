import React from 'react';
import { Field, fieldPropTypes } from 'redux-form';
import PropTypes from 'prop-types';
import ReactStars from 'react-stars';
import { Trans } from 'react-i18next';
import styles from './FormComponents.scss';

const renderStarRating = ({ input, starCount, starSelect,
  isHalf, changeFilter, handleOnChange, errorMessage, meta: { touched, error } }) =>
  (<div className={styles.starRating}>
    <ReactStars
      {...input}
      count={starCount}
      value={starSelect}
      half={isHalf}
      onChange={newRating => handleOnChange(newRating, changeFilter)}
      size={20}
      color1={'#d7dee8'}
      color2={'#1f9aff'}
    />
    {touched && (error && <div className="error-message">{errorMessage || error}</div>)}
  </div>);

renderStarRating.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
renderStarRating.defaultProps = {
  custom: '',
};
const StarRatingField = ({ label, name, isRequired,
  starCount, starSelect, isHalf, changeFilter, handleOnChange, errorMessage }) =>
  (<div>
    {
      label ?
        <label htmlFor={name} className={styles.starLabel}>
          <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
        </label>
        : null
    }
    <Field
      name={name}
      component={renderStarRating}
      starCount={starCount}
      starSelect={starSelect}
      isHalf={isHalf}
      changeFilter={changeFilter}
      handleOnChange={handleOnChange}
      errorMessage={errorMessage}
    />
  </div>);

StarRatingField.defaultProps = {
  isRequired: false,
  starCount: 5,
  starSelect: 0,
  isHalf: false,
  changeFilter: 1,
  handleOnChange: null,
  errorMessage: ''
};

StarRatingField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  starCount: PropTypes.number,
  starSelect: PropTypes.number,
  isHalf: PropTypes.bool,
  changeFilter: PropTypes.number,
  handleOnChange: PropTypes.func,
  errorMessage: PropTypes.string,
};

export default StarRatingField;
