import React, { Component } from 'react';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import DropdownList from 'react-widgets/lib/DropdownList';
import { reduxForm, getFormValues, change, Field, fieldPropTypes, enableReinitialize } from 'redux-form';
import { updateAppSettings, loadAppSettings, uploadProfileLogo } from '../../redux/modules/AppSettings/AppSettings';
import i18n from '../../i18n';
import constant from '../../helpers/Constants';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

const styles = require('./EditableAppSettings.scss');

// Localization data
const languageData = [
  { id: 'en', languageCode: 'en', language: 'English' },
  { id: 'de', languageCode: 'de', language: 'German' }
];

const renderInput = ({ type, name, disabled, input }) => (
  <input
    {...input}
    type={type}
    name={name}
    disabled={disabled}
    className={styles.settingsValue}
  />
);

const renderDropdownList = ({
  valueField,
  textField,
  handleOnChange,
  data,
  disabled,
  selectedOption,
  meta:
  {
    touched,
    error
  },
}) => (
    <div className={styles.m_t_b_10}>
      <div>
        <DropdownList
          name={name}
          valueField={valueField}
          textField={textField}
          data={data}
          onSelect={handleOnChange}
          value={selectedOption}
          disabled={disabled}
        />
      </div>
      {error && touched && <div className="text-danger">{error}</div>}
    </div>
  );

renderDropdownList.propTypes = {
  valueField: PropTypes.string.isRequired,
  textField: PropTypes.string.isRequired,
  handleOnChange: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired,
  selectedOption: PropTypes.object.isRequired,
  ...fieldPropTypes
};

renderInput.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  ...fieldPropTypes
};

@reduxForm({
  form: 'AppSettings',
  enableReinitialize
})

@connect((state, props) => ({
  values: getFormValues(props.form)(state),
}), {
    change,
    updateAppSettings,
    loadAppSettings,
    uploadProfileLogo
  })
