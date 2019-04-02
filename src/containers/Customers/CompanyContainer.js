import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { reduxForm, getFormValues, propTypes } from 'redux-form';
import { push as pushState } from 'react-router-redux';
import { Col, Row, Tab, Tabs, Modal } from 'react-bootstrap';
// import _ from 'underscore';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { isPristine, reset, change } from 'redux-form';
import lodash from 'lodash';
import { EmailActivity } from 'components';
import CompanyOpenings from './CompanyOpenings';
import SaveContact from './SaveContact';
import ActivityHistories from './../../components/Activity/ActivityHistories';
import ActivityLogger from '../../components/ActivityLogger/ActivityLogger';
import CompanyOverview from './CompanyOverview';
import CompanyContacts from './CompanyContacts';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { loadCompanyById, loadOpeningsForCompany, saveCustomer, logActivity,
  loadLogActivityForCompany, loadActivityHistoryForCompany,
  loadEmailsForCompanyById, emptyCompanyOpenings,
  getSalesRepList, getCompanyTags, createCompanyTag } from '../../redux/modules/customers';
import { updateDeactivation } from '../../redux/modules/users/users';
import Loader from '../../components/Loader';
import styles from './Companies.scss';
import Constants from '../../helpers/Constants';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';
import { trimExtraSpaces, trimTrailingSpace } from '../../utils/validation';

@connect((state, route) => ({
  companyId: route.params.id,
  company: state.customers.company,
  openings: state.customers.companyOpenings,
  deactivationResponse: state.users.deactivationResponse,
  router: route.router,
  route: route.route,
  categories: state.jobCategory.categoryList || {},
  isSaveOpeningPristine: isPristine('StepSaveOpening')(state),
  isSaveContactPristine: isPristine('SaveContact')(state),
  contactFormData: state.form.SaveContact,
  openingFormData: state.form.StepSaveOpening,
  formData: state.form.CompanyOverview,
  formDataPristine: isPristine('CompanyOverview')(state),
  companyHistoryLoading: state.customers.companyHistoryLoading,
  companyHistoryLoaded: state.customers.companyHistoryLoaded,
  companyActivitiesLoading: state.customers.companyActivitiesLoading,
  companyEmailsLoading: state.customers.companyEmailsLoading,
  // companyLoading: state.customers.companyLoading,
  jobLoading: state.customers.jobLoading,
  jobLoaded: state.customers.jobLoaded,
  user: state.auth.user,
  companyTags: state.customers.companyTags
}), { loadCompanyById,
  loadOpeningsForCompany,
  emptyCompanyOpenings,
  pushState,
  saveCustomer,
  reset,
  logActivity,
  updateDeactivation,
  loadLogActivityForCompany,
  loadActivityHistoryForCompany,
  loadEmailsForCompanyById,
  getSalesRepList,
  getCompanyTags,
  createCompanyTag,
  change })
export default class CompanyContainer extends Component {
  static propTypes = {
    loadCompanyById: PropTypes.func,
    loadEmailsForCompanyById: PropTypes.func.isRequired,
    loadOpeningsForCompany: PropTypes.func,
    loadLogActivityForCompany: PropTypes.func,
    loadActivityHistoryForCompany: PropTypes.func,
    companyEmailsLoading: PropTypes.bool,
    companyHistoryLoading: PropTypes.bool,
    companyHistoryLoaded: PropTypes.bool,
    deactivationResponse: PropTypes.object,
    companyActivitiesLoading: PropTypes.bool,
    emptyCompanyOpenings: PropTypes.func,
    saveCustomer: PropTypes.func,
    logActivity: PropTypes.func,
    contacts: PropTypes.array,
    companyId: PropTypes.string,
    updateDeactivation: PropTypes.func.isRequired,
    isSaveOpeningPristine: PropTypes.bool,
    openingFormData: PropTypes.object,
    isSaveContactPristine: PropTypes.bool,
    contactFormData: PropTypes.object,
    company: PropTypes.object,
    pushState: PropTypes.func,
    openings: PropTypes.object,
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    // companyLoading: PropTypes.bool.isRequired,
    jobLoading: PropTypes.bool,
    jobLoaded: PropTypes.bool,
    formData: PropTypes.object,
    formDataPristine: PropTypes.bool.isRequired,

    reset: PropTypes.func.isRequired,
    location: PropTypes.any,
    getSalesRepList: PropTypes.func.isRequired,
    user: PropTypes.object,
    getCompanyTags: PropTypes.func.isRequired,
    createCompanyTag: PropTypes.func.isRequired,
    companyTags: PropTypes.array.isRequired,
    change: PropTypes.func.isRequired
  }

