import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push as pushState } from 'react-router-redux';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import Helmet from 'react-helmet';
import { Trans } from 'react-i18next';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { toastr } from 'react-redux-toastr';
import lodash from 'lodash';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Checkbox from 'rc-checkbox';
import { isEmpty, trimTrailingSpace, moveFocusToEnd } from '../../utils/validation';
import UserMenu from '../Users/UserMenu';
import { loadSignaturesDefault, saveSignature, updateSignature, getSignature } from '../../redux/modules/signature';
import { imageUpload } from '../../redux/modules/emails';
import Constants from '../../helpers/Constants';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

const styles = require('./SignatureEditor.scss');
const userStyle = require('../Users/Users.scss');
const templateStyle = require('../TemplateEditor/TemplateEditor.scss');

@connect((state, route) => ({
  signatureId: route.params.id,
  user: state.auth.user,
  route: route.route,
  error: state.signature.error,
  signature: state.signature.signature
}), { loadSignaturesDefault, saveSignature, updateSignature, getSignature, pushState, imageUpload })
export default class SignatureEditor extends Component {
  static propTypes = {
    user: PropTypes.object,
    location: PropTypes.object,
    saveSignature: PropTypes.func.isRequired,
    loadSignaturesDefault: PropTypes.func.isRequired,
    updateSignature: PropTypes.func.isRequired,
    getSignature: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    route: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    error: PropTypes.object.isRequired,
    signature: PropTypes.object.isRequired,
    imageUpload: PropTypes.func.isRequired,
    signatureId: PropTypes.string
  };

  static defaultProps = {
    user: {},
    location: {},
    signatureId: ''
  }

