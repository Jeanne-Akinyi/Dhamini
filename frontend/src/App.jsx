import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import BorrowerPortal from './pages/BorrowerPortal';
import LenderPortal from './pages/LenderPortal';
import SaccoPortal from './pages/SaccoPortal';
import ChamaPortal from './pages/ChamaPortal';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import KYCFlow from './components/auth/KYCFlow';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="kyc" element={<KYCFlow />} />
            <Route path="borrower" element={<BorrowerPortal />} />
            <Route path="lender" element={<LenderPortal />} />
            <Route path="sacco" element={<SaccoPortal />} />
            <Route path="chama" element={<ChamaPortal />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;