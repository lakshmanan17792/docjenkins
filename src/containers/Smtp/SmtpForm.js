import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { reduxForm, Field, fieldPropTypes, propTypes } from 'redux-form';
import smtpValidation from './SmtpValidation';

const style = require('./Smtp.scss');

const Input = ({
  input, label, readOnly, type, isRequired, isInfo, infoText, meta: { touched, error }
}) => (
  <div className={style.m_t_b_10}>
    <label htmlFor={input.name}>
      {label}
      {isRequired ? <span className="required_color">*</span> : ''}
      {isInfo ?
        <span className="p-l-10 cursor-pointer">
          <i className="fa fa-info-circle" title={infoText} />
        </span> : ''
      }
    </label>
    <div>
      <input
        readOnly={readOnly}
        {...input}
        type={type}
        className={`${style.form_input}`}
        id={input.name}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

Input.propTypes = fieldPropTypes;
@reduxForm({
  form: 'SmtpForm',
  validate: smtpValidation,
  enableReinitialize: true
})
export default class SmtpForm extends Component {
  static propTypes = {
    ...propTypes
  }
  componentWillMount() {
  }

  render() {
    const { handleSubmit, initialValues } = this.props;
    return (
      <Row className={style.conatiner}>
        <Col mdOffset={4} lgOffset={4} md={4} lg={4}>
          <div className={style.header}>
            Configure Your Email System
          </div>
          <div className={style.subheader}>
            Hey, We need your SMTP credentials to send emails on your behalf
          </div>
          <form onSubmit={handleSubmit}>
            <Field
              label="SMTP Hostname"
              component={Input}
              name={'SMTP_host'}
              type="text"
              isRequired
            />
            <Field
              label="SMTP Port Number"
              component={Input}
              name={'SMTP_port'}
              type="text"
              isRequired
            />
            <Field
              label="IMAP Hostname"
              component={Input}
              name={'IMAP_host'}
              type="text"
              isRequired
            />
            <Field
              label="IMAP Port Number"
              component={Input}
              name={'IMAP_port'}
              type="text"
              isRequired
            />
            <Field
              label="Username"
              component={Input}
              name={'auth_user'}
              type="text"
              isRequired
            />
            <Field
              label="Password"
              component={Input}
              name={'auth_password'}
              type="password"
              isRequired
            />
            <div>
              <button
                type="submit"
                className={`${style.submitButton} btn btn-border`}
              >
                {initialValues.SMTP_host ? 'UPDATE' : 'SAVE'}
              </button>
            </div>
          </form>
        </Col>
      </Row>
    );
  }
}
