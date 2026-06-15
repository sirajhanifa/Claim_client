import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
    Search, Layers, ChevronRight, FileSpreadsheet, Printer,
    AlertCircle, Loader2, CheckCircle2,
    TrendingUp, Users, Hash, Filter, RefreshCw, XCircle, ArrowUpDown, ArrowUp, ArrowDown,
    MailCheck
} from "lucide-react";

const ClaimStatus = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const [batches, setBatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [globalSearch, setGlobalSearch] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [viewMode, setViewMode] = useState('individual');

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    // Fetch batches (Processed, Submitted, Credited)
    const fetchBatches = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/batches`);
            const sorted = (res.data || []).sort((a, b) => {
                const order = { Processed: 0, Submitted: 1, Credited: 2 };
                const statusCompare = (order[a.batchStatus] ?? 3) - (order[b.batchStatus] ?? 3);
                if (statusCompare !== 0) return statusCompare;
                const dateA = new Date(a.batchDate || 0);
                const dateB = new Date(b.batchDate || 0);
                return dateB - dateA;
            });
            setBatches(sorted);
        } catch (err) {
            console.error('Error in fetching batches : ', err);
            setError("Failed to load batches.");
        }
    };

    // Fetch all claims for a batch
    const fetchClaims = useCallback(async (batchId) => {
        setLoading(true);
        setSelectedBatchId(batchId);
        setError(null);
        setSortConfig({ key: null, direction: null });
        try {
            const res = await axios.get(
                `${API_URL}/api/claims/batch/${encodeURIComponent(batchId)}`
            );
            setClaims(res.data.claims || []);
        } catch (err) {
            console.error('Error fetching batch datas : ', err);
            setError("Could not retrieve claim details.");
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchBatches();
    }, []);

    // Calculate batch counts by status
    const batchCounts = useMemo(() => {
        const counts = {
            total: batches.length,
            Processed: 0,
            Submitted: 0,
            Credited: 0
        };
        batches.forEach(batch => {
            if (batch.batchStatus === 'Processed') counts.Processed++;
            else if (batch.batchStatus === 'Submitted') counts.Submitted++;
            else if (batch.batchStatus === 'Credited') counts.Credited++;
        });
        return counts;
    }, [batches]);

    // Get current filter display text and count
    const currentFilterDisplay = useMemo(() => {
        if (statusFilter === "All") {
            return { text: "All Batches", count: batchCounts.total };
        } else if (statusFilter === "Processed") {
            return { text: "Processed Batches", count: batchCounts.Processed };
        } else if (statusFilter === "Submitted") {
            return { text: "Submitted Batches", count: batchCounts.Submitted };
        } else if (statusFilter === "Credited") {
            return { text: "Credited Batches", count: batchCounts.Credited };
        }
        return { text: "All Batches", count: batchCounts.total };
    }, [statusFilter, batchCounts]);

    // Filter batches by search & status
    const filteredBatches = useMemo(() => {
        let filtered = batches.filter(batch => {
            const matchesSearch = batch.payment_report_id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || batch.batchStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
        const order = { Processed: 0, Submitted: 1, Credited: 2 };
        filtered.sort((a, b) => {
            const statusCompare = (order[a.batchStatus] ?? 3) - (order[b.batchStatus] ?? 3);
            if (statusCompare !== 0) return statusCompare;
            const dateA = new Date(a.batchDate || 0);
            const dateB = new Date(b.batchDate || 0);
            return dateB - dateA;
        });
        return filtered;
    }, [batches, searchTerm, statusFilter]);

    // Individual view: filtered by search
    const filteredClaimsForIndividual = useMemo(() => {
        const term = globalSearch.toLowerCase().trim();
        if (!term) return claims;
        return claims.filter(claim => {
            const staffMatch = claim.staff_name?.toLowerCase().includes(term);
            const phoneMatch = claim.phone_number?.toLowerCase().includes(term);
            const claimTypeMatch = claim.claim_type_name?.toLowerCase().includes(term);
            const amountMatch = claim.amount?.toString().includes(term);
            const accountMatch = claim.account_no?.toLowerCase().includes(term);
            const ifscMatch = claim.ifsc_code?.toLowerCase().includes(term);
            const statusMatch = claim.status?.toLowerCase().includes(term);
            const emailStatusMatch = claim.email_status?.toLowerCase().includes(term);
            return staffMatch || phoneMatch || claimTypeMatch || amountMatch ||
                accountMatch || ifscMatch || statusMatch || emailStatusMatch;
        });
    }, [claims, globalSearch]);

    // Group claims by phone number and claim type to track email status
    const groupedClaimsWithEmailStatus = useMemo(() => {
        const map = new Map();
        claims.forEach(c => {
            const key = `${c.phone_number || ''}||${c.claim_type_name || ''}`;
            if (!map.has(key)) {
                map.set(key, {
                    staff_name: c.staff_name,
                    claim_type_name: c.claim_type_name,
                    phone_number: c.phone_number,
                    totalAmount: 0,
                    count: 0,
                    account_no: c.account_no,
                    ifsc_code: c.ifsc_code,
                    entry_date: c.entry_date,
                    processed_date: c.processed_date,
                    submitted_date: c.submitted_date,
                    credited_date: c.credited_date,
                    status: c.status,
                    email_statuses: new Set(),
                });
            }
            const g = map.get(key);
            g.totalAmount += Number(c.amount) || 0;
            g.count += 1;
            if (c.account_no) g.account_no = c.account_no;
            if (c.ifsc_code) g.ifsc_code = c.ifsc_code;
            if (c.email_status) {
                g.email_statuses.add(c.email_status);
            }
        });

        return Array.from(map.values()).map((g, idx) => {
            let finalEmailStatus = 'N/A';
            let statusColor = 'gray';
            if (g.email_statuses.has('failed')) {
                finalEmailStatus = 'Failed';
                statusColor = 'red';
            } else if (g.email_statuses.has('sent')) {
                finalEmailStatus = 'Sent';
                statusColor = 'green';
            } else if (g.email_statuses.size > 0) {
                const firstStatus = Array.from(g.email_statuses)[0];
                finalEmailStatus = firstStatus.charAt(0).toUpperCase() + firstStatus.slice(1);
                statusColor = firstStatus === 'failed' ? 'red' : (firstStatus === 'sent' ? 'green' : 'gray');
            }
            return {
                ...g,
                Sno: idx + 1,
                aggregatedEmailStatus: finalEmailStatus,
                aggregatedEmailStatusColor: statusColor
            };
        });
    }, [claims]);

    const getStatusDate = (claim) => {
        const status = claim.status;
        if (status === 'Processed') {
            return claim.processed_date;
        } else if (status === 'Submitted') {
            return claim.submitted_date;
        } else if (status === 'Credited') {
            return claim.credited_date;
        }
        return claim.entry_date;
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

    // Calculate successful email count (Sent emails) from grouped claims
    const successfulEmailCount = useMemo(() => {
        return groupedClaimsWithEmailStatus.filter(g => g.aggregatedEmailStatus === 'Sent').length;
    }, [groupedClaimsWithEmailStatus]);

    // Always use the full claims for grouping
    const groupedClaims = useMemo(() => {

        const map = new Map();
        claims.forEach(c => {
            const key = `${c.phone_number || ''}::${c.payment_report_id || ''}`;

            if (!map.has(key)) {
                map.set(key, {
                    staff_name: c.staff_name,
                    claim_type_name: c.claim_type_name,
                    phone_number: c.phone_number,
                    totalAmount: 0,
                    count: 0,
                    account_no: c.account_no,
                    ifsc_code: c.ifsc_code,
                    entry_date: c.entry_date,
                    processed_date: c.processed_date,
                    submitted_date: c.submitted_date,
                    credited_date: c.credited_date,
                    status: c.status,
                    email_statuses: new Set(),
                    payment_report_id: c.payment_report_id,
                });
            }
            const g = map.get(key);
            g.totalAmount += Number(c.amount) || 0;
            g.count += 1;
            if (c.account_no) g.account_no = c.account_no;
            if (c.ifsc_code) g.ifsc_code = c.ifsc_code;
            if (c.email_status) {
                g.email_statuses.add(c.email_status);
            }
        });
        return Array.from(map.values()).map((g, idx) => {
            let finalEmailStatus = 'N/A';
            let statusColor = 'gray';
            if (g.email_statuses.has('failed')) {
                finalEmailStatus = 'Failed';
                statusColor = 'red';
            } else if (g.email_statuses.has('sent')) {
                finalEmailStatus = 'Sent';
                statusColor = 'green';
            } else if (g.email_statuses.size > 0) {
                const firstStatus = Array.from(g.email_statuses)[0];
                finalEmailStatus = firstStatus.charAt(0).toUpperCase() + firstStatus.slice(1);
                statusColor = firstStatus === 'failed' ? 'red' : (firstStatus === 'sent' ? 'green' : 'gray');
            }
            return {
                ...g,
                Sno: idx + 1,
                aggregatedEmailStatus: finalEmailStatus,
                aggregatedEmailStatusColor: statusColor
            };
        });
    }, [claims]);

    // Determine which rows to display based on view mode
    const displayedRowsBase = useMemo(() => {
        if (viewMode === 'grouped') {
            return groupedClaims.map(claim => ({
                ...claim,
                statusDate: claim.processed_date || claim.submitted_date || claim.credited_date || claim.entry_date
            }));
        } else {
            return filteredClaimsForIndividual.map(claim => ({
                ...claim,
                emailStatusDisplay: claim.email_status || 'N/A',
                emailStatusColor: claim.email_status === 'failed' ? 'red' : (claim.email_status === 'sent' ? 'green' : 'gray'),
                statusDate: getStatusDate(claim)
            }));
        }
    }, [viewMode, groupedClaims, filteredClaimsForIndividual]);

    // Sorting logic
    const displayedRows = useMemo(() => {
        if (!displayedRowsBase.length) return [];
        if (!sortConfig.key || sortConfig.direction === null) {
            return displayedRowsBase;
        }
        const sorted = [...displayedRowsBase];
        sorted.sort((a, b) => {
            let aVal, bVal;

            // Handle special cases
            if (sortConfig.key === 'staff_name') {
                aVal = a.staff_name || '';
                bVal = b.staff_name || '';
            } else if (sortConfig.key === 'claim_type_name') {
                aVal = a.claim_type_name || '';
                bVal = b.claim_type_name || '';
            } else if (sortConfig.key === 'amount') {
                aVal = a.totalAmount || a.amount || 0;
                bVal = b.totalAmount || b.amount || 0;
            } else if (sortConfig.key === 'date') {
                aVal = new Date(a.statusDate || 0);
                bVal = new Date(b.statusDate || 0);
            } else if (sortConfig.key === 'email_status') {
                aVal = viewMode === 'grouped' ? a.aggregatedEmailStatus : a.emailStatusDisplay;
                bVal = viewMode === 'grouped' ? b.aggregatedEmailStatus : b.emailStatusDisplay;
            } else {
                aVal = a[sortConfig.key] || '';
                bVal = b[sortConfig.key] || '';
            }

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [displayedRowsBase, sortConfig, viewMode]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') {
                setSortConfig({ key: null, direction: null });
                return;
            }
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-50" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="w-3 h-3 ml-1 inline-block text-blue-600" />;
        }
        if (sortConfig.direction === 'desc') {
            return <ArrowDown className="w-3 h-3 ml-1 inline-block text-blue-600" />;
        }
        return <ArrowUpDown className="w-3 h-3 ml-1 inline-block" />;
    };

    const selectedBatch = useMemo(() => batches.find(b => b.payment_report_id === selectedBatchId), [batches, selectedBatchId]);
    const selectedBatchStatus = selectedBatch?.batchStatus;

    const getRowAmount = (r) => {
        const v = r?.totalAmount ?? r?.amount ?? 0;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    // Derived metrics
    const totalBatchAmount = useMemo(() => claims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0), [claims]);
    const groupedClaimsCount = groupedClaims.length;
    const processedClaimsCount = claims.filter(c => c.status === "Processed").length;
    const hasProcessedClaims = processedClaimsCount > 0;

    // Submit batch
    const handleUpdateStatus = async () => {
        if (!selectedBatchId) return;
        if (!window.confirm(`Mark all Processed claims in batch ${selectedBatchId} as "Submitted"?`)) return;
        setUpdateLoading(true);
        try {
            await axios.put(
                `${API_URL}/api/claims/batch/${encodeURIComponent(selectedBatchId)}`
            );
            alert("Batch submitted successfully!");
            await fetchBatches();
            await fetchClaims(selectedBatchId);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status.");
        } finally {
            setUpdateLoading(false);
        }
    };

    const showEmailStatus = selectedBatchStatus === 'Credited';

    const emailCounts = useMemo(() => {
        const counts = {
            sent: 0,
            failed: 0,
            pending: 0
        };
        groupedClaimsWithEmailStatus.forEach(g => {
            const status = g.aggregatedEmailStatus?.toLowerCase();
            if (status === 'sent') {
                counts.sent++;
            } else if (status === 'failed') {
                counts.failed++;
            } else {
                counts.pending++;
            }
        });
        return counts;
    }, [groupedClaimsWithEmailStatus]);

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
                                    {/* Show only the selected group count */}
                                    <div className="flex items-center gap-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusFilter === "All" ? " text-slate-700" :
                                            statusFilter === "Processed" ? "text-purple-700" :
                                                statusFilter === "Submitted" ? "text-blue-700" :
                                                    "text-green-700"
                                            }`}>
                                            {currentFilterDisplay.text} : {currentFilterDisplay.count}
                                        </div>
                                    </div>
                                </div>

                                {/* Status filter tabs */}
                                <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => {
                                            setStatusFilter("All");
                                            setSelectedBatchId(null);
                                            setClaims([]);
                                        }}
                                        className={`flex-1 text-xs font-semibold py-1.5 cursor-pointer rounded-lg transition ${statusFilter === "All" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStatusFilter("Processed");
                                            setSelectedBatchId(null);
                                            setClaims([]);
                                        }}
                                        className={`flex-1 text-xs font-semibold py-1.5 cursor-pointer rounded-lg transition ${statusFilter === "Processed" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Processed
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStatusFilter("Submitted");
                                            setSelectedBatchId(null);
                                            setClaims([]);
                                        }}
                                        className={`flex-1 text-xs font-semibold py-1.5 cursor-pointer rounded-lg transition ${statusFilter === "Submitted" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Submitted
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStatusFilter("Credited");
                                            setSelectedBatchId(null);
                                            setClaims([]);
                                        }}
                                        className={`flex-1 text-xs font-semibold py-1.5 cursor-pointer rounded-lg transition ${statusFilter === "Credited" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Credited
                                    </button>
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
                                                className={`w-full text-left p-4 transition cursor-pointer relative group ${selectedBatchId === batch.payment_report_id ? "bg-gradient-to-r from-blue-50/80 to-white shadow-inner" : "hover:bg-slate-50"}`}
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
                                                    <p className="text-xs font-medium text-slate-500">{batch.count} Individual Claims{batch.count !== 1 ? "s" : ""}</p>
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
                            <EmptyState icon={<Layers className="w-12 h-12" />} title="Select a Batch" description="Choose a payment report from the sidebar to view details." />
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {/* Metrics Cards */}
                                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${showEmailStatus
                                    ? 'lg:grid-cols-4'
                                    : 'lg:grid-cols-3'
                                    }`}>
                                    <MetricCard label="Total Amount" value={`₹${totalBatchAmount.toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} theme="emerald" />
                                    <MetricCard
                                        label="Grouped Claims"
                                        value={groupedClaimsCount}
                                        icon={<Users className="w-5 h-5" />}
                                        theme="blue"
                                    />
                                    {showEmailStatus && (
                                        <MetricCard
                                            label="Email Status"
                                            value={
                                                <div className="flex items-center justify-center mt-2 gap-3 text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                                        <span className="font-semibold text-green-600">{emailCounts.sent}</span>
                                                    </span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="flex items-center gap-1">
                                                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                                                        <span className="font-semibold text-red-600">{emailCounts.failed}</span>
                                                    </span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                                                        <span className="font-semibold text-yellow-500">{emailCounts.pending}</span>
                                                    </span>
                                                </div>
                                            }
                                            icon={<MailCheck className="w-5 h-5" />}
                                            theme="purple"
                                        />
                                    )}
                                    <MetricCard label="Batch ID" value={selectedBatchId} icon={<Hash className="w-5 h-5" />} theme="orange" />
                                </div>

                                {/* View Mode Toggle + Global Search */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-3 bg-slate-100 p-1.5 rounded-lg w-full md:w-fit">
                                        <label className="relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="viewMode"
                                                value="individual"
                                                checked={viewMode === 'individual'}
                                                onChange={() => setViewMode('individual')}
                                                className="sr-only peer"
                                            />
                                            <div className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all text-center whitespace-nowrap">
                                                Individual
                                            </div>
                                        </label>
                                        <label className="relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="viewMode"
                                                value="grouped"
                                                checked={viewMode === 'grouped'}
                                                onChange={() => setViewMode('grouped')}
                                                className="sr-only peer"
                                            />
                                            <div className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all text-center whitespace-nowrap">
                                                Grouped
                                            </div>
                                        </label>
                                    </div>
                                    <div className="xl:w-96 border border-slate-300 rounded-[12px] relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search across all fields..."
                                            value={globalSearch}
                                            onChange={(e) => setGlobalSearch(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Action Bar - Submit button */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border cursor-pointer border-gray-300 rounded-lg hover:bg-gray-50">
                                            <FileSpreadsheet className="w-4 h-4 text-green-600" /> Download Excel
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border cursor-pointer border-gray-300 rounded-lg hover:bg-gray-50">
                                            <Printer className="w-4 h-4 text-red-500" /> Download PDF
                                        </button>
                                    </div>
                                    {hasProcessedClaims && (
                                        <button onClick={handleUpdateStatus} disabled={updateLoading} className="cursor-pointer flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                                            {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Submit Batch to Finance
                                        </button>
                                    )}
                                </div>

                                {/* Claims Table with Sorting */}
                                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-700">Claim Transactions</h3>
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
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">S. No.</th>
                                                        <th onClick={() => handleSort('staff_name')} className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none">
                                                            <span className="inline-flex items-center gap-1">Staff Name {getSortIcon('staff_name')}</span>
                                                        </th>
                                                        <th onClick={() => handleSort('claim_type_name')} className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none">
                                                            <span className="inline-flex items-center gap-1">Claim Type {getSortIcon('claim_type_name')}</span>
                                                        </th>
                                                        <th onClick={() => handleSort('amount')} className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none">
                                                            <span className="inline-flex items-center gap-1">Amount {getSortIcon('amount')}</span>
                                                        </th>
                                                        <th onClick={() => handleSort('date')} className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none">
                                                            <span className="inline-flex items-center gap-1">Date {getSortIcon('date')}</span>
                                                        </th>
                                                        {showEmailStatus && (
                                                            <th onClick={() => handleSort('email_status')} className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none">
                                                                <span className="inline-flex items-center gap-1">Email Status {getSortIcon('email_status')}</span>
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {displayedRows.map((row, idx) => (
                                                        <tr key={idx} className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} hover:bg-slate-100/90`}>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-slate-900">
                                                                    {idx + 1}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                {viewMode === 'grouped' ? (
                                                                    <div>
                                                                        <div className="font-semibold text-slate-800">
                                                                            {row.staff_name || '—'}
                                                                            {row.count > 1 && (
                                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                                                    {row.count} claims
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="font-semibold text-slate-800">{row.staff_name || '—'}</div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 text-slate-700">
                                                                    {row.claim_type_name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="font-bold text-blue-600 font-mono text-[15px]">
                                                                    ₹{getRowAmount(row).toLocaleString('en-IN')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="text-sm font-medium text-slate-600">
                                                                    {formatDate(row.statusDate)}
                                                                </span>
                                                            </td>
                                                            {showEmailStatus && (
                                                                <td className="px-6 py-4 text-center">
                                                                    {viewMode === 'grouped' ? (
                                                                        <EmailStatusBadge status={row.aggregatedEmailStatus} color={row.aggregatedEmailStatusColor} />
                                                                    ) : (
                                                                        <EmailStatusBadge status={row.emailStatusDisplay} color={row.emailStatusColor} />
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {displayedRows.length === 0 && (
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

const MetricCard = ({ label, value, icon, theme = 'blue', trend }) => {

    const themes = {
        emerald: "bg-emerald-50/80 text-emerald-600 ring-1 ring-emerald-600/10",
        blue: "bg-blue-50/80 text-blue-600 ring-1 ring-blue-600/10",
        purple: "bg-purple-50/80 text-purple-600 ring-1 ring-purple-600/10",
        orange: "bg-orange-50/80 text-orange-600 ring-1 ring-orange-600/10",
        green: "bg-green-50/80 text-green-600 ring-1 ring-green-600/10",
        red: "bg-red-50/80 text-red-600 ring-1 ring-red-600/10",
        yellow: "bg-yellow-50/80 text-yellow-600 ring-1 ring-yellow-600/10"
    };

    return (
        <div className="group relative rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between gap-4">
                <div className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 ${themes[theme] || themes.blue}`}>
                    {React.cloneElement(icon, { className: "w-4.5 h-4.5 stroke-[2]" })}
                </div>
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                </p>
                {trend && (
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tracking-tight ${trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {trend.value}
                    </span>
                )}
            </div>
            <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl font-bold tracking-tight text-slate-900">
                    {value}
                </div>
            </div>
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

const EmailStatusBadge = ({ status }) => {

    const toTitleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const titleStatus = toTitleCase(status);
    const normalized = titleStatus.toLowerCase();
    let icon = null;
    let bgClass = "bg-gray-100";
    let textClass = "text-gray-700";
    let borderClass = "border-gray-200";

    if (normalized === 'sent') {
        icon = <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />;
        bgClass = "bg-green-50";
        textClass = "text-green-700";
        borderClass = "border-green-200";
    } else if (normalized === 'failed') {
        icon = <XCircle className="w-3.5 h-3.5 text-red-700" />;
        bgClass = "bg-red-50";
        textClass = "text-red-700";
        borderClass = "border-red-200";
    } else {
        icon = <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />;
        bgClass = "bg-yellow-50";
        textClass = "text-yellow-500";
        borderClass = "border-yellow-200";
    }

    return (
        <div className={`inline-flex items-center gap-1.5 ${bgClass} px-2.5 py-1 rounded-full text-xs font-bold border ${borderClass}`}>
            {icon}
            <span className={textClass}>{titleStatus}</span>
        </div>
    );
};

export default ClaimStatus;