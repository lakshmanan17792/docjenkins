import React, { Component } from 'react';
import { Row, Col, Button, Modal, Panel, PanelGroup } from 'react-bootstrap';
import { Multiselect } from 'react-widgets';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState, SelectionState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Scrollbars } from 'react-custom-scrollbars';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { connect } from 'react-redux';
import htmlToDraft from 'html-to-draftjs';
import { toastr } from 'react-redux-toastr';
import Chips from 'react-chips';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// import 'react-select/dist/react-select.css';
import Moment from 'moment';
import { Trans } from 'react-i18next';
import Parser from 'html-react-parser';
import async from 'async';
import { isEmail, isEmpty, trimTrailingSpace } from '../../utils/validation';
import CustomChip from '../../components/CustomChip/CustomChip';
import Constants from '../../helpers/Constants';
import theme from '../../theme/reactchips';
import { loadTemplates } from '../../redux/modules/templates';
import { loadSignatures } from '../../redux/modules/signature';
import { fetchEmails, fileUpload, sendEmail, discardFiles, fetchUserEmails } from '../../redux/modules/emails';
import { loadSmtp } from '../../redux/modules/smtp';
import { loadOpeningById, loadContactPerson } from '../../redux/modules/openings';
import { addSelectedCandidates, removedSelectedCandidates } from '../../redux/modules/ATS';
import Loader from '../../components/Loader';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import NewPermissible from '../../components/Permissible/NewPermissible';

const style = require('./Emailer.scss');

let latestCursorLocation;
@connect((state, route) => ({
  user: state.auth.user,
  searchEmails: state.emails.profileEmails,
  route: route.route,
  emailState: state.emails,
  userEmails: state.emails.userEmails,
  emailConfig: state.smtp.emailConfig,
}), {
  loadTemplates,
  loadSignatures,
  fetchEmails,
  fileUpload,
  sendEmail,
  discardFiles,
  fetchUserEmails,
  loadContactPerson,
  loadOpeningById,
  addSelectedCandidates,
  removedSelectedCandidates,
  loadSmtp
})
export default class Emailer extends Component {
  static propTypes = {
    loadTemplates: PropTypes.func.isRequired,
    loadSignatures: PropTypes.func.isRequired,
    user: PropTypes.object,
    fetchEmails: PropTypes.func.isRequired,
    searchEmails: PropTypes.array,
    fileUpload: PropTypes.func.isRequired,
    sendEmail: PropTypes.func.isRequired,
    loadContactPerson: PropTypes.func.isRequired,
    loadOpeningById: PropTypes.func.isRequired,
    emailState: PropTypes.object,
    route: PropTypes.object,
    location: PropTypes.object,
    discardFiles: PropTypes.func.isRequired,
    // userEmails: PropTypes.object,
    router: PropTypes.object,
    emailConfig: PropTypes.object.isRequired,
    loadSmtp: PropTypes.func.isRequired,
    addSelectedCandidates: PropTypes.func.isRequired,
    removedSelectedCandidates: PropTypes.func.isRequired
  };

  static defaultProps = {
    user: {},
    searchEmails: [],
    filesStatus: {},
    emailState: {},
    location: {},
    route: null,
    userEmails: [],
    router: {},
    emailConfig: {}
  }

