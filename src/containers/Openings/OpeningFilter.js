import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues, propTypes, getFormSyncErrors } from 'redux-form';
import { Col, Row } from 'react-bootstrap';
import Moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { loadRecruiters, loadClientCompanies, getJobOpeningTags } from '../../redux/modules/openings';
import { loadSkills, loadLanguages } from '../../redux/modules/profile-search';
import { loadJobCategory } from '../../redux/modules/job-category';
import FilterBox from '../../components/FormComponents/FilterBox';
import DatePicker from '../../components/FormComponents/DatePicker';
// import DropdownField from '../../components/FormComponents/DropdownList';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import CheckBox from '../../components/FormComponents/CheckBox';
import { getFilterConfig, openingFilterFormValidation } from '../../formConfig/OpeningFilter';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import NewPermissible, { noOfPermissions, isPermitted } from '../../components/Permissible/NewPermissible';


import styles from './Openings.scss';
import i18n from '../../i18n';
// import InputBox from '../../components/FormComponents/InputBox';

@reduxForm({
  form: 'OpeningFilter',
  validate: openingFilterFormValidation,
  // initialValues: {
  //   startDate: Moment().subtract(1, 'months')._d,
  //   endDate: Moment()._d
  // }
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  syncErrors: getFormSyncErrors('OpeningFilter')(state),
  recruiters: state.openings.recruiterList,
  companies: state.openings.companyList,
  categories: state.jobCategory.categoryList || {},
  skillList: state.profileSearch.skillList,
  languageList: state.profileSearch.languageList,
  tags: state.openings.tags,
  user: state.auth.user,

}), { loadRecruiters, loadClientCompanies, loadJobCategory, loadSkills, loadLanguages, getJobOpeningTags })
class OpeningFilter extends Component {
  static propTypes = {
    ...propTypes,
    recruiters: PropTypes.array,
    companies: PropTypes.array,
    sortBy: PropTypes.array,
    loadOpenings: PropTypes.func.isRequired,
    loadRecruiters: PropTypes.func.isRequired,
    loadJobCategory: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    filterLoading: PropTypes.bool,
    loadSkills: PropTypes.func.isRequired,
    loadLanguages: PropTypes.func.isRequired,
    companyId: PropTypes.string,
    categories: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]).isRequired,
    resetFilters: PropTypes.func.isRequired,
    getJobOpeningTags: PropTypes.func.isRequired
  }

  static defaultProps = {
    recruiters: [],
    companies: [],
    sortBy: ['modifiedAt', 'desc'],
    companyId: '',
    filterLoading: false
  }

  constructor(props) {
    super(props);
    this.handleOutsideLanguageClick = this.handleOutsideLanguageClick.bind(this);
    this.handleOutsideSkillClick = this.handleOutsideSkillClick.bind(this);
    this.state = {
      contracts: [],
      statuses: [],
      priorities: [],
      veryHighPriority: false,
      highPriority: false,
      lowPriority: false,
      veryLowPriority: false,
      isCompanyOpen: false,
      isCategoryOpen: false,
      minEndDate: null,
      selectedTags: [],
      isTagOpen: false,
      tagSkip: 0,
      tagLimit: 10,
      tagSearchTerm: '',
      canGetTags: true,
      isTagScrollEnabled: false,
      isSkillOpen: false,
      showOnlyMyOpenings: false
    };
  }

  componentWillMount() {
    const openingFilters = JSON.parse(sessionStorage.getItem('openingFilters'));
    const openingOptions = noOfPermissions([
      { operation: 'MY_OPENINGS', model: 'jobOpening' },
      { operation: 'ALL_OPENINGS', model: 'jobOpening' }
    ]);
    const isMyOpeningPermitted = isPermitted({ operation: 'MY_OPENINGS', model: 'jobOpening' });
    const isAllOpeningPermitted = isPermitted({ operation: 'ALL_OPENINGS', model: 'jobOpening' });
    this.loadTags();
    // this.props.loadClientCompanies();
    if (this.props.companyId) {
      const filters = {};
      filters.companies = [];
      if (this.props.values) {
        const { startDate, endDate } = this.props.values;
        if (startDate) filters.startDate = Moment(startDate).format('YYYY-MM-DD');
        if (endDate) filters.endDate = Moment(endDate).format('YYYY-MM-DD');
      }
      setTimeout(() => {
        this.props.companies.forEach(data => {
          if (data.id === parseInt(this.props.companyId, 10)) {
            filters.companies.push(data);
            this.props.change('companies', filters.companies);
          }
        });
        this.props.loadOpenings(filters, 1);
      }, 10);
    } else if (openingFilters !== null) {
      this.props.initialize({
        companies: openingFilters.companies ? openingFilters.companies : null,
        jobCategories: openingFilters.jobCategories ? openingFilters.jobCategories : null,
        statuses: openingFilters.statuses ? openingFilters.statuses : null,
        contracts: openingFilters.contracts ? openingFilters.contracts : null,
        priorities: openingFilters.priorities ? openingFilters.priorities : null,
        startDate: openingFilters.startDate ? openingFilters.startDate : null,
        endDate: openingFilters.endDate ? openingFilters.endDate : null,
        languages: openingFilters.languages || null,
        showOnlyMyOpenings: openingFilters.showOnlyMyOpenings,
        tags: openingFilters.tags ? openingFilters.tags : null
      });
      if (openingFilters.statuses) {
        this.setState({ statuses: openingFilters.statuses });
        lodash.forEach(openingFilters.statuses, status => {
          this.setState({ [status]: true });
        });
      }
      if (openingFilters.contracts) {
        this.setState({ contracts: openingFilters.contracts });
        lodash.forEach(openingFilters.contracts, contract => {
          this.setState({ [contract]: true });
        });
      }
      if (openingFilters.priorities) {
        this.setState({ priorities: openingFilters.priorities });
        lodash.forEach(openingFilters.priorities, priority => {
          this.setState({ [priority]: true });
        });
      }
      if (openingFilters.selectedTags) {
        this.setState({ selectedTags: openingFilters.selectedTags });
      }
      if (isMyOpeningPermitted && !isAllOpeningPermitted) {
        openingFilters.showOnlyMyOpenings = true;
      }
      if (openingFilters.showOnlyMyOpenings) {
        this.setState({
          showOnlyMyOpenings: openingFilters.showOnlyMyOpenings,
        });
      }
      this.props.loadOpenings(openingFilters, 1);
    } else {
      const filters = { sortBy: this.props.sortBy, showOnlyMyOpenings: false };
      if (isMyOpeningPermitted && !isAllOpeningPermitted) {
        filters.showOnlyMyOpenings = true;
        filters.userId = this.props.user.id;
      }
      this.setState({
        isAssignedOpenings: filters.showOnlyMyOpenings,
      });
      this.props.loadOpenings(filters, 1);
    }
    this.setState({
      openingOptions,
      isMyOpeningPermitted,
      isAllOpeningPermitted,
    });
    // this.props.loadJobCategory({
    //   where: {
    //     isActive: true
    //   },
    //   fields: ['id', 'name']
    // });
    // this.props.loadRecruiters(); This api call is not required for now.
  }

  componentDidMount = () => {
    setTimeout(() => {
      const parentEl = document.getElementById('jobTagsFilter');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }, 100);
  }

  componentWillReceiveProps(nextProps) {
    const { resetFilter } = nextProps;
    if (resetFilter) {
      this.resetCheckBoxes();
      this.props.resetFilters(false);
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
      this.props.getJobOpeningTags(tagObj).then(tags => {
        if (tags && tags.length === 0) {
          this.setState({ canGetTags: false });
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
    this.props.getJobOpeningTags(tagObj).then(tags => {
      if (tags && tags.length === 0) {
        this.setState({ canGetTags: false });
      } else {
        this.setState(prevState => ({
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

  loadOpenings = () => {
    if (this.props.values) {
      const { startDate, endDate } = this.props.values;
      if (startDate && endDate) {
        this.props.loadOpenings({
          startDate: Moment(startDate).format('YYYY-MM-DD'),
          endDate: Moment(endDate).format('YYYY-MM-DD')
        }, 1);
      }
    } else {
      this.props.loadOpenings({}, 1);
    }
    // const { startDate, endDate } = this.props.values;
    // const { initialValues } = this.props;
  }

  tagListCreate = () => {
    const { isTagScrollEnabled } = this.state;
    if (isTagScrollEnabled) {
      return;
    }
    setTimeout(() => {
      const parentEl = document.getElementById('jobTagsFilter');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-popup')[0].getElementsByTagName('ul')[0];
        el.addEventListener('scroll', lodash.debounce(this.getTagsOnScroll, 1000));
        this.setState({ isTagScrollEnabled: true });
      }
    }, 100);
  }

  loadTags = () => {
    const { tagSkip, tagLimit, tagSearchTerm } = this.state;
    const tagObj = {
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm
    };
    this.props.getJobOpeningTags(tagObj).then(() => {
      this.setState({
        tagSkip: 10
      });
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_TAGS'));
      }
    });
  }

  resetCheckBoxes = () => {
    sessionStorage.removeItem('openingFilters');
    this.props.initialize({
      companies: null,
      jobCategories: null,
      startDate: null,
      endDate: null
    });
    const elements = [].slice.call(document.getElementsByClassName('rc-checkbox rc-checkbox-checked'));
    for (let index = 0; index < elements.length; index += 1) {
      elements[index].classList.remove('rc-checkbox-checked');
    }
    this.setState({
      contracts: [],
      statuses: [],
      priorities: [],
      active: false,
      closed: false,
      pendingForApproval: false,
      fullTime: false,
      partTime: false,
      contract: false,
      veryHighPriority: false,
      highPriority: false,
      lowPriority: false,
      veryLowPriority: false,
      selectedTags: [],
      showOnlyMyOpenings: false
    });
  }

  handleCheckSubmit = (evt, checked, type) => {
    this.setState({
      [evt.target.name]: checked || false
    });
    let arrValues = [];
    if (type === 'contract') {
      arrValues = this.state.contracts;
    } else if (type === 'priority') {
      arrValues = this.state.priorities;
    } else if (type === 'showOnlyMyOpenings') {
      this.setState({
        showOnlyMyOpenings: !this.state.showOnlyMyOpenings
      });
      return;
    } else {
      arrValues = this.state.statuses;
    }
    if (checked) {
      arrValues.push(evt.target.name);
    } else {
      arrValues.forEach(contract => {
        if (contract === evt.target.name) {
          const index = arrValues.indexOf(contract);
          arrValues.splice(index, 1);
        }
      });
    }
    if (type === 'contract') {
      this.setState({
        contracts: arrValues
      });
    } else if (type === 'priority') {
      this.setState({
        priorities: arrValues
      });
    } else if (type === 'status') {
      this.setState({
        statuses: arrValues
      });
    }
  }

  handleOnCompanyFocus = () => {
    this.setState({
      isCompanyOpen: true
    });
  }

  handleOnCompanySelect = value => {
    if (value) {
      this.setState({
        isCompanyOpen: false
      });
      this.setState({
        isCompanyOpen: !this.state.isCompanyOpen
      });
    }
  }

  handleOnCategoryChange = value => {
    if (value) {
      this.props.loadJobCategory({
        where: {
          isActive: true,
          name: { regexp: `/${value}/i` }
        },
        fields: ['id', 'name']
      });
      if (!this.state.isCategoryOpen) {
        this.setState({
          isCategoryOpen: true
        });
      }
    } else {
      this.setState({
        isCategoryOpen: false
      });
    }
  }

  handleOnCategorySelect = value => {
    if (value) {
      this.setState({
        isCategoryOpen: !this.state.isCategoryOpen
      });
    }
  }

  handleOnTagSelect = tag => {
    if (tag) {
      this.setState(prevState => ({
        isTagOpen: !prevState.isTagOpen,
        selectedTags: [...prevState.selectedTags, tag]
      }));
    }
  }

  handleOnSkillChange = value => {
    document.addEventListener('click', this.handleOutsideSkillClick, false);
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value) &&
      value.trim() !== '' && !value.startsWith('./') && !value.startsWith('.\\') && !value.startsWith('\\')) {
      if (value === 'initial') {
        this.props.loadSkills(value.toLowerCase());
      } else {
        this.setState({
          isSkillOpen: true
        }, () => {
          this.props.loadSkills(value.toLowerCase());
        });
      }
    } else {
      this.setState({
        isSkillOpen: false
      });
    }
  }

  handleOnSkillSelect = value => {
    if (value) {
      this.setState({
        isSkillOpen: !this.state.isSkillOpen
      });
    }
  }

  handleOutsideSkillClick = evt => {
    if (!this.state.isSkillOpen) {
      return;
    }
    if (this.skillContainer !== null && this.skillContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isSkillOpen: false
    });
  }

  handleOnLanguageChange = value => {
    if (value && value !== '.') {
      this.setState({
        isLanguageOpen: true
      });
    } else {
      this.setState({
        isLanguageOpen: false
      });
    }
    document.addEventListener('click', this.handleOutsideLanguageClick, false);
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value) &&
      !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      if (value === 'initial') {
        this.props.loadLanguages(value.toLowerCase());
      } else {
        this.setState({
          isLanguageOpen: true
        }, () => {
          this.props.loadLanguages(value.toLowerCase());
        });
      }
    }
  }

  handleOnLanguageSelect = value => {
    if (value) {
      this.setState({
        isLanguageOpen: !this.state.isLanguageOpen
      });
    }
  }

  handleOutsideLanguageClick = evt => {
    if (!this.state.isLanguageOpen) {
      return;
    }
    if (this.languageContainer !== null && this.languageContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isLanguageOpen: false
    });
  }


  handleSubmit = evt => {
    evt.preventDefault();
    if (!this.props.valid) {
      toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.PLEASE_SELECT_VALID_RANGE_IN_FILTER'));
      return;
    }
    if (!this.props.values) {
      this.props.loadOpenings({ sortBy: this.props.sortBy }, 1);
    } else {
      const { companies, recruiters, startDate, endDate, jobCategories, languages, tags,
        showOnlyMyOpenings } = this.props.values;
      const { contracts, statuses, priorities } = this.state;
      const filters = {};
      if (startDate) filters.startDate = Moment(startDate).format('YYYY-MM-DD');
      if (endDate) filters.endDate = Moment(endDate).format('YYYY-MM-DD');
      if (statuses && statuses.length) filters.statuses = statuses;
      if (contracts && contracts.length) filters.contracts = contracts;
      if (priorities && priorities.length) filters.priorities = priorities;
      if (companies && companies.length) filters.companies = companies;
      if (recruiters && recruiters.length) filters.recruiters = recruiters;
      if (jobCategories && jobCategories.length) filters.jobCategories = jobCategories;
      if (tags && tags.length) filters.tags = tags;
      if (languages && languages.length) filters.languages = languages;
      if (showOnlyMyOpenings) {
        filters.userId = this.props.user.id;
        filters.showOnlyMyOpenings = showOnlyMyOpenings;
      }
      filters.sortBy = this.props.sortBy;
      sessionStorage.setItem('openingFilters', JSON.stringify(filters));
      this.props.loadOpenings(filters, 1);
    }
  }

  handleOnCompanyChange = value => {
    if (value) {
      if (!this.state.isCompanyOpen) {
        this.setState({
          isCompanyOpen: true
        });
      }
      this.props.loadClientCompanies({
        searchTerm: value.toLowerCase()
      });
    } else {
      this.setState({
        isCompanyOpen: false
      });
    }
  }

  // isFilterEmpty = filterValues => {
  //   let isEmpty = true;
  //   lodash.forOwn(filterValues, value => {
  //     if (value) {
  //       if (value && value.length >= 0) {
  //         isEmpty = false;
  //       }
  //       if (lodash.isBoolean(value)) {
  //         isEmpty = false;
  //       }
  //       if (filterValues.startDate && filterValues.endDate) {
  //         isEmpty = false;
  //       }
  //     }
  //   });
  //   return isEmpty;
  // }

  render() {
    const filterConfig = getFilterConfig(this);
    const { reset, filterLoading } = this.props;
    const { openingOptions, isMyOpeningPermitted, isAllOpeningPermitted } = this.state;
    // const isFilterEmpty = this.isFilterEmpty(values);
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={`${styles.filter_container}`}>
        <FilterBox
          className={styles.hide_reset_btn}
          reset={() => {
            reset('OpeningFilter');
            this.props.resetSearchTerm(() => {
              this.props.loadOpenings({ sortBy: this.props.sortBy });
              this.resetCheckBoxes();
            });
          }}
        >
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            <div className={styles.opening_filter}>
              <div className={styles.fields_body}>
                <Scrollbars
                  universal
                  autoHeight
                  autoHeightMin={'calc(100vh - 165px)'}
                  autoHeightMax={'calc(100vh - 165px)'}
                  renderThumbHorizontal={props => <div {...props} className="hide" />}
                  renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
                >
                  <Row>
                    {openingOptions && openingOptions.length > 1 && isMyOpeningPermitted
                      && <Col sm={12} className="m-t-5 p-b-20">
                        <div>
                          <div className={styles.checkbox_heading}>
                            <Trans>OPENINGS</Trans>
                          </div>
                          <Col sm={12} xs={12} className="p-0">
                            <CheckBox
                              onChange={(evt, checked) => this.handleCheckSubmit(evt, checked, 'showOnlyMyOpenings')}
                              label="Assigned Openings"
                              isChecked={this.state.showOnlyMyOpenings}
                              className={`${styles.opening_checkbox}`}
                              name={'showOnlyMyOpenings'}
                              id={'showOnlyMyOpenings'}
                            />
                          </Col>
                        </div>
                      </Col>}
                    {<Col sm={12} className={`m-t-5 p-b-20 m-r-5 ${styles.capitalize}`}>
                      <MultiselectField {...filterConfig.company} />
                    </Col>}
                    {<Col sm={12} className={`m-t-5 p-b-20 m-r-5 ${styles.capitalize}`}>
                      <MultiselectField {...filterConfig.categories} />
                    </Col>}
                    {<Col sm={12} className={`m-t-5 p-b-20 m-r-5 ${styles.capitalize}`}>
                      <MultiselectField {...filterConfig.jobOpeningTags} />
                    </Col>}
                    {<Col sm={12} className={`m-t-5 p-b-20 m-r-5 ${styles.capitalize}`}>
                      <MultiselectField {...filterConfig.language} />
                    </Col>}
                    <Col sm={12} className="m-t-5 p-b-20">
                      <div className={styles.checkbox_heading}>
                        <Trans>STATUS</Trans>
                      </div>
                      <Col sm={6} xs={6} className="p-0">
                        <CheckBox
                          onChange={(evt, checked) => this.handleCheckSubmit(evt, checked, 'status')}
                          label="ACTIVE"
                          isChecked={this.state.active}
                          className={`${styles.opening_checkbox}`}
                          name={'active'}
                          id={'active'}
                        />
                      </Col>
                      <Col sm={6} xs={6} className="p-0">
                        <CheckBox
                          onChange={(evt, checked) => this.handleCheckSubmit(evt, checked, 'status')}
                          isChecked={this.state.closed}
                          label="CLOSED"
                          className={`${styles.opening_checkbox}`}
                          name={'closed'}
                          id={'closed'}
                        />
                      </Col>
                    </Col>
                    <Col sm={12} className="m-t-5 p-b-20">
                      <div className={styles.checkbox_heading}>
                        <Trans>EMPLOYMENT_TYPE</Trans>
                      </div>
                      <Col sm={12} xs={12} className="p-0">
                        <CheckBox
                          onChange={(evt, checked) => this.handleCheckSubmit(evt, checked, 'contract')}
                          label="FULL_TIME"
                          isChecked={this.state.fullTime}
                          className={`${styles.opening_checkbox}`}
                          name={'fullTime'}
                          id={'fullTime'}
                          value={'fullTime'}
                        />
                      </Col>
                      <Col sm={12} xs={12} className="p-0">
                        <CheckBox
                          onChange={(evt, checked) => this.handleCheckSubmit(evt, checked, 'contract')}
                          label="FREELANCE"
                          isChecked={this.state.partTime}
                          className={`${styles.opening_checkbox}`}
                          name={'partTime'}
                          id={'partTime'}
                          value={'partTime'}
                        />
                      </Col>
                      <Col sm={12} xs={12} className="p-0">
                        <CheckBox
                          onChange={(evt, checked) => this.handleCheckSubmit(evt, checked, 'contract')}
                          label="ON_CONTRACT"
                          isChecked={this.state.contract}
                          className={`${styles.opening_checkbox}`}
                          name={'contract'}
                          id={'contract'}
                          value={'contract'}
                        />
                      </Col>
                      {/* <MultiselectField {...filterConfig.contracts} /> */}
                    </Col>
                    <Col sm={12} className="m-t-5 p-b-20">
                      <label htmlFor="priority"><Trans>PRIORITY</Trans></label>
                      <div>
                        {
                          filterConfig.priorities.data.map(datum => (
                            <Col sm={6} xs={6} className="p-0" key={datum.id}>
                              <CheckBox
                                onChange={(evt, checked) => this.handleCheckSubmit(evt, checked, 'priority')}
                                className={`${styles.opening_checkbox}`}
                                label={datum.name}
                                isChecked={this.state[datum.id]}
                                name={datum.id}
                                id={datum.id}
                                value={datum.id}
                              />
                            </Col>
                          ))
                        }
                      </div>
                    </Col>
                    <Col sm={12} className={`p-b-20 m-t-5 ${styles.date_ranger}`}>
                      <label htmlFor="dateRanger"><Trans>CREATED_BETWEEN</Trans></label>
                      <Col sm={12} className="p-t-5 p-b-0 p-l-0 p-r-0" id="dateRanger">
                        <Col lg={5} sm={12} xs={12} className="p-0"><DatePicker {...filterConfig.startDate} /></Col>
                        <Col sm={2} xs={2} className={`text-center m-t-b-5 m-t-10 p-0 ${styles.divder}`}>
                          <Trans>TO</Trans>
                        </Col>
                        <Col lg={5} sm={12} xs={12} className="p-0"><DatePicker {...filterConfig.endDate} /></Col>
                      </Col>
                    </Col>
                  </Row>
                </Scrollbars>
              </div>
            </div>
            <Col sm={12} lg={12} className={`${styles.actions} p-0`}>
              {/* <Col lg={6} md={6} sm={6} xs={6} className="p-5">
            <button
              className="btn btn-border filter-btn"
              disabled={isFilterEmpty}
              onClick={() => { reset('OpeningFilter'); this.props.loadOpenings({}); this.resetCheckBoxes(); }}
            > Reset
            </button>
          </Col> */}
              <Col lg={12} md={12} sm={12} xs={12} className={`p-10 ${styles.filter_btn}`}>
                <button
                  className={`${styles.submit_filter_btn} button-primary`}
                  type="submit"
                >
                  {filterLoading ?
                    <i className="fa fa-spinner fa-spin p-l-r-7" aria-hidden="true" /> : ''
                  }
                  <Trans>APPLY_FILTERS</Trans>
                </button>
              </Col>
              {/* <Col sm={12} className="p-b-20 m-t-10">
                  <button className="btn btn-border" onClick={reset}>Reset</button>
                </Col> */}
            </Col>
          </form>
        </FilterBox>
      </Col>
    );
  }
}

export default OpeningFilter;
