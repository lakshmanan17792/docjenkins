import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

// import i18n from '../../i18n';
// import { Trans } from 'react-i18next';

import styles from './Candidates.scss';
import i18n from '../../i18n';

const RequestDetails = properties => {
  const renderLogoText = (firstName, lastName) => firstName.charAt(0) + lastName.charAt(0);

  const { approvers } = properties;
  // const associatedPeople = [
  //   {
  //     name: 'Carrie Richards',
  //     status: 'approved',
  //     approvedOn: '2018-07-16'
  //   },
  //   {
  //     name: 'Jayden Arnold',
  //     status: 'rejected',
  //     rejectedOn: '2018-07-15'
  //   },
  //   {
  //     name: 'Cecilia Floyd',
  //     status: 'waiting',
  //   },
  //   {
  //     name: 'Francis Underwood',
  //     status: 'approved',
  //     approvedOn: '2018-07-14'
  //   },
  //   {
  //     name: 'Claire Underwood',
  //     status: 'rejected',
  //     rejectedOn: '2018-07-12'
  //   },
  //   {
  //     name: 'Doug Stamper',
  //     status: 'waiting',
  //   }
  // ];
  return (
    <Scrollbars
      universal
      autoHide
      autoHeight
      autoHeightMin={'calc(100vh - 200px)'}
      autoHeightMax={'calc(100vh - 200px)'}
      renderThumbHorizontal={props => <div {...props} className="hide" />}
      renderView={props => <div {...props} className="customScroll" />}
    >
      <div className={`${styles.overview_details} ${styles.request_details_section}`}>
        {
          approvers && approvers.map(person => (
            <div className={styles.associated_person}>
              <div className={styles.person_info}>
                <div className={styles.name_logo} style={{ verticalAlign: 'top' }}>
                  <span className={styles.name_initials}>
                    {renderLogoText(person.user.firstName, person.user.lastName)}
                  </span>
                </div>
                <div className={styles.basic_info}>
                  <div className={`${styles.name} ${styles.overview_name}`}>
                    <span>{ `${person.user.firstName} ${person.user.lastName}` }</span>
                  </div>
                  {/* <div className={styles.delete_request}>
                    {
                      person.status === 'approved' &&
                      `${i18n.t('APPROVED')} ${moment(person.approvedOn).fromNow()}`
                    }
                    {
                      person.status === 'rejected' &&
                      `${i18n.t('REJECTED')} ${moment(person.rejectedOn).fromNow()}`
                    }
                    {
                      person.status === 'waiting' &&
                      `${i18n.t('WAITING_FOR_APPROVAL')}`
                    }
                  </div> */}
                </div>
              </div>
              <div className={styles.person_status}>
                {
                  person.isApproved &&
                  <div className={`${styles.request_status} ${styles.approved}`}>
                    <span>{i18n.t('REQUEST_APPROVED')}</span>
                  </div>
                }
                {/* {
                  person.status === 'rejected' &&
                  <div className={`${styles.request_status} ${styles.rejected}`}>
                    <span>Request rejected</span>
                  </div>
                } */}
                {
                  !person.isApproved &&
                  <div className={`${styles.request_status} ${styles.waiting}`}>
                    <span>{i18n.t('APPROVAL_PENDING')}</span>
                  </div>
                }
              </div>
            </div>
          ))
        }
      </div>
    </Scrollbars>
  );
};

export default RequestDetails;
