import React from 'react';
import { Link } from 'react-router';
import { Trans } from 'react-i18next';
import UserRole from './../../helpers/UserRole';

const styles = require('./Users.scss');

const providers = {
  userRole: new UserRole()
};

const UserMenu = () => {
  const { href } = window.location;
  return (
    <div className={`${styles.divide}`}>
      <div className="list-group">
        <span href="#" className={`list-group-item active ${styles.subHeading}`}>
          <Trans>MENU</Trans>
        </span>
        {providers.userRole.getIsAdmin() ?
          <Link
            to="/users"
            className={`list-group-item p-r-10 ${styles.lists} ${href.includes('/users') ? styles.activeMenu : ''}`}
          >
            <img
              className={styles.icons}
              src={`${href.includes('/users') ? '/icons/usersw.svg' : '/icons/users.svg'}`}
              alt="users"
            />
            <Trans>MANAGE_USERS</Trans>
            <img
              className={styles.arrow}
              src={`${href.includes('/users') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
              alt=""
            />
          </Link> : null
        }
        {providers.userRole.getPathPermission('JobCategory', 'VIEW_ALL_JOBCATEGORY') ?
          <Link
            to="/JobCategory"
            className={`list-group-item p-r-10 ${styles.lists} ${href.includes('/JobCategory') ?
              styles.activeMenu : ''}`}
          >
            <img
              className={styles.icons}
              src={`${href.includes('/JobCategory') ? '/icons/briefcasew.svg' : '/icons/briefcase.svg'}`}
              alt="category"
            /> <Trans>MANAGE_JOB_CATEGORY</Trans>
            <img
              className={styles.arrow}
              src={`${href.includes('/JobCategory') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
              alt=""
            />
          </Link> : null
        }
        {providers.userRole.getPathPermission(
          'manageCandidates',
          ['ARCHIVED_CANDIDATES', 'UNARCHIVE_PENDING_CANDIDATES', 'APPROVE_DELETE']
        ) ?
          <Link
            to="/ManageCandidates"
            className={`list-group-item p-r-10
            ${styles.lists}
            ${href.includes('/ManageCandidates') ? styles.activeMenu : ''}`}
          >
            <img
              className={styles.icons}
              src={`${href.includes('/ManageCandidates') ?
                '/icons/delete-light.svg' : '/icons/delete-dark.svg'}`}
              alt="sign"
            /> <Trans>MANAGE_CANDIDATES</Trans>
            <img
              className={styles.arrow}
              src={`${href.includes('/ManageCandidates') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
              alt=""
            />
          </Link> : null}
        {providers.userRole.getPathPermission(
          'manageCompanies',
          ['ARCHIVED_COMPANIES', 'UNARCHIVE_PENDING_COMPANIES']
        ) ?
          <Link
            to="/ManageCompanies"
            className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/ManageCompanies') ? styles.activeMenu : ''}`}
          >
            <img
              className={styles.icons}
              src={`${href.includes('/ManageCompanies') ?
                '/icons/delete-light.svg' : '/icons/delete-dark.svg'}`}
              alt="sign"
            /> <Trans>MANAGE_COMPANIES</Trans>
            <img
              className={styles.arrow}
              src={`${href.includes('/ManageCompanies') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
              alt=""
            />
          </Link> : null}
        {providers.userRole.getPathPermission('TemplateManager', 'VIEW_TEMPLATE') ?
          <Link
            to="/TemplateManager"
            className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/TemplateManager') || href.includes('/TemplateEditor') ? styles.activeMenu : ''}`}
          >
            <img
              className={styles.icons}
              src={`${href.includes('/TemplateManager') ||
                href.includes('/TemplateEditor') ? '/icons/mailw.svg' : '/icons/mail.svg'}`}
              alt="temp"
            /> <Trans>TEMPLATE_MANAGER</Trans>
            <img
              className={styles.arrow}
              src={`${href.includes('/TemplateManager') ||
                href.includes('/TemplateEditor') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
              alt=""
            />
          </Link> : null
        }
        {/* <Link to="/Emailer"
          className={`list-group-item ${styles.lists} ${href.includes('/Emailer') ? styles.activeMenu : ''}`}>
          <i className="fa fa-list-alt p-r-5" /> Emails
        </Link> */}
        {providers.userRole.getPathPermission('Signatures', 'VIEW_SIGNATURE') ?
          <Link
            to="/Signatures"
            className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/Signatures') || href.includes('/SignatureEditor') ? styles.activeMenu : ''}`}
          >
            <img
              className={styles.icons}
              src={`${href.includes('/Signatures') ||
                href.includes('/SignatureEditor') ? '/icons/editw.svg' : '/icons/edit.svg'}`}
              alt="sign"
            /> <Trans>SIGNATURES</Trans>
            <img
              className={styles.arrow}
              src={`${href.includes('/Signatures') ||
                href.includes('/SignatureEditor') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
              alt=""
            />
          </Link> : null
        }
        {/* {providers.userRole.getIsAdmin() ? */}
        <Link
          to="/localization"
          className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/localization') ? styles.activeMenu : ''}`}
        >
          <img
            className={styles.icons}
            src={`${href.includes('/localization') ? '/icons/globew.svg' : '/icons/globe.svg'}`}
            alt="loc"
          /> <Trans>LOCALIZATION</Trans>
          <img
            className={styles.arrow}
            src={`${href.includes('/localization') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
            alt=""
          />
        </Link>
        {providers.userRole.getIsAdmin() ?
          <Link
            to="/appSettings"
            className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/appSettings') ? styles.activeMenu : ''}`}
          >
            <img
              className={styles.icons}
              src={`${href.includes('/appSettings') ? '/icons/globew.svg' : '/icons/globe.svg'}`}
              alt="loc"
            /> <Trans>APP_SETTINGS</Trans>
            <img
              className={styles.arrow}
              src={`${href.includes('/appSettings') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
              alt=""
            />
          </Link>
          : null
        }
        {providers.userRole.getIsAdmin() ?
          <div>
            <span href="#" className={`list-group-item active ${styles.subHeading}`}>
              <Trans>MASTER_LISTS</Trans>
            </span>
            <Link
              to="/MasterLists/tags"
              className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/MasterLists/tags') ? styles.activeMenu : ''}`}
            >
              <img
                className={styles.icons}
                src={`${href.includes('/MasterLists/tags') ? '/icons/briefcasew.svg' : '/icons/briefcase.svg'}`}
                alt="loc"
              /> <Trans>TAGS</Trans>
              <img
                className={styles.arrow}
                src={`${href.includes('/MasterLists/tags') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
                alt=""
              />
            </Link>
            <Link
              to="/MasterLists/skills"
              className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/MasterLists/skills') ? styles.activeMenu : ''}`}
            >
              <img
                className={styles.icons}
                src={`${href.includes('/MasterLists/skills') ? '/icons/briefcasew.svg' : '/icons/briefcase.svg'}`}
                alt="loc"
              /> <Trans>SKILLS</Trans>
              <img
                className={styles.arrow}
                src={`${href.includes('/MasterLists/skills') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
                alt=""
              />
            </Link>

            <Link
              to="/MasterLists/positions"
              className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/MasterLists/positions') ? styles.activeMenu : ''}`}
            >
              <img
                className={styles.icons}
                src={`${href.includes('/MasterLists/positions') ? '/icons/briefcasew.svg' : '/icons/briefcase.svg'}`}
                alt="loc"
              /> <Trans>POSITIONS</Trans>
              <img
                className={styles.arrow}
                src={`${href.includes('/MasterLists/positions') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
                alt=""
              />
            </Link>

            <Link
              to="/MasterLists/reasons"
              className={`list-group-item p-r-10
              ${styles.lists}
              ${href.includes('/MasterLists/reasons') ? styles.activeMenu : ''}`}
            >
              <img
                className={styles.icons}
                src={`${href.includes('/MasterLists/reasons') ? '/icons/briefcasew.svg' : '/icons/briefcase.svg'}`}
                alt="loc"
              /> <Trans>REASONS</Trans>
              <img
                className={styles.arrow}
                src={`${href.includes('/MasterLists/reasons') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
                alt=""
              />
            </Link>
          </div>
          : null

        }
        {/* {providers.userRole.getPathPermission(
          'manageCandidates',
          ['ARCHIVED_CANDIDATES', 'UNARCHIVE_PENDING_CANDIDATES', 'APPROVE_DELETE']
        ) ?
          <Link
            to="/ManageCandidates"
            className={`list-group-item p-r-10
            ${styles.lists}
            ${href.includes('/ManageCandidates') ? styles.activeMenu : ''}`}
          >
            <img
              className={styles.icons}
              src={`${href.includes('/ManageCandidates') ?
                '/icons/delete-light.svg' : '/icons/delete-dark.svg'}`}
              alt="sign"
            /> <Trans>MANAGE_CANDIDATES</Trans>
            <img
              className={styles.arrow}
              src={`${href.includes('/ManageCandidates') ? '/icons/arrowRightw.svg' : '/icons/arrowRight.svg'}`}
              alt=""
            />
          </Link> : null} */}
        {/* {providers.userRole.getPathPermission('manageCompanies', 'MANAGE_COMPANIES') ? */}
        {/* : null } */}
      </div>
    </div>
  );
};

export default UserMenu;
