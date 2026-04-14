import React from 'react';

function Guidelines() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Under Construction Icons */}
                <div className="relative mb-8">
                    <div className="flex justify-center gap-4 mb-4">
                        <span className="text-6xl animate-bounce" style={{ animationDelay: '0s' }}>🚧</span>
                        <span className="text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>⚠️</span>
                        <span className="text-6xl animate-bounce" style={{ animationDelay: '0.4s' }}>🔨</span>
                    </div>
                    <div className="absolute inset-x-0 -bottom-2 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                </div>

                {/* Main Message */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 tracking-tight">
                    Work Under Progress
                </h1>

                <div className="w-20 h-1 bg-amber-400 mx-auto mb-5 rounded-full"></div>

                <p className="text-gray-500 mb-6">
                    This section is currently being built. Please check back soon.
                </p>

                {/* Additional Construction Details */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    Under construction
                    <span className="text-xs ml-1">🛠️</span>
                </div>
            </div>
        </div>
    );
}

export default Guidelines;