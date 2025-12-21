import React from 'react';
import ClaimCard from '../../components/dashboard/ClaimCard';
import ClaimSummaryTable from '../../components/dashboard/ClaimTable';
import ClaimPieChart from '../../components/dashboard/ClaimPieChart';
import useFetch from '../../hooks/useFetch';

const Dashboard = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Hooks (Data fetching stays exactly the same)
  const { data } = useFetch(`${apiUrl}/api/totalclaimscount`);
  const { data: staffCounts } = useFetch(`${apiUrl}/api/staffcount`);
  const { data: creditedCounts } = useFetch(`${apiUrl}/api/creditedclaims`);
  const { data: pendingCounts } = useFetch(`${apiUrl}/api/pendingclaims`);
  const { data: awaitingCounts } = useFetch(`${apiUrl}/api/awaitingclaims`);
  const { data: claimIE } = useFetch(`${apiUrl}/api/internalexternalclaims`);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
      {/* 1. Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="mb-10 border-l-4 border-blue-600 pl-6">
          <h1 className="text-4xl font-black tracking-tight italic">
            <span className="text-blue-600">Claims</span>
            <span className="text-slate-900 ml-2">Overview</span>
          </h1>
          <p className="mt-1 text-slate-500 font-medium text-sm">
            Monitor and manage insurance claims performance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Data Updates
        </div>
      </div>

      {/* 2. Claim Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ClaimCard
          title="Total Claims Updated"
          count={data?.totalClaims || 0}
          amount={data?.totalAmount || 0}
          color="blue"
        />
        <ClaimCard
          title="Total Claims Sanctioned"
          count={creditedCounts?.creditedClaims || 0}
          amount={creditedCounts?.creditedAmount || 0}
          color="green"
        />
        <ClaimCard
          title="Pending Claims"
          count={pendingCounts?.pendingClaims || 0}
          amount={pendingCounts?.pendingAmount || 0}
          color="yellow"
        />
        <ClaimCard
          title="Awaiting Sanction (>7 days)"
          count={awaitingCounts?.awaitingClaims || 0}
          amount={awaitingCounts?.awaitingAmount || 0}
          color="red"
        />
      </div>

      {/* 3. Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Claims Breakdown Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="mb-4 border-b border-gray-50 pb-4">
            <h3 className="font-semibold text-gray-700">Claims Distribution</h3>
          </div>
          <ClaimPieChart
            title="Internal vs External"
            data={[
              { name: "Internal Claims", value: claimIE?.internal || 0 },
              { name: "External Claims", value: claimIE?.external || 0 }
            ]}
          />
        </div>

        {/* Staff Overview Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="mb-4 border-b border-gray-50 pb-4">
            <h3 className="font-semibold text-gray-700">Workforce Composition</h3>
          </div>
          <ClaimPieChart
            title="Staffing Overview"
            data={[
              { name: "Internal Staff", value: staffCounts?.internal || 0 },
              { name: "External Staff", value: staffCounts?.external || 0 }
            ]}
          />
        </div>
      </div>

      {/* Placeholder for Table if needed later */}
      <div className="mt-8">
        {/* <ClaimSummaryTable /> */}
      </div>
    </div>
  );
};

export default Dashboard;

