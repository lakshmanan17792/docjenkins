import { toastr } from 'react-redux-toastr';

const toastrErrorHandling = (errorObject, title, message, optional) => {
  if (errorObject && errorObject.statusCode !== 401 && errorObject.statusCode !== 403) {
    toastr.clean();
    toastr.error(title, message, optional);
  }
};

export default toastrErrorHandling;
