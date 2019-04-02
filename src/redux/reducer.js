import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';
import { reducer as form } from 'redux-form';
import { reducer as toastrReducer } from 'react-redux-toastr';
import auth from './modules/auth/auth';
import users from './modules/users/users';
import user from './modules/users/user';
import profileSearch from './modules/profile-search';
import profileActivity from './modules/profile-activity';
import resumeParser from './modules/resume-parser';
import ats from './modules/ATS';
import openings from './modules/openings';
import jobCategory from './modules/job-category';
import tasks from './modules/tasks';
import customers from './modules/customers';
import dashboard from './modules/dashboard';
import notifications from './modules/notifications';
import templates from './modules/templates';
import emails from './modules/emails';
import signature from './modules/signature';
import files from './modules/files';
import smtp from './modules/smtp';
import linkedinProfiles from './modules/linkedinProfiles/linkedinProfiles';
import emailConfig from './modules/emailConfig';
import jobOpenings from './modules/job-openings';
import masterLists from './modules/MasterLists';
import acl from './modules/Acl/Acl';
import managecandidates from './modules/profile-search/managecandidates';
import manageCustomers from './modules/customers/manageCustomers';
import appSettings from './modules/AppSettings/AppSettings';

export default function createReducers(asyncReducers) {
  return {
    routing: routerReducer,
    toastr: toastrReducer,
    reduxAsyncConnect,
    online: (v = true) => v,
    form,
    auth,
    profileSearch,
    profileActivity,
    resumeParser,
    users,
    ats,
    user,
    openings,
    jobCategory,
    tasks,
    customers,
    dashboard,
    files,
    notifications,
    templates,
    signature,
    emails,
    smtp,
    linkedinProfiles,
    emailConfig,
    jobOpenings,
    acl,
    managecandidates,
    masterLists,
    manageCustomers,
    appSettings,
    ...asyncReducers
  };
}
