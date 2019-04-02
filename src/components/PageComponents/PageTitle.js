import React from 'react';
import PropTypes from 'prop-types';

const styles = require('./PageTitle.scss');

const PageTitle = ({ title }) => (
  <div
    className={`row wrapper border-bottom white-bg page-heading ${styles.pageHeading}`}
  >
    <div className="col-sm-4">
      <h2 className={styles.title}>{title}</h2>
    </div>
    <div className="col-sm-8" />
  </div>
);

PageTitle.propTypes = {
  title: PropTypes.string.isRequired
};

export default PageTitle;
