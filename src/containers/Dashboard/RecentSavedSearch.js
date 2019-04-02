import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import { Trans } from 'react-i18next';
import moment from 'moment';
import styles from './dashboard.scss';
import { loadSavedSearch } from '../../redux/modules/profile-search';
import i18n from '../../i18n';

@connect(state => ({
  loading: state.profileSearch.loading
}), {
  loadSavedSearch
})
export default class RecentSavedSearch extends Component {
  static propTypes = {
    showErr: PropTypes.func.isRequired,
    loadSavedSearch: PropTypes.func,
    loading: PropTypes.bool,
    showIcon: PropTypes.bool
  }

  static defaultProps = {
    loadSavedSearch: null,
    loading: false,
    showIcon: false
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      alreadyOnCall: false,
      totalCount: 0,
      limit: 10,
      page: -10,
      searchList: []
    };
  }

  componentWillMount() {
    this.intialize();
  }

  intialize = () => {
    const { alreadyOnCall } = this.state;
    if (!alreadyOnCall) {
      this.setState({
        page: this.state.page + 10,
        alreadyOnCall: true
      }, () => {
        this.props.loadSavedSearch({
          skip: this.state.page,
          limit: this.state.limit,
          searchTerm: '',
          order: 'createdAt DESC'
        }).then(savedSearchList => {
          this.setState({
            loading: savedSearchList.loading,
            alreadyOnCall: false,
            totalCount: savedSearchList.count,
            searchList: [...this.state.searchList, ...savedSearchList.data],
          });
        }, () => {
          this.setState({
            alreadyOnCall: false
          });
          this.props.showErr('Could not load actvities');
        });
      });
    }
  }

  reload = () => {
    this.setState({
      loading: false,
      page: -10,
      searchList: [],
      totalCount: 0,
      alreadyOnCall: false
    }, () => {
      this.intialize();
    });
  }

  renderNoResultsFound = () => {
    const { searchList } = this.state;
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_RESULTS_FOUND</Trans></div></Row>
      </Col>
    );
    const loader = (
      <div className="loading_overlay">
        <div className="loader-circle">
          <i className="fa fa-circle-o-notch fa-spin" />
        </div>
      </div>
    );
    if (this.props.loading) {
      return loader;
    } else if (!searchList || Object.keys(searchList).length === 0) {
      return NoResultsFound;
    }
    // return NoResultsFound;
  }

  render() {
    const { searchList } = this.state;
    const { showIcon } = this.props;

    return (
      <Col sm={12} className={`p-0 ${styles.upcoming_dues}`}>
        <Col sm={12} className={`${styles.dashboard_card_header}`} >
          <Col sm={8} className="p-0" >
            <h4>
              {showIcon && <i className="fa fa-bookmark-o" />}
              <Trans>RECENT_SAVED_SEARCH</Trans> </h4>
          </Col>
          <Col sm={4} className="p-0 right">
            <i
              className={`fa fa-repeat orange right ${styles.reload_activities}`}
              title={i18n.t('tooltipMessage.RELOAD')}
              role="button"
              aria-hidden="true"
              onClick={() => this.reload()}
            />
          </Col>
        </Col>
        <Scrollbars
          universal
          autoHide
          autoHeight
          onUpdate={({ top }) => {
            if (top === 1) {
              this.searchScroll();
            }
          }}
          autoHeightMin={'calc(52vh - 118px)'}
          autoHeightMax={'calc(52vh - 118px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <Col sm={12} className={`p-0 ${styles.dashboard_card_body}`} >
            {
              searchList && searchList.length ?
                searchList.map(searchData => (
                  <Col key={`searchData_${searchData.id}`} sm={12} className={`p-0 ${styles.upcoming_dates}`} >
                    <ul>
                      <li key={searchData.id}>
                        <Col sm={12} className={`p-0 ${styles.list_dates}`} >
                          <p className="text-capitalize">
                            <Link
                              to={{ pathname: '/ProfileSearch', query: { searchId: `${searchData.id}` } }}
                            >
                              <div className={styles.ellipsis} title={searchData.name}>
                                {searchData.name}
                              </div>
                            </Link>
                          </p>
                          <p className="p-t-5">
                            <span className="right" title={i18n.t('tooltipMessage.CREATED_AT')}>
                              <i className="fa fa-clock-o" />&nbsp;
                              {moment(searchData.createdAt).format('DD MMM YYYY hh:mm a')}
                            </span>
                          </p>
                        </Col>
                      </li>
                    </ul>
                  </Col>
                )) :
                ''
            }
          </Col>
          {this.renderNoResultsFound()}
        </Scrollbars>
      </Col>
    );
  }
}
