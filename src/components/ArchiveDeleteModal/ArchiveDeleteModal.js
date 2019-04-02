import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Col, Row, Image } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { DropdownField, TextArea, DatePicker } from 'components';
import { getArchivalDeleteFormConfig, formValidation } from '../../formConfig/ArchivalDelete';
import styles from './ArchiveDeleteModal.scss';
import i18n from '../../i18n';

const components = {
  archiveForm: [DropdownField, DatePicker, DatePicker, TextArea],
  deleteForm: [DropdownField, TextArea]
};
@reduxForm({
  form: 'ArchiveDeleteDetails',
  touchOnChange: true,
  validate: formValidation
})
export default class ArchiveDeleteModal extends Component {
  static propTypes = {
    isArchiveModal: PropTypes.bool,
    archivalReasons: PropTypes.array,
    deleteReasons: PropTypes.array,
    handleSubmit: PropTypes.func,
    handleArchiveOrDeleteSubmit: PropTypes.func.isRequired,
    isOpenModal: PropTypes.bool,
    toggleArchiveDeleteModal: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    invalid: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    initialValues: PropTypes.object,
    archiveModalSubmitted: PropTypes.bool.isRequired,
    btnText: PropTypes.string.isRequired,
    archivingOrDeleting: PropTypes.bool.isRequired,
    btnTextSuffix: PropTypes.string.isRequired
  }
  static defaultProps = {
    isArchiveModal: true,
    archivalReasons: [],
    deleteReasons: [],
    isOpenModal: false,
    handleSubmit: null,
    initialValues: {}
  }
  constructor(props) {
    super(props);
    this.state = {
      isActive: false
    };
  }

  closeModal = () => {
    this.props.toggleArchiveDeleteModal();
  }

  renderBtnText = () => {
    const { btnText, isArchiveModal, btnTextSuffix } = this.props;
    if (btnText === i18n.t('ARCHIVE') && isArchiveModal) {
      return i18n.t(`placeholder.ARCHIVE_${btnTextSuffix}`);
    } else if (!isArchiveModal) {
      return i18n.t(`DELETE_${btnTextSuffix}`);
    }
    return i18n.t('UPDATE_ARCHIVAL_SCHEDULED');
  }

  render() {
    const filterConfig = getArchivalDeleteFormConfig(this);
    const { handleSubmit, handleArchiveOrDeleteSubmit, isOpenModal, isArchiveModal,
      pristine, submitting, invalid, archiveModalSubmitted, archivingOrDeleting, btnTextSuffix } = this.props;
    return (
      <Modal
        show={isOpenModal}
        onHide={this.closeModal}
        className={`${styles.archival_delete_modal} archive-modal-container`}
      >
        <form onSubmit={handleSubmit(handleArchiveOrDeleteSubmit)}>
          <Modal.Header>
            <Modal.Title>
              <Row style={{ textAlign: 'center' }}>
                {isArchiveModal ?
                  <span className={styles.modal_title}>{ i18n.t(`placeholder.ARCHIVE_${btnTextSuffix}`) }</span> :
                  <span className={styles.modal_title}>{ i18n.t('DELETE_CANDIDATE') }</span>
                }
                <div className={styles.close_header_btn}>
                  <Image
                    onClick={this.closeModal}
                    role="button"
                    tabIndex="0"
                    src="/modal-close.svg"
                    responsive
                  />
                </div>
              </Row>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              isArchiveModal ?
                components.archiveForm.map((FieldComponent, index) => (
                  <div className="p-b-15">
                    <FieldComponent {...filterConfig.archiveForm[index]} />
                  </div>
                ))
                :
                components.deleteForm.map((FieldComponent, index) => (
                  <div className="p-b-15">
                    <FieldComponent {...filterConfig.deleteForm[index]} />
                  </div>
                ))
            }
            {/* <div className="p-b-15">
              <DropdownField {...filterConfig.reason} />
            </div>
            <div className="p-b-15">
              <DatePicker {...filterConfig.archivalDate} />
            </div>
            <div className="p-b-15">
              <DatePicker {...filterConfig.notificationDate} />
            </div>
            <div className="p-b-15">
              <TextArea {...filterConfig.description} />
            </div> */}
          </Modal.Body>
          <Modal.Footer>
            <Col lg={12} md={12} sm={12} xs={12}>
              <button
                type="submit"
                className={`${styles.modal_btns} button-error right`}
                disabled={submitting || pristine || archiveModalSubmitted || invalid || archivingOrDeleting}
              > <span>{ this.renderBtnText() }</span>
              </button>
              <button
                type="button"
                onMouseDown={evt => { evt.preventDefault(); this.closeModal(); }}
                className={`button-secondary-hover ${styles.cancel_btn} ${styles.modal_btns}`}
              > <span>{ i18n.t('CANCEL') }</span>
              </button>
            </Col>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
