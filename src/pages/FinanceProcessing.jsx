import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
    Search, FileText, IndianRupee, Layers, ChevronRight, ArrowUpRight,
    Download, AlertCircle, Loader2, FileSpreadsheet, Printer, CheckCircle2,
    CreditCard, Clock, RefreshCw, TrendingUp, Users, CheckCircle, Hash
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo1 from "../assets/75.jpeg";
import logo2 from "../assets/JmcLogo.png";

const FinanceProcessing = () => {

    const API_URL = import.meta.env.VITE_API_URL;

    const [prList, setPrList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPrId, setSelectedPrId] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tableSearchTerm, setTableSearchTerm] = useState("");
    const [processedCount, setProcessedCount] = useState(0);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Helper: format date to DD/MM/YYYY
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-GB");
    };

    // Fetch all batch IDs with status "Processed"
    const fetchPrIds = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/payment-status/pr-ids`);
            setPrList(res.data || []);
        } catch (err) {
            setError("Failed to load report IDs.");
        }
    };

    // Fetch claims for a selected batch
    const fetchClaims = useCallback(async (prId) => {
        setLoading(true);
        setSelectedPrId(prId);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/api/admin/payment-status/claims/${prId}`);
            setClaims(res.data.claims || []);
            setProcessedCount(res.data.processedCount || 0);
        } catch (err) {
            setError("Could not retrieve claim details.");
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchPrIds();
    }, []);

    // --- Download Excel for current batch ---
    const handleDownloadExcel = () => {
        if (!claims.length) {
            alert("No claims to export");
            return;
        }
        const excelData = claims.map((claim, idx) => ({
            "S.No": idx + 1,
            "Staff Name": claim.staff_name,
            "Phone": claim.phone_number,
            "Claim Type": claim.claim_type_name,
            "Total Amount (₹)": claim.totalAmount,
            "Merged Count": claim.count,
            "Submission Date": claim.submission_date ? formatDate(claim.submission_date) : "—",
            "Credited Date": claim.credited_date ? formatDate(claim.credited_date) : "—",
            "Status": claim.status
        }));
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Claims");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const file = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(file, `Claims_${selectedPrId}.xlsx`);
    };

    // --- Download PDF for current batch ---
    const handleDownloadPDF = () => {
        if (!claims.length) {
            alert("No claims to export");
            return;
        }
        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();

        // Add logos
        doc.addImage(logo2, "JPEG", 15, 10, 25, 25);
        doc.addImage(logo1, "JPEG", pageWidth - 40, 10, 25, 25);

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Jamal Mohamed College (Autonomous)", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(9);
        doc.text("Accredited with A++ Grade by NAAC (4th Cycle) with CGPA 3.69", pageWidth / 2, 27, { align: "center" });
        doc.text("Tiruchirappalli – 620 020", pageWidth / 2, 33, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Payment Report ID: ${selectedPrId}`, 15, 50);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 15, 50, { align: "right" });

        const tableColumn = ["S.No", "Staff Name", "Claim Type", "Amount (₹)", "Submission Date", "Credited Date", "Status"];
        const tableRows = claims.map((c, idx) => [
            idx + 1,
            c.staff_name,
            c.claim_type_name,
            `₹${c.totalAmount.toLocaleString()}`,
            c.submission_date ? formatDate(c.submission_date) : "—",
            c.credited_date ? formatDate(c.credited_date) : "—",
            c.status
        ]);

        autoTable(doc, {
            startY: 60,
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 10, halign: "center" },
            headStyles: { fillColor: [0, 51, 102], textColor: "#fff", fontStyle: "bold" },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 40 },
                2: { cellWidth: 35 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 30 },
                6: { cellWidth: 25 }
            }
        });

        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Controller of Examinations", 15, pageHeight - 20);
        doc.text("Principal", pageWidth - 40, pageHeight - 20);

        doc.save(`Claims_${selectedPrId}.pdf`);
    };

    // --- Update status from "Processed" to "Submitted" ---
    const handleUpdateStatus = async () => {
        if (!selectedPrId) return;
        if (!window.confirm(`Mark all claims in batch ${selectedPrId} as "Submitted"? This will move them out of the processing queue.`)) return;

        setUpdateLoading(true);
        try {
            const res = await axios.put(`${API_URL}/api/admin/payment-status/update-status/${selectedPrId}`);
            alert(res.data.message);
            await fetchPrIds();
            const batchStillExists = prList.some(p => p.payment_report_id === selectedPrId);
            if (batchStillExists) {
                await fetchClaims(selectedPrId);
            } else {
                setSelectedPrId(null);
                setClaims([]);
                setProcessedCount(0);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update status.");
        } finally {
            setUpdateLoading(false);
        }
    };

    // Derived data
    const filteredPrList = useMemo(() =>
        prList.filter(pr =>
            pr.payment_report_id.toLowerCase().includes(searchTerm.toLowerCase())
        ), [prList, searchTerm]
    );

    const filteredDisplayedClaims = useMemo(() =>
        claims.filter(claim => {
            const search = tableSearchTerm.toLowerCase();
            return (
                claim.staff_name.toLowerCase().includes(search) ||
                claim.claim_type_name.toLowerCase().includes(search) ||
                claim.totalAmount.toString().includes(search) ||
                (claim.submission_date && formatDate(claim.submission_date).toLowerCase().includes(search)) ||
                (claim.credited_date && formatDate(claim.credited_date).toLowerCase().includes(search)) ||
                claim.status.toLowerCase().includes(search)
            );
        }), [claims, tableSearchTerm]
    );

    // Enhanced metrics
    const totalBatchAmount = useMemo(() =>
        claims.reduce((sum, c) => sum + c.totalAmount, 0), [claims]
    );
    const totalClaimsCount = claims.length;
    const processedClaimsCount = claims.filter(c => c.status === "Processed").length;
    const hasProcessedClaims = processedClaimsCount > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans">
            <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm uppercase tracking-wider mb-1">
                            <div className="h-1 w-8 bg-blue-700 rounded-full" />
                            Financial Operations
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                            Payment <span className="text-slate-400 font-light">Reports</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 max-w-lg">
                            Review and submit processed claim batches for final settlement
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar - Modern Batch List */}
                    <aside className="lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-12rem)] sticky top-6 transition-all">
                            <div className="p-5 border-b border-slate-100 bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Processed Batches</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-bold">
                                            {filteredPrList.length}
                                        </span>
                                        <button
                                            onClick={fetchPrIds}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                            title="Refresh batches"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by ID..."
                                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm transition-all outline-none"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {filteredPrList.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {filteredPrList.map((pr) => (
                                            <button
                                                key={pr.payment_report_id}
                                                onClick={() => fetchClaims(pr.payment_report_id)}
                                                className={`w-full text-left p-4 transition-all relative group ${selectedPrId === pr.payment_report_id
                                                    ? "bg-gradient-to-r from-blue-50/80 to-white shadow-inner"
                                                    : "hover:bg-slate-50"
                                                    }`}
                                            >
                                                {selectedPrId === pr.payment_report_id && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full shadow-sm" />
                                                )}
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <span className={`font-mono font-bold text-sm ${selectedPrId === pr.payment_report_id ? "text-blue-700" : "text-slate-700"
                                                        }`}>
                                                        {pr.payment_report_id}
                                                    </span>
                                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedPrId === pr.payment_report_id ? "text-blue-600 translate-x-1" : "text-slate-300"
                                                        }`} />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-slate-500">
                                                        {pr.count} claim{pr.count !== 1 ? "s" : ""}
                                                    </p>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                                        Processed
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm italic">
                                        No processed batches found
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Panel - Professional Cards & Table */}
                    <main className="lg:col-span-9 space-y-6">
                        {!selectedPrId ? (
                            <EmptyState
                                icon={<FileText className="w-12 h-12" />}
                                title="Select a Batch"
                                description="Choose a payment report from the sidebar to view and manage claim details."
                            />
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                                {/* Modern Metrics Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <MetricCard
                                        label="Total Amount"
                                        value={`₹${totalBatchAmount.toLocaleString()}`}
                                        icon={<TrendingUp className="w-5 h-5" />}
                                        trend="+12%"
                                        theme="emerald"
                                    />
                                    <MetricCard
                                        label="Total Claims"
                                        value={totalClaimsCount}
                                        icon={<Users className="w-5 h-5" />}
                                        subtext="in this batch"
                                        theme="blue"
                                    />
                                    <MetricCard
                                        label="Processed Claims"
                                        value={processedClaimsCount}
                                        icon={<CheckCircle className="w-5 h-5" />}
                                        subtext="ready for submission"
                                        theme="purple"
                                    />
                                    <MetricCard
                                        label="Report ID"
                                        value={selectedPrId.slice(-8)}
                                        icon={<Hash className="w-5 h-5" />}
                                        subtext={selectedPrId}
                                        theme="slate"
                                        isMono
                                    />
                                </div>

                                <div className="max-w-7xl mx-auto space-y-6">
                                    {/* Stats row - clean minimal cards */}

                                    {/* Action bar */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleDownloadExcel}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                                Excel
                                            </button>
                                            <button
                                                onClick={handleDownloadPDF}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <Printer className="w-4 h-4 text-red-500" />
                                                PDF
                                            </button>
                                        </div>
                                        {hasProcessedClaims && (
                                            <button
                                                onClick={handleUpdateStatus}
                                                disabled={updateLoading}
                                                className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50"
                                            >
                                                {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Submit Batch
                                            </button>
                                        )}
                                    </div>

                                    {/* Claims Table - clean, borderless, minimal */}
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-800">Claim Transactions</h3>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Filter claims..."
                                                    className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 w-64"
                                                    value={tableSearchTerm}
                                                    onChange={(e) => setTableSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {loading ? (
                                            <div className="flex justify-center py-20">
                                                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                                            </div>
                                        ) : error ? (
                                            <div className="text-center py-20 text-red-500 flex flex-col items-center gap-2">
                                                <AlertCircle className="w-8 h-8" />
                                                <p>{error}</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left">Staff</th>
                                                            <th className="px-6 py-3 text-left">Claim Type</th>
                                                            <th className="px-6 py-3 text-right">Amount</th>
                                                            <th className="px-6 py-3 text-center">Submission Date</th>
                                                            <th className="px-6 py-3 text-center">Credited Date</th>
                                                            <th className="px-6 py-3 text-center">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {filteredDisplayedClaims.map((claim, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50/80 transition">
                                                                <td className="px-6 py-3">
                                                                    <div className="font-medium text-gray-800">{claim.staff_name}</div>
                                                                    {claim.count > 1 && (
                                                                        <span className="inline-block text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mt-0.5">
                                                                            Merged ({claim.count})
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-3">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                                        {claim.claim_type_name}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3 text-right font-mono font-medium text-gray-800">
                                                                    ₹{claim.totalAmount.toLocaleString()}
                                                                </td>
                                                                <td className="px-6 py-3 text-center text-gray-500 text-xs">
                                                                    {claim.submission_date ? formatDate(claim.submission_date) : "—"}
                                                                </td>
                                                                <td className="px-6 py-3 text-center text-gray-500 text-xs">
                                                                    {claim.credited_date ? formatDate(claim.credited_date) : "—"}
                                                                </td>
                                                                <td className="px-6 py-3 text-center">
                                                                    <StatusBadge status={claim.status} />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {filteredDisplayedClaims.length === 0 && (
                                                    <div className="text-center py-16 text-gray-400">
                                                        <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p>No matching claims</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Action Buttons Panel */}
                                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleDownloadExcel}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
                                        >
                                            <FileSpreadsheet className="w-4 h-4" />
                                            Export Excel
                                        </button>
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
                                        >
                                            <Printer className="w-4 h-4" />
                                            Export PDF
                                        </button>
                                    </div>
                                    {hasProcessedClaims && (
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={updateLoading}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updateLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4" />
                                            )}
                                            Submit Batch
                                        </button>
                                    )}
                                </div>

                                {/* Claims Table - Professional Design */}
                                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                                        <h3 className="font-bold text-slate-700 text-lg">Claim Details</h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Filter claims..."
                                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm transition-all outline-none"
                                                onChange={(e) => setTableSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="py-32 flex flex-col items-center justify-center text-slate-400">
                                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                                            <p className="font-medium">Loading claims...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="py-20 text-center text-rose-500 flex flex-col items-center">
                                            <AlertCircle className="w-10 h-10 mb-2" />
                                            <p>{error}</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Staff Member</th>
                                                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Claim Type</th>
                                                        <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                                        <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Submission Date</th>
                                                        <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Credited Date</th>
                                                        <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {filteredDisplayedClaims.map((claim, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">{claim.staff_name}</p>
                                                                    {claim.count > 1 && (
                                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full inline-block mt-1">
                                                                            Merged ({claim.count})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                                                    {claim.claim_type_name}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                                                                ₹{claim.totalAmount.toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-slate-500 text-xs">
                                                                {claim.submission_date ? formatDate(claim.submission_date) : "—"}
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-slate-500 text-xs">
                                                                {claim.credited_date ? formatDate(claim.credited_date) : "—"}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <StatusBadge status={claim.status} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredDisplayedClaims.length === 0 && (
                                                <div className="py-16 text-center text-slate-400">
                                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                                    <p className="text-sm">No matching claims found</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

/* ========== Helper Components ========== */

const EmptyState = ({ icon, title, description }) => (
    <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm text-center p-12">
        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 text-slate-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-400 max-w-sm mt-2 text-sm">{description}</p>
    </div>
);

const MetricCard = ({ label, value, icon, trend, subtext, theme, isMono }) => {
    const themes = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        slate: "bg-slate-50 text-slate-600"
    };
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 transition-all hover:shadow-md hover:border-slate-300">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themes[theme]}`}>
                    {icon}
                </div>
                {trend && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-xl font-extrabold text-slate-800 mt-1 ${isMono ? 'font-mono' : ''}`}>{value}</p>
                {subtext && <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">{subtext}</p>}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        Credited: { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
        Processed: { color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
        Submitted: { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
        Pending: { color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" }
    };
    const { color, dot } = config[status] || config.Pending;
    return (
        <div className="flex items-center justify-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${dot}`} />
            <span className={`text-xs font-semibold capitalize ${color}`}>
                {status}
            </span>
        </div>
    );
};

export default FinanceProcessing;