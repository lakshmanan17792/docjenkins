import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MasterSkills from '../../components/MasterLists/MasterSkills';
import MasterPositions from '../../components/MasterLists/MasterPositions';
import MasterTags from '../../components/MasterLists/MasterTags';
import MasterReasons from '../../components/MasterLists/MasterReasons';

@connect(state => ({
  activePath: state.routing.locationBeforeTransitions.pathname
}), null)

export default class MasterLists extends Component {
  static propTypes = {
    activePath: PropTypes.string
  }

  static defaultProps = {
    activePath: ''
  }
  constructor(props) {
    super(props);
    this.state = {
      activePath: props.activePath
    };
  }

  render() {
    const { activePath } = this.state;
    return (
      <div>
        {activePath === '/MasterLists/skills' &&
          <MasterSkills />
        }
        {activePath === '/MasterLists/positions' &&
          <MasterPositions />
        }
        {activePath === '/MasterLists/tags' &&
          <MasterTags />
        }
        {activePath === '/MasterLists/reasons' &&
          <MasterReasons />
        }
      </div>
    );
  }
}
