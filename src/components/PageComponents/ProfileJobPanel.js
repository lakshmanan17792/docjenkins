import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

const styles = require('./JobProfilePanel.scss');

const ProfileJobPanel = ({ profileName, attachButtonsToDom, attachBackButton }) =>
  (<div className={`${styles.active_status} ${styles.job_profile_panel}`}>
    <div className={styles.panels} >
      <div className={`${styles.panel_body} ${styles.inline_table}`} style={{ width: '100%' }}>
        <div className={styles.inline_table_cell}>
          <div className={styles.inline_table}>
            <div
              className={`${styles.back_arrow} ${styles.align_middle} ${styles.inline_table_cell}`}
            >{attachBackButton}</div>
            <div className={`${styles.inline_table_cell} inline p-l-5`}>
              <div
                title={profileName}
                className={`${styles.title} p-r-5`}
                style={{ textTransform: 'none' }}
              >{profileName}</div>
              <div className={styles.jobTile}><Trans>SELECT_THE_JOB_OPENINGS_TO_ADD_CANDIDATE</Trans></div>
            </div>
          </div>
        </div>
        <div className={styles.inline_table_cell}>
          <div>{attachButtonsToDom}</div>
        </div>
      </div>
    </div>
  </div>);

ProfileJobPanel.defaultProps = {
  type: '',
  numberOfVacancies: '',
  attachButtonsToDom: '',
  attachEmailCandidateButton: '',
  attachCancelButton: '',
  attachBackButton: ''
};

ProfileJobPanel.propTypes = {
  profileName: PropTypes.string.isRequired,
  // activeStatus: PropTypes.string.isRequired,
  attachBackButton: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.object
  ]),
  attachButtonsToDom: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

export default ProfileJobPanel;
