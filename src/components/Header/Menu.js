import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import UserRole from './../../helpers/UserRole';

const styles = require('./Header.scss');

const providers = {
  userRole: new UserRole()
};
@connect(
  state => ({
    activePath: state.routing.locationBeforeTransitions.pathname
  }),
  {}
)
export default class Menu extends Component {
  static propTypes = {
    activePath: PropTypes.string,
    user: PropTypes.shape({
      email: PropTypes.string
    }),
  }

  static defaultProps = {
    user: null,
    activePath: ''
  }

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getActiveClassName(link) {
    const { activePath } = this.props;
    if (activePath.includes(link)) {
      return styles.active;
    }
    if (link === '/Dashboard' && activePath === '/') {
      return styles.active;
    }
  }

  clearFilters = () => {
    sessionStorage.clear();
  }

  render() {
    const { user } = this.props;
    const SHOW_HEADER_ICONS = false;
    return (
      <ul className={`nav navbar-nav navbar-left ${styles.navbar_menus}`}>
        { user && providers.userRole.getPathPermission('Dashboard') &&
        <li>
          <Link
            to="/Dashboard"
            onClick={this.clearFilters}
            className={`
              ${this.getActiveClassName('/Dashboard')}
            `}
          >
            { SHOW_HEADER_ICONS &&
            <i className="fa fa-line-chart" />
            }
            <Trans>DASHBOARD</Trans>
          </Link>
        </li>}
        {/* { user && providers.userRole.getPathPermission('DashboardNew') &&
        <li>
          <Link
            to="/DashboardNew"
            onClick={this.clearFilters}
            className={`
              ${this.getActiveClassName('/DashboardNew')}
            `}
          >
            { SHOW_HEADER_ICONS &&
            <i className="fa fa-line-chart" />
            }
            <Trans>Dashboard 2</Trans>
          </Link>
        </li>} */}
        { user && providers.userRole.getPathPermission('Companies', 'VIEW_COMPANY') && <li>
          <Link
            to="/Companies"
            onClick={this.clearFilters}
            className={`${this.getActiveClassName('/Companies')}`}
          >
            { SHOW_HEADER_ICONS &&
            <i className="fa fa-building" />
            }
            <Trans>COMPANIES</Trans>
          </Link>
        </li>}
        { user && providers.userRole.getPathPermission('Openings', 'VIEW_JOBOPENING') && <li>
          <Link
            to="/Openings"
            onClick={this.clearFilters}
            className={`${this.getActiveClassName('/Openings')}`}
          >
            { SHOW_HEADER_ICONS &&
            <i className="fa fa-briefcase" />
            }
            <Trans>JOB_OPENINGS</Trans>
          </Link>
        </li>}
        { user && providers.userRole.getPathPermission('ProfileSearch', 'VIEW_PROFILE') && <li>
          <Link
            to="/ProfileSearch"
            onClick={this.clearFilters}
            className={`${this.getActiveClassName('/ProfileSearch')}`}
          >
            { SHOW_HEADER_ICONS &&
            <i className="fa fa-search" />
            }
            <Trans>PROFILE_SEARCH</Trans>
          </Link>
        </li>}
        { user && providers.userRole.getPathPermission('Parser', 'PARSE_RESUME') && <li>
          <Link
            to="/Parser"
            onClick={this.clearFilters}
            className={`${this.getActiveClassName('/Parser')}`}
          >
            { SHOW_HEADER_ICONS &&
            <i className="fa fa-file-text" />
            }
            <Trans>RESUME_PARSER</Trans>
          </Link>
        </li>}
        { user && providers.userRole.getPathPermission('Tasks', 'VIEW_TASK') && <li>
          <Link
            to="/Tasks"
            onClick={this.clearFilters}
            className={`${this.getActiveClassName('/Tasks')}`}
          >
            { SHOW_HEADER_ICONS &&
            <i className="fa fa-tasks" />
            }
            <Trans>TASKS</Trans>
          </Link>
        </li>}
        { user && providers.userRole.getPathPermission('AnalysisMetrics', 'ANALYSIS_METRICS') && <li>
          <Link
            to="/AnalysisMetrics"
            onClick={this.clearFilters}
            className={`${this.getActiveClassName('/AnalysisMetrics')}`}
          >
            { SHOW_HEADER_ICONS &&
            <i className="fa fa-search" />
            }
            <Trans>ANALYSIS_METRICS</Trans>
          </Link>
        </li>}
        {/* { user && providers.userRole.getPathPermission('TemplateManager') && <li>
          <Link to="/TemplateManager" className={`${this.getActiveClassName('/Tasks')}`}>
            <i className="fa fa-tasks" />
            TemplateManager
          </Link>
        </li>} */}
      </ul>
    );
  }
}
