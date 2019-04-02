import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Table,
  Pager,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { toastr } from 'react-redux-toastr';
import { reduxForm } from 'redux-form';
import { Trans } from 'react-i18next';
import styles from './AnalysisMetrics.scss';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { restrictDecimalNumber } from '../../utils/validation';
import i18n from '../../i18n';
import ModelAtsBoard from './ModelAtsBoard';

@reduxForm({
  form: 'searchOpening'
})
export default class ViewOpeningsAnalysis extends Component {
  static propTypes = {
    openingList: PropTypes.array.isRequired,
    total: PropTypes.number.isRequired,
    analysisJobOpenings: PropTypes.func.isRequired,
    loadJobDetails: PropTypes.func.isRequired,
    route: PropTypes.func.isRequired
  };

  static defaultProps = {
    openingList: []
  };

  constructor(props, context) {
    super(props, context);
    this.handleHide = this.handleHide.bind(this);
    this.state = {
      activePage: sessionStorage.getItem('selectedActivePage')
        ? Number(sessionStorage.getItem('selectedActivePage'))
        : 1,
      isLoading: true,
      companyid: sessionStorage.getItem('companyId'),
      show: false,
      jobData: {},
      nameOrder: sessionStorage.getItem('nameOrder')
        ? sessionStorage.getItem('nameOrder')
        : '',
      orderBy: '',
      orderIn: ''
    };
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillReceiveProps() {
    this.setState({
      activePage: Number(sessionStorage.getItem('selectedActivePage')),
      companyid: sessionStorage.getItem('companyId'),
      orderBy: sessionStorage.getItem('orderBy'),
      orderIn: sessionStorage.getItem('orderIn'),
    });
  }

  loadInitialOpeningDetails = () => {
    this.setState({
      isLoading: true
    });
    const { activePage, orderBy, orderIn } = this.state;
    this.props
      .analysisJobOpenings({
        companyid: sessionStorage.getItem('companyId'),
        page: activePage,
        limit: 15,
        orderBy,
        orderIn
      })
      .then(
        () => {
          const tableBody = document.getElementById('tableBody');
          if (tableBody) {
            tableBody.scrollTo(0, 0);
          }
          this.setState({
            isLoading: false
          });
        },
        error => {
          this.setState({
            isLoading: false
          });
          toastrErrorHandling(
            error.error,
            i18n.t('errorMessage.SERVER_ERROR'),
            i18n.t('errorMessage.COULD_NOT_LOAD_OPENINGS'),
            { removeOnHover: true }
          );
        }
      );
  };

  handleHide() {
    this.setState({ show: false });
  }

  resetPageInput = () => {
    if (document.getElementById('goToOpening')) {
      document.getElementById('goToOpening').value = '';
    }
  };

  selectPageNumber = (evt, maxPage) => {
    const pageNo = evt.target.value;
    if (evt.keyCode === 69) {
      evt.preventDefault();
    }
    if (evt.keyCode === 13 && pageNo > 0) {
      if (pageNo <= maxPage) {
        this.setState({ activePage: Number(pageNo) }, () =>
          this.loadInitialOpeningDetails()
        );
        sessionStorage.setItem('selectedActivePage', pageNo);
      } else {
        evt.target.value = '';
        toastrErrorHandling(
          {},
          i18n.t('errorMessage.PAGE_ERROR'),
          i18n.t('errorMessage.PAGE_NOT_FOUND')
        );
      }
    }
  };

  redirectToFirstPage = () => {
    this.setState({ activePage: 1 }, () => this.loadInitialOpeningDetails());
    sessionStorage.setItem('selectedActivePage', 1);
    this.resetPageInput();
  };

  prevPage = () => {
    if (this.state.activePage > 1) {
      this.setState({ activePage: this.state.activePage - 1 }, () =>
        this.loadInitialOpeningDetails()
      );
      sessionStorage.setItem('selectedActivePage', this.state.activePage - 1);
      this.resetPageInput();
    }
  };

  nextPage = () => {
    if (this.state.activePage < Math.ceil(this.props.total / 15)) {
      this.setState({ activePage: this.state.activePage + 1 }, () =>
        this.loadInitialOpeningDetails()
      );
      sessionStorage.setItem('selectedActivePage', this.state.activePage + 1);
      this.resetPageInput();
    }
  };

  redirectToLastPage = () => {
    const lastPage = Math.ceil(this.props.total / 15);
    this.setState({ activePage: lastPage }, () =>
      this.loadInitialOpeningDetails()
    );
    sessionStorage.setItem('selectedActivePage', lastPage);
    this.resetPageInput();
  };

  loadJobAts = id => {
    this.props.loadJobDetails(id).then(res => {
      this.props.route({ pathname: `/Openings/${id}` });
    });
  };

  applyFilterOrder = (evt, orderBy, orderIn) => {
    this.resetPageInput();
    evt.preventDefault();
    this.setState(
      {
        orderBy,
        orderIn,
        activePage: 1
      },
      () => {
        sessionStorage.setItem('selectedActivePage', 1);
        sessionStorage.setItem('orderBy', orderBy);
        sessionStorage.setItem('orderIn', orderIn);
        this.loadInitialOpeningDetails();
      }
    );
  };

  circleIndividual = (obj, isSalesOwner) => (
    <OverlayTrigger
      rootClose
      overlay={this.renderTooltip(obj, false, null, isSalesOwner)}
      placement="top"
      key={obj.id}
    >
      <span className={styles.circle}>
        {obj.firstname ? obj.firstname.charAt(0).toUpperCase() : ''}
        {obj.lastname ? obj.lastname.charAt(0).toUpperCase() : ''}
      </span>
    </OverlayTrigger>
  );

  circleMultiple = (list, isSalesOwner) => {
    if (list.length <= 2) {
      return '';
    }
    return (
      <OverlayTrigger
        rootClose
        overlay={this.renderTooltip(null, true, list, isSalesOwner)}
        placement="top"
      >
        <span className={styles.circle}>+{list.length - 2}</span>
      </OverlayTrigger>
    );
  };

  renderTooltip = (obj, showAll, list, isSalesOwner) => {
    if (!showAll) {
      return (
        <Tooltip id={obj.id}>
          <strong>
            {`${obj.firstname ? obj.firstname : ''} ${
              obj.lastname ? obj.lastname : ''
            }`}
          </strong>
        </Tooltip>
      );
    }
    return (
      <Tooltip id={list.id} className={`salesTooltip ${styles.customTooltip}`}>
        <div>
          <strong>
            {`${list.length} ${isSalesOwner ? 'Account Owners' : 'Recruiters'}`}
          </strong>
        </div>
        {list.map(owner => (
          <div key={owner.id} className={styles.tooltip}>
            {`${owner.firstname ? owner.firstname : ''} ${
              owner.lastname ? owner.lastname : ''
            }`}
          </div>
        ))}
      </Tooltip>
    );
  };

  renderCircle = (list, isSalesOwner) => (
    <span className={styles.circleContainer}>
      {JSON.parse(list)
        .slice(0, 2)
        .map(obj => this.circleIndividual(obj, isSalesOwner))}
      {list.length === 3
        ? this.circleIndividual(list[2], isSalesOwner)
        : this.circleMultiple(JSON.parse(list), isSalesOwner)}
    </span>
  );

  renderPagination = () => {
    if (this.props.total && this.props.total > 15) {
      const maxPage = Math.ceil(this.props.total / 15);
      return (
        <div className={`${styles.pagination_containers}`}>
          <div className={`${styles.page_goto}`}>
            <input
              type="number"
              id="goToOpening"
              onKeyDown={e => this.selectPageNumber(e, maxPage)}
              placeholder={i18n.t('placeholder.GO_TO')}
              onKeyPress={restrictDecimalNumber}
              min="1"
            />
          </div>
          <Pager className={`${styles.pager} left`}>
            <Pager.Item
              className={
                this.state.activePage <= 1
                  ? `${styles.disabled} p-r-5`
                  : 'p-r-5'
              }
              onClick={() => this.redirectToFirstPage()}
            >
              <span>
                <Trans>FIRST</Trans>
              </span>
            </Pager.Item>
            <Pager.Item
              className={
                this.state.activePage <= 1
                  ? `${styles.disabled} ${styles.page_no_height}`
                  : styles.page_no_height
              }
              onClick={() => this.prevPage()}
            >
              <span className="fa fa-caret-left" />
            </Pager.Item>
            <Pager.Item
              title={`${i18n.t('tooltipMessage.TOTAL_PAGES')} : ${maxPage}`}
              className={`${styles.page_no} ${styles.page_no_height} ${
                styles.page_no_width
              }`}
            >
              {this.state.activePage}
            </Pager.Item>
            <Pager.Item
              className={
                this.state.activePage >= maxPage
                  ? `${styles.disabled} ${styles.page_no_height} p-r-5`
                  : `${styles.page_no_height} p-r-5`
              }
              onClick={() => this.nextPage()}
            >
              <span className="fa fa-caret-right" />
            </Pager.Item>
            <Pager.Item
              className={
                this.state.activePage >= maxPage ? `${styles.disabled}` : ''
              }
              onClick={() => this.redirectToLastPage()}
            >
              <span>
                <Trans>LAST</Trans>
              </span>
            </Pager.Item>
          </Pager>
        </div>
      );
    }
  };


  renderOpeningInfo = () => {
    if (this.props.total !== 0) {
      return (
        <Table
          responsive
          className={`table
          ${styles.customTable} ${styles.companyTable}`}
        >
          <thead>
            <tr>
              <th className={styles.width_18}>
                <span className="m-r-5 p-l-10">
                  <Trans>Positions</Trans>
                </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'jobtitle', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                  ${
                    this.state.orderBy === 'jobtitle' &&
                    this.state.orderIn === 'asc'
                      ? styles.currentNameOrder
                      : ''
                  }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'jobtitle', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                  ${
                    this.state.orderBy === 'jobtitle' &&
                    this.state.orderIn === 'desc'
                      ? styles.currentNameOrder
                      : ''
                  }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_10}>
                <span className={`${styles.thwidth} m-r-5`}>
                  <Trans>Vacancies</Trans>
                </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'vacancies', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === 'vacancies' &&
                      this.state.orderIn === 'asc'
                        ? styles.currentNameOrder
                        : ''
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'vacancies', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === 'vacancies' &&
                        this.state.orderIn === 'desc'
                          ? styles.currentNameOrder
                          : ''
                      }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_10}>
                <span className={`${styles.thwidth0} m-r-5`}>
                  <Trans>Job types</Trans>
                </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'type', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === 'type' &&
                      this.state.orderIn === 'asc'
                        ? styles.currentNameOrder
                        : ''
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'type', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === 'type' &&
                        this.state.orderIn === 'desc'
                          ? styles.currentNameOrder
                          : ''
                      }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_11}>
                <span className="m-r-5">
                  <Trans>Recruiters</Trans>
                </span>
              </th>
              <th className={styles.width_11}>
                <span className={`${styles.thwidth1} m-r-5`}>
                <Trans>Avg days to hire</Trans>
              </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'hirecandidateavg', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === 'hirecandidateavg' &&
                      this.state.orderIn === 'asc'
                        ? styles.currentNameOrder
                        : ''
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'hirecandidateavg', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === 'hirecandidateavg' &&
                        this.state.orderIn === 'desc'
                          ? styles.currentNameOrder
                          : ''
                      }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_11}>
                <span className={`${styles.thwidth1} m-r-5`}>
                <Trans>Selected to hired ratio</Trans>
              </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'selectedtohireratio', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === 'selectedtohireratio' &&
                      this.state.orderIn === 'asc'
                        ? styles.currentNameOrder
                        : ''
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'selectedtohireratio', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === 'selectedtohireratio' &&
                        this.state.orderIn === 'desc'
                          ? styles.currentNameOrder
                          : ''
                      }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_20}>
                <span className={`${styles.thwidth2} m-r-5`}>
                <Trans>Submitted to shortlisted ratio</Trans>
              </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'submittoshortlistratio', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === 'submittoshortlistratio' &&
                      this.state.orderIn === 'asc'
                        ? styles.currentNameOrder
                        : ''
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'submittoshortlistratio', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === 'submittoshortlistratio' &&
                        this.state.orderIn === 'desc'
                          ? styles.currentNameOrder
                          : ''
                      }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_15}>
                <span className="m-r-5">
                  <Trans>Contact Person</Trans>
                </span>
                {/* <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, "contactPersonOrder", "asc");
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === "contactPersonOrder" &&
                      this.state.orderIn === "asc"
                        ? styles.currentNameOrder
                        : ""
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, "contactPersonOrder", "desc");
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === "contactPersonOrder" &&
                        this.state.orderIn === "desc"
                          ? styles.currentNameOrder
                          : ""
                      }`}
                  aria-hidden="true"
                /> */}
              </th>
              <th className={styles.width_10}>
                <span className="m-r-5">
                  <Trans>Selected</Trans>
                </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'selectedcount', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === 'selectedcount' &&
                      this.state.orderIn === 'asc'
                        ? styles.currentNameOrder
                        : ''
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'selectedcount', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === 'selectedcount' &&
                        this.state.orderIn === 'desc'
                          ? styles.currentNameOrder
                          : ''
                      }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_10}>
                <span className="m-r-5">
                  <Trans>Hired</Trans>
                </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'hirecount', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === 'hirecount' &&
                      this.state.orderIn === 'asc'
                        ? styles.currentNameOrder
                        : ''
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'hirecount', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === 'hirecount' &&
                        this.state.orderIn === 'desc'
                          ? styles.currentNameOrder
                          : ''
                      }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_10}>
                <span className="m-r-5">
                  <Trans>Rejected</Trans>
                </span>
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'rejectedcount', 'asc');
                  }}
                  className={`${styles.orderFilterUp} fa fa-sort-asc
                    ${
                      this.state.orderBy === 'rejectedcount' &&
                      this.state.orderIn === 'asc'
                        ? styles.currentNameOrder
                        : ''
                    }`}
                  aria-hidden="true"
                />
                <i
                  onClick={evt => {
                    this.applyFilterOrder(evt, 'rejectedcount', 'desc');
                  }}
                  className={`${styles.orderFilterDown} fa fa-sort-desc
                      ${
                        this.state.orderBy === 'rejectedcount' &&
                        this.state.orderIn === 'desc'
                          ? styles.currentNameOrder
                          : ''
                      }`}
                  aria-hidden="true"
                />
              </th>
              <th className={styles.width_8}>
                <span className="m-r-5">
                  <Trans>ATS</Trans>
                </span>
              </th>
            </tr>
          </thead>
          <tbody id="tableBody">
            {this.props.openingList &&
              this.props.openingList.map(job => (
                <tr key={`tr${job.jobid}`} className={`${styles.customTr}`}>
                  {job.status === 'active' ? (
                    <td
                      className={`${styles.customTd} ${styles.width_18} ${
                        styles.active
                      }`}
                      onClick={() => this.loadJobAts(job.jobid)}
                    >
                      {job.jobtitle}
                    </td>
                  ) : (
                    <td
                      className={`${styles.customTd} ${styles.width_18} ${
                        styles.inactive
                      }`}
                    >
                      {job.jobtitle}
                    </td>
                  )}
                  <td
                    className={`${styles.customTd} ${styles.width_10} ${
                      styles.center
                    }`}
                  >
                    {job.vacancies}
                  </td>
                  <td className={`${styles.customTd} ${styles.width_10}`}>
                    {job.type}
                  </td>
                  <td className={`${styles.customTd} ${styles.width_11}`}>
                    {job.recruiterdetails && job.recruiterdetails !== '' && (
                      <span style={{ display: 'flex' }}>
                        <span className="p-l-5">
                          {this.renderCircle(job.recruiterdetails, false)}
                        </span>
                      </span>
                    )}
                  </td>
                  <td
                    className={`${styles.customTd} ${styles.width_11} ${
                      styles.center
                    }`}
                  >
                    {job.hirecandidateavg !== null ? (
                      <span>
                        {job.hirecandidateavg.days ? (
                          <span>{job.hirecandidateavg.days}</span>
                        ) : (
                          <span>1</span>
                        )}
                      </span>
                    ) : (
                      0
                    )}
                  </td>
                  <td
                    className={`${styles.customTd} ${styles.width_11} ${
                      styles.center
                    }`}
                  >
                    {`${Math.round(job.selectedtohireratio)}`}
                  </td>
                  <td
                    className={`${styles.customTd} ${styles.width_20} ${
                      styles.center
                    }`}
                  >
                    {`${Math.round(job.submittoshortlistratio)}`}
                  </td>
                  <td className={`${styles.customTd} ${styles.width_15}`}>
                    {job.contactdetails != null ? (
                      <span>
                        {job.contactdetails.firstname}{' '}
                        {job.contactdetails.lastname}
                      </span>
                    ) : (
                      ''
                    )}
                  </td>
                  <td
                    className={`${styles.customTd} ${styles.width_10} ${
                      styles.center
                    }`}
                  >
                    <div className={`${styles.selected}`}>
                      {job.selectedcount}
                    </div>
                  </td>
                  <td
                    className={`${styles.customTd} ${styles.width_10} ${
                      styles.center
                    }`}
                  >
                    <div className={`${styles.hired}`}>{job.hirecount}</div>
                  </td>
                  <td
                    className={`${styles.customTd} ${styles.width_10} ${
                      styles.center
                    }`}
                  >
                    <div className={`${styles.rejected}`}>
                      {job.rejectedcount}
                    </div>
                  </td>
                  <td
                    className={`${styles.customTd} ${styles.width_8} ${
                      styles.center
                    }`}
                  >
                    <img
                      title={i18n.t(
                        'tooltipMessage.CLICK_HERE_TO_VIEW_ATS_BOARD'
                      )}
                      src={'/icons/ats.svg'}
                      alt="ats"
                      className={styles.atsbtn}
                      onClick={() =>
                        this.setState({ show: true, jobData: job })
                      }
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      );
    } else if (this.state.isLoading || this.props.total === 0) {
      return (
        <Col className={styles.no_results_found}>
          <Row className="text-center">
            <img src="/sadface.png" alt="sad face" />
          </Row>
          <Row className={styles.sub_head}>
            <div>
              <Trans>NO_JOB_OPENINGS_FOUND</Trans>
            </div>
          </Row>
          <Row className={styles.empty_message}>
            <div>
              <Trans>MODIFY_SEARCH_TO_GET_RESULT</Trans>
            </div>
          </Row>
        </Col>
      );
    }
  };

  render() {
    const { total, openingList } = this.props;
    return (
      <div>
        {openingList ? (
          <Row className="m-t-20">
            <Col xs={12} style={{ marginTop: '8px' }}>
              <span className={`${styles.jobopeningMain}`}>
                <Trans>JOB OPENINGS</Trans>
              </span>
              <span className={`${styles.jobopeningCount}`}>
                {total
                  ? ` (${total} ${
                    total > 1
                      ? i18n.t('JOB_OPENINGS')
                      : i18n.t('Job Openings')
                  })`
                  : ''}
              </span>
            </Col>
          </Row>
        ) : (
          ''
        )}
        <Row className="m-t-20">
          <Col xs={6}>
            {/* <NewPermissible operation={{ operation: 'opening_SEARCH', model: 'customer' }}>
            <SearchBar
              searchClassName="search-input"
              isCustomerSearch="yes"
              reset={e => this.resetSearch(e)}
              handleOnChange={e => this.setSearchTerm(e)}
              inpValue={this.state.searchStrVal}
              classNames={styles.searchBarWidth}
              placeholder={i18n.t('SEARCH_BY_NAME')}
              handleOnKeyUp={() => { }}
            />
          </NewPermissible> */}
          </Col>
          <Col xs={6}>{this.renderPagination()}</Col>
        </Row>
        <Row className="m-t-30">
          <Col xs={12} className="openingsTable">
            {this.renderOpeningInfo()}
          </Col>
        </Row>
        <ModelAtsBoard
          show={this.state.show}
          handleHide={this.handleHide}
          jobData={this.state.jobData}
        />
      </div>
    );
  }
}
