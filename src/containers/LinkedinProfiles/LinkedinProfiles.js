import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push as pushState } from 'react-router-redux';
import { reduxForm } from 'redux-form';
import moment from 'moment';
import { Trans } from 'react-i18next';
import { Scrollbars } from 'react-custom-scrollbars';
import Helmet from 'react-helmet';
import { toastr } from 'react-redux-toastr';
import { getSearchProfileConfig } from '../../formConfig/LinkedinSearchConfig';
import {
  loadLinkedinProfiles,
  loadProfilesBySearch,
  getSimilarCandidate,
  cleanLinkedinProfiles,
  setCandidateData,
  deleteLinkedinCandidate
} from '../../redux/modules/linkedinProfiles/linkedinProfiles';
import SearchBar from '../../components/FormComponents/SearchBar';
import CheckDuplicationForm from '../../components/ResumeForm/CheckDuplicationForm';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import i18n from '../../i18n';

const styles = require('./LinkedinProfiles.scss');

@reduxForm({
  form: 'searchProfile'
})
@connect(state => ({
  linkedinProfiles: state.linkedinProfiles.linkedinProfiles,
  totalCount: state.linkedinProfiles.totalCount,
  user: state.auth.user,
}), {
  loadLinkedinProfiles,
  pushState,
  loadProfilesBySearch,
  getSimilarCandidate,
  cleanLinkedinProfiles,
  setCandidateData,
  deleteLinkedinCandidate
})
export default class LinkedinProfiles extends Component {
  static propTypes = {
    linkedinProfiles: PropTypes.object.isRequired,
    loadLinkedinProfiles: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    loadProfilesBySearch: PropTypes.func.isRequired,
    getSimilarCandidate: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    cleanLinkedinProfiles: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    setCandidateData: PropTypes.func.isRequired,
    deleteLinkedinCandidate: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      searchStrVal: '',
      isCheckDuplicationFormEnabled: false,
      currentCandidate: {},
      skip: 0,
      limit: 20
    };
  }

  componentWillMount() {
    const { skip, limit } = this.state;
    const filter = {
      limit,
      skip
    };
    this.props.loadLinkedinProfiles(filter).then(() => { }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'), error.error.message);
    });
  }

  getProfileById = () => {
    const { searchStrVal } = this.state;
    if (searchStrVal && searchStrVal !== '') {
      this.setState({
        skip: 10,
        limit: 10,
        searchTerm: searchStrVal
      }, () => {
        this.props.loadProfilesBySearch({
          skip: 0,
          limit: 10,
          searchTerm: searchStrVal
        }, true).then(() => { }, error => {
          toastrErrorHandling(error.error, i18n.t('ERROR'), error.error.message);
        });
      });
    } else {
      this.setState({
        limit: 20,
        skip: 0
      }, () => {
        this.props.loadLinkedinProfiles({
          limit: 20,
          skip: 0
        }).then(() => { }, error => {
          toastrErrorHandling(error.error, i18n.t('ERROR'), error.error.message);
        });
      });
    }
  }

  getIconClass = source => {
    if (source) {
      if (source === 'linkedin') return 'fa fa-linkedin';
      if (source === 'xing') return 'fa fa-xing';
    } else {
      return '';
    }
  }

  resetSearch = () => {
    this.setState({
      searchStrVal: '',
    });
    this.props.loadLinkedinProfiles({
      limit: 20,
      skip: 0
    }).then(() => { }, error => {
      toastrErrorHandling(error.error, i18n.t('ERROR'), error.error.message);
    });
  }

  changeSearchValue = evt => {
    const value = evt.target.value.replace(/\s\s+/g, ' ');
    if (value === this.state.searchStrVal || value === ' ') return;
    if (/^[A-z\d\s-]+$/i.test(value) || value === '') {
      this.setState({
        searchStrVal: value,
      });
    }
  }

  saveCandidate = profile => {
    const { user } = this.props;
    profile.profileData.created_user = `${user.firstName} ${user.lastName}`;
    profile.profileData.updated_user = `${user.firstName} ${user.lastName}`;
    const candidate = {
      name: profile.profileData.name,
      email: profile.profileData &&
        profile.profileData.contacts &&
        profile.profileData.contacts.emails,
      mobileNumber: profile.profileData &&
        profile.profileData.contacts &&
        profile.profileData.contacts.mobile_numbers
    };
    this.props.getSimilarCandidate(candidate).then(result => {
      this.props.setCandidateData({
        candidateData: profile.profileData,
        linkedinProfile: profile,
        isLinkedinProfile: true
      });
      if (result && result.hits && result.hits && result.hits.total > 0) {
        this.setState({
          isDuplicateListEnabled: true,
          isCheckDuplicationFormEnabled: true,
          currentCandidate: profile.profileData,
          currentProfile: profile
        });
      } else {
        this.props.pushState({
          pathname: '/Resume'
        });
      }
    });
  }

  removeCandidate = profile => {
    const toastrConfirmOptions = {
      onOk: () => {
        profile.isDeleted = true;
        this.props.deleteLinkedinCandidate(profile).then(() => {
          toastr.success(i18n.t('successMessage.DELETION_SUCCESS'),
            i18n.t('successMessage.PROFILE_HAS_BEEN_DELETED_SUCCESSFULLY'));
        }, error => {
          toastrErrorHandling(error.error, i18n.t('ERROR'), error.error.message);
        });
      },
      okText: i18n.t('YES'),
      cancelText: i18n.t('NO')
    };
    toastr.confirm(i18n.t('confirmMessage.ARE_YOU_SURE_TO_DELETE'), toastrConfirmOptions);
  }

  toggleCheckDuplicationForm = () => {
    this.setState({
      isCheckDuplicationFormEnabled: !this.state.isCheckDuplicationFormEnabled
    });
  }

  handleScrollUpdate = values => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const pad = 100; // 100px of the bottom
    // t will be greater than 1 if we are about to reach the bottom
    if (clientHeight < scrollHeight) {
      const t = ((scrollTop + pad) / (scrollHeight - clientHeight));
      if (t > 1) {
        this.activityScroll();
      }
    }
  }

  activityScroll = () => {
    const { totalCount, linkedinProfiles } = this.props;
    if (totalCount > linkedinProfiles.length) {
      const skip = linkedinProfiles.length;
      this.setState({
        limit: 10,
        skip
      }, () => {
        const { limit, searchStrVal } = this.state;
        if (searchStrVal && searchStrVal !== '') {
          this.props.loadProfilesBySearch({
            skip: this.state.skip,
            limit,
            searchTerm: searchStrVal
          }).then(() => { }, error => {
            toastrErrorHandling(error.error, i18n.t('ERROR'), error.error.message);
          });
        } else {
          this.props.loadLinkedinProfiles({
            limit,
            skip: this.state.skip
          }).then(() => {}, error => {
            toastrErrorHandling(error.error, i18n.t('ERROR'), error.error.message);
          });
        }
      });
    }
  }

  renderNoResultsFound = () => {
    const NoResultsFound = (
      <Col className={styles.no_results_found}>
        <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
        <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_PROFILES_FOUND</Trans></div></Row>
        <Row className={`${styles.empty_message} m-0`}>
          <div><Trans>MODIFY_SEARCH_TO_GET_RESULT</Trans></div>
        </Row>
      </Col>
    );
    return NoResultsFound;
  }

  render() {
    const { linkedinProfiles, totalCount } = this.props;
    const searchProfile = getSearchProfileConfig(this);
    const { isCheckDuplicationFormEnabled, isDuplicateListEnabled, currentCandidate, currentProfile } = this.state;
    return (
      <Row className="m-0">
        <Helmet title={i18n.t('SOURCED_PROFILES')} />
        <Col mdOffset={1} lgOffset={1} md={10} lg={10} style={{ marginTop: '60px' }}>
          <div className={styles.count_n_search}>
            <div className={styles.total_count}>
              <span>{totalCount && totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              {totalCount && totalCount < 2 ?
                <span className="p-r-10"><Trans>CANDIDATE</Trans></span> :
                <span className="p-r-10"> <Trans>CANDIDATES</Trans></span>
              }
              <span>|</span>
            </div>
            <div className={styles.search_bar}>
              <SearchBar {...searchProfile.fields[0]} />
            </div>
          </div>
          <Scrollbars
            universal
            autoHide
            autoHeight
            autoHeightMin={'calc(100vh - 190px)'}
            autoHeightMax={'calc(100vh - 190px)'}
            renderThumbHorizontal={props => <div {...props} className="hide" />}
            renderView={props => <div {...props} className="customScroll" />}
            onUpdate={this.handleScrollUpdate}
          >
            {linkedinProfiles &&
              linkedinProfiles.length > 0 ?
              linkedinProfiles.map(linkedinProfile =>
                (<ProfileTile
                  profile={linkedinProfile}
                  saveCandidate={this.saveCandidate}
                  removeCandidate={this.removeCandidate}
                  getIconClass={this.getIconClass}
                />)) : this.renderNoResultsFound()
            }
          </Scrollbars>
        </Col>
        <CheckDuplicationForm
          isCheckDuplicationFormEnabled={isCheckDuplicationFormEnabled}
          onClose={this.toggleCheckDuplicationForm}
          isDuplicateListEnabled={isDuplicateListEnabled}
          linkedinCandidate={currentCandidate}
          profile={currentProfile}
          isLinkedinCandidate
        />
      </Row>
    );
  }
}

