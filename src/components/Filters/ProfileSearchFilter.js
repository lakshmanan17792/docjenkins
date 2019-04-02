import React, { Component } from 'react';
import { connect } from 'react-redux';
import { change, Field, getFormValues } from 'redux-form';
import lodash from 'lodash';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { Multiselect } from 'react-widgets';
import { Trans } from 'react-i18next';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import MentionInput from '../../components/FormComponents/MentionInput';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import StarRatingField from '../../components/FormComponents/StarRating';
import SliderField from '../../components/FormComponents/Slider';
import CheckBox from '../../components/FormComponents/CheckBox';
import countries from '../../utils/country_list';
import companies from '../../utils/company_list';
import { loadSkills, loadPositions, loadCompanies, loadLocations, loadLanguages
} from '../../redux/modules/profile-search';
import { getCandidateTags } from '../../redux/modules/resume-parser';
import getFilterConfig from '../../formConfig/ProfileFilter';
import i18n from '../../i18n';
import DropdownField from '../FormComponents/DropdownList';
import Constants from '../../helpers/Constants';
import { restrictMaxValue, convertToInteger, trimTrailingSpace,
  convertToPositiveInteger } from '../../utils/validation';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

let timeoutId = 0;
const listOfOperators = ['AND', 'OR', '(', ')'];
const renderField = data => {
  const {
    name,
    valueKey,
    labelKey,
    selectedOption,
    handleOnChange,
    handleOnInputChange,
    options,
    placeholder,
    disabled
  } = data;
  return (
    <div>
      <Select
        name={name}
        valueKey={valueKey}
        labelKey={labelKey}
        value={selectedOption}
        onChange={handleOnChange}
        isClearable={false}
        onInputChange={handleOnInputChange}
        options={options}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        noResultsText={i18n.t('NO_RESULTS_FOUND')}
        disabled={disabled}
        style={disabled ? { cursor: 'not-allowed' } : { cursor: 'default' }}
      />
    </div>
  );
};

const renderTooltip = infoText => (
  <Tooltip id="locationText">
    <strong>
      {i18n.t(infoText)}
    </strong>
  </Tooltip>
);

export const renderInputField = inputData => {
  const { input, label, readOnly, type, isRequired, meta: { touched, error }, className,
    placeholder, disabled, isInfo, infoText
  } = inputData;
  return (
    <div>
      {label ? <label htmlFor={input.name}>
        <Trans>{label}</Trans>
        {isRequired ? <span className="required_color">*</span> : ''}
        { isInfo ?
          <OverlayTrigger
            rootClose
            overlay={renderTooltip(infoText)}
            placement="top"
            key="infoText"
          >
            <span className="p-l-10 cursor-pointer">
              <i className="fa fa-info-circle" />
            </span>
          </OverlayTrigger> : ''
        }
      </label> : null}
      <div>
        <input
          readOnly={readOnly}
          {...input}
          type={type}
          id={input.name}
          placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
          className={className}
          disabled={disabled}
          style={disabled ? { cursor: 'not-allowed', backgroundColor: '#EBEBE4' } : {}}
        />
      </div>
      {error && touched && <div className="text-danger">{error}</div>}
    </div>
  );
};

const renderTags = properties => {
  const { data, label, handleValueChange, searchTerm, selectedValue, handleSearch, placeholder } = properties;
  return (
    <div className="m-t-10 m-b-5">
      {
        label ?
          <label htmlFor={name} style={{ width: '100%' }}>
            <Trans>{label}</Trans>
          </label>
          : null
      }
      <Multiselect
        data={data}
        onChange={handleValueChange}
        value={selectedValue}
        textField="name"
        valueField="id"
        onSearch={handleSearch}
        searchTerm={searchTerm}
        id="filterTags"
        allowCreate={false}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      />
    </div>
  );
};


