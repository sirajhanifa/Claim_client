import React from 'react';
import ClaimCard from '../../components/dashboard/ClaimCard';
import ClaimPieChart from '../../components/dashboard/ClaimPieChart';
import ClaimBarChart from '../../components/dashboard/ClaimBarChart';
import useFetch from '../../hooks/useFetch';

const Dashboard = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { data } = useFetch(`${apiUrl}/api/totalclaimscount`);
    const { data: staffCounts } = useFetch(`${apiUrl}/api/staffcount`);
    const { data: creditedCounts } = useFetch(`${apiUrl}/api/creditedclaims`);
    const { data: submittedCounts } = useFetch(`${apiUrl}/api/submittedclaims`);
    const { data: pendingCounts } = useFetch(`${apiUrl}/api/pendingclaims`);
    const { data: awaitingCounts } = useFetch(`${apiUrl}/api/awaitingclaims`);
    const { data: claimIE } = useFetch(`${apiUrl}/api/internalexternalclaims`);
    const { data: claimTypeAmounts } = useFetch(`${apiUrl}/api/claimtypeamounts`);

    // Group data for bar chart (unchanged)
    const groupedBarChartData = (claimTypeAmounts || []).reduce((acc, item) => {
        const typeName = (item.name || '').trim().toUpperCase();
        if (typeName === 'QPS') {
            acc.QPS += item.amount;
        } else if (['PRACTICAL EXAM CLAIM', 'SKILLED ASSISTANT', 'HALL SUPERINTENDENT', 'LAB ASSISTANT'].includes(typeName)) {
            acc['Practical Exam Claim + Skilled Assistant + Hall Superintendent + Lab Assistant'] += item.amount;
        } else if (typeName === 'ABILITY ENHANCEMENT CLAIM' || typeName === 'AEC') {
            acc.AEC += item.amount;
        } else if (typeName === 'SCRUTINY CLAIM') {
            acc.Scrutiny += item.amount;
        } else if (typeName === 'CENTRAL VALUATION') {
            acc['Central Valuation'] += item.amount;
        } else {
            acc.Others += item.amount;
        }
        return acc;
    }, {
        QPS: 0,
        'Practical Exam Claim + Skilled Assistant + Hall Superintendent + Lab Assistant': 0,
        AEC: 0,
        Scrutiny: 0,
        'Central Valuation': 0,
        Others: 0
    });

    const barChartData = [
        { name: 'QPS', amount: groupedBarChartData.QPS },
        { name: 'Examination Duty Claims', amount: groupedBarChartData['Practical Exam Claim + Skilled Assistant + Hall Superintendent + Lab Assistant'] },
        { name: 'AEC', amount: groupedBarChartData.AEC },
        { name: 'Scrutiny', amount: groupedBarChartData.Scrutiny },
        { name: 'Central Valuation', amount: groupedBarChartData['Central Valuation'] },
        { name: 'Others', amount: groupedBarChartData.Others }
    ];

    // Prepare data for the new pie chart (claim type amounts)
    const pieChartData = barChartData
        .filter(item => item.amount > 0)
        .map(item => ({ name: item.name, value: item.amount }));

    const pieColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

    return (
        <div className="min-h-screen bg-[#f8fafc]">
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
                </div>
            </header>

            <main className="mx-auto space-y-8">
                {/* KPI Cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <ClaimCard title="Total Claims" count={data?.totalClaims || 0} amount={data?.totalAmount || 0} color="blue" />
                    <ClaimCard title="Unsubmitted Claims" count={pendingCounts?.pendingClaims || 0} amount={pendingCounts?.pendingAmount || 0} color="yellow" />
                    <ClaimCard title="Submitted Claims" count={submittedCounts?.submittedClaims || 0} amount={submittedCounts?.submittedAmount || 0} color="green" />
                    <ClaimCard title="Credited Claims" count={creditedCounts?.creditedClaims || 0} amount={creditedCounts?.creditedAmount || 0} color="pink" />
                    <ClaimCard title="Awaiting for Credit" count={awaitingCounts?.awaitingClaims || 0} amount={awaitingCounts?.awaitingAmount || 0} color="red" showAlert={true} />
                </section>

                {/* Bar Chart */}
                <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <ClaimBarChart data={barChartData} />
                </section>

                {/* Three Pie Charts in a Single Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <ClaimPieChart
                            title="Claim Amount by Type"
                            data={pieChartData}
                            colors={pieColors}
                        />
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <ClaimPieChart
                            title="Distribution by Staff"
                            data={[
                                { name: "Internal", value: claimIE?.internal || 0 },
                                { name: "External", value: claimIE?.external || 0 }
                            ]}
                            colors={['#10b981', '#ef4444']}
                        />
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <ClaimPieChart
                            title="Distribution by Claim"
                            data={[
                                { name: "Internal Staff", value: staffCounts?.internal || 0 },
                                { name: "External Staff", value: staffCounts?.external || 0 }
                            ]}
                            colors={['#f59e0b', '#8b5cf6']}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;