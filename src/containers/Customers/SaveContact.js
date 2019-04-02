import React, { Component } from 'react';
import { Fade, Row, Col, Image } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, Field } from 'redux-form';
import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { toastr } from 'react-redux-toastr';
import { trimTrailingSpace, restrictMaxLength } from 'utils/validation';
import DropdownField from '../../components/FormComponents/DropdownList';
import styles from './Companies.scss';
import ContactValidation from './ContactValidation';
import i18n from '../../i18n';
// import CheckBox from '../../components/FormComponents/CheckBox';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

const salutation = {
  label: 'SALUTATION',
  name: 'salutation',
  valueField: 'id',
  textField: 'name',
  placeholder: 'ENTER_THE_SALUTATION_OF_THE_CONTACT',
  data: [
    { id: 1, name: 'Mr.' },
    { id: 2, name: 'Mrs.' },
    { id: 3, name: 'Ms.' },
    { id: 4, name: 'Miss' },
    { id: 6, name: 'Herr' },
    { id: 7, name: 'Frau' },
    { id: 8, name: 'Dr.' }
  ],
  isFilter: false,
  dropUp: false,
  isRequired: true,
};
const isEmpty = value => value === undefined || value === null || value === '' || value.length === 0;
const required = value => value ? undefined : i18n.t('validationMessage.REQUIRED');
const valid = value => value ? undefined || value.length < 2 : i18n.t('validationMessage.REQUIRED');
const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(lodash.trim(value)) ?
    i18n.t('validationMessage.INVALID_EMAIL_ADDRESS') : undefined;
const isMobileNumber = value => {
  if (!isEmpty(value) && !/^[0-9\s-()+]*$/i.test(lodash.trim(value))) {
    return i18n.t('validationMessage.MUST_BE_A_NUMBER');
  }
  if (value && value.length > 20) {
    return i18n.t('validationMessage.NUMBER_MUST_BE_LESS_THAN_OR_EQUAL_TO_20_DIGITS');
  }
};

const renderFormField = ({
  input,
  label,
  type,
  placeholder,
  className,
  meta: { touched, error },
  isRequired,
  showLength,
  autoComplete
}) =>
  (<div>
    <div className="m-t-10">
      <label htmlFor={input.name}>
        <Trans>{label}</Trans>{isRequired && <span className="required_color">*</span>}
      </label>
      <div>
        <div className="m-t-5">
          <input
            {...input}
            type={type}
            className={className}
            id={input.name}
            placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
            autoComplete={autoComplete ? 'off' : ''}
          />
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
  showLength: PropTypes.bool,
  isRequired: PropTypes.bool,
  input: PropTypes.object,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
  className: PropTypes.string,
  autoComplete: PropTypes.bool
};

renderFormField.defaultProps = {
  showLength: false,
  isRequired: false,
  input: {},
  label: '',
  type: '',
  placeholder: '',
  meta: {},
  className: '',
  autoComplete: true
};

@reduxForm({
  form: 'SaveContact',
  validate: ContactValidation
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  formData: state.form.SaveContact
}), {})
export default class SaveContact extends Component {
  static propTypes = {
    values: PropTypes.object,
    formData: PropTypes.object,
    saveContact: PropTypes.func,
    changeContactView: PropTypes.func,
    companyContacts: PropTypes.array,
    initialize: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    reset: PropTypes.func,
    invalid: PropTypes.bool,
    initialContactValues: PropTypes.object,
  };

