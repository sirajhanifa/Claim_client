import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useFetch from '../hooks/useFetch';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Search, Phone, Download, FileText, Filter, ChevronDown, Layers, Calendar, Landmark, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo1 from '../assets/75.jpeg';
import logo2 from '../assets/JmcLogo.png';

const ClaimReport = () => {

    const [mainFilter, setMainFilter] = useState('All');

    // Other filters
    const [claimType, setClaimType] = useState('All');
    const [entryDate, setEntryDate] = useState('');
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [ifscFilter, setIfscFilter] = useState("All");

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const apiUrl = import.meta.env.VITE_API_URL;
    const { data: claimData, loading: fetchLoading, error: fetchError, refetch } = useFetch(`${apiUrl}/claimDatas`);

    const showStatusColumn = mainFilter === 'All';
    const showPaymentIdColumn = mainFilter !== 'Unsubmitted';

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const debounceTimer = useRef(null);
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(debounceTimer.current);
    }, [search]);

    // Unique claim types
    const claimTypes = useMemo(() => {
        if (!claimData) return [];
        return [...new Set(claimData.map(claim => claim.claim_type_name))];
    }, [claimData]);

    // Filter logic based on mainFilter (status-based filtering)
    const filteredClaims = useMemo(() => {
        if (!claimData) return [];

        return claimData.filter(claim => {
            // 1. Main filter (by status)
            if (mainFilter !== 'All') {
                if (claim.status !== mainFilter) return false;
            }

            // 2. Claim type filter
            if (claimType !== "All" && claim.claim_type_name !== claimType) return false;

            // 3. Category filter
            if (categoryFilter !== "All") {
                if (categoryFilter !== "TDS" && claim.internal_external !== categoryFilter) return false;
                if (categoryFilter === "TDS" && claim.category !== "AIDED") return false;
            }

            // 4. IFSC filter
            let ifscMatch = true;
            if (ifscFilter === "JMC_IOB") ifscMatch = claim.ifsc_code === "IOBA0000467";
            else if (ifscFilter === "IOB_OTHERS") ifscMatch = claim.ifsc_code?.startsWith("IOBA") && claim.ifsc_code !== "IOBA0000467";
            else if (ifscFilter === "OTHER_BANKS") ifscMatch = !claim.ifsc_code?.startsWith("IOBA");
            if (!ifscMatch) return false;

            // 5. Entry date filter
            if (entryDate && new Date(claim.entry_date).toLocaleDateString("en-CA") !== entryDate) return false;

            // 6. Search filter
            if (debouncedSearch) {
                const searchLower = debouncedSearch.toLowerCase();
                const nameMatch = claim.staff_name?.toLowerCase().includes(searchLower);
                const phoneMatch = claim.phone_number?.toString().includes(searchLower);
                if (!nameMatch && !phoneMatch) return false;
            }

            return true;
        });
    }, [claimData, mainFilter, claimType, categoryFilter, ifscFilter, entryDate, debouncedSearch]);

    // Merge duplicates only for Unsubmitted view
    const mergeDuplicates = useCallback((claims) => {
        const map = new Map();
        for (const c of claims) {
            const key = `${(c.claim_type_name || '').trim()}::${(c.phone_number || '').trim()}::${(c.staff_name || '').trim()}`;
            if (!map.has(key)) {
                map.set(key, { ...c, _mergedCount: 1 });
            } else {
                const existing = map.get(key);
                existing.amount = (Number(existing.amount) || 0) + (Number(c.amount) || 0);
                existing._mergedCount = (existing._mergedCount || 1) + 1;

                // Keep latest dates where applicable
                const entryDateObj = c.entry_date ? new Date(c.entry_date) : null;
                if (entryDateObj && (!existing.entry_date || new Date(existing.entry_date) < entryDateObj)) {
                    existing.entry_date = entryDateObj.toISOString();
                }
                const processedDateObj = c.processed_date ? new Date(c.processed_date) : null;
                if (processedDateObj && (!existing.processed_date || new Date(existing.processed_date) < processedDateObj)) {
                    existing.processed_date = processedDateObj.toISOString();
                }
                const submittedDateObj = c.submitted_date ? new Date(c.submitted_date) : null;
                if (submittedDateObj && (!existing.submitted_date || new Date(existing.submitted_date) < submittedDateObj)) {
                    existing.submitted_date = submittedDateObj.toISOString();
                }
                const creditedDateObj = c.credited_date ? new Date(c.credited_date) : null;
                if (creditedDateObj && (!existing.credited_date || new Date(existing.credited_date) < creditedDateObj)) {
                    existing.credited_date = creditedDateObj.toISOString();
                }
                if (c.status && c.status !== existing.status) existing.status = c.status;
            }
        }
        return Array.from(map.values());
    }, []);

    const displayedClaimsBase = useMemo(() => {
        if (mainFilter === 'Unsubmitted') return mergeDuplicates(filteredClaims);
        return filteredClaims;
    }, [mainFilter, filteredClaims, mergeDuplicates]);

    // Reset sorting when filters change
    useEffect(() => {
        setSortConfig({ key: null, direction: null });
    }, [mainFilter, claimType, categoryFilter, ifscFilter, entryDate, debouncedSearch]);

    // Sorting logic
    const displayedClaims = useMemo(() => {
        if (!displayedClaimsBase.length) return [];
        if (!sortConfig.key || sortConfig.direction === null) {
            return displayedClaimsBase;
        }
        const sorted = [...displayedClaimsBase];
        sorted.sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [displayedClaimsBase, sortConfig]);

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

    const totalAmount = useMemo(() => {
        return displayedClaims.reduce((sum, claim) => sum + (Number(claim.amount) || 0), 0);
    }, [displayedClaims]);

    // Helper to render date column based on mainFilter
    const renderDateCell = (claim) => {

        const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB') : '-';

        switch (mainFilter) {
            case 'Unsubmitted':
                return (
                    <div className="flex flex-col gap-1 text-[11px]">
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Entry :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.entry_date)}</span>
                        </div>
                    </div>
                );
            case 'Processed':
                return (
                    <div className="flex flex-col gap-1 text-[11px]">
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Entry :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.entry_date)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Processed :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.processed_date)}</span>
                        </div>
                    </div>
                );
            case 'Submitted':
                return (
                    <div className="flex flex-col gap-1 text-[11px]">
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Entry :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.entry_date)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Processed :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.processed_date)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Submitted :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.submitted_date)}</span>
                        </div>
                    </div>
                );
            case 'Credited':
            case 'All':
            default:
                return (
                    <div className="flex flex-col gap-1 text-[11px] w-36">
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Entry :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.entry_date)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Processed :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.processed_date)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Submitted :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.submitted_date)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-slate-400 uppercase whitespace-nowrap">Credited :</span>
                            <span className="text-slate-700 font-bold">{formatDate(claim.credited_date)}</span>
                        </div>
                    </div>
                );
        }
    };

    // Excel download
    const handleDownloadExcel = () => {
        if (displayedClaims.length === 0) {
            alert("No data available to download");
            return;
        }
        const excelData = displayedClaims.map((claim, index) => ({
            "S.No": index + 1,
            "Entry Date": new Date(claim.entry_date).toLocaleDateString("en-GB"),
            "Processed Date": claim.processed_date ? new Date(claim.processed_date).toLocaleDateString("en-GB") : '',
            "Submitted Date": claim.submitted_date ? new Date(claim.submitted_date).toLocaleDateString("en-GB") : '',
            "Credited Date": claim.credited_date ? new Date(claim.credited_date).toLocaleDateString("en-GB") : '',
            "Name": claim.staff_name,
            "College": claim.college,
            "Department": claim.department,
            "Amount Paid": claim.amount,
            "IFSC Code": claim.ifsc_code,
            "Account No": claim.account_no,
            "Phone No": claim.phone_number,
            "Status": claim.status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const file = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(file, `Claim_Report_${mainFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // PDF generation
    const createPDF = (prId, submittedDate, claims) => {
        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.addImage(logo2, "JPEG", 15, 10, 25, 25);
        doc.addImage(logo1, "JPEG", pageWidth - 40, 10, 25, 25);

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Jamal Mohamed College (Autonomous)", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(9);
        doc.text("Accredited with A++ Grade by NAAC (4th Cycle) with CGPA 3.69 out of 4.0.", pageWidth / 2, 27, { align: "center" });
        doc.text("Tiruchirappalli – 620 020", pageWidth / 2, 33, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`PR ID: ${prId}`, 15, 50);
        doc.text(`Date: ${submittedDate}`, pageWidth - 15, 50, { align: "right" });

        const tableColumn = ["S.No", "Category", "Entry Date", "Name", "Department", "Claim Type", "Amount"];
        const tableRows = claims.map((claim, index) => [
            index + 1,
            claim.internal_external,
            new Date(claim.entry_date).toLocaleDateString('en-GB'),
            claim.staff_name,
            claim.department,
            claim.claim_type_name,
            claim.amount,
        ]);

        autoTable(doc, {
            startY: 60,
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 10, halign: "center" },
            headStyles: { fillColor: [0, 51, 102], textColor: "#fff", fontStyle: "bold" },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 22 },
                2: { cellWidth: 30 },
                3: { cellWidth: 35 },
                4: { cellWidth: 25 },
                5: { cellWidth: 28 },
                6: { cellWidth: 25 },
            }
        });

        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Controller of Examinations", 15, pageHeight - 20);
        doc.text("Principal", 180, pageHeight - 20);
        doc.save(`ClaimEntryReport_${prId}.pdf`);
    };

    const handleDownloadPDF = () => {
        if (displayedClaims.length === 0) {
            alert('No claims found to download.');
            return;
        }
        const prId = `PR-${new Date().getFullYear()}-TEMP`;
        const submissionDate = new Date().toLocaleDateString('en-GB');
        createPDF(prId, submissionDate, displayedClaims);
    };

    const tableHeaders = showStatusColumn
        ? ["S.No", "Staff Details", "Claim Type", "Contact", "IFSC", "Account Number", "Amount", "Dates", "Status", "Payment ID"]
        : ["S.No", "Staff Details", "Claim Type", "Contact", "IFSC", "Account Number", "Amount", "Dates", "Payment ID"];

    // Define sortable keys for each column (excluding S.No)
    const sortableKeys = {
        "Staff Details": "staff_name",
        "Claim Type": "claim_type_name",
        "Contact": "phone_number",
        "IFSC": "ifsc_code",
        "Account Number": "account_no",
        "Amount": "amount",
        "Dates": "entry_date",
        "Status": "status",
        "Payment ID": "payment_report_id"
    };

    return (
        <div>
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        Claims Reports
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Claim <span className="text-slate-400 font-light">History</span>
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
                    >
                        <FileText className="w-4 h-4" />
                        Download PDF
                    </button>
                    <button
                        onClick={handleDownloadExcel}
                        className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Download Excel
                    </button>
                </div>
            </header>

            {/* Primary Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Claim Type */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Filter className="w-3 h-3" />
                            Claim Type
                        </label>
                        <select
                            value={claimType}
                            onChange={(e) => setClaimType(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${claimType !== 'All' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="All">All Claim Types</option>
                            {claimTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Layers className="w-3 h-3" />
                            Category
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${categoryFilter !== 'All' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="All">All Categories</option>
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                        </select>
                    </div>

                    {/* Bank Type */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Landmark className="w-3 h-3" />
                            Bank Type
                        </label>
                        <select
                            value={ifscFilter}
                            onChange={(e) => setIfscFilter(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${ifscFilter !== 'All' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="All">All Bank Types</option>
                            <option value="JMC_IOB">IOB JMC Branch</option>
                            <option value="IOB_OTHERS">IOB Other Branch</option>
                            <option value="OTHER_BANKS">Other Banks</option>
                        </select>
                    </div>

                    {/* Entry Date */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Calendar className="w-3 h-3" />
                            Entry Date
                        </label>
                        <input
                            type="date"
                            value={entryDate}
                            onChange={(e) => setEntryDate(e.target.value)}
                            className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Main Radio Filter - All, Unsubmitted, Processed, Submitted, Credited */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex flex-wrap gap-3 bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit">
                        {['All', 'Unsubmitted', 'Processed', 'Submitted', 'Credited'].map((option) => (
                            <label key={option} className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="mainFilter"
                                    value={option}
                                    checked={mainFilter === option}
                                    onChange={(e) => setMainFilter(e.target.value)}
                                    className="sr-only peer"
                                />
                                <div className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all text-center whitespace-nowrap">
                                    {option === 'All' ? 'All Claims' : option}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-end gap-4 w-full xl:w-auto">
                <div className="xl:w-96 border border-slate-300 rounded-[12px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Claims Records
                    </h2>
                    {!fetchLoading && !fetchError && (
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                No. of Claims : {displayedClaims.length}
                            </div>
                            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                Total Amount : ₹{totalAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <table className="w-full text-sm text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-30">
                                <tr className="text-center">
                                    {tableHeaders.map((h, i) => {
                                        const isSortable = h !== "S.No" && sortableKeys[h];
                                        return (
                                            <th
                                                key={i}
                                                onClick={isSortable ? () => handleSort(sortableKeys[h]) : undefined}
                                                className={`bg-slate-50/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap ${isSortable ? 'cursor-pointer hover:text-blue-600 transition-colors select-none' : ''}`}
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    {h}
                                                    {isSortable && getSortIcon(sortableKeys[h])}
                                                </span>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fetchLoading ? (
                                    <tr>
                                        <td colSpan={tableHeaders.length} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                                                <p className="text-slate-500 text-sm">Loading claims...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : fetchError ? (
                                    <tr>
                                        <td colSpan={tableHeaders.length} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-red-50 p-4 rounded-full mb-4">
                                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-red-600 font-medium mb-2">Failed to load claims</p>
                                                <p className="text-slate-400 text-sm mb-4">{fetchError.message || 'Please try again'}</p>
                                                <button onClick={() => refetch()} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                                    Retry
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : displayedClaims.length === 0 ? (
                                    <tr>
                                        <td colSpan={tableHeaders.length} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                                    <Search className="w-10 h-10 text-slate-200" />
                                                </div>
                                                <h3 className="text-slate-800 font-bold">No claims found</h3>
                                                <p className="text-slate-400 text-sm mt-4">There are no records matching your current filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    displayedClaims.map((claim, index) => (
                                        <tr key={claim._id} className="group hover:bg-blue-50/30 transition-all duration-200">
                                            <td className="px-6 py-4 text-slate-400 font-medium text-center">{index + 1}</td>
                                            <td className="px-6 py-4 min-w-[340px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                        {claim.staff_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 leading-none mb-1">{claim.staff_name}</div>
                                                        <div className="text-[11px] text-blue-600 font-bold uppercase tracking-tight">
                                                            {categoryFilter === "TDS" ? "AIDED" : claim.internal_external}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 min-w-[250px] text-center">
                                                <span className="text-slate-700 font-semibold">{claim.claim_type_name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Phone size={14} className="text-slate-400" />
                                                    <span className="font-medium">{claim.phone_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit text-[13px] text-slate-700 uppercase font-semibold">{claim.ifsc_code}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="text-[13px] text-center text-blue-500 uppercase font-bold">{claim.account_no}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-md font-bold text-green-700">₹{claim.amount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {renderDateCell(claim)}
                                            </td>
                                            {showStatusColumn && (
                                                <td className="px-6 py-4 min-w-[240px] text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border transition-colors
                                                        ${claim.status === 'Credited' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            claim.status === 'Processed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                claim.status === 'Submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full 
                                                            ${claim.status === 'Credited' ? 'bg-green-500' :
                                                                claim.status === 'Processed' ? 'bg-purple-500' :
                                                                    claim.status === 'Submitted' ? 'bg-blue-500' :
                                                                        'bg-yellow-500'}`} />
                                                        {claim.status}
                                                    </span>
                                                </td>
                                            )}
                                            {showPaymentIdColumn && (
                                                <td className="px-6 py-4 font-mono text-sm text-center text-slate-500 font-bold whitespace-nowrap">
                                                    {claim.payment_report_id || '-'}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClaimReport;