const Constants = {
  workboard: {
    atsUrl: 'http://103.249.82.125:8888',
    atsBoardPath: '/viewBoard/59f32c4b925de5427d38e3a7',
    atsLoginApi: '/api/login'
  },

  location: {
    apiUrl: 'https://maps.googleapis.com/maps/api/js?libraries=places&key=',
    apiKey: 'AIzaSyAsVc7fnluyhK3PfetkvG3tqt_mcz9kFV4'
  },

  profileDownLoad: {
    url: 'https://source-exact.talentsteps.com/api/v1/documents/profile'
  },

  // URL to download candidate super profile
  superProfileDownLoad: {
    url: 'https://source-exact.talentsteps.com/api/v1/documents/superProfile'
  },

  // To download/view file attachments
  fileDownLoad: {
    host: 'localhost',
    port: '3000',
    url: 'https://source-exact.talentsteps.com/api/v1/documents/view/',
    downloadURL: 'https://source-exact.talentsteps.com/api/v1/documents/download/',
    viewURL: 'https://docs.google.com/viewer?url=https://source-exact.talentsteps.com/api/v1/documents/download/'
  },

  // To view logo image file
  logoURL: {
    url: 'https://source-exact.talentsteps.com/api/v1/Settings/viewLogo',
  },

  // To view signature image
  signatureImage: {
    viewURL: 'https://source-exact.talentsteps.com/api/api/v1/documents/viewImage/'
  },

  // File upload constraints
  FILE_UPLOAD_ZERO_SIZE: 'File size should be more than 0KB',
  FILE_UPLOAD_SIZE_ERROR: 'Attachment size exceeds the allowable limit. Maximum file size can be up to 25MB.',
  FILE_UPLOAD_TYPE_ERROR: 'The attachment type is invalid. Attachments are limited to the following file types: ',
  FILE_TYPES: '.pdf, .doc, .docx, .jpg, .jpeg, .png',
  LOGO_FILE_TYPES: '.png, .jpeg, .jpg, .svg',
  RECORDS_PER_PAGE: 15,
  RECORDS_PER_PAGE_SETTING: 16,
  NEW_NOTIFICATION: 'NEW_NOTIFICATION',
  CUSTOMER_CONTACT: 'CUSTOMER_CONTACT',
  CUSTOMER_CONTACT_TASKS: 'CUSTOMER_CONTACT_TASKS',
  MAXIMUM_INVALID_LOGIN_COUNT: 3,
  GOOGLE_SITE_KEY: '6LeJP24UAAAAAEudj0-I-KHf3_escdVAXd6WP-aO',
  PORT: '',
  RESUME_URL: 'www.textkernel.com',
  RESUME_SOURCE: 'parsed',
  // Email smart tags
  personalizations: [
    {
      text: 'Full Name',
      value: 'fullname',
      tagValue: '#fullname#',
      url: 'full_name'
    },
    {
      text: 'First Name',
      value: 'firstname',
      tagValue: '#firstname#',
      url: 'firstname'
    },
    {
      text: 'Last Name',
      value: 'lastname',
      tagValue: '#lastname#',
      url: 'lastname'
    },
    {
      text: 'Salutation',
      value: 'salutation',
      tagValue: '#salutation#',
      url: 'salutation'
    },
    {
      text: 'Middle Name',
      value: 'middlename',
      tagValue: '#middlename#',
      url: 'middlename'
    }
  ],
  sourceList: [
    { id: 'BH', value: 'bh' },
    { id: 'TK', value: 'tk' },
    { id: 'XX', value: 'xx' },
    { id: 'LK', value: 'lk' },
    { id: 'XX-PARSED', value: 'xx-parsed' }
  ],
  emailPriorities: [
    { name: 'High', id: 'high' },
    { name: 'Medium', id: 'medium' },
    { name: 'Low', id: 'low' }
  ],
  resumeDuplciateErrors: {
    emails: 'Email is already present.',
    mobileNumber: 'Mobile Number is already present.'
  },
  logo: {
    path: '/logo.svg',
    loginImage: '/login-img.svg'
  },
  headerLogo: {
    path: '/logo2.svg'
  },
  upcomingInterview: {
    clock: '/clock.svg',
    interviewer: '/user.svg',
    refresh: '/refresh-icon.svg'
  },
  additionalAclOptions: [
    {
      title: 'Job Opening',
      options: [
        {
          name: 'View job opening history',
          key: 'VIEW_JOBOPENING_HISTORY',
          entity: 'jobOpening'
        },
        {
          name: 'View job opening activity',
          key: 'VIEW_JOBOPENING_ACTIVITY',
          entity: 'jobOpening'
        },
        {
          name: 'View job opening email',
          key: 'VIEW_JOBOPENING_EMAIL',
          entity: 'ProspectMails'
        },
        {
          name: 'Search Openings',
          key: 'JOB_OPENING_SEARCH',
          entity: 'jobOpening'
        },
        {
          name: 'View all job openings',
          key: 'ALL_OPENINGS',
          entity: 'jobOpening'
        },
        {
          name: 'View my openings',
          key: 'MY_OPENINGS',
          entity: 'jobOpening'
        },
        {
          name: 'Log an Activity & Edit',
          key: 'JOB_OPENING_LOG_ACTIVITY',
          entity: 'jobOpening'
        },
        {
          name: 'Job opening send email',
          key: 'JOB_OPENING_SEND_EMAIL',
          entity: 'jobOpening'
        },
        {
          name: 'Add candidates (select candidates for ats board)',
          key: 'SELECT_CANDIDATE',
          entity: 'jobProfile'
        },
      ]
    },
    {
      title: 'Company',
      options: [
        {
          name: 'Search Companies',
          key: 'COMPANY_SEARCH',
          entity: 'customer'
        },
        {
          name: 'View company job opening',
          key: 'VIEW_COMPANY_JOBOPENING',
          entity: 'customer'
        },
        {
          name: 'View company email',
          key: 'VIEW_COMPANY_EMAIL',
          entity: 'ProspectMails'
        },
        {
          name: 'View company History',
          key: 'VIEW_COMPANY_HISTORY',
          entity: 'customer'
        },
        {
          name: 'Log/Edit activity',
          key: 'COMPANY_LOG_ACTIVITY',
          entity: 'customer'
        },
        {
          name: 'View company activity',
          key: 'VIEW_COMPANY_ACTIVITY',
          entity: 'customer'
        },
        {
          name: 'Company send email',
          key: 'COMPANY_SEND_EMAIL',
          entity: 'customer'
        },
        {
          name: 'Archive company',
          key: 'COMPANY_ARCHIVE',
          entity: 'customer'
        },
        {
          name: 'View archived companies',
          key: 'ARCHIVED_COMPANIES',
          entity: 'customer'
        },
        {
          name: 'View unarchived companies',
          key: 'UNARCHIVE_PENDING_COMPANIES',
          entity: 'customer'
        },
        {
          name: 'Unarchive company',
          key: 'COMPANY_UNARCHIVE',
          entity: 'customer'
        },
        {
          name: 'Extend company archival',
          key: 'COMPANY_ARCHIVE_EXTEND',
          entity: 'customer'
        },
        {
          name: 'Delete company contact',
          key: 'DELETE_COMPANY_CONTACT',
          entity: 'customer'
        },
      ]
    },
    {
      title: 'Resume',
      options: [
        {
          name: 'Parse a resume',
          key: 'PARSE_RESUME',
          entity: 'resume'
        },
        {
          name: 'Send email to candidate',
          key: 'SEND_CANDIDATE_EMAIL',
          entity: 'resume'
        },
        {
          name: 'Update Candidate details',
          key: 'UPDATE_CANDIDATE',
          entity: 'resume'
        },
        {
          name: 'View candidate emails',
          key: 'CANDIDATE_EMAIL',
          entity: 'ProspectMails'
        },
        {
          name: 'Recent activity view',
          key: 'VIEW_CANDIDATE_ACTIVITIES',
          entity: 'activity'
        },
        {
          name: 'View candidate',
          key: 'VIEW_PROFILE',
          entity: 'resume'
        },
        {
          name: 'Add candidate from linkedin',
          key: 'LINKEDIN_ADD_PROFILE',
          entity: 'SourcedProfile'
        },
        {
          name: 'View candidate job openings',
          key: 'VIEW_CANDIDATE_JOB_OPENINGS',
          entity: 'jobProfile'
        },
        {
          name: 'Archive candidate',
          key: 'ARCHIVE_CANDIDATE',
          entity: 'resume'
        },
        {
          name: 'Un archive candidate',
          key: 'UNARCHIVE_CANDIDATE',
          entity: 'resume'
        },
        {
          name: 'View archived candidates',
          key: 'ARCHIVED_CANDIDATES',
          entity: 'resume'
        },
        {
          name: 'View unarchived pending candidates',
          key: 'UNARCHIVE_PENDING_CANDIDATES',
          entity: 'resume'
        },
        {
          name: 'Approve delete / reject delete',
          key: 'APPROVE_DELETE',
          entity: 'resume'
        },
        {
          name: 'Delete',
          key: 'DELETE',
          entity: 'resume'
        }
      ]
    },
    {
      title: 'User',
      options: [
        {
          name: 'Update User Info',
          key: 'UPDATE_USER_DETAILS',
          entity: 'user'
        },
        {
          name: 'Deactivate User',
          key: 'DEACTIVATE_USER',
          entity: 'user'
        },
        {
          name: 'Activate User',
          key: 'ACTIVATE_USER',
          entity: 'user'
        },
        {
          name: 'Invite User',
          key: 'INVITE_USER',
          entity: 'user'
        },
        {
          name: 'Re-Invite User',
          key: 'REINVITE_USER',
          entity: 'user'
        }
      ]
    },
    {
      title: 'Files',
      options: [
        {
          name: 'Upload File',
          key: 'UPLOAD_FILE',
          entity: 'document'
        },
        {
          name: 'Download Files',
          key: 'DOWNLOAD_DOCUMENT',
          entity: 'document'
        },
        {
          name: 'Download candidate Super Profile',
          key: 'DOWNLOAD_SUPER_PROFILE',
          entity: 'document'
        },
        {
          name: 'Download a  candidate profile',
          key: 'DOWNLOAD_CANDIDATE_PROFILE',
          entity: 'document'
        },
      ]
    },
    {
      title: 'Tasks',
      options: [
        {
          name: 'View task activity',
          key: 'TASK_ACTIVITIES',
          entity: 'task'
        },
        {
          name: 'Search Task',
          key: 'TASK_SEARCH',
          entity: 'task'
        },
        // {
        //   name: 'Update task status',
        //   key: 'UPDATE_TASK_STATUS',
        //   entity: 'task'
        // },
        {
          name: 'Assignee can edit',
          key: 'ASSIGNEER_CAN_EDIT',
          entity: 'task'
        },
      ]
    },
    {
      title: 'AnalysisMetrics',
      options: [
        {
          name: 'View analysis metrics',
          key: 'ANALYSIS_METRICS',
          entity: 'analysisMetrics'
        }
      ]
    },
    {
      title: 'Saved/Load Profile Search',
      options: [
        {
          name: 'Filters',
          key: 'PROFILE_SEARCH_FILTER',
          entity: 'profileSearch'
        },
        {
          name: 'All matches',
          key: 'PROFILE_SEARCH_ALL_MATCHES',
          entity: 'profileSearch'
        },
        {
          name: 'Best Matches',
          key: 'PROFILE_SEARCH_BEST_MATCHES',
          entity: 'profileSearch'
        },
      ]
    },
    {
      title: 'Application Tracking System',
      options: [
        {
          name: 'Update candiate status',
          key: 'UPDATE_CANDIDATE_STATUS',
          entity: 'jobProfile'
        },
        {
          name: 'View ATS board',
          key: 'VIEW_ATS_BOARD',
          entity: 'jobProfile'
        }
      ]
    },
    // {
    //   title: 'Candidate',
    //   options: [
    //     {
    //       name: 'View archived candidates',
    //       key: 'ARCHIVED_CANDIDATES',
    //       entity: 'resume'
    //     },
    //     {
    //       name: 'View candidates to be unarvchived',
    //       key: 'UNARCHIVE_PENDING_CANDIDATES',
    //       entity: 'resume'
    //     },
    //     {
    //       name: 'View candidates to be deleted',
    //       key: 'DELETION_PENDING_CANDIDATES',
    //       entity: 'resume'
    //     },
    //     {
    //       name: 'Manage candidates',
    //       key: 'MANAGE_CANDIDATES',
    //       entity: 'resume'
    //     }
    //   ]
    // }
  ],
  aclOptions: [
    {
      id: '1',
      entity: 'Template',
      name: 'Email Template',
      view: {
        editable: true,
        key: 'VIEW_TEMPLATE'
      },
      create: {
        editable: true,
        key: 'CREATE_TEMPLATE'
      },
      edit: {
        editable: true,
        key: 'EDIT'
      },
      editByMe: {
        editable: true,
        key: 'EDIT_ME'
      },
      delete: {
        editable: true,
        key: 'DELETE'
      },
      deleteByMe: {
        editable: true,
        key: 'DELETE_ME'
      }
    },
    {
      id: '2',
      entity: 'Signature',
      name: 'Email Signature',
      view: {
        editable: true,
        key: 'VIEW_SIGNATURE'
      },
      create: {
        editable: true,
        key: 'CREATE_SIGNATURE'
      },
      editByMe: {
        editable: true,
        key: 'EDIT_ME'
      },
      deleteByMe: {
        editable: true,
        key: 'DELETE_ME'
      }
    },
    {
      id: '3',
      entity: 'jobOpening',
      name: 'Job Opening',
      view: {
        editable: true,
        key: 'VIEW_JOBOPENING'
      },
      create: {
        editable: true,
        key: 'CREATE_JOBOPENING'
      },
      edit: {
        editable: true,
        key: 'EDIT'
      },
      editByMe: {
        editable: true,
        key: 'EDIT_ME'
      }
    },
    {
      id: '4',
      entity: 'customer',
      name: 'Company',
      view: {
        editable: true,
        key: 'VIEW_COMPANY'
      },
      create: {
        editable: true,
        key: 'CREATE_COMPANY'
      },
      edit: {
        editable: true,
        key: 'EDIT'
      },
      editByMe: {
        editable: true,
        key: 'EDIT_ME'
      }
    },
    {
      id: '5',
      entity: 'task',
      name: 'Task',
      view: {
        editable: true,
        key: 'VIEW_TASK'
      },
      create: {
        editable: true,
        key: 'CREATE_TASK'
      },
      edit: {
        editable: true,
        key: 'EDIT'
      },
      editByMe: {
        editable: true,
        key: 'EDIT_ME'
      }
    },
    {
      id: '6',
      entity: 'document',
      name: 'Files',
      view: {
        editable: true,
        key: 'VIEW_DOCUMENT'
      },
      delete: {
        editable: true,
        key: 'DELETE'
      },
      deleteByMe: {
        editable: true,
        key: 'DELETE_ME'
      }
    },
    {
      id: '7',
      entity: 'profileSearch',
      name: 'Saved Profile Search',
      view: {
        editable: true,
        key: 'VIEW_SAVED_PROFILE_SEARCH'
      },
      create: {
        editable: true,
        key: 'SAVE_PROFILE_SEARCH'
      },
      delete: {
        editable: true,
        key: 'DELETE'
      },
    },
    {
      id: '8',
      entity: 'jobCategory',
      name: 'Job Category',
      view: {
        editable: true,
        key: 'VIEW_ALL_JOBCATEGORY'
      },
      create: {
        editable: true,
        key: 'CREATE_JOBCATEGORY'
      },
      edit: {
        editable: true,
        key: 'EDIT'
      },
      delete: {
        editable: true,
        key: 'DELETE'
      },
      deleteByMe: {
        editable: true,
        key: 'DELETE_ME'
      }
    },
    // {
    //   id: '9',
    //   entity: 'resume',
    //   name: 'Candidate',
    //   // edit: {
    //   //   editable: true,
    //   //   key: 'EDIT_CANDIDATE'
    //   // },
    //   delete: {
    //     editable: true,
    //     key: 'DELETE'
    //   }
    // }
  ],
  dependents: [
    {
      model: 'Template',
      key: 'VIEW_TEMPLATE',
      childs: [
        {
          model: 'Template',
          key: 'EDIT'
        },
        {
          model: 'Template',
          key: 'EDIT_ME'
        },
        {
          model: 'Template',
          key: 'DELETE_ME'
        },
        {
          model: 'Template',
          key: 'DELETE'
        },
        {
          model: 'Template',
          key: 'CREATE_TEMPLATE'
        },
      ]
    },
    {
      model: 'Template',
      key: 'EDIT_ME',
      childs: [
        {
          model: 'Template',
          key: 'EDIT'
        }
      ]
    },
    {
      model: 'Template',
      key: 'DELETE_ME',
      childs: [
        {
          model: 'Template',
          key: 'DELETE'
        }
      ]
    },
    {
      model: 'Signature',
      key: 'VIEW_SIGNATURE',
      childs: [
        {
          model: 'Signature',
          key: 'EDIT_ME'
        },
        {
          model: 'Signature',
          key: 'DELETE_ME'
        },
        {
          model: 'Signature',
          key: 'CREATE_SIGNATURE'
        },
      ]
    },
    {
      model: 'jobOpening',
      key: 'VIEW_JOBOPENING',
      childs: [
        {
          model: 'jobOpening',
          key: 'EDIT'
        },
        {
          model: 'jobOpening',
          key: 'EDIT_ME'
        },
        {
          model: 'jobOpening',
          key: 'CREATE_JOBOPENING'
        },
        {
          key: 'VIEW_JOBOPENING_HISTORY',
          model: 'jobOpening'
        },
        {
          key: 'VIEW_JOBOPENING_ACTIVITY',
          model: 'jobOpening'
        },
        {
          key: 'VIEW_JOBOPENING_EMAIL',
          model: 'ProspectMails'
        },
        {
          key: 'JOB_OPENING_SEARCH',
          model: 'jobOpening'
        },
        {
          key: 'ALL_OPENINGS',
          model: 'jobOpening'
        },
        {
          key: 'MY_OPENINGS',
          model: 'jobOpening'
        },
        {
          key: 'JOB_OPENING_LOG_ACTIVITY',
          model: 'jobOpening'
        },
        {
          key: 'JOB_OPENING_SEND_EMAIL',
          model: 'jobOpening'
        },
        {
          key: 'SELECT_CANDIDATE',
          model: 'jobProfile'
        },
        {
          name: 'View ATS board',
          key: 'VIEW_ATS_BOARD',
          entity: 'jobProfile'
        }
      ]
    },
    {
      model: 'jobOpening',
      key: 'EDIT_ME',
      childs: [
        {
          model: 'jobOpening',
          key: 'EDIT'
        }
      ]
    },
    {
      model: 'jobOpening',
      key: 'VIEW_JOBOPENING_ACTIVITY',
      childs: [
        {
          model: 'jobOpening',
          key: 'JOB_OPENING_LOG_ACTIVITY'
        }
      ]
    },
    {
      model: 'ProspectMails',
      key: 'VIEW_JOBOPENING_EMAIL',
      childs: [
        {
          model: 'jobOpening',
          key: 'JOB_OPENING_SEND_EMAIL'
        }
      ]
    },
    {
      model: 'customer',
      key: 'VIEW_COMPANY',
      childs: [
        {
          model: 'customer',
          key: 'EDIT'
        },
        {
          model: 'customer',
          key: 'EDIT_ME'
        },
        {
          model: 'customer',
          key: 'CREATE_COMPANY'
        },
        {
          key: 'COMPANY_SEARCH',
          model: 'customer'
        },
        {
          key: 'VIEW_COMPANY_JOBOPENING',
          model: 'customer'
        },
        {
          key: 'VIEW_COMPANY_EMAIL',
          model: 'ProspectMails'
        },
        {
          key: 'VIEW_COMPANY_HISTORY',
          model: 'customer'
        },
        {
          key: 'COMPANY_LOG_ACTIVITY',
          model: 'customer'
        },
        {
          key: 'VIEW_COMPANY_ACTIVITY',
          model: 'customer'
        },
        {
          key: 'COMPANY_SEND_EMAIL',
          model: 'customer'
        },
      ]
    },
    {
      model: 'customer',
      key: 'EDIT_ME',
      childs: [
        {
          model: 'customer',
          key: 'EDIT'
        }
      ]
    },
    {
      model: 'customer',
      key: 'VIEW_COMPANY_ACTIVITY',
      childs: [
        {
          model: 'customer',
          key: 'COMPANY_LOG_ACTIVITY'
        }
      ]
    },
    {
      model: 'ProspectMails',
      key: 'VIEW_COMPANY_EMAIL',
      childs: [
        {
          model: 'customer',
          key: 'COMPANY_SEND_EMAIL'
        }
      ]
    },
    {
      model: 'task',
      key: 'VIEW_TASK',
      childs: [
        {
          model: 'task',
          key: 'EDIT'
        },
        {
          model: 'task',
          key: 'EDIT_ME'
        },
        {
          model: 'task',
          key: 'ASSIGNEER_CAN_EDIT'
        },
        {
          key: 'TASK_ACTIVITIES',
          model: 'task'
        },
        {
          key: 'TASK_SEARCH',
          model: 'task'
        },
        {
          key: 'UPDATE_TASK_STATUS',
          model: 'task'
        },
      ]
    },
    {
      model: 'task',
      key: 'EDIT_ME',
      childs: [
        {
          model: 'task',
          key: 'EDIT'
        }
      ]
    },
    {
      model: 'document',
      key: 'VIEW_DOCUMENT',
      childs: [
        {
          key: 'DELETE',
          model: 'document'
        },
        {
          key: 'DELETE_ME',
          model: 'document'
        },
        {
          key: 'UPLOAD_FILE',
          model: 'document'
        }
      ]
    },
    {
      model: 'document',
      key: 'DELETE_ME',
      childs: [
        {
          key: 'DELETE',
          model: 'document'
        }
      ]
    },
    {
      model: 'profileSearch',
      key: 'VIEW_SAVED_PROFILE_SEARCH',
      childs: [
        {
          key: 'SAVE_PROFILE_SEARCH',
          model: 'profileSearch'
        },
        {
          key: 'DELETE',
          model: 'profileSearch'
        },
      ]
    },
    {
      model: 'resume',
      key: 'VIEW_PROFILE',
      childs: [
        {
          key: 'SEND_CANDIDATE_EMAIL',
          model: 'resume'
        },
        {
          key: 'UPDATE_CANDIDATE',
          model: 'resume'
        },
        {
          key: 'CANDIDATE_EMAIL',
          model: 'ProspectMails'
        },
        {
          key: 'VIEW_CANDIDATE_ACTIVITIES',
          model: 'activity'
        },
        {
          name: 'Download Files',
          key: 'DOWNLOAD_DOCUMENT',
          model: 'document'
        },
        {
          name: 'Download candidate Super Profile',
          key: 'DOWNLOAD_SUPER_PROFILE',
          model: 'document'
        },
        {
          name: 'Download a  candidate profile',
          key: 'DOWNLOAD_CANDIDATE_PROFILE',
          model: 'document'
        },
        {
          key: 'PROFILE_SEARCH_FILTER',
          model: 'profileSearch'
        },
        {
          key: 'PROFILE_SEARCH_ALL_MATCHES',
          model: 'profileSearch'
        },
        {
          key: 'PROFILE_SEARCH_BEST_MATCHES',
          model: 'profileSearch'
        },
        {
          key: 'VIEW_DOCUMENT',
          model: 'document'
        },
        {
          key: 'VIEW_CANDIDATE_JOB_OPENINGS',
          model: 'jobProfile'
        },
        {
          key: 'ARCHIVE_CANDIDATE',
          model: 'resume'
        },
        {
          key: 'UNARCHIVE_CANDIDATE',
          model: 'resume'
        },
        {
          key: 'ARCHIVED_CANDIDATES',
          model: 'resume'
        },
        {
          key: 'UNARCHIVE_PENDING_CANDIDATES',
          model: 'resume'
        },
        {
          key: 'APPROVE_DELETE',
          model: 'resume'
        },
        {
          key: 'DELETE',
          model: 'resume'
        }
      ]
    },
    {
      model: 'ProspectMails',
      key: 'CANDIDATE_EMAIL',
      childs: [
        {
          key: 'SEND_CANDIDATE_EMAIL',
          model: 'resume'
        }
      ]
    },
    {
      model: 'ProspectMails',
      key: 'CANDIDATE_EMAIL',
      childs: [
        {
          key: 'SEND_CANDIDATE_EMAIL',
          model: 'resume'
        }
      ]
    },
    {
      model: 'jobProfile',
      key: 'VIEW_ATS_BOARD',
      childs: [
        {
          key: 'UPDATE_CANDIDATE_STATUS',
          model: 'jobProfile'
        }
      ]
    },
    {
      model: 'jobCategory',
      key: 'VIEW_ALL_JOBCATEGORY',
      childs: [
        {
          key: 'CREATE_JOBCATEGORY',
          model: 'jobCategory'
        },
        {
          key: 'EDIT',
          model: 'jobCategory'
        },
        {
          key: 'DELETE',
          model: 'jobCategory'
        },
        {
          key: 'DELETE_ME',
          model: 'jobCategory'
        }
      ]
    },
    {
      model: 'jobCategory',
      key: 'DELETE_ME',
      childs: [
        {
          key: 'DELETE',
          model: 'jobCategory'
        },
      ]
    },
    {
      model: 'profileSearch',
      key: 'PROFILE_SEARCH_FILTER',
      childs: [
        {
          key: 'PROFILE_SEARCH_ALL_MATCHES',
          model: 'profileSearch'
        },
        {
          key: 'PROFILE_SEARCH_BEST_MATCHES',
          model: 'profileSearch'
        },
      ]
    },
    {
      model: 'resume',
      key: 'ARCHIVED_CANDIDATES',
      childs: [
        {
          key: 'UNARCHIVE_CANDIDATE',
          model: 'resume'
        }
      ]
    },
    {
      model: 'resume',
      key: 'UNARCHIVE_PENDING_CANDIDATES',
      childs: [
        {
          key: 'UNARCHIVE_CANDIDATE',
          model: 'resume'
        }
      ]
    },
    {
      model: 'customer',
      key: 'UNARCHIVE_PENDING_COMPANIES',
      childs: [
        {
          key: 'COMPANY_UNARCHIVE',
          model: 'customer'
        }
      ]
    },
    {
      model: 'customer',
      key: 'ARCHIVED_COMPANIES',
      childs: [
        {
          key: 'COMPANY_UNARCHIVE',
          model: 'customer'
        }
      ]
    },
  ],
  admin: 'Admin'
};

export default Constants;
