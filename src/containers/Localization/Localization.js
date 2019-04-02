import React, { Component } from 'react';
import { reduxForm, getFormValues } from 'redux-form';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import i18n from '../../i18n';
import UserMenu from '../Users/UserMenu';
import { updateUserLocalization } from '../../redux/modules/auth/auth';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { CustomTable } from '../../components';

const styles = require('../Users/Users.scss');
const companyStyles = require('./Localization.scss');
const userStyles = require('../Users/Users.scss');

const languagedata = [
  { id: 'en', languageCode: 'en', language: 'English' },
  { id: 'de', languageCode: 'de', language: 'German' }
];

@reduxForm({
  form: 'localization',
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  languageCode: state.auth.language_code,
  user: state.auth.user
}), {
  updateUserLocalization,
  pushState
})
export default class Localization extends Component {
  static propTypes= {
    updateUserLocalization: PropTypes.func.isRequired,
    languageCode: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired
  }

  static defaultProps = {
    values: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedLanguage: this.props.languageCode,
      isSnackbarEnabled: false
    };
  }

  handleChange = (evt, language) => {
    this.setState({
      disabled: false,
      selectedLanguage: language,
      isSnackbarEnabled: true
    });
  }

  resetSelectedLanguage = () => {
    this.setState({
      selectedLanguage: this.props.languageCode,
      isSnackbarEnabled: false
    });
  }

  handleSubmit = evt => {
    const { selectedLanguage } = this.state;
    evt.preventDefault();
    const query = {
      languageCode: selectedLanguage,
      userId: this.props.user.id
    };
    this.setState({
      isSnackbarEnabled: false
    });
    this.props.updateUserLocalization(query).then(() => {
      toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.LOCALIZATION_UPDATE_SUCCESS'));
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }, err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'), i18n.t('errorMessage.LOCALIZATION_UPDATE_ERROR'));
    });
  }

  renderActions = language => (
    <label
      role="presentation"
      htmlFor="language"
      style={{ cursor: 'pointer' }}
    >
      <input
        type="radio"
        value="language"
        checked={this.state.selectedLanguage === language.languageCode}
        name="language"
        onChange={evt => this.handleChange(evt, language.languageCode)}
        style={{ cursor: 'pointer' }}
      />
    </label>
  )

  renderLocalization = () => {
    const columnDef = [{ key: 'language' },
      { key: 'languageCode' },
      { key: 'edit', render: this.renderActions }];
    const column = [{ title: 'Name', key: 'language' },
      { title: 'Language code', key: 'languageCode' },
      { title: 'ACTIONS' }
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={languagedata}
        sTitle={column}
        selectedLanguage={this.state.selectedLanguage}
      />
    );
  }

  render() {
    const { isSnackbarEnabled } = this.state;
    return (
      <Col
        lg={12}
        md={12}
        sm={12}
        xs={12}
        className={userStyles.users_container}
      >
        <Helmet title={i18n.t('LOCALIZATION')} />
        <Col lg={2} md={2} sm={2} xs={12} className="p-0">
          <Col lg={12} md={12} sm={12} xs={12} className={userStyles.sidenav}>
            <Col lg={12} md={12} sm={12} xs={12} className="p-0">
              <UserMenu />
            </Col>
          </Col>
        </Col>
        <Col lg={10} md={10} sm={10} xs={12} className={`p-0 ${companyStyles.container}`}>
          <Col
            lg={12}
            md={12}
            sm={12}
            xs={12}
            style={{ background: '#fff' }}
          >
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <div className={`${styles.page_title}`} style={{ margin: '10px 15px' }}>
                <Trans>LOCALIZATION</Trans>
              </div>
              {this.renderLocalization()}
            </Row>
          </Col>
        </Col>
        {isSnackbarEnabled && <Snackbar
          discardChanges={this.resetSelectedLanguage}
          saveLanguage={this.handleSubmit}
        />}
      </Col>
    );
  }
}

const Snackbar = properties => {
  const { discardChanges, saveLanguage } = properties;
  return (
    <div className={` ${companyStyles.snackbar} is-animated`}>
      <div className={`${companyStyles.block}`}>
        <button
          className={`${companyStyles.btn_save} m-l-10`}
          onClick={saveLanguage}
        >
          <Trans>SAVE</Trans>
        </button>
        <button
          className={`${companyStyles.btn_disard} m-l-10`}
          onClick={discardChanges}
        >
          <Trans>RESET</Trans>
        </button>
      </div>
    </div>
  );
};
