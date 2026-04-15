import React from 'react';

const Header = ({ label }) => {
    return (
        <div className="w-full bg-white border-b border-gray-200 shadow-sm px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-800">{label}</h1>
        </div>
    );
};

export default Header;