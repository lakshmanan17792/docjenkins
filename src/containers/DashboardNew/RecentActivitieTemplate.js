import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { formatTitle } from '../../utils/validation';
import i18n from '../../i18n';

@connect()
export default class RecentActivitieTemplate extends Component {
  static propTypes = {
    activity: PropTypes.object,
  }

  static defaultProps = {
    activity: null
  }

  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    const { activity } = this.props;
    return (
      <div>
        { activity && activity.action === 'JOB_OPENING_CREATE' ?
          <span>
            <b className="text-capitalize"> {activity.userName} </b> {i18n.t('CREATED_NEW_JOB_OPENING')}&nbsp;
            <Link
              to={{ pathname: `/Openings/${activity.jobOpeningId}` }}
              title={formatTitle(activity.jobOpeningName)}
            >
              <span className="break-word">
                {formatTitle(activity.jobOpeningName)}
              </span>
            </Link>
          </span>
          : null
        }
        { activity && activity.action === 'JOB_OPENING_STATUS_UPDATE' ?
          <span>
            <b className="text-capitalize"> {activity.userName} </b>{i18n.t('UPDATED_JOB_OPENING')}&nbsp;
            <Link
              to={{ pathname: `/Openings/${activity.jobOpeningId}` }}
              title={formatTitle(activity.jobOpeningName)}
            >
              <span className="break-word">
                {formatTitle(activity.jobOpeningName)}
              </span>
            </Link> {i18n.t('FROM')}&nbsp;
            <b className="text-capitalize"> {activity.oldStatus.toLowerCase() === 'scheduled'
              ? 'Interview' : activity.oldStatus} </b> &nbsp;{i18n.t('TO')}&nbsp;
            <b className="text-capitalize"> {activity.newStatus.toLowerCase() === 'scheduled'
              ? 'Interview' : activity.newStatus} </b>
          </span>
          : null
        }
        { activity && activity.action === 'CANDIDATE_SHORTLIST' ?
          <span>
            <b className="text-capitalize"> {activity.userName} </b>{i18n.t('ADDED')}&nbsp;
            <Link
              to={{ pathname: `/ProfileSearch/${activity.resumeId}`,
                query: { jobId: `${activity.jobOpeningId}`, isAtsBoard: true } }}
            >
              <span className="text-capitalize break-word" title={activity.candidateName}>
                {activity.candidateName}
              </span>
            </Link>{`${i18n.t('TO')} ${i18n.t('JOBOPENING')}`}&nbsp;
            <Link
              to={{ pathname: `/Openings/${activity.jobOpeningId}` }}
              title={formatTitle(activity.jobOpeningName)}
            >
              <span className="break-word">
                {formatTitle(activity.jobOpeningName)}
              </span>
            </Link>
          </span>
          : null
        }
        { activity && activity.action === 'CANDIDATE_STATUS_UPDATE' ?
          <span>
            <b className="text-capitalize"> {activity.userName} </b> {i18n.t('MOVED')}&nbsp;
            <Link
              to={{ pathname: `/ProfileSearch/${activity.resumeId}`,
                query: { jobId: `${activity.jobOpeningId}`, isAtsBoard: true } }}
            >
              <span className="text-capitalize break-word" title={activity.candidateName}>
                {activity.candidateName}
              </span>
            </Link>&nbsp;{i18n.t('FROM')}
            <b> {activity.oldStatus.toLowerCase() === 'scheduled'
              ? 'Interview' : activity.oldStatus} </b>{i18n.t('TO')}
            <b> {activity.newStatus.toLowerCase() === 'scheduled'
              ? 'Interview' : activity.newStatus} </b>{`${i18n.t('FOR')} ${i18n.t('JOBOPENING')}`}&nbsp;
            <Link
              to={{ pathname: `/Openings/${activity.jobOpeningId}` }}
              title={formatTitle(activity.jobOpeningName)}
            >
              <span className="break-word">
                {formatTitle(activity.jobOpeningName)}
              </span>
            </Link>
          </span>
          : null
        }
      </div>
    );
  }
}
