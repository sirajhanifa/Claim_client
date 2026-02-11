import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useLocation } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import {
	Users, UserPlus, Search, Filter, Plus, Pencil,
	FileUp, Download, RotateCcw, ImagePlus, X,
	ChevronLeft, ChevronRight, Edit3, Trash2,
	Mail, Phone, Landmark, Briefcase, AlertCircle
} from 'lucide-react';

const StaffManage = () => {

	const location = useLocation();
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
	const itemsPerPage = 100;

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
				await axios.put(`${apiUrl}/api/staff/update/${formData._id}`, formData);
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
	}

	const totalPages = Math.ceil(staffList.length / itemsPerPage);
	const paginatedStaff = staffList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1) };
	const goToPrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1) };
	const startItem = staffList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, staffList.length);

	useEffect(() => {
		if (location.state?.openAddStaffModal) {
			setShowModal(true);
			if (location.state.prefillPhone) {
				setFormData(prev => ({
					...prev,
					phone_number: location.state.prefillPhone
				}));
			}
		}
	}, [location.state]);

	const customSelectStyles = {
		control: (base, state) => ({
			...base,
			backgroundColor: state.isFocused ? 'white' : '#f8fafc',
			borderWidth: '2px',
			borderColor: state.isFocused ? '#3b82f6' : '#f1f5f9',
			borderRadius: '0.75rem',
			minHeight: '46px',
			padding: '0 8px',
			outline: 'none',
			boxShadow: 'none',
			transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
			'&:hover': {
				borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
			},
		}),

		valueContainer: (base) => ({
			...base,
			paddingLeft: '0.5rem',
		}),

		singleValue: (base) => ({
			...base,
			color: '#334155',
			fontWeight: '700',
			fontSize: '0.875rem',
		}),

		placeholder: (base) => ({
			...base,
			color: '#cbd5e1',
			fontWeight: '700',
			fontSize: '0.875rem',
		}),

		menu: (base) => ({
			...base,
			borderRadius: '0.75rem',
			overflow: 'hidden',
			boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
			border: '1px solid #f1f5f9',
		}),

		option: (base, state) => ({
			...base,
			fontSize: '0.875rem',
			fontWeight: '600',
			backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
			color: state.isSelected ? 'white' : '#334155',
			cursor: 'pointer',
			'&:active': {
				backgroundColor: '#dbeafe',
			},
		}),

		indicatorSeparator: () => ({
			display: 'none',
		}),

		dropdownIndicator: (base) => ({
			...base,
			color: '#94a3b8',
			'&:hover': {
				color: '#3b82f6',
			},
		}),
	};

	return (
		<div className=''>

			{/* Header */}
			<header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
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
						onClick={() => { setFormData({}); setEditingStaff(null); setShowModal(true); }}
						className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
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
							saveAs(new Blob([excelBuffer]), "Claim Staff List.xlsx");
						}}
						className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
					>
						<Download className="w-4 h-4" />
						Export
					</button>
				</div>
			</header>

			{/* 1. Primary Filter Bar */}
			<div className="bg-white mt-8 rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{['department', 'designation', 'employment_type'].map(field => (
						<div key={field} className="space-y-1.5">
							<label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
								<Filter className="w-3 h-3" />
								{field.replace('_', ' ')}
							</label>
							<div className="relative group">
								<select
									className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all cursor-pointer
                            			${filters[field]
											? 'border-blue-500 bg-blue-50/50 text-blue-700'
											: 'border-slate-200 text-slate-600 hover:border-slate-300 focus:bg-white focus:border-slate-400'
										}`}
									value={filters[field]}
									onChange={e => setFilters({ ...filters, [field]: e.target.value })}
								>
									<option value="">All {field.replace('_', ' ')}s</option>
									{getUniqueValues(field).map((val, i) => (
										<option key={i} value={val}>{val}</option>
									))}
								</select>
								<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* 2. Data Operations Bar (Upload & Search Row) */}
			<div className="flex flex-col xl:flex-row items-stretch justify-between gap-6 mt-8">
				<div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-slate-200 rounded-[10px] p-4 w-full xl:w-auto shadow-sm">

					<div className="relative group w-full sm:w-auto">
						<input
							type="file"
							accept=".xlsx,.xls"
							onChange={(e) => setExcelFile(e.target.files[0])}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
						/>
						<div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-[10px] border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/50 transition-all duration-200">
							<div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
								<ImagePlus className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
							</div>
							<div className="flex flex-col pr-4">
								<span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight truncate max-w-[150px]">
									{excelFile ? excelFile.name : "Select Spreadsheet"}
								</span>
								<span className="text-[9px] text-slate-400 font-medium">
									{excelFile ? `${(excelFile.size / 1024).toFixed(1)} KB` : "Drop Excel file here"}
								</span>
							</div>
							{excelFile && (
								<button
									onClick={(e) => { e.stopPropagation(); setExcelFile(null); }}
									className="z-20 p-1 hover:bg-slate-200 rounded-full transition-colors"
								>
									<X className="w-3 h-3 text-slate-500" />
								</button>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2 w-full sm:w-auto px-2">
						<button
							onClick={handleFileUpload}
							disabled={!excelFile}
							className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:shadow-none"
						>
							<FileUp className="w-4 h-4" />
							Import Data
						</button>

						<div className="hidden sm:block h-8 w-[1px] bg-slate-100 mx-1" />

						<button
							onClick={() => { setFilters({ department: '', designation: '', employment_type: '' }); setSearchQuery(''); }}
							className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
							title="Reset All"
						>
							<RotateCcw className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Search & Statistics Section */}
				<div className="flex items-center gap-4 w-full xl:w-auto">
					<div className="relative flex-1 xl:w-84">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
						<input
							type="text"
							placeholder="Search records....."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400"
						/>
					</div>
				</div>
			</div>


			{/* Staff Table Container */}
			<div className="mt-8 space-y-4">

				{/* Table Header Section */}
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
						Staff Registry
					</h2>
					<div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
						Total Staff : {staffList.length}
					</div>
				</div>

				{/* Table container */}
				<div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
					<div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
						<table className="w-full text-sm text-left border-separate border-spacing-0">
							<thead className="sticky top-0 z-30">
								<tr className='text-center'>
									{['S.No', 'Staff Details', 'Department', 'Designation', 'Contact & Email', 'College', 'Bank Details', 'Emp Type', 'Actions'].map((h, i) => (
										<th
											key={i}
											className={`bg-slate-50/90 pl-6 backdrop-blur-md border-b border-slate-200 px-4 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap`}
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{paginatedStaff.map((s, i) => (
									<tr key={s._id || i} className="group hover:bg-blue-50/30 transition-all duration-200">

										{/* Serial No */}
										<td className="px-4 pl-10 py-4 text-slate-400 font-medium">{startItem + i}</td>

										{/* Staff Details with Avatar Logic */}
										<td className="px-4 py-4 min-w-[300px]">
											<div className="flex items-center gap-3">
												<div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
													{s.staff_name?.charAt(0)}
												</div>
												<div>
													<div className="font-bold text-slate-900 leading-none mb-1">{s.staff_name}</div>
													<div className="text-[15px] text-slate-500 font-mono font-bold">{s.staff_id}</div>
												</div>
											</div>
										</td>

										<td className="px-4 py-4 text-slate-600 font-medium text-center">{s.department}</td>

										{/* Styled Designation Badge */}
										<td className="px-4 py-4 min-w-[200px] text-center">
											<span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200">
												{s.designation}
											</span>
										</td>

										{/* Grouped Contact Info */}
										<td className="px-4 py-4">
											<div className="flex flex-col gap-0.5">
												<span className="text-slate-700 font-medium text-sm flex items-center gap-1">
													<Phone className="w-3 h-3 text-slate-400" /> {s.phone_no}
												</span>
												<span className="text-slate-400 text-[13px] italic truncate max-w-[150px]">{s.email}</span>
											</div>
										</td>

										<td className="px-4 py-4 text-slate-600 text-sm min-w-[200px] text-center">{s.college}</td>

										{/* Bank Details with improved contrast */}
										<td className="px-4 py-4">
											<div className="bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
												<p className="font-mono text-[15px] font-bold text-slate-700">{s.bank_acc_no}</p>
												<p className="text-[13px] text-slate-400 uppercase tracking-tighter">{s.ifsc_code}</p>
											</div>
										</td>

										<td className="px-4 py-4 text-slate-600 text-center px-6">
											<span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
												{s.employment_type}
											</span>
										</td>

										{/* Sticky Actions */}
										<td className="px-4 py-4 bg-white group-hover:bg-slate-50/80 transition-colors z-10 px-6">
											<div className="flex items-center gap-1">
												<button onClick={() => openEditModal(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="Edit">
													<Edit3 className="w-4 h-4" />
												</button>
												<button onClick={() => handleDelete(s._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all" title="Delete">
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{/* Improved Empty State */}
						{paginatedStaff.length === 0 && (
							<div className="py-32 flex flex-col items-center justify-center">
								<div className="relative mb-4">
									<Search className="w-12 h-12 text-slate-200" />
									<div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
										<AlertCircle className="w-4 h-4 text-slate-400" />
									</div>
								</div>
								<h3 className="text-slate-800 font-bold">No records found</h3>
								<p className="text-slate-400 text-sm">Try adjusting your filters or search terms.</p>
							</div>
						)}
					</div>

					{/* Footer remains largely the same but with slightly more padding */}
					<div className="bg-slate-50 border-t border-slate-200 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="text-xs font-semibold text-slate-500">
							Showing <span className="text-slate-900">{startItem}</span> to <span className="text-slate-900">{endItem}</span> of <span className="text-slate-900">{staffList.length}</span> results
						</div>

						<div className="flex items-center gap-2">
							<button
								onClick={goToPrevPage}
								disabled={currentPage === 1}
								className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
							>
								<ChevronLeft className="w-4 h-4" /> Previous
							</button>

							<div className="flex items-center gap-1 px-4">
								<span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
									{currentPage}
								</span>
								<span className="text-xs text-slate-400">of {totalPages}</span>
							</div>

							<button
								onClick={goToNextPage}
								disabled={currentPage === totalPages || totalPages === 0}
								className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
							>
								Next <ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			</div>

			{showModal && (
				<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
					<div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-3xl overflow-hidden border-t-[6px] border-blue-600 animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[85vh]">

						{/* 1. FIXED HEADER */}
						<div className="p-6 md:p-8 border-b border-slate-100 bg-white z-10">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
									<span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
										{editingStaff ? <Pencil size={22} /> : <Plus size={26} />}
									</span>
									{editingStaff ? "Edit Staff Member" : "Add New Staff"}
								</h2>
								<button
									onClick={() => setShowModal(false)}
									className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
								>
									<X size={24} />
								</button>
							</div>
						</div>

						{/* 2. SCROLLABLE CONTENT AREA */}
						<div className="flex-1 overflow-y-auto p-6 md:p-8 pt-2 scrollbar-hide">

							<style dangerouslySetInnerHTML={{
								__html: `.scrollbar-hide::-webkit-scrollbar { display: none; }`
							}} />

							<form onSubmit={handleSubmitForm} id="staff-form">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
									{[
										"employment_type", "staff_id", "staff_name", "department",
										"designation", "category", "phone_no", "email",
										"college", "bank_acc_no", "ifsc_code"
									].map((field) => {
										const camelCaseLabel = field
											.replace(/_/g, " ")
											.replace(/\b\w/g, (c) => c.toUpperCase());

										const options = getUniqueValues(field).map((val) => ({
											label: val, value: val,
										}));

										const isSelectField = [
											"department", "designation", "college",
											"category", "employment_type"
										].includes(field);

										return (
											<div key={field} className={`flex flex-col ${field === 'staff_name' ? 'md:col-span-2' : ''}`}>
												<label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 ml-1">
													{field === "ifsc_code" ? "IFSC CODE" : camelCaseLabel}
												</label>
												{isSelectField ? (
													<CreatableSelect
														isClearable
														styles={customSelectStyles}
														options={options}
														value={formData[field] ? { label: formData[field], value: formData[field] } : null}
														onChange={(selected) => setFormData({ ...formData, [field]: selected ? selected.value : "" })}
														onCreateOption={(newValue) => setFormData({ ...formData, [field]: newValue })}
													/>
												) : (
													<input
														type="text"
														value={formData[field] || ""}
														onChange={(e) => setFormData({
															...formData,
															[field]: field === "ifsc_code" ? e.target.value.toUpperCase() : e.target.value,
														})}
														required={field !== "staff_id"}
														className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
													/>
												)}
											</div>
										);
									})}
								</div>
							</form>
						</div>

						<div className="p-6 border-t border-slate-100 bg-white/90 backdrop-blur-sm flex items-center gap-4">
							<button
								type="button"
								onClick={() => setShowModal(false)}
								className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
							>
								Discard Changes
							</button>
							<button
								type="submit"
								form="staff-form"
								className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-base font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
							>
								{editingStaff ? 'UPDATE RECORDS' : 'REGISTER STAFF'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StaffManage;