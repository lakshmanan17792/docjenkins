import React from 'react';
import { Field } from 'redux-form';
import DateTime from 'react-datetime';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { Trans } from 'react-i18next';
import momentLocalizer from 'react-widgets-moment';
import i18n from '../../i18n';

Moment.locale('en');
momentLocalizer();

const styles = require('./FormComponents.scss');

const renderDatePicker = ({ input: { onChange, value }, isTime, isDate, viewDate, disabled, renderInput,
  getRoundOffDate, isValidDate, meta: { error, touched } }) =>
  (<div>
    <DateTime
      inputProps={{ disabled }}
      renderInput={renderInput}
      value={!value ? null : getRoundOffDate(value)}
      onChange={onChange}
      isValidDate={isValidDate}
      className={error && touched && 'errorRDT'}
      dateFormat={isDate ? 'YYYY-MM-DD' : isDate}
      timeFormat={isTime ? 'hh:mm A' : isTime}
      closeOnSelect={!(isDate && isTime)}
      viewDate={value || viewDate}
      timeConstraints={{ minutes: { step: 5 } }}
    />
    {(error && touched && <div className="error-message">{error}</div>)}
  </div>);

renderDatePicker.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  renderInput: PropTypes.func.isRequired,
  getRoundOffDate: PropTypes.func.isRequired,
  isValidDate: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  viewDate: PropTypes.instanceOf(Date).isRequired,
  isDate: PropTypes.bool,
  isTime: PropTypes.bool,
};

renderDatePicker.defaultProps = {
  min: null,
  max: null,
  showDatePicker: true,
  isDate: false,
  isTime: false,
  disabled: false
};

export default function DateTimePicker(props) {
  const { name, label, className, min, max, isRequired, isDate, isTime,
    onChange, viewDate, isCustomToolTip, disabled, title } = props;
  const onselectDate = value => value._d;

  const getErrorMessage = () => {
    switch (name) {
      case 'dueDate':
        return `${i18n.t(label)} should be greater than current date and time`;
      case 'interviewDate':
        return `${i18n.t(label)} should be greater than current date and time`;
      case 'contactDate':
        return `${i18n.t(label)} should be less than current date and time`;
      default :
        break;
    }
  };
  // If you enable both date and time , you need to check time constraint with min and max dates
  const isValidTime = value => {
    if (value) {
      const errorMessage = getErrorMessage();
      const isvalid = (!min || Moment(value).isSameOrAfter(Moment(min))) &&
                  (!max || Moment(value).isSameOrBefore(Moment(max)));
      return isvalid ? '' : errorMessage;
    }
    return '';
  };

  const isValidDate = date => (!min || date.isSameOrAfter(Moment(min), 'day')) &&
  (!max || date.isSameOrBefore(Moment(max), 'day'));

  const getRoundOffDate = date => {
    const remainder = (Moment(date).minute() % 5);
    const roundUpDate = Moment(date).add((5 - remainder) % 5, 'minutes');
    const roundDownDate = Moment(date).subtract(remainder, 'minutes');
    const isValid = (!min || Moment(roundUpDate).isSameOrAfter(Moment(min))) &&
                  (!max || Moment(roundUpDate).isSameOrBefore(Moment(max)));
    return isValid ? roundUpDate : roundDownDate;
  };

  const renderTooltip = (isDisabled, tooltipTitle) => {
    if (isDisabled && tooltipTitle) {
      return (
        <Tooltip id={'tooltip'}>
          <strong>
            {tooltipTitle}
          </strong>
        </Tooltip>
      );
    }
    return <div />;
  };

  const renderInput = (prop, openCalendar) => {
    if (isCustomToolTip) {
      return (
        <OverlayTrigger
          rootClose
          overlay={renderTooltip(disabled, title)}
          placement="bottom"
        >
          <div>
            <input
              {...prop}
              className=""
            />
            {isDate && !disabled &&
            <i className={`fa fa-calendar ${styles.rdtCustomPicker}`} role="presentation" onClick={openCalendar} />
            }
            {!isDate && isTime && !disabled &&
            <i className={`fa fa-clock-o ${styles.rdtCustomPicker}`} role="presentation" onClick={openCalendar} />
            }
          </div>
        </OverlayTrigger>
      );
    }
    return (<div>
      <input
        {...prop}
        className=""
        title={disabled && title ? title : ''}
      />
      {isDate && !disabled &&
      <i className={`fa fa-calendar ${styles.rdtCustomPicker}`} role="presentation" onClick={openCalendar} />
      }
      {!isDate && isTime && !disabled &&
      <i className={`fa fa-clock-o ${styles.rdtCustomPicker}`} role="presentation" onClick={openCalendar} />
      }
    </div>);
  };

  return (
    <div>
      {label ?
        <label htmlFor={name}><Trans>{label}</Trans>{isRequired ?
          <span className="required_color">*</span> :
          ''}</label> :
        ''}
      <Field
        name={name}
        component={renderDatePicker}
        className={className}
        isCustomToolTip={isCustomToolTip}
        min={min && new Date(min)}
        max={max && new Date(max)}
        validate={isDate && isTime ? [isValidTime] : null}
        disabled={disabled}
        isDate={isDate}
        isTime={isTime}
        normalize={onselectDate}
        onChange={onChange}
        viewDate={viewDate ? getRoundOffDate(viewDate) : getRoundOffDate(new Date())}
        renderInput={renderInput}
        getRoundOffDate={getRoundOffDate}
        isValidDate={isValidDate}
      />
    </div>
  );
}

DateTimePicker.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  isRequired: PropTypes.bool,
  disabled: PropTypes.bool,
  isCustomToolTip: PropTypes.bool,
  isTime: PropTypes.bool,
  isDate: PropTypes.bool,
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
  viewDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
};

DateTimePicker.defaultProps = {
  label: '',
  className: '',
  title: '',
  min: null,
  max: null,
  viewDate: null,
  isRequired: false,
  isCustomToolTip: false,
  disabled: false,
  isDate: true,
  isTime: false,
  onChange: () => {}
};
