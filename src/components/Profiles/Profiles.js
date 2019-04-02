import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Profile from './Profile';
@connect(state => ({
  selectedOpening: state.openings.selectedOpening || {}
}), {})
export default class Profiles extends Component {
  static propTypes = {
    profiles: PropTypes.arrayOf(PropTypes.object),
    selectedOpening: PropTypes.object.isRequired,
    jobId: PropTypes.string.isRequired,
    isBestMatch: PropTypes.bool.isRequired,
    allMatches: PropTypes.bool.isRequired,
    isSelectAll: PropTypes.bool,
    isClearAll: PropTypes.bool.isRequired,
    selectedProfiles: PropTypes.array,
    selectProfile: PropTypes.func.isRequired,
    filters: PropTypes.object,
    user: PropTypes.object
  }

  static defaultProps = {
    profiles: [],
    jobId: '',
    isSelectAll: false,
    selectedProfiles: [],
    filters: {},
    user: {}
  }
  concatProfilesAndOpening = (profiles, selectedOpening, selectedProfiles) => {
    const { resumeIds } = selectedOpening;
    if (resumeIds && resumeIds.length) {
      return profiles.map(data => {
        if (resumeIds.indexOf(data.id.toString()) !== -1) {
          return { ...data, isSelected: true };
        }
        return { ...data, isSelected: false };
      });
    }
    selectedProfiles.map(selectedProfile => {
      const index = profiles.findIndex(profile => selectedProfile.id === profile.id);
      if (index !== -1) {
        profiles[index].isChecked = selectedProfile.isChecked;
      }
      return '';
    });
    return profiles;
  }

  render() {
    const { profiles,
      selectedOpening, jobId, filters, user,
      isBestMatch, allMatches, selectedProfiles, selectProfile, isClearAll, isSelectAll } = this.props;
    const updatedProfiles = this.concatProfilesAndOpening(profiles, selectedOpening, selectedProfiles);
    return (
      <div className="col-sm-12" style={{ padding: '0px 25px 50px 10px' }}>
        {
          updatedProfiles.map(profile =>
            (<Profile
              allMatches={allMatches}
              isBestMatch={isBestMatch}
              jobId={jobId}
              key={`profile_${profile.id}`}
              profile={profile}
              selectedProfiles={selectedProfiles}
              selectProfile={selectProfile}
              isClearAll={isClearAll}
              isSelectAll={isSelectAll}
              filters={filters}
              user={user}
            />)
          )
        }
      </div>
    );
  }
}
