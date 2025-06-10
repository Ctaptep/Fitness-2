import React from 'react';

const Progress: React.FC = () => (
  <div>
    <h2>Прогресс</h2>
    <div style={{ width: '100%', background: '#eee', borderRadius: 10, margin: '20px 0' }}>
      <div style={{ width: '40%', background: '#4caf50', height: 24, borderRadius: 10 }} />
    </div>
    <p>40% выполнено</p>
  </div>
);

export default Progress;
