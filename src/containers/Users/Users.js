import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isPristine } from 'redux-form';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
import moment from 'moment';
// import { Scrollbars } from 'react-custom-scrollbars';
import { Row, Col, Button, Label, OverlayTrigger, Tooltip } from 'react-bootstrap';
import lodash from 'lodash';
import { load, deactivateUser, activateUser, resendInvite } from 'redux/modules/users/users';
import { Trans } from 'react-i18next';
import { Tabs, Tab } from 'react-bootstrap/lib';
import { CustomTable } from '../../components';
import Constants from '../../helpers/Constants';
import {
  inviteUser as saveUser,
  openInviteUserModal,
  closeInviteUserModal,
  openUserProfileModal,
  closeUserProfileModal,
  loadUserRoles
} from '../../redux/modules/users/user';
import UserMenu from './UserMenu';
import UserForm from '../../components/UserForm/UserForm';
import UserActivity from '../../components/UserActivity/UserActivity';
import UserProfileModal from './UserProfileModal';
import { trimExtraSpaces } from '../../utils/validation';
import toastrErrorHandling from '../toastrErrorHandling';
import Permissible from '../../components/Permissible/Permissible';
import i18n from '../../i18n';
import Acl from '../Acl/Acl';
import NewPermissible from '../../components/Permissible/NewPermissible';
import { getRolesHeirarchy } from '../../redux/modules/Acl/Acl';

const styles = require('./Users.scss');

let timeoutId = 0;

