import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useFetch from '../hooks/useFetch';
import { Trash2, Search, Phone, Filter, Layers, Calendar, Landmark, X, Loader2, Edit3, Download } from "lucide-react";  // +Download
import axios from 'axios';
import * as XLSX from 'xlsx';

const ClaimSubmission = () => {

    // Filter states
    const [claimType, setClaimType] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [ifscFilter, setIfscFilter] = useState("");

    // View mode
    const [viewMode, setViewMode] = useState('individual');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showBankTypeModal, setShowBankTypeModal] = useState(false);

    // Edit modal states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingClaim, setEditingClaim] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;
    const { data: rawClaimData, loading: fetchLoading, error: fetchError, refetch } = useFetch(`${apiUrl}/api/unSubmittedClaims`);

    // Debounced Search
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const debounceTimer = useRef(null);
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(debounceTimer.current);
    }, [search]);

    const claimTypes = useMemo(() => {
        if (!rawClaimData) return [];
        return [...new Set(rawClaimData.map(claim => claim.claim_type_name))];
    }, [rawClaimData]);

    const filteredClaims = useMemo(() => {
        if (!rawClaimData) return [];
        return rawClaimData.filter(claim => {
            if (claimType !== "all" && claimType !== "" && claim.claim_type_name !== claimType) return false;
            if (categoryFilter !== "all" && categoryFilter !== "" && claim.internal_external !== categoryFilter) return false;

            let ifscMatch = true;
            if (ifscFilter !== "all" && ifscFilter !== "") {
                if (ifscFilter === "JMC_IOB") ifscMatch = claim.ifsc_code === "IOBA0000467";
                else if (ifscFilter === "IOB_OTHERS") ifscMatch = claim.ifsc_code?.startsWith("IOBA") && claim.ifsc_code !== "IOBA0000467";
                else if (ifscFilter === "OTHER_BANKS") ifscMatch = !claim.ifsc_code?.startsWith("IOBA");
            }
            if (!ifscMatch) return false;

            if (entryDate && new Date(claim.entry_date).toLocaleDateString("en-CA") !== entryDate) return false;

            if (debouncedSearch) {
                const searchLower = debouncedSearch.toLowerCase();
                const nameMatch = claim.staff_name?.toLowerCase().includes(searchLower);
                const phoneMatch = claim.phone_number?.toString().includes(searchLower);
                if (!nameMatch && !phoneMatch) return false;
            }
            return true;
        });
    }, [rawClaimData, claimType, categoryFilter, ifscFilter, entryDate, debouncedSearch]);

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
                const entryDate = c.entry_date ? new Date(c.entry_date) : null;
                if (entryDate && (!existing.entry_date || new Date(existing.entry_date) < entryDate)) {
                    existing.entry_date = entryDate.toISOString();
                }
                if (c.status && c.status !== existing.status) existing.status = c.status;
            }
        }
        return Array.from(map.values());
    }, []);

    const displayedClaims = useMemo(() => {
        if (viewMode === 'individual') return filteredClaims;
        return mergeDuplicates(filteredClaims);
    }, [filteredClaims, mergeDuplicates, viewMode]);

    const totalAmount = useMemo(() => displayedClaims.reduce((sum, claim) => sum + (Number(claim.amount) || 0), 0), [displayedClaims]);

    const handleDownloadExcel = () => {

        if (!displayedClaims.length) {
            alert("No data to export.");
            return;
        }

        const worksheetData = displayedClaims.map((claim, idx) => {
            const baseRow = {
                "S.No": idx + 1,
                "Staff Name": claim.staff_name || "",
                "Category": claim.internal_external || "",
                "Claim Type": claim.claim_type_name || "",
                "Phone Number": claim.phone_number || "",
                "IFSC Code": claim.ifsc_code || "",
                "Account Number": claim.account_no || "",
                "Amount": claim.amount || 0,
                "Entry Date": claim.entry_date ? new Date(claim.entry_date).toLocaleDateString('en-GB') : "",
            };

            if (viewMode === 'grouped' && claim._mergedCount > 1) {
                baseRow["Merged Count"] = claim._mergedCount;
            }
            return baseRow;
        });

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "UnsubmittedClaims");
        const fileName = `UnsubmittedClaims_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };
    // --------------------------------------------

    // Edit handlers
    const openEditModal = (claim) => {
        setEditingClaim({ ...claim });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingClaim(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingClaim(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateClaim = async () => {
        if (!editingClaim?._id) return;
        setIsUpdating(true);
        try {
            const response = await axios.put(`${apiUrl}/api/updateClaim/${editingClaim._id}`, editingClaim);
            if (response.status === 200) {
                alert('Claim updated successfully');
                closeEditModal();
                await refetch();
            } else {
                alert('Failed to update claim');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Error updating claim');
        } finally {
            setIsUpdating(false);
        }
    };

    const proceedWithSubmission = async () => {
        setIsSubmitting(true);
        try {
            const submitRes = await fetch(`${apiUrl}/api/submitClaims`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimType, ifscFilter, category: categoryFilter })
            });
            if (submitRes.ok) {
                const result = await submitRes.json();
                alert(result.message || 'Claims submitted successfully');
                await refetch();
            } else {
                const result = await submitRes.json();
                alert(result.message || 'Failed to submit claims.');
            }
        } catch (err) {
            console.error('Error submitting claims : ', err);
            alert('Failed to submit claims.');
        } finally {
            setIsSubmitting(false);
            setShowBankTypeModal(false);
        }
    };

    const handleSubmitClaims = () => {
        if (!claimType || !categoryFilter || !ifscFilter) {
            alert("Please select Claim Type, Category, and Bank Type before submitting.");
            return;
        }
        if (ifscFilter === 'all') {
            setShowBankTypeModal(true);
            return;
        }
        if (!confirm(`Submit ${categoryFilter === 'all' ? 'all categories' : categoryFilter} ${claimType === 'all' ? 'all claim types' : claimType} pending claims?`)) return;
        proceedWithSubmission();
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this claim?")) return;
        try {
            await axios.delete(`${apiUrl}/api/claimDelete/${id}`);
            alert("Claim deleted successfully");
            await refetch();
        } catch (error) {
            console.error(error);
            alert("Error deleting claim");
        }
    };

    const isSubmitEnabled = claimType !== "" && categoryFilter !== "" && ifscFilter !== "" && displayedClaims.length > 0 && !isSubmitting;

    return (
        <div>
            {/* Header Section with Excel button */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        Claim Submission
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Unsubmitted <span className="text-slate-400 font-light">Claims</span>
                    </h1>
                </div>

                {/* New Excel Download Button */}
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-sm active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Download Excel
                </button>
            </header>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Filter className="w-3 h-3" />
                            Claim Type
                        </label>
                        <select
                            value={claimType}
                            onChange={(e) => setClaimType(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${claimType !== '' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="" disabled>Select Claim Type</option>
                            <option value="all">All Claim Types</option>
                            {claimTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Layers className="w-3 h-3" />
                            Category
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${categoryFilter !== '' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="" disabled>Select Category</option>
                            <option value="all">All Categories</option>
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Landmark className="w-3 h-3" />
                            Bank Type
                        </label>
                        <select
                            value={ifscFilter}
                            onChange={(e) => setIfscFilter(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${ifscFilter !== '' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="" disabled>Select Bank Type</option>
                            <option value="all">All Bank Types</option>
                            <option value="JMC_IOB">IOB JMC Branch</option>
                            <option value="IOB_OTHERS">IOB Other Branch</option>
                            <option value="OTHER_BANKS">Other Banks</option>
                        </select>
                    </div>
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
            </div>

            {/* Radio Toggle (left) + Search Bar (right) */}
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
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Unsubmitted Claims Records
                    </h2>
                    {!fetchLoading && !fetchError && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                                No. of Claims : {displayedClaims.length}
                            </div>
                            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100">
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
                                    {["S.No", "Staff Details", "Claim Type", "Contact", "IFSC", "Account Number", "Amount", "Entry Date"]
                                        .concat(viewMode === 'individual' ? ["Actions"] : [])
                                        .map((h, i) => (
                                            <th key={i} className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fetchLoading ? (
                                    <tr>
                                        <td colSpan={viewMode === 'individual' ? 10 : 9} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                                                <p className="text-slate-500 text-sm">Loading pending claims...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : fetchError ? (
                                    <tr>
                                        <td colSpan={viewMode === 'individual' ? 10 : 9} className="text-center py-16">
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
                                        <td colSpan={viewMode === 'individual' ? 10 : 9} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                                    <Search className="w-10 h-10 text-slate-200" />
                                                </div>
                                                <h3 className="text-slate-800 font-bold">No pending claims</h3>
                                                <p className="text-slate-400 text-sm mt-5">There are no unsubmitted records matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    displayedClaims.map((claim, index) => (
                                        <tr key={claim._id || index} className="group hover:bg-blue-50/30 transition-all duration-200">
                                            <td className="px-6 py-4 text-slate-400 font-medium text-center">{index + 1}</td>
                                            {/* Staff Details + Merged Count (if grouped) */}
                                            <td className="px-6 py-4 min-w-[340px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                        {claim.staff_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 leading-none mb-1">
                                                            {claim.staff_name}
                                                            {viewMode === 'grouped' && claim._mergedCount > 1 && (
                                                                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 rounded-sm text-[12px] font-bold bg-amber-100 text-amber-700">
                                                                    {claim._mergedCount} merged
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[12px] text-blue-600 font-bold uppercase tracking-tight">
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
                                                <p className="bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit text-[13px] text-slate-400 uppercase font-bold">{claim.ifsc_code}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="text-[13px] text-center text-blue-500 uppercase font-bold">{claim.account_no}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-md font-bold text-green-700">₹{claim.amount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-slate-700 font-bold">{new Date(claim.entry_date).toLocaleDateString('en-GB')}</span>
                                            </td>
                                            {viewMode === 'individual' && (
                                                <td className="px-4 py-4 bg-white group-hover:bg-slate-50/80 transition-colors z-10 px-6">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => openEditModal(claim)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="Edit">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(claim._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
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

            {/* Submit Button */}
            {!fetchLoading && !fetchError && displayedClaims.length > 0 && (
                <div className="mt-8 text-center flex justify-end gap-4">
                    <button
                        className={`inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitEnabled ? 'hover:bg-blue-700 hover:shadow-lg' : ''}`}
                        onClick={handleSubmitClaims}
                        disabled={!isSubmitEnabled}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Submit to Principal
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Modal for "All Bank Types" */}
            {showBankTypeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowBankTypeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                        <div className="text-center mb-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">All Bank Types Selected</h3>
                            <p className="text-slate-500 mt-2 text-sm">
                                You are about to submit claims from <strong>all bank types</strong> (IOB JMC, IOB Other, Other Banks).<br />
                                This may include a large number of claims. Are you sure you want to continue?
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowBankTypeModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={proceedWithSubmission} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                                Yes, Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && editingClaim && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-3xl overflow-hidden border-t-[6px] border-blue-600 animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[85vh]">

                        {/* 1. FIXED HEADER */}
                        <div className="p-6 md:p-8 border-b border-slate-100 bg-white z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                        <Edit3 size={22} />
                                    </span>
                                    Edit Claim Amount
                                </h2>
                                <button
                                    onClick={closeEditModal}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 mt-2 ml-1">Only the amount field can be modified.</p>
                        </div>

                        {/* 2. SCROLLABLE CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-2 scrollbar-hide">
                            <style dangerouslySetInnerHTML={{
                                __html: `.scrollbar-hide::-webkit-scrollbar { display: none; }`
                            }} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Read-Only Fields */}
                                <div>
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] mb-2 ml-1 block">Staff Name</label>
                                    <input type="text" value={editingClaim.staff_name || ''} readOnly className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] mb-2 ml-1 block">Phone Number</label>
                                    <input type="text" value={editingClaim.phone_number || ''} readOnly className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] mb-2 ml-1 block">Claim Type</label>
                                    <input type="text" value={editingClaim.claim_type_name || ''} readOnly className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] mb-2 ml-1 block">Account Number</label>
                                    <input type="text" value={editingClaim.account_no || ''} readOnly className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] mb-2 ml-1 block">IFSC Code</label>
                                    <input type="text" value={editingClaim.ifsc_code || ''} readOnly className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] mb-2 ml-1 block">Category</label>
                                    <input type="text" value={editingClaim.internal_external || ''} readOnly className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] mb-2 ml-1 block">Entry Date</label>
                                    <input type="date" value={editingClaim.entry_date ? new Date(editingClaim.entry_date).toLocaleDateString('en-CA') : ''} readOnly className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600" />
                                </div>
                                {/* Editable Amount Field - no spinner */}
                                <div>
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] mb-2 ml-1 block">Amount (₹)</label>
                                    <input
                                        type="text"
                                        name="amount"
                                        value={editingClaim.amount || ''}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                handleEditChange(e);
                                            }
                                        }}
                                        className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-bold text-blue-700 outline-none"
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. STICKY FOOTER */}
                        <div className="p-6 border-t border-slate-100 bg-white/90 backdrop-blur-sm flex items-center gap-4">
                            <button
                                onClick={closeEditModal}
                                className="py-4 w-1/2 bg-slate-200 rounded-2xl text-slate-500 tracking-wider font-bold hover:text-slate-600 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleUpdateClaim}
                                disabled={isUpdating}
                                className="py-4 w-1/2 bg-blue-600 text-white rounded-2xl tracking-wider font-bold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isUpdating ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimSubmission;