import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import Signup from '../pages/Signup.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;