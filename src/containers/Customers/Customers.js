import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { reduxForm, getFormValues } from 'redux-form';
import { push as pushState } from 'react-router-redux';
import { Trans } from 'react-i18next';
import { Row, Col, Pager, Grid, Table, DropdownButton, MenuItem,
  OverlayTrigger, Tooltip } from 'react-bootstrap';
// import DropdownList from 'react-widgets/lib/DropdownList';
import lodash from 'lodash';
import moment from 'moment';
import { Multiselect } from 'react-widgets';
import { Radio } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import 'antd/dist/antd.css';
import EditCustomer from './SaveCompany';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import {
  loadCustomers,
  openEditCustomerModal,
  closeEditCustomerModal,
  getSalesRepList,
  getCompanyTags
} from '../../redux/modules/customers';
import CustomerType from './CustomerType';
import SearchBar from '../../components/FormComponents/SearchBar';
import styles from './Customers.scss';
import Constants from './../../helpers/Constants';
// import UserRole from './../../helpers/UserRole';
import { restrictDecimalNumber } from '../../utils/validation';
import i18n from '../../i18n';
import Loader from '../../components/Loader';
import NewPermissible from '../../components/Permissible/NewPermissible';

const RadioGroup = Radio.Group;
// const providers = {
//   userRole: new UserRole()
// };
  @reduxForm({
    form: 'searchCustomer'
  })
  @connect(state => ({
    customers: state.customers.customerList || [],
    totalCount: state.customers.totalCount || 0,
    createCompanyFormValues: getFormValues('EditCustomer')(state),
    loading: state.customers.loading,
    salesOwners: state.customers.salesOwners,
    companyTags: state.customers.companyTags
  }), {
    loadCustomers,
    openEditCustomerModal,
    closeEditCustomerModal,
    pushState,
    getSalesRepList,
    getCompanyTags
  })

export default class Customerss extends Component {
  static propTypes = {
    customers: PropTypes.array.isRequired,
    loadCustomers: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    openEditCustomerModal: PropTypes.func.isRequired,
    closeEditCustomerModal: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    pushState: PropTypes.func,
    location: PropTypes.object.isRequired,
    createCompanyFormValues: PropTypes.object,
    route: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    getSalesRepList: PropTypes.func.isRequired,
    salesOwners: PropTypes.array.isRequired,
    getCompanyTags: PropTypes.func.isRequired,
    companyTags: PropTypes.array.isRequired
  }
    static defaultProps = {
      loading: false,
      pushState: null,
      createCompanyFormValues: null,
      salesOwners: []
    }
    constructor(props) {
      super(props);
      this.state = {
        nameOrder: sessionStorage.getItem('nameOrder') ? sessionStorage.getItem('nameOrder') : '',
        orderBy: this.setOrderByFilter(),
        orderIn: this.setOrderInFilter(),
        searchStrVal: sessionStorage.getItem('searchCompanyValue') ?
          sessionStorage.getItem('searchCompanyValue') : '',
        selectedStatusFilter: sessionStorage.getItem('selectedStatusFilter') ?
          sessionStorage.getItem('selectedStatusFilter') : 'All',
        selectedStatusText: sessionStorage.getItem('selectedStatusText') ?
          sessionStorage.getItem('selectedStatusText') : i18n.t('ALL'),
        activePage: sessionStorage.getItem('selectedActivePage') ?
          Number(sessionStorage.getItem('selectedActivePage')) : 1,
        selectedSalesOwners: JSON.parse(sessionStorage.getItem('selectedSalesOwners')) || [],
        isLoading: true,
        isOwnerOpen: false,
        selectedTags: JSON.parse(sessionStorage.getItem('selectedTags')) || [],
        isTagSubmitted: false,
        tagSkip: 0,
        tagLimit: 10,
        tagSearchTerm: '',
        canGetTags: true,
        isTagScrollEnabled: false
      };
    }

    componentWillMount() {
      this.loadInitialCustomerDetails();
      if (this.props.location &&
        this.props.location.query) {
        if (this.props.location.query.isAddCompany === 'true') {
          this.setState({
            openModal: true,
            isEdit: false,
            selectedCompany: {}
          }, () => {
            this.props.openEditCustomerModal();
          });
        }
      }
    }

    componentDidMount() {
      const { route, router } = this.props;
      this.loadTags();
      if (route && router) {
        router.setRouteLeaveHook(route, ({ pathname }) => {
          const { createCompanyFormValues } = this.props;
          if (createCompanyFormValues) {
            const { name, domain } = createCompanyFormValues;
            if (name || domain) {
              sessionStorage.setItem('addCustomer', JSON.stringify(createCompanyFormValues));
            }
            // alert display when form changes with allowed 3 pages ( view Company / new Company )
            if ((name || domain) &&
              !/Company\/new?/i.test(pathname) && !/Company/i.test(pathname)) {
              return i18n.t('confirmMessage.UNSAVED_CHANGES');
            }
          }
        });
      }
      const parentEl = document.getElementById('companyFilter');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }

