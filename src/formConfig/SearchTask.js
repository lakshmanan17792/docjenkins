const getSearchTaskConfig = () => {
  const config = {
    title: 'Search Task',
    fields: [
      {
        name: 'searchTask',
        component: 'input',
        type: 'text',
        placeholder: 'SEARCH_BY_NAME',
        isCustomerSearch: 1,
        searchClassName: 'customerSearchBox'
      }
    ]
  };
  return config;
};

export default { getSearchTaskConfig };

