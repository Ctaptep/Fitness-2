import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/LoginPage';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Reports from './pages/Reports';
import Clients from './pages/Clients';

function App() {
  // TODO: заменить на реальную авторизацию
  const isLoggedIn = true;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {isLoggedIn ? (
          <Route element={<MainLayout>}>
            <Route path="/" element={<Navigate to="/workouts" replace />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/clients" element={<Clients />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
