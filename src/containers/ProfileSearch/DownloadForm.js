import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import styles from './ProfileSearch.scss';

export default class DownloadForm extends Component {
  static propTypes = {
    closedownloadOption: PropTypes.func.isRequired,
    isViewprofile: PropTypes.bool.isRequired,
    isTopBox: PropTypes.bool.isRequired
  };

  downloadResume = () => {
    const downloadResume = {};
    downloadResume.contact = document.querySelector('input[name="contact"]:checked').value;
    downloadResume.language = document.querySelector('input[name="language"]:checked').value;
    if (this.props.isViewprofile) {
      downloadResume.format = document.querySelector('input[name="format"]:checked').value;
    } else {
      downloadResume.score = document.querySelector('input[name="score"]:checked').value;
    }
    this.props.closedownloadOption(downloadResume);
  }

  render() {
    let trClass = 't_r_button';
    if (this.props.isTopBox) {
      trClass = 't_r_button_box';
    }
    return (
      <div className={`${styles.download_confirmation} ${this.props.isViewprofile ? styles[trClass] : ''}`}>
        <form onSubmit={this.downloadResume}>
          <Col lg={12} className={'p-b-20 p-t-20'}>
            <Col lg={12} className={'p-b-5'}>
              <span className={`${styles.download_options}`}>
                <Trans>DO_YOU_WANT_CONTACT_INFO</Trans>
              </span>
            </Col>
            <Col lg={12}>
              <div className={styles.radio_group}>
                <input type="radio" id="Yes" value="yes" defaultChecked name="contact" />
                <label htmlFor="Yes">Yes</label>
                <input type="radio" id="No" value="no" name="contact" />
                <label htmlFor="No">No</label>
              </div>
            </Col>
          </Col>
          <Col lg={12} className={'p-b-20'}>
            <Col lg={12} className={'p-b-5'}>
              <span className={`${styles.download_options}`}>
                <Trans>WHICH_LANGUAGE_YOU_WANT_RESUME</Trans>
              </span>
            </Col>
            <Col lg={12}>
              <div className={styles.radio_group}>
                <input type="radio" id="English" value="english" defaultChecked name="language" />
                <label htmlFor="English"><Trans>ENGLISH</Trans></label>
                <input type="radio" id="German" value="german" name="language" />
                <label htmlFor="German"><Trans>GERMAN</Trans></label>
              </div>
            </Col>
          </Col>
          <Col lg={12} className={'p-b-20'}>
            <Col lg={12} className={'p-b-5'}>
              <span className={`${styles.download_options}`}>
                {!this.props.isViewprofile ? <Trans>IS_PEDIGREE_SCORE_IN</Trans>
                  : <Trans>WHICH_FORMAT_YOU_WANT_RESUME_IN</Trans>}
              </span>
            </Col>
            <Col lg={12}>
              {this.props.isViewprofile ?
                <div className={styles.radio_group}>
                  <input type="radio" id="pdf" value="pdf" defaultChecked name="format" />
                  <label htmlFor="pdf"><Trans>PDF</Trans></label>
                  <input type="radio" id="doc" value="doc" name="format" />
                  <label htmlFor="doc"><Trans>DOCX</Trans></label>
                </div>
                :
                <div className={styles.radio_group}>
                  <input type="radio" id="yes" value="yes" defaultChecked name="score" />
                  <label htmlFor="yes"><Trans>YES</Trans></label>
                  <input type="radio" id="no" value="no" name="score" />
                  <label htmlFor="no"><Trans>NO</Trans></label>
                </div>
              }
            </Col>
          </Col>
          <Col lg={12} className={'p-b-20'}>
            <Col lg={12}>
              <button
                className={`${styles.download_resume} btn button-primary`}
                type="submit"
              >
                <Trans>DOWNLOAD_RESUME</Trans>
              </button>
            </Col>
          </Col>
        </form>
      </div>
    );
  }
}
