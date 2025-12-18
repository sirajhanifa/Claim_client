import React from 'react';

const CentralValuation = ({ form, setForm }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Role */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          Chairman / Examiner
        </label>
        <select
          name="central_role"
          value={form.central_role}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Select Role</option>
          <option value="Chairman">Chairman</option>
          <option value="Examiner">Examiner</option>
        </select>
      </div>

      {/* UG Scripts */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          Total UG Scripts
        </label>
        <input
          type="number"
          name="central_total_scripts_ug"
          value={form.central_total_scripts_ug}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter UG scripts"
        />
      </div>

      {/* PG Scripts */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          Total PG Scripts
        </label>
        <input
          type="number"
          name="central_total_scripts_pg"
          value={form.central_total_scripts_pg}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter PG scripts"
        />
      </div>

      {/* Halt Days */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          No. of Days Halted
        </label>
        <input
          type="number"
          name="central_days_halted"
          value={form.central_days_halted}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Dearness Allowance */}
      {/* Dearness Allowance */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          Dearness Allowance (per day)
        </label>
        <input
          type="number"
          name="central_dearness_allowance"
          value={form.central_dearness_allowance || ''}
          onChange={(e) =>
            setForm({ ...form, central_dearness_allowance: e.target.value })
          }
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter DA per day"
        />
      </div>



      {/* Travel */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          Travel Allowance
        </label>
        <input
          type="number"
          name="central_travel_allowance"
          value={form.central_travel_allowance}
          onChange={handleChange}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Tax */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          Tax Type
        </label>
        <select
          name="central_tax_applicable"
          value={form.central_tax_applicable}
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

export default CentralValuation;
