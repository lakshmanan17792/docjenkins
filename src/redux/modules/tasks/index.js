const LOAD_CUSTOMERS = 'tasks/LOAD_CUSTOMERS';
const LOAD_CUSTOMERS_SUCCESS = 'tasks/LOAD_CUSTOMERS_SUCCESS';
const LOAD_CUSTOMERS_FAIL = 'tasks/LOAD_CUSTOMERS_FAIL';

const LOAD_CONTACTS = 'tasks/LOAD_CONTACTS';
const LOAD_CONTACTS_SUCCESS = 'tasks/LOAD_CONTACTS_SUCCESS';
const LOAD_CONTACTS_FAIL = 'tasks/LOAD_CONTACTS_FAIL';

const LOAD_USERS = 'tasks/LOAD_USERS';
const LOAD_USERS_SUCCESS = 'tasks/LOAD_USERS_SUCCESS';
const LOAD_USERS_FAIL = 'tasks/LOAD_USERS_FAIL';

const SAVE_TASK = 'tasks/SAVE_TASK';
const SAVE_TASK_SUCCESS = 'tasks/SAVE_TASK_SUCCESS';
const SAVE_TASK_FAIL = 'tasks/SAVE_TASK_FAIL';

const UPDATE_TASK = 'tasks/UPDATE_TASK';
const UPDATE_TASK_SUCCESS = 'tasks/UPDATE_TASK_SUCCESS';
const UPDATE_TASK_FAIL = 'tasks/UPDATE_TASK_FAIL';

const UPDATE_TASK_STATUS = 'tasks/UPDATE_TASK_STATUS';
const UPDATE_TASK_STATUS_SUCCESS = 'tasks/UPDATE_TASK_STATUS_SUCCESS';
const UPDATE_TASK_STATUS_FAIL = 'tasks/UPDATE_TASK_STATUS_FAIL';

const LOAD_TASKS = 'tasks/LOAD_TASKS';
const LOAD_TASKS_SUCCESS = 'tasks/LOAD_TASKS_SUCCESS';
const LOAD_TASKS_FAIL = 'tasks/LOAD_TASKS_FAIL';

const LOAD_TASK = 'tasks/LOAD_TASK';
const LOAD_TASK_SUCCESS = 'tasks/LOAD_TASK_SUCCESS';
const LOAD_TASK_FAIL = 'tasks/LOAD_TASK_FAIL';

const LOAD_TASK_ACTIVITIES = 'tasks/LOAD_TASK_ACTIVITIES';
const LOAD_TASK_ACTIVITIES_SUCCESS = 'tasks/LOAD_TASK_ACTIVITIES_SUCCESS';
const LOAD_TASK_ACTIVITIES_FAIL = 'tasks/LOAD_TASK_ACTIVITIES_FAIL';

const LOAD_TASK_COMPANY_OPENINGS = 'tasks/LOAD_TASK_COMPANY_OPENINGS';
const LOAD_TASK_COMPANY_OPENINGS_SUCCESS = 'tasks/LOAD_TASK_COMPANY_OPENINGS_SUCCESS';
const LOAD_TASK_COMPANY_OPENINGS_FAILURE = 'tasks/LOAD_TASK_COMPANY_OPENINGS_FAILURE';

