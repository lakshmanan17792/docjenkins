import React from 'react';
import { Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import styles from './FormComponents.scss';
import i18n from '../../i18n';

const FilterBox = ({ reset, children, className, loading }) => (
  <div className={`${styles.filter}`}>
    <h2>
      <Trans>FILTERS</Trans>
      { reset ?
        <span
          className={`${styles.reset} ${className} ${loading ? styles.fa_disabled : ''}`}
          title={i18n.t('tooltipMessage.RESET_YOUR_FILTERS')}
          role="button"
          aria-hidden="true"
          onClick={reset}
        > <Trans>RESET_FILTERS</Trans></span>
        : null
      }
    </h2>
    <hr className={`${styles.hr_separation} m-t-0`} />
    <Row className="m-0">
      {children}
    </Row>
  </div>
);

FilterBox.defaultProps = {
  className: '',
  reset: null,
  loading: false
};

FilterBox.propTypes = {
  children: PropTypes.node.isRequired,
  reset: PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.bool
  ]),
  className: PropTypes.string,
  loading: PropTypes.bool
};

export default FilterBox;
