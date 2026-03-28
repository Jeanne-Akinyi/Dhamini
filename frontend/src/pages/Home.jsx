import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: "🛡️",
      title: "Consent-Based Mandates",
      description: "Borrowers sign legally-binding digital mandates for automated repayments"
    },
    {
      icon: "📈",
      title: "AI Credit Scoring",
      description: "Live Dhamini Credit Score built from actual repayment behaviour"
    },
    {
      icon: "👥",
      title: "Universal KYC",
      description: "One identity verification works across all institution types"
    },
    {
      icon: "📱",
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
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your loan management?</h2>
          <p className="text-gray-600 mb-8">Join hundreds of financial institutions using Dhamini.</p>
          <Link to="/register" className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold inline-block">
            Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;