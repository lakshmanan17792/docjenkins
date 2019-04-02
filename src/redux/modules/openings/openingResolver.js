import parser from '../Parser';

const openingResolver = {
  addNewOpening: (openings, newOpening) => {
    const opening = {
      ...newOpening.saveJobCompanies[0],
      rejectedCount: 0,
      submittedCount: 0,
      statusCount: {
        hired: 0,
        submitted: 0,
        rejected: 0
      },
      id: newOpening.saveJobCompanies[1],
    };
    openings.unshift({ ...opening });
    return parser.parseOpenings(openings);
  },

  addResumeIdWithSelectedJob: (state, addedResume) => {
    const { selectedOpening: { resumeIds } } = state;
    if (resumeIds && typeof resumeIds === 'object') {
      resumeIds.push(addedResume.resumeId);
      return {
        ...state.selectedOpening,
        resumeIds
      };
    }
    return state.selectedOpening;
  },

  addJobIdWithSelectedProfile: (state, addedResume) => {
    // let resume: { jobIds } } = state.resume.jobIds;
    const jobIds = state.resume.jobIds;
    if (jobIds && typeof jobIds === 'object') {
      state.resume.jobIds.push(addedResume.jobId);
      return { ...state.resume };
    }
    return state.resume;
  },

  removeResumeIdFromSelectedJob: (state, resumeId) => {
    const { selectedOpening: { resumeIds } } = state;
    if (resumeIds && typeof resumeIds === 'object') {
      const index = resumeIds.indexOf(resumeId.toString());
      resumeIds.splice(index, 1);
      return {
        ...state.selectedOpening,
        resumeIds
      };
    }
    return state.selectedOpening;
  },

  removeJobIdFromSelectedProfile: (state, jobId) => {
    // const { resume: { jobIds } } = state;
    if (state.resume.jobIds && typeof state.resume.jobIds === 'object') {
      const index = state.resume.jobIds.indexOf(jobId);
      state.resume.jobIds.splice(index, 1);
      return {
        ...state.resume
      };
    }
    return state.resume;
  }
};

export default openingResolver;
