import React, { Component } from 'react';
import { reduxForm, change, getFormValues, Field, touch } from 'redux-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Col, Modal, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toastr } from 'react-redux-toastr';
import { Multiselect } from 'react-widgets';
import { Trans } from 'react-i18next';
import InputBox from '../../components/FormComponents/InputBox';
import MentionInput from '../../components/FormComponents/MentionInput';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import StarRatingField from '../../components/FormComponents/StarRating';
import SliderField from '../../components/FormComponents/Slider';
import countries from '../../utils/country_list';
import companies from '../../utils/company_list';
import getFilterConfig from '../../formConfig/ProfileFilter';
import ProfileFilterValidation from '../../formConfig/ProfileFilterValidation';
import {
  loadSkills,
  loadCompanies,
  loadLocations,
  loadPositions,
  loadLanguages
} from '../../redux/modules/profile-search';
import { getCandidateTags, createCandidateTags } from '../../redux/modules/resume-parser';
import i18n from '../../i18n';
import DropdownField from '../../components/FormComponents/DropdownList';
import CheckBox from '../../components/FormComponents/CheckBox';
import constants from '../../helpers/Constants';
import toastrErrorHandling from '../toastrErrorHandling';
import { trimTrailingSpace } from '../../utils/validation';

let timeoutId = 0;
const listOfOperators = ['AND', 'OR', '(', ')'];
const styles = require('./StepSaveOpening.scss');

