import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import Checkbox from 'rc-checkbox';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import {
  updateAclPermission,
  loadAclByRoles,
  getRolesHeirarchy,
  createRole,
  editRole
} from '../../redux/modules/Acl/Acl';
import Constants from '../../helpers/Constants';
import CreateRoleForm from '../../components/AclForm/CreateRoleForm';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { loadUserRoles } from '../../redux/modules/users/user';
import i18n from '../../i18n';

const styles = require('./RoleManager.scss');
const aclStyles = require('../../containers/Acl/Acl.scss');
const companyStyles = require('../../containers/Customers/Companies.scss');

const constantsStr = JSON.stringify(Constants);
let constants = {};

@connect(state => ({
  rolesHeirarchy: state.acl.rolesHeirarchy,
  allRoles: state.user.userRoles,
  aclByRole: state.acl.aclByRole
}), { loadAclByRoles, updateAclPermission, createRole, getRolesHeirarchy, editRole, loadUserRoles })
export default class RoleManager extends Component {
  static propTypes = {
    role: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
    aclByRole: PropTypes.object.isRequired,
    updateAclPermission: PropTypes.func.isRequired,
    loadAclByRoles: PropTypes.func.isRequired,
    rolesHeirarchy: PropTypes.object.isRequired,
    getRolesHeirarchy: PropTypes.func.isRequired,
    createRole: PropTypes.func.isRequired,
    allRoles: PropTypes.array.isRequired,
    editRole: PropTypes.func.isRequired,
    loadUserRoles: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isCurrentlyWorking: false,
      showAddPopup: false,
      isSnackbarEnabled: false,
      selectedPermissions: [],
      disabledPermissions: {
        Template: { }
      },
      previousValue: []
    };
  }

  componentWillMount() {
    const { role, aclByRole } = this.props;
    constants = JSON.parse(constantsStr);
    const stateAclByRole = Object.assign({}, aclByRole);
    this.props.loadUserRoles();
    if (role && role.name !== 'Admin') {
      constants.additionalAclOptions = constants.additionalAclOptions.filter(
        additionalAclOption => additionalAclOption.title !== 'User'
      );
    }
    this.setState({
      aclByRole: stateAclByRole,
      role: this.props.role,
      previousValue: stateAclByRole
    }, () => {
      this.renderDisabledCheckBoxes();
    });
  }

  onCancel = () => {
    this.setState({
      showAddPopup: !this.state.showAddPopup
    });
  }

  addNewRole = () => {
    const { showAddPopup } = this.state;
    this.setState({
      showAddPopup: !showAddPopup,
      showEditPopup: false
    });
  }

  editRole = () => {
    const { showEditPopup } = this.state;
    this.setState({
      showEditPopup: !showEditPopup,
      showAddPopup: false
    });
  }

  handleChange = (event, permission) => {
    const { selectedPermissions, aclByRole, role } = this.state;
    permission.role = role.name;
    selectedPermissions.forEach(selectedPermission => {
      if (selectedPermission.displayName === permission.displayName &&
        selectedPermission.model === permission.model) {
        selectedPermissions.splice(selectedPermissions.indexOf(selectedPermission), 1);
      }
    });
    selectedPermissions.push(permission);
    const str = JSON.stringify(aclByRole);
    const newRole = JSON.parse(str);
    newRole[permission.model][permission.displayName] = [permission];
    this.setState({
      selectedPermissions,
      isSnackbarEnabled: selectedPermissions.length > 0,
      aclByRole: newRole,
    }, () => this.renderDisabledCheckBoxes());
  }

  handleSubmit = data => {
    const role = {
      cloneFrom: this.state.role.name,
      cloneTo: data.name,
      isCloned: true,
      displayName: data.name,
      reportTo: data.reporter.id
    };
    if (data.reporter.name === 'Recruiter' || data.reporter.name === 'Sales Head') {
      role.parentName = data.reporter.name;
    }
    this.props.createRole(role).then(() => {
      toastr.success('Role Cloned Successfully.');
      this.props.getRolesHeirarchy();
      this.setState({
        showAddPopup: false
      });
    }).catch(error => {
      if (error.error.statusCode !== 401) {
        toastrErrorHandling(error.error, 'ERROR', 'Could not Update');
      }
      this.setState({
        showAddPopup: false
      });
    });
  }

  handleEdit = data => {
    const role = {
      displayName: data.name
    };
    this.props.editRole(role, this.props.role.id).then(editedRole => {
      toastr.success('Role Updated Successfully.');
      this.props.getRolesHeirarchy();
      this.setState({
        showEditPopup: false,
        role: editedRole
      });
    }).catch(error => {
      if (error.error.statusCode !== 401) {
        toastrErrorHandling(error.error, 'ERROR', 'Could not Update');
      }
      this.setState({
        showEditPopup: false
      });
    });
  }

  resetSelectedPermissions = () => {
    toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), {
      onOk: () => {
        this.setState({
          selectedPermissions: [],
          isSnackbarEnabled: false,
          aclByRole: this.props.aclByRole,
          disableSaveAndReset: false
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  savePermissions = () => {
    const { selectedPermissions, previousValue } = this.state;
    this.setState({
      disableSaveAndReset: true
    });
    this.props.updateAclPermission(selectedPermissions, previousValue).then(() => {
      toastr.success('Role Permissions Updated Successfully.');
      this.setState({
        isSnackbarEnabled: false,
        selectedPermission: [],
        disableSaveAndReset: false
      });
    }).catch(error => {
      toastrErrorHandling(error.error, 'ERROR', 'Could not Update');
      this.setState({
        isSnackbarEnabled: false,
        selectedPermission: [],
        disableSaveAndReset: false
      });
      this.props.loadAclByRoles({ roles: [this.props.role.name] });
    });
  }

  renderDisabledCheckBoxes = () => {
    const { aclByRole, disabledPermissions } = this.state;
    const { selectedPermissions } = this.state;
    constants.dependents.forEach(option => {
      let isDisabled = false;
      option.childs.forEach(child => {
        if (aclByRole &&
          aclByRole[child.model] &&
          aclByRole[child.model][child.key] &&
          aclByRole[child.model][child.key][0] &&
          aclByRole[child.model][child.key][0].permission === 'ALLOW') {
          isDisabled = true;
        }
      });
      if (!disabledPermissions[option.model]) {
        disabledPermissions[option.model] = {};
      }
      disabledPermissions[option.model][option.key] = isDisabled;
      if (
        isDisabled && (!aclByRole[option.model] || !aclByRole[option.model][option.key] ||
        aclByRole[option.model][option.key][0].permission !== 'ALLOW')
      ) {
        if (!aclByRole[option.model]) {
          aclByRole[option.model] = {};
        }
        const parent = {
          displayName: option.key,
          model: option.model,
          permission: 'ALLOW',
          role: this.props.role.name
        };
        aclByRole[option.model][option.key] = [parent];
        selectedPermissions.push(parent);
      }
    });
    this.setState({
      disabledPermissions,
      selectedPermissions
    });
  }

  renderPermissions = () => {
    const { aclByRole, disabledPermissions, role } = this.state;
    return (
      <Table
        hover
        className="table-bottom-bordered"
      >
        <thead>
          <tr>
            <th>Entity</th>
            <th>View</th>
            <th>Create</th>
            <th>Edit</th>
            <th>Edit By Me</th>
            <th>Delete</th>
            <th>Delete By Me</th>
            {/* <th>Share</th> */}
          </tr>
        </thead>
        <tbody>
          {constants.aclOptions && constants.aclOptions.length > 0 && constants.aclOptions.map(permission => (
            <tr key={permission.id}>
              <td height="10" style={{ paddingTop: '12px' }}>{permission.name}</td>
              <td height="10">
                {permission.view &&
                  <span className="checkbox_2">
                    <Checkbox
                      checked={aclByRole && aclByRole[permission.entity] &&
                        aclByRole[permission.entity][permission.view.key] ?
                        aclByRole[permission.entity][permission.view.key][0].permission === 'ALLOW' : false}
                      id="isDefault"
                      name="isDefault"
                      disabled={disabledPermissions &&
                        disabledPermissions[permission.entity] ?
                        disabledPermissions[permission.entity][permission.view.key] ||
                        role.name === Constants.admin : false}
                      onChange={event => this.handleChange(event, {
                        displayName: permission.view.key,
                        model: permission.entity,
                        permission: event.target.checked ? 'ALLOW' : 'DENY'
                      }, permission.dependents)}
                      className={permission.view.key === '' && 'incompleted'}
                    />
                  </span>}
              </td>
              <td height="10">
                {permission.create &&
                  <span className="checkbox_2">
                    <Checkbox
                      checked={aclByRole && aclByRole[permission.entity] &&
                        aclByRole[permission.entity][permission.create.key] ?
                        aclByRole[permission.entity][permission.create.key][0].permission === 'ALLOW' : false}
                      id="isDefault"
                      name="isDefault"
                      disabled={disabledPermissions &&
                        disabledPermissions[permission.entity] ?
                        disabledPermissions[permission.entity][permission.create.key] ||
                        role.name === Constants.admin : false}
                      onChange={event => this.handleChange(event, {
                        displayName: permission.create.key,
                        model: permission.entity,
                        permission: event.target.checked ? 'ALLOW' : 'DENY'
                      })}
                      className={permission.create.key === '' && 'incompleted'}
                    />
                  </span>}
              </td>
              <td height="10">
                {permission.edit &&
                  <span className="checkbox_2">
                    <Checkbox
                      checked={aclByRole && aclByRole[permission.entity] &&
                        aclByRole[permission.entity][permission.edit.key] ?
                        aclByRole[permission.entity][permission.edit.key][0].permission === 'ALLOW' : false}
                      id="isDefault"
                      name="isDefault"
                      disabled={disabledPermissions &&
                        disabledPermissions[permission.entity] ?
                        disabledPermissions[permission.entity][permission.edit.key] ||
                        role.name === Constants.admin : false}
                      onChange={event => this.handleChange(event, {
                        displayName: permission.edit.key,
                        model: permission.entity,
                        permission: event.target.checked ? 'ALLOW' : 'DENY'
                      }, permission.dependents)}
                      className={permission.edit.key === '' && 'incompleted'}
                    />
                  </span>}
              </td>
              <td height="10">
                {permission.editByMe &&
                  <span className="checkbox_2">
                    <Checkbox
                      checked={aclByRole && aclByRole[permission.entity] &&
                        aclByRole[permission.entity][permission.editByMe.key] ?
                        aclByRole[permission.entity][permission.editByMe.key][0].permission === 'ALLOW' : false}
                      id="isDefault"
                      name="isDefault"
                      disabled={disabledPermissions &&
                        disabledPermissions[permission.entity] ?
                        disabledPermissions[permission.entity][permission.editByMe.key] ||
                        role.name === Constants.admin : false}
                      onChange={event => this.handleChange(event, {
                        displayName: permission.editByMe.key,
                        model: permission.entity,
                        permission: event.target.checked ? 'ALLOW' : 'DENY'
                      }, permission.editByMe.dependents)}
                      className={permission.editByMe.key === '' && 'incompleted'}
                    />
                  </span>}
              </td>
              <td height="10">
                {permission.delete &&
                  <span className="checkbox_2">
                    <Checkbox
                      checked={aclByRole && aclByRole[permission.entity] &&
                        aclByRole[permission.entity][permission.delete.key] ?
                        aclByRole[permission.entity][permission.delete.key][0].permission === 'ALLOW' : false}
                      id="isDefault"
                      name="isDefault"
                      disabled={disabledPermissions &&
                        disabledPermissions[permission.entity] ?
                        disabledPermissions[permission.entity][permission.delete.key] ||
                        role.name === Constants.admin : false}
                      onChange={event => this.handleChange(event, {
                        displayName: permission.delete.key,
                        model: permission.entity,
                        permission: event.target.checked ? 'ALLOW' : 'DENY'
                      })}
                      className={permission.delete.key === '' && 'incompleted'}
                    />
                  </span>}
              </td>
              <td height="10">
                {permission.deleteByMe &&
                  <span className="checkbox_2">
                    <Checkbox
                      checked={aclByRole && aclByRole[permission.entity] &&
                        aclByRole[permission.entity][permission.deleteByMe.key] ?
                        aclByRole[permission.entity][permission.deleteByMe.key][0].permission === 'ALLOW' : false}
                      id="isDefault"
                      name="isDefault"
                      disabled={disabledPermissions &&
                        disabledPermissions[permission.entity] ?
                        disabledPermissions[permission.entity][permission.deleteByMe.key] ||
                        role.name === Constants.admin : false}
                      onChange={event => this.handleChange(event, {
                        displayName: permission.deleteByMe.key,
                        model: permission.entity,
                        permission: event.target.checked ? 'ALLOW' : 'DENY'
                      })}
                      className={permission.deleteByMe.key === '' && 'incompleted'}
                    />
                  </span>}
              </td>
              {/* <td height="10">
                {permission.share &&
                  <span className="checkbox_2">
                    <Checkbox
                      checked={aclByRole && aclByRole[permission.entity] &&
                        aclByRole[permission.entity][permission.share.key] ?
                        aclByRole[permission.entity][permission.share.key][0].permission === 'ALLOW' : false}
                      id="isDefault"
                      name="isDefault"
                      disabled={disabledPermissions &&
                        disabledPermissions[permission.entity] ?
                        disabledPermissions[permission.entity][permission.share.key] : false}
                      onChange={event => this.handleChange(event, {
                        displayName: permission.share.key,
                        model: permission.entity,
                        permission: event.target.checked ? 'ALLOW' : 'DENY'
                      })}
                      className={permission.share.key === '' && 'incompleted'}
                    />
                  </span>}
              </td> */}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  renderAdditionalEntities = entity => {
    const { aclByRole, disabledPermissions, role } = this.state;
    return (
      <Col xs={12} md={4} lg={3} className={styles.additionalEntities}>
        <div className={styles.title}>{entity.title}</div>
        {entity.options && entity.options.length > 0 && entity.options.map(option =>
          (
            <div className={styles.checkbox}>
              <label
                htmlFor={`${option.entity}-${option.key}`}
              >
                <span className="checkbox_2">
                  <Checkbox
                    checked={aclByRole && aclByRole[option.entity] && aclByRole[option.entity][option.key] ?
                      aclByRole[option.entity][option.key][0].permission === 'ALLOW' : false}
                    id={`${option.entity}-${option.key}`}
                    name="isDefault"
                    onChange={event => {
                      this.handleChange(event, {
                        displayName: option.key,
                        model: option.entity,
                        permission: event.target.checked ? 'ALLOW' : 'DENY'
                      });
                    }}
                    disabled={disabledPermissions &&
                      disabledPermissions[option.entity] ?
                      (disabledPermissions[option.entity][option.key] ||
                        role.name === Constants.admin) : false}
                    className={option.key === '' && 'incompleted'}
                  />
                </span>
                <span
                  className={styles.options}
                  style={{
                    cursor: disabledPermissions &&
                      disabledPermissions[option.entity] &&
                      (disabledPermissions[option.entity][option.key] ||
                        role.name === Constants.admin) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {option.name}
                </span>
              </label>
            </div>
          )
        )}
      </Col>
    );
  }

  render() {
    const { onBack, allRoles } = this.props;
    const { showAddPopup, isSnackbarEnabled, showEditPopup, role, disableSaveAndReset } = this.state;
    const fristRow = constants.additionalAclOptions.slice(0, 4);
    const secondRow = constants.additionalAclOptions.slice(4);
    return (
      <Scrollbars
        universal
        autoHide
        autoHeight
        autoHeightMin={'calc(100vh - 160px)'}
        autoHeightMax={'calc(100vh - 160px)'}
        renderThumbHorizontal={props => <div {...props} className="hide" />}
      >
        <div
          className={`${styles.container} ${aclStyles.roleManager}`}
        >
          <span className={styles.roleName}>
            <i className="fa fa-long-arrow-left" onClick={onBack} role="button" tabIndex={0} />
            {role.displayName} - Permissions
          </span>
          <span className={aclStyles.rolesContainer}>
            <button
              className={`button-primary ${aclStyles.expand_collapse_btn}`}
              onClick={this.addNewRole}
              style={{ float: 'right' }}
            >
              Clone
            </button>
            <button
              className={`button-primary ${aclStyles.expand_collapse_btn}`}
              onClick={this.editRole}
              style={{ float: 'right' }}
            >
              Edit
            </button>
            <div className={aclStyles.clone}>
              {showAddPopup &&
                <div className={aclStyles.addPopup}>
                  <div className={aclStyles.form} style={{ minHeight: '200px' }}>
                    <div className={aclStyles.arrow_up} />
                    <div className={aclStyles.title}>
                      Clone
                    </div>
                    <CreateRoleForm
                      onSubmit={data => this.handleSubmit(data)}
                      onCancel={this.onCancel}
                      roles={allRoles}
                    />
                  </div>
                </div>
              }
            </div>
            <div className={aclStyles.edit}>
              {showEditPopup &&
                <div className={aclStyles.addPopup}>
                  <div className={aclStyles.form} style={{ minHeight: '200px' }}>
                    <div className={aclStyles.arrow_up} />
                    <div className={aclStyles.title}>
                      Edit
                    </div>
                    <CreateRoleForm
                      onSubmit={data => this.handleEdit(data)}
                      onCancel={() => {
                        this.setState({
                          showEditPopup: false
                        });
                      }}
                      roles={allRoles}
                      isEdit
                    />
                  </div>
                </div>
              }
            </div>
          </span>
          <Row className="show-grid" style={{ marginTop: '30px' }}>
            <Col xs={12} md={12} className={styles.tableStyles}>
              {this.renderPermissions()}
            </Col>
          </Row>
          <Row className="show-grid">
            {fristRow.map(entity => this.renderAdditionalEntities(entity))}
          </Row>
          <Row className="show-grid">
            {secondRow.map(entity => this.renderAdditionalEntities(entity))}
          </Row>
        </div>
        {isSnackbarEnabled && <Snackbar
          discardChanges={this.resetSelectedPermissions}
          savePermissions={this.savePermissions}
          disableSaveAndReset={disableSaveAndReset}
        />}
      </Scrollbars>
    );
  }
}

const Snackbar = properties => {
  const { discardChanges, savePermissions, disableSaveAndReset } = properties;
  return (
    <div className={`${companyStyles.snackbar} is-animated`}>
      {
        i18n.t('warningMessage.YOU_HAVE_UNSAVED_CHANGES')
      }
      <div className={`${companyStyles.block} m-r-10`} style={{ marginLeft: '100px' }}>
        <button
          className={'btn btn-border button-primary p-lr-20'}
          style={{ fontWeight: '400' }}
          onClick={savePermissions}
          disabled={disableSaveAndReset}
        >
          Save
        </button>
      </div>
      <div className={`${companyStyles.block} m-r-10 m-t-10`}>
        <button
          className="button-secondary btn btn-border p-lr-20"
          style={{ fontWeight: '400' }}
          onClick={discardChanges}
          disabled={disableSaveAndReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