@connect((state, route) => ({
  users: state.users.data,
  deactivationResponse: state.users.deactivationResponse,
  loading: state.users.loading,
  loginUser: state.auth.user,
  totalCount: state.users.totalCount || 0,
  inviting: state.user.inviting,
  isInviteUserPristine: isPristine('user')(state),
  inviteUserFormData: state.form.user,
  isUserProfilePristine: isPristine('userProfile')(state),
  userProfileFormData: state.form.userProfile,
  route: route.route,
  router: route.router,
}),
{
  load,
  saveUser,
  openInviteUserModal,
  closeInviteUserModal,
  openUserProfileModal,
  closeUserProfileModal,
  loadUserRoles,
  deactivateUser,
  activateUser,
  resendInvite,
  getRolesHeirarchy
})
export default class Users extends Component {
  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.object),
    load: PropTypes.func.isRequired,
    isInviteUserPristine: PropTypes.bool,
    inviteUserFormData: PropTypes.object,
    route: PropTypes.object.isRequired,
    isUserProfilePristine: PropTypes.bool,
    userProfileFormData: PropTypes.object,
    deactivationResponse: PropTypes.object,
    // openInviteUserModal: PropTypes.func.isRequired,
    closeInviteUserModal: PropTypes.func.isRequired,
    openUserProfileModal: PropTypes.func.isRequired,
    // closeUserProfileModal: PropTypes.func.isRequired,
    // loadUserRoles: PropTypes.func.isRequired,
    totalCount: PropTypes.any.isRequired,
    loginUser: PropTypes.object.isRequired,
    saveUser: PropTypes.func.isRequired,
    router: PropTypes.any.isRequired,
    deactivateUser: PropTypes.func.isRequired,
    activateUser: PropTypes.func.isRequired,
    resendInvite: PropTypes.func.isRequired,
    inviting: PropTypes.bool.isRequired,
    getRolesHeirarchy: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  static defaultProps = {
    users: null,
    isInviteUserPristine: null,
    inviteUserFormData: null,
    deactivationResponse: null,
    isUserProfilePristine: null,
    userProfileFormData: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      openUserModal: false,
      openUserProfileModal: false,
      selectedUser: null,
      userRoles: null,
      selectedRole: null,
      roleError: false,
      activePage: 1,
      isUserActive: false,
      sortKey: 'modifiedAt',
      sortOrder: 'DESC',
      searchTerm: '',
      showUserActivityModal: false,
      userActivityData: {},
      editMode: false,
      deactivationView: true,
      currentUser: {}
    };
  }

  componentWillMount() {
    const { sortKey, sortOrder, searchTerm } = this.state;
    this.props.load({ page: 1, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
    const isDeactivatedPermitted = NewPermissible.isPermitted({ operation: 'DEACTIVATE_USER', model: 'user' });
    const isActivatedPermitted = NewPermissible.isPermitted({ operation: 'ACTIVATE_USER', model: 'user' });
    const isReinvitePermitted = NewPermissible.isPermitted({ operation: 'REINVITE_USER', model: 'user' });
    this.setState({
      activeKey: 1,
      isDeactivatedPermitted,
      isActivatedPermitted,
      isReinvitePermitted
    });
  }


  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.inviteUserFormData && !this.props.isInviteUserPristine
      && this.state.openUserModal) {
        return <Trans>UNSAVED_CHANGES</Trans>;
      } else if (this.props.userProfileFormData && !this.props.isUserProfilePristine
        && this.state.openUserProfileModal) {
        return <Trans>UNSAVED_CHANGES</Trans>;
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.deactivationResponse && nextProps.deactivationResponse.data) {
      return {
        userActivityData: nextProps.deactivationResponse.data
      };
    }
  }

  onSortChange = (key, orderBy) => {
    const { searchTerm } = this.state;
    this.setState({ sortKey: key, sortOrder: orderBy, activePage: 1 }, () => {
      this.props.load({ page: 1, limit: Constants.RECORDS_PER_PAGE, orderBy: `${key} ${orderBy}`, searchTerm });
    });
  }

  getUserStatus = user => {
    if (user.isActive) {
      if (user.emailVerified) {
        return (
          <Permissible
            operation="Active_Inactive_users"
            restrictedComponent={
              <Button
                title={i18n.t('CLICK_TO_DEACTIVATE_USER')}
                bsStyle="primary"
                className={styles.active_button}
                onClick={() => this.handleUserStatus(user.id, user.isActive)}
              >
            Active
              </Button>
            }
            permittedComponent={
              <Label bsStyle="info" className={styles.invited_label}><Trans>ACTIVE</Trans></Label>
            }
          />
        );
      }
      return <Label bsStyle="info" className={styles.invited_label}> <Trans>INVITED</Trans> </Label>;
    }
    return (
      <Permissible
        operation="Active_Inactive_users"
        restrictedComponent={
          <Button
            title={i18n.t('CLICK_TO_ACTIVATE_USER')}
            bsStyle="warning"
            className={'p-l-r-10'}
            onClick={() => this.handleUserStatus(user.id, user.isActive)}
          >
            <Trans>INACTIVE</Trans>
          </Button>
        }
        permittedComponent={
          <Label bsStyle="info" className={styles.invited_label}> <Trans>INACTIVE</Trans></Label>
        }
      />
    );
  }

  handleUserStatus(user, isUserActive, isEmailVerified) {
    const { activePage, sortKey, sortOrder, searchTerm } = this.state;
    if (isUserActive && isEmailVerified) {
      this.props.deactivateUser(user.id, false).then(() => {
        if (!this.props.deactivationResponse) {
          return this.userDeactivation(user);
        }
        const body = document.body;
        body.classList.add('noscroll');
        this.setState({
          userActivityData: this.props.deactivationResponse
            && this.props.deactivationResponse.data ? this.props.deactivationResponse.data : null,
          showUserActivityModal: true,
          deactivationView: true,
          currentUser: user
        });
      });
      // toastr.confirm(`${i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DEACTIVATE_THIS_PROFILE')}`, {
      //   onOk: () => {
      //     // the method to add modal
      //     this.props.deactivateUser(user.id, false).then(() => {
      //       if (this.props.deactivationResponse) {
      //         const body = document.body;
      //         body.classList.add('noscroll');
      //         this.setState({
      //           userActivityData: this.props.deactivationResponse
      //             && this.props.deactivationResponse.data ? this.props.deactivationResponse.data : null,
      //           showUserActivityModal: true,
      //           deactivationView: true
      //         });
      //       } else {
      //         toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.USER_HAS_BEEN_DEACTIVATED_SUCCESSFULLY'));
      //         this.props.load({
      //           page: activePage, limit: Constants.RECORDS_PER_PAGE,
      //            orderBy: `${sortKey} ${sortOrder}`, searchTerm });
      //         this.setState({ isUserActive: !isUserActive });
      //       }
      //     }
      //     ).catch();
      //   },
      //   okText: i18n.t('YES'),
      //   cancelText: i18n.t('NO')
      // });
    } else if (!isUserActive && isEmailVerified) {
      toastr.confirm(`${i18n.t('confirmMessage.DO_YOU_WANT_TO_ACTIVATE_THIS_PROFILE')}`, {
        onOk: () => {
          this.props.activateUser(user.id).then(
            () => {
              toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.USER_HAS_BEEN_ACTIVATED_SUCCESSFULLY'));
              this.props.load({
                page: activePage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
            }
          ).catch();
          this.setState({ isUserActive: !isUserActive });
        },
        okText: i18n.t('YES'),
        cancelText: i18n.t('NO')
      });
    } else {
      toastr.confirm(`${i18n.t('confirmMessage.DO_YOU_WANT_TO_SEND_INVITATION_ONCE_AGAIN')}`, {
        onOk: () => {
          this.props.resendInvite({ email: user.email }).then(() => {
            toastr.success(i18n.t('RESEND_EMAIL'),
              i18n.t('successMessage.EMAIL_HAS_BEEN_RESENT_SUCCESSFULLY'));
          });
        },
        okText: i18n.t('YES'),
        cancelText: i18n.t('NO')
      }
      );
    }
  }

  handleSubmit(user) {
    const { selectedRole, sortKey, sortOrder, searchTerm } = this.state;
    user = trimExtraSpaces(user);
    user.roleIds = [];
    if (selectedRole) {
      lodash.forOwn(selectedRole, value => {
        if (value.id !== undefined) {
          user.roleIds.push(value.id);
        }
      });
      this.props.saveUser(user).then(() => {
        this.setState({
          roleError: false,
          selectedRole: null
        });
        toastr.success(i18n.t('successMessage.USER_INVITED'),
          i18n.t('successMessage.USER_HAS_BEEN_INVITED_SUCCESSFULLY'));
        const page = Math.ceil((this.props.totalCount + 1) / Constants.RECORDS_PER_PAGE);
        this.props.load({
          page, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm }).then(() => {
          this.setState({ activePage: page });
        });
        this.closeModal();
      }, error => {
        this.setState({
          roleError: false,
          selectedRole: null
        });
        toastrErrorHandling(error.error, i18n.t('errorMessage.USER_CREATION_FAILED'), error.error.message);
        this.closeModal();
      });
    } else {
      this.setState({
        roleError: true,
        selectedRole: null
      });
    }
  }

  openViewModal = () => {
    this.setState({ openUserModal: true });
  }

  openUserProfileModal = (user, editMode) => {
    this.props.openUserProfileModal();
    this.setState({ openUserProfileModal: true, editMode, selectedUser: user, showUserActivityModal: false });
  }

  closeModal = evt => {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.setState({ openUserModal: false, openUserProfileModal: false }, () => {
      this.props.closeInviteUserModal();
    });
  }

  selectRole = role => {
    this.setState({
      selectedRole: role
    });
  }

  selectPageNumber = (evt, scrollbar) => {
    const pageNo = evt.target.value;
    if (evt.keyCode === 69) {
      evt.preventDefault();
    }
    if (evt.keyCode === 13 && pageNo > 0) {
      if (scrollbar) {
        scrollbar.scrollToTop();
      }
      this.handlePagination('goto', Number(pageNo));
    }
  }

  handlePagination = (direction, pageNo) => {
    const maxPage = Math.ceil(this.props.totalCount / Constants.RECORDS_PER_PAGE);
    const { sortKey, sortOrder, searchTerm } = this.state;
    if (direction !== 'goto') {
      this.resetPageInput();
    }
    if (maxPage < pageNo) {
      const msgObj = { statusCode: 200 };
      toastrErrorHandling(msgObj, i18n.t('errorMessage.PAGINATION_ERROR'), i18n.t('errorMessage.NO_PAGE_FOUND'));
      return null;
    }
    let currentPage = this.state.activePage;
    if (direction === 'previous') {
      if (currentPage === 1) {
        return;
      }
      currentPage -= 1;
    } else if (direction === 'next') {
      if (currentPage === maxPage) {
        return;
      }
      currentPage += 1;
    } else if (direction === 'first') {
      if (currentPage === 1) {
        return;
      }
      currentPage = 1;
    } else if ((direction === 'last')) {
      if (currentPage === maxPage) {
        return;
      }
      currentPage = maxPage;
    } else {
      currentPage = pageNo;
    }
    // this.scrollbar.scrollTop(0);
    this.setState({
      activePage: currentPage
    }, () => {
      this.props.load({
        page: currentPage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
    });
  }

  handleSelect = key => {
    this.setState({
      activeKey: key
    });
    switch (key) {
      case 2:
        this.props.getRolesHeirarchy();
        break;
      default:
        break;
    }
  }

  handleSearchChange = evt => {
    this.resetPageInput();
    const searchTerm = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    const { sortKey, sortOrder } = this.state;
    this.setState({ searchTerm, activePage: 1 }, () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        this.props.load({
          page: 1, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
      }, 500);
    });
  }

  resetPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  formatUserName = user => (
    <span style={{ display: 'inline-flex' }}>
      <div className={styles.userImage}>
        {user && user.firstName && user.firstName.charAt(0).toUpperCase()}
        {user && user.lastName && user.lastName.charAt(0).toUpperCase()}
      </div>
      <span
        role="button"
        tabIndex="-1"
        onClick={() => this.openUserProfileModal(user, false)}
        style={{ color: '#1f9aff' }}
        title={`${user.firstName} ${user.lastName}`}
        className={`p-l-10 ${styles.elipsis} ${styles.userName}`}
      >
        {`${user.firstName} ${user.lastName}`}
      </span>
    </span>)


  formatUserRole = users => (
    <div className={styles.rolesContainer}>
      {users.roles.slice(0, 3).map(role =>
        this.renderSingleRole(role)
      )}
      {users.roles.length === 4 ? this.renderSingleRole(users.roles[3]) : this.renderMultipleRole(users)}
    </div>
  );

  formatUpdatedDate = user => (user.modifiedAt ? <span>{moment(user.modifiedAt).format('DD MMM YYYY')}</span> : '');

  resetSearchTerm = () => {
    this.resetPageInput();
    const { activePage, sortKey, sortOrder } = this.state;
    this.setState({ searchTerm: '' });
    this.props.load({
      page: activePage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm: '' });
  }

  validateActions = user => {
    const { loginUser } = this.props;
    const { isActivatedPermitted, isDeactivatedPermitted, isReinvitePermitted } = this.state;
    const deactive = isDeactivatedPermitted ?
      (<span>
        {user.isActive && user.emailVerified && user.email !== loginUser.email &&
          <a
            role="presentation"
            className={styles.actions}
            onClick={() => this.handleUserStatus(user, user.isActive, user.emailVerified)}
          ><Trans>DEACTIVATE</Trans></a>
        }
        {
          user.isActive && user.emailVerified && user.email === loginUser.email &&
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="tooltip">
                <strong>{i18n.t('tooltipMessage.ONLY_ANOTHER_ADMIN_CAN_DEACTIVATE_YOU')}</strong>
              </Tooltip>
            }
          >
            <p style={{ cursor: 'not-allowed', color: 'rgb(137, 137, 133)' }}>
              <Trans>DEACTIVATE</Trans>
            </p>
          </OverlayTrigger>
        }
      </span>) : null;

    const reInvite = isReinvitePermitted ? (
      <span>
        {user.isActive && !user.emailVerified &&
          <a
            role="presentation"
            className={styles.actions}
            onClick={() => this.handleUserStatus(user, user.isActive, user.emailVerified)}
          ><Trans>RESEND_INVITE</Trans></a>
        }
      </span>) : null;

    const active = isActivatedPermitted ? (
      <span>
        {!user.isActive && user.emailVerified &&
          <a
            role="presentation"
            className={styles.actions}
            onClick={() => this.handleUserStatus(user, user.isActive, user.emailVerified)}
          ><Trans>ACTIVATE</Trans></a>
        }
      </span>
    ) : null;
    return (active || deactive || reInvite) ? (
      <div>
        {active}
        {deactive}
        {reInvite}
      </div>) : null;
  }

  closeActivityModal = () => {
    this.setState({
      showUserActivityModal: false
    });
  }

  openUserActivityModal = data => {
    this.setState({
      userActivityData: data,
      showUserActivityModal: true,
      deactivationView: false
    });
  }

  userDeactivation = user => {
    const { activePage, sortKey, sortOrder, searchTerm } = this.state;
    toastr.confirm(`${i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DEACTIVATE_THIS_PROFILE')}`, {
      onOk: () => {
        if (user === null) {
          user = this.state.currentUser;
        }
        // the method to add modal
        this.props.deactivateUser(user.id, true).then(() => {
          if (this.props.deactivationResponse) {
            if (this.props.deactivationResponse.isActive === false) {
              toastr.success(i18n.t('SUCCESS'), i18n.t('successMessage.USER_HAS_BEEN_DEACTIVATED_SUCCESSFULLY'));
              this.props.load({
                page: activePage, limit: Constants.RECORDS_PER_PAGE, orderBy: `${sortKey} ${sortOrder}`, searchTerm });
              this.setState({ isUserActive: false, showUserActivityModal: false });
            } else {
              const body = document.body;
              body.classList.add('noscroll');
              this.setState({
                userActivityData: this.props.deactivationResponse
                  && this.props.deactivationResponse.data ? this.props.deactivationResponse.data : null,
                showUserActivityModal: true,
                deactivationView: true
              });
            }
          }
        }
        ).catch();
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  openUserActivityModal = data => {
    this.setState({
      userActivityData: data,
      showUserActivityModal: true,
      deactivationView: false
    });
  }


  closeActivityModal = () => {
    const body = document.body;
    body.classList.remove('noscroll');
    this.setState({
      showUserActivityModal: false
    });
  }

  renderSingleRole = role => (
    <OverlayTrigger
      rootClose
      overlay={this.renderTooltip(role, false)}
      placement="top"
      key={role.id}
    >
      <span className={styles.role}>
        {role.name ? role.name.charAt(0).toUpperCase() : ''}
      </span>
    </OverlayTrigger>
  )

  renderActions = user => {
    const actions = this.validateActions(user);
    if (actions) {
      return actions;
    }
    return null;
  }

  renderStatus = user => (
    <span>
      {user.isActive && user.emailVerified &&
      <span className={`${styles.status} ${styles.active}`}><Trans>ACTIVE</Trans></span>}
      {!user.isActive && user.emailVerified &&
      <span className={`${styles.status} ${styles.inactive}`}><Trans>INACTIVE</Trans></span>}
      {user.isActive && !user.emailVerified &&
      <span className={`${styles.status} ${styles.invited}`}><Trans>INVITED</Trans></span>}
    </span>
  )


  renderTooltip = (role, showAll, users) => {
    if (!showAll) {
      return (
        <Tooltip id={role.id}>
          <strong>
            {role ? role.name : ''}
          </strong>
        </Tooltip>
      );
    }
    return (
      <Tooltip id={users.id} className={`salesTooltip ${styles.customTooltip}`}>
        <div>
          <strong>{`${users.roles.length} Roles` }</strong>
        </div>
        {users.roles.map(position => (
          <div key={position.id} className={styles.tooltip}>
            {position.name ? position.name : ''}
          </div>
        ))
        }
      </Tooltip>
    );
  }


  renderSingleRole = role => (
    <OverlayTrigger
      rootClose
      overlay={this.renderTooltip(role, false)}
      placement="top"
      key={role.id}
    >
      <span className={styles.role}>
        {role.name ? role.name.charAt(0).toUpperCase() : ''}
      </span>
    </OverlayTrigger>
  )

  renderUsers = () => {
    const { users, totalCount } = this.props;
    const columnDef = [{ render: this.formatUserName },
      { key: 'username' },
      { key: 'email' },
      { render: this.formatUserRole },
      { key: 'isActive', render: this.renderStatus },
      { key: 'modifiedAt', render: this.formatUpdatedDate },
      { key: 'status', render: this.renderActions, isPermission: true }];
    const column = [{ title: 'NAME', key: 'firstName', isOrder: true },
      { title: 'USERNAME', key: 'userName', isOrder: true },
      { title: 'EMAIL', key: 'email', isOrder: true },
      { title: 'ROLES' },
      { title: 'STATUS' },
      { title: 'UPDATED_AT', isOrder: true, key: 'modifiedAt' },
      {
        title: 'ACTIONS',
        operation: [{ operation: 'ACTIVATE_USER', model: 'user' }, { operation: 'DEACTIVATE_USER', model: 'user' }],
        restrictedComponent: 'ACTIONS',
        isRestricted: true
      }
    ];
    return (
      <CustomTable
        isHover
        isResponsive
        columnDef={columnDef}
        data={users}
        sTitle={column}
        tableTitle="MANAGE_USERS"
        selectPageNumber={this.selectPageNumber}
        handlePagination={this.handlePagination}
        activePage={this.state.activePage}
        totalCount={totalCount}
        onSortChange={this.onSortChange}
        onSearchChange={this.handleSearchChange}
        inpValue={this.state.searchTerm}
        resetSearchTerm={this.resetSearchTerm}
        loading={this.props.loading}
        initialSortKey="modifiedAt"
        initialSortOrder="desc"
        placeholder={'SEARCH_NAME_OR_EMAIL'}
        isSearch
      />
    );
  }

  renderMultipleRole = users => {
    if (users.roles.length <= 3) {
      return '';
    }
    return (
      <OverlayTrigger
        rootClose
        overlay={this.renderTooltip(null, true, users)}
        placement="top"
      >
        <span className={styles.role}>+{users.roles.length - 3 }</span>
      </OverlayTrigger>
    );
  }

  render() {
    const { selectedUser, userRoles, roleError, activePage, searchTerm, editMode } = this.state;
    const { inviting, totalCount } = this.props;
    return (
      <div className="company_container">
        <Col lg={12} sm={12} xs={12} md={12} className={styles.users_container}>
          <Helmet title={i18n.t('USERS')} />
          <Col xs={12} lg={2} sm={2} md={2} className="p-0" >
            <Col sm={12} xs={12} lg={12} md={12} className={styles.sidenav} >
              <Col sm={12} className={`p-0 ${styles.users_card} shadow_one`}>
                <UserMenu />
              </Col>
            </Col>
          </Col>
          <Col sm={10} xs={12} lg={10} md={10} className={`${styles.users_table}`} >
            <Tabs
              id="users_tab"
              defaultActiveKey={1}
              onSelect={this.handleSelect}
              className={`${styles.tab_section} ${styles.user_fixed_tabs} shadow_one`}
            >
              <Tab eventKey={1} title={<Trans>USERS</Trans>}>
                {this.state.activeKey === 1 && <Col sm={12} className={`p-0 ${styles.users_card} shadow_one`} >
                  <div className={`${styles.page_header} show-grid col-md-12`}>
                    <div className={`${styles.page_title}`}>
                      <Trans>MANAGE_USERS</Trans>
                      <span className={`${styles.count}`}>
                        {` (${totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${totalCount > 1 ?
                          i18n.t('USERS') : i18n.t('USER')})`
                        }
                      </span>
                    </div>
                    <div className="right" style={{ display: 'inline-block' }}>
                      <NewPermissible operation={{ operation: 'INVITE_USER', model: 'user' }}>
                        <button
                          className={`button-primary ${styles.invite}`}
                          onClick={this.openViewModal}
                        >
                          <i className="fa fa-user-plus p-r-5" />
                          <Trans>INVITE_USER</Trans>
                        </button>
                      </NewPermissible>
                    </div>
                  </div>
                  <div className="show-grid">
                    <Col xs={12} md={12} className={`${styles.tableStyles}`}>
                      {this.renderUsers()}
                    </Col>
                  </div>
                </Col>}
              </Tab>
              <Tab eventKey={2} title={<Trans>ROLES</Trans>}>
                {this.state.activeKey === 2 && <Col sm={12} className={`p-0 ${styles.users_card} shadow_one`} >
                  <Acl />
                </Col>}
              </Tab>
            </Tabs>
          </Col>
          {this.state.openUserModal ?
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <Col xs={12} md={12}>
                <UserForm
                  selectRole={role => this.selectRole(role)}
                  roleError={roleError}
                  onSubmit={data => this.handleSubmit(data)}
                  closeModal={this.closeModal}
                  roles={userRoles}
                  inviting={inviting}
                />
              </Col>
            </Row> : null}
          {this.state.openUserProfileModal ?
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <Col xs={12} md={12}>
                <UserProfileModal
                  userDetails={selectedUser}
                  closeModal={this.closeModal}
                  activePage={activePage}
                  openUserActivityModal={this.openUserActivityModal}
                  searchTerm={searchTerm}
                  editMode={editMode}
                />
              </Col>
            </Row> : null}
          {this.state.showUserActivityModal ?
            <Row className="m-t-15 m-b-15 m-l-0 m-r-0">
              <Col xs={12} md={12}>
                <UserActivity
                  userDeactivation={user => this.userDeactivation(user)}
                  userRoleChange={user => this.openUserProfileModal(user, true)}
                  showUserActivityModal={this.state.showUserActivityModal}
                  closeModal={() => this.closeActivityModal()}
                  data={this.state.userActivityData}
                  isDeactivationView={this.state.deactivationView}
                />
              </Col>
            </Row> : null
          }
        </Col>
      </div>
    );
  }
}
