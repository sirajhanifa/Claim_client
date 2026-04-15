import React from 'react';

const claimData = [
    { type: 'QPS', count: 50, totalAmount: 250000, pendingCount: 5, pendingAmount: 20000 },
    { type: 'Contingency', count: 30, totalAmount: 120000, pendingCount: 3, pendingAmount: 15000 },
    { type: 'Travel', count: 20, totalAmount: 90000, pendingCount: 2, pendingAmount: 8000 }
];

const ClaimSummaryTable = () => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Claim Summary by Type</h3>
            <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                        <th className="px-6 py-3 text-left">Claim Type</th>
                        <th className="px-6 py-3 text-right">No. of Claims</th>
                        <th className="px-6 py-3 text-right">Total Amount (₹)</th>
                        <th className="px-6 py-3 text-right">Pending Claims (Count & ₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {claimData.map((item, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50 text-gray-700">
                            <td className="px-6 py-3">{item.type}</td>
                            <td className="px-6 py-3 text-right">{item.count}</td>
                            <td className="px-6 py-3 text-right">₹{item.totalAmount.toLocaleString()}</td>
                            <td className="px-6 py-3 text-right text-red-600 font-semibold">
                                {item.pendingCount} (₹{item.pendingAmount.toLocaleString()})
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClaimSummaryTable;
