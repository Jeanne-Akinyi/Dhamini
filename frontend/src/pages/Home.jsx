import React from 'react';
import { Link } from 'react-router-dom';

const ShieldIcon = () => (
  <svg className="w-12 h-12 text-primary-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-12 h-12 text-primary-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-12 h-12 text-primary-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BlockchainIcon = () => (
  <svg className="w-12 h-12 text-primary-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const Home = () => {
  const features = [
    {
      icon: ShieldIcon,
      title: "Consent-Based Mandates",
      description: "Borrowers sign legally-binding digital mandates for automated repayments"
    },
    {
      icon: ChartIcon,
      title: "AI Credit Scoring",
      description: "Live Dhamini Credit Score built from actual repayment behaviour"
    },
    {
      icon: UsersIcon,
      title: "Universal KYC",
      description: "One identity verification works across all institution types"
    },
    {
      icon: BlockchainIcon,
      title: "Blockchain Audit Trail",
      description: "Immutable, verifiable records of every mandate and repayment"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Guaranteed Repayments.
            <br />
            Trusted Credit.
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Automated loan repayment and credit intelligence middleware for Kenya's financial market.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold">
              Get Started
            </Link>
            <Link to="/borrower" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-3xl font-bold text-primary-600">250K+</div><div>Active Borrowers</div></div>
            <div><div className="text-3xl font-bold text-primary-600">25+</div><div>Lender Integrations</div></div>
            <div><div className="text-3xl font-bold text-success">8%</div><div>Default Rate</div></div>
            <div><div className="text-3xl font-bold text-primary-600">30M+</div><div>Monthly Revenue (KES)</div></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Four Pillars of Dhamini</h2>
            <p className="text-gray-600">Complete infrastructure for automated loan management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition border border-gray-100">
                <feature.icon />
                <h3 className="text-xl font-semibold mb-2 mt-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600">Simple, secure, and automated loan management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Apply & Verify</h3>
              <p className="text-gray-600">Complete one-time KYC verification that works across all participating institutions</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Digital Mandate</h3>
              <p className="text-gray-600">Authorize automatic repayments through a legally-binding digital mandate</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Funded & Repay</h3>
              <p className="text-gray-600">Receive your loan and let Dhamini handle automatic repayments on schedule</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your loan management?</h2>
          <p className="text-primary-100 mb-8">Join hundreds of financial institutions using Dhamini.</p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold inline-block hover:bg-gray-100 transition">
            Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
