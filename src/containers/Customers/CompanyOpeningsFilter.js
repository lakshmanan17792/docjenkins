import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues, reset } from 'redux-form';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import Moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import lodash from 'lodash';
import { loadJobCategory } from '../../redux/modules/job-category';
import { getJobOpeningTags } from '../../redux/modules/openings';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import DatePicker from '../../components/FormComponents/DatePicker';
import CheckBox from '../../components/FormComponents/CheckBox';
import styles from './Companies.scss';
import { loadLanguages } from '../../redux/modules/profile-search';
import { getFilterConfig, openingFilterFormValidation } from '../../formConfig/OpeningFilter';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

@reduxForm({
  form: 'CompanyOpeningFilter',
  validate: openingFilterFormValidation
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  categories: state.jobCategory.categoryList || {},
  tags: state.openings.tags,
  languageList: state.profileSearch.languageList
}), {
  loadJobCategory,
  reset,
  getJobOpeningTags,
  loadLanguages
})
export default class CompanyOpeningsFilter extends Component {
  static propTypes = {
    loadOpeningsForCompanyByFilter: PropTypes.func.isRequired,
    companyOpeningFilterObj: PropTypes.object,
    submitting: PropTypes.bool,
    valid: PropTypes.bool,
    invalid: PropTypes.bool,
    initialize: PropTypes.func.isRequired,
    emptyCompanyOpeningFilters: PropTypes.func.isRequired,
    loadJobCategory: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    changeFilterView: PropTypes.func.isRequired,
    values: PropTypes.object,
    loadLanguages: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    getJobOpeningTags: PropTypes.func.isRequired
  }
  static defaultProps = {
    values: null,
    submitting: false,
    invalid: false,
    valid: null,
    companyOpeningFilterObj: {}
  }
  constructor(props) {
    super(props);
    this.initialFilterValues = {};
    this.state = {
      isCompanyOpeningFilter: true,
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
      isTagScrollEnabled: false
    };
  }

