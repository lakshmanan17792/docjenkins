import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
import { Trans } from 'react-i18next';
import { Col } from 'react-bootstrap';
import { isDirty, hasSubmitSucceeded } from 'redux-form';
import { push as pushState } from 'react-router-redux';
import { uploadResume, discardResumeData } from '../../redux/modules/resume-parser';
import Loader from '../../components/Loader';
import styles from './Parser.scss';
import toastrErrorHandling from '../toastrErrorHandling';
import CheckDuplicationForm from '../../components/ResumeForm/CheckDuplicationForm';
import { getSimilarCandidate } from '../../redux/modules/linkedinProfiles/linkedinProfiles';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

const allowedFileTypes = ['pdf', 'doc', 'docx'];
@connect(state => ({
  isDuplicationFormChanged: isDirty('CheckDuplication')(state),
  isDuplicationFormSubmitted: hasSubmitSucceeded('CheckDuplication')(state),
  loading: state.resumeParser.resumeUploading
}), { uploadResume, pushState, getSimilarCandidate, discardResumeData })
export default class Parser extends Component {
  static propTypes = {
    uploadResume: PropTypes.func.isRequired,
    discardResumeData: PropTypes.func.isRequired,
    route: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    isDuplicationFormChanged: PropTypes.bool.isRequired,
    isDuplicationFormSubmitted: PropTypes.bool.isRequired,
    pushState: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    getSimilarCandidate: PropTypes.func.isRequired
  }

  static defaultProps = {
    loading: false
  }

  constructor(props) {
    super(props);
    this.state = {
      file: null,
      fileName: '',
      openModal: false,
      drag: false,
      isResumeParsed: false,
      isCheckDuplicationFormEnabled: false
    };
  }

  componentDidMount() {
    const { route, router } = this.props;
    if (route && router) {
      router.setRouteLeaveHook(route, ({ pathname }) => {
        const { isDuplicationFormChanged, isDuplicationFormSubmitted } = this.props;
        if (isDuplicationFormChanged && (!isDuplicationFormSubmitted || !/resume/i.test(pathname))) {
          return i18n.t('confirmMessage.UNSAVED_CHANGES');
        } else if (this.state.file && this.state.file.name) {
          return i18n.t('confirmMessage.UNSAVED_CHANGES');
        }
      });
    }
  }

  onFormSubmit = e => {
    e.preventDefault(); // Stop form submit
    if (this.state.file) {
      this.fileUpload(this.state.file);
    } else {
      toastrErrorHandling({}, '', i18n.t('errorMessage.PLEASE_UPLOAD_A_FILE'));
    }
  }

  onChange = e => {
    if (this.handleFileTypeAndSize(e.target.files[0])) {
      this.setState({ file: e.target.files[0], fileName: e.target.files[0].name });
    }
  }

  onFileDrop = event => {
    event.preventDefault();
    if (this.handleFileTypeAndSize(event.dataTransfer.files[0])) {
      this.upload.files = event.dataTransfer.files;
      this.setState({ file: event.dataTransfer.files[0], fileName: event.dataTransfer.files[0].name, drag: false });
    } else {
      this.setState({ drag: false });
    }
  }

  onToggle = () => {
    this.props.discardResumeData();
    this.setState({
      openModal: !this.state.openModal,
      isDuplicateListEnabled: false,
      isCheckDuplicationFormEnabled: !this.state.isCheckDuplicationFormEnabled
    });
  }

  getContactDetails = data => Array.isArray(data) ? data.join(';') : data;

  validateData = data => (!data || (data && Object.keys(data).length === 0) ? '' : data);

  dragOver = event => {
    event.preventDefault();
  }

  dragEnter = () => {
    this.setState({ drag: true });
  }

  dragLeave = () => {
    this.setState({ drag: false });
  }

  fileUpload = file => {
    const formData = new FormData();
    formData.append('uploaded_file', file);
    this.props.uploadResume(formData).then(data => {
      this.setState({ file: null, fileName: '' });
      const profile = data &&
        data.data &&
        data.data;
      const profileData = JSON.parse(profile);
      const personal = profileData && profileData.Profile && profileData.Profile.Personal;
      const filter = {
        name: (this.validateData(personal.FirstName)).concat(
          this.validateData(personal.FirstName) && ' ').concat(
          this.validateData(personal.MiddleName) &&
          `${this.validateData(personal.MiddleName)} `).concat(
          this.validateData(personal.LastName)),
        email: this.getContactDetails(this.validateData(personal.Emails.Email)),
        mobileNumber: this.getContactDetails(this.validateData(personal.MobilePhones.MobilePhone)),
      };
      if (filter.name) {
        toastr.success(i18n.t('successMessage.RESUME_HAS_BEEN_PARSED_SUCCESSFULLY'));
        this.props.getSimilarCandidate(filter).then(result => {
          if (result && result.data && result.data.length > 0) {
            this.setState({
              openModal: true,
              isResumeParsed: true,
              isDuplicateListEnabled: true,
              isCheckDuplicationFormEnabled: true
            });
          } else {
            this.props.pushState('/Resume');
          }
        });
      } else {
        // toastrErrorHandling(i18n.t('ERROR'), i18n.t('errorMessage.UPLOAD_RESUME_IS_CORRUPTED_OR_NO_DATA_FOUND'));
        this.props.pushState('/Resume');
      }
    }, err => {
      toastrErrorHandling(err.error, i18n.t('errorMessage.ERROR_WHILE_UPLOADING_RESUME'));
    });
  }

