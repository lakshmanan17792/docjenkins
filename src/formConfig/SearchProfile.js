const getSearchProfileConfig = () => {
  const config = {
    title: 'Search Profile',
    fields: [
      {
        name: 'searchProfile',
        component: 'input',
        type: 'number',
        maxLength: '10',
        placeholder: 'SEARCH_BY_ID',
        isProfileSearch: 1
      }
    ]
  };
  return config;
};

export default { getSearchProfileConfig };
