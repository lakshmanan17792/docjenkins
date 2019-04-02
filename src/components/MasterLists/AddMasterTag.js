import React, { Component } from 'react';
import { reduxForm, fieldPropTypes, Field, change } from 'redux-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import DropdownList from 'react-widgets/lib/DropdownList';
import { trimSpecialCharcters } from '../../utils/validation';
import { TagValidator } from './MasterListsValidation.js';
import styles from '../../containers/Users/Users.scss';
import i18n from '../../i18n';

export const Input = ({
  input, label, readOnly, type, isRequired, isInfo, infoText, meta: { touched, error },
  placeholder, autoFocus
}) => (
  <div className={styles.m_t_b_10}>
    <label htmlFor={input.name}>
      {i18n.t(label)}
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
        onBlur={() => { }}
        type={type}
        id={input.name}
        placeholder={placeholder}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);
Input.propTypes = {
  ...fieldPropTypes
};

const renderDropdownList = ({
  valueField,
  textField,
  handleOnChange,
  data,
  label,
  isRequired,
  placeholder,
  selectedOption,
  meta:
  {
    touched,
    error
  },
}) => (
  <div className={styles.m_t_b_10}>
    <label htmlFor={name}>
      {i18n.t(label)}
      {isRequired ? <span className="required_color">*</span> : ''}
    </label>
    <div>
      <DropdownList
        name={name}
        valueField={valueField}
        textField={textField}
        data={data}
        onChange={handleOnChange}
        placeholder={i18n.t(`placeholder.${placeholder}`)}
        value={selectedOption}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

renderDropdownList.propTypes = {
  valueField: PropTypes.any.isRequired,
  textField: PropTypes.any.isRequired,
  handleOnChange: PropTypes.func,
  data: PropTypes.any,
  label: PropTypes.any,
  isRequired: PropTypes.any,
  placeholder: PropTypes.string,
  selectedOption: PropTypes.any,
  ...fieldPropTypes
};

renderDropdownList.defaultProps = {
  handleOnChange: () => { },
  data: null,
  label: '',
  isRequired: false,
  placeholder: '',
  selectedOption: '',
};

@reduxForm({
  form: 'AddMasterTag',
  validate: TagValidator,
  touchOnChange: true
})

@connect(() => ({}), { change })
export default class AddMasterTag extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    invalid: PropTypes.bool.isRequired,
    form: PropTypes.string.isRequired,
    tagTypes: PropTypes.array,
    isEdit: PropTypes.bool
  };

  static defaultProps = {
    isEdit: false,
    tagTypes: []
  };

  constructor(props) {
    super(props);
    this.state = { selectedTagType: null };
  }

  handleChange = option => {
    this.setState({
      selectedTagType: option
    }, () => {
      this.props.change(this.props.form, 'type', option);
    });
  }

  render() {
    const { handleSubmit, onClose, isEdit, pristine, loading, invalid, tagTypes } = this.props;
    return (
      <Modal
        show
        onHide={onClose}
        style={{ display: 'block' }}
        backdrop="static"
        bsSize="md"
      >
        <Modal.Header className={`${styles.modal_header_color}`}>
          <Modal.Title>
            {isEdit ? i18n.t('UPDATE_TAG') : i18n.t('ADD_TAG')}
            <span
              role="button"
              tabIndex="-1"
              className="close_btn right no-outline"
              onClick={onClose}
            >
              <i className="fa fa-close" />
            </span>
          </Modal.Title>
        </Modal.Header>
        <form name="AddTagForm" onSubmit={handleSubmit}>
          <Modal.Body>
            <Field
              name="name"
              type="text"
              normalize={trimSpecialCharcters}
              component={Input}
              label="NAME"
              isRequired
              autoFocus
            />
            {!isEdit && <Field
              component={renderDropdownList}
              name="type"
              valueField="id"
              textField="name"
              handleOnChange={this.handleChange}
              data={tagTypes}
              selectedOption={this.state.selectedTagType}
              placeholder="SELECT_A_TAG_TYPE"
              label="TAG_TYPE"
              isRequired
            />}
          </Modal.Body>
          <Modal.Footer>
            <button
              className={`button-primary ${styles.expand_collapse_btn} ${styles.form_btn}`}
              type="submit"
              disabled={pristine || loading || invalid || (!isEdit && !this.state.selectedTagType)}
            >{isEdit ? i18n.t('UPDATE_TAG') : i18n.t('ADD_TAG')}</button>
            <button
              type="button"
              className={`button-secondary-hover ${styles.expand_collapse_btn} ${styles.form_btn}`}
              onClick={onClose}
            >Cancel</button>
          </Modal.Footer>
        </form>
      </Modal>

    );
  }
}
