import React, { Component } from 'react';
import { Modal, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, propTypes, change } from 'redux-form';
import PropTypes from 'prop-types';
import moment from 'moment';
import { toastr } from 'react-redux-toastr';
import { Trans } from 'react-i18next';
// import { Scrollbars } from 'react-custom-scrollbars';
import { push as pushState } from 'react-router-redux';
import { getOpeningFormConfig, formValidation } from '../../formConfig/SaveSearch';
import InputBox from '../../components/FormComponents/InputBox';
import { saveNewSearch } from '../../redux/modules/profile-search';
// import ProfileSearchFilter from '../../components/Filters/ProfileSearchFilter';
import styles from './ProfileSearch.scss';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';

@reduxForm(props => ({
  form: props.id,
  validate: formValidation
}))
@connect((state, props) => ({
  user: state.auth.user,
  values: getFormValues(props.form)(state),
  openSaveSearchModal: state.profileSearch.openSearchModal,
}), {
  pushState,
  saveNewSearch,
  change
})
class SaveSearch extends Component {
  static propTypes = {
    ...propTypes,
    openSaveSearchModal: PropTypes.func.isRequired,
    isRenameSearch: PropTypes.bool,
    closeModal: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    saveNewSearch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
  }
  static defaultProps = {
    isRenameSearch: false,
  }
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      currentView: 'SearchInfo',
      initialParam: 'initial',
      selectedOption: null,
    };
  }

  componentWillMount() {
    const { initialValues } = this.props;
    if (initialValues && initialValues.companies) {
      this.setState({ selectedOption: initialValues.companies }, () => {
        this.props.change(this.props.form, 'companies', initialValues.companies);
      });
    }
  }

  closeModal = evt => {
    const { values, pristine } = this.props;
    if (evt) {
      evt.stopPropagation();
      if (!pristine && values) {
        const toastrConfirmOptions = {
          onOk: () => { this.props.reset(); this.props.closeModal(); },
          okText: i18n.t('YES'),
          cancelText: i18n.t('NO')
        };
        toastr.confirm(i18n.t('confirmMessage.YOUR_CHANGES_WILL_BE_LOST'), toastrConfirmOptions);
      } else {
        this.props.closeModal();
      }
    }
  }

  goBack = () => {
    this.setState({
      currentView: 'SearchInfo'
    });
  }

  saveSearch = () => {
    const { values } = this.props;
    if (values.id) {
      this.props.renameSearch(values.id, values.searchTitle.trim());
    } else {
      this.saveNewSearch();
    }
  };


  saveNewSearch = () => {
    const { values, user, allMatches } = this.props;
    // const search = {
    //   userId: user.id,
    //   name: values.searchTitle,
    //   description: values.description,
    // };
    const filters = {
      userId: user.id,
      name: values.searchTitle.trim(),
      description: values.description,
      candidateName: values.candidateName,
      skills: values.skills,
      skillStr: values.skillStr,
      location: values.location,
      keywords: values.keywords,
      experience: values.experience,
      positions: values.positions,
      companies: values.companies,
      languages: values.languages,
      languageStr: values.languageStr,
      preferredRadius: values.preferredRadius || 0,
      source: values.source,
      companyCultureRating: values.companyCultureRating ? parseFloat(values.companyCultureRating) : 1,
      contactRating: values.contactRating ? parseFloat(values.contactRating) : 1,
      mobilityRating: values.mobilityRating ? parseFloat(values.mobilityRating) : 1,
      pedigreeRating: values.pedigreeRating ? parseFloat(values.pedigreeRating) : 1,
      skillRating: values.skillRating ? parseFloat(values.skillRating) : 1,
      allMatches,
      isEmail: values.isEmail,
      isMobile: values.isMobile,
      isFreelance: values.isFreelance,
      noticePeriod: values.noticePeriod,
      noticePeriodType: values.noticePeriodType,
      candidateTags: values.candidateTags
    };
    this.props.saveNewSearch({
      date: moment().format('LL'),
      filters
    }).then(savedData => {
      const searchId = savedData.id;
      toastr.success(i18n.t('successMessage.SAVED'),
        i18n.t('successMessage.THE_FILTER_SEARCH_HAS_BEEN_SAVED_SUCCESSFULLY'));
      this.props.reset();
      this.props.closeModal();
      sessionStorage.removeItem('profilefilters');
      this.props.pushState({ pathname: '/ProfileSearch', query: { searchId } });
    }, error => {
      toastrErrorHandling(error.error,
        i18n.t('ERROR'), i18n.t('errorMessage.FILTER_SEARCH_COULD_NOT_BE_SAVED.'));
    });
  }

  handleCompanyValueChange = selectedOption => {
    if (selectedOption && selectedOption.id) {
      this.setState({ selectedOption: selectedOption.id }, () => {
        this.props.change(this.props.form, 'companies', selectedOption);
      });
    } else {
      this.setState({ selectedOption: '' });
      this.props.change(this.props.form, 'companies', '');
    }
  }

  handleCompanyKeyDown = () => {
    this.setState({ selectedOption: '' });
    this.props.change(this.props.form, 'companies', '');
  }

  isFormFieldsEmpty = values => {
    let isTitleEmpty = false;
    if (!values.searchTitle || (values.searchTitle && values.searchTitle.trim().length === 0)) {
      isTitleEmpty = true;
    }
    return isTitleEmpty;
  }

  render() {
    const filterConfig = getOpeningFormConfig(this);
    const { isEdit, handleSubmit, pristine, submitting, values, isRenameSearch } = this.props;
    const formFieldsEmpty = this.isFormFieldsEmpty(values);
    // const { currentView, selectedOption } = this.state;
    return (
      <div >
        <Modal
          show={this.props.openSaveSearchModal}
          onHide={this.closeModal}
        >
          <form onSubmit={handleSubmit(this.saveSearch)}>
            <Modal.Header className={styles.modal_header}>
              <Col sm={12} lg={12} className="p-0">
                <Col sm={4} lg={4} className="p-t-5">
                  <Modal.Title className={`${styles.modal_title} text-left`}>
                    <Trans>{isRenameSearch ? 'RENAME_SEARCH' : 'SAVE_SEARCH'}</Trans>
                  </Modal.Title>
                </Col>
                <Col sm={8} lg={8} className="p-t-5">
                  <Col sm={4} lg={4} className="p-0 right">
                    <span
                      className="right no-outline"
                      role="button"
                      tabIndex="-1"
                      onClick={this.closeModal}
                    >
                      <i className="fa fa-close" />
                    </span>
                  </Col>
                </Col>
              </Col>
            </Modal.Header>
            <Modal.Body>
              <Row className={`${styles.modal_body} ${styles.filter}`}>
                <Col sm={12} className="m-t-10">
                  <InputBox {...filterConfig.searchTitle} />
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Col sm={12}>
                <Col sm={7} smOffset={5} className="m-t-10">
                  <Col lg={6} sm={12} className="p-5 right">
                    <button
                      className={`${styles.save_search_btn} button-primary`}
                      type="submit"
                      disabled={formFieldsEmpty || ((pristine && !isEdit) || (submitting && !isEdit))}
                    >
                      {
                        <span><i className="fa fa-bookmark-o" aria-hidden="true" /><Trans>SAVE_SEARCH</Trans></span>
                      }
                    </button>
                  </Col>
                </Col>
              </Col>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}

export default SaveSearch;
