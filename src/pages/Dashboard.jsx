import React, { useState, useEffect } from 'react';
import ClaimCard from '../components/dashboard/ClaimCard';
import ClaimPieChart from '../components/dashboard/ClaimPieChart';
import ClaimBarChart from '../components/dashboard/ClaimBarChart';
import useFetch from '../hooks/useFetch';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const role = localStorage.getItem('role') || 'admin';
    const username = localStorage.getItem('username');

    const { data: totalClaims } = useFetch(`${apiUrl}/api/totalClaimsCount`);
    const { data: staffCounts } = useFetch(`${apiUrl}/api/staffsCount`);
    const { data: creditedCounts } = useFetch(`${apiUrl}/api/creditedClaims`);
    const { data: submittedCounts } = useFetch(`${apiUrl}/api/submittedclaims`);
    const { data: pendingCounts } = useFetch(`${apiUrl}/api/pendingclaims`);
    const { data: awaitingCounts } = useFetch(`${apiUrl}/api/awaitingclaims`);
    const { data: claimIE } = useFetch(`${apiUrl}/api/internalexternalclaims`);
    const { data: claimTypeAmounts } = useFetch(`${apiUrl}/api/claimtypeamounts`);
    const { data: academicTrends } = useFetch(`${apiUrl}/api/academic-trends`);

    const { data: paymentStats } = useFetch(`${apiUrl}/api/payment-badges`);
    const { data: paymentTableData } = useFetch(`${apiUrl}/api/payment-table`);

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingAmount, setPendingAmount] = useState(0);

    useEffect(() => {
        fetchAdminTableData();
    }, []);

    // Calculate pending amount for finance role
    useEffect(() => {
        if (!isAdmin && paymentTableData) {
            const pendingTotal = (paymentTableData || [])
                .filter(item => item.status === 'Submitted')
                .reduce((sum, item) => sum + (item.amount || 0), 0);
            setPendingAmount(pendingTotal);
        }
    }, [paymentTableData]);

    const fetchAdminTableData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/payment-table`);
            const data = await response.json();
            const sortedData = [...data].sort((a, b) => {
                const daysA = parseInt(a.daysPending, 10) || 0;
                const daysB = parseInt(b.daysPending, 10) || 0;
                if (daysA !== daysB) {
                    return daysB - daysA;
                }
                const idA = a.payment_report_id || '';
                const idB = b.payment_report_id || '';
                const lastTwoA = parseInt(idA.toString().slice(-2), 10) || 0;
                const lastTwoB = parseInt(idB.toString().slice(-2), 10) || 0;
                return lastTwoA - lastTwoB;
            });
            setTableData(sortedData);
        } catch (error) {
            console.error('Error fetching admin table data:', error);
        } finally { setLoading(false) }
    };

    const getDaysPendingColor = (days) => {
        if (days <= 10) return { color: 'text-green-600', bg: 'bg-green-50', dot: '🟢' };
        if (days <= 20) return { color: 'text-yellow-600', bg: 'bg-yellow-50', dot: '🟡' };
        return { color: 'text-red-600', bg: 'bg-red-50', dot: '🔴' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

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

    const chartData = (academicTrends || []).map((item) => ({
        name: item.academic_sem_label || item.label,
        semester: item.academic_sem_label || item.label,
        year: item.academic_year,
        amount: item.total_claim_amount || item.amount || 0,
        count: item.total_claim_count || item.count || 0
    }));

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

    const staffDistributionData = [
        { name: "Internal Staff", value: staffCounts?.internal || 0 },
        { name: "External Staff", value: staffCounts?.external || 0 }
    ];

    const isAdmin = role === 'admin';
    const isStaff = role === 'staff';
    const isFinance = role === 'finance';

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
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                    {isAdmin ? 'Executive Portal' : isStaff ? 'Staff Portal' : 'Finance Portal'}
                                </span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                Claims <span className="text-slate-400 font-light">Dashboard</span>
                            </h1>
                            {!isAdmin && (
                                <p className="text-slate-500 mt-2">
                                    Welcome back, {username}
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto space-y-8">

                    {/* STATS CARDS */}
                    {isAdmin ? (
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <ClaimCard title="Total Claims" count={totalClaims?.totalClaims || 0} amount={totalClaims?.totalAmount || 0} color="blue" />
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
                    ) : (
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ClaimCard
                                title="Total Bills"
                                count={paymentStats?.totalBadges || 0}
                                amount={0}
                                hideAmount={true}
                                color="blue"
                            />
                            <ClaimCard
                                title="Credited Bills"
                                count={paymentStats?.finishedBadges || 0}
                                amount={0}
                                hideAmount={true}
                                color="green"
                            />
                            <ClaimCard
                                title="Awaiting for Credit"
                                count={paymentStats?.pendingBadges || 0}
                                amount={0}
                                hideAmount={false}
                                color="red"
                                customAmount={pendingAmount}
                            />
                        </section>
                    )}

                    {/* ADMIN CHARTS SECTION */}
                    {isAdmin && (
                        <>
                            {/* Charts Grid */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Bar Chart */}
                                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <ClaimBarChart data={barChartData} />
                                </section>

                                {/* Wavy Area Chart */}
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
                                                        axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                                        tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                                        dy={10}
                                                    />

                                                    <YAxis
                                                        axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                                        tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
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
                                </section>
                            </div>

                            {/* Three Pie Charts Row for Admin */}
                            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <ClaimPieChart
                                        title="Distribution by Staff"
                                        data={staffDistributionData}
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
                        </>
                    )}

                    {/* PAYMENT ID TABLE - For all roles (only submitted payment reports) */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">
                                {isAdmin ? 'Payment Reports Summary' : 'Your Submitted Payment Reports'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {isAdmin
                                    ? 'All submitted payment reports across the system'
                                    : 'Track your submitted payment reports'}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Payment ID</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Claim Type</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">No. of Bills</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Date</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Days Pending</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-center">
                                    {(isAdmin ? tableData : paymentTableData || [])
                                        .filter(item => item.status === 'Submitted')
                                        .sort((a, b) => {
                                            // Apply same sorting logic for both admin and finance
                                            const daysA = parseInt(a.daysPending, 10) || 0;
                                            const daysB = parseInt(b.daysPending, 10) || 0;
                                            if (daysA !== daysB) {
                                                return daysB - daysA;
                                            }
                                            const idA = a.payment_report_id || '';
                                            const idB = b.payment_report_id || '';
                                            const lastTwoA = parseInt(idA.toString().slice(-2), 10) || 0;
                                            const lastTwoB = parseInt(idB.toString().slice(-2), 10) || 0;
                                            return lastTwoA - lastTwoB;
                                        })
                                        .map((item, index) => {
                                            const daysPendingColor = getDaysPendingColor(item.daysPending || 0);
                                            return (
                                                <tr key={item.payment_report_id || index} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700">
                                                        {item.payment_report_id || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {item.claim_type_name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {item.bill_count || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {formatDate(item.submitted_date)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                        {`₹${(item.amount || 0).toLocaleString('en-IN')}`}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${daysPendingColor.bg} ${daysPendingColor.color}`}>
                                                            <span>{daysPendingColor.dot}</span>
                                                            {item.daysPending || 0} days
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    {(isAdmin ? tableData : paymentTableData || []).filter(item => item.status === 'Submitted').length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                                No submitted payment reports found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* PIE CHARTS FOR NON-ADMIN ROLES - At the end, NO amount details */}
                    {!isAdmin && (
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <ClaimPieChart
                                    title="Distribution by Staff"
                                    data={staffDistributionData}
                                    colors={['#f59e0b', '#8b5cf6']}
                                    hideAmount={true}
                                />
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <ClaimPieChart
                                    title="Claim Count by Type"
                                    data={pieChartData.map(item => ({
                                        name: item.name,
                                        value: item.value,
                                    }))}
                                    colors={pieColors}
                                    hideAmount={true}
                                    useCountInstead={true}
                                />
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <ClaimPieChart
                                    title="Distribution by Claims"
                                    data={[
                                        { name: "Internal", value: claimIE?.internal?.count || 0 },
                                        { name: "External", value: claimIE?.external?.count || 0 }
                                    ]}
                                    colors={['#10b981', '#ef4444']}
                                    hideAmount={true}
                                />
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;