import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { WithContext as ReactTags } from 'react-tag-input';
import Select from 'react-select';
// import 'react-select/dist/react-selects.css';
import { toastr } from 'react-redux-toastr';
import lodash from 'lodash';
import { getFullName } from '../../utils/jobOpeningUtils';
import styles from './jobOpenings.scss';
import menuRenderer from './CustomMenuRenderer';
import {
  getRecruitersList,
  getSalesRepList,
  updateSearchValue,
  populateExistingUsers,
  onRecruiterSelect,
  onSalesRepSelect,
  deleteRecruiter,
  deleteSalesRep,
  assignJobOpening,
} from '../../redux/modules/job-openings';
import toastrErrorHandling from '../toastrErrorHandling';
import i18n from '../../i18n';

@connect(state => ({
  currentJobOpening: state.jobOpenings.currentJobId,
  recruitersList: state.jobOpenings.recruitersList,
  salesRepList: state.jobOpenings.salesRepList,
  recruiters: state.jobOpenings.recruiters,
  salesReps: state.jobOpenings.salesReps,
  activeRecruiters: state.jobOpenings.activeRecruiters,
  activeSalesReps: state.jobOpenings.activeSalesReps,
  recruiterSearchValue: state.jobOpenings.recruiterSearchValue,
  repSearchValue: state.jobOpenings.repSearchValue,
  user: state.auth.user,
  companyId: state.routing.locationBeforeTransitions.query.companyId,
}), { getRecruitersList,
  getSalesRepList,
  updateSearchValue,
  populateExistingUsers,
  onRecruiterSelect,
  onSalesRepSelect,
  deleteRecruiter,
  deleteSalesRep,
  assignJobOpening })
class AssignJobOpenings extends React.Component {
  static propTypes = {
    onBack: PropTypes.func.isRequired,
    callback: PropTypes.func.isRequired,
    getRecruitersList: PropTypes.func.isRequired,
    getSalesRepList: PropTypes.func.isRequired,
    updateSearchValue: PropTypes.func.isRequired,
    populateExistingUsers: PropTypes.func.isRequired,
    onRecruiterSelect: PropTypes.func.isRequired,
    onSalesRepSelect: PropTypes.func.isRequired,
    deleteRecruiter: PropTypes.func.isRequired,
    deleteSalesRep: PropTypes.func.isRequired,
    assignJobOpening: PropTypes.func.isRequired,
    currentJobOpening: PropTypes.string,
    recruitersList: PropTypes.array,
    salesRepList: PropTypes.array,
    recruiters: PropTypes.array,
    salesReps: PropTypes.array,
    activeRecruiters: PropTypes.array,
    activeSalesReps: PropTypes.array,
    recruiterSearchValue: PropTypes.string,
    repSearchValue: PropTypes.string,
    user: PropTypes.object.isRequired,
    companyId: PropTypes.any,
    activeTab: PropTypes.number.isRequired
  };

  static defaultProps = {
    currentJobOpening: null,
    recruitersList: null,
    salesRepList: null,
    recruiters: null,
    salesReps: null,
    activeRecruiters: null,
    activeSalesReps: null,
    recruiterSearchValue: null,
    repSearchValue: null,
    user: null,
    companyId: null,
  }
  componentWillMount() {
    this.props.getRecruitersList().then(() => {}, error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_RECRUITERS_LIST'), { removeOnHover: true });
    });

