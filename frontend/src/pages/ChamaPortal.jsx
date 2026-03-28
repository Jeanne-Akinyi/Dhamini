import React, { useState } from 'react';

const ChamaPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const groups = [
    { id: 1, name: "Mwimuto Women Chama", members: 15, contributions: "KES 150,000", loans: "KES 50,000" },
    { id: 2, name: "Kariobangi Investment", members: 20, contributions: "KES 200,000", loans: "KES 100,000" },
    { id: 3, name: "Eldoret Professionals", members: 12, contributions: "KES 90,000", loans: "KES 30,000" }
  ];

  const stats = [
    { label: "Total Groups", value: "156", change: "+12", color: "bg-blue-50" },
    { label: "Total Members", value: "2,450", change: "+156", color: "bg-green-50" },
    { label: "Total Savings", value: "KES 4.2M", change: "+18%", color: "bg-orange-50" },
    { label: "Active Loans", value: "KES 1.8M", change: "+5%", color: "bg-purple-50" }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Chama Portal</h1>
        
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

        {/* Groups List */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Your Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
              <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Members:</span><span>{group.members}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total Contributions:</span><span>{group.contributions}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Active Loans:</span><span>{group.loans}</span></div>
                </div>
                <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg text-sm">View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChamaPortal;