import React, { Component } from 'react';
import { Field } from 'redux-form';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import PropTypes from 'prop-types';
import Moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import { Trans } from 'react-i18next';
import i18n from '../../i18n';

Moment.locale('en');
momentLocalizer();

const restrictTyping = evt => {
  const aKeyCode = [8, 9, 13, 37, 38, 39, 40, 46];
  if (!aKeyCode.includes(evt.keyCode)) {
    evt.preventDefault();
  }
};

const renderDatePicker = ({ input: { onChange, value },
  min, max, meta: { error, touched }, placeholder, fieldName,
  dropUp, isTime, disabled, onToggle, onClick, onDateChange, open, showDatePicker, isformatted, dateFormat,
  enableError, handleInputClickCb, defaultValue }) => {
  let timeFormat = '';
  if (!dateFormat) {
    if (!isformatted) {
      if (isTime) {
        timeFormat = 'YYYY-MM-DD hh:mm a';
      } else {
        timeFormat = 'YYYY-MM-DD';
      }
    } else {
      timeFormat = 'hh:mm a';
    }
  }
  return (
    <div className={((error && touched) || enableError) && 'errorRDT'}>
      <DateTimePicker
        onToggle={onToggle}
        onSelect={onDateChange}
        onClick={onClick}
        defaultValue={defaultValue}
        // currentDate={currentDate}
        onChange={e => { onChange(e); }}
        format={dateFormat || timeFormat}
        value={!value ? null : new Date(value)}
        time={isTime}
        min={min}
        max={max}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        onKeyDown={e => restrictTyping(e)}
        dropUp={dropUp}
        disabled={disabled === 'null' ? false : disabled}
        open={open}
        date={showDatePicker}
        messages={
          {
            dateButton: i18n.t('tooltipMessage.SELECT_DATE'),
            timeButton: i18n.t('tooltipMessage.SELECT_TIME')
          }
        }
        name={fieldName}
        handleInputClickCb={handleInputClickCb}
      />
      {(error && touched && <div className="error-message">{error}</div>)}
    </div>
  );
};


renderDatePicker.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
  defaultValue: PropTypes.instanceOf(Date),
  // currentDate: PropTypes.instanceOf(Date),
  placeholder: PropTypes.string,
  dropUp: PropTypes.bool,
  isTime: PropTypes.bool,
  disabled: PropTypes.bool,
  showDatePicker: PropTypes.bool,
  isformatted: PropTypes.bool,
  dateFormat: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onDateChange: PropTypes.func,
  open: PropTypes.any.isRequired,
  enableError: PropTypes.any,
  fieldName: PropTypes.string.isRequired,
  handleInputClickCb: PropTypes.func.isRequired
};

renderDatePicker.defaultProps = {
  min: new Date('1910-01-01 00:00:00'),
  max: null,
  defaultValue: null,
  // currentDate: null,
  placeholder: '',
  dropUp: false,
  showDatePicker: true,
  isTime: false,
  disabled: false,
  isformatted: false,
  dateFormat: null,
  onDateChange: () => { },
  enableError: false
};

export default class DatePicker extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    className: PropTypes.string,
    isRequired: PropTypes.bool,
    placeholder: PropTypes.string,
    dropUp: PropTypes.bool,
    onChange: PropTypes.func,
    isTime: PropTypes.bool,
    isformatted: PropTypes.bool,
    dateFormat: PropTypes.string,
    normalize: PropTypes.func,
    format: PropTypes.func,
    showDatePicker: PropTypes.bool,
    min: PropTypes.instanceOf(Date),
    max: PropTypes.instanceOf(Date),
    defaultValue: PropTypes.instanceOf(Date),
    // currentDate: PropTypes.instanceOf(Date),
    disabled: PropTypes.bool,
    onDateChange: PropTypes.func,
    enableError: PropTypes.any,
    handleInputClickCb: PropTypes.func.isRequired,
    id: PropTypes.string
  }

  static defaultProps = {
    label: '',
    className: '',
    min: new Date('1910-01-01 00:00:00'),
    max: null,
    placeholder: '',
    showDatePicker: false,
    isRequired: false,
    isformatted: false,
    defaultValue: null,
    // currentDate: null,
    dateFormat: null,
    normalize: null,
    format: null,
    dropUp: false,
    isTime: false,
    disabled: false,
    onDateChange: () => {},
    onChange: () => {},
    enableError: false,
    id: ''
  }

  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleInputClick = (event, disabled, handleInputClickCb) => {
    if (!disabled || disabled === 'null') {
      if (event.target.tagName === 'INPUT') {
        this.setState({ open: 'date' });
      }
    }
    if (handleInputClickCb) {
      handleInputClickCb();
    }
  }

  handleToggle = (evt, disabled) => {
    if (!disabled || disabled === 'null') {
      let toggledState = '';
      if (evt === 'time') {
        this.setState({ open: 'time' });
      } else if (evt === 'date') {
        this.setState({ open: 'date' });
      } else {
        toggledState = (this.state.open) ? false : 'date';
        this.setState({ open: toggledState });
      }
    }
    if (disabled) {
      this.setState({ open: false });
    }
  }

  render() {
    const { name, label, className, min,
      max, dropUp, isRequired, isTime, disabled, onChange, placeholder,
      onDateChange, showDatePicker, isformatted, dateFormat, normalize,
      format, enableError, handleInputClickCb, id, defaultValue } = this.props;
    return (
      <div className={className} id={id && id !== '' && id}>
        {label ?
          <label htmlFor={name}><Trans>{label}</Trans>{isRequired ?
            <span className="required_color">*</span> :
            ''}</label> :
          ''}
        <Field
          name={name}
          fieldName={name}
          component={renderDatePicker}
          className={className}
          placeholder={placeholder}
          max={max}
          min={min}
          dropUp={dropUp}
          isTime={isTime}
          disabled={disabled}
          onToggle={evt => this.handleToggle(evt, disabled)}
          onClick={evt => this.handleInputClick(evt, disabled, handleInputClickCb)}
          open={this.state.open}
          onDateChange={onDateChange}
          onChange={onChange}
          showDatePicker={showDatePicker}
          isformatted={isformatted}
          dateFormat={dateFormat}
          normalize={normalize}
          defaultValue={defaultValue}
          // currentDate={currentDate || min}
          format={format}
          enableError={enableError}
        />
      </div>
    );
  }
}
