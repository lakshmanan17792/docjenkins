import lodash from 'lodash';

const candidateResolver = {
  removeUnarchivedCandidate: (candidates, candidateId) => {
    lodash.remove(candidates, candidate => candidate.id === candidateId);
    return candidates;
  },
};

export default candidateResolver;
