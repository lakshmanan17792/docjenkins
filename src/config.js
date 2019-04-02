require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign(
  {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 4004,
    apiHost: process.env.APIHOST || 'localhost',
    apiPort: process.env.APIPORT || 3000,
    apiBase: '/api/v1',
    app: {
      title: 'Intelligent Talent Acquitition',
      description: 'An Intelligent Talent Acquitition tool',
      head: {
        titleTemplate: 'ITA: %s',
        meta: [
          { name: 'description', content: 'An Intelligent Talent Acquitition tool' },
          { charset: 'utf-8' },
          { property: 'og:site_name', content: 'Intelligent Talent Acquitition' },
          { property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.jpg' },
          { property: 'og:locale', content: 'en_US' },
          { property: 'og:title', content: 'Intelligent Talent Acquitition' },
          { property: 'og:description', content: 'An Intelligent Talent Acquitition tool' },
          { property: 'og:card', content: 'summary' },
          { property: 'og:site', content: '@erikras' },
          { property: 'og:creator', content: '@erikras' },
          { property: 'og:image:width', content: '200' },
          { property: 'og:image:height', content: '200' }
        ]
      }
    }
  },
  environment
);
