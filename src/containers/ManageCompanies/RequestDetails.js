import React from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';

import styles from './Candidates.scss';

const RequestDetails = () => {
  const renderLogoText = name => {
    const nameArray = name.split(' ');
    return nameArray[0].charAt(0) + nameArray[1].charAt(0);
  };
  const associatedPeople = [
    {
      name: 'Carrie Richards',
      status: 'approved',
      approvedOn: '2018-07-16'
    },
    {
      name: 'Jayden Arnold',
      status: 'rejected',
      rejectedOn: '2018-07-15'
    },
    {
      name: 'Cecilia Floyd',
      status: 'waiting',
    },
    {
      name: 'Francis Underwood',
      status: 'approved',
      approvedOn: '2018-07-14'
    },
    {
      name: 'Claire Underwood',
      status: 'rejected',
      rejectedOn: '2018-07-12'
    },
    {
      name: 'Doug Stamper',
      status: 'waiting',
    }
  ];
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
          associatedPeople && associatedPeople.map(person => (
            <div className={styles.associated_person}>
              <div className={styles.person_info}>
                <div className={styles.name_logo}>
                  <span className={styles.name_initials}>{renderLogoText(person.name)}</span>
                </div>
                <div className={styles.basic_info}>
                  <div className={`${styles.name} ${styles.overview_name}`}>
                    <span>{ person.name }</span>
                  </div>
                  <div className={styles.delete_request}>
                    {
                      person.status === 'approved' &&
                      `Approved ${moment(person.approvedOn).fromNow()}`
                    }
                    {
                      person.status === 'rejected' &&
                      `Rejected ${moment(person.rejectedOn).fromNow()}`
                    }
                    {
                      person.status === 'waiting' &&
                      'Waiting for approval'
                    }
                  </div>
                </div>
              </div>
              <div className={styles.person_status}>
                {
                  person.status === 'approved' &&
                  <div className={`${styles.request_status} ${styles.approved}`}>
                    <span>Request approved</span>
                  </div>
                }
                {
                  person.status === 'rejected' &&
                  <div className={`${styles.request_status} ${styles.rejected}`}>
                    <span>Request rejected</span>
                  </div>
                }
                {
                  person.status === 'waiting' &&
                  <div className={`${styles.request_status} ${styles.waiting}`}>
                    <span>Approval pending</span>
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
