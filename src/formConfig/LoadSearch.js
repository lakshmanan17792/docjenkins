const getOpeningFormConfig = () => {
  const config = {
    title: 'Load Search',
    searchInput: {
      name: 'searchInput',
      component: 'input',
      type: 'text',
      placeholder: 'SEARCH'
    }
  };
  return config;
};

export default { getOpeningFormConfig };
