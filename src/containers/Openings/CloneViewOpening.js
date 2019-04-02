import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { saveNewOpening } from '../../redux/modules/openings';
import styles from './Openings.scss';
import toastrErrorHandling from '../toastrErrorHandling';
import { formatTitle } from '../../utils/validation';
import i18n from '../../i18n';

@connect(() => ({}), {
  saveNewOpening
})
export default class CloneViewOpening extends Component {
  static propTypes = {
    opening: PropTypes.shape({
      jobTitle: PropTypes.string.isRequired
    }).isRequired,
    saveNewOpening: PropTypes.func.isRequired,
    closeCloneViewModal: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      jobTitle: '',
      isCloned: false
    };
  }
  componentWillMount() {
    const valueStr = this.props.opening.jobTitle.split(' (m/w/x)');
    this.setState({
      jobTitle: `${valueStr[0]} - Clone`
    });
  }

  setJobTitle = event => {
    const jobTitle = formatTitle(event.target.value);
    this.setState({
      jobTitle
    });
  }

  handleKeyPress = event => {
    if (event.key === 'Enter') {
      this.cloneOpening();
    }
  }

  closeModal = () => {
    this.setState({
      showModal: false
    });
    this.props.closeCloneViewModal(this.state.isCloned);
  }

  cloneOpening = () => {
    const cloneOpening = Object.assign({}, this.props.opening);
    delete cloneOpening.id;
    delete cloneOpening.createdAt;
    delete cloneOpening.createdBy;
    delete cloneOpening.modifiedAt;
    delete cloneOpening.modifiedBy;
    delete cloneOpening.isAssigned;
    if (cloneOpening.recruiters) delete cloneOpening.recruiters;
    if (cloneOpening.sales) delete cloneOpening.sales;
    if (cloneOpening.jobOpeningDetails) {
      delete cloneOpening.jobOpeningDetails.id;
      delete cloneOpening.jobOpeningDetails.jobOpeningId;
      delete cloneOpening.jobOpeningDetails.createdAt;
      delete cloneOpening.jobOpeningDetails.createdBy;
      delete cloneOpening.jobOpeningDetails.modifiedAt;
      delete cloneOpening.jobOpeningDetails.modifiedBy;
    }
    this.props.saveNewOpening({
      ...cloneOpening,
      jobTitle: `${this.state.jobTitle} (m/w/x)`
    }).then(() => {
      toastr.success('Saved', 'The Job Opening has been cloned successfully');
    }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'),
        i18n.t('errorMessage.THE_JOB_OPENING_COULD_NOT_BE_CLONED'));
    });
    this.setState({
      isCloned: true
    }, () => {
      this.closeModal();
    });
  }

  render() {
    const { jobTitle } = this.state;
    return (
      <Modal
        show={this.state.showModal}
        onHide={this.closeModal}
        animation
        bsSize="small"
        className={styles.cloneViewOpening}
      >
        <Modal.Body className={styles.modalBody}>
          <span> Do you want to change the job title ?</span>
          <input
            type="text"
            value={jobTitle}
            onChange={e => this.setJobTitle(e)}
            onKeyPress={this.handleKeyPress}
          />
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Col md={6} className="p-0">
            <Button
              className={`${styles.cloneButton} orange-btn`}
              onClick={this.cloneOpening}
              autoFocus
            >Clone</Button>
          </Col>
          <Col md={6} className="p-0">
            <Button
              onClick={this.closeModal}
              className={styles.cancelButton}
            >Cancel</Button>
          </Col>
        </Modal.Footer>
      </Modal>
    );
  }
}
