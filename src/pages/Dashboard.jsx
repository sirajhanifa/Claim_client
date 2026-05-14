import React from 'react';
import ClaimCard from '../components/dashboard/ClaimCard';
import ClaimPieChart from '../components/dashboard/ClaimPieChart';
import ClaimBarChart from '../components/dashboard/ClaimBarChart';
import useFetch from '../hooks/useFetch';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const { data } = useFetch(`${apiUrl}/api/totalClaimsCount`);
    const { data: staffCounts } = useFetch(`${apiUrl}/api/staffsCount`);
    const { data: creditedCounts } = useFetch(`${apiUrl}/api/creditedClaims`);
    const { data: submittedCounts } = useFetch(`${apiUrl}/api/submittedclaims`);
    const { data: pendingCounts } = useFetch(`${apiUrl}/api/pendingclaims`);
    const { data: awaitingCounts } = useFetch(`${apiUrl}/api/awaitingclaims`);
    const { data: claimIE } = useFetch(`${apiUrl}/api/internalexternalclaims`);
    const { data: claimTypeAmounts } = useFetch(`${apiUrl}/api/claimtypeamounts`);

    console.log(awaitingCounts)

    const groupedBarChartData = (claimTypeAmounts || []).reduce((acc, item) => {
        const typeName = (item.name || '').trim().toUpperCase();
        if (typeName === 'QPS') {
            acc.QPS += item.amount;
        } else if (['PRACTICAL EXAM CLAIM', 'SKILLED ASSISTANT', 'HALL SUPERINTENDENT', 'LAB ASSISTANT'].includes(typeName)) {
            acc['Practical Exam Claim + Skilled Assistant + Hall Superintendent + Lab Assistant'] += item.amount;
        } else if (typeName === 'ABILITY ENHANCEMENT CLAIM' || typeName === 'AEC') {
            acc.AEC += item.amount;
        } else if (typeName.includes('COE') && typeName.includes('REAP')) {
            acc['COE Reappear Claim'] += item.amount;
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
        'Central Valuation': 0,
        'COE Reappear Claim': 0,
        Others: 0
    });

    const barChartData = [
        { name: 'QPS', amount: groupedBarChartData.QPS },
        { name: 'Practicals', amount: groupedBarChartData['Practical Exam Claim + Skilled Assistant + Hall Superintendent + Lab Assistant'] },
        { name: 'AEC', amount: groupedBarChartData.AEC },
        { name: 'CV', amount: groupedBarChartData['Central Valuation'] },
        { name: 'COE Reappear', amount: groupedBarChartData['COE Reappear Claim'] },
        { name: 'Others', amount: groupedBarChartData.Others }
    ];

    const pieChartData = barChartData
        .filter(item => item.amount > 0)
        .map(item => ({ name: item.name, value: item.amount }));

    const pieColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

    const internalExternalData = [
        {
            name: "Internal",
            value: claimIE?.internal?.amount || 0,
            count: claimIE?.internal?.count || 0
        },
        {
            name: "External",
            value: claimIE?.external?.amount || 0,
            count: claimIE?.external?.count || 0
        }
    ];

    return (
        <div className="">
            <header className="mx-auto mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-1 w-8 bg-blue-600 rounded-full" />
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Executive Portal</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            Claims <span className="text-slate-400 font-light">Dashboard</span>
                        </h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto space-y-8">
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <ClaimCard title="Total Claims" count={data?.totalClaims || 0} amount={data?.totalAmount || 0} color="blue" />
                    <ClaimCard title="Pending Claims" count={pendingCounts?.pendingClaims || 0} amount={pendingCounts?.pendingAmount || 0} color="yellow" />
                    <ClaimCard title="Submitted Claims" count={submittedCounts?.submittedClaims || 0} amount={submittedCounts?.submittedAmount || 0} color="green" />
                    <ClaimCard title="Credited Claims" count={creditedCounts?.creditedClaims || 0} amount={creditedCounts?.creditedAmount || 0} color="pink" />
                    <ClaimCard
                        title="Awaiting for Credit"
                        count={
                            awaitingCounts
                                ? `${awaitingCounts.awaitingClaims || 0} ( ${awaitingCounts.uniqueReportCount || 0} )`
                                : "0 ( 0 )"
                        }
                        amount={awaitingCounts?.awaitingAmount || 0}
                        color="red"
                        showAlert={true}
                    />                </section>

                {/* Bar Chart */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <ClaimBarChart data={barChartData} />
                    </section>
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Preview</p>
                                <h2 className="mt-2 text-xl font-bold text-slate-900">Empty State Trend</h2>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                Dummy data
                            </span>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={[
                                        { name: 'Mon', value: 24 },
                                        { name: 'Tue', value: 32 },
                                        { name: 'Wed', value: 28 },
                                        { name: 'Thu', value: 38 },
                                        { name: 'Fri', value: 30 },
                                        { name: 'Sat', value: 36 },
                                        { name: 'Sun', value: 34 }
                                    ]}
                                    margin={{ top: 16, right: 8, left: 0, bottom: 8 }}
                                >
                                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}
                                        cursor={{ stroke: '#93c5fd', strokeWidth: 2, opacity: 0.12 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* Three Pie Charts in a Single Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <ClaimPieChart
                            title="Distribution by Staff"
                            data={[
                                { name: "Internal Staff", value: staffCounts?.internal || 0 },
                                { name: "External Staff", value: staffCounts?.external || 0 }
                            ]}
                            colors={['#f59e0b', '#8b5cf6']}
                        />
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <ClaimPieChart
                            title="Claim Amount by Type"
                            data={pieChartData}
                            colors={pieColors}
                        />
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <ClaimPieChart
                            title="Distribution by Claims"
                            data={internalExternalData}
                            colors={['#10b981', '#ef4444']}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;