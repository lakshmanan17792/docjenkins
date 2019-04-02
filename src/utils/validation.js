import moment from 'moment';
import lodash from 'lodash';
import i18n from '../i18n';

export const isEmpty = value => value === undefined || value === null || value === '' || value.length === 0;
const join = rules => (value, data, params) => (
  rules.map(rule => rule(value, data, params)).filter(error => !!error)[0]
);

export function email(value) {
  if (value) {
    let isValid = true;
    const emailIds = value.split(';');
    emailIds.map(emailId => {
      if (!isEmpty(emailId) && !/([\w-]+(?:\.[\w-]+)*)@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(lodash.trim(emailId))) {
        isValid = false;
      }
      return null;
    });
    if (!isValid) {
      return i18n.t('validationMessage.INVALID_EMAIL_ADDRESS');
    }
  }
}

export function trimSpecialCharcters(value) {
  value = value ? value.replace(/^\s+/ig, '') : '';
  const matches = value.match(/[a-zA-Z0-9\s]+/g) || [];
  return value ? matches.join('').replace(/\s{2,}/ig, ' ') : '';
}

export function trimTrailingSpace(value) {
  value = value && value.replace(/^\s+/ig, '');
  return value ? value.replace(/\s{2,}/ig, ' ') : '';
}

export function trimSpace(value) {
  return !value
    ? ''
    : value.replace(/\s/g, '');
}

export function required(value) {
  if (value && typeof value === 'string') {
    value = trimTrailingSpace(value);
  }
  if (isEmpty(value)) {
    return i18n.t('validationMessage.REQUIRED');
  }
}

export function trimWhiteSpaces(value) {
  return !value ? '' : value.replace(/^\s+|\b\s+/g, '');
}

export function maxValue(value) {
  if (value && value > 100) {
    return i18n.t('validationMessage.MAX_VALUE_MUST_BE_LESS_THAN_100');
  }
}

// normalize function
export function maxRadValue(value) {
  const num = value && value.replace(/^[0]+/, '');
  if (num && num >= 1000) {
    return num.slice(0, 3);
  }
  return num;
}

// normalize function
export const restrictMaxLength = max => value => {
  if (value.length <= max) {
    return value;
  }
};

export const restrictUserName = max => value => {
  if (value) {
    if (restrictMaxLength(max)(value)) {
      return trimWhiteSpaces(value);
    }
  } else {
    return '';
  }
};

// normalize function
export const openingStatus = field =>
  (value, data) => {
    const duration = moment.duration(moment().diff(moment(data.endDate)));
    const days = Math.round(duration.asDays());
    if (data[field] && (data[field].id === 'active' || data[field] === 'active')
      && data && data.endDate && days > 0) {
      return i18n.t('validationMessage.SUBMISSION_DUE_DATE_MUST_BE_GREATER_THAN_CURRENT_DATE');
    }
  };

export const restrictDecimalNumber = event => {
  const regex = new RegExp('^[0-9]');
  const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
  if (!regex.test(key)) {
    event.preventDefault();
    return false;
  }
};

export const restrictMaxValue = max => value => {
  if (value < max && value >= 0) {
    return value !== 0 ? value : '';
  }
};

export const convertToInteger = value => !value ? '' : Number(value);

export const convertToPositiveInteger = value => {
  if (!value) {
    return '';
  } else if (isNaN(value)) {
    return Number(value.replace(/[+]*[-]*[e]*/g, ''));
  }
  return value > 0 ? Number(value) : '';
};


