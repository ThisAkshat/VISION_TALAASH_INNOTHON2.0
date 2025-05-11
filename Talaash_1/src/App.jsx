import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/authContext';
import HomePage from './home';
import RegistrationForm from './registration';
import AuthForm from './components/authForm';
import ProtectedRoute from './components/protectedRoute';
import Cases from './cases';
import Location from './location'
import SurveillanceApp from './surveillance';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/register" element={<RegistrationForm />} />
         <Route path="/cases" element={<Cases />} />
         <Route path="/location" element={<Location/>} />
          <Route path="/surveillance" element={<SurveillanceApp/>} />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute>
                <RegistrationForm />
              </ProtectedRoute>
            } 
          />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;