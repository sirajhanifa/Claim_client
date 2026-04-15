import React from 'react';

const AbilityEnhancementClaim = ({ form, setForm }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Total No. of Students */}
      <div>
        <label className="text-sm font-semibold text-gray-700">Total No. of Students</label>
        <input
          type="number"
          name="ability_total_no_students"
          value={form.ability_total_no_students || ''}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter number of students"
        />
      </div>

      {/* No. of Days Halted */}
      <div>
        <label className="text-sm font-semibold text-gray-700">No. of Days Halted</label>
        <input
          type="number"
          name="ability_no_of_days_halted"
          value={form.ability_no_of_days_halted}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter halt days"
        />
      </div>

      {/* Dearness Allowance */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          Dearness Allowance (per day)
        </label>
        <input
          type="number"
          name="ability_dearness_allowance"
          value={form.ability_dearness_allowance || ''}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter DA per day"
        />
      </div>


      {/* Tax Type (Aided / AICTE only) */}
      <div>
        <label className="text-sm font-semibold text-gray-700">Tax Type</label>
        <select
          name="ability_tax_type"
          value={form.ability_tax_type || ''}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
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