@connect((state, props) => ({
  // skillList: state.profileSearch.skillList,
  formValues: getFormValues(props.form)(state) || {},
  positionList: state.profileSearch.positionList,
  companyList: state.profileSearch.companyList,
  locationList: state.profileSearch.locationList,
  languageList: state.profileSearch.languageList,
  tagsList: state.resumeParser.candidateTags
}), {
  loadSkills,
  loadPositions,
  loadCompanies,
  loadLocations,
  change,
  loadLanguages,
  getCandidateTags
})
export default class ProfileSearchFilter extends Component {
  static propTypes = {
    initialValues: PropTypes.object,
    formValues: PropTypes.object,
    filterConfig: PropTypes.object,
    companyList: PropTypes.array,
    // skillList: PropTypes.array,
    loadSkills: PropTypes.func.isRequired,
    loadPositions: PropTypes.func.isRequired,
    loadCompanies: PropTypes.func.isRequired,
    loadLocations: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    handleCompanyValueChange: PropTypes.func.isRequired,
    handleCompanyKeyDown: PropTypes.func.isRequired,
    form: PropTypes.string,
    selectedOption: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]),
    selectedLocation: PropTypes.object,
    values: PropTypes.object,
    isBestMatch: PropTypes.bool.isRequired,
    allMatches: PropTypes.bool.isRequired,
    loadLanguages: PropTypes.func.isRequired,
    isReset: PropTypes.bool.isRequired,
    resetRatingStars: PropTypes.func.isRequired,
    isCompanyDisable: PropTypes.bool,
    resetCheckBox: PropTypes.func.isRequired,
    getCandidateTags: PropTypes.func.isRequired,
    tagsList: PropTypes.array.isRequired
  };

  static defaultProps = {
    sourceList: Constants.sourceList,
    companies: [
      { target_company: 2892391, name: 'Midland IT GmbH' },
      { target_company: 539149, name: '1000eyes GmbH' },
      { target_company: 1813186, name: 'GETEC metering GmbH' }
    ],
    filterConfig: null,
    initialValues: null,
    companyList: [],
    // skillList: [],
    form: '',
    selectedOption: '',
    selectedLocation: null,
    values: {},
    formValues: {},
    isCompanyDisable: false
  };

  constructor(props) {
    super(props);
    this.handleOutsideSkillClick = this.handleOutsideSkillClick.bind(this);
    this.handleOutsideLocationClick = this.handleOutsideLocationClick.bind(this);
    this.handleOutsidePositionClick = this.handleOutsidePositionClick.bind(this);
    this.handleOutsideLanguageClick = this.handleOutsideLanguageClick.bind(this);
    this.state = {
      initialParam: 'initial',
      isRadDisabled: false,
      // keywords: props.initialValues && props.initialValues.keywords ? props.initialValues.keywords : '',
      // selectedOption: '',
      conjunctions: [
        {
          id: 'AND',
          display: 'AND'
        },
        {
          id: 'OR',
          display: 'OR'
        },
        // {
        //   id: 'NOT',
        //   display: 'NOT'
        // },
        {
          id: '(',
          display: '('
        },
        {
          id: ')',
          display: ')'
        }
      ],
      isLocationOpen: false,
      isSkillOpen: false,
      isPositionOpen: false,
      isSourceOpen: false,
      isLanguageOpen: false,
      isKeywordSearchOpen: false,
      skillRated: 5,
      mobilityRated: 5,
      companyCultureRated: 5,
      pedigreeRated: 5,
      contactRated: 5,
      skills: [],
      skillStr: '',
      skillPlainText: '',
      languages: [],
      languageStr: '',
      languagePlainText: '',
      skillResultsFound: true, // initial results set to true, after search based on results it reflects
      languageResultsFound: true, // initial results set to true, after search based on results it reflects
      isEmail: false,
      isMobile: false,
      isFreelance: false,
      isNoticeTypeOpen: false,
      tagSkip: 0,
      tagLimit: 10,
      tagSearchTerm: '',
      isTagChanged: false,
      tag: {
        name: '',
        description: null
      },
      canGetTags: true,
      selectedTags: []
    };
  }

  componentWillMount() {
    const { initialValues, companyList } = this.props;
    if ((!initialValues || !initialValues.companies) && (!companyList || companyList.length === 0)) {
      this.handleOnCompanyChange(this.state.initialParam);
    }
    if (initialValues && initialValues.skillRating > 0) {
      this.handleRatingOnChange(initialValues.skillRating, 1, 1);
    }
    if (initialValues && initialValues.mobilityRating > 0) {
      this.handleRatingOnChange(initialValues.mobilityRating, 2, 1);
    }
    if (initialValues && initialValues.companyCultureRating > 0) {
      this.handleRatingOnChange(initialValues.companyCultureRating, 3, 1);
    }
    if (initialValues && initialValues.pedigreeRating > 0) {
      this.handleRatingOnChange(initialValues.pedigreeRating, 4, 1);
    }
    if (initialValues && initialValues.contactRating > 0) {
      this.handleRatingOnChange(initialValues.contactRating, 5, 1);
    }
    this.loadTags();
  }

  componentDidMount() {
    const skillElement = document.getElementById('skills');
    skillElement.addEventListener('keydown', evt => {
      this.handleCursorMovement(evt, skillElement,
        'skillPlainText');
    });

    const languageElement = document.getElementById('languages');
    languageElement.addEventListener('keydown', evt => {
      this.handleCursorMovement(evt, languageElement,
        'languagePlainText');
    });

    setTimeout(() => {
      const parentEl = document.getElementById('filterTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const prevInitialValues = this.props.initialValues;
    const { initialValues, values, isReset, resetRatingStars, resetCheckBox } = nextProps;
    const disabled = !(values && values.location && values.location.length > 0);
    if (Object.keys(initialValues).length > 0) {
      this.setState({
        isRadDisabled: disabled
      });
    }
    if (values) {
      this.setState({
        isEmail: values.isEmail,
        isFreelance: values.isFreelance,
        isMobile: values.isMobile
      });
    }
    // if (this.props.initialValues && initialValues &&
    //   (this.props.initialValues.keywords !== initialValues.keywords)) {
    //   this.setKeywords(initialValues.keywords);
    // } else if (this.props.values && values &&
    //    (this.props.values.keywords !== nextProps.values.keywords)) {
    //   this.setKeywords(values.keywords);
    // }

    /* It executes when skills needs to persist when go back to profilesearch, need to retain state of persist skills */
    if (prevInitialValues && !prevInitialValues.skillStr && initialValues && initialValues.skillStr) {
      const { skills, skillStr } = initialValues;
      const regex = new RegExp(['(\\s{0,1})(@\\[(.+?)\\]\\((.+?)\\))(\\s{0,1})',
        '(?<=\\)\\s)([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)(?=\\s@)',
        '(?<=\\)\\s)([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)$',
        '^([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)'].join('|'), 'g');
      const matches = skillStr.match(regex) || [];
      const plainTextMatches = [];
      lodash.map(matches, item => {
        const isMatch = /(\s{0,1})(@\[(.+?)\]\((.+?)\))(\s{0,1})/g.exec(item);
        if (isMatch) {
          // store plain text to jump b/w words
          plainTextMatches.push(isMatch[1]);
          plainTextMatches.push(isMatch[3].replace(/\s/g, '_'));
          plainTextMatches.push(isMatch[5].match(/\s{1}$/) ? isMatch[5] : ' ');
        }
      });
      const skillPlainText = plainTextMatches.join('');
      this.setState({ skills, skillStr, skillPlainText });
    }

    /* It executes when skills needs to persist when go back to profilesearch, need to retain state of persist skills */
    if (prevInitialValues && prevInitialValues.skillStr && initialValues && !initialValues.skillStr) {
      this.setState({ skills: [], skillStr: '', skillPlainText: '' });
    }

    /* It executes when skills needs to persist when go back to profilesearch, need to retain state of persist skills */
    if (prevInitialValues && !prevInitialValues.languageStr && initialValues && initialValues.languageStr) {
      const { languages, languageStr } = initialValues;
      const regex = new RegExp(['(\\s{0,1})(@\\[(.+?)\\]\\((.+?)\\))(\\s{0,1})',
        '(?<=\\)\\s)([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)(?=\\s@)',
        '(?<=\\)\\s)([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)$',
        '^([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)'].join('|'), 'g');
      const matches = languageStr.match(regex) || [];
      const plainTextMatches = [];
      lodash.map(matches, item => {
        const isMatch = /(\s{0,1})(@\[(.+?)\]\((.+?)\))(\s{0,1})/g.exec(item);
        if (isMatch) {
          // store plain text to jump b/w words
          plainTextMatches.push(isMatch[1]);
          plainTextMatches.push(isMatch[3].replace(/\s/g, '_'));
          plainTextMatches.push(isMatch[5].match(/\s{1}$/) ? isMatch[5] : ' ');
        }
      });
      const languagePlainText = plainTextMatches.join('');
      this.setState({ languages, languageStr, languagePlainText });
    }

    /* It executes when languages needs to persist when go back to profilesearch,
    need to retain state of persist languages */
    if (prevInitialValues && prevInitialValues.languageStr && initialValues && !initialValues.languageStr) {
      this.setState({ languages: [], languageStr: '', languagePlainText: '' });
    }

    if (isReset) {
      this.setState({
        skillRated: 1,
        mobilityRated: 1,
        companyCultureRated: 1,
        pedigreeRated: 1,
        contactRated: 1,
        isEmail: false,
        isMobile: false,
        skills: [],
        skillStr: '',
        skillPlainText: '',
        isFreelance: false
      }, () => {
        resetCheckBox();
        resetRatingStars();
      });
    }
    if (lodash.isEmpty(this.props.initialValues) && !lodash.isEmpty(initialValues)) {
      if (initialValues && initialValues.skillRating > 0) {
        this.handleRatingOnChange(initialValues.skillRating, 1, 1);
      }
      if (initialValues && initialValues.mobilityRating > 0) {
        this.handleRatingOnChange(initialValues.mobilityRating, 2, 1);
      }
      if (initialValues && initialValues.companyCultureRating > 0) {
        this.handleRatingOnChange(initialValues.companyCultureRating, 3, 1);
      }
      if (initialValues && initialValues.pedigreeRating > 0) {
        this.handleRatingOnChange(initialValues.pedigreeRating, 4, 1);
      }
      if (initialValues && initialValues.contactRating > 0) {
        this.handleRatingOnChange(initialValues.contactRating, 5, 1);
      }
    }
  }

  onAfterSliderChange = () => {
    const element = document.getElementById('searchBtn');
    if (element) element.focus();
  }

  /* setKeywords = keywords => {
    if (this.state.keywords !== keywords) {
      this.setState({
        keywords
      }, () => {
        this.props.change(this.props.form, 'keywords', this.state.keywords);
      });
    }
  } */

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
      this.props.getCandidateTags(tagObj).then(tags => {
        if (tags && tags.length === 0) {
          this.setState({ canGetTags: false });
        } else {
          this.setState({
            candidateTags: tags
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

  onBlurSkillInput = (evt, isClickedSuggestion) => {
    if (!isClickedSuggestion) {
      const value = this.state.skillStr;
      const matches = value.match(/(@\[(.+?)\]\((.+?)\))/g) || [];
      const formattedArray = this.formatFilter(matches);
      const skillStr = formattedArray[0].join(' ');
      const skillPlainText = formattedArray[1].join(' ');
      this.props.change(this.props.form, 'skillStr', skillStr);
      this.setState({ skillStr, skillPlainText, skillResultsFound: true });
    }
  }

  onBlurLanguageInput = (evt, isClickedSuggestion) => {
    if (!isClickedSuggestion) {
      const value = this.state.languageStr;
      const matches = value.match(/(@\[(.+?)\]\((.+?)\))/g) || [];
      const formattedArray = this.formatFilter(matches);
      const languageStr = formattedArray[0].join(' ');
      const languagePlainText = formattedArray[1].join(' ');
      this.props.change(this.props.form, 'languageStr', languageStr);
      this.setState({ languageStr, languagePlainText, languageResultsFound: true });
    }
  }

  getTagsOnScroll = () => {
    const { canGetTags, tagSkip, tagLimit, tagSearchTerm } = this.state;
    if (!canGetTags) {
      return;
    }
    this.props.getCandidateTags({
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm
    }).then(tags => {
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

  getCountryList = () => {
    const data = [];
    Object.keys(countries).forEach((country, key) => {
      data.push({
        id: key,
        name: country
      });
    });
    return data;
  }

  getCompanyList = () => {
    const data = [];
    companies.forEach((company, key) => {
      data.push({
        id: key,
        name: company
      });
    });
    return data;
  }

  getSkillsList = (search, callback) => {
    search = search ? search.replace(/^\s+/g, '') : '';
    if (search) {
      if (search.indexOf('@') === -1) {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          this.props.loadSkills(search.toLowerCase()).then(result => {
            let list = result.data;
            const { skills, conjunctions } = this.state;
            const skillIds = lodash.map(skills, 'id');
            lodash.remove(list, object => skillIds.includes(String(object.id)));
            const arr = lodash.filter(conjunctions, object => object.id.indexOf(search.toUpperCase()) !== -1);
            list = arr.concat(list);
            if (list && list.length > 0) {
              this.setState({ skillResultsFound: true });
              return list;
            }
            this.setState({ skillResultsFound: false });
            return [];
          }).then(callback);
        }, 500);
      } else {
        return this.state.conjunctions;
      }
    }
  }
  getLanguagesList = (search, callback) => {
    search = search ? search.replace(/^\s+/g, '') : '';
    if (search) {
      if (search.indexOf('@') === -1) {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          this.props.loadLanguages(search.toLowerCase()).then(result => {
            let list = result.data;
            const { languages, conjunctions } = this.state;
            const languageIds = lodash.map(languages, 'id');
            lodash.remove(list, object => languageIds.includes(String(object.id)));
            const arr = lodash.filter(conjunctions, object => object.id.indexOf(search.toUpperCase()) !== -1);
            list = arr.concat(list);
            if (list && list.length > 0) {
              this.setState({ languageResultsFound: true });
              return list;
            }
            this.setState({ languageResultsFound: false });
            return [];
          }).then(callback);
        }, 500);
      } else {
        return this.state.conjunctions;
      }
    }
  }

  handleCursorMovement = (evt, element, stateFieldKey) => {
    if (evt.keyCode === 37) {
      const cursorPosition = element.selectionStart;
      const value = this.state[stateFieldKey];
      if (value[cursorPosition - 1] !== ' ') {
        const index = value.substring(0, cursorPosition).lastIndexOf(' ') + 1;
        element.focus();
        element.setSelectionRange(index + 1, index + 1);
      }
    } else if (evt.keyCode === 39) {
      const cursorPosition = element.selectionStart;
      const value = this.state[stateFieldKey];
      if (value[cursorPosition] !== ' ') {
        const index = value.substring(cursorPosition).indexOf(' ') - 1;
        if (index > 0) {
          element.focus();
          element.setSelectionRange(cursorPosition + index, cursorPosition + index);
        } else {
          element.focus();
          element.setSelectionRange(value.length, value.length);
        }
      }
    }
  }

  formatFilter = matches => {
    const listOfDefaultMarkups = ['@[AND](AND)', '@[OR](OR)', '@[()](())', '@[)]())'];
    const list = [];
    const plainTextMatches = [];
    lodash.map(matches, (match, index) => {
      const isMatch = /(@\[(.+?)\]\((.+?)\))/g.exec(match);
      if (isMatch) {
        plainTextMatches.push(isMatch[2].replace(/\s/g, '_')); // store plain text to jump b/w words
      }
      if (index !== (matches.length - 1) &&
      (!listOfDefaultMarkups.includes(matches[index])) &&
      (!listOfDefaultMarkups.includes(matches[index + 1]))) {
        list.push(match);
        list.push('@[AND](AND)');
        plainTextMatches.push('AND');
      } else {
        list.push(match);
      }
    });
    return [list, plainTextMatches];
  }

  loadTags = () => {
    const { tagSkip, tagLimit, tagSearchTerm } = this.state;
    const tagObj = {
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm
    };
    this.props.getCandidateTags(tagObj).then(tags => {
      this.setState({
        candidateTags: tags,
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

  handleTagChange = tags => {
    this.setState({
      selectedTags: tags,
      tagSkip: 0,
      tagSearchTerm: '',
      canGetTags: true,
      isTagScrollEnabled: true
    }, () => {
      this.props.getCandidateTags({ skip: 0, tagLimit: 10, searchTerm: '' }).then(res => {
        if (res && res.length === 0) {
          this.setState({ canGetTags: false });
        } else {
          this.setState(prevState => ({
            candidateTags: res,
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
    this.props.change(this.props.form, 'candidateTags', tags);
  }

  handleOnSkillInputChange = (evt, value) => {
    const regex = new RegExp(['(\\s{0,1})(@\\[(.+?)\\]\\((.+?)\\))(\\s{0,1})',
      '(?<=\\)\\s)([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)(?=\\s@)',
      '(?<=\\)\\s)([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)$',
      '^([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)'].join('|'), 'g');
    let matches = value.match(regex) || [];
    const listOfMatches = matches.length;
    const skills = [];
    const plainTextMatches = [];
    matches = lodash.map(matches, (item, index) => {
      const isMatch = /(\s{0,1})(@\[(.+?)\]\((.+?)\))(\s{0,1})/g.exec(item);
      if (isMatch) {
        // store plain text to jump b/w words
        plainTextMatches.push(isMatch[1]);
        plainTextMatches.push(isMatch[3].replace(/\s/g, '_'));
        plainTextMatches.push(isMatch[5].match(/\s{1}$/) ? isMatch[5] : ' ');

        if (!listOfOperators.includes(isMatch[4])) {
        // store skills to remove duplicates
          skills.push({
            id: isMatch[4],
            name: isMatch[3]
          });
        }
        if (index !== (listOfMatches - 1)) {
          return item.match(/\s{1}$/) ? item : `${item} `;
        }
        return item;
      }
      plainTextMatches.push(item);
      return item;
    });
    const skillStr = matches.join('');
    const skillPlainText = plainTextMatches.join('');
    this.props.change(this.props.form, 'skills', skills);
    this.props.change(this.props.form, 'skillStr', skillStr);
    this.setState({ skills, skillStr, skillPlainText });
  }

  handleOnLanguageInputChange = (evt, value) => {
    const regex = new RegExp(['(\\s{0,1})(@\\[(.+?)\\]\\((.+?)\\))(\\s{0,1})',
      '(?<=\\)\\s)([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)(?=\\s@)',
      '(?<=\\)\\s)([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)$',
      '^([a-zA-Z0-9()&\\\'\\/.+#-]+\\s{0,1}[a-zA-Z0-9()&\\\'\\/.+#-]*)'].join('|'), 'g');
    let matches = value.match(regex) || [];
    const listOfMatches = matches.length;
    const languages = [];
    const plainTextMatches = [];
    matches = lodash.map(matches, (item, index) => {
      const isMatch = /(\s{0,1})(@\[(.+?)\]\((.+?)\))(\s{0,1})/g.exec(item);
      if (isMatch) {
        // store plain text to jump b/w words
        plainTextMatches.push(isMatch[1]);
        plainTextMatches.push(isMatch[3].replace(/\s/g, '_'));
        plainTextMatches.push(isMatch[5].match(/\s{1}$/) ? isMatch[5] : ' ');

        if (!listOfOperators.includes(isMatch[4])) {
        // store languages to remove duplicates
          languages.push({
            id: isMatch[4],
            name: isMatch[3]
          });
        }
        if (index !== (listOfMatches - 1)) {
          return item.match(/\s{1}$/) ? item : `${item} `;
        }
        return item;
      }
      plainTextMatches.push(item);
      return item;
    });
    const languageStr = matches.join('');
    const languagePlainText = plainTextMatches.join('');
    this.props.change(this.props.form, 'languages', languages);
    this.props.change(this.props.form, 'languageStr', languageStr);
    this.setState({ languages, languageStr, languagePlainText });
  }

  dispatchRadius = value => {
    if (!value[0] && this.props.form) {
      this.props.change(this.props.form, 'preferredRadius', 0);
    }
  }

  handleOutsideLocationClick = evt => {
    if (!this.state.isLocationOpen) {
      return;
    }
    if (this.locationContainer !== null && this.locationContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isLocationOpen: false
    });
  }

  handleOutsidePositionClick = evt => {
    if (!this.state.isPositionOpen) {
      return;
    }
    if (this.positionContainer !== null && this.positionContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isPositionOpen: false
    });
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

  tagListCreate = () => {
    const { isTagScrollEnabled } = this.state;
    if (isTagScrollEnabled) {
      return;
    }
    setTimeout(() => {
      const parentEl = document.getElementById('filterTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-popup')[0].getElementsByTagName('ul')[0];
        el.addEventListener('scroll', lodash.debounce(this.getTagsOnScroll, 1000));
        this.setState({ isTagScrollEnabled: true });
      }
    }, 100);
  }

  handleTagsSearch = searchTerm => {
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

  /* handleOnSkillChange = value => {
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
  } */

  handleCheckSubmit = (evt, checked) => {
    if (checked) {
      this.setState({ [evt.target.name]: checked || false });
    } else {
      this.setState({ [evt.target.name]: false });
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

  handleOnPositionChange = value => {
    document.addEventListener('click', this.handleOutsidePositionClick, false);
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value) &&
     !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      if (value === 'initial') {
        this.props.loadPositions(value.toLowerCase());
      } else {
        this.setState({
          isPositionOpen: true
        }, () => {
          this.props.loadPositions(value.toLowerCase());
        });
      }
    } else {
      this.setState({
        isPositionOpen: false
      });
    }
  }

  handleOnCompanyChange = value => {
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value)
     && !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      this.props.loadCompanies(value.toLowerCase());
      this.props.change(this.props.form, 'companies', '');
    }
  }

  handleOnLocationChange = value => {
    document.addEventListener('click', this.handleOutsideLocationClick, false);
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value) &&
     !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      if (value === 'initial') {
        this.props.loadLocations(value.toLowerCase());
      } else {
        this.setState({
          isLocationOpen: true
        }, () => {
          this.props.loadLocations(value.toLowerCase());
        });
      }
    } else {
      this.setState({
        isLocationOpen: false
      });
    }
  }

  // handleOnSkillSelect = value => {
  //   if (value) {
  //     this.setState({
  //       isSkillOpen: !this.state.isSkillOpen
  //     });
  //   }
  // }

  handleOnPositionSelect = value => {
    if (value) {
      this.setState({
        isPositionOpen: !this.state.isPositionOpen
      });
    }
  }

  handleOnLanguageSelect = value => {
    if (value) {
      this.setState({
        isLanguageOpen: !this.state.isLanguageOpen
      });
    }
  }

  handleOnLocationSelect = value => {
    if (value) {
      this.setState({
        isLocationOpen: !this.state.isLocationOpen
      });
    }
  }

  handleOnNoticePeriodSelect = value => {
    if (value) {
      this.setState({
        isNoticeTypeOpen: !this.state.isNoticeTypeOpen
      });
    }
  }

  handleOnNoticePeriod = (evt, value) => {
    if (!value) {
      this.props.change(this.props.form, 'noticePeriodType', null);
    }
  }

  handleNoticePeriodChange = value => {
    if (value) {
      if (!this.state.isNoticeTypeOpen) {
        this.setState({
          isNoticeTypeOpen: true
        });
      }
    } else {
      this.setState({
        isNoticeTypeOpen: false
      });
    }
  }

  handleOnSourceChange = value => {
    if (value && value !== '.') {
      this.setState({
        isSourceOpen: true
      });
    } else {
      this.setState({
        isSourceOpen: false
      });
    }
  }

  handleChange = selectedOption => {
    this.props.handleCompanyValueChange(selectedOption);
  }

  handleRatingOnChange = (ratedVal, changeFilter, flag) => {
    if (ratedVal === 0 || ratedVal === 0.0) {
      return null;
    }
    let formValue = 0;
    let ratedValue = 0;
    if (flag) {
      ratedValue = Math.round(ratedVal / 0.2);
      formValue = ratedVal;
    } else {
      ratedValue = ratedVal;
      formValue = (ratedVal * 0.2).toFixed(1) / 1;
    }
    switch (changeFilter) {
      case 1:
        this.setState({ skillRated: ratedValue }, () => {
          this.props.change(this.props.form, 'skillRating', formValue);
        });
        break;
      case 2:
        this.setState({ mobilityRated: ratedValue }, () => {
          this.props.change(this.props.form, 'mobilityRating', formValue);
        });
        break;
      case 3:
        this.setState({ companyCultureRated: ratedValue }, () => {
          this.props.change(this.props.form, 'companyCultureRating', formValue);
        });
        break;
      case 4:
        this.setState({ pedigreeRated: ratedValue }, () => {
          this.props.change(this.props.form, 'pedigreeRating', formValue);
        });
        break;
      case 5:
        this.setState({ contactRated: ratedValue }, () => {
          this.props.change(this.props.form, 'contactRating', formValue);
        });
        break;
      default:
        this.setState({ skillRated: ratedValue }, () => {
          this.props.change(this.props.form, 'skillRating', formValue);
        });
        break;
    }
  }

  render() {
    const filterConfig = getFilterConfig(this);
    const { companyList, allMatches, formValues } = this.props;
    const { selectedOption } = this.props;
    return (
      <div>
        { allMatches ? '' : <div>
          <div className="m-t-5 p-b-15">
            <label htmlFor="companies"><Trans>COMPANY</Trans>
              <span className="required_color"> *</span>
            </label>
            <div>
              <Field
                component={renderField}
                name="companies"
                valueKey="id"
                labelKey="name"
                selectedOption={selectedOption}
                handleOnChange={this.handleChange}
                handleOnInputChange={this.handleOnCompanyChange}
                options={companyList}
                placeholder="SELECT_COMPANY"
                disabled={this.props.isCompanyDisable}
              />
            </div>
          </div>
        </div>
        }
        <div className="m-t-5 p-b-20">
          <Field
            component={renderInputField}
            label="CANDIDATE_NAME"
            name="candidateName"
            placeholder="SEARCH_BY_NAME"
            type="text"
            className="height_40"
          />
        </div>
        <div className="m-t-5 p-b-20" >
          <MentionInput {...filterConfig.fields.skills} />
          {!this.state.skillResultsFound && <div className="required_color m-t-15">
            {i18n.t('NO_RESULTS_FOUND')}</div>}
        </div>
        <div className="m-t-5 p-b-20" ref={c => { this.positionContainer = c; }}>
          <MultiselectField {...filterConfig.fields.positions} />
        </div>
        <div className="m-t-5 p-b-20">
          <MentionInput {...filterConfig.fields.language} />
          {!this.state.languageResultsFound && <div className="required_color m-t-15">
            {i18n.t('NO_RESULTS_FOUND')}</div>}
        </div>
        <div className="m-t-5 p-b-20">
          <Field
            label="TAGS"
            name="candidateTags"
            handleValueChange={this.handleTagChange}
            data={this.props.tagsList}
            selectedValue={this.props.values.candidateTags}
            component={renderTags}
            searchTerm={this.state.tagSearchTerm}
            handleSearch={this.onTagSearch}
            placeholder="SELECT_TAGS_TO_FILTER"
          />
        </div>
        <div className="m-t-5 p-b-15">
          <div className="m-b-15">
            <Trans>CONTACTS</Trans>
          </div>
          <label
            role="presentation"
            htmlFor="isEmail"
            style={{ cursor: 'pointer' }}
          >
            <CheckBox
              onChange={(evt, checked) => this.handleCheckSubmit(evt, checked)}
              label="EMAIL"
              isChecked={this.state.isEmail}
              name={'isEmail'}
              id={'isEmail'}
            />
          </label>
          <label
            role="presentation"
            htmlFor="isMobile"
            style={{ cursor: 'pointer', marginLeft: '90px' }}
            className="inline p-l-0"
          >
            <CheckBox
              onChange={(evt, checked) => this.handleCheckSubmit(evt, checked)}
              label="MOBILE"
              isChecked={this.state.isMobile}
              name={'isMobile'}
              id={'isMobile'}
            />
          </label>
        </div>
        <div className="m-t-5 p-b-15">
          <div className="m-b-15">
            <Trans>JOB_TYPE</Trans>
          </div>
          <label
            role="presentation"
            htmlFor="isFreelance"
            style={{ cursor: 'pointer' }}
            className="inline p-l-0"
          >
            <CheckBox
              onChange={(evt, checked) => this.handleCheckSubmit(evt, checked)}
              label="FREELANCE"
              isChecked={this.state.isFreelance}
              name={'isFreelance'}
              id={'isFreelance'}
            />
          </label>
        </div>
        <div className="m-t-5 p-b-20 col-sm-12 p-0">
          <div><label htmlFor="noticePeriod"><Trans>NOTICE_PERIOD</Trans>
            <OverlayTrigger
              rootClose
              overlay={renderTooltip('MAKE_SURE_YOU_SELECT_NOTICE_PERIOD_TO_SELECT_NOTICE_TYPE')}
              placement="top"
              key="infoText"
            >
              <span className="p-l-10 cursor-pointer">
                <i className="fa fa-info-circle" />
              </span>
            </OverlayTrigger>
          </label></div>
          <div className="col-sm-6 p-l-0">
            <Field
              component={renderInputField}
              name="noticePeriod"
              value="id"
              placeholder="NOTICE_PERIOD"
              type="text"
              onChange={this.handleOnNoticePeriod}
              normalize={restrictMaxValue(100)}
              parse={convertToPositiveInteger}
              className="height_40"
            />
          </div>
          <div className="col-sm-6 p-l-0" style={{ marginTop: '4px' }}>
            <DropdownField
              {...filterConfig.fields.noticePeriodType}
              isDisabled={!(formValues && formValues.noticePeriod)}
            />
          </div>
        </div>
        <div className="m-t-5 p-b-20" ref={c => { this.locationContainer = c; }}>
          <div>
            <MultiselectField {...filterConfig.fields.location} />
          </div>
        </div>
        <div className="m-t-5 p-b-20">
          <Field
            component={renderInputField}
            label="LOCATION_RADIUS_(IN_KM)"
            name="preferredRadius"
            placeholder="ENTER_LOCATION_RADIUS"
            type="number"
            normalize={restrictMaxValue(1000)}
            isInfo
            infoText="MAKE_SURE_YOU_SELECT_LOCATION"
            disabled={this.state.isRadDisabled}
            parse={convertToInteger}
          />
          {/* <InputBox {...filterConfig.fields.preferredRadius} /> */}
        </div>
        <div className="m-t-5 p-b-20 m-r-5 m-b-20">
          <SliderField {...filterConfig.fields.experience} />
        </div>
        {allMatches ? '' : <div>
          <div>
            <StarRatingField {...filterConfig.fields.skillrating} />
          </div>
          <div>
            <StarRatingField {...filterConfig.fields.mobilityrating} />
          </div>
          <div>
            <StarRatingField {...filterConfig.fields.companyculturerating} />
          </div>
          <div>
            <StarRatingField {...filterConfig.fields.pedigreerating} />
          </div>
          {/* <div>
            <StarRatingField {...filterConfig.fields.contactrating} />
          </div> */}
        </div>
        }
        {/* <div className="m-t-10 p-b-15">
          <MultiselectField {...filterConfig.fields.positions} />
        </div>
        <div className="m-t-15 p-b-15">
          <DropdownField {...filterConfig.fields.companies} />
          <MultiselectField {...filterConfig.fields.companies} />
        </div> */}
        <div className={allMatches ? 'm-t-5 p-b-20' : 'm-t-5 p-b-20 p-t-20'}>
          <MultiselectField {...filterConfig.fields.source} />
        </div>
      </div>
    );
  }
}

