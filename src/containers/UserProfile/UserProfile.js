import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Tab, Tabs } from 'react-bootstrap';
import { toastr } from 'react-redux-toastr';
import Helmet from 'react-helmet';
import { isPristine } from 'redux-form';
import PropTypes from 'prop-types';
import styles from './userprofile.scss';
import ChangePassword from './ChangePassword';
import UserPersonalProfile from './UserPersonalProfile';
import i18n from '../../i18n';

@connect(
  (state, route) => ({
    user: state.auth.user,
    isUserProfilePristine: isPristine('userProfile')(state),
    isChangePasswordPristine: isPristine('changepassword')(state),
    userProfileFormData: state.form.userProfile,
    changePasswordFormData: state.form.changepassword,
    route: route.route,
    router: route.router,
  }), {
  })
export default class UserProfile extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    isUserProfilePristine: PropTypes.bool,
    isChangePasswordPristine: PropTypes.bool,
    userProfileFormData: PropTypes.object,
    changePasswordFormData: PropTypes.object,
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
  };

  static defaultProps = {
    isUserProfilePristine: null,
    userProfileFormData: null,
    isChangePasswordPristine: null,
    changePasswordFormData: null
  }

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      touched: false,
      passwordCheck: 1
    };
  }

  componentWillMount() {
    if (localStorage.getItem('passwordCheck')) {
      this.setState({
        passwordCheck: 2
      });
    }
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.props.userProfileFormData && Object.keys(this.props.userProfileFormData).length > 0
          && !this.props.isUserProfilePristine && this.state.editMode) {
        return (i18n.t('confirmMessage.UNSAVED_CHANGES'));
      } else if (this.props.changePasswordFormData && Object.keys(this.props.changePasswordFormData).length > 0
          && !this.props.isChangePasswordPristine) {
        return (i18n.t('confirmMessage.UNSAVED_CHANGES'));
      }
    });
  }

  toggleTouched = touched => {
    this.setState({
      touched
    });
  }

  toggleEdit = isUpdate => {
    if (this.state.editMode && this.state.touched && !isUpdate) {
      const toastrConfirmOptions = {
        onOk: () => {
          this.setState(previousState => ({
            editMode: !previousState.editMode
          }));
        },
        okText: i18n.t('YES'),
        cancelText: i18n.t('NO')
      };
      toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
    } else {
      this.setState(previousState => ({
        editMode: !previousState.editMode
      }));
    }
  }

  render() {
    const { user } = this.props;
    const { touched, editMode, passwordCheck } = this.state;
    return (
      <Col sm={12} className={`${styles.user_profile_container} company_container`}>
        <Helmet title={i18n.t('USER_PROFILE')} />
        <div className={`${styles.user_middle_content}`}>
          <Col sm={12} className={`${styles.user_profile_content} shadow-one`}>
            <Tabs defaultActiveKey={passwordCheck} className={`${styles.tab_section} shadow_one`}>
              <Tab eventKey={1} title={i18n.t('PERSONAL')}>
                <UserPersonalProfile
                  editMode={editMode}
                  userDetails={user}
                  toggleEdit={this.toggleEdit}
                  touched={touched}
                  toggleTouched={this.toggleTouched}
                  isUserProfile
                />
              </Tab>
              <Tab eventKey={2} title={i18n.t('CHANGE_PASSWORD')}>
                <ChangePassword initialValues={{
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                }}
                />
              </Tab>
            </Tabs>
          </Col>
        </div>
      </Col>
    );
  }
}
