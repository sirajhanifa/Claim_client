import React from 'react';
import ClaimCard from '../../components/dashboard/ClaimCard';
import ClaimPieChart from '../../components/dashboard/ClaimPieChart';
import useFetch from '../../hooks/useFetch';

const Dashboard = () => {

	const apiUrl = import.meta.env.VITE_API_URL;
	const { data } = useFetch(`${apiUrl}/api/totalclaimscount`);
	const { data: staffCounts } = useFetch(`${apiUrl}/api/staffcount`);
	const { data: creditedCounts } = useFetch(`${apiUrl}/api/creditedclaims`);
	const { data: pendingCounts } = useFetch(`${apiUrl}/api/pendingclaims`);
	const { data: awaitingCounts } = useFetch(`${apiUrl}/api/awaitingclaims`);
	const { data: claimIE } = useFetch(`${apiUrl}/api/internalexternalclaims`);

	return (
		<div className="min-h-screen bg-[#f8fafc]">

			{/* Header */}
			<header className="max-w-7xl mx-auto mb-10">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<span className="h-2 w-8 bg-blue-600 rounded-full" />
							<span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Executive Portal</span>
						</div>
						<h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
							Claims <span className="text-slate-400 font-light">Dashboard</span>
						</h1>
					</div>

					<div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
						<div className="flex items-center gap-2 px-3">
							<div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
							<span className="text-sm font-semibold text-slate-600 text-nowrap">Live Systems Operational</span>
						</div>
					</div>
				</div>
			</header>

			<main className="mx-auto space-y-8">
				<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<ClaimCard
						title="Updated Claims"
						count={data?.totalClaims || 0}
						amount={data?.totalAmount || 0}
						color="blue"
					/>
					<ClaimCard
						title="Sanctioned"
						count={creditedCounts?.creditedClaims || 0}
						amount={creditedCounts?.creditedAmount || 0}
						color="green"
					/>
					<ClaimCard
						title="Pending Review"
						count={pendingCounts?.pendingClaims || 0}
						amount={pendingCounts?.pendingAmount || 0}
						color="yellow"
					/>
					<ClaimCard
						title="Awaiting (>7D)"
						count={awaitingCounts?.awaitingClaims || 0}
						amount={awaitingCounts?.awaitingAmount || 0}
						color="red"
						showAlert={true}
					/>
				</section>

				{/* Charts Row */}
				<section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
						<ClaimPieChart
							title="Distribution by Source"
							data={[
								{ name: "Internal", value: claimIE?.internal || 0 },
								{ name: "External", value: claimIE?.external || 0 }
							]}
							colors={['#1e293b', '#3b82f6']}
						/>
					</div>
					<div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
						<ClaimPieChart
							title="Workforce Composition"
							data={[
								{ name: "Permanent Staff", value: staffCounts?.internal || 0 },
								{ name: "Contractual", value: staffCounts?.external || 0 }
							]}
							colors={['#0f172a', '#94a3b8']}
						/>
					</div>
				</section>
			</main>
		</div>
	);
};

export default Dashboard;

