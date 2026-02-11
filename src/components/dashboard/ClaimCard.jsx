import React from 'react';
import {
	FaMoneyBillWave,
	FaFolderOpen
} from 'react-icons/fa';

const themes = {
	blue: "border-blue-500 text-blue-600 bg-blue-50/50",
	green: "border-emerald-500 text-emerald-600 bg-emerald-50/50",
	red: "border-rose-500 text-rose-600 bg-rose-50/50",
	yellow: "border-amber-500 text-amber-600 bg-amber-50/50",
};

const ClaimCard = ({ title, count = 0, amount = 0, color = 'blue', showAlert = false }) => {

	const themeClass = themes[color] || themes.blue;
	const MainIcon = FaFolderOpen;

	return (
		<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">

			<div className={`absolute top-0 left-0 right-0 h-1.5 ${themeClass.split(' ')[0].replace('border-', 'bg-')}`} />

			<div className="flex justify-between items-start mb-6">
				<h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest">
					{title}
				</h3>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<p className="text-4xl font-black text-slate-900 tracking-tighter">
						{count.toLocaleString('en-IN')}
					</p>
					<p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-tighter">
						Total Submissions
					</p>
				</div>

				<div className={`p-4 rounded-xl ${themeClass.split(' ').slice(1).join(' ')} group-hover:rotate-12 transition-transform duration-300`}>
					<MainIcon className="text-2xl" />
				</div>
			</div>

			<div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
				<span className="text-xs font-bold text-slate-400 uppercase">Valuation</span>
				<div className="flex items-center gap-3">
					<FaMoneyBillWave className={`${themeClass.split(' ')[1]} text-sm`} />
					<span className="text-xl font-black text-slate-800">
						₹ {amount.toLocaleString('en-IN')}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ClaimCard;