  handleFileTypeAndSize = file => {
    const fileType = file.name.replace(/^.*\./, '').toLowerCase();
    const fileSize = file.size;
    if (!allowedFileTypes.includes(fileType)) {
      toastrErrorHandling({}, i18n.t('ERROR'),
        i18n.t('errorMessage.THE_RESUME_TYPE_IS_INVALID'));
      this.upload.value = '';
    } else if (fileSize > 10485760) {
      toastrErrorHandling({}, i18n.t('ERROR'),
        i18n.t('errorMessage.RESUME_SIZE_EXCEEDS_THE_ALLOWABLE_LIMIT._MAXIMUM_FILE_SIZE_CAN_BE_UP_TO_10MB'));
      this.upload.value = '';
    } else if (fileSize === 0) {
      toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.FILE_SIZE_SHOULD_BE_MORE_THAN_0KB'));
      this.upload.value = '';
    } else {
      return true;
    }
    return false;
  }

  toggleCheckDuplicationForm = (event, isFormPristine) => {
    if (isFormPristine === false) {
      const toastrConfirmOptions = {
        onOk: () => this.onToggle(),
        okText: i18n.t('YES'),
        cancelText: i18n.t('NO')
      };
      toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
    } else {
      this.onToggle();
    }
  }

  render() {
    const { loading } = this.props;
    const { drag, isCheckDuplicationFormEnabled, isDuplicateListEnabled, isResumeParsed, openModal } = this.state;
    return (
      <div>
        <Helmet title={i18n.t('RESUME_PARSER')} />
        <div
          className={`${styles.resume_upload_container} ${drag ? styles.resume_upload_container_drag : ''}`}
          onDragEnter={this.dragEnter}
          onDragOver={this.dragOver}
          onDragLeave={this.dragLeave}
          onDrop={this.onFileDrop}
        >
          <Col xs={12} className={styles.parser_main} style={drag ? { pointerEvents: 'none' } : {}}>
            <h2><Trans>PROCESS_RESUME</Trans></h2>
            <Col xs={12} className={styles.parser_ins}>
              <NewPermissible operation={{ operation: 'PARSE_RESUME', model: 'resume' }}>
                <div>
                  <h4><Trans>SELECT_RESUME_FROM_COMPUTER</Trans></h4>
                  <ul className={styles.marker_arrows}>
                    <li>
                      <Trans>PRESS</Trans> <b><Trans>SUBMIT</Trans></b> <Trans>TO</Trans> <Trans>PROCESS</Trans>
                    </li>
                  </ul>
                  <form onSubmit={this.onFormSubmit}>
                    <div className={styles.file}>
                      <input
                        type="text"
                        id="placeHolder"
                        value={this.state.fileName}
                        placeholder={i18n.t('placeholder.CHOOSE_FILE')}
                        disabled="disabled"
                      />
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={this.onChange}
                        title={this.state.fileName || i18n.t('tooltipMessage.NO_FILES_CHOOSEN')}
                        className={styles.process_cv_input}
                        ref={input => { this.upload = input; }}
                      />
                    </div>
                    <div className={styles.fileFormats}>
                      <Trans>FILE_SUPPORTED_FORMATS</Trans>: doc,docx {i18n.t('AND')} pdf
                    </div>
                    <button
                      type="submit"
                      className={`${styles.send_btn} button-primary`}
                      disabled={!this.state.file}
                    ><Trans>SUBMIT</Trans></button>
                  </form>
                </div>
              </NewPermissible>
              <NewPermissible operation={{ operation: 'PARSE_RESUME', model: 'resume' }}>
                <div className={'m-10'} >
                  <span
                    className={styles.link}
                    role="presentation"
                    onClick={this.toggleCheckDuplicationForm}
                  >
                    <i className={`fa fa-plus ${styles.add_candidate}`} />
                    <span><Trans>ADD_CANDIDATE</Trans></span>
                  </span>
                </div>
              </NewPermissible>
            </Col>
          </Col>
          {drag && <div className={styles.uploadBox} style={drag ? { pointerEvents: 'none' } : {}}>
            <i className="fa fa-cloud-upload" />
          </div>}
        </div>
        <Loader loading={loading} />
        {openModal && <CheckDuplicationForm
          isCheckDuplicationFormEnabled={isCheckDuplicationFormEnabled}
          onClose={this.toggleCheckDuplicationForm}
          isDuplicateListEnabled={isDuplicateListEnabled}
          isParsedCandidate
          isAddCandidate={!isResumeParsed}
        />}
      </div>
    );
  }
}
