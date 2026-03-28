import React, { useState } from 'react';

const LenderPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const loans = [
    { id: 1, borrower: "John Doe", amount: 100000, status: "Active", dueDate: "2024-04-15", repayments: 5, totalRepayments: 12 },
    { id: 2, borrower: "Jane Smith", amount: 50000, status: "Active", dueDate: "2024-05-01", repayments: 3, totalRepayments: 6 },
    { id: 3, borrower: "Peter Kamau", amount: 200000, status: "Delinquent", dueDate: "2024-03-01", repayments: 8, totalRepayments: 12 }
  ];

  const stats = [
    { label: "Total Loan Portfolio", value: "KES 3.2M", change: "+15%", color: "bg-blue-50" },
    { label: "Active Loans", value: "156", change: "+12", color: "bg-green-50" },
    { label: "Repayment Rate", value: "94%", change: "+5%", color: "bg-orange-50" },
    { label: "Default Rate", value: "6%", change: "-2%", color: "bg-purple-50" }
  ];

  const tabs = ['dashboard', 'loans', 'borrowers', 'analytics'];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className={`${stat.color} p-6 rounded-xl`}>
                  <div className="flex justify-between mb-2">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <span className="text-green-600 text-sm">{stat.change}</span>
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Loans */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Loans</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="p-3">Borrower</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map(loan => (
                      <tr key={loan.id} className="border-t">
                        <td className="p-3 font-medium">{loan.borrower}</td>
                        <td className="p-3">KES {loan.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            loan.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="p-3">{loan.dueDate}</td>
                        <td className="p-3">
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{loan.repayments}/{loan.totalRepayments}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${(loan.repayments/loan.totalRepayments)*100}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'loans':
        return (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">All Loans</h2>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3">Loan ID</th>
                  <th className="p-3">Borrower</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Interest</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id} className="border-t">
                    <td className="p-3">#LN{loan.id}</td>
                    <td className="p-3">{loan.borrower}</td>
                    <td className="p-3">KES {loan.amount.toLocaleString()}</td>
                    <td className="p-3">12%</td>
                    <td className="p-3">{loan.status}</td>
                    <td className="p-3"><button className="text-primary-600">View →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div className="bg-white rounded-xl p-6">Content coming soon</div>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Lender Portal</h1>
        
        <div className="flex gap-2 border-b mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default LenderPortal;