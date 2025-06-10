import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Workouts from './pages/Workouts.tsx';
import Nutrition from './pages/Nutrition.tsx';
import Clients from './pages/Clients.tsx';
import Reports from './pages/Reports.tsx';

// Импорт клиентских страниц
import Profile from './pages/ClientWebApp/Profile.tsx';
import Avatar from './pages/ClientWebApp/Avatar.tsx';
import Plan from './pages/ClientWebApp/Plan.tsx';
import Progress from './pages/ClientWebApp/Progress.tsx';
import Leaders from './pages/ClientWebApp/Leaders.tsx';
import ShopStub from './pages/ClientWebApp/ShopStub.tsx';
import ChallengesStub from './pages/ClientWebApp/ChallengesStub.tsx';
import AdsStub from './pages/ClientWebApp/AdsStub.tsx';
import WebAppMenu from './pages/ClientWebApp/WebAppMenu.tsx';

// Проверка Telegram WebApp
const isTelegram = () => {
  // @ts-ignore
  return typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;
};

const TelegramGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isTelegram()) {
    return <div style={{ color: 'red', padding: 20 }}>Доступно только из Telegram WebApp</div>;
  }
  return <>{children}</>;
};

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/workouts" element={<Workouts />} />
      <Route path="/nutrition" element={<Nutrition />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/reports" element={<Reports />} />

      {/* Клиентский WebApp для Telegram */}
      <Route path="/webapp" element={<TelegramGuard><><WebAppMenu /><Profile /></></TelegramGuard>} />
      <Route path="/webapp/avatar" element={<TelegramGuard><><WebAppMenu /><Avatar /></></TelegramGuard>} />
      <Route path="/webapp/plan" element={<TelegramGuard><><WebAppMenu /><Plan /></></TelegramGuard>} />
      <Route path="/webapp/progress" element={<TelegramGuard><><WebAppMenu /><Progress /></></TelegramGuard>} />
      <Route path="/webapp/leaders" element={<TelegramGuard><><WebAppMenu /><Leaders /></></TelegramGuard>} />
      <Route path="/webapp/shop" element={<TelegramGuard><><WebAppMenu /><ShopStub /></></TelegramGuard>} />
      <Route path="/webapp/challenges" element={<TelegramGuard><><WebAppMenu /><ChallengesStub /></></TelegramGuard>} />
      <Route path="/webapp/ads" element={<TelegramGuard><><WebAppMenu /><AdsStub /></></TelegramGuard>} />
    </Routes>
  </Router>
);

export default AppRouter;
