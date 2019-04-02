import React, { Component } from 'react';
import { Row, Col, Modal, Pager } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import UserMenu from '../Users/UserMenu';
import { loadSignatures, deleteSignature } from '../../redux/modules/signature';
import Constants from './../../helpers/Constants';
import { restrictDecimalNumber } from '../../utils/validation';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

const userStyles = require('../Users/Users.scss');
const styles = require('./SignatureEditor.scss');

@connect(
  state => ({
    user: state.auth.user,
    signatures: state.signature.signatures,
    totalCount: state.signature.totalCount,
  }), {
    pushState,
    loadSignatures,
    deleteSignature
  }
)
export default class SignatureManager extends Component {
  static propTypes = {
    pushState: PropTypes.func.isRequired,
    signatures: PropTypes.array,
    loadSignatures: PropTypes.func.isRequired,
    deleteSignature: PropTypes.func.isRequired,
    totalCount: PropTypes.number,
    user: PropTypes.object,
    location: PropTypes.object,
  };

  static defaultProps = {
    signatures: [],
    user: {},
    totalCount: 0,
    location: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      openViewModal: false,
      signature: {},
      activePage: 1
    };
  }

  componentWillMount() {
    const { activePage } = this.state;
    if (this.props.location && this.props.location.state && this.props.location.state.activePage) {
      this.setState({
        activePage: this.props.location.state.activePage
      }, () => {
        this.loadSignatures(this.props.location.state.activePage);
      });
    } else {
      this.loadSignatures(activePage);
    }
  }

  openViewModal = signature => {
    this.setState({
      openViewModal: true,
      signature
    });
  }

  closeModal = () => {
    this.setState({
      openViewModal: false
    });
  }

  editSignature = signature => {
    this.props.pushState({
      pathname: `/SignatureEditor/${signature.id}`,
      state: {
        signature,
        activePage: this.state.activePage
      }
    });
  }

  handlePagination = (direction, pageNo, maxPage) => {
    if (direction !== 'goto') {
      document.getElementById('goToSign').value = '';
    }
    if (maxPage < pageNo) {
      const msgObj = { statusCode: 200 };
      toastrErrorHandling(msgObj, 'Pagination Error', 'No Page Found');
      return null;
    }
    let currentPage = this.state.activePage;
    if (direction === 'previous') {
      if (currentPage === 1) {
        return;
      }
      currentPage -= 1;
    } else if (direction === 'next') {
      if (currentPage === pageNo) {
        return;
      }
      currentPage += 1;
    } else if (direction === 'first') {
      if (currentPage === 1) {
        return;
      }
      currentPage = 1;
    } else if ((direction === 'last' || direction === 'goto') && pageNo > 0) {
      currentPage = pageNo;
    }
    this.setState({
      activePage: currentPage
    }, () => {
      this.loadSignatures(currentPage);
    });
  }

  selectPageNumber = (evt, maxPage) => {
    const pageNo = evt.target.value;
    if (evt.keyCode === 69) {
      evt.preventDefault();
    }
    if (evt.keyCode === 13 && pageNo > 0) {
      this.handlePagination('goto', Number(pageNo), maxPage);
    }
  }

  deleteSignature = signature => {
    let msg = i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_SIGNATURE');
    if (signature.isDefault) {
      msg = i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DELETE_YOUR_DEFAULT_SIGNATURE');
    }
    toastr.confirm(msg, {
      onOk: () => {
        const signatureLength = this.props.signatures.length;
        this.props.deleteSignature(signature.id).then(() => {
          this.loadSignatures(this.state.activePage, signatureLength);
          this.closeModal();
          toastr.success(i18n.t('successMessage.SIGNATURE_DELETED_SUCCESSFULLY'));
        }, err => {
          toastrErrorHandling(err.error, '', i18n.t('errorMessage.ERROR_WHILE_DELETING'));
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  loadSignatures = (page, signatureLength) => {
    const { user } = this.props;
    if (signatureLength && signatureLength === 1) {
      this.setState({
        activePage: page - 1
      });
      this.props.loadSignatures({
        userId: user.id,
        skip: (this.state.activePage - 1) * Constants.RECORDS_PER_PAGE_SETTING,
        limit: Constants.RECORDS_PER_PAGE_SETTING
      });
    } else {
      this.props.loadSignatures({
        userId: user.id,
        skip: (page - 1) * Constants.RECORDS_PER_PAGE_SETTING,
        limit: Constants.RECORDS_PER_PAGE_SETTING
      });
    }
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_SIGNATURES_FOUND</Trans></div></Row>
      </Col>
    );
    return NoResultsFound;
  }

  render() {
    const { signatures, totalCount } = this.props;
    const { activePage } = this.state;
    const maxPage = Math.ceil(totalCount / Constants.RECORDS_PER_PAGE_SETTING);
    return (
      <Col
        lg={12}
        md={12}
        sm={12}
        xs={12}
        className={userStyles.users_container}
      >
        <Helmet title={i18n.t('tooltipMessage.SIGNATURE_MANAGER')} />
        <Col lg={2} md={2} sm={2} xs={12} className="p-0">
          <Col lg={12} md={12} sm={12} xs={12} className={userStyles.sidenav}>
            <Col lg={12} md={12} sm={12} xs={12} className="p-0">
              <UserMenu />
            </Col>
          </Col>
        </Col>
        <Col lg={10} md={10} sm={10} xs={12} className="p-0">
          <Col lg={12} md={12} sm={12} xs={12} className={`p-0 ${styles.managerContainer}`}>
            <Col lg={12} md={12} sm={12} xs={12} className="m-t-15 m-b-15 m-l-0 m-r-0">
              {/* <Col lg={6} lgOffset={6} className={styles.menuGroup}> */}
              <div className={`${userStyles.page_title}`}>
                <Trans>SIGNATURE</Trans>
              </div>
              <div className={userStyles.pagination}>
                <NewPermissible operation={{ operation: 'CREATE_SIGNATURE', model: 'Signature' }}>
                  <div
                    className="text-right display-inline m-l-15 m-r-5 m-b-5"
                  // style={{ float: 'right' }}
                  >
                    <button
                      className={`button-primary ${userStyles.invite}`}
                      onClick={() => this.props.pushState({
                        pathname: '/SignatureEditor',
                        state: {
                          activePage
                        }
                      })}
                    >
                      <i className="fa fa-plus p-r-5" />
                      <Trans>ADD_SIGNATURE</Trans>
                    </button>
                  </div>
                </NewPermissible>
                {
                  maxPage && maxPage > 1 ?
                    <div className={`${styles.page_goto}`}>
                      <input
                        type="number"
                        id="goToSign"
                        onKeyDown={e => this.selectPageNumber(e, maxPage)}
                        placeholder={i18n.t('placeholder.GO_TO')}
                        onKeyPress={restrictDecimalNumber}
                        min="1"
                      />
                    </div>
                    : ''
                }
                {
                  maxPage && maxPage > 1 ?
                    <Pager className={`${userStyles.pager} left`}>
                      <Pager.Item
                        className={this.state.activePage <= 1 ? `${userStyles.disabled} p-r-5` : 'p-r-5'}
                        onClick={() => this.handlePagination('first')}
                      >
                        <span><Trans>FIRST</Trans></span>
                      </Pager.Item>
                      <Pager.Item
                        className={this.state.activePage <= 1 ? userStyles.disabled : ''}
                        onClick={() => this.handlePagination('previous')}
                      >
                        <span className="fa fa-caret-left" />
                      </Pager.Item>
                      <Pager.Item
                        title={`${i18n.t('tooltipMessage.TOTAL_PAGES')} : ${maxPage}`}
                        className={userStyles.page_no}
                      >
                        {activePage}
                      </Pager.Item>
                      <Pager.Item
                        className={maxPage <= this.state.activePage ? userStyles.disabled : ''}
                        onClick={() => this.handlePagination('next', maxPage)}
                      >
                        <span className="fa fa-caret-right" />
                      </Pager.Item>
                      <Pager.Item
                        className={maxPage <= this.state.activePage ? `${userStyles.disabled} p-l-5` : 'p-l-5'}
                        onClick={() => this.handlePagination('last', maxPage)}
                      >
                        <span><Trans>LAST</Trans></span>
                      </Pager.Item>
                    </Pager>
                    : ''
                }
              </div>
              {/* </Col> */}
            </Col>
            {
              signatures && signatures.length ?
                <Row className={`m-t-15 m-b-15 m-l-0 m-r-0 ${userStyles.tableStyles}`}>
                  {signatures.map(signature => (
                    <Signatures
                      onView={this.openViewModal}
                      deleteSign={this.deleteSignature}
                      signature={signature}
                      editSignature={this.editSignature}
                    />
                  ))}
                </Row>
                : this.renderNoResultsFound()
            }
          </Col>
        </Col>
        <View
          openViewModal={this.state.openViewModal}
          closeModal={this.closeModal}
          signature={this.state.signature}
          editSignature={this.editSignature}
          deleteSign={this.deleteSignature}
        />
      </Col>
    );
  }
}

function View(properties) {
  const { openViewModal, closeModal, signature } = properties;
  return (
    <Modal
      show={openViewModal}
      onHide={closeModal}
    >
      <Modal.Header className={styles.modal_header}>
        <Modal.Title className="modal_title text-center">
          <Row className="clearfix">
            <Col sm={12} style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              <div
                className="close_btn right"
                onClick={closeModal}
                role="button"
                tabIndex="0"
              >
                <i className="fa fa-close" />
              </div>
              <div className={`${styles.modal_heading} modal_header`}>
                { signature.name }
              </div>
            </Col>
          </Row>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Scrollbars
          universal
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props =>
            <div {...props} className={styles.scroll_overflow} />}
          className={styles.signature_preview_scroll}
        >
          <div>
            {
              signature.content &&
            Parser(signature.content)
            }
          </div>
        </Scrollbars>
      </Modal.Body>
      {/* <Modal.Footer>
        <Col sm={12}>
          <Col sm={6} smOffset={6} className="m-t-10">
            <Col lg={6} sm={12} className="p-5">
              <button
                className="btn btn-border"
                onClick={() => deleteSign(signature)}
              >
                <i className="fa fa-trash-o" aria-hidden="true" />
                DELETE
              </button>
            </Col>
            <Col lg={6} sm={12} className="p-5">
              <button
                className="btn btn-border orange-btn"
                onClick={() => editSignature(signature)}
              >
                <i className="fa fa-pencil-square-o" aria-hidden="true" />
                EDIT
              </button>
            </Col>
          </Col>
        </Col>
      </Modal.Footer> */}
    </Modal>
  );
}


const Signatures = properties => {
  const { signature, onView, editSignature, deleteSign } = properties;
  return (
    <Col
      lg={3}
      md={4}
      sm={6}
      style={{ border: 'none' }}
      className="p-t-10 p-b-10"
    >
      <div className={`shadow_one ${styles.signatureCard}`}>
        {
          signature.isDefault ?
            <div>
              <Col sm={8} className="p-0">
                <div className={styles.header} title={signature.name}>
                  {signature.name}
                </div>
              </Col>
              <Col sm={4} className="p-0">
                <div className={styles.default}>
                  {i18n.t('DEFAULT')}
                </div>
              </Col>
            </div>
            :
            <div className={styles.header} title={signature.name}>
              {signature.name}
            </div>
        }
        {signature.content &&
          <div className={styles.content}>
            {Parser(signature.content)}
          </div>
        }
        <div className={styles.btnGroup}>
          <NewPermissible operation={{ operation: 'EDIT_ME', model: 'Signature' }}>
            <div>
              <button
                className="btn btn-border"
                onClick={() => editSignature(signature)}
              >
                <i className="fa fa-pencil-square-o" aria-hidden="true" />
                <Trans>EDIT</Trans>
              </button>
            </div>
          </NewPermissible>
          <NewPermissible operation={{ operation: 'DELETE_ME', model: 'Signature' }}>
            <div>
              <button
                className="btn btn-border"
                onClick={() => deleteSign(signature)}
              >
                <i className="fa fa-trash-o" aria-hidden="true" />
                <Trans>DELETE</Trans>
              </button>
            </div>
          </NewPermissible>
          <div>
            <button
              className="btn btn-border"
              onClick={() => onView(signature)}
            >
              <Trans>PREVIEW</Trans>
            </button>
          </div>
        </div>
      </div>
    </Col>
  );
};
