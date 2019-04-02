import React, { Component } from 'react';
import { Modal, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { reduxForm, getFormValues, propTypes, FieldArray, SubmissionError } from 'redux-form';
import PropTypes from 'prop-types';
import { push as pushState } from 'react-router-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import InputBox from '../../components/FormComponents/InputBox';
import TextArea from '../../components/FormComponents/TextArea';
import renderFormItems from '../../components/PageComponents/ContactsForm';
import toastrErrorHandling from '../toastrErrorHandling';

import {
  saveCustomer,
  updateCustomer,
  loadCustomerById,
  checkCustomerName
} from '../../redux/modules/customers';
import { getCustomerFormConfig, formValidation } from '../../formConfig/SaveCustomer';
import { trimExtraSpaces } from '../../utils/validation';
import styles from './Customers.scss';
import i18n from '../../i18n';

@reduxForm({
  form: 'Contacts',
  validate: formValidation
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  customerSaved: state.customers.customerSaved,
  companies: state.openings.companyList,
  customerUpdated: state.customers.customerUpdated,
  openSaveCustomerModal: state.customers.openCustomerModal
}), {
  saveCustomer,
  updateCustomer,
  loadCustomerById,
  pushState,
  checkCustomerName
})
class SaveCustomer extends Component {
  static propTypes = {
    ...propTypes,
    loadClientCompanies: PropTypes.func.isRequired,
    saveCustomer: PropTypes.func.isRequired,
    customerSaved: PropTypes.bool.isRequired,
    openSaveCustomerModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    isEdit: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    loadCustomerById: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      currentView: 'OpeningInfo',
      initialParam: 'initial',
      numberOfContactsCount: 0
    };
  }

  closeModal = evt => {
    if (evt) {
      evt.stopPropagation();
      if (!this.props.pristine) {
        const toastrConfirmOptions = {
          onOk: () => this.props.closeModal(),
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
      } else {
        this.props.closeModal();
      }
    }
  }

  goBack = evt => {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.setState({
      currentView: 'OpeningInfo'
    });
  }

  saveCustomer = () => {
    const { initialValues } = this.props;
    let values = this.props.values;
    this.setState({
      currentView: this.state.currentView === 'OpeningInfo' ? 'ContactInfo' : 'OpeningInfo'
    }, () => {
      if (this.state.currentView !== 'ContactInfo') {
        if (initialValues && initialValues.id) {
          values = trimExtraSpaces(values);
          this.props.checkCustomerName(values).then(result => {
            if (result.isExist) {
              toastr.confirm(i18n.t('confirmMessage.COMPANY_NAME_ALREADY_EXISTS'), {
                onOk: () => {
                  this.props.updateCustomer(values).then(() => {
                    this.props.reset();
                    this.props.closeModal();
                    toastr.success(i18n.t('successMessage.UPDATED'),
                      i18n.t('successMessage.THE_CLIENT_COMPANY_HAS_BEEN_UPDATED_SUCCESSFULLY'));
                  }, err => {
                    toastrErrorHandling(err.error, i18n.t('ERROR'),
                      i18n.t('errorMessage.THE_CLIENT_COMPANY_COULD_NOT_BE_UPDATED._TRY_AGAIN'));
                  });
                },
                okText: i18n.t('YES'),
                cancelText: i18n.t('NO')
              });
            } else {
              this.props.updateCustomer(values).then(() => {
                this.props.reset();
                this.props.closeModal();
                toastr.success(i18n.t('successMessage.UPDATED'),
                  i18n.t('successMessage.THE_CLIENT_COMPANY_HAS_BEEN_UPDATED_SUCCESSFULLY'));
              }, err => {
                toastrErrorHandling(err.error, i18n.t('ERROR'),
                  i18n.t('errorMessage.THE_CLIENT_COMPANY_COULD_NOT_BE_UPDATED._TRY_AGAIN'));
              });
            }
          });
        } else {
          this.saveNewCustomer();
        }
      }
    });
  }

  saveNewCustomer = () => {
    if (this.state.currentView !== 'ContactInfo') {
      let values = this.props.values;
      values = trimExtraSpaces(values);
      this.props.checkCustomerName(values).then(result => {
        if (result.isExist) {
          toastr.confirm(i18n.t('confirmMessage.COMPANY_NAME_ALREADY_EXISTS'), {
            onOk: () => {
              this.props.saveCustomer(values).then(() => {
                toastr.success(i18n.t('successMessage.UPDATED'),
                  i18n.t('successMessage.THE_CLIENT_COMPANY_HAS_BEEN_SAVED_SUCCESSFULLY'));
                this.props.reset();
                this.props.closeModal();
              }, err => {
                toastrErrorHandling(err.error, i18n.t('ERROR'),
                  i18n.t('errorMessage.THE_CLIENT_COMPANY_COULD_NOT_BE_SAVED._TRY_AGAIN'));
              });
            },
            okText: i18n.t('YES'),
            cancelText: i18n.t('NO')
          });
        } else {
          this.props.saveCustomer(values).then(() => {
            toastr.success(i18n.t('successMessage.UPDATED'),
              i18n.t('successMessage.THE_CLIENT_COMPANY_HAS_BEEN_SAVED_SUCCESSFULLY'));
            this.props.reset();
            this.props.closeModal();
          }, err => {
            toastrErrorHandling(err.error, i18n.t('ERROR'),
              i18n.t('errorMessage.THE_CLIENT_COMPANY_COULD_NOT_BE_SAVED._TRY_AGAIN'));
          });
        }
      });
    }
  }

  validate = values => {
    if (this.state.currentView === 'OpeningInfo') {
      if (!values.name) {
        return false;
      }
      this.saveCustomer(values);
    } else if (values.contacts && values.contacts.length) {
      values.contacts.forEach(contact => {
        if (!contact.name) {
          return false;
        }
        if (!contact.email || !contact.contactNumber) {
          throw new SubmissionError({
            name: 'Required',
            _error: 'Login failed!'
          });
        }
      });
      this.saveCustomer(values);
    }
  }
  isFormFieldsEmpty = values => {
    let isAllEmpty = false;
    if (values) {
      if (!values.name || (values.name && values.name.trim().length === 0)) {
        isAllEmpty = true;
      }
      if (!values.city || (values.city && values.city.trim().length === 0)) {
        isAllEmpty = true;
      }
      if (!values.country || (values.country && values.country.trim().length === 0)) {
        isAllEmpty = true;
      }
    }
    return isAllEmpty;
  }

  render() {
    const { currentView } = this.state;
    const { isEdit, handleSubmit, pristine, submitting, values } = this.props;
    const filterConfig = getCustomerFormConfig(this);
    const formFieldsEmpty = this.isFormFieldsEmpty(values);
    return (
      <div>
        <Modal
          show={this.props.openSaveCustomerModal}
          onHide={this.closeModal}
          className={styles.save_new_customer}
          style={{ display: 'block' }}
        >
          <form onSubmit={handleSubmit(this.saveCustomer)}>
            <Modal.Header className={`${styles.modal_header}`}>
              <Modal.Title>
                <Row className="clearfix">
                  <Col sm={12}>
                    <span className={`${styles.modal_heading}`}>
                      {`${isEdit ? 'Edit' : 'Add'}`} Client Company
                    </span>
                    <span
                      className={`${styles.close_btn} right`}
                      onClick={this.closeModal}
                      role="button"
                      tabIndex="0"
                    >
                      <i className="fa fa-close" />
                    </span>
                  </Col>
                </Row>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ overflowX: 'hidden', overflowY: 'auto', padding: '15px' }}>
              <Scrollbars
                universal
                renderThumbHorizontal={props => <div {...props} className="hide" />}
                renderView={props =>
                  <div {...props} className={`${styles.scroll_bar_body} ${styles.scroll_overflow}`} />}
                className={`${styles.save_customer_scroll}`}
              >
                {
                  currentView !== 'ContactInfo' ?
                    <Row className={`${styles.modal_body} ${styles.filter}`}>
                      <Col sm={12} className="m-t-10 p-r-30">
                        <InputBox {...filterConfig.name} />
                      </Col>
                      <Col sm={6} className="m-t-10 p-r-30">
                        <InputBox {...filterConfig.domain} />
                      </Col>
                      <Col sm={6} className="m-t-10 m-b-5 p-r-30">
                        <InputBox {...filterConfig.linkedinurl} />
                      </Col>
                      <Col sm={12} className="m-t-10 p-r-30">
                        <TextArea {...filterConfig.description} />
                      </Col>
                      <Col sm={12} className="m-t-10 m-b-5 p-r-30">
                        <InputBox {...filterConfig.address} />
                      </Col>
                      <Col sm={6} className="m-t-10 mi-h-85">
                        <InputBox {...filterConfig.city} />
                      </Col>
                      <Col sm={6} className="m-t-10 p-r-30 mi-h-85">
                        <InputBox {...filterConfig.state} />
                      </Col>
                      <Col sm={6} className="m-t-10 m-b-20 mi-h-85">
                        <InputBox {...filterConfig.country} />
                      </Col>
                      <Col sm={6} className="m-t-10 m-b-20 p-r-30 mi-h-85">
                        <InputBox {...filterConfig.pincode} />
                      </Col>
                    </Row>
                    :
                    <Row>
                      <div>
                        {isEdit ?
                          <FieldArray component={renderFormItems} companyId={values.id} name="contacts" />
                          :
                          <FieldArray component={renderFormItems} name="contacts" />
                        }
                      </div >
                    </Row>
                }
              </Scrollbars>
            </Modal.Body>
            <Modal.Footer>
              {
                currentView === 'ContactInfo' ?
                  <Col sm={12}>
                    <Col sm={10} smOffset={2} className="m-t-10">
                      <Col lg={4} lgOffset={4} sm={12} className="p-5">
                        <button
                          className={`btn btn-border orange-btn ${styles.client_btn}`}
                          type="button"
                          onClick={this.goBack}
                        >
                          <span><i className="fa fa-arrow-left" aria-hidden="true" />Back</span>
                        </button>
                      </Col>
                      <Col lg={4} sm={12} className="p-5">
                        <button
                          className={`btn btn-border orange-btn ${styles.client_btn}`}
                          type="submit"
                          disabled={(pristine && !isEdit) || (submitting && !isEdit)}
                        > {
                            isEdit ?
                              <span> Update Company </span>
                              :
                              <span> Add Company </span>
                          }
                        </button>
                      </Col>
                    </Col>
                  </Col> : <Col sm={12}>
                    <Col sm={7} smOffset={5} className="m-t-10">
                      <Col lg={6} lgOffset={6} sm={12} className="p-5">
                        <button
                          className={`btn btn-border orange-btn ${styles.client_btn}`}
                          type="submit"
                          disabled={(pristine && !isEdit) || (submitting && !isEdit) || formFieldsEmpty}
                        >
                          <span><i className="fa fa-arrow-right" aria-hidden="true" />Next</span>
                        </button>
                      </Col>
                    </Col>
                  </Col>
              }
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}


export default SaveCustomer;
