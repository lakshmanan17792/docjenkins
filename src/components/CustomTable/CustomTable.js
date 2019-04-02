import React, { Component } from 'react';
import { Table, Pager, Col, Row } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import { reduxForm, Field, fieldPropTypes } from 'redux-form';
import { PropTypes } from 'prop-types';
import i18n from '../../i18n';
import { restrictDecimalNumber } from '../../utils/validation';
import styles from './CustomTable.scss';
import Constants from '../../helpers/Constants';
import NewPermissible from '../Permissible/NewPermissible';
import Loader from '../Loader';

const renderField = ({
  input,
  inpValue,
  reset,
  handleOnChange,
  placeholder,
  errorMessage,
  meta: {
    touched,
    error
  },
}) => (
  <div>
    <span className={styles.iconSearch}>
      <img src={'/search.svg'} alt="search icon" />
    </span>
    <input
      {...input}
      placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      type="text"
      value={inpValue}
      onChange={event => { handleOnChange(event); }}
    />
    { inpValue && <span className={styles.iconClear}>
      <img
        src={'/search-close.svg'}
        alt="close icon"
        onClick={event => { reset(event); }}
        role="presentation"
      />
    </span>
    }
    {touched && (error && <div className="error-message">{errorMessage || error}</div>)}
  </div>
);
renderField.propTypes = {
  ...fieldPropTypes
};

@reduxForm({
  form: 'search'
})
@connect(state => ({
  user: state.auth.user
}))
export default class CustomTable extends Component {
  static propTypes = {
    sTitle: PropTypes.array,
    columnDef: PropTypes.array,
    onSortChange: PropTypes.func,
    isStriped: PropTypes.bool,
    isJobCategory: PropTypes.bool,
    isFilter: PropTypes.bool,
    renderFilter: PropTypes.func,
    isBordered: PropTypes.bool,
    isHover: PropTypes.bool,
    isResponsive: PropTypes.bool,
    isCondensed: PropTypes.bool,
    handlePagination: PropTypes.func,
    selectPageNumber: PropTypes.func,
    data: PropTypes.array,
    totalCount: PropTypes.any.isRequired,
    activePage: PropTypes.number,
    resetSearchTerm: PropTypes.func,
    onSearchChange: PropTypes.func,
    inpValue: PropTypes.string,
    placeholder: PropTypes.string,
    initialSortKey: PropTypes.string,
    initialSortOrder: PropTypes.string,
    loading: PropTypes.bool,
    isEdit: PropTypes.bool,
    isDelete: PropTypes.bool,
    handleEdit: PropTypes.func,
    handleDelete: PropTypes.func,
    isSearch: PropTypes.bool,
    isDeleteMePermitted: PropTypes.bool,
    isDeletePermitted: PropTypes.bool,
    isEditPermitted: PropTypes.bool,
    user: PropTypes.object,
    isEditMePermitted: PropTypes.bool,
    isArchiveOrDelete: PropTypes.bool,
    tableTitle: PropTypes.string,
    countTitle: PropTypes.string,
    singularCountTitle: PropTypes.string
  }

