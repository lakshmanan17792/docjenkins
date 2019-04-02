import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import openSocket from 'socket.io-client';
import { toastr } from 'react-redux-toastr';
import { Col, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './Companies.scss';
import Constants from './../../helpers/Constants';
import NewPermissible from '../../components/Permissible/NewPermissible';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';
import { checkIfContactAssociated, deleteCompanyContact } from '../../redux/modules/customers';
import ContactAssociations from './ContactAssociations';

let timeoutId = 0;
@connect(state => ({
  contactAssociations: state.customers.contactAssociations
}), { checkIfContactAssociated, deleteCompanyContact })
export default class CompanyContacts extends Component {
  static propTypes = {
    company: PropTypes.object,
    changeContactView: PropTypes.func.isRequired,
    contacts: PropTypes.array,
    user: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    checkIfContactAssociated: PropTypes.func.isRequired,
    deleteCompanyContact: PropTypes.func.isRequired,
    loadCompany: PropTypes.func.isRequired,
    contactAssociations: PropTypes.object.isRequired
  };
  static defaultProps = {
    company: null,
    loading: false,
    contacts: []
  }
  constructor(props) {
    super(props);
    this.state = {
      isContactAssociationOpen: false,
      selectedContactId: null
    };
  }

  componentWillMount() {
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT', model: 'customer' });
    const isEditMePermitted = NewPermissible.isPermitted({ operation: 'EDIT_ME', model: 'customer' });
    this.setState({
      isEditPermitted,
      isEditMePermitted
    });
  }

  componentDidMount() {
    const socket = openSocket(
      `${window.location.protocol}//${window.location.hostname}:${Constants.PORT}`,
      { reconnectionAttempts: 5 }
    );
    /**
    * perform actions that has to be done
    * while connecting to the socket
    */
    socket.on('connect', () => {
      const id = localStorage ? localStorage.getItem('authToken') : null;
      const userId = localStorage ? localStorage.getItem('currentUserId') : null;
      // initially disconnect for
      socket.emit('authentication', { id, userId });
      socket.on('authenticated', () => {
        console.log('user authenticated');
      });
    });

    const id = localStorage ? localStorage.getItem('authToken') : null;
    const userId = localStorage ? localStorage.getItem('currentUserId') : null;
    // authorize socket
    socket.emit('authentication', { id, userId });
    socket.on(`${Constants.CUSTOMER_CONTACT}`, () => {
      if (localStorage.getItem('selectedContactId')) {
        this.checkForAssociationsAndRemoveSelectedContact();
      }
    });
    socket.on(`${Constants.CUSTOMER_CONTACT_TASKS}`, () => {
      if (localStorage.getItem('selectedContactId')) {
        this.checkForAssociationsAndRemoveSelectedContact();
      }
    });
  }

  componentWillUnmount() {
    if (localStorage.getItem('selectedContactId')) {
      localStorage.removeItem('selectedContactId');
    }
  }

  getEditPermission = company => {
    const { isEditMePermitted, isEditPermitted } = this.state;
    const { user } = this.props;
    let isPermitted = false;
    if (isEditPermitted) {
      isPermitted = true;
    } else if (isEditMePermitted && (company && company.createdBy) === (user && user.id)) {
      isPermitted = true;
    }
    return isPermitted;
  }

  checkForAssociationsAndRemoveSelectedContact = () => {
    this.props.checkIfContactAssociated(localStorage.getItem('selectedContactId'));
    if (!this.state.isContactAssociationOpen) {
      localStorage.removeItem('selectedContactId');
    }
  }

  editContact = contact => {
    this.props.changeContactView(undefined, contact);
  }

  deleteContact = contact => {
    // const { company } = this.props;
    this.props.checkIfContactAssociated(contact.id).then(response => {
      if (!response.canDeleteContact) {
        localStorage.setItem('selectedContactId', contact.id);
        this.toggleContactAssociationModal();
      } else {
        const toastrConfirmOptions = {
          onOk: () => {
            this.confirmDeleteContact(contact.id);
          },
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DELETE'),
          toastrConfirmOptions);
      }
    });
  }

  confirmDeleteContact = contactId => {
    const { company } = this.props;
    this.props.deleteCompanyContact({
      companyId: company.id,
      contactId
    }).then(res => {
      toastr.success('', res);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.props.loadCompany(company.id);
      }, 500);
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_DELETE_COMPANY_CONTACT'));
      }
    });
  }

  toggleContactAssociationModal = () => {
    this.setState({
      isContactAssociationOpen: !this.state.isContactAssociationOpen
    }, () => {
      if (!this.state.isContactAssociationOpen) {
        localStorage.removeItem('selectedContactId');
      }
    });
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className="no_results_found" lg={12} sm={12}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className="sub_head m-0"><div><Trans>THERE_ARE_NO_CONTACTS_FOR_COMPANY</Trans></div></Row>
      </Col>
    );
    const loadingContent = (
      <Col className="no_results_found" lg={12} sm={12}>
        <Row className="sub_head m-0"><div><Trans>Loading</Trans></div></Row>
      </Col>
    );
    if (this.props.loading) {
      return loadingContent;
    }
    return NoResultsFound;
  }

  renderTooltip = content => {
    if (content) {
      return (
        <Tooltip id={'tooltip'}>
          <strong style={{ textTransform: 'capitalize' }}>{content}</strong>
        </Tooltip>
      );
    }
    return <div />;
  }

  render() {
    const { company, contacts, changeContactView, contactAssociations } = this.props;
    const { isContactAssociationOpen } = this.state;
    return (
      <div className={styles.contacts_section}>
        <Row className="p-l-0 p-r-0">
          <Col lg={9} md={9} xs={6}>
            <span className={styles.contact_count}><Trans>CONTACTS</Trans> <Trans>IN</Trans> {company.name}
              <span>( {contacts.length} <Trans>CONTACT(S)</Trans> )</span>
            </span>
          </Col>
          <Col lg={3} md={3} xs={6} className="p-l-30">
            <NewPermissible operation={{ operation: 'CREATE_COMPANY', model: 'customer' }}>
              <button
                className={`${styles.add_edit_btns} button-primary`}
                onClick={changeContactView}
                type="button"
              >
                <span className={styles.btn_text}>
                  <Trans>ADD_NEW_CONTACT</Trans>
                </span>
              </button>
            </NewPermissible>
          </Col>
        </Row>
        {
          contacts && contacts.length > 0 ?
            <Row className="p-t-20 p-l-0 p-r-0">
              {
                contacts.map(contact => (
                  <Col
                    lg={12}
                    md={12}
                    xs={12}
                    className="p-t-5 p-b-5 p-l-0"
                    style={{ borderBottom: '1px solid #e2e5e8' }}
                  >
                    <Col
                      lg={9}
                      md={9}
                      xs={9}
                      className={`p-0 p-t-10 ${styles.contact_details}`}
                    >
                      <div>
                        <div className={styles.contact_logo}>
                          {contact.firstName.charAt(0).toUpperCase()}{contact.lastName.charAt(0).toUpperCase()
                            || ''}
                        </div>
                        <div className={styles.personal_info}>
                          <OverlayTrigger
                            rootClose
                            overlay={this.renderTooltip(
                              contact.middleName ?
                                `${contact.firstName} ${contact.middleName} ${contact.lastName}` :
                                `${contact.firstName} ${contact.lastName}`
                            )}
                            placement="bottom"
                          >
                            <div>
                              {
                                contact.middleName ?
                                  <span>{contact.firstName} {contact.middleName} {contact.lastName} </span>
                                  :
                                  <span>{contact.firstName} {contact.lastName} </span>
                              }
                            </div>
                          </OverlayTrigger>
                          <OverlayTrigger
                            rootClose
                            overlay={this.renderTooltip(contact.jobTitle)}
                            placement="bottom"
                          >
                            <span>{contact.jobTitle}</span>
                          </OverlayTrigger>
                        </div>
                      </div>
                      <div>
                        <OverlayTrigger
                          rootClose
                          overlay={this.renderTooltip(contact.email)}
                          placement="bottom"
                        >
                          <span>
                            <img
                              src={'../socialIcons/mail.svg'}
                              alt="Mail Icon"
                              role="presentation"
                              className={styles.contactIcon}
                            />
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                          </span>
                        </OverlayTrigger>
                      </div>
                      <div>
                        <OverlayTrigger
                          rootClose
                          overlay={this.renderTooltip(contact.phoneNumber ||
                            contact.landlineNumber || i18n.t('NOT_AVAILABLE'))}
                          placement="bottom"
                        >
                          <span>
                            <img
                              src={'../socialIcons/phone-outgoing.svg'}
                              alt="Phone Icon"
                              role="presentation"
                              className={styles.contactIcon}
                            />
                            {contact.phoneNumber || contact.landlineNumber || i18n.t('NOT_AVAILABLE')}
                          </span>
                        </OverlayTrigger>
                      </div>
                    </Col>
                    <Col lg={3} md={3} xs={3} className="p-l-0 p-r-0 p-t-10 p-b-10">
                      <NewPermissible operation={{ operation: 'DELETE_COMPANY_CONTACT', model: 'customer' }}>
                        {
                          (typeof contact.id !== 'string') &&
                          <button
                            className={`${styles.add_contact_btn} button-error-hover`}
                            type="button"
                            onClick={() => this.deleteContact(contact)}
                          >
                            <span><Trans>DELETE</Trans></span>
                          </button>
                        }
                      </NewPermissible>
                      {this.getEditPermission(company) && <button
                        className={`${styles.add_contact_btn} button-secondary-hover m-r-10`}
                        type="button"
                        onClick={() => this.editContact(contact)}
                      >
                        <span><Trans>EDIT</Trans></span>
                      </button>}
                    </Col>
                  </Col>
                ))
              }
            </Row> : this.renderNoResultsFound()
        }
        {
          isContactAssociationOpen &&
            <ContactAssociations
              jobOpenings={contactAssociations.jobOpenings}
              tasks={contactAssociations.tasks}
              toggleAssociationModal={this.toggleContactAssociationModal}
            />
        }
      </div>
    );
  }
}
