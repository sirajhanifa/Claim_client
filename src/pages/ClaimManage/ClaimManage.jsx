import React, { useState } from 'react';
import Button from '../../components/Button';
import { Plus, Trash, Pencil } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import usePost from '../../hooks/usePost';
import useDelete from '../../hooks/useDelete';

const ClaimManage = () => {

	const apiUrl = import.meta.env.VITE_API_URL;
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState(null);

	const [form, setForm] = useState({
		name: '',
		description: '',
		amount_settings: {
			scrutiny_ug_rate: '',
			scrutiny_pg_rate: '',
			scrutiny_day_rate: '',
			qps_rate: '',
			cia_rate: ''
		}
	});

	const { data, loading, error, refetch } = useFetch(`${apiUrl}/api/getClaim`);
	const { postData } = usePost();
	const { deleteData } = useDelete();

	const resetForm = () => {
		setForm({
			name: '',
			description: '',
			amount_settings: {
				scrutiny_ug_rate: '',
				scrutiny_pg_rate: '',
				scrutiny_day_rate: '',
				qps_rate: '',
				cia_rate: ''
			}
		});
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleAmountChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			amount_settings: { ...prev.amount_settings, [name]: value }
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const endpoint = editingId
			? `${apiUrl}/api/updateClaim/${editingId}`
			: `${apiUrl}/api/addclaim`;

		const payload = editingId
			? form
			: { name: form.name, description: form.description };

		await postData(endpoint, payload);
		refetch();
		setShowModal(false);
		setEditingId(null);
		resetForm();
	};

	const handleEdit = (claim) => {
		setForm({
			name: claim.claim_type_name,
			description: claim.description,
			amount_settings: claim.amount_settings || {}
		});
		setEditingId(claim._id);
		setShowModal(true);
	};

	const handleDelete = async (id) => {
		await deleteData(`${apiUrl}/api/deleteClaim/${id}`);
		refetch();
		setConfirmDeleteId(null);
	};

	return (
		<div className="bg-slate-50 min-h-screen space-y-6">

			<header className="flex flex-col lg:flex-row justify-between items-center gap-6">
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
						<div className="h-1 w-8 bg-blue-600 rounded-full" />
						System Configuration
					</div>
					<h1 className="text-4xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
						Claim <span className="text-slate-400 font-light">Categories</span>
					</h1>
				</div>

				{/* Right Section: Actions */}
				<div className="flex items-center gap-3">
					<Button
						variant="primary"
						className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
						onClick={() => {
							resetForm();
							setEditingId(null);
							setShowModal(true);
						}}
					>
						<Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
						<span>Add Category</span>
					</Button>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto">

				{loading && (
					<div className="flex items-center gap-2 text-sm font-bold text-blue-600 animate-pulse mb-4 bg-blue-50 w-fit px-4 py-2 rounded-full border border-blue-100">
						<div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
						UPDATING REGISTRY...
					</div>
				)}

				{/* Optimized Grid - 3 Columns for better readability */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{data && data.length > 0 ? (
						data.map((claim, index) => (
							<div
								key={claim._id}
								className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 relative overflow-hidden flex flex-col"
							>
								<div className="p-6 flex-grow">
									<div className="flex justify-between items-center mb-4">
										<span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
											Claim #{index + 1}
										</span>
										<div className="flex gap-2">
											<button
												onClick={() => handleEdit(claim)}
												className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
											>
												<Pencil size={14} />
											</button>
											<button
												onClick={() => setConfirmDeleteId(claim._id)}
												className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
											>
												<Trash size={14} />
											</button>
										</div>
									</div>

									<h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">
										{claim.claim_type_name}
									</h3>

									<p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">
										{claim.description || 'No detailed description available for this claim type.'}
									</p>

									{/* Amount Settings Section */}
									<div className="space-y-2">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Current Rates</p>
										{claim.amount_settings ? (
											Object.entries(claim.amount_settings).map(([key, val]) => (
												<div key={key} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
													<span className="text-xs font-bold uppercase text-slate-500">
														{key.replace(/_/g, ' ')}
													</span>
													<span className="text-base font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
														₹{val.toLocaleString('en-IN')}
													</span>
												</div>
											))
										) : (
											<div className="text-center py-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-600 text-xs font-bold">
												NO PRICING SET
											</div>
										)}
									</div>
								</div>
							</div>
						))
					) : (
						<div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
							<p className="text-slate-400 font-bold text-lg italic tracking-tight">The registry is currently empty.</p>
						</div>
					)}
				</div>
			</div>

			{/* Delete Modal - Clean & Bold */}
			{confirmDeleteId && (
				<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
					<div className="bg-white rounded-[1rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="p-8 text-center">
							<div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Trash size={28} />
							</div>
							<h2 className="text-xl font-black text-slate-900">Remove Type?</h2>
							<p className="text-sm text-slate-500 mt-2 font-medium">This configuration will be deleted permanently from the system.</p>
						</div>
						<div className="p-4 bg-slate-50 flex gap-3">
							<button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition">Go Back</button>
							<button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-3 bg-rose-600 text-white text-sm font-black rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-100 transition">Delete</button>
						</div>
					</div>
				</div>
			)}

			{/* Form Modal - Medium Pro Size */}
			{showModal && (
				<div className="fixed inset-0 bg-blue-900/30 backdrop-blur-md flex items-center justify-center z-[100] p-4">
					<div className="bg-white rounded-[1rem] shadow-2xl w-full max-w-xl overflow-hidden border-t-[5px] border-blue-600 animate-in slide-in-from-bottom-8 duration-300">

						<div className="p-8 max-h-[85vh] overflow-y-auto scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
							<style dangerouslySetInnerHTML={{
								__html: `
								.scrollbar-hide::-webkit-scrollbar { display: none; }
								`}} />

							<h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
								<span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
									{editingId ? <Pencil size={20} /> : <Plus size={24} />}
								</span>
								{editingId ? 'Modify Type' : 'New Type'}
							</h2>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 block">
										Category Name
									</label>
									<input
										type="text"
										name="name"
										value={form.name}
										onChange={handleChange}
										className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-base focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
										required
									/>
								</div>

								<div>
									<label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 block">
										Description
									</label>
									<textarea
										name="description"
										rows={2}
										value={form.description}
										onChange={handleChange}
										className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium focus:border-blue-500 focus:bg-white outline-none transition-all"
									></textarea>
								</div>
								<div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
									<h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-4">
										Price Settings (₹)
									</h3>
									<div className="grid grid-cols-2 gap-4">
										{Object.entries(form.amount_settings).map(([key, value]) => (
											<div key={key}>
												<label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1 ml-1">
													{key.replace(/_/g, ' ')}
												</label>
												<input
													type="number"
													name={key}
													value={value}
													onChange={handleAmountChange}
													className="w-full bg-white border-2 mt-2 border-emerald-200 rounded-xl px-3 py-2 text-sm font-black text-emerald-800 outline-none focus:border-emerald-500 transition-all"
												/>
											</div>
										))}
									</div>
								</div>
								<div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
									<button
										type="button"
										onClick={() => {
											setShowModal(false);
											setEditingId(null);
										}}
										className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
									>
										Discard
									</button>
									<button
										type="submit"
										className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-base font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
									>
										{editingId ? 'UPDATE' : 'CREATE TYPE'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClaimManage;