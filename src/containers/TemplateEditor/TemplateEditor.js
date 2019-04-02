import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push as pushState } from 'react-router-redux';
// import { DropdownList } from 'react-widgets';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import Helmet from 'react-helmet';
import { Trans } from 'react-i18next';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import lodash from 'lodash';
import { toastr } from 'react-redux-toastr';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// import HtmlEditor from '../../components/Editor/HtmlEditor';
import { isEmpty, trimTrailingSpace, moveFocusToEnd } from '../../utils/validation';
import Constants from '../../helpers/Constants';
import { saveTemplate, updateTemplate, getTemplate } from '../../redux/modules/templates';
import UserMenu from '../Users/UserMenu';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

const styles = require('./TemplateEditor.scss');
const userStyle = require('../Users/Users.scss');
@connect((state, route) => ({
  route: route.route,
  user: state.auth.user,
  error: state.templates.error,
  templateId: route.params.id,
  template: state.templates.template
}), { saveTemplate, updateTemplate, getTemplate, pushState })
export default class TemplateEditor extends Component {
  static propTypes = {
    saveTemplate: PropTypes.func.isRequired,
    location: PropTypes.any.isRequired,
    updateTemplate: PropTypes.func.isRequired,
    getTemplate: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
    error: PropTypes.object,
    templateId: PropTypes.string
  };
  static defaultProps = {
    error: null,
    templateId: ''
  }
  constructor(props) {
    super(props);
    const html = '';
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      let editorState = EditorState.createWithContent(contentState);
      editorState = EditorState.moveFocusToEnd(editorState);
      const initialContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      this.state = {
        editorState,
        isEdit: false,
        hasSubmittedSuccess: false,
        templateName: '',
        template: { name: '', subject: '' },
        content: initialContent,
        owner: '',
        subject: '',
        isPrivate: false,
        error: {
          subject: {
            isSubjectValid: false,
            touched: false
          },
          name: {
            isNameValid: false,
            touched: false
          },
          template: {
            isTemplateValid: false,
            touched: false
          },
          isValid: false
        }
      };
    }
  }

  componentWillMount() {
    const { templateId } = this.props;
    const { isEdit } = this.state;
    const error = {
      subject: {
        isSubjectValid: false,
        touched: false
      },
      name: {
        isNameValid: false,
        touched: false
      },
      template: {
        isTemplateValid: false,
        touched: false
      },
      isValid: false
    };
    if (isEdit) {
      error.isValid = true;
    }
    this.props.getTemplate(templateId).then(() => {
      if (this.props.template) {
        const template = this.props.template;
        const html = template.body;
        const contentBlock = htmlToDraft(html);
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
          const editorState = EditorState.createWithContent(contentState);
          this.setState({
            editorState,
            isEdit: true,
            templateName: template.name,
            owner: template.owner,
            subject: template.subject,
            isPrivate: template.isPrivate,
            content: template.body,
            template,
            error
          });
        }
      }
    });
    if (location.state && location.state.template) {
      const html = this.props.location.state.template.body;
      const template = location.state.template;
      const contentBlock = htmlToDraft(html);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        this.state = {
          editorState,
          isEdit: true,
          templateName: template.name,
          owner: template.owner,
          subject: template.subject,
          isPrivate: template.isPrivate,
          content: template.body,
          template,
          error
        };
      }
    }
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      const { template: { name, subject }, templateName, content, editorState } = this.state;
      // name , subject, content --- initial values // templateName, subject, templateContent -- edited state
      const templateContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      if ((name !== templateName || subject !== this.state.subject || content !== templateContent)
        && !this.state.hasSubmittedSuccess) {
        return (i18n.t('confirmMessage.UNSAVED_CHANGES'));
      }
    });
  }

  onEditorStateChange = editorState => {
    this.setState({
      editorState,
      error: {
        ...this.state.error,
        template: {
          touched: true
        }
      }
    }, () => this.validation());
  };

  onTemplateNameChange = event => {
    const value = trimTrailingSpace(event.target.value);
    this.setState({
      templateName: value,
      error: {
        ...this.state.error,
        name: {
          touched: true
        }
      }
    }, () => this.validation());
  };

  getFormattedImage = message => {
    const imgArr = message.match(/<img\s+[^>]*[^>]*>/g);
    if (imgArr && Array.isArray(imgArr)) {
      imgArr.map(content => {
        message = message.replace(content, `<span style="${this.getStylesForImage(content)}">${content}</span>`);
        return '';
      });
    }
    return message;
  }

  getStylesForImage = content => {
    let imgStyle = 'display: flex;';
    if (content.includes('float:right')) {
      imgStyle = `${imgStyle} justify-content: flex-end;`;
    } else if (content.includes('float:left')) {
      imgStyle = `${imgStyle} justify-content: flex-start;`;
    } else if (content.includes('float:none')) {
      imgStyle = `${imgStyle} justify-content: center;`;
    }
    return imgStyle;
  }

  saveOrUpdateTemplate = html => {
    const htmlArr = html.match(/<a\b[^<]*class=['|"|\\]?['|"|\\]wysiwyg-mention?\b[^<]*?>(.*?)<\/a>/g);
    if (htmlArr && Array.isArray(htmlArr)) {
      htmlArr.map(content => {
        // eslint-disable-next-line no-useless-escape
        const tag = content.match(/\#[a-zA-Z]*/g);
        if (tag) {
          html = html.replace(content, `<a class="wysiwyg-mention" data-mention="">${tag[0]}</a>`);
        }
        return '';
      });
    }
    html = this.getFormattedImage(html);
    const { isEdit, templateName, subject, isPrivate } = this.state;
    const { user } = this.props;
    if (isEdit) {
      const { template } = this.props;
      template.body = html;
      template.name = lodash.trim(templateName);
      template.subject = lodash.trim(subject);
      template.isPrivate = isPrivate;
      this.props.updateTemplate(template).then(
        () => {
          this.setState({
            hasSubmittedSuccess: true
          }, () => {
            toastr.success(i18n.t('successMessage.TEMPLATE_UPDATED_SUCCESSFULLY'));
            this.props.pushState({
              pathname: '/TemplateManager',
              state: {
                activePage: this.props.location && this.props.location.state
                  && this.props.location.state.activePage ? this.props.location.state.activePage : ''
              }
            });
          });
        },
        error => {
          if (error.error.statusCode !== 401) {
            toastrErrorHandling(error.error, '', i18n.t('errorMessage.COULD_NOT_UPDATE_TEMPLATE'));
          }
        });
    } else {
      const template = {
        body: html,
        name: lodash.trim(templateName),
        isPrivate,
        type: 'string',
        userId: user.id,
        createdBy: user.id,
        subject: lodash.trim(subject)
      };
      this.props.saveTemplate(template).then(
        () => {
          this.setState({
            hasSubmittedSuccess: true
          }, () => {
            toastr.success(i18n.t('successMessage.TEMPLATE_CREATED_SUCCESSFULLY'));
            this.props.pushState({
              pathname: '/TemplateManager',
              state: {
                activePage: this.props.location && this.props.location.state
                  && this.props.location.state.activePage ? this.props.location.state.activePage : ''
              }
            });
          });
        },
        error => {
          if (error.error.statusCode !== 401) {
            if (this.props.error && this.props.error.code === '23505') {
              toastrErrorHandling(error.error, '', i18n.t('errorMessage.TEMPLATE_NAME_ALREADY_EXISTS'));
              return;
            }
            toastrErrorHandling(error.error, '', i18n.t('errorMessage.COULD_NOT_SAVE_TEMPLATE'));
          }
        });
    }
  }

  validation = () => {
    const { subject, templateName, error, isEdit, editorState } = this.state;
    const { template } = this.props;
    error.subject.isSubjectValid = !isEmpty(subject);
    error.name.isNameValid = !isEmpty(templateName);
    error.template.isTemplateValid = this.isMessageValid();
    if (isEdit) {
      error.isValid = error.subject.isSubjectValid &&
      error.name.isNameValid &&
      error.template.isTemplateValid &&
      (template.name !== templateName ||
        subject !== template.subject ||
        template.body !== this.getFormattedImage(draftToHtml(convertToRaw(editorState.getCurrentContent())))
      );
    } else {
      error.isValid = error.subject.isSubjectValid &&
      error.name.isNameValid &&
      error.template.isTemplateValid;
    }
    this.setState({
      error,
    });
  }

  isMessageValid = () => {
    const {
      editorState,
    } = this.state;
    const editorText = convertToRaw(editorState.getCurrentContent());
    let valid = false;
    if (editorText && editorText.blocks) {
      editorText.blocks.map(block => {
        if (!isEmpty(trimTrailingSpace(block.text))) {
          valid = true;
          return true;
        }
        return false;
      });
    }
    return valid;
  }

  render() {
    const { personalizations } = Constants;
    const { editorState, isEdit, templateName, subject, error } = this.state;
    return (
      <Col
        lg={12}
        md={12}
        sm={12}
        xs={12}
        className={userStyle.users_container}
      >
        <Helmet title={i18n.t('TEMPLATE_MANAGER')} />
        <Col lg={2} md={2} sm={2} xs={12} className="p-0">
          <Col lg={12} md={12} sm={12} xs={12} className={userStyle.sidenav}>
            <Col lg={12} md={12} sm={12} xs={12} className="p-0">
              <UserMenu />
            </Col>
          </Col>
        </Col>
        <Col lg={10} md={10} sm={10} xs={12} className="p-0">
          <Col lg={12} md={12} sm={12} xs={12} className={`p-l-30 ${styles.container}`}>
            <Col md={8} lg={8} className="p-t-10">
              <Input
                name="templateName"
                type="text"
                label="NAME"
                onChange={this.onTemplateNameChange}
                value={templateName}
                autoFocus
                isRequired
              />
              {error && error.name && !error.name.isNameValid && error.name.touched &&
              <div className="text-danger m-l-10">{i18n.t('validationMessage.NAME_CANNOT_BLANK')}</div>
              }
              <Input
                name="subject"
                type="text"
                label="SUBJECT"
                onChange={e => {
                  this.setState({
                    subject: trimTrailingSpace(e.target.value),
                    error: {
                      ...this.state.error,
                      subject: {
                        touched: true
                      }
                    }
                  }, () => this.validation());
                }}
                value={subject}
                isRequired
              />
              {error && error.subject && !error.subject.isSubjectValid && error.subject.touched &&
              <div className="text-danger m-l-10">{i18n.t('validationMessage.SUBJECT_CANNOT_BLANK')}</div>
              }
              <Col className={styles.editorContainer}>
                <Editor
                  editorState={editorState}
                  editorClassName={`editorWrapper ${styles.editor}`}
                  onEditorStateChange={this.onEditorStateChange}
                  toolbar={{
                    options: ['inline', 'fontSize', 'fontFamily', 'list', 'textAlign', 'emoji', 'colorPicker'],
                    inline: {
                      options: ['bold', 'italic', 'underline', 'strikethrough'],
                    },
                    list: {
                      options: ['unordered', 'ordered'],
                    }
                  }}
                  mention={{
                    separator: ' ',
                    trigger: '#',
                    suggestions: personalizations,
                  }}
                  hashtag={{}}
                />
                {error && error.template && !error.template.isTemplateValid && error.template.touched &&
                <div className="text-danger m-l-10">{i18n.t('validationMessage.TEMPLATE_CANNOT_BLANK')}</div>
                }
              </Col>
              <button
                className={`button-primary ${styles.submitBtn}`}
                onClick={() => this.saveOrUpdateTemplate(draftToHtml(convertToRaw(editorState.getCurrentContent())))}
                disabled={!error.isValid}
              >
                <i className="fa fa-floppy-o" aria-hidden="true" />
                {isEdit ? <Trans>UPDATE</Trans> : <Trans>SAVE</Trans>} <Trans>TEMPLATE</Trans>
              </button>
            </Col>
          </Col>
        </Col>
      </Col>
    );
  }
}

const Input = properties => (
  <div className={styles.m_10}>
    <label htmlFor={properties.name}>
      <Trans>{properties.label}</Trans>
      {properties.isRequired ? <span className="required_color">*</span> : ''}
    </label>
    <div>
      <input
        type={properties.type}
        className={`${styles.form_input}`}
        id={properties.name}
        disabled={properties.disabled}
        value={properties.value}
        onChange={properties.onChange}
        onFocus={properties.autoFocus ? moveFocusToEnd : ''}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={properties.autoFocus}
      />
    </div>
  </div>
);
