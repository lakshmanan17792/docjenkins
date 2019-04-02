import React from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { MentionsInput, Mention } from 'react-mentions';
import { Trans } from 'react-i18next';
import i18n from '../../i18n';

import styles from './FormComponents.scss';
// import defaultMentionStyle from './default';
import mentionInputStyle from './mentionInputStyle';

const renderMentionInput = ({ input, data, placeholder, valueField, onFocusout, handleOnChange }) => (
  <div className={styles.keywords_section}>
    <MentionsInput
      {...input}
      onBlur={onFocusout}
      value={valueField}
      id={input.name}
      name={input.name}
      singleLine
      allowSpaceInQuery
      placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
      onChange={handleOnChange}
      style={mentionInputStyle}
    >
      <Mention
        appendSpaceOnAdd
        trigger=""
        data={data}
        // style={defaultMentionStyle}
      />
    </MentionsInput>
  </div>
);

renderMentionInput.defaultProps = {
  placeholder: '',
  name: '',
  label: ''
};

renderMentionInput.propTypes = {
  placeholder: PropTypes.string,
  input: PropTypes.object.isRequired,
  name: PropTypes.string,
  handleOnChange: PropTypes.func.isRequired,
  onFocusout: PropTypes.func.isRequired,
  valueField: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired
};

const MentionInput = ({ label, name, handleOnChange, data, valueField, placeholder, onFocusout, isInfo, infoText }) => (
  <div>
    {label ?
      <div>
        <label htmlFor={name}>
          <Trans>{label}</Trans>
        </label>
        {isInfo && <OverlayTrigger
          rootClose
          overlay={
            <Tooltip id="locationText">
              <strong>
                {i18n.t(infoText)}
              </strong>
            </Tooltip>
          }
          placement="top"
          key="infoText"
        >
          <span className="p-l-10 cursor-pointer">
            <i className="fa fa-info-circle" />
          </span>
        </OverlayTrigger>}
      </div>
      : null
    }
    <Field
      name={name}
      component={renderMentionInput}
      data={data}
      placeholder={placeholder}
      valueField={valueField}
      handleOnChange={handleOnChange}
      onFocusout={onFocusout}
    />
  </div>
);

MentionInput.defaultProps = {
  placeholder: '',
  label: '',
  isInfo: false,
  infoText: ''
};

MentionInput.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  isInfo: PropTypes.bool,
  infoText: PropTypes.string,
  handleOnChange: PropTypes.func.isRequired,
  onFocusout: PropTypes.func.isRequired,
  valueField: PropTypes.string.isRequired,
  label: PropTypes.string,
  data: PropTypes.array.isRequired
};

export default MentionInput;
