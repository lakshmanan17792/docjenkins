import React, { Component } from 'react';
import { connect } from 'react-redux';
import { load as loaduser } from 'redux/modules/users/users';
import { toastr } from 'react-redux-toastr';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues, propTypes, change } from 'redux-form';
import lodash from 'lodash';
import { Col, Row } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import styles from './userprofile.scss';
import ButtonGroup from '../../components/FormComponents/ButtonGroup';
import InputBox from '../../components/FormComponents/InputBox';
import CheckBox from '../../components/FormComponents/CheckBox';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import { getUserProfileFormConfig, userProfileValidation } from '../../formConfig/UserProfile';
import { updateUser, verifyUserName, loadUserRoles } from '../../redux/modules/users/user';
import { trimExtraSpaces } from '../../utils/validation';
import { load } from '../../redux/modules/auth/auth';
import Permissible from '../../components/Permissible/Permissible';
import Constants from '../../helpers/Constants';
import i18n from '../../i18n';
import { isPermitted } from '../../components/Permissible/NewPermissible';
import toastrErrorHandling from '../../containers/toastrErrorHandling';

@reduxForm({
  form: 'userProfile',
  validate: userProfileValidation,
})
@connect(
  (state, props) => ({
    user: state.auth.user,
    userRoles: state.user.userRoles,
    values: getFormValues(props.form)(state)
  }), {
    updateUser,
    loadUserRoles,
    verifyUserName,
    load,
    loaduser,
    change
  })
export default class UserPersonalProfile extends Component {
  static propTypes = {
    ...propTypes,
    handleSubmit: PropTypes.func.isRequired,
    values: PropTypes.object,
    initialize: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    verifyUserName: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    loaduser: PropTypes.func.isRequired,
    activePage: PropTypes.any.isRequired,
    userDetails: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    openUserActivityModal: PropTypes.func.isRequired,
    loadUserRoles: PropTypes.func.isRequired,
    searchTerm: PropTypes.string
  }

