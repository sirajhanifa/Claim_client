import React from 'react';

const ScrutinyField = ({ form, setForm }) => {
  return (
    <>
      {/* No. of UG Papers */}
      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          No. of UG Papers
        </label>
        <input
          type="number"
          value={form.no_of_ug_papers}
          onChange={(e) =>
            setForm({ ...form, no_of_ug_papers: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter number of UG papers"
        />
      </div>

      {/* No. of PG Papers */}
      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          No. of PG Papers
        </label>
        <input
          type="number"
          value={form.no_of_pg_papers}
          onChange={(e) =>
            setForm({ ...form, no_of_pg_papers: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter number of PG papers"
        />
      </div>

      {/* No. of Days */}
      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          No. of Days
        </label>
        <input
          type="number"
          value={form.scrutiny_days}
          onChange={(e) =>
            setForm({ ...form, scrutiny_days: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter number of days"
        />
      </div>

      {/* Dearness Allowance */}
      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Dearness Allowance (DA)
        </label>
        <input
          type="number"
          value={form.dearness_allowance || 200}
          onChange={(e) =>
            setForm({ ...form, dearness_allowance: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter DA (default 200)"
        />
      </div>
    </>
  );
};


export default ScrutinyField;
