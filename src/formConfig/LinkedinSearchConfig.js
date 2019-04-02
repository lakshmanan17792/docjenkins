const getSearchProfileConfig = self => {
  const config = {
    title: 'Search Profile',
    fields: [
      {
        name: 'searchProfile',
        type: 'text',
        maxLength: '10',
        placeholder: 'SEARCH_CANDIDATE',
        reset: event => self.resetSearch(event),
        handleOnChange: event => self.changeSearchValue(event),
        handleOnKeyUp: event => self.getProfileById(event),
        inpValue: self.state.searchStrVal,
      }
    ]
  };
  return config;
};

export default { getSearchProfileConfig };
