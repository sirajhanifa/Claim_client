import React from 'react';
import ClaimCard from '../components/dashboard/ClaimCard';
import ClaimPieChart from '../components/dashboard/ClaimPieChart';
import ClaimBarChart from '../components/dashboard/ClaimBarChart';
import useFetch from '../hooks/useFetch';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    const { data: academicTrends } = useFetch(`${apiUrl}/api/academic-trends`);

    const groupedBarChartData = (claimTypeAmounts || []).reduce((acc, item) => {
        const typeName = (item.name || '').trim().toUpperCase();
        if (typeName === 'QPS') {
            acc.QPS += item.amount;
        } else if (['PRACTICAL EXAM CLAIM', 'SKILLED ASSISTANT', 'HALL SUPERINTENDENT', 'LAB ASSISTANT'].includes(typeName)) {
            acc['Practical Exam Claim + Skilled Assistant + Hall Superintendent + Lab Assistant'] += item.amount;
        } else if (typeName === 'ABILITY ENHANCEMENT CLAIM' || typeName === 'AEC') {
            acc.AEC += item.amount;
        } else if (typeName.includes('CIA') && typeName.includes('REAP')) {
            acc['CIA Reappear Claim'] += item.amount;
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
        'CIA Reappear Claim': 0,
        Others: 0
    });

    const barChartData = [
        { name: 'QPS', amount: groupedBarChartData.QPS },
        { name: 'Practicals', amount: groupedBarChartData['Practical Exam Claim + Skilled Assistant + Hall Superintendent + Lab Assistant'] },
        { name: 'AEC', amount: groupedBarChartData.AEC },
        { name: 'CV', amount: groupedBarChartData['Central Valuation'] },
        { name: 'CIA Reappear', amount: groupedBarChartData['CIA Reappear Claim'] },
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

    // Prepare chart data from academic trends
    const chartData = (academicTrends || []).map((item, index) => ({
        name: item.academic_sem_label || item.label,
        semester: item.academic_sem_label || item.label,
        year: item.academic_year,
        amount: item.total_claim_amount || item.amount || 0,
        count: item.total_claim_count || item.count || 0
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Amount: ₹{payload[0].value?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-green-600 flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Count: {payload[0].payload.count?.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto">
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
                    {/* Stats Cards */}
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
                        />
                    </section>

                    {/* Charts Grid */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Bar Chart */}
                        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <ClaimBarChart data={barChartData} />
                        </section>

                        {/* Wavy Area Chart - Like the image */}
                        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Trend Analysis</p>
                                <h2 className="mt-1 text-xl font-bold text-slate-900">Academic Semester Trends</h2>
                                <p className="text-sm text-slate-500 mt-1">Last 6 semesters - Total Claim Amount</p>
                            </div>

                            <div className="h-80">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={chartData}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>

                                            <CartesianGrid
                                                stroke="#e2e8f0"
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                opacity={0.5}
                                            />

                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                                dy={10}
                                            />

                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 11 }}
                                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                                width={50}
                                            />

                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#93c5fd', strokeWidth: 1, strokeDasharray: '4 4' }} />

                                            <Legend
                                                verticalAlign="top"
                                                height={36}
                                                iconType="circle"
                                                formatter={(value) => <span className="text-sm text-gray-700 font-medium">Claim Amount Trend</span>}
                                            />

                                            <Area
                                                type="monotone"
                                                dataKey="amount"
                                                name="Claim Amount"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fill="url(#colorAmount)"
                                                dot={{
                                                    r: 5,
                                                    fill: '#ffffff',
                                                    stroke: '#3b82f6',
                                                    strokeWidth: 2.5,
                                                    cursor: 'pointer'
                                                }}
                                                activeDot={{
                                                    r: 7,
                                                    fill: '#3b82f6',
                                                    stroke: '#ffffff',
                                                    strokeWidth: 2,
                                                    cursor: 'pointer'
                                                }}
                                                isAnimationActive={true}
                                                animationDuration={1500}
                                                animationEasing="ease-in-out"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <p className="text-slate-400 font-medium">No academic data available</p>
                                            <p className="text-slate-300 text-sm mt-1">Add semester records to see trends</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Summary Stats */}
                            {chartData.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 gap-4 pt-5 border-t border-slate-100">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-4">
                                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Total Amount</p>
                                        <p className="text-2xl font-bold text-blue-900 mt-1">
                                            ₹{chartData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-xs text-blue-600/70 mt-1">Last {chartData.length} semesters</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100/30 rounded-xl p-4">
                                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Total Claims</p>
                                        <p className="text-2xl font-bold text-green-900 mt-1">
                                            {chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-green-600/70 mt-1">Across all semesters</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Three Pie Charts Row */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <ClaimPieChart
                                title="Distribution by Staff"
                                data={[
                                    { name: "Internal Staff", value: staffCounts?.internal || 0 },
                                    { name: "External Staff", value: staffCounts?.external || 0 }
                                ]}
                                colors={['#f59e0b', '#8b5cf6']}
                            />
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <ClaimPieChart
                                title="Claim Amount by Type"
                                data={pieChartData}
                                colors={pieColors}
                            />
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <ClaimPieChart
                                title="Distribution by Claims"
                                data={internalExternalData}
                                colors={['#10b981', '#ef4444']}
                            />
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;