const atsTransitionRules = {
  selected: ['contacted', 'rejected'],
  contacted: ['interested', 'rejected'],
  interested: ['toBeSubmitted', 'rejected'],
  toBeSubmitted: ['submitted', 'rejected'],
  submitted: ['shortlisted', 'rejected'],
  shortlisted: ['scheduled', 'rejected'],
  scheduled: ['hired', 'rejected'],
  hired: ['rejected'],
  rejected: []
};

export default atsTransitionRules;
