import React, { Component } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import PropTypes from 'prop-types';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Col } from 'react-bootstrap';
import styles from '../UserForm/UserForm.scss';

export default class HtmlEditor extends Component {
  static propTypes = {
    saveTemplate: PropTypes.func.isRequired,
    template: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    const html = '';
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.state = {
        editorState,
      };
    }
  }

  componentWillReceiveProps(nextProps) {
    const { template } = nextProps;
    if (template.id !== this.props.template.id) {
      // this.setState({
      //   editorState: template.htmlString
      // });
      const html = template.htmlString;
      const contentBlock = htmlToDraft(html);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        this.state = {
          editorState,
        };
      }
    }
  }

  onEditorStateChange = editorState => {
    this.setState({
      editorState,
    });
  };

  render() {
    const { editorState } = this.state;
    return (
      <Col>
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={this.onEditorStateChange}
        // wrapperStyle={{ color: 'red' }}
        // editorStyle={{ color: 'orange' }}
        // toolbarStyle={{ color: 'green' }}
        // toolbar={{
        //   image: { uploadCallback: uploadImageCallBack, alt: { present: true, mandatory: true } },
        // }}
        />
        <button
          className={`${styles.invite_btn} button-primary`}
          onClick={() => this.props.saveTemplate(draftToHtml(convertToRaw(editorState.getCurrentContent())))}
          style={{ width: '150px' }}
        >
          <i className="fa fa-plus p-r-5" />
          Save Template
        </button>
      </Col>
    );
  }
}
