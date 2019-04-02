import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
import { Field, reduxForm, getFormValues, change } from 'redux-form';
import { Col } from 'react-bootstrap';
import Multiselect from 'react-widgets/lib/Multiselect';
// import MultiselectField from '../../components/FormComponents/MultiSelect';
import DropdownField from '../../components/FormComponents/DropdownList';
import ButtonGroup from '../../components/FormComponents/ButtonGroup';
import { otherDetailsValidation, getOtherDetailsFormConfig } from '../../formConfig/StepSaveOpening';
import { loadLocations } from '../../redux/modules/profile-search';
import DatePicker from '../../components/FormComponents/DatePicker';
import CheckBox from '../../components/FormComponents/CheckBox';

const styles = require('./StepSaveOpening.scss');

@reduxForm({
  form: 'StepSaveOpening',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: otherDetailsValidation
})

@connect(state => ({
  values: getFormValues('StepSaveOpening')(state),
  openingLocation: state.profileSearch.locationList,
  formData: state.form.StepSaveOpening,
}), {
  loadLocations, change
})
export default class OpeningEmpTypes extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    values: PropTypes.objectOf(PropTypes.any).isRequired,
    loadLocations: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    form: PropTypes.string.isRequired,
    clickedAnotherPage: PropTypes.bool.isRequired,
    resetPageFields: PropTypes.func.isRequired,
    gotoPage: PropTypes.func.isRequired,
    toPage: PropTypes.number.isRequired,
    valid: PropTypes.bool.isRequired,
    resetFields: PropTypes.func.isRequired,
    formData: PropTypes.object
  }

  static defaultProps = {
    formData: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      newlyAddedLocations: [],
      isLocationOpen: false,
      showStatus: true,
      initialParam: 'initial',
      ispublic: false
    };
  }
  componentWillMount() {
    if (!this.props.formData.initial.status) {
      this.setState({
        showStatus: false
      });
    }
    if (!this.props.values.status) {
      const defaultStatus = { id: 'active', name: 'Active' };
      this.changeFieldValues('status', defaultStatus);
    }
    this.setState({ prevOpeningLocations: this.props.values.openingLocation || [],
      previousSourcingLocations: this.props.values.location || [] });
  }
  componentWillReceiveProps(nextProps) {
    const { valid, handleSubmit, gotoPage, resetPageFields } = this.props;
    const { toPage } = nextProps;
    if (nextProps.clickedAnotherPage) {
      if (toPage < 2) {
        gotoPage(toPage, valid);
      } else if (valid) {
        gotoPage(toPage, valid);
      } else {
        handleSubmit();
        resetPageFields();
      }
    }
  }

  onDateChange = value => {
    const { values } = this.props;
    if (values.status && (values.status === 'closed' || values.status.id === 'closed') && values && value) {
      const duration = moment.duration(moment(value).diff(moment()));
      const days = Math.round(duration.asDays());
      const statusWarning = document.getElementById('statusWarning');
      if (days >= 0 || days === -0) {
        statusWarning.style.display = 'block';
      } else {
        statusWarning.style.display = 'none';
      }
    }
  }

  changeFieldValues = (fieldName, value) => {
    this.props.change(this.props.form, fieldName, value);
  }

  handleOutsideLocationClick = evt => {
    if (!this.state.isLocationOpen) {
      return;
    }
    if (this.locationContainer !== null &&
    this.locationContainer !== undefined &&
    this.locationContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isLocationOpen: false
    });
  }

  handleOnLocationChange = value => {
    document.addEventListener('click', this.handleOutsideLocationClick, false);
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\') &&
      !value.startsWith('./') && value.trim() !== '') {
      this.setState({
        isLocationOpen: true
      }, () => {
        this.props.loadLocations(value.toLowerCase());
      });
    } else {
      this.setState({
        isLocationOpen: false
      });
    }
  }
  handleCheckSubmit = (evt, checked) => {
    if (checked) {
      this.setState({ [evt.target.name]: checked || false });
    } else {
      this.setState({ [evt.target.name]: false });
    }
  }
  handleOnLocationSelect = value => {
    if (value) {
      this.setState({
        isLocationOpen: !this.state.isLocationOpen
      });
    }
  }
  handleOnAfterChanges = locations => {
    this.changeFieldValues('openingLocation', locations);
    const newlyAddedLocations = lodash.filter(locations, location => {
      if (!lodash.some(this.state.prevOpeningLocations, location)) {
        return location;
      }
    });
    let sourcingLocation = [...this.state.previousSourcingLocations, ...newlyAddedLocations];
    sourcingLocation = lodash.uniqBy(sourcingLocation, 'id');
    this.changeFieldValues('location', sourcingLocation);
  }

  handleOnStatusChange = value => {
    if (value.id === 'active') {
      const statusWarning = document.getElementById('statusWarning');
      statusWarning.style.display = 'none';
    }
  }

  customMultiSelect = ({ input, valueField, textField, data, handleOnChange, handleOnSelect,
    handleOnAfterChanges, isFilter, messages, isOpen, dropUp }) =>
    (
      <Multiselect
        {...input}
        onBlur={() => input.onBlur()}
        value={input.value || []} // requires value to be an array
        data={data}
        filter={isFilter}
        messages={messages}
        open={isOpen}
        valueField={valueField}
        textField={textField}
        onSearch={handleOnChange}
        onSelect={handleOnSelect}
        onChange={handleOnAfterChanges}
        onToggle={() => { }}
        dropUp={dropUp}
      />)

  render() {
    const { handleSubmit, values } = this.props;
    const filterConfig = getOtherDetailsFormConfig(this);
    return (
      <form onSubmit={handleSubmit}>
        <Col sm={12} className="m-t-10 m-b-10">
          <label htmlFor="openingLocation" ><Trans>WORK_LOCATION</Trans></label>
          <Field
            {...filterConfig.openingLocation}
            component={this.customMultiSelect}
          />
        </Col>
        <Col sm={12} className="m-t-10 m-b-10 p-l-15 p-r-15">
          <DatePicker {...filterConfig.startDate} />
        </Col>
        <Col sm={12} className="m-t-10 m-b-10 p-l-15 p-r-15">
          <DatePicker {...filterConfig.endDate} />
        </Col>
        {
          this.state.showStatus &&
          <Col sm={12} className="m-t-10 m-b-5 p-l-15 p-r-15">
            <DropdownField {...filterConfig.status} />
            <div className={styles.warning} id="statusWarning">
              <span>
                The submission date is set to a future date, but the status remains to be set as closed.
              </span>
            </div>
          </Col>
        }
        <Col sm={12} className="m-t-10">
          <ButtonGroup
            {...filterConfig.type}
            changeFieldValues={this.changeFieldValues}
            resetFields={this.props.resetFields}
            jobOpeningDetails={values ? values.jobOpeningDetails : null}
          />
        </Col>
        <Col sm={12} className="m-t-10">
          <DropdownField {...filterConfig.ispublic} />
        </Col>
        <Col lg={12} className="m-t-10 m-b-25" style={{ display: 'flex' }}>
          <button className={`${styles.submitButton} button-primary`} type="submit">
            <Trans>CONTINUE</Trans>
          </button>
        </Col>
      </form>
    );
  }
}
