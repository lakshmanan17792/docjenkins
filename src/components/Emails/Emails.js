import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Image, DropdownButton, MenuItem, ButtonToolbar, Button } from 'react-bootstrap';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Scrollbars } from 'react-custom-scrollbars';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import moment from 'moment';
import { Multiselect } from 'react-widgets';
import {
  fetchEmails, fileUpload,
  sendEmail, deleteCandidateEmail,
  deleteJobEmail, fetchUserEmails,
  clearUserEmails
} from '../../redux/modules/emails';
import styles from './Emails.scss';
import { isEmail } from '../../utils/validation';
import i18n from '../../i18n';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

const style = require('../../containers/Emailer/Emailer.scss');

@connect(state => ({
  searchEmails: state.emails.candidateEmails,
  user: state.auth.user,
  userEmails: state.emails.userEmails,
  emailState: state.emails,
}), {
  fetchEmails,
  fileUpload,
  sendEmail,
  deleteCandidateEmail,
  deleteJobEmail,
  fetchUserEmails,
  clearUserEmails
})


export default class Emails extends Component {
  static propTypes = {
    emails: PropTypes.array.isRequired,
    filesStatus: PropTypes.o,
    fileUpload: PropTypes.func.isRequired,
    sendEmail: PropTypes.func.isRequired,
    emailState: PropTypes.o,
    user: PropTypes.o,
    type: PropTypes.String,
    deleteCandidateEmail: PropTypes.func.isRequired,
    deleteJobEmail: PropTypes.func.isRequired,
    userEmails: PropTypes.array.isRequired,
    fetchUserEmails: PropTypes.func.isRequired,
    clearUserEmails: PropTypes.func.isRequired
  }

