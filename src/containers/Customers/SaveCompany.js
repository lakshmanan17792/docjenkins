import React, { Component } from 'react';
import { Modal, Col, Row, Image, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { reduxForm, getFormValues, Field, fieldPropTypes } from 'redux-form';
import PropTypes from 'prop-types';
import { push as pushState } from 'react-router-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
// import { formValidation } from '../../formConfig/SaveCustomer';
import { trimTrailingSpace, companyUrlValidate } from '../../utils/validation';
import styles from './Companies.scss';
import { loadCompanies } from '../../redux/modules/customers';
import CustomerType from './CustomerType';
import i18n from '../../i18n';

let timeoutId = 0;
export const Input = ({ loading, placeholder, handleKeyDown, keyDown,
  input, label, readOnly, type, isRequired, isInfo, infoText, autoFocus
}) => (
  <div className={styles.m_t_b_15}>
    <label className={styles.hdr_label} htmlFor={input.name}>
      <Trans>{label}</Trans>
      {isRequired ? <span className="required_color">*</span> : ''}
      { isInfo ?
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
        className="inline"
        id={input.name}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        onKeyDown={keyDown ? e => handleKeyDown(e) : ''}
      />
      {loading && <i className={`fa fa-spinner fa-spin p-l-r-7 ${styles.spinner}`} aria-hidden="true" />}
    </div>
  </div>
);
Input.defaultProps = {
  custom: '',
};

Input.propTypes = {
  ...fieldPropTypes,
  custom: PropTypes.any
};
@reduxForm({
  form: 'SaveCompany',
})
@connect((state, props) => ({
  values: getFormValues(props.form)(state),
  openSaveCustomerModal: state.customers.openCustomerModal,
  companyList: state.customers.companyList,
  totalCount: state.customers.totalCount,
  loading: state.customers.loading
}), { loadCompanies, pushState })
export default class SaveCompany extends Component {
  static propTypes = {
    openSaveCustomerModal: PropTypes.bool,
    closeModal: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    loadCompanies: PropTypes.func,
    values: PropTypes.object,
    invalid: PropTypes.bool,
    saveCustomer: PropTypes.func,
    pushState: PropTypes.func,
    loading: PropTypes.bool,
    viewCompanyDetails: PropTypes.func,
    initialValues: PropTypes.object
  }

  static defaultProps = {
    openSaveCustomerModal: null,
    pristine: false,
    loadCompanies: null,
    values: {},
    initialValues: {},
    invalid: false,
    saveCustomer: null,
    pushState: null,
    loading: false,
    closeModal: null,
    viewCompanyDetails: null
  }

  constructor(props) {
    super(props);
    this.state = {
      limit: 10,
      page: 1,
      companyList: null,
      reachedEnd: false,
      totalCount: 0,
      name: '',
      domain: '',
      invalidUrl: ''
    };
  }

  // componentDidMount() {
  //   this.interval = setInterval(this.activityScroll, 5000);
  // }

  componentWillMount() {
    if (this.props.initialValues) {
      this.initialize();
    }
  }

  componentDidMount() {
    window.addEventListener('beforeunload', () => {
      sessionStorage.removeItem('addCustomer');
    });
  }

  componentWillUnmount() {
    // if (!this.interval) {
    //   clearInterval(this.interval);
    // }
  }

  handleKeyDown = e => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      this.initialize(e);
    }, 1000);
  }

  handleScrollUpdate = values => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const pad = 100; // 100px of the bottom
    // t will be greater than 1 if we are about to reach the bottom
    const t = ((scrollTop + pad) / (scrollHeight - clientHeight));
    if (t > 1) this.activityScroll();
  }

  initialize = () => {
    const { values } = this.props;
    if (values && values.domain) {
      this.setState({
        invalidUrl: companyUrlValidate(values.domain)
      });
    } else {
      this.setState({
        invalidUrl: ''
      });
    }
    if (values && this.state.invalidUrl === '') {
      this.setState({
        name: values.name ? values.name.toLowerCase().trim() : '',
        domain: values.domain ? values.domain.toLowerCase().trim() : ''
      }, () => {
        if (values && ((values.domain && values.domain.trim()) || (values.name && values.name.trim()))) {
          this.loadCompanyDetails();
        } else {
          this.setState({ companyList: null });
        }
      });
    }
  }

  loadCompanyDetails = () => {
    this.setState({
      page: 1,
      companyList: [],
      invalidUrl: ''
    }, this.loadCompany);
  }

  loadCompany = () => {
    this.props.loadCompanies({
      page: this.state.page,
      resultsPerPage: this.state.limit,
      name: this.state.name,
      domain: this.state.domain
    }).then(list => {
      this.setState({
        companyList: [...this.state.companyList, ...list.hits.hits],
        totalCount: list.hits.total
      });
      window.clearTimeout(timeoutId);
    }, err => {
      if (err) {
        toastrErrorHandling(err.error, i18n.t('ERROR'), i18n.t('errorMessage.COULD_NOT_LOAD_SIMILAR_COMPANIES'));
      }
    });
  }

  saveCustomer = () => {
    const { values } = this.props;
    if (values) {
      sessionStorage.setItem('addCustomer', JSON.stringify(values));
    }
    const toastrConfirmOptions = {
      onOk: () => this.props.pushState({
        pathname: '/Company/new', query: { name: values.name, domain: values.domain } }),
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    };
    if (values && (values.domain || values.name)) {
      const isExist = this.checkCompanyAlreadyExists();
      if (isExist) {
        toastr.confirm(i18n.t('confirmMessage.COMPANY_NAME_ALREADY_EXISTS'), toastrConfirmOptions);
      } else {
        this.props.pushState({ pathname: '/Company/new',
          query: {
            name: values.name ? values.name : '',
            domain: values.domain ? values.domain : ''
          }
        });
      }
    } else {
      this.props.pushState({ pathname: '/Company/new', query: { name: '', domain: '' } });
    }
  }

  checkCompanyAlreadyExists = () => {
    const { companyList } = this.state;
    let { values: { name, domain } } = this.props;
    if (domain) {
      domain = domain && domain.toLowerCase().includes('www.') ?
        domain.toLowerCase().split('www.')[1] : domain.toLowerCase();
    }
    name = name && name.toLowerCase();
    let isExists = false;
    let i = 0;
    if (companyList) {
      for (i = 0; i < companyList.length; i += 1) {
        let domainName = companyList[i]._source.domain;
        let companyName = companyList[i]._source.name;
        domainName = domainName && domainName.toLowerCase().includes('www.') ?
          domainName.toLowerCase().split('www.')[1] : domainName && domainName.toLowerCase();
        companyName = companyName ? companyName.toLowerCase() : '';
        if (domainName === domain || name === companyName) {
          isExists = true;
          break;
        }
      }
    }
    return isExists;
  }

  closeModal = evt => {
    if (evt) {
      evt.stopPropagation();
      const { values: { name, domain } } = this.props;
      if (name || domain) {
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

  viewCompany = data => {
    const { values } = this.props;
    if (values) {
      sessionStorage.setItem('addCustomer', JSON.stringify(values));
    }
    this.props.pushState({ pathname: `Company/${data.id}` });
  }

  activityScroll = () => {
    const { companyList, totalCount } = this.state;
    if (companyList.length < totalCount || totalCount === 0) {
      this.setState({ page: Number(this.state.page) + 1 }, () => this.loadCompany());
    }
  }

  render() {
    const { handleSubmit, loading } = this.props;
    const { companyList, invalidUrl } = this.state;
    return (
      <div>
        <Modal
          show={this.props.openSaveCustomerModal}
          onHide={this.closeModal}
          className={`${styles.save_new_customer}`}
          dialogClassName="modal_dialog"
        >
          <Modal.Header className={`${styles.modal_header}`}>
            <Modal.Title>
              <Row className="clearfix">
                <Col sm={12}>
                  <span
                    className={`${styles.close_btn} right`}
                    onClick={this.closeModal}
                    role="button"
                    tabIndex="0"
                  >
                    <i className={`${styles.close} fa fa-close`} title={i18n.t('tooltipMessage.CLICK_TO_CLOSE')} />
                  </span>
                </Col>
              </Row>
            </Modal.Title>
            <h3 className={styles.modal_title}><Trans>CREATE_COMPANY</Trans></h3>
          </Modal.Header>
          <Modal.Body style={{ overflowX: 'hidden', overflowY: 'auto', padding: '40px 20px', height: '100%' }}>
            <Scrollbars
              universal
              autoHide
              autoHeight
              renderThumbHorizontal={props => <div {...props} className="hide" />}
              renderView={props => <div {...props} className="customScroll" />}
              autoHeightMin={'calc(100vh - 190px)'}
              autoHeightMax={'calc(100vh - 190px)'}
            >
              <Row className={`${styles.filter}`}>
                <Col sm={6} md={4} lg={4} xs={12} className={styles.container}>
                  { companyList !== null ? <div className={styles.companyBox}>
                    { companyList && companyList.length > 0 ?
                      <div>
                        <div className={styles.header}>
                          <Trans>DID_YOU_MEAN</Trans>:
                        </div>
                        <Scrollbars
                          universal
                          autoHide
                          // onScrollStop={this.activityScroll}
                          onUpdate={this.handleScrollUpdate}
                          autoHeightMin={'calc(50vh - 120px) + 17'}
                          autoHeightMax={'calc(50vh - 120px) + 17 '}
                          renderThumbHorizontal={props => <div {...props} className="hide" />}
                          renderView={props =>
                            <div {...props} className={`${styles.scroll_overflow}`} />}
                          className={`${styles.save_customer_scroll}`}
                        >
                          <div className={styles.panel}>
                            <ul style={{ padding: '0px', listStyle: 'none' }}>
                              {companyList.map(company => (
                                <li key={company._source.id}>
                                  <Col sm={12} md={12} lg={12} xs={12} className={`p-0 ${styles.companyList}`} >
                                    <div className={`${styles.companyListMain}`}>
                                      <Col sm={12} md={12} lg={12} xs={12} className="p-0">
                                        <Col sm={2} md={2} lg={2} xs={4} className="p-0">
                                          {company._source.logo ?
                                            <Image src="/default_male.png" circle className={styles.logo} />
                                            : <div className={styles.logo}><div style={{ padding: '14px 10px' }}>
                                              {company._source.name.substring(0, 2).toUpperCase()}</div></div> }
                                        </Col>
                                        <Col
                                          sm={10}
                                          lg={10}
                                          md={10}
                                          xs={8}
                                          className={`${styles.txt_overflow} p-0 p-l-5`}
                                        >
                                          <div
                                            className={`${styles.txt_overflow} ${styles.title}
                                            ${styles.suggestion_title}`}
                                            title={company._source.name}
                                          >
                                            {company._source.name}</div>
                                          <div className={styles.company_status}>
                                            {company._source.status &&
                                            <CustomerType userType={company._source.status} />}
                                          </div>
                                          <div
                                            className={`${styles.url} ${styles.txt_overflow}`}
                                            title={company._source.domain}
                                          >
                                            {company._source.domain &&
                                        company._source.domain
                                            }
                                          </div>
                                        </Col>
                                      </Col>
                                      <Col sm={12} md={12} xs={12} lg={12} className={`${styles.icon} p-t-0`}>
                                        <i className="fa fa-globe" />
                                        <span className={`${styles.txt_overflow} ${styles.country}`}>
                                          {company._source.city ? `${company._source.city}, ${company._source.country}`
                                            : `${company._source.city}${company._source.country}`}
                                        </span>
                                      </Col>
                                    </div>
                                    <div className={`${styles.view_company}`}>
                                      <Button
                                        className={`${styles.view_btn} btn btn-border orange-btn`}
                                        onClick={() => this.viewCompany(company._source)}
                                      >
                                        <Trans>VIEW_COMPANY</Trans>
                                      </Button>
                                    </div>
                                  </Col>
                                </li>
                              ))
                              }
                            </ul>
                          </div>
                        </Scrollbars>
                      </div>
                      :
                      <div className={styles.noResultsFound}><Trans>NO_SIMILAR_COMPANIES_FOUND</Trans></div>
                    }
                  </div> : ''
                  }
                </Col>
                <form onSubmit={handleSubmit(this.saveCustomer)} className={styles.formcontainer}>
                  <Col sm={6} md={4} lg={4} xs={12} className="p-l-30">
                    <Col sm={12} className="m-t-25 p-r-30" >
                      <Field
                        name="domain"
                        component={Input}
                        label="DOMAIN"
                        type="text"
                        format={trimTrailingSpace}
                        loading={loading}
                        placeholder="ENTER_THE_COMPANY_DOMAIN"
                        keyDown
                        handleKeyDown={this.handleKeyDown}
                        handleOnBlur={this.initialize}
                        autoFocus
                      />
                      {invalidUrl &&
                      <div className="error-message">{invalidUrl}</div>}
                    </Col>
                    <Col sm={12} className="m-t-25 p-r-30">
                      <Field
                        name="name"
                        component={Input}
                        label="NAME"
                        type="text"
                        placeholder="ENTER_THE_NAME_OF_THE_COMPANY"
                        format={trimTrailingSpace}
                        loading={loading}
                        keyDown
                        handleKeyDown={this.handleKeyDown}
                        handleOnBlur={this.initialize}
                      />
                    </Col>
                    <Col sm={12} className="m-t-25 p-r-30">
                      <button
                        className={`btn button-primary ${styles.client_btn}`}
                        type="submit"
                        disabled={companyList === null || loading || this.state.invalidUrl !== ''}
                      >
                        <span style={{ fontSize: '15px' }}><Trans>PROCEED_TO_CREATE_A_COMPANY</Trans></span>
                      </button>
                    </Col>
                  </Col>
                </form>
              </Row>
            </Scrollbars>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
