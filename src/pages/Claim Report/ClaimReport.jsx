import React, { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ClaimReport = () => {
  const [filter, setFilter] = useState('all');
  const [claimType, setClaimType] = useState('all');
  const [entryDate, setEntryDate] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const { data: claimData, loading, error, refetch } = useFetch(`${apiUrl}/api/getclaimEntry`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const claimTypes = [...new Set(claimData?.map((claim) => claim.claim_type_name))];

  // Core filtered claims for table
  const filteredClaims = claimData?.filter((claim) => {
    switch (filter) {
      case 'submitted':
        if (!claim.submission_date) return false;
        break;
      case 'unsubmitted':
        if (claim.submission_date) return false;
        break;
      case 'credited':
        if (!claim.credited_date) return false;
        break;
      default:
        break;
    }
    if (claimType !== 'all' && claim.claim_type_name !== claimType) return false;
    if (entryDate && new Date(claim.entry_date).toLocaleDateString('en-CA') !== entryDate) return false;
    return true;
  }) || [];

  // Handler for download filtered claims when filter === 'all'
  const handleDownloadClaimTypePDF = () => {
    if (filteredClaims.length === 0) {
      alert('No claims found to download.');
      return;
    }
    const prId = `PR-${new Date().getFullYear()}-TEMP`;
    const submissionDate = new Date().toLocaleDateString('en-GB'); // ✅ always include system date
    createPDF(prId, submissionDate, filteredClaims);
  };



  // PDF creator
  const createPDF = (prId, submittedDate, claims) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`Claims Report - ${prId}`, 14, 12);
    doc.setFontSize(14);

    // Only 6 columns
    const tableColumn = [
      "Sno", "Claim Type", "Staff Name", "Amount", "Entry Date", "Submission Date"
    ];

    const tableRows = claims?.map((claim, index) => [
      index + 1,
      claim.claim_type_name,
      claim.staff_name,
      claim.amount,
      claim.entry_date ? new Date(claim.entry_date).toLocaleDateString('en-GB') : "-",
      claim.submission_date
        ? new Date(claim.submission_date).toLocaleDateString('en-GB')
        : submittedDate // ✅ always put submission date
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fontSize: 10 },
    });
    doc.save(`ClaimEntryReport_${prId}.pdf`);
  };


  // Submit button handler (update only, no PDF)
  const handleSubmitClaims = async () => {
    setIsSubmitting(true);
    try {
      if (filteredClaims.length === 0) {
        alert('No unsubmitted claims to submit.');
        setIsSubmitting(false);
        return;
      }

      const submitRes = await fetch(`${apiUrl}/api/submitClaims`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimType })
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
    setIsSubmitting(true);
    try {
      if (filteredClaims.length === 0) {
        alert('No unsubmitted claims to submit.');
        setIsSubmitting(false);
        return;
      }

      // Send claimType as body param
      const submitRes = await fetch(`${apiUrl}/api/submitClaims`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimType })
      });

      if (submitRes.ok) {
        const result = await submitRes.json();
        const prId = result.prId || existingPrId || `PR-${new Date().getFullYear()}-000`;
        const getDateOnlyString = (dateStr) => {
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-GB'); // DD/MM/YYYY format without time
        };

        const actualSubmittedDate = result.submission_date
          ? getDateOnlyString(result.submission_date)
          : getDateOnlyString(new Date());


        if (refetch) await refetch();

        // After refetch, use updated filtered claims JUST for selected claim type
        const updatedClaims = (claimData || []).filter((claim) => {
          if (claimType !== 'all' && claim.claim_type_name !== claimType) return false;
          if (filter === 'unsubmitted' && claim.submission_date) return false;
          if (entryDate && new Date(claim.entry_date).toLocaleDateString('en-CA') !== entryDate) return false;
          return true;
        });

        createPDF(prId, actualSubmittedDate, updatedClaims);
      } else {
        const result = await submitRes.json();
        alert(result.message || 'Failed to submit claims.');
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
    const submittedFilteredClaims = (claimData || []).filter((claim) =>
      claim.payment_report_id === existingPrId &&
      (claimType === 'all' || claim.claim_type_name === claimType)
    );
    createPDF(existingPrId, existingSubmissionDate, submittedFilteredClaims);
  };


  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Claim Entry Report</h2>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap justify-center gap-6">
        <div className="flex gap-4">
          {['all', 'submitted', 'unsubmitted', 'credited'].map((type) => (
            <label key={type} className="flex items-center gap-2 text-gray-700">
              <input
                type="radio"
                name="filter"
                value={type}
                checked={filter === type}
                onChange={(e) => setFilter(e.target.value)}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
        <select
          value={claimType}
          onChange={(e) => setClaimType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="all">All Claim Types</option>
          {claimTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>
      {/* Only show Download PDF button when radio 'All' is selected */}
      <div className='-mt-16'>
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
      <h1 className='text-lg font-bold text-end mt-4'>No.of.Claims : {filteredClaims.length} </h1>
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 mt-5">
        <table className="min-w-full bg-white">
          <thead className="bg-blue-950 border-b-2 border-gray-300">
            <tr>
              {["S.No", "Claim Type", "Staff Name", "Amount", "Entry Date", "Submission Date", "Credited Date", "Status", "Payment Id"]
                .map(h => (
                  <th key={h} className="text-left p-3 font-semibold text-sm text-white">{h}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((claim, index) => (
              <tr
                key={claim._id}
                className={index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}
              >
                <td className="p-3 text-sm font-semibold text-gray-700">{index + 1}</td>
                <td className="p-3 text-sm font-semibold text-gray-800">{claim.claim_type_name}</td>
                <td className="p-3 text-sm font-semibold text-gray-800">{claim.staff_name}</td>
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
              </tr>
            ))}
            {filteredClaims.length === 0 && (
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
      {filter === 'unsubmitted' && filteredClaims.length > 0 && (
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
















