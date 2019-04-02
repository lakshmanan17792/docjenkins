import React, { Component } from 'react';
import { reduxForm, Field, propTypes } from 'redux-form';
import { trimTrailingSpace, trimWhiteSpaces } from 'utils/validation';
import registerValidation from './registerValidation';

// eslint-disable-next-line react/prop-types
const Input = ({ input, label, type, meta: { touched, error } }) =>
  (<div className={`form-group ${error && touched ? 'has-error' : ''}`}>
    <label htmlFor={input.name} className="col-sm-2">
      {label}
    </label>
    <div className="col-sm-10">
      <input {...input} type={type} className="form-control" />
      {error && touched && <span className="glyphicon glyphicon-remove form-control-feedback" />}
      {error &&
        touched &&
        <div className="text-danger">
          <strong>
            {error}
          </strong>
        </div>}
    </div>
  </div>);

@reduxForm({
  form: 'register',
  validate: registerValidation
})
export default class RegisterForm extends Component {
  static propTypes = {
    ...propTypes
  };

  render() {
    const { handleSubmit, error } = this.props;

    return (
      <form className="form-horizontal" onSubmit={handleSubmit}>
        <Field name="firstName" type="text" component={Input} label="Firstname" format={trimTrailingSpace} />
        <Field name="lastName" type="text" component={Input} label="Lastname" format={trimTrailingSpace} />
        <Field name="email" type="text" component={Input} label="Email" format={trimTrailingSpace} />
        <Field name="username" type="text" component={Input} label="Username" format={trimWhiteSpaces} />
        <Field name="password" type="password" component={Input} label="Password" format={trimTrailingSpace} />
        {error &&
          <p className="text-danger">
            <strong>
              {error}
            </strong>
          </p>}
        <button className="btn btn-success" type="submit">
          <i className="fa fa-sign-in" /> Register
        </button>
      </form>
    );
  }
}
