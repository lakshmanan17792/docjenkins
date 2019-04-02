import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import moment from 'moment';
import { toastr } from 'react-redux-toastr';
import { Overlay, Popover } from 'react-bootstrap';
import {
  loadJobDetails,
  archiveJobOpening,
} from '../../redux/modules/job-openings';
import { convertStringFormat, getFullName, getJobType } from '../../utils/jobOpeningUtils';
import styles from './jobOpenings.scss';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';

@connect(state => ({
  jobDetailsLoading: state.jobOpenings.loading,
  jobOpeningId: state.jobOpenings.currentJobId,
  name: state.jobOpenings.name,
  priority: state.jobOpenings.priority,
  vacancies: state.jobOpenings.vacancies,
  type: state.jobOpenings.type,
  startDate: state.jobOpenings.startDate,
  endDate: state.jobOpenings.endDate,
  isAssigned: state.jobOpenings.isAssigned,
  salesReps: state.jobOpenings.salesReps,
  recruiters: state.jobOpenings.recruiters,
  categories: state.jobOpenings.categories,
  openingLocations: state.jobOpenings.openingLocations,
  positions: state.jobOpenings.positions,
  keywords: state.jobOpenings.keywords,
  skills: state.jobOpenings.skills,
  language: state.jobOpenings.language,
  location: state.jobOpenings.location,
  preferredRadius: state.jobOpenings.radius,
  experience: state.jobOpenings.experience,
  sources: state.jobOpenings.sources,
  user: state.auth.user,
  companyId: state.routing.locationBeforeTransitions.query.companyId,
}), { loadJobDetails, archiveJobOpening })
class ViewJobOpening extends React.Component {
  static propTypes = {
    jobOpeningId: PropTypes.number.isRequired,
    loadJobDetails: PropTypes.func.isRequired,
    archiveJobOpening: PropTypes.func.isRequired,
    onAssign: PropTypes.func.isRequired,
    callback: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    name: PropTypes.string,
    vacancies: PropTypes.number,
    type: PropTypes.string,
    priority: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    isAssigned: PropTypes.bool,
    salesReps: PropTypes.array,
    recruiters: PropTypes.array,
    categories: PropTypes.array,
    openingLocations: PropTypes.array,
    positions: PropTypes.array,
    keywords: PropTypes.string,
    skills: PropTypes.array,
    language: PropTypes.array,
    location: PropTypes.array,
    preferredRadius: PropTypes.number,
    experience: PropTypes.string,
    sources: PropTypes.array,
  };

