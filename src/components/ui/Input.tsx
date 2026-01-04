import React from 'react';

const Input = ({ label, className = "", ...props }: any) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <input
            className={`w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 ${className}`}
            {...props}
        />
    </div>
);

export default Input;
