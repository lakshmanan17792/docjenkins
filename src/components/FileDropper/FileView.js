import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Fade } from 'react-bootstrap';
import constant from '../../helpers/Constants';
import i18n from '../../i18n';

const styles = require('./FileView.scss');

const fileTypes = ['jpg', 'jpeg', 'png'];

export default class FileView extends Component {
  static propTypes = {
    closeSlider: PropTypes.func,
    fileName: PropTypes.string,
    fileId: PropTypes.string
  }

  static defaultProps = {
    closeSlider: null,
    fileName: '',
    fileId: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    this.authToken = localStorage ? localStorage.getItem('authToken') : null;
    const { fileName } = this.props;
    let loadingMessage = '';
    const fName = fileName.match(/.*(?=\.)/);
    const fileExt = fileName.replace(/^.*\./, '').toLowerCase();
    const url = `${constant.fileDownLoad.viewURL}${this.props.fileId}?access_token=${this.authToken}&embedded=true`;
    if (!fileTypes.includes(fileExt)) {
      loadingMessage = i18n.t('FILE_VIEW_LOADING_MESSAGE');
    }
    this.setState({
      fileName: fName,
      fileExt,
      url,
      loadingMessage
    });
  }

  componentDidMount() {
    const { fileExt } = this.state;
    if (!fileTypes.includes(fileExt)) {
      this.iframeTimeoutId = setTimeout(this.reload, 1000 * 15);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.iframeTimeoutId);
  }

  onLoadComplete = () => {
    this.setState({ loading: false, loadingMessage: '' });
    clearTimeout(this.iframeTimeoutId);
  }

  reload = () => {
    this.frame.src = this.state.url;
    this.setState({ loadingMessage: i18n.t('FILE_VIEW_LOADING_RETRY_MESSAGE') });
    // set timer for 10s to reload that file , otherwise clear the source and responds with custom message
    this.iframeTimeoutId = setTimeout(() => {
      this.frame.src = '';
      this.setState({ loadingMessage: i18n.t('FILE_VIEW_LOADING_ERROR_MESSAGE'), loading: false });
    }, 1000 * 10);
  }

  headerClose = () => {
    this.props.closeSlider();
  }

  processingComplete = () => {
    this.setState({
      loading: false
    });
  }

  loader = () => (
    <div className={`loading_overlay ${styles.fileLoader}`}>
      <div>
        {!fileTypes.includes(this.state.fileExt) ? this.state.loadingMessage : ''}
        {this.state.loading ? <div style={{ fontSize: '25px', fontWeight: '600', textAlign: 'center' }}>
          <i className="fa fa-circle-o-notch fa-spin" />
        </div> : ''}
      </div>
    </div>
  );

  render() {
    const { fileName, fileExt, url } = this.state;
    return (
      <div>
        <div className="right">
          <Col lg={12} md={12} className="p-0" >
            <Fade in>
              <div className={styles.overlay}>
                <div className={styles.content}>
                  <div className={`${styles.header} p-10`}>
                    <Row>
                      <Col lg={8} sm={8} xs={8}>
                        <h3 className={`m-0 p-l-10 p-r-10 ${styles.headerColor}`}>{fileName}</h3>
                      </Col>
                      <Col lg={4} sm={4} xs={4}>
                        <i
                          className={`${styles.headerClose} fa fa-times`}
                          onClick={this.headerClose}
                          role="presentation"
                        />
                      </Col>
                    </Row>
                    <div className={styles.notification_details}>
                      <Col lg={12} md={12} sm={12} xs={12} className="m-t-20">
                        {fileTypes.includes(fileExt) ?
                          <img
                            src={`${constant.fileDownLoad.url}${this.props.fileId}?access_token=${this.authToken}`}
                            alt=""
                            border="0"
                            height="auto"
                            width="650"
                            onLoad={this.processingComplete}
                          /> :
                          <iframe
                            id="your_iframe"
                            ref={c => { this.frame = c; }}
                            title={i18n.t('tooltipMessage.FILEVIEW')}
                            src={url}
                            style={{ width: `${100}%`, height: `calc(${100}vh - ${130}px)`, overflow: 'hidden' }}
                            frameBorder="0"
                            onLoad={this.onLoadComplete}
                          />
                        }
                        {(this.state.loading || this.state.loadingMessage) && this.loader()}
                      </Col>
                    </div>
                  </div>
                </div>
              </div>
            </Fade>
          </Col>
        </div>
      </div>
    );
  }
}

