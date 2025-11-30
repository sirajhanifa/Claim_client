import React, { useEffect, useState } from 'react';
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
    setLoadingClaimId(claimId);

    try {
      const payload = {
        credited_date: new Date(),
        remarks: "Paid via NEFT"
      };

      const response = await axios.put(`${API_URL}/api/finance/update/${claimId}`, payload);

      // update UI list
      setClaims(prev => prev.map(c => c._id === claimId ? response.data : c));
    } catch (error) {
      console.error("Error updating claim:", error);
    } finally {
      setLoadingClaimId(null);
    }
  };

  useEffect(() => {
    getPaymentReportIds();
  }, []);

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
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Claims under <span className="text-blue-600">{selectedPrId}</span>
          </h3>

          {loadingClaims ? (
            <p className="text-gray-500 italic">Loading claims...</p>
          ) : claims.length === 0 ? (
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
                  {claims.map((claim, index) => (
                    <tr key={claim._id} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-2">{claim.staff_name}</td>
                      <td className="px-4 py-2">{claim.claim_type_name}</td>
                      <td className="px-4 py-2">₹{claim.amount}</td>
                      <td className="px-4 py-2">{claim.account_no}</td>
                      <td className="px-4 py-2">{claim.ifsc_code}</td>
                      <td className="px-4 py-2">
                        {new Date(claim.submission_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {claim.credited_date ? new Date(claim.credited_date).toLocaleDateString() : "–"}
                      </td>

                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold 
                          ${claim.status === "Credited"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}>
                          {claim.status}
                        </span>
                      </td>

                      <td className="px-4 py-2">
                        <button
                          onClick={() => markClaimCredited(claim._id)}
                          disabled={claim.status === "Credited" || loadingClaimId === claim._id}
                          className={`
      px-3 py-1 rounded-md text-sm text-white transition
      ${claim.status === "Credited"
                              ? "bg-green-400 cursor-not-allowed"
                              : loadingClaimId === claim._id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }
    `}
                        >
                          {claim.status === "Credited"
                            ? "Credited"
                            : loadingClaimId === claim._id
                              ? "Processing..."
                              : "Mark Credited"}
                        </button>
                      </td>


                    </tr>
                  ))}
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
