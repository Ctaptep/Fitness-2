import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/LoginPage';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Reports from './pages/Reports';
import Clients from './pages/Clients';
import ProtectedRoute from './components/ProtectedRoute';
import ClientWebApp from './pages/ClientWebApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/webapp/*" element={<ClientWebApp />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/workouts" replace />} />
          <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