// normalize function
export const moveFocusToEnd = e => {
  const tempValue = e.target.value;
  e.target.value = '';
  e.target.value = tempValue;
};
export const formatDomainName = domainName => domainName.replace(/^https?:\/\//, '');

export function pinCode(value) {
  if (!isEmpty(value) && !/^[0-9]{5,10}$/i.test(lodash.trim(value))) {
    return i18n.t('validationMessage.MUST_BE_BETWEEN_5_TO_10_DIGITS');
  }
}

export function minLength(min) {
  return value => {
    if (!isEmpty(value) && value.length < min) {
      return `${i18n.t('validationMessage.MUST_BE_AT_LEAST')} ${min} ${i18n.t('validationMessage.CHARACTERS')}`;
    }
  };
}

export const maxLength = max => value => {
  if (!isEmpty(value) && value.length > max) {
    return `${i18n.t('validationMessage.MUST_BE_NO_MORE_THAN')} ${max} ${i18n.t('validationMessage.CHARACTERS')}`;
  }
};

export function integer(value) {
  if (!isEmpty(value) && !Number.isInteger(Number(value))) {
    return i18n.t('validationMessage.MUST_BE_AN_INTEGER');
  }
}

export function oneOf(enumeration) {
  return value => {
    if (!enumeration.includes(value)) {
      return `${i18n.t('validationMessage.MUST_BE_ONE_OF')}: ${enumeration.join(', ')}`;
    }
  };
}

export function match(field) {
  return (value, data) => {
    if (data) {
      if (value !== data[field]) {
        return i18n.t('validationMessage.DO_NOT_MATCH');
      }
    }
  };
}

export function dateDifference(field) {
  return (value, data) => {
    if (data && data[field]) {
      const duration = moment.duration(moment(value).diff(moment(data[field])));
      const days = Math.round(duration.asDays());
      if ((data.type && days < 0) || (days < 0 && field === 'startDate') ||
      (days < 0 && field === 'avail_start_date') ||
       (days < 0 && field === 'start_date') ||
      (!data.type && (
        days < 0 && (
          (field === 'contractStartDate' && !data.contractASAP) ||
          (field === 'freelanceStartDate' && !data.partTimeASAP)))
      )) {
        return field === 'startDate' ? i18n.t('validationMessage.DUE_DATE_SHOULD_BE_GREATER_THAN_START_DATE') :
          i18n.t('validationMessage.END_DATE_SHOULD_BE_GREATER_THAN_START_DATE');
      }
    }
  };
}


export function duedateDifference() {
  return (value, data) => {
    if (data) {
      let duration = '';
      let days = '';
      if (data.type === 'contract' && data.jobOpeningDetails && data.jobOpeningDetails.contractEndDate) {
        duration = moment.duration(moment(value).diff(moment(data.jobOpeningDetails.contractEndDate)));
        days = Math.round(duration.asDays());
      } else if (data.type === 'partTime' && data.jobOpeningDetails && data.jobOpeningDetails.freelanceEndDate) {
        duration = moment.duration(moment(value).diff(moment(data.jobOpeningDetails.freelanceEndDate)));
        days = Math.round(duration.asDays());
      }
      if ((data.type && (days > 0 || days === -0))) {
        return i18n.t('validationMessage.DUE_DATE_SHOULD_BE_LESS_THAN_EMPLOYMENT_TYPE_END_DATE');
      }
    }
  };
}

export function startdateDifference() {
  return (value, data) => {
    if (data) {
      let duration = '';
      let days = '';
      if (data.type === 'contract' && data.jobOpeningDetails && data.jobOpeningDetails.contractStartDate) {
        duration = moment.duration(moment(value).diff(moment(data.jobOpeningDetails.contractStartDate)));
        days = Math.round(duration.asDays());
      } else if (data.type === 'partTime' && data.jobOpeningDetails && data.jobOpeningDetails.freelanceStartDate) {
        duration = moment.duration(moment(value).diff(moment(data.jobOpeningDetails.freelanceStartDate)));
        days = Math.round(duration.asDays());
      } else if (data.type === 'fullTime' && data.jobOpeningDetails && data.jobOpeningDetails.fullTimeStartDate) {
        duration = moment.duration(moment(value).diff(moment(data.jobOpeningDetails.fullTimeStartDate)));
        days = Math.round(duration.asDays());
      }
      if (data.type && (days > 0)) {
        return i18n.t('validationMessage.JOB_OPENING_DATE_SHOULD_BE_BEFORE_EMPLOYMENT_TYPE_START_DATE');
      }
    }
  };
}

export function isStartDateEmpty(startDate, endDate) {
  return (value, data) => {
    if (data) {
      if (data[endDate] &&
      ((data.type && (!data[startDate] || data[startDate] === 'Invalid Date')) ||
      (!data.type && (
        (!data[startDate] && (
          (startDate === 'contractStartDate' && !data.contractASAP) ||
          (startDate === 'fullTimeStartDate' && !data.fullTimeASAP) ||
          (startDate === 'freelanceStartDate' && !data.partTimeASAP))) || data[startDate] === 'Invalid Date')
      ))) {
        return i18n.t('validationMessage.START_DATE_CANNOT_BE_EMPTY');
      }
    }
  };
}

export function isStartDateEmptyCheck(startDate, endDate) {
  return (value, data) => {
    if (data) {
      if (data[endDate] && !data[startDate]) {
        return i18n.t('validationMessage.START_DATE_CANNOT_BE_EMPTY');
      }
    }
  };
}

export function trimExtraSpaces(object) {
  lodash.forOwn(object, (value, key) => {
    if (lodash.isObject(value)) {
      trimExtraSpaces(value);
    } else {
      object[key] = lodash.isString(value) ? lodash.trim(value) : value;
    }
  });
  return object;
}


export function isEndDateEmpty(startDate, endDate) {
  return (value, data) => {
    if (data) {
      if (data[startDate] &&
      ((data.type && (!data[endDate] || data[endDate] === 'Invalid Date')) ||
      (!data.type && (
        (!data[endDate] && (
          (startDate === 'contractStartDate' && !data.contractASAP) ||
          (startDate === 'fullTimeStartDate' && !data.fullTimeASAP) ||
          (startDate === 'freelanceStartDate' && !data.partTimeASAP))) || data[startDate] === 'Invalid Date')
      )
      )) {
        return i18n.t('validationMessage.END_DATE_CANNOT_BE_EMPTY');
      }
    }
  };
}

export function isEndDateEmptyCheck(startDate, endDate) {
  return (value, data) => {
    if (data) {
      if (data[startDate] && !data[endDate]) {
        return i18n.t('validationMessage.END_DATE_CANNOT_BE_EMPTY');
      }
    }
  };
}

export function checkIfGreaterThanArchivalDate(archivalDate, notificationDate) {
  return (value, data) => {
    if (data) {
      if (data[archivalDate] &&
        data[notificationDate] &&
          !moment(data[notificationDate]).isSameOrAfter(
            moment(data[archivalDate]), 'day')) {
        // return i18n.t('validationMessage.NOTIFICATION_DATE_SHOULD_BE_GREATER_THAN_ARCHIVAL_DATE');
        return 'Notification date must be greater than archival date';
      }
    }
  };
}

export function checkIfLesserThanNotificationDate(archivalDate, notificationDate) {
  return (value, data) => {
    if (data) {
      if (data[archivalDate] &&
        data[notificationDate] &&
        !moment(data[notificationDate]).isSameOrAfter(
          moment(data[archivalDate]), 'day')) {
        // return i18n.t('validationMessage.NOTIFICATION_DATE_SHOULD_BE_GREATER_THAN_ARCHIVAL_DATE');
        return 'Archival date should be lesser than notifcation date';
      }
    }
  };
}

export function checkIfJoiningDateRequired(hasJoined, joiningDate) {
  return (value, data) => {
    if (data) {
      if (!data[joiningDate] && data[hasJoined] === 'Yes') {
        return i18n.t('validationMessage.JOINING_DATE_CANNOT_BE_EMPTY_WHEN_HAS_JOINED');
      }
    }
  };
}

export function isMobileNumber(value) {
  if (!isEmpty(value) && !/^[0-9\s-()+]*$/i.test(lodash.trim(value))) {
    return i18n.t('validationMessage.MUST_BE_A_NUMBER');
  }
  if (value && value.length > 20) {
    return i18n.t('validationMessage.NUMBER_MUST_BE_LESS_THAN_OR_EQUAL_TO_20_DIGITS');
  }
}

export function checkContactNos(value) {
  if (value) {
    const contactLists = value.split(';');
    let errorMessage = '';
    contactLists.map(number => {
      if (lodash.trim(number)) {
        errorMessage = isMobileNumber(number) || errorMessage;
      }
      return null;
    });
    return errorMessage;
  }
}

export function createValidator(rules, params) {
  return (data = {}) => {
    const errors = {};
    Object.keys(rules).forEach(key => {
      if (typeof rules[key] === 'object' && !Array.isArray(rules[key])) {
        const nestedRules = rules[key];
        Object.keys(nestedRules).forEach(nestedKey => {
          const rule = join([].concat(nestedRules[nestedKey])); // concat enables both functions and arrays of functions
          let error;
          if (data[key] && typeof data[key][nestedKey] !== 'undefined') {
            error = rule(data[key][nestedKey], data[key], { nestedKey, ...params });
            if (error) {
              errors[key] = errors[key] ? errors[key] : {};
              errors[key][nestedKey] = error;
            }
          }
        });
      } else if (typeof rules[key][0] === 'object') {
        const arrayObjectRules = rules[key][0];
        if (key in data) {
          const error = data[key].map(arrayObject => createValidator(arrayObjectRules)(arrayObject));
          if (error) {
            errors[key] = error;
          }
        }
      } else {
        const rule = join([].concat(rules[key])); // concat enables both functions and arrays of functions
        const error = rule(data[key], data, { key, ...params });
        if (error) {
          errors[key] = error;
        }
      }
    });
    return errors;
  };
}

export function dateDiffInYears(endDate, startDate) {
  const diff = Math.floor(endDate.getTime() - startDate.getTime());
  const day = 1000 * 60 * 60 * 24;

  const days = Math.floor(diff / day);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  const totalDiff = parseFloat((years + ((months % 12) / 12)).toFixed(2));
  // Note: It returns float value not a string
  return totalDiff > 0 ? totalDiff : 0;
}

export function checkListOfEndDate(value) {
  const listOfEndDateWords = ['present', 'till date', 'bis heute', 'heute'];
  if (value && isNaN(new Date(value)) && !listOfEndDateWords.includes(value.toLowerCase())) {
    return i18n.t('validationMessage.NOT_A_VALID_END_DATE_WORDS');
  }
}

export function urlValidate(url) {
  if (url) {
    url = lodash.trim(url);
    if (!isEmpty(url) && !/(http(s)?:\/\/)?([\w-]+\.)+[\w-]+([\w- ;,./?%&=]*)?/i.test(url)) {
      return i18n.t('validationMessage.NOT_A_VALID_DOMAIN');
    }
  }
}

export function companyUrlValidate(url) {
  if (url) {
    if (!isEmpty(url) && !/^(?:http(s)?:\/\/)?[\w.-//]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/i.test(url)) {
      return i18n.t('validationMessage.NOT_A_VALID_DOMAIN');
    }
    return '';
  }
}

export function isEmail(value) {
  // Let's not start a debate on email regex. This is just for an example app!
  if (!isEmpty(value) && !/([\w-]+(?:\.[\w-]+)*)@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(lodash.trim(value))) {
    return false;
  }
  return true;
}

export function checkValidPassword(pass, oldpass) {
  return (value, data) => {
    if (data[pass]) {
      if (data[pass].search(/[a-z]/) < 0) {
        return i18n.t("validationMessage.PASSWORD_DOESN'T_HAVE_LETTER");
      }
      if (data[pass].search(/[A-Z]/) < 0) {
        return i18n.t("validationMessage.PASSWORD_DOESN'T_HAVE_LETTER");
      }
      if (data[pass].search(/[0-9]/) < 0) {
        return i18n.t("validationMessage.PASSWORD_DOESN'T_HAVE_NUMBER");
      }
      if (data[pass].search(/[+\\";]/) > 0) {
        return i18n.t('validationMessage.VALID_SPECIAL_CHARACTER');
      }
      if (data[pass].search(/[-!$%^&*()_'|~=`{}[\]:/+<>?,.@#]/) < 0) {
        return i18n.t("validationMessage.PASSWORD_DOESN'T_HAVE_SPECIAL_CHARACTER");
      }
      if (data[pass] === localStorage.getItem('username')) {
        return i18n.t('validationMessage.VALID_USERNAME_PASSWORD');
      }
      if (data[pass]) {
        const str = data[pass];
        const res = str.toLowerCase();
        const n = res.search(localStorage.getItem('username'));
        if (n === 0) {
          return i18n.t('validationMessage.VALID_USERNAME');
        }
      }
      if (oldpass) {
        if (data[pass] === data[oldpass]) {
          return i18n.t('validationMessage.TRY_NEW_PASSWORD');
        }
      }
    }
  };
}


export function checkConfirmPassword(field) {
  return (value, data) => {
    if (data[field] !== value) {
      return i18n.t("validationMessage.CONFIRM_PASSWORD_DOESN'T_MATCH");
    }
  };
}

export function integerAndDot(value) {
  if (!isEmpty(value) && !/^[0-9.,€]*$/i.test(lodash.trim(value))) {
    return i18n.t('validationMessage.MUST_BE_A_NUMBER');
  }
}

export function euroFormatter(value) {
  if (value) {
    value = value.replace(/€/g, '');
    value = value.replace(/\./g, '');
    value = value.replace(/,/g, '');
  }
  if (!isEmpty(value) && !/^[0-9.,€]*$/i.test(lodash.trim(value))) {
    return value;
  }
  if (value && value.length >= 15) {
    value = value.slice(0, 15);
  }
  const returnValue = !value ? '' : Number(value).toLocaleString('es-ES');
  return `€${returnValue}`;
}

export function formatTitle(jobTitle) {
  if (jobTitle) {
    const title = jobTitle.replace(/(\b[a-z](?!\s))/g, x => x.toUpperCase());
    return title.replace('(M/F) (M/W/X)', '(m/w/x)').replace('(M/F)', '(m/f)').replace('(M/W/X) (M/W/X)', '(m/w/x)').replace('(M/W/X)', '(m/w/x)');
  }
}

export function validateData(object) {
  lodash.forOwn(object, (value, key) => {
    if (lodash.isObject(value) && Object.keys(value).length > 0) {
      validateData(value);
    } else {
      object[key] = value === null || value === undefined ? '' : value;
    }
  });
  return object;
}


export function validateTiming() {
  return (value, data) => {
    if (!lodash.isEmpty(data) && data.dueDate && data.remainder) {
      let convertedDate = '';
      const remianderTime = data.remainder ? moment(data.remainder).format('HH:mm') :
        moment(data.dueDate).format('hh:mm a');
      const reminderDate = moment(data.dueDate).format('YYYY-MM-DD');
      const finalizedDate = `${reminderDate} ${remianderTime}`;
      const convertedDates = new Date(finalizedDate);
      if (data.remainderDate === 'theDayBefore' || data.remainderDate.id === 'theDayBefore') {
        convertedDate = moment(convertedDates).subtract(1, 'days');
      } else if (data.remainderDate === 'theWeekBefore' || data.remainderDate.id === 'theWeekBefore') {
        convertedDate = moment(convertedDates).subtract(7, 'days');
      } else {
        convertedDate = convertedDates;
      }
      if (!moment(convertedDate).isBefore(moment(data.dueDate)) ||
        !moment(convertedDate).isAfter(moment())) {
        return i18n.t('validationMessage.INVALID_REMINDER_TYPE_OR_TIME');
      }
    }
  };
}

export function deFormatLinks(data) {
  const arrayOfLinks = data.links ? data.links.split(';') : [];
  data.links = '';
  arrayOfLinks.map(link => {
    if (link && /linkedIn/i.test(link) && !urlValidate(link)) {
      data.linkedin = link;
    } else if (link && /facebook/i.test(link) && !urlValidate(link)) {
      data.facebook = link;
    } else if (link && /xing/i.test(link) && !urlValidate(link)) {
      data.xing = link;
    } else if (link && /twitter/i.test(link) && !urlValidate(link)) {
      data.twitter = link;
    } else {
      data.links = link && !urlValidate(link) ? link : '';
    }
    return null;
  });
  return data;
}

export const isDateEmpty = (resPermit, perDate) => (value, data) => {
  if (value === 'validtill') {
    if (!data[perDate]) {
      return i18n.t('validationMessage.DATE_CANNOT_BE_EMPTY');
    }
    return '';
  }
};

export const isPrefLocationEmpty = () => (value, data) => {
  if (data.reloc_possibility === 'yes') {
    if (!data.pref_location) {
      return i18n.t('validationMessage.REQUIRED');
    }
    return '';
  }
};

export const checkNoticePeriod = (value, data) => {
  if (!value && data.noticePeriodType) {
    return 'Required';
  }
};

export const checkNoticeType = (value, data) => {
  if (!value && data.noticePeriod) {
    return 'Required';
  }
};
