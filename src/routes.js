import React from 'react';
import { IndexRoute, Route } from 'react-router';
import { routerActions } from 'react-router-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper';
import { App, NotFound } from 'containers';
import getRoutesUtils from 'utils/routes';
import UserRole from './helpers/UserRole';
import Dashboard from './containers/DashboardNew/Dashboard';

const providers = {
  userRole: new UserRole()
};

// eslint-disable-next-line import/no-dynamic-require
if (typeof System.import === 'undefined') System.import = module => Promise.resolve(require(module));

export default store => {
  const { permissionsComponent } = getRoutesUtils(store);
  providers.userRole.setState(store.getState());
  // injectReducerAndRender
  /* Permissions */

  const isAuthenticated = UserAuthWrapper({
    authSelector: state => state.auth.user,
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'UserIsAuthenticated'
  });

  const isNotAuthenticated = UserAuthWrapper({
    authSelector: state => state.auth.user,
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'UserIsNotAuthenticated',
    predicate: user => !user,
    failureRedirectPath: '/loginSuccess',
  });

  function requireAuth(nextState, replace, cb, operation, model) {
    const path = nextState.location.pathname.replace('/', '');
    const searchPath = path.split('/')[0];
    if (!providers.userRole.getPathPermission(searchPath, operation, model)) {
      replace({
        pathname: '/NotFound',
        state: { nextPathname: nextState.location.pathname }
      });
    }
    cb();
  }
  /**
   * Please keep routes in alphabetical order
   */
  return (
    <Route path="/" component={App}>
      {/* Home (main) route */}
      <IndexRoute component={Dashboard} />
      {/* Routes requiring login */}
      <Route {...permissionsComponent(isAuthenticated)()}>
        <Route path="loginSuccess" getComponent={() => System.import('./containers/LoginSuccess/LoginSuccess')} />
      </Route>

      {/* Routes disallow login */}
      <Route {...permissionsComponent(isNotAuthenticated)()}>
        <Route path="register" getComponent={() => System.import('./containers/Register/AppRegister')} />
        <Route path="forgotPassword" getComponent={() => System.import('./containers/Register/AppForgotPassword')} />
        <Route path="resetPassword" getComponent={() => System.import('./containers/Register/AppResetPassword')} />
      </Route>

      {/* Routes */}
      <Route path="login" getComponent={() => System.import('./containers/Login/AppLogin')} />
      <Route path="NotFound" component={NotFound} status={404} />
      <Route {...permissionsComponent(isAuthenticated)()}>
        <Route
          path="dashboardNew"
          getComponent={() => System.import('./containers/DashboardNew/Dashboard')}
          onEnter={requireAuth}
        />
        <Route
          path="AnalysisMetrics"
          getComponent={() => System.import('./containers/AnalysisMetrics/AnalysisMetrics')}
          onEnter={requireAuth}
        />
        <Route
          path="users"
          getComponent={() => System.import('./containers/Users/Users')}
          onEnter={requireAuth}
        />
        <Route
          path="JobCategory"
          getComponent={() => System.import('./containers/Openings/JobCategory')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_ALL_JOBCATEGORY')}
        />

        <Route
          path="ProfileSearch"
          getComponent={() => System.import('./containers/ProfileSearch/ProfileSearch')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_PROFILE')}
        />

        <Route
          path="Tasks"
          getComponent={() => System.import('./containers/Tasks/Tasks')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_TASK')}
        />

        <Route
          path="Tasks/View"
          getComponent={() => System.import('./containers/Tasks/ViewTask')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_TASK')}
        />

        <Route
          path="ProfileSearch/:id"
          getComponent={() => System.import('./containers/ProfileSearch/ViewProfile')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_PROFILE')}
        />
        <Route
          path="SuperProfileSearch/:id"
          getComponent={() => System.import('./containers/ProfileSearch/Profile')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_PROFILE')}
        />

        <Route
          path="Openings"
          getComponent={() => System.import('./containers/Openings/Openings')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_JOBOPENING')}
        />

        <Route
          path="JobOpenings"
          getComponent={() => System.import('./containers/JobOpenings')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_JOBOPENING')}
        />

        <Route
          path="Openings/:id"
          getComponent={() => System.import('./containers/Openings/ViewOpening')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_JOBOPENING')}
        />

        <Route
          path="Companies/:id"
          getComponent={() => System.import('./containers/Customers/ViewCustomer')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_COMPANY')}
        />

        <Route
          path="Dashboard"
          getComponent={() => System.import('./containers/DashboardNew/Dashboard')}
          onEnter={requireAuth}
        />

        <Route
          path="Companies"
          getComponent={() => System.import('./containers/Customers/Customers')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_COMPANY')}
        />

        <Route
          path="CreateCompany"
          getComponent={() => System.import('./containers/Customers/Customers')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'CREATE_COMPANY')}
        />

        {/* <Route
          path="Companiess"
          getComponent={() => System.import('./containers/Customers/Customerss')}
          onEnter={requireAuth}
        /> */}

        <Route
          path="CompaniesView"
          getComponent={() => System.import('./containers/Customers/CompanyOverview')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_COMPANY')}
        />

        {/* <Route
          path="ATSBoard"
          getComponent={() => System.import('./containers/ATSBoard/ATSBoard')}
          onEnter={requireAuth}
        /> */}

        <Route
          path="UserProfile"
          getComponent={() => System.import('./containers/UserProfile/UserProfile')}
          onEnter={requireAuth}
        />

        <Route
          path="Parser"
          getComponent={() => System.import('./containers/Parser/Parser')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'PARSE_RESUME')
          }
        />

        <Route
          path="Resume"
          getComponent={() => System.import('./containers/Resume/Resume')}
          onEnter={requireAuth}
        />

        <Route
          path="Notifications"
          getComponent={() => System.import('./containers/Notifications/NotificationsList')}
          onEnter={requireAuth}
        />
        <Route
          path="TemplateManager"
          getComponent={() => System.import('./containers/TemplateManager/TemplateManager')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_TEMPLATE')}
        />

        <Route
          path="TemplateEditor/:id"
          getComponent={() => System.import('./containers/TemplateEditor/TemplateEditor')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'EDIT_ME', 'Template')}
        />

        <Route
          path="TemplateEditor"
          getComponent={() => System.import('./containers/TemplateEditor/TemplateEditor')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'CREATE_TEMPLATE', 'Template')}
        />

        <Route
          path="Emailer"
          getComponent={() => System.import('./containers/Emailer/Emailer')}
          onEnter={requireAuth}
        />

        <Route
          path="Signatures"
          getComponent={() => System.import('./containers/SignatureManager/SignatureManager')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_SIGNATURE')}
        />

        <Route
          path="Localization"
          getComponent={() => System.import('./containers/Localization/Localization')}
          onEnter={requireAuth}
        />

        <Route
          path="AppSettings"
          getComponent={() => System.import('./containers/AppSettings/AppSettingsContainer')}
          onEnter={requireAuth}
        />

        <Route
          path="MasterLists/:source"
          getComponent={() => System.import('./containers/MasterLists/MasterLists')}
          onEnter={requireAuth}
        />

        <Route
          path="SignatureEditor/:id"
          getComponent={() => System.import('./containers/SignatureManager/SignatureEditor')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'EDIT_ME', 'Signature')}
        />

        <Route
          path="SignatureEditor"
          getComponent={() => System.import('./containers/SignatureManager/SignatureEditor')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'CREATE_SIGNATURE', 'Signature')}
        />

        <Route
          path="SmtpConfig"
          getComponent={() => System.import('./containers/Smtp/Smtp')}
          onEnter={requireAuth}
        />

        <Route
          path="Company/:id"
          getComponent={() => System.import('./containers/Customers/CompanyContainer')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_COMPANY')}
        />

        <Route
          path="EditCandidate/:id"
          getComponent={() => System.import('./containers/Resume/EditResumeData')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'UPDATE_CANDIDATE')}
        />

        <Route
          path="SourcedProfiles"
          getComponent={() => System.import('./containers/LinkedinProfiles/LinkedinProfiles')}
          onEnter={requireAuth}
        />
        <Route
          path="ATSBoard"
          getComponent={() => System.import('./containers/ApplicationTracking/ApplicationTracking')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'VIEW_ATS_BOARD')}
        />

        <Route
          path="ManageCandidates"
          getComponent={() => System.import('./containers/ManageCandidates/ManageCandidates')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, ['ARCHIVED_CANDIDATES', 'UNARCHIVE_PENDING_CANDIDATES',
              'APPROVE_DELETE'
            ], 'resume')}
        />

        <Route
          path="ManageCompanies"
          getComponent={() => System.import('./containers/ManageCompanies/ManageCompanies')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback,
              [
                'UNARCHIVE_PENDING_COMPANIES',
                'ARCHIVED_COMPANIES'
              ], 'customer')}
        />

        <Route
          path="EmailConfig"
          getComponent={() => System.import('./containers/EmailConfig/EmailConfig')}
          onEnter={(nextState, replace, callback) =>
            requireAuth(nextState, replace, callback, 'SAVE_EMAIL_CONFIG')}
        />

        <Route
          path="authorize"
          getComponent={() => System.import('./containers/EmailConfig/EmailAuthorization')}
          onEnter={requireAuth}
        />

        <Route
          path="logout"
          getComponent={() => System.import('./containers/Logout/Logout')}
          onEnter={requireAuth}
        />

        <Route
          path="accessControl"
          getComponent={() => System.import('./containers/Acl/Acl')}
          onEnter={requireAuth}
        />

      </Route>
      {/* Catch all route */}
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