    this.props.getSalesRepList().then(() => {}, error => {
      toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
        i18n.t('errorMessage.COULD_NOT_LOAD_SALES_REPS_LIST'), { removeOnHover: true });
    });

    this.props.populateExistingUsers(this.props.recruiters, this.props.salesReps);
  }

  getRecruiterSuggestion = () => {
    const { activeRecruiters, recruitersList, recruiterSearchValue } = this.props;
    const searchValue = recruiterSearchValue || '';
    return recruitersList.filter(recruiter =>
      getFullName(recruiter.firstName, recruiter.lastName).toLowerCase().indexOf(searchValue.toLowerCase()) > -1
      &&
      activeRecruiters.find(activeRecruiter => activeRecruiter.id === recruiter.id) === undefined
    );
  };

  getSalesRepSuggestion = () => {
    const { activeSalesReps, salesRepList, repSearchValue } = this.props;
    const searchValue = repSearchValue || '';
    return salesRepList.filter(salesRep =>
      getFullName(salesRep.firstName, salesRep.lastName).toLowerCase().indexOf(searchValue.toLowerCase()) > -1
      &&
      activeSalesReps.find(activeSalesRep => activeSalesRep.id === salesRep.id) === undefined
    );
  };

  getActiveRecruiters = () => {
    const { activeRecruiters } = this.props;
    return activeRecruiters.map((recruiter, index) => ({
      id: index,
      text: getFullName(recruiter.firstName, recruiter.lastName),
    }));
  };

  getActiveSalesReps = () => {
    const { activeSalesReps } = this.props;
    return activeSalesReps.map((salesRep, index) => ({
      id: index,
      text: getFullName(salesRep.firstName, salesRep.lastName),
    }));
  };

  autosuggestRecruiters = {};

  assign = () => {
    const { activeSalesReps, activeRecruiters, recruiters, salesReps, user, currentJobOpening } = this.props;
    this.props.assignJobOpening(currentJobOpening, activeRecruiters, recruiters, activeSalesReps, salesReps, user.id)
      .then(() => {
        if (this.props.activeTab === 1) {
          toastr.success(i18n.t('successMessage.UPDATED'),
            i18n.t('successMessage.Job Opening updated successfully'));
        } else {
          toastr.success(i18n.t('successMessage.ASSIGNED'),
            i18n.t('successMessage.JOB_OPENING_ASSIGNED_SUCCESSFULLY'));
        }
      }, error => {
        toastrErrorHandling(error.error, i18n.t('errorMessage.SERVER_ERROR'),
          i18n.t('errorMessage.COULD_NOT_PROCESS_REQUEST'), { removeOnHover: true });
      });
    this.props.callback();
  };

  validateFields = (recruiters, salesReps) => {
    if (this.props.activeTab === 1) {
      return !(lodash.isEqual(this.props.activeRecruiters, this.props.recruiters) &&
        lodash.isEqual(this.props.activeSalesReps, this.props.salesReps));
    }
    return recruiters && recruiters.length > 0 && salesReps && salesReps.length > 0;
  }

  renderOption = option => (
    <div className={styles.itemContainer}>
      <div className={styles.avatar}>
        <div>{option.firstName.charAt(0)}</div>
      </div>
      <div>
        <p>{getFullName(option.firstName, option.lastName)}</p>
      </div>
    </div>
  )

  render() {
    const { recruitersList, salesRepList, recruiterSearchValue, repSearchValue,
      onBack, activeRecruiters, activeSalesReps, activeTab } = this.props;

    return (
      <div className={`${styles.assignJobOpening} ${styles.jobDetails}`}>
        <div className={styles.sectionTitle}> Assign Recruiters and Sales Reps </div>
        <span role="presentation" className={styles.back} onClick={onBack}>
          <i className={'fa fa-arrow-left'} aria-hidden="true" />
          Back to Job Detail
        </span>
        <Scrollbars
          universal
          autoHeight
          autoHeightMin={'calc(100vh - 175px)'}
          autoHeightMax={'calc(100vh - 175px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          <div className={`${styles.nextContentDiv} ${styles.divHeading}`}>
            <p>Assign Recruiters <span className={styles.required}>*</span></p>
          </div>
          <div className={styles.searchBox}>
            <Select
              name="recruiter-select"
              value={recruiterSearchValue}
              options={[`Assign all recruiters (${recruitersList.length})`, ...this.getRecruiterSuggestion()]}
              valueKey={'id'}
              labelKey={'firstName'}
              onChange={value => {
                if (!_.isObject(value) && value.indexOf('Assign all') > -1) {
                  this.props.onRecruiterSelect(recruitersList);
                } else {
                  this.props.onRecruiterSelect(value);
                }
              }}
              onInputChange={value => value.trimLeft()}
              disabled={_(recruitersList).isEqual(activeRecruiters)}
              openOnFocus
              placeholder={i18n.t('placeholder.START_SEARCHING_TO_ADD_RECRUITERS')}
              noResultsText={i18n.t('NO_RESULTS_FOUND')}
              menuRenderer={menuRenderer}
              arrowRenderer={null}
              filterOptions={(options, filter) => options.filter((option, index) => {
                if (index === 0) {
                  return filter.trim() === '';
                }
                return getFullName(option.firstName, option.lastName).toLowerCase().startsWith(filter.toLowerCase());
              })}
              optionRenderer={this.renderOption}
              trimFilter
            />
          </div>
          <div className={`${styles.nextContentDiv} ${styles.divHeading}`}>
            <p>Recruiters</p>
          </div>
          {_.isEmpty(activeRecruiters)
            ? <p className={styles.emptyAssign}> You haven't added any recruiters yet</p>
            : <div className={styles.tagsInput}>
              <ReactTags
                tags={this.getActiveRecruiters()}
                handleDelete={this.props.deleteRecruiter}
                handleAddition={() => {}}
              />
            </div>
          }
          <div className={`${styles.nextContentDiv} ${styles.divHeading}`}>
            <p>Assign Sales Reps <span className={styles.required}>*</span></p>
          </div>
          <div className={styles.searchBox}>

            <Select
              name="rep-select"
              value={repSearchValue}
              options={[`Assign all sales reps (${salesRepList.length})`, ...this.getSalesRepSuggestion()]}
              valueKey={'id'}
              labelKey={'firstName'}
              onChange={value => {
                if (!_.isObject(value) && value.indexOf('Assign all') > -1) {
                  this.props.onSalesRepSelect(salesRepList);
                } else {
                  this.props.onSalesRepSelect(value);
                }
              }}
              onInputChange={value => value.trimLeft()}
              disabled={_(salesRepList).isEqual(activeSalesReps)}
              openOnFocus
              placeholder={i18n.t('placeholder.START_SEARCHING_TO_ADD_SALES_REPS')}
              noResultsText={i18n.t('NO_RESULTS_FOUND')}
              menuRenderer={menuRenderer}
              arrowRenderer={null}
              filterOptions={(options, filter) =>
                options.filter((option, index) => {
                  if (index === 0) {
                    return filter.trim() === '';
                  }
                  return getFullName(option.firstName, option.lastName).toLowerCase().startsWith(filter.toLowerCase());
                })
              }
              optionRenderer={this.renderOption}
              trimFilter
            />
          </div>
          <div className={`${styles.nextContentDiv} ${styles.divHeading}`}>
            <p>Sales Reps</p>
          </div>
          {_.isEmpty(activeSalesReps)
            ? <p className={styles.emptyAssign}> You haven't added any sales reps yet</p>
            : <div className={styles.tagsInput}>
              <ReactTags
                tags={this.getActiveSalesReps()}
                handleDelete={this.props.deleteSalesRep}
                handleAddition={() => {}}
              />
            </div>
          }
        </Scrollbars>
        <div className={`${styles.unassignedActions} ${styles.footer}`}>
          <button
            className={'btn btn-border'}
            style={{ borderRadius: '5px' }}
            onClick={() => {
              onBack();
            }}
            disabled={false}
          >
            Close
          </button>
          <button
            className={'btn btn-border orange-btn'}
            style={{ borderRadius: '5px' }}
            onClick={this.assign}
            disabled={!this.validateFields(activeRecruiters, activeSalesReps)}
          >
            {activeTab === 1 ? 'Update' : 'Assign'}
          </button>
        </div>
      </div>
    );
  }
}

export default AssignJobOpenings;
