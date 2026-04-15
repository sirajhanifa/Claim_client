import React from 'react';

const CiaReapear = ({ form, setForm }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">Role Type</label>
      <div className="flex gap-4 mt-2">
        {/* Staff */}
        <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer
                    transition
                    hover:border-blue-400
                    has-[:checked]:border-blue-500
                    has-[:checked]:bg-blue-50">
          <input
            type="radio"
            name="cia_role_type"
            value="Staff"
            checked={form.cia_role_type === "Staff"}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-800">Staff</span>
        </label>

        {/* Tutor */}
        <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer
                    transition
                    hover:border-blue-400
                    has-[:checked]:border-blue-500
                    has-[:checked]:bg-blue-50">
          <input
            type="radio"
            name="cia_role_type"
            value="Tutor"
            checked={form.cia_role_type === "Tutor"}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-800">Tutor</span>
        </label>
      </div>


      <label className="block mt-4 mb-1 font-medium">No of Papers</label>
      <input
        type="number"
        name="cia_no_of_papers"
        value={form.cia_no_of_papers || ''}
        onChange={handleChange}
        className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
        placeholder="Enter number of papers"
        min="0"
      />
    </div>
  );
};

export default CiaReapear;