import React, { useState } from 'react';

const SaccoPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const members = [
    { id: 1, name: "John Mwangi", contributions: "KES 50,000", loans: "KES 100,000", status: "Active" },
    { id: 2, name: "Mary Wanjiku", contributions: "KES 75,000", loans: "KES 50,000", status: "Active" },
    { id: 3, name: "Peter Omondi", contributions: "KES 25,000", loans: "KES 0", status: "Active" }
  ];

  const stats = [
    { label: "Total Members", value: "1,245", change: "+45", color: "bg-blue-50" },
    { label: "Total Savings", value: "KES 12.5M", change: "+8%", color: "bg-green-50" },
    { label: "Loan Portfolio", value: "KES 8.2M", change: "+12%", color: "bg-orange-50" },
    { label: "Repayment Rate", value: "96%", change: "+3%", color: "bg-purple-50" }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">SACCO Portal</h1>
        
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

        {/* Members List */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Contributions</th>
                  <th className="p-3">Active Loans</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} className="border-t">
                    <td className="p-3 font-medium">{member.name}</td>
                    <td className="p-3">{member.contributions}</td>
                    <td className="p-3">{member.loans}</td>
                    <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">{member.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaccoPortal;