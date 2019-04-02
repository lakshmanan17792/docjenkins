import React, { Component } from 'react';
import { Col, Fade, Image } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import Loader from '../../components/Loader';

const styles = require('../../components/Header/Header.scss');

export default class Slider extends Component {
  static propTypes = {
    showSlider: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    isBackButton: PropTypes.bool,
    component: PropTypes.element.isRequired,
    header: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
    goBack: PropTypes.func,
    bottomComponent: PropTypes.element
  }

  static defaultProps = {
    isCheckDuplicationFormEnabled: false,
    goBack: null,
    bottomComponent: null,
    isBackButton: false
  }

  render() {
    const { showSlider, header, component, onClose, isBackButton, bottomComponent, loading } = this.props;
    return (
      <div className={styles.user_notification}>
        {showSlider && <Fade in={showSlider}>
          <div className={styles.overlay}>
            <div className={styles.content} ref={c => { this.container = c; }}>
              <Image
                src="/close.png"
                responsive
                onClick={onClose}
                className={styles.close_img}
              />
              {isBackButton &&
                <div className={`${styles.backArrow}`} onClick={this.props.goBack} role="presentation">
                  <i className="fa fa-long-arrow-left" aria-hidden="true" />
                </div>
              }
              <div>
                <Col xs={12} className={styles.candid_hdr}>
                  <h2 className="m-0 p-l-10 p-r-10">
                    <Trans>{header}</Trans>
                  </h2>
                </Col>
                <div>
                  <Scrollbars
                    universal
                    autoHide
                    autoHeight
                    autoHeightMin={'calc(100vh - 160px'}
                    autoHeightMax={'calc(100vh - 160px'}
                    renderThumbHorizontal={props => <div {...props} className="hide" />}
                    renderView={props => <div {...props} className="customScroll" />}
                  >
                    <Col lg={12} md={12} sm={12} xs={12} className="p-b-30">
                      {component}
                    </Col>
                  </Scrollbars >
                  {bottomComponent}
                </div>
                <Loader loading={loading} />
              </div>
            </div>
          </div>
        </Fade>}
      </div>
    );
  }
}
