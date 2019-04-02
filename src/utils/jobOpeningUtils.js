export const convertStringFormat = priority => {
  priority = priority.replace(/([a-z])([A-Z])/g, '$1 $2');
  return priority;
};

export const getFullName = (firstName, lastName) =>
  `${firstName && firstName !== null ? firstName : ''} ${lastName && lastName !== null ? lastName : ''}`.trim();

const jobTypes = {
  partTime: 'Freelance',
  fullTime: 'Full Time',
  contract: 'Contract',
};

export const getJobType = type => jobTypes[type];

