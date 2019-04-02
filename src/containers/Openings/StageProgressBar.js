import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

const styles = require('./StageProgressBar.scss');

const renderProgressBar = (count, activePage, handleProgressBarClick, titles) => {
  const progressBar = [];
  let progressStage;
  for (let page = 1; page <= count; page += 1) {
    progressStage = (<Col lg={3} md={3} sm={3} xs={3} className={styles.step} key={page}>
      <div className={styles.stage}>
        <div
          className={`${styles.leftBar} ${activePage >= page ? styles.activeBackground : ''}`}
        />
        <i
          role="presentation"
          className={
            `${activePage > page ? 'fa fa-check-circle' : 'fa fa-circle-thin'}
             ${styles.icon}
             ${activePage >= page ? styles.activeColor : ''}`
          }
          onClick={() => { handleProgressBarClick(page); }}
        />
        <div
          className={`${styles.rightBar} ${activePage > page ? styles.activeBackground : ''}`}
        />
      </div>
      <div className={styles.stageTitle}>
        <span><Trans>{titles[`${page}`]}</Trans></span>
      </div>
    </Col>);
    progressBar.push(progressStage);
  }
  return progressBar;
};

const StageProgressBar = props => {
  const { activePage, totalPages, handleProgressBarClick, titles } = props;
  return (
    <Row className={styles.progressBar}>
      {renderProgressBar(totalPages, activePage, handleProgressBarClick, titles)}
    </Row>
  );
};

StageProgressBar.propTypes = {
  activePage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  handleProgressBarClick: PropTypes.func.isRequired,
  titles: PropTypes.objectOf(PropTypes.string).isRequired
};

export default StageProgressBar;
