import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues } from 'redux-form';
import { Modal, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { openInviteUserModal, closeInviteUserModal, loadUserRoles } from 'redux/modules/users/user';
import userValidation from './userValidation';
import InputBox from '../FormComponents/InputBox';
import MultiselectField from '../FormComponents/MultiSelect';
import { getRegisterFormConfig } from '../../formConfig/Register';
import i18n from '../../i18n';

@reduxForm({
  form: 'user',
  validate: userValidation,
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  userRoles: state.user.userRoles,
  active: state.form.user.active
}), ({ openInviteUserModal, closeInviteUserModal, loadUserRoles }))
export default class UserForm extends Component {
  static propTypes = {
    inviting: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    roleError: PropTypes.bool,
    roles: PropTypes.object,
    reset: PropTypes.func.isRequired,
    openInviteUserModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    values: PropTypes.object,
    selectRole: PropTypes.func.isRequired,
    loadUserRoles: PropTypes.func
  };

  static defaultProps = {
    active: null,
    disabled: false,
    roles: null,
    roleError: false,
    loadUserRoles: null,
    values: null
  };

  constructor(props) {
    super(props);
    this.state = {
      userRoles: null,
      isRoleOpen: false,
    };
  }

  componentWillMount() {
    this.props.loadUserRoles();
  }

  componentWillReceiveProps() {
    const { roleError } = this.props;
    this.setState({
      roleError
    });
  }

  closeModal = evt => {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (this.props.values) {
        const toastrConfirmOptions = {
          onOk: () => this.props.closeModal(),
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
      } else {
        this.props.closeModal();
      }
    }
  }

  roleSelect = value => {
    this.props.selectRole(value);
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
  render() {
    const { handleSubmit, inviting } = this.props;
    const styles = require('./UserForm.scss');
    const filterConfig = getRegisterFormConfig(this);
    return (
      <div>
        <Modal
          show={this.props.openInviteUserModal}
          onHide={this.closeModal}
          style={{ display: 'block' }}
        >
          <form className="form-horizontal" onSubmit={handleSubmit}>
            <Modal.Header className={styles.modal_header}>
              <Col sm={12} className="right p-0">
                <Col sm={10} className="p-0">
                  <Modal.Title className={styles.modal_title}>
                    {i18n.t('INVITE_USER')}
                  </Modal.Title>
                </Col>
                <Col sm={2} className="p-0">
                  <span
                    role="button"
                    tabIndex="-1"
                    className="right"
                    onClick={this.closeModal}
                  >
                    <i className="fa fa-close" />
                  </span>
                </Col>
              </Col>
            </Modal.Header>
            <Modal.Body>
              <div className="p-b-15">
                <InputBox {...filterConfig.firstname} />
              </div>
              <div className="p-b-15">
                <InputBox {...filterConfig.lastname} />
              </div>
              <div className="p-b-15">
                <InputBox {...filterConfig.email} />
              </div>
              <div className="p-b-15">
                <MultiselectField
                  {...filterConfig.role}
                  onChange={value => this.roleSelect(value)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Col lg={6} sm={12} className="p-5 right">
                <button
                  className={`${styles.invite_btn} button-primary right`}
                  type="submit"
                  onSubmit={handleSubmit}
                  disabled={inviting}
                >
                  <span>
                    { inviting ?
                      <i className="fa fa-spinner fa-spin p-l-r-7" aria-hidden="true" /> :
                      <i className="fa fa-paper-plane" />
                    }
                    {i18n.t('SEND_INVITE')}</span>
                </button>
              </Col>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}
