import React from 'react';
import ClaimCard from '../../components/dashboard/ClaimCard';
import ClaimSummaryTable from '../../components/dashboard/ClaimTable';
import ClaimPieChart from '../../components/dashboard/ClaimPieChart';
import useFetch from '../../hooks/useFetch';
import StaffOverviewCard from '../../components/dashboard/StaffOverviewCard';

const Dashboard = () => {

  const apiUrl = import.meta.env.VITE_API_URL;

  //hooks 
  const { data } = useFetch(`${apiUrl}/api/totalclaimscount`)
  const { data: staffCounts } = useFetch(`${apiUrl}/api/staffcount`);
  const { data: creditedCounts } = useFetch(`${apiUrl}/api/creditedclaims`);
  const { data: pendingCounts } = useFetch(`${apiUrl}/api/pendingclaims`);
  const { data: awaitingCounts } = useFetch(`${apiUrl}/api/awaitingclaims`);
  const { data: claimIE } = useFetch(`${apiUrl}/api/internalexternalclaims`);






  // const { data: staffOverview } = useFetch(`${apiUrl}/api/staffoverview`)
  return (
    <div className="space-y-8 p-4">
      {/* Claim Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Claims Awaiting Sanction (>7 days)"
          count={awaitingCounts?.awaitingClaims || 0}
          amount={awaitingCounts?.awaitingAmount || 0}
          color="red"
          // showAlert={true}
        />

        {/* <StaffOverviewCard
          internalCount={456}
          externalCount={78} /> */}
        {/* <StaffOverviewCard internal={560} external={175} /> */}


      </div>

      {/* Claim Summary Table (Full Width) */}
      {/* <ClaimSummaryTable /> */}
      <div>

      </div>
      {/* Pie Charts Section (One row with two charts) */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <ClaimPieChart
            title="Claims Breakdown"
            data={[
              { name: "Internal Claims", value: claimIE?.internal || 0 },
              { name: "External Claims", value: claimIE?.external || 0 }
            ]}
          />
        </div>

        <div className="w-full md:w-1/2">
          <ClaimPieChart
            title="Staff Overview"
            data={[
              { name: "Internal Staff", value: staffCounts?.internal || 0 },
              { name: "External Staff", value: staffCounts?.external || 0 }
            ]}
          />
        </div>

      </div>


    </div>
  );
};

export default Dashboard;
