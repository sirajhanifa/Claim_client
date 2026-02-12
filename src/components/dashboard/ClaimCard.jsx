import React from 'react';
import { FaMoneyBillWave, FaFolderOpen } from 'react-icons/fa';

const themes = {
	blue: { bar: "bg-blue-500", icon: "text-blue-600 bg-blue-50", text: "text-blue-600" },
	green: { bar: "bg-emerald-500", icon: "text-emerald-600 bg-emerald-50", text: "text-emerald-600" },
	red: { bar: "bg-rose-500", icon: "text-rose-600 bg-rose-50", text: "text-rose-600" },
	yellow: { bar: "bg-amber-500", icon: "text-amber-600 bg-amber-50", text: "text-amber-600" },
};

const ClaimCard = ({ title, count = 0, amount = 0, color = 'blue' }) => {

	const theme = themes[color] || themes.blue;

	return (
		<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
			
			{/* Top Decorative Bar - Fixed Logic */}
			<div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.bar}`} />

			<div className="flex justify-between items-start mb-6">
				<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
					{title}
				</h3>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<p className="text-4xl font-black text-slate-900 tracking-tighter">
						{count.toLocaleString('en-IN')}
					</p>
					<p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-tighter">
						Total Records
					</p>
				</div>

				<div className={`p-4 rounded-xl ${theme.icon} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
					<FaFolderOpen className="text-2xl" />
				</div>
			</div>

			<div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
				<span className="text-xs font-bold text-slate-400 uppercase">Valuation</span>
				<div className="flex items-center gap-2">
					<FaMoneyBillWave className={`${theme.text} text-sm`} />
					<span className="text-xl font-black text-slate-800">
						₹{amount.toLocaleString('en-IN')}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ClaimCard;