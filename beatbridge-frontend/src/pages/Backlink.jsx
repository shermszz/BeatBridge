import React from 'react';

const Backlink = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
    <h1>API Credits</h1>
    <p>
      This project uses BPM data provided by{' '}
      <a
        href="https://getsongbpm.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#4fc3f7', textDecoration: 'underline' }}
      >
        getSongBPM.com
      </a>
      .
    </p>
  </div>
);

export default Backlink; 