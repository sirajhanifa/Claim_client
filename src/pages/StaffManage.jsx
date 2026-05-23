import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useLocation } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import {
    Users, UserPlus, Search, Filter, Plus, Pencil,
    FileUp, Download, ImagePlus, X,
    Edit3, Trash2, AlertCircle, Phone, Loader2,
    ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';

const StaffManage = () => {

    const location = useLocation();
    const apiUrl = import.meta.env.VITE_API_URL;
    const [staffList, setStaffList] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [excelFile, setExcelFile] = useState(null);
    const [filters, setFilters] = useState({ department: '', designation: '', employment_type: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [confirmDeleteStaff, setConfirmDeleteStaff] = useState(null);
    const [formData, setFormData] = useState({
        employment_type: '', staff_id: '', staff_name: '', department: '',
        category: '', designation: '', phone_no: '', email: '',
        college: '', bank_acc_no: '', ifsc_code: '', bank_name: '', bank_city_name: ''
    });

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null, filteredOrder: [] });

    // Fetch staff data with loading state
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/staff`);
            setAllStaff(res.data);
            setStaffList(res.data);
        } catch {
            alert("Error fetching staff data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    // Filter and search logic – now includes all visible fields
    useEffect(() => {
        let filtered = allStaff.filter(s => {
            const searchStr = searchQuery.toLowerCase();
            if (!searchStr) return true;
            return (
                (s.staff_id || "").toLowerCase().includes(searchStr) ||
                (s.staff_name || "").toLowerCase().includes(searchStr) ||
                (s.phone_no || "").toLowerCase().includes(searchStr) ||
                (s.email || "").toLowerCase().includes(searchStr) ||
                (s.department || "").toLowerCase().includes(searchStr) ||
                (s.designation || "").toLowerCase().includes(searchStr) ||
                (s.college || "").toLowerCase().includes(searchStr) ||
                (s.bank_acc_no || "").toLowerCase().includes(searchStr) ||
                (s.ifsc_code || "").toLowerCase().includes(searchStr) ||
                (s.bank_city_name || "").toLowerCase().includes(searchStr) ||
                (s.employment_type || "").toLowerCase().includes(searchStr)
            );
        });
        if (filters.department) filtered = filtered.filter(s => s.department === filters.department);
        if (filters.designation) filtered = filtered.filter(s => s.designation === filters.designation);
        if (filters.employment_type) filtered = filtered.filter(s => s.employment_type === filters.employment_type);
        setStaffList(filtered);
        // Reset sorting when filters/search change (preserve original order of new filtered list)
        setSortConfig({ key: null, direction: null, filteredOrder: [] });
    }, [searchQuery, filters, allStaff]);

    // Store the current filtered order whenever staffList changes and no sorting is active
    useEffect(() => {
        if (sortConfig.key === null && staffList.length) {
            setSortConfig(prev => ({ ...prev, filteredOrder: staffList }));
        }
    }, [staffList]);

    // Sorting logic
    const sortedStaffList = useMemo(() => {
        if (!staffList.length) return [];
        if (!sortConfig.key || sortConfig.direction === null) {
            // Return original filtered order (as stored)
            return sortConfig.filteredOrder.length ? sortConfig.filteredOrder : staffList;
        }
        const sorted = [...staffList];
        sorted.sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [staffList, sortConfig]);

    const handleSort = (key) => {
        // Determine new direction
        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') {
                // third click: restore original filtered order
                setSortConfig({ key: null, direction: null, filteredOrder: staffList });
                return;
            }
        }
        setSortConfig({ key, direction, filteredOrder: sortConfig.filteredOrder });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-50" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="w-3 h-3 ml-1 inline-block text-blue-600" />;
        }
        if (sortConfig.direction === 'desc') {
            return <ArrowDown className="w-3 h-3 ml-1 inline-block text-blue-600" />;
        }
        return <ArrowUpDown className="w-3 h-3 ml-1 inline-block" />;
    };

    // Handle file upload
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
        } catch (err) {
            alert(err.response?.data?.message || "Upload failed.");
        }
    };

    // Download sample template
    const downloadSampleTemplate = () => {
        const headers = [
            "staff_id", "staff_name", "department", "designation", "category",
            "phone_no", "email", "college", "bank_acc_no", "ifsc_code",
            "employment_type", "bank_name"
        ];
        const exampleRow = {
            staff_id: "EMP001",
            staff_name: "John Doe",
            department: "Computer Science",
            designation: "Professor",
            category: "Faculty",
            phone_no: "9876543210",
            email: "john.doe@college.edu",
            college: "ABC College of Engineering",
            bank_acc_no: "123456789012",
            ifsc_code: "SBIN0012345",
            employment_type: "Permanent",
        };
        const dataRows = [
            headers,
            headers.map(header => exampleRow[header] || "")
        ];
        const ws = XLSX.utils.aoa_to_sheet(dataRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Staff Template");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer]), "Staff Template.xlsx");
    };

    // Delete handler
    const handleDelete = async () => {
        if (!confirmDeleteStaff) return;
        try {
            await axios.delete(`${apiUrl}/api/staff/delete/${confirmDeleteStaff._id}`);
            fetchStaff();
            setConfirmDeleteStaff(null);
        } catch (err) {
            console.error(err);
            alert("Delete failed.");
        }
    };

    // Submit form (add/edit)
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await axios.put(`${apiUrl}/api/staff/update/${formData._id}`, formData);
                alert("Staff updated successfully.");
            } else {
                await axios.post(`${apiUrl}/api/staff`, formData);
                alert("Staff added successfully.");
            }
            setShowModal(false);
            resetForm();
            fetchStaff();
        } catch (err) {
            alert(err.response?.data?.message || "Submit failed.");
        }
    };

    const resetForm = () => {
        setFormData({
            employment_type: '', staff_id: '', staff_name: '', department: '',
            category: '', designation: '', phone_no: '', email: '',
            college: '', bank_acc_no: '', ifsc_code: '', bank_name: '', bank_city_name: ''
        });
        setEditingStaff(null);
    };

    const openEditModal = (staff) => {
        setEditingStaff(staff);
        setFormData(staff);
        setShowModal(true);
    };

    // Helper: get unique values from allStaff and sort them alphabetically
    const getUniqueValues = (key) => {
        const values = allStaff.map(item => item[key]).filter(Boolean);
        return [...new Set(values)].sort((a, b) => a.localeCompare(b));
    };

    // Auto-open modal from navigation state
    useEffect(() => {
        if (location.state?.openAddStaffModal) {
            setShowModal(true);
        }
    }, [location.state]);

    // Styles for CreatableSelect
    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#ffffff',
            borderWidth: '2px',
            borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
            borderRadius: '0.75rem',
            minHeight: '46px',
            padding: '0 1rem',
            boxShadow: 'none',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1' },
        }),
        valueContainer: (base) => ({ ...base, paddingLeft: 0, paddingRight: 0 }),
        singleValue: (base) => ({ ...base, color: '#334155', fontWeight: '700', fontSize: '0.875rem' }),
        placeholder: (base) => ({ ...base, color: '#cbd5e1', fontWeight: '700', fontSize: '0.875rem' }),
        menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9', marginTop: '0.5rem' }),
        option: (base, state) => ({
            ...base, fontSize: '0.875rem', fontWeight: '600',
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : '#ffffff',
            color: state.isSelected ? '#ffffff' : '#334155', cursor: 'pointer', padding: '0.75rem 1rem',
        }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (base) => ({ ...base, color: '#94a3b8', '&:hover': { color: '#3b82f6' } }),
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        Human Resources
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Staff <span className="text-slate-400 font-light">Management</span>
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Staff
                    </button>
                    <button
                        onClick={() => {
                            const worksheet = XLSX.utils.json_to_sheet(staffList);
                            const workbook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(workbook, worksheet, "Staff List");
                            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
                            saveAs(new Blob([excelBuffer]), "Staff List.xlsx");
                        }}
                        className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Download Excel
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['department', 'designation', 'employment_type'].map(field => (
                        <div key={field} className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <Filter className="w-3 h-3" />
                                {field.replace('_', ' ')}
                            </label>
                            <select
                                className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all cursor-pointer
                                    ${filters[field] ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                                value={filters[field]}
                                onChange={e => setFilters({ ...filters, [field]: e.target.value })}
                            >
                                <option value="">All {field.replace('_', ' ')}s</option>
                                {getUniqueValues(field).map((val, i) => (
                                    <option key={i} value={val}>{val}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upload & Search Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mt-8">
                <div className="flex flex-col sm:flex-row items-center gap-4 border bg-white border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="relative group w-80">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setExcelFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/50 transition-all">
                            <ImagePlus className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]">
                                {excelFile ? excelFile.name : "Select Excel File"}
                            </span>
                            {excelFile && (
                                <button onClick={() => setExcelFile(null)} className="p-1 hover:bg-slate-200 rounded-full">
                                    <X className="w-3 h-3 text-slate-500" />
                                </button>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleFileUpload}
                        disabled={!excelFile}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all"
                    >
                        <FileUp className="w-4 h-4" />
                        Upload Bulk Data
                    </button>
                    <button
                        onClick={downloadSampleTemplate}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Download Sample Template
                    </button>
                </div>
                <div className="xl:w-96">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, Name, Dept, Designation, College, Bank, Phone or Email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Staff Table - with loading state and sorting */}
            <div className="mt-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Staff Registry
                    </h2>
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                        Total Staff : {staffList.length}
                    </div>
                </div>

                <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 z-30">
                                <tr className="bg-slate-50/90 text-center">
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200">
                                        S.No
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200 cursor-pointer hover:text-blue-600 transition-colors select-none"
                                        onClick={() => handleSort('staff_name')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            Staff Details {getSortIcon('staff_name')}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200 cursor-pointer hover:text-blue-600 transition-colors select-none"
                                        onClick={() => handleSort('department')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            Department {getSortIcon('department')}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200 cursor-pointer hover:text-blue-600 transition-colors select-none"
                                        onClick={() => handleSort('designation')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            Designation {getSortIcon('designation')}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200 cursor-pointer hover:text-blue-600 transition-colors select-none"
                                        onClick={() => handleSort('phone_no')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            Contact & Email {getSortIcon('phone_no')}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200 cursor-pointer hover:text-blue-600 transition-colors select-none"
                                        onClick={() => handleSort('college')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            College {getSortIcon('college')}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200 cursor-pointer hover:text-blue-600 transition-colors select-none"
                                        onClick={() => handleSort('bank_acc_no')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            Bank Details {getSortIcon('bank_acc_no')}
                                        </span>
                                    </th>
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200">
                                        Emp Type
                                    </th>
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap border-b border-slate-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                                                <p className="text-slate-500 text-sm">Loading staff records...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sortedStaffList.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                                    <Search className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <h3 className="text-slate-900 font-semibold">No records found</h3>
                                                <p className="text-slate-500 text-sm mt-1">We couldn't find any staff matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedStaffList.map((s, i) => (
                                        <tr key={s._id || i} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-slate-400 font-mono text-xs text-center">{i + 1}</td>
                                            <td className="px-6 py-5 min-w-[280px]">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                        {s.staff_name?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[15px] text-slate-900 leading-none mb-1">{s.staff_name}</span>
                                                        <span className="text-[13px] text-blue-600 font-semibold w-fit mt-0.5">{s.staff_id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-600 text-center">
                                                <span className="text-sm font-medium">{s.department}</span>
                                            </td>
                                            <td className="px-4 py-4 min-w-[200px] text-center">
                                                <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                                                    {s.designation}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-700 font-medium text-sm tabular-nums flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 text-slate-500" /> {s.phone_no}
                                                    </span>
                                                    <span className="text-slate-500 text-sm truncate max-w-[150px] hover:text-slate-600 transition-colors cursor-pointer">{s.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600 text-sm min-w-[200px] text-center">{s.college}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col tabular-nums gap-1">
                                                    <span className="text-slate-700 font-medium text-sm">{s.bank_acc_no}</span>
                                                    <span className="text-[12px] text-blue-500 font-bold">{s.ifsc_code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${s.employment_type === 'Internal' ? 'bg-orange-500' : 'bg-purple-900'}`} />
                                                    <span className="text-slate-600 text-xs uppercase font-medium">{s.employment_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 bg-white group-hover:bg-slate-50/80 transition-colors z-10 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => openEditModal(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="Edit">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setConfirmDeleteStaff(s)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 leading-none">
                                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">
                                    Staff Configuration
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Area */}
                        <div className="p-8 max-h-[65vh] overflow-y-auto">
                            <form onSubmit={handleSubmitForm} id="staff-form" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Staff Name */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            STAFF NAME
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.staff_name || ''}
                                            onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                                            required
                                            placeholder="e.g. John Doe"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    {/* Staff ID (Optional) */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            STAFF ID (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.staff_id || ''}
                                            onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                                            placeholder="Optional ID"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    {/* Department – CreatableSelect (sorted options) */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            DEPARTMENT
                                        </label>
                                        <CreatableSelect
                                            isClearable
                                            styles={customSelectStyles}
                                            options={getUniqueValues('department').map(val => ({ label: val, value: val }))}
                                            value={formData.department ? { label: formData.department, value: formData.department } : null}
                                            onChange={(selected) => setFormData({ ...formData, department: selected?.value || '' })}
                                            onCreateOption={(newVal) => setFormData({ ...formData, department: newVal })}
                                        />
                                    </div>

                                    {/* Designation – CreatableSelect (sorted options) */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            DESIGNATION
                                        </label>
                                        <CreatableSelect
                                            isClearable
                                            styles={customSelectStyles}
                                            options={getUniqueValues('designation').map(val => ({ label: val, value: val }))}
                                            value={formData.designation ? { label: formData.designation, value: formData.designation } : null}
                                            onChange={(selected) => setFormData({ ...formData, designation: selected?.value || '' })}
                                            onCreateOption={(newVal) => setFormData({ ...formData, designation: newVal })}
                                        />
                                    </div>

                                    {/* Category – CreatableSelect (sorted options) */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            CATEGORY
                                        </label>
                                        <CreatableSelect
                                            isClearable
                                            styles={customSelectStyles}
                                            options={getUniqueValues('category').map(val => ({ label: val, value: val }))}
                                            value={formData.category ? { label: formData.category, value: formData.category } : null}
                                            onChange={(selected) => setFormData({ ...formData, category: selected?.value || '' })}
                                            onCreateOption={(newVal) => setFormData({ ...formData, category: newVal })}
                                        />
                                    </div>

                                    {/* Employment Type – CreatableSelect (sorted options) */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            EMPLOYMENT TYPE
                                        </label>
                                        <CreatableSelect
                                            isClearable
                                            styles={customSelectStyles}
                                            options={getUniqueValues('employment_type').map(val => ({ label: val, value: val }))}
                                            value={formData.employment_type ? { label: formData.employment_type, value: formData.employment_type } : null}
                                            onChange={(selected) => setFormData({ ...formData, employment_type: selected?.value || '' })}
                                            onCreateOption={(newVal) => setFormData({ ...formData, employment_type: newVal })}
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            PHONE NO
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone_no || ''}
                                            onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                                            required
                                            placeholder="e.g. 9876543210"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            EMAIL
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            placeholder="name@example.com"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    {/* College – CreatableSelect (sorted options) */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            COLLEGE
                                        </label>
                                        <CreatableSelect
                                            isClearable
                                            styles={customSelectStyles}
                                            options={getUniqueValues('college').map(val => ({ label: val, value: val }))}
                                            value={formData.college ? { label: formData.college, value: formData.college } : null}
                                            onChange={(selected) => setFormData({ ...formData, college: selected?.value || '' })}
                                            onCreateOption={(newVal) => setFormData({ ...formData, college: newVal })}
                                        />
                                    </div>

                                    {/* Account Number */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            ACCOUNT NUMBER
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bank_acc_no || ''}
                                            onChange={(e) => setFormData({ ...formData, bank_acc_no: e.target.value })}
                                            required
                                            placeholder="e.g. 123456789012"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold font-mono focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    {/* IFSC Code */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            IFSC CODE
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ifsc_code || ''}
                                            onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                                            required
                                            placeholder="e.g. SBIN0012345"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold font-mono focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    {/* Bank City Name */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            BANK CITY NAME
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bank_city_name || ''}
                                            onChange={(e) => setFormData({ ...formData, bank_city_name: e.target.value })}
                                            placeholder="e.g. Mumbai"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                form="staff-form"
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                {editingStaff ? 'Save Changes' : 'Create Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDeleteStaff && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-8 text-white flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Irreversible Action</h3>
                            <p className="text-red-100 text-sm mt-2">You are about to delete staff record :</p>
                            <div className="px-4 py-2 bg-black/10 rounded-lg font-bold text-xl border border-white/20 mt-2">
                                {confirmDeleteStaff.staff_name}
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <p className="text-slate-600 text-center text-sm leading-relaxed">
                                This will permanently remove this staff member from the database. All associated claims will be affected. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmDeleteStaff(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">
                                    Go Back
                                </button>
                                <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all active:scale-95">
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManage;