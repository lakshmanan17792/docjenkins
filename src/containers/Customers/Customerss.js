import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import moment from 'moment';
import { push as route } from 'react-router-redux';
// import Helmet from 'react-helmet';
import { Row, Col, Pager, Grid, ButtonToolbar, Table, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import Constants from './../../helpers/Constants';
import CustomerType from './CustomerType';
import SearchBar from '../../components/FormComponents/SearchBar';
import styles from './Customers.scss';
import EditCustomer from './SaveCompany';
import {
  loadCustomers,
  openEditCustomerModal,
  closeEditCustomerModal
} from '../../redux/modules/customers';
// import UserRole from './../../helpers/UserRole';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';

// const providers = {
//   userRole: new UserRole()
// };
@reduxForm({
  form: 'searchCustomer'
})
@connect(state => ({
  customers: state.customers.customerList || [],
  totalCount: state.customers.totalCount || 0,
  loading: state.customers.loading
}), { loadCustomers, openEditCustomerModal, closeEditCustomerModal, route })

export default class Customerss extends Component {
  static propTypes = {
    customers: PropTypes.array.isRequired,
    loadCustomers: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    openEditCustomerModal: PropTypes.func.isRequired,
    closeEditCustomerModal: PropTypes.func.isRequired,
    // loading: PropTypes.bool,
    route: PropTypes.func,
  }
  static defaultProps = {
    loading: false,
    route: null
  }
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      loading: false,
      pushState: null,
      searchStrVal: '',
      selectedStatusFilter: 'All',
      selectedDateFilter: 'Date',
    };
  }

  componentWillMount() {
    this.loadInitialCustomerDetails();
  }
  setSearchTerm = evt => {
    this.setState({ searchStrVal: evt.target.value }, () => this.loadInitialCustomerDetails());
  }

  getPages = () => {
    const numberOfPages = Math.ceil(this.props.totalCount / 8);
    // let active = 1;
    const items = [];
    for (let initialnumber = 1; initialnumber <= numberOfPages; initialnumber += 1) {
      items.push(
        <Pager.Item
          className={`${styles.globeMargin} ${initialnumber === this.state.activePage ? styles.activePage : ''}`}
          onClick={() => this.renderPage(initialnumber)}
        > {initialnumber}</Pager.Item>
      );
    }
    return ([items]);
  }

  loadInitialCustomerDetails = () => {
    this.props.loadCustomers({
      page: this.state.activePage,
      resultsPerPage: Constants.RECORDS_PER_PAGE,
      status: this.state.selectedStatusFilter.toLowerCase(),
      sort: this.state.selectedDateFilter.toLowerCase(),
      searchTerm: this.state.searchStrVal
    }).then(() => {}, err => {
      if (err.error.statusCode === 400) {
        toastrErrorHandling(err.error, i18n.t('errorMessage.COMPANY_SEARCH'),
          err.error.message, { removeOnHover: true });
      } else {
        toastrErrorHandling(err.error, i18n.t('errorMessage.SERVER_ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_COMPANIES'), { removeOnHover: true });
      }
    });
  }

  loadCustomer = id => {
    this.props.route({ pathname: `/Company/${id}` });
  }

  dateDropDownFilter = () => (
    <div className={`${styles.filterdropdown} ${styles.datefilterdropdown}`}>
      <span className={`${styles.sortCompanyLabel}`}>
        Sort Companies By
      </span>
      <DropdownButton
        className={`${styles.companyfilter}`}
        title={this.state.selectedDateFilter}
        onSelect={evt => { this.dateFilterChange(evt); }}
      >
        <MenuItem eventKey="Date">Date</MenuItem>
        <MenuItem eventKey="Name">Name</MenuItem>
      </DropdownButton>
    </div>
  )

  statusDropDownFilter = () => (
    <div className={`${styles.filterdropdown}`}>
      <span className={`${styles.sortCompanyLabel}`}>
        Status
      </span>
      <DropdownButton
        className={`${styles.companyfilter}`}
        title={this.state.selectedStatusFilter}
        onSelect={evt => { this.statusFilterChange(evt); }}
      >
        <MenuItem eventKey="All">All</MenuItem>
        <MenuItem eventKey="Client">Client</MenuItem>
        <MenuItem eventKey="Lead">Lead</MenuItem>
        <MenuItem eventKey="Not Interested">Not Interested</MenuItem>
        <MenuItem eventKey="Contacted">Contacted</MenuItem>
        <MenuItem eventKey="Prospect">Prospect</MenuItem>
      </DropdownButton>
    </div>
  );

  redirectToFirstPage = () => {
    this.setState({ activePage: 1 }, () => this.loadInitialCustomerDetails());
  }

  prevPage = () => {
    if (this.state.activePage > 1) {
      this.setState({ activePage: this.state.activePage - 1 }, this.loadInitialCustomerDetails());
    }
  }

  nextPage = () => {
    if (this.state.activePage < (Math.ceil(this.props.totalCount / 8))) {
      this.setState({ activePage: this.state.activePage + 1 }, this.loadInitialCustomerDetails());
    }
  }

  redirectToLastPage = () => {
    const lastPage = Math.ceil(this.props.totalCount / 8);
    this.setState({ activePage: lastPage }, () => this.loadInitialCustomerDetails());
  }

  statusFilterChange = evt => {
    this.setState({ selectedStatusFilter: evt, activePage: 1 }, () => this.loadInitialCustomerDetails());
  }

  dateFilterChange = evt => {
    this.setState({ selectedDateFilter: evt, activePage: 1 }, () => this.loadInitialCustomerDetails());
  }

  resetSearch = () => {
    this.setState({ searchStrVal: '' }, () => this.loadInitialCustomerDetails());
  }

  closeModal = () => {
    this.props.closeEditCustomerModal();
    this.loadCustomers();
    this.setState({ openModal: false });
  }

  addNewCompany = evt => {
    evt.preventDefault();
    this.setState({
      openModal: true,
      isEdit: false,
      selectedCompany: {}
    }, () => {
      this.props.openEditCustomerModal();
    });
  }

  openEditCustomerModal = evt => {
    evt.preventDefault();
    const { id } = evt.target;
    let selectedCompany = {};
    let selectedIndex = -1;
    this.state.openings.forEach((data, index) => {
      if (data.id === parseInt(id, 10)) {
        selectedIndex = index;
        selectedCompany = data;
      }
    });
    this.setState({
      selectedCompany,
      selectedIndex,
      openModal: true,
      isEdit: true
    }, () => {
      this.props.openEditCustomerModal();
    });
  }

  renderPagination = () => {
    if (this.props.totalCount) {
      return (<div className={`${styles.customer_layout}`}>
        <Pager className={`${styles.pager}`}>
          <span className={`${styles.globeMargin}`}>
            Displaying Page
          </span>
          <Pager.Item onClick={() => this.redirectToFirstPage()} className={`${styles.globeMargin}`}>
            <span>First</span>
          </Pager.Item>
          <Pager.Item className={`${styles.paginationLeft}`} onClick={() => this.prevPage()}>
            <span className="fa fa-chevron-left" />
          </Pager.Item>
          {this.getPages()}
          <Pager.Item className={`${styles.paginationRight}`} onClick={() => this.nextPage()}>
            <span className="fa fa-chevron-right" />
          </Pager.Item>
          <Pager.Item onClick={() => this.redirectToLastPage()}>
            <span>Last</span>
          </Pager.Item>
        </Pager>
        <br />
      </div>
      );
    }
  }

  renderPage = page => {
    this.setState({ activePage: page }, () => this.loadInitialCustomerDetails());
  }

  renderCompaniesInfo = () => {
    if (this.props.totalCount) {
      return (
        <Table responsive className={`${styles.companyTable}`}>
          <tbody>
            {
              this.props.customers && this.props.customers.map(user =>
                (<tr
                  className={`${styles.pointer} ${styles.companyTableRow}`}
                  onClick={() => this.loadCustomer(user.id)}
                >
                  <td className={`${styles.alignCenter} ${styles.gridFonts}`} width="7.28%" />
                  <td
                    className={`${styles.gridFonts} ${styles.companyName} ${styles.companyFormData}`}
                    width="14.28%"
                  >{user.name}</td>
                  <td className={`${styles.alignCenter} ${styles.gridFonts} ${styles.companyFormData}`} width="14.28%">
                    {<CustomerType userType={user.status} />}
                  </td>
                  <td className={`${styles.alignCenter} ${styles.gridFonts} ${styles.companyFormData}`} width="14.28%">
                    <i className={`fa fa-globe ${styles.globeMargin}`} aria-hidden="true" />
                    {user.country}
                  </td>
                  <td className={`${styles.alignCenter} ${styles.gridFonts} ${styles.companyFormData}`} width="14.28%">
                    <i className={`fa fa-briefcase ${styles.globeMargin}`} aria-hidden="true" />
                    {user.openingsCount} openings
                  </td>
                  <td className={`${styles.alignCenter} ${styles.gridFonts} ${styles.companyFormData}`} width="14.28%">
                    <i className={`fa fa-check ${styles.globeMargin}`} aria-hidden="true" />
                    {user.submissions}
                  </td>
                  <td className={`${styles.alignCenter} ${styles.gridFonts}`} width="14.28%">
                    Last Activity<br />
                    { user.lastActivity ?
                      moment(moment(user.lastActivity).format('DD MMM YYYY hh:mm a'), 'DD MMM YYYY hh:mm a').fromNow()
                      : ''}
                  </td>
                </tr>
                )
              )
            }
          </tbody>
        </Table>
      );
    }
    return (
      <div className={`${styles.errorContent}`}>
        <h3>No Records Found </h3>
      </div>
    );
  }

  render() {
    const totalCount = this.props.totalCount;
    return (
      <Grid md={7} className={`${styles.companyContainer}`} >
        {/* <Row className={`${styles.header}`}>
        </Row> */}
        <Row className={`${styles.companyHeader}`}>
          <Col md={5} className={`${styles.companiesHeading}`}>
              Companies
          </Col>
          <Col md={5} className={`${styles.importButtonHeader}`}>
            <ButtonToolbar className={`${styles.companiesHeadingButtonToolbar}`}>
              {/* <Button className={`${styles.importButton}`}>Import</Button> */}
              <Button onClick={this.addNewCompany} className={`${styles.createCompanyButton}`}>Create Company</Button>
            </ButtonToolbar>
          </Col>
        </Row>
        <Row className={`${styles.header}`}>
          <Col md={5} className={`${styles.headerLayout}`}>
            <span className={`${styles.companyCount}`}>
              <span>{totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              {
                totalCount > 1 ?
                  <span> Companies</span>
                  :
                  <span> Company</span>
              }
            </span>
            <span className={`${styles.splitterHeight}`} >
                |
            </span>
            <span className={`${styles.companySearch}`}>
              <SearchBar
                searchClassName="search-input"
                isCustomerSearch="yes"
                reset={e => this.resetSearch(e)}
                handleOnChange={e => this.setSearchTerm(e)}
                inpValue={this.state.searchStrVal}
                classNames={styles.searchBarWidth}
                placeholder="SEARCH_BY_COMPANY"
                handleOnKeyUp={() => {}}
              />
            </span>
          </Col>
          <Col md={3}>
            {this.statusDropDownFilter()}
          </Col>
          <Col md={4}>
            {this.dateDropDownFilter()}
          </Col>
        </Row>
        <Row className={`${styles.modifiedGrid}`}>
          <Col xs={12} md={12} className={styles.tableStyles}>
            {this.renderCompaniesInfo()}
          </Col>
        </Row>
        <Row className={`${styles.alignCenter}`}>
          <Col xs={12} md={12}>
            {this.renderPagination()}
          </Col>
        </Row>
        {
          this.state.openModal ?
            <EditCustomer
              form="EditCustomer"
              enableReinitialize
              closeModal={this.closeModal}
            /> : ''
        }
      </Grid>
    );
  }
}