const renderTags = properties => {
  const { data, label, handleValueChange, searchTerm, selectedValue, handleSearch, placeholder,
    toggleCreateTagModal } = properties;
  return (
    <div className="m-t-10 m-b-5">
      {
        label ?
          <label htmlFor={name} style={{ width: '100%' }}>
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
        onSearch={handleSearch}
        searchTerm={searchTerm}
        id="candidateTags"
        allowCreate={false}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      />
    </div>
  );
};
@reduxForm({
  form: 'StepSaveOpening',
  destroyOnUnmount: false,
  validate: ProfileFilterValidation,
  forceUnregisterOnUnmount: true
})
@connect(state => ({
  values: getFormValues('StepSaveOpening')(state),
  companyList: state.profileSearch.companyList,
  skillList: state.profileSearch.skillList,
  languageList: state.profileSearch.languageList,
  locationList: state.profileSearch.locationList,
  tagsList: state.resumeParser.candidateTags
}), {
  change,
  touch,
  loadCompanies,
  loadSkills,
  loadLocations,
  loadPositions,
  loadLanguages,
  getCandidateTags,
  createCandidateTags
})
export default class SaveOpeningFilters extends Component {
  static propTypes = {
    saveAndSearch: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    initialValues: PropTypes.objectOf(PropTypes.any),
    values: PropTypes.objectOf(PropTypes.any),
    companyList: PropTypes.any,
    allMatches: PropTypes.bool,
    handleCompanyKeyDown: PropTypes.func.isRequired,
    loadCompanies: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    touch: PropTypes.func.isRequired,
    invalid: PropTypes.bool,
    loadSkills: PropTypes.func.isRequired,
    loadLocations: PropTypes.func.isRequired,
    loadPositions: PropTypes.func.isRequired,
    clickedAnotherPage: PropTypes.bool.isRequired,
    resetPageFields: PropTypes.func.isRequired,
    gotoPage: PropTypes.func.isRequired,
    toPage: PropTypes.number.isRequired,
    valid: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    loadLanguages: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    form: PropTypes.any,
    isSave: PropTypes.bool.isRequired,
    getCandidateTags: PropTypes.func.isRequired,
    tagsList: PropTypes.array.isRequired,
    createCandidateTags: PropTypes.func.isRequired
  }

  static defaultProps = {
    initialValues: {},
    values: {},
    sourceList: constants.sourceList,
    loading: false,
    allMatches: false,
    form: null,
    companyList: {},
    invalid: false
  }

  constructor(props) {
    super(props);
    // this.handleOutsideSkillClick = this.handleOutsideSkillClick.bind(this);
    this.handleOutsideLocationClick = this.handleOutsideLocationClick.bind(this);
    this.handleOutSideLanguageClick = this.handleOutsideLanguageClick.bind(this);
    this.state = {
      initialParam: 'initial',
      isLocationOpen: false,
      isLanguageOpen: false,
      isRadDisabled: false,
      isSourceOpen: false,
      keywords: props.values && props.values.keywords ? props.values.keywords : '',
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
      isSkillOpen: false,
      selectedOption: null,
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
      selectedTags: [],
      showCreateTag: false,
      isTagSubmitted: false,
    };
  }

  componentWillMount() {
    const { values } = this.props;
    if (!(values && values.skillRating > 0)) {
      this.props.change(this.props.form, 'skillRating', 1);
      this.props.change(this.props.form, 'mobilityRating', 1);
      this.props.change(this.props.form, 'companyCultureRating', 1);
      this.props.change(this.props.form, 'pedigreeRating', 1);
      this.props.change(this.props.form, 'contactRating', 1);
    }
    if (values && values.skillRating > 0) {
      this.handleRatingOnChange(values.skillRating, 1, 1);
    }
    if (values && values.mobilityRating > 0) {
      this.handleRatingOnChange(values.mobilityRating, 2, 1);
    }
    if (values && values.companyCultureRating > 0) {
      this.handleRatingOnChange(values.companyCultureRating, 3, 1);
    }
    if (values && values.pedigreeRating > 0) {
      this.handleRatingOnChange(values.pedigreeRating, 4, 1);
    }
    if (values && values.contactRating > 0) {
      this.handleRatingOnChange(values.contactRating, 5, 1);
    }
    /* It executes when skills needs to persist when go back to opening filters page */
    if (values.skillStr) {
      const { skills, skillStr } = values;
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

    /* It executes when languages needs to persist when go back to opening filters page */
    if (values.languageStr) {
      const { languages, languageStr } = values;
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
    this.loadTags();
  }

  componentDidMount() {
    this.props.touch(this.props.form, 'noticePeriod');
    this.props.touch(this.props.form, 'noticePeriodType');

    const skillElement = document.getElementById('skills');
    skillElement.addEventListener('keydown', evt => {
      this.handleCursorMovement(evt,
        skillElement, 'skillPlainText');
    });

    const languageElement = document.getElementById('languages');
    languageElement.addEventListener('keydown', evt => {
      this.handleCursorMovement(evt,
        languageElement, 'languagePlainText');
    });

    setTimeout(() => {
      const parentEl = document.getElementById('candidateTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const { values, toPage } = nextProps;
    const { valid, handleSubmit, gotoPage, resetPageFields } = this.props;
    if (values) {
      this.setState({
        isRadDisabled: !(values.location && values.location.length > 0),
        isEmail: values.isEmail,
        isFreelance: values.isFreelance,
        isMobile: values.isMobile
      });
    }
    if (nextProps.clickedAnotherPage) {
      if (toPage < 2) {
        gotoPage(toPage, valid);
      } else if (valid) {
        gotoPage(toPage, valid);
      } else {
        handleSubmit();
        resetPageFields();
      }
    }
  }


  onAfterSliderChange = () => {
    const element = document.getElementById('searchBtn');
    if (element) element.focus();
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
      this.props.getCandidateTags(tagObj).then(candidateTags => {
        if (candidateTags && candidateTags.length === 0) {
          this.setState({ canGetTags: false });
        } else {
          this.setState({
            candidateTags
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

  getTagsOnScroll = () => {
    const { canGetTags, tagSkip, tagLimit, tagSearchTerm } = this.state;
    if (!canGetTags) {
      return;
    }
    this.props.getCandidateTags({
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm
    }).then(candidateTags => {
      if (candidateTags && candidateTags.length === 0) {
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

  createCandidateTags = () => {
    const { tag } = this.state;
    this.setState({ isTagSubmitted: true });
    this.props.createCandidateTags(tag).then(res => {
      const tagValue = this.props.values.candidateTags || [];
      this.props.change(this.props.form, 'candidateTags', [...tagValue, res]);
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
      this.createCandidateTags();
    }
  }

  loadTags = () => {
    const { tagSkip, tagLimit, tagSearchTerm } = this.state;
    const tagObj = {
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm
    };
    this.props.getCandidateTags(tagObj).then(candidateTags => {
      this.setState({
        candidateTags,
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

  tagListCreate = () => {
    const { isTagScrollEnabled } = this.state;
    if (isTagScrollEnabled) {
      return;
    }
    setTimeout(() => {
      const parentEl = document.getElementById('candidateTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-popup')[0].getElementsByTagName('ul')[0];
        el.addEventListener('scroll', lodash.debounce(this.getTagsOnScroll, 1000));
        this.setState({ isTagScrollEnabled: true });
      }
    }, 100);
  }

  handleTagChange = candidateTags => {
    this.setState({
      selectedTags: candidateTags,
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
    this.props.change(this.props.form, 'candidateTags', candidateTags);
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

  handleOnCompanyChange = value => {
    if (value && value !== '.' && value.trim() !== '') {
      this.props.loadCompanies(value.toLowerCase());
    }
  }

  handleCompanyValueChange = selectedOption => {
    if (selectedOption && selectedOption.id) {
      this.setState({ selectedOption: selectedOption.id }, () => {
        this.props.change('companies', selectedOption);
      });
    } else {
      this.setState({ selectedOption: '' });
      this.props.change('companies', '');
    }
  }

  handleChange = selectedOption => {
    this.handleCompanyValueChange(selectedOption);
  }

  handleInputKeyDown = () => {
    this.props.handleCompanyKeyDown();
  }

  handleOnKeywordChange = (evt, newValue, plainTextValue) => {
    this.setState({
      keywords: plainTextValue
    }, () => {
      this.props.change(this.props.form, 'keywords', plainTextValue);
    });
  }

  /* handleOnSkillChange = value => {
    document.addEventListener('click', this.handleOutsideSkillClick, false);
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\') &&
      !value.startsWith('./') && value.trim() !== '') {
      this.setState({
        isSkillOpen: true
      }, () => {
        this.props.loadSkills(value.toLowerCase());
      });
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
    if (this.skillContainer !== null &&
    this.skillContainer !== undefined &&
    this.skillContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isSkillOpen: false
    });
  } */

  handleOnLanguageChange = value => {
    document.addEventListener('click', this.handleOutsideLanguageClick, false);
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\') &&
      !value.startsWith('./') && value.trim() !== '') {
      this.setState({
        isLanguageOpen: true
      }, () => {
        this.props.loadLanguages(value.toLowerCase());
      });
    } else {
      this.setState({
        isLanguageOpen: false
      });
    }
  }

  handleOutsideLanguageClick = evt => {
    if (!this.state.isLanguageOpen) {
      return;
    }
    if (this.languageContainer !== null &&
      this.languageContainer !== undefined &&
      this.languageContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isLanguageOpen: false
    });
  }

  handleOutsideLocationClick = evt => {
    if (!this.state.isLocationOpen) {
      return;
    }
    if (this.locationContainer !== null &&
  this.locationContainer !== undefined &&
  this.locationContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isLocationOpen: false
    });
  }

  handleOnLocationChange = value => {
    document.addEventListener('click', this.handleOutsideLocationClick, false);
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\') &&
      !value.startsWith('./') && value.trim() !== '') {
      this.setState({
        isLocationOpen: true
      }, () => {
        this.props.loadLocations(value.toLowerCase());
      });
    } else {
      this.setState({
        isLocationOpen: false
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
  handlekeyPress = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  }

  handleRatingOnChange = (ratedVal, changeFilter, flag) => {
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

  handleOnNoticePeriodSelect = value => {
    if (value) {
      this.setState({
        isNoticeTypeOpen: !this.state.isNoticeTypeOpen
      });
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

  handleCheckSubmit = (evt, checked) => {
    if (checked) {
      this.setState({ [evt.target.name]: checked || false });
    } else {
      this.setState({ [evt.target.name]: false });
    }
  }

  dispatchRadius = value => {
    if (!value[0] && this.props.form) {
      this.props.change(this.props.form, 'preferredRadius', 0);
    }
  }

  toggleCreateTagModal = () => {
    const tag = { name: '', description: null };
    this.setState(prevState => (
      { showCreateTag: !prevState.showCreateTag, tag, isTagSubmitted: false }
    ), () => {
      if (this.createTagInput) this.createTagInput.focus();
    });
  }

  handleOnNoticePeriod = (evt, value) => {
    if (!value) {
      this.props.change(this.props.form, 'noticePeriodType', null);
    }
  }

  renderCreateTag = () => {
    const { tag, isTagSubmitted } = this.state;
    return (
      <Modal
        show={this.state.showCreateTag}
        onHide={this.toggleCreateTagModal}
        style={{ display: 'block', margin: '150px auto' }}
      >
        <Modal.Header className={`${styles.modal_header_color}`}>
          <Modal.Title>
            <Row className="clearfix m-0">
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
                ref={input => { this.createTagInput = input; }}
              />
            </div>
          </div>
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
              onClick={this.createCandidateTags}
            >
              <span className={styles.btn_text}><Trans>ADD</Trans></span>
            </button>
          </Col>
        </Modal.Footer>
      </Modal>
    );
  }

  renderNoticeLabel = () => (
    <div><label htmlFor="noticePeriod"><Trans>NOTICE_PERIOD</Trans>
      <OverlayTrigger
        rootClose
        overlay={<Tooltip id="locationText">
          <strong>
            {i18n.t('MAKE_SURE_YOU_SELECT_NOTICE_PERIOD_TO_SELECT_NOTICE_TYPE')}
          </strong>
        </Tooltip>}
        placement="top"
        key="infoText"
      >
        <span className="p-l-10 cursor-pointer">
          <i className="fa fa-info-circle" />
        </span>
      </OverlayTrigger>
    </label></div>
  );


  render() {
    const { save, loading, isSave, values } = this.props;
    const filterConfig = getFilterConfig(this);
    const { showCreateTag } = this.state;
    return (
      <form
        onSubmit={e => { e.preventDefault(); save(e); }}
        role="presentation"
        onKeyDown={e => { this.handlekeyPress(e); }}
        autoComplete="off"
      >
        <div className="m-t-10 m-b-15 p-r-15 p-l-15" >
          <MentionInput {...filterConfig.fields.skills} />
          {!this.state.skillResultsFound && <div className="required_color m-t-15">
            {i18n.t('NO_RESULTS_FOUND')}</div>}
        </div>
        <div className="m-t-5 m-b-10 p-r-15 p-l-15" ref={c => { this.languageContainer = c; }}>
          <MentionInput {...filterConfig.fields.language} />
          {!this.state.languageResultsFound && <div className="required_color m-t-15">
            {i18n.t('NO_RESULTS_FOUND')}</div>}
        </div>
        <div className="m-t-10 m-b-20 p-r-15 p-l-15">
          <Field
            label="CANDIDATE_TAGS"
            name="candidateTags"
            handleValueChange={this.handleTagChange}
            data={this.props.tagsList}
            selectedValue={this.props.values.candidateTags}
            component={renderTags}
            searchTerm={this.state.tagSearchTerm}
            handleSearch={this.onTagSearch}
            placeholder="SELECT_TAGS_TO_FILTER"
            toggleCreateTagModal={this.toggleCreateTagModal}
            tagListCreate={this.tagListCreate}
          />
        </div>
        <div className="m-t-5 m-b-10 p-r-15 p-l-15">
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
            className="inline p-l-20"
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
        <div className="m-t-5 m-b-10 p-r-15 p-l-15">
          <div className="m-b-15">
            <Trans>JOB_TYPE</Trans>
          </div>
          <label
            role="presentation"
            htmlFor="isFreelance"
            style={{ cursor: 'pointer' }}
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
        <div className="m-t-10 m-b-20 p-r-15 p-l-15 col-sm-12">
          {this.renderNoticeLabel()}
          <div className="col-sm-6 p-l-0">
            <InputBox {...filterConfig.fields.noticePeriod} />
          </div>
          <div className="col-sm-6 p-l-0" style={{ marginTop: '4px' }}>
            <DropdownField {...filterConfig.fields.noticePeriodType} isDisabled={!(values && values.noticePeriod)} />
          </div>
        </div>
        <div className="m-t-10 m-b-20 p-r-15 p-l-15" ref={c => { this.locationContainer = c; }}>
          <MultiselectField {...filterConfig.fields.location} />
        </div>
        <div className="m-t-10 m-b-10 p-r-15 p-l-15">
          <InputBox {...filterConfig.fields.preferredRadius} />
        </div>
        <div className="m-t-10 m-b-25 p-r-15 p-l-15">
          <SliderField {...filterConfig.fields.experience} />
        </div>
        <div className="m-t-10 m-b-10 p-r-15 p-l-15">
          <MultiselectField {...filterConfig.fields.source} />
        </div>
        <div className={styles.ratingHead}>
          <Trans>ATTRIBUTE_IMPORTANCE</Trans>
        </div>
        <div className="p-r-15 p-l-15">
          <StarRatingField {...filterConfig.fields.skillrating} />
        </div>
        <div className="p-r-15 p-l-15">
          <StarRatingField {...filterConfig.fields.mobilityrating} />
        </div>
        <div className="p-r-15 p-l-15">
          <StarRatingField {...filterConfig.fields.companyculturerating} />
        </div>
        <div className="p-r-15 p-l-15">
          <StarRatingField {...filterConfig.fields.pedigreerating} />
        </div>
        {
          showCreateTag && this.renderCreateTag()
        }
        {/* <div className="p-r-15 p-l-15">
          <StarRatingField {...filterConfig.fields.contactrating} />
        </div> */}
        <div className="m-t-10 p-r-15 p-l-15 text-center">
          <button
            className={`${styles.submitButton} button-primary`}
            type="submit"
            style={{ width: '45%', opacity: loading && isSave ? '0.7' : '1' }}
            disabled={loading || this.props.invalid}
          >
            <span>
              {loading && isSave ?
                <i
                  className="fa fa-spinner fa-spin p-l-r-7 m-r-5"
                  aria-hidden="true"
                /> : ''
              }
              <i className="fa fa-floppy-o m-r-10" aria-hidden="true" />
              {i18n.t('SAVE')}
            </span>
          </button>
          {/* <button
            className={styles.submitButton}
            onClick={e => { e.preventDefault(); saveAndSearch(); }}
            style={{ width: '45%', float: 'right', opacity: loading && !isSave ? '0.7' : '1' }}
            disabled={loading}
          >
            <span>
              {loading && !isSave ?
                <i
                  className="fa fa-spinner fa-spin p-l-r-7"
                  aria-hidden="true"
                /> : ''
              }
              <i className="fa fa-search m-r-10" aria-hidden="true" />
              Save and Search
            </span>
            </button> */}
        </div>
      </form>
    );
  }
}
