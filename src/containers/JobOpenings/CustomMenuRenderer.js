import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const renderOptions = ({
  focusedOption,
  focusOption,
  inputValue,
  instancePrefix,
  onFocus,
  onOptionRef,
  onSelect,
  optionClassName,
  optionComponent,
  optionRenderer,
  options,
  removeValue,
  selectValue,
  valueArray,
  valueKey,
}, skipFirst) => (
  (skipFirst ? options.filter((option, i) => i !== 0) : options).map((option, i) => {
    const isSelected = valueArray && valueArray.some(x => x[valueKey] === option[valueKey]);
    const isFocused = option === focusedOption;
    const optionClass = classNames(optionClassName, {
      'Select-option': true,
      'is-selected': isSelected,
      'is-focused': isFocused,
      'is-disabled': option.disabled,
    });
    const index = inputValue.trim() === '' ? i + 1 : i;
    const Option = optionComponent;
    return (
      <Option
        className={optionClass}
        focusOption={focusOption}
        inputValue={inputValue}
        instancePrefix={instancePrefix}
        isDisabled={option.disabled}
        isFocused={isFocused}
        isSelected={isSelected}
        key={`option-${index}-${option[valueKey]}`}
        onFocus={onFocus}
        onSelect={onSelect}
        option={option}
        optionIndex={index}
        ref={ref => { onOptionRef(ref, isFocused); }}
        removeValue={removeValue}
        selectValue={selectValue}
      >
        {optionRenderer(option, i, inputValue)}
      </Option>
    );
  })
);

const menuRenderer = props => {
  const {
    focusOption,
    inputValue,
    instancePrefix,
    onFocus,
    onOptionRef,
    onSelect,
    optionClassName,
    optionComponent,
    options,
    removeValue,
    selectValue,
  } = props;

  const optionClass = classNames(optionClassName, {
    'Select-option': true,
    'is-selected': true,
    'is-focused': true,
    'is-disabled': false,
  });

  const Option = optionComponent;

  return (
    <div>
      {props.inputValue.trim() === '' && <Option
        className={optionClass}
        focusOption={focusOption}
        inputValue={inputValue}
        instancePrefix={instancePrefix}
        isDisabled={false}
        isFocused={props.inputValue.trim() === ''}
        isSelected={false}
        key={`option-${0}-all`}
        onFocus={onFocus}
        onSelect={onSelect}
        option={options[0]}
        optionIndex={0}
        ref={ref => { onOptionRef(ref, props.inputValue.trim() === ''); }}
        removeValue={removeValue}
        selectValue={selectValue}
      >
        <div style={{
          textAlign: 'center',
          fontWeight: 'bolder',
        }}
        >
          {options[0]}
        </div>
      </Option>}
      {renderOptions(props, props.inputValue.trim() === '')}
    </div>
  );
};

menuRenderer.propTypes = {
  focusOption: PropTypes.func,
  inputValue: PropTypes.string,
  instancePrefix: PropTypes.string,
  onFocus: PropTypes.func,
  onOptionRef: PropTypes.func,
  onSelect: PropTypes.func,
  optionClassName: PropTypes.string,
  optionComponent: PropTypes.func,
  options: PropTypes.array,
  removeValue: PropTypes.func,
  selectValue: PropTypes.func,
};
menuRenderer.defaultProps = {
  focusOption: null,
  inputValue: null,
  instancePrefix: null,
  onFocus: null,
  onOptionRef: null,
  onSelect: null,
  optionClassName: null,
  optionComponent: null,
  options: null,
  removeValue: null,
  selectValue: null,
};

export default menuRenderer;
