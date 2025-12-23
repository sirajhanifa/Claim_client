import React, {useEffect, useState, useMemo} from 'react';
import axios from 'axios';



const PaymentProcess = () => {
  const API_URL = import.meta.env.VITE_API_URL;   // ✅ IMPORTANT
  console.log(API_URL)
  const [prList, setPrList] = useState([]);
  const [selectedPrId, setSelectedPrId] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [loadingClaimId, setLoadingClaimId] = useState(null);

  // Fetch PR IDs
  const getPaymentReportIds = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/finance/pr-ids`);
      setPrList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching PR IDs:', error);
      setPrList([]);
    }
  };

  // Fetch claims by PR ID
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

  // Mark Claim Credited
  const markClaimCredited = async (claimId) => {
    if (!confirm('Mark this claim as credited?')) return;
    setLoadingClaimId(claimId);

    try {
      const payload = {
        credited_date: new Date(),
        remarks: "Paid via NEFT"
      };

      // include payment report id for backend context
      payload.payment_report_id = selectedPrId;
      const response = await axios.put(`${API_URL}/api/finance/update/${claimId}`, payload);

      // update UI list (and refresh from server to ensure consistency)
      setClaims(prev => prev.map(c => c._id === claimId ? response.data : c));
      if (selectedPrId) getClaimsByPrId(selectedPrId);
    } catch (error) {
      console.error("Error updating claim:", error);
    } finally {
      setLoadingClaimId(null);
    }
  };

  // Mark multiple claims credited (for merged groups)
  const markClaimsCredited = async (claimIds = [], loadingKey = null) => {
    if (!Array.isArray(claimIds) || claimIds.length === 0) return;
    if (!confirm(`Mark ${claimIds.length} claim(s) as credited?`)) return;
    // Use a per-call loading key so only the intended rows show "Processing..." (use 'bulk' for header 'Mark All')
    setLoadingClaimId(loadingKey || 'bulk');

    const payload = {
      claimIds,
      payment_report_id: selectedPrId,
      credited_date: new Date(),
      remarks: "Paid via NEFT"
    };

    try {
      // Try batch endpoint first (server may or may not support it)
      try {
        const res = await axios.put(`${API_URL}/api/finance/update-multiple`, payload);
        // If server returns updated claims list, replace corresponding items
        if (Array.isArray(res.data)) {
          const updatedMap = new Map(res.data.map(c => [c._id, c]));
          setClaims(prev => prev.map(c => updatedMap.get(c._id) || c));
          return;
        }
      } catch (err) {
        // ignore and fallback to updating individually
        console.warn('Batch update failed, falling back to individual updates', err.message || err);
      }

      // Fallback: update each claim individually
      for (const id of claimIds) {
        try {
          const res = await axios.put(`${API_URL}/api/finance/update/${id}`, {credited_date: payload.credited_date, remarks: payload.remarks, payment_report_id: payload.payment_report_id});
          setClaims(prev => prev.map(c => c._id === id ? res.data : c));
        } catch (e) {
          console.error('Failed updating claim', id, e);
        }
      }

    } catch (error) {
      console.error("Error updating claims:", error);
    } finally {
      setLoadingClaimId(null);
      // refresh list from server to ensure consistency
      if (selectedPrId) getClaimsByPrId(selectedPrId);
    }
  };

  useEffect(() => {
    getPaymentReportIds();
  }, []);

  // Merge duplicates (name, phone, claim type, pr id) for display
  const displayedClaims = useMemo(() => {
    if (!claims || claims.length === 0) return [];
    const map = new Map();
    for (const c of claims) {
      const key = `${(c.staff_name || '').trim()}::${(c.phone_number || '').trim()}::${(c.claim_type_name || '').trim()}::${(c.payment_report_id || '').trim()}`;
      const submissionDate = c.submission_date ? new Date(c.submission_date) : null;
      const creditedDate = c.credited_date ? new Date(c.credited_date) : null;

      if (!map.has(key)) {
        map.set(key, {...c, _mergedCount: 1, _claimIds: [c._id]});
      } else {
        const ex = map.get(key);
        ex.amount = (Number(ex.amount) || 0) + (Number(c.amount) || 0);
        ex._mergedCount = (ex._mergedCount || 1) + 1;
        ex._claimIds.push(c._id);
        if (submissionDate && (!ex.submission_date || new Date(ex.submission_date) < submissionDate)) ex.submission_date = submissionDate.toISOString();
        if (creditedDate && (!ex.credited_date || new Date(ex.credited_date) < creditedDate)) ex.credited_date = creditedDate.toISOString();
        // keep latest status
        if (c.status && c.status !== ex.status) ex.status = c.status;
      }
    }
    return Array.from(map.values());
  }, [claims]);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">💳 Payment Processing</h2>

      {/* PR ID CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prList.map(pr => (
          <div
            key={pr.payment_report_id}
            onClick={() => getClaimsByPrId(pr.payment_report_id)}
            className="cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <h4 className="text-lg font-semibold text-blue-700">
              {pr.payment_report_id}
            </h4>
            <p className="text-gray-700">{pr.count} claims</p>
          </div>
        ))}
      </div>

      {/* Claims Table */}
      {selectedPrId && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-700">
              Claims under <span className="text-blue-600">{selectedPrId}</span>
            </h3>
            <div>
              <button
                onClick={() => {
                  const allClaimIds = displayedClaims.flatMap(c => c._claimIds ? c._claimIds : [c._id]);
                  markClaimsCredited(allClaimIds);
                }}
                disabled={loadingClaimId || displayedClaims.length === 0 || !displayedClaims.some(c => c.status !== "Credited")}
                className={`px-3 py-1 rounded-md text-sm text-white transition ${loadingClaimId ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loadingClaimId ? "Processing..." : "Mark All Credited"}
              </button>
            </div>
          </div>

          {loadingClaims ? (
            <p className="text-gray-500 italic">Loading claims...</p>
          ) : displayedClaims.length === 0 ? (
            <p className="text-gray-500 italic">No claims found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Staff Name</th>
                    <th className="px-4 py-2">Claim Type</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Account No</th>
                    <th className="px-4 py-2">IFSC</th>
                    <th className="px-4 py-2">Submission</th>
                    <th className="px-4 py-2">Credited</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {([...displayedClaims]
                    .sort((a, b) => (a.ifsc_code || "").localeCompare(b.ifsc_code || "")))
                    .map((claim, index) => {
                      const key = claim._claimIds ? claim._claimIds.join('-') : claim._id;
                      const isMerged = claim._mergedCount && claim._mergedCount > 1;
                      // Disable individual buttons when bulk processing is in progress
                      const loadingForThis = loadingClaimId && (loadingClaimId === 'bulk' || loadingClaimId === claim._id || loadingClaimId === (claim._claimIds || []).join(','));
                      return (
                        <tr key={key} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-4 py-2">{claim.staff_name}{isMerged ? <span className="ml-2 text-xs text-gray-500">(Merged {claim._mergedCount})</span> : null}</td>
                          <td className="px-4 py-2">{claim.claim_type_name}</td>
                          <td className="px-4 py-2">₹{claim.amount}</td>
                          <td className="px-4 py-2">{claim.account_no}</td>
                          <td className="px-4 py-2">{claim.ifsc_code}</td>
                          <td className="px-4 py-2">{claim.submission_date ? new Date(claim.submission_date).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-2">{claim.credited_date ? new Date(claim.credited_date).toLocaleDateString() : '–'}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${claim.status === "Credited" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {isMerged ? (
                              <button
                                onClick={() => markClaimsCredited(claim._claimIds, (claim._claimIds || []).join(','))}
                                disabled={claim.status === "Credited" || Boolean(loadingClaimId)}
                                className={`px-3 py-1 rounded-md text-sm text-white transition ${claim.status === "Credited" ? "bg-green-400 cursor-not-allowed" : loadingForThis ? "bg-gray-400 cursor-not-allowed" : Boolean(loadingClaimId) ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                              >
                                {loadingForThis ? "Processing..." : `Mark Credited (${claim._mergedCount})`}
                              </button>
                            ) : (
                              <button
                                onClick={() => markClaimCredited(claim._id)}
                                disabled={claim.status === "Credited" || Boolean(loadingClaimId)}
                                className={`px-3 py-1 rounded-md text-sm text-white transition ${claim.status === "Credited" ? "bg-green-400 cursor-not-allowed" : loadingForThis ? "bg-gray-400 cursor-not-allowed" : Boolean(loadingClaimId) ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                              >
                                {claim.status === "Credited" ? "Credited" : loadingForThis ? "Processing..." : "Mark Credited"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>


              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentProcess;
