import React from 'react';
import { FaUserTie, FaUsers } from 'react-icons/fa';

const StaffOverviewCard = ({ internal = 0, external = 0 }) => {
    return (
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 tracking-tight">Staff Breakdown</h4>
            <div className="space-y-3">
                {/* Internal Staff */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full shadow-sm">
                            <FaUserTie className="text-blue-700 text-lg" />
                        </div>
                        <span className="text-sm text-gray-700">Internal Staff</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{internal}</span>
                </div>
                {/* External Staff */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full shadow-sm">
                            <FaUsers className="text-green-700 text-lg" />
                        </div>
                        <span className="text-sm text-gray-700">External Staff</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{external}</span>
                </div>
            </div>
        </div>
    );
};

export default StaffOverviewCard;
