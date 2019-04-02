import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { Field, formValueSelector, change } from 'redux-form';
import { connect } from 'react-redux';
import { trimTrailingSpace } from '../../utils/validation';
import { Input } from './ResumeForm';
import DatePicker from '../../components/FormComponents/DatePicker';
import i18n from '../../i18n';

const style = require('./ResumeForm.scss');

const listOfCurrentDateWords = ['present', 'till date', 'bis heute', 'heute'];

const experienceSelector = formValueSelector('MultiPartForm');
@connect(
  (state, props) => {
    let isCurrentlyWorking = experienceSelector(state, `${props.field}.isCurrentlyWorking`);
    if (isCurrentlyWorking === undefined) {
      const endDate = experienceSelector(state, `${props.field}.end_date`);
      isCurrentlyWorking = listOfCurrentDateWords.includes(endDate);
    }
    return ({
      isCurrentlyWorking
    });
  }, ({ change })
)
export default class RenderExperience extends Component {
  static propTypes = {
    fields: PropTypes.any,
    field: PropTypes.any,
    index: PropTypes.any,
    change: PropTypes.func.isRequired,
    handleExperience: PropTypes.any,
    handleDateFormat: PropTypes.any,
    handleWorkStatus: PropTypes.any,
    isCurrentlyWorking: PropTypes.bool,
    handleDatePickerInputClickCb: PropTypes.func.isRequired,
    domRef: PropTypes.object,
    extendMarginBottom: PropTypes.bool
  }

  static defaultProps = {
    fields: null,
    field: null,
    index: null,
    handleExperience: null,
    handleDateFormat: null,
    handleWorkStatus: null,
    isCurrentlyWorking: false,
    domRef: {},
    extendMarginBottom: false
  };

  constructor(props) {
    super(props);
    this.setCurrentlyWorkingOrNot(props);
  }

  setCurrentlyWorkingOrNot = props => {
    const { index, isCurrentlyWorking } = props;
    this.props.change('MultiPartForm', `experiences.${index}.isCurrentlyWorking`, isCurrentlyWorking);
  }

  handleChange = (event, index) => {
    this.props.handleWorkStatus(index, event.target.checked);
  }

  toLowerCase = value => value ? value.toLowerCase() : '';

  render() {
    const { fields, index, handleExperience, handleDateFormat, isCurrentlyWorking,
      handleDatePickerInputClickCb, domRef, extendMarginBottom } = this.props;
    let { field } = this.props;
    field = field.replace('[', '.');
    field = field.replace(']', '');
    return (
      <div className={`${style.exp_sec} ${extendMarginBottom && 'm-b-60'}`}>
        <Button className={style.remv_btn} onClick={() => fields.remove(index)}>
          <Trans>REMOVE</Trans>
        </Button>
        <Field
          name={`${field}.title`}
          type="text"
          component={Input}
          label="POSITION_TITLE"
          normalize={trimTrailingSpace}
          format={trimTrailingSpace}
        />
        <Field
          name={`${field}.description`}
          type="text"
          component={Input}
          label="DESCRIPTION"
          normalize={trimTrailingSpace}
          format={trimTrailingSpace}
        />
        <Field
          name={`${field}.company_name`}
          type="text"
          component={Input}
          label="EMPLOYER"
          normalize={trimTrailingSpace}
          format={trimTrailingSpace}
        />
        <Field
          name={`${field}.company_location`}
          type="text"
          component={Input}
          label="EMPLOYER_LOCATION"
          normalize={trimTrailingSpace}
          format={trimTrailingSpace}
        />
        <DatePicker
          name={`${field}.start_date`}
          label="START_DATE"
          max={new Date()}
          dateFormat="DD MMM YYYY"
          normalize={handleDateFormat}
          format={handleDateFormat}
          dropup={false}
          isTime={false}
          showDatePicker
          handleInputClickCb={() => handleDatePickerInputClickCb(`${field}.start_date`, 'experiencesTab', domRef)}
          onChange={handleExperience(fields.name, index, 'start_date', isCurrentlyWorking)}
          id={`${field}.start_date`}
        />
        {!isCurrentlyWorking && <DatePicker
          name={`${field}.end_date`}
          label="END_DATE"
          max={new Date()}
          dateFormat="DD MMM YYYY"
          normalize={handleDateFormat}
          format={handleDateFormat}
          dropup={false}
          isTime={false}
          showDatePicker
          handleInputClickCb={() => handleDatePickerInputClickCb(`${field}.end_date`, 'experiencesTab', domRef)}
          id={`${field}.end_date`}
          onChange={handleExperience(fields.name, index, 'end_date', isCurrentlyWorking)}
        />}
        {isCurrentlyWorking && <Field
          name={`${field}.end_date`}
          component={Input}
          type="text"
          label="END_DATE"
          format={this.toLowerCase}
          normalize={this.toLowerCase}
          isInfo
          infoText={`${i18n.t('ALLOWED_VALUES')}: present | till date | bis heute | heute`}
        />}
        <Field
          name={`${field}.years_of_experience`}
          type="text"
          component={Input}
          label="YEARS_OF_EXPERIENCE"
          readOnly
        />
        <label htmlFor="employed_status" className={style.current_employer}>
          <Trans>CURRENTLY_WORKING</Trans>
          <input
            type="checkbox"
            name="isCurrentlyWorking"
            checked={isCurrentlyWorking}
            onChange={event => this.handleChange(event, index)}
            className={style.checkbox}
          />
        </label>
      </div>
    );
  }
}
