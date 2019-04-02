import React, { Component } from 'react';
import { Col, Row, OverlayTrigger, Tooltip as CustomTooltip, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router';
import CircularProgressbar from 'react-circular-progressbar';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import Tooltip from 'rc-tooltip';
import { toastr } from 'react-redux-toastr';
import { push as route } from 'react-router-redux';
import 'rc-tooltip/assets/bootstrap_white.css';
import styles from './profile.scss';
import { saveJobProfile, removeCandidateFromJobProfile } from '../../redux/modules/openings';
import socialIcons from '../../utils/utils';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import { formatDomainName } from '../../utils/validation';
import i18n from '../../i18n';

@connect(state => ({
  selectedOpening: state.openings.selectedOpening || {},
  candidateSelected: state.openings.candidateSelected,
  candidateRemoved: state.openings.candidateRemoved
}), { saveJobProfile, removeCandidateFromJobProfile, route })
export default class Profile extends Component {
  static propTypes = {
    profile: PropTypes.object.isRequired,
    isBestMatch: PropTypes.bool.isRequired,
    selectedOpening: PropTypes.object.isRequired,
    saveJobProfile: PropTypes.func.isRequired,
    removeCandidateFromJobProfile: PropTypes.func.isRequired,
    jobId: PropTypes.string,
    selectProfile: PropTypes.func.isRequired,
    route: PropTypes.func.isRequired,
    filters: PropTypes.object,
    user: PropTypes.object,
    selectedProfiles: PropTypes.array
  }

  static defaultProps = {
    jobProfile: null,
    jobId: '',
    candidateSelected: null,
    candidateRemoved: null,
    filters: {},
    user: {},
    selectedProfiles: []
  }

  constructor(props) {
    super(props);
    this.state = {
      showCheckbox: false
    };
  }

  getEarlyCompanyList = (experiences, currentCompanyName) => {
    const earlierCompanyList = [];
    experiences.forEach(experience => {
      if (experience.company_name && experience.company_name !== currentCompanyName) {
        earlierCompanyList.push(experience.company_name);
      }
    });
    return earlierCompanyList.length ? earlierCompanyList.join(', ') : 'Unavailable';
  }

  showCheckbox = () => {
    this.setState({ showCheckbox: true });
  }

  hideCheckbox = () => {
    this.setState({ showCheckbox: false });
  }

  canShowCheckBox = () => {
    const { showCheckbox } = this.state;
    const { selectedProfiles } = this.props;
    return (selectedProfiles && selectedProfiles.length > 0) || showCheckbox;
  }

  addCandidates = (event, profile) => {
    profile.isChecked = event.target.checked;
    this.props.profile.isChecked = event.target.checked;
    this.props.selectProfile(profile);
  }

  saveJobProfile = (resumeId, resumeProfileId) => {
    const { selectedOpening } = this.props;
    if (selectedOpening && selectedOpening.status === 'active') {
      const data = {
        jobId: selectedOpening.id,
        jobTitle: selectedOpening.jobTitle,
        resumeId,
        resumeProfileId,
        status: 'Selected'
      };
      if (!this.state.loading) {
        this.setState({ loading: true }, () => {
          this.props.saveJobProfile(data).then(() => {
            this.setState({ loading: false });
            toastr.success(i18n.t('successMessage.CANDIDATE_SELECTED'),
              i18n.t('successMessage.CANDIDATE_SELECTED_FOR_JOB_OPENING_SUCCESSFULLY'));
          }, error => {
            toastrErrorHandling(error.error, i18n.t('errorMessage.ERROR'),
              i18n.t('errorMessage.COULD_NOT_SELECT_CANDIDATE_FOR_JOB_OPENING'));
          });
        });
      }
    } else {
      toastrErrorHandling({}, i18n.t('NOTIFICATION'),
        i18n.t('errorMessage.CHANGE_THE_STATUS_AS_ACTIVE_FOR_ADDING_MORE_PROFILES')
      );
    }
  }

  removeCandidateFromJobProfile = resumeId => {
    const { selectedOpening } = this.props;
    if (!this.state.loading) {
      this.setState({ loading: true }, () => {
        this.props.removeCandidateFromJobProfile(selectedOpening.id, resumeId).then(() => {
          this.setState({ loading: false });
          toastr.success(i18n.t('successMessage.CANDIDATE_REMOVED'),
            i18n.t('successMessage.CANDIDATE_REMOVED_SUCCESSFULLY'), { removeOnHover: true });
        }, error => {
          toastrErrorHandling(error.error, i18n.t('ERROR'), i18n.t(
            'errorMessage.COULD_NOT_REMOVE_CANDIDATE_FROM_JOB_OPENING'), { removeOnHover: true });
        });
      });
    }
  }

  openEditModal = (e, id) => (
    this.props.route(`/EditCandidate/${id}`)
  );


  sendEmail = (profileId, email) => {
    const { user, selectedOpening } = this.props;
    const profiles = [{
      id: profileId,
      email: email[0]
    }];
    if (user.isMailConfigured) {
      this.props.route({ pathname: '/Emailer', state: { candidates: profiles, from: 'profileSearch' } });
    } else {
      toastr.info(i18n.t('infoMessage.PLEASE_CONFIGURE_YOUR_MAIL'));
      localStorage.setItem('emailFromHistoryInfo',
        JSON.stringify({ from: 'ProfileSearch', jobId: selectedOpening ? selectedOpening.id : '' }));
      this.props.route({ pathname: '/EmailConfig' });
    }
  }

  /* renderCurrentTitle = title => {
    let titleAndCompany = 'Title Unavailable';
    if (title) {
      titleAndCompany = (`${title}`);
      const candidateTitle = (
        <div className={`${styles.txt_overflow}`}>{titleAndCompany}</div>
      );
      return candidateTitle;
    }
    const candidateTitleUnavailable = (
      <span className={styles.title_unavailable}>{titleAndCompany}</span>
    );
    return candidateTitleUnavailable;
  // } */

  renderOverallScore = scores => {
    const overallScore = (
      <div className="container-fluid">
        <Row className={styles.score_block} style={{ paddingTop: '15px' }}>
          <Col lg={4} md={4} sm={4} xs={4} className={`${styles.profile_card} m-0`}>
            <div className={`${styles.score_circle} score-text-font`}>
              <CircularProgressbar
                percentage={(scores && scores.overall_score) ? Math.round(scores.overall_score * 100) : 0}
                className="progressbar-blue"
              />
            </div>
            <Col lg={4} md={4} sm={4} xs={4} className={styles.score_text}>
              <Trans>OVERALL</Trans>
            </Col>
          </Col>
          <Col lg={4} md={4} sm={4} xs={4} className={`${styles.profile_card} m-0`}>
            <div className={`${styles.score_circle} score-text-font`}>
              <CircularProgressbar
                percentage={(scores && scores.skill_score) ? Math.round(scores.skill_score * 100) : 0}
                className="progressbar-blue"
              />
            </div>
            <Col lg={4} md={4} sm={4} xs={4} className={styles.score_text}>
              <Trans>SKILL</Trans>
            </Col>
          </Col>
          <Col lg={4} md={4} sm={4} xs={4} className={`${styles.profile_card} m-0`}>
            <div className={`${styles.score_circle} score-text-font`}>
              <CircularProgressbar
                percentage={(scores && scores.mobility_score) ? Math.round(scores.mobility_score * 100) : 0}
                className="progressbar-blue"
              />
            </div>
            <Col lg={4} md={4} sm={4} xs={4} className={styles.score_text}>
              <Trans>CHANGE_PROBABILITY</Trans>
            </Col>
          </Col>
        </Row>
        <Row className={styles.score_block}>
          <Col lg={4} md={4} sm={4} xs={4} className={`${styles.profile_card} m-0`}>
            <div className={`${styles.score_circle} score-text-font`}>
              <CircularProgressbar
                percentage={(scores && scores.company_culture_score) ?
                  Math.round(scores.company_culture_score * 100) : 0}
                className="progressbar-blue"
              />
            </div>
            <Col lg={4} md={4} sm={4} xs={4} className={styles.score_text}>
              <Trans>COMPANY_CULTURE</Trans>
            </Col>
          </Col>
          <Col lg={4} md={4} sm={4} xs={4} className={`${styles.profile_card} m-0`}>
            <div className={`${styles.score_circle} score-text-font`}>
              <CircularProgressbar
                percentage={(scores && scores.pedigree_score) ? Math.round(scores.pedigree_score * 100) : 0}
                className="progressbar-blue"
              />
            </div>
            <Col lg={4} md={4} sm={4} xs={4} className={styles.score_text}>
              <Trans>PEDIGREE</Trans>
            </Col>
          </Col>
          <Col lg={4} md={4} sm={4} xs={4} className={`${styles.profile_card} m-0`}>
            <div className={`${styles.score_circle} score-text-font`}>
              <CircularProgressbar
                percentage={(scores && scores.contactability_score) ? Math.round(scores.contactability_score * 100) : 0}
                className="progressbar-blue"
              />
            </div>
            <Col lg={4} md={4} sm={4} xs={4} className={styles.score_text}>
              <Trans>CONTACTABILITY</Trans>
            </Col>
          </Col>
        </Row>
      </div>
    );
    return overallScore;
  }

  /* renderCurrentComapny = companyName => {
    let currentCompany = 'Current Company Unknown';
    if (companyName) {
      currentCompany = `${companyName}`;
      const currentCandidateCompany = (
        <div className={`${styles.txt_overflow}`}>{currentCompany}</div>
      );
      return currentCandidateCompany;
    }
    const curentCompanyUnavailable = (
      <span className={styles.title_unavailable}>{currentCompany}</span>
    );
    return curentCompanyUnavailable;
  } */

  renderTooltip = msg => {
    const list = [];
    msg.map(title => {
      if (title) {
        list.push(<div key={title} className={styles.tooltip}>{title}</div>);
      }
      return null;
    });
    return (
      <CustomTooltip id={'tooltip'} >
        {list.length > 0 ? list : <Trans>NOT_AVAILABLE</Trans>}
      </CustomTooltip>
    );
  }

  render() {
    const { profile, profile: { currentExperience }, selectedOpening,
      jobId, isBestMatch, selectedProfiles } = this.props;
    const { showCheckbox } = this.state;
    return (
      <Col
        lg={4}
        md={6}
        sm={12}
        xs={12}
        className={`${styles.profile_container_new} ${isBestMatch ? styles.containerHeight : ''}`}
      >
        <div
          className={`${styles.profile_card_new}
          m-b-10 ${profile.isChecked ? styles.selectedBorder : ''}`}
          onMouseEnter={this.showCheckbox}
          onMouseLeave={this.hideCheckbox}
        >

          {/* Profile Logo */}
          <div className={`${styles.profile_logo_container} p-l-15 p-t-15`}>
            {
              ((!showCheckbox && (selectedProfiles && selectedProfiles.length === 0)) ||
              (selectedOpening && selectedOpening.id && jobId)) &&
                <span className={`${styles.profileNameLogo}`}>
                  {profile.firstName && profile.firstName.charAt(0).toUpperCase()}
                  {profile.lastName && profile.lastName.charAt(0).toUpperCase()}
                </span>
            }
            {(showCheckbox || (selectedProfiles && selectedProfiles.length > 0)) &&
              (!selectedOpening || !selectedOpening.id || !jobId) &&
              <div className={`round ${styles.w_44}`}>
                <input
                  type="checkbox"
                  // style={{ width: '15px', height: '15px' }}
                  onChange={e => {
                    if (profile.contacts.emails.length > 0) {
                      this.addCandidates(e, profile);
                    } else {
                      toastrErrorHandling({}, '',
                        i18n.t('errorMessage.THE_PROFILE_CANNOT_BE_SELECTED_SINCE_NO_EMAIL_IS_PROVIDED')
                      );
                    }
                  }}
                  name={profile.isChecked}
                  defaultChecked={profile.isChecked}
                  checked={profile.isChecked || false}
                  id={profile.elasticId}
                />
                <label title={i18n.t('SEND_EMAIL')} htmlFor={profile.elasticId} />
              </div>
            }
            {
              selectedOpening && selectedOpening.id && jobId ?
                <div
                  title={profile.isSelected ? i18n.t('tooltipMessage.SELECTED_CANDIDATE')
                    : i18n.t('tooltipMessage.SELECT_THIS_CANDIDATE')}
                  className={`${styles.add_icon}
                    ${profile.isSelected ? styles.selected : styles.not_selected}`}
                  onClick={profile.isSelected ? () => this.removeCandidateFromJobProfile(profile.id)
                    : () => this.saveJobProfile(profile.id, profile.elasticId)}
                  role="button"
                  tabIndex="-1"
                >
                  <span className={styles.add_circle_icon}>
                    <i className={profile.isSelected ? 'fa fa-check' : 'fa fa-plus'} />
                  </span>
                </div> : ''
            }
            <div className="m-l-10">
              <div
                className={`${styles.profileName}
                ${styles.txt_overflow} ${styles.ellipsis_name}`}
                title={`${profile.firstName} ${profile.lastName}`}
              >
                <Link
                  to={{
                    pathname: `/ProfileSearch/${profile.id}`,
                    query: JSON.stringify({
                      jobId,
                      originalScore: profile.scores ? profile.scores.original_score : '',
                      target_company: profile.scores ? profile.scores.target_company : '',
                      scores: profile.scores,
                      profileId: profile.id,
                      isBestMatch
                    }),
                    state: {
                      skills: this.props.filters && this.props.filters.skills &&
                      this.props.filters.skills.length > 0 ? lodash.map(this.props.filters.skills, 'name') : '',
                    }
                  }}
                >
                  {profile.name}
                </Link>
              </div>
              <div className={`${styles.profileTitleName}`}>
                <div className={`${styles.txt_overflow}`}>{currentExperience.position || ''}</div>
              </div>
            </div>
          </div>

          {/* Company and Location  */}
          <div className={`${styles.companyName} p-l-15`}>
            <div className={`${styles.txt_overflow}`}>{currentExperience.companyName || ''}</div>
          </div>
          <div className={`${styles.locationName} p-l-15`}>
            <div className={`${styles.txt_overflow}`}>
              {profile.address.city || ''}
            </div>
          </div>

          {/* Skills */}
          <div className={`${styles.skillContainer} m-t-10 p-l-15 `}>
            {
              profile.skills && profile.skills.length > 0 ?
                profile.skills.slice(0, 4).map(skill => (
                  <div
                    id={skill.id}
                    key={`skill_${Math.random().toString(36).substring(7)}`}
                    className={styles.skill}
                  >
                    <span className={`${styles.name}`}>{skill.name}</span>
                  </div>
                )) : null
            }
          </div>

          {/* Languages */}
          <div className={`${styles.languageContainer}  p-l-15 `}>
            {
              profile.languages && profile.languages.length > 0 ?
                profile.languages.slice(0, 3).map(language => (
                  <span className={styles.language} key={`language_${Math.random().toString(36).substring(7)}`}>
                    { language.name && <span className={styles.name}>{language.name}</span> }
                  </span>
                )) : null
            }
          </div>
          {
            isBestMatch &&
            <div>
              <hr className={`${styles.divider}`} />
              <Row className={`${styles.percentageContainer} p-l-15 p-r-15`}>
                <Col xs={4} className="custom_progress">
                  <ProgressBar now={
                    profile.scores ? (Math.round(profile.scores.overall_score * 100)) : profile.score
                  }
                  />
                </Col>
                <Col xs={8} className={`${styles.scoreContainer}`}>
                  <span className={`${styles.overAllScore}`}>
                    {
                      profile.scores ? (Math.round(profile.scores.overall_score * 100)) : profile.score
                    } % <Trans>OVERALL_SCORE</Trans>
                  </span>
                  <span className={`${styles.scoreCard}`}>
                    <Tooltip
                      placement="right"
                      overlay={this.renderOverallScore(profile.scores)}
                      arrowContent={<div className="rc-tooltip-arrow-inner" />}
                    >
                      <img
                        src={'./socialIcons/binoculars.svg'}
                        alt="Phone Icon"
                        role="presentation"
                        className={`${styles.scoreImage}`}
                      />
                    </Tooltip>
                  </span>
                </Col>
              </Row>
            </div>
          }
          <hr className={`${styles.divider2}`} />
          <Row className={`${styles.social} p-l-15 p-r-15`}>
            <Col xs={6} className={`${styles.social_1}`}>
              {
                Object.keys(socialIcons).map(socialIcon => (
                  profile[socialIcon] && (
                    <span className={styles.active_link}>
                      <a
                        className={`${styles.social_icon}`}
                        target="_blank"
                        href={`https://${formatDomainName(profile[socialIcon])}`}
                      >
                        <img
                          src={socialIcons[socialIcon].srcImage}
                          alt={socialIcons[socialIcon].alt}
                          title={socialIcons[socialIcon].domain}
                        />
                      </a>
                    </span>)))
              }
            </Col>
            <Col xs={6} className={`${styles.social_2}`}>
              <OverlayTrigger
                rootClose
                overlay={this.renderTooltip(profile.contacts.mobileNumbers.concat(profile.contacts.alternateNumbers))}
                placement="bottom"
              >
                <span className={styles.contact_phone}>
                  <img
                    src={'./socialIcons/phone-outgoing.svg'}
                    alt="Phone Icon"
                    role="presentation"
                    className={profile.contacts.mobileNumbers.length === 0
                      && profile.contacts.alternateNumbers.length === 0 ? styles.notfound : ''}
                  />
                </span>
              </OverlayTrigger>
              <OverlayTrigger
                rootClose
                overlay={this.renderTooltip(profile.contacts.emails)}
                placement="bottom"
              >
                <span className={styles.contact_email}>
                  <img
                    src={'./socialIcons/mail.svg'}
                    alt="Mail Icon"
                    onClick={
                      profile.contacts.emails ? () => this.sendEmail(profile.id, profile.contacts.emails) : null
                    }
                    role="presentation"
                    className={profile.contacts.emails.length === 0 ? styles.notfound : ''}
                  />
                </span>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>
      </Col>
    );
  }
}