  static defaultProps = {
    emails: [],
    searchEmails: [],
    filesStatus: {},
    emailState: {},
    user: {},
    type: 'job'
  }

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      animation: true,
      selectedEmail: null,
      showReply: false,
      editorState: EditorState.createEmpty(),
      files: [],
      isForward: false,
      mailTo: []
    };
  }
  componentDidUpdate() {
    if (this.state.showModal && this.state.showReply) {
      this.anchoring.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
    }
  }

  onClickEmail = (id, showReply) => {
    this.setState({
      showModal: true,
      animation: true,
      selectedEmail: this.props.emails[id],
      showReply
    });
  }

  onEditorStateChange = editorState => {
    this.setState({
      editorState,
      error: { ...this.state.error,
        message: {
          touched: true
        }
      }
    });
  };

  onClickReply = () => {
    this.setState({
      showReply: true,
      isForward: false,
      editorState: EditorState.createEmpty(),
    });
  }

  onClickForward = email => {
    const html = email.body;
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.setState({
        showReply: true,
        isForward: true,
        editorState
      });
    }
  }

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
            if (file.name === key) {
              if (files[key].uploadResponse) {
                formFiles.push(files[key].uploadResponse);
              } else if (files[key].error) {
                toastrErrorHandling({}, '', `${files[key].name ?
                  files[key].name : 'Some file'} is not uploaded. are you sure to carry on`);
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

  getDropDownCmp = id => (
    <Col xs={1} className={styles.dropdown_section}>
      <ButtonToolbar>
        <DropdownButton
          title={<span className={`${styles.overflow_btn} glyphicon glyphicon-option-vertical`} />}
          pullRight
          id="dropdown-size-small"
          noCaret
        >
          <MenuItem eventKey="1" onClick={() => this.onClickEmail(id, false)}>
            <span><i className={`${styles.dropdown_option_icon} fa fa-eye`} /></span>
            <span className={`${styles.dropdown_options}`}>Preview sent email</span>
          </MenuItem>
          <MenuItem eventKey="2" onClick={() => this.onClickEmail(id, true)}>
            <span><i className={`${styles.dropdown_option_icon} fa fa-reply`} /></span>
            <span className={`${styles.dropdown_options}`}>Reply</span>
          </MenuItem>
          <MenuItem eventKey="3" onClick={() => this.forwardMail(id)}>
            <span><i className={`${styles.dropdown_option_icon} fa fa-share`} /></span>
            <span className={`${styles.dropdown_options}`}>Forward</span>
          </MenuItem>
        </DropdownButton>
      </ButtonToolbar>
    </Col>
  );

  forwardMail = id => {
    this.setState({
      showModal: true,
      selectedEmail: this.props.emails[id]
    });
    this.onClickForward(this.props.emails[id]);
  }


  removeFile = file => {
    const { files } = this.state;
    files.pop(file);
    this.setState({
      files
    });
  }

  deleteFile = file => {
    const { files } = this.state;
    files.pop(file);
    this.setState({
      files
    });
  }

  deleteEmail = index => {
    const { type, emails } = this.props;
    if (type === 'job') {
      this.props.deleteJobEmail(emails[index].id).then(() => {
        toastr.success(i18n.t('successMessage.EMAIL_DELETED_SUCCESSFULLY'));
      }, err => {
        toastrErrorHandling(err.error, '', i18n.t('errorMessage.ERROR_WHILE_DELETING'));
      });
    } else if (type === 'candidate') {
      this.props.deleteCandidateEmail(emails[index].id).then(() => {
        toastr.success(i18n.t('successMessage.EMAIL_DELETED_SUCCESSFULLY'));
      }, err => {
        toastrErrorHandling(err.error, '', i18n.t('errorMessage.ERROR_WHILE_DELETING'));
      });
    }
  }

  discard = () => {
    this.setState({
      showReply: false,
      editorState: EditorState.createEmpty(),
      files: []
    });
  }

  isValidEmail = emails => {
    let isValid = true;
    if (emails && emails.length > 0) {
      emails.map(mail => {
        const valid = isEmail(mail.email);
        if (!valid) {
          isValid = false;
        }
        return '';
      });
    } else {
      isValid = false;
    }
    return isValid;
  }

  sendEmail = () => {
    const { selectedEmail, isReceived, editorState, mailTo, isForward } = this.state;
    const { user } = this.props;
    const { formFiles, canSend } = this.getFilesToMail();
    if (isForward && !this.isValidEmail(mailTo)) {
      toastrErrorHandling({}, '', i18n.t('errorMessage.PLEASE_ENTER_VALID_EMAIL_ADDRESS'));
      return;
    }
    const fileArr = formFiles.map(file => {
      const newFile = {};
      newFile.documentId = file.id;
      newFile.fileName = file.originalFilename;
      return newFile;
    });
    let fromAddress;
    let toAddress;

    const forwardedEmails = mailTo.map(mail => mail.email);

    if (isReceived) {
      fromAddress = selectedEmail.toAddress;
      toAddress = isForward ? forwardedEmails : selectedEmail.fromAddress;
    } else {
      fromAddress = selectedEmail.fromAddress;
      toAddress = isForward ? forwardedEmails : selectedEmail.toAddress;
    }

    const mail = {
      candidateList: isForward ? [] : [{ id: selectedEmail.candidateId, receiverEmail: toAddress }],
      contactList: [],
      template: {
        body: draftToHtml(convertToRaw(editorState.getCurrentContent())),
        subject: `${isForward ? 'Fwd: ' : 'Re: '} ${selectedEmail.subject}`,
        createdBy: user.id
      },
      mailRequest: {
        cc: [],
        bcc: [],
        fromAddress,
        toAddress,
        jobId: selectedEmail.jobId,
        tags: [],
        userId: user.id,
        subject: `Re: ${selectedEmail.subject}`,
        attachments: fileArr,
        isForwarded: isForward,
        forwardedTo: forwardedEmails
      }
    };
    if (canSend) {
      this.props.sendEmail(mail).then(() => {
        toastr.success(i18n.t('successMessage.EMAIL_HAS_BEEN_QUEUED_SUCCESSFULLY'));
        this.setState({
          showModal: false,
          selectedEmail: null,
          showReply: false,
          editorState: EditorState.createEmpty(),
          files: [],
          isForward: false,
          mailTo: []
        });
      }
      ).catch();
    }
  };

  handleFileSelect = event => {
    const newFiles = event.target.files;
    const { files } = this.state;
    const fileSize = this.getFileSize();
    Object.entries(newFiles).forEach(
      ([key]) => {
        const formData = new FormData();
        const file = newFiles[key];
        if (fileSize + file.size < 10485760) {
          formData.append('uploaded_file', file);
          files.push(file);
          this.props.fileUpload(formData, file);
        } else {
          toastrErrorHandling({}, '', i18n.t('errorMessage.FILE_SIZE_EXCEEDS_MAXIMUM_SIZE_(10_MB)'));
        }
      }
    );
    this.setState({
      files
    });
  }

  closeModal = () => {
    this.setState({
      showModal: false,
      animation: false,
      selectedEmail: null,
      showReply: false,
      isForward: false,
      mailTo: []
    });
  }

  emailThread = (email, index) => (
    <Row className={styles.email} >
      <Col xs={5}>
        <div>
          <Image src="/default_male.png" circle className={styles.emailSenderImg} />
          <div className={styles.mailContent}>
            <div className={styles.receiver}>
              <div><b>From: </b> {email.fromAddress}</div>
              <div><b>To:</b> {email.toAddress}</div>
            </div>
            <div className={styles.sentTime}>
              {moment(moment(email.deliveryDate).format('DD MMM YYYY hh:mm a'), 'DD MMM YYYY hh:mm a').fromNow()}
            </div>
          </div>
        </div>
      </Col>
      <Col xs={6}>
        <Row>
          <Col xs={12}>
            <div className={styles.subject}>
              {
                email.isReceived ?
                  <Image src="/inbox.png" className={styles.inboxIcon} /> :
                  <Image src="/outbox.png" className={styles.inboxIcon} />
              }
              {email.subject}
            </div>
          </Col>
        </Row>
      </Col>
      {this.getDropDownCmp(index)}
    </Row>
  )

  attachmentFiles = file => {
    const token = localStorage.getItem('authToken');
    return (
      <a
        href={`${window.location.origin}/api/v1/documents/download/${file.id}?access_token=${token}`}
        className={styles.attachment}
        onClick={this.downloadFile}
      >
        {file.originalFilename}
        <i className={`fa fa-download ${styles.downloadIcon}`} />
      </a>
    );
  }

  updateMailTo = mail => {
    this.setState({
      mailTo: mail
    });
    this.props.clearUserEmails();
  }

  handleSearchChange = value => {
    if (value && value !== '.') {
      if (value === 'initial') {
        this.props.fetchUserEmails(value.toLowerCase());
      } else {
        this.setState({
          isSkillOpen: true
        }, () => {
          this.props.fetchUserEmails(value.toLowerCase());
        });
      }
    }
  }

  replyEmail = email => {
    const { emailState } = this.props;
    const filesState = emailState.files;
    return (
      <Row className={styles.replyEmailContainer}>
        <Col xs={12} className={styles.replyFrom}>
          <span >From: </span>
          <span className={styles.receiver}>
            {email.isReceived ? email.toAddress : email.fromAddress}
          </span>
        </Col>
        <Col xs={12} className={styles.replyTo}>
          <Col xs={1} className="p-0">
            <span>To: </span>
          </Col>
          <Col xs={11} className="p-0">
            {
              this.state.isForward ? <Multiselect
                data={this.props.userEmails}
                // onSelect={this.handleEmailChange}
                onChange={this.updateMailTo}
                value={this.state.mailTo}
                onSearch={this.handleSearchChange}
                textField="email"
              /> : <span className={styles.receiver}>
                {email.isReceived ? email.fromAddress : email.toAddress}
              </span>
            }
          </Col>
        </Col>
        <Col xs={12} className={styles.replySubject}>
          <span className={styles.receiver}>
            {this.state.isForward ? 'Fwd: ' : 'Re:'}
            {email.subject}
          </span>
        </Col>
        <Col xs={12} className={styles.replyEditor}>
          <Editor
            editorState={this.state.editorState}
            wrapperClassName={styles.wrapper}
            editorClassName={styles.editor}
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
          />
          <div className={`${style.composeEmail} ${styles.compose}`}>
            <div className={`m-t-10 ${style.attachments}`}>
              <label htmlFor="Attachments">
                Attachments
              </label>
              <div>
                <div className={style.fileInputWrapper}>
                  <input type="file" onChange={e => { this.handleFileSelect(e); }} multiple="multiple" />
                  <Button
                    // onClick={() => this.addPersonalizations(personalization)}
                    className={`${style.addBtn} btn btn-border m-t-10`}
                  >
                    Attach files
                  </Button>
                </div>
              </div>
              {
                this.state.files && this.state.files.map(file => (
                  <div className={style.attachedFiles}>
                    <div className={style.fileName}>{file.name}</div>
                    <div className={style.fileSize}>{this.getFormattedFileSize(file.size)}</div>
                    {filesState[file.name].uploading ?
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
                ))
              }
            </div>
          </div>


        </Col>
        <Col xs={12} className={styles.replyAction}>
          <Button className={styles.sendEmail} onClick={this.sendEmail}>Send Email</Button>
          <Button className={styles.discard} onClick={this.discard}>Discard</Button>
        </Col>
      </Row>
    );
  };

  emailDetail = email => (
    <div className={styles.emailContainer}>
      <div className={styles.emailBackdrop} />
      <div className={styles.closeIconContainer} onClick={this.closeModal} role="presentation">
        <i className={`fa fa-times ${styles.closeIcon}`} />
      </div>
      <div className={styles.emailDetail}>
        <Scrollbars
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(100vh - 50px)'}
          autoHeightMax={'calc(100vh - 50px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className="customScroll" />}
        >
          <Row >
            <Col xs={12}>
              <Row>
                <Col xs={6}>
                  <Image src="/default_male.png" circle className={styles.emailSenderImg} />
                  <Row>
                    <Col xs={8} className={styles.mg_t_15}>
                      <span className={styles.receiver}>
                        {email.fromAddress}
                      </span>
                    </Col>
                    <Col xs={8}>
                      To: <span className={styles.toAddress}>{email.toAddress}</span>
                    </Col>
                  </Row>
                </Col>
                <Col xs={6} className={`${styles.mg_t_15} ${styles.text_right}`}>
                  <span className={`${styles.daysAgo}`}>
                    {moment(moment(email.deliveryDate).format('DD MMM YYYY hh:mm a'), 'DD MMM YYYY hh:mm a').fromNow()}
                  </span>
                  <span onClick={this.onClickReply} role="presentation">
                    <i className={`${styles.replyIcon} fa fa-reply`} title={i18n.t('tooltipMessage.REPLY')} />
                  </span>
                  <span onClick={() => this.onClickForward(email)} role="presentation">
                    <i className={`${styles.replyIcon} fa fa-share`} title={i18n.t('tooltipMessage.FORWARD')} />
                  </span>
                </Col>
              </Row>
            </Col>
            <Col xs={12} className={styles.emailBody}>
              {Parser(email.body)}
            </Col>
            <Col xs={12} className={styles.attachmentContainer}>
              {
                email.attachments && email.attachments.map(file => this.attachmentFiles(file))
              }
            </Col>
            <Col xs={12}>
              <div ref={div => { this.anchoring = div; }}>
                {
                  this.state.showReply && this.replyEmail(email)
                }
              </div>
            </Col>
          </Row>
        </Scrollbars>
      </div>
    </div>
  )

  render() {
    const { emails } = this.props;
    const { selectedEmail, showModal } = this.state;

    if (emails.length === 0) {
      return (
        <Row className={styles.notFound}>
          <Col className={styles.no_results_found}>
            <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
            <Row className={`${styles.sub_head} m-0`}><div>No Emails found</div></Row>
          </Col>
        </Row>
      );
    }

    return (
      <div style={{ overflowX: 'hidden' }}>
        {
          emails.map((email, index) => this.emailThread(email, index))
        }
        {showModal && this.emailDetail(selectedEmail) }

      </div>

    );
  }
}