export default class AppSettingsForm extends Component {
  static propTypes = {
    datas: PropTypes.array.isRequired,
    initialize: PropTypes.func.isRequired,
    initialValues: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    keyField: PropTypes.string.isRequired,
    idField: PropTypes.string.isRequired,
    valueField: PropTypes.string.isRequired,
    nameField: PropTypes.string.isRequired,
    pristine: PropTypes.bool.isRequired,
    updating: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    form: PropTypes.string.isRequired,
    updateAppSettings: PropTypes.func.isRequired,
    loadAppSettings: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    uploadProfileLogo: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      fileName: '',
      appLogoName: ''
      // selectedLanguage: {}
    };
    this.changedFields = {};
    this.initialValues = {};
  }

  componentDidMount() {
    this.setInitialValues();
    this.initializeData();
  }

  onLanguageChange = (fieldName, value, id) => {
    const { initialValues } = this;
    if (initialValues.languageCode !== value) {
      this.changedFields[fieldName] = id;
    } else if (this.changedFields[fieldName]) {
      delete this.changedFields[fieldName];
    }
    this.setState({ selectedLanguage: value });
    this.props.change(this.props.form, fieldName, value);
  }

  onMailReaderChange = (fieldName, value, id) => {
    const { initialValues } = this;
    if (initialValues.daystotakeaction !== value) {
      this.changedFields[fieldName] = id;
    } else if (this.changedFields[fieldName]) {
      delete this.changedFields[fieldName];
    }
  }

  onDaysToTakeActionChange = (fieldName, value, id) => {
    const { initialValues } = this;
    if (initialValues.daystotakeaction !== value) {
      this.changedFields[fieldName] = id;
    } else if (this.changedFields[fieldName]) {
      delete this.changedFields[fieldName];
    }
  }

  onPasswordExpiryChange = (fieldName, value, id) => {
    const { initialValues } = this;
    if (initialValues.passwordexpiry !== value) {
      this.changedFields[fieldName] = id;
    } else if (this.changedFields[fieldName]) {
      delete this.changedFields[fieldName];
    }
  }

  onalertdaysChange = (fieldName, value, id) => {
    const { initialValues } = this;
    if (initialValues.alertdays !== value) {
      this.changedFields[fieldName] = id;
    } else if (this.changedFields[fieldName]) {
      delete this.changedFields[fieldName];
    }
  }

  setInitialValues = () => {
    const { datas } = this.props;
    const initialValues = {};
    if (datas) {
      datas.forEach(data => {
        initialValues[data.key] = data.value;
      });
    }
    this.initialValues = {
      languagecode: languageData.find(language => language.languageCode === initialValues.languagecode),
      mailreader: initialValues.mailreader === 'true',
      daystotakeaction: initialValues.daystotakeaction,
      profileLogo: this.initializeValues.profileLogo,
      appLogo: this.initializeValues.appLogo,
      passwordexpiry: initialValues.passwordexpiry,
      alertdays: initialValues.alertdays
    };
  }

  initializeData = () => {
    this.props.initialize(this.initialValues);
    this.setState({
      selectedLanguage: this.initialValues.languagecode
    });
  }

  toggleEditMode = () => {
    this.setState(previousState => ({
      editMode: !previousState.editMode
    }));
  }

  handleFileSelect = event => {
    event.preventDefault();
    this.validateFileInput(event.target.files[0], 'profileLogo', 'Profile Logo');
    event.target.value = '';
  }

  handleLogoFileSelect = event => {
    event.preventDefault();
    this.validateFileInput(event.target.files[0], 'appLogo', 'Application Logo');
    event.target.value = '';
  }

  validateFileInput = (file, category, displayName) => {
    const formInput = new FormData();
    formInput.append('file', file);
    this.setState({ file });
    const type = file.name.replace(/^.*\./, '').toLowerCase();
    if (constant.LOGO_FILE_TYPES.includes(type)) {
      if (file.size === 0) {
        toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.FILE_UPLOAD_ZERO_SIZE'));
      } if (file.size <= 300000 && file.size !== 0) {
        this.uploadLogo(formInput, category, displayName);
      } else {
        toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.LOGO_UPLOAD_SIZE_ERROR'));
      }
    } else {
      toastrErrorHandling({}, i18n.t('ERROR'),
        `${i18n.t('errorMessage.FILE_UPLOAD_TYPE_ERROR')} ${i18n.t('errorMessage.LOGO_FILE_TYPES')}`);
    }
  }

  uploadLogo = (file, category, displayName) => {
    const data = { file };
    this.props.uploadProfileLogo(data, { category, displayName }).then(() => {
      this.loadInitialData();
      toastr.success(i18n.t('successMessage.SAVED'), i18n.t('successMessage.FILE_HAS_BEEN_UPLOADED_SUCCESSFULLY'));
    },
      error => {
        this.loadInitialData();
        toastrErrorHandling(error.error, i18n.t('errorMessage.FILE_UPLOAD_ERROR'), error.error.message);
      });
  }

  loadInitialData = () => {
    this.props.loadAppSettings().then(
      () => {
        this.props.reset();
        this.setInitialValues();
        this.initializeData();
        this.toggleEditMode();
      }
    );
  }

  handleFormSubmit = e => {
    e.preventDefault();
    const { values, idField, valueField, keyField } = this.props;
    if (this.changedFields) {
      const updateData = [];
      if (this.changedFields.languagecode) {
        updateData.push({
          [idField]: this.changedFields.languagecode,
          [valueField]: values.languagecode.languageCode,
          [keyField]: 'languagecode'
        });
      }
      if (this.changedFields.daystotakeaction) {
        updateData.push({
          [idField]: this.changedFields.daystotakeaction,
          [valueField]: values.daystotakeaction,
          [keyField]: 'daystotakeaction'
        });
      }
      if (this.changedFields.passwordexpiry) {
        updateData.push({
          [idField]: this.changedFields.passwordexpiry,
          [valueField]: values.passwordexpiry,
          [keyField]: 'passwordexpiry'
        });
      }
      if (this.changedFields.alertdays) {
        updateData.push({
          [idField]: this.changedFields.alertdays,
          [valueField]: values.alertdays,
          [keyField]: 'alertdays'
        });
      }
      if (this.changedFields.mailreader) {
        updateData.push({
          [idField]: this.changedFields.mailreader,
          [valueField]: !!values.mailreader,
          [keyField]: 'mailreader'
        });
      }
      this.props.updateAppSettings(updateData).then(
        () => {
          this.props.loadAppSettings().then(
            () => {
              this.props.reset();
              this.setInitialValues();
              this.initializeData();
              this.toggleEditMode();
            }
          );
          toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.APP_SETTINGS_UPDATED_SUCCESSFULLY'));
        }
      ).catch(
        () => {
          this.props.loadAppSettings().then(
            () => {
              this.props.reset();
              this.setInitialValues();
              this.initializeData();
              this.toggleEditMode();
            });
          toastr.error(i18n.t('ERROR'), i18n.t('errorMessage.APP_SETTINGS_UPDATE_FAILED'));
        }
      );
    }
  }

  initializeValues = () => {
    this.props.initialize(this.props.initialValues);
    this.changedFields = {};
  }

  renderCorrespondingInput = data => {
    const { idField, keyField, valueField } = this.props;
    const { editMode } = this.state;
    switch (data[keyField]) {
      case 'mailreader':
        return (data.isEditable && editMode ?
          <Field
            type="checkbox"
            name={data[keyField]}
            disabled={!data.isEditable}
            component={renderInput}
            onChange={event => { this.onMailReaderChange(data[keyField], event.target.value, data[idField]); }}
          /> : <span>{data[valueField] === 'true' ? i18n.t('ENABLED') : i18n.t('DISABLED')}</span>);
      case 'languagecode':
        return (data.isEditable && editMode ?
          <Field
            valueField={'id'}
            textField={'languageCode'}
            data={languageData}
            name={data[keyField]}
            disabled={!data.isEditable}
            component={renderDropdownList}
            selectedOption={this.state.selectedLanguage}
            handleOnChange={value => { this.onLanguageChange(data[keyField], value, data[idField]); }}
          /> : <span>{data[valueField]}</span>);
      case 'daystotakeaction':
        return (data.isEditable && editMode ?
          <Field
            type="number"
            name={data[keyField]}
            disabled={!data.isEditable}
            component={renderInput}
            onChange={event => { this.onDaysToTakeActionChange(data[keyField], event.target.value, data[idField]); }}
          /> : <span>{data[valueField]} {i18n.t('DAYS')}</span>);
      case 'profileLogo':
        return <span>{data[valueField].split('/logo/')[1]}</span>;
      case 'appLogo':
        return <span>{data[valueField].split('/logo/')[1]}</span>;
      case 'passwordexpiry':
        return (data.isEditable && editMode ?
          <Field
            type="number"
            name={data[keyField]}
            disabled={!data.isEditable}
            component={renderInput}
            onChange={event => { this.onPasswordExpiryChange(data[keyField], event.target.value, data[idField]); }}
          /> : <span>{data[valueField]} {i18n.t('DAYS')}</span>);
      case 'alertdays':
        return (data.isEditable && editMode ?
          <Field
            type="number"
            name={data[keyField]}
            disabled={!data.isEditable}
            component={renderInput}
            onChange={event => { this.onalertdaysChange(data[keyField], event.target.value, data[idField]); }}
          /> : <span>{data[valueField]} {i18n.t('DAYS')}</span>);
      default:
        return (<span>{i18n.t('INFO_UNAVAILABLE')}</span>);
    }
  }

  renderChildren = () => {
    const { datas, nameField } = this.props;
    return datas.map(data => (
      <Row className={styles.fieldAndValue}>
        <Col xs={6} lg={3}>
          <div className={styles.settingsName}>{data[nameField]}</div>
        </Col>
        <Col xs={6} lg={4} className={styles.inputContainer}>
          {this.renderCorrespondingInput(data)}
        </Col>
      </Row>
    ));
  }

  render() {
    const { datas, pristine } = this.props;
    return (
      <div className={`${styles.inlineFormContainer} ${this.state.editMode ? styles.editMode : ''}`}>
        <form name="AppSettings" onSubmit={this.handleFormSubmit}>
          <Row className={styles.searchAndEdit}>
            <Col xs={7} className={styles.buttonContainer}>
              <button
                className={`button-primary ${styles.editButton}`}
                onClick={e => { e.preventDefault(); this.toggleEditMode(); }}
                disabled={this.state.editMode}
              >
                {i18n.t('EDIT')}
              </button>
            </Col>
          </Row>
          {datas &&
            this.renderChildren()
          }
          {this.state.editMode &&
            <Col xs={7} className={styles.buttonContainer}>
              <button
                className={`button-secondary ${styles.editButton}`}
                onClick={e => { e.preventDefault(); this.initializeData(); this.toggleEditMode(); }}
              >
                {i18n.t('CANCEL')}
              </button>
              <button
                className={`button-secondary ${styles.editButton}`}
                onClick={e => { e.preventDefault(); this.initializeData(); }}
                disabled={pristine}
              >
                {i18n.t('RESET')}
              </button>
              <button
                className={`button-primary ${styles.editButton}`}
                type="submit"
                disabled={this.props.updating || pristine}
              >
                {this.props.updating ? <i className="fa fa-spinner fa-spin" /> : ''}
                {i18n.t('SAVE')}
              </button>
            </Col>
          }
        </form>
        {this.state.editMode ? <div lg={12} className="m-t-30">
          <Col lg={12}>
            <h5 className={styles.logoHeader}>{i18n.t('LOGO')}</h5>
          </Col>
          <Col lg={12} className={`p-0 ${styles.fieldAndValue}`}>
            <Col xs={6} lg={3}>
              <div className={styles.settingsName}>{i18n.t('PROFILE_LOGO')}</div>
            </Col>
            <Col lg={4} xs={6} className={`${styles.fileInputWrapper} ${styles.inputContainer}`}>
              <input
                type="text"
                id="placeHolder"
                value={this.state.fileName}
                placeholder={i18n.t('placeholder.CHOOSE_LOGO_IMAGE')}
              />
              <input
                type="file"
                accept={constant.LOGO_FILE_TYPES}
                className={`${styles.fileInput} ${styles.settingsValue}`}
                onChange={e => { this.handleFileSelect(e); }}
                title={this.state.fileName || i18n.t('tooltipMessage.NO_FILES_CHOOSEN')}
              />
            </Col>
          </Col>
          <Col lg={12} className={`m-t-30 p-0 ${styles.fieldAndValue}`}>
            <Col xs={6} lg={3}>
              <div className={styles.settingsName}>{i18n.t('APPLICATION_LOGO')}</div>
            </Col>
            <Col lg={4} xs={6} className={`${styles.fileInputWrapper} ${styles.inputContainer}`}>
              <input
                type="text"
                id="placeHolder"
                value={this.state.appLogoName}
                placeholder={i18n.t('placeholder.CHOOSE_LOGO_IMAGE')}
              />
              <input
                type="file"
                accept={constant.LOGO_FILE_TYPES}
                className={`${styles.fileInput} ${styles.settingsValue}`}
                onChange={e => { this.handleLogoFileSelect(e); }}
                title={this.state.appLogoName || i18n.t('tooltipMessage.NO_FILES_CHOOSEN')}
              />
            </Col>
          </Col>
        </div> : ''}
      </div>
    );
  }
}
