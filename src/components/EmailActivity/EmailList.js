import React, { Component } from 'react';
import lodash from 'lodash';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import EmailCard from './EmailCard';
import EmailThread from './EmailThread';
import ReplyButton from './ReplyButton';

export default class EmailList extends Component {
  static propTypes = {
    emails: PropTypes.object,
    sendEmail: PropTypes.func.isRequired
  }
  static defaultProps = {
    emails: {}
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  // expandOrCollapseConversation = (evt, messageId) => {
  //   evt.preventDefault();
  //   const mailContentElm = document.getElementById(messageId);
  //   const expandBtn = document.getElementById(`${messageId}-btn`);
  //   if (mailContentElm.classList.value.indexOf('mail-content') > -1) {
  //     mailContentElm.classList.remove(mailContentElm.classList.value);
  //     expandBtn.innerText = 'Collapse';
  //   } else {
  //     mailContentElm.classList.add('mail-content');
  //     expandBtn.innerText = 'Expand';
  //   }
  // }

  expandOrCollapseThread = (evt, conversationId) => {
    evt.preventDefault();
    this.setState({ [conversationId]: !this.state[conversationId] });
  }
  redirectToEmailer = (evt, fromAddress, bccList, ccList, messageId, subject) => {
    evt.preventDefault();
    this.props.sendEmail({ fromAddress, bccList, ccList, messageId, action: 'REPLY', subject: `RE: ${subject}` });
  }

  attachmentFiles = file => {
    const token = localStorage.getItem('authToken');
    return (
      <a
        href={`${window.location.origin}/api/v1/documents/download/${file.id}?access_token=${token}`}
        onClick={this.downloadFile}
        className="attachment"
      >
        {file.originalFilename}
        <i className="fa fa-download downloadIcon" />
      </a>
    );
  }

  renderEmailAddressInfo = (fromAddress, toAddress) => {
    const toAddressNames = lodash.map(toAddress, 'name');
    const constantText = toAddressNames.length > 1 ? `and ${toAddressNames.length - 1} more` : '';
    return (<div
      className="sent_email_info_txt"
      title={`${toAddressNames.length > 0 ? toAddressNames.join(',') : ''}`}
    >{`${fromAddress.name} (${fromAddress.email}) sent an email
       to ${toAddressNames[0]} ${constantText}`}</div>);
  }

  renderAddresses = toAddresses => {
    const constructedToAddresses = [];
    toAddresses.map(toAddress => (
      constructedToAddresses.push(`${toAddress.name} (${toAddress.email})`)
    ));
    return constructedToAddresses.join(', ');
  }

  renderMails = emails =>
    Object.keys(emails).length > 0 && Object.keys(emails).map(key => (
      emails[key].length === 1 ?
        emails[key].map(email => (
          <li key={email.id} className="timeline-inverted history">
            <div className="timeline-badge warning"><i className={'glyphicon glyphicon-envelope'} /></div>
            <div className="timeline-panel">
              <div className="email_section">
                <EmailCard
                  email={email}
                  renderEmailAddressInfo={this.renderEmailAddressInfo}
                  attachmentFiles={this.attachmentFiles}
                  renderAddresses={this.renderAddresses}
                />
                {
                  email.isReceived &&
                    <ReplyButton
                      redirectToEmailer={this.redirectToEmailer}
                      email={emails[key][emails[key].length - 1]}
                    />
                }
              </div>
            </div>
          </li>
        )) :
        <li key={emails[key][0].id} className="timeline-inverted history">
          <div className="timeline-badge warning"><i className={'glyphicon glyphicon-envelope'} /></div>
          <div className="timeline-panel">
            <div className="email_section">
              <div
                className={this.state[emails[key][0].conversationId] ? '' : 'email_thread'}
                id={`${emails[key][0].conversationId}_thread_section`}
              >
                {
                  emails[key].map((email, index) => (
                    <div key={email.id}>
                      {
                        index === 0 ?
                          <EmailCard
                            email={email}
                            renderEmailAddressInfo={this.renderEmailAddressInfo}
                            isThreadView
                            threadLength={emails[key].length}
                            attachmentFiles={this.attachmentFiles}
                            renderAddresses={this.renderAddresses}
                          />
                          :
                          <EmailThread
                            email={email}
                            renderAddresses={this.renderAddresses}
                            index={index}
                            lastIndex={emails[key].length - 1}
                            attachmentFiles={this.attachmentFiles}
                          />
                      }
                    </div>
                  ))
                }
              </div>
              <button
                className="thread_btn expand_collapse_btn m-b-5"
                id={`${emails[key][0].conversationId}-btn`}
                onClick={evt => {
                  this.expandOrCollapseThread(evt, emails[key][0].conversationId);
                }}
              >
                {
                  this.state[emails[key][0].conversationId] ? <Trans>COLLAPSE_THREAD</Trans> : <span>
                    <Trans>VIEW_THREAD</Trans>({emails[key].length})
                  </span>
                }
              </button>
              {
                emails[key][emails[key].length - 1].isReceived &&
                  <ReplyButton
                    redirectToEmailer={this.redirectToEmailer}
                    email={emails[key][emails[key].length - 1]}
                  />
              }
            </div>
          </div>
        </li>
    ));
  render() {
    const { emails } = this.props;
    return (
      <div className="email_list col-sm-12-col-md-12 col-lg-12">
        <ul className="timeline">
          {
            this.renderMails(emails)
          }
        </ul>
      </div>
    );
  }
}
