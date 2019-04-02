import React, { Component } from 'react';
import { Col, Row, Button, Label } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import moment from 'moment';
import lodash from 'lodash';
import { Trans } from 'react-i18next';
import styles from './CandidateOpening.scss';
import Loader from '../Loader';
import i18n from '../../i18n';
import SearchBar from '../../components/FormComponents/SearchBar';
import { trimTrailingSpace } from '../../utils/validation';

let timeoutId;
@reduxForm({
  form: 'searchCandidateOpening'
})

export default class CandidateOpening extends Component {
  static propTypes = {
    pushState: PropTypes.func.isRequired,
    resumeId: PropTypes.string.isRequired,
    openingList: PropTypes.arrayOf(PropTypes.object),
    fetchJobOpenings: PropTypes.func.isRequired,
    noMoreOpening: PropTypes.bool,
    totalCount: PropTypes.number,
    loading: PropTypes.bool
  }

  static defaultProps = {
    openingLoading: false,
    openingList: [],
    profileName: '',
    currentPage: 1,
    noMoreOpening: false,
    totalCount: 0,
    loading: false
  }

  constructor(props) {
    super(props);
    this.state = {
      limit: 10,
      searchTerm: '',
      page: 1,
    };
  }

  componentWillMount() {
    this.loadOpeningsOfCandidate(false);
  }

  setScrollToTop = () => {
    if (this.scrollbar) {
      this.scrollbar.scrollToTop();
    }
  }

  setSearchTerm = evt => {
    let value = evt.target.value && evt.target.value.replace(/\s\s+/g, ' ');
    if (value === this.state.searchTerm || value === ' ') {
      value = value.trim();
    }
    if (/^[a-zA-Z0-9\s@.]+$/i.test(value) || value === '') {
      this.setState({ searchTerm: trimTrailingSpace(value), page: 1 }, () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          this.loadOpeningsOfCandidate(false);
          this.setScrollToTop();
        }, 1000);
      });
    }
  }

  resetSearch = () => {
    this.setState({ searchTerm: '', page: 1 }, () => {
      this.loadOpeningsOfCandidate(false);
      this.setScrollToTop();
    });
  }

  loadOpeningsOfCandidate = onScroll => {
    const { limit, searchTerm, page } = this.state;
    const toLoadOpenings = onScroll ? !this.props.noMoreOpening : true;
    if (toLoadOpenings) {
      this.props.fetchJobOpenings({
        searchTerm,
        skip: (page - 1) * limit,
        limit,
      }, onScroll);
    }
  }

  handleClick = () => {
    sessionStorage.setItem('profileTabKey', 5);
    this.props.pushState({ pathname: '/Openings', query: { profileId: this.props.resumeId } });
  }


  handleJobClick = jobId => {
    sessionStorage.setItem('profileTabKey', 5);
    this.props.pushState({ pathname: `/Openings/${jobId}` });
  }

  handleScroll = values => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const pad = 30; // 100px of the bottom
    const toScroll = ((scrollTop + pad) / (scrollHeight - clientHeight));
    if (toScroll > 1) {
      this.setState({ page: this.state.page + 1 }, () => {
        this.loadOpeningsOfCandidate(true);
      });
    }
  }

  renderButton = () => (<Button
    className={`button-primary ${styles.add_btn}`}
    onClick={this.handleClick}
  ><Trans>ADD_TO_OPENING</Trans>
  </Button>)

renderNoResultsFound = () => {
  const NoResultsFound = (
    <Col sm={12} md={12} lg={12} className={styles.no_results_found} style={{ margin: '80px auto' }}>
      <Row className="text-center m-0"><img src="/sadface.png" alt="sad face" /></Row>
      <Row className={`${styles.sub_head} m-0`}><div><Trans>NO_OPENINGS_FOUND</Trans></div></Row>
    </Col>
  );
  return NoResultsFound;
}

