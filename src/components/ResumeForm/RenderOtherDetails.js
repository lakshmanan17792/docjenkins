import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { DropdownList, Multiselect } from 'react-widgets';
import { Scrollbars } from 'react-custom-scrollbars';
import Moment from 'moment';
import { Trans } from 'react-i18next';
import { Field, fieldPropTypes } from 'redux-form';
import { trimTrailingSpace, convertToPositiveInteger, restrictMaxValue } from '../../utils/validation';
import DropdownField from '../../components/FormComponents/DropdownList';
import DatePicker from '../../components/FormComponents/DatePicker';
import { getResumeFormConfig } from '../../formConfig/ResumeDetails';
// import { Input } from './ResumeForm';
import i18n from '../../i18n';

const style = require('./ResumeForm.scss');

const currencyType = [
  'EUR', 'USD', 'INR', 'JPY', 'AUD'
];

export const RadioButton = ({
  input, label, meta: { touched, error }, id
}) => (
  <div>
    <div className={style.radio_group}>
      <input {...input} type="radio" id={id} value={input.value} name={input.name} className={style.radioPointer} />
      <label htmlFor={id}><Trans>{label}</Trans></label>
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

const renderDropdownList = ({
  placeholder,
  disabled,
  data,
  input,
  meta:
  {
    touched,
    error
  },
}) => (
  <div>
    <div className="candidateDropDown">
      <DropdownList
        {...input}
        data={data}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        disabled={disabled}
        defaultValue={'EUR'}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

export const renderInput = ({
  input, label, readOnly, placeholder, type, isRequired, isInfo, infoText, meta: { touched, error }, className,
  autoFocus, disabled
}) => (
  <div className={`m-t-10 ${className}`}>
    <label htmlFor={input.name}>
      <Trans>{label}</Trans>
      {isRequired ? <span className="required_color">*</span> : ''}
      { isInfo ?
        <span className="p-l-10">
          <i className="fa fa-info-circle" title={infoText} />
        </span> : ''
      }
    </label>
    <div>
      <input
        readOnly={readOnly}
        {...input}
        type={type}
        className={`${style.form_input} no-borders`}
        id={input.name}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        disabled={disabled}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

export const renderRadioInput = ({
  input, label, readOnly, type, meta: { touched, error }, className, id, inline, handleClick, showerror
}) => (
  <div className={inline ? `${className}` : `p-l-0 m-t-10 p-t-0 ${className}`}>
    <div className={inline ? '' : 'radio'}>
      <label htmlFor={id} className={style.radioPointer}>
        <input
          readOnly={readOnly}
          name={input.name}
          {...input}
          type={type}
          className={`${style.form_input} ${style.radioPointer} no-borders`}
          id={id}
          style={inline ? { bottom: '8px' } : { bottom: '2px' }}
          onClick={handleClick}
        />
        <span style={inline ? { fontWeight: 400, paddingLeft: '5px' } : { paddingLeft: '10px' }}>
          <Trans>{label}</Trans>
        </span>
      </label>
    </div>
    {error && touched && showerror && <div className="text-danger p-t-5">{error}</div>}
  </div>
);

const renderMultiSelect = ({
  input,
  data,
  valueField,
  defaultSelectValue,
  textField,
  isFilter,
  handleSelect,
  dropUp,
  isOpen,
  handleOnChange,
  placeholder,
  disabled
}) => {
  const messages = {
    emptyList: i18n.t('NO_RESULTS_FOUND'),
    emptyFilter: i18n.t('NO_RESULTS_FOUND')
  };
  return (<Multiselect
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
    onToggle={() => {}}
    dropUp={dropUp}
    disabled={disabled}
    placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
  />
  );
};

renderInput.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
renderInput.defaultProps = {
  custom: '',
};
renderDropdownList.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
renderDropdownList.defaultProps = {
  custom: '',
};
renderRadioInput.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
renderRadioInput.defaultProps = {
  custom: '',
};
RadioButton.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
RadioButton.defaultProps = {
  custom: '',
};
renderMultiSelect.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
renderMultiSelect.defaultProps = {
  custom: '',
};

export default class RenderOtherDetails extends Component {
  static propTypes = {
    initialValues: PropTypes.object,
    handleDateFormat: PropTypes.any,
    values: PropTypes.object,
    isResPerDisabled: PropTypes.bool,
    isWorkPermitDisabled: PropTypes.bool,
    isRelocDisabled: PropTypes.bool,
    form: PropTypes.any,
    change: PropTypes.func,
    touch: PropTypes.func.isRequired,
    errors: PropTypes.object,
    loadLocations: PropTypes.func.isRequired,
    locationList: PropTypes.oneOfType(
      PropTypes.array,
      PropTypes.object
    ),
    extendMarginBottom: PropTypes.bool,
    handleDatePickerInputClickCb: PropTypes.func.isRequired
  }

  static defaultProps = {
    fields: null,
    field: null,
    initialValues: {},
    handleDateFormat: null,
    values: {},
    isResPerDisabled: false,
    isWorkPermitDisabled: false,
    isRelocDisabled: false,
    form: {},
    change: null,
    errors: {},
    locationList: [],
    extendMarginBottom: false
  };

  constructor(props) {
    super(props);
    this.state = {
      isResPerDisabled: false,
      isWorkPermitDisabled: false,
      isRelocDisabled: !(this.props.initialValues && this.props.initialValues.pref_location &&
        this.props.initialValues.pref_location.length > 0) || false,
      isLocationOpen: false
    };
  }

  dispatchResPermitDate = () => {
    if (this.props.form) {
      this.props.change(this.props.form, 'visas[0].res_permit_valid_date', '');
    }
  }

  dispatchWorkPermitDate = () => {
    if (this.props.form) {
      this.props.change(this.props.form, 'visas[0].work_permit_valid_date', '');
    }
  }

  handleOnLocationSelect = value => {
    if (value) {
      this.setState({
        isLocationOpen: !this.state.isLocationOpen
      });
    }
  }

  handleOutsideLocationClick = evt => {
    if (!this.state.isLocationOpen) {
      return;
    }
    if (this.locationContainer !== null && this.locationContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isLocationOpen: false
    });
  }

  handleOnLocationChange = value => {
    document.addEventListener('click', this.handleOutsideLocationClick, false);
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value) &&
     !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      if (value === 'initial') {
        this.props.loadLocations(value.toLowerCase());
      } else {
        this.setState({
          isLocationOpen: true
        }, () => {
          this.props.loadLocations(value.toLowerCase());
        });
      }
    } else {
      this.setState({
        isLocationOpen: false
      });
    }
  }

  handleStartDate = () => {
    this.props.touch('MultiPartForm', 'avail_start_date');
  }

  handlepreferredLocation = evt => {
    if (evt.target.value === 'no') {
      this.setState({ isRelocDisabled: true });
      this.props.change(this.props.form, 'pref_location', '');
    } else {
      this.setState({ isRelocDisabled: false });
    }
  }

  changeDateFormat = value => value ? Moment(value).format('YYYY-MM-DD') : '';

  render() {
    const filterConfig = getResumeFormConfig(this);
    const { errors, extendMarginBottom, handleDatePickerInputClickCb } = this.props;
    const { isRelocDisabled } = this.state;
    return (
      <Scrollbars
        ref={node => { this.otherDetailsScrollRef = node; }}
        universal
        autoHide
        autoHeight
        autoHeightMin={'calc(100vh - 200px)'}
        autoHeightMax={'calc(100vh - 200px)'}
        renderThumbHorizontal={props => <div {...props} className="hide" />}
        renderView={props => <div {...props} className="customScroll customScrollResume" id="otherDetails" />}
      >
        <Row className={`${style.exp_sec} no-borders ${extendMarginBottom && 'm-b-60'}`}>
          {/* Notice Period Details */}
          <Col lg={8} md={8} xs={12} sm={12} className={`${style.borderBottomInput} p-0 ${style.m_t_b_10}`}>
            <Col lg={6} md={6} sm={6} xs={4} className="p-0">
              <Field
                name="notice_period"
                type="text"
                component={renderInput}
                label="NOTICE_PERIOD"
                normalize={restrictMaxValue(100)}
                parse={convertToPositiveInteger}
                placeholder="ENTER_THE_NUMBER_OF_WEEKS"
              />
            </Col>
            <Col lg={6} md={6} sm={4} xs={8} className="p-r-0 p-l-5">
              <div className={style.radioBtnGrp}>
                <Col lg={6} md={6} sm={6} xs={6} className="p-0" >
                  <Field
                    name="notice_period_type"
                    type="radio"
                    component={RadioButton}
                    label="WEEKS"
                    value="weeks"
                    id="np_week"
                  />
                </Col>
                <Col lg={6} md={6} sm={6} xs={6} className="p-0" >
                  <Field
                    name="notice_period_type"
                    type="radio"
                    component={RadioButton}
                    label="MONTHS"
                    value="months"
                    id="np_month"
                  />
                </Col>
              </div>
            </Col>
          </Col>

          <Col lg={12} md={12} xs={12} sm={12} className={`p-0 ${style.m_t_b_10}`}>
            {/*  Current Annual Salary */ }
            <Col
              lg={6}
              md={6}
              xs={12}
              sm={6}
              className={`${style.borderBottomInput} p-0 ${style.m_t_b_10}`}
              style={{ width: '47%' }}
            >
              <Col lg={8} md={8} sm={8} xs={8} className="p-0">
                <Field
                  name="curr_annual_salary"
                  type="number"
                  format={convertToPositiveInteger}
                  component={renderInput}
                  label="CURRENT_ANNUAL_SALARY"
                  normalize={restrictMaxValue(99999999)}
                  placeholder="ENTER_THE_CURRENT_SALARY"
                />
              </Col>
              <Col lg={4} xs={4} sm={4} md={4} className="p-r-0">
                <Field
                  name="curr_annual_salary_currency"
                  type="text"
                  component={renderDropdownList}
                  data={currencyType}
                  defaultValue={'EUR'}
                />
              </Col>
            </Col>

            {/* Expected Annual Salary */}
            <Col
              lg={6}
              md={6}
              xs={12}
              sm={6}
              className={`${style.borderBottomInput} p-0 ${style.m_t_b_10} right`}
            >
              <Col lg={8} md={8} sm={8} xs={8} className="p-0">
                <Field
                  name="exp_annual_salary"
                  type="number"
                  component={renderInput}
                  normalize={restrictMaxValue(99999999)}
                  label="EXPECTED_ANNUAL_SALARY"
                  format={convertToPositiveInteger}
                  placeholder="ENTER_THE_EXPECTED_SALARY"
                />
              </Col>
              <Col lg={4} md={4} sm={4} xs={4} className="p-r-0">
                <Field
                  name="exp_annual_salary_currency"
                  type="text"
                  component={renderDropdownList}
                  data={currencyType}
                />
              </Col>
            </Col>
          </Col>

          {/* Current Rate details */}
          <Col lg={12} md={12} xs={12} sm={12} className={`${style.borderBottomInput} p-0 ${style.m_t_b_10}`}>
            <Col lg={4} md={4} sm={4} xs={6} className="p-0">
              <Field
                name="curr_rate"
                component={renderInput}
                label="CURRENT_RATE"
                format={convertToPositiveInteger}
                normalize={restrictMaxValue(99999999)}
                type="number"
                placeholder="ENTER_THE_CURRENT_RATE"
              />
            </Col>
            <Col lg={2} md={2} sm={2} xs={4} className="p-l-5">
              <Field
                name="curr_rate_currency"
                type="text"
                component={renderDropdownList}
                format={trimTrailingSpace}
                data={currencyType}
                defaultValue={'EUR'}
              />
            </Col>
            <Col lg={6} md={6} sm={5} xs={12} className="p-0">
              <div className={style.radioBtnGrp}>
                <Col lg={4} md={4} sm={4} xs={4} className="p-0" >
                  <Field
                    name="curr_rate_type"
                    type="radio"
                    component={RadioButton}
                    label="HOURLY"
                    value="hourly"
                    id="rate_month"
                  />{''}
                </Col>
                <Col lg={4} md={4} sm={4} xs={4} className={`${style.border_l_r} p-0`} >
                  <Field
                    name="curr_rate_type"
                    type="radio"
                    component={RadioButton}
                    label="DAILY"
                    value="daily"
                    id="rate_daily"
                    isBorder
                  />
                </Col>
                <Col lg={4} md={4} sm={4} xs={4} className="p-0" >
                  <Field
                    name="curr_rate_type"
                    type="radio"
                    component={RadioButton}
                    label="MONTHLY"
                    value="monthly"
                    id="rate_monthly"
                  />{''}
                </Col>
              </div>
            </Col>
          </Col>

          {/* Expected Rate Details */}
          <Col lg={12} md={12} xs={12} sm={12} className={`${style.borderBottomInput} p-0 ${style.m_t_b_10}`}>
            <Col lg={4} md={4} sm={4} xs={6} className="p-0">
              <Field
                name="exp_rate"
                component={renderInput}
                label="EXPECTED_RATE"
                format={convertToPositiveInteger}
                normalize={restrictMaxValue(99999999)}
                type="number"
                placeholder="ENTER_THE_EXPECTED_RATE"
              />
            </Col>
            <Col lg={2} md={2} sm={2} xs={4} className="p-l-5">
              <Field
                name="exp_rate_currency"
                type="text"
                component={renderDropdownList}
                data={currencyType}
                defaultValue={'EUR'}
              />
            </Col>
            <Col lg={6} md={6} sm={5} xs={12} className="p-0">
              <div className={`${style.radioBtnGrp} ${style.borderRadius_5}`}>
                <Col lg={4} md={4} sm={4} xs={4} className="p-0" >
                  <Field
                    name="exp_rate_type"
                    type="radio"
                    component={RadioButton}
                    label="HOURLY"
                    value="hourly"
                    id="exp_hourly"
                  />
                </Col>
                <Col lg={4} md={4} sm={4} xs={4} className={`${style.border_l_r} p-0`} >
                  <Field
                    name="exp_rate_type"
                    type="radio"
                    component={RadioButton}
                    label="DAILY"
                    value="daily"
                    id="exp_daily"
                    isBorder
                  />
                </Col>
                <Col lg={4} md={4} sm={4} xs={4} className="p-0" >
                  <Field
                    name="exp_rate_type"
                    type="radio"
                    component={RadioButton}
                    label="MONTHLY"
                    value="monthly"
                    id="exp_monthly"
                  />
                </Col>
              </div>
            </Col>
          </Col>

          {/* Visa Type */}
          <Col lg={6} md={6} sm={12} xs={12} className="m-b-10 m-t-20 p-l-0">
            <DropdownField {...filterConfig.visa} />
          </Col>

          {/* Residency Permit Details */}
          <Col lg={12} md={12} xs={12} sm={12} className={`${style.m_t_b_10} p-0`}>
            <Col lg={6} md={6} sm={6} xs={6} className="p-0">
              <label htmlFor="res_permit"><Trans>RESIDENCY_PERMIT</Trans></label>
              <div>
                <Field
                  name="visas[0].res_permit"
                  type="radio"
                  component={renderRadioInput}
                  label="NO_PERMIT"
                  value="no permit"
                  id="no_permit"
                  inline={false}
                  handleClick={this.dispatchResPermitDate}
                />
              </div>
              <div>
                <Field
                  name="visas[0].res_permit"
                  type="radio"
                  component={renderRadioInput}
                  label="UNLIMITED"
                  value="unlimited"
                  id="unlimited"
                  inline={false}
                  handleClick={this.dispatchResPermitDate}
                />
              </div>
              <div>
                <Col lg={4} md={12} sm={12} xs={6} className="p-0">
                  <Field
                    name="visas[0].res_permit"
                    type="radio"
                    component={renderRadioInput}
                    label="VALID_TILL"
                    value="validtill"
                    id="rp_validtill"
                    inline={false}
                  />
                </Col>
                <Col lg={8} md={12} sm={12} xs={12} className="p-l-0 m-t-7">
                  <DatePicker
                    {...filterConfig.residencyPermit}
                    enableError={errors && errors.res_permit}
                    handleInputClickCb={() =>
                      handleDatePickerInputClickCb('visas[0].res_permit_valid_date',
                        'otherDetails',
                        this.otherDetailsScrollRef
                      )}
                  />
                  {<div className="text-danger">
                    {errors && errors.res_permit ? errors.res_permit : ''}
                  </div>}
                </Col>
              </div>
            </Col>

            {/* Work Permit Details */}
            <Col lg={6} md={6} sm={6} xs={6} className="p-r-0">
              <label htmlFor="work_permit"><Trans>WORK_PERMIT</Trans></label>
              <div>
                <Field
                  name="visas[0].work_permit"
                  type="radio"
                  component={renderRadioInput}
                  label="NO_PERMIT"
                  value="no permit"
                  id="wp_no_permit"
                  inline={false}
                  handleClick={this.dispatchWorkPermitDate}
                />
              </div>
              <div>
                <Field
                  name="visas[0].work_permit"
                  type="radio"
                  component={renderRadioInput}
                  label="UNLIMITED"
                  value="unlimited"
                  id="wp_unlimited"
                  inline={false}
                  handleClick={this.dispatchWorkPermitDate}
                />
              </div>
              <div>
                <Col lg={4} md={12} sm={12} xs={6} className="p-0">
                  <Field
                    name="visas[0].work_permit"
                    type="radio"
                    component={renderRadioInput}
                    label="VALID_TILL"
                    value="validtill"
                    id="wp_validtill"
                    inline={false}
                  />
                </Col>
                <Col lg={8} md={12} sm={12} xs={12} className="p-0 m-t-7">
                  <DatePicker
                    {...filterConfig.workPermit}
                    enableError={errors && errors.work_permit}
                    handleInputClickCb={() =>
                      handleDatePickerInputClickCb('visas[0].work_permit_valid_date',
                        'otherDetails',
                        this.otherDetailsScrollRef
                      )
                    }
                  />
                  {<div className="text-danger">
                    {errors && errors.work_permit ? errors.work_permit : ''}
                  </div>}
                </Col>
              </div>
            </Col>
          </Col>
          <Col lg={12} md={12} xs={12} sm={12} className={`${style.m_t_b_10} p-0`}>
            <label htmlFor="availability"><Trans>AVAILABLITY</Trans></label>
            <div>
              <Col lg={6} md={6} sm={6} xs={12} className="p-l-0">
                <DatePicker
                  {...filterConfig.availableStartDate}
                  handleInputClickCb={() =>
                    handleDatePickerInputClickCb('avail_start_date',
                      'otherDetails',
                      this.otherDetailsScrollRef
                    )}
                />
              </Col>
              <Col lg={6} md={6} sm={6} xs={12} className="p-r-0">
                <DatePicker
                  {...filterConfig.availableEndDate}
                  handleInputClickCb={() =>
                    handleDatePickerInputClickCb('avail_end_date',
                      'otherDetails',
                      this.otherDetailsScrollRef
                    )}
                />
              </Col>
            </div>
          </Col>

          {/* Relocation Details */}
          <Col lg={12} md={12} xs={12} sm={12} className={`p-0 ${style.m_t_b_10}`}>
            <label htmlFor="reloc_possibility"><Trans>RELOCATION_POSSIBILITY</Trans></label>
            <div>
              <Col lg={3} xs={6} md={3} sm={3} className="p-0">
                <Field
                  name="reloc_possibility"
                  type="radio"
                  component={renderRadioInput}
                  label="YES"
                  value="yes"
                  id="yes"
                  handleClick={this.handlepreferredLocation}
                  inline
                  className="radio-inline m-t-0"
                />
                <Field
                  name="reloc_possibility"
                  type="radio"
                  component={renderRadioInput}
                  handleClick={this.handlepreferredLocation}
                  label="NO"
                  value="no"
                  id="no"
                  inline
                  className="radio-inline m-t-0"
                />
              </Col>
              {!isRelocDisabled && <Col lg={8} xs={12} md={8} sm={8}>
                <Field
                  name="pref_location"
                  valueField="name"
                  textField="name"
                  handleOnChange={this.handleOnLocationChange}
                  data={this.props.locationList}
                  isFilter={false}
                  isOpen={this.state.isLocationOpen}
                  handleOnSelect={this.handleOnLocationSelect}
                  placeholder="START_TYPING_TO_ADD_THE_LOCATION"
                  component={renderMultiSelect}
                  disabled={isRelocDisabled}
                  dropUp
                />
              </Col>
              }
            </div>
          </Col>
        </Row>
      </Scrollbars>
    );
  }
}
