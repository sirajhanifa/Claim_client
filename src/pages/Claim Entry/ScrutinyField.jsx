import React from 'react';

const ScrutinyField = ({ form, setForm }) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Select Level (UG / PG)
        </label>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer
                      transition
                      hover:border-blue-400
                      has-[:checked]:border-blue-500
                      has-[:checked]:bg-blue-50">
            <input
              type="radio"
              value="UG"
              checked={form.scrutiny_level === "UG"}
              onChange={(e) =>
                setForm({ ...form, scrutiny_level: e.target.value })
              }
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">UG</span>
          </label>

          <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer
                      transition
                      hover:border-blue-400
                      has-[:checked]:border-blue-500
                      has-[:checked]:bg-blue-50">
            <input
              type="radio"
              value="PG"
              checked={form.scrutiny_level === "PG"}
              onChange={(e) =>
                setForm({ ...form, scrutiny_level: e.target.value })
              }
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">PG</span>
          </label>
        </div>
      </div>


      {/* No. of Papers */}
      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          No. of Papers
        </label>
        <input
          type="number"
          value={form.scrutiny_no_of_papers}
          onChange={(e) =>
            setForm({ ...form, scrutiny_no_of_papers: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter number of papers"
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
    </>
  );
};

export default ScrutinyField;
