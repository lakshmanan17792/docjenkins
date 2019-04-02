import React from 'react';

export default () => {
  const year = new Date().getUTCFullYear();
  return (
    <div className="footer">
      <div>
        <strong>Copyright</strong>&nbsp;
        Intelligent Talent Acquisition &copy; {year}
      </div>
    </div>
  );
};
