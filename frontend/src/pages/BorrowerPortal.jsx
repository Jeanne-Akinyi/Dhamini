import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BorrowerPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const stats = [
    { label: "Total Borrowed", value: "KES 245,000", change: "+12%", color: "bg-blue-50" },
    { label: "Active Loans", value: "2", change: "", color: "bg-green-50" },
    { label: "Credit Score", value: "742", change: "+23", color: "bg-orange-50" },
    { label: "On-Time Payments", value: "94%", change: "+5%", color: "bg-purple-50" }
  ];

  const activeLoans = [
    { id: 1, name: "Emergency Loan", lender: "KCB Bank", amount: 100000, remaining: 65000, nextPayment: "2024-03-30", nextAmount: 5000, progress: 35 },
    { id: 2, name: "School Fees Loan", lender: "Kimisitu SACCO", amount: 50000, remaining: 25000, nextPayment: "2024-04-15", nextAmount: 4500, progress: 50 }
  ];

  const recentTransactions = [
    { id: 1, date: '2024-03-15', amount: 5000, status: 'success', description: 'Loan Repayment' },
    { id: 2, date: '2024-03-01', amount: 5000, status: 'success', description: 'Loan Repayment' },
    { id: 3, date: '2024-02-28', amount: 4500, status: 'success', description: 'Loan Repayment' }
  ];

  const tabs = ['dashboard', 'loans', 'repayments', 'credit', 'apply'];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 mb-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Guest'}! 👋</h2>
              <p>Your financial health is improving. Keep up the great work!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className={`${stat.color} p-6 rounded-xl`}>
                  <div className="flex justify-between mb-2">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    {stat.change && <span className="text-green-600 text-sm">+{stat.change}</span>}
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Active Loans and Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Active Loans</h2>
                {activeLoans.map(loan => (
                  <div key={loan.id} className="border rounded-lg p-4 mb-3">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{loan.name}</h3>
                        <p className="text-sm text-gray-500">{loan.lender}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div><p className="text-gray-500">Remaining</p><p className="font-semibold">KES {loan.remaining.toLocaleString()}</p></div>
                      <div><p className="text-gray-500">Next Payment</p><p className="font-semibold">{loan.nextPayment}</p></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${loan.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
                {recentTransactions.map(tx => (
                  <div key={tx.id} className="flex justify-between border-b pb-3 mb-3">
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-gray-500">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">KES {tx.amount.toLocaleString()}</p>
                      <span className="text-green-600 text-sm">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'loans':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Loans</h2>
              <button onClick={() => setActiveTab('apply')} className="bg-primary-600 text-white px-4 py-2 rounded-lg">
                Apply for Loan
              </button>
            </div>
            {activeLoans.map(loan => (
              <div key={loan.id} className="bg-white rounded-xl p-6 mb-4">
                <div className="flex justify-between mb-4">
                  <div><h3 className="font-semibold text-lg">{loan.name}</h3><p className="text-gray-500">{loan.lender}</p></div>
                  <div className="text-right"><p className="text-sm text-gray-500">Interest Rate</p><p className="font-semibold">12% p.a.</p></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div><p className="text-gray-500">Principal</p><p className="font-semibold">KES {loan.amount.toLocaleString()}</p></div>
                  <div><p className="text-gray-500">Remaining</p><p className="font-semibold text-primary-600">KES {loan.remaining.toLocaleString()}</p></div>
                  <div><p className="text-gray-500">Next Payment</p><p className="font-semibold">{loan.nextPayment}</p></div>
                  <div><p className="text-gray-500">Amount</p><p className="font-semibold">KES {loan.nextAmount.toLocaleString()}</p></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${loan.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'repayments':
        return (
          <div>
            <h2 className="text-xl font-bold mb-6">Repayment History</h2>
            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="p-4">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx.id} className="border-t">
                      <td className="p-4">{tx.date}</td>
                      <td className="p-4">{tx.description}</td>
                      <td className="p-4 font-semibold">KES {tx.amount.toLocaleString()}</td>
                      <td className="p-4"><span className="text-green-600">{tx.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'credit':
        return (
          <div>
            <h2 className="text-xl font-bold mb-6">Your Credit Score</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white text-center">
                <div className="text-6xl font-bold mb-2">742</div>
                <div className="text-xl mb-2">AA · Very Good</div>
                <p>↑ 23 points from last month</p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold mb-4">What affects your score</h3>
                <div className="space-y-3">
                  <div><div className="flex justify-between"><span>Repayment Consistency</span><span>85%</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-primary-600 h-2 rounded-full w-[85%]"></div></div></div>
                  <div><div className="flex justify-between"><span>History Depth</span><span>72%</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-primary-600 h-2 rounded-full w-[72%]"></div></div></div>
                  <div><div className="flex justify-between"><span>Credit Utilisation</span><span>68%</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-primary-600 h-2 rounded-full w-[68%]"></div></div></div>
                  <div><div className="flex justify-between"><span>Income Stability</span><span>78%</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-primary-600 h-2 rounded-full w-[78%]"></div></div></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'apply':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Apply for a Loan</h2>
            <div className="bg-white rounded-xl p-6">
              <form>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Loan Amount (KES)</label>
                  <input type="number" className="w-full px-4 py-2 border rounded-lg" placeholder="Enter amount" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Loan Term (Months)</label>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>12 months</option>
                  </select>
                </div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Loan Summary</h3>
                  <div className="flex justify-between"><span>Principal:</span><span>KES 0</span></div>
                  <div className="flex justify-between"><span>Interest (12%):</span><span>KES 0</span></div>
                  <div className="flex justify-between font-bold mt-2"><span>Total Repayment:</span><span>KES 0</span></div>
                </div>
                <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold">Submit Application</button>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Borrower Portal</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default BorrowerPortal;