import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Dhamini</h3>
            <p className="text-gray-400 text-sm">
              Automated loan repayment and credit intelligence middleware for Kenya's financial market.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Borrower Portal</li>
              <li>Lender Dashboard</li>
              <li>SACCO Platform</li>
              <li>Chama Management</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Support</li>
              <li>Status</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <FaGithub className="text-gray-400 hover:text-white cursor-pointer" />
              <FaTwitter className="text-gray-400 hover:text-white cursor-pointer" />
              <FaLinkedin className="text-gray-400 hover:text-white cursor-pointer" />
              <FaEnvelope className="text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Dhamini — Guaranteed Repayments. Trusted Credit. Connected Institutions.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;