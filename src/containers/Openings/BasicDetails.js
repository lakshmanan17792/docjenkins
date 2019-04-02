import React, { Component } from 'react';
import { Col, Row, Modal } from 'react-bootstrap';
import { reduxForm, change, getFormValues, Field } from 'redux-form';
import Select from 'react-select';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import draftToHtml from 'draftjs-to-html';
import { toastr } from 'react-redux-toastr';
import htmlToDraft from 'html-to-draftjs';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import PropTypes from 'prop-types';
import { Multiselect } from 'react-widgets';
import lodash from 'lodash';
import InputBox from '../../components/FormComponents/InputBox';
import TextEditor from '../../components/FormComponents/TextEditor';
import DropdownField from '../../components/FormComponents/DropdownList';
import { getBasicDetailsFormConfig, basicDetailsValidation } from '../../formConfig/StepSaveOpening';
import {
  loadClientCompanies,
  loadContactPerson,
  getJobOpeningTags,
  createJobOpeningTag
} from '../../redux/modules/openings';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';
import {
  trimTrailingSpace
} from '../../utils/validation';

const styles = require('./StepSaveOpening.scss');

const renderTags = properties => {
  const { selectedValue, data, label, handleValueChange, toggleCreateTagModal,
    handleSearch, searchTerm } = properties;
  return (
    <div className="m-t-10 m-b-5 p-l-15 p-r-15">
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
        id="jobTags"
      />
    </div>
  );
};

const renderField = data => {
  const {
    name,
    valueKey,
    labelKey,
    selectedOption,
    handleOnChange,
    handleOnInputChange,
    companyList,
    placeholder,
    searchTerm
  } = data;
  return (
    <div>
      {companyList.length > 0 ?
        <Select
          name={name}
          valueKey={valueKey}
          labelKey={labelKey}
          value={selectedOption}
          onChange={handleOnChange}
          onInputChange={handleOnInputChange}
          options={companyList}
          noResultsText={searchTerm === '' ? '' : i18n.t('NO_RESULTS_FOUND')}
          placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
          optionClassName="select-orange"
        /> :
        <Select
          name={name}
          onInputChange={handleOnInputChange}
          placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
          noResultsText={searchTerm === '' ? '' : i18n.t('NO_RESULTS_FOUND')}
          value={selectedOption}
        />
      }
    </div>
  );
};

@reduxForm({
  form: 'StepSaveOpening',
  destroyOnUnmount: false,
  touchOnChange: true,
  forceUnregisterOnUnmount: true,
  validate: basicDetailsValidation,
})
@connect(state => ({
  values: getFormValues('StepSaveOpening')(state),
  companies: state.openings.companyList,
  contactPerson: state.openings.contactPerson,
  jobOpeningTags: state.openings.jobOpeningTags
}), {
  change,
  loadClientCompanies,
  loadContactPerson,
  getJobOpeningTags,
  createJobOpeningTag
})

export default class BasicDetails extends Component {
  static propTypes = {
    initialValues: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    isInitialLoad: PropTypes.bool.isRequired,
    initialize: PropTypes.func.isRequired,
    form: PropTypes.string,
    values: PropTypes.objectOf(PropTypes.any),
    loadClientCompanies: PropTypes.func.isRequired,
    loadContactPerson: PropTypes.func.isRequired,
    clickedAnotherPage: PropTypes.bool.isRequired,
    resetPageFields: PropTypes.func.isRequired,
    gotoPage: PropTypes.func.isRequired,
    toPage: PropTypes.number.isRequired,
    valid: PropTypes.bool.isRequired,
    companies: PropTypes.any,
    getJobOpeningTags: PropTypes.func.isRequired,
    createJobOpeningTag: PropTypes.func.isRequired,
    jobOpeningTags: PropTypes.array.isRequired,
    handleTagChange: PropTypes.func.isRequired,
    selectedTags: PropTypes.array.isRequired,
    addTag: PropTypes.func.isRequired
  }

  static defaultProps = {
    form: '',
    values: {},
    initialValues: {},
    companies: {}
  };

  displayName = item => {
    let firstName = '';
    let lastName = '';
    if (!(item.firstName === undefined || item.firstName === null)) {
      firstName = item.firstName;
    }
    if (!(item.lastName === undefined || item.lastName === null)) {
      lastName = item.lastName;
    }
    return `${firstName} ${lastName}`;
  };

  constructor(props) {
    super(props);
    this.state = {
      initialParam: '',
      selectedOption: '',
      editorState: props.values && props.values.description ?
        this.getInitialEditorState(props.values.description) :
        this.ckeckInitialEditorState(),
      companySearchTerm: '',
      showCreateTag: false,
      tag: {
        name: '',
        description: null
      },
      searchTerm: '',
      isTagSubmitted: false,
      tagSkip: 0,
      tagLimit: 10,
      tagSearchTerm: '',
      canGetTags: true,
      isTagScrollEnabled: false
    };
  }

