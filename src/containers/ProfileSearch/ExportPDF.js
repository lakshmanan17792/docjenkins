import Moment from 'moment';

function formatDate(startDate, endDate) {
  let dateString = '';

  if (startDate !== null) {
    const formatStartDate = Moment(new Date(startDate)).format('MMM YYYY');
    if (formatStartDate !== 'Invalid date') {
      dateString = formatStartDate;
    }
  }

  if (endDate !== null) {
    const formatEndDate = Moment(new Date(endDate)).format('MMM YYYY');
    if (formatEndDate !== 'Invalid date') {
      if (dateString) {
        dateString = `${dateString} - ${formatEndDate}`;
      } else {
        dateString = formatEndDate;
      }
    } else if (endDate !== null) {
      if (dateString) {
        dateString = `${dateString} - Till Date`;
      } else {
        dateString = 'Till Date';
      }
    }
  }
  return dateString;
}

const getCompanyData = experienceInput => {
  let companyData = [];
  let clientText = '';
  if (experienceInput.company_name && experienceInput.company_location) {
    clientText = `${experienceInput.company_name} , ${experienceInput.company_location}`;
  } else if (experienceInput.company_name && !experienceInput.company_location) {
    clientText = experienceInput.company_name;
  } else if (!experienceInput.company_name && experienceInput.company_location) {
    clientText = experienceInput.company_location;
  }
  if (clientText) {
    companyData = [
      {
        text: 'Client',
        style: ['subHeaderTitle'],
        width: 100,
      },
      {
        text: ':',
        width: 10,
        style: ''
      },
      {
        width: '*',
        text: clientText,
        style: ['subHeaderTitle']
      }
    ];
  }
  return companyData;
};

const getRoleData = experienceInput => {
  let roleData = [];
  if (experienceInput.title) {
    roleData = [
      {
        text: 'Role',
        style: ['subHeaderTitle'],
        width: 100,
      },
      {
        text: ':',
        width: 10,
        style: ''
      },
      {
        width: '*',
        text: experienceInput.title,
        style: ['subHeaderTitle']
      }
    ];
  }
  return roleData;
};

const getDescriptionData = experienceInput => {
  let descriptionData = [];
  if (experienceInput.description) {
    descriptionData = [
      {
        width: '*',
        text: experienceInput.description,
        style: ['bodyContent']
      }
    ];
  }
  return descriptionData;
};

