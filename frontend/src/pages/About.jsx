import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Dhamini
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Transforming Kenya's financial landscape through consent-based automated loan repayments and intelligent credit scoring
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-4">
                Dhamini exists to democratize credit access while ensuring fair, transparent, and sustainable lending practices across Kenya and East Africa.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                We bridge the gap between borrowers and lenders through technology that automates repayments, provides real-time credit scoring, and builds trust through immutable blockchain records.
              </p>
              <p className="text-lg text-gray-700">
                Our platform reduces default rates for lenders while giving borrowers the tools they need to build strong credit histories and access better financial products.
              </p>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">8%</div>
                  <div className="text-gray-600">Default Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">35%</div>
                  <div className="text-gray-600">Lower Than Industry</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">250K+</div>
                  <div className="text-gray-600">Active Borrowers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">25+</div>
                  <div className="text-gray-600">Lender Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">The Problem We Solve</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Kenya's lending market faces significant challenges that limit access to credit and increase risk for lenders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">High Default Rates</h3>
              <p className="text-gray-600">
                Traditional lending sees default rates of 35-40% due to manual collection processes and lack of automated repayment infrastructure.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Limited Credit Data</h3>
              <p className="text-gray-600">
                Credit decisions rely on fragmented data, making it difficult for lenders to assess borrower risk accurately and offer competitive rates.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">📉</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Manual Processes</h3>
              <p className="text-gray-600">
                Repayments are collected manually, leading to inefficiencies, errors, and poor borrower experience across the lending ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Solution</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Dhamini provides a comprehensive platform that addresses each challenge with innovative technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-8 rounded-xl">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Consent-Based Mandates</h3>
              <p className="text-gray-700 mb-4">
                Borrowers sign legally-binding digital mandates authorizing automatic repayments from M-Pesa, bank accounts, or SACCO payroll. This ensures predictable collections and reduces manual follow-up.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ OTP-verified consent</li>
                <li>✓ Digital signatures</li>
                <li>✓ Flexible payment methods</li>
                <li>✓ Easy revocation rights</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered Credit Scoring (DCS)</h3>
              <p className="text-gray-700 mb-4">
                The Dhamini Credit Score analyzes real repayment behavior across all lending platforms to provide accurate, fair credit assessments that update continuously.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Multi-platform data aggregation</li>
                <li>✓ 300-1000 scoring range</li>
                <li>✓ Risk tier classification</li>
                <li>✓ Fair and transparent algorithms</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Universal KYC & Integration</h3>
              <p className="text-gray-700 mb-4">
                One identity verification works across banks, SACCOs, chamas, and digital lenders. We integrate with IPRS and KRA for reliable identity verification.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Tier 1-4 KYC standards</li>
                <li>✓ IPRS integration</li>
                <li>✓ KRA PIN verification</li>
                <li>✓ Cross-platform recognition</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-xl">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Blockchain Audit Trail</h3>
              <p className="text-gray-700 mb-4">
                Every mandate, repayment, and credit score change is recorded on Hyperledger Fabric, creating an immutable, verifiable record that builds trust between all parties.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Immutable transaction records</li>
                <li>✓ Real-time verification</li>
                <li>✓ Dispute resolution support</li>
                <li>✓ Regulatory compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Dhamini Works</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Simple, secure, and transparent processes for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Register & Verify</h3>
              <p className="text-gray-300">
                Borrowers register with phone number, complete KYC verification via IPRS/KRA integration, and receive their initial DCS score.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Apply & Sign Mandate</h3>
              <p className="text-gray-300">
                Apply for loans from integrated lenders and sign automated repayment mandates with your preferred payment method (M-Pesa, bank, SACCO).
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Auto-Repay & Build Credit</h3>
              <p className="text-gray-300">
                Repayments are automated and recorded on blockchain. Your DCS score improves with every successful payment, unlocking better rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Lenders Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">For Lenders</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Partner with Dhamini to expand your reach while reducing risk
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2 text-gray-900">Alternative Credit Data</h3>
              <p className="text-gray-600 text-sm">Access repayment history across institutions for better risk assessment</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold mb-2 text-gray-900">Automated Collections</h3>
              <p className="text-gray-600 text-sm">Reduce manual effort with mandate-based repayment automation</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl mb-3">📉</div>
              <h3 className="font-semibold mb-2 text-gray-900">Lower Default Rates</h3>
              <p className="text-gray-600 text-sm">See 35% reduction in defaults with our collection system</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-semibold mb-2 text-gray-900">Regulatory Compliance</h3>
              <p className="text-gray-600 text-sm">Built-in compliance with CBK data protection regulations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Built on Modern Technology</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Leveraging cutting-edge technologies for security, scalability, and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Hyperledger Fabric</h3>
              <p className="text-gray-600">
                Enterprise-grade blockchain technology ensures immutable records and prevents tampering of financial data.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI & Machine Learning</h3>
              <p className="text-gray-600">
                Advanced algorithms analyze repayment patterns to generate accurate credit scores and risk predictions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Supabase Infrastructure</h3>
              <p className="text-gray-600">
                Secure, scalable database with built-in authentication and real-time capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to Join the Future of Lending?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're a borrower looking for fair credit or a lender seeking reduced risk, Dhamini has the solution for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/register" className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
              Get Started as Borrower
            </a>
            <a href="/lender" className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition">
              Partner as Lender
            </a>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-300 mb-2">📍 Nairobi, Kenya</p>
              <p className="text-gray-300 mb-2">📧 info@dhamini.co.ke</p>
              <p className="text-gray-300">📱 +254 700 000 000</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/borrower" className="hover:text-white">Borrower Portal</a></li>
                <li><a href="/lender" className="hover:text-white">Lender Portal</a></li>
                <li><a href="/register" className="hover:text-white">Register</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://github.com/dhamini" className="hover:text-white">GitHub</a></li>
                <li><a href="/api" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Dhamini. All rights reserved. Built for Kenya's financial future.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;