  static defaultProps = {
    sTitle: [],
    columnDef: [],
    keys: 0,
    data: [],
    isStriped: false,
    isFilter: false,
    renderFilter: null,
    isJobCategory: false,
    initialSortKey: 'modifiedAt',
    initialSortOrder: 'desc',
    isBordered: false,
    isHover: false,
    isResponsive: false,
    isCondensed: false,
    isEdit: false,
    isDelete: false,
    width: '',
    handleEdit: '',
    handleDelete: '',
    tableWidth: '',
    activePage: 1,
    inpValue: '',
    placeholder: '',
    onSortChange: null,
    loading: false,
    renderActions: null,
    isSearch: false,
    isDeleteMePermitted: false,
    isDeletePermitted: false,
    isEditPermitted: false,
    handlePagination: '',
    selectPageNumber: '',
    resetSearchTerm: '',
    onSearchChange: '',
    user: {},
    isEditMePermitted: false,
    isArchiveOrDelete: false,
    tableTitle: '',
    countTitle: '',
    singularCountTitle: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      sortKey: props.initialSortKey,
      sortOrder: props.initialSortOrder
    };
  }

  setScrollToTop = () => {
    if (this.scrollbar) {
      this.scrollbar.scrollToTop();
    }
  }

  getTdToRender = (value, column) => {
    if (column.render) {
      const tableData = column.render(value);
      const emptyData = column.isPermission ? '' : <td />;
      return (tableData ? <td style={{ width: column.width }} className={column.textAlign}>
        {tableData}
      </td> : emptyData);
    }
    return (<td style={{ width: column.width }} className={column.textAlign}>
      {value[column.key]}
    </td>);
  }

  noResultsFound = () => (!this.props.loading &&
    <Col
      className={this.props.isArchiveOrDelete ?
        `${styles.no_results_found} m-b-0` : styles.no_results_found}
    >
      <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
      <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_RESULTS_FOUND</Trans></div></Row>
      <Row className={`${styles.empty_message} m-0`}>
        {
          this.props.isJobCategory ?
            <div><Trans>NO_JOB_CATEGORY_FOUND</Trans></div>
            :
            <div><Trans>MODIFY_SEARCH_TO_GET_RESULT</Trans></div>
        }
      </Row>
    </Col>)

  sortOnChange = (evt, orderKey, sortOrder) => {
    this.setScrollToTop();
    this.setState({ sortKey: orderKey, sortOrder });
    this.props.onSortChange(orderKey, sortOrder);
  }

  checkPermission = (data, permission, userPermission, column) => {
    let element = '';
    if (permission) {
      element = <td style={{ width: column.width }}>{this.renderActions(data, column, permission, userPermission)}</td>;
    } else if (userPermission && (data && data.createdBy === this.props.user.id)) {
      element = <td style={{ width: column.width }}>{this.renderActions(data, column, permission, userPermission)}</td>;
    } else if (userPermission && (data && data.createdBy !== this.props.user.id)) {
      element = <td />;
    }
    return element;
  }

  validateActions = (value, column) => {
    const { isEdit, isDelete, isDeletePermitted, isEditPermitted, isDeleteMePermitted, isEditMePermitted } = this.props;
    return (
      (isEdit || isDelete) &&
        (this.checkPermission(value, isEditPermitted, isEditMePermitted, column) ||
        this.checkPermission(value, isDeletePermitted, isDeleteMePermitted, column))
    );
  }

  clearPageInput = () => {
    if (document.getElementById('goToUsers')) {
      document.getElementById('goToUsers').value = '';
    }
  }

  renderActions = data => {
    const { isDeletePermitted, isEditPermitted, isDeleteMePermitted, isEditMePermitted } = this.props;
    return (<div className={styles.align_center}>
      {(isEditPermitted || (isEditMePermitted && data && data.createdBy === this.props.user.id)) &&
        <img
          src={'/edit.svg'}
          alt="edit icon"
          role="presentation"
          onClick={() => this.props.handleEdit(data)}
          className={`${styles.action_icon} m-r-5`}
          title={i18n.t('EDIT')}
        />}
      {(isDeletePermitted || (isDeleteMePermitted && data && data.createdBy === this.props.user.id)) &&
        <img
          src={'/delete.svg'}
          alt="delete icon"
          role="presentation"
          onClick={() => this.props.handleDelete(data.id)}
          className={`${styles.action_icon} m-l-10`}
          title={i18n.t('DELETE')}
        />}
    </div>);
  };

  renderSort = orderKey => {
    const { sortKey, sortOrder } = this.state;
    return (
      <span className="m-0">
        <i
          onClick={evt => { this.clearPageInput(); this.sortOnChange(evt, orderKey, 'asc'); }}
          className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${sortKey === orderKey && sortOrder === 'asc'
            ? styles.currentOrder : ''}`}
          aria-hidden="true"
        />
        <i
          onClick={evt => { this.clearPageInput(); this.sortOnChange(evt, orderKey, 'desc'); }}
          className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${sortKey === orderKey && sortOrder === 'desc'
            ? styles.currentOrder : ''}`}
          aria-hidden="true"
        />
      </span>
    );
  }

  render() {
    const { sTitle, columnDef, isStriped, isBordered, isHover, isResponsive, isCondensed, isSearch,
      data, totalCount, activePage, resetSearchTerm, singularCountTitle,
      onSearchChange, inpValue, placeholder, loading, isFilter, tableTitle, countTitle } = this.props;
    const maxPage = Math.ceil(totalCount / Constants.RECORDS_PER_PAGE);
    return (
      <Col md={12} xs={12} sm={12} lg={12}>
        {
          tableTitle === 'MANAGE' && totalCount > 0 &&
          <Col sm={12} md={12} lg={12} className="p-t-10 p-l-0 p-r-0">
            <span className={`${styles.count}`}>
              {` (${totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${totalCount > 1 ?
                i18n.t(countTitle) : i18n.t(singularCountTitle)})`
              }
            </span>
          </Col>
        }
        <Col sm={12} md={12} lg={12} className={styles.gridHeader}>
          {isSearch && <Col sm={5} md={4} lg={3} className={`p-l-0 ${styles.searchBox}`}>
            <Field
              type="text"
              component={renderField}
              name={name}
              reset={resetSearchTerm}
              handleOnChange={evt => { this.setScrollToTop(); onSearchChange(evt); }}
              inpValue={inpValue}
              placeholder={placeholder}
            />
          </Col>
          }
          {
            isFilter && <Col
              smOffset={2}
              sm={5}
              mdOffset={4}
              md={4}
              lgOffset={1}
              lg={3}
              className={`p-l-0 ${styles.searchBox} customTableFilter`}
            >
              {this.props.renderFilter(this.scrollbar)}
            </Col>
          }
          {maxPage && maxPage > 1 ?
            <Col
              smOffset={isFilter ? 6 : 1}
              sm={isFilter ? 6 : 6}
              mdOffset={isFilter ? 7 : 3}
              md={isFilter ? 5 : 5}
              lgOffset={isFilter ? 0 : 4}
              lg={isFilter ? 5 : 5}
              className={`${styles.pagination_block} ${isFilter ? styles.pagination_align : ''}`}
            >
              <div className={`${styles.page_goto}`}>
                <input
                  type="number"
                  id="goToUsers"
                  onKeyDown={e => { this.setScrollToTop(); this.props.selectPageNumber(e, this.scrollbar); }}
                  placeholder="Go to"
                  onKeyPress={restrictDecimalNumber}
                  min="1"
                />
              </div>
              <Pager className={`${styles.pager} left`}>
                <Pager.Item
                  className={activePage <= 1 ? `${styles.disabled} p-r-5` : 'p-r-5'}
                  onClick={() => { this.setScrollToTop(); this.props.handlePagination('first'); }}
                >
                  <span><Trans>FIRST</Trans></span>
                </Pager.Item>
                <Pager.Item
                  className={activePage <= 1 ? styles.disabled : ''}
                  onClick={() => { this.setScrollToTop(); this.props.handlePagination('previous'); }}
                >
                  <span className="fa fa-caret-left" />
                </Pager.Item>
                <Pager.Item
                  title={`${i18n.t('tooltipMessage.TOTAL_PAGES')} : ${maxPage}`}
                  className={styles.page_no}
                >
                  {activePage}
                </Pager.Item>
                <Pager.Item
                  className={maxPage <= activePage ? styles.disabled : ''}
                  onClick={() => { this.setScrollToTop(); this.props.handlePagination('next'); }}
                >
                  <span className="fa fa-caret-right" />
                </Pager.Item>
                <Pager.Item
                  className={maxPage <= activePage ? `${styles.disabled} p-l-5` : 'p-l-5'}
                  onClick={() => { this.setScrollToTop(); this.props.handlePagination('last'); }}
                >
                  <span><Trans>LAST</Trans></span>
                </Pager.Item>
              </Pager>
            </Col>
            : ''
          }
        </Col>
        {
          data && data.length > 0 ?
            <Col sm={12} md={12} lg={12} className={styles.grid}>
              <Table
                striped={isStriped}
                bordered={isBordered}
                hover={isHover}
                responsive={isResponsive}
                condensed={isCondensed}
                width="100%"
                className={`${styles.tablestyles} m-0`}
              >
                <thead>
                  <tr>
                    {sTitle.map(title => (
                      title.isRestricted ?
                        <NewPermissible
                          operation={title.operation}
                          restrictedComponent={title.restrictedComponent ?
                            <th
                              className={title.textAlign}
                              style={{ width: title.width }}
                            ><Trans>{title.title}</Trans></th>
                            : ''}
                          permittedComponent={title.permittedComponent ?
                            <th
                              className={title.textAlign}
                              style={{ width: title.width }}
                            ><Trans>{title.title}</Trans></th>
                            : ''}
                        /> : (<th
                          className={title.textAlign}
                          style={{ width: title.width }}
                        >
                          {!title.operation && <span><Trans>{title.title}</Trans></span>}
                          {title.isOrder && this.renderSort(title.key)}
                        </th>)))
                    }
                  </tr>
                </thead>
                <Scrollbars
                  universal
                  autoHeight
                  autoHeightMin={'calc(100vh - 270px)'}
                  autoHeightMax={'calc(100vh - 270px)'}
                  ref={c => { this.scrollbar = c; }}
                  renderThumbHorizontal={props => <div {...props} className="hide" />}
                  renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
                >
                  <tbody>
                    {
                      data.map(value => (<tr>
                        {data && columnDef.map(column => (column.key !== 'actions' ?
                          this.getTdToRender(value, column)
                          : this.validateActions(value, column)
                        ))}
                      </tr>))
                    }
                  </tbody>
                </Scrollbars>
              </Table>
              <Loader loading={loading} />
            </Col>
            : this.noResultsFound()
        }
      </Col>
    );
  }
}
