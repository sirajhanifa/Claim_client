import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useFetch from '../hooks/useFetch';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Trash2, Search, Phone, Download, FileText, Filter, ChevronDown, Layers, Calendar, Landmark, X, Loader2 } from "lucide-react";
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo1 from '../assets/75.jpeg';
import logo2 from '../assets/logo.jpeg';

const ClaimSubmission = () => {

    // Filter states
    const [claimType, setClaimType] = useState('all');
    const [entryDate, setEntryDate] = useState('');
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [ifscFilter, setIfscFilter] = useState("all");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showBankTypeModal, setShowBankTypeModal] = useState(false);

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
            if (claimType !== "all" && claim.claim_type_name !== claimType) return false;
            if (categoryFilter !== "all") {
                if (categoryFilter !== "TDS" && claim.internal_external !== categoryFilter) return false;
                if (categoryFilter === "TDS" && claim.category !== "AIDED") return false;
            }
            let ifscMatch = true;
            if (ifscFilter === "JMC_IOB") ifscMatch = claim.ifsc_code === "IOBA0000467";
            else if (ifscFilter === "IOB_OTHERS") ifscMatch = claim.ifsc_code?.startsWith("IOBA") && claim.ifsc_code !== "IOBA0000467";
            else if (ifscFilter === "OTHER_BANKS") ifscMatch = !claim.ifsc_code?.startsWith("IOBA");
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

    const displayedClaims = useMemo(() => mergeDuplicates(filteredClaims), [filteredClaims, mergeDuplicates]);
    const totalAmount = useMemo(() => displayedClaims.reduce((sum, claim) => sum + (Number(claim.amount) || 0), 0), [displayedClaims]);

    // Handlers 
    const handleDownloadExcel = () => {
        if (displayedClaims.length === 0) {
            alert("No data available to download");
            return;
        }
        const excelData = displayedClaims.map((claim, index) => ({
            "S.No": index + 1,
            "Date": new Date(claim.entry_date).toLocaleDateString("en-GB"),
            "Name": claim.staff_name,
            "College": claim.college,
            "Department": claim.department,
            "Amount Paid": claim.amount,
            "IFSC Code": claim.ifsc_code,
            "Account No": claim.account_no,
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const file = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(file, `Unsubmitted Claims ${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

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
        doc.save(`PendingClaims_${prId}.pdf`);
    };

    const handleDownloadClaimTypePDF = () => {
        if (displayedClaims.length === 0) {
            alert('No pending claims found to download.');
            return;
        }
        const prId = `PR-${new Date().getFullYear()}-TEMP`;
        const submissionDate = new Date().toLocaleDateString('en-GB');
        createPDF(prId, submissionDate, displayedClaims);
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
            await axios.delete(`${apiUrl}/api/delete/${id}`);
            alert("Claim deleted successfully");
            await refetch();
        } catch (error) {
            console.error(error);
            alert("Error deleting claim");
        }
    };

    return (
        <div>
            {/* Header Section */}
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
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleDownloadClaimTypePDF}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
                    >
                        <FileText className="w-4 h-4" />
                        Download PDF
                    </button>
                    <button
                        onClick={handleDownloadExcel}
                        className="flex items-center gap-2 bg-green-700 border border-slate-200 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Download Excel
                    </button>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            <Filter className="w-3 h-3" />
                            Claim Type
                        </label>
                        <select
                            value={claimType}
                            onChange={(e) => setClaimType(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${claimType !== 'all' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="all">All Claim Types</option>
                            {claimTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            <Layers className="w-3 h-3" />
                            Category
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${categoryFilter !== 'all' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="all">All Categories</option>
                            <option value="INTERNAL">INTERNAL</option>
                            <option value="EXTERNAL">EXTERNAL</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            <Landmark className="w-3 h-3" />
                            Bank Type
                        </label>
                        <select
                            value={ifscFilter}
                            onChange={(e) => setIfscFilter(e.target.value)}
                            className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer ${ifscFilter !== 'all' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            <option value="all">All Bank Types</option>
                            <option value="JMC_IOB">IOB JMC Branch</option>
                            <option value="IOB_OTHERS">IOB Other Branch</option>
                            <option value="OTHER_BANKS">Other Banks</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
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
                                    {["S.No", "Staff Details", "Staff Type", "Claim Type", "Contact", "IFSC", "Account Number", "Amount", "Entry Date"].map((h, i) => (
                                        <th key={i} className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {fetchLoading ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                                                <p className="text-slate-500 text-sm">Loading pending claims...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : fetchError ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16">
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
                                        <td colSpan={10} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                                    <Search className="w-10 h-10 text-slate-200" />
                                                </div>
                                                <h3 className="text-slate-800 font-bold">No pending claims</h3>
                                                <p className="text-slate-400 text-sm">There are no unsubmitted records matching your filters.</p>
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
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-[14px]  leading-none text-blue-600 font-bold uppercase">
                                                    {categoryFilter === "TDS" ? "AIDED" : claim.internal_external}
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
                                                <p className=" bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit text-[13px] text-slate-400 uppercase font-bold">{claim.ifsc_code}</p>
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
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubmitClaims}
                        disabled={isSubmitting}
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
                                Submit Claims
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Modal */}
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
        </div>
    );
};

export default ClaimSubmission;