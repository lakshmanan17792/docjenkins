import React, { Component } from 'react';
import { Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { Field, formValueSelector, change, touch } from 'redux-form';
import { connect } from 'react-redux';
import { trimTrailingSpace } from '../../utils/validation';
import { Input } from './ResumeForm';
import DatePicker from '../../components/FormComponents/DatePicker';
import i18n from '../../i18n';

const style = require('./ResumeForm.scss');

const listOfCurrentDateWords = ['present', 'till date', 'bis heute', 'heute'];

const educationSelector = formValueSelector('MultiPartForm');

@connect(
  (state, props) => {
    let isCurrentlyStudying = educationSelector(state, `${props.field}.isCurrentlyStudying`);
    if (isCurrentlyStudying === undefined) {
      const endDate = educationSelector(state, `${props.field}.end_date`);
      isCurrentlyStudying = listOfCurrentDateWords.includes(endDate);
    }
    return ({
      isCurrentlyStudying
    });
  }, ({ change, touch })
)

export default class RenderEducation extends Component {
  static propTypes = {
    fields: PropTypes.any,
    field: PropTypes.any,
    index: PropTypes.any,
    handleDateFormat: PropTypes.any,
    handleEducationStatus: PropTypes.any,
    change: PropTypes.func.isRequired,
    touch: PropTypes.func.isRequired,
    isCurrentlyStudying: PropTypes.bool,
    handleDatePickerInputClickCb: PropTypes.func.isRequired,
    educationScrollRef: PropTypes.object,
    extendMarginBottom: PropTypes.bool
  }

  static defaultProps = {
    fields: null,
    field: null,
    index: null,
    handleDateFormat: null,
    handleEducationStatus: null,
    isCurrentlyStudying: false,
    educationScrollRef: {},
    extendMarginBottom: false
  };
  constructor(props) {
    super(props);
    this.setCurrentlyStudyingOrNot(props);
  }

  setCurrentlyStudyingOrNot = props => {
    const { index, isCurrentlyStudying } = props;
    this.props.change('MultiPartForm', `educations.${index}.isCurrentlyStudying`, isCurrentlyStudying);
  }

  handleChange = (event, index) => {
    this.props.handleEducationStatus(index, event.target.checked);
  }

  handleStartDate = () => {
    this.props.touch('MultiPartForm', `educations[${this.props.index}].start_date`);
  }

  toLowerCase = value => value ? value.toLowerCase() : ''

  render() {
    const { fields, index, handleDateFormat, isCurrentlyStudying,
      handleDatePickerInputClickCb, educationScrollRef, extendMarginBottom } = this.props;
    let { field } = this.props;
    field = field.replace('[', '.');
    field = field.replace(']', '');
    return (
      <div className={`${style.exp_sec} ${extendMarginBottom && 'm-b-70'}`}>
        <Button className={style.remv_btn} onClick={() => fields.remove(index)}>
          <Trans>REMOVE</Trans>
        </Button>
        <Field
          name={`${field}.school_name`}
          type="text"
          component={Input}
          label="NAME_OF_INSTITUTION"
          normalize={trimTrailingSpace}
          format={trimTrailingSpace}
        />
        <Field
          name={`${field}.school_location`}
          type="text"
          component={Input}
          label="INSTITUTION_LOCATION"
          normalize={trimTrailingSpace}
          format={trimTrailingSpace}
        />
        <Field
          name={`${field}.title`}
          type="text"
          component={Input}
          label="DEGREE_DIRECTION"
          normalize={trimTrailingSpace}
          format={trimTrailingSpace}
        />
        <Col lg={6} xs={12} className="p-l-0">
          <DatePicker
            name={`${field}.start_date`}
            id={`${field}.start_date`}
            label="START_DATE"
            max={new Date()}
            dateFormat="DD MMM YYYY"
            normalize={handleDateFormat}
            format={handleDateFormat}
            dropup={false}
            isTime={false}
            showDatePicker
            handleInputClickCb={() =>
              handleDatePickerInputClickCb(`${field}.start_date`, 'educationsTab', educationScrollRef)
            }
          />
        </Col>
        <Col lg={6} xs={12} className="p-r-0">
          {!isCurrentlyStudying && <DatePicker
            name={`${field}.end_date`}
            label="END_DATE"
            max={new Date()}
            dateFormat="DD MMM YYYY"
            normalize={handleDateFormat}
            format={handleDateFormat}
            onChange={this.handleStartDate}
            dropup={false}
            isTime={false}
            showDatePicker
            handleInputClickCb={() =>
              handleDatePickerInputClickCb(`${field}.end_date`, 'educationsTab', educationScrollRef)
            }
            id={`${field}.end_date`}
          />}
          {isCurrentlyStudying && <Field
            name={`${field}.end_date`}
            component={Input}
            type="text"
            label="END_DATE"
            format={this.toLowerCase}
            normalize={this.toLowerCase}
            isInfo
            infoText={`${i18n.t('ALLOWED_VALUES')}: present | till date | bis heute | heute`}
            className="m-b-0 m-t-0"
          />}
        </Col>
        <Col lg={12} xs={12} className="p-0">
          <label htmlFor="employed_status" className={style.current_employer}>
            <Trans>CURRENTLY_STUDYING</Trans>
            <input
              type="checkbox"
              name="isCurrentlyStudying"
              checked={isCurrentlyStudying}
              onChange={event => this.handleChange(event, index)}
              className={style.checkbox}
            />
          </label>
        </Col>
      </div>
    );
  }
}
