import React, { Component } from 'react';
import { Col, Row, Tab, Tabs } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Link } from 'react-router';
import { Trans } from 'react-i18next';
import { push as pushState } from 'react-router-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import Loader from '../../components/Loader';
import EditCustomer from './SaveCompany';
import { formValidation } from '../../formConfig/SaveCustomer';
import {
  closeEditCustomerModal,
  openEditCustomerModal,
  loadCustomerById
} from '../../redux/modules/customers';
import { formatDomainName } from '../../utils/validation';
import styles from './Customers.scss';
import UserRole from './../../helpers/UserRole';
import i18n from '../../i18n';

const providers = {
  userRole: new UserRole()
};

@connect((state, route) => ({
  companyId: route.params.id,
  loading: state.customers.loading,
  initialValues: state.customers.selectedClientCompany
}), { pushState, loadCustomerById, closeEditCustomerModal, openEditCustomerModal })

export default class ViewCustomer extends Component {
  static propTypes = {
    loadCustomerById: PropTypes.func.isRequired,
    openEditCustomerModal: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    companyId: PropTypes.any.isRequired,
    closeEditCustomerModal: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    pushState: PropTypes.func.isRequired
  }

  static defaultProps = {
    initialValues: null
  }

  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      isEdit: false,
      additionalContacts: []
    };
  }


  componentDidMount() {
    // if (this.props.initialValues) {
    this.loadCustomer();
    // }
  }

  componentWillReceiveProps(nextProps) {
    this.fetchAdditionalContacts(nextProps.initialValues);
  }

  loadCustomer = () => {
    this.props.loadCustomerById(this.props.companyId, {
      include: [{
        relation: 'user',
        scope: {
          fields: ['firstName', 'lastName']
        }
      },
      {
        relation: 'contacts',
        scope: {
          fields: ['id', 'firstName', 'lastName', 'jobTitle', 'contactNumber', 'email']
        }
      }]
    }).then(() => {
      const { initialValues } = this.props;
      if (initialValues && initialValues.contacts) {
        this.fetchAdditionalContacts(initialValues);
      }
    });
  }
  closeModal = () => {
    this.setState({
      openModal: false,
      isEdit: false
    });
    this.props.closeEditCustomerModal();
    // this.loadCustomer();
  }

  openEditCustomerModal = () => {
    if (this.props.initialValues) {
      this.setState({
        openModal: true,
        isEdit: true
      }, () => {
        this.props.openEditCustomerModal();
      });
    }
  }

  fetchAdditionalContacts = initialValues => {
    if (initialValues) {
      const arr = [...initialValues.contacts];
      const contacts = arr.splice(1);
      this.setState({ additionalContacts: contacts });
    }
  }

  redirectToMyOpenings = companyId => {
    this.props.pushState({ pathname: '/Openings', query: { companyId } });
  }
  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_CUSTOMERS_FOUND</Trans></div></Row>
        <Row className={`${styles.empty_message} m-0`}>
          <div><Trans>TRY_AGAIN_LATER</Trans></div>
        </Row>
      </Col>
    );
    return NoResultsFound;
  }

  render() {
    const { initialValues, loading, companyId } = this.props;
    const { additionalContacts, openModal, isEdit } = this.state;
    return (
      <div className="p-10">
        <Scrollbars
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(100vh - 100px)'}
          autoHeightMax={'calc(100vh - 100px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className="customScroll" />}
        >
          {initialValues ?
            <Col className={styles.view_customer}>
              <Tabs defaultActiveKey={1} className={`${styles.tab_section}`} id="viewCustomerTabs">
                <Tab eventKey={1} title={i18n.t('OVERVIEW')}>
                  <Scrollbars
                    universal
                    autoHide
                    autoHeight
                    autoHeightMin={'calc(100vh - 150px)'}
                    autoHeightMax={'calc(100vh - 150px)'}
                    renderThumbHorizontal={props => <div {...props} className="hide" />}
                    renderView={props => <div {...props} className="customScroll" />}
                  >
                    <div className={styles.company_container} >
                      <Col sm={12}>
                        <Col sm={9} xs={8}>
                          <div className={`${styles.company_name}`}>
                            {initialValues.name}
                          </div>
                        </Col>
                        {
                          providers.userRole.getPathPermission('AddEditCompany') ?
                            <Col sm={3} xs={4} className={`${styles.cust_btn_group} right`}>
                              <Link to={`/Company/${companyId}`}>
                                <button
                                  id={initialValues.id}
                                  className="btn btn-border filter-btn m-t-10 m-b-10"
                                  type="button"
                                  // onClick={() => this.openEditCustomerModal()}
                                >
                                  <span className={`${styles.btn_text}`}>
                                    <i
                                      className="fa fa-pencil-square-o"
                                      aria-hidden="true"
                                    />
                                  Edit Company
                                  </span>
                                </button>
                              </Link>
                            </Col>
                            : null
                        }
                        <Col sm={3} xs={4} className={`${styles.cust_icon_group} right`}>
                          <span className={`${styles.btn_text}`}>
                            {
                              providers.userRole.getPathPermission('AddEditCompany') ?
                                <i
                                  className="fa fa-pencil-square-o"
                                  title={i18n.t('tooltipMessage.EDIT_COMPANY')}
                                  aria-hidden="true"
                                  onClick={() => this.openEditCustomerModal(initialValues.id)}
                                />
                                : null
                            }
                            <i
                              className="fa fa-desktop"
                              title={i18n.t('tooltipMessage.VIEW_OPENINGS')}
                              aria-hidden="true"
                              onClick={() => this.redirectToMyOpenings(initialValues.id)}
                            />
                          </span>
                        </Col>
                        <Col sm={9} xs={12}>
                          <Col sm={6} xs={8} className="p-0">
                            <div className={`${styles.industry} m-t-10`}>
                              <div>{initialValues.address ? initialValues.address : ''}</div>
                              <div>{initialValues.pincode ? initialValues.pincode : ''}</div>
                            </div>
                            <div className={`${styles.industry} m-t-10`}>
                              <i className="fa fa-map-marker p-r-5" />
                              {initialValues.state ? initialValues.state : 'Not Available'}
                            </div>
                            {initialValues.domain &&
                            <div className={`${styles.company_domain} m-t-10`}>
                              <Link to={`http://${formatDomainName(initialValues.domain)}`} target="_blank">
                                {initialValues.domain}
                              </Link>
                            </div>
                            }
                            {initialValues.linkedinurl &&
                            <div className={`${styles.linkedinurl} m-t-10`} title={initialValues.linkedinurl}>
                              <Link to={`http://${formatDomainName(initialValues.linkedinurl)}`} target="_blank">
                                LinkedIn
                                <i className="fa fa-share-square-o p-l-5" aria-hidden="true" />
                              </Link>
                            </div>
                            }
                          </Col>
                          {initialValues.contacts && initialValues.contacts[0] &&
                          <Col sm={6} xs={12} className={`${styles.break_word}`}>
                            <div className={`${styles.contact_heading} m-t-10 m-b-10`}>Primary Contact</div>
                            <div className={`${styles.contact_name} m-b-5`}>
                              {`${initialValues.contacts[0].firstName}
                               ${initialValues.contacts[0].lastName ? initialValues.contacts[0].lastName : ''}`}</div>
                            <div className={`${styles.contact_position} m-b-10`}>
                              {initialValues.contacts[0].jobTitle}
                            </div>
                            <div className={`${styles.contact_number} m-b-10`}>
                              <i className="fa fa-phone p-r-5" aria-hidden="true" />
                              {initialValues.contacts[0].contactNumber}
                            </div>
                            <div className={`${styles.contact_number} m-b-5`}>
                              <i className="fa fa-envelope p-r-5" aria-hidden="true" />
                              {initialValues.contacts[0].email}
                            </div>
                          </Col>
                          }
                        </Col>
                        <Col sm={3} xs={4} className={`${styles.cust_btn_group} right`}>
                          <button
                            id={initialValues.id}
                            className="btn btn-border filter-btn m-t-10 m-b-10"
                            type="button"
                            onClick={() => this.redirectToMyOpenings(initialValues.id)}
                          >
                            <span className={`${styles.btn_text}`}>
                              <i
                                className="fa fa-desktop"
                                aria-hidden="true"
                              />
                            View Openings
                            </span>
                          </button>
                        </Col>
                      </Col>
                      <Col sm={9} xs={12}>
                        <Col sm={12} xs={12} className={`${styles.border_shade} ${styles.border_top} m-t-10`}>
                          <div className={`${styles.contact_heading} m-l-15`}>
                          Company Description
                            <div className={`m-t-10 ${styles.description}`}>
                              {initialValues.description ? initialValues.description : 'Description Not Available'}
                            </div>
                          </div>
                        </Col>
                        {additionalContacts && additionalContacts.length > 0 &&
                        <Col sm={12} xs={12} className={`${styles.contact_sec_border_shade}`}>
                          <div className={`${styles.contact_heading}`}>
                            Additional Contacts
                          </div>
                          {additionalContacts.map(data => (
                            <Col sm={4} xs={4} className="p-0 p-t-10">
                              <div className={`${styles.contact_heading}`}>
                                <div className={`${styles.contact_name} m-b-5`}>
                                  {`${data.firstName} ${data.lastName ? data.lastName : ''}`}</div>
                                <div className={`${styles.contact_position} m-b-10`}>{data.jobTitle}</div>
                                <div className={`${styles.contact_number} m-b-10`}>
                                  <i className="fa fa-phone p-r-5" aria-hidden="true" />
                                  {data.contactNumber}
                                </div>
                                <div className={`${styles.contact_number} m-b-10`}>
                                  <i className="fa fa-envelope p-r-5" aria-hidden="true" />
                                  {data.email}
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Col>
                        }
                      </Col>
                      <Col sm={9} xs={12}>
                        {(initialValues.user || initialValues.createdAt) &&
                        <Col sm={12} className={`${styles.border_shade}`}>
                          {initialValues.user &&
                            <Col sm={6}>
                              <span className={`${styles.contact_heading}`}>
                                Created By:
                              </span>
                              <span className={`p-l-10 ${styles.contact_content}`} >
                                <span>
                                  {initialValues.user.firstName} {initialValues.user.lastName}
                                </span>
                              </span>
                            </Col>
                          }
                          {initialValues.createdAt &&
                            <Col sm={6}>
                              <span className={`${styles.contact_heading}`}>
                                Created On:
                              </span>
                              <span className="p-l-10">
                                {moment(initialValues.createdAt, 'YYYY-MM-DD').format('DD MMM YYYY')}
                              </span>
                            </Col>
                          }
                        </Col>
                        }
                      </Col>
                    </div>
                  </Scrollbars>
                </Tab>
              </Tabs>
            </Col> : this.renderNoResultsFound()
          }
        </Scrollbars>
        {
          openModal &&
            <EditCustomer
              form="EditCustomer"
              enableReinitialize
              initialValues={initialValues}
              isEdit={isEdit}
              validate={formValidation}
              closeModal={this.closeModal}
            />
        }
        <Loader loading={loading} />
      </div>
    );
  }
}
