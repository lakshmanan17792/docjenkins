import React, { Component } from 'react';
import moment from 'moment';
import Parser from 'html-react-parser';
import { Trans } from 'react-i18next';
import PropTypes from 'prop-types';

class EmailCard extends Component {
  static propTypes = {
    email: PropTypes.any.isRequired,
    renderEmailAddressInfo: PropTypes.any.isRequired,
    attachmentFiles: PropTypes.any.isRequired,
    action: PropTypes.any,
    jobTitle: PropTypes.any,
    renderAddresses: PropTypes.any.isRequired
  }

  static defaultProps = {
    action: '',
    jobTitle: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  getFormattedImages = body => {
    const bodyElem = document.createElement('div');
    bodyElem.innerHTML = body;
    const imgElems = bodyElem.getElementsByTagName('img');
    let index = 0;
    while (index < imgElems.length) {
      imgElems[index].parentElement.style.display = 'block';
      index += 1;
    }
    return bodyElem.innerHTML;
  }

  expandOrCollapseConversation = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { email, renderEmailAddressInfo,
      attachmentFiles, action, jobTitle, renderAddresses } = this.props;
    const { expanded } = this.state;
    const body = email.body;
    return (
      <div className="email_card m-b-5">
        <div className="email_intro">
          <div className="email_delivery_info">
            <span className="name_logo m-r-10">
              { email.from.name.charAt(0).toUpperCase() }
            </span>
            <span className="to_date">
              {renderEmailAddressInfo(email.from, email.to, action, jobTitle)}
              <div className="email_time">
                {moment(email.deliveryDate).format('llll')}
              </div>
            </span>
          </div>
          {
            expanded &&
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
          }
          {
            !expanded ?
              <div className="email_subject p-t-20 p-b-15">
                {email.subject}
              </div> : ''
          }
          <div
            className={expanded ? '' : 'mail-content'}
            id={email.messageId}
            style={{ overflowX: 'auto', marginBottom: '20px' }}
          >
            {
              body.indexOf('<body>') > -1 ?
                Parser(body.split('<body>')[1].split('</body>')[0])
                : Parser(this.getFormattedImages(body))
            }
            <div className="attachment_container">
              {
                email.attachments && email.attachments.map(file => attachmentFiles(file))
              }
            </div>
          </div>
          {/* <div className="fade_effect" /> */}
        </div>
        <div>
          <button
            className="expand_collapse_btn m-b-20 m-t-20"
            onClick={this.expandOrCollapseConversation}
            id={`${email.messageId}-btn`}
          >
            {
              expanded ? <Trans>COLLAPSE</Trans> : <Trans>EXPAND</Trans>
            }
          </button>
        </div>
      </div>
    );
  }
}

export default EmailCard;