render() {
  const { openingList, totalCount } = this.props;
  return (
    <Row>
      <Col md={12} sm={12} xs={12} lg={12} className="p-30">
        <Loader loading={this.props.loading} />
        {totalCount === 0 &&
          <Col mdOffset={3} md={6} smOffset={3} sm={6}>
            <div>
              <div className={styles.no_opening}>
                <Trans>NO_OPENINGS_TO_SHOW</Trans>
              </div>
              <p className={styles.no_opening_label}>
                <Trans>CANDIDATE_NOT_ADDED_TO_ANY_OPENING</Trans>
                {/* This candidate has not been added to any job opening.
                Hit the button below to add this candidate to a opening. */}
              </p>
              <div style={{ textAlign: 'center' }}>{this.renderButton()}</div>
            </div>
          </Col>
        }
        { totalCount !== 0 &&
          <Col md={12} sm={12} xs={12} lg={12} className="p-0 m-b-10">
            <Col md={8} sm={8} xs={8} lg={8}>
              <div className={styles.jobHeader}>
                <Trans>JOB_OPENINGS</Trans>
              </div>
              <div className={styles.openings}>{totalCount > 1 ?
                `( ${totalCount} ${i18n.t('OPENINGS')} )` : `( ${totalCount} ${i18n.t('OPENING')} )` }</div>
            </Col>
            <Col md={4} sm={4} lg={4} xs={4} style={{ textAlign: 'end', padding: '10px' }}>
              {this.renderButton()}
            </Col>
            <Col lg={4} md={6} sm={8} className="m-b-10">
              <SearchBar
                reset={e => this.resetSearch(e)}
                handleOnChange={e => this.setSearchTerm(e)}
                handleOnKeyUp={() => {}}
                inpValue={this.state.searchTerm}
                placeholder={'SEARCH'}
              />
            </Col>
          </Col>
        }
        {openingList.length !== 0 ? <Scrollbars
          universal
          autoHide
          autoHeight
          autoHeightMin={'calc(100vh - 345px)'}
          autoHeightMax={'calc(100vh - 345px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          onScrollFrame={lodash.throttle(this.handleScroll, 1000)}
          renderView={props => <div {...props} className="customScroll" />}
          ref={c => { this.scrollbar = c; }}
        >
          <div className="p-b-20">
            {openingList.map(profileOpening => (
              <OpeningTile
                profileOpening={profileOpening}
                handleJobClick={this.handleJobClick}
                key={`profileopening_${Math.random().toString(36).substring(7)}`}
              />
            ))
            }
          </div>
        </Scrollbars> : this.renderNoResultsFound()}
      </Col>
    </Row>
  );
}
}

const OpeningTile = properties => {
  const { profileOpening, handleJobClick } = properties;
  return (
    <Row className={styles.jobopening}>
      <Col md={12} sm={12} xs={12} lg={12} className="p-b-10">
        <Col md={4} sm={4} xs={4} lg={4}>
          <div
            className={`${styles.jobTitle} ${styles.ellipsis}`}
            role="button"
            tabIndex="-1"
            title={profileOpening.jobOpening.jobTitle ? profileOpening.jobOpening.jobTitle : ''}
            onClick={() => handleJobClick(profileOpening.jobOpening.id)}
          >
            {profileOpening.jobOpening.jobTitle ? profileOpening.jobOpening.jobTitle : ''}
          </div>
          <div className={`${styles.vacancies} ${styles.capitalize}`}>
            <span>
              { profileOpening.jobOpening.vacancies ? profileOpening.jobOpening.vacancies : 0} <Trans>VACANCIES</Trans>
            </span>
            <span> | { profileOpening.jobOpening.type ? profileOpening.jobOpening.type : 0}</span>
          </div>
        </Col>
        <Col md={3} sm={3} xs={3} lg={3} className="p-l-0">
          <div
            className={`${styles.titleLabel} ${styles.ellipsis}`}
            style={{ textAlign: 'left' }}
            title={profileOpening.companies ? profileOpening.companies.name : ''}
          >
            {profileOpening.companies ? profileOpening.companies.name : '-'}
          </div>
        </Col>
        <Col md={3} sm={3} xs={3} lg={3} style={{ padding: '5px 0' }}>
          <Col md={6} sm={6} xs={12} lg={6} className="p-0">
            <Label className={styles.label}>
              <span className={`${styles.labelText} ${styles.capitalize}`}>
                {profileOpening.status ? profileOpening.status : '-'}
              </span>
            </Label>
          </Col>
          <Col md={6} sm={6} xs={12} lg={6} className="p-0" style={{ textAlign: 'right' }}>
            <Label
              className={profileOpening.jobOpening.status === 'closed' ? `${styles.label} ${styles.closed}` :
                `${styles.label} ${styles.active}`}
            >
              <span className={`${styles.labelText} ${styles.capitalize}`}>
                {profileOpening.jobOpening.status ? profileOpening.jobOpening.status : '-'}
              </span>
            </Label>
          </Col>
        </Col>
        <Col md={2} sm={2} xs={2} lg={2} style={{ padding: '0 15px 0 5px' }}>
          <div className={styles.titleLabel}>
            <div
              className={`${styles.capitalize} ${styles.ellipsis}`}
              title={`${i18n.t('ADDED_BY')} ${profileOpening.user ? profileOpening.user.firstName : '-'}`}
            >
              {`${i18n.t('ADDED_BY')} ${profileOpening.user ? profileOpening.user.firstName : '-'}`}
            </div>
            <div style={{ fontWeight: 'normal' }}> {profileOpening.createdAt &&
                `${moment(profileOpening.createdAt).fromNow()}`
            }</div>
          </div>
        </Col>
      </Col>
    </Row>
  );
};