  constructor(props) {
    super(props);
    const html = '';
    const contentBlock = htmlToDraft(html);
    this.componentMounted = false;
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      let editorState = EditorState.createWithContent(contentState);
      editorState = EditorState.moveFocusToEnd(editorState);
      this.state = {
        selectedEmails: '',
        activeKey: '1',
        editorState,
        usedSmartTags: [],
        isToExpanded: false,
        subject: '',
        isValid: false,
        toEmails: [],
        toCandidateEmails: [],
        toCompanyContactEmails: [],
        files: [],
        signature: {},
        ccEmails: [],
        bccEmails: [],
        hasSubmittedSuccess: false,
        error: {
          subject: {
            isSubjectValid: false,
            touched: false
          },
          message: {
            isMessageValid: false,
            touched: false
          },
          toMails: {
            isToMailValid: false,
            touched: false
          },
          cc: {
            isCcMailValid: false,
            touched: false
          },
          bcc: {
            isBccMailValid: false,
            touched: false
          },
          files: {
            touched: false
          },
          isValid: false
        },
        templates: [],
        signatures: [],
        moreTemplateExists: 0,
        moreSignatureExists: 0,
        signatureCurrentPage: 0,
        templateCurrentPage: 0,
        showModal: false,
        showLoader: false,
        totalFileSize: 0
      };
    }
    this.initialState = lodash.cloneDeep(this.state);
    this.emailData = {};
    if (this.props.location) {
      if (this.props.location.state) {
        this.emailData = this.props.location.state;
        localStorage.setItem('emailData', JSON.stringify(this.emailData));
      } else {
        this.emailData = JSON.parse(localStorage.getItem('emailData'));
      }
    }
  }

  componentWillMount() {
    const { user } = this.props;
    const isTemplatePermitted = NewPermissible.isPermitted({ operation: 'VIEW_TEMPLATE', model: 'Template' });
    const isSignaturesPermitted = NewPermissible.isPermitted({ operation: 'VIEW_SIGNATURE', model: 'Signature' });
    this.props.loadSmtp(user.id);
    this.setState({
      isTemplatePermitted,
      isSignaturesPermitted
    }, () => {
      this.loadTemplates({
        userId: user.id,
        skip: 0,
        isPublic: true,
        limit: Constants.RECORDS_PER_PAGE
      });
    });
    const { emailData } = this;
    if (emailData && emailData.jobId) {
      const { jobId, attachJobDescription, candidates } = emailData;
      if (candidates && candidates.length > 0) {
        this.props.addSelectedCandidates(candidates);
      }
      if (attachJobDescription) {
        this.props.loadOpeningById(jobId).then(selectedOpening => {
          const editorState = selectedOpening ?
            this.createContentTemplateForJobOpening(selectedOpening) :
            EditorState.createEmpty();
          this.setState({
            editorState
          }, () => {
            this.initialState = lodash.cloneDeep(this.state);
          });
        });
      }
      const candidateMails = candidates.map(candidate => {
        if (candidate.email) {
          candidate.email = candidate.email.split(';')[0];
          return candidate;
        }
        return false;
      });
      this.setState({
        toEmails: lodash.uniqBy(candidateMails, 'id'),
        toCandidateEmails: lodash.uniqBy(candidateMails, 'id')
      }, () => {
        this.initialState = lodash.cloneDeep(this.state);
        this.setSignatureToEditor();
      });
    } else if (emailData && emailData.companyId) {
      const { companyId, emailInfo } = emailData;
      if (emailInfo) {
        const { fromAddress, bccList, ccList, subject } = emailInfo;
        this.props.loadContactPerson([companyId]).then(contactPersons => {
          // remove the email which matches fromAddress
          lodash.remove(contactPersons, contact => (
            contact.email === fromAddress.email
          ));
          this.setState({
            toEmails: [fromAddress],
            toCompanyContactEmails: [...fromAddress, ...contactPersons],
            subject,
            bccEmails: bccList.length > 0 ? lodash.map(bccList, 'email') : [],
            ccEmails: ccList.length > 0 ? lodash.map(ccList, 'email') : []
          }, () => {
            this.initialState = lodash.cloneDeep(this.state);
            this.setSignatureToEditor();
          });
          // contactPersonMails = contactPersons.map(contactPerson => contactPerson.email ? contactPerson);
        });
      } else {
        this.props.loadContactPerson([companyId]).then(contactPersons => {
          // remove the email which matches fromAddress
          this.setState({
            toEmails: [...contactPersons],
            toCompanyContactEmails: [...contactPersons],
            subject: emailInfo.subject
          }, () => {
            this.initialState = lodash.cloneDeep(this.state);
            this.setSignatureToEditor();
          });
        });
      }
    } else if (emailData && emailData.jobOpeningId) {
      const { jobOpeningId, emailInfo } = emailData;
      if (emailInfo) {
        const { fromAddress, bccList, ccList, subject } = emailInfo;
        this.props.loadOpeningById(jobOpeningId).then(selectedOpening => {
          // lodash.remove([selectedOpening.contactPerson], contact => (
          //   contact.email === emailInfo.fromAddress.email
          // ));
          this.setState({
            toEmails: [fromAddress],
            toCompanyContactEmails: [...selectedOpening.contactPerson],
            subject,
            bccEmails: bccList.length > 0 ? lodash.map(bccList, 'email') : [],
            ccEmails: ccList.length > 0 ? lodash.map(ccList, 'email') : []
          }, () => {
            this.initialState = lodash.cloneDeep(this.state);
            this.setSignatureToEditor();
          });
        });
      } else {
        this.props.loadOpeningById(jobOpeningId).then(selectedOpening => {
          this.setState({
            toEmails: [selectedOpening.contactPerson],
            toCompanyContactEmails: [selectedOpening.contactPerson]
          }, () => {
            this.initialState = lodash.cloneDeep(this.state);
            this.setSignatureToEditor();
          });
        });
      }
    } else if (emailData && emailData.candidateProfileId) {
      const { emailInfo } = emailData;
      const { bccList, ccList } = emailInfo;
      this.setState({
        toEmails: [{
          email: emailData.candidateEmail,
          id: emailData.candidateProfileId
        }],
        toCompanyContactEmails: [{
          email: emailData.candidateEmail,
          id: emailData.candidateProfileId
        }],
        subject: emailInfo ? emailInfo.subject : '',
        bccEmails: emailInfo && bccList.length > 0 ? lodash.map(bccList, 'email') : [],
        ccEmails: emailInfo && ccList.length > 0 ? lodash.map(ccList, 'email') : []
      }, () => {
        this.initialState = lodash.cloneDeep(this.state);
        this.setSignatureToEditor();
      });
    } else {
      const candidates = (
        emailData &&
        emailData.candidates &&
        emailData.candidates) || [];
      const candidateMails = candidates.map(candidate => {
        if (candidate.email) {
          return candidate;
        }
        return false;
      });
      this.setState({
        toEmails: lodash.uniqBy(candidateMails, 'id'),
        toCandidateEmails: lodash.uniqBy(candidateMails, 'id')
      }, () => {
        this.initialState = lodash.cloneDeep(this.state);
        this.setSignatureToEditor();
      });
    }
  }

  componentDidMount() {
    const editor = document.getElementById('editor');
    editor.addEventListener('click', event => {
      latestCursorLocation = event;
    });
    this.componentMounted = true;
    this.props.router.setRouteLeaveHook(this.props.route, nextLocation => {
      if (nextLocation && nextLocation.pathname !== '/ATSBoard') {
        this.props.removedSelectedCandidates();
      }
      const { subject, message, toMails, cc, bcc } = this.state.error;
      // const htmlText = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
      // const splittedString = htmlText.split(' ');
      if ((subject.touched || message.touched || toMails.touched || cc.touched
        || bcc.touched) && !this.state.hasSubmittedSuccess) {
        return i18n.t('confirmMessage.UNSAVED_CHANGES');
      }
    });
  }

  componentWillUnmount() {
    this.props.discardFiles();
    this.setState({
      selectedEmails: '',
      activeKey: '1',
      editorState: EditorState.createEmpty(),
      usedSmartTags: [],
      isToExpanded: false,
      subject: '',
      isValid: false,
      toEmails: [],
      toCandidateEmails: [],
      toCompanyContactEmails: [],
      files: [],
      signature: {},
      ccEmails: [],
      bccEmails: [],
      error: {
        subject: {
          isSubjectValid: false,
          touched: false
        },
        message: {
          isMessageValid: false,
          touched: false
        },
        toMails: {
          isToMailValid: false,
          touched: false
        },
        cc: {
          isCcMailValid: false,
          touched: false
        },
        bcc: {
          isBccMailValid: false,
          touched: false
        },
        isValid: false,
      }
    });
  }

  onEditorStateChange = editorState => {
    const initialHtmlString = draftToHtml(convertToRaw(this.initialState.editorState.getCurrentContent()));
    const currentHtmlString = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    this.setState({
      editorState,
      error: {
        ...this.state.error,
        message: {
          touched: currentHtmlString !== initialHtmlString
        }
      }
    }, () => {
      this.validation();
    });
  };

  onSubmit = () => {
    const { toEmails, subject, editorState, signature, usedSmartTags, ccEmails, bccEmails } = this.state;

    if (toEmails.length === 0) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.PLEASE_ENTER_ATLEAST_ONE_TO_EMAIL_ADDRESS'));
      return;
    }

    if (!subject) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.EMAIL_SUBJECT_IS_REQUIRED'));
      return;
    }

    if (ccEmails && ccEmails.length > 0) {
      const erroredEmail = ccEmails.filter(mail => !isEmail(mail));
      if (erroredEmail.length > 0) {
        toastrErrorHandling({}, '', i18n.t('errorMessage.PLEASE_CHECK_CC_EMAIL'));
        return;
      }
    }

    if (bccEmails && bccEmails.length > 0) {
      const erroredEmail = bccEmails.filter(mail => !isEmail(mail));
      if (erroredEmail.length > 0) {
        toastrErrorHandling({}, '', i18n.t('errorMessage.PLEASE_CHECK_BCC_EMAIL'));
        return;
      }
    }

    if (!this.isMessageValid()) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.EMAIL_BODY_IS_REQUIRED'));
      return;
    }

    const { user } = this.props;
    const htmlText = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const splittedString = htmlText.split(' ');
    const { personalizations } = Constants;
    splittedString.map((str, index) => {
      if (str.charAt(0) === '#' && str.charAt(str.length - 1) === '#') {
        const smartTag = personalizations.find(personalization => personalization.value === str);
        splittedString[index] = `<span class="tag" data-id="${smartTag.id}">${str}</span>`;
      }
      return true;
    });
    let message = splittedString.join(' ');
    const htmlArr = message.match(/<a\b[^<]*class=['|"|\\]?['|"|\\]wysiwyg-mention?\b[^<]*?>(.*?)<\/a>/g);
    if (htmlArr && Array.isArray(htmlArr)) {
      htmlArr.map(content => {
        // eslint-disable-next-line no-useless-escape
        const tag = content.match(/\#[a-zA-Z]*/g);
        if (tag) {
          message = message.replace(content, `<a class="wysiwyg-mention" data-mention="">${tag[0]}</a>`);
        }
        return '';
      });
    }
    message = this.getFormattedImage(message);
    message = this.convertTag(message);
    if (signature && signature.content) {
      signature.content = this.convertTag(signature.content);
    }
    const { formFiles, canSend } = this.getFilesToMail();
    const fileArr = formFiles.map(file => {
      const newFile = {};
      newFile.documentId = file.id;
      newFile.fileName = file.originalFilename;
      return newFile;
    });
    toEmails.map((email, index) => {
      toEmails[index].receiverEmail = email.email;
      toEmails[index].id = email.id ? email.id : email.resumeId;
      return '';
    });
    const deviceDetail = JSON.parse(localStorage.getItem('deviceDetails'));
    const { emailData } = this;
    const mail = {
      candidateList: toEmails,
      contactList: [],
      deviceDetails: deviceDetail,
      template: {
        body: message,
        subject,
        createdBy: user.id
      },
      signature,
      mailRequest: {
        cc: ccEmails,
        bcc: bccEmails,
        fromAddress: this.props.emailConfig.auth_user,
        jobId: emailData && (emailData.jobId || emailData.jobOpeningId),
        tags: usedSmartTags,
        userId: this.props.user.id,
        subject,
        attachments: fileArr,
        mailType: this.props.emailConfig.SMTP_host !== null ? 'SMTP' : 'OUTLOOK',
        companyId: emailData && (emailData.companyId || ''),
        sourceId: emailData && emailData.emailInfo && (emailData.emailInfo.messageId || ''),
        mailAction: emailData ? this.setMailAction(emailData.from) : ''
      }
    };
    if (canSend) {
      this.props.sendEmail(mail).then(() => {
        toastr.success(i18n.t('successMessage.EMAIL_SENT_SUCCESSFULLY'));
        this.props.removedSelectedCandidates();
        this.setState({
          selectedEmails: '',
          activeKey: '1',
          editorState: EditorState.createEmpty(),
          usedSmartTags: [],
          isToExpanded: false,
          isMailOpen: false,
          subject: '',
          isValid: false,
          toEmails: [],
          toCandidateEmails: [],
          toCompanyContactEmails: [],
          files: [],
          signature: {},
          ccEmails: [],
          bccEmails: [],
          error: {
            subject: {
              isSubjectValid: false,
              touched: false
            },
            message: {
              isMessageValid: false,
              touched: false
            },
            toMails: {
              isToMailValid: false,
              touched: false
            },
            cc: {
              isCcMailValid: false,
              touched: false
            },
            bcc: {
              isBccMailValid: false,
              touched: false
            },
            files: {
              touched: false
            },
            isValid: false,
          },
          showModal: false,
          hasSubmittedSuccess: true
        }, () => {
          const profileFilters = JSON.parse(sessionStorage.getItem('profilefilters'));
          if (profileFilters) {
            delete profileFilters.selectedProfiles;
            sessionStorage.setItem('profilefilters', JSON.stringify(profileFilters));
          }
          if (emailData && emailData.previousPath === '/smtpConfig') {
            this.props.router.go(-2);
          } else {
            this.props.router.goBack();
          }
        });
      }, () => {
        toastrErrorHandling({}, '', i18n.t('errorMessage.EMAIL_FAILED_TO_SEND!!'));
      });
    }
  }

  onCcChange = ccEmails => {
    this.setState({
      ccEmails,
      error: {
        ...this.state.error,
        cc: {
          touched: !lodash.isEqual(this.initialState.ccEmails, ccEmails)
        }
      }
    }, () => this.validation());
  }

  onBccChange = bccEmails => {
    this.setState({
      bccEmails,
      error: {
        ...this.state.error,
        bcc: {
          touched: !lodash.isEqual(this.initialState.bccEmails, bccEmails)
        }
      }
    }, () => this.validation());
  }

  onSubjectChange = subject => {
    const { error } = this.state;
    this.setState({
      subject: trimTrailingSpace(subject),
      error: {
        ...error,
        subject: {
          touched: !lodash.isEqual(this.initialState.subject, subject)
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

  setSignatureToEditor = () => {
    const { user } = this.props;
    const { isSignaturesPermitted } = this.state;
    if (isSignaturesPermitted) {
      this.props.loadSignatures({
        userId: user.id,
        skip: 0,
        isDeleted: false,
        limit: Constants.RECORDS_PER_PAGE
      }).then(data => {
        let signature = null;
        if (data && data.signatures.length > 0) {
          signature = data.signatures[0];
        }
        if (signature) {
          const html = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
          const content = `${html} ${new Array(10).join('<p> </p>')} ${signature.content}`;
          const contentBlock = htmlToDraft(content);
          if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            this.setState({
              editorState: this.moveFocusToStart(editorState),
              signature,
              signatures: data.signatures,
              moreSignatureExists: data.signatures.length > 0,
              signatureCurrentPage: this.state.signatureCurrentPage + 1
            }, () => {
              this.initialState = lodash.cloneDeep(this.state);
            });
          }
        }
      });
    }
  }

  setMailAction = fromPath => {
    const { emailData } = this;
    const { jobOpeningId, companyId, candidateProfileId, emailInfo } = emailData;
    const emailAction = {
      candidateProfile: candidateProfileId && emailInfo ? 'REPLY_CANDIDATE' : 'COMPOSE_CANDIDATE',
      jobOpening: jobOpeningId && emailInfo ? 'REPLY_JOB' : 'COMPOSE_JOB',
      ATS: 'COMPOSE_CANDIDATE',
      profileSearch: 'COMPOSE_CANDIDATE',
      company: companyId && emailInfo ? 'REPLY_COMPANY' : 'COMPOSE_COMPANY'
    };
    return emailAction[fromPath];
  };

  getFilesToMail = () => {
    const { emailState } = this.props;
    const files = emailState.files;
    const stateFiles = this.state.files;
    const formFiles = [];
    let canSend = true;
    if (files) {
      Object.entries(files).forEach(
        ([key]) => {
          stateFiles.map(file => {
            if (file.id === key) {
              if (files[key].uploadResponse) {
                formFiles.push(files[key].uploadResponse);
              } else if (files[key].error) {
                toastrErrorHandling({}, '', `${files[key].name ? files[key].name : 'Some file'}
                 is not uploaded. are you sure to carry on`);
                canSend = false;
              } else if (!files[key].uploading) {
                toastr.warning(`${files[key].name ? files[key].name : 'Some file'} is uploading`);
                canSend = false;
              }
            }
            return canSend;
          });
        });
    }
    return { canSend, formFiles };
  }

  getFileSize = () => {
    const { files } = this.state;
    let size = 0;
    if (files) {
      files.map(file => {
        size += file.size;
        return '';
      });
    }
    return size;
  }

  getFormattedFileSize = bytes => {
    if (bytes < 1024) return `${bytes} Bytes`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(3)} KB`;
    else if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(3)} MB`;
    return `${(bytes / 1073741824).toFixed(3)} GB`;
  }

  convertTag = content => {
    content = content.replace(/<p/g, '<div');
    content = content.replace(/<\/p/g, '</div');
    return content;
  }

  openPreview = () => {
    const { toEmails, subject, ccEmails, bccEmails } = this.state;
    // const editorText = convertToRaw(editorState.getCurrentContent());

    if (toEmails.length === 0) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.PLEASE_ENTER_ATLEAST_ONE_TO_EMAIL_ADDRESS'));
      return;
    }

    if (!subject) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.EMAIL_SUBJECT_IS_REQUIRED'));
      return;
    }

    if (ccEmails && ccEmails.length > 0) {
      const erroredEmail = ccEmails.filter(mail => !isEmail(mail));
      if (erroredEmail.length > 0) {
        toastrErrorHandling({}, '', i18n.t('errorMessage.PLEASE_CHECK_CC_EMAIL'));
        return;
      }
    }

    if (bccEmails && bccEmails.length > 0) {
      const erroredEmail = bccEmails.filter(mail => !isEmail(mail));
      if (erroredEmail.length > 0) {
        toastrErrorHandling({}, '', i18n.t('errorMessage.PLEASE_CHECK_BCC_EMAIL'));
        return;
      }
    }

    if (!this.isMessageValid()) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.EMAIL_BODY_IS_REQUIRED'));
      return;
    }

    this.setState({ showModal: true });
  }

  hideModal = () => {
    this.setState({ showModal: false });
  }

  loadSignatures(filter) {
    const { signatures, signatureCurrentPage, isSignaturesPermitted } = this.state;
    if (isSignaturesPermitted) {
      this.props.loadSignatures(filter).then(data => {
        const moreSignatureExists = data.signatures.length > 0;
        this.setState({
          signatures: [...signatures, ...data.signatures],
          signatureCurrentPage: signatureCurrentPage + 1,
          moreSignatureExists
        });
      });
    }
  }

  loadTemplates(filter) {
    const { templates, templateCurrentPage, isTemplatePermitted } = this.state;
    if (isTemplatePermitted) {
      this.props.loadTemplates(filter).then(data => {
        const moreTemplateExists = data.templates.length > 0;
        this.setState({
          templates: [...templates, ...data.templates],
          templateCurrentPage: templateCurrentPage + 1,
          moreTemplateExists
        });
      });
    }
  }

  iterateAndAttachValue = (key, value, seperator) => {
    let list = '';
    if (value) {
      const length = Object.keys(value).length;
      list = `<span><li><strong>${key}</strong> : <span>${typeof (value) === 'string' ?
        value : Object.keys(value).map((item, index) => `${value[item].name ?
          value[item].name : value[item].toString()} ${index + 1 !== length ?
          seperator : ''} `).join('')}</span></li></span>`;
    }
    return list;
  }

  createContentTemplateForJobOpening = selectedOpening => {
    const { startDate, endDate } = selectedOpening;
    if (startDate) {
      selectedOpening.startDate = Moment(startDate).format('DD-MM-YYYY');
    }
    if (endDate) {
      selectedOpening.endDate = Moment(endDate).format('DD-MM-YYYY');
    }
    let jobTemplate = '<p></p><ul>';
    const label = {
      jobTitle: 'Job Title',
      description: 'Description',
      priority: 'Priority',
      type: 'Job Type',
      startDate: 'Start Date',
      endDate: 'End Date',
      status: 'Status',
      openinglocations: 'Location',
      filters: {
        skills: 'Skills',
        positions: 'Positions',
        languages: 'Languages',
        experience: 'Experience',
      },
      jobCategories: 'Job Categories'
    };
    Object.keys(selectedOpening).forEach(key => {
      if (key !== 'filters' && key !== 'jobCategories' && key !== 'openinglocations') {
        // if (key === 'description') {
        //   // selectedOpening[key] = selectedOpening[key].replace(/<p[^>]*>/g, '').replace(/<\/p>/g, ' ');
        //   // EditorState.createWithContent(stateFromHTML(selectedOpening[key]));
        // }
        jobTemplate += label[key] ? this.iterateAndAttachValue(label[key], selectedOpening[key], ',') : '';
      } else {
        Object.keys(selectedOpening[key]).forEach(secKey => {
          if (!Array.isArray(selectedOpening[key])) {
            jobTemplate += label[key] && label[key][secKey] ? this.iterateAndAttachValue(label[key][secKey],
              selectedOpening[key][secKey], secKey !== 'experience' ? ',' : 'to') : '';
          }
        });
      }
    });
    if (selectedOpening.openinglocations) {
      jobTemplate += label.openinglocations ? this.iterateAndAttachValue(label.openinglocations,
        selectedOpening.openinglocations, ',') : '';
    }
    if (selectedOpening.jobCategories) {
      jobTemplate += label.jobCategories ? this.iterateAndAttachValue(label.jobCategories,
        selectedOpening.jobCategories, ',') : '';
    }
    jobTemplate += '</li>';
    jobTemplate += '</ul>';
    const contentBlock = htmlToDraft(jobTemplate);
    return EditorState.createWithContent(ContentState.createFromBlockArray(contentBlock.contentBlocks));
  }


  changeSignature = (event, signature) => {
    if (event) {
      event.preventDefault();
    }
    const html = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
    const content = `${html} ${signature.content}`;
    const contentBlock = htmlToDraft(content);
    if (contentBlock) {
      const { error } = this.state;
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.setState({
        editorState,
        signature,
        error: {
          ...error,
          message: {
            touched: !lodash.isEqual(this.initialState.editorState.getCurrentContent(), editorState.getCurrentContent())
          }
        }
      }, () => this.validation());
    }
  }

  addPersonalizations = (event, personalization) => {
    const raw = convertToRaw(this.state.editorState.getCurrentContent());
    const blocks = raw.blocks;
    let tagIndex = 0;
    if (latestCursorLocation &&
      latestCursorLocation.target &&
      latestCursorLocation.target.dataset &&
      latestCursorLocation.target.dataset.offsetKey) {
      tagIndex = blocks.findIndex(block => `${block.key}-0-0` === latestCursorLocation.target.dataset.offsetKey);
    }
    if (raw.blocks[tagIndex]) {
      raw.blocks[tagIndex].text = `${raw.blocks[tagIndex].text}${personalization.tagValue}`;
    }
    const html = draftToHtml(raw);
    const finalHtml = this.replaceString(html, personalization);
    const contentBlock = htmlToDraft(finalHtml);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const usedSmartTags = this.state.usedSmartTags;
      usedSmartTags.push(personalization);
      this.setState({
        editorState: this.moveFocusToStart(EditorState.createWithContent(contentState), tagIndex),
        usedSmartTags
      }, () => this.validation());
    }
  }

  replaceString = (html, personalization) => {
    const replacedString = html.replace(personalization.tagValue,
      `<a href="firstname" class="wysiwyg-mention"
      data-mention data-value="${personalization.value}">#${personalization.value}</a>`);
    return replacedString;
  }

  handleEmailChange = toEmails => {
    this.setState({
      toEmails,
      isToExpanded: true,
      isMailOpen: false,
      error: {
        ...this.state.error,
        toMails: {
          touched: !lodash.isEqual(this.initialState.toEmails, toEmails)
        }
      }
    }, () => this.validation());
  }

  validation = () => {
    const {
      toEmails,
      subject,
      error,
      ccEmails,
      bccEmails
    } = this.state;
    const isMessageValid = this.isMessageValid();
    let isToMailValid = false;
    let isSubjectValid = false;
    let isValid = false;
    let isCcMailValid = true;
    let isBccMailValid = true;
    if (toEmails && toEmails.length > 0) {
      isToMailValid = true;
    }
    if (subject && subject.length > 0) {
      isSubjectValid = true;
    }
    if (ccEmails && ccEmails.length > 0) {
      ccEmails.map(mail => {
        const valid = isEmail(mail);
        if (!valid) {
          isCcMailValid = valid;
        }
        return '';
      });
    }

    if (bccEmails && bccEmails.length > 0) {
      bccEmails.map(mail => {
        const valid = isEmail(mail);
        if (!valid) {
          isBccMailValid = valid;
        }
        return '';
      });
    }


    if (isToMailValid && isMessageValid && isSubjectValid) {
      isValid = true;
    }

    error.message.isMessageValid = isMessageValid;
    error.subject.isSubjectValid = isSubjectValid;
    error.toMails.isToMailValid = isToMailValid;
    error.isValid = isValid;
    error.cc.isCcMailValid = isCcMailValid;
    error.bcc.isBccMailValid = isBccMailValid;
    this.setState({
      error: { ...error, error }
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

  createUUID = () => {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = ((dt + Math.random()) * 16) % 16 || 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : ((r && 0x3) || 0x8)).toString(16);
    });
    return uuid;
  }

  handleFileSelect = event => {
    const newFiles = event.target.files;
    const { files, totalFileSize } = this.state;
    this.setState({
      showLoader: true
    });
    // let index = files.length;
    let type = '';
    let localTotalFileSize = totalFileSize;
    async.each(newFiles, (file, fileCB) => {
      const formData = new FormData();
      // if (file.size < 4000000) {
      localTotalFileSize += file.size;
      if (localTotalFileSize < 3500000) {
        formData.append('uploaded_file', file);
        // file.id = index;
        file.id = this.createUUID();
        files.push(file);
        this.props.fileUpload(formData, file);
        const { error } = this.state;
        this.setState({
          files,
          showLoader: false,
          error: {
            ...error,
            files: {
              touched: !lodash.isEqual(this.initialState.files, files)
            }
          },
          totalFileSize: localTotalFileSize
        });
        event.target.value = null;
        fileCB(null);
      } else {
        toastrErrorHandling({}, '', 'File(s) exceeds maximum size (3.5 MB)');
        const { error } = this.state;
        this.setState({
          files,
          showLoader: false,
          error: {
            ...error,
            files: {
              touched: !lodash.isEqual(this.initialState.files, files)
            }
          }
        });
        type = 'exceeds';
        event.target.value = null;
        fileCB(new Error());
        // return fileCB(`${file.name} exceeds maximum size (4 MB)`, 'exceeds');
      }
      // index += 1;
      // fileCB(null);
    }, err => {
      if (type === 'exceeds') {
        // toastrErrorHandling({}, '', err);
        return;
      } else if (err) {
        toastrErrorHandling({}, '', i18n.t('errorMessage.ERROR_WHILE_UPLOADING_ATTACHMENT'));
        return;
      }
      toastr.success(i18n.t('successMessage.ATTACHMENTS_UPLOADED_SUCCESSFULLY'));
      const { error } = this.state;
      this.setState({
        files,
        showLoader: false,
        error: {
          ...error,
          files: {
            touched: !lodash.isEqual(this.initialState.files, files)
          }
        }
      });
      event.target.value = null;
    });
  }

  signatureScroll = values => {
    if (this.componentMounted) {
      const { scrollTop, scrollHeight, clientHeight } = values;
      const pad = 30;
      const t = ((scrollTop + pad) / (scrollHeight - clientHeight));
      if (t > 1) {
        const { user } = this.props;
        const { signatureCurrentPage,
          moreSignatureExists } = this.state;
        if (moreSignatureExists) {
          this.loadSignatures({
            userId: user.id,
            skip: signatureCurrentPage * Constants.RECORDS_PER_PAGE,
            isDeleted: false,
            limit: Constants.RECORDS_PER_PAGE
          });
        }
      }
    }
  }

  templateScroll = values => {
    if (this.componentMounted) {
      const { scrollTop, scrollHeight, clientHeight } = values;
      const pad = 30;
      const t = ((scrollTop + pad) / (scrollHeight - clientHeight));
      if (t > 1) {
        const { user } = this.props;
        const { templateCurrentPage,
          moreTemplateExists } = this.state;
        if (moreTemplateExists) {
          this.loadTemplates({
            userId: user.id,
            skip: templateCurrentPage * Constants.RECORDS_PER_PAGE,
            isPublic: true,
            limit: Constants.RECORDS_PER_PAGE
          });
        }
      }
    }
  }

  handleSearchChange = value => {
    if (value && value !== '.') {
      if (value === 'initial') {
        this.props.fetchEmails(value.toLowerCase());
      } else {
        this.setState({
          isMailOpen: true
        }, () => {
          this.props.fetchEmails(value.toLowerCase());
        });
      }
    } else {
      this.setState({
        isMailOpen: false
      });
    }
  }

  removeFile = file => {
    const { files } = this.state;
    // files.pop(file);
    lodash.remove(files, fileObj => fileObj.id === file.id);
    this.setState({
      files
    });
  }

  deleteFile = file => {
    const { files, error, totalFileSize } = this.state;
    // files.pop(file);
    lodash.remove(files, fileObj => fileObj.id === file.id);
    this.setState({
      files,
      error: {
        ...error,
        files: {
          touched: !lodash.isEqual(this.initialState.files, files)
        }
      },
      totalFileSize: totalFileSize - file.size
    });
  }

  changeTemplate = template => {
    const content = template.body;
    const contentBlock = htmlToDraft(content);
    if (contentBlock) {
      const { error } = this.state;
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.setState({
        editorState,
        template,
        subject: template.subject,
        error: {
          ...error,
          subject: { touched: this.initialState.subject !== template.subject },
          message: { touched: this.initialState.editorState !== editorState }
        }
      }, () => {
        this.validation();
        this.changeSignature(null, this.state.signature);
      });
    }
  }

  handleClose = () => {
    this.setState({ showModal: false });
  }

  expandPanel = activePanelKey => {
    this.setState({
      activePanel: this.state.activePanel === activePanelKey ? '' : activePanelKey
    });
  }

  moveSelectionToStart = (editorState, index) => {
    const content = editorState.getCurrentContent();
    const blockArray = convertToRaw(content);
    let firstBlock = {};
    if (index) {
      firstBlock = content.getBlockForKey(blockArray.blocks[index].key);
    } else {
      firstBlock = content.getFirstBlock();
    }
    if (firstBlock) {
      const firstKey = firstBlock.getKey();
      const length = firstBlock.getLength();
      latestCursorLocation && (latestCursorLocation.target.dataset.offsetKey = `${firstBlock.getKey()}-0-0`);
      return EditorState.acceptSelection(
        editorState,
        new SelectionState({
          anchorKey: firstKey,
          anchorOffset: length,
          focusKey: firstKey,
          focusOffset: length,
          isBackward: false,
        })
      );
    }
  }

  moveFocusToStart(editorState, index) {
    const afterSelectionMove = this.moveSelectionToStart(editorState, index);
    return EditorState.forceSelection(
      afterSelectionMove,
      afterSelectionMove.getSelection()
    );
  }

  emailPreview = () => {
    const { toEmails, subject, editorState, ccEmails, bccEmails, files } = this.state;
    const toList = toEmails.map(to => to.email);
    let bodyContent = this.getFormattedImage(draftToHtml(convertToRaw(editorState.getCurrentContent())));
    bodyContent = this.convertTag(bodyContent);
    const content = Parser(bodyContent);
    // const { emailState } = this.props;
    // const filesState = emailState.files;
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td colSpan="2" className={style.txt_top}>
                <span className={style.previewLabel}> From: </span>
              </td>
              <td>
                <span className={style.m_l_10}>
                  {this.props.emailConfig.auth_user}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan="2" className={style.txt_top}>
                <span className={style.previewLabel}> To: </span>
              </td>
              <td>
                <span className={style.m_l_10}>
                  {` ${toList.join(' , ')}`}
                </span>
              </td>
            </tr>
            {
              ccEmails && ccEmails.length > 0 &&
              <tr>
                <td colSpan="2" className={style.txt_top}>
                  <span className={style.previewLabel}> Cc: </span>
                </td>
                <td>
                  <span className={style.m_l_10}>
                    {` ${ccEmails.join(' , ')}`}
                  </span>
                </td>
              </tr>
            }
            {
              bccEmails && bccEmails.length > 0 &&
              <tr>
                <td colSpan="2" className={style.txt_top}>
                  <span className={style.previewLabel}> Bcc: </span>
                </td>
                <td>
                  <span className={style.m_l_10}>
                    {` ${bccEmails.join(' , ')}`}
                  </span>
                </td>
              </tr>
            }
            <tr>
              <td colSpan="2" className={style.txt_top}>
                <span className={style.previewLabel}> Subject: </span>
              </td>
              <td>
                <span className={style.m_l_10}>
                  {subject}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className={style.emailBodyPreview}>
          <div className={style.m_t_10}>
            {content}
          </div>
        </div>
        <div className={`m-t-10 ${style.attachments_preview}`}>
          {files && files.length > 0 && <label htmlFor="Attachments"> {i18n.t('ATTACHMENTS')} </label>}
          {files && files.map(file => (
            <div key={Math.random().toString(36).substring(7)} className={style.attachedFiles}>
              <div className={style.fileName} title={file.name}>{file.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  discardChanges = () => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.initialState.subject = '';
        this.setState(lodash.cloneDeep(this.initialState));
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    };
    toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
  }

  renderToEmailMultiselect = toEmails => {
    const { emailData } = this;
    const { toCompanyContactEmails, toCandidateEmails } = this.state;
    if (emailData) {
      const { jobId, companyId, candidateProfileId, jobOpeningId } = emailData;
      if (companyId || candidateProfileId || jobOpeningId) {
        return (
          <Multiselect
            data={toCompanyContactEmails}
            onChange={this.handleEmailChange}
            value={toEmails}
            textField="email"
          />
        );
      } else if (jobId) {
        return (
          <Multiselect
            data={toCandidateEmails}
            onChange={this.handleEmailChange}
            value={toEmails}
            textField="email"
          />
        );
      }
    }
    return (
      <Multiselect
        data={this.props.searchEmails}
        onChange={this.handleEmailChange}
        value={toEmails}
        onSearch={this.handleSearchChange}
        textField="email"
      />
    );
  }

  render() {
    const { emailData } = this;
    let companyId = null;
    if (emailData && emailData.companyId) {
      companyId = emailData.companyId;
    }
    const hideEmailOptions = !!(emailData && (emailData.companyId || emailData.jobOpeningId));
    const { personalizations } = Constants;
    const {
      editorState,
      // isToExpanded,
      subject,
      toEmails,
      files,
      ccEmails,
      bccEmails,
      error,
      showModal,
      showLoader,
      isTemplatePermitted,
      isSignaturesPermitted,
      activePanel
    } = this.state;
    const { message, toMails, cc, bcc } = this.state.error;
    const { user, emailState, emailConfig } = this.props;
    const { templates, signatures } = this.state;
    const filesState = emailState.files;
    return (
      <div>
        <Loader
          loading={showLoader}
          styles={{ position: 'absolute', top: '50%' }}
        />
        <Row className={`${style.composeEmail} m-0`} style={{ backgroundColor: 'white' }}>
          <Col md={10} lg={10} mdOffset={1} lgOffset={1} style={{ backgroundColor: 'white' }}>
            <div style={{ width: '75 %' }}>
              <div className={style.header}>
                <h2>{i18n.t('COMPOSE_AN_EMAIL')}</h2>
              </div>
              <Input
                name="from"
                type="text"
                label={i18n.t('FROM_UPPERCASE')}
                disabled
                value={user.isMailConfigured ? emailConfig.auth_user : user.email}
                style={{ width: '100%' }}
              />
              <div className="m-t-10">
                <label htmlFor="To">
                  {i18n.t('TO_UPPERCASE')}  <span className="required_color">*</span>
                </label>
                {
                  // (
                  //   !isToExpanded &&
                  //   toEmails &&
                  //   toEmails.length > 4
                  // ) ?
                  //   <div className={`${style.email} search_emails`}>
                  //     <div className={style.emails}>
                  //       {this.renderToEmailMultiselect(toEmails)}
                  //     </div>
                  //     <div
                  //       className={style.noofemails}
                  //       onClick={() => this.setState({ isToExpanded: true })}
                  //       role="presentation"
                  //     >
                  //       +{toEmails.length - 4} {`other${(toEmails.length - 4 > 1) ? '(s)' : ''}`}
                  //     </div>
                  //   </div> :
                  <div className="search_emails">
                    {this.renderToEmailMultiselect(toEmails)}
                  </div>
                }
                {!error.toMails.isToMailValid && error.toMails.touched &&
                  <div className="text-danger">{i18n.t('validationMessage.ATLEAST_ONE_RECIPIENT_MUST_MENTIONED')}</div>
                }
              </div>

              <div className={style.m_t_b_10} style={{ width: '100%' }}>
                <label htmlFor={'cc'}>
                  <div>Cc</div>
                </label>
                <Chips
                  value={ccEmails}
                  onChange={this.onCcChange}
                  theme={theme}
                  renderChip={value => <CustomChip>{value}</CustomChip>}
                  // creat chip on enter/tab/space
                  createChipKeys={[9, 13, 32]}
                />
                {!error.cc.isCcMailValid && error.cc.touched &&
                  <div className="text-danger">{i18n.t('validationMessage.INVALID_EMAIL')}</div>
                }
              </div>

              <div className={style.m_t_10_b_30} style={{ width: '100%' }}>
                <label htmlFor={'Bcc'}>
                  <div>Bcc</div>
                </label>
                <Chips
                  value={bccEmails}
                  onChange={this.onBccChange}
                  theme={theme}
                  renderChip={value => <CustomChip>{value}</CustomChip>}
                  // creat chip on enter/tab/space
                  createChipKeys={[9, 13, 32]}
                />
                {!error.bcc.isBccMailValid && error.bcc.touched && <div className="text-danger">
                  {i18n.t('validationMessage.INVALID_EMAIL')}
                </div>}
              </div>


              <div className={style.composeContainer}>
                <Row>
                  <Col
                    md={8}
                    lg={8}
                    sm={8}
                  >
                    <Input
                      name="subject"
                      type="text"
                      label="SUBJECT"
                      onChange={e => { this.onSubjectChange(e.target.value); }}
                      value={subject}
                    />
                    {!error.subject.isSubjectValid && error.subject.touched &&
                      <div className="text-danger">{i18n.t('validationMessage.SUBJECT_CANNOT_BLANK')}</div>
                    }
                    <div id="editor">
                      <Editor
                        editorState={editorState}
                        wrapperClassName={style.editor_container}
                        editorClassName={style.editor}
                        onEditorStateChange={this.onEditorStateChange}
                        toolbar={{
                          options: ['inline', 'fontSize', 'fontFamily', 'list', 'textAlign'],
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
                          suggestions: companyId ? [] : personalizations
                        }}
                        hashtag={{}}
                      />
                      {!error.message.isMessageValid && error.message.touched &&
                        <div className="text-danger">Message cannot be left blank</div>
                      }
                    </div>
                  </Col>
                  <Col md={4} lg={4} sm={4}>
                    <PanelGroup
                      className="emailEditor"
                      accordion
                      id="accordion-controlled-example"
                      activeKey={activePanel}
                      onSelect={this.expandPanel}
                    >
                      {isTemplatePermitted &&
                        <Panel eventKey="1">
                          <Panel.Heading onClick={() => this.expandPanel('1')} style={{ cursor: 'pointer' }}>
                            <Panel.Title toggle>
                              Email Templates
                            </Panel.Title>
                          </Panel.Heading>
                          <Panel.Body collapsible >
                            <Scrollbars
                              universal
                              autoHide
                              autoHeight
                              onScrollFrame={this.templateScroll}
                              autoHeightMin={'20px'}
                              autoHeightMax={'230px'}
                              renderView={props => <div {...props} className="customScroll emailOptions" />}
                            >
                              {templates ? templates.map(template => (
                                <button
                                  key={template.id}
                                  onClick={() => this.changeTemplate(template)}
                                  className={`${style.addBtn} btn btn-border m-t-10`}
                                  title={template.name}
                                >
                                  <i className="fa fa-plus p-r-10" />
                                  {template.name}
                                </button>
                              ))
                                : <div className={style.error_infos}>
                                  {i18n.t('validationMessage.NO_TEMPLATES_AVAILABLE')}
                                </div>}
                            </Scrollbars>
                          </Panel.Body>
                        </Panel>}
                      {isSignaturesPermitted &&
                        <Panel eventKey="2">
                          <Panel.Heading onClick={() => this.expandPanel('2')} style={{ cursor: 'pointer' }}>
                            <Panel.Title toggle>
                              Signature
                            </Panel.Title>
                          </Panel.Heading>
                          <Panel.Body collapsible>
                            <Scrollbars
                              universal
                              autoHide
                              autoHeight
                              onScrollFrame={this.signatureScroll}
                              autoHeightMin={'20px'}
                              autoHeightMax={'230px'}
                              renderView={props => <div {...props} className="customScroll emailOptions" />}
                            >
                              {signatures ?
                                signatures.map(signature => (
                                  <button
                                    key={signature.id}
                                    onClick={event => this.changeSignature(event, signature)}
                                    className={`${style.addBtn} btn btn-border m-t-10`}
                                    title={signature.name}
                                  >
                                    <i className="fa fa-plus p-r-10" />
                                    {signature.name}
                                  </button>
                                )) :
                                <div className={style.error_infos}>
                                  {i18n.t('validationMessage.NO_SIGNATURES_AVAILABLE')}
                                </div>
                              }
                            </Scrollbars>
                          </Panel.Body>
                        </Panel>}
                      {!hideEmailOptions &&
                        <Panel eventKey="3">
                          <Panel.Heading onClick={() => this.expandPanel('3')} style={{ cursor: 'pointer' }}>
                            <Panel.Title toggle>
                              Personalization
                            </Panel.Title>
                          </Panel.Heading>
                          <Panel.Body collapsible>
                            <div className={style.panelBody}>
                              {personalizations ?
                                personalizations.map(personalization => (
                                  <button
                                    onClick={event => this.addPersonalizations(event, personalization)}
                                    className={`${style.addBtn} btn btn-border m-t-10`}
                                    title={personalization.text}
                                  >
                                    <i className="fa fa-plus p-r-10" />
                                    {personalization.text}
                                  </button>
                                )) :
                                <div className={style.error_infos}>
                                  {i18n.t('validationMessage.NO_PERSONALIZATION_AVAILABLE')}
                                </div>
                              }
                            </div>
                          </Panel.Body>
                        </Panel>
                      }
                    </PanelGroup>
                  </Col>
                </Row>
              </div>
              {
                <div className={`m-t-10 ${style.attachments}`}>
                  <label htmlFor="Attachments">
                    <Trans>ATTACHMENTS</Trans>
                  </label>
                  <div>
                    <div className={style.fileInputWrapper}>
                      <input
                        multiple
                        accept={Constants.FILE_TYPES}
                        type="file"
                        title={files.length === 0 ? i18n.t('tooltipMessage.NO_FILES_CHOOSEN') : ' '}
                        onChange={e => { this.handleFileSelect(e); }}
                      />
                      <Button
                        className="button-secondary btn btn-border m-t-10"
                      >
                        {i18n.t('ATTACH_FILES')}
                      </Button>
                    </div>
                  </div>
                  {files && files.map(file => (
                    <div className={style.attachedFiles}>
                      <div className={style.fileName}>{file.name}</div>
                      <div className={style.fileSize}>{this.getFormattedFileSize(file.size)}</div>
                      {filesState[file.id].uploading ?
                        <i
                          className={`${style.remove} fa fa-close p-r-10`}
                          onClick={() => this.removeFile(file)}
                          role="presentation"
                        /> :
                        <i
                          className={`${style.delete} fa fa-trash-o p-r-10`}
                          onClick={() => this.deleteFile(file)}
                          role="presentation"
                        />
                      }
                    </div>
                  ))}
                </div>
              }
              <div className={style.sub_btn_sec}>
                {
                  hideEmailOptions ?
                    <button
                      onClick={this.openPreview}
                      className={`${style.submitButton} button-primary btn btn-border m-t-10`}
                    >
                      {i18n.t('PREVIEW_AND_SUBMIT')}
                    </button>
                    :
                    <button
                      onClick={this.onSubmit}
                      className={`${style.submitButton} button-primary btn btn-border m-t-10`}
                    >
                      {i18n.t('SEND_EMAIL')} {toEmails && toEmails.length > 0 &&
                        `${i18n.t('TO')} ${toEmails.length} ${toEmails.length > 1 ?
                          i18n.t('CONTACTS') : i18n.t('CONTACT')}`}
                    </button>
                }
              </div>
            </div>
            <div className={style.sub_btn_sec}>
              {
                <button
                  onClick={this.discardChanges}
                  className={`${style.submitButton} button-secondary btn btn-border m-t-10 m-l-15`}
                  disabled={!(
                    this.state.error.subject.touched ||
                    message.touched ||
                    toMails.touched ||
                    cc.touched ||
                    bcc.touched ||
                    this.state.error.files.touched
                  )}
                >
                  {i18n.t('RESET')}
                </button>
              }
            </div>
            {
              showModal &&
              <Modal show={showModal} onHide={this.hideModal} bsSize="large">
                <Modal.Header closeButton>
                  <Modal.Title className="text-center">
                    <h2 > {i18n.t('EMAIL_PREVIEW')} </h2>
                    <p className={style.preview_help_title}>
                      <span className={style.preview_help_text} title="#firstname, #lastname, #fullname">
                        {i18n.t('SMART_TAGS')}
                      </span>
                      {i18n.t('ARE_NOT_SUPPORTED_IN_THIS_EMAIL')}
                    </p>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {this.emailPreview()}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    onClick={this.handleClose}
                    className={`${style.preview_cancel_btn} button-secondary btn btn-border m-t-10`}
                  >
                    {i18n.t('CANCEL')}
                  </Button>
                  <button
                    onClick={this.onSubmit}
                    className={`${style.preview_send_btn} button-primary btn btn-border m-t-10`}
                  >
                    {i18n.t('SEND_EMAIL')}
                  </button>
                </Modal.Footer>
              </Modal>
            }
          </Col>
        </Row>
      </div>
    );
  }
}

const Input = properties => (
  <div className={style.m_10} style={properties.style}>
    <label htmlFor={properties.name}>
      <Trans>{properties.label}</Trans> <span className="required_color">*</span>
    </label>
    <div>
      <input
        type={properties.type}
        className={`${style.form_input}`}
        style={{ borderColor: '#aeb3b9' }}
        id={properties.name}
        disabled={properties.disabled}
        value={properties.value}
        onChange={properties.onChange}
      />
    </div>
  </div>
);
