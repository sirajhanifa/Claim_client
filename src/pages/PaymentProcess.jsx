import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const PaymentProcess = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const [prList, setPrList] = useState([]);
    const [selectedPrId, setSelectedPrId] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loadingClaims, setLoadingClaims] = useState(false);
    const [loadingClaimId, setLoadingClaimId] = useState(null);

    const getPaymentReportIds = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/finance/pr-ids`);
            setPrList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching PR IDs:', error);
            setPrList([]);
        }
    };

    const getClaimsByPrId = async (prId) => {
        setLoadingClaims(true);
        try {
            const response = await axios.get(`${API_URL}/api/finance/claims/${prId}`);
            setSelectedPrId(prId);
            setClaims(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching claims:', error);
            setClaims([]);
        } finally {
            setLoadingClaims(false);
        }
    };

    const markClaimCredited = async (claimId) => {
        if (!confirm('Mark this claim as credited?')) return;
        setLoadingClaimId(claimId);

        try {
            const payload = {
                credited_date: new Date(),
                remarks: "Paid via NEFT",
                payment_report_id: selectedPrId
            };
            const response = await axios.put(`${API_URL}/api/finance/update/${claimId}`, payload);
            setClaims(prev => prev.map(c => c._id === claimId ? response.data : c));
            if (selectedPrId) getClaimsByPrId(selectedPrId);
        } catch (error) {
            console.error("Error updating claim:", error);
        } finally {
            setLoadingClaimId(null);
        }
    };

    const markClaimsCredited = async (claimIds = [], loadingKey = null) => {
        if (!Array.isArray(claimIds) || claimIds.length === 0) return;
        if (!confirm(`Mark ${claimIds.length} claim(s) as credited?`)) return;
        setLoadingClaimId(loadingKey || 'bulk');

        const payload = {
            claimIds,
            payment_report_id: selectedPrId,
            credited_date: new Date(),
            remarks: "Paid via NEFT"
        };

        try {
            try {
                const res = await axios.put(`${API_URL}/api/finance/update-multiple`, payload);
                if (Array.isArray(res.data)) {
                    const updatedMap = new Map(res.data.map(c => [c._id, c]));
                    setClaims(prev => prev.map(c => updatedMap.get(c._id) || c));
                    return;
                }
            } catch (err) {
                console.warn('Batch update failed, falling back to individual updates', err.message || err);
            }

            for (const id of claimIds) {
                try {
                    const res = await axios.put(`${API_URL}/api/finance/update/${id}`, {
                        credited_date: payload.credited_date,
                        remarks: payload.remarks,
                        payment_report_id: payload.payment_report_id
                    });
                    setClaims(prev => prev.map(c => c._id === id ? res.data : c));
                } catch (e) {
                    console.error('Failed updating claim', id, e);
                }
            }
        } catch (error) {
            console.error("Error updating claims:", error);
        } finally {
            setLoadingClaimId(null);
            if (selectedPrId) getClaimsByPrId(selectedPrId);
        }
    };

    useEffect(() => {
        getPaymentReportIds();
    }, []);

    const displayedClaims = useMemo(() => {
        if (!claims || claims.length === 0) return [];
        const map = new Map();
        for (const c of claims) {
            const key = `${(c.staff_name || '').trim()}::${(c.phone_number || '').trim()}::${(c.claim_type_name || '').trim()}::${(c.payment_report_id || '').trim()}`;
            const submissionDate = c.submission_date ? new Date(c.submission_date) : null;
            const creditedDate = c.credited_date ? new Date(c.credited_date) : null;

            if (!map.has(key)) {
                map.set(key, { ...c, _mergedCount: 1, _claimIds: [c._id] });
            } else {
                const ex = map.get(key);
                ex.amount = (Number(ex.amount) || 0) + (Number(c.amount) || 0);
                ex._mergedCount = (ex._mergedCount || 1) + 1;
                ex._claimIds.push(c._id);
                if (submissionDate && (!ex.submission_date || new Date(ex.submission_date) < submissionDate))
                    ex.submission_date = submissionDate.toISOString();
                if (creditedDate && (!ex.credited_date || new Date(ex.credited_date) < creditedDate))
                    ex.credited_date = creditedDate.toISOString();
                if (c.status && c.status !== ex.status) ex.status = c.status;
            }
        }
        return Array.from(map.values());
    }, [claims]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto space-y-8">

                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                            <div className="h-1 w-8 bg-blue-600 rounded-full" />
                            Review Finalize Payment
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            Payment <span className="text-slate-400 font-light">Processing</span>
                        </h1>
                    </div>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {prList.map((pr) => (
                        <div
                            key={pr.payment_report_id}
                            onClick={() => getClaimsByPrId(pr.payment_report_id)}
                            className={`cursor-pointer p-6 rounded-2xl border transition-all duration-200 active:scale-95
                            ${selectedPrId === pr.payment_report_id
                                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-md"
                                    : "bg-white border-gray-200 hover:border-blue-300 shadow-sm"}`}
                        >
                            <div className="flex flex-col space-y-1">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Report ID</span>
                                <h4 className="text-xl font-bold text-slate-900">{pr.payment_report_id}</h4>
                                <div className="flex justify-between items-end mt-4">
                                    <span className="text-sm font-bold text-slate-500">{pr.count} Claims</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        ₹{Number(pr.totalAmount || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedPrId ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50/50 border-b border-blue-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                <span>🧾</span> Claims for {selectedPrId}
                            </h3>

                            <button
                                onClick={() => {
                                    const allClaimIds = displayedClaims.flatMap(c => c._claimIds ? c._claimIds : [c._id]);
                                    markClaimsCredited(allClaimIds);
                                }}
                                disabled={loadingClaimId || displayedClaims.length === 0 || !displayedClaims.some(c => c.status !== "Credited")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm
                                ${loadingClaimId
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"}`}
                            >
                                {loadingClaimId ? "Processing..." : "Mark All Credited"}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className='text-center'>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Staff Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bank Account</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">IFSC</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-center">
                                    {([...displayedClaims]
                                        .sort((a, b) => (a.ifsc_code || "").localeCompare(b.ifsc_code || "")))
                                        .map((claim, index) => {
                                            const key = claim._claimIds ? claim._claimIds.join('-') : claim._id;
                                            const isMerged = claim._mergedCount && claim._mergedCount > 1;
                                            const loadingForThis = loadingClaimId && (loadingClaimId === 'bulk' || loadingClaimId === claim._id || loadingClaimId === (claim._claimIds || []).join(','));

                                            return (
                                                <tr key={key} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800 text-sm">{claim.staff_name}</div>
                                                        {isMerged && <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded uppercase">Merged {claim._mergedCount}</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{claim.claim_type_name}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-bold text-slate-900">₹{claim.amount}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-sm text-slate-700">{claim.account_no}</td>
                                                    <td className="px-6 py-4 font-mono text-sm text-slate-700">{claim.ifsc_code}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                        ${claim.status === "Credited"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-yellow-100 text-yellow-700"}`}>
                                                            {claim.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => isMerged ? markClaimsCredited(claim._claimIds, (claim._claimIds || []).join(',')) : markClaimCredited(claim._id)}
                                                            disabled={claim.status === "Credited" || Boolean(loadingClaimId)}
                                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
                                                            ${claim.status === "Credited"
                                                                    ? "bg-green-50 text-green-600 cursor-default"
                                                                    : loadingForThis ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                                                        >
                                                            {claim.status === "Credited" ? "✓ Credited" : loadingForThis ? "..." : "Mark Credited"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50/50 border-b border-blue-100 px-6 py-4">
                            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                <span>🧾</span> No report selected
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className='text-center'>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Staff Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bank Account</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">IFSC</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-center">
                                    <tr>
                                        <td colSpan={7} className="py-6 text-slate-500 text-sm font-semibold">
                                            No records to display. Please select a report to view details.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentProcess;