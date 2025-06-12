import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WebAppMenu from './WebAppMenu';
import Profile from './Profile';
import Avatar from './Avatar';
import Plan from './Plan';
import Progress from './Progress';
import Leaders from './Leaders';
import ShopStub from './ShopStub';
import ChallengesStub from './ChallengesStub';
import AdsStub from './AdsStub';

const ClientWebApp: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9f9f9' }}>
      <WebAppMenu />
      <div style={{ flex: 1, padding: 24 }}>
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="avatar" element={<Avatar />} />
          <Route path="plan" element={<Plan />} />
          <Route path="progress" element={<Progress />} />
          <Route path="leaders" element={<Leaders />} />
          <Route path="shop" element={<ShopStub />} />
          <Route path="challenges" element={<ChallengesStub />} />
          <Route path="ads" element={<AdsStub />} />
          <Route path="*" element={<Navigate to="/webapp" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default ClientWebApp;
