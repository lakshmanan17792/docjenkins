import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { isPristine } from 'redux-form';
import { Trans } from 'react-i18next';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import htmlToDraft from 'html-to-draftjs';
import React, { Component } from 'react';
import { DropdownList, DateTimePicker } from 'react-widgets';
import { trimTrailingSpace } from '../../utils/validation';
import { loadUsers } from '../../redux/modules/users/user';
import i18n from '../../i18n';
// import JobOpenings from '../../containers/JobOpenings/index';

const outcome = ['No answer', 'Busy', 'Wrong number',
  'Left live message', 'Left voicemail', 'Connected'];

  @connect(state => ({
    isSaveOpeningPristine: isPristine('StepSaveOpening')(state),
    isSaveContactPristine: isPristine('SaveContact')(state),
    contactFormData: state.form.SaveContact,
    openingFormData: state.form.StepSaveOpening,
    formData: state.form.CompanyOverview,
    formDataPristine: isPristine('CompanyOverview')(state),
  }),
  { loadUsers })
export default class ActivityLogger extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    hasSubmitSucceeded: PropTypes.bool,
    route: PropTypes.object.isRequired,
    actionType: PropTypes.string.isRequired,
    loadUsers: PropTypes.func.isRequired,
    editLog: PropTypes.func.isRequired,
    isEdit: PropTypes.bool,
    formDataPristine: PropTypes.bool.isRequired,
    isSaveOpeningPristine: PropTypes.bool,
    openingFormData: PropTypes.object,
    formData: PropTypes.object,
    isSaveContactPristine: PropTypes.bool,
    contactFormData: PropTypes.object,
    activity: PropTypes.object,
    description: PropTypes.string
  }

  static defaultProps = {
    params: {
      type: null,
      name: null,
      selectedOption: null,
      handleOnInputChange: null,
      placeholder: null,
      handleSubmit: null,
      logPlaceHolder: 'Select a log',
      defaultLogValue: null,
      logDate: new Date(),
      description: null,
      requiredTypeForOutCome: null
    },
    description: null,
    isSaveOpeningPristine: null,
    hasSubmitSucceeded: false,
    openingFormData: null,
    isSaveContactPristine: null,
    contactFormData: null,
    formData: null,
    activity: null,
    isEdit: false,
  };

  constructor(props) {
    super(props);
    const {
      type,
      handleSubmit,
      logDate,
      logPlaceHolder,
      defaultLogValue,
      requiredTypeForOutCome } = props.params;
    const { actionType } = props;
    this.state = {
      handleSubmit,
      logDate,
      logDateBackup: logDate,
      type,
      logPlaceHolder,
      defaultLogValue,
      selectedType: defaultLogValue,
      selectedOutCome: null,
      editorState: EditorState.createEmpty(),
      description: this.props.description,
      defaultOutComeValue: null,
      requiredTypeForOutCome,
      actionType,
      users: [],
      previousValues: []
    };
  }

  componentWillMount() {
    this.loadUsers();
    if (this.props.isEdit) {
      const description = this.props.activity.description.replace(/<a "/g, '<a href="');
      if (description) {
        this.setState({
          editorState: this.getInitialEditorState(description),
          previousValues: description
        });
      }
      if (this.props.activity.type === 'Log a call') {
        this.setState({
          selectedOutCome: this.props.activity.outcome
        });
      }
    } else {
      this.setState({
        editorState: this.getInitialEditorState(this.props.description),
      });
    }
  }

  componentDidMount() {
    document.querySelector('div.rw-datetime-picker input').disabled = true;
    const { route, router } = this.props;
    if (route && router) {
      router.setRouteLeaveHook(route, () => {
        const { selectedType, selectedOutCome, defaultLogValue, logDate, logDateBackup } = this.state;
        if (this.props.description || selectedType !== defaultLogValue ||
          selectedOutCome || logDate.getTime() !== logDateBackup.getTime()) {
          return i18n.t('confirmMessage.UNSAVED_CHANGES_IN_ACTIVITY_LOG');
        } else if (this.props.openingFormData && !this.props.isSaveOpeningPristine && !this.props.hasSubmitSucceeded) {
          return i18n.t('confirmMessage.UNSAVED_CHANGES');
        } else if (this.props.formData && !this.props.formDataPristine && !this.props.hasSubmitSucceeded) {
          return i18n.t('confirmMessage.UNSAVED_CHANGES');
        } else if (this.props.contactFormData && !this.props.isSaveContactPristine && !this.props.hasSubmitSucceeded) {
          return i18n.t('confirmMessage.UNSAVED_CHANGES');
        }
      });
    }
  }

  onEditorStateChange = editorState => {
    const { blocks } = convertToRaw(editorState.getCurrentContent());
    let description = (blocks.length === 1 && trimTrailingSpace(blocks[0].text) === '') ?
      null :
      draftToHtml(convertToRaw(editorState.getCurrentContent()));
    if (description) {
      const { origin, pathname } = window.location;
      const path = (pathname.includes('Company') && 'Company') || (pathname.includes('Openings') && 'Openings');
      const replaceStr = new RegExp(`${origin}/${path}/`, 'g');
      description = description.replace(replaceStr, '');
    }
    this.props.editLog(description);
    this.setState({
      editorState
    });
  }

  setSelectedType = value => {
    let { selectedOutCome } = this.state;
    selectedOutCome = (value !== 'Log a call') ? null : selectedOutCome;
    this.setState({ selectedType: value, selectedOutCome });
  }
  getInitialEditorState = htmlText => {
    if (htmlText) {
      const blocksFromHtml = htmlToDraft(htmlText);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return EditorState.createWithContent(contentState);
    }
  }

  loadUsers() {
    this.props.loadUsers().then(users => {
      users = users.map(user => ({
        text: user.firstName,
        value: user.firstName,
        tagValue: `#${user.firstName}#`,
        url: user.id
      }));
      this.setState({
        users
      });
    });
  }

  discardMessage = () => {
    const { defaultLogValue } = this.state;
    if (this.props.isEdit) {
      const description = this.props.activity.description.replace(/<a "/g, '<a href="');
      this.props.editLog(description);
      this.setState({
        editorState: this.getInitialEditorState(description),
        selectedType: this.props.activity.type,
        defaultLogValue,
        defaultOutComeValue: null,
        selectedOutCome: this.props.activity.outcome,
        logDate: new Date(this.props.activity.logDate)
      });
    } else {
      this.props.editLog(null);
      this.setState({
        editorState: EditorState.createEmpty(),
        selectedType: defaultLogValue,
        defaultLogValue,
        defaultOutComeValue: null,
        selectedOutCome: null,
        logDate: new Date(),
        logDateBackup: new Date()
      });
    }
  }

  convertHTMLToStr = html => {
    const tag = document.createElement('div');
    tag.innerHTML = html;
    return tag.innerText;
  }

  convertTag = content => {
    content = content.replace(/<p/g, '<div');
    content = content.replace(/<\/p/g, '</div');
    return content;
  }

  logMessage = () => {
    const { selectedType, selectedOutCome, logDate, requiredTypeForOutCome, actionType } = this.state;
    let { description } = this.props;
    const { activity } = this.props;
    const { previousValues } = this.state;
    const deviceDetails = JSON.parse(localStorage.getItem('deviceDetails'));
    const users = [];
    let descriptionText = '';
    if (description) {
      let array = description ? description.split('<a href="') : [];
      array = array.length > 1 ? array.slice(1) : [];
      array.forEach(element => {
        const elements = element.split('"');
        users.push({
          id: parseInt(elements[0], 10),
          firstName: elements[4]
        });
      });
      description = description.replace(/href=(.*?)/g, '');
      description = this.convertTag(description);
      descriptionText = this.convertHTMLToStr(description);
    }
    if (!selectedType) {
      toastr.error(i18n.t('warningMessage.WARNING'), i18n.t('warningMessage.LOGTYPE_CANNOT_BE_EMPTY'));
    } else if (!description && selectedType === requiredTypeForOutCome && !selectedOutCome) {
      toastr.error(i18n.t('warningMessage.WARNING'),
        i18n.t('warningMessage.OUTCOME_AND_DESCRIPTION_CANNOT_BE_EMPTY_AT_THE_SAME_TIME'));
    } else if (!description && selectedType !== requiredTypeForOutCome) {
      toastr.error(i18n.t('warningMessage.WARNING'), i18n.t('warningMessage.DESCRIPTION_CANNOT_BE_EMPTY'));
    } else if (this.props.isEdit) {
      if (!description) {
        description = activity.description;
      }
      this.props.params.handleSubmit({
        parentId: activity.id,
        description,
        descriptionText,
        type: selectedType,
        outcome: selectedOutCome,
        logDate,
        users,
        actionType,
        previousValues,
        deviceDetails
      });
    } else {
      this.props.params.handleSubmit({
        description,
        descriptionText,
        type: selectedType,
        outcome: selectedOutCome,
        logDate,
        deviceDetails,
        users,
        actionType
      }, () => {
        this.discardMessage();
      });
    }
  }

  render() {
    const { type, logDate, logPlaceHolder, defaultLogValue,
      selectedType, selectedOutCome,
      users } = this.state;
    const { activity, isEdit, description } = this.props;
    const styles = require('./ActivityLogger.scss');
    return (
      <div className="logger_container">
        <div className={styles.logger_section}>
          <Row className={styles.logger_box}>
            <Col sm={12} className={styles.logger_content}>
              <Col sm={12} className="">
                <Row className="m-0">
                  <Col sm={3} className="m-t-15 p-l-0">
                    <DropdownList
                      data={type}
                      messages={{ open: i18n.t('tooltipMessage.OPEN_DROPDOWN') }}
                      placeholder={logPlaceHolder ? i18n.t(`placeholder.${logPlaceHolder}`) : ''}
                      onChange={this.setSelectedType}
                      className={styles.rw_input}
                      value={selectedType}
                    />
                  </Col>
                  <Col sm={3} className={selectedType !== 'Log a call' ? 'hide' : 'm-t-15'}>
                    <DropdownList
                      data={outcome}
                      defaultValue={defaultLogValue}
                      placeholder={i18n.t('placeholder.SELECT_AN_OUTCOME')}
                      onChange={value => this.setState({ selectedOutCome: value })}
                      value={selectedOutCome}
                    />
                  </Col>
                  <Col sm={4} className="m-t-15 w-200 right">
                    <DateTimePicker
                      value={logDate}
                      max={new Date()}
                      onChange={value => this.setState({ logDate: value })}
                      messages={
                        {
                          dateButton: i18n.t('tooltipMessage.SELECT_DATE'),
                          timeButton: i18n.t('tooltipMessage.SELECT_TIME')
                        }
                      }
                    />
                  </Col>
                  <Col sm={12} className="p-l-0 p-r-0">
                    <Editor
                      editorState={this.state.editorState}
                      wrapperClassName="editorContainer"
                      editorClassName={styles.editor}
                      onEditorStateChange={this.onEditorStateChange}
                      toolbar={{
                        options: ['inline', 'fontSize', 'emoji', 'list'],
                        inline: {
                          options: ['bold', 'italic', 'underline'],
                        },
                        list: {
                          options: ['unordered', 'ordered'],
                        }
                      }}
                      mention={{
                        separator: ' ',
                        trigger: '@',
                        suggestions: users
                      }}
                    />
                    <Col sm={12} className={'m-b-25 p-0'}>
                      <button
                        type="submit"
                        className={`${styles.logger_btn} button-primary`}
                        disabled={isEdit ?
                          (activity.description === description && activity.type === selectedType &&
                           new Date(activity.logDate).getTime() === logDate.getTime()) :
                          (!description && (selectedType !== 'Log a call')) ||
                          (!description && (selectedType === 'Log a call') && !selectedOutCome)}
                        onClick={this.logMessage}
                      >
                        <Trans>LOG_ACTIVITY</Trans>
                      </button>
                      <button
                        className={`${styles.discard_btn} button-secondary`}
                        onClick={this.discardMessage}
                      >
                        <Trans>RESET</Trans>
                      </button>
                    </Col>
                  </Col>
                </Row>
              </Col>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