  componentWillMount() {
    const { initialValues, values, isInitialLoad } = this.props;
    if (initialValues && !initialValues.description && isInitialLoad) {
      const editorState = EditorState.createEmpty();
      const initialContent = draftToHtml(convertToRaw(editorState.getCurrentContent())).trim();
      this.props.initialize({ ...this.props.initialValues, description: initialContent });
    }
    if (values && values.company) {
      this.handleOnCompanyChange(values.company, 1);
    } else if (initialValues && initialValues.company) {
      this.handleOnCompanyChange(initialValues.company, 1);
    } else if (values && values.companies) {
      this.handleOnCompanyChange(values.companies, 1);
    } else if (initialValues && initialValues.companies) {
      this.handleOnCompanyChange(initialValues.companies, 1);
    } else {
      this.handleOnCompanyChange(this.state.initialParam, 1);
    }

    this.loadJobOpeningTags();
  }

  componentDidMount = () => {
    setTimeout(() => {
      const parentEl = document.getElementById('jobTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-input-reset')[0];
        el.addEventListener('focus', this.tagListCreate);
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const { valid, handleSubmit, gotoPage, resetPageFields } = this.props;
    const { toPage } = nextProps;
    if (nextProps.clickedAnotherPage) {
      if (toPage < 1) {
        gotoPage(toPage, valid);
      } else if (valid) {
        gotoPage(toPage, valid);
      } else {
        handleSubmit();
        resetPageFields();
      }
    }
  }

  onEditorStateChange = editorState => {
    this.setState({
      editorState,
    }, () => {
      const htmlText = draftToHtml(convertToRaw(editorState.getCurrentContent())).trim();
      this.props.change(this.props.form, 'description', htmlText);
    });
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
        } else {
          this.setState(prevState =>
            ({
              tagSkip: prevState.tagSkip + 10
            })
          );
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

  getInitialEditorState = htmlText => {
    const blocksFromHtml = htmlToDraft(htmlText);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    return EditorState.createWithContent(contentState);
  }

  changeFieldValues = (fieldName, value) => {
    this.props.change(this.props.form, fieldName, value);
  }

  handleOnBlurTitle = evt => {
    if (evt.target.value) {
      const match = evt.target.value.lastIndexOf('(m/w/x)');
      if (match === -1) {
        this.changeFieldValues('jobTitle', `${evt.target.value.trim()} (m/w/x)`);
      }
    }
  }

  handleOnFocusTitle = evt => {
    if (evt.target.value) {
      const match = evt.target.value.toLowerCase().lastIndexOf('(m/w/x)');
      this.changeFieldValues('jobTitle', evt.target.value.slice(0, match - 1));
    }
  }

  ckeckInitialEditorState = () => {
    if (this.props.values.description) {
      return this.getInitialEditorState(this.props.values.description);
    }
    return EditorState.createEmpty();
  }

  tagListCreate = () => {
    const { isTagScrollEnabled } = this.state;
    if (isTagScrollEnabled) {
      return;
    }
    setTimeout(() => {
      const parentEl = document.getElementById('jobTags');
      if (parentEl) {
        const el = parentEl.getElementsByClassName('rw-popup')[0].getElementsByTagName('ul')[0];
        el.addEventListener('scroll', lodash.debounce(this.getTagsOnScroll, 1000));
        this.setState({ isTagScrollEnabled: true });
      }
    }, 100);
  }

  loadJobOpeningTags = () => {
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

  changeFieldValues = (fieldName, value) => {
    this.props.change(this.props.form, fieldName, value);
  }

  handleOnCompanyChange = (value, hideToaster) => {
    if (value) {
      const companyId = value.id ? value.id : '';
      if (hideToaster && value.name) {
        const companyName = value.name;
        this.props.loadClientCompanies({
          searchTerm: companyName.toLowerCase()
        }).then(result => {
          if (result.totalCount === 0) {
            toastr.info(i18n.t('ADD_COMPANY'), i18n.t('infoMessage.PLEASE_ADD_COMPANY_BEFORE_CREATING_JOB_OPENING'));
          }
        });
      }
      if (companyId) {
        this.setState({ selectedOption: companyId }, () => {
          this.props.change(this.props.form, 'company', value);
        });
      }
      const contactIds = [];
      if (hideToaster !== 1) {
        this.props.change(this.props.form, 'contactPerson', null);
      }
      if (companyId) {
        contactIds.push(companyId);
        this.props.loadContactPerson(contactIds).then(list => {
          if (list.length === 1) {
            if (list[0].companyId) delete list[0].companyId;
            // if we have one contact in a company load contact directly, so initialize that contact 
            // with default discription content (if not available)
            const { initialValues, isInitialLoad } = this.props;
            if (isInitialLoad && hideToaster) {
              if (initialValues && !initialValues.description) {
                const editorState = EditorState.createEmpty();
                const initialContent = draftToHtml(convertToRaw(editorState.getCurrentContent())).trim();
                this.props.initialize(
                  { ...this.props.initialValues, contactPerson: list[0], description: initialContent });
              } else {
                this.props.initialize({ ...this.props.initialValues, contactPerson: list[0] });
              }
            } else {
              this.props.change(this.props.form, 'contactPerson', list[0]);
            }
          } else if (list.length > 0 && hideToaster !== 1) {
            toastr.info(i18n.t('COMPANY_UPDATE_LABEL'), i18n.t('infoMessage.SELECT_A_CONTACT_PERSON'));
          } else if (list.length === 0) {
            toastr.info(i18n.t('COMPANY_UPDATE_LABEL'),
              i18n.t('infoMessage.PLEASE_ADD_A_CONTACT_FOR_THIS_OPENING'));
          }
        }, err => {
          toastrErrorHandling(err.error, i18n.t('ERROR'),
            i18n.t('errorMessage.ERROR_IN_FETCHING_COMPANY_CONTACTS_DETAILS'));
        });
      }
    } else {
      this.setState({ selectedOption: '' }, () => {
        this.props.change(this.props.form, 'company', '');
      });
    }
  }

  handleChange = value => {
    if (value) {
      this.props.loadClientCompanies({
        searchTerm: value.toLowerCase()
      });
      this.setState({
        companySearchTerm: value
      });
    }
  }

  toggleCreateTagModal = () => {
    const tag = { name: '', description: null };
    // this.setState(prevState => (
    //   { showCreateTag: !prevState.showCreateTag, tag }
    // ));
    this.setState(prevState => (
      { showCreateTag: !prevState.showCreateTag, tag, isTagSubmitted: false }
    ), () => {
      setTimeout(() => {
        if (this.testInput) {
          this.testInput.focus();
        }
      }, 1);
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

  handleTagChange = tags => {
    this.props.change(this.props.form, 'tags', tags);
  }

  handleSearch = searchTerm => {
    const { tagLimit } = this.state;
    const value = searchTerm.replace(/\s\s+/g, ' ');
    if (value === this.state.tagSearchTerm || value === ' ') return;
    if (/^[A-z\d\s-]+$/i.test(value) || value === '') {
      this.setState({
        tagSearchTerm: trimTrailingSpace(searchTerm),
        canGetTags: true,
        tagSkip: 0
      });
      const tagObj = {
        skip: 0,
        limit: tagLimit,
        searchTerm: trimTrailingSpace(searchTerm)
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

  checkSubmit = e => {
    const { isTagSubmitted, tag } = this.state;
    if (e.charCode === 13 && !isTagSubmitted && tag.name.trim() !== '') {
      e.preventDefault();
      e.stopPropagation();
      this.saveTag();
    }
  }

  saveTag = () => {
    const { tag } = this.state;
    const { values } = this.props;
    this.setState({ isTagSubmitted: true });
    values.tags = values.tags ? values.tags : [];
    this.props.createJobOpeningTag(tag).then(res => {
      this.setState({
        tag: {
          name: '',
          description: null
        },
        showCreateTag: false,
        isTagSubmitted: true,
        canGetTags: true
      });
      this.props.change(this.props.form, 'tags', [...values.tags, res]);
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
                ref={input => { this.testInput = input; }}
                onKeyPress={e => this.checkSubmit(e)}
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
              onClick={this.saveTag}
            >
              <span className={styles.btn_text}><Trans>ADD</Trans></span>
            </button>
          </Col>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    const { initialValues, companies, handleSubmit, jobOpeningTags, values } = this.props;
    const { selectedOption, companySearchTerm, showCreateTag, tagSearchTerm } = this.state;
    const filterConfig = getBasicDetailsFormConfig(this);
    return (
      <form onSubmit={handleSubmit}>
        <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <InputBox {...filterConfig.jobTitle} />
        </div>
        <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <TextEditor
            {...filterConfig.description}
            handleOnChange={this.onEditorStateChange}
            editorState={this.state.editorState}
          />
        </div>
        {/* <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <MultiselectField {...filterConfig.tags} />
        </div> */}
        {
          <Field
            label="TAGS"
            name="tags"
            handleValueChange={this.handleTagChange}
            data={jobOpeningTags}
            selectedValue={values.tags}
            isRequired
            component={renderTags}
            toggleCreateTagModal={this.toggleCreateTagModal}
            searchTerm={tagSearchTerm}
            handleSearch={this.handleSearch}
          />
        }
        {
          !initialValues.company &&
          <div className="m-t-10 m-b-5 p-l-15 p-r-15">
            <label htmlFor="company" >
              <Trans>COMPANY</Trans>
              <span className="required_color">*</span>
            </label>
            <Field
              component={renderField}
              name="company"
              valueKey="id"
              labelKey="name"
              selectedOption={selectedOption}
              placeholder="START_TYPING_TO_ADD_COMPANY"
              handleOnChange={this.handleOnCompanyChange}
              handleOnInputChange={this.handleChange}
              companyList={companies}
              searchTerm={companySearchTerm}
            />
          </div>
        }
        <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <DropdownField {...filterConfig.contactPerson} />
        </div>
        {
          showCreateTag && this.renderCreateTag()
        }
        <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <button className={`${styles.submitButton} button-primary`} type="submit">
            <Trans>CONTINUE</Trans>
          </button>
        </div>
      </form>
    );
  }
}