    onSalesOwnersSearch = searchTerm => {
      if (searchTerm) {
        this.setState({ isOwnerOpen: true }, () => {
          this.props.getSalesRepList(searchTerm);
        });
      } else {
        this.setState({
          isOwnerOpen: false
        });
      }
    }

    onTagSearch = searchTerm => {
      const { tagLimit } = this.state;
      const value = searchTerm.replace(/\s\s+/g, ' ');
      if (value === this.state.tagSearchTerm || value === ' ') return;
      if (/^[a-zA-Z0-9\s]+$/i.test(value) || value === '') {
        this.setState({
          tagSearchTerm: searchTerm,
          canGetTags: true,
          tagSkip: 0
        });
        const tagObj = {
          skip: 0,
          limit: tagLimit,
          searchTerm
        };
        this.props.getCompanyTags(tagObj).then(tags => {
          if (tags && tags.length === 0) {
            this.setState({ canGetTags: false });
          } else {
            this.setState({
              companyTags: tags
            });
          }
        }, err => {
          if (err) {
            toastrErrorHandling(err.error, i18n.t('ERROR'),
              i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
          }
        });
      }
    }

    getTagsOnScroll = () => {
      const { canGetTags, tagSkip, tagLimit, tagSearchTerm } = this.state;
      if (!canGetTags) {
        return;
      }
      const tagObj = {
        skip: tagSkip,
        limit: tagLimit,
        searchTerm: tagSearchTerm
      };
      this.props.getCompanyTags(tagObj).then(tags => {
        if (tags && tags.length === 0) {
          this.setState({ canGetTags: false });
        } else {
          this.setState(prevState => ({
            companyTags: [...prevState.companyTags, ...this.filterTags(prevState.companyTags, tags)],
            tagSkip: prevState.tagSkip + 10
          }));
        }
      }, err => {
        if (err) {
          toastrErrorHandling(err.error, i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
        }
      });
    }

    setOrderByFilter = () => {
      if (sessionStorage.getItem('nameOrder')) {
        return '';
      }
      if (sessionStorage.getItem('orderBy')) {
        return sessionStorage.getItem('orderBy');
      }
      return 'activityOrder';
    }

    setOrderInFilter = () => {
      if (sessionStorage.getItem('nameOrder')) {
        return '';
      }
      if (sessionStorage.getItem('orderIn')) {
        return sessionStorage.getItem('orderIn');
      }
      return 'desc';
    }

    // componentWillUnmount() {
    //   if (!this.props.router.location.pathname.includes('/Company')) {
    //     sessionStorage.removeItem('selectedStatusFilter');
    //     sessionStorage.removeItem('selectedActivePage');
    //   }
    // }

    // componentWillReceiveProps() {
    //   if (this.props.location &&
    //     this.props.location.query) {
    //     if (this.props.location.query.isAddCompany) {
    //       this.props.openEditCustomerModal();
    //     }
    //   }
    // }
    setSearchTerm = evt => {
      this.resetPageInput();
      const value = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
      if (value === this.state.searchStrVal || value === ' ') return;
      if (/^[A-z\d\s-]+$/i.test(value) || value === '') {
        this.setState({ searchStrVal: value, activePage: 1 }, () => {
          sessionStorage.setItem('searchCompanyValue', this.state.searchStrVal);
          sessionStorage.setItem('selectedActivePage', 1);
          this.loadInitialCustomerDetails();
        });
      }
    }

    filterTags = (oldTags, newTags) => {
      const oldTagIds = lodash.map(oldTags, 'id');
      return newTags.filter(tag => oldTagIds.indexOf(tag.id) === -1);
    }
    tagListCreate = () => {
      const { isTagScrollEnabled } = this.state;
      if (isTagScrollEnabled) {
        return;
      }
      setTimeout(() => {
        const parentEl = document.getElementById('companyFilter');
        if (parentEl) {
          const el = parentEl.getElementsByClassName('rw-popup')[0].getElementsByTagName('ul')[0];
          el.addEventListener('scroll', lodash.debounce(this.getTagsOnScroll, 1000));
          this.setState({ isTagScrollEnabled: true });
        }
      }, 100);
    }

    handleTagChange = tags => {
      let orderBy = '';
      if (tags && tags.length > 0) {
        orderBy = 'tagsorder';
      }
      this.setState({
        selectedTags: tags,
        isTagChanged: true,
        tagSkip: 0,
        tagSearchTerm: '',
        canGetTags: true,
        isTagScrollEnabled: true,
        activePage: 1,
        orderBy
      }, () => {
        this.loadInitialCustomerDetails();
        sessionStorage.setItem('selectedTags', JSON.stringify(tags));
        sessionStorage.setItem('selectedActivePage', 1);
        sessionStorage.setItem('orderBy', this.state.orderBy);
        sessionStorage.setItem('orderIn', this.state.orderIn);
        this.props.getCompanyTags({ skip: 0, tagLimit: 10, searchTerm: '' }).then(res => {
          if (res && res.length === 0) {
            this.setState({ canGetTags: false });
          } else {
            this.setState(prevState => ({
              companyTags: res,
              tagSkip: prevState.tagSkip + 10
            }));
          }
        }, err => {
          if (err) {
            toastrErrorHandling(err.error, i18n.t('ERROR'),
              i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
          }
        });
      });
    }

    loadTags = () => {
      const { tagSkip, tagLimit, tagSearchTerm } = this.state;
      const tagObj = {
        skip: tagSkip,
        limit: tagLimit,
        searchTerm: tagSearchTerm
      };
      this.props.getCompanyTags(tagObj).then(tags => {
        this.setState({
          companyTags: tags,
          tagSkip: 10
        });
      }, err => {
        if (err) {
          toastrErrorHandling(err.error, i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
        }
      });
    }

    resetPageInput = () => {
      if (document.getElementById('goToCustomer')) {
        document.getElementById('goToCustomer').value = '';
      }
    }

    resetSearch = () => {
      this.resetPageInput();
      this.setState({ searchStrVal: '', activePage: 1 }, () => {
        sessionStorage.setItem('searchCompanyValue', this.state.searchStrVal);
        sessionStorage.setItem('selectedActivePage', 1);
        this.loadInitialCustomerDetails();
      });
    }

    statusDropDownFilter = () => (
      <div className={`${styles.filterdropdown}`}>
        <div className={`${styles.sortCompanyLabel}`}>
          <Trans>STATUS</Trans>
        </div>
        <div className={`${styles.dropdownSection}`}>
          <DropdownButton
            id="status"
            className={`${styles.companyfilter} companyFilter`}
            title={this.state.selectedStatusText}
            onSelect={this.statusFilterChange}
          >
            <MenuItem eventKey="All"><Trans>ALL</Trans></MenuItem>
            <MenuItem eventKey="Prospect"><Trans>PROSPECT</Trans></MenuItem>
            <MenuItem eventKey="Not Interested"><Trans>NOT_INTERESTED</Trans></MenuItem>
            <MenuItem eventKey="Contacted"><Trans>CONTACTED</Trans></MenuItem>
            <MenuItem eventKey="Lead"><Trans>LEAD</Trans></MenuItem>
            <MenuItem eventKey="Finalist"><Trans>FINALIST</Trans></MenuItem>
            <MenuItem eventKey="Client"><Trans>CLIENT</Trans></MenuItem>
          </DropdownButton>
        </div>
      </div>
    )

    loadInitialCustomerDetails = () => {
      this.setState({
        isLoading: true
      });
      const { activePage, selectedStatusFilter, orderBy, orderIn, nameOrder,
        selectedSalesOwners, searchStrVal, selectedTags } = this.state;
      const orderByNew = orderBy;
      // if (selectedTags.length === 0) {
      //   orderByNew = 'activityOrder';
      // }
      this.props.loadCustomers({
        page: activePage,
        resultsPerPage: Constants.RECORDS_PER_PAGE,
        status: selectedStatusFilter.toLowerCase(),
        searchTerm: searchStrVal,
        salesOwners: selectedSalesOwners,
        orderBy: orderByNew || 'activityOrder',
        orderIn,
        orderNameBy: nameOrder,
        tags: selectedTags
      }).then(() => {
        const tableBody = document.getElementById('tableBody');
        if (tableBody) {
          tableBody.scrollTo(0, 0);
        }
        this.setState({
          isLoading: false
        });
      }, error => {
        this.setState({
          isLoading: false
        });
        toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_COMPANIES'), { removeOnHover: true });
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

    closeModal = () => {
      this.props.closeEditCustomerModal();
      this.loadInitialCustomerDetails();
      this.setState({ openModal: false }, () => {
        this.props.pushState('/Companies');
      });
    }


    selectPageNumber = (evt, maxPage) => {
      const pageNo = evt.target.value;
      if (evt.keyCode === 69) {
        evt.preventDefault();
      }
      if (evt.keyCode === 13 && pageNo > 0) {
        if (pageNo <= maxPage) {
          this.setState({ activePage: Number(pageNo) }, () => this.loadInitialCustomerDetails());
          sessionStorage.setItem('selectedActivePage', pageNo);
        } else {
          evt.target.value = '';
          toastrErrorHandling({}, i18n.t('errorMessage.PAGE_ERROR'), i18n.t('errorMessage.PAGE_NOT_FOUND'));
        }
      }
    }

    redirectToFirstPage = () => {
      this.setState({ activePage: 1 }, () => this.loadInitialCustomerDetails());
      sessionStorage.setItem('selectedActivePage', 1);
      this.resetPageInput();
    }

    prevPage = () => {
      if (this.state.activePage > 1) {
        this.setState({ activePage: this.state.activePage - 1 }, () => this.loadInitialCustomerDetails());
        sessionStorage.setItem('selectedActivePage', this.state.activePage - 1);
        this.resetPageInput();
      }
    }

    nextPage = () => {
      if (this.state.activePage < (Math.ceil(this.props.totalCount / 15))) {
        this.setState({ activePage: this.state.activePage + 1 }, () => this.loadInitialCustomerDetails());
        sessionStorage.setItem('selectedActivePage', this.state.activePage + 1);
        this.resetPageInput();
      }
    }

    redirectToLastPage = () => {
      const lastPage = Math.ceil(this.props.totalCount / 15);
      this.setState({ activePage: lastPage }, () => this.loadInitialCustomerDetails());
      sessionStorage.setItem('selectedActivePage', lastPage);
      this.resetPageInput();
    }

    statusFilterChange = e => {
      // this.setState({
      //   selectedStatusFilter: selectedEvent,
      //   selectedStatusText: eventObject.currentTarget.innerText,
      //   activePage: 1
      // }, () => this.loadInitialCustomerDetails());

      this.setState({
        selectedStatusFilter: e.target.value,
        activePage: 1
      }, () => this.loadInitialCustomerDetails());
      sessionStorage.setItem('selectedStatusFilter', e.target.value);
      sessionStorage.setItem('selectedActivePage', 1);
    }

    // dateFilterChange = evt => {
    //   this.setState({ selectedDateFilter: evt, activePage: 1 }, () => this.loadInitialCustomerDetails());
    //   sessionStorage.setItem('selectedDateFilter', evt);
    // }

    addNewCompany = evt => {
      evt.preventDefault();
      // this.setState({
      //   openModal: true,
      //   isEdit: false,
      //   selectedCompany: {}
      // }, () => {
      // this.props.openEditCustomerModal();
      this.props.pushState({
        pathname: 'CreateCompany',
        query: { isAddCompany: true }
      });
      // });
    }

    capitalize = data => {
      const lowercaseWord = data.toLowerCase();
      return lowercaseWord.charAt(0).toUpperCase() + lowercaseWord.slice(1);
    }

    loadCustomer = id => {
      this.props.pushState({ pathname: `/Company/${id}` });
    }

    salesOwnerIndividual = salesOwner => (
      <OverlayTrigger
        rootClose
        overlay={this.renderTooltip(salesOwner, false)}
        placement="top"
        key={salesOwner.id}
      >
        <span className={styles.salesOwnerCircle}>
          {salesOwner.firstName ? salesOwner.firstName.charAt(0).toUpperCase() : ''}
          {salesOwner.lastName ? salesOwner.lastName.charAt(0).toUpperCase() : ''}
        </span>
      </OverlayTrigger>
    )

    salesOwnerMultiple = company => {
      if (company.salesOwners.length <= 2) {
        return '';
      }
      return (
        <OverlayTrigger
          rootClose
          overlay={this.renderTooltip(null, true, company)}
          placement="top"
        >
          <span className={styles.salesOwnerCircle}>
            +{company.salesOwners.length - 2 }
          </span>
        </OverlayTrigger>
      );
    }

    handleSalesOwnerChange = salesOwners => {
      this.setState({
        selectedSalesOwners: salesOwners,
        activePage: 1,
        isOwnerOpen: false
      }, () => {
        this.loadInitialCustomerDetails();
        sessionStorage.setItem('selectedSalesOwners', JSON.stringify(salesOwners));
        sessionStorage.setItem('selectedActivePage', 1);
      });
    }

    filterCompaniesByNameOrder = (evt, orderType) => {
      this.resetPageInput();
      this.setState({
        nameOrder: orderType,
        orderBy: '',
        orderIn: '',
        activePage: 1
      }, () => {
        sessionStorage.setItem('selectedActivePage', 1);
        sessionStorage.setItem('nameOrder', orderType);
        sessionStorage.setItem('orderBy', '');
        sessionStorage.setItem('orderIn', '');
        this.loadInitialCustomerDetails();
      });
      evt.preventDefault();
    }

    applyFilterOrder = (evt, orderBy, orderIn) => {
      this.resetPageInput();
      evt.preventDefault();
      this.setState({
        orderBy,
        orderIn,
        nameOrder: '',
        activePage: 1
      }, () => {
        sessionStorage.setItem('selectedActivePage', 1);
        sessionStorage.setItem('nameOrder', '');
        sessionStorage.setItem('orderBy', orderBy);
        sessionStorage.setItem('orderIn', orderIn);
        this.loadInitialCustomerDetails();
      });
    }

    clearFilters = () => {
      this.setState({
        nameOrder: '',
        selectedSalesOwners: [],
        orderBy: 'activityOrder',
        orderIn: 'desc',
        selectedStatusFilter: 'All',
        selectedStatusText: i18n.t('ALL'),
        selectedTags: []
      }, () => {
        sessionStorage.setItem('nameOrder', '');
        sessionStorage.setItem('selectedStatusFilter', 'All');
        sessionStorage.setItem('selectedStatusText', i18n.t('ALL'));
        sessionStorage.setItem('orderBy', this.state.orderBy);
        sessionStorage.setItem('orderIn', this.state.orderIn);
        sessionStorage.setItem('selectedSalesOwners', JSON.stringify(this.state.selectedSalesOwners));
        sessionStorage.setItem('selectedTags', JSON.stringify(this.state.selectedTags));
        this.resetSearch();
      });
    }

    renderTooltip = (salesOwner, showAll, company) => {
      if (!showAll) {
        return (
          <Tooltip id={salesOwner.id}>
            <strong>
              {`${salesOwner.firstName ? salesOwner.firstName : ''} ${salesOwner.lastName ? salesOwner.lastName : ''}` }
            </strong>
          </Tooltip>
        );
      }
      return (
        <Tooltip id={company.id} className={`salesTooltip ${styles.customTooltip}`}>
          <div>
            <strong>
              {`${company.salesOwners.length} Account Owners` }
            </strong>
          </div>
          {
            company.salesOwners.map(owner => (
              <div key={owner.id} className={styles.tooltip}>
                {`${owner.firstName ? owner.firstName : ''} ${owner.lastName ? owner.lastName : ''}` }
              </div>
            )
            )
          }
        </Tooltip>
      );
    }

    renderPage = page => {
      this.setState({ activePage: page }, () => this.loadInitialCustomerDetails());
    }

    renderSalesOwners = company => (
      <div className={styles.salesOwnerContainer}>
        {
          company.salesOwners.slice(0, 2).map(salesOwner =>
            this.salesOwnerIndividual(salesOwner)
          )
        }
        {
          company.salesOwners.length === 3 ?
            this.salesOwnerIndividual(company.salesOwners[2]) : this.salesOwnerMultiple(company)
        }
      </div>
    );

    renderSalesOwnerFilter = () => (
      <div className={`${styles.filterdropdown}`}>
        <div
          className={`${styles.sortCompanyLabel}`}
          style={{ padding: '0px !important', paddingTop: '5px !important' }}
        >
          <Trans>OWNERS</Trans>
        </div>
        <Multiselect
          data={this.props.salesOwners}
          onChange={this.handleSalesOwnerChange}
          onSearch={this.onSalesOwnersSearch}
          value={this.state.selectedSalesOwners}
          className="salesOwnerFilter companySales"
          textField="fullName"
          messages={{
            emptyList: i18n.t('NO_RESULTS_FOUND'),
            emptyFilter: i18n.t('NO_RESULTS_FOUND')
          }}
          placeholder={i18n.t('placeholder.SELECT_ACCOUNT_OWNERS_TO_FILTER')}
        />
      </div>
    );

    renderCompaniesInfo = () => {
      if (this.props.totalCount) {
        return (
          <Table
            responsive
            className={`table
            ${styles.customTable} ${styles.companyTable}`}
          >
            <thead>
              <tr>
                <th className={styles.width_18}>
                  <span className="m-r-5 p-l-10"><Trans>COMPANY</Trans></span>
                  <i
                    onClick={evt => { this.filterCompaniesByNameOrder(evt, 'asc'); }}
                    className={`${styles.orderFilterUp} fa fa-sort-asc
                  ${this.state.nameOrder === 'asc' ? styles.currentNameOrder : ''}`}
                    aria-hidden="true"
                  />
                  <i
                    onClick={evt => { this.filterCompaniesByNameOrder(evt, 'desc'); }}
                    className={`${styles.orderFilterDown} fa fa-sort-desc
                  ${this.state.nameOrder === 'desc' ? styles.currentNameOrder : ''}`}
                    aria-hidden="true"
                  />
                </th>
                <th className={styles.width_15}>
                  <Trans>STATUS</Trans>
                </th>
                <th className={styles.width_15}>
                  <Trans>LOCATION</Trans>
                </th>
                <th className={styles.width_10}>
                  <span className="m-r-5"><Trans>OPENINGS</Trans></span>
                  <i
                    onClick={evt => { this.applyFilterOrder(evt, 'jobOpeningOrder', 'asc'); }}
                    className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${this.state.orderBy === 'jobOpeningOrder' && this.state.orderIn === 'asc'
                      ? styles.currentNameOrder : ''}`}
                    aria-hidden="true"
                  />
                  <i
                    onClick={evt => { this.applyFilterOrder(evt, 'jobOpeningOrder', 'desc'); }}
                    className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${this.state.orderBy === 'jobOpeningOrder' && this.state.orderIn === 'desc'
                      ? styles.currentNameOrder : ''}`}
                    aria-hidden="true"
                  />
                </th>
                <th className={styles.width_12}>
                  <span className="m-r-5"><Trans>SUBMISSIONS</Trans></span>
                  <i
                    onClick={evt => { this.applyFilterOrder(evt, 'submissionOrder', 'asc'); }}
                    className={`${styles.orderFilterUp} fa fa-sort-asc
                      ${this.state.orderBy === 'submissionOrder' && this.state.orderIn === 'asc'
                      ? styles.currentNameOrder : ''}`}
                    aria-hidden="true"
                  />
                  <i
                    onClick={evt => { this.applyFilterOrder(evt, 'submissionOrder', 'desc'); }}
                    className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${this.state.orderBy === 'submissionOrder' && this.state.orderIn === 'desc'
                      ? styles.currentNameOrder : ''}`}
                    aria-hidden="true"
                  />
                </th>
                <th className={styles.width_15}>
                  <Trans>OWNERS</Trans>
                </th>
                <th className={styles.width_15}>
                  <span className="m-r-5"><Trans>LAST_ACTIVITY</Trans></span>
                  <i
                    onClick={evt => { this.applyFilterOrder(evt, 'activityOrder', 'asc'); }}
                    className={`${styles.orderFilterUp} fa fa-sort-asc
                      ${this.state.orderBy === 'activityOrder' && this.state.orderIn === 'asc'
                      ? styles.currentNameOrder : ''}`}
                    aria-hidden="true"
                  />
                  <i
                    onClick={evt => { this.applyFilterOrder(evt, 'activityOrder', 'desc'); }}
                    className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${this.state.orderBy === 'activityOrder' && this.state.orderIn === 'desc'
                      ? styles.currentNameOrder : ''}`}
                    aria-hidden="true"
                  />
                </th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {
                this.props.customers && this.props.customers.map(user =>
                  (<tr
                    key={`tr${user.id}`}
                    onClick={() => this.loadCustomer(user.id)}
                    className={`${styles.customTr}`}
                  >
                    <td className={`${styles.customTd} ${styles.width_18}`}>
                      <div className={`${styles.companyNameContainer}`}>
                        {/* <span className={`${styles.company_logo}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </span> */}
                        {
                          user.domain ?
                            <img
                              alt={user.domain}
                              className={`${styles.logoImg}`}
                              src={`https://logo.clearbit.com/${user.domain}`}
                              onError={e => { e.target.src = '/company_icon.svg'; }}
                            /> :
                            <img
                              alt={user.domain}
                              className={`${styles.logoImg}`}
                              src={'/company_icon.svg'}
                            />
                        }
                        <div className="m-l-15">
                          <div
                            className={`m-l-5 ${styles.companyName}
                                ${styles.w_200} ${user.domain ? '' : 'm-t-10'}`}
                            title={user.name}
                          ><div className={`${styles.txt_overflow}`}>{user.name}</div></div>
                          <div
                            className={`m-l-5 ${styles.domainName} ${styles.w_200} `}
                            title={user.domain}
                          ><div className={`${styles.txt_overflow}`}>{user.domain}</div></div>
                        </div>
                      </div>
                    </td>
                    <td className={`${styles.customTd} ${styles.width_15}`}>
                      {user.status && <CustomerType userType={user.status} customStyle={`${styles.clientStatus}`} />}
                    </td >
                    <td className={`${styles.customTd} ${styles.width_15}`}>
                      <div
                        className={`${styles.txt_overflow}`}
                        title={user.city ? `${user.city}, ${user.country}` : user.country}
                      >
                        {user.city && `${this.capitalize(user.city)}, `}{this.capitalize(user.country)}
                      </div>
                    </td>
                    <td className={`${styles.customTd} ${styles.width_10}`} >
                      {user.openingsCount}
                    </td>
                    <td className={`${styles.customTd} ${styles.width_12}`}>
                      {user.submissions}
                    </td>
                    <td className={`${styles.customTd} ${styles.width_15}`}>
                      {this.renderSalesOwners(user)}
                    </td>
                    <td className={`${styles.customTd} ${styles.width_15}`}>
                      {user.lastActivity ?
                        moment(moment(user.lastActivity).format('DD MMM YYYY hh:mm a'),
                          'DD MMM YYYY hh:mm a').fromNow() :
                        ''}
                    </td>
                  </tr>
                  )
                )
              }
            </tbody>
          </Table>
        );
      } else if (this.state.isLoading) {
        return (
          <Col className={styles.no_results_found}>
            <Row className={styles.sub_head}><div><Trans>Loading</Trans></div></Row>
          </Col>
        );
      } else if (!this.state.isLoading) {
        return (
          <Col className={styles.no_results_found}>
            <Row className="text-center"><img src="/sadface.png" alt="sad face" /></Row>
            <Row className={styles.sub_head}><div><Trans>NO_COMPANIES_FOUND</Trans></div></Row>
            <Row className={styles.empty_message}>
              <div><Trans>MODIFY_SEARCH_TO_GET_RESULT</Trans></div>
            </Row>
          </Col>
        );
      }
    }

    renderPagination = () => {
      if (this.props.totalCount && this.props.totalCount > 15) {
        const maxPage = Math.ceil(this.props.totalCount / 15);
        return (
          <div className={`${styles.pagination_containers}`}>
            <div className={`${styles.page_goto}`}>
              <input
                type="number"
                id="goToCustomer"
                onKeyDown={e => this.selectPageNumber(e, maxPage)}
                placeholder={i18n.t('placeholder.GO_TO')}
                onKeyPress={restrictDecimalNumber}
                min="1"
              />
            </div>
            <Pager className={`${styles.pager} left`}>
              <Pager.Item
                className={this.state.activePage <= 1 ? `${styles.disabled} p-r-5` : 'p-r-5'}
                onClick={() => this.redirectToFirstPage()}
              >
                <span><Trans>FIRST</Trans></span>
              </Pager.Item>
              <Pager.Item
                className={this.state.activePage <= 1 ?
                  `${styles.disabled} ${styles.page_no_height}` :
                  styles.page_no_height}
                onClick={() => this.prevPage()}
              >
                <span className="fa fa-caret-left" />
              </Pager.Item>
              <Pager.Item
                title={`${i18n.t('tooltipMessage.TOTAL_PAGES')} : ${maxPage}`}
                className={`${styles.page_no} ${styles.page_no_height} ${styles.page_no_width}`}
              >
                {this.state.activePage}
              </Pager.Item>
              <Pager.Item
                className={this.state.activePage >= maxPage ?
                  `${styles.disabled} ${styles.page_no_height} p-r-5` :
                  `${styles.page_no_height} p-r-5`
                }
                onClick={() => this.nextPage()}
              >
                <span className="fa fa-caret-right" />
              </Pager.Item>
              <Pager.Item
                className={this.state.activePage >= maxPage ? `${styles.disabled}` : ''}
                onClick={() => this.redirectToLastPage()}
              >
                <span><Trans>LAST</Trans></span>
              </Pager.Item>
            </Pager>
          </div>
        );
      }
    }

    renderTags = () => {
      const { selectedTags, companyTags } = this.state;
      return (
        <Multiselect
          data={companyTags}
          onChange={this.handleTagChange}
          value={selectedTags}
          className="salesOwnerFilter companySales"
          textField="name"
          messages={{
            emptyList: i18n.t('NO_RESULTS_FOUND'),
            emptyFilter: i18n.t('NO_RESULTS_FOUND')
          }}
          valueField="id"
          onSearch={lodash.debounce(this.onTagSearch, 1000)}
          placeholder={i18n.t('placeholder.SELECT_TAGS_TO_FILTER')}
          id="companyFilter"
        />
      );
    }

    // dateDropDownFilter = () => (
    //   <div className={`${styles.filterdropdown} ${styles.datefilterdropdown}`}>
    //     <span className={`${styles.sortCompanyLabel}`}>
    //         Sort Companies By
    //     </span>
    //     <DropdownButton className={`${styles.companyfilter} companyFilter`}
    // title={this.state.selectedDateFilter} onSelect={evt => { this.dateFilterChange(evt); }}>
    //       <MenuItem eventKey="Date">Date</MenuItem>
    //       <MenuItem eventKey="Name">Name</MenuItem>
    //     </DropdownButton>
    //   </div>
    // )

    render() {
      const { totalCount, companyTags } = this.props;
      const addCompany = JSON.parse(sessionStorage.getItem('addCustomer'));
      return (
        <Grid fluid className={`${styles.grid} ${styles.companyContainer}`}>
          <Row className={`${styles.grid} ${styles.noMargin}`}>
            <Col xs={2} className={`${styles.grid} ${styles.companyFilter}`}>
              <h2 className={styles.filterTitle}>
                <Trans>FILTERS</Trans>
                <span
                  className={styles.clear}
                  role="presentation"
                  onClick={this.clearFilters}
                > <Trans>CLEAR_ALL</Trans> </span>
              </h2>
              <hr className={`${styles.hr_separation}`} />
              <Row className={`${styles.filterItem} m-b-20`}>
                <Col xs={12}>
                  <Scrollbars
                    universal
                    autoHeight
                    autoHeightMin={'calc(100vh - 150px)'}
                    autoHeightMax={'calc(100vh - 150px)'}
                    renderThumbHorizontal={props => <div {...props} className="hide" />}
                    renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
                  >
                    <Row className={`${styles.grid}  m-b-20`}>
                      <Col xs={12}>
                        <div className={`${styles.sortCompanyLabel}`}>
                          <Trans>STATUS</Trans>
                        </div>
                        <div className={`${styles.dropdownSection}`}>
                          <RadioGroup onChange={this.statusFilterChange} value={this.state.selectedStatusFilter}>
                            <Radio className={styles.radioBtn} value={'All'}><Trans>ALL</Trans></Radio>
                            <Radio className={styles.radioBtn} value={'Prospect'}><Trans>PROSPECT</Trans></Radio>
                            <Radio className={styles.radioBtn} value={'Not Interested'}>
                              <Trans>NOT_INTERESTED</Trans>
                            </Radio>
                            <Radio className={styles.radioBtn} value={'Contacted'}><Trans>CONTACTED</Trans></Radio>
                            <Radio className={styles.radioBtn} value={'Lead'}><Trans>LEAD</Trans></Radio>
                            <Radio className={styles.radioBtn} value={'Finalist'}><Trans>FINALIST</Trans></Radio>
                            <Radio className={styles.radioBtn} value={'Client'}><Trans>CLIENT</Trans></Radio>
                          </RadioGroup>
                        </div>
                      </Col>
                    </Row>
                    {/* Tags Filter */}
                    <Row className={`${styles.grid}  m-b-20`}>
                      <Col xs={12}>
                        <div className={`${styles.sortCompanyLabel}`}>
                          <Trans>TAGS</Trans>
                        </div>
                        { companyTags && this.renderTags()}
                      </Col>
                    </Row>
                    {/* Account Owner Filter */}
                    <Row className={`${styles.grid}  m-b-20`}>
                      <Col xs={12}>
                        <div className={`${styles.sortCompanyLabel}`}>
                          <Trans>OWNERS</Trans>
                        </div>
                        <Multiselect
                          data={this.props.salesOwners}
                          onChange={this.handleSalesOwnerChange}
                          onSearch={this.onSalesOwnersSearch}
                          open={this.state.isOwnerOpen}
                          value={this.state.selectedSalesOwners}
                          textField="fullName"
                          messages={{
                            emptyList: i18n.t('NO_RESULTS_FOUND'),
                            emptyFilter: i18n.t('NO_RESULTS_FOUND')
                          }}
                          placeholder={i18n.t('placeholder.SELECT_ACCOUNT_OWNERS_TO_FILTER')}
                        />
                      </Col>
                    </Row>
                  </Scrollbars>
                </Col>
              </Row>
            </Col>
            <Col xs={10} className={`${styles.grid} ${styles.companyMain}`}>
              <Helmet title="Companies" />
              <Loader loading={this.props.loading} />
              <Row className="m-t-20">
                <Col xs={8} style={{ marginTop: '8px' }}>
                  <span className={`${styles.company}`}><Trans>COMPANIES</Trans></span>
                  <span className={`${styles.companyCount}`}>
                    {` (${totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${totalCount > 1 ?
                      i18n.t('COMPANIES') : i18n.t('COMPANY')})`
                    }
                  </span>
                </Col>
                <Col xs={4}>
                  <NewPermissible operation={{ operation: 'CREATE_COMPANY', model: 'customer' }}>
                    <button
                      onClick={this.addNewCompany}
                      className={`${styles.createCompanyButton} button-primary`}
                    >
                      <span className={styles.btncompanyName}>
                        <Trans>CREATE_COMPANY</Trans>
                      </span>
                    </button>
                  </NewPermissible>
                </Col>
              </Row>
              <Row className="m-t-20">
                <Col xs={6}>
                  <NewPermissible operation={{ operation: 'COMPANY_SEARCH', model: 'customer' }}>
                    <SearchBar
                      searchClassName="search-input"
                      isCustomerSearch="yes"
                      reset={e => this.resetSearch(e)}
                      handleOnChange={e => this.setSearchTerm(e)}
                      inpValue={this.state.searchStrVal}
                      classNames={styles.searchBarWidth}
                      placeholder={i18n.t('SEARCH_BY_NAME')}
                      handleOnKeyUp={() => { }}
                    />
                  </NewPermissible>
                </Col>
                <Col xs={6}>
                  {this.renderPagination()}
                </Col>
              </Row>

              <Row className="m-t-30">
                <Col xs={12} className="openingsTable">
                  {this.renderCompaniesInfo()}
                </Col>
              </Row>
              {
                this.state.openModal ?
                  <EditCustomer
                    form="EditCustomer"
                    initialValues={addCompany}
                    closeModal={this.closeModal}
                  /> : ''
              }
            </Col>
          </Row>
        </Grid>
      );
    }
}
