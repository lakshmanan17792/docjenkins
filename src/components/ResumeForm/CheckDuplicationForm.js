import React, { Component } from 'react';
import lodash from 'lodash';
import PropTypes from 'prop-types';
import { reduxForm, destroy, reset } from 'redux-form';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import Slider from '../Slider/Slider';
import { getCheckDuplicationFormConfig, checkduplicationValidation } from '../../formConfig/CheckDuplicationFormConfig';
import InputBox from '../../components/FormComponents/InputBox';
import { getSimilarCandidate, setCandidateData,
  cleanSimilarProfiles } from '../../redux/modules/linkedinProfiles/linkedinProfiles';
import baseInitialvalues from '../../containers/Resume/ResumeData';

const styles = require('./ResumeForm.scss');
@connect(state => ({
  user: state.auth.user,
  loading: state.linkedinProfiles.loading,
  duplicateCandidates: state.linkedinProfiles.similarLinkedinProfiles,
  canAddProfile: state.linkedinProfiles.canAddProfile
}), { getSimilarCandidate, pushState, destroy, reset, setCandidateData, cleanSimilarProfiles })
@reduxForm({
  form: 'CheckDuplication',
  validate: checkduplicationValidation
})
export default class CheckDuplicationForm extends Component {
  static propTypes = {
    isCheckDuplicationFormEnabled: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    isAddCandidate: PropTypes.bool.isRequired,
    getSimilarCandidate: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    setCandidateData: PropTypes.func.isRequired,
    destroy: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]).isRequired,
    duplicateCandidates: PropTypes.array,
    onClose: PropTypes.func.isRequired,
    isDuplicateListEnabled: PropTypes.bool,
    linkedinCandidate: PropTypes.object,
    isLinkedinCandidate: PropTypes.bool,
    isParsedCandidate: PropTypes.bool.isRequired,
    profile: PropTypes.object,
    canAddProfile: PropTypes.bool,
    cleanSimilarProfiles: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired
  }

  static defaultProps = {
    isCheckDuplicationFormEnabled: false,
    isLinkedinCandidate: false,
    isDuplicateListEnabled: false,
    duplicateCandidates: [],
    profile: {},
    linkedinCandidate: null,
    canAddProfile: false
  }

  constructor(props) {
    super(props);
    this.state = {
      isDuplicateListEnabled: false
    };
  }

  componentWillReceiveProps(nextprops) {
    const { isDuplicateListEnabled } = nextprops;
    this.setState({
      isDuplicateListEnabled
    });
  }

  onSubmit = async values => {
    const data = await values;
    const splitedArray = data.name.split(' ');
    const length = splitedArray.length;
    const first = splitedArray[0];
    const middle = length > 2 ? splitedArray.slice(1, length - 1).join(' ') : '';
    const last = length > 1 ? splitedArray[length - 1] : '';
    const { user: { firstName, lastName } } = this.props;
    baseInitialvalues.created_user = `${firstName} ${lastName}`;
    baseInitialvalues.updated_user = `${firstName} ${lastName}`;
    baseInitialvalues.first_name = first;
    baseInitialvalues.middle_name = middle;
    baseInitialvalues.last_name = last;
    baseInitialvalues.contacts.mobile_numbers = data.mobileNumber;
    baseInitialvalues.contacts.emails = data.email;
    this.props.getSimilarCandidate(data).then(result => {
      this.props.setCandidateData({ candidateData: baseInitialvalues });
      if (result && result.data && result.data.length > 0) {
        this.setState({
          isDuplicateListEnabled: true,
          formData: baseInitialvalues
        });
      } else {
        this.props.pushState({
          pathname: '/Resume',
        });
      }
    });
  }

  getEmails = emails => {
    const emailArr = lodash.compact(emails);
    return emailArr.join(', ');
  }

  getPhone = phones => {
    const phoneArr = lodash.compact(phones);
    return phoneArr.join(', ');
  }

  getDuplicatesHeader = () => {
    const { duplicateCandidates } = this.props;
    if (duplicateCandidates && duplicateCandidates.length) {
      if (duplicateCandidates.length > 1) {
        return <span>{duplicateCandidates.length} <Trans>DUPLICATES_FOUND</Trans></span>;
      }
      return <span>{duplicateCandidates.length} <Trans>DUPLICATE_FOUND</Trans> </span>;
    }
  }

  getImgAlt = candidate => {
    const { name } = candidate;
    let imgAlt = '';
    const firstName = candidate.first_name;
    const lastName = candidate.last_name;
    let firstchar = '';
    let secondchar = '';
    if (firstName && firstName[0]) {
      firstchar = firstName[0].toUpperCase();
    } else {
      firstchar = name[0].toUpperCase();
    }
    if (lastName && lastName[0]) {
      secondchar = lastName[0].toUpperCase();
    } else {
      secondchar = name[1] ? name[1].toUpperCase() : '';
    }
    imgAlt = `${firstchar}${secondchar}`;
    return imgAlt;
  }

  addCandidate = () => {
    const { isLinkedinCandidate, isParsedCandidate } = this.props;
    if (isLinkedinCandidate) {
      this.props.pushState({
        pathname: '/Resume',
      });
    } else if (isParsedCandidate && !this.state.formData) {
      this.props.pushState({
        pathname: '/Resume'
      });
    } else {
      this.props.pushState({
        pathname: '/Resume',
      });
    }
  };

  goBack = () => {
    this.setState({ isDuplicateListEnabled: false });
  }

  renderForm = () => {
    const { handleSubmit, pristine } = this.props;
    const formConfig = getCheckDuplicationFormConfig(this);
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <div className="p-t-15 p-b-25">
          <InputBox {...formConfig.name} />
        </div>
        <div className="p-b-25">
          <InputBox {...formConfig.emails} />
        </div>
        <div className="p-b-25">
          <InputBox {...formConfig.mobile_numbers} />
        </div>
        <div className={styles.candidate_ftr}>
          <button
            className={`${styles.add_candidate_btn} button-primary`}
            type="submit"
          >
            <Trans>PROCEED_TO_ADD_CANDIDATE</Trans>
          </button>
          <button
            onClick={event => {
              event.preventDefault();
              this.props.onClose(event, pristine);
            }}
            className={`${styles.add_candidate_btn} button-secondary`}
            type="button"
          >
            <Trans>CANCEL</Trans>
          </button>
        </div>
      </form>
    );
  }

  renderDuplicates = () => {
    const { duplicateCandidates } = this.props;
    // const canAdd = false;
    return (
      <div>
        <div>
          {duplicateCandidates && duplicateCandidates.length > 0 &&
            duplicateCandidates.map(candidate => (
              <div key={`candidate_${Math.random().toString(36).substring(7)}`} className={styles.duplicateCandidate}>
                {candidate._source &&
                  <div>
                    <div className={styles.img}>
                      {candidate._source.name &&
                        this.getImgAlt(candidate._source)
                      }
                    </div>
                    <div className={styles.details}>
                      {candidate._source.name &&
                        <span className={`${styles.primaryText} ${styles.name}`}>
                          <Link
                            to={{
                              pathname: `/ProfileSearch/${candidate._source.id}`,
                              query: { isAtsBoard: true }
                            }}
                            target="_blank"
                          >
                            {candidate._source.name}
                          </Link>
                        </span>
                      }
                      {candidate._source.contacts.emails && candidate._source.contacts.emails.length > 0 &&
                        <div style={{ margin: '10px 0px 0px' }}>
                          <div className={styles.primaryText}>
                            <Trans>EMAILS</Trans>:
                          </div>
                          <div className={styles.secondaryText} style={{ margin: '0px 5px 10px 0px' }}>
                            {this.getEmails(candidate._source.contacts.emails)}
                          </div>
                        </div>
                      }
                      {candidate._source.contacts.mobile_numbers
                        && candidate._source.contacts.mobile_numbers.length > 0 &&
                        <div style={{ margin: '10px 0px 0px' }}>
                          <div className={styles.primaryText}>
                            <Trans>PHONES</Trans>:
                          </div>
                          <div className={styles.secondaryText} style={{ margin: '0px 5px 10px 0px' }}>
                            {this.getPhone(candidate._source.contacts.mobile_numbers)}
                          </div>
                        </div>
                      }

                    </div>
                  </div>
                }
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  renderBottomComponent = ({ canAddProfile }) => (
    <div style={{ width: '100%' }}>
      {
        canAddProfile && <div
          role="presentation"
          className={styles.duplicateCandidateBtn}
        >
          <button
            className={` ${styles.ignore_btn} btn btn-border filter-btn orange-btn`}
            type="submit"
            onClick={this.addCandidate}
          >
            <Trans>IGNORE_DUPLICATE_AND_PROCEED</Trans>
          </button>
          <button
            className={` ${styles.ignore_btn} btn btn-border filter-btn orange-btn`}
            onClick={this.props.onClose}
            type="button"
          >
            <Trans>CANCEL</Trans>
          </button>
        </div>
      }
    </div>);

  render() {
    const { isCheckDuplicationFormEnabled, isAddCandidate, loading } = this.props;
    const { isDuplicateListEnabled } = this.state;
    return (
      <div>
        {isCheckDuplicationFormEnabled && !isDuplicateListEnabled ?
          <Slider
            header="ADD_CANDIDATE"
            showSlider={isCheckDuplicationFormEnabled}
            component={this.renderForm()}
            loading={loading}
            onClose={() => {
              this.props.cleanSimilarProfiles();
              this.props.onClose();
            }}
          /> :
          null
        }
        {isCheckDuplicationFormEnabled && isDuplicateListEnabled ?
          <Slider
            header={this.getDuplicatesHeader()}
            showSlider={isCheckDuplicationFormEnabled}
            component={this.renderDuplicates()}
            loading={loading}
            bottomComponent={this.renderBottomComponent(this.props)}
            onClose={() => {
              this.props.cleanSimilarProfiles();
              this.props.onClose();
            }}
            isBackButton={isDuplicateListEnabled && isAddCandidate}
            goBack={this.goBack}
          /> :
          null}
      </div>
    );
  }
}
