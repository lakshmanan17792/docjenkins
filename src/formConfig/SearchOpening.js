const getSearchOpeningConfig = self => {
  const config = {
    title: 'Search Job Opening',
    fields: [
      {
        name: 'searchProfile',
        type: 'text',
        maxLength: '10',
        placeholder: 'SEARCH',
        reset: event => self.resetSearch(event),
        handleOnChange: event => self.changeSearchValue(event),
        handleOnKeyUp: event => self.getOpeningById(event),
        inpValue: self.state.searchStrVal,
      }
    ]
  };
  return config;
};

export default { getSearchOpeningConfig };
