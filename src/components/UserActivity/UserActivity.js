import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, Col, Row, Panel, PanelGroup, Fade } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import notificationStyles from '../../containers/Notifications/Notifications.scss';
import i18n from '../../i18n';

const styles = require('./UserActivity.scss');

export default class UserActivity extends Component {
  static propTypes = {
    closeModal: PropTypes.func.isRequired,
    showUserActivityModal: PropTypes.bool.isRequired,
    data: PropTypes.object,
    isDeactivationView: PropTypes.bool.isRequired,
    userDeactivation: PropTypes.func.isRequired,
    userRoleChange: PropTypes.func.isRequired
  };

  static defaultProps = {
    data: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      data: {},
      activeKey: null
    };
  }

  componentWillMount() {
    this.setState({
      data: this.props.data
    });
    window.addEventListener('storage', this.messageReceive);
  }

  // componentWillReceiveProps(nextProps) {
  //   if (Object.keys(nextProps.data).length > 0) {
  //     this.setState({
  //       data: nextProps.data
  //     });
  //   }
  // }

  getSubHeadingName = name => {
    switch (name) {
      case 'SalesjobOpenings':
        return 'Job Openings';
      case 'companies':
        return 'Companies';
      case 'jobOpenings':
        return 'Job Openings';
      case 'tasks':
        return 'Tasks';
      default:
        return 'Not Available';
    }
  }

  messageReceive = ev => {
    if (ev.key === 'removedData') {
      const { data } = this.state;
      const dataToBeRemoved = JSON.parse(ev.newValue);
      if (dataToBeRemoved && dataToBeRemoved.userId === data.id) {
        data[dataToBeRemoved.tab].map((eachData, index) => {
          if (eachData.masterId && eachData.masterId === dataToBeRemoved.id) {
            data[dataToBeRemoved.tab].splice(index, 1);
          } else if (eachData.id && eachData.id === parseInt(dataToBeRemoved.id, 10)) {
            data[dataToBeRemoved.tab].splice(index, 1);
          }
        });
        this.setState({
          data
        });
      }
    }
  }

  closeModal = evt => {
    if (evt) {
      this.props.closeModal();
    }
  }

  SalesjobOpeningsCard = data => (
    <Panel eventKey="1" style={{ cursor: 'pointer' }}>
      <Panel.Heading>
        <Panel.Title toggle>
          {<div>
            {
              this.state.activeKey === '1' ?
                <i className="fa fa-caret-down" /> : <i className="fa fa-caret-right" />
            }
            <span><Trans>JOB_OPENINGS</Trans>({data.length})</span>
          </div>}
        </Panel.Title>
      </Panel.Heading>
      {
        data && data.length > 0 &&
        <Panel.Body collapsible>
          {
            data.map(eachData => (
              <Link
                to={`Openings/${(eachData.id)}`}
                target="_blank"
              >
                <a
                  title={i18n.t('tooltipMessage.CLICK_TO_VIEW_THE_JOB_OPENING')}
                  className={`${styles.tile} col-md-12`}
                >
                  <div className={styles.ellipsis_view}>
                    {eachData.jobTitle}
                  </div>
                  <div className={styles.ellipsis_view}>
                    {eachData.companies && eachData.companies.length > 0 ? eachData.companies[0].name : ''}
                  </div>
                </a>
              </Link>
            ))
          }
        </Panel.Body>
      }
    </Panel>
  )


  companiesCard = data => (
    <Panel eventKey="2" style={{ cursor: 'pointer' }}>
      <Panel.Heading>
        <Panel.Title toggle>
          {<div>
            {
              this.state.activeKey === '2' ?
                <i className="fa fa-caret-down" /> : <i className="fa fa-caret-right" />
            }
            <span><Trans>COMPANIES</Trans>({data.length})</span>
          </div>}
        </Panel.Title>
      </Panel.Heading>
      {
        data && data.length > 0 &&
        <Panel.Body collapsible>
          {
            data.map(eachData => (
              <Link
                to={`Company/${eachData.masterId}`}
                target="_blank"
              >
                <a title={i18n.t('tooltipMessage.CLICK_TO_VIEW_THE_COMPANY')} className={`${styles.tile} col-md-12`}>
                  {
                    eachData.domain ?
                      <img
                        alt={eachData.domain}
                        className={`${styles.logoImg}`}
                        src={`https://logo.clearbit.com/${eachData.domain}`}
                        onError={e => { e.target.src = '/company_icon.svg'; }}
                      /> :
                      <img
                        alt={eachData.domain}
                        className={`${styles.logoImg}`}
                        src={'/company_icon.svg'}
                      />
                  }
                  <span className={`${styles.ellipsis_view} p-l-5`}>
                    {eachData.name}
                  </span>
                </a>
              </Link>
            ))
          }
        </Panel.Body>
      }
    </Panel>
  )

  tasksCard = data => (
    <Panel eventKey="3" style={{ cursor: 'pointer' }}>
      <Panel.Heading>
        <Panel.Title toggle>
          {<div>
            {
              this.state.activeKey === '3' ?
                <i className="fa fa-caret-down" /> : <i className="fa fa-caret-right" />
            }
            <span><Trans>TASKS</Trans>({data.length})</span>
          </div>}
        </Panel.Title>
      </Panel.Heading>
      {
        data && data.length > 0 &&
        <Panel.Body collapsible>
          {
            data.map(eachData => (
              <Link
                to={`/Tasks/View?taskId=${eachData.id}`}
                target="_blank"
              >
                <a title={i18n.t('tooltipMessage.CLICK_TO_VIEW_THE_TASKS')} className={`${styles.tile} col-md-12`}>
                  {eachData.title}
                </a>
              </Link>
            ))
          }
        </Panel.Body>
      }
    </Panel>
  )


  toggleNotification = () => {
    this.props.closeModal();
  };

  checkToShowButton = data => {
    const companies = data && data.companies ? data.companies.length : 0;
    const jobOpenings = data && data.jobOpening ? data.jobOpening.length : 0;
    const tasks = data && data.task ? data.task.length : 0;
    if (companies === 0 && jobOpenings === 0 && tasks === 0) {
      return true;
    }
    return false;
  }

  userDeactivation = () => {
    if (this.props.isDeactivationView) {
      this.props.userDeactivation(this.state.data);
    } else {
      this.props.userRoleChange(this.state.data);
    }
  }

  handleSelect = key => {
    this.setState({
      activeKey: key
    });
  }

  renderModalBody = () => {
    const { data, activeKey } = this.state;
    const activityObject = {
      companies: data && data.companies ? data.companies : [],
      jobOpenings: data && data.jobOpening ? data.jobOpening : [],
      tasks: data && data.task ? data.task : []
    };
    const val = Object.keys(activityObject);
    return (
      <div> {
        val.map(eachVal => (
          <div className={`${styles.section_seperator} row user_activity_section_seperator`}>
            <div>
              <PanelGroup
                accordion
                id="accordion-controlled-example"
                activeKey={activeKey}
                onSelect={this.handleSelect}
                className={styles.panel_group}
              >
                {this.renderCard(eachVal, activityObject[eachVal])}
              </PanelGroup>
            </div>
          </div>
        ))
      }
      </div>
    );
  }

  renderCard = (item, dataArray) => {
    switch (item) {
      case 'companies':
        return this.companiesCard(dataArray);
      case 'jobOpenings':
        return this.SalesjobOpeningsCard(dataArray);
      case 'tasks':
        return this.tasksCard(dataArray);
      default :
        return this.tasksCard(dataArray);
    }
  }

  render() {
    const { data } = this.state;
    return (
      <div className={styles.sideBarWrapper}>
        <Fade in={this.props.showUserActivityModal}>
          <div className={this.props.showUserActivityModal ? styles.overlay : null}>
            <div className={styles.content} ref={c => { this.container = c; }}>
              <div className={`${styles.notification_header}`}>
                <Image
                  src="/close.svg"
                  responsive
                  onClick={evt => { this.toggleNotification(evt); }}
                  className={styles.close_img}
                />
                <Row className="m-0">
                  <Col lg={10} sm={10} xs={10} className="p-t-5 p-b-5 p-l-5">
                    <span className={`f-s-17 ${notificationStyles.cursor_auto}`}>
                      <Trans>
                        UNRESOLVED_CONFLICTS
                      </Trans>
                      <br />
                      <div className={styles.subHeaderWrapper}>
                        {
                          this.props.isDeactivationView ?
                            <Trans className={styles.subHeader}>
                              {i18n.t('DEACTIVATION_WARNING')}
                            </Trans>
                            :
                            <Trans className={styles.subHeader}>
                              {i18n.t('DEACTIVATION_WARNING')}
                            </Trans>
                        }
                      </div>
                    </span>
                  </Col>
                </Row>
              </div>
              <div className="m-5">
                {this.renderModalBody()}
              </div>
              {
                this.checkToShowButton(data) ?
                  <div className={styles.buttonStyle}>
                    <button
                      onClick={() => this.userDeactivation()}
                      className={`${styles.deactivateButton} button-primary`}
                    >
                      <span className={styles.btncompanyName}>
                        {
                          this.props.isDeactivationView ?
                            <Trans>DEACTIVATE_USER</Trans>
                            :
                            <Trans>SAVE_USER</Trans>
                        }
                      </span>
                    </button>
                  </div>
                  :
                  null
              }
            </div>
          </div>
        </Fade>
      </div>
    );
  }
}