const parsePDFContent = (candidateProfile, state) => {
  const skills = [];
  const languages = [];
  const experiences = [];
  candidateProfile.skills.forEach(skill => {
    skills.push(skill.name.charAt(0).toUpperCase() + skill.name.slice(1));
  });

  if (candidateProfile.languages_known) {
    candidateProfile.languages_known.forEach(language => {
      const langWithPro = language.proficiency ?
        `{ - ${language.proficiency.charAt(0).toUpperCase()}${language.proficiency.slice(1)}}`
        : '';
      languages.push(language.language + langWithPro);
    });
  }
  // candidateProfile.experiences.unshift(candidateProfile.current_experience);
  candidateProfile.experiences.forEach(experience => {
    experiences.push([
      {
        columns: [
          {
            text: formatDate(experience.start_date, experience.end_date),
            style: ['subHeaderTitle']
          }
        ],
        columnGap: 10,
      },
      {
        columns: getCompanyData(experience),
        columnGap: 10,
      },
      {
        columns: getRoleData(experience),
        columnGap: 10,
        margin: [0, 0, 0, 15]
      },
      {
        columns: [
          {
            text: 'Project Description',
            style: ['subHeaderTitle'],
            width: 100,
          },
          {
            text: ':',
            width: 10,
            style: ''
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 2]
      },
      {
        columns: getDescriptionData(experience),
        columnGap: 10,
        margin: [0, 0, 0, 15]
      }
    ]);
  });

  const getHeaderData = (candidateInput, fieldName) => {
    let textData = '';
    let textValue = '';
    switch (fieldName) {
      case 'name':
        textData = 'Name';
        textValue = candidateInput.name;
        break;
      case 'email':
        textData = 'Email';
        textValue = candidateInput.email;
        break;
      case 'mobile_number':
        textData = 'Mobile';
        textValue = candidateInput.mobile_number;
        break;
      default:
        textData = 'Name';
    }
    let returnData = [];
    if (textValue) {
      returnData = [
        {
          width: 100,
          text: textData,
          style: ['subHeaderTitle']
        },
        {
          width: 10,
          text: ':'
        },
        {
          width: 150,
          text: textValue,
          style: ['subHeaderTitle']
        }
      ];
    }
    return returnData;
  };

  const getTableData = () => {
    if (state.isPdfWithContact) {
      return {
        widths: ['auto', 'auto', '*'],
        body: [
          [
            { text: 'Personal Information', style: ['subHeaderTitle'], margin: [30, 30, 30, 30] },
            {
              type: 'none',
              margin: [2, 10, 10, 10],
              ul: [{
                columns: getHeaderData(candidateProfile, 'name')
              },
              {
                columns: getHeaderData(candidateProfile, 'email')
              },
              {
                columns: getHeaderData(candidateProfile, 'mobile_number')
              }]
            },
            {
              columns: [
                {
                  image: state.profilePicBase64,
                  fit: [70, 70],
                  alignment: 'right'
                }
              ]
            }
          ]
        ]
      };
    }
    return {
      widths: ['auto', '*'],
      body: [
        [
          { text: 'Personal Information', style: ['subHeaderTitle'], margin: [30, 30, 30, 30] },
          {
            type: 'none',
            margin: [30, 30, 30, 30],
            ul: [{
              columns: [
                {
                  width: 100,
                  text: 'Code',
                  style: ['subHeaderTitle']
                },
                {
                  width: 10,
                  text: ':'
                },
                {
                  width: '*',
                  text: candidateProfile.id,
                  style: ['subHeaderTitle']
                }
              ]
            }]
          }
        ]
      ]
    };
  };

  const getLanguageData = languageInput => {
    let languageData = [];
    if (languageInput.length > 0) {
      languageData = [
        {
          width: 200,
          text: 'Languages',
          style: ['subHeaderTitle']
        },
        {
          width: 10,
          text: ':'
        },
        {
          width: '*',
          text: languageInput.join(', '),
          style: ['subHeaderTitle']
        }
      ];
    }
    return languageData;
  };

  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 100, 40, 80],
    header: {
      columns: [
        {
          image: state.headerLogoBase64,
          fit: [150, 150],
          alignment: 'right'
        }
      ],
      margin: [0, 30, 25, 100]
    },
    footer: {
      columns: [
        {
          image: state.footerLogoBase64,
          width: 600,
          height: 80
        },
        {
          stack: [
            { text: 'Javaji Softech GmbH & Co.KG' },
            { text: 'Mammolshainer Weg 14' },
            { text: '61462 Königstein im Taunus' },
            { text: 'www.javaji.de' }
          ],
          margin: [-550, 10, 0, 0]
        }
      ],
      margin: [0, 10, 0, 0],
      style: ['footerContent']
    },
    content: [
      {
        table: getTableData()
      },
      {
        columns: getLanguageData(languages),
        columnGap: 10,
        margin: [0, 20, 0, 15]
      },
      {
        columns: [
          {
            width: 200,
            text: 'PROFESSIONAL EXPERIENCE',
            style: ['headerTitle']
          },
          {
            width: 10,
            text: ':'
          },
          {
            width: '*',
            text: candidateProfile.total_years_of_experience,
            style: ['subHeaderTitle']
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 8]
      },
      { text: 'TECHNICAWWWL SKILLS', style: ['headerTitle'], margin: [0, 0, 0, 8] },
      {
        columns: [
          {
            width: 200,
            text: 'ProgrammingA Languages and Tools',
            style: ['bodyContent']
          },
          {
            width: 10,
            text: ':'
          },
          {
            width: '*',
            text: skills.join(', '),
            style: ['bodyContent']
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 15]
      },
      { text: 'PROJECT EXPERIENCE', style: ['headerTitle'], margin: [0, 0, 0, 8] },
      {
        type: 'none',
        ul: experiences,
        margin: [-12, 0, 0, 0]
      }
    ],
    styles: {
      footerContent: {
        fontSize: 10,
        alignment: 'left',
        lineHeight: 1.2
      },
      headerTitle: {
        fontSize: 10,
        bold: true,
        alignment: 'left'
      },
      subHeaderTitle: {
        fontSize: 10,
        bold: true,
      },
      bodyContent: {
        fontSize: 10,
        alignment: 'justify',
        color: '#2e2e2e'
      },
      boldText: {
        bold: true
      }
    }
  };
  return docDefinition;
};

export default parsePDFContent;
