import React from 'react';

const PracticalFields = ({ form, setForm }) => {
  return (
    <>
      {/* QPS Paper Setting */}
      <div>
        <label className="text-sm font-semibold text-gray-700">QPS Paper Setting</label>
        <input
          type="number"
          value={form.qps_paper_setting || ""}
          onChange={(e) => setForm({ ...form, qps_paper_setting: Number(e.target.value) })}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
        />

      </div>

      {/* Degree Level (UG / PG) */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Degree Level
        </label>

        <div className="flex gap-4 mt-1">
          {/* UG */}
          <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer
                      transition
                      hover:border-blue-400
                      has-[:checked]:border-blue-500
                      has-[:checked]:bg-blue-50">
            <input
              type="radio"
              value="UG"
              checked={form.degree_level === "UG"}
              onChange={(e) =>
                setForm({ ...form, degree_level: e.target.value })
              }
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-800">UG</span>
          </label>

          {/* PG */}
          <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer
                      transition
                      hover:border-blue-400
                      has-[:checked]:border-blue-500
                      has-[:checked]:bg-blue-50">
            <input
              type="radio"
              value="PG"
              checked={form.degree_level === "PG"}
              onChange={(e) =>
                setForm({ ...form, degree_level: e.target.value })
              }
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-800">PG</span>
          </label>
        </div>
      </div>



      <div>
        <label className="text-sm font-semibold text-gray-700">
          No.of Students
        </label>
        {/* Total No. of Students */}
        <input
          type="number"
          value={form.total_students || ""}
          onChange={(e) => setForm({ ...form, total_students: Number(e.target.value) })} // ✅ Number
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter total number of students"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700">
          No. of Days Halted
        </label>
        {/* No. of Days Halted */}
        <input
          type="number"
          value={form.days_halted || ""}
          onChange={(e) => setForm({ ...form, days_halted: Number(e.target.value) })} // ✅ Number
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter number of days halted"
        />

        </div>


        {/* Dearness Allowance (per day) */}
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Dearness Allowance (Per Day)
          </label>
          <input
            type="number"
            value={form.dearness_allowance}
            onChange={(e) =>
              setForm({ ...form, dearness_allowance: Number(e.target.value) })
            }
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter DA per day"
          />
        </div>


        {/* Travelling Allowance */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Travelling Allowance</label>
          <input
            type="number"
            value={form.travelling_allowance}
            onChange={(e) => setForm({ ...form, travelling_allowance: e.target.value })}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter travelling allowance"
          />
        </div>
        {/* Tax Type Dropdown */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Tax Type
          </label>
          <select
            value={form.tax_type || ""}
            onChange={(e) => setForm({ ...form, tax_type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Tax Type</option>
            <option value="Aided">TDS</option>
            <option value="SF">NO TDS</option>
            {/* <option value="AICTE">AICTE</option> */}
          </select>
        </div>

      </>
      );
};

      export default PracticalFields;
