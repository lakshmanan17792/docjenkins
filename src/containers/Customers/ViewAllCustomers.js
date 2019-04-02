import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import { push as route } from 'react-router-redux';
import { Link } from 'react-router';
import { Trans } from 'react-i18next';
import { Scrollbars } from 'react-custom-scrollbars';
import Loader from '../../components/Loader';
import {
  openEditCustomerModal,
  closeEditCustomerModal,
  loadCustomerById,
  openViewCustomerModal,
  closeViewCustomerModal
} from '../../redux/modules/customers';
import { formatDomainName } from '../../utils/validation';

import styles from './Customers.scss';

@connect(state => ({
  selectedClientCompany: state.customers.selectedClientCompany,
  loading: state.customers.loading
}), {
  openEditCustomerModal,
  closeEditCustomerModal,
  loadCustomerById,
  openViewCustomerModal,
  closeViewCustomerModal,
  route
})

export default class ViewAllCustomers extends Component {
  static propTypes = {
    customers: PropTypes.array.isRequired,
    selectedClientCompany: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    openEditCustomerModal: PropTypes.func.isRequired,
    closeEditCustomerModal: PropTypes.func.isRequired,
    loadCustomers: PropTypes.func.isRequired,
    loadCustomerById: PropTypes.func.isRequired,
    route: PropTypes.func.isRequired,
    openViewCustomerModal: PropTypes.func.isRequired,
    closeViewCustomerModal: PropTypes.func.isRequired
  }

  static defaultProps = {
    selectedClientCompany: null
  }

  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      activePage: 1,
      selectedClientCompany: {},
      customers: this.props.customers || {}
    };
  }
  loadCustomer = id => {
    this.props.route({ pathname: `/Company/${id}` });
  };

  closeModal = () => {
    this.props.closeEditCustomerModal();
    this.props.loadCustomers();
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_COMPANIES_FOUND</Trans></div></Row>
        <Row className={`${styles.empty_message} m-0`}>
          <div><Trans>MODIFY_SEARCH_TO_GET_RESULT</Trans></div>
        </Row>
      </Col>
    );
    return NoResultsFound;
  }

  render() {
    const { customers, loading } = this.props;
    return (
      <div className={styles.viewAllCustomers}>
        <Scrollbars
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(100vh - 160px)'}
          autoHeightMax={'calc(100vh - 160px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <Col lg={12} className={`${styles.customers_section}`}>
            {
              customers && customers.length ?
                customers.map(customer => (
                  <Col
                    key={customer.id}
                    lg={4}
                    className="p-b-8 p-0 cursor-pointer"
                    onClick={() => this.loadCustomer(customer.id)}
                  >
                    <Col sm={12} className="p-r-5 p-l-8">
                      <div className={`${styles.customer} shadow_one`}>
                        <div className={styles.customer_body}>
                          <div className={`${styles.section_one} p-b-15`}>
                            <div className={styles.company_name} title={customer.name}>{customer.name}</div>
                            <div className={`${styles.openings} right`}>
                              {
                                customer.openingsCount ?
                                  <div className={`${styles.openings_available}`}>
                                    {customer.openingsCount === 1 ? '1 Opening' : `${customer.openingsCount} Openings`}
                                  </div>
                                  :
                                  <div>No Openings</div>
                              }
                              <div className={`${styles.openings_closed} right`}>
                                {customer.closedOpenings !== 0 && `${customer.closedOpenings} Closed`} </div>
                            </div>
                          </div>
                          <div className={`${styles.section_two} p-b-10`}>
                            {customer.contacts && customer.contacts[0] &&
                              <div className={styles.contact_name} title={customer.contacts[0].firstName}>
                                {customer.contacts[0].firstName && customer.contacts[0].lastName &&
                                  `${customer.contacts[0].firstName} ${customer.contacts[0].lastName}`
                                }
                                {customer.contacts[0].firstName && !customer.contacts[0].lastName &&
                                  customer.contacts[0].firstName
                                }
                              </div>}
                            <div className={styles.contact_position}>
                              {
                                customer.contacts && customer.contacts[0] ?
                                  customer.contacts[0].jobTitle
                                  :
                                  customer.jobTitle
                              }
                            </div>
                          </div>
                          <div className={`${styles.section_three} p-b-10`}>
                            {customer.contacts && customer.contacts[0] && customer.contacts[0].contactNumber &&
                              <div className={`${styles.contact_number}`}>
                                <i className="fa fa-phone p-r-5" aria-hidden="true" />
                                {customer.contacts[0].contactNumber}
                              </div>
                            }
                            {customer.domain &&
                              <div className={`${styles.company_domain} right`}>
                                <Link
                                  onClick={e => e.stopPropagation()}
                                  to={`http://${formatDomainName(customer.domain)}`}
                                  target="_blank"
                                >
                                  {customer.domain}
                                </Link>
                              </div>
                            }
                          </div>
                          <div className={`${styles.section_four} p-b-10`}>
                            {customer.contacts && customer.contacts[0] && customer.contacts[0].email &&
                              <div className={styles.contact_email} title={customer.contacts[0].email}>
                                <i className="fa fa-envelope p-r-5" aria-hidden="true" />
                                {customer.contacts[0].email}
                              </div>
                            }
                            {customer.linkedinurl &&
                              <div className={`${styles.linkedinurl} right`} title={customer.linkedinurl}>
                                <Link
                                  onClick={e => e.stopPropagation()}
                                  to={`http://${formatDomainName(customer.linkedinurl)}`}
                                  target="_blank"
                                >
                                  LinkedIn
                                  <i className="fa fa-share-square-o p-l-5" aria-hidden="true" />
                                </Link>
                              </div>
                            }
                          </div>
                        </div>
                        <div className={`${styles.footer} p-b-5 p-t-5`}>
                          <span className={`${styles.recent}`}>
                            {customer.jobOpenings && customer.jobOpenings.length > 0 && customer.jobOpenings[0] &&
                              <span>
                                Recent Opening : {Moment(customer.jobOpenings[0].createdAt)
                                  .format('DD MMM YYYY')}
                              </span>
                            }
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Col>
                )) : this.renderNoResultsFound()
            }
          </Col>
        </Scrollbars>
        <Loader loading={loading} />
      </div>
    );
  }
}
