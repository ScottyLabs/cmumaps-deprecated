import React from 'react';

import CollapsibleWrapper from '../common/CollapsibleWrapper';

const Schedule = () => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = (e) => {
        console.log(e.target.result);
      };
    }
  };

  return (
    <CollapsibleWrapper title="Schedule">
      <div className="space-y-2 px-5 pb-2">
        <p>
          First step: download{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://s3.andrew.cmu.edu/sio/mpa/secure/export/schedule/F24_schedule.ics"
          >
            Calendar Export
          </a>{' '}
          from SIO
        </p>
        <p>
          Second step: Import the .ics file here:
          <input
            type="file"
            id="fileInput"
            accept=".ics"
            onChange={handleFileChange}
          />
        </p>
      </div>
    </CollapsibleWrapper>
  );
};

export default Schedule;
