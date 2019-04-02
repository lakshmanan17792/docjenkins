import lodash from 'lodash';
import { deFormatLinks } from '../../utils/validation';
import i18n from '../../i18n';

class Parser {
  parsePositions(positions) {
    this.positions = positions.map(position => {
      const data = {
        id: position.id,
        name: position.name
      };
      return data;
    });
    return this.positions;
  }

  changeLocalization(lists, changeKey) {
    this.lists = lodash.map(lists, list => lodash.mapValues(list, (value, key) =>
      key === changeKey ? i18n.t(value) : value));
    return this.lists;
  }

  parseCompanies(companies) {
    this.companies = companies.map(company => {
      const data = {
        id: company.id,
        name: company.name.replace(/[""]/g, ''),
        isUserAdded: company.isUserAdded
      };
      return data;
    });
    return this.companies;
  }

  parseLanguages(languages) {
    this.languages = languages.map(language => {
      const data = {
        name: language.name,
        id: language.id
      };
      return data;
    });
    return this.languages;
  }

  parseProfiles(profiles) {
    this.profiles = profiles.map(profile => {
      profile._source = deFormatLinks(profile._source);
      const data = {
        id: profile._id,
        name: profile._source.name ? profile._source.name.toLowerCase() : '',
        experiences: this.parseExperience(profile._source.experiences),
        location: profile._source.location || '',
        country: profile._source.country || '',
        skills: profile._source.skills ? profile._source.skills : [],
        languages_known: profile._source.languages_known ? profile._source.languages_known : [],
        source: profile._source.resume_source,
        experience: Math.round(profile._source.total_years_of_experience),
        current_experience: this.parseExperience([profile._source.current_experience]).length ?
          this.parseExperience([profile._source.current_experience])[0] : {},
        score: profile._actonomy ? Math.round(profile._actonomy.score * 100) : 0,
        scores: profile._source.scores,
        profileId: profile._source.id,
        email: profile._source.email,
        phone: profile._source.mobile_number,
        isChecked: false,
        links: [
          // {
          //   domain: profile._source.url.indexOf('xing') !== -1 ? 'xing' : 'textkernel',
          //   url: profile._source.url,
          //   srcImage: profile._source.url.indexOf('xing') !== -1 ? './xing.png' : './textkernel.png',
          //   alt: 'xing icon',
          //   className: ''
          // },
          // {
          //   domain: 'indeed',
          //   url: '',
          //   className: ''
          // },
          {
            domain: 'github',
            url: profile._source.github ? profile._source.github.link : null,
            srcImage: '/socialIcons/Github.svg',
            alt: 'github icon',
            className: 'github_icon'
          },
          {
            domain: 'twitter',
            url: profile._source.twitter,
            srcImage: '/socialIcons/Twitter.svg',
            alt: 'twitter icon',
            className: 'twitter_icon'
          },
          {
            domain: 'stackOverflow',
            url: profile._source.stackoverflow ? profile._source.stackoverflow.link : null,
            srcImage: '/socialIcons/Stackoverflow.svg',
            alt: 'stack overflow icon',
            className: 'stackoverflow_icon'
          },
          {
            domain: 'linkedin',
            url: profile._source.linkedin,
            srcImage: '/socialIcons/LinkedIn.svg',
            alt: 'linkedin icon',
          },
          {
            domain: 'xing',
            url: profile._source.url.includes('xing') ? profile._source.url : '',
            srcImage: '/socialIcons/Xing.svg',
            alt: 'xing icon',
          },
          {
            domain: 'facebook',
            url: profile._source.facebook,
            srcImage: '/socialIcons/Facebook.svg',
            alt: 'facebook icon',
            className: 'facebook_icon'
          }
        ]
      };
      return data;
    });
    return this.profiles;
  }

  parseExperience(experiences) {
    if (experiences && experiences[0] !== null) {
      this.experienceList = experiences.map(experience => {
        const data = {
          company_location: experience.company_location ? experience.company_location.toLowerCase() : '',
          company_name: experience.company_name || '',
          description: experience.description || '',
          end_date: experience.end_date,
          start_date: experience.start_date,
          title: experience.title ? experience.title.toLowerCase() : '',
          years_of_experience: experience.years_of_experience,
          tooltipTitle: `${experience.title}${experience.company_name ?
            `, ${experience.company_name}` : ''}` || ''
        };
        return data;
      });
      return this.experienceList;
    }
    return [];
  }

  parseLocations(locations) {
    this.locations = locations.map(location => {
      const data = {
        id: location.id,
        name: location.name
      };
      return data;
    });
    return this.locations;
  }

  parseSkills(skills) {
    this.skills = skills.map(skill => {
      const data = {
        id: skill.id,
        name: skill.name
      };
      return data;
    });
    return this.skills;
  }

  parseNationality(nationalities) {
    this.nationalities = nationalities.map(nationality => {
      const data = {
        id: nationality.id,
        name: nationality.name
      };
      return data;
    });
    return this.nationalities;
  }

  parseATSJobProfiles = result => {
    const resumes = {
      Selected: [],
      Contacted: [],
      Submitted: [],
      Shortlisted: [],
      ToBeSubmitted: [],
      Interested: [],
      Scheduled: [],
      Hired: [],
      Rejected: []
    };
    const lanes = Object.keys(result);
    lanes.forEach(lane => {
      result[lane].map(resume => (
        resumes[lane].push({
          id: resume._source.id,
          resumeProfileId: resume._id,
          status: resume.status,
          addedBy: resume.user,
          name: resume._source.name,
          totalExperience: resume._source.total_years_of_experience,
          currentExperience: resume._source.current_experience,
          location: resume._source.location,
          mobileNumber: resume._source.mobile_number,
          email: resume._source.email
        }))
      );
    });
    return resumes;
  }

  parseOpenings(openings) {
    if (openings && openings.length) {
      this.openings = [];
      openings.forEach(opening => {
        opening.openingLocation = opening.openinglocations;
        delete opening.openinglocations;
        if (opening.status) {
          this.openings.push({
            ...opening,
            statusCount: opening.statusCount ? opening.statusCount : {}
          });
        }
      });
      return this.openings;
    }
    return [];
  }

  checkIfNoResultsFound = result => {
    if ((result && result.hits && result.hits.total === 0) || result.length === 0) {
      return true;
    }
  }
}

const parser = new Parser();

export default parser;
