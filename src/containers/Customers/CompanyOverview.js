import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues, Field } from 'redux-form';
import { Row, Col, ButtonGroup, MenuItem,
  DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import DropdownList from 'react-widgets/lib/DropdownList';
import { Multiselect } from 'react-widgets';
import lodash from 'lodash';
import moment from 'moment';
import { toastr } from 'react-redux-toastr';
// import DropdownField from '../../components/FormComponents/DropdownList';
// import { getFilterConfig } from '../../formConfig/CompanyOverview';
import { formatDomainName, trimTrailingSpace, euroFormatter } from '../../utils/validation';
import companyValidation from './companyValidation';
import CustomerType from './CustomerType';
import NewPermissible from '../../components/Permissible/NewPermissible';

import styles from './Companies.scss';
import formStyles from '../../components/FormComponents/FormComponents.scss';
import i18n from '../../i18n';
import ArchiveDeleteModal from '../../components/ArchiveDeleteModal/ArchiveDeleteModal';
import { loadArchivalReasons } from '../../redux/modules/profile-search/managecandidates';
import { archiveCompany, unArchiveCompany, loadArchiveDetails,
  extendCompanyArchive } from '../../redux/modules/customers/manageCustomers';
// import DropdownButton from 'antd/lib/dropdown/dropdown-button';

let timeoutId = 0;

const InlineText = properties => {
  const {
    label,
    isRequired,
    input,
    editableInput,
    handleTextOnFocus,
    isEditing,
    meta: { visited, error }
  } = properties;
  const { name, value } = input;
  // const isEditable = editableInput.name === name;
  const isEditable = editableInput;
  const inputStyle = isEditable ?
    { borderBottom: '1px dashed #979797 !important', color: '#172B4D' } :
    { display: 'none', borderBottom: 'none', resize: 'none' };
  const viewStyle = isEditable ?
    { display: 'none' } :
    { paddingTop: '5px',
      paddingLeft: '10px',
      paddingRight: '10px',
      minHeight: '30px',
      borderBottom: '1px dashed #979797',
      color: '#172B4D',
      resize: 'none'
    };
  // const focusUsernameInputField = field => {
  //   if (field) {
  //     field && field.focus();
  //     const length = field.value.length;
  //     field.setSelectionRange(length, length);
  //   }
  // };
  return (
    <Col sm={12} className={`p-b-70 m-r-5 ${styles.capitalize} ${styles.txt_overflow}`}>
      {
        label ?
          <label htmlFor={name}>
            <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
          </label>
          : null
      }
      {value.length > 0 ?
        <div className={formStyles.editInline}>
          <div>
            <textarea
              {...input}
              name={name}
              style={inputStyle}
              onFocus={() => handleTextOnFocus()}
            />
          </div>
          <div
            role="presentation"
            className={isEditable ? 'hide' : `${styles.descView}`}
          >
            {value}
          </div>
          {value.length > 200 ?
            <div
              className={isEditing ? 'hide' : `${styles.descSeeMore}`}
              role="presentation"
              onClick={() => handleTextOnFocus()}
            >
              See more
            </div> : ''
          }
        </div> :
        <div className={formStyles.editInline}>
          <div>
            <textarea
              {...input}
              name={name}
              style={inputStyle}
              // ref={focusUsernameInputField}
            />
          </div>
          <div role="presentation" style={viewStyle}>
            {value}
          </div>
        </div>
      }
      {error && visited && <p className={'text-danger'}>{`${error}`}</p>}
    </Col>
  );
};

const InlineEdit = properties => {
  const { label, isRequired, input, editableInput, meta: { visited, error } } = properties;
  const { name, value } = input;
  // const isEditable = editableInput.name === name;
  const isEditable = editableInput;
  const inputStyle = isEditable ?
    { borderBottom: '1px dashed #979797',
      color: '#172B4D'
    } :
    { display: 'none' };
  const viewStyle = isEditable ?
    { display: 'none' } :
    { paddingTop: '5px',
      paddingLeft: '10px',
      paddingRight: '10px',
      minHeight: '30px',
      borderBottom: '1px dashed #979797',
      color: '#172B4D'
    };

  // const focusUsernameInputField = field => {
  //   if (field) {
  //     field && field.focus();
  //     // const length = field.value.length;
  //     // field.setSelectionRange(length, length);
  //   }
  // };

  return (
    <Col sm={12} className={`p-b-20 m-r-5 ${styles.capitalize} ${styles.txt_overflow}`}>
      {
        label ?
          <label htmlFor={name}>
            <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
          </label>
          : null
      }
      <div className={formStyles.editInline}>
        <div>
          <input
            {...input}
            name={name}
            style={inputStyle}
            // ref={focusUsernameInputField}
          />
        </div>
        <div role="presentation" style={viewStyle}>
          {value}
        </div>
      </div>
      {error && visited && <p className={'text-danger'}>{`${error}`}</p>}
    </Col>
  );
};

const RenderDropdownList = properties => {
  const { input, data, label, isRequired } = properties;
  return (
    <Col sm={12} className={`p-b-20 m-r-5 ${styles.capitalize}`}>
      {
        label ?
          <label htmlFor={name}>
            <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
          </label>
          : null
      }
      <div className={formStyles.editInline}>
        <DropdownList
          {...input}
          data={data}
          style={{ borderBottom: '1px dashed #979797', color: '#172B4D' }}
        />
      </div>
    </Col>
  );
};

const renderMultiSelect = properties => {
  const { selectedValue, data, label, isRequired, editableInput, handleValueChange,
    ownerSearchTerm, handleOwnerSearch } = properties;
  const fullNames = selectedValue.map(owner => owner.fullName);
  if (!editableInput) {
    return (
      <Col sm={12} className={`p-b-20 m-r-5 ${styles.capitalize}`}>
        {
          label ?
            <label htmlFor={name}>
              <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
            </label>
            : null
        }
        <div style={{ borderBottom: '1px dashed #979797', paddingBottom: '5px' }}>
          {
            <span className={`p-b-15 m-r-5 ${styles.capitalize}`}>
              {fullNames.join(' , ')}
            </span>
          }
        </div>
      </Col>
    );
  }
  return (
    <Col sm={12} className={`p-b-20 m-r-5 ${styles.capitalize}`}>
      {
        label ?
          <label htmlFor={name} style={{ textTransform: 'uppercase' }}>
            <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
          </label>
          : null
      }
      <Multiselect
        data={data}
        onChange={handleValueChange}
        value={selectedValue}
        textField="fullName"
        valueField="id"
        searchTerm={ownerSearchTerm}
        onSearch={handleOwnerSearch}
        messages={{
          emptyList: i18n.t('NO_RESULTS_FOUND'),
          emptyFilter: i18n.t('NO_RESULTS_FOUND')
        }}
        style={{ borderBottom: '1px dashed #979797' }}
      />
    </Col>
  );
};

const renderTags = properties => {
  const { selectedValue, data, label, editableInput, handleValueChange,
    toggleCreateTagModal, handleSearch } = properties;
  const tags = selectedValue.map(tag => tag.name);
  if (!editableInput) {
    return (
      <Col sm={12} className={`p-b-20 m-r-5 ${styles.capitalize}`}>
        {
          label ?
            <label htmlFor={name}>
              <Trans>{label}</Trans>
            </label>
            : null
        }
        <div style={{ borderBottom: '1px dashed #979797', paddingBottom: '5px' }}>
          {
            <span className={`p-b-15 m-r-5 ${styles.capitalize}`}>
              {tags.join(' , ')}
            </span>
          }
        </div>
      </Col>
    );
  }

  return (
    <Col sm={12} className={`p-b-20 m-r-5 ${styles.capitalize}`}>
      {
        label ?
          <label htmlFor={name} style={{ textTransform: 'uppercase', width: '100%' }}>
            <Trans>{label}</Trans>
            <span
              style={{ float: 'right', color: '#1f9aff', cursor: 'pointer', textTransform: 'none' }}
              onClick={toggleCreateTagModal}
              role="presentation"
            >
              <Trans>CREATE_NEW_TAG</Trans>
            </span>
          </label>
          : null
      }
      <Multiselect
        data={data}
        onChange={handleValueChange}
        value={selectedValue}
        textField="name"
        valueField="id"
        onSearch={lodash.debounce(handleSearch, 1000)}
        messages={{
          emptyList: i18n.t('NO_RESULTS_FOUND'),
          emptyFilter: i18n.t('NO_RESULTS_FOUND')
        }}
        style={{ borderBottom: '1px dashed #979797' }}
        id="companyTags"
      />
    </Col>
  );
};

@reduxForm({
  form: 'CompanyOverview',
  validate: companyValidation,
  enableReinitialize: true
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  company: props.company,
  initialValues: props.company,
  dataChanged: props.dataChanged,
  validate: props.validate,
  user: state.auth.user,
  archivalReasons: state.managecandidates.archivalReasons,
  archiveCompanyData: state.manageCustomers.archiveCompanyData
}), { loadArchivalReasons, archiveCompany, unArchiveCompany, loadArchiveDetails, extendCompanyArchive })
export default class CompanyOverview extends Component {
  static propTypes = {
    // initialValues: PropTypes.object,
    company: PropTypes.object.isRequired,
    changeContactView: PropTypes.func.isRequired,
    values: PropTypes.object,
    isTagChanged: PropTypes.bool.isRequired,
    handleSearch: PropTypes.func.isRequired,
    tagListCreate: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    loadCompany: PropTypes.func.isRequired,
    salesOwners: PropTypes.array,
    selectedSalesOwners: PropTypes.array,
    handleValueChange: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    tags: PropTypes.array,
    selectedTags: PropTypes.array,
    toggleCreateTagModal: PropTypes.func.isRequired,
    handleTagChange: PropTypes.func.isRequired,
    loadArchivalReasons: PropTypes.func.isRequired,
    archivalReasons: PropTypes.array.isRequired,
    archiveCompany: PropTypes.func.isRequired,
    unArchiveCompany: PropTypes.func.isRequired,
    loadArchiveDetails: PropTypes.func.isRequired,
    archiveCompanyData: PropTypes.object,
    extendCompanyArchive: PropTypes.func.isRequired
  };

