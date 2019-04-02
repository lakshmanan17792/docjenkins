import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, Row, PanelGroup, Panel } from 'react-bootstrap';
import { Link } from 'react-router';
import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';

import styles from './Companies.scss';

export default class ContactAssociations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: null
    };
  }
  handleSelect = key => {
    this.setState({
      activeKey: key
    });
  }
  render() {
    const { activeKey } = this.state;
    const { jobOpenings, tasks, toggleAssociationModal } = this.props;
    return (
      <Row className={`${styles.overlay} ${styles.contact_form_section}`}>
        <div className={styles.content}>
          <div className={styles.close_icon}>
            <Image
              src="/close.svg"
              responsive
              onClick={evt => { evt.preventDefault(); toggleAssociationModal(); }}
            />
          </div>
          <div className={styles.content_header}>
            <div className={`${styles.content_heading} p-b-10`}><Trans>UNRESOLVED_CONFLICTS</Trans></div>
            <div className={styles.heading_message}>
              Please remove the company contact from the following entities to resolve the conflicts
            </div>
          </div>
          <Scrollbars
            universal
            autoHeight
            autoHeightMin={'calc(100vh - 120px)'}
            autoHeightMax={'calc(100vh - 120px)'}
            renderThumbHorizontal={props => <div {...props} className="hide" />}
            renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
          >
            <PanelGroup
              accordion
              id="accordion-controlled-example"
              activeKey={activeKey}
              onSelect={this.handleSelect}
              className={styles.panel_group}
            >
              <Panel eventKey="1">
                <Panel.Heading>
                  <Panel.Title toggle><span>
                    {
                      activeKey === '1' ?
                        <i className="fa fa-caret-down" /> : <i className="fa fa-caret-right" />
                    }Job Openings ({jobOpenings.length})</span>
                  </Panel.Title>
                </Panel.Heading>
                {
                  jobOpenings.length > 0 &&
                  <Panel.Body collapsible className={styles.panel_body}>
                    {
                      jobOpenings.map(opening => (
                        <Link
                          target="_blank"
                          to={`/Openings/${opening.id}`}
                          key={opening.id}
                        >{opening.jobTitle}</Link>
                      ))
                    }
                  </Panel.Body>
                }
              </Panel>
              <Panel eventKey="2">
                <Panel.Heading>
                  <Panel.Title toggle>
                    <span>
                      {
                        activeKey === '2' ?
                          <i className="fa fa-caret-down" /> : <i className="fa fa-caret-right" />
                      }Tasks ({tasks.length})</span>
                  </Panel.Title>
                </Panel.Heading>
                {
                  tasks.length > 0 &&
                  <Panel.Body collapsible className={styles.panel_body}>
                    {
                      tasks.map(task => (
                        <Link
                          target="_blank"
                          to={`/Tasks/View/?taskId=${task.id}`}
                          key={task.id}
                        >{task.title}</Link>
                      ))
                    }
                  </Panel.Body>
                }
              </Panel>
            </PanelGroup>
          </Scrollbars>
        </div>
      </Row>
    );
  }
}

ContactAssociations.propTypes = {
  jobOpenings: PropTypes.array.isRequired,
  tasks: PropTypes.object.isRequired,
  toggleAssociationModal: PropTypes.func.isRequired
};
