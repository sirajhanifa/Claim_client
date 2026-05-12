import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
    Search, FileText, Layers, ChevronRight,
    AlertCircle, Loader2, FileSpreadsheet, Printer, CheckCircle2,
    Clock, RefreshCw, TrendingUp, Users, CheckCircle, Hash, Filter
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo1 from "../assets/75.jpeg";
import logo2 from "../assets/JmcLogo.png";

const FinanceProcessing = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const [batches, setBatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tableSearchTerm, setTableSearchTerm] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB");
    };

    // Fetch batches (Processed, Submitted, Credited)
    const fetchBatches = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/batches`);
            // Sort batches: Processed → Submitted → Credited
            const sorted = (res.data || []).sort((a, b) => {
                const order = { Processed: 0, Submitted: 1, Credited: 2 };
                return (order[a.batchStatus] ?? 3) - (order[b.batchStatus] ?? 3);
            });
            setBatches(sorted);
        } catch (err) {
            setError("Failed to load batches.");
        }
    };

    // Fetch all claims for a batch
    const fetchClaims = useCallback(async (batchId) => {
        setLoading(true);
        setSelectedBatchId(batchId);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/api/claims/batch/${batchId}`);
            setClaims(res.data.claims || []);
        } catch (err) {
            setError("Could not retrieve claim details.");
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchBatches();
    }, []);

    // Filter batches by search & status
    const filteredBatches = useMemo(() => {
        let filtered = batches.filter(batch => {
            const matchesSearch = batch.payment_report_id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || batch.batchStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
        // Re-apply sort after filter to preserve order
        const order = { Processed: 0, Submitted: 1, Credited: 2 };
        filtered.sort((a, b) => (order[a.batchStatus] ?? 3) - (order[b.batchStatus] ?? 3));
        return filtered;
    }, [batches, searchTerm, statusFilter]);

    // Filter claims in the table
    const filteredClaims = useMemo(() => {
        const term = tableSearchTerm.toLowerCase();
        return claims.filter(claim =>
            claim.staff_name.toLowerCase().includes(term) ||
            claim.claim_type_name.toLowerCase().includes(term) ||
            claim.totalAmount.toString().includes(term) ||
            claim.account_no?.toLowerCase().includes(term) ||
            claim.ifsc_code?.toLowerCase().includes(term) ||
            claim.status.toLowerCase().includes(term)
        );
    }, [claims, tableSearchTerm]);

    // Derived metrics for selected batch
    const totalBatchAmount = useMemo(() => claims.reduce((sum, c) => sum + c.totalAmount, 0), [claims]);
    const totalClaimsCount = claims.length;
    const processedClaimsCount = claims.filter(c => c.status === "Processed").length;
    const hasProcessedClaims = processedClaimsCount > 0;

    // Excel export (add account & IFSC columns)
    const handleDownloadExcel = () => {
        if (!claims.length) return alert("No claims to export");
        const excelData = claims.map((claim, idx) => ({
            "S.No": idx + 1,
            "Staff Name": claim.staff_name,
            "Phone": claim.phone_number,
            "Claim Type": claim.claim_type_name,
            "Total Amount (₹)": claim.totalAmount,
            "Merged Count": claim.count,
            "Account No": claim.account_no || "—",
            "IFSC Code": claim.ifsc_code || "—",
            "Entry Date": formatDate(claim.entry_date),
            "Processed Date": formatDate(claim.processed_date),
            "Submitted Date": formatDate(claim.submitted_date),
            "Credited Date": formatDate(claim.credited_date),
            "Status": claim.status
        }));
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Claims");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer]), `Claims_${selectedBatchId}.xlsx`);
    };

    // PDF export (add account & IFSC)
    const handleDownloadPDF = () => {
        if (!claims.length) return alert("No claims to export");
        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.addImage(logo2, "JPEG", 15, 10, 25, 25);
        doc.addImage(logo1, "JPEG", pageWidth - 40, 10, 25, 25);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Jamal Mohamed College (Autonomous)", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(9);
        doc.text("Accredited with A++ Grade by NAAC (4th Cycle) with CGPA 3.69", pageWidth / 2, 27, { align: "center" });
        doc.text("Tiruchirappalli – 620 020", pageWidth / 2, 33, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Payment Report ID: ${selectedBatchId}`, 15, 50);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 15, 50, { align: "right" });

        const tableColumn = ["S.No", "Staff Name", "Claim Type", "Amount (₹)", "Account No", "IFSC", "Entry", "Processed", "Submitted", "Credited", "Status"];
        const tableRows = claims.map((c, idx) => [
            idx + 1,
            c.staff_name,
            c.claim_type_name,
            `₹${c.totalAmount.toLocaleString()}`,
            c.account_no || "—",
            c.ifsc_code || "—",
            formatDate(c.entry_date),
            formatDate(c.processed_date),
            formatDate(c.submitted_date),
            formatDate(c.credited_date),
            c.status
        ]);
        autoTable(doc, {
            startY: 60,
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 9, halign: "center" },
            headStyles: { fillColor: [0, 51, 102], textColor: "#fff" },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 35 },
                2: { cellWidth: 30 },
                3: { cellWidth: 25 },
                4: { cellWidth: 30 },
                5: { cellWidth: 25 },
                6: { cellWidth: 18 },
                7: { cellWidth: 18 },
                8: { cellWidth: 18 },
                9: { cellWidth: 18 },
                10: { cellWidth: 20 }
            }
        });
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.text("Controller of Examinations", 15, pageHeight - 20);
        doc.text("Principal", pageWidth - 40, pageHeight - 20);
        doc.save(`Claims_${selectedBatchId}.pdf`);
    };

    // Submit batch (move Processed → Submitted)
    const handleUpdateStatus = async () => {
        if (!selectedBatchId) return;
        if (!window.confirm(`Mark all Processed claims in batch ${selectedBatchId} as "Submitted"?`)) return;
        setUpdateLoading(true);
        try {
            await axios.put(`${API_URL}/api/claims/batch/${selectedBatchId}`);
            alert("Batch submitted successfully!");
            await fetchBatches();
            await fetchClaims(selectedBatchId);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status.");
        } finally {
            setUpdateLoading(false);
        }
    };

    // Helper: render dates based on claim's own status
    const renderDateStack = (claim) => {

        const status = claim.status;
        const entry = formatDate(claim.entry_date);
        const processed = formatDate(claim.processed_date);
        const submitted = formatDate(claim.submitted_date);
        const credited = formatDate(claim.credited_date);

        return (
            <div className="flex flex-col gap-1 text-[11px] min-w-[130px]">
                <div className="flex justify-between gap-2">
                    <span className="text-slate-400 uppercase">Entry :</span>
                    <span className="text-slate-700 font-bold">{entry}</span>
                </div>
                {status !== "Unsubmitted" && (
                    <div className="flex justify-between gap-2">
                        <span className="text-slate-400 uppercase">Processed :</span>
                        <span className="text-slate-700 font-bold">{processed}</span>
                    </div>
                )}
                {(status === "Submitted" || status === "Credited") && (
                    <div className="flex justify-between gap-2">
                        <span className="text-slate-400 uppercase">Submitted :</span>
                        <span className="text-slate-700 font-bold">{submitted}</span>
                    </div>
                )}
                {status === "Credited" && (
                    <div className="flex justify-between gap-2">
                        <span className="text-slate-400 uppercase">Credited :</span>
                        <span span className="text-slate-700 font-bold">{credited}</span>
                    </div>
                )}
            </div >
        );
    };

    return (
        <div className="min-h-screen font-sans">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm uppercase tracking-wider mb-1">
                            <div className="h-1 w-8 bg-blue-700 rounded-full" />
                            Financial Operations
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                            Payment <span className="text-slate-400 font-light">Reports</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Review, submit, and track batches</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar – Batches with status filter */}
                    <aside className="lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden flex flex-col sticky top-6">
                            <div className="p-3 border-b border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-sm font-bold text-slate-600 uppercase">Batches</h3>
                                    </div>
                                    <button onClick={fetchBatches} className="p-1.5 text-slate-400 hover:text-blue-600">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Status filter tabs */}
                                <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg">
                                    {["All", "Processed", "Submitted", "Credited"].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition ${statusFilter === status ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search batch ID..."
                                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {filteredBatches.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {filteredBatches.map((batch) => (
                                            <button
                                                key={batch.payment_report_id}
                                                onClick={() => fetchClaims(batch.payment_report_id)}
                                                className={`w-full text-left p-4 transition relative group ${selectedBatchId === batch.payment_report_id ? "bg-gradient-to-r from-blue-50/80 to-white shadow-inner" : "hover:bg-slate-50"}`}
                                            >
                                                {selectedBatchId === batch.payment_report_id && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                                                )}
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <span className={`font-mono font-bold text-sm ${selectedBatchId === batch.payment_report_id ? "text-blue-700" : "text-slate-700"}`}>
                                                        {batch.payment_report_id}
                                                    </span>
                                                    <ChevronRight className={`w-4 h-4 ${selectedBatchId === batch.payment_report_id ? "text-blue-600 translate-x-1" : "text-slate-300"}`} />
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs font-medium text-slate-500">{batch.count} claim{batch.count !== 1 ? "s" : ""}</p>
                                                    <BatchStatusBadge status={batch.batchStatus} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm">No batches found</div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Panel */}
                    <main className="lg:col-span-9 space-y-6">
                        {!selectedBatchId ? (
                            <EmptyState icon={<FileText className="w-12 h-12" />} title="Select a Batch" description="Choose a payment report from the sidebar to view details." />
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {/* Metrics Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <MetricCard label="Total Amount" value={`₹${totalBatchAmount.toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} theme="emerald" />
                                    <MetricCard label="Total Claims" value={totalClaimsCount} icon={<Users className="w-5 h-5" />} theme="blue" />
                                    <MetricCard label="Batch ID" value={selectedBatchId} icon={<Hash className="w-5 h-5" />} theme="orange" />
                                </div>

                                {/* Action Bar */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex gap-3">
                                        <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <FileSpreadsheet className="w-4 h-4 text-green-600" /> Download Excel
                                        </button>
                                        <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <Printer className="w-4 h-4 text-red-500" /> Download PDF
                                        </button>
                                    </div>
                                    {hasProcessedClaims && (
                                        <button onClick={handleUpdateStatus} disabled={updateLoading} className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50">
                                            {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Submit Batch to Finance
                                        </button>
                                    )}
                                </div>

                                {/* Claims Table */}
                                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
                                        <h3 className="font-bold text-slate-700">Claim Transactions</h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Filter claims..."
                                                className="pl-10 pr-4 py-2 bg-slate-50 border rounded-xl w-64 text-sm border-slate-300"
                                                onChange={(e) => setTableSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {loading ? (
                                        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
                                    ) : error ? (
                                        <div className="py-20 text-center text-red-500"><AlertCircle className="w-8 h-8 inline" /><p>{error}</p></div>
                                    ) : (
                                        <div className="overflow-x-auto border border-slate-200">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Staff</th>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Claim Type</th>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {filteredClaims.map((claim, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                                                                } hover:bg-slate-100/90`}
                                                        >
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="font-semibold text-slate-800 text-md">{claim.staff_name}</div>
                                                                {claim.count > 1 && (
                                                                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
                                                                        Merged ({claim.count})
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 text-slate-700">
                                                                    {claim.claim_type_name}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="font-bold text-blue-600 font-mono text-[15px]">
                                                                    ₹{claim.totalAmount.toLocaleString()}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredClaims.length === 0 && (
                                                <div className="py-16 text-center text-slate-400 bg-white">
                                                    <Filter className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                                    <p className="text-sm font-medium">No matching claims</p>
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

const EmptyState = ({ icon, title, description }) => (
    <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-5">{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-400 max-w-sm mt-2 text-sm">{description}</p>
    </div>
);

const MetricCard = ({ label, value, icon, theme, isMono }) => {
    const themes = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600"
    };
    return (
        <div className="rounded-xl border border-slate-200 p-5 transition-all hover:shadow-md">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${themes[theme]}`}>
                {icon}
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold text-slate-800 mt-3 ${isMono ? "font-mono" : ""}`}>
                {value}
            </p>
        </div>
    );
};

const BatchStatusBadge = ({ status }) => {
    const config = {
        Processed: "bg-purple-100 text-purple-700",
        Submitted: "bg-blue-100 text-blue-700",
        Credited: "bg-green-100 text-green-700"
    };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config[status] || "bg-gray-100"}`}>{status}</span>;
};

export default FinanceProcessing;