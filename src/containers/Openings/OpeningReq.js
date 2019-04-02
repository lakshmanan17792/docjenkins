import React, { Component } from 'react';
import { reduxForm, getFormValues, change } from 'redux-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import InputBox from '../../components/FormComponents/InputBox';
import MultiselectField from '../../components/FormComponents/MultiSelect';
import DropdownField from '../../components/FormComponents/DropdownList';
import { jobDetailsValidation, getJobDetailsFormConfig } from '../../formConfig/StepSaveOpening';
import { loadPositions } from '../../redux/modules/profile-search';
import {
  loadDeliveryHeads,
  loadSalesOwners,
  loadRecruiters
} from '../../redux/modules/openings';
import { loadJobCategory } from '../../redux/modules/job-category';
import NewPermissible from '../../components/Permissible/NewPermissible';

const styles = require('./StepSaveOpening.scss');

@reduxForm({
  form: 'StepSaveOpening',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: jobDetailsValidation
})

@connect(state => ({
  values: getFormValues('StepSaveOpening')(state),
  categories: state.jobCategory.categoryList || {},
  positionList: state.profileSearch.positionList,
  deliveryHeads: state.openings.deliveryHeads,
  salesOwners: state.openings.salesOwners,
  recruiterList: state.openings.recruiterList
}), {
  loadDeliveryHeads,
  loadPositions,
  loadJobCategory,
  loadSalesOwners,
  loadRecruiters,
  change
})
export default class OpeningReq extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    loadPositions: PropTypes.func.isRequired,
    loadDeliveryHeads: PropTypes.func.isRequired,
    loadJobCategory: PropTypes.func.isRequired,
    clickedAnotherPage: PropTypes.bool.isRequired,
    resetPageFields: PropTypes.func.isRequired,
    gotoPage: PropTypes.func.isRequired,
    toPage: PropTypes.number.isRequired,
    valid: PropTypes.bool.isRequired,
    salesOwners: PropTypes.array.isRequired,
    loadSalesOwners: PropTypes.func.isRequired,
    loadRecruiters: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    form: PropTypes.string.isRequired,
    change: PropTypes.func.isRequired
  }

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.handleOutsidePositionClick = this.handleOutsidePositionClick.bind(this);
    this.handleOutsideDeliveryHeadClick = this.handleOutsideDeliveryHeadClick.bind(this);
    this.state = {
      isPositionOpen: false,
      initialParam: 'initial',
      isRecruiterOpen: false,
      isJobCategoriesOpen: false,
      selectedSalesOwners: []
    };
  }

  componentWillMount() {
    this.props.loadJobCategory({
      where: {
        isActive: true
      },
      fields: ['id', 'name']
    });
    this.props.loadDeliveryHeads({
      roles: [{ name: 'Delivery Head' }]
    });
    // this.handleOnPositionChange(this.state.initialParam);
    this.props.loadPositions(this.state.initialParam);
    const values = this.props.values;
    if (values && values.company) {
      this.props.loadSalesOwners(values.company.id).then(salesOwners => {
        if (!values.salesOwners || (values.salesOwners && values.salesOwners.length === 0)) {
          this.props.change(this.props.form, 'salesOwners', salesOwners);
        }
      });
    }
    this.props.loadRecruiters();
  }

  componentWillReceiveProps(nextProps) {
    const { valid, handleSubmit, gotoPage, resetPageFields } = this.props;
    const { toPage } = nextProps;
    if (nextProps.clickedAnotherPage) {
      if (toPage < 2) {
        gotoPage(toPage, valid);
      } else if (valid) {
        gotoPage(toPage, valid);
      } else {
        handleSubmit();
        resetPageFields();
      }
    }
  }


  handleOnDeliveryHeadChange = value => {
    document.addEventListener('click', this.handleOutsideDeliveryHeadClick, false);
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\')
      && !value.startsWith('./') && value.trim() !== '') {
      this.setState({
        isRecruiterOpen: true
      }, () => {
        this.props.loadDeliveryHeads({
          roles: [{ name: 'Delivery Head' }]
        });
      });
    } else {
      this.setState({
        isRecruiterOpen: false
      });
    }
  }

  handleOnDeliveryHeadSelect = value => {
    if (value) {
      this.setState({
        isRecruiterOpen: !this.state.isRecruiterOpen
      });
    }
  }
  handleOnJobCatgChange = value => {
    document.addEventListener('click', this.handleOutsideRecruiterClick, false);
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      this.setState({
        isJobCategoriesOpen: true
      });
    } else {
      this.setState({
        isJobCategoriesOpen: false
      });
    }
  }

  handleOnJobCatgSelect = value => {
    if (value) {
      this.setState({
        isJobCategoriesOpen: false
      });
    }
  }

  handleOutsideDeliveryHeadClick = evt => {
    if (!this.state.isRecruiterOpen) {
      return;
    }
    if (this.recruiterContainer !== null &&
      this.recruiterContainer !== undefined &&
      this.recruiterContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isRecruiterOpen: false
    });
  }


  handleOnPositionChange = value => {
    document.addEventListener('click', this.handleOutsidePositionClick, false);
    if (value && value !== '.' && !value.startsWith('/') &&
      !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      this.setState({
        isPositionOpen: true
      }, () => {
        this.props.loadPositions(value.toLowerCase());
      });
    } else {
      this.setState({
        isPositionOpen: false
      });
    }
  }

  handleOnPositionSelect = value => {
    if (value) {
      this.setState({
        isPositionOpen: !this.state.isPositionOpen
      });
    }
  }

  handleOutsidePositionClick = evt => {
    if (!this.state.isPositionOpen) {
      return;
    }
    if (this.positionContainer !== null &&
      this.positionContainer !== undefined &&
      this.positionContainer.contains(evt.target)) {
      return;
    }
    this.setState({
      isPositionOpen: false
    });
  }

  render() {
    const { handleSubmit } = this.props;
    const filterConfig = getJobDetailsFormConfig(this);
    return (
      <form onSubmit={handleSubmit}>
        <div className={`m-t-10  p-l-15 p-r-15 ${styles.select_vacancy_size}`}>
          <InputBox {...filterConfig.vacancies} />
        </div>
        <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <DropdownField {...filterConfig.priority} />
        </div>
        <NewPermissible operation={{ model: 'jobCategory', operation: 'VIEW_ALL_JOBCATEGORY' }}>
          <div className="m-t-10 m-b-5 p-l-15 p-r-15">
            <MultiselectField {...filterConfig.categories} />
          </div>
        </NewPermissible>
        {/*
        <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <MultiselectField {...filterConfig.deliveryHeads} ref={c => { this.recruiterContainer = c; }} />
        </div>
        */
        }
        <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <MultiselectField {...filterConfig.salesOwners} />
        </div>
        <div className="m-t-10 m-b-5 p-l-15 p-r-15">
          <MultiselectField {...filterConfig.recruiters} />
        </div>
        <div className="m-t-10 m-b-5 p-l-15 p-r-15" ref={c => { this.positionContainer = c; }}>
          <MultiselectField {...filterConfig.fields.positions} />
        </div>
        <div className="m-t-10 m-b-25 p-l-15 p-r-15">
          <button className={`${styles.submitButton} button-primary`} type="submit">
            <Trans>CONTINUE</Trans>
          </button>
        </div>
      </form>
    );
  }
}
