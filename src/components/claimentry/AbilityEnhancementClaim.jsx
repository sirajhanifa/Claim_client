import React from 'react';

const AbilityEnhancementClaim = ({ form, setForm }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <>
            {/* Total No. of Students */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Total No. of Students</label>
                <input
                    type="number"
                    name="ability_total_no_students"
                    value={form.ability_total_no_students || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="e.g. 50"
                />
            </div>

            {/* No. of Days Halted */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of Days Halted</label>
                <input
                    type="number"
                    name="ability_no_of_days_halted"
                    value={form.ability_no_of_days_halted || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="Enter halt days"
                />
            </div>

            {/* Dearness Allowance */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">
                    Dearness Allowance (per day)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                        type="number"
                        name="ability_dearness_allowance"
                        value={form.ability_dearness_allowance || ''}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Tax Type */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Tax Type</label>
                <select
                    name="ability_tax_type"
                    value={form.ability_tax_type || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer font-medium text-slate-900"
                >
                    <option value="">Select Tax Type</option>
                    <option value="AIDED">TDS</option>
                    <option value="SF">NO TDS</option>
                </select>
            </div>
        </>
    );
};

export default AbilityEnhancementClaim;