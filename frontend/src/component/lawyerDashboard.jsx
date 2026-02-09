import React from "react";

const LawyerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold text-green-500 mb-6">
        Lawyer Dashboard
      </h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <p className="text-xl">
          Welcome Lawyer!  
        </p>

        <p className="mt-2 text-gray-400">
          Here you will manage land registration cases, verify documents,
          chat with land buyers/sellers, and access lawyer-only tools.
        </p>
      </div>
    </div>
  );
};

export default LawyerDashboard;