  componentDidMount() {
    if (Object.keys(this.props.companyOpeningFilterObj).length > 1) {
      this.initializeFilterValues(this.props.companyOpeningFilterObj);
    }
    this.props.loadJobCategory({
      where: {
        isActive: true
      },
      fields: ['id', 'name']
    });
    setTimeout(() => {
      const parentEl = document.getElementById('jobTagsFilter');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }, 100);
    this.loadTags();
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

  initializeFilterValues = filterObj => {
    const { statuses, priorities, contracts, jobCategories, startDate, endDate, tags } = filterObj;
    if (jobCategories && jobCategories.length > 0) {
      this.initialFilterValues.jobCategories = jobCategories;
    }
    if (tags && tags.length > 0) {
      this.initialFilterValues.tags = tags;
    }
    if (startDate) this.initialFilterValues.startDate = startDate;
    if (endDate) this.initialFilterValues.endDate = endDate;
    this.handleInitialCheckboxes(statuses, 'status');
    this.handleInitialCheckboxes(priorities, 'priority');
    this.handleInitialCheckboxes(contracts, 'contract');
    this.props.initialize(this.initialFilterValues);
  }

  handleInitialCheckboxes = (values, type) => {
    if (values && values.length > 0) {
      for (let index = 0; index < values.length; index += 1) {
        this.initialFilterValues[values[index]] = true;
        this.handleCheckSubmit({ target: { name: values[index] } }, true, type);
        document.getElementsByName(values[index])[0].parentNode.classList.add('rc-checkbox-checked');
      }
    }
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

  resetCheckBoxes = () => {
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
      selectedTags: []
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
    } else {
      this.setState({
        statuses: arrValues
      });
    }
  }

  handleOnCategoryChange = value => {
    if (value) {
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
        isCategoryOpen: false
      });
    }
  }

  // handleOnCategoryFocus = () => {
  //   this.setState({
  //     isCategoryOpen: true
  //   });
  // }

  handleOnTagChange = value => {
    if (value) {
      if (!this.state.isTagOpen) {
        this.setState({
          isTagOpen: true
        });
      }
    } else {
      this.setState({
        isTagOpen: false
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

  handleSubmit = evt => {
    const filters = {};
    evt.preventDefault();
    if (!this.props.valid) {
      toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.PLEASE_SELECT_VALID_RANGE_IN_FILTER'));
      return;
    }
    this.props.changeFilterView();
    if (this.props.values && Object.keys(this.props.values).length > 0) {
      const { startDate, endDate, jobCategories, tags, languages } = this.props.values;
      const { contracts, statuses, priorities } = this.state;
      if (startDate) filters.startDate = Moment(startDate).format('YYYY-MM-DD');
      if (endDate) filters.endDate = Moment(endDate).format('YYYY-MM-DD');
      if (statuses && statuses.length) filters.statuses = statuses;
      if (contracts && contracts.length) filters.contracts = contracts;
      if (priorities && priorities.length) filters.priorities = priorities;
      if (jobCategories && jobCategories.length) filters.jobCategories = jobCategories;
      if (tags && tags.length) filters.tags = tags;
      if (languages && languages.length) filters.languages = languages;
    }
    this.props.loadOpeningsForCompanyByFilter(filters);
  }

  resetForm = () => {
    const { companyOpeningFilterObj } = this.props;
    this.props.initialize({});
    if (companyOpeningFilterObj && Object.keys(companyOpeningFilterObj).length - 1 > 0) {
      this.props.emptyCompanyOpeningFilters();
    }
  }

  render() {
    const filterConfig = getFilterConfig(this);
    const { submitting } = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        <Scrollbars
          universal
          autoHeight
          autoHeightMin={'350px'}
          autoHeightMax={'350px'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <Col sm={8} className={`m-t-5 p-b-20 m-r-5 ${styles.capitalize}`}>
            <MultiselectField {...filterConfig.categories} />
          </Col>
          {<Col sm={8} className={`m-t-5 p-b-20 m-r-5 ${styles.capitalize}`}>
            <MultiselectField {...filterConfig.jobOpeningTags} />
          </Col>}
          {<Col sm={8} className={`m-t-5 p-b-20 m-r-5 ${styles.capitalize}`}>
            <MultiselectField {...filterConfig.language} />
          </Col>}
          <Col sm={10} className="p-b-20">
            <div className={styles.checkbox_heading}>
              <Trans>STATUS</Trans>
            </div>
            <Col sm={3} xs={3} className="p-0">
              <CheckBox
                onChange={(evt, checked) => this.handleCheckSubmit(evt, checked, 'status')}
                label="ACTIVE"
                isChecked={this.state.active}
                className={`${styles.opening_checkbox}`}
                name={'active'}
                id={'active'}
              />
            </Col>
            <Col sm={3} xs={3} className="p-0">
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
          <Col sm={10} className="p-b-20">
            <div className={styles.checkbox_heading}>
              <Trans>EMPLOYMENT_TYPE</Trans>
            </div>
            <Col sm={3} xs={3} className="p-0">
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
            <Col sm={3} xs={3} className="p-0">
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
            <Col sm={3} xs={3} className="p-0">
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
          <Col sm={10} className="p-b-20">
            <div className={styles.checkbox_heading}>
              <Trans>PRIORITY</Trans>
            </div>
            <div>
              {
                filterConfig.priorities.data.map(datum => (
                  <Col sm={datum.widths} xs={datum.widths} className="p-0" key={datum.id}>
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
          <Col sm={12} className={`p-b-20 ${styles.date_ranger}`}>
            <label htmlFor="dateRanger"><Trans>CREATED_BETWEEN</Trans></label>
            <Col sm={12} className="p-t-5 p-b-0 p-l-0 p-r-0" id="dateRanger">
              <Col sm={4} xs={4} className="p-0"><DatePicker {...filterConfig.startDate} /></Col>
              <Col
                sm={2}
                xs={2}
                className={`text-center m-t-b-5 m-t-10 p-0 ${styles.divider}`}
              ><Trans>TO</Trans>
              </Col>
              <Col sm={4} xs={4} className="p-0"><DatePicker {...filterConfig.endDate} /></Col>
            </Col>
          </Col>
        </Scrollbars>
        <Col className={`${styles.filter_btn_section} p-l-0 p-r-0`} lg={12} xs={12}>
          <Col
            lg={6}
            xs={6}
            className={`${styles.filters_clear}`}
            onClick={() => {
              this.resetForm(); this.resetCheckBoxes();
            }}
          >
            <Trans>CLEAR_ALL_FILTERS</Trans>
          </Col>
          <Col className="right p-l-0 p-r-0" lg={6} xs={6}>
            <Col lg={6} xs={6}>
              <button
                lg={6}
                xs={6}
                onClick={e => { e.preventDefault(); this.props.changeFilterView(); }}
                className="btn btn-border"
                disabled={submitting}
              >
                <Trans>CANCEL</Trans>
              </button>
            </Col>
            <Col lg={6} xs={6}>
              <button
                lg={6}
                xs={6}
                type="submit"
                className="btn btn-border filter-btn orange-btn"
                disabled={submitting}
              >
                <Trans>APPLY</Trans>
              </button>
            </Col>
          </Col>
        </Col>
      </form>
    );
  }
}
