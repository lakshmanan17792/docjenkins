import React from 'react';
import { Field } from 'redux-form';
import { Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import { Editor } from 'react-draft-wysiwyg';
import styles from './FormComponents.scss';

const renderField = ({ editorState, handleOnChange, toolbarOptions, meta: { touched, error } }) => (
  <div>
    <Editor
      editorState={editorState}
      editorClassName={styles.text_editor}
      onEditorStateChange={handleOnChange}
      toolbar={toolbarOptions}
      toolbarStyle={{ borderColor: '#e5e5e5' }}
      editorStyle={{ borderColor: '#e5e5e5' }}
    />
    {touched && (error && <div className="error-message">{error}</div>)}
  </div>
);

renderField.propTypes = {
  editorState: PropTypes.objectOf(PropTypes.any).isRequired,
  handleOnChange: PropTypes.func.isRequired,
  meta: PropTypes.object.isRequired,
  toolbarOptions: PropTypes.object.isRequired
};

const TextEditor = ({ label, name, isRequired, editorState, handleOnChange, toolbarOptions }) => (
  <div>
    <label htmlFor={name}>
      <Trans>{label}</Trans>{isRequired ? <span className="required_color">*</span> : ''}
    </label>
    <div>
      <Field
        name={name}
        component={renderField}
        editorState={editorState}
        handleOnChange={handleOnChange}
        toolbarOptions={toolbarOptions}
      />
    </div>
  </div>
);

TextEditor.defaultProps = {
  isRequired: false,
  editorState: '',
  handleOnChange: {},
  toolbarOptions: {}
};

TextEditor.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  editorState: PropTypes.objectOf(PropTypes.any),
  handleOnChange: PropTypes.func,
  toolbarOptions: PropTypes.object
};

export default TextEditor;
