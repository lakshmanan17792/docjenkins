import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import { Trans } from 'react-i18next';
import UserRole from './../../helpers/UserRole';
import NewPermissible from '../../components/Permissible/NewPermissible';
import i18n from '../../i18n';

const styles = require('./Header.scss');

const providers = {
  userRole: new UserRole()
};

export default class UserProfile extends Component {
  static propTypes = {
    user: PropTypes.shape({
      email: PropTypes.string,
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

  getSettingsRoute = () => {
    const { user } = this.props;
    const admin = user.userRoles.filter(role => role.name === 'Admin');
    if (admin.length > 0) {
      return '/users';
    } else if (providers.userRole.getPathPermission('JobCategory', 'VIEW_ALL_JOBCATEGORY')) {
      return '/JobCategory';
    } else if (providers.userRole.getPathPermission('TemplateManager', 'VIEW_TEMPLATE')) {
      return '/TemplateManager';
    } else if (providers.userRole.getPathPermission('Signatures', 'VIEW_SIGNATURE')) {
      return '/Signatures';
    } else if (providers.userRole.getIsAdmin()) {
      return '/localization';
    }
    return false;
  }

  render() {
    const { user } = this.props;
    const SHOW_ICONS = false;
    const settingsRoute = this.getSettingsRoute();
    return (
      <span className={`${styles.user_profile}`}>
        <div className={`f-15 right ${styles.user_dropdown}`}>
          <Col lg={12} md={12}>
            <div className={`right avatar-circle-xs ${styles.circule_padding}`}>
              <span className={`initials ${styles.text_align}`}> {
                user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()
              }</span>
            </div>
            {/* <div
              role="button"
              tabIndex="-1"
            >
              <i
                className={`fa fa-chevron-down right  ${styles.user_arrow}`}
                aria-hidden="true"
              />
              <span className={`right ${styles.user_name}`}>
                {user.firstName} {user.lastName}
              </span>
              <i
                className={`fa fa-user-circle-o right ${styles.headerBar}`}
                aria-hidden="true"
              />
            </div> */}
            <div className={styles.user_details}>
              <Col lg={12} md={12} sm={12} xs={12} >
                <Row>
                  <Col sm={4} className="p-10">
                    <img src="/avatar-m.png" className="img-responsive" alt="User" />
                  </Col>
                  <Col sm={8} className="p-10" >
                    <Link to="/UserProfile">
                      <div title={i18n.t('tooltipMessage.VIEW_USER_PROFILE')} className={styles.profile_name} >
                        <h4 title={i18n.t('tooltipMessage.VIEW_USER_PROFILE')} > {user.firstName} {user.lastName} </h4>
                        <p title={i18n.t('tooltipMessage.VIEW_USER_PROFILE')} >{user.username} </p>
                      </div>
                    </Link>
                  </Col>
                </Row>
                <Row>
                  <Col lg={12} md={12} sm={12} xs={12} className="p-0" >
                    <div className={styles.profile_links}>
                      <ul>
                        {/* <li>
                          <Link to="/UserProfile">
                            <i className="fa fa-user" />
                            Profile
                          </Link>
                        </li> */}
                        {settingsRoute && <li>
                          <Link to={settingsRoute}>
                            {SHOW_ICONS &&
                            <i className="fa fa-cogs" />
                            }
                            <Trans>SETTINGS</Trans>
                          </Link>
                        </li>}
                        {/* {
                          providers.userRole.getPathPermission('JobOpenings') ?
                            <li>
                              <Link to="/JobOpenings">
                                <i className="fa fa-list-alt" />
                                Manage Job Openingscon
                              </Link>
                            </li>
                            : null
                        } */}
                        <NewPermissible operation={{ operation: 'LINKEDIN_ADD_PROFILE', model: 'SourcedProfile' }}>
                          <li>
                            <Link to="/SourcedProfiles">
                              {SHOW_ICONS &&
                              <i className="fa fa-user-plus" />
                              }
                              <Trans>SOURCED_PROFILES</Trans>
                            </Link>
                          </li>
                        </NewPermissible>
                        <li>
                          <Link to="/EmailConfig">
                            {SHOW_ICONS &&
                            <i className="fa fa-gear" />
                            }
                            <Trans>EMAIL_CONFIG</Trans>
                          </Link>
                        </li>
                        <li>
                          <Link to="/logout">
                            {SHOW_ICONS &&
                            <i className="fa fa-power-off" />
                            }
                            <Trans>LOGOUT</Trans>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              </Col>
            </div>
          </Col>
        </div>
      </span>
    );
  }
}
