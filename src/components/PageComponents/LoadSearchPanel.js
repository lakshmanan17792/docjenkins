import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

const styles = require('./LoadSearchPanel.scss');

const LoadSearchPanel = ({ loadedSearch }) =>
  (
    <div className={`${styles.active_status} ${styles.load_search_panel}`}>
      <div className={styles.panels}>
        <div className={styles.panel_body}>
          <div className="display-inline-flex-align-center m-t-2">
            <span className={`${styles.title} p-r-5`}>
              <Trans>LOADED_SEARCH</Trans>:
            </span>
            <span className={`${styles.loaded_search_name} p-r-5 p-l-5`}>
              {loadedSearch.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

LoadSearchPanel.defaultProps = {
  loadedSearch: {}
};

LoadSearchPanel.propTypes = {
  loadedSearch: PropTypes.object.isRequired,
};

export default LoadSearchPanel;