const initialState = {
  loading: null,
  loaded: null,
  updatingStatus: null,
  saveResponse: null,
  updateResponse: null,
  updateStatusResponse: null,
  taskOpenings: [],
  taskCustomers: [],
  taskContacts: [],
  taskUsers: [],
  taskList: [],
  taskActivities: [],
  taskTotalCount: 0
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_CUSTOMERS:
      return {
        ...state,
        loading: true,
        taskCustomers: null,
        loaded: false
      };
    case LOAD_CUSTOMERS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        taskCustomers: action.result
      };
    case LOAD_CUSTOMERS_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case LOAD_CONTACTS:
      return {
        ...state,
        loading: true,
        taskContacts: null,
        loaded: false
      };
    case LOAD_CONTACTS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        taskContacts: action.result
      };
    case LOAD_CONTACTS_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case LOAD_USERS:
      return {
        ...state,
        loading: true,
        taskUsers: null,
        loaded: false
      };
    case LOAD_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        taskUsers: action.result
      };
    case LOAD_USERS_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case SAVE_TASK:
      return {
        ...state,
        loading: true,
        saveResponse: null,
        loaded: false
      };
    case SAVE_TASK_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        saveResponse: action.result
      };
    case SAVE_TASK_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case UPDATE_TASK:
      return {
        ...state,
        loading: true,
        updateResponse: null,
        loaded: false
      };
    case UPDATE_TASK_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        updateResponse: action.result
      };
    case UPDATE_TASK_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case UPDATE_TASK_STATUS:
      return {
        ...state,
        updatingStatus: true,
        updateStatusResponse: null,
      };
    case UPDATE_TASK_STATUS_SUCCESS:
      return {
        ...state,
        updatingStatus: false,
        updateStatusResponse: action.result
      };
    case UPDATE_TASK_STATUS_FAIL:
      return {
        ...state,
        updatingStatus: false,
        error: action.error
      };
    case LOAD_TASKS:
      return {
        ...state,
        loading: true,
        loaded: false
      };
    case LOAD_TASKS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        taskList: action.result.tasks,
        taskTotalCount: action.result.totalCount,
      };
    case LOAD_TASKS_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case LOAD_TASK:
      return {
        ...state,
        loading: true,
        saveResponse: null,
        loaded: false
      };
    case LOAD_TASK_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        task: action.result
      };
    case LOAD_TASK_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case LOAD_TASK_ACTIVITIES:
      return {
        ...state,
        loading: true,
        saveResponse: null,
        loaded: false
      };
    case LOAD_TASK_ACTIVITIES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        taskActivities: action.result
      };
    case LOAD_TASK_ACTIVITIES_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    case LOAD_TASK_COMPANY_OPENINGS:
      return {
        ...state,
        taskOpeningsLoading: true,
      };
    case LOAD_TASK_COMPANY_OPENINGS_SUCCESS:
      return {
        ...state,
        taskOpeningsLoading: false,
        taskOpenings: action.result
      };
    case LOAD_TASK_COMPANY_OPENINGS_FAILURE:
      return {
        ...state,
        taskOpeningsLoading: false,
        error: action.error
      };
    default:
      return state;
  }
}

/*
* Actions
* * * * */

export function loadContacts(query) {
  return {
    types: [
      LOAD_CONTACTS, LOAD_CONTACTS_SUCCESS, LOAD_CONTACTS_FAIL
    ],
    promise: ({ client }) => client.get(`/customerContacts?filter=${JSON.stringify(query)}`)
  };
}

export function loadUsers(user) {
  return {
    types: [
      LOAD_USERS, LOAD_USERS_SUCCESS, LOAD_USERS_FAIL
    ],
    promise: ({ client }) => client.post('/users/lists', {
      data: user
    })
  };
}

export function saveTask(task) {
  return {
    types: [
      SAVE_TASK, SAVE_TASK_SUCCESS, SAVE_TASK_FAIL
    ],
    promise: ({ client }) => client.post('/tasks/save', {
      data: task
    })
  };
}

export function updateTask(id, task) {
  return {
    types: [
      UPDATE_TASK, UPDATE_TASK_SUCCESS, UPDATE_TASK_FAIL
    ],
    promise: ({ client }) => client.put(`/tasks/update/${id}`, {
      data: task
    })
  };
}

export function updateTaskStatus(id, task) {
  return {
    types: [
      UPDATE_TASK_STATUS, UPDATE_TASK_STATUS_SUCCESS, UPDATE_TASK_STATUS_FAIL
    ],
    promise: ({ client }) => client.patch(`/tasks/updateStatus/${id}`, {
      data: task
    })
  };
}

export function loadTasks(query) {
  return {
    types: [
      LOAD_TASKS, LOAD_TASKS_SUCCESS, LOAD_TASKS_FAIL
    ],
    promise: ({ client }) => client.post('/tasks/lists', {
      data: query
    })
  };
}

export function loadTask(taskId) {
  return {
    types: [
      LOAD_TASK, LOAD_TASK_SUCCESS, LOAD_TASK_FAIL
    ],
    promise: ({ client }) => client.get(`/tasks/lists/${taskId}`)
  };
}

export function loadTaskActivities(data) {
  return {
    types: [
      LOAD_TASK_ACTIVITIES, LOAD_TASK_ACTIVITIES_SUCCESS, LOAD_TASK_ACTIVITIES_FAIL
    ],
    promise: ({ client }) => client.post('/tasks/getActivities', { data })
  };
}

export function loadJobOpeningsForCompany(ids) {
  return {
    types: [
      LOAD_TASK_COMPANY_OPENINGS, LOAD_TASK_COMPANY_OPENINGS_SUCCESS, LOAD_TASK_COMPANY_OPENINGS_FAILURE
    ],
    promise: ({ client }) => client.post('/customers/jobOpenings', {
      data: ids
    })
  };
}