  static defaultProps = {
    values: null,
    initialValues: null,
    contacts: [],
    isSnackbarEnabled: false,
    salesOwners: [],
    selectedSalesOwners: [],
    tags: [],
    selectedTags: [],
    archiveCompanyData: {}
  };

  constructor(props) {
    super(props);
    let descVal = true;
    if (this.props.values && this.props.values.description && this.props.values.description.length > 200) {
      descVal = false;
    }
    this.state = {
      isEditing: descVal,
      isEditPermitted: false,
      isEditMePermitted: false,
      searchTerm: '',
      ownerSearchTerm: '',
      isArchiveModal: true,
      isOpenArchiveDeleteModal: false,
      archiveModalSubmitted: false,
    };
  }

  componentDidMount() {
    this.setEditPermissions();
  }

  componentWillReceiveProps(nextProps) {
    if (!lodash.isEqual(nextProps.company, this.props.company)) {
      this.setEditPermissions();
    }
  }

  setEditPermissions = () => {
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT', model: 'customer' });
    const isEditMePermitted = NewPermissible.isPermitted({ operation: 'EDIT_ME', model: 'customer' });
    const isCreatePermitted = NewPermissible.isPermitted({ operation: 'CREATE_COMPANY', model: 'customer' });
    const isArchiveCompanyPermitted = NewPermissible.isPermitted({ operation: 'COMPANY_ARCHIVE', model: 'customer' });
    const isUnArchiveCompanyPermitted = NewPermissible.isPermitted({
      operation: 'COMPANY_UNARCHIVE',
      model: 'customer'
    });
    this.setState({
      isEditPermitted,
      isEditMePermitted,
      isCreatePermitted,
      isArchiveCompanyPermitted,
      isUnArchiveCompanyPermitted
    }, () => {
      const editableInput = this.getEditPermission(this.props.company);
      this.setState({ editableInput });
    });
  }

