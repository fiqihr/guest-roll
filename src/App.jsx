import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import CameraApp from './pages/CameraApp';
import ThankYou from './pages/ThankYou';
import { useAppContext } from './context/AppContext';

function ProtectedRoute({ children }) {
  const { guestName, remainingShots } = useAppContext();
  
  if (!guestName) {
    return <Navigate to="/" replace />;
  }
  
  if (remainingShots <= 0) {
    return <Navigate to="/thank-you" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-cream font-sans text-dark selection:bg-gold/30">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route 
            path="/camera" 
            element={
              <ProtectedRoute>
                <CameraApp />
              </ProtectedRoute>
            } 
          />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
