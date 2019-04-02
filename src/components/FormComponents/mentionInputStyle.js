export default {
  control: {
    backgroundColor: '#fff',
    fontWeight: 'normal',
  },

  highlighter: {
    overflow: 'hidden',
  },

  input: {
    margin: 0,
  },

  '&singleLine': {
    control: {
      display: 'inline-block',
    },

    highlighter: {
      padding: 1,
    },
  },

  '&multiLine': {
    highlighter: {
      padding: 9,
    },

  },

  suggestions: {
    list: {
      backgroundColor: 'white',
    },

    item: {
      '&focused': {
        backgroundColor: '#EAECF0',
        color: '#172B4D',
      },
    },
  }
};
