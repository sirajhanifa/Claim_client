import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useFetch from '../hooks/useFetch';
import { Search, Phone, Download, FileText, Filter, ChevronDown, Layers, Calendar, Landmark, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ClaimReport = () => {

    // Other filters
    const [claimType, setClaimType] = useState('All');
    const [paymentIdFilter, setPaymentIdFilter] = useState('All');
    const [mainFilter, setMainFilter] = useState('All');
    const [viewMode, setViewMode] = useState('Individuals');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [ifscFilter, setIfscFilter] = useState("All");

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const apiUrl = import.meta.env.VITE_API_URL;
    const { data: claimData, loading: fetchLoading, error: fetchError, refetch } = useFetch(`${apiUrl}/claimDatas`);
    const { data: staffData = [] } = useFetch(`${apiUrl}/staff`);

    const showStatusColumn = mainFilter === 'All';
    const showPaymentIdColumn = mainFilter !== 'Unsubmitted';
    const showTDSColumn = categoryFilter === 'TDS';

    useEffect(() => {
        if (mainFilter === 'Unsubmitted' && paymentIdFilter !== 'All') {
            setPaymentIdFilter('All');
        }
    }, [mainFilter, paymentIdFilter]);

    const handleStatusChange = (newStatus) => {
        if (paymentIdFilter !== 'All' && newStatus !== mainFilter) {
            setPaymentIdFilter('All');
        }
        setMainFilter(newStatus);
    };

    useEffect(() => {
        if (paymentIdFilter !== 'All' && claimData) {
            const statuses = [...new Set(claimData
                .filter(claim => claim.payment_report_id === paymentIdFilter)
                .map(claim => claim.status)
                .filter(Boolean))];
            if (statuses.length > 0 && !statuses.includes(mainFilter)) {
                setMainFilter(statuses[0]);
            }
        }
    }, [paymentIdFilter, claimData, mainFilter]);

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
        return [...new Set(claimData.map(claim => claim.claim_type_name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }, [claimData]);

    const paymentIds = useMemo(() => {
        if (!claimData) return [];
        return [...new Set(claimData
            .map(claim => claim.payment_report_id)
            .filter(id => id && id.trim() !== ''))].sort((a, b) => a.localeCompare(b));
    }, [claimData]);

    const staffMapByPhone = useMemo(() => {
        if (!staffData) return new Map();
        return new Map(staffData.map((staff) => [staff.phone_no, staff]));
    }, [staffData]);

    const staffMapById = useMemo(() => {
        if (!staffData) return new Map();
        return new Map(staffData.filter((staff) => staff.staff_id).map((staff) => [staff.staff_id, staff]));
    }, [staffData]);

    const selectedPaymentStatuses = useMemo(() => {
        if (!claimData || paymentIdFilter === 'All') return [];
        return [...new Set(claimData
            .filter(claim => claim.payment_report_id === paymentIdFilter)
            .map(claim => claim.status)
            .filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }, [claimData, paymentIdFilter]);

    const statusOptions = useMemo(() => {
        if (!claimData) return ['All'];
        if (paymentIdFilter !== 'All' && selectedPaymentStatuses.length > 0) {
            const options = selectedPaymentStatuses;
            return mainFilter && !options.includes(mainFilter) ? [...options, mainFilter] : options;
        }
        const unique = [...new Set(claimData.map(claim => claim.status)
            .filter(Boolean))].sort((a, b) => a.localeCompare(b));
        const options = ['All', ...unique];
        return mainFilter && mainFilter !== 'All' && !options.includes(mainFilter)
            ? [...options, mainFilter]
            : options;
    }, [claimData, paymentIdFilter, selectedPaymentStatuses, mainFilter]);

    const viewModeOptions = useMemo(() => ['Grouped', 'Individuals'], []);

    const dateField = useMemo(() => {
        if (mainFilter === 'Processed') return 'processed_date';
        if (mainFilter === 'Submitted') return 'submitted_date';
        if (mainFilter === 'Credited') return 'credited_date';
        return 'entry_date';
    }, [mainFilter]);

    const fromDateLabel = useMemo(() => {
        if (mainFilter === 'Processed') return 'From Date (Processed Date)';
        if (mainFilter === 'Submitted') return 'From Date (Submitted Date)';
        if (mainFilter === 'Credited') return 'From Date (Credited Date)';
        return 'From Date (Entry Date)';
    }, [mainFilter]);

    const toDateLabel = useMemo(() => {
        if (mainFilter === 'Processed') return 'To Date (Processed Date)';
        if (mainFilter === 'Submitted') return 'To Date (Submitted Date)';
        if (mainFilter === 'Credited') return 'To Date (Credited Date)';
        return 'To Date (Entry Date)';
    }, [mainFilter]);

    // Filter logic based on mainFilter 
    const filteredClaims = useMemo(() => {

        if (!claimData) return [];

        return claimData.filter(claim => {

            // 1. Main filter
            if (mainFilter !== 'All') {
                if (claim.status !== mainFilter) return false;
            }

            // 2. Claim type filter
            if (claimType !== "All" && claim.claim_type_name !== claimType) return false;

            // 3. Category filter
            if (categoryFilter !== "All") {
                if (categoryFilter === "TDS") {
                    if (claim.tds_amount === -1) return false;
                } else if (claim.internal_external !== categoryFilter) {
                    return false;
                }
            }

            // 4. Payment report ID filter
            if (paymentIdFilter !== 'All' && claim.payment_report_id !== paymentIdFilter) return false;

            // 5. IFSC filter
            let ifscMatch = true;
            if (ifscFilter === "JMC_IOB") ifscMatch = claim.ifsc_code === "IOBA0000467";
            else if (ifscFilter === "IOB_OTHERS") ifscMatch = claim.ifsc_code?.startsWith("IOBA") && claim.ifsc_code !== "IOBA0000467";
            else if (ifscFilter === "OTHER_BANKS") ifscMatch = !claim.ifsc_code?.startsWith("IOBA");
            if (!ifscMatch) return false;

            // 6. Date range filter
            const claimDate = claim[dateField] ? new Date(claim[dateField]) : null;
            if (fromDate && (!claimDate || claimDate < new Date(fromDate))) return false;
            if (toDate && (!claimDate || claimDate > new Date(toDate))) return false;

            // 7. Search filter across all fields
            if (debouncedSearch) {
                const searchLower = debouncedSearch.toLowerCase();
                const values = Object.values(claim)
                    .filter((value) => value !== null && value !== undefined)
                    .map((value) => String(value).toLowerCase());
                if (!values.some((value) => value.includes(searchLower))) return false;
            }

            return true;
        });
    }, [claimData, mainFilter, claimType, categoryFilter, ifscFilter, paymentIdFilter, fromDate, toDate, debouncedSearch, dateField]);

    // Merge duplicates using status-specific grouping keys
    const mergeDuplicates = useCallback((claims) => {
        const map = new Map();
        for (const c of claims) {
            const key = mainFilter === 'Unsubmitted'
                ? `${(c.claim_type_name || '').trim()}::${(c.phone_number || '').trim()}::${(c.staff_name || '').trim()}`
                : `${(c.phone_number || '').trim()}::${(c.payment_report_id || '').trim()}`;
            if (!map.has(key)) {
                map.set(key, { ...c, _mergedCount: 1 });
            } else {
                const existing = map.get(key);
                existing.amount = (Number(existing.amount) || 0) + (Number(c.amount) || 0);
                existing._mergedCount = (existing._mergedCount || 1) + 1;
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
    }, [mainFilter]);

    const displayedClaimsBase = useMemo(() => {
        if (viewMode === 'Grouped') return mergeDuplicates(filteredClaims);
        return filteredClaims;
    }, [viewMode, filteredClaims, mergeDuplicates]);

    // Reset sorting when filters change
    useEffect(() => {
        setSortConfig({ key: null, direction: null });
    }, [mainFilter, claimType, categoryFilter, ifscFilter, paymentIdFilter, fromDate, toDate, debouncedSearch, viewMode]);

    // Sorting logic
    const displayedClaims = useMemo(() => {
        if (!displayedClaimsBase.length) return [];
        if (!sortConfig.key || sortConfig.direction === null) {
            return displayedClaimsBase;
        }
        const sorted = [...displayedClaimsBase];
        sorted.sort((a, b) => {
            const key = sortConfig.key;
            let aVal = a[key];
            let bVal = b[key];

            if (key && key.endsWith('_date')) {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            } else {
                aVal = aVal ?? '';
                bVal = bVal ?? '';
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            }

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

    const duplicateNameMap = useMemo(() => {
        const map = new Map();
        displayedClaims.forEach((claim) => {
            const name = claim.staff_name?.trim();
            if (!name) return;
            const accounts = map.get(name) || new Set();
            if (claim.account_no) accounts.add(claim.account_no);
            map.set(name, accounts);
        });
        return new Map(
            Array.from(map.entries()).filter(([, accounts]) => accounts.size > 1)
        );
    }, [displayedClaims]);

    const getExcelDisplayName = (claim) => {
        const name = claim.staff_name || '';
        const accounts = duplicateNameMap.get(name);
        if (accounts && accounts.size > 1 && claim.account_no) {
            return `${name} (Account No. ${claim.account_no})`;
        }
        return name;
    };

    const formatExcelDate = (date) => date ? new Date(date).toLocaleDateString('en-GB') : '';

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

        const excelData = displayedClaims.map((claim) => {
            const staff = staffMapByPhone.get(claim.phone_number) || staffMapById.get(claim.staff_id) || {};
            return {
                StaffID: claim.staff_id || staff.staff_id || '',
                StaffName: getExcelDisplayName(claim),
                Designation: claim.designation || staff.designation || '',
                Department: claim.department || staff.department || '',
                Category: claim.category || staff.category || '',
                EmploymentType: claim.employment_type || staff.employment_type || '',
                College: claim.college || staff.college || '',
                PhoneNumber: claim.phone_number || staff.phone_no || '',
                Email: claim.email || staff.email || '',
                BankName: claim.bank_name || staff.bank_name || '',
                BranchName: claim.branch_name || staff.branch_name || '',
                BankCity: claim.bank_city_name || staff.bank_city_name || '',
                IFSCCode: claim.ifsc_code || staff.ifsc_code || '',
                AccountNumber: claim.account_no || staff.bank_acc_no || '',
                ClaimType: claim.claim_type_name || '',
                Status: claim.status || '',
                PaymentReportID: claim.payment_report_id || '',
                InternalExternal: claim.internal_external || '',
                TDSAmount: claim.tds_amount === -1 ? '' : claim.tds_amount,
                Amount: claim.amount || '',
                EntryDate: formatExcelDate(claim.entry_date),
                ProcessedDate: formatExcelDate(claim.processed_date),
                SubmittedDate: formatExcelDate(claim.submitted_date),
                CreditedDate: formatExcelDate(claim.credited_date),
                CourseCode: claim.course_code || ''
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const file = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(file, `Claim_Report_${mainFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // TDS Excel download
    const handleDownloadTDSExcel = () => {
        if (displayedClaims.length === 0) {
            alert("No data available to download");
            return;
        }
        const excelData = displayedClaims.map((claim, index) => ({
            Sno: index + 1,
            Date: claim.entry_date ? new Date(claim.entry_date).toLocaleDateString('en-GB') : '-',
            Name: getExcelDisplayName(claim),
            Department: claim.department,
            'Amount Claimed': claim.tds_amount + claim.amount,
            'Less I.Tax 10%': claim.tds_amount,
            'Amount Paid': claim.amount
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TDS Claims");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const file = new Blob([excelBuffer], { type: "application/octet-stream" });
        const formattedDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
        saveAs(file, `TDS Report ${formattedDate}.xlsx`);
    };

    const tableHeaders = useMemo(() => {
        const baseHeaders = ["S.No", "Staff Details", "Claim Type", "Contact", "IFSC", "Account Number"];
        const amountHeaders = showTDSColumn ? [...baseHeaders, "TDS Amount", "Amount", "Dates"] : [...baseHeaders, "Amount", "Dates"];

        if (showStatusColumn) {
            return [...amountHeaders, "Status", "Payment ID"];
        } else {
            return [...amountHeaders, "Payment ID"];
        }
    }, [showTDSColumn, showStatusColumn]);

    // Define sortable keys for each column
    const sortableKeys = {
        "Staff Details": "staff_name",
        "Claim Type": "claim_type_name",
        "Contact": "phone_number",
        "IFSC": "ifsc_code",
        "Account Number": "account_no",
        "Amount": "amount",
        "TDS Amount": "tds_amount",
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
                    {categoryFilter === 'TDS' && (
                        <button
                            onClick={handleDownloadTDSExcel}
                            className="flex items-center cursor-pointer gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-sm active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            Download TDS Excel
                        </button>
                    )}
                    <button
                        onClick={handleDownloadExcel}
                        className="flex items-center gap-2 cursor-pointer bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Download Excel
                    </button>
                </div>
            </header>

            {/* Primary Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Claim Type */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Layers className="w-3 h-3" />
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
                            <Filter className="w-3 h-3" />
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
                            <option value="TDS">TDS</option>
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

                    {/* Payment ID */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <FileText className="w-3 h-3" />
                            Payment ID
                        </label>
                        <select
                            value={paymentIdFilter}
                            onChange={(e) => setPaymentIdFilter(e.target.value)}
                            disabled={mainFilter === 'Unsubmitted'}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${mainFilter === 'Unsubmitted' ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' : paymentIdFilter !== 'All' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="All">All Payment IDs</option>
                            {paymentIds.map((paymentId) => (
                                <option key={paymentId} value={paymentId}>{paymentId}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <ChevronDown className="w-3 h-3" />
                            Status
                        </label>
                        <select
                            value={mainFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${mainFilter !== 'All' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            {statusOptions.map(option => (
                                <option key={option} value={option}>{option === 'All' ? 'All Claims' : option}</option>
                            ))}
                        </select>
                    </div>

                    {/* View Mode */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <ArrowUpDown className="w-3 h-3" />
                            View Mode
                        </label>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${viewMode !== 'Individuals' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            {viewModeOptions.map((mode) => (
                                <option key={mode} value={mode}>{mode}</option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Calendar className="w-3 h-3" />
                            {fromDateLabel}
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* To Date */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Calendar className="w-3 h-3" />
                            {toDateLabel}
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-end gap-4 w-full xl:w-auto">
                <div className="xl:w-96 border border-slate-300 rounded-[12px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search across all fields..."
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
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-bold text-slate-900 leading-none truncate">{claim.staff_name}</span>
                                                            {claim._mergedCount > 1 && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-[0.2em]">
                                                                    {claim._mergedCount} merged
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-blue-600 font-bold uppercase tracking-tight truncate">
                                                            {claim.internal_external}
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
                                            {showTDSColumn && (
                                                <td className="px-6 py-4 text-center font-semibold text-slate-700">
                                                    {claim.tds_amount === -1 ? '-' : `₹${claim.tds_amount.toLocaleString('en-IN')}`}
                                                </td>
                                            )}
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