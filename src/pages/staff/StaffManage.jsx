import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import CreatableSelect from "react-select/creatable";

const StaffManage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [staffList, setStaffList] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [filters, setFilters] = useState({ department: '', designation: '', employment_type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    employment_type: '', staff_id: '', staff_name: '', department: '', category: '', designation: '',
    phone_no: '', email: '', college: '', bank_acc_no: '',
    ifsc_code: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // Fixed items per page

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/staff`);
      setAllStaff(res.data);
      setStaffList(res.data);
    } catch {
      alert("Error fetching staff data.");
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  useEffect(() => {
    let filtered = allStaff.filter(s =>
      (s.staff_id || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.staff_name || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone_no || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filters.department) filtered = filtered.filter(s => s.department === filters.department);
    if (filters.designation) filtered = filtered.filter(s => s.designation === filters.designation);
    if (filters.employment_type) filtered = filtered.filter(s => s.employment_type === filters.employment_type);

    setStaffList(filtered);
    setCurrentPage(1);
  }, [searchQuery, filters, allStaff]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) return alert("Please select a file");

    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const res = await axios.post(`${apiUrl}/api/staff/upload`, formData);
      alert(res.data.message);
      fetchStaff();
      setExcelFile(null);
      document.querySelector('input[type=file]').value = '';
    } catch {
      alert("Upload failed.");
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm('Are you sure to delete this record?')) return;

    try {
      await axios.delete(`${apiUrl}/api/staff/delete/${_id}`);
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  };


  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await axios.put(`/api/staff/update/${formData._id}`, formData);
        alert("Updated successfully.");
      } else {
        await axios.post(`${apiUrl}/api/staff`, formData);
        alert("Added successfully.");
      }
      setShowModal(false);
      setFormData({});
      setEditingStaff(null);
      fetchStaff();
    } catch {
      alert("Submit failed.");
    }
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData(staff);
    setShowModal(true);
  };

  const getUniqueValues = (key) => {
    const values = allStaff.map(item => item[key]).filter(Boolean);
    return [...new Set(values)];
  };



  const totalPages = Math.ceil(staffList.length / itemsPerPage);
  const paginatedStaff = staffList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const startItem = staffList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, staffList.length);

  return (
    <div className="max-w-full mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-6 text-green-800">Staff Management Portal</h1>

      {/* Clean & Spacious Controls Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


          {/* Filter Dropdowns */}
          {['department', 'designation', 'employment_type'].map(field => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                {field.replace('_', ' ')}
              </label>
              <select
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition ${filters[field] ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                value={filters[field]}
                onChange={e => setFilters({ ...filters, [field]: e.target.value })}
              >
                <option value="">All {field.replace('_', ' ')}</option>
                {getUniqueValues(field).map((val, i) => (
                  <option key={i} value={val}>{val}</option>
                ))}
              </select>
            </div>
          ))}

          {/* Upload Excel */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row items-start gap-6 mt-4">
            {/* Search Input */}
            <div className='w-92'>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Search Staff</label>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2  text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div className="border rounded-md border-gray-300 flex items-center gap-3 mt-7">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={e => setExcelFile(e.target.files[0])}
                className="file:bg-green-100 file:text-green-800 file:px-4 file:py-1.5 file:rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={handleFileUpload}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-1.5 rounded-lg transition"
              >
                Upload Excel
              </button>
            </div>

            <button
              onClick={() => {
                setFilters({ department: '', designation: '', employment_type: '' });
                setSearchQuery('');
              }}
              className="text-sm text-gray-600 hover:text-red-600 underline transition mt-6"
            >
              🔄 Reset Filters
            </button>
          </div>
        </div>
      </div>



      <div className='flex justify-between'>
        {/* Download Excel */}
        <button
          className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
          onClick={() => {
            const worksheet = XLSX.utils.json_to_sheet(staffList);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Staff List");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(data, "staff_list.xlsx");
          }}
        >
          Download Excel
        </button>
        <button
          onClick={() => { setFormData({}); setEditingStaff(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
        >
          Add Staff
        </button>
      </div>


      <h1 className='text-lg font-bold text-end mt-5'>No.of.Staffs : {staffList.length}</h1>
      {/* Table container with scroll */}
      <div className="overflow-auto border border-gray-300 rounded shadow max-h-[600px] max-w-full mt-5">
        <table className="w-full text-sm text-center border-collapse border border-gray-300 min-w-[900px]">
          <thead className="bg-blue-950 h-14 text-white sticky top-0 z-10">
            <tr>
              {['S.No', 'Staff Id', 'Name', 'Dept', 'Designation', 'Category', 'Phone', 'Email', 'College', 'Bank Acc', 'IFSC', 'Emp Type', 'Action'].map((h, i) => (
                <th key={i} className="px-2 py-2 border border-gray-300 font-bold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedStaff.map((s, i) => (
              <tr key={i} className="hover:bg-purple-50 font-semibold">
                <td className="border border-gray-300 px-2 py-2">{startItem + i}</td>
                <td className="border border-gray-300 px-2 py-2">{s.staff_id}</td>
                <td className="border border-gray-300 px-2 py-2 text-left">{s.staff_name}</td>
                <td className="border border-gray-300 px-2 py-2">{s.department}</td>
                <td className="border border-gray-300 px-2 py-2">{s.designation}</td>
                <td className="border border-gray-300 px-2 py-2">{s.category}</td>
                <td className="border border-gray-300 px-2 py-2">{s.phone_no}</td>
                <td className="border border-gray-300 px-2 py-2 text-left">{s.email}</td>
                <td className="border border-gray-300 px-2 py-2">{s.college}</td>
                <td className="border border-gray-300 px-2 py-2">{s.bank_acc_no}</td>
                <td className="border border-gray-300 px-2 py-2">{s.ifsc_code}</td>
                <td className="border border-gray-300 px-2 py-2">{s.employment_type}</td>
                <td className="border border-gray-300 px-2 py-2 ">
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => openEditModal(s)}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-400"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-1.414.586H9v-2.414z" />
                      </svg>
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(s._id)}
                       className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Delete
                    </button>
                  </div>

                </td>
              </tr>
            ))}
            {paginatedStaff.length === 0 && (
              <tr>
                <td colSpan="13" className="py-6 text-gray-500 text-center font-semibold">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='flex justify-end gap-5'>
        {/* Showing range */}
        <div className="mt-5 font-semibold text-right text-gray-700">
          Showing {startItem} - {endItem} of {staffList.length} entries
        </div>
        {/* Pagination buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            Previous
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`px-4 py-2 rounded ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-lg border">
            <h2 className="text-2xl mb-6 font-bold border-b pb-2">
              {editingStaff ? "Edit Staff" : "Add Staff"}
            </h2>

            <form onSubmit={handleSubmitForm} className="grid grid-cols-2 gap-4">

              {[
                "employment_type", "staff_id", "staff_name", "department", "designation", "category",
                "phone_no", "email", "college", "bank_acc_no", "ifsc_code",
              ].map((field) => {

                // HIDE only for EXTERNAL
                if (
                  formData.employment_type === "EXTERNAL" &&
                  ["staff_id", "designation", "category"].includes(field)
                ) {
                  return null;
                }

                // Camel Case Label
                const camelCaseLabel = field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());

                // Fetch DB values for select
                const options = getUniqueValues(field).map((val) => ({
                  label: val,
                  value: val,
                }));

                return (
                  <div key={field} className="flex flex-col">

                    {/* LABEL */}
                    <label className="mb-1 font-medium">
                      {field === "ifsc_code" ? "IFSC CODE" : camelCaseLabel}
                    </label>

                    {/* SEARCH + TYPE + ADD NEW REACT SELECT */}
                    {[
                      "department",
                      "designation",
                      "college",
                      "category",
                      "employment_type"
                    ].includes(field) ? (
                      <CreatableSelect
                        isClearable
                        options={options}
                        value={
                          formData[field]
                            ? { label: formData[field], value: formData[field] }
                            : null
                        }
                        onChange={(selected) =>
                          setFormData({
                            ...formData,
                            [field]: selected ? selected.value : "",
                          })
                        }
                        onCreateOption={(newValue) => {
                          setFormData({
                            ...formData,
                            [field]: newValue,
                          });
                        }}
                        placeholder={`Select ${camelCaseLabel}`}
                      />

                    ) : (
                      // NORMAL INPUT
                      <input
                        type="text"
                        placeholder={camelCaseLabel}
                        value={formData[field] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field]:
                              field === "ifsc_code"
                                ? e.target.value.toUpperCase()
                                : e.target.value,
                          })
                        }
                        required={field !== "staff_id"}
                        className="border p-2 rounded"
                      />
                    )}
                  </div>
                );
              })}

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Submit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManage;
