// import superagent from 'superagent';
// import Constants from '../../../helpers/Constants';
import UserRole from '../../../helpers/UserRole';

const providers = {
  userRole: new UserRole()
};

// const atsLoginURL = Constants.workboard.atsUrl + Constants.workboard.atsLoginApi;

function login(client, data) {
  return new Promise((resolve, reject) => {
    client.post('/users/login', {
      data
    }).then(
      result => resolve(result)
    ).catch(
      err => reject(err)
    );
  });
}

function getUser(client) {
  return new Promise((resolve, reject) => {
    client.get('/users/current').then(
      result => {
        providers.userRole.serUser(result);
        resolve(result);
      }
    ).catch(
      err => reject(err)
    );
  });
}

// function loginToWorkboard() {
//   return new Promise((resolve, reject) => {
//     superagent
//       .post(atsLoginURL)
//       .send({
//         email: 'demo-javaji-user',
//         password: 'test1234',
//         redirect: false
//       })
//       .set('Content-Type', 'application/json')
//       .set('Access-Control-Allow-Origin', '*')
//       .end((err, body) => (err ? reject(body || err) : resolve(body)));
//   });
// }

const authResolver = {
  loginAndGetUser: (client, data) => new Promise((resolve, reject) => {
    login(client, data).then(
      result => {
        document.cookie = `authorization=${result.id};path=/;`;
        client.setJwtToken(result.id);
        getUser(client).then(
          user => {
            localStorage.setItem('authToken', result.id);
            localStorage.setItem('currentUserId', user.id);
            resolve(user);
          }, err => {
            reject(err);
          }
        );
      }
    ).catch(
      err => reject(err)
    );
  }),
  getCurrentUser: client => new Promise((resolve, reject) => {
    getUser(client).then(
      user => {
        resolve(user);
      }
    ).catch(
      err => {
        reject(err);
      }
    );
  }),
  userLogout: client => new Promise((resolve, reject) => {
    client.post('/users/logout').then(result => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUserId');
      // when logout triggered in one tab,then logout-event triggered in all tabs to logout.
      localStorage.setItem('logout-event', Date.now());
      client.setJwtToken('');
      resolve(result);
    }).catch(
      err => reject(err)
    );
  }),
};

export default authResolver;
