import React, { Component } from 'react';
import { Modal, Row, Col, Pager } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import Parser from 'html-react-parser';
import { push as pushState } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';
import UserMenu from '../Users/UserMenu';
import { loadTemplates, deleteTemplate } from '../../redux/modules/templates';
import Constants from './../../helpers/Constants';
import { restrictDecimalNumber } from '../../utils/validation';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

const userStyles = require('../Users/Users.scss');
const styles = require('./TemplateManager.scss');

@connect(state => ({
  templateList: state.templates.templates,
  totalCount: state.templates.totalCount,
  user: state.auth.user
}), {
  loadTemplates,
  deleteTemplate,
  pushState
})
export default class TemplateManager extends Component {
  static propTypes = {
    templateList: PropTypes.any.isRequired,
    loadTemplates: PropTypes.func.isRequired,
    deleteTemplate: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    totalCount: PropTypes.number,
    location: PropTypes.object,
    user: PropTypes.object.isRequired
  };
  static defaultProps = {
    totalCount: 0,
    location: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      openViewModal: false,
      template: {},
      isEditPermitted: false,
      isEditMePermitted: false,
      isDeleteMePermitted: false,
      isDeletePermitted: false
    };
  }

  componentWillMount() {
    const { activePage } = this.state;
    const isEditPermitted = NewPermissible.isPermitted({ operation: 'EDIT', model: 'Template' });
    const isEditMePermitted = NewPermissible.isPermitted({ operation: 'EDIT_ME', model: 'Template' });
    const isDeleteMePermitted = NewPermissible.isPermitted({ operation: 'DELETE_ME', model: 'Template' });
    const isDeletePermitted = NewPermissible.isPermitted({ operation: 'DELETE', model: 'Template' });
    if (this.props.location && this.props.location.state && this.props.location.state.activePage) {
      this.setState({
        activePage: this.props.location.state.activePage,
        isEditPermitted,
        isEditMePermitted,
        isDeleteMePermitted,
        isDeletePermitted
      }, () => {
        this.loadTemplates(this.props.location.state.activePage);
      });
    } else {
      this.setState({
        isEditPermitted,
        isEditMePermitted,
        isDeleteMePermitted,
        isDeletePermitted
      });
      this.loadTemplates(activePage);
    }
  }

  getEditPermission = template => {
    const { isEditMePermitted, isEditPermitted } = this.state;
    const { user } = this.props;
    let isPermitted = false;
    if (isEditPermitted) {
      isPermitted = true;
    } else if (isEditMePermitted && (template && template.createdBy) === (user && user.id)) {
      isPermitted = true;
    }
    return isPermitted;
  }

  getDeletePermission = template => {
    const { isDeleteMePermitted, isDeletePermitted } = this.state;
    const { user } = this.props;
    let isPermitted = false;
    if (isDeletePermitted) {
      isPermitted = true;
    } else if (isDeleteMePermitted && (template && template.createdBy) === (user && user.id)) {
      isPermitted = true;
    }
    return isPermitted;
  }

  openViewModal = template => {
    this.setState({
      openViewModal: true,
      template
    });
  }

  closeModal = () => {
    this.setState({
      openViewModal: false
    });
  }

  editTemplate = template => {
    this.props.pushState({
      pathname: `/TemplateEditor/${template.id}`,
      state: {
        template,
        activePage: this.state.activePage
      }
    });
  }

  deleteTemplate = template => {
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_TEMPLATE'), {
      onOk: () => {
        const templateLength = this.props.templateList.length;
        this.props.deleteTemplate(template.id).then(() => {
          this.loadTemplates(this.state.activePage, templateLength);
          this.closeModal();
          toastr.success(i18n.t('successMessage.TEMPLATE_DELETED_SUCCESSFULLY'));
        }, error => {
          toastrErrorHandling(error.error, '', i18n.t('errorMessage.ERROR_WHILE_DELETING'));
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    });
  }

  handlePagination = (direction, pageNo, maxPage) => {
    if (direction !== 'goto') {
      document.getElementById('goToTemplate').value = '';
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
      this.loadTemplates(currentPage);
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
  loadTemplates = (page, templateLength) => {
    if (templateLength && templateLength === 1) {
      this.setState({
        activePage: page - 1
      });
      this.props.loadTemplates({
        skip: (this.state.activePage - 1) * Constants.RECORDS_PER_PAGE_SETTING,
        limit: Constants.RECORDS_PER_PAGE_SETTING
      });
    } else {
      this.props.loadTemplates({
        skip: (page - 1) * Constants.RECORDS_PER_PAGE_SETTING,
        limit: Constants.RECORDS_PER_PAGE_SETTING
      });
    }
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_TEMPLATES_FOUND</Trans></div></Row>
      </Col>
    );
    return NoResultsFound;
  }

  render() {
    const { templateList, totalCount } = this.props;
    const { activePage } = this.state;
    const maxPage = Math.ceil(totalCount / Constants.RECORDS_PER_PAGE_SETTING);
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={userStyles.users_container}>
        <Helmet title={i18n.t('TEMPLATE_MANAGER')} />
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
                <Trans>TEMPLATE_MANAGER</Trans>
              </div>
              <div className={userStyles.pagination}>
                <NewPermissible operation={{ operation: 'CREATE_TEMPLATE', model: 'Template' }}>
                  <div
                    className="text-right display-inline m-l-15 m-r-5 m-b-5"
                  // style={{ float: 'right' }}
                  >
                    <button
                      className={`button-primary ${userStyles.invite}`}
                      onClick={() => this.props.pushState({
                        pathname: '/TemplateEditor',
                        state: {
                          activePage
                        }
                      })}
                    >
                      <i className="fa fa-plus p-r-5" />
                      <Trans>ADD_TEMPLATE</Trans>
                    </button>
                  </div>
                </NewPermissible>
                {
                  maxPage && maxPage > 1 ?
                    <div className={`${styles.page_goto}`}>
                      <input
                        type="number"
                        id="goToTemplate"
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
              templateList && templateList.length ?
                <Row className={`m-t-15 m-b-15 m-l-0 m-r-0 ${userStyles.tableStyles}`}>
                  {templateList && templateList.map(template => (
                    <Templates
                      editTemplate={this.editTemplate}
                      deleteTemp={this.deleteTemplate}
                      template={template}
                      onView={this.openViewModal}
                      getEditPermission={this.getEditPermission}
                      getDeletePermission={this.getDeletePermission}
                    />
                  )
                  )}
                </Row>
                : this.renderNoResultsFound()
            }
          </Col>
        </Col>
        <View
          openViewModal={this.state.openViewModal}
          closeModal={this.closeModal}
          template={this.state.template}
          editTemplate={this.editTemplate}
          deleteTemp={this.deleteTemplate}
        />
      </Col>
    );
  }
}

