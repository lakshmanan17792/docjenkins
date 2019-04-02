import superagent from 'superagent';
import config from '../config';

const methods = ['get', 'post', 'put', 'patch', 'del'];

const unauthorizedURLs = ['/users/login', '/users/captchaVerification'];
function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? `/${path}` : path;
  if (__SERVER__) {
    // Prepend host and port of the API server to the path.
    return `http://${config.apiHost}:${config.apiPort}${config.apiBase}${adjustedPath}`;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  return `/api${config.apiBase}${adjustedPath}`;
}

export default class ApiClient {
  constructor(req) {
    methods.forEach(method => {
      this[method] = (path, { params, data, headers, files, fields, unsetContentType } = {}) =>
        new Promise((resolve, reject) => {
          const request = superagent[method](formatUrl(path));
          if (params) {
            request.query(params);
          }

          if (!unsetContentType) {
            request.set('Content-Type', 'application/json');
          }

          if (__SERVER__ && req.get('cookie')) {
            const cookie = req.get('cookie');
            if (cookie && cookie.indexOf('authorization=') > -1) {
              const cookies = cookie.split(';');
              cookies.forEach(datas => {
                if (datas.indexOf('authorization=') > -1) {
                  // console.log('auth token', data.split('authorization=')[1]);
                  this.token = datas.split('authorization=')[1];
                }
              });
            }
            request.set('cookie', req.get('cookie'));
          }

          if (headers) {
            request.set(headers);
          }

          if (unauthorizedURLs.indexOf(path) !== -1) {
            delete request.authorization;
          } else {
            request.set('authorization', this.token);
          }

          if (files) {
            files.forEach(file => request.attach(file.key, file.value));
          }

          if (fields) {
            fields.forEach(item => request.field(item.key, item.value));
          }

          if (data) {
            request.send(data);
          }

          request.end((err, { body } = {}) => (err ? reject(body || err) : resolve(body)));
        });
    });
  }

  setJwtToken(token) {
    this.token = token;
  }

  getJwtToken() {
    return this.token;
  }
}
