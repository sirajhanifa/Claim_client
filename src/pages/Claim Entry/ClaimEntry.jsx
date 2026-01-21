import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import usePost from '../../hooks/usePost';
import QpsFields from './QpsFields';
import CiaReapear from './CiaReapear';
import ScrutinyField from './ScrutinyField';
import CentralValuation from './CentralValuation';
import PracticalFields from './PracticalFields';
import AbilityEnhancementClaim from './AbilityEnhancementClaim';
import SkilledClaim from './SkilledClaim';

const ClaimEntry = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { data: claimTypes } = useFetch(`${apiUrl}/api/getClaim`);
  const { postData } = usePost();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);


  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);





  const { username } = useParams();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [form, setForm] = useState({
    // 🔷 General Claim Info
    claim_type_name: '',
    staff_id: '',
    staff_name: '',
    department: '',
    designation: '',
    internal_external: '',
    category: '',
    college: '',
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
    no_of_ug_papers: '',
    no_of_pg_papers: '',
    scrutiny_days: 1,

    // 🔷 Practical Exam Claim
    qps_paper_setting: '',        // QPS Paper Setting
    total_students: '',           // Total No. of Students
    days_halted: 1,              // No. of Days Halted
    travelling_allowance: 0,     // Travelling Allowance
    degree_level: '', // UG / PG for Practical Exam Claim
    tax_type: '',                 // Dropdown: Aided / SF / AICTE
    tax_amount: '',               // Optional Tax Amount
    dearness_allowance: 200,

    // 🔷 CIA Reappear Claim
    cia_no_of_papers: '',
    cia_role_type: '',

    // 🔷 Central Valuation Claim
    central_role: '',
    central_total_scripts_ug: '',
    central_total_scripts_pg: '',
    central_days_halted: 1,
    central_travel_allowance: 0,
    central_tax_applicable: '',
    central_dearness_allowance: 200,    // added DA per day


    // 🔷 Ability Enhancement Claim ✅
    ability_total_no_students: '',     // Total No. of Students
    ability_no_of_days_halted: 1,     // No. of Days Halted
    ability_tax_type: '',              // Aided / AICTE only
    ability_dearness_allowance: 200, // ✅ ADD THIS

  });

  const isStaffFetched = Boolean(form.staff_name);


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

      // Scrutiny logic
      if (claim_type_name?.trim().toUpperCase() === "SCRUTINY CLAIM") {
        const ugPapers = parseInt(form.no_of_ug_papers) || 0;
        const pgPapers = parseInt(form.no_of_pg_papers) || 0;

        if (ugPapers === 0 && pgPapers === 0) return; // skip if both are 0

        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name,
            no_of_ug_papers: ugPapers,
            no_of_pg_papers: pgPapers,
          });

          const backendAmount = Number(response.data.amount) || 0;
          const daAmount = (parseInt(form.scrutiny_days) || 0) * (parseInt(form.dearness_allowance) || 200);
          const totalAmount = backendAmount + daAmount;

          setForm(prev => ({ ...prev, amount: totalAmount.toString() }));
        } catch (error) {
          console.error("Error calculating Scrutiny amount:", error.message);
        }
      }


      // ✅ Central Valuation logic
      if (
        claim_type_name === "CENTRAL VALUATION" &&
        (form.central_total_scripts_ug || form.central_total_scripts_pg) &&
        form.central_days_halted &&
        form.central_travel_allowance !== '' &&
        form.central_dearness_allowance !== '' &&
        form.central_tax_applicable
      ) {
        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name,
            central_total_scripts_ug: parseInt(form.central_total_scripts_ug) || 0,
            central_total_scripts_pg: parseInt(form.central_total_scripts_pg) || 0,
            central_travel_allowance: parseFloat(form.central_travel_allowance) || 0,
            central_tax_applicable: form.central_tax_applicable
          });

          const { baseAmount, taxPercent } = response.data;

          // ✅ Calculate DA in frontend
          const daAmount = Number(form.central_days_halted || 0) * Number(form.central_dearness_allowance || 0);

          const subTotal = baseAmount + daAmount;

          // ✅ Apply tax on frontend
          const taxAmount = subTotal * (taxPercent || 0);
          const finalAmount = subTotal - taxAmount;

          setForm(prev => ({ ...prev, amount: finalAmount.toString() }));

        } catch (error) {
          console.error("Error calculating Central Valuation amount:", error.message);
        }
      }


      // Practical Exam Claim logic ✅ UPDATED
      if (
        claim_type_name === "PRACTICAL EXAM CLAIM" &&
        qps_paper_setting &&
        total_students &&
        days_halted &&
        tax_type &&
        degree_level &&
        !isNaN(total_students) &&
        !isNaN(days_halted)
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


          const { baseAmount, taxPercent } = response.data;

          const daAmount =
            Number(form.days_halted || 0) * Number(form.dearness_allowance || 0);

          const subTotal = Number(baseAmount) + daAmount;

          // ✅ apply tax AFTER adding DA
          const taxRate = (taxPercent || 0) / 100;   // 🔥 FIX
          const taxAmount = subTotal * taxRate;
          const finalAmount = Math.max(subTotal - taxAmount, 0);



          setForm(prev => ({
            ...prev,
            amount: finalAmount.toString()
          }));

        } catch (error) {
          console.error("Error calculating Practical Exam amount:", error.message);
        }
      }


      // 🔷 Ability Enhancement Claim logic (FINAL)
      if (
        claim_type_name === "ABILITY ENHANCEMENT CLAIM" &&
        ability_total_no_students &&
        ability_no_of_days_halted &&
        !isNaN(ability_total_no_students) &&
        !isNaN(ability_no_of_days_halted)
      ) {
        try {
          const response = await axios.post(`${apiUrl}/api/calculateAmount`, {
            claim_type_name,
            ability_total_no_students: parseInt(ability_total_no_students),
            ability_tax_type: ability_tax_type || ''
          });

          const { baseAmount, taxPercent } = response.data;

          // ✅ DA calculation (frontend only)
          const daPerDay = Number(form.ability_dearness_allowance || 0);
          const haltedDays = Number(ability_no_of_days_halted || 0);
          const daAmount = daPerDay * haltedDays;

          // ✅ Subtotal = Base + DA
          const subTotal = Number(baseAmount) + daAmount;

          // ✅ Tax applied AFTER DA
          const taxRate = (taxPercent || 0) / 100;
          const taxAmount = subTotal * taxRate;

          // ✅ Final amount
          const finalAmount = subTotal - taxAmount;

          setForm(prev => ({
            ...prev,
            amount: finalAmount.toString()
          }));

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
    form.no_of_ug_papers,
    form.no_of_pg_papers,
    form.scrutiny_days,
    form.scrutiny_days,
    form.central_total_scripts_ug,
    form.central_total_scripts_pg,
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
    form.cia_role_type,
    form.dearness_allowance,
    form.ability_dearness_allowance,



  ]);





  //today date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm((prev) => ({ ...prev, entry_date: today }));
  }, []);


  //fetch Staff by using phone Number
  const handleFetchStaff = async (phone = null) => {
    const lookupPhone = phone ?? phoneNumber;
    if (!lookupPhone) return alert("Enter a phone number");

    try {
      const res = await fetch(`${apiUrl}/api/getStaffByPhone/${encodeURIComponent(lookupPhone)}`);
      const data = await res.json();

      if (res.ok) {
        setForm(prev => ({
          ...prev,
          staff_id: data.staff_id,
          staff_name: data.staff_name,
          department: data.department,
          designation: data.designation,
          internal_external: data.employment_type,
          category: data.category || '',
          college: data.college || '',
          phone_number: lookupPhone,
          email: data.email,
          bank_name: data.bank_name || '',
          branch_name: data.branch_name || '',
          branch_code: data.branch_code || '',
          ifsc_code: data.ifsc_code || '',
          account_no: data.bank_acc_no || ''
        }));
      } else {
        if (window.confirm(data.message || "No staff found. Do you want to add new staff?")) {
          navigate(`/layout/${username}/staffmanage`, {
            state: { openAddStaffModal: true, prefillPhone: lookupPhone }
          });
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch staff");
    }
  };

  //Submit the Claim data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double click

    setIsSubmitting(true);  // Disable button

    try {
      await postData(`${apiUrl}/api/postClaim`, form);
      alert("Claim submitted successfully");

      // Reset form (keep claim type if you want)
      setForm({
        claim_type_name: form.claim_type_name, // optional: keep selected claim type
        staff_id: '',
        staff_name: '',
        department: '',
        designation: '',
        internal_external: '',
        category: '',
        college: '',
        phone_number: '',
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
        account_no: '',

        // QPS
        no_of_qps_ug: '',
        no_of_qps_pg: '',
        no_of_scheme: '',

        // Scrutiny
        scrutiny_level: '',
        scrutiny_no_of_papers: '',
        scrutiny_days: '',

        // Practical Claim
        qps_paper_setting: '',
        total_students: '',
        days_halted: '',
        travelling_allowance: '',
        tax_type: '',
        degree_level: '',
        dearness_allowance: 200,


        // CIA Reappear
        cia_no_of_papers: '',
        cia_role_type: '',

        // Central Valuation
        central_role: '',
        central_total_scripts_ug: '',
        central_total_scripts_pg: '',
        central_days_halted: '',
        central_travel_allowance: '',
        central_tax_applicable: '',

        // Ability Enhancement
        ability_total_no_students: '',
        ability_no_of_days_halted: '',
        ability_tax_type: '',
        ability_dearness_allowance: 200,


        // Skilled
        skilled_no_of_students: '',
        skilled_days_halted: '',
        skilled_tax_type: '',
      });

      setPhoneNumber('');

      // ✅ Re-enable the submit button
      setIsSubmitting(false);

    } catch (err) {
      alert("Failed to submit claim");
      setIsSubmitting(false); // Re-enable only on error
    }
  };


  //fetch phone number suggestion
  const fetchPhoneSuggestions = async (query) => {
    if (query.length < 2) {
      setPhoneSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${apiUrl}/api/search-phone/${query}`);
      setPhoneSuggestions(res.data);
    } catch (err) {
      console.error("Phone suggestion error:", err);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 border-l-4 border-blue-600 pl-6">
          <h2 className="text-4xl font-black tracking-tight italic">
            <span className="text-blue-600">Claim</span>
            <span className="text-slate-900 ml-2">Entry</span>
          </h2>
          <p className="mt-1 text-slate-500 font-medium text-sm">
            Please fill in the details below to submit a new claim.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-y-10 gap-x-8 md:grid-cols-2 bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-blue-100/50 border border-slate-100 relative overflow-hidden"
        >
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

          {/* Claim Type */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">Claim Type</label>
            <select
              tabIndex={1}
              value={form.claim_type_name}
              onChange={(e) => setForm({ ...form, claim_type_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 outline-none appearance-none cursor-pointer font-medium"
            >
              <option value="">Select Type</option>
              {claimTypes?.map((c) => (
                <option key={c._id} value={c.claim_type_name}>
                  {c.claim_type_name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number & Fetch */}
          <div className="relative space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">Phone Number</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  tabIndex={form.claim_type_name ? 2 : -1}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    fetchPhoneSuggestions(e.target.value);
                    setActiveIndex(-1);
                  }}
                  placeholder="Enter 10-digit number"
                  disabled={!form.claim_type_name}
                  className={`w-full px-4 py-3 border rounded-xl font-bold transition-all duration-200 outline-none
                  ${form.claim_type_name
                      ? "bg-slate-50 border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      : "bg-slate-100 cursor-not-allowed border-slate-200 text-slate-400"
                    }`}
                  onKeyDown={(e) => {
                    if (!phoneSuggestions.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveIndex((prev) => {
                        const next = prev < phoneSuggestions.length - 1 ? prev + 1 : 0;
                        setPhoneNumber(phoneSuggestions[next].phone_no);
                        return next;
                      });
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((prev) => {
                        const next = prev > 0 ? prev - 1 : phoneSuggestions.length - 1;
                        setPhoneNumber(phoneSuggestions[next].phone_no);
                        return next;
                      });
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const idx = phoneSuggestions.findIndex(s => s.phone_no === phoneNumber);
                      if (idx >= 0) {
                        const selected = phoneSuggestions[idx].phone_no;
                        setPhoneSuggestions([]);
                        setActiveIndex(-1);
                        handleFetchStaff(selected);
                      } else {
                        handleFetchStaff();
                      }
                    }
                  }}
                />

                {/* Suggestions Dropdown */}
                {phoneSuggestions.length > 0 && (
                  <ul className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-auto py-2 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2">
                    {phoneSuggestions.map((item, index) => (
                      <li
                        key={item.phone_no}
                        onClick={() => {
                          setPhoneNumber(item.phone_no);
                          setPhoneSuggestions([]);
                          setActiveIndex(-1);
                          handleFetchStaff(item.phone_no);
                        }}
                        className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors
                        ${index === activeIndex ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50"}`}
                      >
                        {item.phone_no}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                tabIndex={form.claim_type_name ? 3 : -1}
                onClick={() => handleFetchStaff()}
                disabled={!form.claim_type_name}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200/50 transition-all duration-200 active:scale-95
                ${form.claim_type_name
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
              >
                Get
              </button>
            </div>
          </div>

          {/* Claim Details Section */}
          <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 shadow-inner">
            <h3 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-3">
              <span className="p-2 bg-white rounded-lg shadow-sm">🧾</span>
              Claim Details
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {form.claim_type_name === "QPS" && <QpsFields form={form} setForm={setForm} />}
              {form.claim_type_name === "CIA REAPEAR CLAIM" && <CiaReapear form={form} setForm={setForm} />}
              {form.claim_type_name === "SCRUTINY CLAIM" && <ScrutinyField form={form} setForm={setForm} />}
              {form.claim_type_name === "CENTRAL VALUATION" && <CentralValuation form={form} setForm={setForm} />}
              {form.claim_type_name === "PRACTICAL EXAM CLAIM" && <PracticalFields form={form} setForm={setForm} />}
              {form.claim_type_name === "ABILITY ENHANCEMENT CLAIM" && <AbilityEnhancementClaim form={form} setForm={setForm} />}
              {form.claim_type_name === "SKILLED CLAIM" && <SkilledClaim form={form} setForm={setForm} />}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    tabIndex={4}
                    autoComplete="off"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold outline-none
                    ${form.claim_type_name === "QPS" ? "bg-slate-100" : "bg-white"}`}
                    required
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Staff Info Section */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <span className="text-blue-600">👤</span> Staff Information
              </h3>
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                Read Only
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {[
                { label: "Staff ID", key: "staff_id" },
                { label: "Staff Name", key: "staff_name" },
                { label: "Department", key: "department" },
                { label: "Designation", key: "designation" },
                { label: "Internal / External", key: "internal_external" },
                { label: "Category", key: "category" },
                { label: "College", key: "college" },
                { label: "Email", key: "email" },
                { label: "IFSC Code", key: "ifsc_code" },
                { label: "Account Number", key: "account_no" },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg font-bold text-slate-700 cursor-not-allowed outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Lower Fields */}
          <div className="md:col-span-1 space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">Entry Date</label>
            <input
              type="date"
              value={form.entry_date}
              readOnly
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">💬 Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows="3"
              placeholder="Add any additional notes here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              tabIndex={isStaffFetched ? 4 : -1}
              disabled={isSubmitting || !isStaffFetched}
              className={`group relative flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-white transition-all duration-300 shadow-xl
    ${isSubmitting || !isStaffFetched
                  ? "bg-slate-400 cursor-not-allowed shadow-none"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-green-200 hover:-translate-y-1 active:translate-y-0"
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (
                <>
                  Submit Claim
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimEntry;