  static defaultProps = {
    company: null,
    openModal: false,
    companyEmailsLoading: false,
    companyHistoryLoading: false,
    companyHistoryLoaded: false,
    companyActivitiesLoading: false,
    loadCompanyById: null,
    deactivationResponse: null,
    loadEmailsForCompanyById: null,
    loadOpeningsForCompany: null,
    loadLogActivityForCompany: null,
    isSaveOpeningPristine: null,
    openingFormData: null,
    isSaveContactPristine: null,
    contactFormData: null,
    emptyCompanyOpenings: null,
    saveCustomer: null,
    logActivity: null,
    companyId: '',
    openings: {},
    pushState: null,
    formData: {},
    location: null,
    contacts: [],
    activities: [],
    jobLoading: false,
    jobLoaded: false,
    histories: [],
    totalActivityCount: 0,
    totalHistoryCount: 0,
    loadActivityHistoryForCompany: null,
    salesOwners: [],
    user: null,
    companyTags: []
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isOpeningsTabClick: false,
      searchText: '', // keeps the copy of searchStrVal in CompanyOpenings component
      isSnackbarEnabled: false,
      logDescription: '',
      company: {},
      submittingForm: false,
      openings: {},
      contacts: [],
      activeKey: 0,
      companyOpeningFilterObj: {},
      isContactsChanged: false,
      activities: [],
      histories: [],
      resultsPerPage: 10,
      page: 1,
      reachedCount: false,
      totalCount: 0,
      emails: {},
      hasSubmitSucceeded: false,
      companyLoading: false,
      initialContactValues: {},
      noMoreEmails: false,
      totalActivityCount: 0,
      totalHistoryCount: 0,
      randomId: Math.random().toString(36).substring(7),
      selectedSalesOwners: [],
      salesOwners: [],
      selectedTags: [],
      newTags: [],
      showCreateTag: false,
      tag: {
        name: '',
        description: null
      },
      isOwnerChanged: false,
      isTagChanged: false,
      oldCompany: {},
      isTagSubmitted: false,
      tagSkip: 0,
      tagLimit: 10,
      tagSearchTerm: '',
      canGetTags: true,
      isTagScrollEnabled: false,
      removedSalesOwners: [],
      previousValues: [],
    };
    this.handleActivityLog = this.handleActivityLog.bind(this);
    this.loadLogActivityForCompany = this.loadLogActivityForCompany.bind(this);
    this.loadActivityHistoryForCompany = this.loadActivityHistoryForCompany.bind(this);
  }

  componentWillMount() {
    const { companyId } = this.props;
    const isActivityViewPermitted = NewPermissible.isPermitted({
      operation: 'VIEW_COMPANY_ACTIVITY',
      model: 'customer'
    });
    const isMailHistoryTabsPermitted = NewPermissible.isPermitted({
      operation: 'VIEW_COMPANY_EMAIL',
      model: 'ProspectMails'
    });
    const isCompanyContactPermitted = NewPermissible.isPermitted({
      operation: 'VIEW_COMPANY_CONTACT',
      model: 'customer'
    });
    const isJobopeningsPermitted = NewPermissible.isPermitted({
      operation: 'VIEW_COMPANY_JOBOPENING',
      model: 'customer'
    });
    const isHistoryPermitted = NewPermissible.isPermitted({ operation: 'VIEW_COMPANY_HISTORY', model: 'customer' });
    if (!this.props.location.state && !sessionStorage.getItem('companyActiveKey')) {
      this.setState({
        activeKey: 1
      });
    } else if (this.props.location.state && !this.props.location.state.activeKey
      && !sessionStorage.getItem('companyActiveKey')) {
      this.setState({
        activeKey: 1
      });
    }
    if (companyId && companyId !== 'new') {
      this.loadCompany(companyId);
      this.setState({
        isActivityViewPermitted,
        isMailHistoryTabsPermitted,
        isCompanyContactPermitted,
        isJobopeningsPermitted,
        isHistoryPermitted
      });
    } else {
      this.loadNewCompanydata();
      this.enableSnackbar();
      this.setState({
        openings: {},
        contacts: [],
        isActivityViewPermitted,
        isMailHistoryTabsPermitted,
        isCompanyContactPermitted,
        isJobopeningsPermitted,
        isHistoryPermitted
      });
      this.loadSalesOwners();
    }
    this.loadTags();
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.openingFormData && Object.keys(this.props.openingFormData).length > 0
        && !this.props.isSaveOpeningPristine && !this.state.hasSubmitSucceeded) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      } else if (this.props.formData && Object.keys(this.props.formData).length > 0
        && !this.props.formDataPristine && !this.state.hasSubmitSucceeded) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      } else if (this.props.contactFormData && Object.keys(this.props.contactFormData).length > 0
        && !this.props.isSaveContactPristine && !this.state.hasSubmitSucceeded) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      } else if (this.state.isContactsChanged) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      }
    });
    setTimeout(() => {
      const parentEl = document.getElementById('companyTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const { companyId, company } = this.props;
    if (companyId !== 'new') {
      this.setState({
        openings: nextProps.openings,
        previousValues: company
      });
    }
  }

  componentWillUnmount() {
    this.props.emptyCompanyOpenings();
    document.body.className = document.body.className.replace('model-open', '');
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

  getFullName = users => {
    if (users && users.length === 0) {
      return [];
    }
    return users.map(user => (
      {
        ...user,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`
      }
    )
    );
  };

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
      const parentEl = document.getElementById('companyTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-popup')[0].getElementsByTagName('ul')[0];
        el.addEventListener('scroll', lodash.debounce(this.getTagsOnScroll, 1000));
        this.setState({ isTagScrollEnabled: true });
      }
    }, 100);
  }

  // discardChanges = evt => {
  //   const { companyId } = this.props;
  //   evt.preventDefault();
  //   this.disableSnackbar();
  //   this.props.reset('CompanyOverview');
  //   // this.setState({
  //   //   contacts: this.props.company.contacts
  //   // }, () => {
  //   if (companyId && companyId !== 'new') {
  //     this.setState({
  //       company: {
  //         ...this.props.company
  //       },
  //       contacts: this.props.company.contacts
  //     });
  //   } else {
  //     this.loadNewCompanydata();
  //     this.setState({
  //       contacts: []
  //     });
  //   }
  // }

  checkForSalesRep = user => {
    const salesRep = user.roles.filter(role => role.name === 'Sales Rep');
    return salesRep.length > 0;
  }

  loadSalesOwners = () => {
    this.props.getSalesRepList().then(salesOwners => {
      const { user } = this.props;
      const companySalesOwners = this.state.company.salesOwners || [];
      if (companySalesOwners.length === 0 && this.checkForSalesRep(user)) {
        companySalesOwners.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        });
      }
      this.setState({
        salesOwners: this.getFullName(lodash.uniqBy(salesOwners.concat(companySalesOwners), 'id')),
        selectedSalesOwners: this.getFullName(companySalesOwners)
      });
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_SALES_REPS_LIST'));
      }
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
        selectedTags: [],
        newTags: [],
        tagSkip: 10
      });
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
      }
    });
  }

  loadNewCompanydata = () => {
    const query = this.props.location.query;
    const data = {
      city: '',
      skills: '',
      country: '',
      name: query.name ? query.name : '',
      domain: query.domain ? query.domain : '',
      industry: '',
      description: '',
      updated_user: '',
      linkedin: '',
      isClustered: false,
      phone: '',
      state: '',
      postalCode: '',
      address: '',
      employeeCount: '',
      is_contact_added: '',
      turnover: '',
      id: '',
      isUserAdded: false,
      notifyDate: '',
      isActive: true,
      status: 'Prospect',
      salesOwners: [],
      tags: [],
      selectedTags: []
    };
    // this.props.openings = [];
    this.setState({
      company: {
        ...data
      },
      oldCompany: {
        ...data
      },
      openings: {},
      activities: [],
      histories: []
    });
  }

  confirmDiscardChanges = evt => {
    const toastrConfirmOptions = {
      onOk: () => { this.discardChanges(evt); },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    };
    toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
  }

  discardChanges = evt => {
    const { companyId, user } = this.props;
    evt.preventDefault();
    this.disableSnackbar();
    this.props.reset('CompanyOverview');
    // this.setState({
    //   contacts: this.props.company.contacts
    // }, () => {
    if (companyId && companyId !== 'new') {
      this.setState({
        company: {
          ...this.props.company
        },
        contacts: this.props.company.contacts,
        isContactsChanged: false,
        selectedSalesOwners: this.props.company.salesOwners,
        selectedTags: this.props.company.tags,
        isOwnerChanged: false,
        isTagChanged: false
      });
    } else {
      this.loadNewCompanydata();
      const companySalesOwners = this.state.company.salesOwners || [];
      const tags = this.state.company.tags || [];
      if (companySalesOwners.length === 0 && this.checkForSalesRep(user)) {
        companySalesOwners.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        });
      }
      this.setState({
        contacts: [],
        selectedSalesOwners: this.getFullName(companySalesOwners),
        selectedTags: tags
      });
    }
  }

  loadCompany = companyId => {
    this.setState({ companyLoading: true });
    this.props.loadCompanyById(companyId).then(list => {
      this.setState({
        company: list,
        oldCompany: list,
        contacts: list.contacts.slice()
      }, () => {
        this.setState({ companyLoading: false, selectedTags: list.tags });
        if (list.isUserAdded) {
          if (this.props.location.state && this.props.location.state.activeKey) {
            this.handleSelect(this.props.location.state.activeKey);
          } else if (sessionStorage.getItem('companyActiveKey')) {
            if (sessionStorage.getItem('openingFilterObj')) {
              this.handleSelect(Number(sessionStorage.getItem('companyActiveKey')),
                JSON.parse(sessionStorage.getItem('openingFilterObj')));
              sessionStorage.removeItem('companyActiveKey');
            } else {
              this.handleSelect(Number(sessionStorage.getItem('companyActiveKey')));
              sessionStorage.removeItem('companyActiveKey');
            }
          }
        } else {
          this.setState({
            openings: {}
          });
        }
        this.loadSalesOwners();
      });
    }, err => {
      this.setState({ companyLoading: false });
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_COMPANY_INFO'));
      }
    });
  }

  loadOpeningsForCompany = (companyFilterObj, type) => {
    if (type && companyFilterObj.searchTerm) {
      const filterObj = Object.assign({}, companyFilterObj);
      delete filterObj.searchTerm;
      this.setState({
        companyOpeningFilterObj: filterObj
      });
      this.constructPayload(companyFilterObj);
    } else if (!companyFilterObj.searchTerm && companyFilterObj.searchTerm !== '') {
      this.setState({
        companyOpeningFilterObj: companyFilterObj
      }, () => {
        this.constructPayload(companyFilterObj);
      });
    } else {
      this.constructPayload(companyFilterObj);
    }
  }

  constructPayload = companyFilterObj => {
    if (!companyFilterObj.companyId) {
      companyFilterObj.companyId = this.props.companyId;
    }
    if (companyFilterObj.searchTerm || companyFilterObj.searchTerm === '') {
      this.setState({
        searchText: companyFilterObj.searchTerm
      }, () => {
        this.loadOpenings(companyFilterObj);
      });
    } else {
      this.loadOpenings(companyFilterObj);
    }
  }

  loadOpenings = companyFilterObj => {
    this.props.loadOpeningsForCompany({
      ...companyFilterObj,
      searchTerm: this.state.searchText,
      isFromCompany: true,
      ...this.state.companyOpeningFilterObj }).then(() => {
      this.setState({
        openings: this.props.openings,
      });
    }, err => {
      if (err.error) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_OPENINGS_FOR_THE_COMPANY'));
      }
    }).catch(err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_OPENINGS_FOR_THE_COMPANY'));
    });
  }

  loadLogActivityForCompany = (filter, onScroll) => {
    const { companyId } = this.props;
    if (companyId && companyId !== 'new') {
      const { activities } = this.state;
      filter.companyId = this.props.companyId;
      filter.skip = filter.skip ? filter.skip : 0;
      filter.limit = Constants.RECORDS_PER_PAGE;
      filter.searchTerm = filter.searchTerm ? filter.searchTerm : '';
      this.searchStr = filter.searchTerm;
      this.props.loadLogActivityForCompany(filter).then(data => {
        if (filter.isEdit || !onScroll) {
          this.setState({
            activities: [...data.response],
            totalActivityCount: data.totalCount,
            onInitialLoad: false
          });
        } else {
          this.setState({
            activities: [...activities, ...data.response],
            totalActivityCount: data.totalCount,
            onInitialLoad: false
          });
        }
      }, err => {
        if (err.error) {
          toastrErrorHandling(err.error, i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_LOAD_ACTIVITIES_FOR_THE_COMPANY'));
        }
      }).catch(err => {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_ACTIVITIES_FOR_THE_COMPANY'));
      });
    }
  }

  loadActivityHistoryForCompany = filter => {
    const { companyId } = this.props;
    if (companyId && companyId !== 'new') {
      const { histories } = this.state;
      filter.companyId = this.props.companyId;
      filter.skip = filter.skip ? filter.skip : 0;
      filter.limit = Constants.RECORDS_PER_PAGE;
      filter.searchTerm = filter.searchTerm ? filter.searchTerm : '';
      this.props.loadActivityHistoryForCompany(filter).then(data => {
        let historyList = [];
        if (filter.skip === 0) {
          historyList = [...data.response];
        } else {
          historyList = [...histories, ...data.response];
        }
        this.setState({
          histories: historyList,
          totalHistoryCount: data.totalCount,
          onInitialLoad: false
        });
      }, err => {
        if (err.error) {
          toastrErrorHandling(err.error, i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_LOAD_ACTIVITY_HISTORIES_FOR_THE_COMPANY'));
        }
      }).catch(err => {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_ACTIVITY_HISTORIES_FOR_THE_COMPANY'));
      });
    }
  }

  changeContactView = (evt, contact) => {
    if (evt) {
      evt.preventDefault();
    }
    if (contact) {
      this.setState({
        initialContactValues: contact
      });
    } else {
      this.setState({
        initialContactValues: {}
      });
    }
    this.setState({
      isOpen: !this.state.isOpen
    }, () => {
      if (this.state.isOpen) {
        document.body.className = `${document.body.className} model-open`;
      } else {
        document.body.className = document.body.className.replace('model-open', '');
      }
    });
  }

  saveCustomer = evt => {
    this.setState({
      submittingForm: true
    });
    evt.preventDefault();
    this.disableSnackbar();
    const savedContacts = this.state.contacts;
    // to get salutation as string instead of an object to store in db
    if (savedContacts.length > 0) {
      savedContacts.forEach(contact => {
        if (contact.salutation) {
          contact.salutation = contact.salutation.name;
        }
        if (contact.isRandomId) {
          delete contact.isRandomId;
          delete contact.id;
        }
      });
    }
    const { previousValues } = this.state;
    const deviceDetails = JSON.parse(localStorage.getItem('deviceDetails'));
    const customer = trimExtraSpaces(this.props.formData.values);
    const deletedSalesOwners = lodash.differenceBy(this.state.oldCompany.salesOwners, customer.salesOwners, 'id');
    customer.salesOwners = customer.salesOwners;
    customer.deletedSalesOwners = deletedSalesOwners;
    customer.tags = customer.tags;
    if (!customer.isUserAdded) {
      customer.deletedSalesOwners = [];
    }
    if (!customer.status) {
      customer.status = 'Prospect';
    }
    this.props.saveCustomer({
      customer,
      previousValues,
      deviceDetails,
      contacts: savedContacts
    }).then(customers => {
      this.setState({
        hasSubmitSucceeded: true,
        submittingForm: false,
        isContactsChanged: false,
        isOwnerChanged: false,
        isTagChanged: false
      }, () => {
        if (this.props.companyId === 'new') {
          this.props.pushState({ pathname: `/Company/${customers.customer.id}` });
        } else {
          // Company result not updated instantly
          setTimeout(() => this.loadCompany(customers.customer.id), 1000);
        }
        if (this.state.removedSalesOwners.length > 0) {
          this.state.removedSalesOwners.forEach(eachUser => {
            localStorage.setItem('removedData',
              JSON.stringify({
                tab: 'companies',
                id: customers.customer.id,
                userId: eachUser.id
              }));
            localStorage.removeItem('removedData');
          });
        }
        toastr.success(i18n.t('successMessage.SAVED'),
          i18n.t('successMessage.THE_COMPANY_INFO_HAS_BEEN_SAVED_SUCCESSFULLY'));
      });
    }, err => {
      if (err) {
        if (this.props.companyId === 'new') {
          toastrErrorHandling(err.error, i18n.t('ERROR'), i18n.t('errorMessage.COULD_NOT_CREATE_COMPANY'));
        } else {
          toastrErrorHandling(err.error, i18n.t('ERROR'), i18n.t('errorMessage.COULD_NOT_UPDATE_COMPANY'));
        }
      }
      this.setState({
        submittingForm: false
      });
    });
  }

  dataChanged = data => {
    this.enableSnackbar();
    if (lodash.isString(data)) {
      this.setState({
        company: {
          ...this.state.company,
          employeeCount: data
        }
      });
    } else {
      this.setState({
        company: {
          ...this.state.company,
          ...data
        }
      });
    }
  }

  viewCompanyDetails = data => {
    if (data.id) {
      this.loadCompany(data.id);
    }
  }

  saveContact = contact => {
    const contactsArr = this.state.contacts.slice();
    if (contact && contact.id) {
      contactsArr.forEach((contactAr, index) => {
        if (contactAr.id === contact.id) {
          contactsArr.splice(index, 1);
        }
      });
    } else {
      contact.id = this.state.randomId;
      contact.isRandomId = true;
      const rand = Math.random().toString(36).substring(7);
      this.setState({
        randomId: rand
      });
    }

    // contactsArr.push(contact);
    this.setState({
      isContactsChanged: true,
      contacts: [contact, ...contactsArr]
    });
    this.enableSnackbar();
  };

  enableSnackbar = () => {
    this.setState({ isSnackbarEnabled: true });
  }

  disableSnackbar = () => {
    this.setState({ isSnackbarEnabled: false });
  }

  isSaveDisabled = () => {
    const { formData } = this.props;
    if (formData && formData.syncErrors) {
      return true;
    }
    return false;
  }

  // Handle sales owner selection
  handleValueChange = values => {
    const deletedUsers = lodash.differenceWith(this.state.selectedSalesOwners, values, lodash.isEqual);
    if (deletedUsers.length > 0) {
      this.state.removedSalesOwners.push(deletedUsers[0]);
    }
    this.setState({
      selectedSalesOwners: values,
      isOwnerChanged: true,
      removedSalesOwners: this.state.removedSalesOwners
    });
    this.enableSnackbar();
    this.props.change('CompanyOverview', 'salesOwners', values);
  }

  handleTagChange = tags => {
    this.setState({
      selectedTags: tags,
      isTagChanged: true,
      tagSkip: 0,
      tagSearchTerm: '',
      canGetTags: true,
      isTagScrollEnabled: true
    }, () => {
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
    this.enableSnackbar();
    this.props.change('CompanyOverview', 'tags', tags);
  }

  handleActivityLog = (data, callback) => {
    data.companyId = this.state.company.id;
    data.createdBy = this.props.user.id;
    data.firstName = this.props.user.firstName;
    this.props.logActivity(data).then(activity => {
      toastr.success(i18n.t('successMessage.LOGGED_SUCCESSFULLY'),
        `${i18n.t('ACTIVITY')} - ${activity.type} ${i18n.t('successMessage.SAVED_SUCCESSFULLY')}`);
      this.loadLogActivityForCompany({ searchTerm: this.searchStr });
      callback();
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_SAVE_ACTIVITY'));
      }
    });
  }

  handleSelect = (key, openingFilterObj) => {
    if (key === 2 && openingFilterObj.target) {
      // made true so the search term can be cleared
      this.setState({
        isOpeningsTabClick: true
      });
    }
    const { company } = this.state;
    this.setState({ activeKey: key, showFilters: false, searchText: '' });
    this.props.reset('CompanyOpeningFilter');
    if (company.isUserAdded) {
      switch (key) {
        case 2:
          if (openingFilterObj && !openingFilterObj.target) {
            this.loadOpeningsForCompany(openingFilterObj, 'storageObj');
          } else {
            this.loadOpeningsForCompany({});
          }
          break;
        case 3:
          break;
        case 4:
          this.setState({
            onInitialLoad: true,
            activities: [],
            histories: []
          }, () => {
            this.loadLogActivityForCompany({});
          });
          break;
        case 5:
          this.setState({
            onInitialLoad: true,
            activities: [],
            histories: []
          }, () => {
            this.loadActivityHistoryForCompany({});
          });
          break;
        default:
          break;
      }
    }
  }

  editLog = value => {
    this.setState({
      logDescription: value
    });
  }

  /**
   * this is invoked when openings tab is clicked to change the flag
   *  isOpeningsTabClick to false
   */
  refreshOpenings = () => {
    this.setState({
      isOpeningsTabClick: false
    });
  }

  loadCompanyEmails = (filter, onScroll) => {
    filter.companyId = this.props.companyId;
    this.props.loadEmailsForCompanyById(filter).then(emailList => {
      let emails = {};
      let noMoreEmails = false;
      if (Object.keys(emailList).length === 0) {
        emails = onScroll ? { ...this.state.emails } : {};
        noMoreEmails = true;
      } else {
        const reversedEmailList = {};
        Object.keys(emailList).forEach(key => {
          reversedEmailList[key] = lodash.reverse(emailList[key]);
        });
        if (!onScroll) {
          emails = { ...reversedEmailList };
        } else {
          emails = { ...reversedEmailList, ...this.state.emails };
        }
      }
      this.setState({
        noMoreEmails,
        emails
      });
    }, err => {
      if (err.error) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_EMAIL_LIST_FOR_THE_COMPANY'));
      }
    }).catch(err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_EMAIL_LIST_FOR_THE_COMPANY'));
    });
  }

  saveBtnText = company => {
    if (!company.id && company.isUserAdded) {
      return i18n.t('SAVE_AND_ADD_COMPANY_AS_PROSPECT');
    } else if (this.state.isSnackbarEnabled && company.id && !company.isUserAdded) {
      return i18n.t('SAVE_AND_ADD_COMPANY_AS_PROSPECT');
    } else if (company.id && !company.isUserAdded) {
      return i18n.t('ADD_COMPANY_AS_PROSPECT');
    }
    return i18n.t('SAVE');
  }

  saveBtnTitle = formData => {
    const company = formData.values;
    const syncErrors = formData.syncErrors;
    if (company) {
      if (!company.city && !company.country && !company.name) {
        return i18n.t('tooltipMessage.PLEASE_ENTER_REQUIRED_FIELDS');
      }
      if (company.name && company.country && !company.city) {
        return i18n.t('tooltipMessage.PLEASE_ENTER_CITY_TO_SAVE');
      }
      if (company.name && company.city && !company.country) {
        return i18n.t('tooltipMessage.PLEASE_ENTER_COUNTRY_TO_SAVE');
      }
      if (company.name && !company.city && !company.country) {
        return i18n.t('tooltipMessage.PLEASE_ENTER_COUNTRY_CITY_TO_SAVE');
      }
      if (!company.name || (this.state.selectedSalesOwners.length === 0)) {
        return i18n.t('tooltipMessage.PLEASE_ENTER_REQUIRED_FIELDS');
      }
      if (syncErrors && syncErrors.domain) {
        return i18n.t('tooltipMessage.PLEASE_ENTER_VALID_DOMAIN');
      }
    }
    return '';
  }

  changeFilterView = evt => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      showFilters: !this.state.showFilters
    });
  }

  toggleCreateTagModal = () => {
    const tag = { name: '', description: null };
    this.setState(prevState => (
      { showCreateTag: !prevState.showCreateTag, tag, isTagSubmitted: false }
    ));
  }

  updateTag = (e, key) => {
    const { tag } = this.state;
    const value = e.target.value.replace(/\s\s+/g, ' ');
    if (/^[a-zA-Z0-9\s]+$/i.test(value) || value === '') {
      if (value) {
        tag[key] = trimTrailingSpace(value);
      } else {
        tag[key] = '';
      }
      this.setState({ tag });
    }
  }

  checkSubmit = e => {
    const { isTagSubmitted, tag } = this.state;
    if (e.charCode === 13 && !isTagSubmitted && tag.name.trim() !== '') {
      e.preventDefault();
      e.stopPropagation();
      this.saveCompanyTag();
    }
  }

  saveCompanyTag = () => {
    const { tag } = this.state;
    this.setState({ isTagSubmitted: true });
    this.props.createCompanyTag(tag).then(res => {
      this.props.change('CompanyOverview', 'tags', [...this.state.selectedTags, res]);
      this.setState(prevState => ({
        tag: {
          name: '',
          description: null
        },
        showCreateTag: false,
        selectedTags: [...prevState.selectedTags, res],
        isTagSubmitted: true,
        canGetTags: true
      })
      );
      this.enableSnackbar();
      toastr.success(i18n.t('successMessage.SAVED'),
        i18n.t('successMessage.SAVED_TAG_SUCCESSFULLY'));
    }, err => {
      this.setState({
        isTagSubmitted: false
      });
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_SAVE_TAG'));
    });
  }

  renderCreateTag = () => {
    const { showCreateTag, tag, isTagSubmitted } = this.state;
    return (
      <Modal
        show={showCreateTag}
        onHide={this.toggleCreateTagModal}
        style={{ display: 'block', margin: '150px auto' }}
      >
        <Modal.Header className={`${styles.modal_header_color}`}>
          <Modal.Title>
            <Row className="clearfix">
              <Col sm={12} className={styles.modal_title}>
                <span>
                  <Trans>
                    CREATE_NEW_TAG
                  </Trans>
                </span>
                <span
                  role="button"
                  tabIndex="-1"
                  className="close_btn right no-outline"
                  onClick={this.toggleCreateTagModal}
                >
                  <i className="fa fa-close" />
                </span>
              </Col>
            </Row>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.m_t_b_15}>
            <label className={styles.hdr_label} htmlFor="name">
              <Trans>NAME</Trans>
              <span className="required_color">*</span>
            </label>
            <div>
              <input
                type="text"
                className="inline"
                id="name"
                placeholder={i18n.t('TAG_NAME')}
                onChange={e => this.updateTag(e, 'name')}
                value={tag.name}
                onKeyPress={e => this.checkSubmit(e)}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </div>
          </div>
          {/* <div className={styles.m_t_b_15}>
            <label className={styles.hdr_label} htmlFor="name">
              <Trans>DESCRIPTION</Trans>
            </label>
            <div>
              <textarea
                className="inline"
                placeholder={i18n.t('TAG_DESCRIPTION')}
                onKeyDown={e => this.updateTag(e, 'description')}
              />
            </div>
          </div> */}
        </Modal.Body>
        <Modal.Footer>
          <Col lg={12} md={12} sm={12} xs={12} className={`p-0 p-t-15 p-b-15 ${styles.ats_btn_section}`}>
            <button
              className={`btn button-secondary-hover ${styles.w_100}`}
              type="submit"
              onClick={this.toggleCreateTagModal}
            >
              <span className={styles.btn_text}><Trans>CANCEL</Trans></span>
            </button>
            <button
              className={`btn button-primary ${styles.m_l_15} ${styles.w_100}`}
              type="submit"
              disabled={!tag.name.trim() || isTagSubmitted}
              onClick={this.saveCompanyTag}
            >
              <span className={styles.btn_text}><Trans>ADD</Trans></span>
            </button>
          </Col>
        </Modal.Footer>
      </Modal>
    );
  }

  renderNoHistoryFound = activityType => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}>
          <div><Trans>NO</Trans> {activityType} <Trans>FOUND</Trans></div>
        </Row>
      </Col>
    );
    const loadingContent = (
      <Col className={styles.no_results_found}>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>Loading</Trans> !</div></Row>
      </Col>
    );
    if (this.props.companyHistoryLoading || this.props.companyActivitiesLoading) {
      return loadingContent;
    }
    return NoResultsFound;
  }
  render() {
    const { companyId, companyEmailsLoading, companyHistoryLoading,
      companyActivitiesLoading, route, router, formDataPristine, companyHistoryLoaded } = this.props;
    const logData = {
      type: ['Log a call', 'Log an email', 'Face to face', 'Log a note'],
      handleSubmit: this.handleActivityLog,
      logDate: new Date(),
      logPlaceHolder: 'Select a log',
      defaultLogValue: 'Log a note',
      requiredTypeForOutCome: 'Log a call'
    };
    const { formData, user } = this.props;
    const { isSnackbarEnabled, company, contacts, openings,
      activities, totalActivityCount, totalHistoryCount, histories, emails,
      isMailHistoryTabsPermitted, isActivityViewPermitted, onInitialLoad,
      selectedSalesOwners, salesOwners, isContactsChanged, isCompanyContactPermitted,
      isJobopeningsPermitted, isHistoryPermitted, logDescription, submittingForm,
      selectedTags, showCreateTag, companyTags, isTagChanged } = this.state;
    company.salesOwners = company.salesOwners ? company.salesOwners : [];
    const isCompanyNew = (companyId && companyId === 'new');
    const isCompanyAdded = !isCompanyNew ? (company && company.isUserAdded) : false;
    return (
      <div className="company_container">
        <Helmet title={i18n.t('COMPANY')} />
        <Loader loading={this.props.jobLoading} styles={{ position: 'fixed' }} />
        <Scrollbars
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(100vh - 65px)'}
          autoHeightMax={'calc(100vh - 65px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <Row className="m-0 p-t-25" style={{ display: 'flex' }}>
            <Col md={4} xs={12}>
              {Object.keys(company).length !== 0 &&
              <CompanyOverview
                company={company}
                loadCompany={this.loadCompany}
                initialValues={company}
                changeContactView={this.changeContactView}
                handleChange={this.enableSnackbar}
                contacts={contacts}
                isSnackbarEnabled={isSnackbarEnabled}
                salesOwners={salesOwners}
                selectedSalesOwners={selectedSalesOwners}
                handleValueChange={this.handleValueChange}
                tags={companyTags}
                selectedTags={selectedTags}
                toggleCreateTagModal={this.toggleCreateTagModal}
                handleTagChange={this.handleTagChange}
                handleSearch={this.onTagSearch}
                tagListCreate={this.tagListCreate}
                isTagChanged={isTagChanged}
              />}
            </Col>
            {showCreateTag && this.renderCreateTag()}
            <Col
              lg={8}
              className={`${styles.company_tabs} ${styles.filter_outer}`}
            >
              <Tabs
                id="company_tab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.activeKey}
                onSelect={this.handleSelect}
                className={`${styles.tab_section} ${styles.company_fixed_tabs} shadow_one`}
                style={{ height: '100%' }}
              >
                {isCompanyContactPermitted && <Tab eventKey={1} title={<Trans>CONTACTS</Trans>}>
                  {Object.keys(company).length !== 0 &&
                    <CompanyContacts
                      contacts={contacts}
                      loadCompany={this.loadCompany}
                      changeContactView={this.changeContactView}
                      company={company}
                      user={user}
                      loading={this.state.companyLoading}
                    />
                  }
                </Tab>
                }
                {isJobopeningsPermitted && <Tab eventKey={2} title={<Trans>JOB_OPENINGS</Trans>}>
                  {Object.keys(company).length !== 0 && this.state.activeKey === 2 &&
                    <CompanyOpenings
                      isOpeningsTabClick={this.state.isOpeningsTabClick}
                      refreshOpenings={this.refreshOpenings}
                      loadOpeningsForCompany={this.loadOpeningsForCompany}
                      companyOpenings={openings}
                      emptyCompanyOpeningFilters={() => this.setState({
                        companyOpeningFilterObj: {}
                      })}
                      companyOpeningFilterObj={this.state.companyOpeningFilterObj}
                      showFilters={this.state.showFilters}
                      changeFilterView={this.changeFilterView}
                      company={company}
                      jobLoading={this.props.jobLoading}
                      jobLoaded={this.props.jobLoaded}
                    />
                  }
                </Tab>
                }
                {/* <Permissible operation="Emails_log_activity_History"> */}
                {
                  isMailHistoryTabsPermitted &&
                  <Tab eventKey={3} title={<Trans>EMAILS</Trans>}>
                    {isCompanyAdded && this.state.activeKey === 3 &&
                    <EmailActivity
                      company={company}
                      companyEmailsLoading={companyEmailsLoading}
                      from={'company'}
                      emails={emails}
                      noMoreEmails={this.state.noMoreEmails}
                      loadEmails={this.loadCompanyEmails}
                      acl={{ operation: 'COMPANY_SEND_EMAIL', model: 'customer' }}
                      showSearchBar
                      autoHeight="220px"
                    />
                    }
                  </Tab>
                }
                {isActivityViewPermitted &&
                <Tab eventKey={4} title={<Trans>ACTIVITIES</Trans>}>
                  {isCompanyAdded && this.state.activeKey === 4 ?
                    <div>
                      <NewPermissible operation={{ operation: 'COMPANY_LOG_ACTIVITY', model: 'customer' }}>
                        <ActivityLogger
                          route={route}
                          router={router}
                          isSnackbarEnabled={this.state.isSnackbarEnabled}
                          params={logData}
                          actionType="LOG_ACTIVITY"
                          description={logDescription}
                          editLog={this.editLog}
                        />
                      </NewPermissible>
                      <Loader loading={companyActivitiesLoading} styles={{ position: 'absolute', top: '35%' }} />
                      <ActivityHistories
                        currrentPage={onInitialLoad ? 0 : null}
                        activities={activities}
                        hasSubmitSucceeded={this.state.hasSubmitSucceeded}
                        totalCount={totalActivityCount}
                        companyActivitiesLoading={companyActivitiesLoading}
                        companyHistoryLoading={companyHistoryLoading}
                        company={company}
                        loadActivity={this.loadLogActivityForCompany}
                        activityType="Log"
                        companyHistoryLoaded={companyHistoryLoaded}
                        showSearchBar
                      />
                    </div>
                    : <div className={styles.noResultsFoundContainer}>
                      {this.renderNoHistoryFound('Activity')}
                    </div>
                  }
                </Tab>
                }
                {isHistoryPermitted &&
                <Tab eventKey={5} title={<Trans>HISTORY</Trans>}>
                  {isCompanyAdded && this.state.activeKey === 5 ?
                    <Row className="p-25">
                      <Loader
                        loading={companyHistoryLoading}
                        styles={{ position: 'absolute', top: '30%' }}
                      />
                      <Col lg={12}>
                        <ActivityHistories
                          activities={histories}
                          from={'company'}
                          currrentPage={onInitialLoad ? 0 : null}
                          companyHistoryLoading={companyHistoryLoading}
                          totalCount={totalHistoryCount}
                          loadActivity={this.loadActivityHistoryForCompany}
                          activityType="ALL"
                          company={company}
                          companyHistoryLoaded
                          showSearchBar
                        />
                      </Col>
                    </Row>
                    : <div className={styles.noResultsFoundContainer}>
                      {this.renderNoHistoryFound('History')}
                    </div>
                  }
                </Tab>
                }
                {/* </Permissible> */}
              </Tabs>
            </Col>
          </Row>
        </Scrollbars>

        {
          this.state.isOpen &&
          <SaveContact
            companyContacts={contacts}
            isOpen={this.state.isOpen}
            changeContactView={this.changeContactView}
            initialContactValues={this.state.initialContactValues}
            saveContact={this.saveContact}
          />
        }
        {
          (isSnackbarEnabled || (company.id && !company.isUserAdded) ||
          (company.salesOwners.length === 0 && selectedSalesOwners.length > 0)) &&
          <Snackbar
            company={this.state.company}
            saveCustomer={this.saveCustomer}
            discardChanges={this.confirmDiscardChanges}
            saveDisabled={this.isSaveDisabled()}
            formData={formData}
            saveBtnText={this.saveBtnText}
            title={this.saveBtnTitle(formData)}
            isSnackbarEnabled={isSnackbarEnabled}
            selectedSalesOwners={selectedSalesOwners}
            disabled={(formDataPristine && !isContactsChanged)}
            submittingForm={submittingForm}
          />
        }
      </div>
    );
  }
}


const Snackbar = properties => {
  const { discardChanges, formData, company, title, saveBtnText, selectedSalesOwners, disabled,
    submittingForm } = properties;
  let hasError = false;
  if (formData && formData.syncErrors) {
    hasError = true;
  }
  return (
    <div className={` ${styles.snackbar} is-animated`} >
      {
        saveBtnText(company) === i18n.t('SAVE') &&
          i18n.t('warningMessage.YOU_HAVE_UNSAVED_CHANGES')
      }
      <div className={`${styles.block}`}>
        <button
          className={'btn btn-border button-primary p-lr-20'}
          style={{ fontWeight: '400' }}
          onClick={properties.saveCustomer}
          disabled={hasError || selectedSalesOwners.length === 0 || submittingForm}
          title={title}
        >
          {saveBtnText(company)}
        </button>
      </div>
      <div className={`${styles.block} m-t-10`}>
        <button
          className="button-secondary btn btn-border p-lr-20"
          style={{ fontWeight: '400' }}
          disabled={disabled}
          onClick={discardChanges}
        >
          <Trans>RESET</Trans>
        </button>
      </div>
    </div>
  );
};
