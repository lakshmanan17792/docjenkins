import React from 'react';
import { Image } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import moment from 'moment';
import { Trans } from 'react-i18next';

import { ExtendNotifyDateForm } from 'components';
import styles from './Candidates.scss';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

const OverviewDetails = properties => {
  const { selectedData, isUnarchive, toggleExtendDateModal, returnLogoText,
    isExtendDateModalOpen, extendNotifyDateSubmit } = properties;
  return (
    <Scrollbars
      universal
      autoHide
      autoHeight
      autoHeightMin={isUnarchive ? 'calc(100vh - 165px)' : 'calc(100vh - 200px)'}
      autoHeightMax={isUnarchive ? 'calc(100vh - 165px)' : 'calc(100vh - 200px)'}
      renderThumbHorizontal={props => <div {...props} className="hide" />}
      renderView={props => <div {...props} className="customScroll" />}
    >
      <div className={styles.overview_details}>
        <div className={styles.candidate_details}>
          <div className={`${styles.name_logo} ${styles.overview_name_logo}`}>
            <span className={styles.name_initials}>
              { returnLogoText(selectedData.firstName, selectedData.lastName) }
            </span>
          </div>
          <div className={styles.basic_info}>
            <div className={`${styles.name} ${styles.overview_name}`}>
              <span>{ selectedData.name.toLowerCase() }</span>
              <span className={`${styles.exp} ${styles.overview_exp} p-l-10`}>
                {`( ~ ${Math.round(selectedData.totalYearsOfExperience)}y exp)`}
              </span>
            </div>
            <div
              className={selectedData.currentExperience.position ?
                `${styles.title}` : `${styles.title} ${styles.hidden}`}
            >
              {selectedData.currentExperience.position ?
                selectedData.currentExperience.position : 'Unavailable'}
            </div>
            <Image
              src="/icons/arrowRight.svg"
              responsive
              className={`${styles.overview_arrow} right`}
              onClick={evt => properties.viewProfile(evt, selectedData.id)}
            />
            <div
              className={selectedData.currentExperience.companyName ?
                `${styles.company_name}` : `${styles.company_name} ${styles.hidden}`}
            >
              {selectedData.currentExperience.companyName ?
                selectedData.currentExperience.companyName : 'Unavailable'}
            </div>
            <div
              className={selectedData.currentExperience.companyCity ?
                `${styles.company_location}` : `${styles.company_location} ${styles.hidden}`}
            >
              {selectedData.currentExperience.companyCity ?
                selectedData.currentExperience.companyCity : 'Unavailable'}
            </div>
          </div>
        </div>
        {
          isUnarchive ?
            <div className={styles.request_details}>
              <div className={styles.details_section}>
                <div className={`${styles.delete_request} ${styles.unarchive_reminder}`}>
                  {i18n.t('REMINDER_SET_TO_UNARCHIVE_ON')}
                </div>
                <div className={`${styles.delete_timestamp} ${styles.reminder_timestamp}`}>
                  <Image className={styles.clock_icon} src="/clock.svg" responsive />
                  { moment(selectedData.notifyDate).format('MMM Do YYYY') }
                </div>
                <div className={styles.details_section}>
                  <div className={styles.details_header}>
                    <Trans>REASON</Trans>
                  </div>
                  <div className={styles.reason_details}>
                    {selectedData.archiveReason ? selectedData.archiveReason.name : ''}
                  </div>
                </div>
                <div className={styles.details_section}>
                  <div className={styles.details_header}>
                    <Trans>DESCRIPTION</Trans>
                  </div>
                  <div className={styles.reason_details}>
                    {selectedData.archiveDescription}
                  </div>
                </div>
                <NewPermissible operation={{ operation: 'ARCHIVE_CANDIDATE', model: 'resume' }}>
                  <div
                    role="presentation"
                    className={`${styles.extend_btn} p-b-10`}
                    onClick={toggleExtendDateModal}
                  >
                    {i18n.t('EXTEND_REMINDER_AND_KEEP_THE_CANDIDATE_ARCHIVED')}
                  </div>
                </NewPermissible>
                {
                  isExtendDateModalOpen &&
                  <div className={`${styles.candidate_details} ${styles.extend_date_section}`}>
                    <div
                      role="presentation"
                      onClick={toggleExtendDateModal}
                      className={`${styles.extend_unarchive_title} p-l-15 p-r-15`}
                    >{i18n.t('EXTEND_CANDIDATE_ARCHIVAL_PERIOD')}</div>
                    <ExtendNotifyDateForm
                      extendNotifyDateSubmit={extendNotifyDateSubmit}
                      toggleExtendDateModal={toggleExtendDateModal}
                      notifyDate={selectedData.notifyDate}
                      descPlaceholder={i18n.t('WRITE_IN_SHORT_WHY_WOULD_YOU_LIKE_TO_KEEP_THIS_CANDIDATE_ARCHIVED')}
                    />
                  </div>
                }
              </div>
            </div> :
            <div className={styles.request_details}>
              <div className={styles.details_section}>
                <div className={styles.delete_request}>
                  {i18n.t('DELETE_REQUEST_RAISED_ON')}
                </div>
                <div className={styles.delete_timestamp}>
                  <Image className={styles.clock_icon} src="/clock.svg" responsive />
                  {moment(selectedData.deleteInitializedAt).format('MMM Do YYYY')}
                </div>
              </div>
              <div className={styles.details_section}>
                <div className={styles.details_header}>
                  <Trans>REASON</Trans>
                </div>
                <div className={styles.reason_details}>
                  {selectedData.deleteReason ? selectedData.deleteReason.name : ''}
                </div>
              </div>
              <div className={styles.details_section}>
                <div className={styles.details_header}>
                  <Trans>DESCRIPTION</Trans>
                </div>
                <div className={styles.reason_details}>
                  {selectedData.deleteDescription}
                </div>
              </div>
            </div>
        }
      </div>
    </Scrollbars>
  );
};

export default OverviewDetails;
