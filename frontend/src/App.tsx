// src/App.tsx
import React, { useState } from 'react';
import RoleSelectPage from './components/RoleSelectPage';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import { Role } from './types/types';
import { useAuth } from './context/AuthContext';

function App() {
  const [role, setRole] = useState<Role | null>(null);
  const { user, loading, logout } = useAuth();

  const handleSelectRole = (selectedRole: Role) => {
    setRole(selectedRole);
  };

  const handleBack = () => {
    setRole(null);
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show role selection page if not logged in
  if (!user && !role) {
    return <RoleSelectPage onSelectRole={handleSelectRole} />;
  }

  // Show login page if role is selected but user is not logged in
  if (!user && role) {
    return <Login role={role} onBack={handleBack} />;
  }

  // Show dashboard based on role after login
  if (user && user.role === 'student') {
    return <StudentDashboard onLogout={handleBack} />;
  }

  if (user && user.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.name}!</p>
          <p className="text-sm text-gray-500 mt-2">{user.email}</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;