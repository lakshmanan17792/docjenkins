import React from 'react';
import { Field } from 'redux-form';
import Multiselect from 'react-widgets/lib/Multiselect';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import styles from './FormComponents.scss';
import i18n from '../../i18n';

const renderMultiselect = ({
  input,
  data,
  valueField,
  defaultSelectValue,
  textField,
  isFilter,
  handleSelect,
  handleOnFocus,
  dropUp,
  handleOnChange,
  placeholder,
  errorMessage,
  ignoreFilter,
  readOnly,
  id,
  meta: { touched, error },
  disabled,
  groupComponent,
  groupBy
}) => {
  const messages = {
    emptyList: i18n.t('NO_RESULTS_FOUND'),
    emptyFilter: i18n.t('NO_RESULTS_FOUND')
  };
  return (
    <div className={readOnly && 'readOnly'}>
      {ignoreFilter ?
        <Multiselect
          {...input}
          onBlur={() => input.onBlur()}
          value={input.value || []} // requires value to be an array
          data={data}
          messages={messages}
          valueField={valueField}
          textField={textField}
          onToggle={() => {}}
          onSearch={handleOnChange}
          onSelect={handleSelect}
          onFocus={handleOnFocus}
          dropUp={dropUp}
          placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
          id={id}
          disabled={disabled}
          groupComponent={groupComponent}
          groupBy={groupBy}
        />
        : <Multiselect
          {...input}
          onBlur={() => input.onBlur()}
          value={input.value || defaultSelectValue || []} // requires value to be an array
          data={data}
          filter={isFilter}
          messages={messages}
          valueField={valueField}
          textField={textField}
          onSearch={handleOnChange}
          onSelect={handleSelect}
          onToggle={() => {}}
          dropUp={dropUp}
          placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
          id={id}
          disabled={disabled}
          groupComponent={groupComponent}
          groupBy={groupBy}
        />
      }
      {touched && (!input.value || error) && <div className="error-message">{errorMessage || error}</div>}
    </div>
  );
};