  static defaultProps = {
    user: null,
    isUserProfile: false,
    values: {},
    searchTerm: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      invalidUsername: false,
      isEditLoginUserRole: false,
      isUserActive: this.props.userDetails.isActive,
      isRoleOpen: false,
      showUserActivityModal: false,
      previousValue: this.props.userDetails
    };
  }

  componentWillMount() {
    const { userDetails, user } = this.props;
    const isEditUserAdmin = lodash.filter(userDetails.roles, ['name', 'Admin']).length === 1;
    if (user.email === userDetails.email && isEditUserAdmin) {
      // while edit ur own details restrict remove admin role, status of own
      this.setState({ isEditLoginUserRole: true });
    }
    this.props.initialize(
      {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        username: userDetails.username,
        email: userDetails.email,
        gender: userDetails.gender,
        contactNumber: userDetails.contactNumber,
        isActive: userDetails.isActive,
        roles: userDetails.roles
      }
    );
    const isEditPermitted = isPermitted({ operation: 'UPDATE_USER_DETAILS', model: 'user' });
    this.setState({ isEditPermitted });
    this.props.loadUserRoles();
  }

  componentWillReceiveProps(nextProps) {
    const { touched } = this.props;
    if (touched !== nextProps.dirty) {
      this.props.toggleTouched(nextProps.dirty);
    }
  }

  getUserEdit = () => {
    const { isEditPermitted } = this.state;
    const { userDetails, user } = this.props;
    if (isEditPermitted || userDetails.id === user.id) {
      return (
        <Row>
          <Col sm={12} className="text-right p-r-10 m-t-10">
            <button
              className={`${styles.edit_profile} btn-border button-primary m-r-20`}
              onClick={() => this.toggleEdit(false)}
            >
              <span><Trans>EDIT</Trans></span>
            </button>
          </Col>
        </Row>
      );
    }
    return null;
  }

  toggleEdit = isUpdate => {
    const { editMode } = this.props;
    if (!editMode) {
      this.setState({ isUserActive: this.props.userDetails.isActive });
      this.props.initialize({ ...this.props.userDetails });
    }
    this.props.toggleEdit(isUpdate);
  }

  updateUser = () => {
    const { userDetails, closeModal, activePage, toggleEdit, openUserActivityModal, searchTerm } = this.props;
    const deviceDetails = JSON.parse(localStorage.getItem('deviceDetails'));
    let values = this.props.values;
    values = trimExtraSpaces(values);
    values.roleIds = [];
    values.previousValues = this.state.previousValue;
    values.deviceDetails = deviceDetails;
    lodash.forOwn(values.roles, value => {
      if (value.id !== undefined) {
        values.roleIds.push(value.id);
      }
    });
    this.props.updateUser(userDetails.id, values).then(res => {
      if (res.toShowError) {
        openUserActivityModal(res && res.data ? res.data : null);
      } else {
        this.props.load().then(() => {
          toggleEdit(true);
          if (closeModal) {
            closeModal();
            this.props.loaduser({
              page: activePage, limit: Constants.RECORDS_PER_PAGE, searchTerm, orderBy: 'modifiedAt DESC' });
          }
          toastr.success(i18n.t('SUCCESS'),
            i18n.t('successMessage.PROFILE_UPDATED_SUCCESSFULLY'));
        });
      }
    }).catch(err => {
      toastrErrorHandling(err.error, i18n.t('ERROR'), i18n.t('errorMessage.COULD_NOT_UPDATE_YOUR_PROFILE_DETAILS'));
    });
  }


  saveUser = () => {
    const { userDetails } = this.props;
    let values = this.props.values;
    const deviceDetails = JSON.parse(localStorage.getItem('deviceDetails'));
    values = trimExtraSpaces(values);
    values.deviceDetails = deviceDetails;
    if (userDetails.username !== values.username) {
      this.props.verifyUserName(values.username).then(result => {
        if (result.validUsername) {
          this.updateUser();
        } else {
          toastrErrorHandling({}, i18n.t('ERROR'), i18n.t('errorMessage.USERNAME_ALREADY_EXISTS_ERROR'));
          this.setState({
            invalidUsername: true
          });
        }
      });
    } else {
      this.updateUser();
    }
  }
  handleCheckSubmit = event => {
    this.setState({ isUserActive: event.target.checked });
  }

  selectRole = role => {
    this.setState({
      selectedRole: role
    });
  }

  roleSelect = value => {
    this.selectRole(value);
  }

  handleRoleChange = value => {
    if (value) {
      this.setState({
        isRoleOpen: true
      });
    } else {
      this.setState({
        isRoleOpen: false
      });
    }
  }

  handleOnRoleSelect = value => {
    if (value) {
      this.setState({
        isRoleOpen: !this.state.isRoleOpen
      });
    }
  }

  checkAdminRole = values => {
    if (values.length > 0 && lodash.filter(values, ['name', 'Admin']).length !== 1) {
      return <Trans>ADMIN_ROLE_CAN_BE_REMOVED_ONLY_BY_ANOTHER_ADMIN</Trans>;
    }
  }


  render() {
    const { userDetails, handleSubmit, editMode, isUserProfile } = this.props;
    const { invalidUsername, isUserActive, isEditLoginUserRole } = this.state;
    const userprofileFormConfig = getUserProfileFormConfig(this);
    return (
      <Col sm={12} className={`${styles.personal_profile} p-0`}>
        {!editMode ?
          this.getUserEdit() : null
        }
        <Col sm={4} className={`${styles.profile_image} p-0`}>
          <Col sm={10} className="p-10">
            <img src="/avatar-m.png" className="img-responsive" alt="User" />
          </Col>
        </Col>
        <Col sm={8} className={`${styles.profile_details}`}>
          <form onSubmit={handleSubmit(this.saveUser)}>
            <Row>
              <Col sm={6}>
                <div className={`${styles.profile_data}`}>
                  <label htmlFor="firstName">
                    <Trans>FIRST_NAME</Trans>&nbsp;
                    {editMode ? <span className="red">*</span> : null}
                  </label>
                  {!editMode ?
                    <div className={styles.user_data}>{userDetails.firstName}</div>
                    :
                    <InputBox {...userprofileFormConfig.fields[0]} />
                  }
                </div>
                <div className={`${styles.profile_data}`}>
                  <label htmlFor="lastName">
                    <Trans>LAST_NAME</Trans>&nbsp;
                    {editMode ? <span className="red">*</span> : null}
                  </label>
                  {!editMode ?
                    <div className={styles.user_data}>
                      {userDetails.lastName ? userDetails.lastName : <Trans>NOT_AVAILABLE</Trans>}
                    </div>
                    :
                    <InputBox {...userprofileFormConfig.fields[1]} />
                  }
                </div>
                <div className={`${styles.profile_data}`}>
                  <label htmlFor="gender">
                    <Trans>GENDER</Trans>
                  </label>
                  {!editMode ?
                    <div
                      className={styles.user_data}
                    >
                      {userDetails.gender ? userDetails.gender : <Trans>NOT_AVAILABLE</Trans>}
                    </div>
                    :
                    <ButtonGroup {...userprofileFormConfig.fields[2]} />
                  }
                </div>
                <Permissible operation="Active_Inactive_users">
                  {editMode && userDetails.emailVerified &&
                    <div className={`${styles.profile_data}`}>
                      <div className={`${styles.profile_status}`}>
                        <label htmlFor="status">
                          <Trans>STATUS</Trans>
                        </label>
                        <CheckBox
                          onChange={this.handleCheckSubmit}
                          className={`${styles.status_checkbox} p-l-15`}
                          isChecked={isUserActive}
                          disabled={isEditLoginUserRole}
                          title={isEditLoginUserRole ? i18n.t('tooltipMessage.ONLY_ANOTHER_ADMIN_CAN_DEACTIVATE_YOU')
                            : ''}
                          {...userprofileFormConfig.fields[6]}
                        />
                      </div>
                    </div>
                  }
                </Permissible>
              </Col>
              <Col sm={6}>
                <div className={`${styles.profile_data}`}>
                  <label htmlFor="email">
                    <Trans>USERNAME</Trans>&nbsp;
                    {editMode ? <span className="red">*</span> : null}
                  </label>
                  {!editMode ?
                    <div className={styles.user_data}>
                      {userDetails.username ? userDetails.username : <Trans>NOT_AVAILABLE</Trans>}
                    </div>
                    :
                    <InputBox {...userprofileFormConfig.fields[3]} />
                  }
                  {invalidUsername ?
                    <p className="red"> <Trans>USERNAME_ALREADY_EXISTS</Trans>  </p>
                    : null
                  }
                </div>
                <div className={`${styles.profile_data}`}>
                  <label htmlFor="email">
                    <Trans>EMAIL</Trans>&nbsp;
                    {editMode ? <span className="red">*</span> : null}
                  </label>
                  {!editMode ?
                    <div className={styles.user_data}>{userDetails.email ? userDetails.email
                      : <Trans>NOT_AVAILABLE</Trans>}
                    </div>
                    :
                    <InputBox {...userprofileFormConfig.fields[4]} />
                  }
                </div>
                <div className={`${styles.profile_data}`}>
                  <label htmlFor="email">
                    <Trans>CONTACT_NUMBER</Trans>
                  </label>
                  {!editMode ?
                    <div className={styles.user_data}>
                      {userDetails.contactNumber ?
                        userDetails.contactNumber : <Trans>NOT_AVAILABLE</Trans>
                      }
                    </div>
                    :
                    <InputBox {...userprofileFormConfig.fields[5]} />
                  }
                </div>
              </Col>
              <Col sm={12}>
                {editMode ?
                  <div className={`${styles.profile_data}`}>
                    <MultiselectField
                      {...userprofileFormConfig.fields[7]}
                      onChange={value => this.roleSelect(value)}
                      customValidation={isEditLoginUserRole ? this.checkAdminRole : null}
                      readOnly={isUserProfile}
                      disabled={isUserProfile}
                    />
                  </div> : null
                }
              </Col>
            </Row>
            {editMode ?
              <Row>
                <Col lg={3} md={3} sm={5} className="right p-0 p-t-25 p-r-15">
                  <button
                    className="btn btn-border"
                    onClick={evt => { evt.preventDefault(); this.toggleEdit(false); }}
                  >
                    <span className={styles.action_labels}><Trans>CANCEL</Trans></span>
                  </button>
                </Col>
                <Col lg={3} md={3} sm={5} className="right p-0 p-t-25 p-r-15">
                  <button
                    className="btn btn-border orange-btn"
                    type="submit"
                  >
                    <span className={styles.action_labels}><Trans>SAVE</Trans></span>
                  </button>
                </Col>
              </Row> : null
            }
          </form>
        </Col>
      </Col>
    );
  }
}
