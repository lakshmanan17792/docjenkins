import React from 'react';
import { Trans } from 'react-i18next';
import SelectList from 'react-widgets/lib/SelectList';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';

const renderSelectList = ({ input, name, data, meta: { touched, error } }) => (
  <div>
    <SelectList
      {...input}
      name={name}
      onBlur={() => input.onBlur()}
      data={data}
    />
    {
      touched && (!input.value || error) && <div className="error-message">
        { error } </div>
    }
  </div>
);

renderSelectList.propTypes = {
  input: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  meta: PropTypes.object.isRequired
};

const Radio = ({ isRequired, name, data, label }) => (
  <div>
    <label htmlFor={name}>
      <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
    </label>
    <Field
      name={name}
      component={renderSelectList}
      data={data}
    />
  </div>
);

Radio.propTypes = {
  isRequired: PropTypes.bool,
  name: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  label: PropTypes.string
};

Radio.defaultProps = {
  isRequired: false,
  label: ''
};

export default Radio;