  constructor(props) {
    super(props);
    const html = '';
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      const initialContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      this.state = {
        editorState,
        isEdit: false,
        hasSubmittedSuccess: false,
        isPublic: false,
        isDefault: false,
        signatureName: '',
        signature: { name: '', content: initialContent, isDefault: false },
        error: {
          name: {
            isNameValid: false,
            touched: false
          },
          signature: {
            isSignatureValid: false,
            touched: false
          }
        }
      };
    }
  }

  componentWillMount() {
    const { isEdit } = this.state;
    const { signatureId } = this.props;
    const error = {
      name: {
        isNameValid: false,
        touched: false
      },
      signature: {
        isSignatureValid: false,
        touched: false
      }
    };
    if (isEdit) {
      error.isValid = true;
    }
    this.props.getSignature(signatureId).then(() => {
      if (this.props.signature) {
        const signature = this.props.signature;
        const html = signature.content;
        const contentBlock = htmlToDraft(html);
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
          let editorState = EditorState.createWithContent(contentState);
          editorState = EditorState.moveFocusToEnd(editorState);
          this.setState({
            editorState,
            isEdit: true,
            signatureName: signature.name,
            isDefault: signature.isDefault,
            content: signature.content,
            isPublic: signature.isPublic,
            signature,
            error
          });
        }
      }
    });
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      const { signature, signatureName, editorState, isDefault } = this.state;
      // name , content --- initial values // signatureName signatureContent -- edited state
      const signatureContent = this.getFormattedImage(draftToHtml(convertToRaw(editorState.getCurrentContent())));
      if ((signature.name !== signatureName || signature.content !== signatureContent ||
        signature.isDefault !== isDefault) && !this.state.hasSubmittedSuccess) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      }
    });
  }

  onEditorStateChange = editorState => {
    this.setState({
      editorState,
      error: {
        ...this.state.error,
        signature: {
          touched: true
        }
      }
    }, () => this.validation());
  };

  onisDefaultClick = () => {
    const event = {};
    event.target = {};
    event.target.checked = !this.state.isDefault;
    this.onisDefaultChange(event);
  }

  onisDefaultChange = event => {
    const { user } = this.props;
    this.setState({
      isDefault: event.target.checked,
    }, () => {
      this.validation();
    });
    if (event.target.checked) {
      this.props.loadSignaturesDefault({
        where: { userId: user.id, isDefault: true, isDeleted: false }
      }).then(list => {
        const toastrConfirmOptions = {
          onCancel: () => {
            this.setState({
              isDefault: false,
            }, () => {
              this.validation();
            });
          },
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        if (list && list.length > 0) {
          if (list[0].id !== this.state.signature.id) {
            toastr.confirm(i18n.t('confirmMessage.ALREADY_DEFAULT_SIGNATURE_IS_AVAILABLE'),
              toastrConfirmOptions);
          }
        } else {
          toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_SET_THIS_SIGNATURE_TEMPLATE_DEFAULT'),
            toastrConfirmOptions);
        }
      });
    }
  }
  onSignaturenameChange = event => {
    this.setState({
      signatureName: trimTrailingSpace(event.target.value),
      error: {
        ...this.state.error,
        name: {
          touched: true
        }
      }
    }, () => this.validation());
  }


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

  validation = () => {
    const { signatureName, error, isEdit, editorState, isDefault } = this.state;
    const { signature } = this.props;
    error.name.isNameValid = !isEmpty(signatureName);
    error.signature.isSignatureValid = this.isMessageValid();
    if (isEdit) {
      error.isValid = error.signature.isSignatureValid && error.name.isNameValid &&
      (error.name.touched || error.signature.touched) &&
      (signature.name !== signatureName || signature.isDefault !== isDefault || signature.content !==
        this.getFormattedImage(draftToHtml(convertToRaw(editorState.getCurrentContent()))));
    } else {
      error.isValid = error.signature.isSignatureValid && error.name.isNameValid &&
      (error.name.touched || error.signature.touched);
    }
    this.setState({
      error
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
    if (editorText && editorText.entityMap) {
      if (editorText.entityMap[0] && editorText.entityMap[0].type === 'IMAGE') {
        valid = true;
      }
    }
    return valid;
  }

  saveOrUpdateSignature = () => {
    const { editorState, isPublic, isEdit, signature, signatureName, isDefault } = this.state;
    const { user } = this.props;
    const signatureContent = this.getFormattedImage(draftToHtml(convertToRaw(editorState.getCurrentContent())));
    if (isEdit) {
      signature.content = signatureContent;
      signature.isPublic = isPublic;
      signature.name = lodash.trim(signatureName);
      signature.isDefault = isDefault;
      this.props.updateSignature(signature).then(
        () => {
          this.setState({
            hasSubmittedSuccess: true
          }, () => {
            toastr.success(i18n.t('successMessage.SIGNATURE_UPDATED_SUCCESSFULLY'));
            this.props.pushState({
              pathname: '/Signatures',
              state: {
                activePage: this.props.location && this.props.location.state
                  && this.props.location.state.activePage ? this.props.location.state.activePage : ''
              }
            });
          });
        },
        error => {
          toastrErrorHandling(error.error, '', i18n.t('errorMessage.COULD_NOT_UPDATE_SIGNATURE'));
        });
    } else {
      this.props.saveSignature({
        content: signatureContent,
        isPublic,
        userId: user.id,
        name: lodash.trim(signatureName),
        isDefault
      }).then(
        () => {
          this.setState({
            hasSubmittedSuccess: true
          }, () => {
            toastr.success(i18n.t('successMessage.SIGNATURE_SAVED_SUCCESSFULLY'));
            this.props.pushState({
              pathname: '/Signatures',
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
              toastrErrorHandling(error.error, '', i18n.t('errorMessage.SIGNATURE_NAME_ALREADY_EXISTS'));
              return;
            }
            toastrErrorHandling(error.error, '', i18n.t('errorMessage.COULD_NOT_SAVE_SIGNATURE'));
          }
        });
    }
  }

  uploadImageCallBack = file => new Promise((imageResolve, imageReject) => {
    if (file && file.size > 4194304) {
      toastr.error(i18n.t('validationMessage.SIGNATURE_FILE_SIZE_EXCEEDED'));
      imageReject(new Error());
    }
    this.props.imageUpload(file).then(
      result => {
        const url = `${Constants.signatureImage.viewURL}${result.id}?access_token=${result.accessToken}`;
        imageResolve({ data: { link: url } });
      },
      error => imageReject(error)
    );
  });

  render() {
    const { editorState, isEdit, signatureName, error } = this.state;
    const isDisabled = !error.isValid;
    return (
      <Col
        lg={12}
        md={12}
        sm={12}
        xs={12}
        className={userStyle.users_container}
      >
        <Helmet title={i18n.t('tooltipMessage.SIGNATURE_EDITOR')} />
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
                name="signatureName"
                type="text"
                label="NAME"
                onChange={this.onSignaturenameChange}
                value={signatureName}
                autoFocus
                isRequired
              />
              {error && error.name && !error.name.isNameValid && error.name.touched &&
                <div className="text-danger m-l-10">{i18n.t('validationMessage.NAME_CANNOT_BLANK')}</div>
              }
              <div className="editorWrapper">
                <Col className={styles.editorContainer}>
                  <Editor
                    editorState={editorState}
                    editorClassName={`editorWrapper ${styles.editor}`}
                    onEditorStateChange={this.onEditorStateChange}
                    toolbar={{
                      options: [
                        'image',
                        'inline',
                        'fontSize',
                        'fontFamily',
                        'list',
                        'textAlign',
                        'emoji',
                        'colorPicker'],
                      inline: {
                        options: ['bold', 'italic', 'underline', 'strikethrough'],
                      },
                      list: {
                        options: ['unordered', 'ordered'],
                      },
                      image: {
                        uploadCallback: this.uploadImageCallBack,
                        alt: { present: true, mandatory: true },
                        previewImage: true
                      },
                    }}
                  />
                  {error && error.signature && !error.signature.isSignatureValid && error.signature.touched &&
                    <div className="text-danger m-l-10">{i18n.t('validationMessage.SIGNATURE_CANNOT_BLANK')}</div>
                  }
                </Col>
              </div>

              <Col className={styles.defaultCheckbox}>
                <label
                  role="presentation"
                  htmlFor="isDefault"
                  style={{ cursor: 'pointer' }}
                  // onClick={this.onisDefaultClick}
                >
                  <Checkbox
                    checked={this.state.isDefault}
                    id="isDefault"
                    name="isDefault"
                    onChange={this.onisDefaultChange}
                  />
                  <Trans>SET_AS_DEFAULT</Trans>
                </label>
              </Col>
              <button
                className={`button-primary ${templateStyle.submitBtn}`}
                onClick={() => this.saveOrUpdateSignature(draftToHtml(convertToRaw(editorState.getCurrentContent())))}
                disabled={isDisabled}
              >
                <i className="fa fa-floppy-o" aria-hidden="true" />
                {isEdit ? <Trans>UPDATE</Trans> : <Trans>SAVE</Trans>} <Trans>SIGNATURE</Trans>
              </button>
            </Col>
          </Col>
        </Col>
      </Col>
    );
  }
}

const Input = properties => (
  <div className={templateStyle.m_10}>
    <label htmlFor={properties.name}>
      <Trans>{properties.label}</Trans>
      {properties.isRequired ? <span className="required_color">*</span> : ''}
    </label>
    <div>
      <input
        type={properties.type}
        className={`${templateStyle.form_input}`}
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
