import React from 'react';
import { Image } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import moment from 'moment';
import { Trans } from 'react-i18next';

import { ExtendNotifyDateForm } from 'components';
import styles from '../ManageCandidates/Candidates.scss';
import i18n from '../../i18n';
import NewPermissible from '../../components/Permissible/NewPermissible';

const OverviewDetails = properties => {
  const { selectedData, isUnarchive, toggleExtendDateModal, formatCompanyName,
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
          <span className={styles.name_initials}>
            {formatCompanyName(selectedData)}
          </span>
          <Image
            src="/icons/arrowRight.svg"
            responsive
            className={`${styles.company_overview_arrow} right`}
            onClick={evt => properties.viewCompany(evt, selectedData.id)}
          />
        </div>
        {
          isUnarchive &&
            <div className={styles.request_details}>
              <div className={styles.details_section}>
                <div className={`${styles.delete_request} ${styles.unarchive_reminder}`}>
                  {i18n.t('REMINDER_SET_TO_UNARCHIVE_ON')}
                </div>
                <div className={`${styles.delete_timestamp} ${styles.reminder_timestamp}`}>
                  <Image className={styles.clock_icon} src="/clock.svg" responsive />
                  {moment(selectedData.notifyDate).format('MMM Do YYYY') }
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
                <NewPermissible operation={{ operation: 'COMPANY_ARCHIVE_EXTEND', model: 'customer' }}>
                  <div
                    role="presentation"
                    className={`${styles.extend_btn} p-b-10`}
                    onClick={toggleExtendDateModal}
                  >
                    {i18n.t('EXTEND_REMINDER_AND_KEEP_THE_COMPANY_ARCHIVED')}
                  </div>
                </NewPermissible>
                {
                  isExtendDateModalOpen &&
                  <div className={`${styles.candidate_details} ${styles.extend_date_section}`}>
                    <div
                      role="presentation"
                      onClick={toggleExtendDateModal}
                      className={`${styles.extend_unarchive_title} p-l-15 p-r-15`}
                    >{i18n.t('EXTEND_COMPANY_ARCHIVAL_PERIOD')}</div>
                    <ExtendNotifyDateForm
                      extendNotifyDateSubmit={extendNotifyDateSubmit}
                      toggleExtendDateModal={toggleExtendDateModal}
                      notifyDate={selectedData.notifyDate}
                      descPlaceholder={i18n.t('WRITE_IN_SHORT_WHY_WOULD_YOU_LIKE_TO_KEEP_THIS_COMPANY_ARCHIVED')}
                    />
                  </div>
                }
              </div>
            </div>}
      </div>
    </Scrollbars>
  );
};

export default OverviewDetails;