  getEditPermission = company => {
    const { isEditMePermitted, isEditPermitted, isCreatePermitted } = this.state;
    const { user } = this.props;
    let isPermitted = false;
    // eslint-disable-next-line no-prototype-builtins
    if (company.hasOwnProperty('isUserAdded') && !company.isUserAdded && isCreatePermitted) {
      isPermitted = true;
    } else if (isEditPermitted) {
      isPermitted = true;
    } else if (isEditMePermitted && (company && company.createdBy) === (user && user.id)) {
      isPermitted = true;
    }
    return isPermitted;
  }

  // getAddContactText = () => {
  //   if (this.props.contacts.length === 0) {
  //     return 'Add New Contact';
  //   }
  //   return 'Add Contact';
  // }

  getArchiveDetails = (companyId, isArchive) => {
    this.props.loadArchivalReasons({
      reasonType: 'COMPANY_ARCHIVAL',
    });
    this.props.loadArchiveDetails(companyId).then(() => {
      this.setState({ isExtendArchiveCompany: true });
      this.toggleArchiveValue(isArchive);
    }, () => {
      toastr.info('', i18n.t('GET_ARCHIVE_SCHEDULE_ERROR'));
    });
  }

  changeEditable = name => {
    this.setState({
      isEditing: false,
      editableInput: {
        name
      }
    });
  }

