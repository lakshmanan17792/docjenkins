import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { Modal, Col, Row } from 'react-bootstrap';
import Moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import Loader from '../../components/Loader';
import { loadOpeningHistoryById } from '../../redux/modules/ATS';
import i18n from '../../i18n';

const styles = require('./ats.scss');
@connect(state => ({
  openingHistoryList: state.ats.openingHistoryList,
  loading: state.ats.loading
}), { loadOpeningHistoryById })
export default class OpeningHistory extends Component {
  static propTypes = {
    jobId: PropTypes.string.isRequired,
    showOpeningHistoryModal: PropTypes.func.isRequired,
    hideOpeningHistoryModal: PropTypes.func.isRequired,
    openingHistoryList: PropTypes.array.isRequired,
    loadOpeningHistoryById: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      openingHistoryList: [],
      page: -10,
      limit: 10,
      count: 0,
      reachedCount: false
    };
  }

  componentWillMount() {
    const { openingHistoryList, count } = this.state;
    if (openingHistoryList.length < count || openingHistoryList.length === count) {
      this.getHistoryList();
    }
  }

  getHistoryList = () => {
    this.setState({
      page: this.state.page + 10
    }, () => {
      this.props.loadOpeningHistoryById({
        page: this.state.page,
        limit: this.state.limit,
        order: 'createdAt DESC',
        jobId: this.props.jobId
      }).then(list => {
        this.setState({
          openingHistoryList: [...this.state.openingHistoryList, ...list.activities],
          count: list.count
        });
      });
    });
  }

  getHistoryListOnScroll = () => {
    const { openingHistoryList, count } = this.state;
    if (openingHistoryList.length < count ||
      (openingHistoryList.length === count && count !== 0)) {
      this.setState({
        reachedCount: openingHistoryList.length === count && count !== 0
      }, () => {
        if (!this.state.reachedCount) {
          this.getHistoryList();
        }
      });
    }
  }

  showModal = () => {
    this.props.showOpeningHistoryModal();
  }

  closeModal = () => {
    this.props.hideOpeningHistoryModal();
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0">
          <img src="/sadface.png" alt="sad face" className={`${styles.no_results_found_img}`} />
        </Row>
        <Row className={`${styles.sub_head} m-0`}>
          <div className={`${styles.fontStyle} text-center p-t-10`}>
            <Trans>NO_HISTORY_FOUND</Trans>
          </div>
        </Row>
      </Col>
    );
    return NoResultsFound;
  }

  renderStatus = status => {
    if (status === 'Scheduled') {
      return <b><Trans>INTERVIEW</Trans></b>;
    } else if (status === 'ToBeSubmitted') {
      return <b><Trans>TO_BE_SUBMITTED</Trans></b>;
    }
    return <b>{status}</b>;
  }

  render() {
    const { openingHistoryList } = this.state;
    const { loading } = this.props;
    return (
      <div>
        <Modal show={this.showModal} onHide={this.closeModal} className={`${styles.historyModal}`}>
          <Modal.Header className={`${styles.modal_header}`} closeButton>
            <Modal.Title className={`${styles.modal_title} p-l-10`}>
              <Trans>JOB_OPENING_HISTORY</Trans>
            </Modal.Title>
          </Modal.Header>
          <Scrollbars
            universal
            autoHide
            onScrollStop={this.getHistoryListOnScroll}
            autoHeight
            autoHeightMin={'calc(100vh - 600px)'}
            autoHeightMax={'calc(100vh - 400px)'}
            renderThumbHorizontal={props => <div {...props} className="hide" />}
            renderView={props => <div {...props} className="customScroll" />}
          >
            <Modal.Body>
              {
                openingHistoryList && openingHistoryList.length > 0 ?
                  openingHistoryList.map(opening => (
                    <Row>
                      <Col md={12} sm={12} className="p-7">
                        <Col md={3} sm={3} className="p-0 p-t-3 display-flex-align-center">
                          <span className={`${styles.historyOrder}`}>
                            <i className="fa fa-circle" aria-hidden="true" />
                          </span>
                          <span className={`${styles.historyDateTime}`}>
                            {Moment(new Date(opening.createdAt), 'LL').format('HH:mm, DD MMM YYYY')}
                          </span>
                        </Col>
                        <Col md={9} sm={9} className={`${styles.historyDescription} p-0`}>
                          <Col md={1} sm={1} className="p-0 text-center">
                            <span className="p-r-10">
                              <i className={`fa fa-user-circle ${styles.userIcon}`} aria-hidden="true" />
                            </span>
                          </Col>
                          <Col md={11} sm={11} className="p-t-3 p-l-0 p-r-0">
                            <div>
                              <span className="p-r-5"><b>{opening.userName}</b></span>
                              <span className="p-r-5">
                                { opening.action === 'CANDIDATE_SHORTLIST' ? i18n.t('ADDED') : i18n.t('MOVED')}
                              </span>
                              <span>
                                <Link
                                  to={{
                                    pathname: `/ProfileSearch/${opening.resumeId}`,
                                    query: { jobId: opening.jobOpeningId, isAtsBoard: true }
                                  }}
                                  className="display-inline"
                                >
                                  <b className={`${styles.themeColor} p-r-5`}>{opening.candidateName}</b>
                                </Link>
                              </span>
                              { opening.action === 'CANDIDATE_SHORTLIST' ?
                                <span className="p-r-5"><Trans>THE</Trans> <Trans>JOBOPENING</Trans> </span> :
                                <span>
                                  <span className="p-r-5"><Trans>FROM</Trans></span>
                                  <span className="p-r-5 text-capitalize">
                                    <b>
                                      {this.renderStatus(opening.oldStatus)}
                                    </b>
                                  </span>
                                  <span className="p-r-5"><Trans>TO</Trans></span>
                                  <span className="p-r-5 text-capitalize">
                                    {this.renderStatus(opening.newStatus)}
                                  </span>
                                </span>
                              }
                            </div>
                          </Col>
                        </Col>
                      </Col>
                    </Row>
                  )) : this.renderNoResultsFound()
              }
              <Loader loading={loading} />
            </Modal.Body>
          </Scrollbars>
        </Modal>
      </div>
    );
  }
}
