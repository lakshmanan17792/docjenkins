import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { push as pushState } from 'react-router-redux';
import Loader from '../../components/Loader';
import styles from '../../containers/Openings/Openings.scss';
import { analysisJobOpenings, loadJobDetails,
  analysisCompany,
  analysisContactSearch,
  analysisAccountSearch
} from '../../redux/modules/job-openings';
import { loadProfileById as loadProfile } from '../../redux/modules/profile-search';
import i18n from '../../i18n';
import AnalysisOpeningFilter from './AnalysisOpeningFilter';
import ViewOpeningsAnalysis from './ViewOpeningsAnalysis';

@connect(state => ({
  analysisJobOpeningsLoading: state.jobOpenings.loading,
  analysisJobOpeningsTotal: state.jobOpenings.analysisJobOpeningsTotal || 0,
  user: state.auth.user,
  openingList: state.jobOpenings.openingList,
  total: state.jobOpenings.total,
  loading: state.jobOpenings.loading,
  analysisCompany: PropTypes.func.isRequired,
  analysisContactSearch: PropTypes.func.isRequired,
  analysisAccountSearch: PropTypes.func.isRequired,
  analysisJobOpenings: PropTypes.func.isRequired,
  companyList: state.jobOpenings.companyList,
  contactList: state.jobOpenings.contactList,
  AccountList: state.jobOpenings.AccountList,
}), { loadProfile,
  pushState,
  analysisJobOpenings,
  loadJobDetails,
  analysisCompany,
  analysisContactSearch,
  analysisAccountSearch })

class AnalysisMetrics extends Component {
    static propTypes = {
      analysisCompany: PropTypes.func.isRequired,
      analysisContactSearch: PropTypes.func.isRequired,
      analysisAccountSearch: PropTypes.func.isRequired,
      analysisJobOpenings: PropTypes.func.isRequired,
      companyList: PropTypes.array.isRequired,
      loading: PropTypes.bool,
      // contactList: PropTypes.array.isRequired,
      // AccountList: PropTypes.object.isRequired,
      openingList: PropTypes.array.isRequired,
      total: PropTypes.number.isRequired,
      analysisJobOpeningsLoading: PropTypes.bool.isRequired,
      analysisJobOpeningsTotal: PropTypes.number.isRequired,
      loadJobDetails: PropTypes.func.isRequired,
    }

    constructor(props) {
      super(props);
      this.state = {
        companyId: 0,
        page: 1,
        limit: 15
      };
    }

    componentDidMount = () => {
      let company_id;
      if(sessionStorage.getItem("companyId")) {
        company_id = sessionStorage.getItem("companyId")
      } else {
        company_id = this.state.companyId
      }
      const data = {
        companyid: company_id,
        page: this.state.page,
        limit: this.state.limit
      }
      this.props.analysisJobOpenings(data);
      // this.props.analysisCompany(company_id);
      this.props.analysisAccountSearch(company_id);
    }

    render() {
      const { analysisCompany, openingList, companyList, analysisJobOpenings,
        loadJobDetails, analysisAccountSearch, analysisContactSearch, total, pushState,
        AccountList, contactList, analysisJobOpeningsTotal, analysisJobOpeningsLoading } = this.props;
      return (
        <div className="p-0">
          <Helmet title={i18n.t('ANALYSIS_METRICS')} />
          <Loader loading={this.props.loading} />
          <Col lg={12} md={12} sm={12} className="p-l-0">
            <Col lg={2} md={2} sm={3} className={styles.filter_outer}>
              <AnalysisOpeningFilter
                analysisCompany={analysisCompany}
                companyList={companyList}
                AccountList={AccountList}
                contactList={contactList}
                analysisContactSearch={analysisContactSearch}
                analysisAccountSearch={analysisAccountSearch}
                analysisJobOpenings={analysisJobOpenings}
                // total={total}
              />
            </Col>
            <Col lg={10} md={10} sm={9} className={styles.filter_outer}>
              <ViewOpeningsAnalysis
                loading={analysisJobOpeningsLoading}
                openingList={openingList}
                analysisJobOpenings={analysisJobOpenings}
                loadJobDetails={loadJobDetails}
                total={analysisJobOpeningsTotal}
                route={pushState}
              />
            </Col>
          </Col>
        </div>
      );
    }
}

export default AnalysisMetrics;
