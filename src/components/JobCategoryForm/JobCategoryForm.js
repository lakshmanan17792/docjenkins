import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues } from 'redux-form';
import { Modal, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Trans } from 'react-i18next';
import InputBox from '../FormComponents/InputBox';
import CheckBox from '../../components/FormComponents/CheckBox';
import TextArea from '../../components/FormComponents/TextArea';
import jobCategoryValidation from './JobCategoryValidation';
import { getJobCategoryConfig } from '../../formConfig/JobCategory';
import i18n from '../../i18n';
@reduxForm({
  form: 'jobCategory',
  validate: jobCategoryValidation,
  touchOnChange: true
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state)
}))
export default class JobCategoryForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    openCategoryModal: PropTypes.bool.isRequired,
    initialize: PropTypes.func.isRequired,
    selectedJobCategory: PropTypes.object.isRequired,
    isEdit: PropTypes.bool.isRequired,
    values: PropTypes.object,
    pristine: PropTypes.bool
  };

  static defaultProps = {
    values: null,
    pristine: true
  };

  constructor(props) {
    super(props);
    this.state = {
      isActive: true
    };
  }

  componentWillMount() {
    const { selectedJobCategory } = this.props;
    if (selectedJobCategory && selectedJobCategory.id) {
      this.props.initialize({
        name: selectedJobCategory.name,
        description: selectedJobCategory.description,
        isActive: selectedJobCategory.isActive
      });
      this.setState({
        isActive: selectedJobCategory.isActive
      });
    } else {
      this.props.initialize({
        isActive: true
      });
    }
  }

  handleCheckBox = evt => {
    this.setState({
      isActive: evt.target.checked
    });
  }

  closeModal = evt => {
    const { values, pristine } = this.props;
    if (evt) {
      evt.stopPropagation();
      if (values && (Object.keys(values)).length > 0 && !pristine) {
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

  render() {
    const { handleSubmit, openCategoryModal, isEdit } = this.props;
    const { isActive } = this.state;
    const styles = require('./JobCategoryForm.scss');
    const filterConfig = getJobCategoryConfig(this);
    return (
      <div>
        <Modal
          show={openCategoryModal}
          onHide={this.closeModal}
          style={{ display: 'block' }}
        >
          <form className="form-horizontal" onSubmit={handleSubmit}>
            <Modal.Header className={`${styles.modal_header}`}>
              <Row className="clearfix">
                <Col sm={12}>
                  <span className={`${styles.modal_heading}`}>
                    {`${isEdit ? i18n.t('EDIT') : i18n.t('NEW')}`} <Trans>JOB_CATEGORY</Trans>
                  </span>
                  <span
                    role="button"
                    tabIndex="-1"
                    className="right no-outline"
                    onClick={this.closeModal}
                  >
                    <i className="fa fa-close" />
                  </span>
                </Col>
              </Row>
            </Modal.Header>
            <Modal.Body>
              <div className="p-b-15">
                <InputBox {...filterConfig.fields[0]} />
              </div>
              <div className="p-b-15">
                <TextArea {...filterConfig.fields[1]} />
              </div>
              <div className="p-b-15">
                <span className={styles.font_bold}><Trans>IS_ACTIVE</Trans></span>
                <CheckBox
                  onChange={evt => this.handleCheckBox(evt)}
                  isChecked={isActive}
                  className={`${styles.category_checkbox} p-l-10`}
                  name={'isActive'}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Col sm={7} smOffset={5} className="m-t-10 right">
                <Col lg={6} sm={12} className="p-5 right">
                  <button
                    className={`${styles.save_btn} button-primary right`}
                    type="submit"
                    onSubmit={handleSubmit}
                  >
                    <span><i className="fa fa-paper-plane" /><Trans>SAVE</Trans></span>
                  </button>
                </Col>
              </Col>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}
