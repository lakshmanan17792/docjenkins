const getSearchJobOpenings = () => {
  const config = {
    title: 'Search Job Opening',
    fields: [
      {
        name: 'searchOpening',
        component: 'input',
        type: 'text',
        placeholder: 'SEARCH_BY_NAME',
        isProfileSearch: 1
      }
    ]
  };
  return config;
};

export default { getSearchJobOpenings };
