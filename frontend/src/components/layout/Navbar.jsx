import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Dhamini</span>
              <span className="text-xs text-gray-500 hidden sm:inline">— Guarantee</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition">Home</Link>
            <Link to="/borrower" className="text-gray-700 hover:text-primary-600 transition">Borrowers</Link>
            <Link to="/lender" className="text-gray-700 hover:text-primary-600 transition">Lenders</Link>
            <Link to="/sacco" className="text-gray-700 hover:text-primary-600 transition">SACCOs</Link>
            <Link to="/chama" className="text-gray-700 hover:text-primary-600 transition">Chamas</Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-500" />
                  <span className="text-gray-700">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-primary-600">Login</Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 py-2">Home</Link>
              <Link to="/borrower" className="text-gray-700 py-2">Borrowers</Link>
              <Link to="/lender" className="text-gray-700 py-2">Lenders</Link>
              <Link to="/sacco" className="text-gray-700 py-2">SACCOs</Link>
              <Link to="/chama" className="text-gray-700 py-2">Chamas</Link>
              
              {user ? (
                <>
                  <div className="flex items-center space-x-2 py-2">
                    <FaUser className="text-gray-500" />
                    <span>{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-red-600 text-left py-2">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 py-2">Login</Link>
                  <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-center">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;