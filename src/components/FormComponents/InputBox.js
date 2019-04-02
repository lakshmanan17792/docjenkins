import React from 'react';
import { Field } from 'redux-form';
import { Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import { moveFocusToEnd } from '../../utils/validation';
import i18n from '../../i18n';

const popoverRight = (
  <Popover id="popover-positioned-right" className="popover-zindex">
    <span>
      <div className="filter_notes">Enter keywords with comma in between eg:(java, c++)</div>
    </span>
  </Popover>
);

const excludeAlphabetInNumber = evt => {
  if (evt.keyCode === 69) {
    evt.preventDefault();
  }
};
const includeOnlyNumber = evt => {
  if (evt.keyCode === 69 || evt.keyCode === 107 || evt.keyCode === 110 || evt.keyCode === 109) {
    evt.preventDefault();
  }
};
const typeCheck = (e, type) => {
  if (type === 'number') {
    return excludeAlphabetInNumber(e);
  } else if (type === 'wholeNumber') {
    return includeOnlyNumber(e);
  }
};


const renderField = ({ input, disabled, placeholder, isNote, showLength,
  className, errorMessage, type, readOnly, meta: { touched, error }, handleOnBlur,
  handleOnFocus, active, handleOnKeyPress }) =>
  (
    <div>
      <input
        {...input}
        placeholder={placeholder ? i18n.t(`placeholder.${placeholder}`) : ''}
        className={className}
        disabled={disabled}
        onBlur={handleOnBlur}
        onFocus={active ? e => { moveFocusToEnd(e); handleOnFocus(e); } : handleOnFocus}
        onKeyDown={e => typeCheck(e, type)}
        type={(type === 'number' || type === 'wholeNumber') ? 'number' : type}
        readOnly={readOnly}
        min={type === 'number' ? 0 : ''}
        style={disabled ? { cursor: 'not-allowed', backgroundColor: '#EBEBE4' } : {}}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={active}
        onKeyPress={handleOnKeyPress}
      />
      {touched && (error &&
      <div className={showLength ? 'inline error-message' : 'error-message'}>{errorMessage || error}</div>)}
      {touched && showLength &&
      <div
        className="inline text-length"
        style={{ float: 'right' }}
      >
        {input.value.length}/50
      </div>}
      {
        isNote ?
          <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={popoverRight}>
            <i className="fa fa-question-circle" aria-hidden="true" />
          </OverlayTrigger>
          : null
      }
    </div>
  );
renderField.defaultProps = {
  placeholder: '',
  className: '',
  isNote: false,
  handleOnBlur: () => { },
  hasOnBlur: false,
  handleOnFocus: () => { },
  hasOnFocus: false,
  disabled: false,
  showLength: false,
  active: false,
  handleOnKeyPress: () => {}
};

renderField.propTypes = {
  input: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
  className: PropTypes.string,
  readOnly: PropTypes.string.isRequired,
  isNote: PropTypes.bool,
  handleOnBlur: PropTypes.func,
  hasOnBlur: PropTypes.bool,
  handleOnFocus: PropTypes.func,
  hasOnFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  showLength: PropTypes.bool,
  active: PropTypes.bool,
  handleOnKeyPress: PropTypes.func
};

const renderTooltip = infoText => (
  <Tooltip id="locationText">
    <strong>
      {i18n.t(infoText)}
    </strong>
  </Tooltip>
);

const InputBox = ({ label, name, type, className, placeholder, errorMessage,
  isNote, noteClassName, disabled, noteContent, isRequired, normalize, validate,
  readOnly, handleOnBlur, hasOnBlur, handleOnFocus, handleOnKeyPress, hasOnFocus,
  isInfo, infoText, parse, format, showLength, autoFocus, onChange }) =>
  (
    <div>
      {label ?
        <label
          htmlFor={name}
        >
          <Trans>{label}</Trans>
          { isRequired ?
            <span className="required_color">*</span>
            : ''
          }
          { isInfo ?
            <OverlayTrigger
              rootClose
              overlay={renderTooltip(infoText)}
              placement="top"
              key="infoText"
            >
              <span className="p-l-10 cursor-pointer">
                <i className="fa fa-info-circle" />
              </span>
            </OverlayTrigger> : ''
          }
        </label>
        : null
      }
      <div>
        <Field
          name={name}
          component={renderField}
          type={type}
          isNote={isNote}
          noteClassName={noteClassName}
          noteContent={noteContent}
          className={className}
          placeholder={placeholder}
          errorMessage={errorMessage}
          onChange={onChange}
          normalize={normalize}
          readOnly={readOnly}
          validate={validate}
          handleOnBlur={handleOnBlur}
          hasOnBlur={hasOnBlur}
          handleOnFocus={handleOnFocus}
          handleOnKeyPress={handleOnKeyPress}
          hasOnFocus={hasOnFocus}
          disabled={disabled}
          parse={parse}
          format={format}
          showLength={showLength}
          active={autoFocus}
        />
      </div>
    </div>
  );

InputBox.defaultProps = {
  className: '',
  errorMessage: '',
  isRequired: false,
  placeholder: '',
  isNote: false,
  noteContent: '',
  noteClassName: '',
  validate: null,
  normalize: null,
  disabled: false,
  readOnly: '',
  hasOnBlur: false,
  isInfo: false,
  infoText: null,
  onChange: null,
  handleOnBlur: () => {},
  hasOnFocus: false,
  handleOnFocus: () => {},
  parse: null,
  format: null,
  showLength: false,
  autoFocus: false,
  handleOnKeyPress: () => {}
};

InputBox.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  noteContent: PropTypes.string,
  isRequired: PropTypes.bool,
  isNote: PropTypes.bool,
  hasOnBlur: PropTypes.bool,
  noteClassName: PropTypes.string,
  readOnly: PropTypes.string.isRequired,
  handleOnBlur: PropTypes.func,
  validate: PropTypes.func,
  normalize: PropTypes.func,
  isInfo: PropTypes.bool,
  infoText: PropTypes.string,
  disabled: PropTypes.bool,
  parse: PropTypes.func,
  format: PropTypes.func,
  showLength: PropTypes.bool,
  autoFocus: PropTypes.bool,
  handleOnFocus: PropTypes.func,
  hasOnFocus: PropTypes.bool,
  handleOnKeyPress: PropTypes.func
};

export default InputBox;
