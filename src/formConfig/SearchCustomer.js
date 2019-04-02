const getSearchCustomerConfig = () => {
  const config = {
    title: 'Search Customer',
    fields: [
      {
        name: 'searchCustomer',
        component: 'input',
        type: 'text',
        searchClassName: 'customerSearchBox',
        placeholder: 'SEARCH_COMPANY_NAME',
        isCustomerSearch: 1
      },
      {
        name: 'searchCompany',
        component: 'input',
        type: 'text',
        searchClassName: 'companySearchBox',
        // placeholder: 'Search Company Name',
        isCustomerSearch: 1
      }
    ]
  };
  return config;
};

export default { getSearchCustomerConfig };

