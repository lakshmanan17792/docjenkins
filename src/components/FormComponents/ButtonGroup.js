import React, { Component } from 'react';
import { Field } from 'redux-form';
import { Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import InputBox from '../../components/FormComponents/InputBox';
import DatePicker from '../../components/FormComponents/DatePicker';
import CheckBox from '../../components/FormComponents/CheckBox';
import { getOpeningFormConfig } from '../../formConfig/SaveOpening';
import styles from './FormComponents.scss';
import i18n from '../../i18n';

class renderButtonGroup extends Component {
  static propTypes = {
    buttons: PropTypes.array.isRequired,
    activeBtn: PropTypes.string,
    resetFields: PropTypes.func,
    jobOpeningDetails: PropTypes.object,
    changeFieldValues: PropTypes.func,
    input: PropTypes.any.isRequired
  }

  static defaultProps = {
    jobOpeningDetails: null,
    changeFieldValues: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeBtn: props.input.value || '',
      fullTimeASAP: props.jobOpeningDetails ? props.jobOpeningDetails.fullTimeASAP : false,
      contractASAP: props.jobOpeningDetails ? props.jobOpeningDetails.contractASAP : false,
      partTimeASAP: props.jobOpeningDetails ? props.jobOpeningDetails.partTimeASAP : false,
      contractRemoteLocation: props.jobOpeningDetails ? props.jobOpeningDetails.contractRemoteLocation : false,
      partTimeRemoteLocation: props.jobOpeningDetails ? props.jobOpeningDetails.partTimeRemoteLocation : false,
      contractOnsiteLocation: props.jobOpeningDetails ? props.jobOpeningDetails.contractOnsiteLocation : false,
      partTimeOnsiteLocation: props.jobOpeningDetails ? props.jobOpeningDetails.partTimeOnsiteLocation : false,
    };
  }

  handleClick = evt => {
    evt.preventDefault();
    const { input } = this.props;
    this.setState({ activeBtn: evt.target.id });
    input.onChange(evt.target.id);
    if (this.props.resetFields) {
      this.props.resetFields(evt.target.id);
    }
  }

  handleCheckBox = (evt, type) => {
    if (evt.target.checked) {
      if (type === 'fullTime') {
        this.props.changeFieldValues('jobOpeningDetails.fullTimeStartDate', null);
        // this.props.changeFieldValues('jobOpeningDetails.fullTimeEndDate', null);
      } else if (type === 'contractASAP') {
        this.props.changeFieldValues('jobOpeningDetails.contractStartDate', null);
        // this.props.changeFieldValues('jobOpeningDetails.contractEndDate', null);
      } else if (type === 'partTimeASAP') {
        this.props.changeFieldValues('jobOpeningDetails.freelanceStartDate', null);
        // this.props.changeFieldValues('jobOpeningDetails.freelanceEndDate', null);
      }
    }
    if (type === 'fullTime') {
      this.setState({
        fullTimeASAP: evt.target.checked
      });
    } else if (type === 'contractASAP') {
      this.setState({
        contractASAP: evt.target.checked
      });
    } else if (type === 'partTimeASAP') {
      this.setState({
        partTimeASAP: evt.target.checked
      });
    } else if (type === 'contractRemoteLocation') {
      this.setState({
        contractRemoteLocation: evt.target.checked
      });
    } else if (type === 'partTimeRemoteLocation') {
      this.setState({
        partTimeRemoteLocation: evt.target.checked
      });
    } else if (type === 'contractOnsiteLocation') {
      this.setState({
        contractOnsiteLocation: evt.target.checked
      });
    } else if (type === 'partTimeOnsiteLocation') {
      this.setState({
        partTimeOnsiteLocation: evt.target.checked
      });
    }
  }

  render() {
    const { buttons, activeBtn } = this.props;
    const { fullTimeASAP,
      contractASAP,
      partTimeASAP,
      contractRemoteLocation,
      partTimeRemoteLocation,
      contractOnsiteLocation,
      partTimeOnsiteLocation
    } = this.state;
    const filterConfig = getOpeningFormConfig(this);
    const { value } = this.props.input;
    const colSize = Math.round(12 / buttons.length);
    return (
      <Row>
        <Col lg={12} className={`${styles.button_group} m-b-10`}>
          {
            buttons.map(button => {
              const isActive = (this.state.activeBtn || activeBtn) === button.id ? styles.active : '';
              return (
                <Col key={button.id} lg={colSize} className="p-0">
                  <button className={`btn ${isActive}`} id={button.id} onClick={this.handleClick}>
                    {button.name}
                  </button>
                </Col>
              );
            })
          }
        </Col>
        {
          value === 'fullTime' &&
          <div>
            <Col sm={6} className="m-t-10 m-b-10">
              <CheckBox
                {...filterConfig.jobOpeningDetails.fullTimeASAP}
                onChange={evt => this.handleCheckBox(evt, 'fullTime')}
                isChecked={fullTimeASAP}
              />
            </Col>
            <Col sm={6} className={fullTimeASAP ? `${styles.blur} m-t-10 m-b-10` : 'm-t-10 m-b-10'} >
              {/* <Col sm={6} className="m-t-10 m-b-10"> */}
              <DatePicker {...filterConfig.jobOpeningDetails.fullTimeStartDate} disabled={fullTimeASAP} />
              {/* </Col> */}
              {/* <Col sm={6} className="m-t-10 m-b-10">
                <DatePicker {...filterConfig.jobOpeningDetails.fullTimeEndDate} disabled={fullTimeASAP} />
              </Col> */}
            </Col>
            <Col sm={6} className="m-t-10 m-b-10">
              <InputBox {...filterConfig.jobOpeningDetails.salary} />
            </Col>
            <Col sm={6} className="m-t-10 m-b-10">
              <InputBox {...filterConfig.jobOpeningDetails.permFee} />
            </Col>
          </div>
        }
        {
          value === 'contract' &&
          <div>
            <Row style={{ margin: '0' }}>
              <Col sm={4} className="m-t-10 m-b-10">
                <CheckBox
                  {...filterConfig.jobOpeningDetails.contractASAP}
                  onChange={evt => this.handleCheckBox(evt, 'contractASAP')}
                  isChecked={contractASAP}
                />
              </Col>
              <Col sm={4} className="m-t-10 m-b-10">
                <CheckBox
                  {...filterConfig.jobOpeningDetails.contractRemoteLocation}
                  onChange={evt => this.handleCheckBox(evt, 'contractRemoteLocation')}
                  isChecked={contractRemoteLocation}
                />
              </Col>
              <Col sm={4} className="m-t-10 m-b-10">
                <CheckBox
                  {...filterConfig.jobOpeningDetails.contractOnsiteLocation}
                  onChange={evt => this.handleCheckBox(evt, 'contractOnsiteLocation')}
                  isChecked={contractOnsiteLocation}
                />
              </Col>
            </Row>
            <Row style={{ margin: '0' }}>
              <Col sm={6} className={`m-t-10 m-b-10 ${contractASAP && styles.blur}`}>
                <DatePicker {...filterConfig.jobOpeningDetails.contractStartDate} disabled={contractASAP} />
              </Col>
              <Col sm={6} className="m-t-10 m-b-10">
                <DatePicker {...filterConfig.jobOpeningDetails.contractEndDate} />
              </Col>
            </Row>
            <Row style={{ margin: '0' }}>
              <Col sm={6} className="m-t-10 m-b-10">
                <InputBox {...filterConfig.jobOpeningDetails.payRate} />
              </Col>
              <Col sm={6} className="m-t-10 m-b-10">
                <InputBox {...filterConfig.jobOpeningDetails.salaryContract} />
              </Col>
            </Row>
          </div>
        }
        {
          value === 'partTime' &&
          <div>
            <Row style={{ margin: '0' }}>
              <Col sm={4} className="m-t-10 m-b-10">
                <CheckBox
                  {...filterConfig.jobOpeningDetails.partTimeASAP}
                  onChange={evt => this.handleCheckBox(evt, 'partTimeASAP')}
                  isChecked={partTimeASAP}
                />
              </Col>
              <Col sm={4} className="m-t-10 m-b-10">
                <CheckBox
                  {...filterConfig.jobOpeningDetails.partTimeRemoteLocation}
                  onChange={evt => this.handleCheckBox(evt, 'partTimeRemoteLocation')}
                  isChecked={partTimeRemoteLocation}
                />
              </Col>
              <Col sm={4} className="m-t-10 m-b-10">
                <CheckBox
                  {...filterConfig.jobOpeningDetails.partTimeOnsiteLocation}
                  onChange={evt => this.handleCheckBox(evt, 'partTimeOnsiteLocation')}
                  isChecked={partTimeOnsiteLocation}
                />
              </Col>
            </Row>
            <Row style={{ margin: '0' }}>
              <Col sm={6} className={`m-t-10 m-b-10 ${partTimeASAP && styles.blur}`}>
                <DatePicker {...filterConfig.jobOpeningDetails.freelanceStartDate} disabled={partTimeASAP} />
              </Col>
              <Col sm={6} className="m-t-10 m-b-10">
                <DatePicker {...filterConfig.jobOpeningDetails.freelanceEndDate} />
              </Col>
            </Row>
            <Row style={{ margin: '0' }}>
              <Col sm={6} className="m-t-10 m-b-10">
                <InputBox {...filterConfig.jobOpeningDetails.billRate} />
              </Col>
              <Col sm={6} className="m-t-10 m-b-10">
                <InputBox {...filterConfig.jobOpeningDetails.payRateFreelance} />
              </Col>
            </Row>
          </div>
        }
      </Row>
    );
  }
}

renderButtonGroup.defaultProps = {
  activeBtn: '',
  resetFields: null
};

const ButtonGroup = ({ label, name, buttons, activeBtn, resetFields, jobOpeningDetails, changeFieldValues }) => (
  <div>
    <label htmlFor={name}><Trans>{label}</Trans></label>
    {label === 'Employment Type' &&
      <i
        title={i18n.t('tooltipMessage.SELECTED_EMPLOYMENT_TYPE_WILL_BE_SAVED')}
        className="fa fa-info-circle m-l-10"
      />
    }

    <Field
      name={name}
      component={renderButtonGroup}
      resetFields={resetFields}
      buttons={buttons}
      activeBtn={activeBtn}
      jobOpeningDetails={jobOpeningDetails}
      changeFieldValues={changeFieldValues}
    />
  </div>
);

ButtonGroup.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  buttons: PropTypes.array.isRequired,
  activeBtn: PropTypes.string.isRequired,
  resetFields: PropTypes.func,
  jobOpeningDetails: PropTypes.object,
  changeFieldValues: PropTypes.func
};

ButtonGroup.defaultProps = {
  resetFields: null,
  jobOpeningDetails: null,
  changeFieldValues: null,
};

export default ButtonGroup;

