import lodash from 'lodash';

const getFilterConfig = self => {
  const config = {
    title: 'Edit Tags',
    candidateTags: {
      name: 'tags',
      valueField: 'id',
      textField: 'name',
      data: self.props.candidateTags,
      isFilter: false,
      placeholder: 'SELECT_TAGS_TO_FILTER',
      ignoreFilter: true,
      handleOnChange: lodash.debounce(self.onTagSearch, 1000),
      handleOnSelect: self.handleOnTagSelect,
      id: 'candidateTags'
    }
  };
  return config;
};

export default { getFilterConfig };
