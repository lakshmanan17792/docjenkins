import React, { Component } from 'react';
import { fieldPropTypes } from 'redux-form';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { toastr } from 'react-redux-toastr';
import AclTree from './Tree';
import RoleManager from '../../components/RoleManager/RoleManager';
import CreateRoleForm from '../../components/AclForm/CreateRoleForm';
import { getRolesHeirarchy, createRole, loadRolePermissions, loadAclByRoles } from '../../redux/modules/Acl/Acl';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { loadUserRoles } from '../../redux/modules/users/user';

const styles = require('./Acl.scss');

export const Input = ({
  input, label, readOnly, type, isRequired, isInfo, infoText, meta: { touched, error },
  placeholder
}) => (
  <div className={styles.m_t_b_10}>
    <label htmlFor={input.name}>
      {label}
      {isRequired ? <span className="required_color">*</span> : ''}
      {isInfo ?
        <span className="p-l-10 cursor-pointer">
          <i className="fa fa-info-circle" title={infoText} />
        </span> : ''
      }
    </label>
    <div>
      <input
        readOnly={readOnly}
        {...input}
        type={type}
        id={input.name}
        placeholder={placeholder}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

const renderSelectInput = ({
  valueKey,
  labelKey,
  handleOnChange,
  handleOnInputChange,
  data,
  fields,
  label,
  required,
  placeholder,
  selectedOption,
  meta:
  {
    touched,
    error
  },
}) => (
  <div className={styles.m_t_b_10}>
    <label htmlFor={name}>
      {label}
      {required ? <span className="required_color">*</span> : ''}
    </label>
    <div>
      <Select
        name={name}
        valueKey={valueKey}
        labelKey={labelKey}
        openOnClick={false}
        onChange={val => handleOnChange(val, fields)}
        onInputChange={handleOnInputChange}
        options={data}
        placeholder={placeholder}
        value={selectedOption}
      />
    </div>
    {error && touched && <div className="text-danger">{error}</div>}
  </div>
);

renderSelectInput.propTypes = {
  valueKey: PropTypes.any.isRequired,
  labelKey: PropTypes.any.isRequired,
  handleOnChange: PropTypes.func,
  handleOnInputChange: PropTypes.func,
  data: PropTypes.any,
  fields: PropTypes.any,
  label: PropTypes.any,
  required: PropTypes.any,
  placeholder: PropTypes.string,
  selectedOption: PropTypes.any,
  meta: PropTypes.any
};

renderSelectInput.defaultProps = {
  handleOnInputChange: () => { },
  handleOnChange: () => { },
  data: null,
  label: '',
  required: false,
  placeholder: '',
  selectedOption: '',
  meta: {},
  fields: ''
};

Input.propTypes = {
  ...fieldPropTypes
};

@connect(state => ({
  rolesHeirarchy: state.acl.rolesHeirarchy,
  aclByRole: state.acl.aclByRole,
  allRoles: state.user.userRoles
}),
{ getRolesHeirarchy, createRole, loadRolePermissions, loadAclByRoles, loadUserRoles })
export default class Acl extends Component {
  static propTypes = {
    rolesHeirarchy: PropTypes.array,
    getRolesHeirarchy: PropTypes.func.isRequired,
    createRole: PropTypes.func.isRequired,
    loadRolePermissions: PropTypes.func.isRequired,
    loadAclByRoles: PropTypes.func.isRequired,
    allRoles: PropTypes.array.isRequired,
    loadUserRoles: PropTypes.func.isRequired
  };

  static defaultProps = {
    rolesHeirarchy: [],
    aclByRole: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      showAddPopup: false,
      isRoleManagerEnabled: false,
      expandAll: true,
      selectedReportingRole: {}
    };
  }

  componentWillMount() {
    this.props.loadUserRoles();
  }

  onNodeSelect = (selectedKeys, info) => {
    const role = info.node.props.dataRef;
    this.props.loadAclByRoles({ roles: [role.name] }).then(() => {
      this.setState({
        isRoleManagerEnabled: true,
        selectedRole: role
      });
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
      showAddPopup: !showAddPopup
    });
  }

  handleSubmit = data => {
    const role = {
      isCloned: false,
      name: data.name,
      displayName: data.name,
      reportTo: data.reporter.id
    };
    if (data.reporter.name === 'Recruiter' || data.reporter.name === 'Sales Head') {
      role.parentName = data.reporter.name;
    }
    this.props.createRole(role).then(() => {
      toastr.success('Role Created Successfully.');
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

  toggleExpandAll = () => {
    this.setState({
      expandAll: !this.state.expandAll
    });
  }

  toggleCollapseAll = () => {
    this.setState({
      collapseAll: !this.state.collapseAll
    });
  }

  render() {
    const { showAddPopup, isRoleManagerEnabled, expandAll, collapseAll, selectedRole } = this.state;
    const { rolesHeirarchy, allRoles } = this.props;
    return (
      <div>
        {isRoleManagerEnabled
          ? <RoleManager
            role={selectedRole}
            onBack={() => {
              this.setState({
                isRoleManagerEnabled: false
              });
              this.toggleExpandAll();
            }}
          />
          : <div className={styles.rolesContainer}>
            <button
              className={`button-secondary ${styles.white_expand_collapse_btn}`}
              onClick={this.toggleExpandAll}
            >
              Expand All
            </button>
            <button
              className={`button-secondary ${styles.white_expand_collapse_btn}`}
              onClick={this.toggleCollapseAll}
            >
              Collapse All
            </button>
            <button
              className={`button-primary ${styles.expand_collapse_btn}`}
              onClick={this.addNewRole}
            >
              Add New Role
            </button>
            {showAddPopup &&
              <div className={styles.addPopup}>
                <div className={styles.form}>
                  <div className={styles.arrow_up} />
                  <div className={styles.title}>
                    Add a New Role
                  </div>
                  <CreateRoleForm
                    onSubmit={data => this.handleSubmit(data)}
                    onCancel={this.onCancel}
                    roles={allRoles}
                  />
                </div>
              </div>
            }
            <Scrollbars
              universal
              autoHide
              autoHeight
              autoHeightMin={'calc(100vh - 160px)'}
              autoHeightMax={'calc(100vh - 160px)'}
              renderThumbHorizontal={props => <div {...props} className="hide" />}
            >
              <div className={styles.tree}>
                <AclTree
                  onSelect={this.onNodeSelect}
                  expandAll={expandAll}
                  collapseAll={collapseAll}
                  toggleCollapseAll={this.toggleCollapseAll}
                  toggleExpandAll={this.toggleExpandAll}
                  treeData={rolesHeirarchy}
                />
              </div>
            </Scrollbars>
          </div>}
      </div>
    );
  }
}
