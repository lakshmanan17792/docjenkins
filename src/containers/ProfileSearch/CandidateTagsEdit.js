import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
import { Col } from 'react-bootstrap';

import MultiselectField from '../../components/FormComponents/MultiSelect';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { getCandidateTags, updateCandidateTags } from '../../redux/modules/resume-parser';
import { getFilterConfig } from '../../formConfig/CandidateTagsEdit';
import i18n from '../../i18n';
import Loader from '../../components/Loader';
import styles from './ProfileSearch.scss';

@reduxForm({
  form: 'EditCandidateTags'
})
@connect(state => ({
  values: getFormValues('EditCandidateTags')(state),
  candidateTags: state.resumeParser.candidateTags
}), { getCandidateTags, updateCandidateTags })
export default class CandidateTagsEdit extends Component {
  static propTypes = {
    resumeId: PropTypes.number,
    profileTags: PropTypes.array,
    initialize: PropTypes.func.isRequired,
    getCandidateTags: PropTypes.func.isRequired,
    toggleTagsEdit: PropTypes.func.isRequired,
    updateCandidateTags: PropTypes.func.isRequired,
    loadCandidateProfile: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    values: PropTypes.objectOf(PropTypes.any)
  }
  static defaultProps = {
    profileTags: [],
    values: {},
    resumeId: 0
  }
  constructor(props) {
    super(props);
    this.state = {
      tagSkip: 0,
      tagLimit: 10,
      tagSearchTerm: '',
      editTags: true,
      canGetTags: true,
      isTagScrollEnabled: false,
      submittingEditTags: false
    };
  }

  componentWillMount() {
    this.loadTags();
  }

  componentDidMount() {
    const { profileTags } = this.props;
    this.props.initialize({
      tags: (profileTags.length > 0 && profileTags) || null
    });
    setTimeout(() => {
      const parentEl = document.getElementById('candidateTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }, 100);
  }

  onTagSearch = searchTerm => {
    const { tagLimit, editTags } = this.state;
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
        searchTerm,
        editTags
      };
      this.props.getCandidateTags(tagObj).then(tags => {
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
    const { canGetTags, tagSkip, tagLimit, tagSearchTerm, editTags } = this.state;
    if (!canGetTags) {
      return;
    }
    const tagObj = {
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm,
      editTags
    };
    this.props.getCandidateTags(tagObj).then(tags => {
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
      const parentEl = document.getElementById('candidateTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-popup')[0].getElementsByTagName('ul')[0];
        el.addEventListener('scroll', lodash.debounce(this.getTagsOnScroll, 1000));
        this.setState({ isTagScrollEnabled: true });
      }
    }, 100);
  }

  loadTags = () => {
    const { tagSkip, tagLimit, tagSearchTerm, editTags } = this.state;
    const tagObj = {
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm,
      editTags
    };
    this.props.getCandidateTags(tagObj).then(() => {
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

  handleTagsSubmit = evt => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      submittingEditTags: true
    });
    const { resumeId, values, loadCandidateProfile, toggleTagsEdit } = this.props;
    this.props.updateCandidateTags({
      resumeId,
      tags: values.tags
    }).then(res => {
      if (res) {
        // takes about 2 seconds to map the tag to candidate id in
        setTimeout(() => {
          loadCandidateProfile();
          toggleTagsEdit();
          this.setState({
            submittingEditTags: false
          });
        }, 2000);
      }
    }, err => {
      this.setState({
        submittingEditTags: false
      });
      toastrErrorHandling(err.error, i18n.t('ERROR'),
        i18n.t('errorMessage.COULD_NOT_UPDATE_TAGS'));
    });
  }

  render() {
    const { invalid, pristine, toggleTagsEdit } = this.props;
    const { submittingEditTags } = this.state;
    const filterConfig = getFilterConfig(this);
    return (
      <div className={styles.edit_tag_section}>
        <form onSubmit={this.handleTagsSubmit}>
          <Col lg={9} md={9} className="p-0">
            <MultiselectField {...filterConfig.candidateTags} />
          </Col>
          <Col
            lg={3}
            md={3}
            className="p-0"
            style={{ position: 'relative', top: '4px' }}
          >
            <button
              className="btn button-secondary-hover m-t-20 right"
              onClick={toggleTagsEdit}
            >
              <span><Trans>CANCEL</Trans></span>
            </button>
            <button
              className="btn button-primary m-t-20 m-r-10 right"
              type="submit"
              disabled={invalid || pristine || submittingEditTags}
            >
              <span><Trans>ADD</Trans></span>
            </button>
          </Col>
        </form>
        <Loader loading={submittingEditTags} />
      </div>
    );
  }
}
