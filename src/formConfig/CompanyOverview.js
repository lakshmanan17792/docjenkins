import { formatDomainName } from '../utils/validation';

// import memoize from 'lru-memoize';

const getFilterConfig = self => {
  const config = {
    title: 'Overview Customers',
    companyName: {
      label: 'NAME',
      name: 'name',
      inputText: self.props.initialValues.name,
      handleOnChange: self.props.dataChanged,
      maxLength: 90,
      // validate: self.props.validate,
      // errorMessage: "Please Enter Company Name",
      isRequired: true
    },
    domain: {
      label: 'DOMAIN',
      name: 'domain',
      inputText: formatDomainName(self.props.initialValues.domain),
      handleOnChange: self.props.dataChanged,
      minLength: 0,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: false
    },
    industry: {
      label: 'INDUSTRY',
      name: 'industry',
      inputText: self.props.initialValues.industry,
      handleOnChange: self.props.dataChanged,
      minLength: 0,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: false
    },
    phoneNumber: {
      label: 'PHONE NUMBER',
      name: 'phone',
      inputText: self.props.initialValues.phone,
      handleOnChange: self.props.dataChanged,
      minLength: 0,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: false
    },
    employees: {
      label: 'NO. OF EMPLOYEES',
      name: 'employeeCount',
      dataValue: self.props.company.employeeCount,
      handleOnChange: self.props.dataChanged,
      isRequired: false,
      data: [
        '1 - 10',
        '11 - 50',
        '51 - 200',
        '201 - 500',
        '501 - 1000',
        '1001 - 5000',
        '5001 - 10000',
        '10000+',
      ],
    },
    city: {
      label: 'CITY',
      name: 'city',
      inputText: self.props.initialValues.city,
      handleOnChange: self.props.dataChanged,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: true
    },
    state: {
      label: 'STATE',
      name: 'state',
      inputText: self.props.initialValues.state,
      handleOnChange: self.props.dataChanged,
      minLength: 0,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: false
    },
    country: {
      label: 'COUNTRY',
      name: 'country',
      inputText: self.props.initialValues.country,
      handleOnChange: self.props.dataChanged,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: true
    },
    annualRevenue: {
      label: 'ANNUAL REVENUE',
      name: 'turnover',
      inputText: self.props.initialValues.turnover,
      handleOnChange: self.props.dataChanged,
      minLength: 0,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: false
    },
    streetAddress: {
      label: 'STREET ADDRESS',
      name: 'address',
      inputText: self.props.initialValues.address,
      handleOnChange: self.props.dataChanged,
      minLength: 0,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: false
    },
    timezone: {
      label: 'TIMEZONE',
      name: 'updated_ts',
      inputText: self.props.initialValues.updated_ts,
      handleOnChange: self.props.dataChanged,
      minLength: 0,
      maxLength: 50,
      // errorMessage: "Please Enter Company Name",
      isRequired: false
    },
    description: {
      label: 'DESCRIPTION',
      name: 'description',
      inputText: self.props.initialValues.description,
      handleOnChange: self.props.dataChanged,
      minLength: 0,
      maxLength: 255,
      // errorMessage: "Please Enter Company Name",
      isRequired: false
    }
  };
  return config;
};

// const formValidation = createValidator({
//   endDate: [dateDifference('startDate'), isEndDateEmpty('startDate', 'endDate')],
//   startDate: [isStartDateEmpty('startDate', 'endDate')]
// });

export default { getFilterConfig };
