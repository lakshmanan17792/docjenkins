import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

const styles = require('./JobProfilePanel.scss');

const JobProfilePanel = ({ numberOfVacancies, attachEditOpeningButton, attachEmailCandidateButton,
  type, attachCancelButton, attachButtonsToDom, statusCount,
  activeStatus, attachBackButton, attachStatusLabel }) =>
  (<div className={styles.job_profile_panel} id="job-profile-panel">
    <div className={styles.panels}>
      <div className={`${styles.panel_body} ${styles.profile_search_top_panel}`}>
        <div
          className={`${styles.panel_title_block} display-inline-flex-align-center m-t-5 col-xs-12 col-sm-3 col-md-3`}
        >
          <div className={`${styles.panel_title_content} col-xs-12 col-sm-12 col-lg-12 col-md-12`}>
            <div className={styles.back_arrow_container}>
              <span className={styles.back_arrow}>{attachBackButton}</span>
            </div>
            <div>
              <div
                className={`${styles.title} p-r-5`}
                style={{ textTransform: 'none' }}
              >{attachEditOpeningButton}</div>
            </div>
            <div className={`${styles.vacancies_container}`}>
              <span className={`${styles.vacancies}`}>{numberOfVacancies} <Trans>VACANCIES</Trans></span>
              <span className={`${styles.opening_type} p-r-5 p-l-5`}>
                <span>{type ? <i className="fa fa-circle" /> : ''}</span>
                <span className="p-r-5 p-l-5">
                  {/* {type === 'partTime' ? 'Freelance' : type} */}
                  {type === 'fullTime' && <Trans>FULL_TIME</Trans>}
                  {type === 'contract' && <Trans>CONTRACT</Trans>}
                  {type === 'partTime' && <Trans>FREELANCE</Trans>}
                </span>
              </span>
              <span
                className={`${styles.status}
                  ${styles[(activeStatus || '').toLowerCase()]}`}
              >
                <span style={{ position: 'relative', top: '-1px' }}>
                  <Trans>{activeStatus.toUpperCase()}</Trans>
                </span>
              </span>
              {attachStatusLabel}
              {/* {status <span> ? : ''} */}
            </div>
          </div>
          {/* <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
            <p className={styles.profile_note_text}>
              Click on the plus icon to add candidates
            </p>
          </div> */}
        </div>
        <div className={`${styles.report} p-0 m-t-5 col-xs-12 col-sm-6 col-md-6`}>
          {statusCount &&
            (() => {
              const { shortlisted, toBeSubmitted, submitted, scheduled, hired, rejected } = statusCount;
              return (
                <div className={`${styles.blocks} `}>
                  <div className={styles.contacted}>
                    <div>{toBeSubmitted || '-'}</div>
                    <div><Trans>TO_BE_SUBMITTED</Trans></div>
                  </div>
                  <div className={styles.contacted}>
                    <div>{submitted || '-'}</div>
                    <div><Trans>SUBMITTED</Trans></div>
                  </div>
                  <div className={styles.shortlisted}>
                    <div>{shortlisted || '-'}</div>
                    <div><Trans>SHORTLISTED</Trans></div>
                  </div>
                  <div className={styles.in_pipeline}>
                    <div>{scheduled || '-'}</div>
                    <div><Trans>INTERVIEW</Trans></div>
                  </div>
                  <div className={styles.hired}>
                    <div>{hired || '-'}</div>
                    <div><Trans>HIRED</Trans></div>
                  </div>
                  <div className={styles.rejected}>
                    <div>{rejected || '-'}</div>
                    <div><Trans>REJECTED</Trans></div>
                  </div>
                </div>
              );
            })()
          }
        </div>
        <div className="right display-inline-flex-align-center p-l-0 m-t-5 col-xs-12 col-sm-3 col-md-3 p-t-2">
          {/* <div>{attachRefreshButton}</div>
          <div>{attachHistoryButton}</div> */}
          {/* <NewPermissible operation={{ operation: 'EDIT', model: 'jobOpening' }}>
            <div>{attachDropdown}</div>
          </NewPermissible> */}
          {/* <div> */}
          {attachButtonsToDom}
          {/* </div> */}
          {/* <div> */}
          {attachEmailCandidateButton}
          {/* </div> */}
          {/* <div> */}
          {attachCancelButton}
          {/* </div> */}
        </div>
      </div>
    </div>
  </div>);

JobProfilePanel.defaultProps = {
  type: '',
  numberOfVacancies: '',
  attachButtonsToDom: '',
  attachEmailCandidateButton: '',
  attachDropdown: null,
  attachHistoryButton: null,
  attachCancelButton: '',
  attachRefreshButton: null,
  statusCount: {},
  attachStatusLabel: null
};

JobProfilePanel.propTypes = {
  type: PropTypes.string.isRequired,
  numberOfVacancies: PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  attachButtonsToDom: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.object
  ]),
  attachStatusLabel: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.object
  ]),
  activeStatus: PropTypes.string.isRequired,
  attachBackButton: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.object
  ]).isRequired,
  attachEditOpeningButton: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.object
  ]).isRequired,
  attachEmailCandidateButton: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.string
  ]),
  attachCancelButton: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.string
  ]),
  statusCount: PropTypes.object
};

export default JobProfilePanel;
