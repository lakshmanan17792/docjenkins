import React, { Component } from 'react';
import { Col, Button } from 'react-bootstrap';
import { push as pushState } from 'react-router-redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './NotFound.scss';

@connect(() => ({}), { pushState })
export default class NotFound extends Component {
  static propTypes = {
    pushState: PropTypes.func.isRequired
  };

  render() {
    return (
      <div className="container">
        <Col lg={10} md={10} lgOffset={1} mdOffset={1} className={styles.container}>
          <div className={styles.content}>
            <h1>Oops</h1>
            <h4>We can’t seem to find the page you are looking for.</h4>
            <Button
              className={`${styles.dashboardBtn} button-primary`}
              onClick={() => this.props.pushState('/Dashboard')}
            >
              Take me to dashboard
            </Button>
          </div>
          <img
            src="./404.svg"
            alt="404"
          />
        </Col>
      </div>
    );
  }
}
