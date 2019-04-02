import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
// import Helmet from 'react-helmet';
// import { reduxForm } from 'redux-form';
// import { push as pushState } from 'react-router-redux';
// import { 
//   Row, Col, Pagination, Pager, Grid, ButtonToolbar, Table,
//    Button, Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap';

import styles from './Customers.scss';

export default class CustomerType extends Component {
  static propTypes = {
    userType: PropTypes.string,
    customStyle: PropTypes.string
  }

  static defaultProps = {
    userType: '',
    customStyle: ''
  }
    renderCustomerType = () => {
      switch (this.props.userType) {
        case 'Not Interested':
          // return (<button
          //   className={`${styles.typeButton} ${styles.customerTypeFont} ${this.props.customStyle}`}
          // >
          //   <Trans>NOT_INTERESTED</Trans></button>);
          return (
            <button
              className={`${styles.notInterestedBtn} ${styles.statusBtn} ${this.props.customStyle}`}
            >
              <Trans>NOT_INTERESTED</Trans>
            </button>
          );
        case 'Contacted':
          // return (
          //   <div className={this.props.customStyle}>
          //     <span className={`${styles.typeOval} ${styles.typeContacted}`} />
          //     <span className={`${styles.typeOval} ${styles.typeContacted}`} />
          //     <span className={`${styles.typeOval} ${styles.typeContactedDisabledState}`} />
          //     <span className={`${styles.typeOval} ${styles.typeContactedDisabledState}`} />
          //     <span className={`${styles.typeOval} ${styles.typeContactedDisabledState}`} />
          //     <span
          //       className={`${styles.userTypeClientText} ${styles.typeContactedTextColor} 
          //       ${styles.customerTypeFont}`}
          //     >
          //       <Trans>CONTACTED</Trans>
          //     </span>
          //   </div>
          // );
          return (
            <button
              className={`${styles.contactedBtn} ${styles.statusBtn} ${this.props.customStyle}`}
            >
              <Trans>CONTACTED</Trans>
            </button>
          );
        case 'Client':
          // return (
          //   <div className={this.props.customStyle}>
          //     <span className={`${styles.typeOval} ${styles.typeClient}`} />
          //     <span className={`${styles.typeOval} ${styles.typeClient}`} />
          //     <span className={`${styles.typeOval} ${styles.typeClient}`} />
          //     <span className={`${styles.typeOval} ${styles.typeClient}`} />
          //     <span className={`${styles.typeOval} ${styles.typeClient}`} />
          //     <span
          //       className={`${styles.userTypeClientText} ${styles.typeClientTextColor} ${styles.customerTypeFont}`}
          //     >
          //       <Trans>CLIENT</Trans>
          //     </span>
          //   </div>
          // );
          return (
            <button
              className={`${styles.clientBtn} ${styles.statusBtn} ${this.props.customStyle}`}
            >
              <Trans>CLIENT</Trans>
            </button>
          );
        case 'Prospect':
          // return (
          //   <div className={this.props.customStyle}>
          //     <span className={`${styles.typeOval} ${styles.typeProspect}`} />
          //     <span className={`${styles.typeOval} ${styles.typeProspectDisabledState}`} />
          //     <span className={`${styles.typeOval} ${styles.typeProspectDisabledState}`} />
          //     <span className={`${styles.typeOval} ${styles.typeProspectDisabledState}`} />
          //     <span className={`${styles.typeOval} ${styles.typeProspectDisabledState}`} />
          //     <span
          //       className={`${styles.userTypeClientText} ${styles.typeProspectTextColor} 
          //       ${styles.customerTypeFont}`}
          //     >
          //       <Trans>PROSPECT</Trans>
          //     </span>
          //   </div>
          // );
          return (
            <button
              className={`${styles.statusBtn} ${this.props.customStyle}`}
            >
              <Trans>PROSPECT</Trans>
            </button>
          );
        case 'Finalist':
          // return (
          //   <div className={this.props.customStyle}>
          //     <span className={`${styles.typeOval} ${styles.typeFinalist}`} />
          //     <span className={`${styles.typeOval} ${styles.typeFinalist}`} />
          //     <span className={`${styles.typeOval} ${styles.typeFinalist}`} />
          //     <span className={`${styles.typeOval} ${styles.typeFinalist}`} />
          //     <span className={`${styles.typeOval} ${styles.typeFinalistDisabledState}`} />
          //     <span className={`${styles.userTypeClientText} ${styles.typeFinalistTextColor} 
          //     ${styles.customerTypeFont}`}
          //     >
          //       <Trans>FINALIST</Trans>
          //     </span>
          //   </div>
          // );
          return (
            <button
              className={`${styles.finalistBtn} ${styles.statusBtn} ${this.props.customStyle}`}
            >
              <Trans>FINALIST</Trans>
            </button>
          );
        case 'Lead':
          // return (
          //   <div className={this.props.customStyle}>
          //     <span className={`${styles.typeOval} ${styles.typeLead}`} />
          //     <span className={`${styles.typeOval} ${styles.typeLead}`} />
          //     <span className={`${styles.typeOval} ${styles.typeLead}`} />
          //     <span className={`${styles.typeOval} ${styles.typeLeadDisabledState}`} />
          //     <span className={`${styles.typeOval} ${styles.typeLeadDisabledState}`} />
          //     <span className={`${styles.userTypeClientText} ${styles.typeLeadTextColor} 
          //     ${styles.customerTypeFont}`}
          //     ><Trans>LEAD</Trans>
          //     </span>
          //   </div>
          // );
          return (
            <button
              className={`${styles.leadBtn} ${styles.statusBtn} ${this.props.customStyle}`}
            >
              <Trans>LEAD</Trans>
            </button>
          );
        default:
          break;
      }
    }

    render() {
      const renderCustomerType = this.renderCustomerType();

      return (
        <div className={styles.text_center}>
          {renderCustomerType}
        </div>
      );
    }
}