const getHeadline = profileData => {
  if (profileData && profileData.experiences && profileData.experiences[0] && profileData.experiences[0].title) {
    const title = profileData.experiences[0].title && profileData.experiences[0].title;
    const company = profileData.experiences[0].company_name && ` at ${profileData.experiences[0].company_name}`;
    return `${title}${company}`;
  } else if (profileData.headline) {
    return profileData.headline;
  }
};

const ProfileTile = properties => {
  const { profile, saveCandidate, removeCandidate, getIconClass } = properties;
  const profileData = profile.profileData;
  const nameArr = profile &&
    profile.name &&
    profile.name.split(' ');
  let imgAlt = '';
  if (nameArr) {
    if (nameArr.length > 1) {
      imgAlt = `${nameArr[0][0]}${nameArr[1][0]}`;
    } else {
      imgAlt = `${nameArr[0][0]}${nameArr[0][1]}`;
    }
  }
  return (
    <Row className={`${styles.linkedinProfiles} m-0`}>
      <Col md={5} lg={5} className={styles.container}>
        <div className={styles.imgContainer}>
          {profileData.profileImg ?
            <img
              src={profileData.profileImg}
              alt={profileData.name}
              className={styles.profileImg}
            /> :
            <div className={styles.profileImgAlt}>
              {imgAlt.toUpperCase()}
            </div>
          }
        </div>
        <div className={styles.detailsContainer}>
          <div className={styles.primaryText}>
            {profileData.name}
          </div>
          <div className={styles.secondaryText}>
            {getHeadline(profileData)}
          </div>
        </div>
      </Col>
      <Col md={7} lg={7} className={styles.container}>
        <Row>
          <Col md={6} lg={6} sm={5}>
            <div className={styles.addedDetails}>
              <div style={{ position: 'absolute', fontSize: '25px' }}>
                <i className={getIconClass(profile.source)} style={{ marginTop: '5px' }} />
              </div>
              <div style={{ paddingLeft: '35px' }}>
                <div className={styles.primaryText}>
                  {profile.createdBy &&
                    `${i18n.t('SOURCED_BY')} ${profile.createdBy}`
                  }
                </div>
                <div className={styles.secondaryText}>
                  {profile.createdAt &&
                    moment(profile.createdAt).fromNow()
                  }
                </div>
              </div>
            </div>
          </Col>
          <Col md={6} lg={6} className={styles.btn_container}>
            <button
              onClick={() => removeCandidate(profile)}
              className={`btn button-secondary ${styles.remove_btn}`}
            >
              <i className="fa fa-trash-o p-r-5" aria-hidden="true" />
              <Trans>REMOVE</Trans>
            </button>
            <button
              onClick={() => saveCandidate(profile)}
              className={`button-primary ${styles.add_btn}`}
            >
              <Trans>ADD_CANDIDATE</Trans>
            </button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
