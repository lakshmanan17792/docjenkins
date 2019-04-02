import React, { Component } from "react";
// import Calendar from 'react-calendar-material';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row, Modal } from "react-bootstrap";
import toastrErrorHandling from "../../containers/toastrErrorHandling";
// import Highcharts from 'highcharts';
import styles from "./AnalysisMetrics.scss";
import i18n from "../../i18n";


export default class ModelAtsBoard extends Component {
  static propTypes = {  };

  static defaultProps = {  };

  constructor(props) {
    super(props);
    this.state = { }     
  }
  componentWillMount() { }
  componentDidMount() { }
 
  render() {
    const { show, jobData, handleHide } = this.props;
    return (
      <div className="modal-container">
        <Modal
          show={show}
          onHide={handleHide}
          container={this}
          aria-labelledby="contained-modal-title"
          dialogClassName="ats_modal_dialog"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">
              {jobData.jobtitle ? <span>{jobData.jobtitle}</span>: <span>Active Pipeline ATS Board</span>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <Row className="m-0">
                <Col xs={12} className="p-10 ats-pipeline-chart">
                  <div className={styles.ats_newboader}>
                    <div className="ats-icon-line" />
                    <div className={styles.ats_title}>
                      <h4>{i18n.t("ATS_BOARD_SUMMARY_MODEL")}</h4>
                    </div>
                    <ul className="ats-new">
                      <li>
                        <div
                          className="ats-new-icon"
                          style={{ marginLeft: 10 }}
                        >
                          <img src="/icons/newjobopenings.png" alt="" />
                        </div>
                        <p>{jobData ? jobData.vacancies : "0"}</p>
                        <h6>Job Openings</h6>
                      </li>
                      <li className={`ats-new-1`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newselected.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.selectedcount : "0"}</p>
                        <h6>Selected</h6>
                      </li>
                      <li className={`ats-new-2`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newcontact.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.contactedcount : "0"}</p>
                        <h6>Contacted</h6>
                      </li>
                      <li className={`ats-new-3`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newintersted.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.interestedcount : "0"}</p>
                        <h6>Interested</h6>
                      </li>
                      <li className={`ats-new-4`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newtobesubmited.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.tobesubmittedcount : "0"}</p>
                        <h6>To Be Submitted</h6>
                      </li>
                      <li className={`ats-new-5`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newsubmit.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.submittedcount : "0"}</p>
                        <h6>Submitted</h6>
                      </li>
                      <li className={`ats-new-6`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newshortlist.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.shortlistedcount : "0"}</p>
                        <h6>Shortlisted</h6>
                      </li>
                      <li className={`ats-new-7`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newinterview.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.scheduledcount : "0"}</p>
                        <h6>Interview</h6>
                      </li>
                      <li className={`ats-new-8`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newhired.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.hirecount : "0"}</p>
                        <h6>Hired</h6>
                        </li>                        
                        <li className={`ats-new-9`}>
                        <div className="ats-new-icon">
                          <img
                            src="/icons/newrejected.png"
                            alt="ats-selected"
                          />
                        </div>
                        <p>{jobData ? jobData.rejectedcount : "0"}</p>
                        <h6>Rejected</h6>
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          {/* <Modal.Footer>
            <Button onClick={this.props.handleHide}>Close</Button>
          </Modal.Footer> */}
        </Modal>
      </div>
    );
  }
}
