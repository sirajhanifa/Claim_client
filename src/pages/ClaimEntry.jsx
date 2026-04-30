import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import usePost from '../hooks/usePost';
import QpsFields from '../components/claimentry/QpsFields';
import CiaReapear from '../components/claimentry/CiaReapear';
import ScrutinyField from '../components/claimentry/ScrutinyField';
import CentralValuation from '../components/claimentry/CentralValuation';
import PracticalFields from '../components/claimentry/PracticalFields';
import AbilityEnhancementClaim from '../components/claimentry/AbilityEnhancementClaim';

const ClaimEntry = () => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const { data: claimTypes } = useFetch(`${apiUrl}/api/getClaim`);
    const sortedClaimTypes = useMemo(() => {
        if (!Array.isArray(claimTypes)) return [];
        return [...claimTypes].sort((a, b) => {
            const nameA = (a.claim_type_name || '').toString().toUpperCase();
            const nameB = (b.claim_type_name || '').toString().toUpperCase();
            return nameA.localeCompare(nameB);
        });
    }, [claimTypes]);
    const { postData } = usePost();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneSuggestions, setPhoneSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const { username } = useParams();
    const [phoneNumber, setPhoneNumber] = useState('');

    const [form, setForm] = useState({
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
        no_of_qps_ug: '',
        no_of_qps_pg: '',
        no_of_scheme: '',
        no_of_ug_papers: '',
        no_of_pg_papers: '',
        scrutiny_days: 1,
        qps_paper_setting: '',
        total_students: '',
        days_halted: 1,
        travelling_allowance: 0,
        degree_level: '',
        tax_type: '',
        tax_amount: '',
        dearness_allowance: 200,
        cia_no_of_papers: '',
        cia_role_type: '',
        central_role: '',
        central_total_scripts_ug: '',
        central_total_scripts_pg: '',
        central_days_halted: 1,
        central_travel_allowance: 0,
        central_tax_applicable: '',
        central_dearness_allowance: 200,
        ability_total_no_students: '',
        ability_no_of_days_halted: 1,
        ability_tax_type: '',
        ability_dearness_allowance: 200,
        practical_total_value: '',
        practical_calculated_tds: '',
    });

    const isStaffFetched = Boolean(
        form.staff_name ||
        form.staff_phone ||
        form.staff_email ||
        form.staff_id
    );

    useEffect(() => {
        const fetchAmount = async () => {
            const {
                claim_type_name,
                qps_paper_setting,
                total_students,
                days_halted,
                tax_type,
                degree_level,
                ability_no_of_days_halted,
                ability_tax_type,
                ability_total_no_students
            } = form;

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

            if (claim_type_name?.trim().toUpperCase() === "SCRUTINY CLAIM") {
                const ugPapers = parseInt(form.no_of_ug_papers) || 0;
                const pgPapers = parseInt(form.no_of_pg_papers) || 0;
                if (ugPapers === 0 && pgPapers === 0) return;
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
                    const daAmount = Number(form.central_days_halted || 0) * Number(form.central_dearness_allowance || 0);
                    const subTotal = baseAmount + daAmount;
                    const taxAmount = subTotal * (taxPercent || 0);
                    const finalAmount = subTotal - taxAmount;
                    setForm(prev => ({ ...prev, amount: finalAmount.toString() }));
                } catch (error) {
                    console.error("Error calculating Central Valuation amount:", error.message);
                }
            }

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
                    const daAmount = Number(form.days_halted || 0) * Number(form.dearness_allowance || 0);
                    const subTotal = Number(baseAmount) + daAmount;
                    const taxRate = (taxPercent || 0) / 100;
                    const taxAmount = subTotal * taxRate;
                    const finalAmount = Math.max(subTotal - taxAmount, 0);
                    setForm(prev => ({ 
                        ...prev, 
                        amount: finalAmount.toString(),
                        practical_total_value: subTotal.toString(),
                        practical_calculated_tds: taxAmount.toString()
                    }));
                } catch (error) {
                    console.error("Error calculating Practical Exam amount:", error.message);
                }
            }

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
                    const daPerDay = Number(form.ability_dearness_allowance || 0);
                    const haltedDays = Number(ability_no_of_days_halted || 0);
                    const daAmount = daPerDay * haltedDays;
                    const subTotal = Number(baseAmount) + daAmount;
                    const taxRate = (taxPercent || 0) / 100;
                    const taxAmount = subTotal * taxRate;
                    const finalAmount = subTotal - taxAmount;
                    setForm(prev => ({ ...prev, amount: finalAmount.toString() }));
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
        form.qps_paper_setting,
        form.total_students,
        form.days_halted,
        form.travelling_allowance,
        form.tax_type,
        form.degree_level,
        form.ability_no_of_days_halted,
        form.ability_total_no_students,
        form.ability_tax_type,
        form.cia_no_of_papers,
        form.cia_role_type,
        form.dearness_allowance,
        form.ability_dearness_allowance,
    ]);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setForm((prev) => ({ ...prev, entry_date: today }));
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
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
                no_of_qps_ug: '',
                no_of_qps_pg: '',
                no_of_scheme: '',
                scrutiny_level: '',
                scrutiny_no_of_papers: '',
                scrutiny_days: '',
                qps_paper_setting: '',
                total_students: '',
                days_halted: '',
                travelling_allowance: '',
                tax_type: '',
                degree_level: '',
                dearness_allowance: 200,
                cia_no_of_papers: '',
                cia_role_type: '',
                central_role: '',
                central_total_scripts_ug: '',
                central_total_scripts_pg: '',
                central_days_halted: '',
                central_travel_allowance: '',
                central_tax_applicable: '',
                ability_total_no_students: '',
                ability_no_of_days_halted: '',
                ability_tax_type: '',
                ability_dearness_allowance: 200,
                skilled_no_of_students: '',
                skilled_days_halted: '',
                skilled_tax_type: '',
                practical_total_value: '',
                practical_calculated_tds: '',
            });
            setPhoneNumber('');
            setIsSubmitting(false);
        } catch (err) {
            alert("Failed to submit claim");
            setIsSubmitting(false);
        }
    };

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
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                            <div className="h-1 w-8 bg-blue-600 rounded-full" />
                            Claims Management
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            Claim <span className="text-slate-400 font-light">Entry</span>
                        </h1>
                    </div>
                </header>
                <form
                    onSubmit={handleSubmit}
                    className="grid gap-8 md:grid-cols-2 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200"
                >
                    <div className="flex flex-col space-y-3">
                        <label className="text-sm font-bold text-slate-700">Claim Type</label>
                        <select
                            tabIndex={1}
                            value={form.claim_type_name}
                            onChange={(e) => setForm({ ...form, claim_type_name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Select Type</option>
                            {sortedClaimTypes.map((c) => (
                                <option key={c._id} value={c.claim_type_name}>
                                    {c.claim_type_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <label className="text-sm font-bold text-slate-700">Phone Number</label>
                        <div className="flex gap-6">
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
                                    className={`w-full px-4 py-2.5 border rounded-lg font-semibold transition-all outline-none
                                        ${form.claim_type_name
                                            ? "bg-gray-50 border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            : "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400"
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
                                {phoneSuggestions.length > 0 && (
                                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-56 overflow-auto py-1">
                                        {phoneSuggestions.map((item, index) => (
                                            <li
                                                key={item.phone_no}
                                                onClick={() => {
                                                    setPhoneNumber(item.phone_no);
                                                    setPhoneSuggestions([]);
                                                    setActiveIndex(-1);
                                                    handleFetchStaff(item.phone_no);
                                                }}
                                                className={`px-4 py-2 cursor-pointer text-sm font-medium
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
                                className={`px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95
                                    ${form.claim_type_name
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Get
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-blue-50/40 border border-blue-100 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
                            <span>🧾</span> Claim Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {form.claim_type_name === "QPS" && <QpsFields form={form} setForm={setForm} />}
                            {form.claim_type_name === "CIA REAPEAR CLAIM" && <CiaReapear form={form} setForm={setForm} />}
                            {form.claim_type_name === "SCRUTINY CLAIM" && <ScrutinyField form={form} setForm={setForm} />}
                            {form.claim_type_name === "CENTRAL VALUATION" && <CentralValuation form={form} setForm={setForm} />}
                            {form.claim_type_name === "PRACTICAL EXAM CLAIM" && <PracticalFields form={form} setForm={setForm} />}
                            {form.claim_type_name === "ABILITY ENHANCEMENT CLAIM" && <AbilityEnhancementClaim form={form} setForm={setForm} />}
                            <div className="flex flex-col space-y-3">
                                <label className="text-sm font-bold text-slate-700">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        tabIndex={4}
                                        autoComplete="off"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className={`w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 transition-all font-bold outline-none
                                        ${form.claim_type_name === "QPS" ? "bg-gray-100" : "bg-white"}`}
                                        required
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Staff Information
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded">
                                READ ONLY
                            </span>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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
                                <div key={key} className="flex flex-col space-y-1">
                                    <label className="text-xs font-bold text-blue-500 uppercase mb-2">{label} : </label>
                                    <input
                                        type="text"
                                        value={form[key] || "-"}
                                        readOnly
                                        className="w-full py-2 uppercase rounded text-sm font-bold text-slate-700 cursor-not-allowed outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-1 flex flex-col space-y-3">
                        <label className="text-sm font-bold text-slate-700">Entry Date</label>
                        <input
                            type="date"
                            value={form.entry_date}
                            readOnly
                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col space-y-3">
                        <label className="text-sm font-bold text-slate-700">Remarks</label>
                        <textarea
                            value={form.remarks}
                            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                            rows="2"
                            placeholder="Optional notes..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 transition-all outline-none font-medium"
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            tabIndex={isStaffFetched ? 4 : -1}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md
                                ${isSubmitting || !isStaffFetched
                                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                                    : "bg-green-600 hover:bg-green-700 active:scale-95"
                                }`}
                        >
                            {isSubmitting ? "Processing..." : "Submit Claim"}
                            {!isSubmitting && <span>→</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClaimEntry;