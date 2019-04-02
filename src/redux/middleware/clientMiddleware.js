import { toastr } from 'react-redux-toastr';
import i18n from '../../i18n';
import { getExpiryTime } from '../../redux/modules/auth/auth';

const LOGOUT_SUCCESS = 'auth/LOGOUT_SUCCESS';

export default function clientMiddleware({ client }) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
    if (!promise) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({ ...rest, type: REQUEST });

    const actionPromise = promise({ client }, dispatch);
    actionPromise
      .then(result => {
        next({ ...rest, result, type: SUCCESS });
        if (typeof localStorage !== 'undefined' && SUCCESS !== 'auth/FETCH_LANGUAGE_SUCCESS'
          && SUCCESS !== LOGOUT_SUCCESS) {
          const token = client.getJwtToken();
          const maxAge = (getExpiryTime() - new Date().getTime()) / 1000;
          document.cookie =
          `authorization=${token};path=/;max-age=${maxAge}`;
          next({ ...rest, type: 'auth/SET_SESSION_TIMEOUT' });
        }
        if (typeof localStorage !== 'undefined' && SUCCESS === 'auth/LOGIN_SUCCESS') {
          localStorage.setItem('login-event', Date.now());
        }
      }, error => {
        if (error.error && error.error.statusCode === 403) {
          if (typeof localStorage !== 'undefined') {
            toastr.clean();
            if (error.error.message !== 'You have logged in somewhere else, Kindly logout that session') {
              toastr.error('Error', error.error.message);
            }
            if (localStorage.getItem('authToken') !== null) {
              localStorage.removeItem('authToken');
              localStorage.removeItem('deviceDetails');
              localStorage.removeItem('currentUserId');
              sessionStorage.removeItem('companyId');
              sessionStorage.removeItem('companyName');              
              // when error 403 occurs logout-event triggered to logout all tabs in window
              localStorage.setItem('logout-event', Date.now());
            }
            // when error 403 occurs during deactivate / session expired
            // then those times redirect to logout page
            next({ ...rest, error, type: LOGOUT_SUCCESS });
          }
        } else if (error.error && error.error.statusCode === 401) {
          // Invalid Login credentials / Role error Message
          if (error.error.code === 'LOGIN_FAILED') {
            toastr.error('Error', error.error.message);
          } else {
            toastr.error(i18n.t('ERROR'), i18n.t('errorMessage.ROLE_ERROR_MESSAGE'));
          }
        }

        next({ ...rest, error, type: FAILURE });
      })
      .catch(error => {
        console.error('MIDDLEWARE ERROR:', error);
        next({ ...rest, error, type: FAILURE });
      });

    return actionPromise;
  };
}
