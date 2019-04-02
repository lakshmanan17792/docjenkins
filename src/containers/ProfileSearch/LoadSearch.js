import React, { Component } from 'react';
import { Modal, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import Moment from 'moment';
import { toastr } from 'react-redux-toastr';
import { Scrollbars } from 'react-custom-scrollbars';
import { push as pushState } from 'react-router-redux';
import { reduxForm, getFormValues, propTypes } from 'redux-form';
import { getOpeningFormConfig } from '../../formConfig/LoadSearch';
import SearchBox from '../../components/FormComponents/SearchBox';
import styles from './ProfileSearch.scss';
import { loadSavedSearch, deleteSavedSearch } from '../../redux/modules/profile-search';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

@reduxForm(props => ({
  form: props.id
}))
@connect((state, props) => ({
  user: state.auth.user,
  values: getFormValues(props.form)(state),
  openLoadSearchModal: state.profileSearch.openLoadSearchModal
}), {
  pushState,
  loadSavedSearch,
  deleteSavedSearch
})
class LoadSearch extends Component {
  static propTypes = {
    ...propTypes,
    openLoadSearchModal: PropTypes.oneOfType([
      PropTypes.fun,
      PropTypes.bool
    ]),
    closeModal: PropTypes.func.isRequired,
  }
  static defaultProps = {
    openLoadSearchModal: null,
  }
  constructor(props) {
    super(props);
    this.state = {
      alreadyOnCall: false,
      totalCount: 0,
      searchVal: '',
      limit: 10,
      page: -10,
      show: false,
      currentView: 'LoadInfo',
      initialParam: 'initial',
      selectedSearchId: -1,
      selectedSavedSearch: null,
      searchList: []
    };
  }

  componentWillMount() {
    this.intialize('');
  }

  setSearchTerm = evt => {
    const searchVal = evt.target.value;
    if (this.state.searchVal !== searchVal) {
      this.setState({
        searchVal,
        searchList: [],
        page: -10
      }, () => {
        this.intialize();
      });
    }
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
          searchTerm: this.state.searchVal,
          order: 'createdAt DESC'
        }).then(savedSearchList => {
          this.setState({
            alreadyOnCall: false,
            totalCount: savedSearchList.count,
            searchList: [...this.state.searchList, ...savedSearchList.data],
          });
        }, searchResponse => {
          this.setState({
            alreadyOnCall: false
          });
          if (searchResponse.error.statusCode === 400) {
            toastrErrorHandling(searchResponse.error, i18n.t('errorMessage.LOAD_SEARCH'),
              searchResponse.error.message, { removeOnHover: true });
          } else {
            toastrErrorHandling(searchResponse.error, i18n.t('errorMessage.LOAD_SEARCH'),
              i18n.t('errorMessage.COULD_NOT_LOAD_PROFILE_SEARCHES'),
              { removeOnHover: true });
          }
        });
      });
    }
  }

  closeModal = evt => {
    if (evt) {
      evt.stopPropagation();
    }
    this.props.closeModal();
  }

  selectSearch = searchId => {
    this.setState({
      selectedSearchId: searchId
    }, () => {
      this.loadSelectedSearch();
    });
  }

  loadSelectedSearch = () => {
    const { selectedSearchId, searchList } = this.state;
    searchList.forEach(value => {
      if (value.id && value.id === selectedSearchId) {
        this.setState({
          selectedSavedSearch: value
        });
      }
    });
  }

  redirectToProfileSearch = searchId => {
    sessionStorage.removeItem('profilefilters');
    this.props.pushState({ pathname: '/ProfileSearch', query: { searchId } });
  }

  deleteSearch = searchId => {
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_SAVED_SEARCH'), {
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO'),
      onOk: () => {
        this.props.deleteSavedSearch(searchId).then(() => {
          toastr.success(i18n.t('successMessage.DELETED'),
            i18n.t('successMessage.THE_FILTER_SEARCH_HAS_BEEN_DELETED_SUCCESSFULLY'));
          this.setState({
            searchList: [],
            selectedSearchId: -1,
            selectedSavedSearch: null,
            page: -10
          }, () => {
            this.intialize();
          });
        });
      }
    });
  }

  loadProfileSearch = () => {
    const { selectedSearchId } = this.state;
    this.redirectToProfileSearch(selectedSearchId);
  }

  resetSearch = () => {
    this.setState({
      searchVal: '',
      searchList: [],
      page: -10
    }, () => {
      this.intialize();
    });
  }

  searchScroll = () => {
    const { searchList, totalCount } = this.state;
    if (searchList.length < totalCount || totalCount === 0) {
      this.intialize();
    }
  }
  showExperience = selectedSavedSearch => {
    let exp = '';
    if (selectedSavedSearch.experience[0] === selectedSavedSearch.experience[1]) {
      exp = `${selectedSavedSearch.experience[0]}`;
    } else {
      exp = `${selectedSavedSearch.experience[0]}
       to ${selectedSavedSearch.experience[1]}`;
    }
    return exp;
  }

  render() {
    const filterConfig = getOpeningFormConfig(this);
    const { searchList, selectedSavedSearch, selectedSearchId, searchVal } = this.state;
    return (
      <Modal
        show={this.props.openLoadSearchModal}
        onHide={this.closeModal}
        className={`${styles.load_search}`}
      >
        <Modal.Header className={`${styles.modal_header}`}>
          <Col sm={12} lg={12} className="p-t-10">
            <Modal.Title className={`${styles.modal_title} text-left`}>
              <Trans>LOAD_SEARCH</Trans>
              <span
                className="right"
                role="button"
                tabIndex="-1"
                onClick={this.closeModal}
              >
                <i className="fa fa-close" />
              </span>
            </Modal.Title>
          </Col>
        </Modal.Header>
        <Modal.Body className={`${styles.modal_body}`}>
          <Row className="border-b">
            <Col sm={12} lg={12} className="p-0">
              {/* Start:Left Bar */}
              <Col sm={4} lg={4} className="p-0 border-r">
                <Col sm={12} lg={12} className="p-8 border-b">
                  <SearchBox
                    {...filterConfig.searchInput}
                    reset={e => this.resetSearch(e)}
                    handleOnChange={e => this.setSearchTerm(e)}
                    inpValue={searchVal}
                  />
                </Col>
                <Col sm={12} lg={12} className="p-0">
                  <Scrollbars
                    universal
                    autoHide
                    autoHeight
                    onUpdate={({ top }) => {
                      if (top === 1) {
                        this.searchScroll();
                      }
                    }}
                    autoHeightMin={'calc(100vh - 255px)'}
                    autoHeightMax={'calc(100vh - 255px)'}
                    renderThumbHorizontal={props => <div {...props} className="hide" />}
                    renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
                  >
                    <ul className={styles.search_list}>
                      {
                        searchList && searchList.length ?
                          searchList.map(search => (
                            <li
                              key={Math.random().toString(36).substring(7)}
                              className={selectedSearchId === search.id ? styles.active : ''}
                            >
                              <div
                                onClick={() => this.selectSearch(search.id)}
                                role="button"
                                tabIndex="-1"
                              >
                                <Col sm={12} lg={12} className={`${styles.p_r_10}`}>
                                  <h4>{search.name}</h4>
                                  <Col sm={12} lg={12} className="p-0 rigth m-t-5">
                                    <span>
                                      <p title={i18n.t('tooltipMessage.CREATED_AT')} className="f-10 right m-0">
                                        <i className="fa fa fa-clock-o f-10" />&nbsp;
                                        {Moment(search.createdAt).format('DD MMM YYYY hh:mm a')}
                                      </p>
                                    </span>
                                  </Col>
                                </Col>
                              </div>
                            </li>
                          )) : <div className="text-center"> No Result Found </div>
                      }
                    </ul>
                  </Scrollbars>
                </Col>
              </Col>
              {/* End:Left Bar */}
              {/* Start:Rigth Bar */}
              <Col sm={8} lg={8} className="p-0">
                {
                  selectedSavedSearch !== null ?
                    <div>
                      <Col sm={12} lg={12} className="p-6">
                        <Col sm={6} lg={6} className="p-0 right">
                          <Row>
                            <NewPermissible operation={{ operation: 'DELETE', model: 'profileSearch' }}>
                              <Col sm={6} className={`${styles.load_action} p-0`}>
                                <button
                                  onClick={() => this.deleteSearch(selectedSavedSearch.id)}
                                  className="btn btn-sm btn-border filter-btn"
                                >
                                  <i className="fa fa-trash-o" />
                                  <Trans>DELETE</Trans>
                                </button>
                              </Col>
                            </NewPermissible>
                            <Col sm={6} className={`${styles.load_action} p-0`}>
                              <button
                                onClick={this.loadProfileSearch}
                                className="btn btn-sm btn-border filter-btn orange-btn"
                              >
                                <i className="fa fa-arrow-circle-o-right" />
                                <Trans>LOAD</Trans>
                              </button>
                            </Col>
                          </Row>
                        </Col>
                      </Col>
                      <Col sm={12} lg={12} className="p-0 p-l-10 border-t">
                        <h4 className="text-center orange break-word">{selectedSavedSearch.name}</h4>
                        <Scrollbars
                          universal
                          autoHide
                          autoHeight
                          autoHeightMin={'calc(100vh - 275px)'}
                          autoHeightMax={'calc(100vh - 275px)'}
                          renderThumbHorizontal={props => <div {...props} className="hide" />}
                          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
                        >
                          <div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>SKILL</Trans></h4>
                              <ul>
                                {
                                  selectedSavedSearch.skills && selectedSavedSearch.skills.length ?
                                    selectedSavedSearch.skills.map(skill => (
                                      <li key={Math.random().toString(36).substring(7)}>
                                        {skill.name}
                                      </li>
                                    )) : null
                                }
                              </ul>
                            </div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>KEYWORDS</Trans></h4>
                              <ul>
                                {selectedSavedSearch.keywords ?
                                  <li>
                                    {selectedSavedSearch.keywords}
                                  </li>
                                  : null
                                }
                              </ul>
                            </div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>LANGUAGES</Trans></h4>
                              <ul>
                                {
                                  selectedSavedSearch.languages &&
                                    selectedSavedSearch.languages.length ?
                                    selectedSavedSearch.languages.map(language => (
                                      <li key={Math.random().toString(36).substring(7)}>
                                        {language.name}
                                      </li>
                                    )) : null
                                }
                              </ul>
                            </div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>LOCATION</Trans></h4>
                              <ul>
                                {
                                  selectedSavedSearch.location && selectedSavedSearch.location.length ?
                                    selectedSavedSearch.location.map(location => (
                                      <li key={Math.random().toString(36).substring(7)}>
                                        {location.name}
                                      </li>
                                    )) : null
                                }
                              </ul>
                            </div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>LOCATION_RADIUS</Trans></h4>
                              <ul>
                                {selectedSavedSearch.preferredRadius ?
                                  <li>
                                    {selectedSavedSearch.preferredRadius}
                                  </li>
                                  : null
                                }
                              </ul>
                            </div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>EXPERIENCE</Trans></h4>
                              <ul className={styles.search_fileds}>
                                {
                                  selectedSavedSearch.experience
                                  && selectedSavedSearch.experience.length ?
                                    <li>
                                      {this.showExperience(selectedSavedSearch)}
                                    </li>
                                    : null
                                }
                              </ul>
                            </div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>POSITIONS</Trans></h4>
                              <ul>
                                {
                                  selectedSavedSearch.positions
                                  && selectedSavedSearch.positions.length ?
                                    selectedSavedSearch.positions.map(position => (
                                      <li key={Math.random().toString(36).substring(7)}>
                                        {position.name}
                                      </li>
                                    )) : null
                                }
                              </ul>
                            </div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>COMPANY</Trans></h4>
                              <ul className={styles.search_fileds}>
                                {
                                  selectedSavedSearch.companies
                                  && <li>
                                    {
                                      selectedSavedSearch.companies.name ||
                                      selectedSavedSearch.companies.name
                                    }
                                  </li>
                                }
                              </ul>
                            </div>
                            <div className={styles.search_fileds}>
                              <h4><Trans>SOURCE</Trans></h4>
                              <ul>
                                {
                                  selectedSavedSearch.source && selectedSavedSearch.source.length ?
                                    selectedSavedSearch.source.map(source => (
                                      <li key={Math.random().toString(36).substring(7)}>
                                        {source.id}
                                      </li>
                                    )) : null
                                }
                              </ul>
                            </div>
                          </div>
                        </Scrollbars>
                      </Col>
                    </div> : <div className="text-center"> <Trans>PLEASE_SELECT_A_SAVED_SEARCH_FROM_LIST</Trans></div>
                }
              </Col>
              {/* End:Rigth Bar */}
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    );
  }
}
export default LoadSearch;