  static defaultProps = {
    values: {},
    formData: {},
    initialContactValues: {},
    companyContacts: [],
    saveContact: null,
    changeContactView: null,
    isOpen: false,
    pristine: false,
    submitting: false,
    reset: null,
    invalid: false
  };

  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
      ispropsSet: false,
      isSave: false,
      isClose: false,
      isEdit: false,
      initialValue: { ...props.values },
    };
  }
  componentWillMount() {
    const { initialContactValues } = this.props;
    if (initialContactValues && initialContactValues.id) {
      this.setState({
        isEdit: true
      });
      this.props.initialize({
        id: initialContactValues.id,
        isRandomId: initialContactValues.isRandomId,
        email: initialContactValues.email,
        firstName: initialContactValues.firstName,
        lastName: initialContactValues.lastName,
        jobTitle: initialContactValues.jobTitle,
        landlineNumber: initialContactValues.landlineNumber,
        phoneNumber: initialContactValues.phoneNumber,
        salutation: initialContactValues.salutation,
        middleName: initialContactValues.middleName
      });
    }
  }


  saveCompanyContact = evt => {
    if (evt) {
      evt.preventDefault();
    }
    const { companyContacts, values, reset } = this.props;
    let duplicateEmails = false;
    values.email = lodash.trim(values.email);
    values.firstName = lodash.trim(values.firstName);
    values.lastName = lodash.trim(values.lastName);
    values.jobTitle = lodash.trim(values.jobTitle);
    values.middleName = lodash.trim(values.middleName);
    values.phoneNumber = lodash.trim(values.phoneNumber);
    values.landlineNumber = lodash.trim(values.landlineNumber);
    if (!values.id) {
      duplicateEmails = companyContacts.some(contact =>
        contact.email.toLowerCase() === values.email.toLowerCase());
    } else {
      const contacts = lodash.filter(companyContacts, contact => contact.id !== values.id);
      duplicateEmails = contacts.some(contact => contact.email.toLowerCase() === values.email.toLowerCase());
    }
    if (duplicateEmails) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.DUPLICATE_EMAIL'),
        i18n.t('errorMessage.ONE_OF_THE_CONTACTS_IN_THE_COMPANY_ALREADY_HAS_THE_SAME_EMAIL_ID'));
    } else {
      reset();
      this.setState({
        ispropsSet: false,
        isSave: true,
        isClose: true
      });
      this.props.saveContact(values);
      this.props.changeContactView();
    }
  }

  closeModal = evt => {
    const { values, formData } = this.props;
    // const { initialValue } = this.state;
    this.setState({
      ispropsSet: false,
      isClose: true,
      isSave: true
    });
    if (evt) {
      evt.preventDefault();
      if (values && (Object.keys(values)).length >= 1 && !(lodash.isEqual(formData.initial, values))) {
        const toastrConfirmOptions = {
          onOk: () => { this.props.changeContactView(evt); this.props.reset(); },
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
      } else {
        this.props.changeContactView(evt);
        this.props.reset();
      }
    }
  }

  render() {
    const { isOpen, pristine, submitting, invalid } = this.props;
    return (
      <div>
        {
          isOpen ?
            <Fade in={isOpen} className={styles.contact_form_section}>
              <Row className={styles.overlay}>
                <div className={styles.content}>
                  <div className={styles.close_icon}>
                    <Image
                      src="/close.png"
                      responsive
                      onClick={evt => { this.closeModal(evt); }}
                    />
                  </div>
                  {
                    this.state.isEdit ?
                      <h3> <Trans>EDIT_CONTACT</Trans> </h3>
                      :
                      <h3> <Trans>ADD_NEW_CONTACT</Trans> </h3>
                  }

                  <form className="form-horizontal right" onSubmit={evt => { this.saveCompanyContact(evt); }}>
                    <Scrollbars
                      universal
                      autoHeight
                      autoHeightMin={'calc(100vh - 150px)'}
                      autoHeightMax={'calc(100vh - 150px)'}
                      renderThumbHorizontal={props => <div {...props} className="hide" />}
                      renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
                    >
                      <Col lg={12} sm={12} xs={12} className="m-t-10">
                        <DropdownField {...salutation} />
                      </Col>
                      <Col lg={12} sm={12} xs={12} className="p-r-10 m-t-10">
                        <Field
                          component={renderFormField}
                          label="FIRST_NAME"
                          name="firstName"
                          type="text"
                          placeholder="ENTER_THE_FIRST_NAME"
                          validate={required}
                          isRequired
                          format={trimTrailingSpace}
                          normalize={restrictMaxLength(50)}
                        />
                      </Col>
                      <Col lg={6} sm={6} xs={12} className="m-t-10">
                        <Field
                          component={renderFormField}
                          label="MIDDLE_NAME"
                          name="middleName"
                          type="text"
                          placeholder="ENTER_THE_MIDDLE_NAME"
                          format={trimTrailingSpace}
                          normalize={restrictMaxLength(50)}
                        />
                      </Col>
                      <Col lg={6} sm={6} xs={12} className="m-t-10">
                        <Field
                          component={renderFormField}
                          label="LAST_NAME"
                          name="lastName"
                          type="text"
                          placeholder="ENTER_THE_LAST_NAME"
                          validate={required}
                          isRequired
                          format={trimTrailingSpace}
                          normalize={restrictMaxLength(50)}
                        />
                      </Col>
                      <Col lg={12} sm={12} xs={12} className="m-t-10">
                        <Field
                          component={renderFormField}
                          label="TITLE"
                          name="jobTitle"
                          type="text"
                          placeholder="ENTER_THE_ROLE/DESIGNATION_OF_THE_CONTACT"
                          validate={required}
                          isRequired
                          format={trimTrailingSpace}
                        />
                      </Col>
                      <Col lg={12} sm={12} xs={12} className="m-t-10">
                        <Field
                          component={renderFormField}
                          label="EMAIL"
                          name="email"
                          placeholder="ENTER_THE_EMAIL_ADDRESS_OF_THE_CONTACT"
                          type="text"
                          validate={[valid, email]}
                          isRequired
                          format={trimTrailingSpace}
                        />
                      </Col>
                      <Col lg={12} sm={12} xs={12} className="m-t-10 m-b-15">
                        <Field
                          component={renderFormField}
                          label="PHONE"
                          name="phoneNumber"
                          type="text"
                          placeholder="ENTER_THE_PHONE_NUMBER_OF_THE_CONTACT"
                          validate={[isMobileNumber]}
                          // isRequired="true"
                          format={trimTrailingSpace}
                          autoComplete
                        />
                      </Col>
                      <Col lg={12} sm={12} xs={12} className={`m-t-10 m-b-25 ${styles.p_b_60}`}>
                        <Field
                          component={renderFormField}
                          label="LAND_LINE_NUMBER"
                          name="landlineNumber"
                          type="text"
                          placeholder="ENTER_THE_PHONE_NUMBER_OF_THE_CONTACT"
                          validate={[isMobileNumber]}
                          // isRequired="true"
                          format={trimTrailingSpace}
                          autoComplete
                        />
                      </Col>
                    </Scrollbars>
                    <Col lg={12} md={12} sm={12} xs={12} className={`${styles.btn_section} p-0 p-t-15 p-b-15`}>
                      <Col lg={6} md={6} sm={6} xs={6}>
                        <button
                          className={`${styles.close_btn} left btn btn-border`}
                          type="button"
                          onClick={evt => { this.closeModal(evt); }}
                        > <span> <Trans>CLOSE</Trans> </span>
                        </button>
                      </Col>
                      <Col lg={6} md={6} sm={6} xs={6}>
                        <button
                          className="btn orange-btn"
                          type="submit"
                          disabled={pristine || submitting || invalid}
                        >
                          {
                            this.state.isEdit ?
                              <span> <Trans>UPDATE_CONTACT</Trans></span>
                              :
                              <span> <Trans>ADD_NEW_CONTACT</Trans> </span>
                          }
                        </button>
                      </Col>
                    </Col>
                  </form>

                </div>
              </Row>
            </Fade> : null
        }
      </div>
    );
  }
}
