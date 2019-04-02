import React, { Component } from 'react';
import { Modal, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import { toastr } from 'react-redux-toastr';
import PropTypes from 'prop-types';
import { push as pushState } from 'react-router-redux';
import { Trans } from 'react-i18next';
import UserPersonalProfile from './../UserProfile/UserPersonalProfile';
import styles from './Users.scss';
import i18n from '../../i18n';

@connect(state => ({
  openUserProfileModal: state.user.openUserProfileModal
}), {
  pushState,
  reset
})
class UserProfileModal extends Component {
  static propTypes = {
    openUserProfileModal: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    activePage: PropTypes.any.isRequired,
    userDetails: PropTypes.object.isRequired,
    reset: PropTypes.func.isRequired,
    openUserActivityModal: PropTypes.func.isRequired,
    searchTerm: PropTypes.func.isRequired,
    editMode: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      editMode: false,
      touched: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      editMode: nextProps.editMode
    });
  }

  toggleTouched = touched => {
    this.setState({
      touched
    });
  }

  closeModal = evt => {
    if (evt) {
      evt.stopPropagation();
    }
    if (this.state.editMode && this.state.touched) {
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

  toggleEdit = isUpdate => {
    if (this.state.editMode && this.state.touched && !isUpdate) {
      const toastrConfirmOptions = {
        onOk: () => {
          this.setState(previousState => ({
            editMode: !previousState.editMode
          }), () => this.props.reset('userProfile'));
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

  openUserActivityModal = data => {
    const body = document.body;
    body.classList.add('noscroll');
    this.state.editMode = true;
    // this.closeModal();
    this.props.openUserActivityModal(data);
  }

  render() {
    const { userDetails, activePage, searchTerm } = this.props;
    const { editMode, touched } = this.state;
    return (
      <Modal
        show={this.props.openUserProfileModal}
        onHide={this.closeModal}
      >
        <Modal.Header className={styles.modal_header}>
          <Col sm={12} lg={12} className="p-0">
            <Col sm={4} lg={4} className="p-t-10">
              <Modal.Title className={`${styles.modal_title_left}`}>
                <Trans>USER_PROFILE</Trans>
              </Modal.Title>
            </Col>
            <Col sm={8} lg={8} className="p-0">
              <Col sm={4} lg={4} className="p-0 m-r-5 right">
                <span
                  className="right"
                  onClick={this.closeModal}
                  role="button"
                  tabIndex="0"
                >
                  <i className="fa fa-close" />
                </span>
              </Col>
            </Col>
          </Col>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={12} lg={12} className="p-0">
              <UserPersonalProfile
                activePage={activePage}
                userDetails={userDetails}
                closeModal={this.closeModal}
                openUserActivityModal={this.openUserActivityModal}
                editMode={editMode}
                toggleEdit={this.toggleEdit}
                touched={touched}
                toggleTouched={this.toggleTouched}
                searchTerm={searchTerm}
              />
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    );
  }
}
export default UserProfileModal;
