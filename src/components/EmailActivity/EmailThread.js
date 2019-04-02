import React, { Component } from 'react';
import moment from 'moment';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

class EmailThread extends Component {
  static propTypes = {
    email: PropTypes.any.isRequired,
    index: PropTypes.any.isRequired,
    lastIndex: PropTypes.any.isRequired,
    renderAddresses: PropTypes.any.isRequired,
    attachmentFiles: PropTypes.any.isRequired,
  }

  constructor(props) {
    super(props);
    const { index, lastIndex } = props;
    this.state = {
      expanded: index === lastIndex
    };
  }

  expandOrCollapseConversation = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { email, renderAddresses, attachmentFiles } = this.props;
    const { expanded } = this.state;
    return (
      <div className="email_card m-b-10 m-t-10">
        <div className="email_intro">
          <div className="email_info p-b-10">
            <table>
              <tbody>
                <tr>
                  <td colSpan="2" className="thread_info">
                    <span className="p-r-5 text-right">From:</span>
                  </td>
                  <td>
                    {email.from.email}({email.from.name})
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="thread_info">
                    <span className="p-r-5 text-right">To:</span>
                  </td>
                  <td>
                    {renderAddresses(email.to)}
                  </td>
                </tr>
                {
                  email.ccList.length > 0 &&
                  <tr>
                    <td colSpan="2" className="thread_info">
                      <span className="p-r-5 text-right">Cc:</span>
                    </td>
                    <td>
                      {renderAddresses(email.ccList)}
                    </td>
                  </tr>
                }
                {
                  email.bccList.length > 0 &&
                  <tr>
                    <td colSpan="2" className="thread_info">
                      <span className="p-r-5 text-right">Bcc:</span>
                    </td>
                    <td>
                      {renderAddresses(email.bccList)}
                    </td>
                  </tr>
                }
                <tr>
                  <td colSpan="2" className="thread_info">
                    <span className="p-r-5 text-right">Date:</span>
                  </td>
                  <td>
                    {moment(email.deliveryDate).format('llll')}
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="thread_info">
                    <span className="p-r-5 text-right">Subject:</span>
                  </td>
                  <td>
                    {email.subject}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            className={expanded ? '' : 'mail-content'}
            id={email.messageId}
          >
            {
              email.body.indexOf('<body>') > -1 ?
                Parser(email.body.split('<body>')[1].split('</body>')[0])
                : Parser(email.body)
            }
          </div>
          <div className="attachment_container">
            {
              email.attachments && email.attachments.map(file => attachmentFiles(file))
            }
          </div>
          {/* <div className="fade_effect" /> */}
        </div>
        <button
          className="expand_collapse_btn m-b-20 m-t-20"
          onClick={this.expandOrCollapseConversation}
          id={`${email.messageId}-btn`}
        > {
            expanded ? <Trans>COLLAPSE</Trans> : <Trans>EXPAND</Trans>
          }
        </button>
      </div>
    );
  }
}

export default EmailThread;
