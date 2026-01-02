import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VerifyRiders from './pages/VerifyRiders';
import UsersList from './pages/UsersList'; 
import RidesList from './pages/RidesList'; 

function App() {
  const { admin } = useAuth();

  return (
    <Router>
      <div className="flex min-h-screen bg-bgBeige font-inter">
        {admin && <Sidebar />}

        <div className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/login" element={!admin ? <Login /> : <Navigate to="/dashboard" />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={admin ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/verify-riders" element={admin ? <VerifyRiders /> : <Navigate to="/login" />} />
            <Route path="/users" element={admin ? <UsersList /> : <Navigate to="/login" />} />
            <Route path="/rides" element={admin ? <RidesList /> : <Navigate to="/login" />} />

            {/* Global Redirect */}
            <Route path="*" element={<Navigate to={admin ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;