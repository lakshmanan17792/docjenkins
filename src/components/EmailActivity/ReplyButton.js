import React from 'react';
import { Trans } from 'react-i18next';

const ReplyButton = properties => {
  const { email, redirectToEmailer } = properties;
  return (
    <div className="reply_btn_section">
      <button
        className="expand_collapse_btn reply_btn"
        onClick={evt => {
          redirectToEmailer(evt, email.from, email.bccList, email.ccList,
            email.messageId, email.subject);
        }}
      >
        <i className="fa fa-reply p-r-5" aria-hidden="true" />
        <Trans>REPLY</Trans>
      </button>
      {/* <span />
      <button className="expand_collapse_btn reply_btn">
        <i className="fa fa-reply-all p-r-5" aria-hidden="true" />
        Reply All
      </button> */}
    </div>
  );
};

export default ReplyButton;
