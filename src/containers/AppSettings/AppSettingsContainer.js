import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import i18n from '../../i18n';

import UserMenu from '../Users/UserMenu';
import AppSettingsForm from './EditableAppSettings';
import { updateAppSettings, loadAppSettings } from '../../redux/modules/AppSettings/AppSettings';


const settingsStyles = require('./AppSettingsContainer.scss');
const userStyles = require('../Users/Users.scss');

@connect(state => ({
  appSettings: state.appSettings.list,
  updating: state.appSettings.updating,
  adding: state.appSettings.adding,
  loading: state.appSettings.loading
}), {
  loadAppSettings,
  updateAppSettings
})
export default class AppSettingsContainer extends Component {
  static propTypes = {
    loadAppSettings: PropTypes.func.isRequired,
    appSettings: PropTypes.array.isRequired,
    updating: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      openAddAppSettings: false
    };
  }

  componentDidMount() {
    this.props.loadAppSettings();
  }

  render() {
    const { appSettings } = this.props;
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
        <Col lg={10} md={10} sm={10} xs={12} className={`p-0 ${settingsStyles.container}`}>
          <Col xs={12} className={settingsStyles.title}>
            {i18n.t('APP_SETTINGS')}
          </Col>
          { (appSettings && appSettings.length) &&
          <AppSettingsForm
            datas={appSettings}
            valueField="value"
            nameField="displayName"
            keyField="key"
            idField="id"
            toggleAddModal={this.toggleAddAppSettingsModal}
            updating={this.props.updating}
          />}
        </Col>
      </Col>
    );
  }
}
