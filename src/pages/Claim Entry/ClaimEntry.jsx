import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useFetch from '../../hooks/useFetch';
import usePost from '../../hooks/usePost';
import QpsFields from './QpsFields';
import CiaReapear from './CiaReapear';
import ScrutinyField from './ScrutinyField';
import CentralValuation from './CentralValuation';
import PracticalClaim from './PracticalFields';
import PracticalFields from './PracticalFields';
import AbilityEnhancementClaim from './AbilityEnhancementClaim';
import SkilledClaim from './SkilledClaim';

const ClaimEntry = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { data: claimTypes } = useFetch(`${apiUrl}/api/getClaim`);
  const { postData } = usePost();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [form, setForm] = useState({
    // 🔷 General Claim Info
    claim_type_name: '',
    staff_id: '',
    staff_name: '',
    department: '',
    designation: '',
    internal_external: '',
    phone_number: '',
    email: '',
    entry_date: '',
    submission_date: '',
    credited_date: '',
    amount: '',
    remarks: '',
    bank_name: '',
    branch_name: '',
    branch_code: '',
    ifsc_code: '',
    account_no: '',

    // 🔷 QPS Claim
    no_of_qps_ug: '',
    no_of_qps_pg: '',
    no_of_scheme: '',        // No. of Scheme

    // 🔷 Scrutiny Claim
    scrutiny_level: '',           // UG / PG
    scrutiny_no_of_papers: '',    // No. of Papers
    scrutiny_days: '',            // No. of Days Halted

    // 🔷 Practical Exam Claim
    qps_paper_setting: '',        // QPS Paper Setting
    total_students: '',           // Total No. of Students
    days_halted: '',              // No. of Days Halted
    travelling_allowance: '',     // Travelling Allowance
    degree_level: '', // UG / PG for Practical Exam Claim
    tax_type: '',                 // Dropdown: Aided / SF / AICTE
    tax_amount: '',               // Optional Tax Amount

    // 🔷 CIA Reappear Claim
    cia_no_of_papers: '',
    cia_role_type: '',

    // 🔷 Central Valuation Claim
    central_role: '',                 // Chairman / Examiner
    central_total_scripts_ug_pg: '', // Total Scripts
    central_days_halted: '',         // No. of Days Halted
    central_travel_allowance: '',    // Travel Allowance
    central_tax_applicable: '',      // Tax Type (Aided / SF)

    // 🔷 Ability Enhancement Claim ✅
    ability_total_no_students: '',     // Total No. of Students
    ability_no_of_days_halted: '',     // No. of Days Halted
    ability_tax_type: '',              // Aided / AICTE only
  });



  useEffect(() => {
    const fetchAmount = async () => {
      const {
        claim_type_name,
        no_of_qps_pg,
        no_of_qps_ug,
        no_of_scheme,
        no_of_papers,
        scrutiny_level,
        scrutiny_no_of_papers,
        scrutiny_days,
        central_total_scripts_ug_pg,
        central_days_halted,
        central_travel_allowance,
        central_tax_applicable,
        qps_paper_setting,
        total_students,
        days_halted,
        travelling_allowance,
        tax_type,
        degree_level,
        ability_no_of_days_halted,
        ability_tax_type,
        ability_total_no_students
      } = form;

      // QPS logic
      if (
        claim_type_name === "QPS" &&
        (!isNaN(parseInt(form.no_of_qps_ug)) || !isNaN(parseInt(form.no_of_qps_pg)) || !isNaN(parseInt(form.no_of_scheme)))
      ) {
        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name,
            no_of_qps_ug: parseInt(form.no_of_qps_ug) || 0,
            no_of_qps_pg: parseInt(form.no_of_qps_pg) || 0,
            no_of_scheme: parseInt(form.no_of_scheme) || 0,
          });

          const { amount } = response.data;
          if (amount !== undefined) {
            setForm((prev) => ({ ...prev, amount: amount.toString() }));
          }
        } catch (error) {
          console.error("Error calculating QPS amount:", error.message);
        }
      }



      // CIA Reappear logic
      if (
        form.claim_type_name === "CIA REAPEAR CLAIM" &&
        form.cia_no_of_papers &&
        !isNaN(form.cia_no_of_papers) &&
        form.cia_role_type
      ) {
        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name: form.claim_type_name,
            no_of_papers: parseInt(form.cia_no_of_papers),
            role_type: form.cia_role_type,
          });

          const { amount } = response.data;
          if (amount !== undefined) {
            setForm((prev) => ({ ...prev, amount: amount.toString() }));
          }
        } catch (error) {
          console.error("Error calculating CIA amount:", error.message);
        }
      }


      // Scrutiny logic
      if (
        claim_type_name === "SCRUTINY CLAIM" &&
        scrutiny_level &&
        scrutiny_no_of_papers &&
        scrutiny_days &&
        !isNaN(scrutiny_no_of_papers) &&
        !isNaN(scrutiny_days)
      ) {
        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name,
            scrutiny_level,
            scrutiny_no_of_papers: parseInt(scrutiny_no_of_papers),
            scrutiny_days: parseInt(scrutiny_days),
          });

          const { amount } = response.data;
          if (amount !== undefined) {
            setForm((prev) => ({ ...prev, amount: amount.toString() }));
          }
        } catch (error) {
          console.error("Error calculating Scrutiny amount:", error.message);
        }
      }

      // ✅ Central Valuation logic
      if (
        claim_type_name === "CENTRAL VALUATION" &&
        central_total_scripts_ug_pg &&
        central_days_halted &&
        central_travel_allowance &&
        central_tax_applicable && // ensure tax type is selected
        !isNaN(central_total_scripts_ug_pg) &&
        !isNaN(central_days_halted) &&
        !isNaN(central_travel_allowance)
      ) {
        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name,
            total_scripts: parseInt(central_total_scripts_ug_pg),
            days_halted: parseInt(central_days_halted),
            travel_allowance: parseFloat(central_travel_allowance),
            tax_applicable: central_tax_applicable // only "AIDED" or "SF"
          });

          const { amount } = response.data;
          if (amount !== undefined) {
            setForm((prev) => ({ ...prev, amount: amount.toString() }));
          }
        } catch (error) {
          console.error("Error calculating Central Valuation amount:", error.message);
        }
      }

      // Practical Exam Claim logic
      if (
        claim_type_name === "PRACTICAL EXAM CLAIM" &&
        qps_paper_setting &&
        total_students &&
        days_halted &&
        travelling_allowance &&
        tax_type &&
        degree_level &&
        !isNaN(total_students) &&
        !isNaN(days_halted) &&
        !isNaN(travelling_allowance)
      ) {
        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name,
            no_of_qps: parseInt(qps_paper_setting),
            total_no_student: parseInt(total_students),
            no_of_days_halted: parseInt(days_halted),
            tax_applicable: tax_type,
            degree_level
          });

          const { amount } = response.data;
          if (amount !== undefined) {
            setForm((prev) => ({ ...prev, amount: amount.toString() }));
          }
        } catch (error) {
          console.error("Error calculating Practical Exam amount:", error.message);
        }
      }

      // Ability Enhancement Claim logic
      if (
        claim_type_name === "ABILITY ENHANCEMENT CLAIM" &&
        form.ability_total_no_students &&
        form.ability_no_of_days_halted &&
        !isNaN(form.ability_total_no_students) &&
        !isNaN(form.ability_no_of_days_halted)
      ) {
        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name,
            ability_total_no_students: parseInt(form.ability_total_no_students),
            ability_no_of_days_halted: parseInt(form.ability_no_of_days_halted),
            ability_tax_type: form.ability_tax_type || ''
          });

          const { amount } = response.data;
          if (amount !== undefined) {
            setForm((prev) => ({ ...prev, amount: amount.toString() }));
          }
        } catch (error) {
          console.error("Error calculating Ability Enhancement amount:", error.message);
        }
      }

    };

    fetchAmount();
  }, [
    form.claim_type_name,
    form.no_of_qps_ug,
    form.no_of_qps_pg,
    form.no_of_scheme,
    form.no_of_papers,
    form.scrutiny_level,
    form.scrutiny_no_of_papers,
    form.scrutiny_days,
    form.central_total_scripts_ug_pg,
    form.central_days_halted,
    form.central_travel_allowance,
    form.central_tax_applicable,
    form.qps_paper_setting,       // ✅ Added
    form.total_students,          // ✅ Added
    form.days_halted,             // ✅ Added
    form.travelling_allowance,    // ✅ Added
    form.tax_type,                // ✅ Added
    form.degree_level,             // ✅ Added
    form.ability_no_of_days_halted,
    form.ability_total_no_students,
    form.ability_tax_type,
    form.cia_no_of_papers,
    form.cia_role_type

  ]);





  //today date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm((prev) => ({ ...prev, entry_date: today }));
  }, []);


  //fetch Staff by using phone Number
  const handleFetchStaff = async () => {
    if (!phoneNumber) return alert("Enter a phone number");

    try {
      const res = await fetch(`${apiUrl}/api/getStaffByPhone/${phoneNumber}`);
      const data = await res.json();

      if (res.ok) {
        setForm(prev => ({
          ...prev,
          staff_id: data.staff_id,
          staff_name: data.staff_name,
          department: data.department,
          designation: data.designation,
          internal_external: data.employment_type,
          phone_number: phoneNumber, // ✅ SET phone_number HERE
          email: data.email,
          bank_name: data.bank_name || '',
          branch_name: data.branch_name || '',
          branch_code: data.branch_code || '',
          ifsc_code: data.ifsc_code || '',
          account_no: data.bank_acc_no || ''
        }));
      } else {
        alert(data.message || "No staff found");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch staff");
    }
  };

  //Submit the Claim data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postData(`${apiUrl}/api/postClaim`, form);
      alert("Claim submitted successfully");

      setForm({
        claim_type_name: form.claim_type_name,
        staff_id: '',
        staff_name: '',
        department: '',
        designation: '',
        internal_external: '',
        phone_number: '', // ✅ RESET IT HERE
        email: '',
        entry_date: new Date().toISOString().split('T')[0],
        submission_date: '',
        credited_date: '',
        amount: '',
        remarks: '',
        bank_name: '',
        branch_name: '',
        branch_code: '',
        ifsc_code: '',
        account_no: ''
      });

      setPhoneNumber('');
    } catch (err) {
      alert("Failed to submit claim");
    }
  };

  return (
    // <div className="p-8 max-w-full mx-auto">
    //   <h2 className="text-2xl font-bold mb-6 text-blue-900">Claim Entry</h2>

    //   <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2 bg-white p-8 rounded-xl shadow-lg border border-gray-200">

    //     {/* Claim Type */}
    //     <div>
    //       <label className="text-sm font-semibold text-gray-700">Claim Type</label>
    //       <select
    //         value={form.claim_type_name}
    //         onChange={(e) => setForm({ ...form, claim_type_name: e.target.value })}
    //         className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
    //       >
    //         <option value="">Select Type</option>
    //         {claimTypes?.map((c) => (
    //           <option key={c._id} value={c.claim_type_name}>{c.claim_type_name}</option>
    //         ))}
    //       </select>
    //     </div>

    //     {/* Phone Number & Fetch */}
    //     <div>
    //       <label className="text-sm font-semibold text-gray-700">Phone Number</label>
    //       <div className="mt-2 flex gap-2">
    //         <input
    //           type="text"
    //           value={phoneNumber}
    //           onChange={(e) => setPhoneNumber(e.target.value)}
    //           placeholder="Enter Phone Number"
    //           className="flex-1 px-4 py-2 border font-semibold border-gray-300 rounded-lg"
    //         />
    //         <button
    //           type="button"
    //           onClick={handleFetchStaff}
    //           className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    //         >
    //           Get
    //         </button>
    //       </div>
    //     </div>

    //     {/* Claim Details Section */}
    //     <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
    //       <h3 className="text-lg font-bold text-blue-800 mb-4">Claim Details</h3>

    //       <div className="grid md:grid-cols-2 gap-6">
    //         {form.claim_type_name === "QPS" && (
    //           <QpsFields form={form} setForm={setForm} />
    //         )}

    //         {form.claim_type_name === "CIA REAPEAR CLAIM" && (
    //           <CiaReapear form={form} setForm={setForm} />
    //         )}

    //         {form.claim_type_name === "SCRUTINY CLAIM" && (
    //           <ScrutinyField form={form} setForm={setForm} />
    //         )}

    //         {form.claim_type_name === "CENTRAL VALUATION" && (
    //           <CentralValuation form={form} setForm={setForm} />
    //         )}

    //         {form.claim_type_name === "PRACTICAL EXAM CLAIM" && (
    //           <PracticalFields form={form} setForm={setForm} />
    //         )}

    //         {form.claim_type_name === "ABILITY ENHANCEMENT CLAIM" && (
    //           <AbilityEnhancementClaim form={form} setForm={setForm} />
    //         )}

    //         {form.claim_type_name === "SKILLED CLAIM" && (
    //           <SkilledClaim form={form} setForm={setForm} />
    //         )}

    //         {/* Amount Field */}
    //         <div>
    //           <label className="text-sm font-semibold text-gray-700">Amount</label>
    //           <input
    //             type="number"
    //             autoComplete="off"
    //             value={form.amount}
    //             onChange={(e) => setForm({ ...form, amount: e.target.value })}
    //             className={`mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg ${form.claim_type_name === "QPS" ? 'bg-gray-100' : ''}`}
    //           />
    //         </div>
    //       </div>
    //     </div>




    //     {/* Staff Info (Read Only) */}
    //     {[
    //       { label: "Staff ID", key: "staff_id" },
    //       { label: "Staff Name", key: "staff_name" },
    //       { label: "Department", key: "department" },
    //       { label: "Designation", key: "designation" },
    //       { label: "Internal / External", key: "internal_external" },
    //       { label: "Email", key: "email" },
    //       { label: "Bank Name", key: "bank_name" },
    //       { label: "Branch Name", key: "branch_name" },
    //       { label: "Branch Code", key: "branch_code" },
    //       { label: "IFSC Code", key: "ifsc_code" },
    //       { label: "Account Number", key: "account_no" }
    //     ].map(({ label, key }) => (
    //       <div key={key}>
    //         <label className="text-sm font-semibold text-gray-700">{label}</label>
    //         <input
    //           type="text"
    //           value={form[key]}
    //           readOnly
    //           className="mt-2 w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg font-semibold text-gray-800" />
    //       </div>
    //     ))}

    //     {/* Entry Date */}
    //     <div>
    //       <label className="text-sm font-semibold text-gray-700">Entry Date</label>
    //       <input
    //         type="date"
    //         value={form.entry_date}
    //         readOnly
    //         className="mt-2 w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg"
    //       />
    //     </div>

    //     {/* Submission Date */}
    //     {/* <div>
    //       <label className="text-sm font-semibold text-gray-700">Submission Date</label>
    //       <input
    //         type="date"
    //         value={form.submission_date}
    //         onChange={(e) => setForm({ ...form, submission_date: e.target.value })}
    //         className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
    //       />
    //     </div> */}

    //     {/* Credited Date */}
    //     {/* <div>
    //       <label className="text-sm font-semibold text-gray-700">Credited Date</label>
    //       <input
    //         type="date"
    //         value={form.credited_date}
    //         onChange={(e) => setForm({ ...form, credited_date: e.target.value })}
    //         className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
    //       />
    //     </div> */}




    //     {/* Remarks */}
    //     <div className="md:col-span-2">
    //       <label className="text-sm font-semibold text-gray-700">Remarks</label>
    //       <textarea
    //         value={form.remarks}
    //         onChange={(e) => setForm({ ...form, remarks: e.target.value })}
    //         rows="3"
    //         className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
    //       />
    //     </div>

    //     {/* Submit Button */}
    //     <div className="md:col-span-2 text-right">
    //       <button
    //         type="submit"
    //         className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg"
    //       >
    //         Submit
    //       </button>
    //     </div>
    //   </form>
    // </div>

    <div className="p-8 max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Claim Entry</h2>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2 bg-white p-8 rounded-xl shadow-lg border border-gray-200">

        {/* Claim Type */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Claim Type</label>
          <select
            tabIndex={1}
            value={form.claim_type_name}
            onChange={(e) => setForm({ ...form, claim_type_name: e.target.value })}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Select Type</option>
            {claimTypes?.map((c) => (
              <option key={c._id} value={c.claim_type_name}>{c.claim_type_name}</option>
            ))}
          </select>
        </div>

        {/* Phone Number & Fetch */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Phone Number</label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              tabIndex={2}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter Phone Number"
              className="flex-1 px-4 py-2 border font-semibold border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <button
              type="button"
              tabIndex={3}
              onClick={handleFetchStaff}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition"
            >
              Get
            </button>
          </div>
        </div>

        {/* Claim Details Section */}
        <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">🧾 Claim Details</h3>

          <div className="grid md:grid-cols-2 gap-6">
            {form.claim_type_name === "QPS" && <QpsFields form={form} setForm={setForm} />}
            {form.claim_type_name === "CIA REAPEAR CLAIM" && <CiaReapear form={form} setForm={setForm} />}
            {form.claim_type_name === "SCRUTINY CLAIM" && <ScrutinyField form={form} setForm={setForm} />}
            {form.claim_type_name === "CENTRAL VALUATION" && <CentralValuation form={form} setForm={setForm} />}
            {form.claim_type_name === "PRACTICAL EXAM CLAIM" && <PracticalFields form={form} setForm={setForm} />}
            {form.claim_type_name === "ABILITY ENHANCEMENT CLAIM" && <AbilityEnhancementClaim form={form} setForm={setForm} />}
            {form.claim_type_name === "SKILLED CLAIM" && <SkilledClaim form={form} setForm={setForm} />}

            {/* Amount Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Amount</label>
              <input
                type="number"
                tabIndex={4}
                autoComplete="off"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={`mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${form.claim_type_name === "QPS" ? 'bg-gray-100' : ''}`}
                required
              />
            </div>
          </div>
        </div>

        {/* Staff Info Section */}
        <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">👤 Staff Information</h3>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Staff ID", key: "staff_id" },
              { label: "Staff Name", key: "staff_name" },
              { label: "Department", key: "department" },
              { label: "Designation", key: "designation" },
              { label: "Internal / External", key: "internal_external" },
              { label: "Email", key: "email" },
              { label: "Bank Name", key: "bank_name" },
              { label: "Branch Name", key: "branch_name" },
              // { label: "Branch Code", key: "branch_code" },
              { label: "IFSC Code", key: "ifsc_code" },
              { label: "Account Number", key: "account_no" }
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-gray-700">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  readOnly
                  className="mt-2 w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg font-semibold text-gray-800"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Entry Date */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Entry Date</label>
          <input
            type="date"
            value={form.entry_date}
            readOnly
            className="mt-2 w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg"
          />
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-gray-700">💬 Remarks</label>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            rows="3"
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
          {/* Cancel Button */}
          {/* <button
            type="button"
            className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg 
               hover:bg-gray-400 active:scale-95 transition"
            onClick={() => navigate(-1)} // or your custom cancel action
          >
            Cancel
          </button> */}

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg 
               hover:bg-blue-700 active:scale-95 transition"
          >
            Submit
          </button>
        </div>

      </form>
    </div>

  );
};

export default ClaimEntry;
