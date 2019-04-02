import React from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import { Col, Panel } from 'react-bootstrap';
import lodash from 'lodash';
import { trimTrailingSpace, restrictMaxLength } from 'utils/validation';
import style from './ContactsForm.scss';

const required = value => value ? undefined : 'Required';
const valid = value => value ? undefined || value.length < 2 : 'Required';
const maxLength = value =>
  value && (value.trim()).length > 15 ? 'Number must be less than 15 digits' : undefined;
const number = value => value
  && !/^(\+\d{1,4}(\s|-)?)?\d{1,15}$/.test(value.trim()) ? 'Invalid contact number' : undefined;
const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(lodash.trim(value)) ?
    'Invalid email address' : undefined;

let copiedFields = '';
const newFields = [];

const renderFormField = ({
  input,
  label,
  type,
  className,
  meta: { touched, error },
  isRequired,
  showLength
}) =>
  (<div>
    <div className="m-t-10">
      <label htmlFor={input.name}>
        {label}{isRequired && <span className="required_color">*</span>}
      </label>
      <div>
        <div className="m-t-10">
          <input {...input} type={type} className={className} id={input.name} />
          {error &&
            touched &&
            <div className="inline error-message">
              {error}
            </div>}
          {touched && showLength &&
            <div
              className="inline text-length"
              style={{ float: 'right' }}
            >
              {input.value.length}/50
            </div>}
        </div>
      </div>
    </div>
  </div>);

renderFormField.propTypes = {
  showLength: PropTypes.bool
};

renderFormField.defaultProps = {
  showLength: false
};

const addContact = () => {
  copiedFields.push();
  const newIndex = copiedFields.length;
  newFields.push(newIndex);
};

const deleteUnSavedContact = index => {
  copiedFields.remove(index);
};

const renderFormItem = (item, index) => {
  const contacts = [
    { open: true, value: 'Primary Contact' },
    { open: true, value: 'Secondary Contact' },
    { open: true, value: 'Contact 3' },
    { open: true, value: 'Contact 4' },
    { open: true, value: 'Contact 5' }
  ];
  const panelHeader = (
    <div>
      <span className={style.panelTitle}>
        {contacts[index].value}
      </span>
      {newFields.includes(index) && index !== 0 &&
        <i
          className="fa fa-times right p-r-5"
          role="button"
          tabIndex="-1"
          onClick={() => deleteUnSavedContact(index)}
        />
      }
    </div>
  );
  return (
    <div className={style.contacts}>
      <Panel
        collapsible
        expanded={contacts[index].open}
        header={panelHeader}
        style={{ borderColor: '#fff' }}
      >
        <Col sm={12}>
          <Col lg={6} sm={6}>
            <Field
              component={renderFormField}
              label="First Name"
              name={`${item.toString()}.firstName`}
              type="text"
              validate={required}
              isRequired="true"
              format={trimTrailingSpace}
              normalize={restrictMaxLength(50)}
              showLength="true"
            />
          </Col>
          <Col lg={6} sm={6}>
            <Field
              component={renderFormField}
              label="Last Name"
              name={`${item.toString()}.lastName`}
              type="text"
              validate={required}
              isRequired="true"
              format={trimTrailingSpace}
              normalize={restrictMaxLength(50)}
              showLength="true"
            />
          </Col>
        </Col>
        <Col sm={12}>
          <Col lg={6} sm={6}>
            <Field
              component={renderFormField}
              label="Job Title"
              name={`${item.toString()}.jobTitle`}
              type="text"
              validate={required}
              isRequired="true"
              format={trimTrailingSpace}
            />
          </Col>
          <Col lg={6} sm={6}>
            <Field
              component={renderFormField}
              label="Email"
              name={`${item.toString()}.email`}
              type="text"
              validate={[valid, email]}
              isRequired="true"
              format={trimTrailingSpace}
            />
          </Col>
        </Col>
        <Col sm={12}>
          <Col lg={6} sm={6}>
            <Field
              component={renderFormField}
              label="Contact Number"
              name={`${item.toString()}.contactNumber`}
              type="text"
              validate={[valid, number, maxLength]}
              isRequired="true"
              format={trimTrailingSpace}
            />
          </Col>
        </Col>
      </Panel>
    </div>
  );
};

const renderFormItems = props => {
  const { companyId, fields } = props;
  copiedFields = fields;
  if (companyId) {
    if (fields.length < 6) {
      return (
        <div>
          {fields.map(renderFormItem)}
          <div className="col-sm-12 m-b-20">
            <div className="p-5 col-lg-4 col-sm-6 col-sm-offset-3 col-lg-offset-4">
              <button
                className={`btn btn-border orange-btn ${style.addNewContact} ${fields.length === 5 && 'hide'}`}
                type="button"
                onClick={() => addContact()}
              >
                Add New Contact
              </button>
            </div>
          </div>
        </div>
      );
    }
  } else {
    if (fields.length === 0) { fields.push({}); }
    if (fields.length < 6) {
      return (
        <div>
          {fields.map(renderFormItem)}
          <div className="col-sm-12 m-b-20">
            <div className="p-5 col-lg-4 col-sm-6 col-sm-offset-3 col-lg-offset-4">
              <button
                className={`btn btn-border orange-btn ${style.addNewContact} ${fields.length === 5 && 'hide'}`}
                type="button"
                onClick={() => addContact()}
              >
                Add New Contact
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
};

renderFormField.defaultProps = {
  className: '',
  companyId: 0,
  isRequired: false,
  placeholder: '',
  input: '',
  label: '',
  type: '',
};

renderFormItems.propTypes = {
  companyId: PropTypes.number.isRequired,
  fields: PropTypes.any.isRequired
};

renderFormField.propTypes = {
  label: PropTypes.string.isRequired,
  input: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  meta: PropTypes.any.isRequired
};

export default renderFormItems;