function View(properties) {
  const { openViewModal, closeModal, template } = properties;
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
                { template.name }
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
          className={styles.template_preview_scroll}
        >
          {template.body &&
          <div>{Parser(template.body)}</div>
          }
        </Scrollbars>
      </Modal.Body>
      {/* <Modal.Footer>
        <Col sm={12}>
          <Col sm={6} smOffset={6} className="m-t-10">
            <Col lg={6} sm={12} className="p-5">
              <button
                className="btn btn-border"
                onClick={() => deleteTemp(template)}
              >
                <i className="fa fa-trash-o" aria-hidden="true" />
                DELETE
              </button>
            </Col>
            <Col lg={6} sm={12} className="p-5">
              <button
                className="btn btn-border orange-btn"
                onClick={() => editTemplate(template)}
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

const Templates = properties => {
  const { template, onView, editTemplate, deleteTemp, getDeletePermission, getEditPermission } = properties;
  return (
    <Col
      lg={3}
      md={4}
      sm={6}
      style={{ border: 'none' }}
      className="p-t-10 p-b-10"
    >
      <div className={`shadow_one ${styles.templateCard}`}>
        {template.name && <div className={styles.header} title={template.name}>
          {template.name}
        </div>}
        {template.body &&
          <div className={styles.content}>
            {Parser(template.body)}
          </div>
        }
        <div className={styles.btnGroup}>
          {getEditPermission(template) &&
          <div>
            <button
              className="btn btn-border"
              onClick={() => editTemplate(template)}
            >
              <i className="fa fa-pencil-square-o" aria-hidden="true" />
              <Trans>EDIT</Trans>
            </button>
          </div>}
          {getDeletePermission(template) &&
          <div>
            <button
              className="btn btn-border"
              onClick={() => deleteTemp(template)}
            >
              <i className="fa fa-trash-o" aria-hidden="true" />
              <Trans>DELETE</Trans>
            </button>
          </div>}
          <div>
            <button
              className="btn btn-border"
              onClick={() => onView(template)}
            >
              <Trans>PREVIEW</Trans>
            </button>
          </div>
        </div>
      </div>
    </Col>
  );
};
