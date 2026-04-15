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
        <>
            {/* Role Type Selection */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Role Type</label>
                <div className="flex gap-4">
                    {/* Staff Option */}
                    <label className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 border rounded-xl cursor-pointer transition-all duration-200
                      hover:bg-slate-50
                      has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
                        <input
                            type="radio"
                            name="cia_role_type"
                            value="Staff"
                            checked={form.cia_role_type === "Staff"}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-700">Staff</span>
                    </label>

                    {/* Tutor Option */}
                    <label className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 border rounded-xl cursor-pointer transition-all duration-200
                      hover:bg-slate-50
                      has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
                        <input
                            type="radio"
                            name="cia_role_type"
                            value="Tutor"
                            checked={form.cia_role_type === "Tutor"}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-700">Tutor</span>
                    </label>
                </div>
            </div>

            {/* No of Papers */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of Papers</label>
                <input
                    type="number"
                    name="cia_no_of_papers"
                    value={form.cia_no_of_papers || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="e.g. 10"
                    min="0"
                />
            </div>
        </>
    );
};

export default CiaReapear;