  static defaultProps = {
    name: null,
    vacancies: null,
    type: null,
    priority: null,
    startDate: null,
    endDate: null,
    isAssigned: null,
    salesReps: null,
    recruiters: null,
    categories: null,
    openingLocations: null,
    positions: null,
    keywords: null,
    skills: null,
    language: null,
    location: null,
    preferredRadius: null,
    experience: null,
    sources: null,
  }


  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  componentWillMount() {
    if (this.props.jobOpeningId) {
      this.props.loadJobDetails(this.props.jobOpeningId).then(() => {}, error => {
        toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_JOB_OPENING'), { removeOnHover: true });
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.jobOpeningId !== '' && this.props.jobOpeningId !== nextProps.jobOpeningId) {
      this.props.loadJobDetails(nextProps.jobOpeningId).then(() => {}, error => {
        toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
          i18n.t('errorMessage.COULD_NOT_LOAD_JOB_OPENING'), { removeOnHover: true });
      });
    }
  }
  archiveButton = {};
  archiveJobOpening = () => {
    const { jobOpeningId } = this.props;
    this.props.archiveJobOpening(jobOpeningId).then(() => {
      toastr.success('Archived', 'Job Opening archived successfully');
    }, error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
        i18n.t('errorMessage.COULD_NOT_ARCHIVE_JOB_OPENING.'), { removeOnHover: true });
    });
    this.props.callback();
  };

  /**
   * Render Array of strings as display tags
   * @param label
   * @param array
   * @returns {*}
   */
  renderNextDivOnAvailability = (label, array) => {
    if (array && !_.isEmpty(array)) {
      return (
        <div className={styles.nextContentDiv}>
          <p>{label}</p>
          {array.map(object => this.renderTag(object))}
        </div>
      );
    }
  };

  /**
   * Render tag for string provided
   * @param tag
   * @returns {*}
   */
  renderTag = tag => (
    <div className={styles.jobDetailsViewTag}>
      <p> {tag} </p>
    </div>
  );

  /**
   * Render date range on availability of required fields
   * @returns {*}
   */
  renderDateRange = () => {
    const { startDate, endDate } = this.props;
    if (startDate !== '' && endDate !== '') {
      return (
        <div className={`${styles.dateRange} ${styles.nextContentDiv}`}>
          <div>
            <span className={styles.date}>{moment(startDate).format('Do MMMM YYYY')}</span>
            <p> Start Date </p>
          </div>
          <div className={styles.dateRangeLiner}>
            <span />
            <div />
            <span style={{ textAlign: 'right' }} />
          </div>
          <div>
            <span className={styles.date}>{moment(endDate).format('Do MMMM YYYY')}</span>
            <p> End Date </p>
          </div>
        </div>
      );
    }
  };

  /**
   * Render location and experience on availability
   * @returns {*}
   */
  renderCards = () => {
    const { preferredRadius, experience } = this.props;
    if (preferredRadius !== 0 && experience !== '') {
      return (
        <div className={`${styles.nextContentDiv} ${styles.jobCards}`}>
          <div>
            <p>{preferredRadius} kms</p>
            <span>Location radius</span>
          </div>
          <div>
            <p> {experience} years </p>
            <span>Experience</span>
          </div>
        </div>
      );
    }
  };

  renderAssignedRecruiters = () => {
    const { recruiters, onAssign } = this.props;
    return (
      <div className={`${styles.nextContentDiv} ${styles.alterOption}`}>
        <p>Assigned Recruiters</p>
        <span role="presentation" onClick={onAssign}> <i className={'fa fa-pencil'} /> Change Recruiters </span>
        <div>
          {recruiters && !_.isEmpty(recruiters)
            ? recruiters.map(object => this.renderTag(getFullName(object.firstName, object.lastName)))
            : <p className={styles.emptyAssign}> No recruiters assigned </p>
          }
        </div>
      </div>
    );
  };

  renderAssignedSales = () => {
    const { salesReps, onAssign } = this.props;

    return (
      <div className={`${styles.nextContentDiv} ${styles.alterOption}`}>
        <p>Assigned Sales Reps</p>
        <span role="presentation" onClick={onAssign}> <i className={'fa fa-pencil'} /> Change Sales Reps </span>
        <div>
          {salesReps && !_.isEmpty(salesReps)
            ? salesReps.map(object => this.renderTag(getFullName(object.firstName, object.lastName)))
            : <p className={styles.emptyAssign}> No Reps assigned </p>
          }
        </div>
      </div>
    );
  };

  renderUnassingedActions = () => {
    const { onClose, onAssign, isAssigned } = this.props;

    if (!isAssigned) {
      return (
        <div className={`${styles.unassignedActions} ${styles.footer}`}>
          <button
            className={'btn btn-border'}
            style={{ borderRadius: '5px' }}
            onClick={onClose}
            disabled={false}
          >
            Close
          </button>
          <button
            className={'btn btn-border'}
            style={{ borderRadius: '5px' }}
            onClick={e => this.setState({ target: e.target, show: !this.state.show })}
            ref={target => { this.archiveButton = target; }}
            disabled={false}
          >
            <span>Archive <i className="fa fa-trash-o" aria-hidden="true" /> </span>
          </button>
          <Overlay
            show={this.state.show}
            target={this.archiveButton}
            placement="top"
            container={this}
          >
            <Popover id="popover-contained">
              You'll no longer be able to use this job opening again. Are you sure you would like to archive this?
              <div className={styles.unassignedActions} style={{ marginTop: '10px', marginBottom: '7px' }}>
                <button
                  className={'btn btn-border'}
                  style={{ borderRadius: '5px' }}
                  onClick={() => this.setState({ show: !this.state.show })}
                  disabled={false}
                >
                  Cancel
                </button>
                <button
                  className={'btn btn-border'}
                  style={{
                    borderRadius: '5px',
                    backgroundColor: '#ed6666',
                    border: 'solid 1px #ed6666',
                    color: '#ffffff'
                  }}
                  onClick={() => {
                    this.setState({ show: !this.state.show });
                    this.archiveJobOpening();
                    this.props.callback();
                  }}
                  disabled={false}
                >
                  Yes, archive opening
                </button>
              </div>
            </Popover>
          </Overlay>
          <button
            className={'btn btn-border orange-btn'}
            style={{ borderRadius: '5px' }}
            onClick={onAssign}
            disabled={false}
          >
            Assign
          </button>
        </div>
      );
    }
  };

  renderJobFilters = () => {
    const { keywords, skills, location, language, sources } = this.props;

    if ((keywords && keywords !== '') || !_.isEmpty(skills) || !_.isEmpty(location) ||
      !_.isEmpty(language) || !_.isEmpty(sources)) {
      return (
        <div className={styles.nextContentDiv} style={{ textAlign: 'center' }}>
          <span> This Job opening needs candidate with </span>
        </div>
      );
    }
  };

  render() {
    const { name, vacancies, type, priority, isAssigned, openingLocations,
      categories, positions, keywords, skills, location, language, sources } = this.props;

    return (
      <div className={styles.jobDetails}>
        <div className={styles.jobDetailsContent}>
          <div className={styles.jobDetailsHeader}>
            <div>
              <span className={styles.jobName}> {name} </span>
              <p className={styles.transform}> {vacancies} vacancies | {getJobType(type)} </p>
            </div>
            <div className={`${styles.priority} ${priority ? styles[priority] : ''}`}>
              <p> {convertStringFormat(priority)} </p>
            </div>
          </div>
          <Scrollbars
            universal
            autoHeight
            autoHeightMin={`calc(100vh - ${isAssigned ? '100px' : '150px'})`}
            // autoHeightMin={'calc(100vh - 150px)'}
            autoHeightMax={`calc(100vh - ${isAssigned ? '100px' : '150px'})`}
            renderThumbHorizontal={props => <div {...props} className="hide" />}
            renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
          >
            {this.renderDateRange()}
            {isAssigned && this.renderAssignedSales()}
            {isAssigned && this.renderAssignedRecruiters()}
            {this.renderNextDivOnAvailability('Placement Locations', openingLocations)}
            {this.renderNextDivOnAvailability('Categories', categories)}
            {this.renderNextDivOnAvailability('Positions', positions)}
            {this.renderJobFilters()}
            {keywords && keywords !== '' && <div className={styles.nextContentDiv}>
              <p> Keywords </p>
              <p style={{ fontSize: '10px' }}> {keywords} </p>
            </div>}
            {this.renderNextDivOnAvailability('Skills', skills)}
            {this.renderNextDivOnAvailability('Languages', language)}
            {this.renderNextDivOnAvailability('Sourcing Locations', location)}
            {this.renderNextDivOnAvailability('Sources', sources)}
            {this.renderCards()}
          </Scrollbars>

        </div>
        {this.renderUnassingedActions()}
      </div>
    );
  }
}

export default ViewJobOpening;
