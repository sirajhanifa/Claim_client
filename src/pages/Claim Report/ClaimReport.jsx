import React, { useState, useMemo } from 'react';
import useFetch from '../../hooks/useFetch';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Trash2, Search, Phone, Download, FileText, Filter, ChevronDown, Layers, Calendar } from "lucide-react";
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo1 from '../../assets/75.jpeg';
import logo2 from '../../assets/logo.jpeg'

const ClaimReport = () => {

	const [filter, setFilter] = useState('all');
	const [claimType, setClaimType] = useState('all');
	const [entryDate, setEntryDate] = useState('');
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [ifscFilter, setIfscFilter] = useState("all");
	const apiUrl = import.meta.env.VITE_API_URL;
	const { data: claimData, loading, error, refetch } = useFetch(`${apiUrl}/api/getclaimEntry`);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const claimTypes = [...new Set(claimData?.map((claim) => claim.claim_type_name))];
	const ifscTypes = [...new Set(claimData?.map((claim) => claim.ifsc_code))];

	const handleDownloadExcel = () => {

		if (displayedClaims.length === 0) {
			alert("No data available to download");
			return;
		}

		const excelData = displayedClaims.map((claim, index) => {
			const baseData = {
				"S.No": index + 1,
				"Date": new Date(claim.entry_date).toLocaleDateString("en-GB"),
				"Name": claim.staff_name,
				"College": claim.college,
				"Department": claim.department,
				"Amount Paid": claim.amount,
				"IFSC Code": claim.ifsc_code,
				"Account No": claim.account_no,
			};
			if (filter === "all" && filter === "submitted" && filter === "unsubmitted" && filter === "credited") {
				baseData["Phone No"] = claim.phone_number;
			}
			return baseData;
		});

		const worksheet = XLSX.utils.json_to_sheet(excelData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");
		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx", type: "array"
		});
		const file = new Blob([excelBuffer], {
			type: "application/octet-stream"
		});
		saveAs(file, `Claim_Report_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
	};

	// Core filtered claims for table
	const filteredClaims = claimData?.filter((claim) => {

		// 🔹 Status filter
		switch (filter) {
			case "submitted":
				if (!claim.submission_date) return false;
				break;
			case "unsubmitted":
				if (claim.submission_date) return false;
				break;
			case "credited":
				if (!claim.credited_date) return false;
				break;
			default:
				break;
		}

		// 🔹 Claim Type
		if (claimType !== "all" && claim.claim_type_name !== claimType) return false;

		// 🔹 INTERNAL / EXTERNAL
		if (categoryFilter !== "all") {

			// Normal INTERNAL / EXTERNAL
			if (categoryFilter !== "TDS" && claim.internal_external !== categoryFilter) {
				return false;
			}

			// 🔥 TDS → ONLY AIDED STAFF
			if (categoryFilter === "TDS") {
				if (claim.category !== "AIDED") {
					return false;
				}
			}
		}

		/* IFSC Filter Logic */
		let ifscMatch = true;

		if (ifscFilter === "JMC_IOB") {
			ifscMatch = claim.ifsc_code === "IOBA0000467";
		}

		if (ifscFilter === "IOB_OTHERS") {
			ifscMatch =
				claim.ifsc_code?.startsWith("IOBA") &&
				claim.ifsc_code !== "IOBA0000467";
		}

		if (ifscFilter === "OTHER_BANKS") {
			ifscMatch = !claim.ifsc_code?.startsWith("IOBA");
		}

		if (!ifscMatch) return false;
		// 🔹 Date filter
		if (
			entryDate &&
			new Date(claim.entry_date).toLocaleDateString("en-CA") !== entryDate
		)
			return false;

		// 🔹 Search (Staff Name OR Phone)
		if (search) {
			const searchText = search.toLowerCase();
			const nameMatch = claim.staff_name?.toLowerCase().includes(searchText);
			const phoneMatch = claim.phone_number?.toString().includes(searchText);

			if (!nameMatch && !phoneMatch) return false;
		}

		return true;
	}) || [];

	// Merge duplicates when viewing unsubmitted claims.
	// Duplicates are detected by (claim_type_name, phone_number, staff_name).
	const mergeDuplicates = (claims = []) => {
		const map = new Map();
		for (const c of claims) {
			const key = `${(c.claim_type_name || '').trim()}::${(c.phone_number || '').trim()}::${(c.staff_name || '').trim()}`;
			const entryDate = c.entry_date ? new Date(c.entry_date) : null;
			const submissionDate = c.submission_date ? new Date(c.submission_date) : null;
			const creditedDate = c.credited_date ? new Date(c.credited_date) : null;

			if (!map.has(key)) {
				// clone object so we don't mutate original
				map.set(key, { ...c, _mergedCount: 1 });
			} else {
				const existing = map.get(key);
				existing.amount = (Number(existing.amount) || 0) + (Number(c.amount) || 0);
				existing._mergedCount = (existing._mergedCount || 1) + 1;
				if (entryDate && (!existing.entry_date || new Date(existing.entry_date) < entryDate)) existing.entry_date = entryDate.toISOString();
				if (submissionDate && (!existing.submission_date || new Date(existing.submission_date) < submissionDate)) existing.submission_date = submissionDate.toISOString();
				if (creditedDate && (!existing.credited_date || new Date(existing.credited_date) < creditedDate)) existing.credited_date = creditedDate.toISOString();
				// prefer most up-to-date status
				if (c.status && c.status !== existing.status) existing.status = c.status;
			}
		}

		return Array.from(map.values());
	};

	const displayedClaims = useMemo(() => {
		if (filter === 'unsubmitted') return mergeDuplicates(filteredClaims);
		return filteredClaims;
	}, [filter, filteredClaims]);


	// Handler for download filtered claims when filter === 'all'
	const handleDownloadClaimTypePDF = () => {
		if (displayedClaims.length === 0) {
			alert('No claims found to download.');
			return;
		}
		const prId = `PR-${new Date().getFullYear()}-TEMP`;
		const submissionDate = new Date().toLocaleDateString('en-GB'); // ✅ always include system date
		createPDF(prId, submissionDate, displayedClaims);
	};


	// PDF creator
	const createPDF = (prId, submittedDate, claims) => {
		const doc = new jsPDF("p", "mm", "a4");
		const pageWidth = doc.internal.pageSize.getWidth();

		// Add Logos
		doc.addImage(logo2, "JPEG", 15, 10, 25, 25);
		doc.addImage(logo1, "JPEG", pageWidth - 40, 10, 25, 25);

		// College Name
		doc.setFontSize(18);
		doc.setFont("helvetica", "bold");
		doc.text("Jamal Mohamed College (Autonomous)", pageWidth / 2, 20, { align: "center" });

		doc.setFontSize(9);
		doc.text("Accredited with A++ Grade by NAAC (4th Cycle) with CGPA 3.69 out of 4.0.", pageWidth / 2, 27, { align: "center" });

		doc.setFontSize(9);
		doc.text("Tiruchirappalli – 620 020", pageWidth / 2, 33, { align: "center" });

		// PR & Submission
		doc.setFontSize(12);
		doc.setFont("helvetica", "normal");
		doc.text(`PR ID: ${prId}`, 15, 50);
		doc.text(`Date: ${submittedDate}`, pageWidth - 15, 50, { align: "right" });

		// Table Columns
		const tableColumn = [
			"S.No",
			"Category",
			"Entry Date",
			"Name",
			"Department",
			"Claim Type",
			"Amount",
		];

		const tableRows = claims?.map((claim, index) => [
			index + 1,
			claim.internal_external,
			new Date(claim.entry_date).toLocaleDateString('en-GB'),
			claim.staff_name,
			claim.department,
			claim.claim_type_name,
			claim.amount,
			// claim.submission_date
			//   ? new Date(claim.submission_date).toLocaleDateString('en-GB')
			//   : submittedDate
		]);

		// AutoTable
		autoTable(doc, {
			startY: 60,
			head: [tableColumn],
			body: tableRows,
			styles: { fontSize: 10, halign: "center" },
			headStyles: { fillColor: [0, 51, 102], textColor: "#fff", fontStyle: "bold" },
			columnStyles: {
				0: { cellWidth: 12 },
				1: { cellWidth: 22 }, // Category
				2: { cellWidth: 30 },
				3: { cellWidth: 35 },
				4: { cellWidth: 25 },
				5: { cellWidth: 28 },
				6: { cellWidth: 25 },
			}
		});

		// **Signature at bottom-left**
		const pageHeight = doc.internal.pageSize.getHeight();
		doc.setFontSize(12);
		doc.setFont("helvetica", "bold");
		doc.text("Controller of Examinations", 15, pageHeight - 20);

		doc.setFontSize(12);
		doc.setFont("helvetica", "bold");
		doc.text("Principal", 180, pageHeight - 20);

		doc.save(`ClaimEntryReport_${prId}.pdf`);
	};



	// Submit button handler (update only, no PDF)
	const handleSubmitClaims = async () => {
		if (
			!confirm(`Submit ${categoryFilter} ${claimType} claims?`)
		) return;
		setIsSubmitting(true);
		try {
			if (displayedClaims.length === 0) {
				alert('No unsubmitted claims to submit.');
				setIsSubmitting(false);
				return;
			}

			const submitRes = await fetch(`${apiUrl}/api/submitClaims`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					claimType,
					category: categoryFilter
				})
			});

			if (submitRes.ok) {
				const result = await submitRes.json();
				alert(result.message || 'Claims submitted successfully');
				if (refetch) await refetch(); // refresh table
			} else {
				const result = await submitRes.json();
				alert(result.message || 'Failed to submit claims.');
			}
		} catch (err) {
			alert('Failed to submit claims.');
		}
		setIsSubmitting(false);
	};

	const handleSubmitAndDownloadPDF = async () => {
		if (displayedClaims.length === 0) {
			alert('No unsubmitted claims to submit.');
			return;
		}
		setIsSubmitting(true);
		try {
			const submitRes = await fetch(`${apiUrl}/api/submitClaims`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ claimType })
			});

			const result = await submitRes.json();

			if (submitRes.ok) {
				const prId = result.prId;

				const getDateOnlyString = (dateStr) => {
					return new Date(dateStr).toLocaleDateString('en-GB');
				};

				const actualSubmittedDate = getDateOnlyString(result.submission_date); // ✅ FIXED

				if (refetch) await refetch();
				const updatedClaims = claimData.filter(c =>
					(claimType === 'all' || c.claim_type_name === claimType)
				);
				const updatedClaimsMerged = filter === 'unsubmitted' ? mergeDuplicates(updatedClaims) : updatedClaims;
				createPDF(prId, actualSubmittedDate, updatedClaimsMerged);
			} else {
				alert(result.message);
			}

		} catch (err) {
			alert('Failed to submit claims.');
		}
		setIsSubmitting(false);
	};

	// Downloads PDF only for currently shown submitted claims (filtered by claimType)
	const handleDownloadExistingPDF = () => {
		if (!existingPrId) {
			alert('No submitted claims available to download PDF.');
			return;
		}
		const submittedFilteredClaims = (displayedClaims || []).filter((claim) =>
			claim.payment_report_id === existingPrId &&
			(claimType === 'all' || claim.claim_type_name === claimType)
		);
		createPDF(existingPrId, existingSubmissionDate, submittedFilteredClaims);
	};


	const handleDelete = async (id) => {
		if (!confirm("Are you sure you want to delete this claim?")) return;

		try {
			const res = await axios.delete(`${apiUrl}/api/delete/${id}`);

			alert("Claim deleted successfully");

			// Remove deleted claim from UI
			// If you are using useFetch → refetch instead of setClaims
			if (refetch) {
				refetch();
			}

		} catch (error) {
			console.log(error);
			alert("Error deleting claim");
		}
	};


	return (
		<div>

			{/* Header Section */}
			<header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
						<div className="h-1 w-8 bg-blue-600 rounded-full" />
						Finance & Claims
					</div>
					<h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
						Claim <span className="text-slate-400 font-light">History</span>
					</h1>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<button
						onClick={handleDownloadExcel}
						className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
					>
						<Download className="w-4 h-4" />
						Export Excel
					</button>

					{filter === 'all' && (
						<button
							onClick={handleDownloadClaimTypePDF}
							disabled={isSubmitting}
							className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
						>
							<FileText className="w-4 h-4" />
							Download PDF
						</button>
					)}
				</div>
			</header>

			{/* Primary Filter Bar */}
			<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

					{/* Claim Type Filter */}
					<div className="space-y-1.5">
						<label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
							<Filter className="w-3 h-3" />
							Claim Type
						</label>
						<div className="relative group">
							<select
								value={claimType}
								onChange={(e) => setClaimType(e.target.value)}
								className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all cursor-pointer
                        		${claimType !== 'all' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
							>
								<option value="all">All Claim Types</option>
								{claimTypes.map((type) => (
									<option key={type} value={type}>{type}</option>
								))}
							</select>
							<ChevronDown className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
						</div>
					</div>

					{/* Category Filter */}
					<div className="space-y-1.5">
						<label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
							<Layers className="w-3 h-3" />
							Category
						</label>
						<div className="relative group">
							<select
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
								className={`w-full mt-2 appearance-none bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-all cursor-pointer
                        ${categoryFilter !== 'all' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
							>
								<option value="all">All Categories</option>
								<option value="INTERNAL">INTERNAL</option>
								<option value="EXTERNAL">EXTERNAL</option>
								<option value="TDS">TDS</option>
							</select>
							<ChevronDown className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
						</div>
					</div>

					{/* Date Filter */}
					<div className="space-y-1.5">
						<label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
							<Calendar className="w-3 h-3" />
							Entry Date
						</label>
						<input
							type="date"
							value={entryDate}
							onChange={(e) => setEntryDate(e.target.value)}
							className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
						/>
					</div>
				</div>

				{/* Secondary Filters: Radio Group & Bank Filter */}
				<div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">

					{/* Custom Styled Radio Group */}
					<div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit">
						{['all', 'submitted', 'unsubmitted', 'credited'].map((type) => (
							<label key={type} className="relative flex-1 md:flex-none cursor-pointer">
								<input
									type="radio"
									name="filter"
									value={type}
									checked={filter === type}
									onChange={(e) => setFilter(e.target.value)}
									className="sr-only peer"
								/>
								<div className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all text-center">
									{type}
								</div>
							</label>
						))}
					</div>

					{/* Bank Details Filter */}
					<div className="flex items-center gap-4 w-full md:w-auto">
						<div className="relative group min-w-[220px] w-full">
							<select
								value={ifscFilter}
								onChange={(e) => setIfscFilter(e.target.value)}
								className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none hover:border-slate-300 transition-all cursor-pointer"
							>
								<option value="all">All Bank Types</option>
								<option value="JMC_IOB">IOB JMC Branch</option>
								<option value="IOB_OTHERS">IOB Other Branch</option>
								<option value="OTHER_BANKS">Other Banks</option>
							</select>
							<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
						</div>
					</div>
				</div>
			</div>

			{/* Search Filter */}
			<div className="flex justify-end gap-4 w-full xl:w-auto">
				<div className="xl:w-84">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
					<input
						type="text"
						placeholder="Search records....."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-slate-400"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="mt-8 space-y-4">
				{/* Table Header Section */}
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
						Claims Records
					</h2>
					<div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
						No. of Claims : {displayedClaims.length}
					</div>
				</div>

				{/* Table container */}
				<div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
					<div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
						<table className="w-full text-sm text-left border-separate border-spacing-0">
							<thead className="sticky top-0 z-30">
								<tr className='text-center'>
									{[
										"S.No", "Staff Details", "Claim Type", "Contact", "Bank/IFSC",
										"Amount", "Dates", "Status", "Payment ID"
									].map((h, i) => (
										<th
											key={i}
											className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider whitespace-nowrap"
										>
											{h}
										</th>
									))}
									{filter === "all" && (
										<th className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider">
											Actions
										</th>
									)}
								</tr>
							</thead>

							<tbody className="divide-y divide-slate-100">
								{displayedClaims.map((claim, index) => (
									<tr key={claim._id} className="group hover:bg-blue-50/30 transition-all duration-200">

										{/* S.No */}
										<td className="px-6 py-4 text-slate-400 font-medium text-center">{index + 1}</td>

										{/* Staff Details with Avatar */}
										<td className="px-6 py-4 min-w-[340px]">
											<div className="flex items-center gap-3">
												<div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
													{claim.staff_name?.charAt(0)}
												</div>
												<div>
													<div className="font-bold text-slate-900 leading-none mb-1">{claim.staff_name}</div>
													<div className="text-[11px] text-blue-600 font-bold uppercase tracking-tight">
														{categoryFilter === "TDS" ? "AIDED" : claim.internal_external}
													</div>
												</div>
											</div>
										</td>

										{/* Claim Type */}
										<td className="px-6 py-4 min-w-[250px] text-center">
											<span className="text-slate-700 font-semibold">{claim.claim_type_name}</span>
										</td>

										{/* Phone */}
										<td className="px-6 py-4">
											<div className="flex items-center gap-1.5 text-slate-600">
												<Phone size={14} className="text-slate-400" />
												<span className="font-medium">{claim.phone_number}</span>
											</div>
										</td>

										{/* Bank Details */}
										<td className="px-6 py-4">
											<div className="bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
												<p className="text-[12px] text-slate-400 uppercase tracking-tighter font-bold">{claim.ifsc_code}</p>
											</div>
										</td>

										{/* Amount */}
										<td className="px-6 py-4 text-center">
											<span className="text-md font-bold text-green-700">₹{claim.amount}</span>
										</td>

										{/* Dates Grouped */}
										<td className="px-6 py-4 text-center">
											<div className="flex flex-col gap-1 text-[11px]">
												<div className="flex justify-between gap-4">
													<span className="text-slate-400 uppercase">Entry:</span>
													<span className="text-slate-700 font-bold">{new Date(claim.entry_date).toLocaleDateString('en-GB')}</span>
												</div>
												<div className="flex justify-between gap-4">
													<span className="text-slate-400 uppercase">Sub:</span>
													<span className="text-slate-700 font-bold">{claim.submission_date ? new Date(claim.submission_date).toLocaleDateString('en-GB') : '-'}</span>
												</div>
											</div>
										</td>

										{/* Status Badge */}
										<td className="px-6 py-4 min-w-[240px] text-center">
											<span
												className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border transition-colors
                    								${claim.status === 'Credited'
														? 'bg-green-50 text-green-700 border-green-200'
														: 'bg-yellow-50 text-yellow-700 border-yellow-200'
													}`}
											>
												<div className={`w-1.5 h-1.5 rounded-full ${claim.status === 'Credited' ? 'bg-green-500' : 'bg-yellow-500'}`} />
												{claim.status}
											</span>
										</td>

										{/* Payment ID */}
										<td className="px-6 py-4 font-mono text-sm text-slate-500 font-bold whitespace-nowrap">
											{claim.payment_report_id || '-'}
										</td>

										{/* Actions */}
										{filter === "all" && (
											<td className="px-6 py-4 text-center">
												{(claim._mergedCount && claim._mergedCount > 1) ? (
													<span className="px-2 py-1 rounded bg-slate-100 text-slate-400 text-[10px] font-bold">MERGED ({claim._mergedCount})</span>
												) : (
													<button
														onClick={() => handleDelete(claim._id)}
														className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
													>
														<Trash2 size={18} />
													</button>
												)}
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>

						{/* Empty State */}
						{displayedClaims.length === 0 && (
							<div className="py-24 flex flex-col items-center justify-center">
								<div className="bg-slate-50 p-4 rounded-full mb-4">
									<Search className="w-10 h-10 text-slate-200" />
								</div>
								<h3 className="text-slate-800 font-bold">No claims found</h3>
								<p className="text-slate-400 text-sm">There are no records matching your current filters.</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Buttons */}
			{filter === 'unsubmitted' && displayedClaims.length > 0 && (
				<div className="mt-5 text-center flex justify-end gap-4">
					{/* Download PDF */}
					<button
						className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
						onClick={handleDownloadClaimTypePDF}
						disabled={isSubmitting}
					>
						Download PDF
					</button>

					{/* Submit claims (update only) */}
					<button
						className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
						onClick={handleSubmitClaims}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Processing..." : "Submit Claims"}
					</button>
				</div>
			)}
		</div>
	);
};

export default ClaimReport