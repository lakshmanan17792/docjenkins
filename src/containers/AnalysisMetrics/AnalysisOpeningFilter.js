import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { Col, Row } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { Trans } from 'react-i18next';
import Select from 'react-select';
import toastrErrorHandling from '../../containers/toastrErrorHandling';
import styles from './AnalysisMetrics.scss';
import i18n from '../../i18n';

const renderField = data => {
  const {
    name,
    valueKey,
    labelKey,
    selectedOption,
    handleOnChange,
    handleOnInputChange,
    options,
    placeholder,
    disabled
  } = data;
  return (
    <div>
      <Select
        name={name}
        valueKey={valueKey}
        labelKey={labelKey}
        value={selectedOption}
        onChange={handleOnChange}
        isClearable={false}
        onInputChange={handleOnInputChange}
        options={options}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        noResultsText={i18n.t('NO_RESULTS_FOUND')}
        disabled={disabled}
        style={disabled ? { cursor: 'not-allowed' } : { cursor: 'default' }}
      />
    </div>
  );
};

@reduxForm({
  form: 'OpeningFilter',
  initialValues: {}
})
export default class AnalysisOpeningFilter extends Component {
  static propTypes = {
    analysisCompany: PropTypes.func.isRequired,
    analysisContactSearch: PropTypes.func.isRequired,
    analysisAccountSearch: PropTypes.func.isRequired,
    analysisJobOpenings: PropTypes.func.isRequired,
    companyList: PropTypes.array.isRequired,
    // contactList: PropTypes.array.isRequired,
    AccountList: PropTypes.object.isRequired
  }

  static defaultProps = {
    initialValues: null,
    companyList: [],
    // contactList: [],
    AccountList: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      initialParam: 'initial',
      limit: 15,
      searchVal: '',
      searchTerm: '',
      page: 1,
      open: false,
    };
  }

  componentWillMount() {
    const { initialValues, companyList } = this.props;
    if ((!initialValues || !initialValues.companies) && (!companyList || companyList.length === 0)) {
      this.handleOnCompanyChange(this.state.initialParam);
    }
    if(sessionStorage.getItem('companyName')) {
      this.setState({
        selectedOption: {
        name: sessionStorage.getItem('companyName')
        }
      });
    } else {
      this.setState({selectedOption: ""});
    }    
  }

  componentDidMount = () => { }

  handleChange = selectedOption => {
    if (selectedOption && selectedOption.id) {
      sessionStorage.setItem('selectedActivePage', 1);
      sessionStorage.setItem('orderBy', "");
      sessionStorage.setItem('orderIn', "");
      sessionStorage.setItem('companyId', selectedOption.id);
      sessionStorage.setItem('companyName', selectedOption.name);
      this.setState({ selectedOption }, () => {
        this.props.change(this.props.form, 'companies', selectedOption);
        this.props.analysisContactSearch(selectedOption.id);
        this.props.analysisAccountSearch(selectedOption.id);        
        const data = {
          companyid: selectedOption.id,
          page: this.state.page,
          limit: this.state.limit,
          orderBy:"",
          orderIn:"", 
        };
        this.props.analysisJobOpenings(data);
      });
    } else {
      this.setState({ selectedOption: '' });
      this.props.change(this.props.form, 'companies', '');
    }
  }

  handleOnCompanyChange = value => {
    if (value && value !== '.' && !value.startsWith('/') && !/\\/g.test(value)
     && !value.startsWith('.\\') && !value.startsWith('\\') && !value.startsWith('./') && value.trim() !== '') {
      sessionStorage.setItem('selectedActivePage', 1);
      sessionStorage.setItem("orderBy", "");
      sessionStorage.setItem("orderIn", "");
      const searchVal = value.toLowerCase();
      const data = {
        page: this.state.page,
        resultsPerPage: 15,
        status: 'all',
        searchTerm: searchVal
      };
      this.props.analysisCompany(data);
      this.props.change(this.props.form, 'companies', '');
    }
  }

  render() {
    const { selectedOption } = this.state;
    const { companyList, contactList } = this.props;
    const { salesOwners, recruiters } = this.props.AccountList;    
    return (
      <Col lg={12} md={12} sm={12} xs={12} className={`${styles.filter_container}`}>
        <p className={styles.select_heading}>Select Company</p>
        <form className="form-horizontal" onSubmit={''}>
          <div className={styles.opening_filter}>
            <div className={styles.fields_body}>
              <Row>
                {<Col sm={12} className={`m-t-5 p-b-20 m-r-5 ${styles.capitalize}`}>
                  <div className="m-t-5 p-b-15">
                    <label htmlFor="companies"><Trans>COMPANY</Trans>
                      <span className="required_color"> *</span>
                    </label>
                    <div>
                      <Field
                        component={renderField}
                        name="companies"
                        valueKey="id"
                        labelKey="name"
                        selectedOption={selectedOption}
                        handleOnChange={this.handleChange}
                        handleOnInputChange={this.handleOnCompanyChange}
                        options={companyList}
                        placeholder="SELECT_COMPANY"
                        disabled={this.props.isCompanyDisable}
                      />
                    </div>
                  </div>
                </Col>}
              </Row>
            </div>
          </div>
        </form>
        <Scrollbars
          universal
          autoHeight
          autoHeightMin={'calc(100vh - 210px)'}
          autoHeightMax={'calc(100vh - 210px)'}
          renderThumbHorizontal={props => <div {...props} className="hide" />}
          renderView={props => <div {...props} className={`customScroll ${styles.scroll_bar_body}`} />}
        >
          {/* <Row>
            <Col sm={12} >
              <p className={styles.select_heading}>Contacts</p>
              <ul className={styles.listing}>
                { this.props.contactList.length !== 0 ? <div>{
                  contactList.map((contact, index) =>
                    <li key={index}><i className="fa fa-caret-right" />{contact.firstName} {contact.lastName}</li>)}
                </div> : ''
                }
              </ul>
            </Col>
          </Row> */}
          <Row>
            <Col sm={12} >
              { this.props.AccountList.salesOwners && this.props.AccountList.salesOwners.length !== 0 ? <div>
                <p className={styles.select_heading}>Account owners</p>
                <ul className={styles.listing}>
                  { salesOwners.map((salesOwner, index) =>
                    <li key={index}><i className="fa fa-caret-right" />{salesOwner.firstName} {salesOwner.lastName}</li>)
                  }
                </ul> </div> : ''}
              {/* <ul className={styles.listing}>
                { this.props.AccountList.recruiters && this.props.AccountList.recruiters.length !== 0 ?
                  <div><p className={styles.heading_sub}>Recruiters</p>{
                    recruiters.map((recruiter, index) =>
                      <li key={index}><i className="fa fa-caret-right" />{recruiter.firstname} {recruiter.lastname}</li>)}
                  </div>
                  : ''}
              </ul> */}
            </Col>
          </Row>
        </Scrollbars>
      </Col>
    );
  }
}
