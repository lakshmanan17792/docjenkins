// import superagent from 'superagent';
// import Constants from '../../../helpers/Constants';
import { toastr } from 'react-redux-toastr';
import { browserHistory } from 'react-router';
import UserRole from '../../../helpers/UserRole';
import i18n from '../../../i18n';


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

function removeSession(client, data) {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUserId');
  document.cookie = 'authorization=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
  client.setJwtToken('');
  return new Promise((resolve, reject) => {
    client.post('/users/sessiondelete', {
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

function passwordChange() {
  localStorage.setItem('passwordCheck',
    JSON.stringify({ isChange: true }));
  browserHistory.push('/UserProfile');
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
        if (result.expiryDate) {
          if (result.expiryDays <= 0) {
            // setTimeout(() => passwordChange(), 100);
            const toastrConfirmOptions = {
              onOk: () => passwordChange(),
              okText: i18n.t('OK'),
              disableCancel: true
            };
            toastr.confirm(i18n.t('confirmMessage.YOUR_PASSWORD_IS_ALREADY_EXPIRED'), toastrConfirmOptions);
          } else if (result.expiryDays <= result.alertDays) {
            console.log(result.alertDays);
            const toastrConfirmOptions = {
              onOk: () => passwordChange(),
              okText: i18n.t('YES'),
              cancelText: i18n.t('NO')
            };
            toastr.confirm(`${i18n.t('confirmMessage.YOUR_PASSWORD_WILL_EXPIRY')} ${result.expiryDays} ${i18n.t('confirmMessage.DO_YOU_WANT_CHANGE_PASSWORD')}`, toastrConfirmOptions);
          }
        } else {
          const toastrConfirmOptions = {
            onOk: () => passwordChange(),
            okText: i18n.t('OK'),
            disableCancel: true
          };
          toastr.confirm(i18n.t('confirmMessage.PASSWORD_POLICY_IS_CHANGED'), toastrConfirmOptions);
        }
        getUser(client).then(
          user => {
            localStorage.setItem('username', user.username);
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
  sessionRemove: (client, data) => new Promise((resolve, reject) => {
    removeSession(client, data).then(
      result => {
        resolve(result);
      }
    ).catch(
      err => reject(err)
    );
  }),
};

export default authResolver;
