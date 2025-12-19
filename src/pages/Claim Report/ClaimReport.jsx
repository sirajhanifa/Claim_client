import React, {useState, useMemo} from 'react';
import useFetch from '../../hooks/useFetch';
import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import {Trash2} from "lucide-react";
import axios from 'axios';
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import logo1 from '../../assets/75.jpeg';
import logo2 from '../../assets/logo.jpeg'

const ClaimReport = () => {
  const [filter, setFilter] = useState('all');
  const [claimType, setClaimType] = useState('all');
  const [entryDate, setEntryDate] = useState('');
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all"); // INTERNAL / EXTERNAL

  const apiUrl = import.meta.env.VITE_API_URL;
  const {data: claimData, loading, error, refetch} = useFetch(`${apiUrl}/api/getclaimEntry`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const claimTypes = [...new Set(claimData?.map((claim) => claim.claim_type_name))];

  const handleDownloadExcel = () => {
    if (displayedClaims.length === 0) {
      alert("No data available to download");
      return;
    }

    const excelData = displayedClaims.map((claim, index) => {
      const baseData = {
        "S.No": index + 1,
        "Category": claim.internal_external,
        "Claim Type": claim.claim_type_name,
        "Staff Name": claim.staff_name,
        "Amount": claim.amount,
        "Entry Date": new Date(claim.entry_date).toLocaleDateString("en-GB"),
        "Submission Date": claim.submission_date
          ? new Date(claim.submission_date).toLocaleDateString("en-GB")
          : "-",
        "Credited Date": claim.credited_date
          ? new Date(claim.credited_date).toLocaleDateString("en-GB")
          : "-",
        "Status": claim.status,
        "Payment ID": claim.payment_report_id || "-"
      };

      // ✅ Include Phone No only for ALL filter
      if (filter === "all" && filter === "submitted" && filter === "unsubmitted" && filter === "credited") {
        baseData["Phone No"] = claim.phone_number;
      }

      return baseData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream"
    });

    saveAs(file, `Claim_Report_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };


  // Core filtered claims for table
  const filteredClaims = claimData?.filter((claim) => {

    // 🔹 Status filter
    switch (filter) {
      case "submitted":
        if (!claim.submission_date) return false;
        break;
      case "unsubmitted":
        if (claim.submission_date) return false;
        break;
      case "credited":
        if (!claim.credited_date) return false;
        break;
      default:
        break;
    }

    // 🔹 Claim Type
    if (claimType !== "all" && claim.claim_type_name !== claimType) return false;

    // 🔹 INTERNAL / EXTERNAL
    if (categoryFilter !== "all" && claim.internal_external !== categoryFilter) return false;

    // 🔹 Date filter
    if (
      entryDate &&
      new Date(claim.entry_date).toLocaleDateString("en-CA") !== entryDate
    )
      return false;

    // 🔹 Search (Staff Name OR Phone)
    if (search) {
      const searchText = search.toLowerCase();
      const nameMatch = claim.staff_name?.toLowerCase().includes(searchText);
      const phoneMatch = claim.phone_number?.toString().includes(searchText);

      if (!nameMatch && !phoneMatch) return false;
    }

    return true;
  }) || [];

  // Merge duplicates when viewing unsubmitted claims.
  // Duplicates are detected by (claim_type_name, phone_number, staff_name).
  const mergeDuplicates = (claims = []) => {
    const map = new Map();
    for (const c of claims) {
      const key = `${(c.claim_type_name || '').trim()}::${(c.phone_number || '').trim()}::${(c.staff_name || '').trim()}`;
      const entryDate = c.entry_date ? new Date(c.entry_date) : null;
      const submissionDate = c.submission_date ? new Date(c.submission_date) : null;
      const creditedDate = c.credited_date ? new Date(c.credited_date) : null;

      if (!map.has(key)) {
        // clone object so we don't mutate original
        map.set(key, {...c, _mergedCount: 1});
      } else {
        const existing = map.get(key);
        existing.amount = (Number(existing.amount) || 0) + (Number(c.amount) || 0);
        existing._mergedCount = (existing._mergedCount || 1) + 1;
        if (entryDate && (!existing.entry_date || new Date(existing.entry_date) < entryDate)) existing.entry_date = entryDate.toISOString();
        if (submissionDate && (!existing.submission_date || new Date(existing.submission_date) < submissionDate)) existing.submission_date = submissionDate.toISOString();
        if (creditedDate && (!existing.credited_date || new Date(existing.credited_date) < creditedDate)) existing.credited_date = creditedDate.toISOString();
        // prefer most up-to-date status
        if (c.status && c.status !== existing.status) existing.status = c.status;
      }
    }

    return Array.from(map.values());
  };

  const displayedClaims = useMemo(() => {
    if (filter === 'unsubmitted') return mergeDuplicates(filteredClaims);
    return filteredClaims;
  }, [filter, filteredClaims]);


  // Handler for download filtered claims when filter === 'all'
  const handleDownloadClaimTypePDF = () => {
    if (displayedClaims.length === 0) {
      alert('No claims found to download.');
      return;
    }
    const prId = `PR-${new Date().getFullYear()}-TEMP`;
    const submissionDate = new Date().toLocaleDateString('en-GB'); // ✅ always include system date
    createPDF(prId, submissionDate, displayedClaims);
  };


  // PDF creator
  const createPDF = (prId, submittedDate, claims) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add Logos
    doc.addImage(logo2, "JPEG", 15, 10, 25, 25);
    doc.addImage(logo1, "JPEG", pageWidth - 40, 10, 25, 25);

    // College Name
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Jamal Mohamed College (Autonomous)", pageWidth / 2, 20, {align: "center"});

    doc.setFontSize(9);
    doc.text("Accredited with A++ Grade by NAAC (4th Cycle) with CGPA 3.69 out of 4.0.", pageWidth / 2, 27, {align: "center"});

    doc.setFontSize(9);
    doc.text("Tiruchirappalli – 620 020", pageWidth / 2, 33, {align: "center"});

    // PR & Submission
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`PR ID: ${prId}`, 15, 50);
    doc.text(`Date: ${submittedDate}`, pageWidth - 15, 50, {align: "right"});

    // Table Columns
    const tableColumn = [
      "S.No",
      "Category",
      "Entry Date",
      "Name",
      "Department",
      "Claim Type",
      "Amount",
    ];

    const tableRows = claims?.map((claim, index) => [
      index + 1,
      claim.internal_external,
      new Date(claim.entry_date).toLocaleDateString('en-GB'),
      claim.staff_name,
      claim.department,
      claim.claim_type_name,
      claim.amount,
      // claim.submission_date
      //   ? new Date(claim.submission_date).toLocaleDateString('en-GB')
      //   : submittedDate
    ]);

    // AutoTable
    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      styles: {fontSize: 10, halign: "center"},
      headStyles: {fillColor: [0, 51, 102], textColor: "#fff", fontStyle: "bold"},
      columnStyles: {
        0: {cellWidth: 12},
        1: {cellWidth: 22}, // Category
        2: {cellWidth: 30},
        3: {cellWidth: 35},
        4: {cellWidth: 25},
        5: {cellWidth: 28},
        6: {cellWidth: 25},
      }
    });

    // **Signature at bottom-left**
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Controller of Examinations", 15, pageHeight - 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Principal", 180, pageHeight - 20);

    doc.save(`ClaimEntryReport_${prId}.pdf`);
  };



  // Submit button handler (update only, no PDF)
  const handleSubmitClaims = async () => {
    if (
      !confirm(`Submit ${categoryFilter} ${claimType} claims?`)
    ) return;
    setIsSubmitting(true);
    try {
      if (displayedClaims.length === 0) {
        alert('No unsubmitted claims to submit.');
        setIsSubmitting(false);
        return;
      }

      const submitRes = await fetch(`${apiUrl}/api/submitClaims`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          claimType,
          category: categoryFilter
        })
      });

      if (submitRes.ok) {
        const result = await submitRes.json();
        alert(result.message || 'Claims submitted successfully');
        if (refetch) await refetch(); // refresh table
      } else {
        const result = await submitRes.json();
        alert(result.message || 'Failed to submit claims.');
      }
    } catch (err) {
      alert('Failed to submit claims.');
    }
    setIsSubmitting(false);
  };

  const handleSubmitAndDownloadPDF = async () => {
    if (displayedClaims.length === 0) {
      alert('No unsubmitted claims to submit.');
      return;
    }
    setIsSubmitting(true);
    try {
      const submitRes = await fetch(`${apiUrl}/api/submitClaims`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({claimType})
      });

      const result = await submitRes.json();

      if (submitRes.ok) {
        const prId = result.prId;

        const getDateOnlyString = (dateStr) => {
          return new Date(dateStr).toLocaleDateString('en-GB');
        };

        const actualSubmittedDate = getDateOnlyString(result.submission_date); // ✅ FIXED

        if (refetch) await refetch();
        const updatedClaims = claimData.filter(c =>
          (claimType === 'all' || c.claim_type_name === claimType)
        );
        const updatedClaimsMerged = filter === 'unsubmitted' ? mergeDuplicates(updatedClaims) : updatedClaims;
        createPDF(prId, actualSubmittedDate, updatedClaimsMerged);
      } else {
        alert(result.message);
      }

    } catch (err) {
      alert('Failed to submit claims.');
    }
    setIsSubmitting(false);
  };

  // Downloads PDF only for currently shown submitted claims (filtered by claimType)
  const handleDownloadExistingPDF = () => {
    if (!existingPrId) {
      alert('No submitted claims available to download PDF.');
      return;
    }
    const submittedFilteredClaims = (displayedClaims || []).filter((claim) =>
      claim.payment_report_id === existingPrId &&
      (claimType === 'all' || claim.claim_type_name === claimType)
    );
    createPDF(existingPrId, existingSubmissionDate, submittedFilteredClaims);
  };


  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this claim?")) return;

    try {
      const res = await axios.delete(`${apiUrl}/api/delete/${id}`);

      alert("Claim deleted successfully");

      // Remove deleted claim from UI
      // If you are using useFetch → refetch instead of setClaims
      if (refetch) {
        refetch();
      }

    } catch (error) {
      console.log(error);
      alert("Error deleting claim");
    }
  };


  return (
    <div className="p-6">

      {/* Filters Container */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border space-y-4">

        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Search */}
          <input
            type="text"
            placeholder="Search Staff Name / Phone No"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-500 rounded px-3 py-2 w-72"
          />

          {/* Claim Type */}
          <select
            value={claimType}
            onChange={(e) => setClaimType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 min-w-[200px]"
          >
            <option value="all">All Claim Types</option>
            {claimTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 min-w-[180px]"
          >
            <option value="all">All Categories</option>
            <option value="INTERNAL">INTERNAL</option>
            <option value="EXTERNAL">EXTERNAL</option>
          </select>

          {/* Date */}
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {/* Radio Buttons */}
          <div className="flex items-center gap-4">
            {['all', 'submitted', 'unsubmitted', 'credited'].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 text-lg font-semibold text-gray-700"
              >
                <input
                  type="radio"
                  name="filter"
                  value={type}
                  checked={filter === type}
                  onChange={(e) => setFilter(e.target.value)}
                  className="accent-blue-700"
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>

        </div>
      </div>


      {/* Only show Download PDF button when radio 'All' is selected */}
      <div className='flex justify-between'>
        <button
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
          onClick={handleDownloadExcel}
        >
          Download Excel
        </button>

        {filter === 'all' && (
          <div className="text-center flex justify-end">
            <button
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
              onClick={handleDownloadClaimTypePDF}
              disabled={isSubmitting}
            >
              Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <h1 className='text-lg font-bold text-end mt-4'>No.of.Claims : {displayedClaims.length} </h1>
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 mt-5">
        <table className="min-w-full bg-white">
          <thead className="border-b-2 border-gray-300">
            <tr className="bg-blue-950 text-left p-3 font-semibold text-sm text-white">
              {["S.No", "Category", "Claim Type", "Staff Name", "Phone No", "Amount", "Entry Date", "Submission Date", "Credited Date", "Status", "Payment Id"]
                .map(h => (
                  <th key={h} className="text-left p-3 font-semibold text-sm text-white">
                    {h}
                  </th>
                ))}

              {filter === "all" && (
                <th className="text-left p-3 font-semibold text-sm text-white">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {displayedClaims.map((claim, index) => (
              <tr
                key={claim._id}
                className={index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}
              >
                <td className="p-3 text-sm font-semibold text-gray-700">{index + 1}</td>
                <td className="p-3 text-sm font-semibold text-gray-800">{claim.internal_external}</td>
                <td className="p-3 text-sm font-semibold text-gray-800">{claim.claim_type_name}</td>
                <td className="p-3 text-sm font-semibold text-gray-800">{claim.staff_name}</td>
                <td className="p-3 text-sm font-semibold text-gray-800">{claim.phone_number}</td>
                <td className="p-3 text-sm font-semibold text-green-700">₹{claim.amount}</td>
                <td className="p-3 text-sm font-semibold text-gray-600">
                  {new Date(claim.entry_date).toLocaleDateString('en-GB')}
                </td>
                <td className="p-3 text-sm font-semibold text-gray-600">
                  {claim.submission_date ? new Date(claim.submission_date).toLocaleDateString('en-GB') : '-'}
                </td>
                <td className="p-3 text-sm font-semibold text-gray-600">
                  {claim.credited_date ? new Date(claim.credited_date).toLocaleDateString('en-GB') : '-'}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300
      ${claim.status === 'Credited'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}
                  >
                    {claim.status === 'Credited' ? (
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 011.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v2h2v-2zm0-8H9v6h2V5z" />
                      </svg>
                    )}
                    {claim.status}
                  </span>

                </td>

                <td className="p-3 text-sm font-semibold text-gray-800">{claim.payment_report_id}</td>
                {filter === "all" && (
                  (claim._mergedCount && claim._mergedCount > 1) ? (
                    <div className="text-xs text-gray-500">Merged ({claim._mergedCount})</div>
                  ) : (
                    <button
                      onClick={() => handleDelete(claim._id)}
                      className="p-2 rounded-full mt-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )
                )}
              </tr>
            ))}
            {displayedClaims.length === 0 && (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
                  No claim entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      {filter === 'unsubmitted' && displayedClaims.length > 0 && (
        <div className="mt-5 text-center flex justify-end gap-4">
          {/* Download PDF */}
          <button
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
            onClick={handleDownloadClaimTypePDF}
            disabled={isSubmitting}
          >
            Download PDF
          </button>

          {/* Submit claims (update only) */}
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
            onClick={handleSubmitClaims}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit Claims"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClaimReport;































// import React, { useState } from 'react';
// import useFetch from '../../hooks/useFetch';
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

// import logo1 from '../../assets/75.jpeg';
// import logo2 from '../../assets/logo.jpeg'

// const ClaimReport = () => {
//   const [filter, setFilter] = useState('all');
//   const [claimType, setClaimType] = useState('all');
//   const [entryDate, setEntryDate] = useState('');
//   const apiUrl = import.meta.env.VITE_API_URL;
//   const { data: claimData, loading, error, refetch } = useFetch(${apiUrl}/api/getclaimEntry);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const claimTypes = [...new Set(claimData?.map((claim) => claim.claim_type_name))];

//   // Core filtered claims for table
//   const filteredClaims = claimData?.filter((claim) => {
//     switch (filter) {
//       case 'submitted':
//         if (!claim.submission_date) return false;
//         break;
//       case 'unsubmitted':
//         if (claim.submission_date) return false;
//         break;
//       case 'credited':
//         if (!claim.credited_date) return false;
//         break;
//       default:
//         break;
//     }
//     if (claimType !== 'all' && claim.claim_type_name !== claimType) return false;
//     if (entryDate && new Date(claim.entry_date).toLocaleDateString('en-CA') !== entryDate) return false;
//     return true;
//   }) || [];

//   // Handler for download filtered claims when filter === 'all'
//   const handleDownloadClaimTypePDF = () => {
//     if (filteredClaims.length === 0) {
//       alert('No claims found to download.');
//       return;
//     }
//     const prId = PR-${new Date().getFullYear()}-TEMP;
//     const submissionDate = new Date().toLocaleDateString('en-GB'); // ✅ always include system date
//     createPDF(prId, submissionDate, filteredClaims);
//   };



//   // PDF creator
//   const createPDF = (prId, submittedDate, claims) => {
//     const doc = new jsPDF();
//     doc.setFontSize(22);
//     doc.text(Claims Report - ${prId}, 14, 12);
//     doc.setFontSize(14);

//     // Only 6 columns
//     const tableColumn = [
//       "Sno", "Claim Type", "Staff Name", "Amount", "Entry Date", "Submission Date"
//     ];

//     const tableRows = claims?.map((claim, index) => [
//       index + 1,
//       claim.claim_type_name,
//       claim.staff_name,
//       claim.amount,
//       claim.entry_date ? new Date(claim.entry_date).toLocaleDateString('en-GB') : "-",
//       claim.submission_date
//         ? new Date(claim.submission_date).toLocaleDateString('en-GB')
//         : submittedDate // ✅ always put submission date
//     ]);

//     autoTable(doc, {
//       head: [tableColumn],
//       body: tableRows,
//       startY: 28,
//       styles: { fontSize: 8 },
//       headStyles: { fontSize: 10 },
//     });
//     doc.save(ClaimEntryReport_${prId}.pdf);
//   };


//   // Submit button handler (update only, no PDF)
//   const handleSubmitClaims = async () => {
//     setIsSubmitting(true);
//     try {
//       if (filteredClaims.length === 0) {
//         alert('No unsubmitted claims to submit.');
//         setIsSubmitting(false);
//         return;
//       }

//       const submitRes = await fetch(${apiUrl}/api/submitClaims, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ claimType })
//       });

//       if (submitRes.ok) {
//         const result = await submitRes.json();
//         alert(result.message || 'Claims submitted successfully');
//         if (refetch) await refetch(); // refresh table
//       } else {
//         const result = await submitRes.json();
//         alert(result.message || 'Failed to submit claims.');
//       }
//     } catch (err) {
//       alert('Failed to submit claims.');
//     }
//     setIsSubmitting(false);
//   };

//   const handleSubmitAndDownloadPDF = async () => {
//     setIsSubmitting(true);
//     try {
//       if (filteredClaims.length === 0) {
//         alert('No unsubmitted claims to submit.');
//         setIsSubmitting(false);
//         return;
//       }

//       // Send claimType as body param
//       const submitRes = await fetch(${apiUrl}/api/submitClaims, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ claimType })
//       });

//       if (submitRes.ok) {
//         const result = await submitRes.json();
//         const prId = result.prId || existingPrId || PR-${new Date().getFullYear()}-000;
//         const getDateOnlyString = (dateStr) => {
//           const d = new Date(dateStr);
//           return d.toLocaleDateString('en-GB'); // DD/MM/YYYY format without time
//         };

//         const actualSubmittedDate = result.submission_date
//           ? getDateOnlyString(result.submission_date)
//           : getDateOnlyString(new Date());


//         if (refetch) await refetch();

//         // After refetch, use updated filtered claims JUST for selected claim type
//         const updatedClaims = (claimData || []).filter((claim) => {
//           if (claimType !== 'all' && claim.claim_type_name !== claimType) return false;
//           if (filter === 'unsubmitted' && claim.submission_date) return false;
//           if (entryDate && new Date(claim.entry_date).toLocaleDateString('en-CA') !== entryDate) return false;
//           return true;
//         });

//         createPDF(prId, actualSubmittedDate, updatedClaims);
//       } else {
//         const result = await submitRes.json();
//         alert(result.message || 'Failed to submit claims.');
//       }
//     } catch (err) {
//       alert('Failed to submit claims.');
//     }
//     setIsSubmitting(false);
//   };

//   // Downloads PDF only for currently shown submitted claims (filtered by claimType)
//   const handleDownloadExistingPDF = () => {
//     if (!existingPrId) {
//       alert('No submitted claims available to download PDF.');
//       return;
//     }
//     const submittedFilteredClaims = (claimData || []).filter((claim) =>
//       claim.payment_report_id === existingPrId &&
//       (claimType === 'all' || claim.claim_type_name === claimType)
//     );
//     createPDF(existingPrId, existingSubmissionDate, submittedFilteredClaims);
//   };


//   return (
//     <div className="p-6">
//       <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Claim Entry Report</h2>

//       {/* Filters */}
//       <div className="mb-6 flex flex-wrap justify-center gap-6">
//         <div className="flex gap-4">
//           {['all', 'submitted', 'unsubmitted', 'credited'].map((type) => (
//             <label key={type} className="flex items-center gap-2 text-gray-700">
//               <input
//                 type="radio"
//                 name="filter"
//                 value={type}
//                 checked={filter === type}
//                 onChange={(e) => setFilter(e.target.value)}
//               />
//               {type.charAt(0).toUpperCase() + type.slice(1)}
//             </label>
//           ))}
//         </div>
//         <select
//           value={claimType}
//           onChange={(e) => setClaimType(e.target.value)}
//           className="border border-gray-300 rounded px-3 py-2"
//         >
//           <option value="all">All Claim Types</option>
//           {claimTypes.map((type) => (
//             <option key={type} value={type}>{type}</option>
//           ))}
//         </select>
//         <input
//           type="date"
//           value={entryDate}
//           onChange={(e) => setEntryDate(e.target.value)}
//           className="border border-gray-300 rounded px-3 py-2"
//         />
//       </div>
//       {/* Only show Download PDF button when radio 'All' is selected */}
//       <div className='-mt-16'>
//         {filter === 'all' && (
//           <div className="text-center flex justify-end">
//             <button
//               className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
//               onClick={handleDownloadClaimTypePDF}
//               disabled={isSubmitting}
//             >
//               Download PDF
//             </button>
//           </div>
//         )}
//       </div>
//       {/* Table */}
//       <h1 className='text-lg font-bold text-end mt-4'>No.of.Claims : {filteredClaims.length} </h1>
//       <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 mt-5">
//         <table className="min-w-full bg-white">
//           <thead className="bg-blue-950 border-b-2 border-gray-300">
//             <tr>
//               {["S.No", "Claim Type", "Staff Name", "Amount", "Entry Date", "Submission Date", "Credited Date", "Status", "Payment Id"]
//                 .map(h => (
//                   <th key={h} className="text-left p-3 font-semibold text-sm text-white">{h}</th>
//                 ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredClaims.map((claim, index) => (
//               <tr
//                 key={claim._id}
//                 className={index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}
//               >
//                 <td className="p-3 text-sm font-semibold text-gray-700">{index + 1}</td>
//                 <td className="p-3 text-sm font-semibold text-gray-800">{claim.claim_type_name}</td>
//                 <td className="p-3 text-sm font-semibold text-gray-800">{claim.staff_name}</td>
//                 <td className="p-3 text-sm font-semibold text-green-700">₹{claim.amount}</td>
//                 <td className="p-3 text-sm font-semibold text-gray-600">
//                   {new Date(claim.entry_date).toLocaleDateString('en-GB')}
//                 </td>
//                 <td className="p-3 text-sm font-semibold text-gray-600">
//                   {claim.submission_date ? new Date(claim.submission_date).toLocaleDateString('en-GB') : '-'}
//                 </td>
//                 <td className="p-3 text-sm font-semibold text-gray-600">
//                   {claim.credited_date ? new Date(claim.credited_date).toLocaleDateString('en-GB') : '-'}
//                 </td>
//                 <td className="px-4 py-2">
//                   <span
//                     className={inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300
//       ${claim.status === 'Credited'
//                         ? 'bg-green-100 text-green-800 border border-green-300'
//                         : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
//                       }}
//                   >
//                     {claim.status === 'Credited' ? (
//                       <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 011.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     ) : (
//                       <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
//                         <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v2h2v-2zm0-8H9v6h2V5z" />
//                       </svg>
//                     )}
//                     {claim.status}
//                   </span>
//                 </td>

//                 <td className="p-3 text-sm font-semibold text-gray-800">{claim.payment_report_id}</td>
//               </tr>
//             ))}
//             {filteredClaims.length === 0 && (
//               <tr>
//                 <td colSpan="9" className="p-4 text-center text-gray-500">
//                   No claim entries found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Buttons */}
//       {filter === 'unsubmitted' && filteredClaims.length > 0 && (
//         <div className="mt-5 text-center flex justify-end gap-4">
//           {/* Download PDF */}
//           <button
//             className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
//             onClick={handleDownloadClaimTypePDF}
//             disabled={isSubmitting}
//           >
//             Download PDF
//           </button>

//           {/* Submit claims (update only) */}
//           <button
//             className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
//             onClick={handleSubmitClaims}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? "Processing..." : "Submit Claims"}
//           </button>
//         </div>
//       )}




//     </div>
//   );
// };

// export default ClaimReport;


