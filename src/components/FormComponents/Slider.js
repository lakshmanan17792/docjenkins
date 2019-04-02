import React from 'react';
import { Field } from 'redux-form';
import Slider from 'rc-slider';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

const renderSlider = ({ input: { onChange, value }, defaultValue, min, max, marks, tipFormatter, onAfterChange }) => (
  <Range
    min={min}
    max={max}
    value={value || defaultValue}
    onChange={onChange}
    tipFormatter={tipFormatter}
    onAfterChange={onAfterChange}
    marks={marks}
  />
);

renderSlider.propTypes = {
  input: PropTypes.object.isRequired,
  defaultValue: PropTypes.array.isRequired,
  min: PropTypes.any.isRequired,
  max: PropTypes.any.isRequired,
  marks: PropTypes.any.isRequired,
  tipFormatter: PropTypes.func.isRequired,
  onAfterChange: PropTypes.func.isRequired
};

const SliderField = ({ label, name, min, max, defaultValue, onChange, marks, tipFormatter, onAfterChange }) => (
  <div>
    <label htmlFor={name}>
      <Trans>{label}</Trans>
    </label>
    <Field
      name={name}
      component={renderSlider}
      min={min}
      max={max}
      defaultValue={defaultValue}
      onChange={onChange}
      marks={marks}
      onAfterChange={onAfterChange}
      tipFormatter={tipFormatter}
    />
  </div>
);

SliderField.defaultProps = {
  onChange: () => {}
};

SliderField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  defaultValue: PropTypes.any.isRequired,
  onChange: PropTypes.func,
  marks: PropTypes.object.isRequired,
  tipFormatter: PropTypes.func.isRequired,
  onAfterChange: PropTypes.func.isRequired
};
export default SliderField;
