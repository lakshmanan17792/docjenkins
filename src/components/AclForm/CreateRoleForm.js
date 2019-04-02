import React, { Component } from 'react';
import { reduxForm, fieldPropTypes, Field } from 'redux-form';
import PropTypes from 'prop-types';
import Select from 'react-select';
import createRoleValidation from './createRoleValidation';

const styles = require('../../containers/Acl/Acl.scss');

export const Input = ({
  input, label, readOnly, type, isRequired, isInfo, infoText, meta: { touched, error },
  placeholder
}) => (
  <div className={styles.m_t_b_10}>
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
        id={input.name}
        placeholder={placeholder}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

const renderSelectInput = ({
  valueKey,
  labelKey,
  handleOnChange,
  handleOnInputChange,
  data,
  fields,
  label,
  required,
  placeholder,
  selectedOption,
  meta:
  {
    touched,
    error
  },
  input,
  onBlur
}) => (
  <div className={styles.m_t_b_10}>
    <label htmlFor={name}>
      {label}
      {required ? <span className="required_color">*</span> : ''}
    </label>
    <div>
      <Select
        name={name}
        valueKey={valueKey}
        labelKey={labelKey}
        openOnClick={false}
        onChange={val => handleOnChange(val, fields)}
        onInputChange={handleOnInputChange}
        options={data}
        placeholder={placeholder}
        value={selectedOption}
        {...input}
        onBlur={onBlur}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

renderSelectInput.propTypes = {
  valueKey: PropTypes.any.isRequired,
  labelKey: PropTypes.any.isRequired,
  handleOnChange: PropTypes.func,
  handleOnInputChange: PropTypes.func,
  data: PropTypes.any,
  fields: PropTypes.any,
  label: PropTypes.any,
  required: PropTypes.any,
  placeholder: PropTypes.string,
  selectedOption: PropTypes.any,
  meta: PropTypes.any,
  ...fieldPropTypes
};

renderSelectInput.defaultProps = {
  handleOnInputChange: () => { },
  handleOnChange: () => { },
  data: null,
  label: '',
  required: false,
  placeholder: '',
  selectedOption: '',
  meta: {},
  fields: '',
};

Input.propTypes = {
  ...fieldPropTypes
};

@reduxForm({
  form: 'AddRoleForm',
  validate: createRoleValidation,
})
export default class CreateRoleForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    roles: PropTypes.array.isRequired,
    isEdit: PropTypes.bool.isRequired
  };

  static defaultProps = {
    isClone: false,
    isEdit: false
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedReportingRole: null
    };
  }

  render() {
    const { handleSubmit, onCancel, roles, isEdit } = this.props;
    return (
      <form name="AddRoleForm" onSubmit={handleSubmit} className={styles.add_role_form}>
        <Field
          name="name"
          type="text"
          component={Input}
          label="Name"
          placeholder="Give a name for the role"
          isRequired
        />
        {!isEdit && <Field
          component={renderSelectInput}
          name="reporter"
          valueKey="name"
          labelKey="name"
          handleOnInputChange={this.handleOnSkillChange}
          handleOnChange={a => {
            this.setState({
              selectedReportingRole: a
            });
          }}
          data={roles}
          placeholder="Select a Role"
          label="Reports To"
          required
          selectedOption={this.state.selectedReportingRole}
        />}
        <div className={styles.addBtnContainer}>
          <button
            className={`button-primary ${styles.expand_collapse_btn} ${styles.form_btn}`}
            type="submit"
            onSubmit={handleSubmit}
          >
            {isEdit ? 'Edit Role' : 'Create Role'}
          </button>
          <button
            className={`button-secondary ${styles.white_expand_collapse_btn} ${styles.form_btn}`}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }
}
