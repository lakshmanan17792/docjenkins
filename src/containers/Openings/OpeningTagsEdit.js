import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
import { Col } from 'react-bootstrap';

import MultiselectField from '../../components/FormComponents/MultiSelect';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { getJobOpeningTags, updateJobOpeningTags } from '../../redux/modules/openings';
import { getFilterConfig } from '../../formConfig/OpeningTagsEdit';
import i18n from '../../i18n';
import Loader from '../../components/Loader';

@reduxForm({
  form: 'EditOpeningTags'
})
@connect(state => ({
  values: getFormValues('EditOpeningTags')(state),
  jobOpeningTags: state.openings.jobOpeningTags,
}), { getJobOpeningTags, updateJobOpeningTags })
export default class OpeningTagsEdit extends Component {
  static propTypes = {
    openingTags: PropTypes.array,
    initialize: PropTypes.func.isRequired,
    getJobOpeningTags: PropTypes.func.isRequired,
    toggleTagsEdit: PropTypes.func.isRequired,
    updateJobOpeningTags: PropTypes.func.isRequired,
    loadOpeningById: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    values: PropTypes.objectOf(PropTypes.any),
    jobId: PropTypes.number
  }
  static defaultProps = {
    openingTags: [],
    values: {},
    jobId: 0
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
    const { openingTags } = this.props;
    this.props.initialize({
      tags: (openingTags.length > 0 && openingTags) || null
    });
    setTimeout(() => {
      const parentEl = document.getElementById('jobTagsFilter');
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
    const { tagSkip, tagLimit, tagSearchTerm, editTags } = this.state;
    const tagObj = {
      skip: tagSkip,
      limit: tagLimit,
      searchTerm: tagSearchTerm,
      editTags
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

  handleTagsSubmit = evt => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      submittingEditTags: true
    });
    const { jobId, values, loadOpeningById, toggleTagsEdit } = this.props;
    this.props.updateJobOpeningTags({
      jobId,
      tags: values.tags
    }).then(res => {
      if (res) {
        this.setState({
          submittingEditTags: false
        }, () => {
          loadOpeningById(jobId);
          toggleTagsEdit();
        });
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
      <div>
        <form onSubmit={this.handleTagsSubmit}>
          <Col lg={9} md={9} className="p-0">
            <MultiselectField {...filterConfig.jobOpeningTags} />
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
