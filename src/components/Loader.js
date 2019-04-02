import React from 'react';
import PropTypes from 'prop-types';

const Loader = props =>
  (<div>
    {
      props.loading ?
        <div className="loading_overlay">
          <div className="loader" style={props.styles}>
            <div className="loader-1" />
            <div className="loader-2" />
            <div className="loader-3" />
          </div>
        </div> : ''
    }
  </div>);

Loader.propTypes = {
  loading: PropTypes.bool,
  styles: PropTypes.object
};

Loader.defaultProps = {
  loading: false,
  styles: {}
};


export default Loader;