const renderMultiselectCloseOn = ({
  input,
  data,
  valueField,
  defaultSelectValue,
  textField,
  isFilter,
  handleSelect,
  handleOnFocus,
  dropUp,
  isOpen,
  handleOnChange,
  placeholder,
  errorMessage,
  ignoreFilter,
  readOnly,
  id,
  meta: { touched, error },
  disabled,
  groupComponent,
  groupBy
}) => {
  const messages = {
    emptyList: i18n.t('NO_RESULTS_FOUND'),
    emptyFilter: i18n.t('NO_RESULTS_FOUND')
  };
  return (
    <div className={readOnly && styles.readOnly}>
      {ignoreFilter ?
        <Multiselect
          {...input}
          onBlur={() => input.onBlur()}
          value={input.value || []} // requires value to be an array
          data={data}
          messages={messages}
          valueField={valueField}
          textField={textField}
          open={isOpen}
          onToggle={() => { }}
          onSearch={handleOnChange}
          onSelect={handleSelect}
          onFocus={handleOnFocus}
          dropUp={dropUp}
          placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
          id={id}
          disabled={disabled}
          groupComponent={groupComponent}
          groupBy={groupBy}
          // inputProps={{ style: { width: '100%' } }}
        /> : <Multiselect
          {...input}
          onBlur={() => input.onBlur()}
          value={input.value || defaultSelectValue || []} // requires value to be an array
          data={data}
          filter={isFilter}
          messages={messages}
          open={isOpen}
          valueField={valueField}
          textField={textField}
          onSearch={handleOnChange}
          onSelect={handleSelect}
          onToggle={() => { }}
          dropUp={dropUp}
          placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
          id={id}
          disabled={disabled}
          groupComponent={groupComponent}
          groupBy={groupBy}
        />
      }
      {touched && (!input.value || error) && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

renderMultiselect.propTypes = {
  input: PropTypes.object.isRequired,
  handleOnChange: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  valueField: PropTypes.string.isRequired,
  defaultSelectValue: PropTypes.array,
  textField: PropTypes.string.isRequired,
  dropUp: PropTypes.bool,
  isFilter: PropTypes.bool.isRequired,
  handleSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  meta: PropTypes.object.isRequired,
  ignoreFilter: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool,
  isOpen: PropTypes.bool,
  handleOnFocus: PropTypes.func,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  groupComponent: PropTypes.func.isRequired,
  groupBy: PropTypes.bool.isRequired
};

renderMultiselect.defaultProps = {
  dropUp: false,
  errorMessage: '',
  isOpen: null,
  defaultSelectValue: [],
  readOnly: false,
  handleOnFocus: null,
  id: 'id',
  disabled: false
};
renderMultiselectCloseOn.propTypes = {
  input: PropTypes.object.isRequired,
  handleOnChange: PropTypes.func,
  data: PropTypes.array.isRequired,
  valueField: PropTypes.string.isRequired,
  defaultSelectValue: PropTypes.array,
  textField: PropTypes.string.isRequired,
  dropUp: PropTypes.bool,
  isFilter: PropTypes.bool.isRequired,
  handleSelect: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  meta: PropTypes.object.isRequired,
  ignoreFilter: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool,
  isOpen: PropTypes.bool,
  handleOnFocus: PropTypes.func,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  groupComponent: PropTypes.func.isRequired,
  groupBy: PropTypes.bool.isRequired
};

renderMultiselectCloseOn.defaultProps = {
  dropUp: false,
  errorMessage: '',
  isOpen: null,
  defaultSelectValue: [],
  readOnly: false,
  handleOnChange: () => {},
  handleSelect: () => {},
  handleOnFocus: null,
  id: 'id',
  disabled: false
};

class MultiselectField extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    handleOnChange: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    customValidation: PropTypes.func,
    valueField: PropTypes.string.isRequired,
    defaultSelectValue: PropTypes.array,
    textField: PropTypes.string.isRequired,
    isRequired: PropTypes.bool.isRequired,
    placeholder: PropTypes.string,
    children: PropTypes.node.isRequired,
    labelClassName: PropTypes.string,
    errorMessage: PropTypes.string,
    ignoreFilter: PropTypes.bool,
    readOnly: PropTypes.bool,
    closeDropdown: PropTypes.bool,
    onChange: PropTypes.any,
    handleOnSelect: PropTypes.func,
    isOpen: PropTypes.bool,
    handleOnFocus: PropTypes.func,
    dropUp: PropTypes.bool,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    selectAll: PropTypes.bool,
    handleSelectAll: PropTypes.func
  }

  static defaultProps = {
    data: [],
    dropUp: false,
    isRequired: false,
    handleOnChange: () => {},
    placeholder: '',
    defaultSelectValue: [],
    customValidation: null,
    children: <span />,
    labelClassName: '',
    ignoreFilter: false,
    readOnly: false,
    onChange: null,
    closeDropdown: false,
    errorMessage: '',
    handleOnSelect: null,
    isOpen: false,
    handleOnFocus: null,
    id: 'id',
    disabled: false,
    selectAll: false,
    handleSelectAll: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      disableCheckBox: true
    };
  }

  handleSelect = () => {
    this.setState({ disableCheckBox: false });
  }

  generateSelectAllButton = (valueField, data) => (
    <div
      onClick={() => this.props.handleSelectAll(valueField, data)}
      role="presentation"
      className={styles.selectAllOption}
    >
      -- Select all --
    </div>)

  render() {
    const { label, name, labelClassName, handleOnChange, data, valueField, defaultSelectValue, textField, isRequired,
      placeholder, errorMessage, ignoreFilter, onChange, handleOnFocus, isOpen, closeDropdown, handleOnSelect, dropUp,
      customValidation, readOnly, id, disabled, selectAll } = this.props;
    const childrenWithProps = React.Children.map(
      this.props.children, child => React.cloneElement(child, {
        disabled: this.state.disableCheckBox
      })
    );
    return (
      <div>
        <label htmlFor={name} className={labelClassName}>
          <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
        </label>
        <span className={`right ${styles.children_component}`}>
          {childrenWithProps}
        </span>
        {
          closeDropdown ?
            <Field
              name={name}
              component={renderMultiselectCloseOn}
              data={data}
              valueField={valueField}
              defaultSelectValue={defaultSelectValue}
              textField={textField}
              isFilter={false}
              className={labelClassName}
              handleSelect={handleOnSelect}
              isOpen={isOpen}
              handleOnChange={handleOnChange}
              handleOnFocus={handleOnFocus}
              onChange={onChange}
              placeholder={placeholder}
              validate={customValidation}
              errorMessage={errorMessage}
              ignoreFilter={ignoreFilter}
              dropUp={dropUp}
              readOnly={readOnly}
              id={id}
              disabled={disabled}
              groupComponent={() => this.generateSelectAllButton(name, data)}
              groupBy={selectAll ? value => typeof (value) : false}
            />
            : <Field
              name={name}
              component={renderMultiselect}
              data={data}
              valueField={valueField}
              defaultSelectValue={defaultSelectValue}
              textField={textField}
              isFilter={false}
              className={labelClassName}
              handleSelect={this.handleSelect}
              handleOnChange={handleOnChange}
              onChange={onChange}
              placeholder={placeholder}
              validate={customValidation}
              errorMessage={errorMessage}
              ignoreFilter={ignoreFilter}
              dropUp={dropUp}
              readOnly={readOnly}
              id={id}
              disabled={disabled}
              groupComponent={() => this.generateSelectAllButton(name, data)}
              groupBy={selectAll ? value => typeof (value) : false}
            />
        }
      </div>
    );
  }
}

export default MultiselectField;