  handleSearch = searchTerm => {
    if (searchTerm) {
      this.setState({
        searchTerm: trimTrailingSpace(searchTerm)
      });
    } else {
      this.setState({
        searchTerm: ''
      });
    }
  }

  handleOwnerSearch = ownerSearchTerm => {
    if (ownerSearchTerm) {
      this.setState({
        ownerSearchTerm: trimTrailingSpace(ownerSearchTerm)
      });
    } else {
      this.setState({
        ownerSearchTerm: ''
      });
    }
  }

  handleTextOnFocus = () => {
    this.setState({
      isEditing: true
    });
  }
  editContact = contact => {
    this.props.changeContactView(undefined, contact);
  }

  toggleArchiveDeleteModal = () => {
    this.setState({
      isOpenArchiveDeleteModal: !this.state.isOpenArchiveDeleteModal
    });
  }

  toggleArchiveValue = isArchive => {
    this.setState({
      isArchiveModal: isArchive
    }, () => {
      this.toggleArchiveDeleteModal();
    });
  }

  selectAction = (key, evt) => {
    const { company } = this.props;
    if (key === '1') {
      this.openEditModal(event, company.id);
    } else if (key === '2' || key === '3') {
      let isArchive = true;
      if (key === '2') {
        if (evt.target.innerText === i18n.t('ARCHIVE')) {
          this.initiateArchive(company.id, isArchive);
        } else if (evt.target.innerText === i18n.t('ARCHIVE_SCHEDULED')) {
          this.getArchiveDetails(company.id, isArchive);
        } else {
          this.props.unArchiveCompany(company.id).then(res => {
            toastr.success('', res);
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
              this.props.loadCompany(company.id);
            }, 1000);
          });
        }
      } else {
        isArchive = false;
        this.toggleArchiveValue(isArchive);
      }
    }
  }

  initiateArchive = (companyId, isArchive) => {
    this.props.loadArchivalReasons({
      reasonType: 'COMPANY_ARCHIVAL',
    });
    this.toggleArchiveValue(isArchive);
  }

  initialData = () => {
    const { archiveCompanyData, company } = this.props;
    if (this.state.isArchiveModal) {
      if (company.isArchiveScheduled) {
        return {
          reason: archiveCompanyData.reason,
          notificationDate: archiveCompanyData.notifyDate,
          archivalDate: archiveCompanyData.scheduledFor,
          description: archiveCompanyData.metadata && archiveCompanyData.metadata.description
        };
      }
      return {
        archivalDate: moment().format('YYYY-MM-DD')
      };
    }
    return {
      scheduledDate: moment().format('YYYY-MM-DD')
    };
  }

  handleArchiveOrDeleteSubmit = values => {
    const { isArchiveModal, isExtendArchiveCompany } = this.state;
    const { company } = this.props;
    const deviceDetail = JSON.parse(localStorage.getItem('deviceDetails'));
    values.deviceDetails = deviceDetail;
    if (isArchiveModal) {
      this.toggleArchiveModalSubmmited();
      values.archivalDate = moment(values.archivalDate).format('YYYY-MM-DD');
      values.notificationDate = moment(values.notificationDate).format('YYYY-MM-DD');
      if (isExtendArchiveCompany) {
        const currentDate = moment(new Date()).format('YYYY-MM-DD');
        values.isInstant = currentDate === values.archivalDate;
        this.props.extendCompanyArchive(company.id, values).then(() => {
          this.toggleArchiveModalSubmmited();
          toastr.success(i18n.t('SUCCESS'),
            i18n.t('successMessage.COMPANY_ARCHIVE_UPDATED'));
          this.toggleArchiveDeleteModal();
          window.clearTimeout(timeoutId);
          timeoutId = window.setTimeout(() => {
            this.props.loadCompany(company.id);
          }, 1000);
        }, () => {
          this.toggleArchiveModalSubmmited();
          toastr.error(i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_UPDATE_COMPANY_ARCHIVE'));
        });
      } else {
        const currentDate = moment(new Date()).format('YYYY-MM-DD');
        values.isInstant = currentDate === values.archivalDate || false;
        this.props.archiveCompany(values, company.id).then(() => {
          this.toggleArchiveModalSubmmited();
          this.props.company.isArchived = values.archivalDate === moment(new Date()).format('YYYY-MM-DD');
          if (values.isInstant) {
            toastr.success(i18n.t('SUCCESS'),
              i18n.t('successMessage.COMPANY_ARCHIVED_SUCCESS'));
          } else {
            toastr.success(i18n.t('SUCCESS'),
              i18n.t('successMessage.COMPANY_ARCHIVED_SHEDULED_SUCCESS'));
          }
          this.toggleArchiveDeleteModal();
          window.clearTimeout(timeoutId);
          timeoutId = window.setTimeout(() => {
            this.props.loadCompany(company.id);
          }, 1000);
        }, () => {
          this.toggleArchiveModalSubmmited();
          toastr.error(i18n.t('ERROR'),
            i18n.t('errorMessage.COULD_NOT_ARCHIVE_COMPANY'));
        });
      }
    } else {
      this.toggleArchiveDeleteModal();
    }
  }

  toggleArchiveModalSubmmited = () => {
    this.setState({
      archiveModalSubmitted: !this.state.archiveModalSubmitted
    });
  }

  renderArchiveMenu = () => {
    const { company } = this.props;
    const { isArchiveCompanyPermitted, isUnArchiveCompanyPermitted } = this.state;
    if (company.isUserAdded) {
      if (!company.isActive && isUnArchiveCompanyPermitted) {
        return i18n.t('UNARCHIVE');
      } else if (company.isArchiveScheduled && isArchiveCompanyPermitted) {
        return i18n.t('ARCHIVE_SCHEDULED');
      } else if (company.isActive && isArchiveCompanyPermitted) {
        return i18n.t('ARCHIVE');
      }
    }
    return null;
  }

  render() {
    const { company, handleChange, salesOwners,
      selectedSalesOwners, handleValueChange, tags, selectedTags, toggleCreateTagModal,
      handleTagChange, handleSearch, tagListCreate, isTagChanged } = this.props;
    const { editableInput, isEditing, searchTerm, ownerSearchTerm } = this.state;
    const domains = company && company.domain ? company.domain.split(';') : '';
    const isChangeStatusOfACompanyPermitted = editableInput;
    return (
      <Col className={`${styles.customer_overview} ${styles.filter_outer}`}>
        <div className={`${styles.filter} shadow_one m-l-20`} style={{ height: '100%', paddingTop: '0px' }}>
          <div className={`${styles.overview_header}`}>
            <span className={`${styles.overview_title}`}>
              <Trans>OVERVIEW</Trans>
            </span>
            {this.renderArchiveMenu() !== null
              ? <ButtonGroup className={`actions_dropdown_section right ${styles.actions}`}>
                <DropdownButton
                  style={{ width: '40px', height: '40px', borderRadius: '2px', border: '1px solid #d7dee8' }}
                  noCaret
                  onSelect={(key, evt) => { this.selectAction(key, evt); }}
                  title={<div className="action_menu">
                    <i className="fa fa-circle" aria-hidden="true" />
                    <i className="fa fa-circle" aria-hidden="true" />
                    <i className="fa fa-circle" aria-hidden="true" />
                  </div>}
                  id="basic-nav-dropdown"
                >
                  {this.renderArchiveMenu() !== null && <MenuItem eventKey="2">
                    {this.renderArchiveMenu()}
                  </MenuItem>}
                </DropdownButton>
              </ButtonGroup> :
              null
            }
            <span className={`${styles.customerType}`}>
              {company.id && company.isUserAdded && <CustomerType userType={company.status} />}
            </span>
          </div>
          <div className={`${styles.overview_filter}`}>
            <div className={styles.fields_body}>
              <Row>
                {company && company.name &&
                  <Col sm={12} className="m-b-20">
                    <Col sm={2} className=" p-l-0 p-r-0 m-t-10">
                      {
                        domains[0] ?
                          <img
                            alt={domains[0]}
                            className={`${styles.logoImg}`}
                            src={`https://logo.clearbit.com/${domains[0]}`}
                            onError={e => { e.target.src = '/company_icon.svg'; }}
                          /> :
                          <img
                            alt={domains[0]}
                            className={`${styles.logoImg}`}
                            src={'/company_icon.svg'}
                          />
                      }
                    </Col>
                    <Col sm={10} className="m-0 p-l-10 p-r-0 m-t-20">
                      <div
                        className={`${styles.company_title} ${styles.txt_overflow} ${domains[0] ? '' : styles.m_t_20}`}
                        title={company.name}
                      >
                        {company.name}
                      </div>
                      {domains && domains.map(domain => (
                        <Link
                          key={`${domain}`}
                          to={`http://${formatDomainName(company.domain)}`}
                          target="_blank"
                        >
                          <div
                            className={`${styles.company_domainName} ${styles.txt_overflow}`}
                            title={domain}
                          >
                            {domain}
                          </div>
                        </Link>
                      ))}
                    </Col>
                  </Col>
                }
                <form>
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="name"
                    type="text"
                    component={InlineEdit}
                    label="NAME"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                    isRequired
                  />
                  {
                    <Field
                      label="ACCOUNT_OWNERS"
                      name="salesOwners"
                      handleValueChange={handleValueChange}
                      data={salesOwners}
                      selectedValue={selectedSalesOwners}
                      isRequired
                      component={renderMultiSelect}
                      editableInput={editableInput}
                      handleOwnerSearch={this.handleOwnerSearch}
                      searchTerm={ownerSearchTerm}
                    />
                  }
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="domain"
                    type="text"
                    component={InlineEdit}
                    label="DOMAIN"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                  />
                  {
                    company.id && company.isUserAdded && isChangeStatusOfACompanyPermitted &&
                    <Field
                      label="STATUS"
                      name="status"
                      onChange={handleChange}
                      dataValue={this.props.company.status ? this.props.company.status : 'Prospect'}
                      data={[
                        'Prospect',
                        'Not Interested',
                        'Contacted',
                        'Lead',
                        'Finalist',
                        'Client'
                      ]}
                      isRequired={false}
                      component={RenderDropdownList}
                    />
                  }
                  {
                    <Field
                      label="TAGS"
                      name="tags"
                      handleValueChange={handleTagChange}
                      data={tags}
                      selectedValue={selectedTags}
                      isRequired
                      component={renderTags}
                      editableInput={editableInput}
                      toggleCreateTagModal={toggleCreateTagModal}
                      searchTerm={searchTerm}
                      handleSearch={handleSearch}
                      tagListCreate={tagListCreate}
                      isTagChanged={isTagChanged}
                    />
                  }
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="address"
                    type="text"
                    component={InlineEdit}
                    label="STREET_ADDRESS"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                  />
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="city"
                    type="text"
                    component={InlineEdit}
                    label="CITY"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                    isRequired
                  />
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="state"
                    type="text"
                    component={InlineEdit}
                    label="STATE"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                  />
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="country"
                    type="text"
                    component={InlineEdit}
                    label="COUNTRY"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                    isRequired
                  />
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="postalCode"
                    type="text"
                    component={InlineEdit}
                    label="POSTAL_CODE"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                  />
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="industry"
                    type="text"
                    component={InlineEdit}
                    label="INDUSTRY"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                  />
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="phone"
                    type="text"
                    component={InlineEdit}
                    label="PHONE_NUMBER"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                  />
                  {editableInput ?
                    <Field
                      label="NO_OF_EMPLOYEES"
                      name="employeeCount"
                      dataValue={this.props.company.employeeCount}
                      data={[
                        '1 - 10',
                        '11 - 50',
                        '51 - 200',
                        '201 - 500',
                        '501 - 1000',
                        '1001 - 5000',
                        '5001 - 10000',
                        '10000+',
                      ]}
                      isRequired={false}
                      component={RenderDropdownList}
                      onChange={handleChange}
                    /> :
                    <Col sm={12} className={`p-b-15 m-r-5 ${styles.capitalize} ${styles.txt_overflow}`}>
                      <label htmlFor={name}>
                        No Of Employees
                      </label>
                      <div className={formStyles.editInline}>
                        <div role="presentation" style={{ paddingLeft: '10px' }}>
                          {this.props.company.employeeCount}
                        </div>
                      </div>
                    </Col>
                  }
                  <Field
                    onChange={handleChange}
                    name="turnover"
                    type="text"
                    component={InlineEdit}
                    label="ANNUAL_REVENUE"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                    format={euroFormatter}
                  />
                  <Field
                    format={trimTrailingSpace}
                    onChange={handleChange}
                    name="description"
                    type="textarea"
                    component={InlineText}
                    label="DESCRIPTION"
                    changeEditable={this.changeEditable}
                    editableInput={editableInput}
                    isEditing={isEditing}
                    handleTextOnFocus={this.handleTextOnFocus}
                  />
                </form>
              </Row>
            </div>
          </div>
        </div>
        {
          this.state.isOpenArchiveDeleteModal &&
            <ArchiveDeleteModal
              archivalReasons={this.props.archivalReasons}
              isOpenModal={this.state.isOpenArchiveDeleteModal}
              isArchiveModal={this.state.isArchiveModal}
              handleArchiveOrDeleteSubmit={this.handleArchiveOrDeleteSubmit}
              toggleArchiveDeleteModal={this.toggleArchiveDeleteModal}
              initialValues={this.initialData()}
              archiveModalSubmitted={this.state.archiveModalSubmitted}
              btnText={this.renderArchiveMenu()}
              btnTextSuffix="COMPANY"
            />
        }
      </Col>
    );
  }
}
