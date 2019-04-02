import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import i18n from '../../i18n';
import profileStyles from '../../containers/ProfileSearch/ProfileSearch.scss';

const styles = require('./FilterPanel.scss');

export default class FilterPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAllDetails: false
    };
  }

  IterateSkills = skills => {
    const regex1 = /(@\[(.+?)\]\((.+?)\))(\s{0,1})/g;
    // let str1 = '@[(](()@[JAVA](123) @[AND](AND) @[sql](456) @[)]())';
    let array1 = regex1.exec(skills);
    const constarray = [];
    // eslint-disable-next-line jsx-a11y
    while (array1 !== null) {
      constarray.push(array1[2]);
      constarray.push(array1[4]);
      array1 = regex1.exec(skills);
    }
    // console.log(constarray.join(''));


    // const skillName = (skills.map((skill, index) => [<span>{skill.name}</span>,
    //   index !== skills.length - 1 ? (<span className={`${styles.operator}`}><Trans>OR</Trans></span>) : '']));
    return <span className="f-15 display-inline">{constarray.join('')}</span>;
  };

  iterateCompanies = companies => {
    const companyName = (companies.map((company, index) => [
      <div className={styles.selected_filters}>{company.name}</div>,
      index !== company.length - 1 ? (<span className={`${styles.operator}`}><Trans>OR</Trans></span>) : '',
    ]));

    return <span>{companyName}</span>;
  }

  iterateLocations = location => {
    const locationName = (location.map((loc, index) => [
      <div className={styles.selected_filters}>{loc.displayName}</div>,
      index !== location.length - 1 ? (<span className={`${styles.operator}`}><Trans>OR</Trans></span>) : '',
    ]));

    return <span>{locationName}</span>;
  };

   iteratePositions = positions => {
     const positionName = (positions.map((position, index) => [
       <div className={styles.selected_filters}>{position.name}</div>,
       index !== positions.length - 1 ? (<span className={`${styles.operator}`}><Trans>OR</Trans></span>) : '',
     ]));
     return <span>{positionName}</span>;
   };

   iterateLanguages = languages => {
     const regex1 = /(@\[(.+?)\]\((.+?)\))(\s{0,1})/g;
     // let str1 = '@[(](()@[English](123) @[AND](AND) @[Tamil](456) @[)]())';
     let array1 = regex1.exec(languages);
     const constarray = [];
     // eslint-disable-next-line jsx-a11y
     while (array1 !== null) {
       constarray.push(array1[2]);
       constarray.push(array1[4]);
       array1 = regex1.exec(languages);
     }
     return <span className="f-15 display-inline">{constarray.join('')}</span>;
   };

   iterateSources = source => {
     const srcName = (source.map((src, index) => [
       <div className={styles.selected_filters}>{src.id}</div>,
       index !== source.length - 1 ? (<span className={`${styles.operator}`}><Trans>OR</Trans></span>) : '',
     ]));
     return <span>{srcName}</span>;
   };

  showAllDetails = () => {
    this.setState({ showAllDetails: !this.state.showAllDetails });
  }

  renderExperience = experience => experience[0] !== experience[1] ?
    [<span className="f-15 p-r-5 display-inline"><Trans>FROM</Trans></span>,
      <span className={styles.selected_filters}>{experience[0]}</span>,
      <span className="p-l-5 p-r-5 display-inline">{i18n.t('TO')}</span>,
      <span className={styles.selected_filters}>{experience[1] > 34 ? `${experience[1]}+` : experience[1]}</span>,
      <span className="p-l-5 p-r-5 display-inline">{i18n.t('YEARS')}</span>] :
    [<span className="p-r-5 display-inline"><Trans>IN</Trans></span>,
      <span className={styles.selected_filters}>{experience[0]}</span>,
      <span className="p-l-5 p-r-5 display-inline">{i18n.t('YEARS')}</span>];

  renderTags = candidateTags => {
    const tagName = (candidateTags.map((tag, index) => [
      <div className={styles.selected_filters}>{tag.name}</div>,
      index !== candidateTags.length - 1 ? (<span className={`${styles.operator}`}><Trans>OR</Trans></span>) : '',
    ]));
    return <span>{tagName}</span>;
  }

  render() {
    const { skills, skillStr, positions, experience, languages, languageStr, source, preferredRadius, location,
      isMobile, isFreelance, isEmail, companies, noticePeriod, noticePeriodType, candidateTags, candidateName
    } = this.props.filters;
    const height = this.elemHeight ? this.elemHeight.clientHeight : '';
    const { showAllDetails } = this.state;
    return (
      <div>
        {!this.props.hideFilterPanel && <Row className={`m-0 ${styles.container} p-5`}>
          <Col sm={12} className="p-5">
            <Col sm={7} lg={8} className={`p-t-10 p-b-10 ellipsis ${styles.filterTitle}`}>
              <span className="p-l-5">{this.props.filterTitle}</span>
            </Col>
            <Col sm={5} lg={4} className="p-t-10 p-b-10 right" style={{ textAlign: 'end' }}>
              <div className="display-inline m-r-20">
                <button
                  id="searchBtn"
                  type="submit"
                  className={`${profileStyles.filter_btns} button-primary`}
                  onClick={this.props.saveSearch}
                >
                  <Trans>SAVE_FILTERS</Trans>
                </button>
              </div>
            </Col>
            <Col lg={12} className="p-0">
              <Col
                lg={12}
                style={{ textTransform: 'capitalize' }}
                className="f-14"
              >
                <div
                  ref={c => { this.elemHeight = c; }}
                  className={`${(!showAllDetails && (height >= 50)) ?
                    styles.showHeight : ''}`}
                >
                  {companies &&
                    <div className="p-b-5">
                      <span className={styles.fieldOperator}>
                        <Trans>COMPANY</Trans></span>
                      <span className={styles.selected_filters}>{companies.name}</span></div>
                  }
                  {candidateName &&
                    <div className="p-b-5"><span className={styles.fieldOperator}>
                      <Trans>CANDIDATE_NAME</Trans>
                    </span><span className="f-15 display-inline">{candidateName}</span></div>
                  }
                  {skills && skills.length > 0 &&
                    <div className="p-b-5"><span className={styles.fieldOperator}>
                      <Trans>SKILLS</Trans></span>{this.IterateSkills(skillStr)}</div>
                  }
                  {positions && positions.length > 0 &&
                    <div className="p-b-5"><span className={styles.fieldOperator}>
                      <Trans>POSITION</Trans></span>{this.iteratePositions(positions)}</div>}
                  {languages && languages.length > 0 &&
                    <div className="p-b-5"><span className={styles.fieldOperator}>
                      <Trans>LANGUAGE</Trans></span>{this.iterateLanguages(languageStr)}</div>}
                  {location && location.length > 0 &&
                    <div className="p-b-5">
                      <span className={styles.fieldOperator}>
                        <Trans>LOCATION</Trans></span>
                      {this.iterateLocations(location)}
                      {preferredRadius ? <span>
                        <span className={styles.operator}>{i18n.t('DISTANCE')}</span>
                        <span className="m-0">{preferredRadius}<Trans>km</Trans></span></span> : ''}
                    </div>}
                  {
                    candidateTags && candidateTags.length > 0 &&
                      <div className="p-b-5">
                        <span className={styles.fieldOperator}>
                          <Trans>TAGS</Trans></span>
                        {this.renderTags(candidateTags)}
                      </div>
                  }
                  {
                    (isEmail || isMobile) &&
                      <div className="p-b-5">
                        <span className={styles.fieldOperator}>
                          <Trans>CONTACTS</Trans></span>
                        {isEmail ? <span>
                          <span className="f-15 p-r-5">{i18n.t('HAS')}</span>
                          <span className="m-0 p-r-5 f-15">{i18n.t('EMAIL')}</span></span> : ''}
                        {isMobile ? <span>
                          <span className="f-15 p-r-5">{i18n.t('HAS')}</span>
                          <span className="m-0 p-r-5 f-15">{i18n.t('MOBILE')}</span></span> : ''}
                      </div>
                  }
                  {
                    isFreelance &&
                    <div className="p-b-5">
                      <span className={styles.fieldOperator}>
                        <Trans>JOB_TYPE</Trans></span>
                      <span className="m-0 p-r-5 f-15">{i18n.t('FREELANCE')}</span>
                    </div>
                  }
                  {noticePeriod && noticePeriodType &&
                  <div className="p-b-5">
                    <span className={styles.fieldOperator}>
                      <Trans>NOTICE_PERIOD</Trans></span>
                    <span className="f-15">{`${noticePeriod} ${noticePeriodType.name}`}</span>
                  </div>}
                  {source && source.length > 0 &&
                  <div className="p-b-5">
                    <span className={styles.fieldOperator}>
                      <Trans>SOURCE</Trans></span>{this.iterateSources(source)}
                  </div>}
                  {experience && experience.length > 0 &&
                  <div className={'p-r-5'}>
                    <span className={styles.fieldOperator}>
                      <Trans>EXPERIENCE</Trans></span>{this.renderExperience(experience)}
                  </div>}
                </div>
              </Col>
              {
                (height >= 50 || showAllDetails) &&
                <Col
                  lg={12}
                  className={styles.showAll}
                  role="presentation"
                  onClick={this.showAllDetails}
                >
                  {
                    !showAllDetails ?
                      <h5><Trans>SHOW_ALL</Trans></h5>
                      :
                      <h5><Trans>SHOW_LESS</Trans></h5>
                  }
                </Col>
              }
            </Col>
          </Col>
        </Row>}
      </div>
    );
  }
}

FilterPanel.propTypes = {
  filters: PropTypes.object.isRequired,
  filterTitle: PropTypes.string.isRequired,
  saveSearch: PropTypes.func.isRequired,
  hideFilterPanel: PropTypes.bool,
};

FilterPanel.defaultProps = {
  hideFilterPanel: false,
};
